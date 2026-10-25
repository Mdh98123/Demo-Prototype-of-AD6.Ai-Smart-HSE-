import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, Building, Shield, Award, Calendar, 
  CheckCircle2, Clock, AlertTriangle, AlertOctagon, FileText, FileSignature, 
  Briefcase, Activity, CheckSquare, Search, Filter, ChevronRight, Sparkles, 
  Layers, HardHat, FileCheck, Flame, Bell, TrendingUp, Check, Globe, Scale, ShieldAlert
} from 'lucide-react';
import { 
  UserProfile, 
  UserActivityRecord, 
  UserPendingActionRecord, 
  UserCompletedActionRecord, 
  UserNotificationRecord,
  UserActivityStats
} from '../types';
import { UserProfileService } from '../services/userProfileService';
import { useLanguage } from '../contexts/LanguageContext';
import { useRegionalCompliance } from '../contexts/RegionalComplianceContext';
import { 
  RegionalComplianceMode, 
  RegionalComplianceService, 
  Jurisdiction, 
  regionalComplianceService, 
  JURISDICTION_PROFILES 
} from '../services/regionalComplianceService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user: initialUser
}) => {
  const { dir, t } = useLanguage();
  const { 
    regionalMode, 
    activeProfile, 
    openChangeModal, 
    auditHistory, 
    isUaeMode, 
    isOmanMode, 
    isCombinedMode 
  } = useRegionalCompliance();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'pending' | 'completed' | 'notifications' | 'competencies' | 'regional_admin'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('ALL');
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);

  const handleCompleteAction = async (actionId: string) => {
    setCompletingActionId(actionId);
    try {
      await UserProfileService.completePendingAction(userProfile.id, actionId);
      const updated = await UserProfileService.getUserById(userProfile.id);
      if (updated) {
        setUserProfile({ ...updated, statistics: UserProfileService.calculateLiveStats(updated) });
      }
    } finally {
      setCompletingActionId(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    await UserProfileService.markNotificationRead(userProfile.id, notificationId);
    const updated = await UserProfileService.getUserById(userProfile.id);
    if (updated) {
      setUserProfile({ ...updated, statistics: UserProfileService.calculateLiveStats(updated) });
    }
  };

  // Reload rich profile with live activities and statistics
  useEffect(() => {
    let isMounted = true;
    UserProfileService.getUserById(initialUser.id).then(enriched => {
      if (isMounted) {
        if (enriched) {
          // Re-calculate live statistics
          const liveStats = UserProfileService.calculateLiveStats(enriched);
          setUserProfile({ ...enriched, statistics: liveStats });
        } else {
          const liveStats = UserProfileService.calculateLiveStats(initialUser);
          setUserProfile({ ...initialUser, statistics: liveStats });
        }
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail?.userId === initialUser.id) {
        UserProfileService.getUserById(initialUser.id).then(enriched => {
          if (enriched && isMounted) {
            setUserProfile({ ...enriched, statistics: UserProfileService.calculateLiveStats(enriched) });
          }
        });
      }
    };

    window.addEventListener('ad6-user-activity-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ad6-user-activity-updated', handleUpdate);
    };
  }, [initialUser]);

  if (!isOpen) return null;

  const activities: UserActivityRecord[] = userProfile.activities || [];
  const pendingActions: UserPendingActionRecord[] = userProfile.pendingActions || [];
  const completedActions: UserCompletedActionRecord[] = userProfile.completedActions || [];
  const notifications: UserNotificationRecord[] = userProfile.notifications || [];
  const stats: UserActivityStats = userProfile.statistics || UserProfileService.calculateLiveStats(userProfile);

  // Filtered Activities
  const filteredActivities = activities.filter(act => {
    const matchesSearch = !activitySearch || 
      act.entityTitle.toLowerCase().includes(activitySearch.toLowerCase()) ||
      act.entityId.toLowerCase().includes(activitySearch.toLowerCase()) ||
      act.details.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesCategory = activityCategoryFilter === 'ALL' || act.category === activityCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Incident': return 'bg-red-50 text-red-700 border-red-200';
      case 'Permit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CAPA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inspection': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Audit': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SWA': return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Training': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority.includes('Critical')) return 'bg-red-500 text-white';
    if (priority.includes('High')) return 'bg-amber-500 text-white';
    if (priority.includes('Medium')) return 'bg-blue-500 text-white';
    return 'bg-slate-400 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-text" dir={dir}>
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] max-h-[880px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header & User Hero */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-6 shrink-0 border-b border-slate-800">
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 end-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`} 
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </span>
            </div>

            {/* Core Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black tracking-tight text-white">{userProfile.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {userProfile.role.replace(/_/g, ' ')}
                </span>
                {userProfile.employeeId && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                    {userProfile.employeeId}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-blue-200/90 mb-2">
                {userProfile.jobTitle || userProfile.department}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Building size={14} className="text-blue-400" />
                  <span>{userProfile.organization || 'Gulf Energy Group'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{userProfile.siteLocation || 'Mina Al Fahal Refinery Asset'}</span>
                </div>
                {userProfile.email && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Mail size={14} className="text-amber-400" />
                    <span>{userProfile.email}</span>
                  </div>
                )}
                {userProfile.phoneExtension && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone size={14} className="text-purple-400" />
                    <span>{userProfile.phoneExtension}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Health / Score Card */}
            <div className="hidden lg:flex flex-col items-end justify-center bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Compliance Rate</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-emerald-400">{stats.complianceRate}%</span>
                <span className="text-xs text-slate-300">verified</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                {stats.totalActivities} Live Records Logged
              </span>
            </div>
          </div>
        </div>

        {/* Live Performance Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 text-center shrink-0">
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Actions</span>
            <p className="text-base font-black text-slate-900 mt-0.5">{stats.totalActivities}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Inspections</span>
            <p className="text-base font-black text-blue-700 mt-0.5">{stats.inspectionsCompleted}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Work</span>
            <p className="text-base font-black text-amber-700 mt-0.5">{stats.actionsAssigned}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Closed Actions</span>
            <p className="text-base font-black text-emerald-700 mt-0.5">{stats.actionsCompleted}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Approvals</span>
            <p className="text-base font-black text-purple-700 mt-0.5">{stats.approvalsCompleted}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Overdue</span>
            <p className="text-base font-black text-red-700 mt-0.5">{stats.actionsOverdue}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={15} />
            <span>Profile & Governance</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity size={15} />
            <span>Recent Activities</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-700">
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={15} />
            <span>Pending Actions</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
              stats.actionsOverdue > 0 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {pendingActions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'completed'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Completed Actions</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              {completedActions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell size={15} />
            <span>Notifications</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-700">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('competencies')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'competencies'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award size={15} />
            <span>Skills & Certifications</span>
          </button>

          {userProfile.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('regional_admin')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'regional_admin'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe size={15} />
              <span>Regional Compliance</span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[10px] font-bold text-blue-800">
                {activeProfile.flag} {activeProfile.shortLabel}
              </span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          
          {/* TAB 1: OVERVIEW & GOVERNANCE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* SYSTEM ADMINISTRATOR REGIONAL COMPLIANCE SELECTOR CARD */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 rounded-2xl p-5 border border-slate-700 text-white shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                      <Globe size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-300">
                          Administrative Settings · System Governance
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active: {activeProfile.label}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-0.5">
                        Regional Compliance Configuration
                      </h3>
                    </div>
                  </div>

                  {userProfile.role !== 'ADMIN' ? (
                    <div className="text-xs text-slate-300 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                      <Shield size={14} className="text-amber-400" />
                      <span>Admin Access Required to Change Scope</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                      Authorized System Admin
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Controls the active regulatory scope across the entire application—governing statutory notification deadlines, 
                  summer heat stress work-stoppage hours, electronic PTW requirements, and compliance scorecards.
                </p>

                {/* The Dropdown Field as required by Prompt 2 */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label htmlFor="admin-regional-compliance-dropdown" className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                    Regional Compliance Configuration
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <select
                        id="admin-regional-compliance-dropdown"
                        disabled={userProfile.role !== 'ADMIN'}
                        value={regionalMode}
                        onChange={(e) => {
                          const nextMode = e.target.value as RegionalComplianceMode;
                          if (nextMode !== regionalMode) {
                            openChangeModal(nextMode);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none"
                      >
                        <option value="OMAN">Sultanate of Oman (National Framework)</option>
                        <option value="COMBINED">Oman Concessions & Freezones (PDO & SEZAD)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                    
                    {userProfile.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('regional_admin')}
                        className="px-4 py-3 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Scale size={15} />
                        <span>Inspect Regulatory Articles & Audit Log</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Regulatory Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Governing Frameworks</span>
                    <p className="font-semibold text-slate-200 mt-1 truncate" title={activeProfile.governingFrameworks.join(', ')}>
                      {activeProfile.governingFrameworks.slice(0, 2).join(' · ')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incident Reporting Window</span>
                    <p className="font-semibold text-slate-200 mt-1 truncate" title={activeProfile.incidentNotificationRule.formalSubmissionDeadline}>
                      {activeProfile.incidentNotificationRule.formalSubmissionDeadline}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Midday Heat Break</span>
                    <p className="font-semibold text-slate-200 mt-1 truncate" title={activeProfile.heatStressRule.prohibitedHours}>
                      {activeProfile.heatStressRule.prohibitedHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Organizational Placement */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-600" />
                    Enterprise Operational Placement
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Reporting Line / Manager:</span>
                      <strong className="text-slate-900">{userProfile.managerName || 'Sarah Jones (Site HSE Manager)'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Business Unit:</span>
                      <strong className="text-slate-900">{userProfile.businessUnit || 'Gas Processing & Refining'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Employment Status:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {userProfile.employmentStatus || 'Active (Rotational Full-Time)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Joining Date:</span>
                      <strong className="font-mono text-slate-800">{userProfile.joiningDate || '2021-04-12'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-medium">Current Workload:</span>
                      <div className="text-end">
                        <span className="font-bold text-slate-900">{userProfile.currentWorkload?.activeTasks || 6} Active Tasks</span>
                        <span className="text-slate-400 ms-1 font-mono">({userProfile.currentWorkload?.utilizationRate || 85}% load)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory Scope & Authorities */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-600" />
                    Statutory Delegated Authorities
                  </h3>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Signing & Approval Mandates:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(userProfile.approvalResponsibilities || [
                        'Permit to Work Level 2 Authorization',
                        'LOTO Spade De-Isolation Sign-off',
                        'Hot Work Standby Waivers'
                      ]).map((resp, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                          ✓ {resp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Operational Sites Authorized:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(userProfile.assignedSites || [
                        'Mina Al Fahal Refinery & Petrochemical Asset (Oman)',
                        'Fahud-West Gas Station (Oman)'
                      ]).map((site, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                          <MapPin size={12} /> {site}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Responsibilities */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CheckSquare size={16} className="text-purple-600" />
                  Primary Operational Responsibilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(userProfile.responsibilities || [
                    'Daily Permit to Work issue and Area Authority sign-off',
                    'Coordination of live SIMOPS de-confliction across Berth 1 & Substation 3',
                    'Enforcing zero energy isolation padlocks (LOTO Box #14)',
                    'Leading morning shift Toolbox Talks and Heat Stress fluid checks'
                  ]).map((resp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Compliance Bar */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    Regulatory HSE Training Matrix
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {userProfile.trainingStatus?.completedCourses || 14} / {userProfile.trainingStatus?.totalCourses || 14} Complete (100%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${userProfile.trainingStatus?.complianceRate || 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 10+ RECENT ACTIVITIES (FILTERABLE, INTERCONNECTED) */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute start-3 top-3 text-slate-400" />
                  <input 
                    type="text"
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    placeholder="Search action, ID, entity title..."
                    className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['ALL', 'Incident', 'Permit', 'CAPA', 'Inspection', 'Audit', 'SWA', 'Training'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActivityCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        activityCategoryFilter === cat 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Timeline List */}
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    No matching activity records found.
                  </div>
                ) : (
                  filteredActivities.map((act, index) => (
                    <div 
                      key={act.id || index}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeColor(act.category)}`}>
                            {act.category}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-700">
                            {act.entityId}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {act.actionType}
                          </span>
                          <span className="text-[10px] text-slate-400 ms-auto sm:ms-0 font-medium">
                            {new Date(act.timestamp).toLocaleDateString()} · {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-800">
                          {act.entityTitle}
                        </p>

                        <p className="text-xs text-slate-600">
                          {act.details}
                        </p>

                        {act.impactResult && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium mt-1">
                            <Sparkles size={12} className="text-emerald-600" />
                            <span>{act.impactResult}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-end">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-500 font-bold">
                          {act.timePeriod}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 10+ PENDING ACTIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
                <span>Assigned work items, permit approvals, and verification queue:</span>
                <span className="font-bold text-blue-700">{pendingActions.length} Actions in Queue</span>
              </div>

              {pendingActions.map(action => (
                <div 
                  key={action.id}
                  className={`bg-white rounded-2xl p-4 border shadow-xs transition-all flex flex-col sm:flex-row items-start justify-between gap-3 ${
                    action.isOverdue ? 'border-red-300 bg-red-50/20' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${getPriorityBadge(action.priority)}`}>
                        {action.priority.split(' - ')[0]}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {action.sourceId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {action.sourceType}
                      </span>
                      {action.isOverdue && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-900">
                      {action.title}
                    </p>

                    <p className="text-xs text-slate-600">
                      <strong>Action Required: </strong>{action.requiredAction}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {action.location}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={12} className="text-slate-400" /> Due: {action.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      action.status === 'Pending Approval' || action.status === 'Action Required'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      {action.status}
                    </span>
                    <button
                      onClick={() => handleCompleteAction(action.id)}
                      disabled={completingActionId === action.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                      title="Verify and complete this action record"
                    >
                      <CheckCircle2 size={13} />
                      <span>{completingActionId === action.id ? 'Verifying...' : 'Sign Off / Complete'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 10+ COMPLETED ACTIONS */}
          {activeTab === 'completed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
                <span>Verified completed milestones with cryptographic audit sign-off:</span>
                <span className="font-bold text-emerald-700">{completedActions.length} Verified Closures</span>
              </div>

              {completedActions.map(action => (
                <div 
                  key={action.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        ✓ {action.sourceType}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {action.sourceId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Completed: {new Date(action.completedDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">
                      {action.title}
                    </p>

                    <p className="text-xs text-slate-600">
                      <strong>Outcome: </strong>{action.outcome}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span>Verified by: <strong className="text-slate-800">{action.verifiedBy}</strong></span>
                      {action.evidenceNotes && (
                        <span className="italic text-slate-600">"{action.evidenceNotes}"</span>
                      )}
                      <span>Location: <strong>{action.location}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 text-end">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Verified Closed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: 10+ NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
                <span>System broadcasts, regulatory directives, and incident escalation notices:</span>
                <span className="font-bold text-blue-700">{notifications.length} Historical Records</span>
              </div>

              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`bg-white rounded-2xl p-4 border shadow-xs transition-all flex items-start gap-3.5 ${
                    notif.read ? 'border-slate-200' : 'border-blue-300 bg-blue-50/20'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    notif.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    notif.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Bell size={16} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                      <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600 font-bold">
                        {notif.category}
                      </span>
                      <span className="text-[10px] text-slate-400 ms-auto">
                        {new Date(notif.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <div className="flex items-center gap-3">
                        <span>Sender: {notif.senderName}</span>
                        <span>Ref: {notif.sourceId}</span>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="px-2 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-sans text-[10px] font-bold transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: COMPETENCIES & CERTIFICATIONS */}
          {activeTab === 'competencies' && (
            <div className="space-y-6">
              {/* Competencies */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Award size={16} className="text-blue-600" />
                  Verified Technical Competencies
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(userProfile.competencies || [
                    { competency: 'Certified Area Authority (PTW Level 3)', level: 'Expert', verifiedDate: '2026-02-10', verifierName: 'Eng. Mansoor Al-Ketbi' },
                    { competency: 'Authorized Gas Tester Level III', level: 'Expert', verifiedDate: '2026-01-15', verifierName: 'PDO AGT Board' },
                    { competency: 'Advanced Incident Containment', level: 'Proficient', verifiedDate: '2025-11-20', verifierName: 'Sarah Jones' }
                  ]).map((comp, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-900">{comp.competency}</strong>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {comp.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Verified by: {comp.verifierName}</span>
                        <span className="font-mono">{comp.verifiedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  Statutory Licenses & Certifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(userProfile.certifications || []).map((cert, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="text-xs font-bold text-slate-900">{cert.name}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {cert.status}
                        </span>
                        <span className="font-mono text-slate-500">Exp: {cert.expiryDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <HardHat size={16} className="text-amber-600" />
                  Key Skillsets
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(userProfile.skills || [
                    'SIMOPS De-Confliction',
                    'LOTO Zero Energy Isolation',
                    'Gas Testing Level III',
                    'Incident Triage',
                    'Root Cause Analysis (5-Why)'
                  ]).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM ADMINISTRATOR REGIONAL COMPLIANCE & GOVERNANCE */}
          {activeTab === 'regional_admin' && (
            <div className="space-y-6">
              {/* Top Selector Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black">
                      <Globe size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Global System Administration
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {activeProfile.flag} {activeProfile.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        Regional Regulatory Scope & Jurisdiction Policy
                      </h3>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    <label htmlFor="regional-admin-config-dropdown" className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Regional Compliance Configuration
                    </label>
                    <select
                      id="regional-admin-config-dropdown"
                      disabled={userProfile.role !== 'ADMIN'}
                      value={regionalMode}
                      onChange={(e) => openChangeModal(e.target.value as RegionalComplianceMode)}
                      className="w-full sm:w-72 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="OMAN">Sultanate of Oman (National Framework)</option>
                      <option value="COMBINED">Oman Concessions & Freezones (PDO & SEZAD)</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeProfile.description}
                </p>
              </div>

              {/* Verified Statutory Legislation Registry */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Scale size={16} className="text-indigo-600" />
                    Verified Statutory Legislation & Regulators ({activeProfile.primaryLegislation.length} In-Scope Laws)
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Legal Sources
                  </span>
                </div>

                <div className="space-y-3">
                  {activeProfile.primaryLegislation.map((leg, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-colors space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {leg.code}
                          </span>
                          <strong className="text-xs text-slate-900 font-bold">{leg.title}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">Effective: {leg.effectiveDate}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{leg.summary}</p>
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 pt-1 border-t border-slate-100">
                        <span>Regulator: <strong>{leg.authority}</strong></span>
                        <span>·</span>
                        <span>Jurisdiction: <strong>{leg.jurisdiction}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Notification & Heat Stress Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Incident Reporting Mandates */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-2">
                      <AlertOctagon size={16} />
                      Statutory Incident Reporting Window
                    </h4>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      Mandatory
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Immediate Escalation:</span>
                      <strong className="text-red-900 text-xs">{activeProfile.incidentNotificationRule.immediateNotificationWindow}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Formal Submission:</span>
                      <strong className="text-slate-900 text-xs">{activeProfile.incidentNotificationRule.formalSubmissionDeadline}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Required Statutory Forms:</span>
                      <p className="text-slate-800 text-[11px] font-semibold mt-0.5">
                        {activeProfile.incidentNotificationRule.requiredForms.join(' · ')}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Penalties for Delay:</span>
                      <p className="text-slate-700 italic mt-0.5">{activeProfile.incidentNotificationRule.penalties}</p>
                    </div>
                  </div>
                </div>

                {/* Summer Midday Heat Stress Mandates */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                      <Flame size={16} />
                      Midday Work Prohibition & Heat Controls
                    </h4>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Statutory Rule
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Prohibited Working Hours:</span>
                      <strong className="text-amber-950 text-xs">{activeProfile.heatStressRule.prohibitedHours}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Annual Application Months:</span>
                      <strong className="text-slate-900 text-xs">{activeProfile.heatStressRule.monthsApplicable}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Measurement Index & Thresholds:</span>
                      <p className="text-slate-800 text-[11px] font-semibold mt-0.5">
                        Amber: {activeProfile.heatStressRule.amberThreshold}
                      </p>
                      <p className="text-red-700 text-[11px] font-bold mt-0.5">
                        Red Cutoff: {activeProfile.heatStressRule.redThreshold}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Legal Basis:</span>
                      <p className="text-slate-700 font-medium mt-0.5">{activeProfile.heatStressRule.legalBasis}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Immutable Configuration Audit Trail */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    Immutable Configuration Audit Trail (Who, When, Previous, New, Reason)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">{auditHistory.length} Logged Events</span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs text-start">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2 px-3 text-start">Timestamp</th>
                        <th className="py-2 px-3 text-start">Administrator</th>
                        <th className="py-2 px-3 text-start">Previous</th>
                        <th className="py-2 px-3 text-start">New Mode</th>
                        <th className="py-2 px-3 text-start">Administrative Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                            {item.actorName} ({item.actorRole})
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.previousMode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              {item.newMode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                            {item.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Enterprise Account Status: <strong>Fully Verified & Compliant</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;
