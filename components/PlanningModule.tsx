
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { HSEPlan } from '../types';
import { 
  Compass, Plus, FileText, CheckCircle2, Clock, Send, 
  ChevronRight, ArrowUpRight, Shield, Download, Landmark,
  AlertCircle, History, UserCheck, MessageSquare
} from 'lucide-react';

const PlanningModule: React.FC = () => {
  const { activeFramework, currentUser } = useUser();
  const [plans] = useState<HSEPlan[]>([
    { 
        id: 'PLN-001', 
        title: 'Site Expansion HSE Plan V2', 
        type: 'PHSP', 
        phase: 'Construction',
        status: 'Client_Review', 
        version: '2.1', 
        lastUpdated: '2024-05-10',
        approvals: [
            { role: 'HSE Manager', name: 'Sarah Jones', date: '2024-05-08' },
            { role: 'Project Manager', name: 'John Doe', date: '2024-05-09' }
        ]
    },
    { 
        id: 'PLN-002', 
        title: 'Emergency Response Protocol - Habshan', 
        type: 'ERP', 
        phase: 'Procurement',
        status: 'Approved', 
        version: '4.0', 
        lastUpdated: '2024-04-15',
        approvals: [
            { role: 'Head Group HSE', name: 'Dr. Layla Hassan', date: '2024-04-10' },
            { role: 'Civil Defence', name: 'Authority Approval', date: '2024-04-14' }
        ]
    },
    {
        id: 'PLN-003', 
        title: 'Ruwais Zone A Environmental Management Plan', 
        type: 'EMP', 
        phase: 'Construction',
        status: 'Regulator_Review', 
        version: '1.2', 
        lastUpdated: '2024-05-18',
        approvals: [
            { role: 'Environmental Officer', name: 'Khalid Al-Dhaheri', date: '2024-05-15' }
        ]
    }
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'Regulator_Review': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        case 'Client_Review': return 'bg-orange-50 text-orange-700 border-orange-100';
        default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                <Compass size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">HSE Planning</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-indigo-500 pl-4">Lifecycle Management for Governing Protocols</p>
            </div>
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
              <Plus size={20} /> Create PHSP
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Management Plans</h3>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-black uppercase text-indigo-600">
                          <History size={14}/> Version Control Active
                      </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {plans.map(plan => (
                          <div key={plan.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                      <FileText size={28}/>
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-3">
                                          <h4 className="font-black text-slate-800 text-lg tracking-tight uppercase leading-none">{plan.title}</h4>
                                          <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded uppercase">V{plan.version}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{plan.type} • Last sync: {plan.lastUpdated}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6">
                                  <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusStyle(plan.status)}`}>
                                      {plan.status.replace('_', ' ')}
                                  </span>
                                  <button className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-300 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-sm active:scale-95">
                                      <ChevronRight size={24}/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Landmark size={120}/></div>
                  <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] mb-8">Submission Status</h3>
                  <div className="space-y-8">
                      <div className="flex gap-6 items-start border-l-4 border-teal-500/30 pl-6">
                          <div>
                              <p className="text-[10px] font-black text-teal-400 uppercase mb-1">MOHRE Submission</p>
                              <p className="text-sm font-bold text-white">Project 4 PHSP Certified</p>
                              <p className="text-[9px] text-slate-400 uppercase mt-1">20 May 2024</p>
                          </div>
                      </div>
                      <div className="flex gap-6 items-start border-l-4 border-orange-500/30 pl-6">
                          <div>
                              <p className="text-[10px] font-black text-orange-400 uppercase mb-1">OSHAD Verification</p>
                              <p className="text-sm font-bold text-white">NCR-12 Blocking approval</p>
                              <p className="text-[9px] text-slate-400 uppercase mt-1">Awaiting Site Scan</p>
                          </div>
                      </div>
                  </div>
                  <button className="w-full mt-10 bg-teal-500 text-slate-900 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-teal-400 transition shadow-2xl flex items-center justify-center gap-3">
                      Authority Bridge <ArrowUpRight size={16}/>
                  </button>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><UserCheck size={18} className="text-indigo-600"/> Approval Queue</h3>
                  <div className="space-y-4">
                      <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 group hover:border-indigo-500 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] font-black text-indigo-500 uppercase">Awaiting Your Stamp</span>
                              <Clock size={12} className="text-slate-400"/>
                          </div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-snug">Site Induction Protocol V4</p>
                          <div className="mt-4 flex gap-2">
                              <button className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Review</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PlanningModule;