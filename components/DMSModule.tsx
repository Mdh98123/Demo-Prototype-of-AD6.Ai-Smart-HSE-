
import React, { useState, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { HSEDocument, AuditLog } from '../types';
import { extractDocumentData } from '../services/geminiService';
// Added missing Radio to the imports
import { 
  FolderTree, Search, Filter, Plus, FileText, 
  Download, History, Trash2, ShieldCheck, 
  ArrowUpRight, Clock, User, HardHat, FileDigit,
  MoreVertical, Star, LayoutGrid, List, Database, X,
  CheckCircle2, FileWarning, Eye, ArrowRight, ShieldAlert,
  Calendar, Info, UserCircle, Activity, Landmark, Scale, Gavel, ExternalLink,
  Compass, Layout, Radio, Upload, Loader2, Scan
} from 'lucide-react';

const PORTAL_MAPPING = [
    { portal: 'DM iService', authority: 'Dubai Municipality', function: 'NOCs, HSE Plans, Phase Approvals', frequency: 'Per Phase', criticality: 'High' },
    { portal: 'OSHAD eSubmission', authority: 'Abu Dhabi OSHAD', function: 'Incidents, Performance Data, Audit Reports', frequency: 'Monthly/Quarterly', criticality: 'High' },
    { portal: 'MoHRE Digital', authority: 'Federal Labour', function: 'Worker Safety Records, Training Logs', frequency: 'Ongoing/Audit-based', criticality: 'Medium' },
    { portal: 'Trakhees eServices', authority: 'PCFC / EHS', function: 'Operational Permits, Inspection Reports', frequency: 'Activity-based', criticality: 'High' }
];

const DMSModule: React.FC = () => {
  const { currentUser, activeFramework } = useUser();
  const [activeTab, setActiveTab] = useState<'Vault' | 'Portals'>('Vault');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<HSEDocument | null>(null);
  
  // OCR Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<HSEDocument[]>([
    { 
        id: 'HSE-MP-001', title: 'Corporate HSE Management Plan', category: 'Plan', version: '2024.1', status: 'Active', author: 'Dr. Layla Hassan', retentionYears: 'Project Life + 5', criticality: 'High', authority: 'OSHAD', portal: 'eSubmission', regulationRef: 'OSHAD SF Code of Practice v4.0', penaltyRisk: 'AED 5,000–50,000 / Work Stoppage',
        auditLogs: [
            { timestamp: '2024-01-10T09:00:00Z', actorId: 'u2', actorName: 'Dr. Layla Hassan', action: 'Created', details: 'Annual governance alignment update.' },
            { timestamp: '2024-01-20T14:00:00Z', actorId: 'reg-01', actorName: 'OSHAD Inspector', action: 'Verification', details: 'Authorized via eSubmission portal.' }
        ]
    },
    { 
        id: 'RAMS-WAH-102', title: 'Work at Height Method Statement', category: 'RAMS', version: '1.4', status: 'Active', author: 'Marcus Chen', retentionYears: 'Project Life + 5', criticality: 'High', authority: 'DM', portal: 'iService', regulationRef: 'Dubai Municipality Code of Safety Practice', penaltyRisk: 'AED 10,000+ / Criminal Liability for breaches',
        auditLogs: []
    }
  ]);

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || doc.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
  }, [docs, searchTerm, categoryFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          setUploadedFile(base64);
          setIsUploading(true);
          setShowUploadModal(true);
          
          try {
              // Strip prefix for API
              const base64Data = base64.split(',')[1]; 
              const data = await extractDocumentData(base64Data);
              setExtractedData(data);
          } catch (error) {
              alert("Failed to extract document data via AI.");
          } finally {
              setIsUploading(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const handleSaveDocument = () => {
      if (!extractedData) return;
      const newDoc: HSEDocument = {
          id: `DOC-${Date.now()}`,
          title: extractedData.title,
          category: extractedData.category || 'Certificate',
          version: '1.0',
          status: 'Active',
          author: currentUser.name,
          retentionYears: 5,
          criticality: 'Medium',
          authority: extractedData.issuer || 'External',
          portal: 'Digital System',
          regulationRef: extractedData.referenceNumber || 'N/A',
          penaltyRisk: 'Pending Assessment',
          auditLogs: [{
              timestamp: new Date().toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              action: 'Created',
              details: `Uploaded via AI OCR extraction. Source Confidence: ${extractedData.confidence}%`
          }]
      };
      
      setDocs([newDoc, ...docs]);
      setShowUploadModal(false);
      setUploadedFile(null);
      setExtractedData(null);
  };

  const getCriticalityColor = (c: string) => {
      switch(c) {
          case 'High': return 'bg-red-600';
          case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-100';
          default: return 'bg-slate-400';
      }
  };

  const formatDate = (iso: string) => {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GST`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20">
                <FolderTree size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Regulatory DMS</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-slate-900 pl-4">Immutable Evidence & Regulatory Records</p>
            </div>
          </div>
          <div className="flex gap-4 p-1 bg-slate-200 rounded-2xl">
              <button onClick={() => setActiveTab('Vault')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Vault' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Document Vault</button>
              <button onClick={() => setActiveTab('Portals')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Portals' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Portal Mapping</button>
          </div>
      </div>

      {activeTab === 'Portals' ? (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Digital Submission Portals</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Strategic Multi-Authority Gateway Integration</p>
                  </div>
                  <div className="bg-slate-900 text-teal-400 px-5 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <Radio size={16} className="animate-pulse"/> Portal API Active
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                              <th className="px-10 py-6">Portal Name</th>
                              <th className="px-10 py-6">Regulatory Authority</th>
                              <th className="px-10 py-6">Functionality</th>
                              <th className="px-10 py-6">Frequency</th>
                              <th className="px-10 py-6 text-center">Criticality</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {PORTAL_MAPPING.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition group">
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"><ExternalLink size={18}/></div>
                                          <span className="font-black text-slate-800 text-sm uppercase">{p.portal}</span>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-xs font-bold text-slate-600 uppercase">{p.authority}</td>
                                  <td className="px-10 py-8 text-xs font-medium text-slate-500">{p.function}</td>
                                  <td className="px-10 py-8 text--[10px] font-black text-indigo-600 uppercase tracking-widest">{p.frequency}</td>
                                  <td className="px-10 py-8 text-center">
                                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.criticality === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>{p.criticality}</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                        <div className="relative w-full max-w-xl group">
                            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input 
                              type="text" 
                              className="w-full pl-14 pr-8 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all font-bold text-sm shadow-inner" 
                              placeholder="Filter by title, ID or regulation clause..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-900 text-white px-8 py-4 rounded-[2.5rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <Upload size={20} /> Upload & Extract Record
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="bg-white p-7 rounded-[2.5rem] border-2 border-slate-50 hover:border-slate-900 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                                <div className={`absolute top-0 left-0 w-2 h-full ${getCriticalityColor(doc.criticality)}`}></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                        {doc.category === 'Plan' ? <Compass size={24}/> : doc.category === 'RAMS' ? <FileDigit size={24}/> : <FileText size={24}/>}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${doc.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{doc.status}</span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase mt-2">{doc.authority} Portal Target</span>
                                    </div>
                                </div>
                                
                                <h4 className="font-black text-slate-800 text-base uppercase tracking-tight leading-tight mb-4 flex-1 group-hover:text-indigo-600 transition-colors">{doc.title}</h4>
                                
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 mb-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicable Regulation</p>
                                    <p className="text-[11px] font-bold text-slate-700 truncate">{doc.regulationRef}</p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                                        <div className="flex items-center gap-2 font-black text-slate-600"><FileDigit size={12} className="text-slate-400"/> V{doc.version}</div>
                                        <div className="flex items-center gap-2 group-hover:text-slate-900 transition-colors"><Clock size={12} className="text-slate-400"/> {doc.retentionYears} Retention</div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><User size={12} className="text-slate-300"/> {doc.author}</div>
                                        <div className={`px-2 py-0.5 rounded text-[8px] text-white ${getCriticalityColor(doc.criticality)}`}>{doc.criticality} CRITICALITY</div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
                                        <Download size={14}/> Download
                                    </button>
                                    <button 
                                      onClick={() => setSelectedDoc(doc)}
                                      className="p-3.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100 active:scale-95"
                                      title="View Audit Trail & Regulatory DNA"
                                    >
                                        <History size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* OCR EXTRACTION MODAL */}
      {showUploadModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-3xl p-10 flex gap-8 border-4 border-white animate-in zoom-in-95 duration-300">
                  <div className="w-1/2 bg-slate-100 rounded-[2rem] border-2 border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                      {uploadedFile ? (
                          <img src={uploadedFile} className="w-full h-full object-contain" alt="Upload Preview" />
                      ) : (
                          <p>No preview</p>
                      )}
                      {isUploading && (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                              <Scan size={48} className="animate-pulse mb-4 text-teal-400"/>
                              <p className="text-sm font-black uppercase tracking-widest">AI Extracting Data...</p>
                          </div>
                      )}
                  </div>
                  
                  <div className="w-1/2 flex flex-col">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Verify Metadata</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Review AI Extracted Fields</p>
                      
                      {isUploading ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                              <Loader2 className="animate-spin mb-4" size={32}/>
                              <p className="text-xs font-bold uppercase">Processing Document...</p>
                          </div>
                      ) : extractedData ? (
                          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Document Title</label>
                                  <input type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" value={extractedData.title} onChange={(e) => setExtractedData({...extractedData, title: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                                      <input type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" value={extractedData.category} onChange={(e) => setExtractedData({...extractedData, category: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Confidence</label>
                                      <div className="p-4 bg-emerald-50 rounded-2xl text-sm font-black text-emerald-600 border border-emerald-100 text-center">
                                          {extractedData.confidence}% Match
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issuing Authority</label>
                                  <input type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" value={extractedData.issuer} onChange={(e) => setExtractedData({...extractedData, issuer: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference No.</label>
                                      <input type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" value={extractedData.referenceNumber} onChange={(e) => setExtractedData({...extractedData, referenceNumber: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Expiry Date</label>
                                      <input type="date" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" value={extractedData.expiryDate} onChange={(e) => setExtractedData({...extractedData, expiryDate: e.target.value})} />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Summary</label>
                                  <textarea className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 h-24 resize-none" value={extractedData.summary} readOnly />
                              </div>
                          </div>
                      ) : (
                          <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-bold">Extraction Failed</div>
                      )}

                      <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                          <button onClick={() => { setShowUploadModal(false); setUploadedFile(null); setExtractedData(null); }} className="px-6 py-4 rounded-xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50">Discard</button>
                          <button onClick={handleSaveDocument} disabled={!extractedData || isUploading} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50">Confirm & Vault</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] shadow-3xl flex flex-col overflow-hidden border-8 border-white animate-in zoom-in-95 duration-500">
                  <div className="p-12 border-b border-slate-100 bg-white flex justify-between items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600">
                          <History size={320}/>
                      </div>
                      <div className="flex gap-10 relative z-10">
                          <div className={`p-8 rounded-[2.5rem] shadow-2xl text-white ${getCriticalityColor(selectedDoc.criticality)} shadow-slate-900/20`}>
                              <ShieldCheck size={56}/>
                          </div>
                          <div>
                              <div className="flex items-center gap-4 mb-3">
                                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{selectedDoc.title}</h3>
                                  <span className="bg-slate-900 text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-xl border border-slate-100">V{selectedDoc.version}</span>
                              </div>
                              <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                      <Database size={16} className="text-indigo-500"/> ID: {selectedDoc.id}
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                      <UserCircle size={16} className="text-teal-500"/> Author: {selectedDoc.author}
                                  </div>
                              </div>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedDoc(null)}
                        className="p-5 bg-slate-50 rounded-[1.5rem] text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:rotate-90 relative z-10"
                      >
                          <X size={36} />
                      </button>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/20">
                      <div className="w-full md:w-96 p-12 border-r border-slate-100 space-y-12 bg-white overflow-y-auto custom-scrollbar">
                          <div>
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                  <Scale size={18} className="text-indigo-500"/> Regulatory DNA
                              </p>
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-50">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Law / Circular Ref</p>
                                      <p className="text-sm font-black text-slate-800 leading-tight uppercase">{selectedDoc.regulationRef}</p>
                                  </div>
                                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-50">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Submission Portal</p>
                                      <p className="text-sm font-black text-indigo-900 uppercase flex items-center gap-2">
                                          {selectedDoc.authority} {selectedDoc.portal ? `- ${selectedDoc.portal}` : ''} <ExternalLink size={14}/>
                                      </p>
                                  </div>
                                  {selectedDoc.penaltyRisk && (
                                      <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 shadow-sm">
                                          <p className="text-[9px] font-black text-red-600 uppercase mb-2">Non-Compliance Risk</p>
                                          <p className="text-xs font-bold text-red-800 leading-relaxed italic border-l-2 border-red-500 pl-4">
                                              {selectedDoc.penaltyRisk}
                                          </p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                           <div className="flex items-center justify-between mb-12">
                               <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                                   <History size={24} className="text-indigo-600"/> Immutable Audit Log
                               </h4>
                           </div>
                           <div className="relative space-y-12 pl-16">
                               <div className="absolute left-8 top-2 bottom-2 w-1.5 bg-slate-100 z-0"></div>
                               {selectedDoc.auditLogs.map((log, idx) => (
                                   <div key={idx} className="relative z-10 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                       <div className={`absolute -left-16 top-1 w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-xl z-20 transition-all hover:scale-110 ${
                                           log.action === 'Created' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                                       }`}>
                                           <Activity size={24}/>
                                       </div>
                                       <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-xl hover:border-indigo-100 transition-all group">
                                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                                               <div>
                                                   <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border-2 mb-3 inline-block shadow-sm bg-indigo-50 text-indigo-700 border-indigo-100">{log.action}</span>
                                                   <h5 className="text-xl font-black text-slate-800 uppercase tracking-tight">{log.details}</h5>
                                               </div>
                                               <div className="text-right shrink-0">
                                                   <p className="text-[11px] font-black text-slate-900 uppercase">{log.actorName}</p>
                                                   <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{formatDate(log.timestamp)}</p>
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                      </div>
                  </div>
                  
                  <div className="p-10 border-t border-slate-100 flex justify-end gap-6 bg-white shadow-inner relative z-20">
                      <button 
                        onClick={() => setSelectedDoc(null)} 
                        className="px-14 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 shadow-3xl transition-all active:scale-95"
                      >
                        Close Record
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DMSModule;
