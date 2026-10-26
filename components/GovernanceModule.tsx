
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { AuditLogger } from '../services/auditLogger';
import { GlobalAuditLog } from '../types';
import { 
  ShieldCheck, Users, KeyRound, Database, History, 
  Settings, Lock, ShieldPlus, Fingerprint, Activity,
  ChevronRight, ChevronDown, Search, Filter, MoreVertical, Shield,
  Zap, AlertTriangle, CheckCircle2, UserCheck, Eye,
  LockKeyhole, Globe, Terminal, Info, Trash2, Plus, RotateCcw,
  Sparkles, Layers, FileText, Target
} from 'lucide-react';
import { 
  DemoDataLoader, 
  GULF_ENERGY_TENANT, 
  GULF_ENERGY_SITES, 
  GULF_ENERGY_USERS, 
  GULF_ENERGY_INCIDENTS, 
  GULF_ENERGY_PERMITS, 
  GULF_ENERGY_CAPAS 
} from '../services/demoDataLoader';
import { useRegionalCompliance } from '../contexts/RegionalComplianceContext';
import { RegionalComplianceService, RegionalComplianceMode } from '../services/regionalComplianceService';

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  'view_dashboard', 'manage_users', 'view_incidents', 'create_incidents', 
  'approve_permits', 'view_permits', 'manage_contractors', 'audit_site', 
  'view_reports', 'manage_chemicals', 'view_chemicals'
];

const GovernanceModule: React.FC = () => {
  const { currentUser, users } = useUser();
  const { regionalMode, activeProfile, openChangeModal, auditHistory } = useRegionalCompliance();
  const [activeTab, setActiveTab] = useState<'Identity' | 'Roles' | 'System' | 'Audit'>('Identity');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<GlobalAuditLog[]>([]);
  
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([
    { id: 'CR-001', name: 'Site Auditor', description: 'Can view and audit site operations', permissions: ['view_incidents', 'view_permits', 'audit_site'] },
    { id: 'CR-002', name: 'Chemical Handler', description: 'Specialized role for chemical inventory management', permissions: ['view_chemicals', 'manage_chemicals', 'view_incidents'] },
    { id: 'CR-003', name: 'Emergency Responder', description: 'Role for first responders during incidents', permissions: ['view_incidents', 'manage_incidents', 'view_drills'] },
    { id: 'CR-004', name: 'Contractor Supervisor', description: 'Oversight of contractor activities', permissions: ['view_contractors', 'audit_contractors', 'view_permits'] },
    { id: 'CR-005', name: 'Training Coordinator', description: 'Manages LMS and training sessions', permissions: ['view_training', 'manage_training', 'view_users'] }
  ]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<Partial<CustomRole>>({ name: '', description: '', permissions: [] });
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      const counts = await DemoDataLoader.resetDemoData();
      setResetFeedback(`Successfully restored baseline demonstration records for Gulf Energy & Infrastructure Group: ${counts.sitesCount} Sites, ${counts.usersCount} Users, ${counts.incidentsCount} Incidents, ${counts.permitsCount} PTWs, and ${counts.capasCount} CAPAs.`);
      setTimeout(() => setResetFeedback(null), 8000);
    } catch (e: any) {
      console.error(e);
      setResetFeedback(`Error resetting demo data: ${e?.message || 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
      const fetchLogs = async () => {
          const logs = await AuditLogger.getLogs();
          setAuditLogs(logs);
      };
      fetchLogs();
  }, [activeTab]);

  if (currentUser.role !== 'ADMIN') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-6">
              <div className="p-8 bg-red-50 text-red-600 rounded-full border-4 border-dashed border-red-100 animate-pulse">
                  <Lock size={64}/>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Access Restriction</h3>
                <p className="text-slate-500 font-medium max-w-md mt-2">This terminal is restricted to accounts with System Governance privileges only.</p>
              </div>
          </div>
      );
  }

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-x-6">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                <ShieldPlus size={36} />
            </div>
            <div className="text-start">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">System Governance</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-4 border-indigo-600 ps-4">Administrative Policy & Lifecycle Management</p>
            </div>
          </div>
          <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
              {['Identity', 'Roles', 'System', 'Audit'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {activeTab === 'Identity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                  <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                          <div className="relative w-full max-w-lg">
                              <Search size={20} className="absolute start-5 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input 
                                type="text" 
                                placeholder="Search Identity Registry..." 
                                className="w-full ps-14 pe-6 py-4 glass-panel border-2 border-slate-50 rounded-2xl outline-none focus:glass-card focus:border-indigo-600 transition-all font-bold text-sm shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                          <div className="flex gap-4">
                             <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 active:scale-95 transition-all">
                                <Users size={18}/> Provision User
                             </button>
                          </div>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full text-start">
                              <thead>
                                  <tr className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                      <th className="px-8 py-6">User Identity</th>
                                      <th className="px-8 py-6">Role / Privilege</th>
                                      <th className="px-8 py-6">Status</th>
                                      <th className="px-8 py-6 text-end">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-start">
                                  {filteredUsers.map(user => (
                                      <tr key={user.id} className="hover:glass-button/30 transition-all group">
                                          <td className="px-8 py-8">
                                              <div className="flex items-center gap-5">
                                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                      {user.name.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <p className="text-base font-black text-slate-800 uppercase tracking-tight leading-none">{user.name}</p>
                                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{user.department}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-8 py-8">
                                              <div className="flex items-center gap-3">
                                                  <KeyRound size={14} className="text-indigo-600"/>
                                                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{user.role.replace(/_/g, ' ')}</span>
                                              </div>
                                          </td>
                                          <td className="px-8 py-8">
                                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest shadow-sm">Verified</span>
                                          </td>
                                          <td className="px-8 py-8 text-end">
                                              <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                  <button className="p-3 glass-card border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18}/></button>
                                                  <button className="p-3 glass-card border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-8 text-start">
                  <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden flex flex-col group">
                      <div className="absolute top-0 end-0 p-8 opacity-5 text-indigo-400 group-hover:scale-110 transition-transform duration-1000"><LockKeyhole size={180}/></div>
                      <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                          <Fingerprint size={18}/> RBAC Control Engine
                      </h3>
                      <div className="space-y-6 relative z-10 flex-1">
                          <div className="glass-card/5 border border-white/10 rounded-2xl p-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Policy Distribution</p>
                              <div className="flex justify-between items-end mb-2">
                                  <p className="text-sm font-bold">Standard Roles</p>
                                  <p className="text-lg font-black">12</p>
                              </div>
                              <div className="flex justify-between items-end">
                                  <p className="text-sm font-bold">Custom Overrides</p>
                                  <p className="text-lg font-black text-orange-400">03</p>
                              </div>
                          </div>
                          <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-start gap-4">
                              <Info size={18} className="text-teal-400 shrink-0 mt-1"/>
                              <p className="text-[10px] text-teal-100 font-medium leading-relaxed uppercase tracking-wide">
                                  All identity lifecycle actions are cryptographically hashed and mirrored to the regulatory audit log.
                              </p>
                          </div>
                      </div>
                      <button className="w-full mt-10 glass-card text-slate-900 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-teal-400 transition-all shadow-3xl active:scale-95">
                          Configure Role Matrix
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Roles' && (
          <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100 animate-in fade-in duration-500 text-start">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Custom Roles</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Granular Permission Management</p>
                  </div>
                  <button 
                      onClick={() => setIsRoleModalOpen(true)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                  >
                      <Plus size={16}/> Create Custom Role
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customRoles.map(role => (
                      <div key={role.id} className="p-6 glass-panel rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <Shield size={20}/>
                              </div>
                              <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                          <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{role.name}</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1 mb-4">{role.description}</p>
                          <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions ({role.permissions.length})</p>
                              <div className="flex flex-wrap gap-2">
                                  {role.permissions.slice(0, 3).map(p => (
                                      <span key={p} className="px-2 py-1 glass-card border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 uppercase">{p.replace(/_/g, ' ')}</span>
                                  ))}
                                  {role.permissions.length > 3 && (
                                      <span className="px-2 py-1 bg-slate-200 rounded-lg text-[9px] font-bold text-slate-600">+{role.permissions.length - 3}</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'System' && (
          <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100 animate-in fade-in duration-500 text-start space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
                  <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Enterprise Demonstrator
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Gulf Energy & Infrastructure Group</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mt-1">
                          System Environment & Demo Data Governance
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Baseline Synthetic GCC Dataset for Multi-Site Operations, Compliance & Audit
                      </p>
                  </div>

                  <div className="flex items-center gap-3">
                      <button
                          onClick={handleResetDemoData}
                          disabled={isResetting}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 disabled:opacity-50"
                      >
                          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                          <span>{isResetting ? 'Restoring Records...' : 'Reset Demo Data'}</span>
                      </button>
                  </div>
              </div>

              {resetFeedback && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-slide-down">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-800 font-medium leading-relaxed">
                          {resetFeedback}
                      </div>
                  </div>
              )}

              {/* Regional Compliance Configuration Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-[2.5rem] p-8 border border-slate-700 text-white shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                      <Globe size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                          System Administrator Settings
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {currentUser.role === 'ADMIN' ? 'ADMIN AUTHORIZED' : 'READ-ONLY ACCESS'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        Regional Compliance Configuration
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      Active: {activeProfile.flag} {activeProfile.label}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  Governs statutory notification deadlines, summer heat stress work-stoppages, electronic PTW requirements, 
                  and compliance scorecards across all operating units. Managed centrally via the Regional Compliance Service.
                </p>

                {/* Dropdown Field */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label htmlFor="gov-sys-regional-compliance-dropdown" className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                      Regional Compliance Configuration
                    </label>
                    {currentUser.role !== 'ADMIN' && (
                      <span className="text-[11px] text-amber-300 flex items-center gap-1 font-bold">
                        <Shield size={13} /> Restricted Access: System Administrator role required to modify configuration.
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      id="gov-sys-regional-compliance-dropdown"
                      disabled={currentUser.role !== 'ADMIN'}
                      value={regionalMode}
                      onChange={(e) => {
                        const nextMode = e.target.value as RegionalComplianceMode;
                        if (nextMode !== regionalMode) {
                          openChangeModal(nextMode);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none"
                    >
                      <option value="OMAN">United Arab Sultanate of Oman (Oman)</option>
                      <option value="OMAN">Sultanate of Oman (Oman)</option>
                      <option value="COMBINED">Oman + Oman (Combined Compliance)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Active Authority: <strong className="text-slate-200">{RegionalComplianceService.getRegulatoryTerminology('governingauthority', regionalMode)}</strong>
                  </p>
                </div>

                {/* Statutory Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Governing Framework</span>
                    <p className="font-semibold text-slate-200">
                      {RegionalComplianceService.getRegulatoryTerminology('primaryframework', regionalMode)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Heat Stress Regime</span>
                    <p className="font-semibold text-slate-200">
                      {RegionalComplianceService.getRegulatoryTerminology('heatstressprotocol', regionalMode)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Statutory Notification SLA</span>
                    <p className="font-semibold text-slate-200">
                      {RegionalComplianceService.getRegulatoryTerminology('incidentsubmissionsla', regionalMode)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Synthetic Data Architecture Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sites */}
                  <div className="p-6 glass-panel rounded-3xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">3 Operating Sites</span>
                          <Globe className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">Gulf Energy Assets</h4>
                      <ul className="space-y-2 text-xs text-slate-600 font-medium">
                          <li className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span><strong>Fahud-West Gas Station</strong> (Oman PDO Block 6)</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                              <span><strong>Mina Al Fahal Refinery Asset</strong> (Oman Petrochem)</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span><strong>Ras Al-Khair Facility</strong> (KSA Maritime Complex)</span>
                          </li>
                      </ul>
                  </div>

                  {/* Users */}
                  <div className="p-6 glass-panel rounded-3xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">10 Enterprise Users</span>
                          <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">Operational Tiers</h4>
                      <div className="space-y-1.5 text-xs text-slate-600">
                          <p>• <strong>Site Safety Officers:</strong> Tariq Al-Hashemi, Fatima Al-Kaabi</p>
                          <p>• <strong>Permit Issuers:</strong> Eng. Mansoor Al-Ketbi, Salim Al-Harthy, Abdulaziz Al-Ghamdi</p>
                          <p>• <strong>Occupational Health:</strong> Dr. Mariam Al-Balushi, Dr. Vikram Malhotra</p>
                          <p>• <strong>Subcontractor Leads:</strong> Suresh Pillai, Zaid Al-Otaibi</p>
                          <p>• <strong>Environmental Specialist:</strong> Khalid Al-Dhaheri</p>
                      </div>
                  </div>

                  {/* Records Summary */}
                  <div className="p-6 glass-panel rounded-3xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Demonstration Ledger</span>
                          <Layers className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">Seed Records</h4>
                      <div className="space-y-2 text-xs font-medium text-slate-600">
                          <div className="flex justify-between">
                              <span>Incident Records (LTI, H2S, First-Aid):</span>
                              <strong className="text-slate-900 font-mono">6</strong>
                          </div>
                          <div className="flex justify-between">
                              <span>Permits to Work (Active CS, HW LOTO, WBGT):</span>
                              <strong className="text-slate-900 font-mono">8</strong>
                          </div>
                          <div className="flex justify-between">
                              <span>Corrective Actions (CAPA Closed-Loop):</span>
                              <strong className="text-slate-900 font-mono">15</strong>
                          </div>
                          <div className="flex justify-between">
                              <span>IndexedDB Local Offline Cache:</span>
                              <strong className="text-emerald-600 font-mono">Synchronized</strong>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Regulatory Verification Badges */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-700">
                          <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                          <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">GCC Regulatory Compliance Pre-Populated</h5>
                          <p className="text-xs text-slate-500 mt-0.5">Pre-configured statutory mappings for Muscat Oman MoL OSHD Oman MoL Form MD 286 & Oman MoL MD 286/2008.</p>
                      </div>
                  </div>

                  <button
                      onClick={handleResetDemoData}
                      disabled={isResetting}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md shrink-0"
                  >
                      Reload Demo Dataset
                  </button>
              </div>
          </div>
      )}

      {activeTab === 'Audit' && (
          <div className="glass-card rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500 text-start">
               <div className="p-10 border-b border-slate-50 glass-panel/20 flex justify-between items-center">
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Centralized Audit Ledger</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-[0.2em]">Immutable Record of All System Actions</p>
                  </div>
                  <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all"><History size={24}/></button>
              </div>
              <div className="overflow-x-auto">
                   <table className="w-full text-start">
                       <thead className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                           <tr>
                               <th className="px-10 py-6">Timestamp</th>
                               <th className="px-10 py-6">Actor</th>
                               <th className="px-10 py-6">Action</th>
                               <th className="px-10 py-6">Resource</th>
                               <th className="px-10 py-6 text-end">Integrity</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {auditLogs.map((log) => (
                               <tr key={log.id} className="hover:glass-button/50 transition">
                                   <td className="px-10 py-8 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                   <td className="px-10 py-8">
                                       <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.actorName}</p>
                                       <p className="text-[9px] text-slate-400 uppercase tracking-widest">{log.actorRole.replace(/_/g, ' ')}</p>
                                   </td>
                                   <td className="px-10 py-8">
                                       <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded-lg border border-indigo-100">{log.action}</span>
                                   </td>
                                   <td className="px-10 py-8 text-xs font-bold text-slate-500 uppercase">{log.resourceType}: {log.resourceId}</td>
                                   <td className="px-10 py-8 text-end">
                                       <div className="flex items-center justify-end gap-2 text-[10px] font-black text-emerald-600 uppercase">
                                           <ShieldCheck size={14}/> Verified
                                       </div>
                                   </td>
                               </tr>
                           ))}
                           {auditLogs.length === 0 && (
                               <tr><td colSpan={5} className="px-10 py-12 text-center text-slate-300 italic font-medium uppercase tracking-widest">No audit records found</td></tr>
                           )}
                       </tbody>
                   </table>
              </div>
          </div>
      )}

      {isRoleModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-card rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-6">Create Custom Role</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Name</label>
                          <input 
                              type="text" 
                              className="w-full glass-panel border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="e.g. Guest Auditor"
                              value={newRole.name}
                              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                          <input 
                              type="text" 
                              className="w-full glass-panel border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="Brief description of the role's purpose"
                              value={newRole.description}
                              onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Granular Permissions</label>
                          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 glass-panel rounded-2xl border border-slate-100">
                              {AVAILABLE_PERMISSIONS.map(perm => (
                                  <label key={perm} className="flex items-center gap-3 p-2 hover:glass-card rounded-xl cursor-pointer transition-colors">
                                      <input 
                                          type="checkbox" 
                                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                          checked={newRole.permissions?.includes(perm)}
                                          onChange={(e) => {
                                              const perms = newRole.permissions || [];
                                              if (e.target.checked) {
                                                  setNewRole({...newRole, permissions: [...perms, perm]});
                                              } else {
                                                  setNewRole({...newRole, permissions: perms.filter(p => p !== perm)});
                                              }
                                          }}
                                      />
                                      <span className="text-xs font-bold text-slate-700 uppercase">{perm.replace(/_/g, ' ')}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-10">
                      <button 
                          onClick={() => setIsRoleModalOpen(false)}
                          className="px-6 py-3 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:glass-button transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => {
                              if (newRole.name && newRole.permissions?.length) {
                                  setCustomRoles([...customRoles, { id: `CR-${Date.now()}`, name: newRole.name, description: newRole.description || '', permissions: newRole.permissions }]);
                                  setIsRoleModalOpen(false);
                                  setNewRole({ name: '', description: '', permissions: [] });
                              }
                          }}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-colors"
                      >
                          Save Role
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const Edit3 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
);

const ArrowLeft = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

export default GovernanceModule;
