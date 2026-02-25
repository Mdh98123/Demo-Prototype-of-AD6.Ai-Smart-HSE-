
import React, { useState } from 'react';
import { MOCRequest } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  GitPullRequest, ArrowRight, CheckCircle2, Clock, 
  FileText, AlertTriangle, UserCheck, X, Plus, Filter,
  Settings, Layers, AlertCircle
} from 'lucide-react';

const MOCModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'Requests' | 'Approvals'>('Requests');
  const [showNewModal, setShowNewModal] = useState(false);
  
  const [requests, setRequests] = useState<MOCRequest[]>([
    {
        id: 'MOC-24-001',
        title: 'Upgrade of Generator Control Panel',
        description: 'Replacing analog controls with digital PLC system for Gen A.',
        type: 'Permanent',
        category: 'Equipment',
        initiator: 'Rahul Gupta',
        date: '2024-05-15',
        riskAssessmentRef: 'RA-GEN-02',
        status: 'Tech_Review',
        approvals: [
            { role: 'Site Manager', name: 'Sarah Jones', date: '2024-05-16', status: 'Approved' }
        ]
    },
    {
        id: 'MOC-24-002',
        title: 'Temporary Bypass of Fire Pump B',
        description: 'Bypass required for seal replacement. Duration: 48hrs.',
        type: 'Temporary',
        category: 'Process',
        initiator: 'Marcus Chen',
        date: '2024-05-18',
        riskAssessmentRef: 'RA-FP-TEM',
        status: 'HSE_Review',
        approvals: []
    },
    {
        id: 'MOC-24-003',
        title: 'Shift Rotation Schedule Change',
        description: 'Implementing 4-shift rotation for critical ops team.',
        type: 'Permanent',
        category: 'Organization',
        initiator: 'Sarah Jones',
        date: '2024-05-10',
        riskAssessmentRef: 'RA-HR-005',
        status: 'Approved',
        approvals: [
            { role: 'HSE Director', name: 'Ahmed Al-Mansoori', date: '2024-05-12', status: 'Approved' }
        ]
    },
    {
        id: 'MOC-24-004',
        title: 'New Catalyst Type for Reactor 4',
        description: 'Switching to higher efficiency catalyst Z-500.',
        type: 'Permanent',
        category: 'Process',
        initiator: 'John Doe',
        date: '2024-05-20',
        riskAssessmentRef: 'RA-PROC-44',
        status: 'Draft',
        approvals: []
    },
    {
        id: 'MOC-24-005',
        title: 'Emergency Scaffolding for Flare Repair',
        description: 'Unplanned access required for flare tip inspection.',
        type: 'Emergency',
        category: 'Equipment',
        initiator: 'Marcus Chen',
        date: '2024-05-22',
        riskAssessmentRef: 'RA-FL-EM',
        status: 'Approved',
        approvals: [
            { role: 'Site Manager', name: 'Sarah Jones', date: '2024-05-22', status: 'Approved' }
        ]
    },
    {
        id: 'MOC-24-006',
        title: 'Contractor Change for Waste Mgmt',
        description: 'Onboarding new vendor Emirates Bio-Waste.',
        type: 'Permanent',
        category: 'Organization',
        initiator: 'Khalid Al-Dhaheri',
        date: '2024-05-05',
        riskAssessmentRef: 'RA-VEN-09',
        status: 'HSE_Review',
        approvals: []
    },
    {
        id: 'MOC-24-007',
        title: 'Relocation of Muster Point C',
        description: 'Moved due to new excavation works nearby.',
        type: 'Temporary',
        category: 'Process',
        initiator: 'Fatima Al-Kaabi',
        date: '2024-05-14',
        riskAssessmentRef: 'RA-SITE-02',
        status: 'Approved',
        approvals: [
            { role: 'HSE Manager', name: 'Sarah Jones', date: '2024-05-14', status: 'Approved' }
        ]
    },
    {
        id: 'MOC-24-008',
        title: 'Introduction of Electric Forklifts',
        description: 'Replacing diesel fleet with electric units in Warehouse.',
        type: 'Permanent',
        category: 'Equipment',
        initiator: 'Rahul Gupta',
        date: '2024-04-20',
        riskAssessmentRef: 'RA-EQ-FL',
        status: 'Tech_Review',
        approvals: []
    },
    {
        id: 'MOC-24-009',
        title: 'Revised H2S Response Procedure',
        description: 'Update to align with new COP standard.',
        type: 'Permanent',
        category: 'Process',
        initiator: 'Dr. Layla Hassan',
        date: '2024-05-01',
        riskAssessmentRef: 'RA-H2S-V4',
        status: 'Approved',
        approvals: [
            { role: 'Regional Director', name: 'Ahmed Al-Mansoori', date: '2024-05-03', status: 'Approved' }
        ]
    },
    {
        id: 'MOC-24-010',
        title: 'Decommissioning of Tank T-88',
        description: 'Permanent removal from service due to corrosion.',
        type: 'Permanent',
        category: 'Equipment',
        initiator: 'John Doe',
        date: '2024-05-19',
        riskAssessmentRef: 'RA-DECOM-88',
        status: 'Draft',
        approvals: []
    }
  ]);

  const [newMOC, setNewMOC] = useState<Partial<MOCRequest>>({ type: 'Permanent', category: 'Equipment' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (field: string, value: string) => {
      if (field === 'title' && !value.trim()) return "Change title is required";
      if (field === 'description' && !value.trim()) return "Description is required";
      return "";
  };

  const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  const handleCreate = () => {
      const titleErr = validate('title', newMOC.title || '');
      const descErr = validate('description', newMOC.description || '');
      setErrors({ title: titleErr, description: descErr });
      setTouched({ title: true, description: true });

      if (titleErr || descErr) return;

      const request: MOCRequest = {
          id: `MOC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
          title: newMOC.title!,
          description: newMOC.description!,
          type: newMOC.type as any,
          category: newMOC.category as any,
          initiator: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          riskAssessmentRef: 'Pending',
          status: 'Draft',
          approvals: []
      };
      setRequests([request, ...requests]);
      setShowNewModal(false);
      setNewMOC({ type: 'Permanent', category: 'Equipment' });
      setErrors({});
      setTouched({});
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
          case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-200';
          case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
          default: return 'bg-orange-50 text-orange-700 border-orange-100';
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-sky-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-sky-500/20">
                <GitPullRequest size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Change Mgmt</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-sky-500 pl-4">MOC Protocol & Technical Review</p>
            </div>
          </div>
          <button onClick={() => setShowNewModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition active:scale-95">
              <Plus size={18}/> Initiate Change
          </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Change Register</h3>
              <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-sky-600 transition"><Filter size={18}/></button>
              </div>
          </div>
          <div className="p-8 grid gap-6">
              {requests.map(moc => (
                  <div key={moc.id} className="p-6 rounded-[2.5rem] border-2 border-slate-50 hover:border-sky-200 bg-white hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
                                  {moc.type === 'Permanent' ? <Layers size={24}/> : <Clock size={24}/>}
                              </div>
                              <div>
                                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{moc.title}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{moc.id}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{moc.category}</span>
                                  </div>
                              </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(moc.status)}`}>
                              {moc.status.replace('_', ' ')}
                          </span>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-600 leading-relaxed pl-[4.5rem] mb-6">
                          {moc.description}
                      </p>

                      <div className="pl-[4.5rem] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                  <UserCheck size={14} className="text-slate-400"/>
                                  <span className="text-xs font-bold text-slate-600">{moc.initiator}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-slate-400"/>
                                  <span className="text-xs font-bold text-slate-600">{moc.riskAssessmentRef}</span>
                              </div>
                          </div>
                          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-800 transition">
                              View Details <ArrowRight size={14}/>
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">New Change Request</h3>
                      <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Change Title <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none transition-all ${errors.title ? 'border-red-500 focus:border-red-500 bg-red-50/10' : touched.title && newMOC.title ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-sky-500'}`}
                              placeholder="e.g. Pump Specification Change"
                              value={newMOC.title}
                              onChange={(e) => {
                                  setNewMOC({...newMOC, title: e.target.value});
                                  if(touched.title) setErrors(prev => ({...prev, title: validate('title', e.target.value)}));
                              }}
                              onBlur={(e) => handleBlur('title', e.target.value)}
                          />
                          {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.title}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                              <select 
                                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-sky-500 transition-all"
                                  value={newMOC.type}
                                  onChange={(e) => setNewMOC({...newMOC, type: e.target.value as any})}
                              >
                                  <option>Permanent</option>
                                  <option>Temporary</option>
                                  <option>Emergency</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                              <select 
                                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-sky-500 transition-all"
                                  value={newMOC.category}
                                  onChange={(e) => setNewMOC({...newMOC, category: e.target.value as any})}
                              >
                                  <option>Equipment</option>
                                  <option>Process</option>
                                  <option>Personnel</option>
                                  <option>Organization</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description & Justification <span className="text-red-500">*</span></label>
                          <textarea 
                              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none transition-all h-32 resize-none ${errors.description ? 'border-red-500 focus:border-red-500 bg-red-50/10' : touched.description && newMOC.description ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-sky-500'}`}
                              placeholder="Describe the change and why it is needed..."
                              value={newMOC.description}
                              onChange={(e) => {
                                  setNewMOC({...newMOC, description: e.target.value});
                                  if(touched.description) setErrors(prev => ({...prev, description: validate('description', e.target.value)}));
                              }}
                              onBlur={(e) => handleBlur('description', e.target.value)}
                          />
                          {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.description}</p>}
                      </div>

                      <button 
                          onClick={handleCreate}
                          className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-sky-700 transition active:scale-95 mt-2"
                      >
                          Submit for Review
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MOCModule;
