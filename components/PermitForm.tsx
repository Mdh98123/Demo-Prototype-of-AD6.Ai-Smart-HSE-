
import React, { useState, useEffect, useMemo } from 'react';
import { assessRisk } from '../services/geminiService';
import { AIRiskAssessment, ApprovalStep, RAMS } from '../types';
import LocationSelector from './LocationSelector';
import { 
  FileSignature, ShieldAlert, Loader2, CheckCircle2, AlertTriangle, Lock, 
  Send, UserCheck, Clock, XCircle, Check, ShieldCheck, MapPin, 
  ChevronRight, Flame, Siren, X, Eye, FileText, ArrowRight
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

// Extended Permit Interface for Real-World Logic
interface ActivePermit {
  id: string;
  type: string; // Hot Work, Confined Space, etc.
  description: string;
  location: string;
  duration: number;
  ramsRef: string; // Mandatory Link to RAMS
  ramsTitle?: string;
  assessment: AIRiskAssessment;
  
  // Real Workflow States
  status: 'Draft' | 'HSE_Review' | 'Pending_Authorization' | 'Ready_to_Issue' | 'Active' | 'Suspended' | 'Closed' | 'Rejected';
  
  // Roles
  applicant: { id: string; name: string; time: string };
  reviewer?: { id: string; name: string; time: string; comments?: string }; // HSE Officer
  authorizer?: { id: string; name: string; time: string }; // Manager
  issuer?: { id: string; name: string; time: string }; // Site Supervisor
  receiver?: { id: string; name: string; time: string }; // Foreman/Worker
  closer?: { id: string; name: string; time: string };

  gasReadings: any[];
  isolations: { type: string; id: string; status: 'Isolated' | 'De-isolated' }[];
}

interface PermitFormProps {
  initialView?: 'List' | 'Create';
}

const PermitForm: React.FC<PermitFormProps> = ({ initialView }) => {
  const { currentUser } = useUser();
  
  // State
  const [activePermit, setActivePermit] = useState<ActivePermit | null>(null);
  const [viewState, setViewState] = useState<'List' | 'Create' | 'Detail'>('List');
  const [permits, setPermits] = useState<ActivePermit[]>([]);
  
  // Form State
  const [workType, setWorkType] = useState('Hot Work');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(8);
  const [locationInput, setLocationInput] = useState(''); 
  const [selectedRams, setSelectedRams] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<AIRiskAssessment | null>(null);

  // Mock RAMS Data for lookup
  const availableRAMS: RAMS[] = [
      { id: 'RAMS-201', title: 'Tower Crane Assembly', activity: 'Lifting', version: '1.5', status: 'Approved', riskLevel: 'Critical' } as any,
      { id: 'RAMS-202', title: 'Tank C4 Internal Coating', activity: 'Confined Space', version: '2.0', status: 'Approved', riskLevel: 'High' } as any
  ];

  useEffect(() => {
    if (initialView) {
        setViewState(initialView);
        if (initialView !== 'Detail') setActivePermit(null);
    }
  }, [initialView]);

  useEffect(() => {
    const saved = localStorage.getItem('hse_permits_registry');
    if (saved) {
        setPermits(JSON.parse(saved));
    } else {
        // Mock existing permit
        const mock: ActivePermit = {
            id: 'PTW-2024-001',
            type: 'Hot Work',
            description: 'Welding on pipeline joint J-402',
            location: 'Ruwais Zone B',
            duration: 4,
            ramsRef: 'RAMS-201',
            status: 'Active',
            applicant: { id: 'u6', name: 'Rahul Gupta', time: new Date().toISOString() },
            assessment: { riskScore: 12, riskLevel: 'Medium', hazards: ['Fire', 'Fumes'], controls: ['Extinguisher', 'Mask'], requiredPPE: ['Welding Mask'] },
            gasReadings: [],
            isolations: []
        };
        setPermits([mock]);
    }
  }, []);

  const savePermits = (updated: ActivePermit[]) => {
      setPermits(updated);
      localStorage.setItem('hse_permits_registry', JSON.stringify(updated));
  };

  const handleAssess = async () => {
    if (!description || !locationInput || !selectedRams) {
        alert("Please complete all fields and select a RAMS document.");
        return;
    }
    setLoading(true);
    try {
      const result = await assessRisk(workType, description, duration, 'OSHAD_SF');
      setAssessment(result);
    } catch (err) {
      alert("Risk assessment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = () => {
    if (!assessment) return;
    const newPermit: ActivePermit = {
      id: `PTW-${Date.now().toString().slice(-6)}`,
      type: workType,
      description,
      location: locationInput,
      duration,
      ramsRef: selectedRams,
      assessment,
      status: 'HSE_Review', // First step: HSE Review
      applicant: { id: currentUser.id, name: currentUser.name, time: new Date().toISOString() },
      gasReadings: [],
      isolations: []
    };
    savePermits([newPermit, ...permits]);
    setViewState('List');
    resetForm();
  };

  const resetForm = () => {
      setDescription('');
      setLocationInput('');
      setAssessment(null);
      setSelectedRams('');
  };

  const handleWorkflowAction = (permit: ActivePermit, action: string) => {
      let updatedStatus = permit.status;
      const now = new Date().toISOString();
      const updatedPermit = { ...permit };

      if (action === 'REVIEW') {
          updatedPermit.status = 'Pending_Authorization';
          updatedPermit.reviewer = { id: currentUser.id, name: currentUser.name, time: now };
      } else if (action === 'AUTHORIZE') {
          updatedPermit.status = 'Ready_to_Issue';
          updatedPermit.authorizer = { id: currentUser.id, name: currentUser.name, time: now };
      } else if (action === 'ISSUE') {
          updatedPermit.status = 'Active';
          updatedPermit.issuer = { id: currentUser.id, name: currentUser.name, time: now };
      } else if (action === 'CLOSE') {
          updatedPermit.status = 'Closed';
          updatedPermit.closer = { id: currentUser.id, name: currentUser.name, time: now };
      }

      const updatedList = permits.map(p => p.id === permit.id ? updatedPermit : p);
      savePermits(updatedList);
      if (activePermit?.id === permit.id) setActivePermit(updatedPermit);
  };

  const canAction = (action: string) => {
      const role = currentUser.role;
      // Role-Based Access Control (RBAC) Logic
      switch (action) {
          case 'REVIEW':
              return ['HSE_Officer', 'Site_HSE_Manager', 'Regional_HSE_Director', 'ADMIN'].includes(role);
          case 'AUTHORIZE':
              return ['Site_HSE_Manager', 'Project_Manager', 'Regional_HSE_Director', 'ADMIN'].includes(role);
          case 'ISSUE':
              return ['Site_Supervisor', 'Site_HSE_Manager', 'ADMIN'].includes(role);
          case 'CLOSE':
              return ['Site_Supervisor', 'HSE_Officer', 'Site_HSE_Manager', 'ADMIN'].includes(role);
          default:
              return false;
      }
  };

  if (viewState === 'List') {
      return (
          <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                  <div>
                      <h1 className="text-2xl font-bold text-slate-900">Permit Control</h1>
                      <p className="text-sm text-slate-500">Manage High Risk Activity Authorizations</p>
                  </div>
                  <button onClick={() => setViewState('Create')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-800 transition">
                      <FileSignature size={16}/> New Application
                  </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                              <tr>
                                  <th className="px-6 py-4">Permit Ref</th>
                                  <th className="px-6 py-4">Type / Activity</th>
                                  <th className="px-6 py-4">Location</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Applicant</th>
                                  <th className="px-6 py-4 text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {permits.map(p => (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{p.id}</td>
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800">{p.type}</div>
                                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{p.description}</div>
                                      </td>
                                      <td className="px-6 py-4">{p.location}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
                                              p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                              p.status === 'HSE_Review' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                              p.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                              'bg-blue-50 text-blue-700 border-blue-200'
                                          }`}>{p.status.replace(/_/g, ' ')}</span>
                                      </td>
                                      <td className="px-6 py-4 text-xs">{p.applicant.name}</td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => { setActivePermit(p); setViewState('Detail'); }} className="text-indigo-600 font-bold hover:underline">View</button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  if (viewState === 'Create') {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setViewState('List')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4">
                <ArrowRight className="rotate-180" size={16}/> Cancel
            </button>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Initiate Permit to Work</h2>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Permit Type</label>
                            <select 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" 
                                value={workType} 
                                onChange={(e) => setWorkType(e.target.value)}
                            >
                                <option>Hot Work</option>
                                <option>Confined Space</option>
                                <option>Work at Height</option>
                                <option>Excavation</option>
                                <option>Lifting Operation</option>
                                <option>Electrical Isolation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (Hours)</label>
                            <input 
                                type="number" 
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" 
                                value={duration} 
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <LocationSelector value={locationInput} onChange={setLocationInput} required />

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Approved RAMS Reference (Mandatory)</label>
                        <select 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700" 
                            value={selectedRams} 
                            onChange={(e) => setSelectedRams(e.target.value)}
                        >
                            <option value="">Select RAMS...</option>
                            {availableRAMS.map(r => (
                                <option key={r.id} value={r.id}>{r.id}: {r.title} ({r.riskLevel} Risk)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Scope of Work</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 min-h-[100px] resize-none placeholder:text-slate-400 placeholder:font-medium" 
                            placeholder="Detailed description of activity and tools used..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        {assessment ? (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex items-start gap-3">
                                    <CheckCircle2 className="text-emerald-600 mt-0.5" size={20}/>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">Risk Assessment Verified</p>
                                        <p className="text-xs text-emerald-600 mt-1">Risk Score: {assessment.riskScore} ({assessment.riskLevel})</p>
                                    </div>
                                </div>
                                <button onClick={handleSubmitDraft} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg">Submit for HSE Review</button>
                            </div>
                        ) : (
                            <button onClick={handleAssess} disabled={loading || !description || !locationInput || !selectedRams} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                Verify & Proceed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (viewState === 'Detail' && activePermit) {
      return (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
              <button onClick={() => setViewState('List')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                  <ArrowRight className="rotate-180" size={16}/> Back to Registry
              </button>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <h1 className="text-3xl font-black text-slate-800">{activePermit.id}</h1>
                              <span className={`px-3 py-1 rounded text-xs font-black uppercase border ${
                                  activePermit.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>{activePermit.status.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-500">{activePermit.type} • {activePermit.location}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valid Until</p>
                          <p className="text-lg font-mono font-bold text-slate-700">Today, 18:00</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-100">
                      {/* Left: Workflow Status */}
                      <div className="p-8 space-y-8">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Chain</h3>
                          <div className="space-y-6 relative">
                              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                              
                              <WorkflowStep label="Application" actor={activePermit.applicant} status="Completed" />
                              <WorkflowStep label="HSE Review" actor={activePermit.reviewer} status={activePermit.reviewer ? 'Completed' : activePermit.status === 'HSE_Review' ? 'Current' : 'Pending'} />
                              <WorkflowStep label="Authorization" actor={activePermit.authorizer} status={activePermit.authorizer ? 'Completed' : activePermit.status === 'Pending_Authorization' ? 'Current' : 'Pending'} />
                              <WorkflowStep label="Issuance" actor={activePermit.issuer} status={activePermit.issuer ? 'Completed' : activePermit.status === 'Ready_to_Issue' ? 'Current' : 'Pending'} />
                              <WorkflowStep label="Closure" actor={activePermit.closer} status={activePermit.status === 'Closed' ? 'Completed' : 'Pending'} />
                          </div>

                          <div className="mt-8 pt-8 border-t border-slate-100 space-y-2">
                              {activePermit.status === 'HSE_Review' && (
                                  canAction('REVIEW') ? (
                                      <button onClick={() => handleWorkflowAction(activePermit, 'REVIEW')} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 transition">Approve & Forward</button>
                                  ) : (
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-400 uppercase">Waiting for HSE Officer</div>
                                  )
                              )}
                              
                              {activePermit.status === 'Pending_Authorization' && (
                                  canAction('AUTHORIZE') ? (
                                      <button onClick={() => handleWorkflowAction(activePermit, 'AUTHORIZE')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:bg-slate-800 transition">Authorize Permit</button>
                                  ) : (
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-400 uppercase">Waiting for Project Manager</div>
                                  )
                              )}
                              
                              {activePermit.status === 'Ready_to_Issue' && (
                                  canAction('ISSUE') ? (
                                      <button onClick={() => handleWorkflowAction(activePermit, 'ISSUE')} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:bg-emerald-700 transition">Issue to Site</button>
                                  ) : (
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-400 uppercase">Waiting for Site Supervisor</div>
                                  )
                              )}
                              
                              {activePermit.status === 'Active' && (
                                  canAction('CLOSE') ? (
                                      <button onClick={() => handleWorkflowAction(activePermit, 'CLOSE')} className="w-full bg-slate-100 text-slate-600 py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition">Close Permit</button>
                                  ) : (
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-400 uppercase">Active Permit</div>
                                  )
                              )}
                          </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="p-8 col-span-2 space-y-8">
                          <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Profile</h3>
                              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-4 mb-4">
                                      <div className={`text-2xl font-black ${activePermit.assessment.riskLevel === 'Critical' ? 'text-red-600' : 'text-emerald-600'}`}>{activePermit.assessment.riskScore}</div>
                                      <div className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold uppercase">{activePermit.assessment.riskLevel} Risk</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Hazards</p>
                                          <ul className="list-disc list-inside text-sm text-slate-700 font-medium">
                                              {activePermit.assessment.hazards.map((h, i) => <li key={i}>{h}</li>)}
                                          </ul>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Controls</p>
                                          <ul className="list-disc list-inside text-sm text-slate-700 font-medium">
                                              {activePermit.assessment.controls.map((c, i) => <li key={i}>{c}</li>)}
                                          </ul>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Linked Documentation</h3>
                              <div className="flex gap-4">
                                  <div className="flex-1 p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-500 cursor-pointer transition">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={18}/></div>
                                          <div>
                                              <p className="text-xs font-bold text-slate-800">RAMS Document</p>
                                              <p className="text-[10px] text-slate-500">{activePermit.ramsRef}</p>
                                          </div>
                                      </div>
                                      <Eye size={16} className="text-slate-300"/>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

const WorkflowStep = ({ label, actor, status }: { label: string, actor?: { name: string, time: string }, status: string }) => {
    const isCompleted = status === 'Completed';
    const isCurrent = status === 'Current';
    
    return (
        <div className="relative z-10 flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-white ${
                isCompleted ? 'border-emerald-500 text-emerald-600' : 
                isCurrent ? 'border-indigo-500 text-indigo-600 animate-pulse' : 'border-slate-200 text-slate-300'
            }`}>
                {isCompleted ? <Check size={16}/> : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>}
            </div>
            <div className="pt-1">
                <p className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
                {actor ? (
                    <div className="mt-1">
                        <p className="text-xs font-medium text-slate-600">{actor.name}</p>
                        <p className="text-[10px] text-slate-400">{new Date(actor.time).toLocaleString()}</p>
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{status}</p>
                )}
            </div>
        </div>
    );
}

export default PermitForm;
