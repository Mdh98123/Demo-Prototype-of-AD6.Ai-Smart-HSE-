
import React, { useState, useEffect } from 'react';
import { getPredictiveRiskForecast } from '../services/geminiService';
import { PredictiveRiskForecast } from '../types';
import { 
  AlertTriangle, TrendingUp, Zap, BarChart3, Wind, 
  Thermometer, Users, Clock, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const PredictiveRiskDashboard: React.FC = () => {
  const [forecast, setForecast] = useState<PredictiveRiskForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const load = async () => {
        try {
            const data = await getPredictiveRiskForecast('Asset-X', 'Oil & Gas Operations');
            setForecast(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Predictive Models...</div>;
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 border-l-4 border-indigo-600 pl-4">XGBoost Incident Forecasting</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
              <Zap size={18} className="text-yellow-400 animate-pulse"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Model Confidence: 89%</span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Card */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-50"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Asset Risk Score</h3>
              <div className={`text-8xl font-black tracking-tighter relative z-10 ${getRiskColor(forecast.riskScore)}`}>
                  {forecast.riskScore}
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 relative z-10">High Risk Probability</p>
          </div>

          {/* Contributing Factors (SHAP simulation) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Risk Drivers (SHAP Values)</h3>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Predictions */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Forecasted Incidents</h3>
              <div className="space-y-4">
                  {forecast.predictedIncidents && forecast.predictedIncidents.length > 0 ? (
                      forecast.predictedIncidents.map((inc, i) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 uppercase text-sm">{inc.type}</h4>
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black">{(inc.probability * 100).toFixed(0)}% Prob.</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {inc.contributingFactors?.map((f, j) => (
                                  <span key={j} className="text-[9px] font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{f}</span>
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
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
              <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <ShieldCheck size={20}/> AI Recommendations
              </h3>
              <div className="space-y-4">
                  {forecast.recommendedActions && forecast.recommendedActions.length > 0 ? (
                      forecast.recommendedActions.map((action, i) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
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
    </div>
  );
};

export default PredictiveRiskDashboard;
    