import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldAlert, AlertOctagon, AlertTriangle, CheckCircle2, Clock, 
  FileCheck, FileSignature, Flame, GraduationCap, HeartPulse, Lock, 
  Filter, Search, ArrowRight, UserCheck, RefreshCw, X, ChevronRight, 
  MapPin, Calendar, Building2, Eye, User, Send, Check, Shield, 
  ExternalLink, CornerDownRight, AlertCircle, FileText, ChevronDown,
  Sparkles, Award, RotateCcw, Briefcase
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTenant } from '../contexts/TenantContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EnterpriseDataStore, CockpitTask, StopWorkRecord } from '../services/enterpriseDataStore';
import { NotificationService } from '../services/notificationService';
import { UserProfileModal } from './UserProfileModal';
import WorkflowDashboard from './workflow/WorkflowDashboard';

export const MyWorkCockpit: React.FC = () => {
  const { currentUser } = useUser();
  const { currentTenant, currentSite } = useTenant();
  const { t, dir } = useLanguage();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Tasks dynamically derived from the central Enterprise Data Store
  const [tasks, setTasks] = useState<CockpitTask[]>(() => {
    return EnterpriseDataStore.getUserCockpitTasks(currentUser);
  });

  // Active Tab Filter
  const [activeTab, setActiveTab] = useState<'All Tasks' | 'Urgent / Overdue' | 'Permits' | 'Inspections' | 'CAPA'>('All Tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');

  // Stop Work Authority (SWA) Modal & Alert State
  const [isSwaModalOpen, setIsSwaModalOpen] = useState(false);
  const [swaLocation, setSwaLocation] = useState('');
  const [swaHazard, setSwaHazard] = useState('');
  const [swaAction, setSwaAction] = useState('');
  const [activeSwaAlert, setActiveSwaAlert] = useState<StopWorkRecord | null>(() => {
    return EnterpriseDataStore.getActiveSwa();
  });

  // Action Modals State
  const [actionModalType, setActionModalType] = useState<'sign' | 'clarify' | 'reassign' | null>(null);
  const [selectedTask, setSelectedTask] = useState<CockpitTask | null>(null);
  const [signatureRemarks, setSignatureRemarks] = useState('');
  const [clarificationText, setClarificationText] = useState('');
  const [reassignee, setReassignee] = useState('Fatima Al-Zaabi');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic user designation & active operational sites resolution
  const userDesignation = useMemo(() => {
    return (
      currentUser?.jobTitle ||
      (currentUser?.role ? currentUser.role.replace(/_/g, ' ') : '') ||
      currentUser?.department ||
      'Authorized HSE Operator'
    );
  }, [currentUser]);

  const assignedSitesList = useMemo(() => {
    if (currentUser?.assignedSites && currentUser.assignedSites.length > 0) {
      return currentUser.assignedSites;
    }
    if (currentUser?.siteLocation) {
      return [currentUser.siteLocation];
    }
    if (currentSite?.name) {
      return [currentSite.name];
    }
    return ['Fahud-West Gas Station (Oman)'];
  }, [currentUser, currentSite]);

  // Reload tasks whenever active persona/user changes or when store mutates
  const reloadCockpit = useCallback(() => {
    setTasks(EnterpriseDataStore.getUserCockpitTasks(currentUser));
    setActiveSwaAlert(EnterpriseDataStore.getActiveSwa());
  }, [currentUser]);

  useEffect(() => {
    reloadCockpit();
  }, [currentUser, reloadCockpit]);

  // Listen for real-time mutations from other modules or sessions
  useEffect(() => {
    const handleMutation = () => {
      reloadCockpit();
    };
    window.addEventListener('ad6-data-mutation', handleMutation);
    window.addEventListener('ad6-demo-data-reset', handleMutation);
    window.addEventListener('storage', handleMutation);
    return () => {
      window.removeEventListener('ad6-data-mutation', handleMutation);
      window.removeEventListener('ad6-demo-data-reset', handleMutation);
      window.removeEventListener('storage', handleMutation);
    };
  }, [reloadCockpit]);

  // Sync browser URL to /my-work if not already set
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/my-work') {
      window.history.replaceState({}, '', '/my-work');
    }
  }, []);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Summary Metrics Calculations (Real-time from live store)
  const metrics = useMemo(() => {
    const pendingApproval = tasks.filter(t => t.status === 'Pending Approval' || t.status === 'Action Required').length;
    const openCapa = tasks.filter(t => t.sourceType === 'CAPA' && t.status !== 'Approved' && t.status !== 'Acknowledged').length;
    const activePermitsInCustody = tasks.filter(t => t.sourceType === 'Permit' && (t.status === 'In Progress' || t.status === 'Pending Approval')).length;
    const overdueCount = tasks.filter(t => t.isOverdue || t.status === 'Overdue').length;

    return {
      pendingApproval,
      openCapa,
      activePermitsInCustody,
      overdueCount,
      daysToTrainingRenewal: 14,
      medicalClearanceDays: 42
    };
  }, [tasks]);

  // Tabbed Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Tab filter
      if (activeTab === 'Urgent / Overdue') {
        if (!task.isOverdue && task.status !== 'Overdue' && task.priority !== 'P1 - Critical') {
          return false;
        }
      } else if (activeTab === 'Permits') {
        if (task.sourceType !== 'Permit' && task.sourceType !== 'JSA') return false;
      } else if (activeTab === 'Inspections') {
        if (task.sourceType !== 'Inspection') return false;
      } else if (activeTab === 'CAPA') {
        if (task.sourceType !== 'CAPA') return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL') {
        if (!task.priority.startsWith(priorityFilter)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesSource = task.sourceId.toLowerCase().includes(q);
        const matchesLocation = task.location.toLowerCase().includes(q);
        const matchesAssignee = task.assignee.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSource && !matchesLocation && !matchesAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeTab, priorityFilter, searchQuery]);

  // -----------------------------------------------------------------
  // ACTION: Stop Work Authority Trigger (Real End-to-End Operation)
  // -----------------------------------------------------------------
  const handleTriggerSwa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swaLocation.trim() || !swaHazard.trim() || !swaAction.trim()) {
      alert('All 3 emergency Stop Work Authority fields are mandatory for statutory logging.');
      return;
    }

    const swaRecord = EnterpriseDataStore.triggerSwa(
      swaLocation,
      swaHazard,
      swaAction,
      currentUser
    );

    setActiveSwaAlert(swaRecord);
    setIsSwaModalOpen(false);
    setSwaLocation('');
    setSwaHazard('');
    setSwaAction('');

    reloadCockpit();
    showToast(`🚨 STOP WORK AUTHORITY ACTIVATED! Emergency Incident ${swaRecord.id} recorded & broadcast.`);
  };

  // -----------------------------------------------------------------
  // ACTION: Resolve Stop Work Authority (Verify & Resume Operations)
  // -----------------------------------------------------------------
  const handleResumeWork = () => {
    if (confirm('Confirm that all imminent hazards have been mitigated and area authority has approved resuming work?')) {
      EnterpriseDataStore.resolveSwa(currentUser);
      setActiveSwaAlert(null);
      reloadCockpit();
      showToast('✅ Stop Work condition lifted. Operations authorized to resume.');
    }
  };

  // -----------------------------------------------------------------
  // ACTION: Sign & Authorize (Persisted to Live Stores)
  // -----------------------------------------------------------------
  const handleConfirmAuthorization = () => {
    if (!selectedTask) return;

    if (selectedTask.sourceType === 'Permit') {
      if (currentUser.role === 'Worker') {
        // Field Receiver Custody Acceptance
        EnterpriseDataStore.acknowledgePermitCustody(selectedTask.sourceId, currentUser);
        showToast(`✅ Permit ${selectedTask.sourceId} safety briefing acknowledged. In field custody.`);
      } else {
        // Area Authority / Permit Issuer Digital Sign-off
        EnterpriseDataStore.authorizePermit(selectedTask.sourceId, currentUser, signatureRemarks);
        showToast(`✅ Permit ${selectedTask.sourceId} signed & authorized with digital verification.`);
      }
    } else if (selectedTask.sourceType === 'CAPA') {
      // Verify & Close CAPA
      EnterpriseDataStore.updateCapaStatus(selectedTask.sourceId, 'Closed', currentUser, signatureRemarks);
      showToast(`✅ CAPA ${selectedTask.sourceId} verified closed by ${currentUser.name}.`);
    } else {
      // General Task sign-off
      showToast(`✅ ${selectedTask.sourceId} verified and signed.`);
    }

    setActionModalType(null);
    setSelectedTask(null);
    setSignatureRemarks('');
    reloadCockpit();
  };

  // -----------------------------------------------------------------
  // ACTION: Acknowledge Task in Field
  // -----------------------------------------------------------------
  const handleAcknowledge = (task: CockpitTask) => {
    if (task.sourceType === 'Permit') {
      EnterpriseDataStore.acknowledgePermitCustody(task.sourceId, currentUser);
    }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Acknowledged', countdownText: 'Acknowledged by Assignee' } : t));
    showToast(`👍 Task ${task.sourceId} acknowledged.`);
  };

  // -----------------------------------------------------------------
  // ACTION: Request Clarification
  // -----------------------------------------------------------------
  const handleConfirmClarification = () => {
    if (!selectedTask) return;
    NotificationService.addNotification({
      title: `Clarification Requested: ${selectedTask.sourceId}`,
      description: `Clarification from ${currentUser.name}: ${clarificationText}`,
      severity: 'Medium',
      category: 'System',
      sourceId: selectedTask.sourceId,
      senderName: currentUser.name
    });

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'Clarification Requested', countdownText: 'Awaiting Info' } : t));
    showToast(`📩 Clarification request logged for ${selectedTask.sourceId}.`);
    setActionModalType(null);
    setSelectedTask(null);
    setClarificationText('');
  };

  // -----------------------------------------------------------------
  // ACTION: Reassign Task / CAPA
  // -----------------------------------------------------------------
  const handleConfirmReassign = () => {
    if (!selectedTask) return;
    if (selectedTask.sourceType === 'CAPA') {
      EnterpriseDataStore.reassignCapa(selectedTask.sourceId, reassignee, currentUser);
    }
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, assignee: reassignee, countdownText: `Reassigned to ${reassignee.split(' ')[0]}` } : t));
    showToast(`🔄 ${selectedTask.sourceId} reassigned to ${reassignee}.`);
    setActionModalType(null);
    setSelectedTask(null);
    reloadCockpit();
  };

  // Reset to default baseline data
  const handleResetData = () => {
    if (confirm('Reset My Work cockpit and enterprise databases to baseline GCC demonstration dataset?')) {
      EnterpriseDataStore.initialize(true);
      reloadCockpit();
      showToast('Cockpit reset to baseline enterprise demonstration state.');
    }
  };

  const getPriorityBadgeClass = (priority: CockpitTask['priority']) => {
    switch (priority) {
      case 'P1 - Critical':
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'P2 - High':
        return 'text-amber-800 bg-amber-50 border border-amber-200';
      case 'P3 - Medium':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      default:
        return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const getStatusBadgeClass = (status: CockpitTask['status']) => {
    switch (status) {
      case 'Overdue':
        return 'text-red-700 bg-red-50 border border-red-300 font-bold animate-pulse';
      case 'Pending Approval':
        return 'text-amber-800 bg-amber-50 border border-amber-200';
      case 'In Progress':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'Action Required':
        return 'text-rose-700 bg-rose-50 border border-rose-200 font-bold';
      case 'Approved':
      case 'Acknowledged':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'Clarification Requested':
        return 'text-cyan-700 bg-cyan-50 border border-cyan-200';
      default:
        return 'text-slate-700 bg-slate-100 border border-slate-200';
    }
  };

  return (
    <div className={`space-y-6 max-w-[1720px] mx-auto text-slate-900 pb-20 animate-fade-in ${dir === 'rtl' ? 'font-arabic' : 'font-sans'}`}>
      <WorkflowDashboard />
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 end-5 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold animate-slide-down">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active SWA Emergency Banner (if triggered) */}
      {activeSwaAlert && activeSwaAlert.status === 'ACTIVE_STOPPAGE' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-2 border-red-400 shadow-md shadow-red-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
              <AlertOctagon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-wider">
                  CRITICAL SWA ACTIVE
                </span>
                <span className="text-xs font-mono font-bold text-red-900">{activeSwaAlert.id}</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-600">Reported by {activeSwaAlert.reporterName}</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                {activeSwaAlert.hazardDescription}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 flex-wrap">
                <MapPin size={13} className="text-red-500" />
                <span className="font-semibold text-slate-800">{activeSwaAlert.location}</span>
                <span className="text-slate-300">·</span>
                <span>Immediate Action: <strong className="text-slate-800">{activeSwaAlert.immediateAction}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={handleResumeWork}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
          >
            Authorize Work Resumption
          </button>
        </div>
      )}

      {/* 1. Header Bar with Enterprise Light Glassmorphism Canvas */}
      <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 shadow-sm shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* User Display Section: Name, Job Designation, and Assigned Operational Sites */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          {/* User Profile Avatar with Online Status */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title={`View ${currentUser?.name || 'User'}'s complete enterprise profile`}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-0.5 shadow-md shadow-blue-500/20 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-[14px] bg-white overflow-hidden border border-white/60">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Authorized Operator'}`}
                  alt={currentUser?.name || 'Operator Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
            <span 
              className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" 
              title="Operational Active Shift"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* User Name & Job Designation */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 
                onClick={() => setIsProfileModalOpen(true)}
                className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight cursor-pointer hover:text-blue-700 transition-colors"
                title="Click to view user profile"
              >
                {currentUser?.name || 'Authorized Operator'}
              </h1>

              <span className="text-xs sm:text-sm font-bold text-blue-800 bg-blue-50/90 border border-blue-200/90 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
                <Briefcase size={14} className="text-blue-600 shrink-0" />
                <span className="truncate max-w-sm sm:max-w-md">{userDesignation}</span>
              </span>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Duty
              </span>
            </div>

            {/* List of Assigned Operational Sites */}
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5 flex-wrap">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1 shrink-0">
                <MapPin size={13} className="text-emerald-600" />
                Assigned Site{assignedSitesList.length > 1 ? 's' : ''}:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {assignedSitesList.map((site, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-900 font-semibold text-xs border border-slate-200/90 transition-colors shadow-2xs"
                  >
                    <Building2 size={12} className="text-blue-600 shrink-0" />
                    {site}
                  </span>
                ))}
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Org: <span className="text-slate-800 font-semibold">{currentUser?.organization || currentTenant?.name || 'Gulf Energy & Infrastructure Group'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed pt-0.5">
              Personalized operational workspace for assigned permits, critical task handovers, CAPA actions, and life-safety authorizations.
            </p>
          </div>
        </div>

        {/* Action Controls: Reset & High-Visibility SWA Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetData}
            title="Reset to default baseline enterprise dataset"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm transition-colors text-xs font-medium active:scale-95"
            aria-label="Reset demonstration dataset"
          >
            <RefreshCw size={15} />
          </button>

          {/* High-Visibility STOP WORK AUTHORITY Button */}
          <button
            onClick={() => {
              setSwaLocation(currentSite?.name || 'Fahud-West Gas Station · Wellhead Sector 4');
              setIsSwaModalOpen(true);
            }}
            className="group relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs tracking-wider uppercase border border-red-500 shadow-md shadow-red-600/30 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <AlertOctagon size={16} className="text-white group-hover:rotate-12 transition-transform" />
            <span>STOP WORK AUTHORITY (SWA)</span>
          </button>
        </div>

      </div>

      {/* 2. Four Priority Operational Summary Cards (Light Glassmorphism) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending My Approval */}
        <div 
          onClick={() => setActiveTab('All Tasks')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-blue-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-700 transition-colors">
              Pending My Approval
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <FileCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics.pendingApproval}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {metrics.pendingApproval > 0 ? `${metrics.pendingApproval} authorizations awaiting your sign-off` : 'No pending approvals'}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-100">
            <span>SLA: 1 expiring in &lt; 2h</span>
            <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Open Corrective Actions (CAPA) */}
        <div 
          onClick={() => setActiveTab('CAPA')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-amber-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-amber-700 transition-colors">
              Open Corrective Actions
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics.openCapa}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
              metrics.overdueCount > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {metrics.overdueCount > 0 ? `${metrics.overdueCount} Overdue` : 'Within SLA'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            Assigned to {currentUser.name.split(' ')[0]}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-100">
            <span className={metrics.overdueCount > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
              {metrics.overdueCount > 0 ? 'Overdue SLA: Action Required' : 'All actions on schedule'}
            </span>
            <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Active Permits in Custody */}
        <div 
          onClick={() => setActiveTab('Permits')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-emerald-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">
              Active Permits in Custody
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics.activePermitsInCustody}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Safe Watch
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            LOTO verified · Continuous gas test active
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-100">
            <span className="font-mono text-emerald-700 font-semibold">Gas Passed · 0% LEL</span>
            <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Competency & Compliance */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Competency & Fitness
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">98%</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {metrics.daysToTrainingRenewal}d to Renewal
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            H2S Escape Set Certification: Valid
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-100">
            <span>Medical Clearance: Valid ({metrics.medicalClearanceDays}d)</span>
            <Shield size={12} className="text-emerald-600" />
          </div>
        </div>

      </div>

      {/* 3. Tabbed Task Table Section (Light Glassmorphism) */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 shadow-sm shadow-slate-200/50 overflow-hidden">
        
        {/* Table Controls & Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['All Tasks', 'Urgent / Overdue', 'Permits', 'Inspections', 'CAPA'] as const).map(tab => {
              const isActive = activeTab === tab;
              const count = tab === 'All Tasks' 
                ? tasks.length 
                : tab === 'Urgent / Overdue'
                ? tasks.filter(t => t.isOverdue || t.status === 'Overdue' || t.priority === 'P1 - Critical').length
                : tab === 'Permits'
                ? tasks.filter(t => t.sourceType === 'Permit' || t.sourceType === 'JSA').length
                : tab === 'Inspections'
                ? tasks.filter(t => t.sourceType === 'Inspection').length
                : tasks.filter(t => t.sourceType === 'CAPA').length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    tab === 'Urgent / Overdue' && count > 0 
                      ? 'bg-red-500 text-white' 
                      : isActive 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter tasks, IDs, locations..."
                className="w-full bg-white border border-slate-200 rounded-xl ps-9 pe-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-medium shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium shadow-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
            </select>
          </div>

        </div>

        {/* Task Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-black uppercase tracking-wider text-slate-600 text-start">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Source ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">SLA Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700">No operational tasks pending in your queue.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All assigned permits, CAPA milestones, and inspections are up to date.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${getStatusBadgeClass(task.status)}`}>
                        {task.isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                        {task.status}
                      </span>
                    </td>

                    {/* Task Title */}
                    <td className="py-3.5 px-4 min-w-[240px] max-w-sm">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {task.description}
                      </p>
                      {task.gasStatus && (
                        <p className="text-[10px] font-mono text-cyan-700 mt-1 font-semibold">
                          ⚡ {task.gasStatus}
                        </p>
                      )}
                    </td>

                    {/* Source ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {task.sourceId}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{task.location}</span>
                      </div>
                    </td>

                    {/* SLA Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="leading-tight">
                        <p className={`font-bold ${task.isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                          {task.countdownText}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {task.dueDate} {task.dueTime}
                        </p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Action Button & Menu */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'Pending Approval' || task.status === 'Action Required' ? (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setActionModalType('sign');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm shadow-blue-600/20"
                          >
                            Sign & Authorize
                          </button>
                        ) : task.status === 'Overdue' ? (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setActionModalType('sign');
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm shadow-red-600/20"
                          >
                            Remediate Now
                          </button>
                        ) : task.status === 'In Progress' ? (
                          <button
                            onClick={() => handleAcknowledge(task)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-300/80"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Check size={13} /> Completed
                          </span>
                        )}

                        {/* Secondary Dropdown Trigger */}
                        <div className="relative group/more">
                          <button 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="More options"
                            aria-label="More task options"
                          >
                            <ChevronDown size={14} />
                          </button>

                          <div className="absolute end-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 hidden group-hover/more:block text-start text-xs animate-slide-down">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setActionModalType('clarify');
                              }}
                              className="w-full px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-start flex items-center gap-2 font-medium"
                            >
                              <Send size={12} className="text-slate-400" />
                              <span>Request Clarification</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setActionModalType('reassign');
                              }}
                              className="w-full px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-start flex items-center gap-2 font-medium"
                            >
                              <UserCheck size={12} className="text-slate-400" />
                              <span>Reassign Task</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Meta */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Showing {filteredTasks.length} of {tasks.length} total operational tasks</span>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
            <span>SLA Engine Active</span>
            <span>•</span>
            <span>ISO 45001 / Oman MoL MD 286/2008 Aligned</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">Synced with Central Store</span>
          </div>
        </div>

      </div>

      {/* ----------------- MODAL: STOP WORK AUTHORITY (SWA) ----------------- */}
      {isSwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border-2 border-red-500 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                  <AlertOctagon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Emergency Stop Work Authority (SWA)
                  </h3>
                  <p className="text-xs text-red-600 font-medium">
                    Statutory Life-Safety Stoppage Protocol (ILO C155 Art. 13)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSwaModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTriggerSwa} className="space-y-4">
              
              {/* Field 1: Location */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  1. Physical Location / Asset Zone <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={swaLocation}
                  onChange={e => setSwaLocation(e.target.value)}
                  placeholder="e.g. Fahud-West Gas Station · Wellhead Sector 4"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Field 2: Imminent Hazard */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  2. Imminent Hazard Identified <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={swaHazard}
                  onChange={e => setSwaHazard(e.target.value)}
                  placeholder="Describe the unsafe condition, uncontrolled energy, toxic gas reading, or fall hazard..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Field 3: Immediate Action Taken */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  3. Immediate Containment Action Taken <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={swaAction}
                  onChange={e => setSwaAction(e.target.value)}
                  placeholder="e.g. Stopped crew immediately, barricaded red zone, notified Area Authority..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSwaModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 uppercase tracking-wider transition-all"
                >
                  Confirm & Broadcast Stop Work
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: SIGN & AUTHORIZE ----------------- */}
      {actionModalType === 'sign' && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <FileSignature size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Digital Sign-off & Verification
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTask.sourceId} · {selectedTask.sourceType}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActionModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-900">{selectedTask.title}</p>
                <p className="text-[11px] text-slate-600">{selectedTask.description}</p>
                <p className="text-[10px] text-blue-700 font-mono pt-1">
                  Signatory: {currentUser.name} ({currentUser.role})
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Verification Remarks / Sign-off Confirmation
                </label>
                <textarea
                  rows={3}
                  value={signatureRemarks}
                  onChange={e => setSignatureRemarks(e.target.value)}
                  placeholder="Confirm zero energy verification, atmospheric gas testing readings, or physical completion evidence..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => setActionModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAuthorization}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  Confirm & Apply Digital Signature
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MODAL: REASSIGN TASK ----------------- */}
      {actionModalType === 'reassign' && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Reassign Operational Task
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTask.sourceId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActionModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Qualified Designated Assignee
                </label>
                <select
                  value={reassignee}
                  onChange={e => setReassignee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Fatima Al-Zaabi">Fatima Al-Zaabi (Site HSE Officer)</option>
                  <option value="Marcus Chen">Marcus Chen (Permit Issuer & Supervisor)</option>
                  <option value="Rahul Gupta">Rahul Gupta (Lead Mechanical Technician)</option>
                  <option value="Salim Al-Harthy">Salim Al-Harthy (Senior Gas Tester)</option>
                  <option value="Tariq Al-Hashemi">Tariq Al-Hashemi (Senior Safety Officer)</option>
                  <option value="Zaid Al-Otaibi">Zaid Al-Otaibi (Civil Supervisor)</option>
                  <option value="Suresh Pillai">Suresh Pillai (Rigging Specialist)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => setActionModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReassign}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MODAL: REQUEST CLARIFICATION ----------------- */}
      {actionModalType === 'clarify' && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Request Clarification
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTask.sourceId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActionModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Clarification Query
                </label>
                <textarea
                  rows={3}
                  value={clarificationText}
                  onChange={e => setClarificationText(e.target.value)}
                  placeholder="Specify missing LOTO tag verification, P&ID revision number, or contractor certification..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => setActionModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClarification}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20 transition-all"
                >
                  Send Clarification Request
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Enterprise User Profile Detailed Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      )}

    </div>
  );
};

export default MyWorkCockpit;
