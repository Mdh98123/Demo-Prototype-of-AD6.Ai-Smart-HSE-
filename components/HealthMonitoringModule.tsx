
import React, { useState, useEffect } from 'react';
import { HealthMetricRecord, OccupationalHealthIncident } from '../types';
import { analyzeHealthTrends } from '../services/geminiService';
import { 
  HeartPulse, Activity, Thermometer, Droplets, Stethoscope, 
  AlertTriangle, BrainCircuit, Loader2, Sparkles, Plus, 
  Search, ShieldCheck, History, Clock, GraduationCap, ArrowUpRight, MapPin,
  ChevronRight, BookOpen, UserCheck, ShieldAlert, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../contexts/UserContext';

interface HealthAIResult {
  trendSummary: string;
  riskLevel: string;
  suggestedInterventions: string[];
  trainingRecommendations: {
    title: string;
    rationale: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

const HealthMonitoringModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'Metrics' | 'Incidents' | 'AI Insights' | 'Wellness'>('Metrics');
  
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<HealthAIResult | null>(null);

  // Mock Data
  const [metrics] = useState<HealthMetricRecord[]>([
    { id: '1', employeeId: 'u6', employeeName: 'Rahul Gupta', timestamp: '2024-05-20 09:00', bloodPressure: '120/80', heartRate: 72, bodyTemp: 37.1, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '2', employeeId: 'u5', employeeName: 'Fatima Al-Kaabi', timestamp: '2024-05-20 09:15', bloodPressure: '135/85', heartRate: 88, bodyTemp: 37.8, hydrationLevel: 'Low', fitnessForDuty: 'Restricted' },
    { id: '3', employeeId: 'u7', employeeName: 'Marcus Chen', timestamp: '2024-05-20 08:30', bloodPressure: '118/76', heartRate: 68, bodyTemp: 36.9, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '4', employeeId: 'u11', employeeName: 'John Doe', timestamp: '2024-05-20 10:00', bloodPressure: '140/90', heartRate: 92, bodyTemp: 37.2, hydrationLevel: 'Critical', fitnessForDuty: 'Unfit' },
    { id: '5', employeeId: 'u4', employeeName: 'Sarah Jones', timestamp: '2024-05-20 08:00', bloodPressure: '122/81', heartRate: 70, bodyTemp: 37.0, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '6', employeeId: 'u10', employeeName: 'Khalid Al-Dhaheri', timestamp: '2024-05-20 11:00', bloodPressure: '125/82', heartRate: 75, bodyTemp: 37.3, hydrationLevel: 'Low', fitnessForDuty: 'Fit' },
    { id: '7', employeeId: 'u6', employeeName: 'Rahul Gupta', timestamp: '2024-05-19 09:00', bloodPressure: '119/79', heartRate: 71, bodyTemp: 37.0, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '8', employeeId: 'u5', employeeName: 'Fatima Al-Kaabi', timestamp: '2024-05-19 09:15', bloodPressure: '130/84', heartRate: 85, bodyTemp: 37.6, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '9', employeeId: 'u3', employeeName: 'Ahmed Al-Mansoori', timestamp: '2024-05-20 07:30', bloodPressure: '128/84', heartRate: 78, bodyTemp: 37.1, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' },
    { id: '10', employeeId: 'u12', employeeName: 'Alice Smith', timestamp: '2024-05-20 08:45', bloodPressure: '115/75', heartRate: 65, bodyTemp: 36.8, hydrationLevel: 'Optimal', fitnessForDuty: 'Fit' }
  ]);

  const [incidents] = useState<OccupationalHealthIncident[]>([
    { id: 'H1', type: 'Heat Stress', description: 'Worker reported dizziness after 2 hours in direct sun.', severity: 'Moderate', timestamp: '2024-05-18', location: 'Zone B Excavation', status: 'Resolved' },
    { id: 'H2', type: 'Respiratory', description: 'Coughing reports in Sector 4 storage unit.', severity: 'Minor', timestamp: '2024-05-19', location: 'Chemical Zone A', status: 'Under Observation' },
    { id: 'H3', type: 'Fatigue', description: 'Operator fell asleep during break, signs of exhaustion.', severity: 'Moderate', timestamp: '2024-05-15', location: 'Control Room', status: 'Resolved' },
    { id: 'H4', type: 'Hearing Loss', description: 'Temporary threshold shift reported after noise exposure.', severity: 'Minor', timestamp: '2024-05-10', location: 'Generator Room', status: 'Resolved' },
    { id: 'H5', type: 'Dehydration', description: 'Worker collapsed, required IV fluids.', severity: 'Severe', timestamp: '2024-05-01', location: 'Site C', status: 'Closed' },
    { id: 'H6', type: 'Ergonomic', description: 'Back pain reported from manual lifting.', severity: 'Minor', timestamp: '2024-04-25', location: 'Warehouse', status: 'Resolved' },
    { id: 'H7', type: 'Skin Irritation', description: 'Rash developed after handling cement.', severity: 'Minor', timestamp: '2024-04-20', location: 'Construction Area', status: 'Resolved' },
    { id: 'H8', type: 'Heat Stroke', description: 'Emergency medical evacuation required.', severity: 'Severe', timestamp: '2024-06-15', location: 'Open Field', status: 'Closed' }, // Future date for simulation
    { id: 'H9', type: 'Stress', description: 'Employee reported high stress levels.', severity: 'Minor', timestamp: '2024-05-05', location: 'Admin Office', status: 'Under Observation' },
    { id: 'H10', type: 'Food Poisoning', description: '3 workers reported nausea after lunch.', severity: 'Moderate', timestamp: '2024-05-12', location: 'Canteen', status: 'Resolved' }
  ]);

  const heatIndexData = [
    { time: '08:00', value: 32 }, { time: '10:00', value: 38 }, { time: '12:00', value: 45 }, { time: '14:00', value: 48 }, { time: '16:00', value: 42 }
  ];

  const handleRunAI = async () => {
    setLoading(true);
    try {
      const result = await analyzeHealthTrends(metrics, incidents);
      setAiAnalysis(result);
    } catch (e) {
      alert("AI Health analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const isManagement = ['Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager'].includes(currentUser.role);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-5">
            <div className="bg-rose-600 p-4 rounded-2xl text-white shadow-xl shadow-rose-500/20">
                <HeartPulse size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Health Monitoring</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Occupational Wellness & Fitness for Duty</p>
            </div>
          </div>
          <div className="flex bg-slate-200 p-1 rounded-2xl w-fit shadow-inner">
              {['Metrics', 'Incidents', 'AI Insights', 'Wellness'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {activeTab === 'Metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <History size={16} className="text-rose-500"/> Recent Health Screenings
                          </h3>
                          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <Plus size={14}/> Log Check-in
                          </button>
                      </div>
                      <div className="space-y-4">
                          {metrics.map(m => (
                              <div key={m.id} className="p-6 rounded-[2rem] border-2 border-slate-50 bg-white hover:border-rose-100 transition-all shadow-sm group">
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                              {m.employeeName.charAt(0)}
                                          </div>
                                          <div>
                                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{m.employeeName}</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase">{m.timestamp}</p>
                                          </div>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                          m.fitnessForDuty === 'Fit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                          m.fitnessForDuty === 'Unfit' ? 'bg-red-50 text-red-700 border-red-100' :
                                          'bg-orange-50 text-orange-700 border-orange-100'
                                      }`}>{m.fitnessForDuty} For Duty</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-4 mt-6">
                                      <div className="text-center">
                                          <p className="text-[8px] font-black text-slate-400 uppercase">BP</p>
                                          <p className="text-xs font-bold text-slate-700">{m.bloodPressure}</p>
                                      </div>
                                      <div className="text-center">
                                          <p className="text-[8px] font-black text-slate-400 uppercase">Rate</p>
                                          <p className="text-xs font-bold text-slate-700">{m.heartRate} bpm</p>
                                      </div>
                                      <div className="text-center">
                                          <p className="text-[8px] font-black text-slate-400 uppercase">Temp</p>
                                          <p className="text-xs font-bold text-slate-700">{m.bodyTemp}°C</p>
                                      </div>
                                      <div className="text-center">
                                          <p className="text-[8px] font-black text-slate-400 uppercase">Hydration</p>
                                          <span className={`text-[10px] font-black ${m.hydrationLevel === 'Optimal' ? 'text-emerald-600' : m.hydrationLevel === 'Critical' ? 'text-red-600' : 'text-orange-600'}`}>{m.hydrationLevel}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={100}/></div>
                      <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6">Site Heat Stress Index</h3>
                      <div className="h-40 w-full mb-6">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={heatIndexData}>
                                  <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={3}/>
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff'}}/>
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                          <div className="bg-orange-500 p-2 rounded-xl"><AlertTriangle size={16}/></div>
                          <div>
                              <p className="text-xs font-black uppercase">Category IV Alert</p>
                              <p className="text-[10px] text-slate-400 mt-1">Mandatory 15m rest every hour required.</p>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><GraduationCap size={14}/> Health Training</h3>
                      <div className="space-y-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-all">
                              <div>
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Heat Stress Awareness</p>
                                  <p className="text-[9px] text-slate-500 uppercase">92% Completion</p>
                              </div>
                              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-rose-500 transition-colors"/>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-all">
                              <div>
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Advanced First Aid</p>
                                  <p className="text-[9px] text-slate-500 uppercase">Due for 4 Staff</p>
                              </div>
                              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-rose-500 transition-colors"/>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Incidents' && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {incidents.map(inc => (
                      <div key={inc.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-2 h-full ${inc.severity === 'Severe' ? 'bg-red-500' : inc.severity === 'Moderate' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${inc.severity === 'Severe' ? 'bg-red-50 text-red-700 border-red-200' : inc.severity === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>{inc.severity} Severity</span>
                                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter mt-3 leading-none">{inc.type} Incident</h4>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inc.timestamp}</p>
                                  <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1 justify-end"><MapPin size={10}/> {inc.location}</p>
                              </div>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl italic">"{inc.description}"</p>
                          <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">{inc.status}</span>
                              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 flex items-center gap-2">Follow-up Log <ArrowUpRight size={14}/></button>
                          </div>
                      </div>
                  ))}
                  <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-rose-300 transition-all">
                      <div className="bg-slate-50 p-6 rounded-full group-hover:bg-rose-50 transition-colors mb-4">
                          <Plus size={32} className="text-slate-300 group-hover:text-rose-500"/>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Log Occupational Issue</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">Record workforce health alerts or illnesses.</p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Wellness' && (
          <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                      { title: 'Mental Health Awareness', category: 'Psychological', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { title: 'Healthy Eating & Nutrition', category: 'Lifestyle', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { title: 'Physical Activity & Ergonomics', category: 'Physical', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { title: 'Smoking Cessation Program', category: 'Lifestyle', icon: Droplets, color: 'text-rose-600', bg: 'bg-rose-50' },
                      { title: 'Sleep Hygiene & Fatigue', category: 'Physiological', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { title: 'Hydration & Heat Safety', category: 'Environmental', icon: Thermometer, color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((item, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-rose-100 transition-all group">
                          <div className={`p-4 ${item.bg} ${item.color} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                              <item.icon size={32}/>
                          </div>
                          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{item.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{item.category}</p>
                          <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                              View Content <ChevronRight size={14}/>
                          </button>
                      </div>
                  ))}
              </div>

              <div className="bg-rose-600 rounded-[3rem] p-12 text-white shadow-3xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                  <div className="absolute -bottom-20 -right-20 opacity-10">
                      <HeartPulse size={300} />
                  </div>
                  <div className="flex-1 relative z-10">
                      <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Employee Assistance Program (EAP)</h3>
                      <p className="text-rose-100 font-medium leading-relaxed max-w-xl">
                          Confidential support for mental health, financial advice, and personal wellbeing. Available 24/7 for all employees and their families.
                      </p>
                      <div className="flex gap-4 mt-8">
                          <button className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                              <ShieldAlert size={18}/> Emergency Support
                          </button>
                          <button className="px-8 py-4 bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-rose-800 transition-all">
                              Book a Consultation
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'AI Insights' && (
          <div className="space-y-8 animate-in fade-in duration-500">
              {loading ? (
                  <div className="bg-white h-[400px] rounded-[3rem] flex flex-col items-center justify-center p-20 text-center border border-slate-100 shadow-inner">
                      <Loader2 className="animate-spin text-rose-500 mb-6" size={48} />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Synthesizing Bio-Telemetry & Site Hazards...</p>
                  </div>
              ) : aiAnalysis ? (
                  <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 text-rose-400 pointer-events-none"><Stethoscope size={300} /></div>
                      
                      <div className="flex justify-between items-start mb-12 relative z-10 border-b border-white/10 pb-10">
                          <div className="flex items-center gap-6">
                              <div className="bg-rose-500 p-5 rounded-3xl shadow-2xl shadow-rose-500/40">
                                  <BrainCircuit size={40} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-1">AD6.Ai Health Diagnostic</p>
                                  <h3 className="text-3xl font-black uppercase tracking-tighter">Workforce Wellness Intelligence</h3>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aggregate Risk</p>
                              <div className={`text-4xl font-black tracking-tighter ${
                                  aiAnalysis.riskLevel === 'Low' ? 'text-emerald-400' : aiAnalysis.riskLevel === 'Moderate' ? 'text-yellow-400' : 'text-rose-400'
                              }`}>{aiAnalysis.riskLevel}</div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                          <div className="space-y-8">
                              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                                  <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles size={16}/> Strategic Trend Summary</h4>
                                  <p className="text-lg font-bold text-slate-200 leading-relaxed italic border-l-4 border-rose-500 pl-8 py-2">
                                      "{aiAnalysis.trendSummary}"
                                  </p>
                              </div>
                              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck size={16}/> Recommended Interventions</h4>
                                  <div className="grid gap-4">
                                      {aiAnalysis.suggestedInterventions.map((item, i) => (
                                          <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                              <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                                              <p className="text-sm font-bold text-slate-300">{item}</p>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-8">
                              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900 group-hover:scale-110 transition-transform duration-1000"><GraduationCap size={200} /></div>
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                                      <Zap size={18} className="text-yellow-500"/> AI Training Blueprint
                                  </h4>
                                  
                                  <div className="space-y-6 relative z-10">
                                      {aiAnalysis.trainingRecommendations.map((rec, i) => (
                                          <div key={i} className="p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-rose-100 transition-all shadow-sm group/item">
                                              <div className="flex justify-between items-start mb-4">
                                                  <div className="flex items-center gap-4">
                                                      <div className={`p-3 rounded-2xl shadow-md ${
                                                          rec.priority === 'High' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                                                      }`}>
                                                          <BookOpen size={20}/>
                                                      </div>
                                                      <div>
                                                          <h5 className="font-black text-slate-800 text-sm uppercase tracking-tight">{rec.title}</h5>
                                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border mt-1 inline-block ${
                                                              rec.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                          }`}>{rec.priority} Priority</span>
                                                      </div>
                                                  </div>
                                                  <button className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                                                      <ChevronRight size={20}/>
                                                  </button>
                                              </div>
                                              <p className="text-xs text-slate-600 leading-relaxed font-bold italic border-l-2 border-rose-500 pl-4">
                                                  {rec.rationale}
                                              </p>
                                              <div className="mt-6 flex justify-end">
                                                  <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all active:scale-95 shadow-lg">
                                                      <UserCheck size={14}/> Deploy to Department
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-12 flex justify-end relative z-10">
                          <button className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-3xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-3">
                              Generate Full Compliance Dossier <ArrowUpRight size={20}/>
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] h-[400px] flex flex-col items-center justify-center p-20 text-center">
                      <div className="bg-slate-50 p-8 rounded-full mb-6 animate-pulse">
                          <Stethoscope size={64} className="opacity-20" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">AI Health Lab Awaiting Execution</h3>
                      <p className="text-sm text-slate-400 mt-3 max-w-sm font-medium italic">Execute workforce diagnostic to identify occupational health risks and UAE compliance gaps.</p>
                      <button 
                          onClick={handleRunAI}
                          className="mt-10 bg-rose-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-500/30 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-3"
                      >
                          <BrainCircuit size={24}/> Run Population Analysis
                      </button>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default HealthMonitoringModule;
