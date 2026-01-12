
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { classifyIncident, generateRCA, generateCustomIncidentReport, editImageWithAI, generateIncidentSimulation } from '../services/geminiService';
import { AIIncidentAnalysis, RootCauseAnalysis, Incident, AuditLog, IncidentReportOptions } from '../types';
import LocationSelector from './LocationSelector';
import { 
  AlertOctagon, BrainCircuit, Loader2, Send, Lock, FileSearch, 
  ShieldAlert, BarChart, ExternalLink, ShieldCheck, Zap,
  Bold, List, Eraser, Clock, Type, Info, Camera, Image as ImageIcon,
  MapPin, Navigation, History, ChevronRight, X, Trash2, Search,
  Filter, Eye, AlertTriangle, User, Calendar, Target,
  Siren, PhoneCall, FileText, CheckSquare, Download, Copy, Wand2, Edit3, Check, Cloud, Users, Mic, Plus,
  Film, ArrowLeft, Upload
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const IncidentForm: React.FC = () => {
  const { currentUser, activeFramework, t } = useUser();
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
  
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('hse_incident_registry');
    if (saved) {
        setIncidents(JSON.parse(saved));
    } else {
        const initial: Incident[] = [
            { id: 'INC-772', type: 'Equipment Failure', description: 'Hydraulic leak on generator set A4 during startup.', location: 'Ruwais Refinery Zone A', status: 'Review' as any, timestamp: new Date(Date.now() - 86400000).toISOString(), reportedBy: 'u6', reportedByName: 'Rahul Gupta', auditLog: [], images: [], reportDeadline: new Date(Date.now() + 172800000).toISOString(), severity: 'Medium' }
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
  };

  const handleWorkerSubmit = async () => {
      if (!description || !location) return;
      setIsSubmittingReport(true);
      
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
      setIsSubmittingReport(false);
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

  const filteredIncidents = useMemo(() => {
    if (currentUser.role === 'Worker') return incidents.filter(i => i.reportedBy === currentUser.id);
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
      <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Registry View */}
          {viewState === 'Registry' && (
              <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Registry</h1>
                          <p className="text-sm text-slate-500 mt-1">Track and manage safety events.</p>
                      </div>
                      <button 
                        onClick={() => setIsReportModalOpen(true)} 
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95"
                      >
                          <Plus size={16} /> Report New Incident
                      </button>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-slate-600">
                              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                  <tr>
                                      <th className="px-8 py-6">ID</th>
                                      <th className="px-8 py-6">Type / Description</th>
                                      <th className="px-8 py-6">Location</th>
                                      <th className="px-8 py-6">Severity</th>
                                      <th className="px-8 py-6">Status</th>
                                      <th className="px-8 py-6 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {filteredIncidents.map(inc => (
                                      <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-8 py-6 font-mono font-bold text-indigo-600 text-xs">{inc.id}</td>
                                          <td className="px-8 py-6">
                                              <p className="font-bold text-slate-800 text-xs uppercase mb-1">{inc.type || 'General Incident'}</p>
                                              <p className="text-xs text-slate-500 truncate max-w-xs">{inc.description}</p>
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
                                                  'bg-indigo-50 text-indigo-700 border-indigo-100'
                                              }`}>
                                                  {inc.status}
                                              </span>
                                          </td>
                                          <td className="px-8 py-6 text-right">
                                              <button 
                                                onClick={() => { setSelectedIncident(inc); setViewState('Investigation'); }}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase hover:underline"
                                              >
                                                  View Details
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
              <div className="max-w-5xl mx-auto space-y-6">
                   <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                      <button onClick={() => setViewState('Registry')} className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                          <ArrowLeft size={20} />
                      </button>
                      <div>
                          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Investigation: {selectedIncident.id}</h1>
                          <div className="flex gap-3 text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                              <span>Reported by {selectedIncident.reportedByName}</span>
                              <span>•</span>
                              <span>{new Date(selectedIncident.timestamp).toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Incident Details</h3>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                              <p className="font-bold text-slate-800">{selectedIncident.type || 'General'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getSeverityStyle(selectedIncident.severity)}`}>
                                  {selectedIncident.severity || 'Low'}
                              </span>
                          </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8">
                          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedIncident.description}"</p>
                      </div>
                      
                      <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 bg-slate-50/50">
                          <BrainCircuit size={48} className="mx-auto mb-4 opacity-30"/>
                          <p className="text-xs font-black uppercase tracking-widest">AI Analysis Module (Investigation Mode)</p>
                          <p className="text-[10px] font-medium mt-1">Full RCA and Regulatory Reporting tools available in production.</p>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* NEW REPORT MODAL */}
      {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-3xl overflow-hidden border-4 border-white flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                      <div>
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">New Incident Report</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Rapid Field Entry Protocol</p>
                      </div>
                      <button onClick={() => setIsReportModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-800 transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar space-y-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Incident Type <span className="text-red-500">*</span></label>
                              <select 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                                value={incidentType}
                                onChange={(e) => setIncidentType(e.target.value)}
                              >
                                  <option>Safety Hazard</option>
                                  <option>Near Miss</option>
                                  <option>Property Damage</option>
                                  <option>Personal Injury</option>
                                  <option>Environmental Spill</option>
                                  <option>Fire / Explosion</option>
                                  <option>Security Breach</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Severity Level <span className="text-red-500">*</span></label>
                              <select 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value as any)}
                              >
                                  <option value="Low">Low (Minor Issue)</option>
                                  <option value="Medium">Medium (Requires Action)</option>
                                  <option value="High">High (Serious Incident)</option>
                                  <option value="Critical">Critical (Emergency)</option>
                              </select>
                          </div>
                      </div>

                      <LocationSelector value={location} onChange={setLocation} label="Incident Location" required />

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description <span className="text-red-500">*</span></label>
                          <textarea 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 min-h-[120px] resize-none placeholder:text-slate-400 placeholder:font-medium"
                            placeholder="Describe what happened, who was involved, and immediate actions taken..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Evidence Capture</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div 
                                onClick={() => fileInputRefs.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-all group"
                              >
                                  <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                      <Camera size={20} className="text-slate-400 group-hover:text-indigo-600" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-600">Add Photo</span>
                                  <input type="file" ref={fileInputRefs} className="hidden" accept="image/*" multiple onChange={handlePhotoCapture} />
                              </div>
                              {images.map((img, i) => (
                                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                                      <img src={img} className="w-full h-full object-cover" alt="evidence" />
                                      <button 
                                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                      >
                                          <X size={12} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                      <button 
                        onClick={() => setIsReportModalOpen(false)}
                        className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleWorkerSubmit}
                        disabled={isSubmittingReport || !description || !location}
                        className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                          {isSubmittingReport ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={18} />}
                          Submit Critical Report
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default IncidentForm;
