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
  Sparkles, Layers, FileText, Target, Clock, ArrowRight, UserPlus,
  AlertOctagon, Play
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
import { EnterpriseRole, MFA_REQUIRED_ROLES, SOD_INVARIANTS } from '../packages/shared/src/rbac';

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface DelegationItem {
  id: string;
  delegator_id: string;
  delegate_id: string;
  delegator_name?: string;
  delegate_name?: string;
  role: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  is_active: boolean;
  created_at: string;
}

interface SodRuleItem {
  id: string;
  rule_code: string;
  name: string;
  entity_type: string;
  predicate_sql: string;
  severity: string;
  error_message: string;
  is_active: boolean;
}

interface EscalationRuleItem {
  id: string;
  rule_code: string;
  entity_type: string;
  condition: string;
  level: number;
  target_role: string;
  delay_minutes: number;
  is_active: boolean;
}

const AVAILABLE_PERMISSIONS = [
  'view_dashboard', 'manage_users', 'view_incidents', 'create_incidents', 
  'approve_permits', 'view_permits', 'manage_contractors', 'audit_site', 
  'view_reports', 'manage_chemicals', 'view_chemicals'
];

const DEFAULT_SOD_RULES: SodRuleItem[] = [
  {
    id: 'sod-ptw-01',
    rule_code: 'SOD_PTW_RECEIVER_NOT_ISSUER',
    name: 'Permit Receiver Cannot Self-Authorize',
    entity_type: 'PERMIT',
    predicate_sql: 'NEW.issuer_name != NEW.receiver_name',
    severity: 'CRITICAL',
    error_message: SOD_INVARIANTS.PERMIT_SIGNATORY_COLLISION,
    is_active: true
  },
  {
    id: 'sod-capa-01',
    rule_code: 'SOD_CAPA_OWNER_NOT_CLOSER',
    name: 'Action Owner Cannot Close Own Action',
    entity_type: 'CAPA',
    predicate_sql: 'NEW.owner_name != NEW.verified_by_name',
    severity: 'CRITICAL',
    error_message: SOD_INVARIANTS.CAPA_VERIFIER_COLLISION,
    is_active: true
  },
  {
    id: 'sod-inv-01',
    rule_code: 'SOD_INCIDENT_REPORTER_NOT_APPROVER',
    name: 'Reporter Cannot Approve Own Investigation',
    entity_type: 'INVESTIGATION',
    predicate_sql: 'reported_by != lead_investigator',
    severity: 'HIGH',
    error_message: SOD_INVARIANTS.INCIDENT_SELF_APPROVAL,
    is_active: true
  },
  {
    id: 'sod-rbac-01',
    rule_code: 'SOD_USER_CANNOT_SELF_GRANT_ROLE',
    name: 'User Cannot Self-Grant Security Role',
    entity_type: 'ROLE_ASSIGNMENT',
    predicate_sql: 'NEW.user_id != NEW.granted_by',
    severity: 'CRITICAL',
    error_message: SOD_INVARIANTS.ROLE_SELF_GRANT,
    is_active: true
  }
];

const DEFAULT_ESCALATION_RULES: EscalationRuleItem[] = [
  {
    id: 'esc-ptw-01',
    rule_code: 'ESC_PTW_PENDING_APPROVAL_120M',
    entity_type: 'PERMIT',
    condition: 'PENDING_APPROVAL',
    level: 1,
    target_role: EnterpriseRole.SITE_MANAGER,
    delay_minutes: 120,
    is_active: true
  },
  {
    id: 'esc-capa-01',
    rule_code: 'ESC_CAPA_OVERDUE_24H',
    entity_type: 'CAPA',
    condition: 'OVERDUE',
    level: 1,
    target_role: EnterpriseRole.HSE_OFFICER,
    delay_minutes: 1440,
    is_active: true
  },
  {
    id: 'esc-capa-02',
    rule_code: 'ESC_CAPA_OVERDUE_72H_CRITICAL',
    entity_type: 'CAPA',
    condition: 'OVERDUE',
    level: 2,
    target_role: EnterpriseRole.GROUP_HSE_DIRECTOR,
    delay_minutes: 4320,
    is_active: true
  }
];

const GovernanceModule: React.FC = () => {
  const { currentUser, users, switchUser } = useUser();
  const { regionalMode, activeProfile, openChangeModal } = useRegionalCompliance();
  const [activeTab, setActiveTab] = useState<'Identity' | 'Roles' | 'Delegations' | 'SoDRules' | 'Escalation' | 'System' | 'Audit'>('Identity');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<GlobalAuditLog[]>([]);
  
  // Custom roles
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

  // Phase 4: Role Assignment Modal
  const [selectedUserForRole, setSelectedUserForRole] = useState<any | null>(null);
  const [newAssignedRole, setNewAssignedRole] = useState<string>(EnterpriseRole.SUPERVISOR);
  const [roleAssignFeedback, setRoleAssignFeedback] = useState<string | null>(null);

  // Phase 4: Delegations state
  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [newDelegation, setNewDelegation] = useState({
    delegatorId: '',
    delegateId: '',
    role: EnterpriseRole.SUPERVISOR,
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    reason: 'Annual Leave / Field Supervision Coverage'
  });
  const [delegationFeedback, setDelegationFeedback] = useState<string | null>(null);

  // Phase 4: SoD Rules state
  const [sodRules, setSodRules] = useState<SodRuleItem[]>(DEFAULT_SOD_RULES);
  const [isSodModalOpen, setIsSodModalOpen] = useState(false);
  const [newSodRule, setNewSodRule] = useState({
    ruleCode: '',
    name: '',
    entityType: 'PERMIT',
    predicateSql: '',
    severity: 'CRITICAL',
    errorMessage: ''
  });

  // Phase 4: Escalation Rules state
  const [escalationRules, setEscalationRules] = useState<EscalationRuleItem[]>(DEFAULT_ESCALATION_RULES);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isEvaluatingEscalation, setIsEvaluatingEscalation] = useState(false);
  const [escalationFeedback, setEscalationFeedback] = useState<string | null>(null);
  const [newEscalationRule, setNewEscalationRule] = useState({
    ruleCode: '',
    entityType: 'PERMIT',
    condition: 'PENDING_APPROVAL',
    level: 1,
    targetRole: EnterpriseRole.SITE_MANAGER,
    delayMinutes: 60
  });

  // Fetch Delegations, SoD Rules, Escalation Rules, and Audit Logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const logs = await AuditLogger.getLogs();
        setAuditLogs(logs);

        // Fetch delegations from API
        const delRes = await fetch('/api/v1/admin/delegations', {
          headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' }
        });
        if (delRes.ok) {
          const data = await delRes.json();
          if (data?.data && Array.isArray(data.data)) {
            setDelegations(data.data);
          }
        }

        // Fetch SoD rules
        const sodRes = await fetch('/api/v1/admin/sod-rules', {
          headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' }
        });
        if (sodRes.ok) {
          const data = await sodRes.json();
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            setSodRules(data.data);
          }
        }

        // Fetch Escalation rules
        const escRes = await fetch('/api/v1/admin/escalation-rules', {
          headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' }
        });
        if (escRes.ok) {
          const data = await escRes.json();
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            setEscalationRules(data.data);
          }
        }
      } catch (err) {
        console.warn('[GovernanceModule] Data load warning:', err);
      }
    };
    fetchData();
  }, [activeTab]);

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

  // Phase 4: Handle Role Assignment
  const handleAssignRole = async () => {
    if (!selectedUserForRole) return;
    try {
      const res = await fetch('/api/v1/admin/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          userId: selectedUserForRole.id,
          roleId: newAssignedRole,
          grantedBy: currentUser.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoleAssignFeedback(`Successfully assigned role "${newAssignedRole}" to ${selectedUserForRole.name}.`);
        setTimeout(() => setRoleAssignFeedback(null), 5000);
        setSelectedUserForRole(null);
      } else {
        alert(data.error?.message || 'Failed to assign role');
      }
    } catch (err: any) {
      alert(`Role assignment error: ${err.message}`);
    }
  };

  // Phase 4: Handle Create Delegation
  const handleCreateDelegation = async () => {
    if (!newDelegation.delegatorId || !newDelegation.delegateId) {
      alert('Please select both Delegator and Delegate.');
      return;
    }
    if (newDelegation.delegatorId === newDelegation.delegateId) {
      alert('SoD Rule: A user cannot delegate authority to themselves.');
      return;
    }
    try {
      const res = await fetch('/api/v1/admin/delegations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          delegatorId: newDelegation.delegatorId,
          delegateId: newDelegation.delegateId,
          role: newDelegation.role,
          startsAt: new Date(newDelegation.startsAt).toISOString(),
          endsAt: new Date(newDelegation.endsAt).toISOString(),
          reason: newDelegation.reason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDelegations([data.data, ...delegations]);
        setIsDelegationModalOpen(false);
        setDelegationFeedback(`Role delegation created successfully. Delegate has authority until ${new Date(newDelegation.endsAt).toLocaleDateString()}.`);
        setTimeout(() => setDelegationFeedback(null), 6000);
      } else {
        alert(data.error?.message || 'Error creating delegation');
      }
    } catch (err: any) {
      alert(`Delegation error: ${err.message}`);
    }
  };

  // Phase 4: Handle Revoke Delegation
  const handleRevokeDelegation = async (delegationId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/delegations/${delegationId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        }
      });
      if (res.ok) {
        setDelegations(prev => prev.map(d => d.id === delegationId ? { ...d, is_active: false } : d));
        setDelegationFeedback('Delegation revoked immediately. Delegated authority terminated.');
        setTimeout(() => setDelegationFeedback(null), 5000);
      }
    } catch (err: any) {
      alert(`Error revoking delegation: ${err.message}`);
    }
  };

  // Phase 4: Handle Create SoD Rule
  const handleCreateSodRule = async () => {
    if (!newSodRule.ruleCode || !newSodRule.predicateSql || !newSodRule.errorMessage) {
      alert('Please fill out all required SoD rule fields.');
      return;
    }
    try {
      const res = await fetch('/api/v1/admin/sod-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(newSodRule)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSodRules([...sodRules, data.data]);
        setIsSodModalOpen(false);
        setNewSodRule({
          ruleCode: '',
          name: '',
          entityType: 'PERMIT',
          predicateSql: '',
          severity: 'CRITICAL',
          errorMessage: ''
        });
      } else {
        alert(data.error?.message || 'Failed to save SoD rule');
      }
    } catch (err: any) {
      alert(`Error saving SoD rule: ${err.message}`);
    }
  };

  // Phase 4: Handle Create Escalation Rule
  const handleCreateEscalationRule = async () => {
    if (!newEscalationRule.ruleCode) {
      alert('Rule Code is required.');
      return;
    }
    try {
      const res = await fetch('/api/v1/admin/escalation-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(newEscalationRule)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEscalationRules([...escalationRules, data.data]);
        setIsEscalationModalOpen(false);
      } else {
        alert(data.error?.message || 'Failed to save escalation rule');
      }
    } catch (err: any) {
      alert(`Error saving escalation rule: ${err.message}`);
    }
  };

  // Phase 4: Evaluate Escalation Rules Now
  const handleEvaluateEscalation = async () => {
    setIsEvaluatingEscalation(true);
    try {
      const res = await fetch('/api/v1/admin/escalation-rules/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ referenceTime: new Date().toISOString() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const out = data.data;
        setEscalationFeedback(`Evaluated ${out.evaluatedRecords} active safety entities. Emitted ${out.escalationsEmitted} escalation events into notification_outbox table.`);
        setTimeout(() => setEscalationFeedback(null), 8000);
      }
    } catch (err: any) {
      alert(`Escalation evaluation error: ${err.message}`);
    } finally {
      setIsEvaluatingEscalation(false);
    }
  };

  const userRoleStr = String(currentUser.role);
  if (userRoleStr !== 'ADMIN' && userRoleStr !== 'tenant_admin' && userRoleStr !== 'group_hse_director') {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-x-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
            <ShieldPlus size={36} />
          </div>
          <div className="text-start">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">System Governance</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-4 border-indigo-600 ps-4">
              Auth, RBAC, DB-Enforced SoD, Delegation & Statutory Escalation
            </p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner gap-1">
          {[
            { id: 'Identity', label: 'Identity & RBAC' },
            { id: 'Delegations', label: 'Delegations' },
            { id: 'SoDRules', label: 'SoD Rules' },
            { id: 'Escalation', label: 'Escalation' },
            { id: 'Roles', label: 'Custom Roles' },
            { id: 'System', label: 'System' },
            { id: 'Audit', label: 'Audit Trail' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {roleAssignFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-xs font-bold text-emerald-800">{roleAssignFeedback}</p>
        </div>
      )}

      {/* 1. IDENTITY & RBAC TAB */}
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
                  <button 
                    onClick={() => {
                      if (users.length > 0) {
                        setSelectedUserForRole(users[0]);
                      }
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    <UserPlus size={18}/> Assign Role
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start">
                  <thead>
                    <tr className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4">Enterprise Role</th>
                      <th className="px-6 py-4">MFA Policy</th>
                      <th className="px-6 py-4 text-end">Role Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-start">
                    {filteredUsers.map(user => {
                      const requiresMfa = MFA_REQUIRED_ROLES.has(user.role);
                      return (
                        <tr key={user.id} className="hover:glass-button/30 transition-all group">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{user.department} • {user.email || 'id: ' + user.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <KeyRound size={14} className="text-indigo-600"/>
                              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{user.role.replace(/_/g, ' ')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            {requiresMfa ? (
                              <span className="bg-amber-50 text-amber-800 text-[9px] font-black px-2.5 py-1 rounded-lg border border-amber-200 uppercase tracking-wider">
                                Mandatory MFA
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                Passwordless / SSO
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-6 text-end">
                            <button 
                              onClick={() => setSelectedUserForRole(user)}
                              className="px-4 py-2 glass-card border border-slate-200 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-all"
                            >
                              Edit Role
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 text-start">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 end-0 p-8 opacity-5 text-indigo-400 group-hover:scale-110 transition-transform duration-1000">
                <LockKeyhole size={180}/>
              </div>
              <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <Fingerprint size={18}/> Phase 4 RBAC & SoD Engine
              </h3>
              <div className="space-y-4 relative z-10 flex-1 text-xs">
                <div className="glass-card/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Canonical Enterprise Roles</p>
                  <p className="text-sm font-bold text-white mb-2">8 Predefined Safety Roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(EnterpriseRole).map(role => (
                      <span key={role} className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono text-teal-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl">
                  <p className="text-[10px] text-teal-200 font-bold uppercase tracking-wider">
                    DB-Layer Invariants Active:
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                    <li>Permit Receiver ≠ Permit Issuer (SP-1143)</li>
                    <li>CAPA Owner ≠ Verifier / Closer</li>
                    <li>Incident Reporter ≠ Lead Investigator Approver</li>
                    <li>Users cannot grant themselves roles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELEGATIONS TAB (Phase 4 Gap G7) */}
      {activeTab === 'Delegations' && (
        <div className="space-y-6 text-start">
          <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <Clock size={24} className="text-indigo-600"/> Time-Bound Role Delegation Management
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Enables audited temporary handover of safety authority (PDO SP-1143 / ISO 45001)
                </p>
              </div>
              <button 
                onClick={() => setIsDelegationModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={16}/> Create Delegation
              </button>
            </div>

            {delegationFeedback && (
              <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">{delegationFeedback}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-6 py-4">Delegator</th>
                    <th className="px-6 py-4">Delegate</th>
                    <th className="px-6 py-4">Delegated Role</th>
                    <th className="px-6 py-4">Active Window</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {delegations.map(del => {
                    const delegator = users.find(u => u.id === del.delegator_id);
                    const delegate = users.find(u => u.id === del.delegate_id);
                    const now = new Date().getTime();
                    const starts = new Date(del.starts_at).getTime();
                    const ends = new Date(del.ends_at).getTime();
                    const isWithinWindow = now >= starts && now <= ends;
                    const isEffectivelyActive = del.is_active && isWithinWindow;

                    return (
                      <tr key={del.id} className="hover:glass-button/40 transition">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {delegator?.name || del.delegator_name || del.delegator_id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-700">
                          {delegate?.name || del.delegate_name || del.delegate_id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 uppercase">
                          {del.role}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                          {new Date(del.starts_at).toLocaleDateString()} → {new Date(del.ends_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600 italic">
                          {del.reason}
                        </td>
                        <td className="px-6 py-4">
                          {isEffectivelyActive ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Active Window
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              Expired / Revoked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-end">
                          {del.is_active && (
                            <button 
                              onClick={() => handleRevokeDelegation(del.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {delegations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                        No active or past role delegations registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOD RULES VIEWER TAB (Phase 4 Gap G7) */}
      {activeTab === 'SoDRules' && (
        <div className="space-y-6 text-start">
          <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck size={24} className="text-teal-600"/> Database-Enforced Segregation of Duties (SoD) Rules
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Machine-checkable predicates enforced at the PostgreSQL trigger layer (cannot be bypassed by raw SQL)
                </p>
              </div>
              <button 
                onClick={() => setIsSodModalOpen(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-teal-700 transition-all flex items-center gap-2"
              >
                <Plus size={16}/> Define SoD Rule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sodRules.map(rule => (
                <div key={rule.id} className="p-6 glass-panel rounded-3xl border border-slate-200 hover:border-teal-300 transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold uppercase">
                        {rule.entity_type}
                      </span>
                      <h4 className="text-base font-black text-slate-800 uppercase tracking-tight mt-1">
                        {rule.name}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-[10px] font-black uppercase">
                      {rule.severity}
                    </span>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs">
                    <span className="text-slate-400">// Machine Predicate:</span><br/>
                    {rule.predicate_sql}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Violation Exception:</span> {rule.error_message}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                    <span>Code: {rule.rule_code}</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-black">
                      <CheckCircle2 size={12}/> DB Trigger Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ESCALATION RULES TAB (Phase 4 Gap G7) */}
      {activeTab === 'Escalation' && (
        <div className="space-y-6 text-start">
          <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <AlertOctagon size={24} className="text-amber-600"/> Automated Safety Escalation Rules Engine
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Worker monitors permits pending authorization and overdue CAPAs to emit outbox alerts
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleEvaluateEscalation}
                  disabled={isEvaluatingEscalation}
                  className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Play size={14} className={isEvaluatingEscalation ? 'animate-spin' : ''}/> 
                  {isEvaluatingEscalation ? 'Evaluating...' : 'Test Evaluate Outbox'}
                </button>
                <button 
                  onClick={() => setIsEscalationModalOpen(true)}
                  className="bg-amber-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-amber-700 transition-all flex items-center gap-2"
                >
                  <Plus size={16}/> Add Escalation Rule
                </button>
              </div>
            </div>

            {escalationFeedback && (
              <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600" />
                <p className="text-xs font-bold text-blue-800">{escalationFeedback}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-6 py-4">Rule Code</th>
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Trigger Condition</th>
                    <th className="px-6 py-4">Delay Threshold</th>
                    <th className="px-6 py-4">Escalate To Role</th>
                    <th className="px-6 py-4">Tier Level</th>
                    <th className="px-6 py-4 text-end">Worker Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {escalationRules.map(rule => (
                    <tr key={rule.id} className="hover:glass-button/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {rule.rule_code}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {rule.entity_type}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-amber-100 text-amber-900 rounded font-bold uppercase text-[10px]">
                          {rule.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                        {rule.delay_minutes >= 60 ? `${rule.delay_minutes / 60}h (${rule.delay_minutes} min)` : `${rule.delay_minutes} min`}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                        {rule.target_role.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        Level {rule.level}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          Active Monitoring
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CUSTOM ROLES TAB */}
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

      {/* 6. SYSTEM TAB */}
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
                      ADMIN AUTHORIZED
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
              Governs statutory notification deadlines (MD 286/2008 & RD 53/2023), summer heat stress work-stoppages, electronic PTW requirements (PDO SP-1143), 
              and compliance scorecards across all operating units. Managed centrally via the Regional Compliance Service.
            </p>

            {/* Dropdown Field */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="gov-sys-regional-compliance-dropdown" className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                  Regional Compliance Configuration
                </label>
              </div>

              <div className="relative">
                <select
                  id="gov-sys-regional-compliance-dropdown"
                  value={regionalMode}
                  onChange={(e) => {
                    const nextMode = e.target.value as RegionalComplianceMode;
                    if (nextMode !== regionalMode) {
                      openChangeModal(nextMode);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none"
                >
                  <option value="OMAN">Sultanate of Oman (Oman Labour Law RD 53/2023 & MD 286/2008)</option>
                  <option value="UAE">United Arab Emirates (MOHRE / OSHAD SF)</option>
                  <option value="COMBINED">Oman + UAE (Combined GCC Compliance)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Active Authority: <strong className="text-slate-200">{RegionalComplianceService.getRegulatoryTerminology('governingauthority', regionalMode)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL TAB */}
      {activeTab === 'Audit' && (
        <div className="glass-card p-10 rounded-[3.5rem] shadow-xl border border-slate-100 text-start space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Centralized Audit Ledger</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-[0.2em]">
                Append-Only Cryptographic Record of All System Actions & Delegations
              </p>
            </div>
            <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all">
              <History size={24}/>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Actor</th>
                  <th className="px-8 py-4">Action</th>
                  <th className="px-8 py-4">Resource</th>
                  <th className="px-8 py-4 text-end">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:glass-button/50 transition">
                    <td className="px-8 py-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <p className="font-black text-slate-800 uppercase tracking-tight">{log.actorName}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">{log.actorRole.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">{log.action}</span>
                    </td>
                    <td className="px-8 py-4 font-bold text-slate-500 uppercase">{log.resourceType}: {log.resourceId}</td>
                    <td className="px-8 py-4 text-end">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                        <ShieldCheck size={14}/> Verified
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {selectedUserForRole && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-start space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Assign Enterprise Role
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              User: <span className="text-slate-800">{selectedUserForRole.name}</span> ({selectedUserForRole.email || selectedUserForRole.id})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Canonical Role</label>
                <select 
                  value={newAssignedRole}
                  onChange={(e) => setNewAssignedRole(e.target.value)}
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                >
                  {Object.values(EnterpriseRole).map(r => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, ' ')} {MFA_REQUIRED_ROLES.has(r) ? ' [MFA Required]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {MFA_REQUIRED_ROLES.has(newAssignedRole) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  <strong>Security Policy:</strong> This role requires Multi-Factor Authentication (MFA). The user will be prompted for TOTP on next login.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedUserForRole(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-wider hover:glass-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignRole}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-indigo-700"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Delegation Modal */}
      {isDelegationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-start space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-indigo-600"/> Create Role Delegation
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delegator (Authority Holder)</label>
                <select 
                  value={newDelegation.delegatorId}
                  onChange={(e) => setNewDelegation({ ...newDelegation, delegatorId: e.target.value })}
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                >
                  <option value="">-- Select Delegator --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delegate (Deputy Recipient)</label>
                <select 
                  value={newDelegation.delegateId}
                  onChange={(e) => setNewDelegation({ ...newDelegation, delegateId: e.target.value })}
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                >
                  <option value="">-- Select Delegate --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delegated Role Authority</label>
                <select 
                  value={newDelegation.role}
                  onChange={(e) => setNewDelegation({ ...newDelegation, role: e.target.value as EnterpriseRole })}
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                >
                  {Object.values(EnterpriseRole).map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starts At</label>
                  <input 
                    type="datetime-local" 
                    value={newDelegation.startsAt}
                    onChange={(e) => setNewDelegation({ ...newDelegation, startsAt: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ends At</label>
                  <input 
                    type="datetime-local" 
                    value={newDelegation.endsAt}
                    onChange={(e) => setNewDelegation({ ...newDelegation, endsAt: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delegation Justification</label>
                <input 
                  type="text" 
                  value={newDelegation.reason}
                  onChange={(e) => setNewDelegation({ ...newDelegation, reason: e.target.value })}
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                  placeholder="e.g. Annual Leave, Off-site Inspection"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsDelegationModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-wider hover:glass-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateDelegation}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-indigo-700"
              >
                Issue Delegation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Define SoD Rule Modal */}
      {isSodModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-start space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} className="text-teal-600"/> Define Machine-Checkable SoD Rule
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rule Code</label>
                <input 
                  type="text" 
                  value={newSodRule.ruleCode}
                  onChange={(e) => setNewSodRule({ ...newSodRule, ruleCode: e.target.value })}
                  placeholder="e.g. SOD_CUSTOM_01"
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rule Name</label>
                <input 
                  type="text" 
                  value={newSodRule.name}
                  onChange={(e) => setNewSodRule({ ...newSodRule, name: e.target.value })}
                  placeholder="e.g. Crane Operator Cannot Self-Inspect Rigging"
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Type</label>
                  <select 
                    value={newSodRule.entityType}
                    onChange={(e) => setNewSodRule({ ...newSodRule, entityType: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  >
                    <option value="PERMIT">PERMIT</option>
                    <option value="CAPA">CAPA</option>
                    <option value="INVESTIGATION">INVESTIGATION</option>
                    <option value="ROLE_ASSIGNMENT">ROLE_ASSIGNMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</label>
                  <select 
                    value={newSodRule.severity}
                    onChange={(e) => setNewSodRule({ ...newSodRule, severity: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Predicate SQL Expression</label>
                <input 
                  type="text" 
                  value={newSodRule.predicateSql}
                  onChange={(e) => setNewSodRule({ ...newSodRule, predicateSql: e.target.value })}
                  placeholder="e.g. NEW.operator_id != NEW.inspector_id"
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Error Message on Violation</label>
                <input 
                  type="text" 
                  value={newSodRule.errorMessage}
                  onChange={(e) => setNewSodRule({ ...newSodRule, errorMessage: e.target.value })}
                  placeholder="SoD Violation: Operator cannot self-inspect"
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsSodModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-wider hover:glass-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSodRule}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-teal-700"
              >
                Deploy Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Escalation Rule Modal */}
      {isEscalationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-start space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <AlertOctagon size={20} className="text-amber-600"/> Add Safety Escalation Rule
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rule Code</label>
                <input 
                  type="text" 
                  value={newEscalationRule.ruleCode}
                  onChange={(e) => setNewEscalationRule({ ...newEscalationRule, ruleCode: e.target.value })}
                  placeholder="e.g. ESC_PERMIT_PENDING_60M"
                  className="w-full glass-panel border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Type</label>
                  <select 
                    value={newEscalationRule.entityType}
                    onChange={(e) => setNewEscalationRule({ ...newEscalationRule, entityType: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  >
                    <option value="PERMIT">PERMIT</option>
                    <option value="CAPA">CAPA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</label>
                  <select 
                    value={newEscalationRule.condition}
                    onChange={(e) => setNewEscalationRule({ ...newEscalationRule, condition: e.target.value })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  >
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Escalate To Role</label>
                  <select 
                    value={newEscalationRule.targetRole}
                    onChange={(e) => setNewEscalationRule({ ...newEscalationRule, targetRole: e.target.value as EnterpriseRole })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-xs"
                  >
                    {Object.values(EnterpriseRole).map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delay (Minutes)</label>
                  <input 
                    type="number" 
                    value={newEscalationRule.delayMinutes}
                    onChange={(e) => setNewEscalationRule({ ...newEscalationRule, delayMinutes: parseInt(e.target.value, 10) || 0 })}
                    className="w-full glass-panel border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsEscalationModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-wider hover:glass-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateEscalationRule}
                className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-amber-700"
              >
                Save Escalation Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceModule;
