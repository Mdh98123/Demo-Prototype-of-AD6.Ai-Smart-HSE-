
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { 
  ArrowUpRight, Eye, Filter, Download, Activity, AlertCircle, Calendar, 
  CheckCircle2, AlertTriangle, Zap, ShieldCheck, AlertOctagon, FileSignature, 
  FileDigit, FileText, Users, TrendingUp, Clock, Globe, Loader2, X, ExternalLink,
  HardHat, Stethoscope, Flame, Plus, PlayCircle, Shield, Briefcase, MapPin,
  ClipboardList, BookOpen, GraduationCap, Gavel, FlaskConical, ShieldAlert,
  Scale, MoreHorizontal, ChevronRight, Target
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { View, HSEPerformanceMetrics, Task, Project } from '../types';
import { fetchHseNews } from '../services/geminiService';

interface DashboardProps {
    onNavigate: (view: View) => void;
}

// --- MOCK DATA ---
const monthlyTrendData = [
  { month: 'Jan', manHours: 45000, incidents: 2, safeManHours: 45000 },
  { month: 'Feb', manHours: 48000, incidents: 0, safeManHours: 93000 },
  { month: 'Mar', manHours: 52000, incidents: 3, safeManHours: 93000 },
  { month: 'Apr', manHours: 50000, incidents: 1, safeManHours: 143000 },
  { month: 'May', manHours: 55000, incidents: 4, safeManHours: 143000 },
  { month: 'Jun', manHours: 60000, incidents: 1, safeManHours: 203000 },
];

const incidentBreakdown = [
  { name: 'Unsafe Acts', value: 45, color: '#f59e0b' },
  { name: 'Unsafe Conditions', value: 30, color: '#3b82f6' },
  { name: 'Near Miss', value: 25, color: '#10b981' },
];

const mockMetrics: HSEPerformanceMetrics = {
    manHours: { total: 1250450, safe: 350000, thisMonth: 60000 },
    lagging: { fatality: 0, lti: 1, rwc: 2, mtc: 5, fac: 12, nearMiss: 28, propertyDamage: 3, envSpill: 1 },
    leading: { unsafeActs: 154, unsafeConditions: 89, tbtConducted: 45, inspectionsClosed: 92, drillsConducted: 2 },
    rates: { ltif: 0.8, trir: 6.4 },
    actions: { total: 177, closed: 120, open: 45, overdue: 12 }
};

// --- REDESIGNED INTERACTIVE WIDGETS ---

const IncidentOverviewWidget = ({ data, onNavigate }: { data: any[], onNavigate: (v: View) => void }) => {
  const activeIncidents = 5;
  const investigating = 2;
  const reviewing = 3;

  return (
    <div 
        onClick={() => onNavigate(View.INCIDENTS)}
        className="bg-white p-6 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col h-[380px] group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden cursor-pointer"
    >
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
            <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <AlertOctagon size={26} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Incidents</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-red-500 transition-colors">Live Operations</p>
            </div>
        </div>
        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border border-red-100 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Action
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-7xl font-black text-slate-800 tracking-tighter group-hover:text-red-600 transition-colors">{activeIncidents}</span>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 uppercase leading-none">Active</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">Cases</span>
            </div>
          </div>
          
          <div className="space-y-5">
              <div className="group/bar">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      <span>Investigation</span>
                      <span className="text-orange-600">{investigating} Open</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 w-[40%] rounded-full relative group-hover/bar:w-[45%] transition-all duration-500">
                          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      </div>
                  </div>
              </div>
              <div className="group/bar">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      <span>Review Pending</span>
                      <span className="text-red-600">{reviewing} Urgent</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-red-700 w-[60%] rounded-full relative group-hover/bar:w-[65%] transition-all duration-500">
                           <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center relative z-10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Clock size={10}/> Updated 2m ago
          </span>
          <button className="text-[10px] font-black text-red-600 uppercase hover:text-red-700 hover:underline flex items-center gap-1 transition-all">
              View Registry <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
          </button>
      </div>
    </div>
  );
}

const RiskAssessmentWidget = ({ onNavigate }: { onNavigate: (v: View) => void }) => {
    const stages = [
        { name: 'Draft', count: 3, color: '#e2e8f0' },
        { name: 'Review', count: 5, color: '#f59e0b' },
        { name: 'Active', count: 12, color: '#10b981' }
    ];
    const total = stages.reduce((a,b) => a + b.count, 0);

    return (
        <div 
            onClick={() => onNavigate(View.RAMS)}
            className="bg-white p-6 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col h-[380px] group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <FileDigit size={26} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Risk Assess.</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-emerald-500 transition-colors">RAMS Lifecycle</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-56 h-56">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stages}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={6}
                                dataKey="count"
                                cornerRadius={8}
                                stroke="none"
                            >
                                {stages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-500 hover:opacity-80"/>
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', padding: '10px'}}
                                itemStyle={{fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{total}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Total</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between px-2 relative z-10 mt-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                {stages.map((stage) => (
                    <div key={stage.name} className="text-center flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full mb-1" style={{backgroundColor: stage.color}}></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{stage.name}</p>
                        <p className="text-sm font-black text-slate-700">{stage.count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermitOverviewWidget = ({ onNavigate }: { onNavigate: (v: View) => void }) => {
    const pending = 4;
    const active = 12;

    return (
        <div 
            onClick={() => onNavigate(View.PERMITS)}
            className="bg-white p-6 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col h-[380px] group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <FileSignature size={26} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Permit Control</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Authorization</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                {/* Pending Requests - Highlighted */}
                <div className="bg-gradient-to-r from-orange-50 to-white rounded-[1.5rem] p-5 border border-orange-100 flex justify-between items-center group/pending hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-sm border border-orange-50 group-hover/pending:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <span className="text-3xl font-black text-slate-800 block leading-none">{pending}</span>
                            <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">Pending</span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-orange-400 shadow-sm">
                        <ChevronRight size={16} className="group-hover/pending:translate-x-0.5 transition-transform"/>
                    </div>
                </div>

                {/* Active & Closed */}
                <div className="grid grid-cols-2 gap-3 h-full">
                    <div className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 flex flex-col justify-center items-center text-center hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Site</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-3xl font-black text-slate-800">{active}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 flex flex-col justify-center items-center text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Closed (24h)</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-slate-400"/>
                            <span className="text-3xl font-black text-slate-800">3</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-2 group/btn">
                Process Requests <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"/>
            </button>
        </div>
    );
};

const ComplianceTrackerWidget = ({ onNavigate }: { onNavigate: (v: View) => void }) => {
    const overallScore = 88;
    const tasks = [
        { name: 'Inspections', completed: 15, total: 20 },
        { name: 'Audits', completed: 2, total: 3 },
        { name: 'Trainings', completed: 45, total: 50 },
    ];

    return (
        <div 
            onClick={() => onNavigate(View.COMPLIANCE)}
            className="bg-slate-900 p-6 rounded-[2.5rem] shadow-card flex flex-col h-[380px] group transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden cursor-pointer"
        >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-teal-500/30 transition-colors duration-700 animate-pulse"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md text-teal-400 shadow-lg">
                        <Scale size={26} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Compliance</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-teal-400 transition-colors">Workflow</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-white tracking-tighter">{overallScore}%</span>
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <Zap size={10} className="text-yellow-400 fill-yellow-400"/>
                        <p className="text-[9px] text-teal-400 font-black uppercase tracking-widest">Target Met</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 relative z-10 pt-2">
                {tasks.map((task, idx) => {
                    const percentage = Math.round((task.completed / task.total) * 100);
                    return (
                        <div key={task.name} className="group/bar">
                            <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-wide">
                                <span>{task.name}</span>
                                <span className="text-white group-hover/bar:text-teal-400 transition-colors">{task.completed}/{task.total}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 relative group-hover/bar:brightness-125 ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-teal-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto relative z-10 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-white">Audit Ready</p>
                    <p className="text-[10px] text-slate-400 font-medium">System prepared for external review.</p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useUser();
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsContent, setNewsContent] = useState<{ text: string, sources: any[] } | null>(null);
  const [loadingNews, setLoadingNews] = useState(false);

  const handleFetchNews = async () => {
      setIsNewsModalOpen(true);
      if (!newsContent) {
          setLoadingNews(true);
          const data = await fetchHseNews();
          setNewsContent(data);
          setLoadingNews(false);
      }
  };

  // Determine which dashboard to show based on role
  const dashboardType = useMemo(() => {
      const role = currentUser.role;
      if (['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE'].includes(role)) return 'EXECUTIVE';
      if (['Regional_HSE_Director', 'Site_HSE_Manager', 'Project_Manager', 'HSE_Officer'].includes(role)) return 'MANAGER';
      return 'WORKER'; // Supervisors, Workers, etc.
  }, [currentUser.role]);

  // Executive Dashboard Layout
  const ExecutiveDashboard = ({ onNavigate, metrics }: { onNavigate: (v: View) => void, metrics: HSEPerformanceMetrics }) => (
        <div className="space-y-6 animate-in fade-in duration-500">
             {/* Top Banner: Safe Man-Hours & Days Since LTI */}
            <div className="bg-neutral-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ShieldCheck size={180}/>
                </div>
                
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/30 animate-pulse-soft">
                        <Clock size={32} className="text-white"/>
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter">184 <span className="text-lg font-bold text-emerald-400">Days</span></h2>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Since Last Lost Time Injury (LTI)</p>
                    </div>
                </div>

                <div className="h-px w-full md:h-12 md:w-px bg-white/10 block"></div>

                <div className="text-center md:text-left relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter text-blue-400">{metrics.manHours.safe.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Safe Man-hours Achieved</p>
                </div>

                <div className="h-px w-full md:h-12 md:w-px bg-white/10 block"></div>

                <div className="flex gap-3 relative z-10">
                        <div className="text-center">
                            <p className="text-2xl font-black text-white">{metrics.rates.ltif}</p>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">LTIF</p>
                        </div>
                        <div className="text-center pl-4 border-l border-white/10">
                            <p className="text-2xl font-black text-white">{metrics.rates.trir}</p>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">TRIR</p>
                        </div>
                </div>
            </div>

            {/* Lagging Indicators Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                    { label: 'Fatalities', val: metrics.lagging.fatality, color: 'text-neutral-400', bg: 'bg-neutral-100' },
                    { label: 'LTI', val: metrics.lagging.lti, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'RWC', val: metrics.lagging.rwc, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'MTC', val: metrics.lagging.mtc, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'FAC', val: metrics.lagging.fac, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Near Miss', val: metrics.lagging.nearMiss, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Prop. Dmg', val: metrics.lagging.propertyDamage, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Env. Spill', val: metrics.lagging.envSpill, color: 'text-teal-600', bg: 'bg-teal-50' },
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center ${stat.bg}`}>
                        <span className={`text-2xl font-black ${stat.color}`}>{stat.val}</span>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[400px]">
                {/* Man-hours vs Incidents Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl border border-neutral-100 flex flex-col min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Man-hours vs Incidents</h3>
                            <p className="text-xs text-neutral-400 font-medium">Monthly Exposure Trend</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-400">
                                <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Man-hours
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-400">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span> Incidents
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#ef4444', fontSize: 10}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar yAxisId="left" dataKey="manHours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                <Line yAxisId="right" type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Incident Pyramid / Breakdown */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-neutral-100 flex flex-col min-h-[350px]">
                    <h3 className="font-bold text-lg text-neutral-800 mb-6">Incident Analysis</h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incidentBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {incidentBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs font-bold text-neutral-500 uppercase ml-1">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="text-3xl font-black text-neutral-800">{incidentBreakdown.reduce((a,b)=>a+b.value,0)}</span>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Events</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );

  // Manager Dashboard Layout
  const ManagerDashboard = ({ onNavigate }: { onNavigate: (v: View) => void }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* OPERATIONAL WIDGETS GRID - REDESIGNED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <IncidentOverviewWidget data={monthlyTrendData} onNavigate={onNavigate} />
            <RiskAssessmentWidget onNavigate={onNavigate} />
            <PermitOverviewWidget onNavigate={onNavigate} />
            <ComplianceTrackerWidget onNavigate={onNavigate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                        <AlertOctagon size={20} className="text-red-500"/> Critical Action Items
                    </h3>
                    <button className="text-[10px] font-black text-neutral-400 uppercase hover:text-neutral-600">Filter: High Priority</button>
                </div>
                <div className="space-y-4">
                    {[
                        { title: 'Authorize Crane Lift Plan - Zone C', type: 'Approval', due: 'Today', from: 'Site Supervisor' },
                        { title: 'Sign-off Incident Report #INC-772', type: 'Review', due: 'Overdue', from: 'HSE Officer' },
                        { title: 'Approve MOC for Pump Bypass', type: 'Technical', due: 'Tomorrow', from: 'Engineering' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50 rounded-3xl border-2 border-neutral-100 hover:bg-white hover:shadow-lg transition-all group cursor-pointer gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${item.due === 'Overdue' ? 'bg-red-500' : 'bg-neutral-900'}`}>
                                    {i+1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-800 text-sm group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wide">{item.type} • Req By: {item.from}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-center sm:text-right ${item.due === 'Overdue' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.due}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
                <h3 className="text-lg font-black text-neutral-800 uppercase tracking-tight mb-6">Site Pulse</h3>
                <div className="space-y-6">
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <div className="flex justify-between text-xs font-bold text-neutral-600 mb-2">
                            <span>Permit Utilization</span>
                            <span>28/40 Active</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <div className="flex justify-between text-xs font-bold text-neutral-600 mb-2">
                            <span>Inspection Completion</span>
                            <span>92%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-neutral-100">
                        <button onClick={() => onNavigate(View.INSPECTIONS)} className="w-full bg-white border-2 border-neutral-100 text-neutral-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-indigo-600 transition-colors">
                            Schedule Audit
                        </button>
                        <button onClick={() => onNavigate(View.TRAINING)} className="w-full mt-3 bg-white border-2 border-neutral-100 text-neutral-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-indigo-600 transition-colors">
                            Team Competency Matrix
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // Worker Dashboard Layout
  const WorkerDashboard = ({ onNavigate, user }: { onNavigate: (v: View) => void, user: any }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Hero */}
        <div className="bg-neutral-900 rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><HardHat size={180}/></div>
            <div className="relative z-10 space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg border border-indigo-400">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter">Hello, {user.name.split(' ')[0]}</h2>
                        <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest">{user.role.replace('_', ' ')} • {user.department}</p>
                    </div>
                </div>
                <div className="flex justify-center md:justify-start gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-400">Safety Score</p>
                        <p className="text-xl font-black text-emerald-400">{user.safetyScore} XP</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-400">Cert Status</p>
                        <p className="text-xl font-black text-white">Valid</p>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10 w-full md:w-auto">
                <button onClick={() => onNavigate(View.INCIDENTS)} className="p-4 bg-red-600 hover:bg-red-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg group">
                    <AlertCircle className="text-white group-hover:scale-110 transition-transform" size={24}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Report Incident</span>
                </button>
                <button onClick={() => onNavigate(View.OBSERVATIONS)} className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg group">
                    <Eye className="text-white group-hover:scale-110 transition-transform" size={24}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Observation</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Tasks / Permits */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                            <Briefcase size={20} className="text-neutral-400"/> My Active Permits
                        </h3>
                        <button onClick={() => onNavigate(View.PERMITS)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { id: 'PTW-2024-001', type: 'Hot Work', location: 'Zone B - Welding', status: 'Active', time: '08:00 - 16:00' },
                            { id: 'PTW-2024-003', type: 'Confined Space', location: 'Tank 4 Entry', status: 'Pending', time: 'Tomorrow' }
                        ].map((p, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50 rounded-3xl border-2 border-neutral-100 hover:border-indigo-200 transition-all cursor-pointer gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <FileSignature size={20}/>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-neutral-800 text-sm">{p.type}</h4>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{p.id} • {p.location}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right pl-14 sm:pl-0">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{p.status}</span>
                                    <p className="text-[10px] font-bold text-neutral-400 mt-1">{p.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-neutral-400"/> Assigned Tasks
                        </h3>
                    </div>
                    <div className="grid gap-3">
                        <div className="p-4 rounded-2xl border border-neutral-100 flex items-center gap-3 hover:bg-neutral-50 transition">
                            <div className="w-5 h-5 rounded border-2 border-neutral-300"></div>
                            <span className="text-sm font-bold text-neutral-700">Inspect Harness Kits (Zone A)</span>
                            <span className="ml-auto text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded uppercase">High</span>
                        </div>
                        <div className="p-4 rounded-2xl border border-neutral-100 flex items-center gap-3 hover:bg-neutral-50 transition">
                            <div className="w-5 h-5 rounded border-2 border-neutral-300"></div>
                            <span className="text-sm font-bold text-neutral-700">Complete H2S Refresher</span>
                            <span className="ml-auto text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded uppercase">Medium</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Stats & Training */}
            <div className="space-y-6">
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10"><GraduationCap size={140}/></div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Training Status</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-black">92%</span>
                    </div>
                    <p className="text-xs font-bold text-indigo-200">Competency Score</p>
                    <button onClick={() => onNavigate(View.TRAINING)} className="mt-6 w-full bg-white text-indigo-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition">My Certificates</button>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-neutral-100">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                            <div>
                                <p className="text-xs font-bold text-neutral-700">Submitted Safe Act Observation</p>
                                <p className="text-[10px] text-neutral-400">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                            <div>
                                <p className="text-xs font-bold text-neutral-700">Checked into Zone B</p>
                                <p className="text-[10px] text-neutral-400">4 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Global Header Actions (Visible for all, but customized) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
        <div>
            {dashboardType === 'EXECUTIVE' && (
                <>
                    <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Executive Overview</h1>
                    <p className="text-neutral-500 text-sm font-normal mt-1">Strategic HSE Performance & Metrics.</p>
                </>
            )}
            {dashboardType === 'MANAGER' && (
                <>
                    <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Operational Command</h1>
                    <p className="text-neutral-500 text-sm font-normal mt-1">Site Activity, Approvals & Compliance.</p>
                </>
            )}
            {dashboardType === 'WORKER' && (
                <>
                    <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">My Workspace</h1>
                    <p className="text-neutral-500 text-sm font-normal mt-1">Tasks, Permits & Personal Safety.</p>
                </>
            )}
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={handleFetchNews} className="flex items-center bg-white border border-neutral-200 text-neutral-600 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-sm hover:bg-neutral-50 transition-all gap-2">
                <Globe size={14} /> Regulatory News
            </button>
            {dashboardType === 'EXECUTIVE' && (
                <button className="flex items-center bg-indigo-600 text-white rounded-2xl px-5 py-2.5 text-xs font-bold shadow-lg hover:bg-indigo-700 transition-all gap-2">
                    <Download size={14} /> Export Report
                </button>
            )}
        </div>
      </div>

      {/* Render Role-Specific Dashboard */}
      {dashboardType === 'EXECUTIVE' && <ExecutiveDashboard onNavigate={onNavigate} metrics={mockMetrics} />}
      {dashboardType === 'MANAGER' && <ManagerDashboard onNavigate={onNavigate} />}
      {dashboardType === 'WORKER' && <WorkerDashboard onNavigate={onNavigate} user={currentUser} />}

      {/* News Modal (Shared) */}
      {isNewsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                      <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                          <Globe size={18} className="text-indigo-600"/> Latest HSE News
                      </h3>
                      <button onClick={() => setIsNewsModalOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                          <X size={18} className="text-neutral-500"/>
                      </button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {loadingNews ? (
                          <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                              <Loader2 size={32} className="animate-spin mb-3 text-indigo-500"/>
                              <p className="text-xs font-bold uppercase tracking-widest">Scanning Regulatory Sources...</p>
                          </div>
                      ) : newsContent ? (
                          <div className="space-y-6">
                              <div className="prose prose-sm text-neutral-600 leading-relaxed font-medium">
                                  {newsContent.text.split('\n').map((line, i) => (
                                      <p key={i} className="mb-2">{line}</p>
                                  ))}
                              </div>
                              {newsContent.sources.length > 0 && (
                                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Verified Sources</p>
                                      <div className="space-y-2">
                                          {newsContent.sources.map((source, idx) => (
                                              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline hover:text-indigo-800 transition-colors">
                                                  <ExternalLink size={12}/> {source.title}
                                              </a>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="text-center py-8 text-neutral-400 font-medium">No news loaded.</div>
                      )}
                  </div>
                  <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                      <button onClick={() => setIsNewsModalOpen(false)} className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
