import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileSpreadsheet, Lock, Search, PlayCircle, Settings2, Download, AlertTriangle } from 'lucide-react';
import { OshadWorkflowEngine } from '../../services/oshadWorkflowEngine';
import { ImmutableAuditLogger, AuditLogEntry } from '../../services/immutableAuditLogger';
import { OshadReportGenerator } from '../../services/oshadReportGenerator';
import { useLanguage } from '../../contexts/LanguageContext';

export const OshadWorkflowDesigner: React.FC = () => {
   const { dir } = useLanguage();
   const [activeTab, setActiveTab] = useState<'CONFIG' | 'DESIGNER' | 'REPORTS' | 'AUDIT'>('CONFIG');

   // Mock mechanism config state
   const [mechanisms, setMechanisms] = useState([
     { id: 1, title: 'Leadership & Management Accountability', enabled: true, workflows: 2 },
     { id: 2, title: 'Risk Management', enabled: true, workflows: 4 },
     { id: 3, title: 'Management of Contractors', enabled: true, workflows: 1 },
     { id: 7, title: 'Workplace Safety (Inspections)', enabled: true, workflows: 3 },
     { id: 11, title: 'Incident Management', enabled: true, workflows: 5 },
   ]);

   const [auditLogs, setAuditLogs] = useState<any[]>([]);

   useEffect(() => {
     setAuditLogs(ImmutableAuditLogger.getLedger());
   }, [activeTab]);

   const handleToggleMechanism = async (id: number) => {
     const mechanism = mechanisms.find(m => m.id === id);
     if (!mechanism) return;

     const beforeState = { enabled: mechanism.enabled };
     const afterState = { enabled: !mechanism.enabled };

     // Tamper-Evident Audit Logging
     await ImmutableAuditLogger.logAction(
       'TENANT-A', 
       'USER-ADMIN', 
       'UPDATE', 
       'tenant_mechanism_config', 
       `MECH-${id}`, 
       beforeState, 
       afterState
     );

     setMechanisms(mechanisms.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
   };

   return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                   <ShieldCheck className="text-indigo-600" />
                   OSHAD-SF Workflow Engine
                </h1>
                <p className="text-slate-500 font-medium mt-1">Configurable Compliance & Enforcement Architect</p>
             </div>
             
             <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner w-full md:w-auto overflow-x-auto custom-scrollbar">
                {['CONFIG', 'DESIGNER', 'REPORTS', 'AUDIT'].map(tab => (
                    <button 
                       key={tab}
                       onClick={() => setActiveTab(tab as any)}
                       className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'glass-card shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                       {tab === 'CONFIG' ? 'Mechanisms' : tab === 'DESIGNER' ? 'Logic Builder' : tab === 'REPORTS' ? 'SF-7 Exports' : 'Immutable Ledger'}
                    </button>
                ))}
             </div>
        </div>

        {/* TAB 1: Mechanism Feature Flags */}
        {activeTab === 'CONFIG' && (
           <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
              <table className="w-full text-start">
                 <thead className="glass-panel border-b border-slate-200 text-xs uppercase font-black text-slate-500 tracking-widest">
                    <tr>
                       <th className="p-4 ps-6">Mechanism</th>
                       <th className="p-4">Title</th>
                       <th className="p-4">Active Workflows</th>
                       <th className="p-4 pe-6 text-end">Enforcement State</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {mechanisms.map(mech => (
                       <tr key={mech.id} className="hover:glass-button transition-colors">
                          <td className="p-4 ps-6 font-bold text-slate-800">Element {mech.id}</td>
                          <td className="p-4 text-slate-600 font-medium">{mech.title}</td>
                          <td className="p-4">
                             <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{mech.workflows} Logic Blocks</span>
                          </td>
                          <td className="p-4 pe-6 text-end">
                             <button 
                                onClick={() => handleToggleMechanism(mech.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mech.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                             >
                                <span className={`inline-block h-4 w-4 transform rounded-full glass-card transition-transform ${mech.enabled ? (dir === 'rtl' ? '-translate-x-6' : 'translate-x-6') : (dir === 'rtl' ? '-translate-x-1' : 'translate-x-1')}`} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* TAB 2: Drag and Drop Logic Builder Mock */}
        {activeTab === 'DESIGNER' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                 <div className="glass-card p-4 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 space-y-4">
                     <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Triggers & Gates</h3>
                     <div className="p-3 border border-dashed border-slate-300 rounded-xl glass-panel text-sm font-bold text-slate-600 cursor-grab flex items-center gap-2"><PlayCircle size={16}/> Auto-Review Trigger</div>
                     <div className="p-3 border border-amber-300 rounded-xl bg-amber-50 text-sm font-bold text-amber-700 cursor-grab flex items-center gap-2"><AlertTriangle size={16}/> Hard Block Gate</div>
                     <div className="p-3 border border-emerald-300 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 cursor-grab flex items-center gap-2"><Settings2 size={16}/> Custom Condition</div>
                 </div>
                 <div className="glass-panel p-6 rounded-2xl shadow-inner border border-slate-200 lg:col-span-3 min-h-[400px] flex items-center justify-center flex-col relative overflow-hidden text-center">
                      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20"></div>
                      <Settings2 size={48} className="text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700">Drag Elements to Build Flow</h3>
                      <p className="text-slate-500 text-sm mt-2 max-w-sm">Use the visual designer to enforce hard gates on Mechanism 11 incidents or mandate evidence uploads.</p>
                      
                      <div className="mt-8 glass-card p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 w-full max-w-md">
                          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
                          <div className="text-start">
                             <div className="text-sm font-bold text-slate-800">IF: Incident Severity is High</div>
                             <div className="text-xs text-slate-500">THEN: Block submission if "Photos" array is empty.</div>
                          </div>
                      </div>
                 </div>
            </div>
        )}

        {/* TAB 3: Reports */}
        {activeTab === 'REPORTS' && (
           <div className="glass-card p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px] animate-fade-in text-center space-y-6">
               <FileSpreadsheet size={48} className="text-emerald-500" />
               <div>
                  <h2 className="text-xl font-black text-slate-800">Generate Statutory Reports</h2>
                  <p className="text-slate-500 max-w-md mx-auto mt-2">Export your automated workflow data directly into official OSHAD SF-7 formatting required by the Competent Authority.</p>
               </div>
               
               <div className="flex gap-4">
                  <button 
                     onClick={() => OshadReportGenerator.generateSF7Excel({ name: 'Demo Corp LLC', fatalities: 0, lti: 2, ltifr: 0.14 }, 2026)}
                     className="px-6 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl flex items-center gap-2 transition-colors border border-emerald-200"
                  >
                      <FileSpreadsheet size={18} /> Export SF-7 to Excel
                  </button>
                  <button 
                     onClick={() => OshadReportGenerator.generateMechanismConfigPDF(mechanisms.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {}))}
                     className="px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl flex items-center gap-2 transition-colors border border-indigo-200"
                  >
                      <Download size={18} /> Download Audit PDF
                  </button>
               </div>
           </div>
        )}

        {/* TAB 4: Immutable Ledger Log */}
        {activeTab === 'AUDIT' && (
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-fade-in text-slate-300 font-mono text-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2"><Lock size={14} className="text-emerald-500" /> Secure Append-Only Ledger</div>
                    <div>{auditLogs.length} Records Verified</div>
                </div>
                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {auditLogs.length === 0 ? (
                       <div className="text-slate-500 text-center py-8">Ledger is currently empty. Make a change in the Config tab to mint a transaction log.</div>
                    ) : (
                       auditLogs.map((log) => (
                           <div key={log.sequenceId} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-2">
                               <div className="flex justify-between items-center text-xs mb-2">
                                  <span className="text-emerald-400 font-black">TX_{log.sequenceId.toString().padStart(4, '0')}</span>
                                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                               </div>
                               <div><span className="text-indigo-400">ACTION:</span> {log.actionType} ON <span className="text-amber-400">{log.targetTable}</span> ({log.targetId})</div>
                               <div className="grid grid-cols-2 gap-4 mt-2 p-2 bg-slate-900 rounded-lg">
                                  <div>
                                     <div className="text-[10px] text-slate-500 mb-1">PREVIOUS SHA-256 HASH</div>
                                     <div className="text-xs truncate">{log.previousHash}</div>
                                  </div>
                                  <div>
                                     <div className="text-[10px] text-slate-500 mb-1">RECORD VERIFICATION HASH</div>
                                     <div className="text-xs truncate text-emerald-500">{log.recordHash}</div>
                                  </div>
                               </div>
                           </div>
                       ))
                    )}
                </div>
            </div>
        )}

    </div>
   );
};
