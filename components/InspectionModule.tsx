
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    generateInspectionChecklist, 
    assignIconsToChecklist
} from '../services/geminiService';
import { InspectionItem, AuditLog, NCR } from '../types';
import LocationSelector, { PREDEFINED_LOCATIONS } from './LocationSelector';
import { useUser } from '../contexts/UserContext';
import { 
  Loader2, Check, Gavel, BrainCircuit,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Search,
  ArrowUpDown,
  Filter,
  Camera,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface InspectionRecord {
  id: string;
  type: string;
  location: string;
  date: string;
  dueDate?: string;
  timestamp: string;
  status: 'Pass' | 'Flagged' | 'Under Review';
  score: number;
  items: InspectionItem[];
  ncrs: NCR[]; // Integrated NCRs
  generalComment?: string;
  auditLogs: AuditLog[];
}

interface InspectionModuleProps {
  initialTab?: 'new' | 'history';
}

const MOCK_HISTORY: InspectionRecord[] = [
    {
        id: 'INS-1001',
        type: 'Heavy Machinery',
        location: 'Ruwais Refinery Zone A',
        date: '2024-05-10',
        timestamp: '2024-05-10T09:00:00Z',
        status: 'Pass',
        score: 92,
        items: [],
        ncrs: [],
        auditLogs: []
    },
    {
        id: 'INS-1002',
        type: 'Scaffolding',
        location: 'Jebel Ali Site C',
        date: '2024-05-12',
        timestamp: '2024-05-12T14:30:00Z',
        status: 'Flagged',
        score: 78,
        items: [],
        ncrs: [
            { id: 'NCR-882', inspectionId: 'INS-1002', itemId: 'item-1', description: 'Missing toe boards', severity: 'Major', assignedTo: 'Site_Supervisor', dueDate: '2024-05-14', status: 'Open' } as NCR
        ],
        auditLogs: []
    },
    {
        id: 'INS-1003',
        type: 'Electrical Safety',
        location: 'HQ Server Room',
        date: '2024-05-15',
        timestamp: '2024-05-15T11:00:00Z',
        status: 'Pass',
        score: 100,
        items: [],
        ncrs: [],
        auditLogs: []
    }
];

const InspectionModule: React.FC<InspectionModuleProps> = ({ initialTab }) => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [inspectionType, setInspectionType] = useState('Heavy Machinery');
  const [location, setLocation] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  // Inspection State
  const [checklist, setChecklist] = useState<InspectionItem[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  
  // Image Capture State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  
  // Sorting & Filtering State
  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InspectionRecord | 'ncrCount'; direction: 'asc' | 'desc' } | null>(null);

  const selectedZone = useMemo(() => PREDEFINED_LOCATIONS.find(l => l.name === location), [location]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      // Reset selection when navigating from sidebar
      setSelectedRecord(null); 
    }
  }, [initialTab]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('hse_inspection_history');
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    } else {
        setHistory(MOCK_HISTORY);
        localStorage.setItem('hse_inspection_history', JSON.stringify(MOCK_HISTORY));
    }
  }, []);

  const processedHistory = useMemo(() => {
    let data = [...history];

    // Filtering
    if (filterQuery) {
      const lowerQuery = filterQuery.toLowerCase();
      data = data.filter(item => 
        item.id.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery) ||
        item.location.toLowerCase().includes(lowerQuery) ||
        item.status.toLowerCase().includes(lowerQuery)
      );
    }

    // Sorting
    if (sortConfig) {
      data.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof InspectionRecord];
        let bValue: any = b[sortConfig.key as keyof InspectionRecord];

        // Handle special sort keys
        if (sortConfig.key === 'ncrCount') {
            aValue = a.ncrs?.length || 0;
            bValue = b.ncrs?.length || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [history, filterQuery, sortConfig]);

  const requestSort = (key: keyof InspectionRecord | 'ncrCount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof InspectionRecord | 'ncrCount') => {
      if (sortConfig && sortConfig.key === key) {
          return sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>;
      }
      return <ArrowUpDown size={12} className="opacity-30"/>;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) { alert("Please select a valid site location."); return; }
    setLoading(true);
    try {
        let items = await generateInspectionChecklist(inspectionType, location, '');
        // Enhance items with random icons for demo
        items = await assignIconsToChecklist(items);
        setChecklist(items);
        setIsGenerated(true);
        setNcrs([]); // Reset NCRs for new inspection
    } catch (error) { alert("Failed to generate checklist."); } finally { setLoading(false); }
  };

  const createNCR = (item: InspectionItem) => {
      // Logic to automatically assign NCR on failure
      const newNCR: NCR = {
          id: `NCR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          inspectionId: 'temp', // assigned on save
          itemId: item.id,
          description: `Non-conformance: ${item.question}`,
          severity: 'Major', // Default
          assignedTo: 'Site_Supervisor', // Default
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // +2 days
          status: 'Open'
      };
      setNcrs(prev => [...prev, newNCR]);
      return newNCR.id;
  };

  const removeNCR = (ncrId: string) => {
      setNcrs(prev => prev.filter(n => n.id !== ncrId));
  };

  const updateNCR = (ncrId: string, field: keyof NCR, value: string) => {
      setNcrs(prev => prev.map(n => n.id === ncrId ? { ...n, [field]: value } : n));
  };

  const updateStatus = (id: string, status: 'Pass' | 'Fail' | 'NA') => {
      setChecklist(prev => prev.map(item => {
          if (item.id === id) {
              // If status changes to Fail, create NCR
              if (status === 'Fail' && item.status !== 'Fail') {
                  const ncrId = createNCR(item);
                  return { ...item, status, ncrId };
              }
              // If status changes from Fail, remove NCR
              if (item.status === 'Fail' && status !== 'Fail' && item.ncrId) {
                  removeNCR(item.ncrId);
                  return { ...item, status, ncrId: undefined };
              }
              return { ...item, status };
          }
          return item;
      }));
  };

  // Image Capture Logic
  const triggerCamera = (itemId: string) => {
      setActiveItemId(itemId);
      fileInputRef.current?.click();
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeItemId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setChecklist(prev => prev.map(item => 
                  item.id === activeItemId ? { ...item, image: base64 } : item
              ));
              setActiveItemId(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
          };
          reader.readAsDataURL(file);
      }
  };

  const removeImage = (itemId: string) => {
      setChecklist(prev => prev.map(item => 
          item.id === itemId ? { ...item, image: undefined } : item
      ));
  };

  const handleComplete = () => {
      // Validation: Ensure Major NCRs have mandatory fields filled
      const incompleteNcrs = ncrs.filter(ncr => 
          ncr.severity === 'Major' && 
          (!ncr.correctiveAction || ncr.correctiveAction.trim() === '' || !ncr.assignedTo)
      );

      if (incompleteNcrs.length > 0) {
          alert(`Validation Error: Please define a Corrective Action Plan and assign accountability for all ${incompleteNcrs.length} Major Non-Conformance(s) before submitting.`);
          return;
      }

      // Generate the Inspection ID first
      const inspectionId = `INS-${Date.now()}`;

      const failedItems = checklist.filter(i => i.status === 'Fail');
      const passCount = checklist.filter(i => i.status === 'Pass').length;
      const totalCount = checklist.filter(i => i.status !== 'NA').length;
      const score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
      
      // Link NCRs to the actual Inspection Log ID
      const linkedNcrs = ncrs.map(ncr => ({
          ...ncr,
          inspectionId: inspectionId
      }));

      const record: InspectionRecord = { 
          id: inspectionId, 
          type: inspectionType, 
          location: location, 
          date: inspectionDate, 
          timestamp: new Date().toISOString(), 
          status: failedItems.length > 0 ? 'Flagged' : 'Pass', 
          score, 
          items: checklist, 
          ncrs: linkedNcrs,
          auditLogs: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'Inspection Completed', details: `Score: ${score}%` }] 
      };
      
      const newHistory = [record, ...history];
      setHistory(newHistory);
      localStorage.setItem('hse_inspection_history', JSON.stringify(newHistory));
      
      // Reset
      setIsGenerated(false); 
      setChecklist([]); 
      setNcrs([]);
      setLocation(''); 
      setActiveTab('history');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Site Inspections</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Audit & Non-Conformance Management</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { setActiveTab('new'); setSelectedRecord(null); }} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === 'new' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>New Inspection</button>
            <button onClick={() => { setActiveTab('history'); setSelectedRecord(null); }} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>History</button>
        </div>
      </div>

      {activeTab === 'new' ? (
        !isGenerated ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Configure Protocol</h3>
                <form onSubmit={handleGenerate} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Checklist Type</label>
                            <select 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" 
                                value={inspectionType} 
                                onChange={(e) => setInspectionType(e.target.value)}
                            >
                                <option>Heavy Machinery</option>
                                <option>Scaffolding</option>
                                <option>Excavation</option>
                                <option>Chemical Storage</option>
                                <option>Electrical Safety</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inspection Date</label>
                            <input 
                                type="date" 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                                value={inspectionDate}
                                onChange={(e) => setInspectionDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <LocationSelector value={location} onChange={setLocation} required />
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <BrainCircuit size={16}/>} Generate AI Checklist
                    </button>
                </form>
            </div>
        ) : (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase">{inspectionType}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{location}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={12}/> {inspectionDate}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs font-bold">
                        <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-500">Total: {checklist.length}</div>
                        <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg">Open NCRs: {ncrs.length}</div>
                    </div>
                </div>

                {/* Hidden File Input for Camera */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageCapture} 
                />

                {/* Checklist */}
                <div className="space-y-4">
                    {checklist.map(item => (
                        <div key={item.id} className={`p-6 rounded-[2rem] border-2 transition-all ${
                            item.status === 'Fail' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 pr-4">
                                    <p className="font-bold text-slate-800 text-sm">{item.question}</p>
                                    {item.image && (
                                        <div className="mt-3 relative w-fit group">
                                            <img src={item.image} alt="Evidence" className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                            <button 
                                                onClick={() => removeImage(item.id)} 
                                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-slate-100 hover:bg-red-50 hover:scale-110 transition-transform"
                                            >
                                                <X size={10}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => triggerCamera(item.id)} 
                                        className={`p-2 rounded-lg transition-all border flex items-center justify-center w-8 h-8 ${
                                            item.image ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-500'
                                        }`}
                                        title="Capture Evidence"
                                    >
                                        <Camera size={16}/>
                                    </button>
                                    <button onClick={() => updateStatus(item.id, 'Pass')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${item.status === 'Pass' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Pass</button>
                                    <button onClick={() => updateStatus(item.id, 'Fail')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${item.status === 'Fail' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Fail</button>
                                    <button onClick={() => updateStatus(item.id, 'NA')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${item.status === 'NA' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-400'}`}>N/A</button>
                                </div>
                            </div>
                            
                            {/* Integrated NCR Panel */}
                            {item.status === 'Fail' && item.ncrId && (
                                <div className="mt-4 p-6 bg-white rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-2 shadow-inner">
                                    <div className="flex items-center gap-2 text-red-600 mb-4 border-b border-red-50 pb-2">
                                        <Gavel size={16}/>
                                        <span className="text-xs font-black uppercase tracking-widest">Automatic Non-Conformance Report (NCR)</span>
                                        <span className="text-[9px] bg-red-100 px-2 py-0.5 rounded text-red-700 font-bold ml-auto">{item.ncrId}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Corrective Action Plan <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-300 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 placeholder:text-slate-400"
                                                placeholder="Describe immediate fix..." 
                                                value={ncrs.find(n => n.id === item.ncrId)?.correctiveAction || ''}
                                                onChange={(e) => updateNCR(item.ncrId!, 'correctiveAction', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assign Accountability <span className="text-red-500">*</span></label>
                                            <select 
                                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-300 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                                                value={ncrs.find(n => n.id === item.ncrId)?.assignedTo || 'Site_Supervisor'}
                                                onChange={(e) => updateNCR(item.ncrId!, 'assignedTo', e.target.value)}
                                            >
                                                <option value="Site_Supervisor">Site Supervisor</option>
                                                <option value="Maintenance_Team">Maintenance Team</option>
                                                <option value="HSE_Officer">HSE Officer</option>
                                                <option value="External_Contractor">External Contractor</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={handleComplete} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-slate-800 shadow-2xl transition">
                    Submit Inspection Report
                </button>
            </div>
        )
      ) : (
        selectedRecord ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button onClick={() => setSelectedRecord(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4">
                    <ChevronRight className="rotate-180" size={14}/> Back to History
                </button>
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${selectedRecord.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{selectedRecord.status}</span>
                            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mt-4">{selectedRecord.type}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedRecord.location} • {selectedRecord.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                            <p className="text-5xl font-black text-slate-800 tracking-tighter">{selectedRecord.score}%</p>
                        </div>
                    </div>

                    {selectedRecord.ncrs && selectedRecord.ncrs.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldAlert size={16} className="text-red-500"/> Non-Conformance Reports (NCR)
                            </h4>
                            <div className="grid gap-4">
                                {selectedRecord.ncrs.map(ncr => (
                                    <div key={ncr.id} className="p-6 bg-red-50 rounded-2xl border-2 border-red-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{ncr.id}</span>
                                            <span className="text-[9px] font-black text-red-400 bg-white px-2 py-0.5 rounded border border-red-100">{ncr.status}</span>
                                        </div>
                                        <p className="text-sm font-bold text-red-900 mb-4">{ncr.description}</p>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-[9px] font-black text-red-400 uppercase block">Action</span>
                                                <span className="font-bold text-red-800">{ncr.correctiveAction || 'Pending'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-red-400 uppercase block">Assigned To</span>
                                                <span className="font-bold text-red-800">{ncr.assignedTo}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Inspection Items</h4>
                        <div className="space-y-3">
                            {selectedRecord.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        {item.image && (
                                            <img src={item.image} alt="Evidence" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                        )}
                                        <p className="text-xs font-bold text-slate-700">{item.question}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                        item.status === 'Pass' ? 'text-emerald-600 bg-emerald-100' : 
                                        item.status === 'Fail' ? 'text-red-600 bg-red-100' : 'text-slate-500 bg-slate-200'
                                    }`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
                    {/* Search and Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 placeholder:text-slate-400"
                                placeholder="Search by ID, Location, Type or Status..." 
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button className="px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl border-2 border-transparent hover:border-slate-200 font-bold text-xs uppercase flex items-center gap-2 transition-colors">
                                <Filter size={16}/> Filters
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-slate-50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('type')}>
                                        <div className="flex items-center gap-1">Type {getSortIcon('type')}</div>
                                    </th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('location')}>
                                        <div className="flex items-center gap-1">Location {getSortIcon('location')}</div>
                                    </th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1">Date {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('status')}>
                                        <div className="flex items-center justify-center gap-1">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('score')}>
                                        <div className="flex items-center justify-center gap-1">Score {getSortIcon('score')}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedHistory.length > 0 ? processedHistory.map(rec => (
                                    <tr key={rec.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedRecord(rec)}>
                                        <td className="px-6 py-5 font-mono font-bold text-indigo-600 text-xs group-hover:underline">{rec.id}</td>
                                        <td className="px-6 py-5 text-slate-600 text-xs font-bold uppercase">{rec.type}</td>
                                        <td className="px-6 py-5 font-bold text-slate-700">{rec.location}</td>
                                        <td className="px-6 py-5 text-slate-500 text-xs font-mono">{rec.date}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${rec.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-200'}`}>{rec.status}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`font-black ${rec.score >= 80 ? 'text-emerald-600' : rec.score >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                                                {rec.score}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No inspection records match criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
      )}
    </div>
  );
};

export default InspectionModule;
