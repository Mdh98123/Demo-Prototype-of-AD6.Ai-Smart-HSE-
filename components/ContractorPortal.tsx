
import { AITag } from './AITag';
import React, { useState, useMemo } from 'react';
import { assessContractorRisk } from '../services/geminiService';
import { Contractor } from '../types';
// Added missing BrainCircuit and MapPin imports from lucide-react
import { 
  Users, ShieldCheck, Loader2, Sparkles, AlertTriangle, 
  ExternalLink, Search, Filter, CheckCircle, XCircle,
  FileText, Calendar, Clock, Download, Plus, Trash2, Shield,
  History, Briefcase, ChevronRight, Eye, MoreVertical,
  BrainCircuit, MapPin
} from 'lucide-react';

const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: 'V-101',
    name: 'Global Heavy Lifting Co 1',
    category: 'Crane Operations',
    riskScore: 52,
    complianceStatus: 'Suspended',
    personnelCount: 39,
    documents: []
  },
  {
    id: 'V-102',
    name: 'Global Heavy Lifting Co 2',
    category: 'Crane Operations',
    riskScore: 40,
    complianceStatus: 'Probation',
    personnelCount: 50,
    documents: []
  },
  {
    id: 'V-103',
    name: 'Global Heavy Lifting Co 3',
    category: 'Crane Operations',
    riskScore: 36,
    complianceStatus: 'Probation',
    personnelCount: 90,
    documents: []
  },
  {
    id: 'V-104',
    name: 'Global Heavy Lifting Co 4',
    category: 'Crane Operations',
    riskScore: 29,
    complianceStatus: 'Active',
    personnelCount: 96,
    documents: []
  },
  {
    id: 'V-105',
    name: 'Global Heavy Lifting Co 5',
    category: 'Crane Operations',
    riskScore: 55,
    complianceStatus: 'Probation',
    personnelCount: 18,
    documents: []
  },
  {
    id: 'V-106',
    name: 'Global Heavy Lifting Co 6',
    category: 'Crane Operations',
    riskScore: 14,
    complianceStatus: 'Suspended',
    personnelCount: 29,
    documents: []
  },
  {
    id: 'V-107',
    name: 'Global Heavy Lifting Co 7',
    category: 'Crane Operations',
    riskScore: 10,
    complianceStatus: 'Suspended',
    personnelCount: 42,
    documents: []
  },
  {
    id: 'V-108',
    name: 'Global Heavy Lifting Co 8',
    category: 'Crane Operations',
    riskScore: 11,
    complianceStatus: 'Active',
    personnelCount: 37,
    documents: []
  },
  {
    id: 'V-109',
    name: 'Global Heavy Lifting Co 9',
    category: 'Crane Operations',
    riskScore: 10,
    complianceStatus: 'Active',
    personnelCount: 102,
    documents: []
  },
  {
    id: 'V-1010',
    name: 'Global Heavy Lifting Co 10',
    category: 'Crane Operations',
    riskScore: 14,
    complianceStatus: 'Suspended',
    personnelCount: 103,
    documents: []
  },
  {
    id: 'V-1011',
    name: 'Global Heavy Lifting Co 11',
    category: 'Crane Operations',
    riskScore: 10,
    complianceStatus: 'Active',
    personnelCount: 64,
    documents: []
  },
  {
    id: 'V-1012',
    name: 'Global Heavy Lifting Co 12',
    category: 'Crane Operations',
    riskScore: 26,
    complianceStatus: 'Probation',
    personnelCount: 100,
    documents: []
  },
  {
    id: 'V-1013',
    name: 'Global Heavy Lifting Co 13',
    category: 'Crane Operations',
    riskScore: 21,
    complianceStatus: 'Suspended',
    personnelCount: 108,
    documents: []
  },
  {
    id: 'V-1014',
    name: 'Global Heavy Lifting Co 14',
    category: 'Crane Operations',
    riskScore: 33,
    complianceStatus: 'Probation',
    personnelCount: 21,
    documents: []
  },
  {
    id: 'V-1015',
    name: 'Global Heavy Lifting Co 15',
    category: 'Crane Operations',
    riskScore: 58,
    complianceStatus: 'Active',
    personnelCount: 50,
    documents: []
  }
];

const ContractorPortal: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [riskData, setRiskData] = useState<{ score: number; riskLevel: string; findings: string[] } | null>(null);
  const [activeView, setActiveView] = useState<'Intelligence' | 'Documents'>('Intelligence');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContractors = useMemo(() => {
    return MOCK_CONTRACTORS.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAssess = async (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setLoading(true);
    setRiskData(null);
    setActiveView('Intelligence');
    try {
      const result = await assessContractorRisk(contractor.name, ['Minor near-miss history', 'Training gap in H2S awareness'], contractor.documents);
      setRiskData(result);
    } catch (e) {
      alert("Risk assessment failed.");
    } finally {
      setLoading(false);
    }
  };

  const getDocStatusStyle = (status: string) => {
      return status === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-x-5">
            <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                <Users size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Contractor Registry</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-indigo-500 ps-4">AI Pre-qualification & Regulatory Document Vault</p>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100 h-[calc(100vh-250px)] flex flex-col">
                  <div className="relative group mb-6">
                      <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"/>
                      <input 
                        type="text" 
                        placeholder="Search vendors..." 
                        className="w-full ps-12 pe-4 py-4 glass-panel border-2 border-slate-50 rounded-2xl outline-none focus:glass-card focus:border-indigo-500 transition-all font-bold text-sm shadow-inner" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pe-2 custom-scrollbar">
                      {filteredContractors.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => handleAssess(c)} 
                            className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer hover:shadow-lg ${selectedContractor?.id === c.id ? 'border-indigo-500 bg-indigo-50/20 ring-4 ring-indigo-50' : 'border-slate-50 glass-card hover:border-slate-200'}`}
                          >
                              <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                      <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm leading-tight">{c.name}</h4>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Briefcase size={10} className="text-slate-400"/>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{c.category}</span>
                                      </div>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 shadow-sm ${
                                      c.complianceStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                      c.complianceStatus === 'Suspended' ? 'bg-red-50 text-red-700 border-red-100' :
                                      'bg-orange-50 text-orange-700 border-orange-100'
                                  }`}>{c.complianceStatus}</span>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                      <Users size={12} className="text-slate-300"/>
                                      <span className="text-[10px] font-bold text-slate-500">{c.personnelCount} Crew</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <ShieldCheck size={12} className="text-slate-300"/>
                                      <span className="text-[10px] font-bold text-slate-500">{c.documents.length} Docs</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-8">
              {loading ? (
                  <div className="glass-card h-full min-h-[500px] rounded-[3rem] flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500 border border-slate-100 shadow-inner">
                      <div className="relative">
                          <Loader2 className="animate-spin text-indigo-500 mb-6" size={64} />
                          <BrainCircuit className="absolute inset-0 m-auto text-indigo-300" size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Profiling HSE Integrity</h3>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-4">Cross-referencing Regulatory Evidence...</p>
                  </div>
              ) : selectedContractor ? (
                  <div className="space-y-6">
                      {/* Detail Header & Nav */}
                      <div className="glass-card p-8 rounded-[3rem] shadow-xl border border-slate-50 relative overflow-hidden">
                           <div className="flex justify-between items-start mb-10">
                               <div className="flex items-center gap-6">
                                   <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-2xl">
                                       {selectedContractor.name.charAt(0)}
                                   </div>
                                   <div>
                                       <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{selectedContractor.name}</h3>
                                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                           <MapPin size={12} className="text-teal-500"/> {selectedContractor.category} Sector • Site ID: {selectedContractor.id}
                                       </p>
                                   </div>
                               </div>
                               <button className="p-3 glass-panel rounded-2xl text-slate-300 hover:text-slate-600 transition-colors">
                                   <MoreVertical size={24} />
                               </button>
                           </div>

                           <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
                               <button 
                                 onClick={() => setActiveView('Intelligence')}
                                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'Intelligence' ? 'glass-card text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                               >
                                   <Sparkles size={16}/> AI Intelligence
                               </button>
                               <button 
                                 onClick={() => setActiveView('Documents')}
                                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'Documents' ? 'glass-card text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                               >
                                   <FileText size={16}/> Regulatory Vault
                                   <span className={`px-2 py-0.5 rounded-full text-[9px] ${selectedContractor.documents.some(d => d.status === 'Expired') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                       {selectedContractor.documents.length}
                                   </span>
                               </button>
                           </div>
                      </div>

                      {activeView === 'Intelligence' && riskData && (
                          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl animate-in slide-in-from-end-8 duration-500 relative overflow-hidden">
                              <div className="absolute top-0 end-0 p-10 opacity-5 text-indigo-400 pointer-events-none transform translate-x-12 -translate-y-12"><Shield size={320} /></div>
                              <div className="flex justify-between items-start mb-12 relative z-10 border-b border-white/10 pb-10">
                                  <div>
                                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">HSE Defensibility Audit</p>
                                      <h3 className="text-3xl font-black uppercase tracking-tighter">Strategic Compliance Profile</h3>
                                  </div>
                                  <div className="text-end">
                                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aggregate Score</p>
                                      <div className={`text-6xl font-black tracking-tighter ${riskData.score > 80 ? 'text-emerald-400' : riskData.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{riskData.score}%</div>
                                  </div>
                              </div>

                              <div className="space-y-8 relative z-10">
                                  <div className="glass-card/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
                                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><CheckCircle size={18}/> Pre-Qualification Executive Summary</p>
                                      <div className="grid gap-4">
                                          {riskData.findings.map((f, i) => (
                                              <div key={i} className="text-sm font-bold text-slate-200 flex items-start gap-4 glass-card/5 p-4 rounded-2xl border border-white/5 group hover:glass-card/10 transition-all">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                                  {f}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  <div className="flex gap-6">
                                      <button className="flex-1 glass-card text-slate-900 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-400 transition shadow-3xl active:scale-95 flex items-center justify-center gap-4 group">
                                          Authorize Official Deployment <ShieldCheck size={24} className="group-hover:rotate-12 transition-transform"/>
                                      </button>
                                      <button className="px-10 bg-red-600/20 text-red-500 py-6 rounded-[2.5rem] border-2 border-red-500/30 font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-3 active:scale-95">
                                          Escalate Risk <AlertTriangle size={20}/>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeView === 'Documents' && (
                          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                              <div className="glass-card p-8 rounded-[3rem] shadow-xl border border-slate-100">
                                  <div className="flex justify-between items-center mb-8">
                                      <div>
                                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Compliance Documents</h3>
                                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Immutable Evidence Trail • GST Sync Active</p>
                                      </div>
                                      <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95">
                                          <Plus size={18}/> Upload New Evidence
                                      </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {selectedContractor.documents.map((doc, idx) => (
                                          <div key={idx} className={`p-6 rounded-[2rem] border-2 glass-card shadow-lg transition-all group relative overflow-hidden ${
                                              doc.status === 'Expired' ? 'border-red-100 hover:border-red-200' : 'border-slate-50 hover:border-indigo-100'
                                          }`}>
                                              <div className="flex justify-between items-start mb-6">
                                                  <div className={`p-4 rounded-2xl shrink-0 ${
                                                      doc.status === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                                                  }`}>
                                                      <FileText size={24} />
                                                  </div>
                                                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getDocStatusStyle(doc.status)}`}>
                                                      {doc.status}
                                                  </span>
                                              </div>

                                              <div>
                                                  <h4 className="font-black text-slate-800 text-base tracking-tight uppercase mb-4">{doc.type}</h4>
                                                  
                                                  <div className="space-y-3">
                                                      <div className="flex items-center justify-between p-3 glass-panel rounded-xl border border-slate-100">
                                                          <div className="flex items-center gap-2">
                                                              <Calendar size={14} className="text-slate-400"/>
                                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regulatory Expiry</span>
                                                          </div>
                                                          <span className={`text-xs font-black font-mono ${doc.status === 'Expired' ? 'text-red-600' : 'text-slate-700'}`}>{doc.expiryDate}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between p-3 glass-panel rounded-xl border border-slate-100">
                                                          <div className="flex items-center gap-2">
                                                              <Clock size={14} className="text-slate-400"/>
                                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Verified</span>
                                                          </div>
                                                          <span className="text-[10px] font-bold text-slate-500 uppercase">48h Ago</span>
                                                      </div>
                                                  </div>
                                              </div>

                                              <div className="mt-6 flex gap-2">
                                                  <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                                      <Eye size={14}/> View
                                                  </button>
                                                  <button className="glass-panel text-slate-400 p-3 rounded-xl border border-slate-100 hover:text-red-500 hover:border-red-100 transition-all">
                                                      <Trash2 size={14}/>
                                                  </button>
                                              </div>
                                          </div>
                                      ))}

                                      <div className="border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center glass-panel/30 group cursor-pointer hover:border-indigo-200 transition-all">
                                          <div className="glass-card p-5 rounded-full shadow-sm mb-4 group-hover:bg-indigo-50 transition-colors">
                                              <Plus size={32} className="text-slate-300 group-hover:text-indigo-600"/>
                                          </div>
                                          <h4 className="text-base font-black text-slate-400 uppercase tracking-tight">Add Certification</h4>
                                          <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Training records, medical fit, etc.</p>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden">
                                  <div className="absolute top-0 end-0 p-8 opacity-10"><Shield size={120}/></div>
                                  <h4 className="text-lg font-black text-teal-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                      <History size={24}/> Audit Integrity Log
                                  </h4>
                                  <div className="space-y-4">
                                      {[
                                          { action: 'Doc Verification', details: 'Trade License verified against DED portal', timestamp: '2024-05-20 09:00 GST' },
                                          { action: 'Expiry Alert', details: 'Automated notification sent to vendor for Insurance renewal', timestamp: '2024-05-18 14:20 GST' }
                                      ].map((log, i) => (
                                          <div key={i} className="flex gap-6 items-start border-s-4 border-teal-500/30 ps-6 py-2">
                                              <div className="flex-1">
                                                  <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{log.action}</span>
                                                  <p className="text-sm font-bold text-slate-300 mt-1 leading-relaxed italic">"{log.details}"</p>
                                                  <p className="text-[9px] font-mono text-slate-500 mt-2 uppercase tracking-tighter">{log.timestamp}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="glass-card border-2 border-dashed border-slate-100 rounded-[3rem] h-full min-h-[500px] flex flex-col items-center justify-center text-center p-16 shadow-inner animate-in fade-in duration-500">
                      <div className="glass-panel p-12 rounded-full mb-8 shadow-inner animate-pulse border border-slate-100">
                          <Users size={80} className="opacity-20 text-slate-400" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Vendor Workspace Offline</h3>
                      <p className="max-w-md mx-auto text-sm mt-4 font-medium text-slate-500 leading-relaxed italic">
                        Select a partner organization from the registry to activate AI risk profiling and the Regulatory Document Vault.
                      </p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ContractorPortal;
