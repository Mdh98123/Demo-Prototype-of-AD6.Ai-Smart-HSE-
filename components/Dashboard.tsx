
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal, Filter, 
  Download, Activity, AlertCircle, Calendar, ChevronDown, CheckCircle2,
  AlertTriangle, PlayCircle, Zap, Shield, ShieldCheck,
  AlertOctagon, FileSignature, FileDigit, FileText, Users
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { View } from '../types';

interface DashboardProps {
    onNavigate: (view: View) => void;
}

// --- MOCK DATA ---
const trendData = [
  { month: 'Oct', incidents: 12, compliance: 85 },
  { month: 'Nov', incidents: 19, compliance: 88 },
  { month: 'Dec', incidents: 8, compliance: 92 },
  { month: 'Jan', incidents: 15, compliance: 90 },
  { month: 'Feb', incidents: 10, compliance: 94 },
  { month: 'Mar', incidents: 5, compliance: 96 },
  { month: 'Apr', incidents: 14, compliance: 95 },
  { month: 'May', incidents: 7, compliance: 98 },
];

const permitData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 65 },
  { day: 'Fri', count: 48 },
  { day: 'Sat', count: 20 },
  { day: 'Sun', count: 15 },
];

const riskDistribution = [
  { name: 'Critical', value: 15, color: '#ef4444' }, // Red
  { name: 'High', value: 25, color: '#f97316' },     // Orange
  { name: 'Medium', value: 35, color: '#6366f1' },   // Indigo
  { name: 'Low', value: 25, color: '#10b981' },      // Emerald
];

const activityFeed = [
  { id: 1, app: 'OSHAD Portal', type: 'Submission', rate: '100%', status: 'Success', profit: 'Verified', icon: Shield, color: 'bg-teal-100 text-teal-600' },
  { id: 2, app: 'Work Permit #402', type: 'Approval', rate: '45m', status: 'Pending', profit: 'Review', icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
  { id: 3, app: 'Excavation Scan', type: 'Inspection', rate: '80%', status: 'Warning', profit: 'Flagged', icon: AlertTriangle, color: 'bg-orange-100 text-orange-600' },
  { id: 4, app: 'Site Induction', type: 'Training', rate: '12', status: 'Active', profit: '+12 Staff', icon: Users, color: 'bg-blue-100 text-blue-600' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useUser();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Top Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Overview of safety performance and compliance.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <Calendar size={16} className="mr-2 text-slate-400" />
                <span>Oct 18 - Nov 18</span>
                <ChevronDown size={14} className="ml-2 text-slate-400" />
            </div>
            <button className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
                <Filter size={16} className="mr-2" /> Filter
            </button>
            <button className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
                <Download size={16} className="mr-2" /> Export
            </button>
        </div>
      </div>

      {/* Interactive Metric Cards (Horizon UI Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Incident Overview */}
          <div 
            onClick={() => onNavigate(View.INCIDENTS)}
            className="bg-white p-5 rounded-[20px] shadow-soft border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Incidents</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">12</h3>
                  </div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
                      <AlertOctagon size={22} />
                  </div>
              </div>
              <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-red-100">
                          <AlertTriangle size={10}/> 2 Critical
                      </span>
                      <span>Requires Action</span>
                  </div>
                  <p className="text-[10px] text-slate-400"> <span className="text-emerald-500 font-bold">-15%</span> vs last month</p>
              </div>
          </div>

          {/* Card 2: Risk Assessment Status */}
          <div 
            onClick={() => onNavigate(View.RAMS)}
            className="bg-white p-5 rounded-[20px] shadow-soft border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active RAMS</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">45</h3>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                      <FileDigit size={22} />
                  </div>
              </div>
              <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-orange-100">
                          8 Pending
                      </span>
                      <span>Review Queue</span>
                  </div>
                  <p className="text-[10px] text-slate-400"> <span className="text-indigo-500 font-bold">+5</span> new this week</p>
              </div>
          </div>

          {/* Card 3: Permit Overview */}
          <div 
            onClick={() => onNavigate(View.PERMITS)}
            className="bg-white p-5 rounded-[20px] shadow-soft border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Open Permits</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">24</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <FileSignature size={22} />
                  </div>
              </div>
              <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-blue-100">
                          <Activity size={10}/> 5 Expiring
                      </span>
                      <span>&lt; 2 Hours</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Highest activity in Zone B</p>
              </div>
          </div>

          {/* Card 4: Compliance Tracker */}
          <div 
            onClick={() => onNavigate(View.COMPLIANCE)}
            className="bg-white p-5 rounded-[20px] shadow-soft border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Compliance</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">94%</h3>
                  </div>
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
                      <ShieldCheck size={22} />
                  </div>
              </div>
              <div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 flex justify-between">
                      <span>Based on OSHAD-SF</span>
                      <span className="font-bold text-slate-600">Target: 100%</span>
                  </p>
              </div>
          </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="font-bold text-lg text-slate-800">Incident Trends</h3>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-emerald-500 font-bold text-sm">+15.8%</span>
                          <span className="text-slate-400 text-xs font-medium">more safe hours logged</span>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                          <Filter size={12}/> Filter
                      </button>
                      <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          Sort
                      </button>
                  </div>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                          <defs>
                              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: 'none'}}
                            itemStyle={{color: '#1e293b', fontWeight: 600, fontSize: '12px'}}
                          />
                          <Area type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
                          <Area type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompliance)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="w-3 h-3 rounded-full bg-brand-500"></span> Incidents
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Compliance %
                  </div>
              </div>
          </div>

          {/* Side Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Active Permits</h3>
                  <button className="px-2 py-1 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Weekly</button>
              </div>
              
              <div className="mb-4">
                  <h4 className="text-3xl font-bold text-slate-800">24,473</h4>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-500 text-xs font-bold">+8.3%</span>
                      <span className="text-slate-400 text-xs font-medium">+749 this week</span>
                  </div>
              </div>

              <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={permitData}>
                          <CartesianGrid vertical={false} stroke="transparent" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={5} />
                          <Tooltip 
                             cursor={{fill: 'transparent'}}
                             contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}}
                             itemStyle={{color: '#fff'}}
                          />
                          <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                              {permitData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 1 ? '#6366f1' : '#e2e8f0'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">
          {/* Donut Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-slate-800">Risk Distribution</h3>
                  <button className="text-xs font-bold text-slate-500 hover:text-brand-600">Monthly</button>
              </div>
              
              <div className="flex justify-between items-end mb-4">
                  <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block border-l-2 border-brand-500 pl-2">Critical</span>
                      <span className="text-xl font-bold text-slate-800 pl-2">15%</span>
                  </div>
                  <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block border-l-2 border-orange-500 pl-2">High</span>
                      <span className="text-xl font-bold text-slate-800 pl-2">25%</span>
                  </div>
                  <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block border-l-2 border-emerald-500 pl-2">Low</span>
                      <span className="text-xl font-bold text-slate-800 pl-2">35%</span>
                  </div>
              </div>

              <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={riskDistribution}
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={0}
                              dataKey="value"
                              stroke="none"
                          >
                              {riskDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
                  {/* Center Content for Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
                      <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-inner">
                          <Zap size={24} className="text-brand-600"/>
                      </div>
                  </div>
              </div>
          </div>

          {/* List Widget */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Live Activity Feed</h3>
                  <button className="text-xs font-bold text-brand-600 hover:underline">See All</button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full">
                      <thead>
                          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left border-b border-slate-50">
                              <th className="pb-3 pl-2">Application</th>
                              <th className="pb-3">Type</th>
                              <th className="pb-3">Rate</th>
                              <th className="pb-3">Result</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {activityFeed.map((item) => (
                              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 pl-2">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2.5 rounded-xl ${item.color}`}>
                                              <item.icon size={18} />
                                          </div>
                                          <span className="font-bold text-sm text-slate-700">{item.app}</span>
                                      </div>
                                  </td>
                                  <td className="py-4 text-sm font-medium text-slate-500">{item.type}</td>
                                  <td className="py-4">
                                      <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                          <div className="bg-brand-500 h-full rounded-full" style={{ width: item.rate.includes('%') ? item.rate : '50%' }}></div>
                                      </div>
                                  </td>
                                  <td className="py-4 font-bold text-sm text-slate-700">{item.profit}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};

// Simple Info Icon Component
const InfoIcon = () => (
    <div className="text-slate-300 hover:text-slate-500 cursor-pointer transition-colors">
        <AlertCircle size={18} />
    </div>
);

export default Dashboard;
