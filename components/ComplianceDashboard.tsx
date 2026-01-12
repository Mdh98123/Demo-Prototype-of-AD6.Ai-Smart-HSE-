
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Gavel, ShieldAlert, CheckCircle, AlertTriangle, Clock, Landmark, 
  FileText, ArrowUpRight, TrendingUp, Info, Scale, Target, Calendar,
  Activity, Zap, ShieldCheck, Filter, BrainCircuit, ChevronRight
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { View } from '../types';

const authorityCompliance = [
  { name: 'OSHAD-SF', compliance: 96, ncrCount: 2, status: 'Compliant', color: '#14b8a6' },
  { name: 'DM-Code', compliance: 88, ncrCount: 5, status: 'Correction Pending', color: '#f59e0b' },
  { name: 'MoHRE', compliance: 100, ncrCount: 0, status: 'Verified', color: '#10b981' },
  { name: 'Trakhees', compliance: 92, ncrCount: 1, status: 'Compliant', color: '#6366f1' },
];

const complianceTrend = [
  { month: 'Jan', overall: 85, oshad: 82, dm: 88 },
  { month: 'Feb', overall: 88, oshad: 86, dm: 84 },
  { month: 'Mar', overall: 92, oshad: 90, dm: 91 },
  { month: 'Apr', overall: 90, oshad: 94, dm: 85 },
  { month: 'May', overall: 95, oshad: 96, dm: 88 },
];

const deadlineData = [
  { id: '1', title: 'OSHAD Q2 Performance Report', authority: 'OSHAD', date: '2024-06-30', status: 'Upcoming', priority: 'High' },
  { id: '2', title: 'DM Midday Break Certification', authority: 'Dubai Mun.', date: '2024-06-15', status: 'Awaiting Evidence', priority: 'Critical' },
  { id: '3', title: 'Trakhees HSE Plan Update', authority: 'Trakhees', date: '2024-07-10', status: 'Planned', priority: 'Medium' },
];

interface ComplianceDashboardProps {
    onNavigate: (view: View) => void;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onNavigate }) => {
  const { activeFramework } = useUser();

  const activeNCRs = useMemo(() => authorityCompliance.reduce((acc, curr) => acc + curr.ncrCount, 0), []);
  const avgCompliance = useMemo(() => Math.round(authorityCompliance.reduce((acc, curr) => acc + curr.compliance, 0) / authorityCompliance.length), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Regulatory Adherence Hub</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium border-l-4 border-indigo-500 pl-4">Multi-Authority UAE Compliance Matrix</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl">
            <Landmark size={16} className="text-indigo-400"/>
            <span className="text-[10px] font-black uppercase tracking-widest">Portal Synchronization: <span className="text-teal-400">Live</span></span>
        </div>
      </div>

      {/* TOP KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => onNavigate(View.AUDITS)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-emerald-500/30 transition-all active:scale-95 group"
          >
              <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio Compliance</p>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors"/>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800">{avgCompliance}%</h3>
                  <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp size={12}/>
                      <span className="text-[9px] font-bold uppercase">+2.4% MoM</span>
                  </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl ml-4">
                  <ShieldCheck size={24}/>
              </div>
          </div>

          <div 
            onClick={() => onNavigate(View.AUDITS)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-red-500/30 transition-all active:scale-95 group"
          >
              <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Non-Conformities</p>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-red-500 transition-colors"/>
                  </div>
                  <h3 className="text-3xl font-black text-red-600">{activeNCRs}</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Across all Authorities</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl ml-4">
                  <ShieldAlert size={24}/>
              </div>
          </div>

          <div 
            onClick={() => onNavigate(View.PLANNING)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-indigo-500/30 transition-all active:scale-95 group"
          >
              <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Deadlines</p>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors"/>
                  </div>
                  <h3 className="text-3xl font-black text-indigo-600">{deadlineData.length}</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Next 30 Days</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl ml-4">
                  <Clock size={24}/>
              </div>
          </div>

          <div 
            onClick={() => onNavigate(View.DMS)}
            className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white flex items-start justify-between cursor-pointer hover:shadow-2xl hover:bg-slate-800 transition-all active:scale-95 group"
          >
              <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Regulatory Defensibility</p>
                      <ArrowUpRight size={14} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </div>
                  <h3 className="text-3xl font-black text-teal-400">Prime</h3>
                  <div className="flex items-center gap-1 mt-2">
                      <Zap size={12} className="text-yellow-400"/>
                      <span className="text-[9px] text-teal-400 uppercase font-black">AI Verified Posture</span>
                  </div>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl ml-4">
                  <Scale size={24} className="text-white"/>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Authority adherence comparison */}
          <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                          <Landmark size={20} className="text-indigo-600"/> Authority Adherence Matrix
                      </h3>
                      <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                          <Filter size={18}/>
                      </button>
                  </div>
                  <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={authorityCompliance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 100]} />
                              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                              <Bar dataKey="compliance" name="Compliance %" radius={[10, 10, 0, 0]} barSize={40}>
                                  {authorityCompliance.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.compliance < 90 ? '#f59e0b' : '#14b8a6'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      {authorityCompliance.map((auth, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{auth.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className={`w-2 h-2 rounded-full ${auth.ncrCount > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                                  <span className="text-xs font-black text-slate-700">{auth.ncrCount} Open NCRs</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Compliance Trajectory */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                          <Activity size={20} className="text-teal-600"/> Compliance Trajectory (H1 2024)
                      </h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Quarterly Sync Active</span>
                  </div>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={complianceTrend}>
                              <defs>
                                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                              <Area type="monotone" dataKey="overall" name="Global Adherence" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorOverall)" />
                              <Line type="monotone" dataKey="oshad" name="OSHAD Sync" stroke="#14b8a6" strokeWidth={2} dot={{r: 4}} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* Side: Critical Gaps & Deadlines */}
          <div className="lg:col-span-5 space-y-8">
              {/* Submission Deadline Tracker */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                          <Calendar size={20} className="text-indigo-600"/> Regulatory Calendar
                      </h3>
                  </div>
                  <div className="space-y-4">
                      {deadlineData.map((d, i) => (
                          <div key={i} className="p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-indigo-100 transition-all group">
                              <div className="flex justify-between items-start mb-3">
                                  <div>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                          d.priority === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                                      }`}>{d.priority} Priority</span>
                                      <h5 className="font-black text-slate-800 text-sm uppercase tracking-tight mt-1">{d.title}</h5>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-800">{d.date}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{d.authority}</p>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${d.priority === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-indigo-400'}`}></div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase">{d.status}</span>
                                  </div>
                                  <button 
                                    onClick={() => onNavigate(View.PLANNING)}
                                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1"
                                  >
                                      Prepare Dossier <ArrowUpRight size={12}/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button 
                    onClick={() => onNavigate(View.PLANNING)}
                    className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition"
                  >
                      Launch Submission Bridge
                  </button>
              </div>

              {/* AI COMPLIANCE ANALYSIS */}
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col shadow-3xl">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                      <Gavel size={220} />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="bg-teal-500 p-3 rounded-2xl text-slate-900 shadow-lg">
                          <BrainCircuit size={28}/>
                      </div>
                      <div>
                          <h4 className="text-sm font-black uppercase tracking-[0.2em]">Compliance Intel</h4>
                          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Strategic Audit Analysis</p>
                      </div>
                  </div>

                  <div className="space-y-6 relative z-10 flex-1">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                              <Target size={16} className="text-teal-400" />
                              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">High Probability Exposure</p>
                          </div>
                          <p className="text-sm font-bold leading-relaxed text-slate-200">
                              Failure to submit DM Midday Work Ban evidence before June 15th may result in an AED 15,000 penalty and automatic site-stop status.
                          </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                              <ShieldCheck size={16} className="text-teal-400" />
                              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Recommended Strategic Shift</p>
                          </div>
                          <p className="text-sm font-bold leading-relaxed text-slate-200">
                              Accelerate OSHAD SF 4.0 migration for "Ruwais Zone A" to align with Q3 reporting requirements and gain preferential tender status.
                          </p>
                      </div>
                  </div>

                  <button className="w-full mt-10 bg-teal-500 text-slate-900 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-400 transition-all flex items-center justify-center gap-3">
                      Generate Board Report <ChevronRight size={18}/>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
