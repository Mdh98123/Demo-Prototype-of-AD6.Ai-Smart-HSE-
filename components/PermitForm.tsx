
import React, { useState, useEffect } from 'react';
import { assessRisk } from '../services/geminiService';
import { AIRiskAssessment, RAMS } from '../types';
import LocationSelector from './LocationSelector';
import { 
  FileSignature, Loader2, CheckCircle2, Lock, 
  UserCheck, Clock, Check, MapPin, 
  ChevronRight, X, Eye, FileText, ArrowRight,
  Calendar, Users, Briefcase, AlertTriangle, Shield,
  FileDigit, AlertCircle, XCircle
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

// Extended Permit Interface
interface ActivePermit {
  id: string;
  type: string;
  description: string;
  location: string;
  
  // New Fields
  startTime: string;
  endTime: string;
  contractor: string;
  crewSize: number;
  requirements: string[]; // e.g., ["Gas Test", "Fire Watch"]
  
  ramsRef: string;
  assessment: AIRiskAssessment;
  
  status: 'Draft' | 'HSE_Review' | 'Pending_Authorization' | 'Ready_to_Issue' | 'Active' | 'Suspended' | 'Closed' | 'Rejected';
  
  applicant: { id: string; name: string; time: string };
  reviewer?: { id: string; name: string; time: string; comments?: string };
  authorizer?: { id: string; name: string; time: string; comments?: string };
  issuer?: { id: string; name: string; time: string; comments?: string };
  closer?: { id: string; name: string; time: string; comments?: string };

  gasReadings: any[];
  isolations: { type: string; id: string; status: 'Isolated' | 'De-isolated' }[];
}

interface PermitFormProps {
  initialView?: 'List' | 'Create';
}

const PermitForm: React.FC<PermitFormProps> = ({ initialView }) => {
  const { currentUser } = useUser();
  
  // App State
  const [viewState, setViewState] = useState<'List' | 'Create' | 'Detail'>('List');
  const [activePermit, setActivePermit] = useState<ActivePermit | null>(null);
  const [permits, setPermits] = useState<ActivePermit[]>([]);
  
  // Form State
  const [workType, setWorkType] = useState('Hot Work');
  const [description, setDescription] = useState('');
  const [locationInput, setLocationInput] = useState(''); 
  const [selectedRams, setSelectedRams] = useState('');
  const [contractor, setContractor] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [crewSize, setCrewSize] = useState(4);
  const [requirements, setRequirements] = useState<string[]>([]);
  
  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<AIRiskAssessment | null>(null);

  // Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  // Cancel Confirmation State
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Mock Data
  const contractors = ['Gulf Civil Works', 'Petro-Flow Services', 'Habshan Scaffolding', 'Al Ruwais Fire Systems'];
  const safetyRequirements = ['Gas Testing', 'Fire Watch', 'Electrical Isolation', 'Confined Space Sentry', 'Road Closure', 'Night Work Lighting'];
  
  // Dynamic RAMS Loading
  const [availableRAMS, setAvailableRAMS] = useState<RAMS[]>([]);

  useEffect(() => {
      const savedRAMS = localStorage.getItem('hse_rams_registry');
      if (savedRAMS) {
          setAvailableRAMS(JSON.parse(savedRAMS));
      } else {
          // Fallback mock data if RAMS module hasn't been visited/saved yet
          setAvailableRAMS([
              { id: 'RAMS-201', title: 'Tower Crane Assembly', activity: 'Lifting', version: '1.5', status: 'Approved', riskLevel: 'Critical', hazards: ['Falls', 'Wind'], controls: [] } as any,
              { id: 'RAMS-202', title: 'Tank C4 Internal Coating', activity: 'Confined Space', version: '2.0', status: 'Approved', riskLevel: 'High', hazards: ['Gas', 'Fumes'], controls: [] } as any
          ]);
      }
  }, []);

  useEffect(() => {
    if (initialView) {
        setViewState(initialView);
    }
  }, [initialView]);

  const handleSubmit = async () => {
    // Mock submission logic
    const newPermit: ActivePermit = {
        id: `PTW-${Date.now()}`,
        type: workType,
        description,
        location: locationInput,
        startTime,
        endTime,
        contractor,
        crewSize,
        requirements,
        ramsRef: selectedRams,
        assessment: assessment || { riskScore: 0, riskLevel: 'Low', hazards: [], controls: [], requiredPPE: [] },
        status: 'Pending_Authorization',
        applicant: { id: currentUser.id, name: currentUser.name, time: new Date().toISOString() },
        gasReadings: [],
        isolations: []
    };
    setPermits([newPermit, ...permits]);
    setViewState('List');
  };

  const validate = (field: string, value: string) => {
      if (!value) return "Required";
      return "";
  };

  const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-6">
                <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                    <FileSignature size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Permit to Work</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-indigo-500 pl-4">Digital Authorization & Control</p>
                </div>
            </div>
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button 
                    onClick={() => setViewState('List')}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewState === 'List' ? 'bg-white text-indigo-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Active Permits
                </button>
                <button 
                    onClick={() => setViewState('Create')}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewState === 'Create' ? 'bg-white text-indigo-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    New Application
                </button>
            </div>
        </div>

        {viewState === 'List' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-slate-50 p-8 rounded-full mb-6">
                    <FileSignature size={48} className="text-slate-300 opacity-50"/>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Active Permits</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-sm">
                    There are currently no active permits for your assigned zones. Start a new application to proceed with work.
                </p>
                <button onClick={() => setViewState('Create')} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg">
                    Create Permit
                </button>
            </div>
        )}

        {viewState === 'Create' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Work Type</label>
                        <select className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all" value={workType} onChange={e => setWorkType(e.target.value)}>
                            <option>Hot Work</option>
                            <option>Confined Space</option>
                            <option>Cold Work</option>
                            <option>Electrical</option>
                            <option>Lifting</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contractor</label>
                        <select className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all" value={contractor} onChange={e => setContractor(e.target.value)}>
                            <option value="">Select Contractor...</option>
                            {contractors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 h-32 outline-none focus:border-indigo-500 transition-all resize-none" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Detailed work description..."
                    />
                </div>
                
                <LocationSelector value={locationInput} onChange={setLocationInput} label="Work Location" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Start Time</label>
                        <input type="datetime-local" className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">End Time</label>
                        <input type="datetime-local" className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3">Linked RAMS</label>
                    <select className="w-full p-4 bg-white border border-indigo-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-indigo-200 transition-all" value={selectedRams} onChange={e => setSelectedRams(e.target.value)}>
                        <option value="">Select Approved Risk Assessment...</option>
                        {availableRAMS.filter(r => r.status === 'Approved').map(r => (
                            <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleSubmit}
                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-indigo-600 transition active:scale-95 flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                    Submit Application
                </button>
            </div>
        )}
    </div>
  );
};

export default PermitForm;
