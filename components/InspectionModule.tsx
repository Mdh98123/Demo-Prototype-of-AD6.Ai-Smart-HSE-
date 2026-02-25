import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { generateInspectionChecklist, suggestAuditFinding } from '../services/geminiService';
import { InspectionItem, NCR } from '../types';
import LocationSelector from './LocationSelector';
import { 
  ClipboardCheck, Loader2, Plus, AlertOctagon, CheckCircle2, 
  XCircle, MinusCircle, Camera, FileText, ChevronRight,
  Filter, Search, AlertTriangle, ShieldAlert, History,
  Save, Play, AlertCircle
} from 'lucide-react';

interface InspectionModuleProps {
  initialTab?: 'new' | 'history';
}

interface InspectionRecord {
    id: string;
    type: string;
    location: string;
    date: string;
    inspector: string;
    score: number;
    status: 'Completed' | 'Draft';
    items: InspectionItem[];
}

const InspectionModule: React.FC<InspectionModuleProps> = ({ initialTab = 'history' }) => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  
  // New Inspection State
  const [inspectionType, setInspectionType] = useState('Heavy Machinery');
  const [location, setLocation] = useState('');
  const [context, setContext] = useState('');
  const [checklist, setChecklist] = useState<InspectionItem[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [currentInspectionId] = useState(`INSP-${Date.now()}`);
  const [aiError, setAiError] = useState<string | null>(null);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
      const saved = localStorage.getItem('hse_inspection_history');
      if (saved) setHistory(JSON.parse(saved));
  }, []);

  const validate = (field: string, value: any) => {
      let error = "";
      if (field === 'location' && !value) error = "Target Location is required.";
      return error;
  };

  const handleGenerate = async () => {
      const locErr = validate('location', location);
      setErrors({ location: locErr });
      setTouched({ location: true });

      if (locErr) return;

      setLoading(true);
      try {
          const items = await generateInspectionChecklist(inspectionType, location, context);
          setChecklist(items);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const createNCR = async (item: InspectionItem) => {
      const ncrId = `NCR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Basic NCR initially
      const newNCR: NCR = {
          id: ncrId,
          inspectionId: currentInspectionId,
          itemId: item.id,
          description: `Compliance failure: ${item.question}`,
          severity: 'Major', // Defaulting to Major as Medium is not in NCR type
          assignedTo: 'Site Supervisor',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'Open'
      };

      setNcrs(prev => [...prev, newNCR]);

      // Enhance with AI in background
      try {
          const suggestion = await suggestAuditFinding(item.question, item.regulationReference);
          setNcrs(prev => prev.map(n => n.id === ncrId ? {
              ...n,
              description: suggestion.description || n.description,
              severity: suggestion.severity || n.severity,
              correctiveAction: suggestion.correctiveAction
          } : n));
      } catch (e) {
          // ignore background failure
      }

      return ncrId;
  };

  const removeNCR = (ncrId: string) => {
      setNcrs(prev => prev.filter(n => n.id !== ncrId));
  };

  const updateStatus = async (id: string, status: 'Pass' | 'Fail' | 'NA') => {
      // Find item to check current status
      const currentItem = checklist.find(i => i.id === id);
      if (!currentItem) return;

      let ncrId = currentItem.ncrId;

      if (status === 'Fail' && !ncrId) {
          ncrId = await createNCR(currentItem);
      } else if (status !== 'Fail' && ncrId) {
          removeNCR(ncrId);
          ncrId = undefined;
      }

      setChecklist(prev => prev.map(item => 
          item.id === id ? { ...item, status, ncrId } : item
      ));
  };

  const saveInspection = () => {
      // Refined scoring: Exclude N/A from denominator
      const applicableItems = checklist.filter(i => i.status !== 'NA');
      const passedItems = applicableItems.filter(i => i.status === 'Pass');
      
      // If all are N/A, consider it 100% compliant (or 0% risk)
      const score = applicableItems.length > 0 
          ? Math.round((passedItems.length / applicableItems.length) * 100) 
          : 100;

      const record: InspectionRecord = {
          id: currentInspectionId,
          type: inspectionType,
          location,
          date: new Date().toISOString(),
          inspector: currentUser.name,
          score,
          status: 'Completed',
          items: checklist
      };

      const newHistory = [record, ...history];
      setHistory(newHistory);
      localStorage.setItem('hse_inspection_history', JSON.stringify(newHistory));
      
      // Reset
      setChecklist([]);
      setNcrs([]);
      setLocation('');
      setActiveTab('history');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                <ClipboardCheck size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Inspections</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-indigo-500 pl-4">Field Verification & NCR Generation</p>
            </div>
          </div>
          <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  History
              </button>
              <button 
                onClick={() => setActiveTab('new')}
                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  New Inspection
              </button>
          </div>
      </div>

      {activeTab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Setup Inspection</h3>
                      
                      <div className="space-y-5">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Inspection Type</label>
                              <select 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all"
                                value={inspectionType}
                                onChange={(e) => setInspectionType(e.target.value)}
                              >
                                  <option>Heavy Machinery</option>
                                  <option>Site Conditions</option>
                                  <option>Electrical Safety</option>
                                  <option>Working at Height</option>
                                  <option>Chemical Storage</option>
                                  <option>Fire Safety</option>
                              </select>
                          </div>

                          <LocationSelector 
                              value={location} 
                              onChange={(val) => {
                                  setLocation(val);
                                  if(touched.location) setErrors(prev => ({...prev, location: validate('location', val)}));
                              }}
                              label="Target Location"
                              required
                              error={errors.location}
                          />

                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Context / Focus Area</label>
                              <textarea 
                                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all h-24 resize-none"
                                  placeholder="e.g. Focus on hydraulic systems..."
                                  value={context}
                                  onChange={(e) => setContext(e.target.value)}
                              />
                          </div>

                          <button 
                              onClick={handleGenerate}
                              disabled={loading}
                              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                              {loading ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
                              {aiError ? 'Retry Generation' : 'Generate Checklist'}
                          </button>

                          {aiError && (
                              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5"/>
                                  <p className="text-[10px] font-bold text-red-600 leading-tight">{aiError}</p>
                              </div>
                          )}
                      </div>
                  </div>

                  {ncrs.length > 0 && (
                      <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 shadow-xl">
                          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <ShieldAlert size={16}/> Active NCRs
                          </h3>
                          <div className="space-y-3">
                              {ncrs.map(ncr => (
                                  <div key={ncr.id} className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">{ncr.severity}</span>
                                          <span className="text-[9px] font-mono text-slate-400">{ncr.id.split('-')[1]}</span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-700 leading-tight">{ncr.description}</p>
                                      {ncr.correctiveAction && (
                                          <p className="text-[10px] text-slate-500 mt-2 border-l-2 border-red-200 pl-2">Fix: {ncr.correctiveAction}</p>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              <div className="lg:col-span-8">
                  {checklist.length > 0 ? (
                      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Audit Protocol</h3>
                              <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{checklist.filter(i => i.status !== 'Pending').length} / {checklist.length} Checked</span>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                              {checklist.map((item, idx) => (
                                  <div key={item.id} className={`p-6 rounded-[2rem] border-2 transition-all ${
                                      item.status === 'Fail' ? 'border-red-100 bg-red-50/20' : 
                                      item.status === 'Pass' ? 'border-emerald-100 bg-emerald-50/20' :
                                      'border-slate-50 bg-white hover:border-slate-200'
                                  }`}>
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex gap-4">
                                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 shrink-0">
                                                  {idx + 1}
                                              </div>
                                              <div>
                                                  <p className="text-sm font-bold text-slate-800">{item.question}</p>
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wide">{item.regulationReference}</p>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="flex gap-2 ml-12">
                                          <button 
                                              onClick={() => updateStatus(item.id, 'Pass')}
                                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                  item.status === 'Pass' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                                              }`}
                                          >
                                              <CheckCircle2 size={14}/> Pass
                                          </button>
                                          <button 
                                              onClick={() => updateStatus(item.id, 'Fail')}
                                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                  item.status === 'Fail' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'
                                              }`}
                                          >
                                              <XCircle size={14}/> Fail
                                          </button>
                                          <button 
                                              onClick={() => updateStatus(item.id, 'NA')}
                                              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                  item.status === 'NA' ? 'bg-slate-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                              }`}
                                          >
                                              N/A
                                          </button>
                                          <button className="px-4 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition">
                                              <Camera size={16}/>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                              <button 
                                  onClick={saveInspection}
                                  disabled={checklist.some(i => i.status === 'Pending')}
                                  className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                              >
                                  <Save size={18}/> Submit Inspection Report
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="h-full bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                          <div className="bg-slate-50 p-8 rounded-full mb-6 animate-pulse">
                              <ClipboardCheck size={64} className="opacity-20 text-slate-900"/>
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Awaiting Configuration</h3>
                          <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm">Select a type and location to generate an AI-powered compliance checklist.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'history' && (
          <div className="space-y-6">
              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Inspection Ledger</h3>
                      <div className="relative">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <input type="text" placeholder="Search history..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-64"/>
                      </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {history.length > 0 ? history.map(record => (
                          <div key={record.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between group cursor-pointer">
                              <div className="flex items-center gap-6">
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                                      record.score >= 90 ? 'bg-emerald-50 text-emerald-600' :
                                      record.score >= 70 ? 'bg-orange-50 text-orange-600' :
                                      'bg-red-50 text-red-600'
                                  }`}>
                                      {record.score}%
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{record.type}</h4>
                                      <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1"><History size={12}/> {new Date(record.date).toLocaleDateString()}</span>
                                          <span className="flex items-center gap-1"><AlertTriangle size={12}/> {record.items.filter(i => i.status === 'Fail').length} Issues</span>
                                          <span>{record.location}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspector</p>
                                      <p className="text-xs font-bold text-slate-700">{record.inspector}</p>
                                  </div>
                                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                      <ChevronRight size={20}/>
                                  </button>
                              </div>
                          </div>
                      )) : (
                          <div className="p-20 text-center text-slate-300">
                              <History size={48} className="mx-auto mb-4 opacity-30"/>
                              <p className="text-xs font-black uppercase tracking-widest">No inspection records found.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default InspectionModule;