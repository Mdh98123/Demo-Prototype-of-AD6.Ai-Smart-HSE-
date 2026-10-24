
import React, { useState } from 'react';
import { GatePass } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  Shield, Key, UserPlus, Truck, Clock, CheckCircle2, 
  XCircle, Search, FileText, QrCode, LogIn, LogOut,
  Car, Users, Lock, AlertOctagon, AlertCircle
} from 'lucide-react';

const SecurityModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'GateControl' | 'PassRegistry' | 'SecureAreas'>('GateControl');
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Mock Data
  const [passes, setPasses] = useState<GatePass[]>([
    { id: 'GP-9021', visitorName: 'John Smith', company: 'TechSol', hostId: 'u4', entryTime: '2024-05-20T08:30:00', type: 'Visitor', status: 'Active', purpose: 'Site Survey' },
    { id: 'GP-9022', visitorName: 'Delivery Driver', company: 'DHL', hostId: 'u7', entryTime: '2024-05-20T09:15:00', vehicleReg: 'DXB-55291', type: 'Delivery', status: 'Active', purpose: 'Material Drop-off' },
    { id: 'GP-9018', visitorName: 'Audit Team', company: 'OSHAD', hostId: 'u2', entryTime: '2024-05-19T10:00:00', exitTime: '2024-05-19T16:00:00', type: 'Visitor', status: 'Closed', purpose: 'Annual Audit' }
  ]);

  const [newPass, setNewPass] = useState<Partial<GatePass>>({ type: 'Visitor', status: 'Active' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const SECURE_ZONES = [
      { id: 'zone-1', name: 'Server Room', status: 'Secured', lastAccess: '10:42 AM (Admin)', logs: ['08:00 AM - Maintenance entered', '08:45 AM - Maintenance exited', '10:42 AM - Admin entered'], top: '10%', left: '10%', width: '30%', height: '35%' },
      { id: 'zone-2', name: 'Cash Office', status: 'Secured', lastAccess: '09:15 AM (Finance Manager)', logs: ['09:00 AM - Finance Manager entered', '09:15 AM - Finance Manager exited'], top: '10%', left: '45%', width: '25%', height: '35%' },
      { id: 'zone-3', name: 'Control Room', status: 'Active', lastAccess: '11:00 AM (Operator)', logs: ['06:00 AM - Shift Start', '11:00 AM - Operator entered'], top: '50%', left: '10%', width: '45%', height: '40%' },
      { id: 'zone-4', name: 'Chemical Storage', status: 'Secured', lastAccess: '07:30 AM (HSE Officer)', logs: ['07:15 AM - HSE Officer entered', '07:30 AM - HSE Officer exited'], top: '50%', left: '60%', width: '30%', height: '40%' },
  ];
  const [selectedZone, setSelectedZone] = useState<typeof SECURE_ZONES[0] | null>(null);

  const validate = (field: string, value: string) => {
      if (field === 'visitorName' && !value) return "Visitor Name is required";
      if (field === 'company' && !value) return "Company is required";
      if (field === 'vehicleReg' && newPass.type === 'Delivery' && !value) return "Vehicle Registration is required";
      return "";
  };

  const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  const handleIssuePass = () => {
      const nameError = validate('visitorName', newPass.visitorName || '');
      const compError = validate('company', newPass.company || '');
      const regError = validate('vehicleReg', newPass.vehicleReg || '');
      
      setErrors({ visitorName: nameError, company: compError, vehicleReg: regError });
      setTouched({ visitorName: true, company: true, vehicleReg: true });

      if (nameError || compError || regError) return;

      const pass: GatePass = {
          id: `GP-${Math.floor(Math.random() * 10000)}`,
          visitorName: newPass.visitorName!,
          company: newPass.company!,
          hostId: currentUser.id,
          entryTime: new Date().toISOString(),
          type: newPass.type as any,
          status: 'Active',
          vehicleReg: newPass.vehicleReg,
          purpose: newPass.purpose || 'Visit'
      };
      setPasses([pass, ...passes]);
      setShowPassModal(false);
      setNewPass({ type: 'Visitor', status: 'Active' });
      setErrors({});
      setTouched({});
  };

  const handleCheckout = (id: string) => {
      setPasses(prev => prev.map(p => p.id === id ? { ...p, status: 'Closed', exitTime: new Date().toISOString() } : p));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-x-5">
            <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20">
                <Shield size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Security Ops</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-slate-900 ps-4">Access Control & Asset Protection</p>
            </div>
          </div>
          <div className="flex bg-slate-200 p-1 rounded-2xl w-fit shadow-inner">
              <button onClick={() => setActiveTab('GateControl')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GateControl' ? 'glass-card text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Gate Control</button>
              <button onClick={() => setActiveTab('PassRegistry')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PassRegistry' ? 'glass-card text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Pass Registry</button>
              <button onClick={() => setActiveTab('SecureAreas')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SecureAreas' ? 'glass-card text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Secure Zones</button>
          </div>
      </div>

      {activeTab === 'GateControl' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><LogIn size={20}/> Active Entries</h3>
                          <button onClick={() => setShowPassModal(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition active:scale-95">
                              <UserPlus size={16}/> Issue Visitor Pass
                          </button>
                      </div>
                      
                      <div className="space-y-4">
                          {passes.filter(p => p.status === 'Active').map(pass => (
                              <div key={pass.id} className="p-6 glass-panel rounded-3xl border-2 border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                          {pass.type === 'Delivery' ? <Truck size={20}/> : <Users size={20}/>}
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-800 text-sm">{pass.visitorName}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                              {pass.company} • {pass.type} {pass.vehicleReg ? `• ${pass.vehicleReg}` : ''}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <div className="text-end">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Time</p>
                                          <p className="text-sm font-black text-slate-700 font-mono">{new Date(pass.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                      </div>
                                      <button onClick={() => handleCheckout(pass.id)} className="bg-slate-200 text-slate-600 p-3 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors" title="Checkout">
                                          <LogOut size={18}/>
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {passes.filter(p => p.status === 'Active').length === 0 && (
                              <div className="text-center py-12 text-slate-400 font-medium italic text-xs uppercase tracking-widest">No active visitors on site.</div>
                          )}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 end-0 p-6 opacity-10"><Key size={100}/></div>
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6">Site Perimeter Status</h3>
                      <div className="space-y-4 relative z-10">
                          <div className="flex items-center justify-between p-4 glass-card/5 rounded-2xl border border-white/10">
                              <span className="text-xs font-bold">Main Gate A</span>
                              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase">Secure</span>
                          </div>
                          <div className="flex items-center justify-between p-4 glass-card/5 rounded-2xl border border-white/10">
                              <span className="text-xs font-bold">Loading Dock B</span>
                              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase">Secure</span>
                          </div>
                          <div className="flex items-center justify-between p-4 glass-card/5 rounded-2xl border border-white/10">
                              <span className="text-xs font-bold">Turnstiles C</span>
                              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase">Active</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* PASS ISSUANCE MODAL */}
      {showPassModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="glass-card w-full max-w-lg rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Issue Gate Pass</h3>
                      <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle size={24} className="text-slate-400"/></button>
                  </div>
                  <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pass Type</label>
                              <select 
                                  className="w-full p-3 glass-panel border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                                  value={newPass.type}
                                  onChange={(e) => setNewPass({...newPass, type: e.target.value as any})}
                              >
                                  <option>Visitor</option>
                                  <option>Contractor</option>
                                  <option>Delivery</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Purpose</label>
                              <input 
                                  type="text" 
                                  className="w-full p-3 glass-panel border-2 border-slate-50 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                                  placeholder="e.g. Meeting"
                                  value={newPass.purpose}
                                  onChange={(e) => setNewPass({...newPass, purpose: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Visitor Name <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              className={`w-full p-3 glass-panel border-2 rounded-xl font-bold text-sm outline-none transition-all ${errors.visitorName ? 'border-red-500 focus:border-red-500 bg-red-50/10' : touched.visitorName && newPass.visitorName ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-emerald-500'}`}
                              value={newPass.visitorName}
                              onChange={(e) => {
                                  setNewPass({...newPass, visitorName: e.target.value});
                                  if(touched.visitorName) setErrors(prev => ({...prev, visitorName: validate('visitorName', e.target.value)}));
                              }}
                              onBlur={(e) => handleBlur('visitorName', e.target.value)}
                          />
                          {errors.visitorName && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.visitorName}</p>}
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Company <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              className={`w-full p-3 glass-panel border-2 rounded-xl font-bold text-sm outline-none transition-all ${errors.company ? 'border-red-500 focus:border-red-500 bg-red-50/10' : touched.company && newPass.company ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-emerald-500'}`}
                              value={newPass.company}
                              onChange={(e) => {
                                  setNewPass({...newPass, company: e.target.value});
                                  if(touched.company) setErrors(prev => ({...prev, company: validate('company', e.target.value)}));
                              }}
                              onBlur={(e) => handleBlur('company', e.target.value)}
                          />
                          {errors.company && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.company}</p>}
                      </div>
                      {newPass.type === 'Delivery' && (
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vehicle Reg <span className="text-red-500">*</span></label>
                              <input 
                                  type="text" 
                                  className={`w-full p-3 glass-panel border-2 rounded-xl font-bold text-sm outline-none transition-all ${errors.vehicleReg ? 'border-red-500 focus:border-red-500 bg-red-50/10' : touched.vehicleReg && newPass.vehicleReg ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-emerald-500'}`}
                                  value={newPass.vehicleReg}
                                  onChange={(e) => {
                                      setNewPass({...newPass, vehicleReg: e.target.value});
                                      if(touched.vehicleReg) setErrors(prev => ({...prev, vehicleReg: validate('vehicleReg', e.target.value)}));
                                  }}
                                  onBlur={(e) => handleBlur('vehicleReg', e.target.value)}
                              />
                              {errors.vehicleReg && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.vehicleReg}</p>}
                          </div>
                      )}
                      <button 
                          onClick={handleIssuePass}
                          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-700 transition active:scale-95 mt-4"
                      >
                          Generate Digital Pass
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'SecureAreas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-[600px] flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><Lock size={20}/> Facility Map</h3>
                          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Secured</span>
                              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Active</span>
                          </div>
                      </div>
                      <div className="flex-1 relative glass-panel rounded-3xl border-2 border-slate-100 overflow-hidden">
                          {/* Grid background pattern */}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                          
                          {/* Map Zones */}
                          {SECURE_ZONES.map(zone => (
                              <button
                                  key={zone.id}
                                  onClick={() => setSelectedZone(zone)}
                                  className={`absolute border-2 transition-all duration-300 flex flex-col items-center justify-center p-4 group
                                      ${selectedZone?.id === zone.id ? 'ring-4 ring-indigo-500/30 z-20 scale-[1.02]' : 'hover:scale-[1.02] hover:z-10'}
                                      ${zone.status === 'Secured' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-700' : 'bg-amber-500/10 border-amber-500/50 text-amber-700'}
                                      rounded-2xl shadow-sm backdrop-blur-sm
                                  `}
                                  style={{ top: zone.top, left: zone.left, width: zone.width, height: zone.height }}
                              >
                                  <Lock size={24} className={`mb-2 opacity-50 group-hover:opacity-100 transition-opacity ${zone.status === 'Secured' ? 'text-emerald-600' : 'text-amber-600'}`} />
                                  <span className="font-black text-xs uppercase tracking-widest text-center">{zone.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  {selectedZone ? (
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col">
                          <div className="absolute top-0 end-0 p-6 opacity-10"><Lock size={100}/></div>
                          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Zone Details</h3>
                          
                          <div className="relative z-10 flex-1">
                              <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">{selectedZone.name}</h4>
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${selectedZone.status === 'Secured' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                                  {selectedZone.status}
                              </span>
                              
                              <div className="mt-8 space-y-6">
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Access</p>
                                      <p className="text-sm font-bold text-slate-300">{selectedZone.lastAccess}</p>
                                  </div>
                                  
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Activity</p>
                                      <div className="space-y-3">
                                          {selectedZone.logs.map((log, i) => (
                                              <div key={i} className="flex items-start gap-3 p-3 glass-card/5 rounded-xl border border-white/10">
                                                  <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                                  <p className="text-xs text-slate-300">{log}</p>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <button className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg relative z-10">
                              View Full Audit Log
                          </button>
                      </div>
                  ) : (
                      <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 shadow-xl h-full flex flex-col items-center justify-center text-center text-slate-400">
                          <Lock size={48} className="mb-4 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest">Select a zone on the map<br/>to view details</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default SecurityModule;
