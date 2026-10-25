
import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { 
  LayoutDashboard, AlertOctagon, FileSignature, Menu, UserCircle, 
  ClipboardCheck, Activity, FileText, Users, Leaf, ShieldAlert, BookOpen,
  HeartPulse, FolderTree, Compass, ShieldCheck, Gavel,
  Globe, ShieldPlus, LockKeyhole, LogOut, Layout,
  Search, ChevronDown, Bell, HelpCircle, Truck, HardHat, ArrowUp, FlaskConical, GitPullRequest,
  Shield, Eye, Settings, ChevronRight, FileClock, Briefcase, Scale,
  GraduationCap, Anchor, CheckSquare, Wrench, X, Command, Zap, LayoutGrid
} from 'lucide-react';
const Dashboard = React.lazy(() => import('./Dashboard'));
const ComplianceDashboard = React.lazy(() => import('./ComplianceDashboard'));
const IncidentForm = React.lazy(() => import('./IncidentForm'));
const SafetyObservationForm = React.lazy(() => import('./SafetyObservationForm'));
const PermitForm = React.lazy(() => import('./PermitForm'));
const TrainingModule = React.lazy(() => import('./TrainingModule'));
const InspectionModule = React.lazy(() => import('./InspectionModule'));
const AuditModule = React.lazy(() => import('./AuditModule'));
const PredictiveMaintenanceModule = React.lazy(() => import('./PredictiveMaintenanceModule'));
const ToolboxTalksModule = React.lazy(() => import('./ToolboxTalksModule'));
const EnvironmentalModule = React.lazy(() => import('./EnvironmentalModule'));
const EmergencyModule = React.lazy(() => import('./EmergencyModule'));
const HealthMonitoringModule = React.lazy(() => import('./HealthMonitoringModule'));
const PlanningModule = React.lazy(() => import('./PlanningModule'));
const RAMSModule = React.lazy(() => import('./RAMSModule'));
const DMSModule = React.lazy(() => import('./DMSModule'));
const ExcavationModule = React.lazy(() => import('./ExcavationModule'));
const JSAModule = React.lazy(() => import('./JSAModule'));
const GISMapModule = React.lazy(() => import('./GISMapModule'));
const LessonsLearnedModule = React.lazy(() => import('./LessonsLearnedModule'));
const HazardRegisterModule = React.lazy(() => import('./HazardRegisterModule'));
const CAPAModule = React.lazy(() => import('./CAPAModule'));
const LOTOModule = React.lazy(() => import('./LOTOModule'));
const TaskModule = React.lazy(() => import('./TaskModule'));
const MyWorkCockpit = React.lazy(() => import('./MyWorkCockpit'));
import NotificationCenter from './NotificationCenter';
import UserProfileDropdown from './UserProfileDropdown';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import RoleSwitcher from './RoleSwitcher'; 
const TransportModule = React.lazy(() => import('./TransportModule'));
const PPEModule = React.lazy(() => import('./PPEModule'));
const LiftingModule = React.lazy(() => import('./LiftingModule'));
const SecurityModule = React.lazy(() => import('./SecurityModule'));
const ChemicalsModule = React.lazy(() => import('./ChemicalsModule'));
const MOCModule = React.lazy(() => import('./MOCModule'));
const ComplyFlowModule = React.lazy(() => import('./ComplyFlowModule'));
const ProjectsModule = React.lazy(() => import('./ProjectsModule'));
const ArabicComponentsDemo = React.lazy(() => import('./ArabicComponentsModule').then(m => ({ default: m.ArabicComponentsDemo })));
import Sidebar from './Sidebar';
import { EnterpriseGlobalHeader } from './EnterpriseGlobalHeader';
import { GlobalCommandPalette } from './GlobalCommandPalette';
import { AICopilotDrawer } from './ai/AICopilotDrawer';
import { OfflineBanner } from './pwa/OfflineBanner';
import { MobileBottomNav } from './pwa/MobileBottomNav';
import { AD6Logo } from './AD6Logo'; 
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRegionalCompliance } from '../contexts/RegionalComplianceContext';
import { UserRole, View } from '../types';
import { GuestDemoModule } from './GuestDemoModule';
import { canAccessView, getDefaultLandingView } from '../services/permissionService';
import { AccessDenied } from './ui/AccessDenied';
import { WorkflowRecordPanel } from './workflow/WorkflowRecordPanel';

interface NavChild {
  labelKey: string;
  view: View;
  params?: Record<string, any>;
}

interface NavItem {
  view?: View;
  icon: any;
  labelKey: string;
  roles: UserRole[];
  badge?: number;
  children?: NavChild[];
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

// NEW MODULES
const CarbonAccountingModule = React.lazy(() => import('./CarbonAccountingModule'));
const PredictiveRiskDashboard = React.lazy(() => import('./PredictiveRiskDashboard'));
const PredictiveSafetyView = React.lazy(() => import('./PredictiveSafetyView'));
const DigitalTwinViewer = React.lazy(() => import('./DigitalTwinViewer'));
const ConnectedWorkerDashboard = React.lazy(() => import('./ConnectedWorkerDashboard'));
const OshadWorkflowDesigner = React.lazy(() => import('./oshad/OshadWorkflowDesigner').then(m => ({ default: m.OshadWorkflowDesigner })));
const RootCauseAnalysisTool = React.lazy(() => import('./RootCauseAnalysisTool'));
const BowtieAnalysisTool = React.lazy(() => import('./BowtieAnalysisTool'));
const ARProcedureViewer = React.lazy(() => import('./ARProcedureViewer'));
const MobileInspectionApp = React.lazy(() => import('./pwa/MobileInspectionApp').then(m => ({ default: m.MobileInspectionApp })));
const IoTIntegrationStatus = React.lazy(() => import('./IoTIntegrationStatus'));
const IotStatusModule = React.lazy(() => import('./IotStatusModule'));
const DigitalFormsBuilderModule = React.lazy(() => import('./DigitalFormsBuilderModule').then(m => ({ default: m.DigitalFormsBuilderModule })));
const BusinessContinuityModule = React.lazy(() => import('./BusinessContinuityModule').then(m => ({ default: m.BusinessContinuityModule })));
const IAMModule = React.lazy(() => import('./system/IAMModule').then(m => ({ default: m.IAMModule })));
const SystemLogsModule = React.lazy(() => import('./system/SystemLogsModule').then(m => ({ default: m.SystemLogsModule })));
const GovernanceModule = React.lazy(() => import('./system/GovernanceModule').then(m => ({ default: m.GovernanceModule })));
const ComplianceAssistant = React.lazy(() => import('./ai/ComplianceAssistant').then(m => ({ default: m.ComplianceAssistant })));
const ContractorPortal = React.lazy(() => import('./contractors/ContractorPortal').then(m => ({ default: m.ContractorPortal })));
const ExecutiveDashboard = React.lazy(() => import('./system/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const PricingGtmModule = React.lazy(() => import('./system/PricingGtmModule').then(m => ({ default: m.PricingGtmModule })));
const DesignSystemGallery = React.lazy(() => import('./DesignSystemGallery'));

// Mock Data for Global Search Indexing
const GLOBAL_SEARCH_INDEX = [
  { id: 'PRJ-2024-001', type: 'Project', title: 'Mina Al Fahal Refinery Debottlenecking', subtitle: 'Active • 35% Complete', view: View.PROJECTS },
  { id: 'PRJ-2024-002', type: 'Project', title: 'Sohar Terminal Expansion', subtitle: 'Active • 60% Complete', view: View.PROJECTS },
  { id: 'INC-772', type: 'Incident', title: 'Hydraulic Leak Generator A4', subtitle: 'Medium • Under Review', view: View.INCIDENTS },
  { id: 'INC-773', type: 'Incident', title: 'Scaffolding Safety Hazard', subtitle: 'High • Reported', view: View.INCIDENTS },
  { id: 'REG-001', type: 'Regulation', title: 'PDO SP-1143 (PTW)', subtitle: 'Compliance Critical', view: View.COMPLY_FLOW },
  { id: 'REG-002', type: 'Regulation', title: 'Oman MoL MD 286/2008', subtitle: 'System Framework', view: View.COMPLY_FLOW },
  { id: 'DS-001', type: 'System', title: 'AD6 Design System', subtitle: 'Component Library & Guidelines', view: View.DESIGN_SYSTEM },
  { id: 'EQ-001', type: 'Equipment', title: 'Main Generator Alpha', subtitle: 'Zone B • Operational', view: View.MAINTENANCE },
  { id: 'EQ-003', type: 'Equipment', title: 'Tower Crane 04', subtitle: 'Site C • Critical Maintenance', view: View.MAINTENANCE },
  { id: 'PERMIT-202', type: 'Permit', title: 'Hot Work Zone B', subtitle: 'Active • Welding', view: View.PERMITS },
  { id: 'PERMIT-205', type: 'Permit', title: 'Confined Space Tank 4', subtitle: 'Pending • Inspection', view: View.PERMITS },
  { id: 'AUD-001', type: 'Audit', title: 'Q2 Compliance Audit - Zone A', subtitle: 'In Progress • ISO 45001', view: View.AUDITS },
  { id: 'SIF-001', type: 'System', title: 'Predictive Safety (SIF Trends)', subtitle: 'Serious Injury & Fatality Analytics', view: View.PREDICTIVE_SAFETY },
  { id: 'BI-001', type: 'System', title: 'Executive BI Analytics', subtitle: 'TRIR, LTIFR, 12M Trend, Multi-Country Scorecard', view: View.EXECUTIVE_DASHBOARD },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/control-of-work') {
        return View.PERMIT_TO_WORK;
      }
      if (window.location.pathname === '/incidents') {
        return View.INCIDENTS;
      }
      if (window.location.pathname === '/ai-assistant') {
        return View.COMPLIANCE_ASSISTANT;
      }
      if (window.location.pathname === '/my-work') {
        return View.TASKS;
      }
      if (window.location.pathname === '/predictive-safety') {
        return View.PREDICTIVE_SAFETY;
      }
      if (window.location.pathname === '/analytics') {
        return View.EXECUTIVE_DASHBOARD;
      }
    }
    return View.TASKS; // Primary operational landing hub for enterprise users
  });
  const [viewParams, setViewParams] = useState<any>({});
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isGuestDemo, setIsGuestDemo] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  
  // Search State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, isLoadingAuth, logout, isDemoMode } = useUser();
  const { language, setLanguage, t, dir } = useLanguage();
  const { activeProfile } = useRegionalCompliance();

  const handleNav = (view: View, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);

    // Audit log unauthorized view navigation attempts
    if (currentUser && !canAccessView(currentUser, view)) {
      fetch('/api/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          operation: 'UNAUTHORIZED_VIEW_ACCESS_ATTEMPT',
          payload: { attemptedView: view, role: currentUser.role }
        })
      }).catch(() => {});
    }

    if (typeof window !== 'undefined') {
      if (view === View.TASKS) {
        if (window.location.pathname !== '/my-work') {
          window.history.pushState({}, '', '/my-work');
        }
      } else if (view === View.PERMIT_TO_WORK || view === View.PERMITS) {
        if (window.location.pathname !== '/control-of-work') {
          window.history.pushState({}, '', '/control-of-work');
        }
      } else if (view === View.INCIDENTS || view === View.INCIDENT_MANAGEMENT) {
        if (window.location.pathname !== '/incidents') {
          window.history.pushState({}, '', '/incidents');
        }
      } else if (view === View.COMPLIANCE_ASSISTANT) {
        if (window.location.pathname !== '/ai-assistant') {
          window.history.pushState({}, '', '/ai-assistant');
        }
      } else if (view === View.PREDICTIVE_SAFETY) {
        if (window.location.pathname !== '/predictive-safety') {
          window.history.pushState({}, '', '/predictive-safety');
        }
      } else if (view === View.EXECUTIVE_DASHBOARD || view === View.EXECUTIVE_COMMAND_CENTER || view === View.ANALYTICS_REPORTING) {
        if (window.location.pathname !== '/analytics') {
          window.history.pushState({}, '', '/analytics');
        }
      } else {
        if (window.location.pathname === '/my-work' || window.location.pathname === '/control-of-work' || window.location.pathname === '/incidents' || window.location.pathname === '/ai-assistant' || window.location.pathname === '/predictive-safety' || window.location.pathname === '/analytics') {
          window.history.pushState({}, '', '/');
        }
      }
    }
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  useEffect(() => {
    const handleWorkflowRecord = (event: Event) => {
      const detail = (event as CustomEvent<{ recordType?: string; recordId?: string }>).detail;
      if (!detail?.recordId) return;
      const targetView = detail.recordType === 'Permit'
        ? View.PERMITS
        : detail.recordType === 'Observation' || detail.recordType === 'NearMiss'
          ? View.OBSERVATIONS
          : detail.recordType === 'Inspection'
            ? View.INSPECTIONS
            : detail.recordType === 'Audit'
              ? View.AUDITS
              : detail.recordType === 'Training'
                ? View.TRAINING
                : detail.recordType === 'NCR'
                  ? View.INSPECTIONS
                  : detail.recordType === 'CAPA'
                    ? View.CAPA
                  : View.INCIDENTS;
      handleNav(targetView, {
        workflowRecordRef: detail,
        ...(detail.recordType === 'Permit' ? { initialPermitId: detail.recordId } : {}),
        initialWorkflowRecordId: detail.recordId
      });
    };
    window.addEventListener('ad6-open-workflow-record', handleWorkflowRecord);
    return () => window.removeEventListener('ad6-open-workflow-record', handleWorkflowRecord);
  }, [handleNav]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncPathWithView = () => {
        if (window.location.pathname === '/control-of-work') {
          setCurrentView(View.PERMIT_TO_WORK);
        } else if (window.location.pathname === '/my-work') {
          setCurrentView(View.TASKS);
        } else if (window.location.pathname === '/incidents') {
          setCurrentView(View.INCIDENTS);
        } else if (window.location.pathname === '/ai-assistant') {
          setCurrentView(View.COMPLIANCE_ASSISTANT);
        } else if (window.location.pathname === '/predictive-safety') {
          setCurrentView(View.PREDICTIVE_SAFETY);
        } else if (window.location.pathname === '/analytics') {
          setCurrentView(View.EXECUTIVE_DASHBOARD);
        }
      };

      syncPathWithView();
      window.addEventListener('popstate', syncPathWithView);
      return () => window.removeEventListener('popstate', syncPathWithView);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-redirect if active user does not have permission for the currently active view
  useEffect(() => {
    if (currentUser && !canAccessView(currentUser, currentView)) {
      const landing = getDefaultLandingView(currentUser);
      setCurrentView(landing);
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.permissions, currentUser?.isSuspended]);

  const getResultIcon = (type: string) => {
    switch(type) {
      case 'Project': return <Briefcase size={16} className="text-indigo-500" />;
      case 'Incident': return <AlertOctagon size={16} className="text-red-500" />;
      case 'Regulation': return <Scale size={16} className="text-teal-500" />;
      case 'Equipment': return <Activity size={16} className="text-blue-500" />;
      case 'Permit': return <FileSignature size={16} className="text-orange-500" />;
      case 'Audit': return <ShieldCheck size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  if (isLoadingAuth) {
      return (
          <div className="h-screen w-full flex items-center justify-center  ">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500"></div>
          </div>
      );
  }

  if (!currentUser) {
      if (isGuestDemo) {
          return <GuestDemoModule onExit={() => setIsGuestDemo(false)} />;
      }
      if (authView === 'signup') {
          return <SignUpPage onLoginClick={() => setAuthView('login')} />;
      }
      return <LoginPage onSignUpClick={() => setAuthView('signup')} onDemoClick={() => setIsGuestDemo(true)} />;
  }

  return (
    <div className={`flex h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-sky-50/30 ${dir === 'rtl' ? 'font-arabic' : 'font-sans'} text-slate-900 antialiased overflow-hidden select-none`} dir={dir}>
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[29] bg-slate-900/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enterprise Collapsible Primary Navigation Bar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        currentView={currentView}
        viewParams={viewParams}
        onNavigate={handleNav}
        logout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-transparent">

        {/* Visible DEMO MODE Banner (Labels environment as synthetic demonstration with exit action) */}
        {isDemoMode && currentUser && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white px-3 sm:px-5 py-2 shadow-sm shrink-0 flex items-center justify-between z-30 border-b border-amber-600/30 text-xs select-text">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[10px] sm:text-[11px] shrink-0 border border-white/25">
                Synthetic Demonstration Data · DEMO MODE
              </span>
              <span className="hidden lg:inline truncate opacity-95 text-xs text-amber-50">
                Simulated GCC Concession Environment — All records, workers, permits, and telemetry are synthetic demonstrations. No live industrial safety permits or real PII are stored.
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 ms-2">
              <span className="hidden sm:inline text-[11px] font-semibold text-amber-100 bg-amber-700/40 px-2 py-0.5 rounded border border-amber-500/30">
                Persona: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role?.replace(/_/g, ' ')})
              </span>
              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-950 rounded-md font-bold text-xs transition-all active:scale-95 shadow-xs flex items-center gap-1 cursor-pointer"
                title="Exit Demonstration Mode and return to Sign In"
              >
                <span>Exit Demonstration Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* PWA Offline Field Execution Indicator Banner */}
        <OfflineBanner />

        {/* Enterprise Global Header */}
        <EnterpriseGlobalHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          currentViewName={currentView}
        />

        {/* Scrollable Content Area with Suspense and Error Boundary */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/40 pb-20 lg:pb-12">
          <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-5 min-h-[calc(100vh-4rem)] flex flex-col" key={currentView + JSON.stringify(viewParams)}>
            {!canAccessView(currentUser, currentView) ? (
              <AccessDenied
                user={currentUser}
                restrictedView={currentView}
                safeView={getDefaultLandingView(currentUser)}
                onNavigateToSafe={(safe) => handleNav(safe)}
              />
            ) : (
              <React.Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[300px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                {currentView === View.DASHBOARD && <Dashboard onNavigate={handleNav} />}

                {/* BRAND NEW ENTERPRISE ARCHITECTURE VIEWS */}
                {currentView === View.EXECUTIVE_COMMAND_CENTER && <ExecutiveDashboard />}
                {currentView === View.HSE_OPERATIONS && <Dashboard onNavigate={handleNav} />}
                {currentView === View.INCIDENT_MANAGEMENT && <IncidentForm initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.SAFETY_AUDIT && <AuditModule initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.PERMIT_TO_WORK && <PermitForm {...viewParams} />}
                {currentView === View.VISUAL_INSPECTION && <SafetyObservationForm initialWorkflowRecordId={viewParams.workflowRecordRef?.recordId} />}
                {currentView === View.WORKFORCE_SAFETY && <MyWorkCockpit />}
                {currentView === View.TRAINING_COMPETENCY && <TrainingModule initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.COMPLIANCE_INTELLIGENCE && <ComplyFlowModule />}
                {currentView === View.ANALYTICS_REPORTING && <ExecutiveDashboard />}

                {currentView === View.COMPLIANCE && <ComplianceDashboard onNavigate={handleNav} />}
                {currentView === View.COMPLY_FLOW && <ComplyFlowModule />}
                {currentView === View.GOVERNANCE && <GovernanceModule />}
                {currentView === View.IAM && <GovernanceModule />}
                {currentView === View.SYSTEM_LOGS && <SystemLogsModule />}
                {currentView === View.PLANNING && <PlanningModule />}
                {currentView === View.RAMS && <RAMSModule />}
                {currentView === View.JSA && <JSAModule />}
                {currentView === View.EXCAVATION && <ExcavationModule />}
                {currentView === View.HAZARDS && <HazardRegisterModule />}
                {currentView === View.CAPA && (
                  <>
                    {viewParams.initialWorkflowRecordId && <WorkflowRecordPanel recordType="CAPA" recordId={viewParams.initialWorkflowRecordId} />}
                    <CAPAModule />
                  </>
                )}
                {currentView === View.LOTO && <LOTOModule />}
                {currentView === View.DMS && <DMSModule />}
                {currentView === View.FORMS_BUILDER && <DigitalFormsBuilderModule />}
                {currentView === View.BUSINESS_CONTINUITY && <BusinessContinuityModule />}
                {currentView === View.GIS_MAP && <GISMapModule />}
                {currentView === View.LESSONS_LEARNED && <LessonsLearnedModule />}
                {currentView === View.INCIDENTS && <IncidentForm initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.OBSERVATIONS && <SafetyObservationForm initialWorkflowRecordId={viewParams.workflowRecordRef?.recordId} />}
                {currentView === View.PERMITS && <PermitForm {...viewParams} />}
                {currentView === View.TRAINING && <TrainingModule initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.INSPECTIONS && <InspectionModule {...viewParams} />}
                {currentView === View.AUDITS && <AuditModule initialWorkflowRecordId={viewParams.initialWorkflowRecordId} />}
                {currentView === View.MAINTENANCE && <PredictiveMaintenanceModule />}
                {currentView === View.TOOLBOX && <ToolboxTalksModule />}
                {currentView === View.CONTRACTORS && <ContractorPortal />}
                {currentView === View.ENVIRONMENTAL && <EnvironmentalModule />}
                {currentView === View.EMERGENCY && <EmergencyModule />}
                {currentView === View.HEALTH && <HealthMonitoringModule />}
                {currentView === View.TASKS && <MyWorkCockpit />}
                {currentView === View.TRANSPORT && <TransportModule />}
                {currentView === View.PPE && <PPEModule />}
                {currentView === View.LIFTING && <LiftingModule />}
                {currentView === View.SECURITY && <SecurityModule />}
                {currentView === View.CHEMICALS && <ChemicalsModule />}
                {currentView === View.MOC && <MOCModule />}
                {currentView === View.PROJECTS && <ProjectsModule initialView={viewParams.initialView} />}
                
                {/* NEW PHASE 1/2 MODULES */}
                {currentView === View.PREDICTIVE_RISK && <PredictiveRiskDashboard />}
                {currentView === View.PREDICTIVE_SAFETY && <PredictiveSafetyView />}
                {currentView === View.AR_PROCEDURES && <ARProcedureViewer />}
                {currentView === View.INTEGRATIONS && <IoTIntegrationStatus />}
                {currentView === View.IOT_STATUS && <IotStatusModule />}
                {currentView === View.ESG && <CarbonAccountingModule />}
                {currentView === View.DIGITAL_TWIN && <DigitalTwinViewer />}
                {currentView === View.CONNECTED_WORKER && <ConnectedWorkerDashboard />}
                {currentView === View.ADNOC_OSHAD && <OshadWorkflowDesigner />}
                {currentView === View.RCA_TOOL && <RootCauseAnalysisTool />}
                {currentView === View.BOWTIE && <BowtieAnalysisTool />}
                {currentView === View.RTL_DEMO && <ArabicComponentsDemo />}
                {currentView === View.PWA_INSPECTIONS && <MobileInspectionApp />}
                {currentView === View.IAM && <IAMModule />}
                {currentView === View.SYSTEM_LOGS && <SystemLogsModule />}
                {currentView === View.GOVERNANCE && <GovernanceModule />}
                {currentView === View.COMPLIANCE_ASSISTANT && (
                  <AICopilotDrawer isOpen={true} onClose={() => handleNav(View.TASKS)} isFullPageView={true} />
                )}
                {currentView === View.CONTRACTOR_PORTAL && <ContractorPortal />}
                {currentView === View.EXECUTIVE_DASHBOARD && <ExecutiveDashboard />}
                {currentView === View.PRICING_GTM && <PricingGtmModule />}
                {currentView === View.DESIGN_SYSTEM && <DesignSystemGallery />}
              </React.Suspense>
            )}
          </div>
        </main>
      </div>
      
      {/* Statutory Jurisdictional Compliance & Security Status Bar (Desktop) */}
      <footer 
        aria-label="Statutory Jurisdictional Status"
        className={`hidden lg:flex fixed bottom-0 start-0 ${isSidebarOpen ? 'lg:ms-72' : 'lg:ms-20'} end-0 z-[20] px-4 py-1.5 bg-white/90 backdrop-blur-md border-t border-slate-200/90 text-[10px] text-slate-600 items-center justify-between transition-all duration-300 pointer-events-none select-none shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-800">
            {activeProfile.flag} {activeProfile.label} Statutory Enforcement
          </span>
          <span className="text-slate-500">· {activeProfile.privacyLawName} (RLS Active)</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-slate-500 font-medium">
          <span>Multi-Tenant Concession Isolation</span>
          <span>·</span>
          <span>{activeProfile.governingFrameworks.slice(0, 2).join(' / ')}</span>
        </div>
      </footer>

      {/* Mobile Field Primary Actions Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView} 
        onNavigate={handleNav} 
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        isAiCopilotOpen={isAiCopilotOpen}
      />

      <GlobalCommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={handleNav} />
      <AICopilotDrawer isOpen={isAiCopilotOpen} onClose={() => setIsAiCopilotOpen(false)} isFullPageView={false} />
      {isDemoMode && <RoleSwitcher />}
    </div>
  );
};

export default App;
