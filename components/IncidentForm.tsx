
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { classifyIncident, generateIncidentRCA, generateCustomIncidentReport, predictSIF } from '../services/geminiService';
import { AIIncidentAnalysis, IncidentRCA, Incident, AuditLog, SIFPrecursor } from '../types';
import LocationSelector from './LocationSelector';
import { 
  AlertOctagon, BrainCircuit, Loader2, Plus, 
  ShieldAlert, ExternalLink, 
  Clock, Camera, X, Search,
  Filter, ArrowLeft, Sparkles, FileText, CheckCircle2, AlertTriangle, MessageSquare, Download, AlertCircle, Lock,
  ChevronRight, Printer, UserCheck, ToggleLeft, ToggleRight, History, Send
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const IncidentForm: React.FC = () => {
  const { currentUser, activeFramework } = useUser();
  const fileInputRefs = useRef<HTMLInputElement>(null);

  // App State
  const [viewState, setViewState] = useState<'Registry' | 'Investigation'>('Registry');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentType, setIncidentType] = useState('Safety Hazard');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [images, setImages] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [errors, setErrors] = useState<{ description?: string; location?: string }>({});
  const [touched, setTouched] = useState<{ description?: boolean; location?: boolean }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreAnalyzing, setIsPreAnalyzing] = useState(false);

  // Investigation AI State
  const [activeAiTab, setActiveAiTab] = useState<'Analysis' | 'RCA' | 'SIF' | 'Report'>('Analysis');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIIncidentAnalysis | null>(null);
  
  // FEAT-002: AI-IncidentRCAAssistant State
  const [rcaInput, setRcaInput] = useState('');
  const [includeHistorical, setIncludeHistorical] = useState(true);
  const [rcaResult, setRcaResult] = useState<IncidentRCA | null>(null);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  const [sifResult, setSifResult] = useState<SIFPrecursor | null>(null);

  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<'OSHAD_Form_E' | 'ADNOC_Flash_Report' | 'Internal_Memo'>('OSHAD_Form_E');

  // RBAC Checks
  const canInvestigate = useMemo(() => {
      const allowedRoles = ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'];
      return allowedRoles.includes(currentUser.role);
  }, [currentUser.role]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('hse_incident_registry');
    if (saved) {
        setIncidents(JSON.parse(saved));
    } else {
        const initial: Incident[] = [
            { id: 'INC-772', type: 'Equipment Failure', description: 'Hydraulic leak on generator set A4 during startup. Oil sprayed onto hot manifold causing minor smoke.', location: 'Ruwais Refinery Zone A', status: 'Review' as any, timestamp: new Date(Date.now() - 86400000).toISOString(), reportedBy: 'u6', reportedByName: 'Rahul Gupta', auditLog: [], images: [], reportDeadline: new Date(Date.now() + 172800000).toISOString(), severity: 'Medium' },
            { id: 'INC-781', type: 'Near Miss', description: 'Dropped object from height (wrench) landing in exclusion zone.', location: 'Ruwais Refinery Zone A', status: 'Investigation', timestamp: new Date(Date.now() - 1200000).toISOString(), reportedBy: 'u5', reportedByName: 'Fatima Al-Kaabi', auditLog: [], images: [], reportDeadline: new Date(Date.now() + 258000000).toISOString(), severity: 'Critical' }
        ];
        setIncidents(initial);
        localStorage.setItem('hse_incident_registry', JSON.stringify(initial));
    }
  }, []);

  const saveRegistry = (updated: Incident[]) => {
      setIncidents(updated);
      localStorage.setItem('hse_incident_registry', JSON.stringify(updated));
  };

  const resetForm = () => {
      setDescription('');
      setLocation('');
      setIncidentType('Safety Hazard');
      setSeverity('Low');
      setImages([]);
      setCoordinates(null);
      setAnalysisResult(null);
      setRcaResult(null);
      setRcaInput('');
      setGeneratedReport('');
      setErrors({});
      setTouched({});
  };

  const validate = (field: string, value: string) => {
      let error = "";
      if (field === 'description') {
          if (!value.trim()) error = "Description is mandatory.";
          else if (value.length < 10) error = "Description must be at least 10 characters.";
      }
      if (field === 'location') {
          if (!value.trim()) error = "Location is required.";
      }
      return error;
  };

  // AI Pre-Analysis for New Reports
  const handlePreAnalyze = async () => {
      if (!description || !location) return;
      setIsPreAnalyzing(true);
      try {
          const result = await classifyIncident(description, location, activeFramework);
          if (result) {
              setIncidentType(result.type);
              setSeverity(result.severity as any);
          }
      } catch (error) {
          console.error("Analysis failed");
      } finally {
          setIsPreAnalyzing(false);
      }
  };

  const handleWorkerSubmit = async () => {
      const descError = validate('description', description);
      const locError = validate('location', location);
      setErrors({ description: descError, location: locError });
      setTouched({ description: true, location: true });

      if (descError || locError) return;

      setIsSubmitting(true);
      
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 72); 

      const newIncident: Incident = {
          id: `INC-${Date.now().toString().slice(-4)}`,
          type: incidentType,
          description,
          location,
          images,
          severity,
          coordinates: coordinates || undefined,
          timestamp: new Date().toISOString(),
          reportedBy: currentUser.id,
          reportedByName: currentUser.name,
          status: 'Reported',
          reportDeadline: deadline.toISOString(),
          auditLog: [{ timestamp: new Date().toISOString(), actorId: currentUser.id, actorName: currentUser.name, action: 'Field Report Created', details: 'Submitted via worker mobile terminal.' }]
      };

      const updated = [newIncident, ...incidents];
      saveRegistry(updated);
      setIsSubmitting(false);
      resetForm();
      setIsReportModalOpen(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          Array.from(e.target.files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setImages(prev => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file as Blob);
          });
      }
  };

  // Investigation AI Handlers
  const runInvestigationAnalysis = async () => {
      if (!selectedIncident) return;
      setIsAiLoading(true);
      try {
          const result = await classifyIncident(selectedIncident.description, selectedIncident.location, activeFramework);
          setAnalysisResult(result);
      } catch (e) { alert("Analysis failed"); } 
      finally { setIsAiLoading(false); }
  };

  // FEAT-002 Implementation
  const runRCA = async () => {
      if (!rcaInput.trim()) {
          alert("Please enter witness statements or context.");
          return;
      }
      setIsAiLoading(true);
      try {
          const result = await generateIncidentRCA(rcaInput, includeHistorical);
          setRcaResult(result);
          setSelectedCause(null);
      } catch (e) { 
          alert("RCA generation failed"); 
      } finally { 
          setIsAiLoading(false); 
      }
  };

  const runSIFPrediction = async () => {
    if (!selectedIncident) return;
    setIsAiLoading(true);
    try {
        const result = await predictSIF(selectedIncident.description);
        setSifResult(result);
    } catch (e) {
        alert("SIF prediction failed");
    } finally {
        setIsAiLoading(false);
    }
  };

  const runReportGeneration = async () => {
      if (!selectedIncident) return;
      setIsAiLoading(true);
      try {
          const report = await generateCustomIncidentReport(selectedIncident, {
              format: reportFormat,
              tone: 'Technical',
              includeRca: !!rcaResult,
              includeEvidence: true,
              includeAuditTrail: true,
              includeWeather: true,
              includeWitness: false
          });
          setGeneratedReport(report);
      } catch (e) { alert("Report generation failed"); } 
      finally { setIsAiLoading(false); }
  };

  const filteredIncidents = useMemo(() => {
    if (['Worker', 'Contractor'].includes(currentUser.role)) {
        return incidents.filter(i => i.reportedBy === currentUser.id);
    }
    return incidents;
  }, [incidents, currentUser]);

  const getSeverityStyle = (sev?: string) => {
      switch(sev) {
          case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
          case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
          case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
  };

  return (
    <>
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          {viewState === 'Registry' && (
              <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
                      <div className="flex items-center space-x-5">
                        <div className="bg-red-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-red-500/20">
                            <AlertOctagon size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Incident Registry</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-red-500 pl-4">Event Tracking & Investigation</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { resetForm(); setIsReportModalOpen(true); }} 
                        className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95"
                      >
                          <Plus size={18} /> New Report
                      </button>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                  <tr>
                                      <th className="px-8 py-6">ID</th>
                                      <th className="px-8 py-6">Type / Description</th>
                                      <th className="px-8 py-6">Location</th>
                                      <th className="px-8 py-6">Severity</th>
                                      <th className="px-8 py-6">Status</th>
                                      <th className="px-8 py-6 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredIncidents.map(inc => (
                                      <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors group">
                                          <td className="px-8 py-6 font-mono font-bold text-indigo-600 text-xs">{inc.id}</td>
                                          <td className="px-8 py-6">
                                              <p className="font-bold text-slate-800 text-sm uppercase mb-1">{inc.type || 'General Incident'}</p>
                                              <p className="text-xs text-slate-500 truncate max-w-xs font-medium">{inc.description}</p>
                                          </td>
                                          <td className="px-8 py-6 font-bold text-xs uppercase text-slate-600">{inc.location}</td>
                                          <td className="px-8 py-6">
                                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getSeverityStyle(inc.severity)}`}>
                                                  {inc.severity || 'Low'}
                                              </span>
                                          </td>
                                          <td className="px-8 py-6">
                                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                                  inc.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 
                                                  'bg-blue-50 text-blue-700 border-blue-100'
                                              }`}>
                                                  {inc.status}
                                              </span>
                                          </td>
                                          <td className="px-8 py-6 text-right">
                                              <button 
                                                onClick={() => { setSelectedIncident(inc); setViewState('Investigation'); }}
                                                className="bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 p-2 rounded-xl transition-all shadow-sm active:scale-95"
                                              >
                                                  <ChevronRight size={18} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                                  {filteredIncidents.length === 0 && (
                                      <tr>
                                          <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                              No incidents found in registry.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </>
          )}

          {/* Investigation View */}
          {viewState === 'Investigation' && selectedIncident && (
              <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                   <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                          <button onClick={() => setViewState('Registry')} className="bg-white border-2 border-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                              <ArrowLeft size={20} />
                          </button>
                          <div>
                              <div className="flex items-center gap-3">
                                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedIncident.id}</h1>
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getSeverityStyle(selectedIncident.severity)}`}>{selectedIncident.severity}</span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(selectedIncident.timestamp).toLocaleString()}</span>
                                  <span className="flex items-center gap-1"><UserCheck size={12}/> Reported by {selectedIncident.reportedByName}</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                          <button className="flex-1 md:flex-none bg-white border-2 border-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition-all shadow-sm">Export PDF</button>
                          {canInvestigate && <button className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-lg">Close Case</button>}
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Details */}
                      <div className="lg:col-span-1 space-y-6">
                          <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FileText size={16}/> Case Details</h3>
                              
                              <div className="space-y-6">
                                  <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Description</p>
                                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedIncident.description}"</p>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                          <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Type</p>
                                          <p className="text-xs font-bold text-slate-800">{selectedIncident.type}</p>
                                      </div>
                                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                          <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Location</p>
                                          <p className="text-xs font-bold text-slate-800 truncate">{selectedIncident.location}</p>
                                      </div>
                                  </div>

                                  <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Evidence Gallery</p>
                                      {selectedIncident.images && selectedIncident.images.length > 0 ? (
                                          <div className="grid grid-cols-3 gap-2">
                                              {selectedIncident.images.map((img, i) => (
                                                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer">
                                                      <img src={img} alt="evidence" className="w-full h-full object-cover"/>
                                                  </div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                              <Camera size={24} className="mx-auto text-slate-300 mb-2"/>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase">No images attached</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right Column: AI Investigation Tools (RBAC Gated) */}
                      <div className="lg:col-span-2 space-y-6">
                          {canInvestigate ? (
                              <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col h-full relative overflow-hidden">
                                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10 gap-4">
                                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                          <BrainCircuit size={24} className="text-indigo-600"/> AI Investigation Suite
                                      </h3>
                                      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                                          {['Analysis', 'RCA', 'SIF', 'Report'].map(tab => (
                                              <button 
                                                key={tab}
                                                onClick={() => setActiveAiTab(tab as any)} 
                                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeAiTab === tab ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                                              >
                                                  {tab}
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="flex-1 min-h-[400px] relative z-10">
                                      {activeAiTab === 'Analysis' && (
                                          <div className="space-y-6 animate-in fade-in">
                                              {!analysisResult ? (
                                                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                      <div className="bg-white p-6 rounded-full shadow-lg mb-6"><Sparkles size={32} className="text-indigo-500"/></div>
                                                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Initial AI Triage</h4>
                                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 max-w-xs">Run classification to determine regulatory severity and immediate control measures.</p>
                                                      <button onClick={runInvestigationAnalysis} disabled={isAiLoading} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                                                          {isAiLoading ? <Loader2 className="animate-spin" size={16}/> : <BrainCircuit size={16}/>} Execute Analysis
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div className="space-y-6">
                                                      <div className="flex flex-col md:flex-row gap-6">
                                                          <div className="flex-1 bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 relative overflow-hidden">
                                                              <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={80}/></div>
                                                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Severity Rating</p>
                                                              <p className="text-3xl font-black text-indigo-700">{analysisResult.severity}</p>
                                                          </div>
                                                          <div className="flex-1 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classified Type</p>
                                                              <p className="text-xl font-black text-slate-700">{analysisResult.type}</p>
                                                          </div>
                                                      </div>
                                                      <div className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] shadow-sm">
                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14}/> Immediate Recommendations</p>
                                                          <ul className="space-y-3">
                                                              {analysisResult.recommendations?.map((rec, i) => (
                                                                  <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                                                      {rec}
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      )}

                                      {activeAiTab === 'RCA' && (
                                          <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                                              <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 mb-4">
                                                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Witness Statements & Observations</label>
                                                  <textarea 
                                                      className="w-full bg-white rounded-xl p-4 text-xs font-medium text-slate-700 outline-none border-2 border-indigo-100 focus:border-indigo-300 resize-none h-32 focus:ring-4 focus:ring-indigo-100 transition-all"
                                                      placeholder="Paste witness statements, notes, or observations here..."
                                                      value={rcaInput}
                                                      onChange={(e) => setRcaInput(e.target.value)}
                                                  />
                                                  <div className="flex flex-col md:flex-row justify-between items-center mt-3 gap-4">
                                                      <button 
                                                          onClick={() => setIncludeHistorical(!includeHistorical)}
                                                          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${includeHistorical ? 'text-indigo-600' : 'text-slate-400'}`}
                                                      >
                                                          {includeHistorical ? <ToggleRight size={24} className="text-indigo-600"/> : <ToggleLeft size={24}/>} 
                                                          Include Historical Matches
                                                      </button>
                                                      <button 
                                                          onClick={runRCA}
                                                          disabled={isAiLoading || !rcaInput}
                                                          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                                      >
                                                          {isAiLoading ? <Loader2 className="animate-spin" size={14}/> : <BrainCircuit size={14}/>} Analyze Root Cause
                                                      </button>
                                                  </div>
                                              </div>

                                              {rcaResult && (
                                                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                                      <div>
                                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Hypothesis (5-Whys Analysis)</p>
                                                          <div className="space-y-2">
                                                              {rcaResult.suggested_root_causes?.map((cause, idx) => (
                                                                  <div 
                                                                    key={idx} 
                                                                    onClick={() => setSelectedCause(cause.cause)}
                                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedCause === cause.cause ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                                                                  >
                                                                      <div className="flex items-center gap-3">
                                                                          <div className={`w-2 h-2 rounded-full ${selectedCause === cause.cause ? 'bg-white' : 'bg-indigo-500'}`}></div>
                                                                          <span className={`text-xs font-bold ${selectedCause === cause.cause ? 'text-white' : 'text-slate-700'}`}>{cause.cause}</span>
                                                                      </div>
                                                                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${selectedCause === cause.cause ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{(cause.confidence * 100).toFixed(0)}% Conf.</span>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>

                                                      {selectedCause && (
                                                          <div className="animate-in slide-in-from-bottom-2 fade-in">
                                                              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-4">
                                                                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 size={12}/> Recommended Actions</p>
                                                                  <ul className="space-y-2">
                                                                      {rcaResult.corrective_actions?.map((action, i) => (
                                                                          <li key={i} className="text-xs font-bold text-emerald-800 flex items-start gap-2">
                                                                              <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 block shrink-0"></span>
                                                                              {action}
                                                                          </li>
                                                                      ))}
                                                                  </ul>
                                                              </div>
                                                              
                                                              {rcaResult.similar_incidents && rcaResult.similar_incidents.length > 0 && (
                                                                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><History size={12}/> Pattern Match</p>
                                                                      <div className="flex flex-wrap gap-2">
                                                                          {rcaResult.similar_incidents.map((inc, i) => (
                                                                              <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{inc}</span>
                                                                          ))}
                                                                      </div>
                                                                  </div>
                                                              )}
                                                          </div>
                                                      )}
                                                  </div>
                                              )}
                                          </div>
                                      )}

                                      {activeAiTab === 'SIF' && (
                                          <div className="space-y-6 animate-in fade-in">
                                              {!sifResult ? (
                                                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                      <div className="bg-white p-6 rounded-full shadow-lg mb-6"><ShieldAlert size={32} className="text-red-500"/></div>
                                                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">SIF Potential Analysis</h4>
                                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 max-w-xs">Predict Serious Injury or Fatality potential based on incident dynamics.</p>
                                                      <button onClick={runSIFPrediction} disabled={isAiLoading} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                                                          {isAiLoading ? <Loader2 className="animate-spin" size={16}/> : <BrainCircuit size={16}/>} Predict SIF Potential
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div className="space-y-6">
                                                      <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden ${sifResult.is_sif_potential ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                                          <div className="flex justify-between items-start">
                                                              <div>
                                                                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${sifResult.is_sif_potential ? 'text-red-400' : 'text-emerald-400'}`}>SIF Potential Status</p>
                                                                  <h4 className={`text-3xl font-black uppercase tracking-tighter ${sifResult.is_sif_potential ? 'text-red-700' : 'text-emerald-700'}`}>
                                                                      {sifResult.is_sif_potential ? 'High Potential' : 'Low Potential'}
                                                                  </h4>
                                                              </div>
                                                              <div className={`px-4 py-2 rounded-xl font-black text-white text-xs ${sifResult.is_sif_potential ? 'bg-red-600' : 'bg-emerald-600'}`}>
                                                                  {(sifResult.confidence * 100).toFixed(0)}% Confidence
                                                              </div>
                                                          </div>
                                                          <p className={`mt-4 text-sm font-bold leading-relaxed ${sifResult.is_sif_potential ? 'text-red-900' : 'text-emerald-900'}`}>
                                                              {sifResult.reasoning}
                                                          </p>
                                                      </div>

                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                          <div className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] shadow-sm">
                                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">Exposure Factors</p>
                                                              <div className="space-y-2">
                                                                  {sifResult.exposure_factors.map((factor, i) => (
                                                                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                                          {factor}
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          </div>
                                                          <div className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] shadow-sm">
                                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">Critical Controls Missing</p>
                                                              <div className="space-y-2">
                                                                  {sifResult.critical_controls_missing.map((control, i) => (
                                                                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-red-600">
                                                                          <AlertTriangle size={12}/>
                                                                          {control}
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      )}

                                      {activeAiTab === 'Report' && (
                                          <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                                              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                                  <div className="w-full md:w-auto">
                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Regulatory Format</label>
                                                      <select 
                                                          className="w-full md:w-auto p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                          value={reportFormat}
                                                          onChange={(e) => setReportFormat(e.target.value as any)}
                                                      >
                                                          <option value="OSHAD_Form_E">OSHAD Form E</option>
                                                          <option value="ADNOC_Flash_Report">ADNOC Flash Report</option>
                                                          <option value="Internal_Memo">Internal Memo</option>
                                                      </select>
                                                  </div>
                                                  <button 
                                                      onClick={runReportGeneration}
                                                      disabled={isAiLoading}
                                                      className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                  >
                                                      {isAiLoading ? <Loader2 className="animate-spin" size={14}/> : <FileText size={14}/>} Draft Report
                                                  </button>
                                              </div>

                                              <div className="flex-1 bg-slate-50 rounded-[2rem] border-2 border-slate-100 p-6 overflow-y-auto custom-scrollbar relative">
                                                  {generatedReport ? (
                                                      <div className="prose prose-sm prose-slate max-w-none">
                                                          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700">{generatedReport}</pre>
                                                      </div>
                                                  ) : (
                                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                          <FileText size={48} className="mb-4 opacity-20"/>
                                                          <p className="text-xs font-bold uppercase tracking-widest">No report generated yet.</p>
                                                      </div>
                                                  )}
                                              </div>
                                              
                                              {generatedReport && (
                                                  <div className="flex gap-4">
                                                      <button className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                                                          <Printer size={16}/> Print / PDF
                                                      </button>
                                                      <button className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2">
                                                          <Send size={16}/> Submit to Authority
                                                      </button>
                                                  </div>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ) : (
                              <div className="h-full bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                                  <div className="bg-white p-6 rounded-full shadow-sm mb-6"><Lock size={32} className="text-slate-300"/></div>
                                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Restricted Access</h4>
                                  <p className="text-xs text-slate-400 font-medium max-w-xs mt-2">Investigation tools are reserved for HSE Officers and Site Managers.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
          
          {/* New Incident Modal Code Omitted for Brevity as it was not changed */}
          {isReportModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl p-6 md:p-10 border-4 border-white animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">New Field Report</h3>
                          <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                      </div>
                      
                      <div className="space-y-6">
                          <LocationSelector 
                              value={location} 
                              onChange={(val) => {
                                  setLocation(val);
                                  if(touched.location) setErrors(prev => ({...prev, location: validate('location', val)}));
                              }}
                              required 
                              label="Incident Location"
                              error={errors.location}
                          />

                          <div className="relative">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description <span className="text-red-500">*</span></label>
                              <textarea 
                                  className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all resize-none h-32 ${errors.description ? 'border-red-500 bg-red-50/10' : touched.description && description ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-indigo-500'}`}
                                  placeholder="Describe what happened..."
                                  value={description}
                                  onChange={(e) => {
                                      setDescription(e.target.value);
                                      if(touched.description) setErrors(prev => ({...prev, description: validate('description', e.target.value)}));
                                  }}
                                  onBlur={() => {
                                      setTouched(prev => ({...prev, description: true}));
                                      setErrors(prev => ({...prev, description: validate('description', description)}));
                                  }}
                              />
                              {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.description}</p>}
                              
                              <button 
                                  onClick={handlePreAnalyze}
                                  disabled={!description || !location || isPreAnalyzing}
                                  className="absolute bottom-4 right-4 bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                              >
                                  {isPreAnalyzing ? <Loader2 className="animate-spin" size={10}/> : <Sparkles size={10}/>} Auto-Classify
                              </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                                  <select 
                                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10"
                                      value={incidentType}
                                      onChange={(e) => setIncidentType(e.target.value)}
                                  >
                                      <option>Safety Hazard</option>
                                      <option>Near Miss</option>
                                      <option>Property Damage</option>
                                      <option>Injury</option>
                                      <option>Environmental Spill</option>
                                      <option>Equipment Failure</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Severity</label>
                                  <select 
                                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10"
                                      value={severity}
                                      onChange={(e) => setSeverity(e.target.value as any)}
                                  >
                                      <option>Low</option>
                                      <option>Medium</option>
                                      <option>High</option>
                                      <option>Critical</option>
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Evidence Photos</label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div 
                                    onClick={() => fileInputRefs.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                  >
                                      <Camera size={20} className="text-slate-400 group-hover:text-indigo-600 mb-1"/>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase group-hover:text-indigo-600">Add</span>
                                      <input type="file" ref={fileInputRefs} className="hidden" accept="image/*" multiple onChange={handlePhotoCapture} />
                                  </div>
                                  {images.map((img, i) => (
                                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                                          <img src={img} className="w-full h-full object-cover" alt="evidence"/>
                                          <button 
                                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                          >
                                              <X size={10}/>
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <button 
                              onClick={handleWorkerSubmit}
                              disabled={isSubmitting}
                              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                          >
                              {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Submit Report
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </>
  );
};

export default IncidentForm;
