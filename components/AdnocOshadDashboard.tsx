import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Clock, Landmark, 
  FileText, ArrowUpRight, TrendingUp, Info, Scale, Target, Calendar,
  Activity, Zap, ShieldPlus, Filter, BrainCircuit, ChevronRight,
  ChevronDown, ChevronUp, BookOpen, FileCheck, AlertOctagon,
  Download, Search, LayoutGrid, List, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const AdnocOshadDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PDO' | 'MOL'>('PDO');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Petroleum Development Oman (PDO) HSE Specifications Data
  const pdoData = {
    overall: 95.8,
    trend: +1.8,
    ncrCount: 1,
    lastAudit: '2024-02-15',
    nextAudit: '2024-08-20',
    elements: [
      { id: 'SP-1143', title: 'Permit to Work (PTW) System', status: 'Compliant', score: 98, color: 'emerald' },
      { id: 'SP-1170', title: 'Heat Stress Management & TWL Monitoring', status: 'Compliant', score: 96, color: 'emerald' },
      { id: 'SP-1231', title: 'Lockout / Tagout (LOTO) Isolation', status: 'Compliant', score: 100, color: 'emerald' },
      { id: 'SP-1232', title: 'Working at Heights & Fall Protection', status: 'Compliant', score: 92, color: 'emerald' },
      { id: 'PR-1172', title: 'Incident Notification (24-Hour SLA)', status: 'Compliant', score: 98, color: 'emerald' },
      { id: 'SP-1230', title: 'Confined Space Entry & Gas Testing', status: 'Partial', score: 85, color: 'orange', gaps: ['Continuous atmospheric gas detector calibration check overdue at Mina Al Fahal'] },
      { id: 'SP-1009', title: 'Waste Management & Environment Authority Compliance', status: 'Compliant', score: 97, color: 'emerald' },
      { id: 'SP-1157', title: 'Contractor HSE Management & OPAL Pre-Qualification', status: 'Partial', score: 82, color: 'orange', gaps: ['Contractor OPAL HSE passport compliance missing for 4 scaffolders'] },
    ]
  };

  // Oman Ministry of Labour (MD 286/2008 & RD 53/2023) Compliance Data
  const molData = {
    overall: 97.2,
    trend: +0.8,
    ncrCount: 1,
    lastAudit: '2024-01-10',
    nextAudit: '2024-07-15',
    elements: [
      { id: 'MD-286-Art4', title: 'Occupational Health Clinic & First Aid Facilities', status: 'Compliant', score: 100, color: 'emerald' },
      { id: 'MD-286-Art16', title: 'Midday Summer Work Ban (12:30 - 15:30 June-August)', status: 'Compliant', score: 98, color: 'emerald' },
      { id: 'MD-286-Art22', title: 'Hazardous Machinery Guarding & PPE Provision', status: 'Compliant', score: 96, color: 'emerald' },
      { id: 'RD-53-2023', title: 'Oman Labour Law Statutory OSH Standards', status: 'Compliant', score: 100, color: 'emerald' },
      { id: 'CDAA-Fire', title: 'Civil Defence & Ambulance Authority Fire Safety Approval', status: 'Compliant', score: 94, color: 'emerald' },
      { id: 'PASI-Notice', title: 'PASI Occupational Injury Notice (Annex 1 Schedule)', status: 'Compliant', score: 98, color: 'emerald' },
      { id: 'EA-RD-114', title: 'Environment Authority Hazardous Material Handling', status: 'Compliant', score: 92, color: 'emerald' },
      { id: 'OPAL-Std', title: 'OPAL Unified HSE Competency Standards', status: 'Partial', score: 88, color: 'orange', gaps: ['Refresher defensive driving certification overdue for 2 light vehicle operators'] },
    ]
  };

  const trendData = [
    { month: 'Jan', pdo: 89, mol: 93 },
    { month: 'Feb', pdo: 91, mol: 94 },
    { month: 'Mar', pdo: 93, mol: 95 },
    { month: 'Apr', pdo: 92, mol: 95 },
    { month: 'May', pdo: 95, mol: 97 },
    { month: 'Jun', pdo: 95.8, mol: 97.2 },
  ];

  const currentData = activeTab === 'PDO' ? pdoData : molData;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-2xl shadow-slate-500/20">
            <Landmark size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Strategic Compliance Hub</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-4 border-indigo-500 ps-4">
              PDO HSE Specifications & Oman Ministry of Labour (MD 286/2008)
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] shadow-inner">
          <button 
            onClick={() => setActiveTab('PDO')}
            className={`px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'PDO' ? 'glass-card text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            PDO HSE SPECS
          </button>
          <button 
            onClick={() => setActiveTab('MOL')}
            className={`px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'MOL' ? 'glass-card text-teal-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            OMAN MOL MD 286
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className={`absolute top-0 end-0 w-24 h-24 -me-8 -mt-8 opacity-5 transition-transform group-hover:scale-110 ${activeTab === 'PDO' ? 'text-indigo-600' : 'text-teal-600'}`}>
            <ShieldCheck size={96} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Compliance</p>
          <div className="flex items-end gap-2">
            <h3 className={`text-5xl font-black tracking-tighter ${activeTab === 'PDO' ? 'text-indigo-600' : 'text-teal-600'}`}>
              {currentData.overall}%
            </h3>
            <div className="flex items-center gap-1 text-emerald-500 mb-2">
              <TrendingUp size={14} />
              <span className="text-[10px] font-bold">+{currentData.trend}%</span>
            </div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase">Last Audit: {currentData.lastAudit}</p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Open Non-Conformities</p>
          <div className="flex items-end gap-2">
            <h3 className={`text-5xl font-black tracking-tighter ${currentData.ncrCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {currentData.ncrCount}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Active NCRs</span>
          </div>
          <div className="mt-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentData.ncrCount ? 'bg-red-500' : 'bg-slate-100'}`}></div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next External Audit</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
              {new Date(currentData.nextAudit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Clock size={14} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {Math.ceil((new Date(currentData.nextAudit).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Remaining
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 end-0 p-6 opacity-10">
            <BrainCircuit size={80} />
          </div>
          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">AI Audit Readiness</p>
          <h3 className="text-4xl font-black text-white tracking-tighter uppercase">High</h3>
          <div className="flex items-center gap-2 mt-4">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-[10px] font-bold text-teal-400 uppercase">98% Data Integrity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Element Breakdown */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <LayoutGrid size={24} className={activeTab === 'PDO' ? 'text-indigo-600' : 'text-teal-600'} />
                {activeTab === 'PDO' ? 'PDO HSE Specifications' : 'Oman Ministry of Labour (MD 286/2008)'} Elements
              </h3>
              <div className="flex gap-2">
                <button className="p-2 glass-panel rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                  <Search size={18} />
                </button>
                <button className="p-2 glass-panel rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentData.elements.map((el) => (
                <div key={el.id} className="group border border-slate-100 rounded-3xl overflow-hidden transition-all hover:border-indigo-100 hover:shadow-lg">
                  <div className="flex items-center justify-between p-6 glass-card">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                        el.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {el.score}%
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{el.id}</p>
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">{el.title}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${el.color === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${el.score}%` }}
                        ></div>
                      </div>
                      <button 
                        onClick={() => setExpandedSection(expandedSection === el.id ? null : el.id)}
                        className="p-2 hover:glass-button rounded-xl transition-colors"
                      >
                        {expandedSection === el.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {expandedSection === el.id && (
                    <div className="p-8 glass-panel border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Evidence</p>
                          <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex items-center justify-between p-3 glass-card rounded-xl border border-slate-100 group/item cursor-pointer hover:border-indigo-500 transition-all">
                                <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-slate-400 group-hover/item:text-indigo-600" />
                                  <span className="text-xs font-bold text-slate-600">Oman_Evidence_Doc_0{i}.pdf</span>
                                </div>
                                <Download size={14} className="text-slate-300 group-hover/item:text-indigo-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${el.gaps && el.gaps.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {el.gaps && el.gaps.length > 0 ? 'Identified Gaps' : 'Status: Fully Compliant'}
                          </p>
                          {el.gaps && el.gaps.length > 0 ? (
                            <div className="space-y-3">
                              {el.gaps.map((gap, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                                  <AlertOctagon size={16} className="text-red-500 shrink-0" />
                                  <p className="text-xs font-bold text-red-700 leading-relaxed">{gap}</p>
                                </div>
                              ))}
                              <button className="w-full mt-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                                Remediate Gap
                              </button>
                            </div>
                          ) : (
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                              <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
                              <p className="text-xs font-bold text-emerald-700">All requirements for this element are verified and documented under Oman standards.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Trend Chart */}
          <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <Activity size={24} className="text-indigo-600" /> Compliance Trajectory
              </h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">PDO SPECS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">OMAN MOL</span>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPdo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="pdo" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorPdo)" />
                  <Area type="monotone" dataKey="mol" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorMol)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Gap Analysis */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col shadow-3xl">
            <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
              <BrainCircuit size={220} />
            </div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="bg-teal-500 p-3 rounded-2xl text-slate-900 shadow-lg">
                <Zap size={28}/>
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-[0.2em]">AI Gap Analysis</h4>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Sultanate of Oman Frameworks</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10 flex-1">
              <div className="glass-card/5 border border-white/10 rounded-3xl p-6 hover:glass-card/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <Target size={16} className="text-teal-400" />
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">High Impact Exposure</p>
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-200">
                  PDO SP-1143 PTW digital permit authorization for Mina Al Fahal Area B is 15% behind schedule. Full closure mandatory per Concession Agreement.
                </p>
                <div className="mt-4 flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Remediate Now <ChevronRight size={14} />
                </div>
              </div>

              <div className="glass-card/5 border border-white/10 rounded-3xl p-6 hover:glass-card/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldAlert size={16} className="text-orange-400" />
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Regulatory Alert</p>
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-200">
                  Oman Ministry of Labour MD 286/2008 requires strict adherence to the Summer Midday Break (12:30–15:30) across all outdoor concession operations (June through August).
                </p>
                <div className="mt-4 flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View Requirements <ChevronRight size={14} />
                </div>
              </div>
            </div>

            <button className="w-full mt-10 bg-teal-500 text-slate-900 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-400 transition-all flex items-center justify-center gap-3">
              Generate Board Report <Download size={18}/>
            </button>
          </div>

          {/* Regulatory Calendar */}
          <div className="glass-card p-8 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3 mb-8">
              <Calendar size={20} className="text-indigo-600" /> Key Milestones
            </h3>
            
            <div className="space-y-6">
              {[
                { date: 'Jun 01', title: 'Midday Break Plan Filing', auth: 'MoL', type: 'Statutory' },
                { date: 'Jul 10', title: 'Q2 Concession HSE Report', auth: 'PDO', type: 'Report' },
                { date: 'Aug 20', title: 'SP-1143 PTW Audit', auth: 'PDO', type: 'Audit' },
                { date: 'Sep 05', title: 'Joint MoL/CDAA Inspection', auth: 'CDAA', type: 'Inspection' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group cursor-pointer">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-xs font-black text-slate-800 uppercase leading-none">{item.date.split(' ')[0]}</span>
                    <span className="text-lg font-black text-indigo-600 leading-none mt-1">{item.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 border-s-2 border-slate-100 ps-6 group-hover:border-indigo-500 transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.auth} • {item.type}</p>
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-1">{item.title}</h5>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 border-2 border-slate-100 text-slate-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all">
              View Full Calendar
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-50 rounded-[3rem] p-8 border-2 border-indigo-100">
            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="glass-card p-4 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
                <FileCheck size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-slate-600 uppercase">Upload Evidence</span>
              </button>
              <button className="glass-card p-4 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
                <Search size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-slate-600 uppercase">Self Audit</span>
              </button>
              <button className="glass-card p-4 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
                <List size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-slate-600 uppercase">NCR Registry</span>
              </button>
              <button className="glass-card p-4 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
                <Users size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-slate-600 uppercase">Assign Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdnocOshadDashboard;

const Users = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
