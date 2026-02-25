
import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { 
  LayoutDashboard, AlertOctagon, FileSignature, Menu, UserCircle, 
  ClipboardCheck, Activity, FileText, Users, Leaf, ShieldAlert, BookOpen,
  HeartPulse, FolderTree, Compass, ShieldCheck, Gavel,
  Globe, ShieldPlus, LockKeyhole, LogOut, Layout,
  Search, ChevronDown, Bell, HelpCircle, Truck, HardHat, ArrowUp, FlaskConical, GitPullRequest,
  Shield, Eye, Settings, ChevronRight, FileClock, Briefcase, Scale,
  GraduationCap, Anchor, CheckSquare, Wrench, X, Command
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
const ContractorPortal = React.lazy(() => import('./ContractorPortal'));
const EnvironmentalModule = React.lazy(() => import('./EnvironmentalModule'));
const EmergencyModule = React.lazy(() => import('./EmergencyModule'));
const HealthMonitoringModule = React.lazy(() => import('./HealthMonitoringModule'));
const PlanningModule = React.lazy(() => import('./PlanningModule'));
const RAMSModule = React.lazy(() => import('./RAMSModule'));
const DMSModule = React.lazy(() => import('./DMSModule'));
const ExcavationModule = React.lazy(() => import('./ExcavationModule'));
const GovernanceModule = React.lazy(() => import('./GovernanceModule'));
import ChatBot from './ChatBot';
const TaskModule = React.lazy(() => import('./TaskModule'));
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
const SystemLogsModule = React.lazy(() => import('./SystemLogsModule'));
const ComplyFlowModule = React.lazy(() => import('./ComplyFlowModule'));
const ProjectsModule = React.lazy(() => import('./ProjectsModule'));
import Sidebar from './Sidebar';
import { AD6Logo } from './AD6Logo'; 
import { useUser } from '../contexts/UserContext';
import { UserRole, View } from '../types';

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
const DigitalTwinViewer = React.lazy(() => import('./DigitalTwinViewer'));
const ConnectedWorkerDashboard = React.lazy(() => import('./ConnectedWorkerDashboard'));
const RootCauseAnalysisTool = React.lazy(() => import('./RootCauseAnalysisTool'));
const ARProcedureViewer = React.lazy(() => import('./ARProcedureViewer'));
const IoTIntegrationStatus = React.lazy(() => import('./IoTIntegrationStatus'));

// Mock Data for Global Search Indexing
const GLOBAL_SEARCH_INDEX = [
  { id: 'PRJ-2024-001', type: 'Project', title: 'Ruwais Refinery Expansion', subtitle: 'Active • 35% Complete', view: View.PROJECTS },
  { id: 'PRJ-2024-002', type: 'Project', title: 'Fujairah Terminal Upgrade', subtitle: 'Active • 60% Complete', view: View.PROJECTS },
  { id: 'INC-772', type: 'Incident', title: 'Hydraulic Leak Generator A4', subtitle: 'Medium • Under Review', view: View.INCIDENTS },
  { id: 'INC-773', type: 'Incident', title: 'Scaffolding Safety Hazard', subtitle: 'High • Reported', view: View.INCIDENTS },
  { id: 'REG-001', type: 'Regulation', title: 'ADNOC COP V6.0', subtitle: 'Compliance Critical', view: View.COMPLY_FLOW },
  { id: 'REG-002', type: 'Regulation', title: 'OSHAD SF Mechanism 3.0', subtitle: 'System Framework', view: View.COMPLY_FLOW },
  { id: 'EQ-001', type: 'Equipment', title: 'Main Generator Alpha', subtitle: 'Zone B • Operational', view: View.MAINTENANCE },
  { id: 'EQ-003', type: 'Equipment', title: 'Tower Crane 04', subtitle: 'Site C • Critical Maintenance', view: View.MAINTENANCE },
  { id: 'PERMIT-202', type: 'Permit', title: 'Hot Work Zone B', subtitle: 'Active • Welding', view: View.PERMITS },
  { id: 'PERMIT-205', type: 'Permit', title: 'Confined Space Tank 4', subtitle: 'Pending • Inspection', view: View.PERMITS },
  { id: 'AUD-001', type: 'Audit', title: 'Q2 Compliance Audit - Zone A', subtitle: 'In Progress • ISO 45001', view: View.AUDITS },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [viewParams, setViewParams] = useState<any>({});
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, isLoadingAuth, logout, isDemoMode } = useUser();

  const handleNav = (view: View, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return GLOBAL_SEARCH_INDEX.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.id.toLowerCase().includes(lowerQuery) ||
      item.subtitle.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const handleSearchResultClick = (item: typeof GLOBAL_SEARCH_INDEX[0]) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    handleNav(item.view, { highlightId: item.id });
  };

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
          <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500"></div>
          </div>
      );
  }

  if (!currentUser) {
      if (authView === 'signup') {
          return <SignUpPage onLoginClick={() => setAuthView('login')} />;
      }
      return <LoginPage onSignUpClick={() => setAuthView('signup')} />;
  }

  return (
    <div className="flex h-screen bg-neutral-100 font-sans text-neutral-800">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        currentUser={currentUser}
        currentView={currentView}
        viewParams={viewParams}
        onNavigate={handleNav}
        logout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-neutral-50/50">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-neutral-100 shrink-0 z-40 sticky top-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-neutral-500 bg-neutral-50 rounded-xl shadow-sm border border-neutral-200 active:scale-95 transition-transform">
                <Menu size={20} />
              </button>
              
              {/* Breadcrumb Area */}
              <div className="hidden md:flex items-center text-sm font-bold text-neutral-400">
                 <span className="hover:text-brand-600 cursor-pointer transition-colors">App</span>
                 <ChevronRight size={14} className="mx-2 text-neutral-300"/>
                 <span className="text-neutral-800 font-black animate-fade-in">{currentView.replace(/_/g, ' ')}</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              {/* Enhanced Search */}
              <div className="relative hidden md:block group z-50" ref={searchRef}>
                 <div className="relative">
                    <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchOpen ? 'text-brand-500' : 'text-neutral-400 group-focus-within:text-brand-500'}`}/>
                    <input 
                      type="text" 
                      placeholder="Search ecosystem..." 
                      className={`pl-11 pr-12 py-2.5 w-72 bg-neutral-100/50 border border-transparent rounded-2xl text-sm text-neutral-700 font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 ${isSearchOpen ? 'bg-white border-brand-500 ring-4 ring-brand-500/10 w-96 shadow-lg' : ''}`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center gap-1">
                       {searchQuery ? (
                         <button onClick={() => setSearchQuery('')} className="pointer-events-auto hover:text-red-500"><X size={14}/></button>
                       ) : (
                         <Command size={14} className="opacity-50"/>
                       )}
                    </div>
                 </div>

                 {/* Search Dropdown */}
                 {isSearchOpen && searchQuery && (
                   <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                      <div className="p-3">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-3 py-2">Suggested Results</div>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {searchResults.length > 0 ? (
                            searchResults.map((result) => (
                              <button
                                key={result.id}
                                onClick={() => handleSearchResultClick(result)}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-all group text-left border border-transparent hover:border-neutral-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    {getResultIcon(result.type)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-neutral-800 group-hover:text-brand-600 transition-colors line-clamp-1">{result.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-bold text-neutral-400 uppercase bg-neutral-100 px-1.5 rounded-md border border-neutral-200">{result.type}</span>
                                      <span className="text-[9px] font-medium text-neutral-400 truncate max-w-[140px]">{result.subtitle}</span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-neutral-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-1"/>
                              </button>
                            ))
                          ) : (
                            <div className="p-8 text-center text-neutral-400">
                              <p className="text-xs font-medium italic">No matches found for "{searchQuery}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-3 text-center border-t border-neutral-100">
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Press Enter to view all results</p>
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex items-center gap-3">
                 <div className="relative">
                    <NotificationCenter />
                 </div>
                 <button className="p-2.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all active:scale-95">
                    <HelpCircle size={20} />
                 </button>
                 
                 {/* User Profile Dropdown */}
                 <div className="ml-2 pl-2">
                    <UserProfileDropdown />
                 </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content Area with Suspense and Error Boundary */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full animate-slide-up" key={currentView + JSON.stringify(viewParams)}>
            <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
                {currentView === View.DASHBOARD && <Dashboard onNavigate={handleNav} />}
                {currentView === View.COMPLIANCE && <ComplianceDashboard onNavigate={handleNav} />}
                {currentView === View.COMPLY_FLOW && <ComplyFlowModule />}
                {currentView === View.GOVERNANCE && <GovernanceModule />}
                {currentView === View.IAM && <GovernanceModule />}
                {currentView === View.SYSTEM_LOGS && <SystemLogsModule />}
                {currentView === View.PLANNING && <PlanningModule />}
                {currentView === View.RAMS && <RAMSModule />}
                {currentView === View.EXCAVATION && <ExcavationModule />}
                {currentView === View.DMS && <DMSModule />}
                {currentView === View.INCIDENTS && <IncidentForm />}
                {currentView === View.OBSERVATIONS && <SafetyObservationForm />}
                {currentView === View.PERMITS && <PermitForm {...viewParams} />}
                {currentView === View.TRAINING && <TrainingModule />}
                {currentView === View.INSPECTIONS && <InspectionModule {...viewParams} />}
                {currentView === View.AUDITS && <AuditModule />}
                {currentView === View.MAINTENANCE && <PredictiveMaintenanceModule />}
                {currentView === View.TOOLBOX && <ToolboxTalksModule />}
                {currentView === View.CONTRACTORS && <ContractorPortal />}
                {currentView === View.ENVIRONMENTAL && <EnvironmentalModule />}
                {currentView === View.EMERGENCY && <EmergencyModule />}
                {currentView === View.HEALTH && <HealthMonitoringModule />}
                {currentView === View.TASKS && <TaskModule />}
                {currentView === View.TRANSPORT && <TransportModule />}
                {currentView === View.PPE && <PPEModule />}
                {currentView === View.LIFTING && <LiftingModule />}
                {currentView === View.SECURITY && <SecurityModule />}
                {currentView === View.CHEMICALS && <ChemicalsModule />}
                {currentView === View.MOC && <MOCModule />}
                {currentView === View.PROJECTS && <ProjectsModule initialView={viewParams.initialView} />}
                
                {/* NEW PHASE 1/2 MODULES */}
                {currentView === View.PREDICTIVE_RISK && <PredictiveRiskDashboard />}
                {currentView === View.AR_PROCEDURES && <ARProcedureViewer />}
                {currentView === View.INTEGRATIONS && <IoTIntegrationStatus />}
                {currentView === View.ESG && <CarbonAccountingModule />}
                {currentView === View.DIGITAL_TWIN && <DigitalTwinViewer />}
                {currentView === View.CONNECTED_WORKER && <ConnectedWorkerDashboard />}
                {currentView === View.RCA_TOOL && <RootCauseAnalysisTool />}
            </React.Suspense>
          </div>
        </main>
      </div>
      
      <ChatBot />
      {isDemoMode && <RoleSwitcher />}
    </div>
  );
};

export default App;
