
import React, { useState } from 'react';
import { 
  LayoutDashboard, AlertOctagon, FileSignature, Menu, UserCircle, 
  ClipboardCheck, Activity, FileText, Users, Leaf, ShieldAlert, BookOpen,
  HeartPulse, FolderTree, Compass, ShieldCheck, FileDigit, Gavel,
  Globe, ShieldPlus, LockKeyhole, LogOut,
  Search, ChevronDown, Bell
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ComplianceDashboard from './components/ComplianceDashboard';
import IncidentForm from './components/IncidentForm';
import SafetyObservationForm from './components/SafetyObservationForm';
import PermitForm from './components/PermitForm';
import TrainingModule from './components/TrainingModule';
import InspectionModule from './components/InspectionModule';
import AuditModule from './components/AuditModule';
import PredictiveMaintenanceModule from './components/PredictiveMaintenanceModule';
import ToolboxTalksModule from './components/ToolboxTalksModule';
import ContractorPortal from './components/ContractorPortal';
import EnvironmentalModule from './components/EnvironmentalModule';
import EmergencyModule from './components/EmergencyModule';
import HealthMonitoringModule from './components/HealthMonitoringModule';
import PlanningModule from './components/PlanningModule';
import RAMSModule from './components/RAMSModule';
import DMSModule from './components/DMSModule';
import GovernanceModule from './components/GovernanceModule';
import ChatBot from './components/ChatBot';
import NotificationCenter from './components/NotificationCenter';
import LoginPage from './components/LoginPage';
import RoleSwitcher from './components/RoleSwitcher'; 
import { AD6Logo } from './components/AD6Logo'; 
import { useUser } from './contexts/UserContext';
import { UserRole, ComplianceFramework, View } from './types';

interface NavItem {
  view: View;
  icon: any;
  labelKey: string;
  roles: UserRole[];
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'governance',
    items: [
      { view: View.DASHBOARD, icon: LayoutDashboard, labelKey: 'dashboard', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Project_Manager'] },
      { view: View.GOVERNANCE, icon: ShieldPlus, labelKey: 'System Governance', roles: ['ADMIN'] },
      { view: View.IAM, icon: LockKeyhole, labelKey: 'Access Policies', roles: ['ADMIN'] },
      { view: View.COMPLIANCE, icon: Gavel, labelKey: 'compliance', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Project_Manager', 'Legal_Team'] },
      { view: View.PLANNING, icon: Compass, labelKey: 'planning', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Project_Manager'] },
      { view: View.AUDITS, icon: ShieldCheck, labelKey: 'audits', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Internal_Auditor'] },
      { view: View.CONTRACTORS, icon: Users, labelKey: 'contractors', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Project_Manager'] },
    ]
  },
  {
    labelKey: 'operational',
    items: [
      { view: View.RAMS, icon: FileDigit, labelKey: 'rams', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'] },
      { view: View.PERMITS, icon: FileSignature, labelKey: 'permits', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.INCIDENTS, icon: AlertOctagon, labelKey: 'incidents', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.INSPECTIONS, icon: ClipboardCheck, labelKey: 'inspections', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.TOOLBOX, icon: BookOpen, labelKey: 'toolbox', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
    ]
  },
  {
    labelKey: 'specialized',
    items: [
      { view: View.ENVIRONMENTAL, icon: Leaf, labelKey: 'environmental', roles: ['ADMIN', 'Head_Group_HSE', 'Environmental_Officer', 'Site_HSE_Manager'] },
      { view: View.MAINTENANCE, icon: Activity, labelKey: 'maintenance', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Site_Supervisor'] },
      { view: View.HEALTH, icon: HeartPulse, labelKey: 'health', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HR_Coordinator'] },
      { view: View.EMERGENCY, icon: ShieldAlert, labelKey: 'emergency', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
    ]
  },
  {
    labelKey: 'knowledge',
    items: [
      { view: View.DMS, icon: FolderTree, labelKey: 'dms', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Project_Manager', 'Internal_Auditor', 'Legal_Team'] },
      { view: View.TRAINING, icon: UserCircle, labelKey: 'training', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
    ]
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, isLoadingAuth, logout, language, toggleLanguage, t, isDemoMode } = useUser();

  // AUTH GUARD
  if (isLoadingAuth) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  if (!currentUser) {
      return <LoginPage />;
  }

  return (
    <div className={`flex h-screen bg-[#F8FAFC] overflow-hidden font-inter ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSidebarOpen(false)} />
      )}

      {/* META STYLE SIDEBAR: White background, soft styling */}
      <aside className={`fixed lg:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 bg-white transition-all duration-300 flex-shrink-0 flex flex-col border-r border-slate-100/80 shadow-2xl lg:shadow-none h-full ${isSidebarOpen ? 'translate-x-0 w-[280px]' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full') + ' lg:translate-x-0 lg:w-0 w-[280px]'}`}>
        <div className="p-8 flex items-center justify-center lg:justify-start">
            <AD6Logo />
        </div>

        <nav className="flex-1 px-6 space-y-8 overflow-y-auto custom-scrollbar pb-10">
          {NAV_GROUPS.map((group) => {
              const visibleItems = group.items.filter(item => item.roles.includes(currentUser.role));
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={group.labelKey} className="space-y-3">
                    <p className="px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-start opacity-70">{t(group.labelKey)}</p>
                    <div className="space-y-1.5">
                        {visibleItems.map((item) => (
                            <button 
                                key={item.labelKey} 
                                onClick={() => { setCurrentView(item.view); if (window.innerWidth < 1024) setSidebarOpen(false); }} 
                                className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-full transition-all whitespace-nowrap group ${
                                    currentView === item.view 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            >
                                <item.icon size={20} className={`transition-transform duration-300 ${currentView === item.view ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 group-hover:scale-110'}`} />
                                <span className="font-bold text-sm tracking-tight">{t(item.labelKey)}</span>
                            </button>
                        ))}
                    </div>
                </div>
              );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
             <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all group">
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="font-bold text-sm">Logout</span>
             </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* META STYLE HEADER: Pill shaped search, minimal */}
        <header className="h-28 flex items-center justify-between px-10 shrink-0 z-40 bg-[#F8FAFC]">
          <div className="flex items-center gap-4 w-full max-w-xl">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Menu size={20} />
              </button>
              
              {/* Search Bar pill shape */}
              <div className="hidden md:flex items-center bg-white border border-slate-200/60 rounded-full px-6 py-3.5 shadow-sm w-full transition-shadow focus-within:shadow-md">
                  <Search size={20} className="text-slate-400 mr-3" />
                  <input type="text" placeholder="Search report, setting, or project..." className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 w-full placeholder:text-slate-400"/>
              </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
                <button onClick={toggleLanguage} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-all">
                    <Globe size={20} />
                </button>
                <div className="relative">
                    <NotificationCenter />
                </div>
            </div>
            
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-white pl-2 pr-6 py-2 rounded-full border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-inner group-hover:scale-105 transition-transform">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="text-start hidden md:block">
                    <p className="font-bold text-slate-700 text-xs leading-none group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
                    <p className="text-slate-400 font-bold text-[10px] mt-1 tracking-wide">{currentUser.role.replace(/_/g, ' ')}</p>
                </div>
                <ChevronDown size={14} className="text-slate-300 ml-2 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-10 pb-10 custom-scrollbar">
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
          </div>
        </main>
      </div>
      <ChatBot />
      {/* Demo Mode Role Switcher */}
      {isDemoMode && <RoleSwitcher />}
    </div>
  );
};

export default App;
