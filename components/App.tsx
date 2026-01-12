
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, AlertOctagon, FileSignature, Menu, UserCircle, 
  ClipboardCheck, Activity, FileText, Users, Leaf, ShieldAlert, BookOpen,
  HeartPulse, FolderTree, Compass, ShieldCheck, FileDigit, Gavel,
  Globe, ShieldPlus, LockKeyhole, LogOut, Layout,
  Search, ChevronDown, Bell, Wrench, Navigation, User, Eye, ChevronRight, Settings, HelpCircle, Inbox, CreditCard
} from 'lucide-react';
import Dashboard from './Dashboard';
import ComplianceDashboard from './ComplianceDashboard';
import IncidentForm from './IncidentForm';
import SafetyObservationForm from './SafetyObservationForm';
import PermitForm from './PermitForm';
import TrainingModule from './TrainingModule';
import InspectionModule from './InspectionModule';
import AuditModule from './AuditModule';
import PredictiveMaintenanceModule from './PredictiveMaintenanceModule';
import ToolboxTalksModule from './ToolboxTalksModule';
import ContractorPortal from './ContractorPortal';
import EnvironmentalModule from './EnvironmentalModule';
import EmergencyModule from './EmergencyModule';
import HealthMonitoringModule from './HealthMonitoringModule';
import PlanningModule from './PlanningModule';
import RAMSModule from './RAMSModule';
import DMSModule from './DMSModule';
import GovernanceModule from './GovernanceModule';
import ChatBot from './ChatBot';
import TaskModule from './TaskModule';
import NotificationCenter from './NotificationCenter';
import LoginPage from './LoginPage';
import RoleSwitcher from './RoleSwitcher'; 
import { AD6Logo } from './AD6Logo'; 
import { useUser } from '../contexts/UserContext';
import { UserRole, View } from '../types';

interface NavItem {
  view: View;
  icon: any;
  labelKey: string;
  roles: UserRole[];
  badge?: number;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'GENERAL',
    items: [
      { view: View.DASHBOARD, icon: LayoutDashboard, labelKey: 'Dashboard', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Project_Manager', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.TASKS, icon: Layout, labelKey: 'Tasks', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'] },
      { view: View.PERMITS, icon: FileSignature, labelKey: 'Permits', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.INCIDENTS, icon: AlertOctagon, labelKey: 'Incidents', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'], badge: 3 },
    ]
  },
  {
    labelKey: 'TOOLS',
    items: [
      { view: View.INSPECTIONS, icon: ClipboardCheck, labelKey: 'Inspections', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.RAMS, icon: FileDigit, labelKey: 'RAMS', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'] },
      { view: View.OBSERVATIONS, icon: Eye, labelKey: 'Observations', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.TRAINING, icon: UserCircle, labelKey: 'Training', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.AUDITS, icon: ShieldCheck, labelKey: 'Audits', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Internal_Auditor'] },
      { view: View.MAINTENANCE, icon: Activity, labelKey: 'Maintenance', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Site_Supervisor'] },
    ]
  },
  {
    labelKey: 'SUPPORT',
    items: [
      { view: View.GOVERNANCE, icon: Settings, labelKey: 'Settings', roles: ['ADMIN'] },
      { view: View.COMPLIANCE, icon: ShieldPlus, labelKey: 'Security', roles: ['ADMIN', 'Board_Director'] },
      { view: View.DMS, icon: HelpCircle, labelKey: 'Help', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Project_Manager', 'Internal_Auditor', 'Legal_Team'] },
    ]
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, isLoadingAuth, logout, t, isDemoMode } = useUser();

  if (isLoadingAuth) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-brand-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
      );
  }

  if (!currentUser) return <LoginPage />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-24 flex items-center px-8">
            <AD6Logo />
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.labelKey}>
              <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{group.labelKey}</h3>
              <div className="space-y-1">
                {group.items.filter(item => item.roles.includes(currentUser.role)).map((item) => (
                  <button
                    key={item.labelKey}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                      currentView === item.view 
                        ? 'bg-brand-50 text-brand-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={currentView === item.view ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} strokeWidth={2} />
                      <span>{item.labelKey}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-brand-50 rounded-2xl p-4 mb-4 text-center">
             <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-200">
               <ShieldCheck size={20} />
             </div>
             <h4 className="font-bold text-slate-800 text-sm">Enterprise Plan</h4>
             <button className="mt-3 w-full bg-white text-brand-600 text-xs font-bold py-2.5 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-all">
               Upgrade Plan
             </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-medium">© 2024 AD6.Ai Inc.</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-24 px-8 flex items-center justify-between bg-[#F8FAFC] shrink-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
                <Menu size={20} />
              </button>
              <div className="relative hidden md:block">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <input 
                    type="text" 
                    placeholder="Search (Ctrl+/)" 
                    className="pl-11 pr-4 py-3 w-80 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">F</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <button className="p-3 text-slate-400 hover:text-brand-600 hover:bg-white bg-transparent rounded-full transition-all">
                    <Inbox size={20} />
                 </button>
                 <div className="relative">
                    <NotificationCenter />
                 </div>
                 <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white bg-transparent rounded-full transition-all">
                    <LogOut size={20} />
                 </button>
              </div>
              
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs font-medium text-slate-400">{currentUser.role.replace(/_/g, ' ')}</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden relative cursor-pointer group">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                 </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {currentView === View.DASHBOARD && <Dashboard onNavigate={setCurrentView} />}
            {currentView === View.COMPLIANCE && <ComplianceDashboard onNavigate={setCurrentView} />}
            {currentView === View.GOVERNANCE && <GovernanceModule />}
            {currentView === View.IAM && <GovernanceModule />}
            {currentView === View.PLANNING && <PlanningModule />}
            {currentView === View.RAMS && <RAMSModule />}
            {currentView === View.DMS && <DMSModule />}
            {currentView === View.INCIDENTS && <IncidentForm />}
            {currentView === View.OBSERVATIONS && <SafetyObservationForm />}
            {currentView === View.PERMITS && <PermitForm />}
            {currentView === View.TRAINING && <TrainingModule />}
            {currentView === View.INSPECTIONS && <InspectionModule />}
            {currentView === View.AUDITS && <AuditModule />}
            {currentView === View.MAINTENANCE && <PredictiveMaintenanceModule />}
            {currentView === View.TOOLBOX && <ToolboxTalksModule />}
            {currentView === View.CONTRACTORS && <ContractorPortal />}
            {currentView === View.ENVIRONMENTAL && <EnvironmentalModule />}
            {currentView === View.EMERGENCY && <EmergencyModule />}
            {currentView === View.HEALTH && <HealthMonitoringModule />}
            {currentView === View.TASKS && <TaskModule />}
          </div>
        </main>
      </div>
      
      <ChatBot />
      {isDemoMode && <RoleSwitcher />}
    </div>
  );
};

export default App;
