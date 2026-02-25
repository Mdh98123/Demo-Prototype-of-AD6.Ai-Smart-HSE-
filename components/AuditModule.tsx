import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Audit, AuditFinding, AuditLog, InspectionItem } from '../types';
import { generateAuditChecklist, generateAuditReportSummary, suggestAuditFinding } from '../services/geminiService';
import { 
  ShieldCheck, Loader2, Plus, Calendar, MapPin, FileText, 
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, Search, 
  Filter, MoreHorizontal, History, Save, Send, BrainCircuit,
  ClipboardList, ArrowLeft, Download
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
            },
            {
                id: 'AUD-2024-002',
                title: 'Environmental Impact Assessment',
                standard: 'ISO 14001',
                location: 'Habshan Complex',
                scheduledDate: '2024-04-10',
                auditorId: 'u10',
                auditorName: 'Khalid Al-Dhaheri',
                status: 'Completed',
                score: 92,
                findings: [],
                checklist: []
            },
            {
                id: 'AUD-2024-003',
                title: 'Contractor Safety Review',
                standard: 'OSHAD SF',
                location: 'Site C - Construction',
                scheduledDate: '2024-06-01',
                auditorId: 'u12',
                auditorName: 'Alice Smith',
                status: 'Planned',
                findings: [],
                checklist: []
            }
        ];
        setAudits(initialAudits);
        localStorage.setItem('hse_audits', JSON.stringify(initialAudits));
    }
  }, []);

  const handleSelectAudit = (audit: Audit) => {
      setSelectedAudit(audit);
      setViewState('Detail');
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
          case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'Planned': return 'bg-slate-50 text-slate-600 border-slate-200';
          default: return 'bg-slate-50 text-slate-600';
      }
  };

  const handleGenerateChecklist = async () => {
      if (!selectedAudit) return;
      setLoading(true);
      try {
          // Simulate AI call
          const items = await generateAuditChecklist(selectedAudit.standard, selectedAudit.location);
          const updatedAudit = { ...selectedAudit, checklist: items };
          const updatedList = audits.map(a => a.id === selectedAudit.id ? updatedAudit : a);
          setAudits(updatedList);
          setSelectedAudit(updatedAudit);
          localStorage.setItem('hse_audits', JSON.stringify(updatedList));
      } catch (e) {
          alert("Failed to generate checklist");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {viewState === 'List' && (
          <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-5">
                      <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                          <ShieldCheck size={32} />
                      </div>
                      <div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Internal Audit</h2>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-indigo-500 pl-4">Compliance Assurance & Verification</p>
                      </div>
                  </div>
                  <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition active:scale-95">
                      <Plus size={18}/> Schedule Audit
                  </button>
              </div>

              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Audit Schedule</h3>
                      <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><Filter size={18}/></button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><Search size={18}/></button>
                      </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {audits.map(audit => (
                          <div key={audit.id} onClick={() => handleSelectAudit(audit)} className="p-8 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-6">
                                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-lg font-black ${
                                          audit.score && audit.score >= 90 ? 'bg-emerald-100 text-emerald-600' :
                                          audit.score && audit.score >= 70 ? 'bg-orange-100 text-orange-600' :
                                          'bg-slate-100 text-slate-400'
                                      }`}>
                                          {audit.score ? `${audit.score}%` : '-'}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-3 mb-1">
                                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(audit.status)}`}>
                                                  {audit.status}
                                              </span>
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{audit.standard}</span>
                                          </div>
                                          <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{audit.title}</h4>
                                          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                                              <span className="flex items-center gap-1"><MapPin size={12}/> {audit.location}</span>
                                              <span className="flex items-center gap-1"><Calendar size={12}/> {audit.scheduledDate}</span>
                                              <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Auditor: {audit.auditorName}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-end">
                                      <ChevronRight size={24} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {viewState === 'Detail' && selectedAudit && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <button onClick={() => setViewState('List')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-widest mb-4">
                  <ArrowLeft size={14}/> Back to Registry
              </button>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                      <div>
                          <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(selectedAudit.status)}`}>
                                  {selectedAudit.status}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <FileText size={12}/> {selectedAudit.id}
                              </span>
                          </div>
                          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">{selectedAudit.title}</h2>
                          <p className="text-sm font-medium text-slate-500">{selectedAudit.standard} • {selectedAudit.location}</p>
                      </div>
                      <div className="flex gap-3">
                          <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition flex items-center gap-2">
                              <Download size={14}/> Report
                          </button>
                          {selectedAudit.status !== 'Completed' && (
                              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg active:scale-95">
                                  <Save size={14}/> Save Progress
                              </button>
                          )}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                          <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                              <div className="flex justify-between items-center mb-6">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                      <ClipboardList size={16}/> Audit Checklist
                                  </h4>
                                  {!selectedAudit.checklist?.length && (
                                      <button 
                                        onClick={handleGenerateChecklist}
                                        disabled={loading}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1 disabled:opacity-50"
                                      >
                                          {loading ? <Loader2 size={12} className="animate-spin"/> : <BrainCircuit size={12}/>} 
                                          Generate Protocol
                                      </button>
                                  )}
                              </div>
                              
                              {selectedAudit.checklist && selectedAudit.checklist.length > 0 ? (
                                  <div className="space-y-3">
                                      {selectedAudit.checklist.map((item, idx) => (
                                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start justify-between group hover:border-indigo-100 transition-colors">
                                              <div className="flex items-start gap-3">
                                                  <div className="mt-1 w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                      {idx + 1}
                                                  </div>
                                                  <div>
                                                      <p className="text-sm font-bold text-slate-700">{item.question}</p>
                                                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">{item.regulationReference}</p>
                                                  </div>
                                              </div>
                                              <div className="flex gap-1">
                                                  <button className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">Pass</button>
                                                  <button className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-red-50 text-red-600 hover:bg-red-100 transition">Fail</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="text-center py-12 text-slate-400">
                                      <FileText size={48} className="mx-auto mb-4 opacity-20"/>
                                      <p className="text-xs font-bold uppercase tracking-widest">No checklist items generated.</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-10"><AlertTriangle size={100}/></div>
                              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 relative z-10">
                                  Findings Summary
                              </h4>
                              {selectedAudit.findings.length > 0 ? (
                                  <div className="space-y-4 relative z-10">
                                      {selectedAudit.findings.map(finding => (
                                          <div key={finding.id} className="bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors cursor-pointer">
                                              <div className="flex justify-between items-start mb-2">
                                                  <span className="text-[10px] font-black uppercase text-red-400 bg-red-900/30 px-2 py-0.5 rounded">{finding.severity}</span>
                                                  <span className="text-[10px] font-mono text-slate-400">{finding.id}</span>
                                              </div>
                                              <p className="text-xs font-bold text-slate-200 line-clamp-2">{finding.description}</p>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <p className="text-xs text-slate-500 font-medium italic relative z-10">No findings recorded yet.</p>
                              )}
                              <button className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition shadow-lg active:scale-95 flex items-center justify-center gap-2 relative z-10">
                                  <Plus size={14}/> Add Finding
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AuditModule;