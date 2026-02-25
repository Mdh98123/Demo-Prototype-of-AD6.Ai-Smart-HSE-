
import React, { useState, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { HSEDocument, AuditLog } from '../types';
import { extractDocumentData } from '../services/geminiService';
import { 
  FolderTree, Search, Filter, Plus, FileText, 
  Download, History, Trash2, ShieldCheck, 
  ArrowUpRight, Clock, User, HardHat, FileDigit,
  MoreVertical, Star, LayoutGrid, List, Database, X,
  CheckCircle2, FileWarning, Eye, ArrowRight, ShieldAlert,
  Calendar, Info, UserCircle, Activity, Landmark, Scale, Gavel, ExternalLink,
  Compass, Layout, Radio, Upload, Loader2, Scan, AlertTriangle, Globe
} from 'lucide-react';

const PORTAL_MAPPING = [
    { portal: 'DM iService', authority: 'Dubai Municipality', function: 'NOCs, HSE Plans, Phase Approvals', frequency: 'Per Phase', criticality: 'High' },
    { portal: 'OSHAD eSubmission', authority: 'Abu Dhabi OSHAD', function: 'Incidents, Performance Data, Audit Reports', frequency: 'Monthly/Quarterly', criticality: 'High' },
    { portal: 'MoHRE Digital', authority: 'Federal Labour', function: 'Worker Safety Records, Training Logs', frequency: 'Ongoing/Audit-based', criticality: 'Medium' },
    { portal: 'Trakhees eServices', authority: 'PCFC / EHS', function: 'Operational Permits, Inspection Reports', frequency: 'Activity-based', criticality: 'High' }
];

const DMSModule: React.FC = () => {
  const { currentUser, activeFramework } = useUser();
  const [activeTab, setActiveTab] = useState<'Vault' | 'Portals' | 'Templates'>('Vault');
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
    },
    { 
        id: 'DOC-ENV-003', title: 'Environmental Impact Assessment', category: 'Report', version: '1.0', status: 'Active', author: 'Khalid Al-Dhaheri', retentionYears: '10', criticality: 'High', authority: 'EAD', portal: 'Digital', regulationRef: 'EAD Guidelines', penaltyRisk: 'AED 50,000',
        auditLogs: []
    },
    { 
        id: 'CERT-ISO-45001', title: 'ISO 45001 Certification', category: 'Certificate', version: '2023', status: 'Active', author: 'External Auditor', retentionYears: '3', criticality: 'Medium', authority: 'ISO', portal: 'N/A', regulationRef: 'ISO 45001:2018', penaltyRisk: 'N/A',
        auditLogs: []
    }
  ]);

  const filteredDocs = useMemo(() => {
      return docs.filter(doc => 
          (searchTerm === '' || doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (categoryFilter === null || doc.category === categoryFilter)
      );
  }, [docs, searchTerm, categoryFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setUploadedFile(file.name);
          // Simulate OCR processing
          setIsUploading(true);
          setTimeout(async () => {
              try {
                  // Mock extraction
                  const data = await extractDocumentData("mock-base64"); 
                  setExtractedData(data || { 
                      title: file.name.split('.')[0], 
                      expiry: '2025-12-31', 
                      authority: 'Detected: OSHAD'
                  });
              } catch (err) {
                  setExtractedData({ title: file.name, expiry: 'Unknown', authority: 'Manual Entry Required' });
              } finally {
                  setIsUploading(false);
              }
          }, 2000);
      }
  };

  const handleSaveDocument = () => {
      if (!uploadedFile) return;
      const newDoc: HSEDocument = {
          id: `DOC-${Date.now()}`,
          title: extractedData?.title || uploadedFile,
          category: 'Uploaded',
          version: '1.0',
          status: 'Draft',
          author: currentUser.name,
          retentionYears: '5',
          criticality: 'Medium',
          authority: 'Internal',
          portal: 'N/A',
          regulationRef: 'Pending Review',
          auditLogs: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'Upload', details: 'Initial upload via DMS' }]
      };
      setDocs([newDoc, ...docs]);
      setShowUploadModal(false);
      setUploadedFile(null);
      setExtractedData(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-5">
                <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                    <FolderTree size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Document Vault</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-indigo-500 pl-4">Regulatory Archive & OCR Ingestion</p>
                </div>
            </div>
            <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
                <button onClick={() => setActiveTab('Vault')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Vault' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Secure Vault</button>
                <button onClick={() => setActiveTab('Portals')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Portals' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Authority Portals</button>
                <button onClick={() => setActiveTab('Templates')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Templates' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>SOP Templates</button>
            </div>
        </div>

        {activeTab === 'Vault' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Plus size={16}/> Upload Document
                    </button>

                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter size={14}/> Filters
                        </h3>
                        <div className="space-y-2">
                            {['Plan', 'Report', 'Certificate', 'RAMS', 'Permit'].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center ${categoryFilter === cat ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    {cat}
                                    {categoryFilter === cat && <CheckCircle2 size={14}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex items-center">
                        <Search size={20} className="text-slate-400 ml-4"/>
                        <input 
                            type="text" 
                            placeholder="Search by title, ID, or regulatory reference..." 
                            className="w-full p-4 bg-transparent outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-50 hover:border-indigo-100 transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            {doc.category === 'Certificate' ? <Star size={24}/> : doc.category === 'Plan' ? <Compass size={24}/> : <FileText size={24}/>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{doc.category}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{doc.status}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight">{doc.title}</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{doc.id} • V{doc.version} • {doc.regulationRef}</p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <Download size={20}/>
                                    </button>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                                    <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase">
                                        <span className="flex items-center gap-1"><User size={12}/> {doc.author}</span>
                                        <span className="flex items-center gap-1"><History size={12}/> Retention: {doc.retentionYears}y</span>
                                        {doc.penaltyRisk && <span className="flex items-center gap-1 text-red-500"><AlertTriangle size={12}/> Risk: {doc.penaltyRisk}</span>}
                                    </div>
                                    <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1">
                                        View Audit Trail <ArrowRight size={12}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'Portals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                {PORTAL_MAPPING.map((portal, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Globe size={32}/>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${portal.criticality === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                {portal.criticality} Priority
                            </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{portal.portal}</h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-6">{portal.authority}</p>
                        
                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <Activity size={16} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Function</p>
                                    <p className="text-xs font-bold text-slate-700">{portal.function}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <Clock size={16} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Frequency</p>
                                    <p className="text-xs font-bold text-slate-700">{portal.frequency}</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                            Access Portal <ExternalLink size={14}/>
                        </button>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'Templates' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Chemical Handling & Storage', code: 'SOP-HSE-001', authority: 'ISO 45001', risk: 'High' },
                        { title: 'Arc Welding Safety Procedure', code: 'SOP-HSE-002', authority: 'ADNOC COP', risk: 'High' },
                        { title: 'Management Review Procedure', code: 'SOP-HSE-003', authority: 'ISO 14001', risk: 'Medium' },
                        { title: 'Excavation & Trenching Safety', code: 'SOP-HSE-004', authority: 'DM Code', risk: 'Critical' },
                        { title: 'Confined Space Entry Protocol', code: 'SOP-HSE-005', authority: 'OSHAD SF', risk: 'Critical' },
                        { title: 'Waste Management Plan', code: 'SOP-HSE-006', authority: 'EAD Guidelines', risk: 'Medium' },
                    ].map((sop, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-indigo-100 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Gavel size={32}/>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                    sop.risk === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                    sop.risk === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {sop.risk} Risk
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{sop.title}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-6">{sop.code} • {sop.authority}</p>
                            
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                                    <FileDigit size={14}/> Use Template
                                </button>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all">
                                    <Download size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-3xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute -bottom-20 -right-20 opacity-10">
                        <Database size={300} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">ISO Documentation Toolkit</h3>
                        <p className="text-indigo-100 font-medium leading-relaxed max-w-xl">
                            Accelerate your ISO 45001/14001 certification journey. Our toolkit provides all mandatory procedures, registers, and forms required for a compliant management system.
                        </p>
                        <button className="mt-8 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                            <ShieldCheck size={18}/> Download Full Toolkit
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Upload Document</h3>
                        <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                    </div>

                    <div className="space-y-6">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all group"
                        >
                            <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
                                {isUploading ? <Loader2 size={32} className="animate-spin text-indigo-600"/> : <Upload size={32} className="text-slate-400 group-hover:text-indigo-600"/>}
                            </div>
                            {uploadedFile ? (
                                <p className="text-sm font-bold text-indigo-600">{uploadedFile}</p>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-slate-600">Click to upload or drag & drop</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">PDF, DOCX, JPG (OCR Enabled)</p>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
                        </div>

                        {extractedData && (
                            <div className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 animate-in slide-in-from-bottom-2">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Scan size={14}/> AI Extraction Successful
                                </h4>
                                <div className="space-y-2 text-xs font-bold text-emerald-800">
                                    <p>Title: {extractedData.title}</p>
                                    <p>Expiry: {extractedData.expiry}</p>
                                    <p>Authority: {extractedData.authority}</p>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleSaveDocument}
                            disabled={!uploadedFile}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm & Archive
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DMSModule;
