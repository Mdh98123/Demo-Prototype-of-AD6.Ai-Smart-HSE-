import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, MapPin, Search, Globe, ChevronDown, Command, 
  Menu, X, Bell, Shield, AlertTriangle, Thermometer, Radio, 
  Check, Flame, User, LogOut, Settings, HelpCircle, ExternalLink, Activity, Sparkles
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useRegionalCompliance } from '../contexts/RegionalComplianceContext';
import NotificationCenter from './NotificationCenter';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { UserProfileModal } from './UserProfileModal';
import { JurisdictionSelectorDropdown } from './regulatory/JurisdictionSelectorDropdown';

interface EnterpriseGlobalHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenAiCopilot?: () => void;
  currentViewName: string;
}

export const EnterpriseGlobalHeader: React.FC<EnterpriseGlobalHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenAiCopilot,
  currentViewName
}) => {
  const { currentTenant, currentSite, allTenants, availableSites, switchTenant, switchSite } = useTenant();
  const { language, setLanguage, t, dir } = useLanguage();
  const { currentUser, logout, switchUser, users } = useUser();
  const { regionalMode, isUaeMode, isOmanMode, isCombinedMode, activeProfile, openChangeModal } = useRegionalCompliance();

  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const [isJurisdictionMenuOpen, setIsJurisdictionMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const tenantRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setIsTenantMenuOpen(false);
      }
      if (siteRef.current && !siteRef.current.contains(e.target as Node)) {
        setIsSiteMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);



  // Current View Breadcrumb / Spatial Context
  const currentViewDetails = (() => {
    const raw = (currentViewName || '').toLowerCase().replace(/_/g, '-');
    switch (raw) {
      case 'dashboard':
      case 'hse-operations':
        return { section: 'Operations', title: 'Command Center', badge: 'Live Ops' };
      case 'executive-dashboard':
      case 'executive-command-center':
      case 'analytics-reporting':
        return { section: 'Strategic', title: 'Executive Safety & BI', badge: 'Board Level' };
      case 'permit-to-work':
      case 'permits':
        return { section: 'Control of Work', title: 'Permit Approvals (PTW)', badge: 'SSOW' };
      case 'incident-management':
      case 'incidents':
        return { section: 'Assurance', title: 'Incident Triage & RCA', badge: 'Statutory' };
      case 'safety-audit':
      case 'audits':
        return { section: 'Assurance', title: 'Safety Audits & Assurance', badge: 'ISO 45001' };
      case 'hazards':
        return { section: 'Risk & Governance', title: 'Hazard & Risk Register', badge: '5x5 Matrix' };
      case 'visual-inspection':
      case 'inspections':
        return { section: 'Field Checks', title: 'Safety Inspections', badge: 'Walkthrough' };
      case 'pwa-inspections':
        return { section: 'Mobile Field', title: 'Mobile PWA Inspection', badge: 'Offline Sync' };
      case 'workforce-safety':
      case 'tasks':
        return { section: 'Frontline', title: 'My Work Cockpit', badge: 'Daily Shift' };
      case 'training-competency':
        return { section: 'Workforce', title: 'Training & Competency', badge: 'OPITO' };
      case 'compliance-intelligence':
      case 'comply-flow':
        return { section: 'Regulatory', title: 'Comply-Flow Regulations', badge: 'MD 286 / PDO' };
      case 'predictive-safety':
        return { section: 'AI Analytics', title: 'Predictive Safety (SIF)', badge: 'Leading KPI' };
      case 'projects':
        return { section: 'Enterprise Admin', title: 'Tenant Settings & Concessions', badge: 'Multi-Site' };
      case 'iam':
        return { section: 'Enterprise Admin', title: 'Access Control & RBAC Matrix', badge: 'Governance' };
      default:
        return { 
          section: 'HSE Platform', 
          title: raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Active Module', 
          badge: 'Verified' 
        };
    }
  })();

  return (
    <header className="sticky top-0 z-[20] h-16 w-full shrink-0 bg-white/85 backdrop-blur-md backdrop-saturate-150 border-b border-slate-200/80 text-slate-800 shadow-xs select-none">
      <div className="h-full px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left Section: Mobile/Desktop Toggle, Tenant Switcher, Site Selector, and Active View Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all active:scale-95 shadow-xs shrink-0"
          >
            <Menu size={18} />
          </button>

          {/* 1. Tenant Organization Switcher */}
          <div className="relative shrink-0" ref={tenantRef}>
            <button
              onClick={() => {
                setIsTenantMenuOpen(!isTenantMenuOpen);
                setIsSiteMenuOpen(false);
                setIsJurisdictionMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-start transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Switch Tenant Organization"
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs"
                style={{ backgroundColor: currentTenant.brandColor }}
              >
                <Building2 size={14} />
              </div>
              <div className="hidden md:block text-start leading-tight min-w-0 max-w-[120px] lg:max-w-[150px] truncate">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
                  {currentTenant.country} • Org
                </p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentTenant.shortName}
                </p>
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isTenantMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tenant Dropdown Menu */}
            {isTenantMenuOpen && (
              <div className="absolute start-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Enterprise Tenant Selection
                  </p>
                  <p className="text-xs text-slate-700 font-medium">
                    Switch operational tenancy & compliance boundaries
                  </p>
                </div>
                <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                  {allTenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        switchTenant(tenant.id);
                        setIsTenantMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-colors ${
                        currentTenant.id === tenant.id 
                          ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm"
                          style={{ backgroundColor: tenant.brandColor }}
                        >
                          OM
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{tenant.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{tenant.sector}</p>
                        </div>
                      </div>
                      {currentTenant.id === tenant.id && (
                        <Check size={16} className="text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Active Site Selector */}
          <div className="relative" ref={siteRef}>
            <button
              onClick={() => {
                setIsSiteMenuOpen(!isSiteMenuOpen);
                setIsTenantMenuOpen(false);
                setIsJurisdictionMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-start transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Select Active Operational Site"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <MapPin size={14} />
              </div>
              <div className="hidden md:block text-start leading-tight min-w-0 max-w-[150px] lg:max-w-[190px] truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {currentSite.country}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-blue-700 font-bold">
                    {currentSite.code}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentSite.name.split(' - ')[0]}
                </p>
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isSiteMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Site Dropdown Menu */}
            {isSiteMenuOpen && (
              <div className="absolute start-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Concession / Operating Site
                    </p>
                    <p className="text-xs text-slate-700 font-medium">
                      GCC Multi-Site Isolation Active
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    3 Active Assets
                  </span>
                </div>

                <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                  {availableSites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => {
                        switchSite(site.id);
                        setIsSiteMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-colors ${
                        currentSite.id === site.id 
                          ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{site.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{site.location}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {site.code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {site.country} Concession
                          </span>
                        </div>
                      </div>
                      {currentSite.id === site.id && (
                        <Check size={16} className="text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Dedicated Statutory Country / Regional Jurisdiction Scope Selector */}
          <JurisdictionSelectorDropdown
            isOpen={isJurisdictionMenuOpen}
            onToggle={() => {
              setIsJurisdictionMenuOpen(!isJurisdictionMenuOpen);
              setIsTenantMenuOpen(false);
              setIsSiteMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            onClose={() => setIsJurisdictionMenuOpen(false)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />

          {/* Active View / Module Breadcrumb Indicator */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs min-w-0 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
              {currentViewDetails.section}
            </span>
            <span className="text-slate-300 font-bold">/</span>
            <span className="font-bold text-slate-800 truncate max-w-[140px] xl:max-w-[200px]">
              {currentViewDetails.title}
            </span>
            <span className="hidden 2xl:inline-block ms-1 px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
              {currentViewDetails.badge}
            </span>
          </div>

        </div>

        {/* Right Section: Bilingual Switcher, AI Copilot, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Search Button for Viewports without full search bar */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Quick search"
            className="xl:hidden p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all active:scale-95 shadow-xs"
            title="Search (⌘K)"
          >
            <Search size={16} />
          </button>

          {/* Bilingual Language Switcher (EN / AR) */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
            title="Switch Language / تبديل اللغة"
          >
            <Globe size={14} className="text-blue-600" />
            <span className="font-dubai text-xs font-bold">{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* AI Safety Copilot Trigger */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-blue-500/20"
            title="Grounded AI Safety Copilot (Human Oversight)"
          >
            <Sparkles size={14} className="text-white animate-pulse" />
            <span className="hidden md:inline font-bold">AI Copilot</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Notifications Center */}
          <div className="relative">
            <NotificationCenter />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-0.5"></div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsTenantMenuOpen(false);
                setIsSiteMenuOpen(false);
                setIsJurisdictionMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm ring-1 ring-slate-200/60">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'HSE User'}`}
                    alt={currentUser?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="hidden sm:block text-start leading-tight max-w-[130px] truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Authorized User'}</p>
                <p className="text-[10px] font-semibold text-blue-700 truncate">
                  {currentUser?.jobTitle || currentUser?.role?.replace(/_/g, ' ') || 'HSE Specialist'}
                </p>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute end-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Authenticated Enterprise Identity</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5">{currentUser?.jobTitle || currentUser?.role?.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser?.department || currentTenant.name}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
                    <Shield size={11} /> {currentUser?.role?.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  <div className="px-3 py-2 text-[10px] text-slate-500 border-b border-slate-100">
                    <span>Active Tenant: </span>
                    <strong className="text-slate-900">{currentTenant.name}</strong>
                    <div className="mt-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Assigned Sites:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {((currentUser?.assignedSites && currentUser.assignedSites.length > 0)
                          ? currentUser.assignedSites
                          : [currentSite.name]
                        ).map((st, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-colors text-start font-bold"
                  >
                    <User size={14} className="text-blue-600" />
                    <span>View Enterprise Profile & Records</span>
                  </button>

                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-start"
                  >
                    <Search size={14} className="text-slate-400" />
                    <span>Search Workspace</span>
                    <kbd className="ms-auto text-[10px] font-mono text-slate-400">⌘K</kbd>
                  </button>

                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-start font-semibold"
                  >
                    <LogOut size={14} />
                    <span>Sign Out Enterprise Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Enterprise User Profile Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      )}
    </header>
  );
};

export default EnterpriseGlobalHeader;
