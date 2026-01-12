
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { AuditLogger } from '../services/auditLogger';
import { GlobalAuditLog } from '../types';
import { 
  ShieldCheck, Users, KeyRound, Database, History, 
  Settings, Lock, ShieldPlus, Fingerprint, Activity,
  ChevronRight, Search, Filter, MoreVertical, Shield,
  Zap, AlertTriangle, CheckCircle2, UserCheck, Eye,
  LockKeyhole, Globe, Terminal, Info, Trash2
} from 'lucide-react';

const GovernanceModule: React.FC = () => {
  const { currentUser, users } = useUser();
  const [activeTab, setActiveTab] = useState<'Identity' | 'System' | 'Audit'>('Identity');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<GlobalAuditLog[]>([]);

  useEffect(() => {
      const fetchLogs = async () => {
          const logs = await AuditLogger.getLogs();
          setAuditLogs(logs);
      };
      fetchLogs();
  }, [activeTab]);

  if (currentUser.role !== 'ADMIN') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-6">
              <div className="p-8 bg-red-50 text-red-600 rounded-full border-4 border-dashed border-red-100 animate-pulse">
                  <Lock size={64}/>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Access Restriction</h3>
                <p className="text-slate-500 font-medium max-w-md mt-2">This terminal is restricted to accounts with System Governance privileges only.</p>
              </div>
          </div>
      );
  }

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                <ShieldPlus size={36} />
            </div>
            <div className="text-start">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">System Governance</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-indigo-600 pl-4">Administrative Policy & Lifecycle Management</p>
            </div>
          </div>
          <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
              {['Identity', 'System', 'Audit'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {activeTab === 'Identity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                          <div className="relative w-full max-w-lg">
                              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input 
                                type="text" 
                                placeholder="Search Identity Registry..." 
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-sm shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                          <div className="flex gap-4">
                             <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 active:scale-95 transition-all">
                                <Users size={18}/> Provision User
                             </button>
                          </div>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead>
                                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                      <th className="px-8 py-6">User Identity</th>
                                      <th className="px-8 py-6">Role / Privilege</th>
                                      <th className="px-8 py-6">Status</th>
                                      <th className="px-8 py-6 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-start">
                                  {filteredUsers.map(user => (
                                      <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                                          <td className="px-8 py-8">
                                              <div className="flex items-center gap-5">
                                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                      {user.name.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <p className="text-base font-black text-slate-800 uppercase tracking-tight leading-none">{user.name}</p>
                                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{user.department}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-8 py-8">
                                              <div className="flex items-center gap-3">
                                                  <KeyRound size={14} className="text-indigo-600"/>
                                                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{user.role.replace(/_/g, ' ')}</span>
                                              </div>
                                          </td>
                                          <td className="px-8 py-8">
                                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest shadow-sm">Verified</span>
                                          </td>
                                          <td className="px-8 py-8 text-right">
                                              <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18}/></button>
                                                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-8 text-start">
                  <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden flex flex-col group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400 group-hover:scale-110 transition-transform duration-1000"><LockKeyhole size={180}/></div>
                      <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                          <Fingerprint size={18}/> RBAC Control Engine
                      </h3>
                      <div className="space-y-6 relative z-10 flex-1">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Policy Distribution</p>
                              <div className="flex justify-between items-end mb-2">
                                  <p className="text-sm font-bold">Standard Roles</p>
                                  <p className="text-lg font-black">12</p>
                              </div>
                              <div className="flex justify-between items-end">
                                  <p className="text-sm font-bold">Custom Overrides</p>
                                  <p className="text-lg font-black text-orange-400">03</p>
                              </div>
                          </div>
                          <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-start gap-4">
                              <Info size={18} className="text-teal-400 shrink-0 mt-1"/>
                              <p className="text-[10px] text-teal-100 font-medium leading-relaxed uppercase tracking-wide">
                                  All identity lifecycle actions are cryptographically hashed and mirrored to the regulatory audit log.
                              </p>
                          </div>
                      </div>
                      <button className="w-full mt-10 bg-white text-slate-900 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-teal-400 transition-all shadow-3xl active:scale-95">
                          Configure Role Matrix
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Audit' && (
          <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500 text-start">
               <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Centralized Audit Ledger</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-[0.2em]">Immutable Record of All System Actions</p>
                  </div>
                  <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all"><History size={24}/></button>
              </div>
              <div className="overflow-x-auto">
                   <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                           <tr>
                               <th className="px-10 py-6">Timestamp</th>
                               <th className="px-10 py-6">Actor</th>
                               <th className="px-10 py-6">Action</th>
                               <th className="px-10 py-6">Resource</th>
                               <th className="px-10 py-6 text-right">Integrity</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {auditLogs.map((log) => (
                               <tr key={log.id} className="hover:bg-slate-50/50 transition">
                                   <td className="px-10 py-8 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                   <td className="px-10 py-8">
                                       <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.actorName}</p>
                                       <p className="text-[9px] text-slate-400 uppercase tracking-widest">{log.actorRole.replace(/_/g, ' ')}</p>
                                   </td>
                                   <td className="px-10 py-8">
                                       <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded-lg border border-indigo-100">{log.action}</span>
                                   </td>
                                   <td className="px-10 py-8 text-xs font-bold text-slate-500 uppercase">{log.resourceType}: {log.resourceId}</td>
                                   <td className="px-10 py-8 text-right">
                                       <div className="flex items-center justify-end gap-2 text-[10px] font-black text-emerald-600 uppercase">
                                           <ShieldCheck size={14}/> Verified
                                       </div>
                                   </td>
                               </tr>
                           ))}
                           {auditLogs.length === 0 && (
                               <tr><td colSpan={5} className="px-10 py-12 text-center text-slate-300 italic font-medium uppercase tracking-widest">No audit records found</td></tr>
                           )}
                       </tbody>
                   </table>
              </div>
          </div>
      )}
    </div>
  );
};

const Edit3 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
);

const ArrowLeft = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

export default GovernanceModule;
