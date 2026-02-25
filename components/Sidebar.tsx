
import React, { useState } from 'react';
import { 
  LayoutDashboard, AlertOctagon, FileSignature, 
  ClipboardCheck, Activity, FileText, Users, Leaf, ShieldAlert, BookOpen,
  HeartPulse, Compass, ShieldCheck,
  ShieldPlus, Layout,
  Truck, HardHat, FlaskConical, GitPullRequest,
  Shield, Eye, Settings, ChevronRight, FileClock, Briefcase, Scale,
  GraduationCap, Anchor, Wrench, Layers, Smartphone, ChevronDown, Zap, HelpCircle, LogOut,
  BarChart3, Box, Wifi, GitMerge
} from 'lucide-react';
import { AD6Logo } from './AD6Logo';
import { UserRole, View } from '../types';
import { UserProfile } from '../types';

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

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'GENERAL',
    items: [
      { view: View.DASHBOARD, icon: LayoutDashboard, labelKey: 'Dashboard', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Project_Manager', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { 
        icon: Briefcase, 
        labelKey: 'Projects', 
        roles: ['ADMIN', 'Project_Manager', 'Regional_HSE_Director', 'Site_HSE_Manager'],
        children: [
          { labelKey: 'Projects List', view: View.PROJECTS, params: { initialView: 'List' } },
          { labelKey: 'Add New Project', view: View.PROJECTS, params: { initialView: 'Create' } }
        ]
      },
      { view: View.TASKS, icon: Layout, labelKey: 'Tasks', roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'] },
      { 
        icon: FileSignature, 
        labelKey: 'Permits', 
        roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'],
        children: [
          { labelKey: 'Registry', view: View.PERMITS, params: { initialView: 'List' } },
          { labelKey: 'New Application', view: View.PERMITS, params: { initialView: 'Create' } }
        ]
      },
      { view: View.INCIDENTS, icon: AlertOctagon, labelKey: 'Incidents', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'], badge: 3 },
      { view: View.TRANSPORT, icon: Truck, labelKey: 'Transport', roles: ['ADMIN', 'Transport_Manager', 'Site_HSE_Manager'] },
      { view: View.SECURITY, icon: Shield, labelKey: 'Security', roles: ['ADMIN', 'Security_Officer', 'Site_HSE_Manager'] },
    ]
  },
  {
    labelKey: 'INTELLIGENCE',
    items: [
      { view: View.PREDICTIVE_RISK, icon: Zap, labelKey: 'Predictive Risk', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager'] },
      { view: View.ESG, icon: BarChart3, labelKey: 'Net Zero (ESG)', roles: ['ADMIN', 'Board_Director', 'Head_Group_HSE', 'Environmental_Officer'] },
      { view: View.DIGITAL_TWIN, icon: Box, labelKey: 'Digital Twin', roles: ['ADMIN', 'Site_HSE_Manager', 'Head_Group_HSE'] },
      { view: View.CONNECTED_WORKER, icon: Wifi, labelKey: 'Connected Worker', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer'] },
      { view: View.COMPLY_FLOW, icon: Scale, labelKey: 'ComplyFlow UAE', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Project_Manager'], badge: 1 },
      { view: View.COMPLIANCE, icon: ShieldPlus, labelKey: 'Compliance Hub', roles: ['ADMIN', 'Board_Director', 'Head_Group_HSE'] },
      { view: View.AR_PROCEDURES, icon: Smartphone, labelKey: 'AR Workflow', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
    ]
  },
  {
    labelKey: 'TOOLS',
    items: [
      { 
        icon: ClipboardCheck, 
        labelKey: 'Inspections', 
        roles: ['ADMIN', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'],
        children: [
          { labelKey: 'Overview', view: View.INSPECTIONS, params: { initialTab: 'history' } },
          { labelKey: 'New Inspection', view: View.INSPECTIONS, params: { initialTab: 'new' } }
        ]
      },
      { view: View.RCA_TOOL, icon: GitMerge, labelKey: 'RCA Engine', roles: ['ADMIN', 'HSE_Officer', 'Site_HSE_Manager'] },
      { view: View.OBSERVATIONS, icon: Eye, labelKey: 'Observations', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.EXCAVATION, icon: Layers, labelKey: 'Excavation', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.RAMS, icon: FileText, labelKey: 'RAMS', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'] },
      { view: View.CONTRACTORS, icon: Users, labelKey: 'Contractors', roles: ['ADMIN', 'Site_HSE_Manager', 'Project_Manager'] },
      { view: View.MOC, icon: GitPullRequest, labelKey: 'MOC', roles: ['ADMIN', 'Site_HSE_Manager', 'Project_Manager'] },
      { view: View.PPE, icon: HardHat, labelKey: 'PPE', roles: ['ADMIN', 'Store_Keeper', 'HSE_Officer'] },
      { view: View.CHEMICALS, icon: FlaskConical, labelKey: 'HazMat', roles: ['ADMIN', 'Environmental_Officer', 'HSE_Officer'] },
      { view: View.LIFTING, icon: Anchor, labelKey: 'Lifting', roles: ['ADMIN', 'Site_Supervisor', 'HSE_Officer'] },
      { view: View.TOOLBOX, icon: BookOpen, labelKey: 'Toolbox Talks', roles: ['ADMIN', 'Site_Supervisor', 'HSE_Officer'] },
      { view: View.ENVIRONMENTAL, icon: Leaf, labelKey: 'Environmental', roles: ['ADMIN', 'Environmental_Officer'] },
      { view: View.EMERGENCY, icon: ShieldAlert, labelKey: 'Emergency', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer'] },
      { view: View.HEALTH, icon: HeartPulse, labelKey: 'Health', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer'] },
      { view: View.TRAINING, icon: GraduationCap, labelKey: 'Training', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.AUDITS, icon: ShieldCheck, labelKey: 'Audits', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Internal_Auditor'] },
      { view: View.MAINTENANCE, icon: Wrench, labelKey: 'Maintenance', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Site_Supervisor'] },
    ]
  },
  {
    labelKey: 'SYSTEM',
    items: [
      { view: View.INTEGRATIONS, icon: Layers, labelKey: 'Integrations', roles: ['ADMIN'] },
      { view: View.GOVERNANCE, icon: Settings, labelKey: 'Governance', roles: ['ADMIN'] },
      { view: View.SYSTEM_LOGS, icon: FileClock, labelKey: 'Audit Logs', roles: ['ADMIN', 'Board_Director', 'Internal_Auditor', 'Legal_Team'] },
      { view: View.DMS, icon: HelpCircle, labelKey: 'Help & Docs', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Project_Manager', 'Internal_Auditor', 'Legal_Team'] },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  currentUser: UserProfile;
  currentView: View;
  viewParams: any;
  onNavigate: (view: View, params?: any) => void;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentUser, currentView, viewParams, onNavigate, logout }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Permits', 'Inspections', 'Projects']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none`}>
        <div className="h-20 flex items-center px-8 border-b border-neutral-100 shrink-0">
            <AD6Logo className="scale-110" />
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.labelKey} className="animate-fade-in">
              <h3 className="px-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">{group.labelKey}</h3>
              <div className="space-y-1">
                {group.items.filter(item => item.roles.includes(currentUser.role)).map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems.includes(item.labelKey);
                  const isParentActive = (item.view && currentView === item.view) || (hasChildren && item.children!.some(c => c.view === currentView));

                  return (
                    <div key={item.labelKey}>
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            toggleExpand(item.labelKey);
                          } else if (item.view) {
                            onNavigate(item.view);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                          isParentActive
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <item.icon size={18} className={`transition-colors duration-200 ${isParentActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} strokeWidth={2.5} />
                          <span>{item.labelKey}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${isParentActive ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'}`}>{item.badge}</span>
                          )}
                          {hasChildren && (
                            isExpanded 
                              ? <ChevronDown size={14} className={`${isParentActive ? 'text-white/70' : 'text-neutral-400'} transition-transform duration-200 rotate-180`}/> 
                              : <ChevronRight size={14} className={`${isParentActive ? 'text-white/70' : 'text-neutral-400'} transition-transform duration-200`}/>
                          )}
                        </div>
                      </button>

                      {hasChildren && isExpanded && (
                        <div className="ml-4 pl-4 border-l-2 border-neutral-100 space-y-1 mt-2 animate-slide-up origin-top">
                          {item.children!.map((child) => (
                            <button
                              key={child.labelKey}
                              onClick={() => onNavigate(child.view, child.params)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus:bg-neutral-50 ${
                                currentView === child.view && JSON.stringify(viewParams) === JSON.stringify(child.params || {})
                                  ? 'text-brand-600 bg-brand-50' 
                                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                              }`}
                            >
                              <span>{child.labelKey}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-100">
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-3xl p-4 border border-brand-100 mb-4 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                 <ShieldCheck size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-brand-900 text-xs">AD6 Contractors</h4>
                 <p className="text-[10px] text-brand-500 font-bold uppercase tracking-wide">Enterprise License</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 px-1 group cursor-default">
             <div className="w-10 h-10 rounded-xl bg-neutral-200 overflow-hidden ring-2 ring-transparent group-hover:ring-brand-200 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="avatar" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-neutral-800 truncate">{currentUser.name}</p>
               <p className="text-[10px] text-neutral-500 truncate font-medium">{currentUser.role.replace(/_/g, ' ')}</p>
             </div>
             <button onClick={logout} className="text-neutral-400 hover:text-status-fail p-2 hover:bg-red-50 rounded-xl transition-all" title="Sign Out">
               <LogOut size={18} />
             </button>
          </div>
        </div>
    </aside>
  );
};

export default Sidebar;
