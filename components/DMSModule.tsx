
import { AITag } from './AITag';
import React, { useState, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { HSEDocument, AuditLog, DocumentVersion } from '../types';
import { extractDocumentData } from '../services/geminiService';
import { 
  FolderTree, Search, Filter, Plus, FileText, 
  Download, History, Trash2, ShieldCheck, 
  ArrowUpRight, Clock, User, HardHat, FileDigit,
  MoreVertical, Star, LayoutGrid, List, Database, X,
  CheckCircle2, FileWarning, Eye, ArrowRight, ShieldAlert,
  Calendar, Info, UserCircle, Activity, Landmark, Scale, Gavel, ExternalLink,
  Compass, Layout, Radio, Upload, Loader2, Scan, AlertTriangle, Globe, GitCommit, UploadCloud
} from 'lucide-react';

const PORTAL_MAPPING = [
    { portal: 'DM iService', authority: 'Muscat Municipality', function: 'NOCs, HSE Plans, Phase Approvals', frequency: 'Per Phase', criticality: 'High' },
    { portal: 'Oman MoL MD 286/2008 eSubmission', authority: 'Muscat Oman MoL MD 286/2008', function: 'Incidents, Performance Data, Audit Reports', frequency: 'Monthly/Quarterly', criticality: 'High' },
    { portal: 'Ministry of Labour (MoL) Digital', authority: 'Federal Labour', function: 'Worker Safety Records, Training Logs', frequency: 'Ongoing/Audit-based', criticality: 'Medium' },
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

  // Version Control State
  const [viewingVersionsForDoc, setViewingVersionsForDoc] = useState<HSEDocument | null>(null);
  const [updatingDoc, setUpdatingDoc] = useState<HSEDocument | null>(null);
  const [newVersionNotes, setNewVersionNotes] = useState('');

  const [docs, setDocs] = useState<HSEDocument[]>([
    { 
        id: 'HSE-MP-001', title: 'Corporate HSE Management Plan', category: 'Plan', version: '2024.1', status: 'Active', author: 'Dr. Layla Hassan', retentionYears: 'Project Life + 5', criticality: 'High', authority: 'Oman MoL MD 286/2008', portal: 'eSubmission', regulationRef: 'Oman MoL MD 286/2008 Code of Practice v4.0', penaltyRisk: 'OMR 5,000–50,000 / Work Stoppage',
        auditLogs: [
            { timestamp: '2024-01-10T09:00:00Z', actorId: 'u2', actorName: 'Dr. Layla Hassan', action: 'Created', details: 'Annual governance alignment update.' },
            { timestamp: '2024-01-20T14:00:00Z', actorId: 'reg-01', actorName: 'Oman MoL MD 286/2008 Inspector', action: 'Verification', details: 'Authorized via eSubmission portal.' }
        ],
        versions: [
            { version: '2024.1', uploadedAt: '2024-01-10T09:00:00Z', uploadedBy: 'Dr. Layla Hassan', changes: 'Annual governance alignment update.' },
            { version: '2023.2', uploadedAt: '2023-06-15T10:00:00Z', uploadedBy: 'Dr. Layla Hassan', changes: 'Mid-year review and minor adjustments to risk matrix.' },
            { version: '2023.1', uploadedAt: '2023-01-05T08:30:00Z', uploadedBy: 'Dr. Layla Hassan', changes: 'Initial baseline for 2023.' }
        ]
    },
    { 
        id: 'RAMS-WAH-102', title: 'Work at Height Method Statement', category: 'RAMS', version: '1.4', status: 'Active', author: 'Marcus Chen', retentionYears: 'Project Life + 5', criticality: 'High', authority: 'DM', portal: 'iService', regulationRef: 'Muscat Municipality Code of Safety Practice Part 2', penaltyRisk: 'OMR 10,000+ / Criminal Liability for breaches',
        auditLogs: [
            { timestamp: '2024-02-12T11:00:00Z', actorId: 'u5', actorName: 'Marcus Chen', action: 'Update', details: 'Integrated self-retracting lifeline protocol.' }
        ],
        versions: [
            { version: '1.4', uploadedAt: '2024-02-12T11:00:00Z', uploadedBy: 'Marcus Chen', changes: 'Updated scaffolding inspection protocol & lifeline requirements.' },
            { version: '1.3', uploadedAt: '2023-11-20T14:00:00Z', uploadedBy: 'Marcus Chen', changes: 'Added harness double-lanyard requirement.' }
        ]
    },
    { 
        id: 'DOC-ENV-003', title: 'Environmental Impact Assessment - Mina Al Fahal Expansion', category: 'Report', version: '1.0', status: 'Active', author: 'Khalid Al-Dhaheri', retentionYears: '10', criticality: 'High', authority: 'EAD', portal: 'Digital', regulationRef: 'EAD Law No. 16/2005 Environmental Protection', penaltyRisk: 'OMR 5,000',
        auditLogs: [
            { timestamp: '2023-09-01T09:15:00Z', actorId: 'u6', actorName: 'Khalid Al-Dhaheri', action: 'Created', details: 'Original approved baseline submission.' }
        ],
        versions: [
            { version: '1.0', uploadedAt: '2023-09-01T09:15:00Z', uploadedBy: 'Khalid Al-Dhaheri', changes: 'Original approved submission.' }
        ]
    },
    { 
        id: 'CERT-ISO-45001', title: 'ISO 45001:2018 Occupational Health & Safety Certificate', category: 'Certificate', version: '2024', status: 'Active', author: 'Bureau Veritas Certification', retentionYears: '3', criticality: 'Medium', authority: 'ISO', portal: 'N/A', regulationRef: 'ISO 45001:2018 Clause 9.2', penaltyRisk: 'Loss of tender prequalification',
        auditLogs: [
            { timestamp: '2024-01-05T16:00:00Z', actorId: 'bv-01', actorName: 'Lead Auditor BV', action: 'Renewal', details: 'Surveillance Audit 2 closed with zero major non-conformances.' }
        ],
        versions: [
            { version: '2024', uploadedAt: '2024-01-05T16:00:00Z', uploadedBy: 'Bureau Veritas', changes: 'Triennial re-certification issued.' },
            { version: '2021', uploadedAt: '2021-01-15T10:00:00Z', uploadedBy: 'Bureau Veritas', changes: 'Initial certification.' }
        ]
    },
    { 
        id: 'ERP-HAB-2026', title: 'Khazzan Tight Gas Complex Block 61 Emergency Response Plan', category: 'Plan', version: '3.2', status: 'Active', author: 'Tariq Al-Hashemi', retentionYears: 'Permanent', criticality: 'High', authority: 'Civil Defence', portal: 'MOI Hassantuk', regulationRef: 'Civil Defence and Ambulance Authority (CDAA Oman) Fire & Life Safety Code 2018', penaltyRisk: 'OMR 10,000 / Site Cease Order',
        auditLogs: [
            { timestamp: '2024-03-01T10:00:00Z', actorId: 'u1', actorName: 'Tariq Al-Hashemi', action: 'Approved', details: 'Annual drill review and mutual aid coordination.' }
        ],
        versions: [
            { version: '3.2', uploadedAt: '2024-03-01T10:00:00Z', uploadedBy: 'Tariq Al-Hashemi', changes: 'Updated assembly point coordinates for Sector 4 flare project.' },
            { version: '3.1', uploadedAt: '2023-08-14T09:00:00Z', uploadedBy: 'Tariq Al-Hashemi', changes: 'Added drone reconnaissance protocol.' }
        ]
    },
    { 
        id: 'SOP-LIFT-008', title: 'Critical & Heavy Lifting Operations Standard', category: 'RAMS', version: '2.1', status: 'Active', author: 'Hamad Al-Dosari', retentionYears: 'Project Life + 5', criticality: 'High', authority: 'PDO', portal: 'PDO Vendor Hub', regulationRef: 'PDO SP-1143 Specification Lifting & Rigging Operations v3', penaltyRisk: 'Suspension of crane operators / OMR 2,500',
        auditLogs: [
            { timestamp: '2024-02-18T14:30:00Z', actorId: 'u7', actorName: 'Hamad Al-Dosari', action: 'Approved', details: 'Mandated dual tagline verification.' }
        ],
        versions: [
            { version: '2.1', uploadedAt: '2024-02-18T14:30:00Z', uploadedBy: 'Hamad Al-Dosari', changes: 'Added wind threshold 25 knots cut-off.' }
        ]
    },
    { 
        id: 'CERT-ISO-14001', title: 'ISO 14001:2015 Environmental Management Certificate', category: 'Certificate', version: '2024', status: 'Active', author: 'DNV GL Business Assurance', retentionYears: '3', criticality: 'Medium', authority: 'ISO', portal: 'N/A', regulationRef: 'ISO 14001:2015 Clause 6.1.2', penaltyRisk: 'Loss of green financing compliance',
        auditLogs: [
            { timestamp: '2024-02-10T12:00:00Z', actorId: 'dnv-02', actorName: 'DNV Lead Auditor', action: 'Issued', details: 'Valid through 2027.' }
        ],
        versions: [
            { version: '2024', uploadedAt: '2024-02-10T12:00:00Z', uploadedBy: 'DNV GL', changes: 'Recertification cycle 2.' }
        ]
    },
    { 
        id: 'HAZCOM-CHM-04', title: 'Hazardous Chemical Management & COSHH Manual', category: 'Plan', version: '4.0', status: 'Active', author: 'Dr. Sarah Jenkins', retentionYears: '30 Years', criticality: 'High', authority: 'Ministry of Labour (MoL)', portal: 'Ministry of Labour (MoL) Digital', regulationRef: 'Federal Law No. 8/1980 Occupational Safety Orders', penaltyRisk: 'OMR 30,000 / Ministry blacklisting',
        auditLogs: [
            { timestamp: '2024-01-25T08:00:00Z', actorId: 'u8', actorName: 'Dr. Sarah Jenkins', action: 'Updated', details: 'Incorporated GHS Rev 9 SDS standards.' }
        ],
        versions: [
            { version: '4.0', uploadedAt: '2024-01-25T08:00:00Z', uploadedBy: 'Dr. Sarah Jenkins', changes: 'Updated chemical incompatibility matrices.' }
        ]
    },
    { 
        id: 'HOT-PTW-PROC', title: 'Permit-to-Work Hot Work Operations Protocol', category: 'Permit', version: '5.2', status: 'Active', author: 'Sultan Al-Ghafri', retentionYears: '7 Years', criticality: 'High', authority: 'Oman MoL MD 286/2008', portal: 'eSubmission', regulationRef: 'Oman MoL MD 286/2008 CoP 21.0 - Hot Work and Flame Burning', penaltyRisk: 'OMR 40,000',
        auditLogs: [
            { timestamp: '2024-03-11T13:00:00Z', actorId: 'u9', actorName: 'Sultan Al-Ghafri', action: 'Approved', details: 'Continuous LEL gas monitoring mandated.' }
        ],
        versions: [
            { version: '5.2', uploadedAt: '2024-03-11T13:00:00Z', uploadedBy: 'Sultan Al-Ghafri', changes: 'Added dedicated 60-minute fire watch post work.' }
        ]
    },
    { 
        id: 'AUD-REP-Q1-26', title: 'Enterprise Integrated HSE Q1 Internal Audit Report', category: 'Report', version: '1.0', status: 'Active', author: 'Amina Al-Mansouri', retentionYears: '10 Years', criticality: 'Medium', authority: 'Board HSE Committee', portal: 'Internal Vault', regulationRef: 'Corporate Governance Charter 2026', penaltyRisk: 'Internal audit remediation escalation',
        auditLogs: [
            { timestamp: '2024-03-31T17:00:00Z', actorId: 'u3', actorName: 'Amina Al-Mansouri', action: 'Signed Off', details: 'Submitted to VP HSE with 14 CAPAs logged.' }
        ],
        versions: [
            { version: '1.0', uploadedAt: '2024-03-31T17:00:00Z', uploadedBy: 'Amina Al-Mansouri', changes: 'Final Q1 audit closure.' }
        ]
    },
    { 
        id: 'HEAT-STR-2026', title: 'GCC Summer Heat Stress & Midday Break Protocol', category: 'Plan', version: '2026.0', status: 'Active', author: 'Zainab Al-Mutawa', retentionYears: '5 Years', criticality: 'High', authority: 'Ministry of Labour (MoL)', portal: 'Ministry of Labour (MoL) Digital', regulationRef: 'Ministerial Resolution No. 518 on Midday Outdoor Work', penaltyRisk: 'OMR 5,000 fine per violating worker',
        auditLogs: [
            { timestamp: '2024-04-01T09:00:00Z', actorId: 'u4', actorName: 'Zainab Al-Mutawa', action: 'Approved', details: 'Early rollout ahead of June enforcement.' }
        ],
        versions: [
            { version: '2026.0', uploadedAt: '2024-04-01T09:00:00Z', uploadedBy: 'Zainab Al-Mutawa', changes: 'Integrated wet-bulb globe temperature (WBGT) thresholds.' }
        ]
    },
    { 
        id: 'NEOM-SUS-01', title: 'NEOM Sindalah Island Environmental Safeguarding Charter', category: 'Report', version: '2.0', status: 'Active', author: 'Marcus Vance', retentionYears: 'Project Life', criticality: 'High', authority: 'NEOM Authority', portal: 'NEOM ePermits', regulationRef: 'NEOM Environmental Standards & Sustainability Charter', penaltyRisk: 'SAR 500,000 / Immediate contract default',
        auditLogs: [
            { timestamp: '2024-03-15T15:00:00Z', actorId: 'u10', actorName: 'Marcus Vance', action: 'Approved', details: 'Coral reef protection zone buffer verified.' }
        ],
        versions: [
            { version: '2.0', uploadedAt: '2024-03-15T15:00:00Z', uploadedBy: 'Marcus Vance', changes: 'Zero single-use plastics and marine silt barrier requirements.' }
        ]
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
                      authority: 'Detected: Oman MoL MD 286/2008'
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

      if (updatingDoc) {
          // Creating a new version
          const newVersionNumber = (parseFloat(updatingDoc.version) || 1.0) + 0.1;
          const newVersionStr = newVersionNumber.toFixed(1);
          
          const updatedDocs = docs.map(d => {
              if (d.id === updatingDoc.id) {
                  return {
                      ...d,
                      version: newVersionStr,
                      auditLogs: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'New Version', details: `Uploaded version ${newVersionStr}` }, ...d.auditLogs],
                      versions: [
                          { version: newVersionStr, uploadedAt: new Date().toISOString(), uploadedBy: currentUser.name, changes: newVersionNotes || 'Updated document content' },
                          ...(d.versions || [])
                      ]
                  }
              }
              return d;
          });
          setDocs(updatedDocs);
      } else {
          // Creating a brand new document
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
              auditLogs: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'Upload', details: 'Initial upload via DMS' }],
              versions: [
                  { version: '1.0', uploadedAt: new Date().toISOString(), uploadedBy: currentUser.name, changes: 'Initial upload' }
              ]
          };
          setDocs([newDoc, ...docs]);
      }

      setShowUploadModal(false);
      setUploadedFile(null);
      setExtractedData(null);
      setUpdatingDoc(null);
      setNewVersionNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-x-5">
                <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                    <FolderTree size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Document Vault</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-indigo-500 ps-4">Regulatory Archive & OCR Ingestion</p>
                </div>
            </div>
            <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
                <button onClick={() => setActiveTab('Vault')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Vault' ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Secure Vault</button>
                <button onClick={() => setActiveTab('Portals')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Portals' ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Authority Portals</button>
                <button onClick={() => setActiveTab('Templates')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Templates' ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>SOP Templates</button>
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

                    <div className="glass-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter size={14}/> Filters
                        </h3>
                        <div className="space-y-2">
                            {['Plan', 'Report', 'Certificate', 'RAMS', 'Permit'].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                                    className={`w-full text-start px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center ${categoryFilter === cat ? 'bg-indigo-50 text-indigo-700' : 'hover:glass-button text-slate-600'}`}
                                >
                                    {cat}
                                    {categoryFilter === cat && <CheckCircle2 size={14}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <div className="glass-card p-2 rounded-[2rem] shadow-sm border border-slate-100 flex items-center">
                        <Search size={20} className="text-slate-400 ms-4"/>
                        <input 
                            type="text" 
                            placeholder="Search by title, ID, or regulatory reference..." 
                            className="w-full p-4   outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="glass-card p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-50 hover:border-indigo-100 transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className="p-4 glass-panel rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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
                                    <button className="p-3 glass-panel rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <Download size={20}/>
                                    </button>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                                    <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase">
                                        <span className="flex items-center gap-1"><User size={12}/> {doc.author}</span>
                                        <span className="flex items-center gap-1"><History size={12}/> Retention: {doc.retentionYears}y</span>
                                        {doc.penaltyRisk && <span className="flex items-center gap-1 text-red-500"><AlertTriangle size={12}/> Risk: {doc.penaltyRisk}</span>}
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => {
                                                setUpdatingDoc(doc);
                                                setShowUploadModal(true);
                                            }}
                                            className="text-[10px] font-black text-slate-500 uppercase hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                        >
                                            <UploadCloud size={14}/> Update
                                        </button>
                                        <button 
                                            onClick={() => setViewingVersionsForDoc(doc)}
                                            className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1 transition-colors"
                                        >
                                            <GitCommit size={14}/> Versions ({doc.versions?.length || 1})
                                        </button>
                                    </div>
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
                    <div key={idx} className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 glass-panel rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Globe size={32}/>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${portal.criticality === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                {portal.criticality} Priority
                            </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{portal.portal}</h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-6">{portal.authority}</p>
                        
                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-3 p-3 glass-panel rounded-xl">
                                <Activity size={16} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Function</p>
                                    <p className="text-xs font-bold text-slate-700">{portal.function}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 glass-panel rounded-xl">
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
                        { title: 'Arc Welding & Hot Work Procedure', code: 'SOP-HSE-002', authority: 'PDO SP-1143 Specification', risk: 'High' },
                        { title: 'Management Review & KPI Governance', code: 'SOP-HSE-003', authority: 'ISO 14001', risk: 'Medium' },
                        { title: 'Excavation & Trenching Safety Standard', code: 'SOP-HSE-004', authority: 'Oman Environment Authority', risk: 'Critical' },
                        { title: 'Confined Space Entry & Rescue Protocol', code: 'SOP-HSE-005', authority: 'Oman MoL MD 286/2008', risk: 'Critical' },
                        { title: 'Hazardous Waste & Effluent Disposal Plan', code: 'SOP-HSE-006', authority: 'EAD Guidelines', risk: 'Medium' },
                        { title: 'Scaffold Erection & Dismantling Standard', code: 'SOP-HSE-007', authority: 'BS EN 12811 / Oman MoL MD 286/2008', risk: 'High' },
                        { title: 'Lockout/Tagout (LOTO) Energy Isolation', code: 'SOP-HSE-008', authority: 'OSHA 1910.147 / Aramco', risk: 'Critical' },
                        { title: 'Work Over Water & Marine Berth Safety', code: 'SOP-HSE-009', authority: 'Trakhees / IMO', risk: 'High' },
                        { title: 'Contractor Onboarding & Safety Pre-Qual', code: 'SOP-HSE-010', authority: 'ISO 45001 Clause 8.1.4', risk: 'Medium' }
                    ].map((sop, i) => (
                        <div key={i} className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-indigo-100 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 glass-panel rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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
                                <button 
                                    onClick={() => {
                                        const newDoc: HSEDocument = {
                                            id: `${sop.code}-${Date.now().toString().slice(-4)}`,
                                            title: `${sop.title} (Draft from Template)`,
                                            category: 'Plan',
                                            version: '1.0',
                                            status: 'Draft',
                                            author: currentUser.name,
                                            retentionYears: '5',
                                            criticality: sop.risk as any,
                                            authority: sop.authority,
                                            portal: 'Internal Vault',
                                            regulationRef: sop.authority,
                                            auditLogs: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'Created from Template', details: `Spawned from ${sop.code}` }],
                                            versions: [{ version: '1.0', uploadedAt: new Date().toISOString(), uploadedBy: currentUser.name, changes: 'Initial baseline created from enterprise template' }]
                                        };
                                        setDocs(prev => [newDoc, ...prev]);
                                        setActiveTab('Vault');
                                    }}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FileDigit size={14}/> Use Template
                                </button>
                                <button 
                                    onClick={() => {
                                        const blob = new Blob([`Enterprise HSE SOP Template: ${sop.title}\nCode: ${sop.code}\nRegulatory Authority: ${sop.authority}\nRisk Classification: ${sop.risk}\n\n1. PURPOSE & SCOPE\nThis standard operational procedure governs all operational activities involving ${sop.title.toLowerCase()} across all enterprise sites.\n\n2. MANDATORY CONTROLS\n- Permitting & authorization verified prior to job execution.\n- Certified competent personnel only.\n- Pre-task risk briefing and PPE matrix alignment.\n- Daily continuous verification.\n`], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${sop.code}_Template.txt`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="p-3 glass-panel text-slate-400 rounded-xl hover:text-indigo-600 transition-all cursor-pointer"
                                    title="Download Template Text"
                                >
                                    <Download size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-3xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute -bottom-20 -end-20 opacity-10">
                        <Database size={300} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">ISO Documentation Toolkit</h3>
                        <p className="text-indigo-100 font-medium leading-relaxed max-w-xl">
                            Accelerate your ISO 45001/14001 certification journey. Our toolkit provides all mandatory procedures, registers, and forms required for a compliant management system.
                        </p>
                        <button className="mt-8 px-8 py-4 glass-card text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:glass-button transition-all flex items-center justify-center gap-3">
                            <ShieldCheck size={18}/> Download Full Toolkit
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="glass-card w-full max-w-lg rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                                {updatingDoc ? 'New Version' : 'Upload Document'}
                            </h3>
                            {updatingDoc && (
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Updating: {updatingDoc.id} (Current: v{updatingDoc.version})
                                </p>
                            )}
                        </div>
                        <button onClick={() => {
                            setShowUploadModal(false);
                            setUpdatingDoc(null);
                        }} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                    </div>

                    <div className="space-y-6">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-4 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${uploadedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:glass-button'}`}
                        >
                            <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
                                {isUploading ? <Loader2 size={32} className="animate-spin text-indigo-600"/> : <Upload size={32} className="text-slate-400 group-hover:text-indigo-600"/>}
                            </div>
                            {uploadedFile ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-indigo-600">{uploadedFile}</p>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ready for processing</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-slate-600">Click to upload or drag & drop</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{updatingDoc ? 'Must be same format' : 'PDF, DOCX, JPG (OCR Enabled)'}</p>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
                        </div>

                        {updatingDoc && uploadedFile && !isUploading && (
                             <div className="animate-in slide-in-from-bottom-2">
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Version Notes / Changes (Optional)</label>
                                 <textarea 
                                    className="w-full glass-panel border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:glass-card transition-all resize-none h-24"
                                    placeholder="Describe what changed in this version..."
                                    value={newVersionNotes}
                                    onChange={e => setNewVersionNotes(e.target.value)}
                                 />
                             </div>
                        )}

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
        {/* Version History Modal */}
        {viewingVersionsForDoc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="glass-card w-full max-w-2xl rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-start mb-6 shrink-0">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{viewingVersionsForDoc.title}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{viewingVersionsForDoc.id} • Version History</p>
                        </div>
                        <button onClick={() => setViewingVersionsForDoc(null)} className="p-2 hover:bg-slate-100 rounded-full shrink-0"><X size={24} className="text-slate-400"/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pe-2">
                        {viewingVersionsForDoc.versions && viewingVersionsForDoc.versions.length > 0 ? (
                            viewingVersionsForDoc.versions.map((ver, idx) => (
                                <div key={idx} className="glass-panel border border-slate-100 rounded-2xl p-5 flex gap-5 group hover:border-indigo-100 transition-colors">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-200 text-slate-500'}`}>
                                            v{ver.version}
                                        </div>
                                        {idx !== viewingVersionsForDoc.versions!.length - 1 && (
                                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{ver.changes}</p>
                                                <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><User size={12} /> {ver.uploadedBy}</span>
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ver.uploadedAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors shrink-0">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <GitCommit size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-500">No version history available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DMSModule;
