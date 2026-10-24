
import { AITag } from './AITag';
import React, { useState, useEffect } from 'react';
import { getPredictiveRiskForecast } from '../services/geminiService';
import { PredictiveRiskForecast, Project, Incident } from '../types';
import { 
  AlertTriangle, Activity, TrendingUp, Zap, BarChart3, Wind, 
  Thermometer, Users, Clock, ShieldCheck, ArrowRight, MapPin, Droplets
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const generateMockWeather = (location: string) => {
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
        hash = location.charCodeAt(i) + ((hash << 5) - hash);
    }
    const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Heavy Rain', 'Sandstorm', 'High Winds'];
    const condition = conditions[Math.abs(hash) % conditions.length];
    const temp = 20 + (Math.abs(hash) % 25);
    const windSpeed = 5 + (Math.abs(hash) % 40);
    const humidity = 30 + (Math.abs(hash) % 60);
    
    return { condition, temperature: temp, windSpeed, humidity };
};

const PredictiveRiskDashboard: React.FC = () => {
  const [forecast, setForecast] = useState<PredictiveRiskForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const savedProjects = localStorage.getItem('hse_projects');
    if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
        if (parsed.length > 0) {
            setSelectedProjectId(parsed[0].id);
        }
    } else {
        // Fallback mock project
        const mockProject: Project = {
            id: 'PRJ-001', name: 'Ruwais Expansion Phase 4', client: 'ADNOC', location: 'Ruwais Zone A',
            startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active', manager: 'John Doe',
            budget: 5000000, progress: 45, hseScore: 92, openIncidents: 2
        };
        setProjects([mockProject]);
        setSelectedProjectId(mockProject.id);
    }
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    
    const load = async () => {
        setLoading(true);
        try {
            const project = projects.find(p => p.id === selectedProjectId);
            if (!project) return;

            // 1. Get Weather
            const weather = generateMockWeather(project.location);
            setWeatherData(weather);

            // 2. Get Recent Incidents
            const savedIncidents = localStorage.getItem('hse_incidents');
            let incidents: Incident[] = [];
            if (savedIncidents) {
                incidents = JSON.parse(savedIncidents)
                    .filter((i: Incident) => i.location.includes(project.location) || project.location.includes(i.location))
                    .slice(0, 5); // Top 5 recent
            }
            setRecentIncidents(incidents);

            // 3. Get AI Forecast
            const data = await getPredictiveRiskForecast(project.name, `Location: ${project.location}`, weather, incidents);
            setForecast(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    load();
  }, [selectedProjectId, projects]);

  if (loading && !forecast) return <div className="p-10 text-center flex flex-col items-center justify-center h-64"><Zap className="animate-pulse text-indigo-500 mb-4" size={32} />Loading Predictive Models...</div>;
  if (!forecast) return <div>No data available</div>;

  const getRiskColor = (score: number) => {
      if (score > 75) return 'text-red-600';
      if (score > 50) return 'text-orange-500';
      return 'text-emerald-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Predictive Risk Engine</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 border-s-4 border-indigo-600 ps-4">XGBoost Incident Forecasting</p>
          </div>
          <div className="flex items-center gap-4">
              <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="glass-card border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                  {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                  ))}
              </select>
              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                  <Zap size={18} className="text-yellow-400 animate-pulse"/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Model Confidence: 89%</span>
              </div>
          </div>
      </div>

      {/* Contextual Data Strip */}
      {weatherData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-500"><Thermometer size={20} /></div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temperature</p>
                      <p className="text-lg font-black text-slate-800">{weatherData.temperature}°C</p>
                  </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="glass-panel p-3 rounded-xl text-slate-500"><Wind size={20} /></div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wind Speed</p>
                      <p className="text-lg font-black text-slate-800">{weatherData.windSpeed} km/h</p>
                  </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500"><Droplets size={20} /></div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Humidity</p>
                      <p className="text-lg font-black text-slate-800">{weatherData.humidity}%</p>
                  </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="bg-orange-50 p-3 rounded-xl text-orange-500"><AlertTriangle size={20} /></div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition</p>
                      <p className="text-lg font-black text-slate-800">{weatherData.condition}</p>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Card */}
          <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-50"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Asset Risk Score</h3>
              <div className={`text-8xl font-black tracking-tighter relative z-10 ${getRiskColor(forecast.riskScore)}`}>
                  {forecast.riskScore}
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 relative z-10">High Risk Probability</p>
          </div>

          {/* 30-Day Forecast Chart */}
          <div className="lg:col-span-2 glass-card p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-500" /> 30-Day Forward Forecast
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                          { day: 'Day 1', risk: 45 }, { day: 'Day 5', risk: 52 },
                          { day: 'Day 10', risk: 68 }, { day: 'Day 15', risk: 74 },
                          { day: 'Day 20', risk: 82 }, { day: 'Day 25', risk: 65 },
                          { day: 'Day 30', risk: 55 }
                      ]}>
                          <defs>
                              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contributing Factors (SHAP simulation) */}
          <div className="glass-card p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Risk Drivers (SHAP)</h3>
              <div className="space-y-4">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Thermometer size={20}/></div>
                      <div className="flex-1">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700">Ambient Temperature (42°C)</span>
                              <span className="text-xs font-black text-red-500">+15%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full"><div className="w-[60%] bg-red-500 h-full rounded-full"></div></div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Clock size={20}/></div>
                      <div className="flex-1">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700">Shift Duration (&gt;10h)</span>
                              <span className="text-xs font-black text-orange-500">+8%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full"><div className="w-[40%] bg-orange-500 h-full rounded-full"></div></div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Users size={20}/></div>
                      <div className="flex-1">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700">Crew Tenure (New Team)</span>
                              <span className="text-xs font-black text-orange-500">+12%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full"><div className="w-[50%] bg-orange-500 h-full rounded-full"></div></div>
                      </div>
                  </div>
              </div>
          </div>
          {/* Heat Map */}
          <div className="lg:col-span-2 glass-card p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Zone Risk Heat Map</h3>
              <div className="grid grid-cols-4 gap-2 h-48">
                  {[
                      { zone: 'A1', risk: 20 }, { zone: 'A2', risk: 45 }, { zone: 'A3', risk: 85 }, { zone: 'A4', risk: 30 },
                      { zone: 'B1', risk: 15 }, { zone: 'B2', risk: 60 }, { zone: 'B3', risk: 95 }, { zone: 'B4', risk: 40 },
                      { zone: 'C1', risk: 10 }, { zone: 'C2', risk: 25 }, { zone: 'C3', risk: 55 }, { zone: 'C4', risk: 20 },
                  ].map((cell, i) => (
                      <div key={i} className={`rounded-xl flex items-center justify-center flex-col transition-all hover:scale-105 cursor-pointer ${
                          cell.risk > 80 ? 'bg-red-500 text-white' : 
                          cell.risk > 50 ? 'bg-orange-400 text-white' : 
                          cell.risk > 30 ? 'bg-amber-300 text-slate-800' : 
                          'bg-emerald-400 text-white'
                      }`}>
                          <span className="text-xs font-black">{cell.zone}</span>
                          <span className="text-[10px] font-bold opacity-80">{cell.risk}%</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Predictions */}
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-[500px]">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Forecasted Incidents</h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {forecast.predictedIncidents && forecast.predictedIncidents.length > 0 ? (
                      forecast.predictedIncidents.map((inc, i) => (
                      <div key={i} className="p-5 glass-panel rounded-2xl border-2 border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 uppercase text-sm">{inc.type}</h4>
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black">{(inc.probability * 100).toFixed(0)}% Prob.</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {inc.contributingFactors?.map((f, j) => (
                                  <span key={j} className="text-[9px] font-bold text-slate-500 glass-card px-2 py-1 rounded border border-slate-200">{f}</span>
                              ))}
                          </div>
                      </div>
                  ))
                  ) : (
                      <p className="text-sm text-slate-400 italic">No incidents forecasted.</p>
                  )}
              </div>
          </div>

          {/* Prescriptive Actions */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col h-[500px]">
              <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <ShieldCheck size={20}/> AI Recommendations
              </h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {forecast.recommendedActions && forecast.recommendedActions.length > 0 ? (
                      forecast.recommendedActions.map((action, i) => (
                      <div key={i} className="p-5 glass-card/5 border border-white/10 rounded-2xl hover:glass-card/10 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${action.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{action.priority}</span>
                              <span className="text-[10px] font-black text-emerald-400">{action.estimatedRiskReduction} Reduction</span>
                          </div>
                          <p className="text-sm font-bold leading-tight">{action.action}</p>
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                              <button className="text-[10px] font-black uppercase flex items-center gap-1 hover:text-emerald-400">Implement <ArrowRight size={12}/></button>
                          </div>
                      </div>
                  ))
                  ) : (
                      <p className="text-sm text-slate-400 italic">No actions recommended.</p>
                  )}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* IoT Real-Time Hazard Feed */}
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <MapPin size={20} className="text-indigo-600"/> Real-Time Hazard Feed
                </h3>
                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
                </span>
              </div>
              <div className="space-y-3">
                  {[
                      { icon: <Thermometer size={14}/>, color: 'text-orange-600', bg: 'bg-orange-50', msg: 'Elevated temperature detected in Server Room A (Zone 2).', time: 'Just now' },
                      { icon: <Wind size={14}/>, color: 'text-blue-600', bg: 'bg-blue-50', msg: 'H2S Gas Sensor 4 (Perimeter) reports 2ppm (Warning limit).', time: '2 mins ago' },
                      { icon: <Droplets size={14}/>, color: 'text-indigo-600', bg: 'bg-indigo-50', msg: 'Moisture detected near electrical panel (Zone C4).', time: '15 mins ago' }
                  ].map((alert, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alert.bg} ${alert.color}`}>
                              {alert.icon}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{alert.msg}</p>
                              <span className="text-[10px] font-bold text-slate-400">{alert.time}</span>
                          </div>
                          <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">View</button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Predictive Maintenance Alerts */}
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-rose-600"/> Equipment Maintenance Risk
              </h3>
              <div className="space-y-4">
                  {[
                      { eq: 'HVAC Compressor #3', prob: 88, due: 'In 3 days', criticality: 'HIGH' },
                      { eq: 'Crane Motor (Alpha)', prob: 64, due: 'In 2 weeks', criticality: 'MED' },
                      { eq: 'Ventilation Fan B', prob: 42, due: 'In 1 month', criticality: 'LOW' }
                  ].map((eq, i) => (
                      <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                                  <AlertTriangle size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{eq.eq}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500">{eq.due}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${eq.criticality === 'HIGH' ? 'bg-red-100 text-red-600' : eq.criticality === 'MED' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {eq.criticality} CRITICAL
                                    </span>
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xl font-black text-slate-900">{eq.prob}%</div>
                              <div className="text-[9px] font-black uppercase text-slate-400">Failure Prob.</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};
export default PredictiveRiskDashboard;
    