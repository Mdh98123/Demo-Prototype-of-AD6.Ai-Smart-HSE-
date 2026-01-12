
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Audit, AuditFinding, AuditLog, InspectionItem } from '../types';
import { generateAuditChecklist, generateAuditReportSummary, suggestAuditFinding } from '../services/geminiService';
import { 
  ShieldCheck, Loader2, Plus, Calendar, MapPin, FileText, 
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, Search, 
  Filter, MoreHorizontal, History, Save, Send, BrainCircuit,
  ClipboardList
} from 'lucide-react';

const AuditModule: React.FC = () => {
  const { currentUser } = useUser();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [viewState, setViewState] = useState<'List' | 'Detail'>('List');
  const [loading, setLoading] = useState(false);
  const [qaComment, setQaComment] = useState<Record<string, string>>({}); // FindingId -> Comment

  // Initialization
  useEffect(() => {
    const savedAudits = localStorage.getItem('hse_audits');
    if (savedAudits) {
      setAudits(JSON.parse(savedAudits));
    } else {
        // Mock data
        const initialAudits: Audit[] = [
            {
                id: 'AUD-2024-001',
                title: 'Q2 Compliance Audit - Zone A',
                standard: 'ISO 45001',
                location: 'Ruwais Refinery',
                scheduledDate: '2024-05-15',
                auditorId: 'u12',
                auditorName: 'Alice Smith',
                status: 'In Progress',
                score: 85,
                findings: [
                    {
                        id: 'F-001',
                        checklistRefId: 'CHK-10',
                        description: 'Fire extinguisher blocked by pallet.',
                        location: 'Warehouse B',
                        category: 'Major',
                        severity: 'Major',
                        status: 'Open',
                        correctiveAction: 'Move pallet immediately.',
                        ncrStatement: 'Violation of Fire Safety Code 10.2',
                        rootCause: 'Lack of storage space planning',
                        preventiveAction: 'Designate clear zones',
                        suggestedPPE: [],
                        dueDate: '2024-05-16',
                        history: []
                    }
                ],
                checklist: []
            }
        ];
        setAudits(initialAudits);
        localStorage.setItem('hse_audits', JSON.stringify(initialAudits));
    }
  }, []);

  const saveAudits = (updatedAudits: Audit[]) => {
      setAudits(updatedAudits);
      localStorage.setItem('hse_audits', JSON.stringify(updatedAudits));
  };

  const updateFindingStatus = (findingId: string, status: AuditFinding['status'], comment?: string, auditId?: string) => {
      const targetId = auditId || selectedAudit?.id;
      if (!targetId) return;
      const auditToUpdate = audits.find(a => a.id === targetId);
      if (!auditToUpdate) return;
      
      const updatedFindings = auditToUpdate.findings.map(f => {
          if (f.id === findingId) {
              const oldStatus = f.status;
              const logEntry: AuditLog = {
                  timestamp: new Date().toISOString(),
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  action: 'Status Update',
                  details: `Status transitioned from '${oldStatus}' to '${status}'. ${comment ? `Reviewer Note: ${comment}` : ''}`
              };
              return { 
                  ...f, 
                  status, 
                  reviewerComment: comment || f.reviewerComment,
                  history: [...(f.history || []), logEntry]
              };
          }
          return f;
      });

      const updatedAudit = { ...auditToUpdate, findings: updatedFindings };
      if (selectedAudit?.id === targetId) setSelectedAudit(updatedAudit);
      saveAudits(audits.map(a => a.id === updatedAudit.id ? updatedAudit : a));
      
      // Clear comment buffer if used
      if (comment) {
          const newComments = { ...qaComment };
          delete newComments[findingId];
          setQaComment(newComments);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex items-center space-x-6 mb-6">
            <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl">
                <ShieldCheck size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Audit Management</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Internal & Regulatory Compliance Audits</p>
            </div>
        </div>

        {viewState === 'List' ? (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Audits</h3>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Plus size={16}/> New Audit
                    </button>
                </div>
                <div className="divide-y divide-slate-50">
                    {audits.map(audit => (
                        <div key={audit.id} className="p-8 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedAudit(audit); setViewState('Detail'); }}>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <ClipboardList size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{audit.title}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {audit.location}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {audit.scheduledDate}</span>
                                        <span>{audit.standard}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        audit.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        audit.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>{audit.status}</span>
                                    {audit.score && <p className="text-lg font-black text-slate-800 mt-1">{audit.score}% Score</p>}
                                </div>
                                <ChevronRight size={20} className="text-slate-300"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            selectedAudit && (
                <div className="space-y-8">
                    <button onClick={() => setViewState('List')} className="text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                        <ChevronRight size={14} className="rotate-180"/> Back to Audits
                    </button>
                    
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">{selectedAudit.standard}</span>
                                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mt-4">{selectedAudit.title}</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2">Lead Auditor: {selectedAudit.auditorName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Score</p>
                                <p className="text-5xl font-black text-slate-800 tracking-tighter">{selectedAudit.score || 0}%</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Non-Conformance Registry</h4>
                            {selectedAudit.findings.map(finding => (
                                <div key={finding.id} className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                finding.severity === 'Major' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>{finding.severity}</span>
                                            <span className="text-xs font-black text-slate-700">{finding.category} Finding</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase ${
                                            finding.status === 'Closed' ? 'text-emerald-600' : 'text-indigo-600'
                                        }`}>{finding.status}</span>
                                    </div>
                                    
                                    <p className="text-sm font-bold text-slate-800 mb-2">"{finding.description}"</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Root Cause</p>
                                            <p className="text-xs font-medium text-slate-600">{finding.rootCause}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Corrective Action</p>
                                            <p className="text-xs font-medium text-slate-600">{finding.correctiveAction}</p>
                                        </div>
                                    </div>

                                    {finding.status !== 'Closed' && (
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reviewer Comment</label>
                                            <div className="flex gap-4">
                                                <input 
                                                    type="text" 
                                                    className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-500 outline-none"
                                                    placeholder="Add verification notes..."
                                                    value={qaComment[finding.id] || ''}
                                                    onChange={(e) => setQaComment({...qaComment, [finding.id]: e.target.value})}
                                                />
                                                <button 
                                                    onClick={() => updateFindingStatus(finding.id, 'Closed', qaComment[finding.id])}
                                                    className="bg-emerald-600 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
                                                >
                                                    Close Finding
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {selectedAudit.findings.length === 0 && (
                                <div className="text-center py-10 text-slate-400 italic text-xs font-bold uppercase tracking-widest">No findings recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            )
        )}
    </div>
  );
};

export default AuditModule;
