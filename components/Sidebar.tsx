import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckSquare, Eye, BookOpen, FileText,
  Compass, LayoutDashboard, Activity, Thermometer, Box, Wifi,
  FileSignature, Lock, Flame, Anchor, Layers, ClipboardCheck,
  ShieldAlert, GitPullRequest, Scale, GitMerge, Globe, Leaf, Shield,
  AlertOctagon, ShieldCheck, Smartphone, GraduationCap,
  Briefcase, HeartPulse, HardHat, Truck,
  Building2, Landmark, FolderTree, FileClock, ChevronDown, ChevronRight,
  Search, X, Zap, Users, User, ArrowRight, TrendingUp, BarChart3, Settings, MapPin,
  Wrench, AlertTriangle, ShieldX
} from 'lucide-react';
import { UserRole, View, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTenant } from '../contexts/TenantContext';
import { useUser } from '../contexts/UserContext';
import { UserProfileModal } from './UserProfileModal';
import { 
  buildAuthorizedNavigation, 
  MASTER_NAVIGATION_ITEMS, 
  NavSection, 
  CentralNavItem,
  isUserSuspended 
} from '../services/permissionService';

// Re-export for backward-compatibility if needed
export type NavItem = CentralNavItem;
export { MASTER_NAVIGATION_ITEMS as ENTERPRISE_NAV_SECTIONS };

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser?: UserProfile | null;
  currentView: View;
  viewParams?: any;
  onNavigate: (view: View, params?: any) => void;
  logout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentUser: propUser,
  currentView,
  onNavigate
}) => {
  const { t, dir } = useLanguage();
  const { currentTenant, currentSite } = useTenant();
  const { currentUser: contextUser, isLoadingAuth } = useUser();
  const activeUser = contextUser || propUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Dynamically resolve contextual navigation based on activeUser verified permissions
  const { sections, personaBadge, isSuspended } = useMemo(() => {
    return buildAuthorizedNavigation(activeUser);
  }, [activeUser]);

  // Auto-expand any submenu containing the active view
  useEffect(() => {
    if (!currentView || sections.length === 0) return;
    for (const section of sections) {
      for (const item of section.items) {
        if (item.children && item.children.some(c => c.view === currentView)) {
          setExpandedSubmenus(prev => (prev.includes(item.id) ? prev : [...prev, item.id]));
        }
      }
    }
  }, [currentView, sections]);

  // Dynamically derive user designation & assigned operational sites from UserContext
  const userDesignation = useMemo(() => {
    return (
      activeUser?.jobTitle ||
      (activeUser?.role ? activeUser.role.replace(/_/g, ' ') : '') ||
      activeUser?.department ||
      'HSE Operational Personnel'
    );
  }, [activeUser?.jobTitle, activeUser?.role, activeUser?.department]);

  const assignedSites = useMemo(() => {
    if (activeUser?.assignedSites && activeUser.assignedSites.length > 0) {
      return activeUser.assignedSites;
    }
    if (activeUser?.siteLocation) {
      return [activeUser.siteLocation];
    }
    return [currentSite?.name ? currentSite.name.split(' - ')[0] : 'All Concessions'];
  }, [activeUser?.assignedSites, activeUser?.siteLocation, currentSite?.name]);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const toggleSubmenu = (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedSubmenus(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleItemClick = (item: CentralNavItem) => {
    if (item.children && item.children.length > 0) {
      onNavigate(item.view, item.params);
      setExpandedSubmenus(prev => (prev.includes(item.id) ? prev : [...prev, item.id]));
    } else {
      onNavigate(item.view, item.params);
    }
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const handleChildClick = (child: CentralNavItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onNavigate(child.view, child.params);
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Structural Spacer for Desktop layout */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-20'
        }`} 
      />

      {/* Main Sidebar Shell with Enterprise Industrial Canvas */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-[30] flex flex-col bg-white/95 backdrop-blur-xl border-e border-slate-200/90 text-slate-800 transition-all duration-300 ease-in-out select-none shadow-xl shadow-slate-900/5 ${
          isOpen 
            ? 'translate-x-0 w-72' 
            : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand / Application Identity Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 bg-white/75 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Zap className="text-white fill-white w-4 h-4" />
            </div>

            {isOpen && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-black text-base text-slate-900 tracking-tight leading-none uppercase">
                  AD6<span className="text-blue-600">.Ai</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                  Enterprise HSE Platform
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Active RBAC Persona Indicator Pill */}
        {isOpen && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            {isLoadingAuth && !activeUser ? (
              <div className="w-full p-2.5 rounded-xl bg-slate-100 animate-pulse h-12" />
            ) : isSuspended ? (
              <div className="w-full p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-start">
                <ShieldX size={18} className="text-red-600 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black text-red-600 tracking-wider leading-none">Security Alert</p>
                  <p className="text-xs font-black text-red-900 truncate leading-tight mt-0.5">Account Suspended</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Click to view full user profile & activity records"
                className="w-full p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/70 flex items-center justify-between text-start transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">RBAC Persona</p>
                    <p className="text-xs font-black text-blue-900 group-hover:text-blue-700 truncate leading-tight mt-0.5">{personaBadge}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-blue-700 border border-blue-200 shrink-0 shadow-xs">
                  Profile ↗
                </span>
              </button>
            )}
          </div>
        )}

        {/* Quick Search Menu Filter (Only searches permitted items and submenus) */}
        {isOpen && !isSuspended && sections.length > 0 && (
          <div className="px-3 py-1.5 shrink-0">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('Filter permitted navigation...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 border border-slate-200 rounded-xl ps-8 pe-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
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
          </div>
        )}

        {/* Core Navigation Items List */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2.5 space-y-4 custom-scrollbar">
          {/* Skeleton state during auth loading */}
          {isLoadingAuth && !activeUser && (
            <div className="p-2 space-y-3 animate-pulse">
              <div className="h-4 w-24 bg-slate-200/80 rounded" />
              <div className="h-9 bg-slate-200/60 rounded-xl" />
              <div className="h-9 bg-slate-200/60 rounded-xl" />
              <div className="h-4 w-28 bg-slate-200/80 rounded pt-2" />
              <div className="h-9 bg-slate-200/60 rounded-xl" />
              <div className="h-9 bg-slate-200/60 rounded-xl" />
            </div>
          )}

          {/* Suspended Account State */}
          {!isLoadingAuth && isSuspended && (
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-center space-y-2">
              <AlertTriangle className="mx-auto text-red-600" size={24} />
              <h4 className="text-xs font-bold text-red-900">Access Restricted</h4>
              <p className="text-[11px] text-red-700 leading-snug">
                Your account privileges have been suspended. All operational and administrative navigation is disabled.
              </p>
            </div>
          )}

          {/* Empty Authorized State (If user has no assigned permissions) */}
          {!isLoadingAuth && !isSuspended && sections.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
              <ShieldAlert className="mx-auto text-amber-600" size={24} />
              <h4 className="text-xs font-bold text-amber-900">No Authorized Modules</h4>
              <p className="text-[11px] text-amber-700 leading-snug">
                No active permissions assigned to this user profile. Please contact an enterprise administrator.
              </p>
            </div>
          )}

          {/* Dynamic Authorized Sections */}
          {!isSuspended && sections.map((section) => {
            const q = searchQuery.toLowerCase().trim();

            const visibleItems = section.items.reduce<CentralNavItem[]>((acc, item) => {
              if (!q) {
                acc.push(item);
                return acc;
              }

              const label = t(item.labelKey).toLowerCase();
              const sub = item.subtitle ? item.subtitle.toLowerCase() : '';
              const parentMatches = label.includes(q) || sub.includes(q);

              const matchingChildren = item.children
                ? item.children.filter(child => {
                    const cLabel = t(child.labelKey).toLowerCase();
                    const cSub = child.subtitle ? child.subtitle.toLowerCase() : '';
                    return cLabel.includes(q) || cSub.includes(q);
                  })
                : undefined;

              if (parentMatches) {
                acc.push(item);
              } else if (matchingChildren && matchingChildren.length > 0) {
                acc.push({
                  ...item,
                  children: matchingChildren
                });
              }

              return acc;
            }, []);

            // Enforce Rule: Hide parent menu groups when none of their child items are accessible
            if (visibleItems.length === 0) return null;

            const isSectionCollapsed = collapsedSections.includes(section.id) && !searchQuery;

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                {isOpen ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-2.5 py-1 text-start hover:bg-slate-100/70 rounded-lg group transition-colors"
                    title={section.subtitle}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-800">
                        {t(section.labelKey)}
                      </span>
                      <ChevronDown 
                        size={12} 
                        className={`text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
                          isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                        }`} 
                      />
                    </div>
                    {section.subtitle && (
                      <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                        {section.subtitle}
                      </p>
                    )}
                  </button>
                ) : (
                  <div className="w-6 h-px bg-slate-200 mx-auto my-2" />
                )}

                {/* Section Items */}
                {!isSectionCollapsed && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item, itemIdx) => {
                      const Icon = item.icon;
                      const hasChildren = !!(item.children && item.children.length > 0);
                      const isSubmenuExpanded = expandedSubmenus.includes(item.id) || !!searchQuery;
                      const isChildActive = hasChildren && item.children!.some(c => c.view === currentView);
                      const isParentActive = currentView === item.view;
                      const itemKey = `${section.id}-${item.id || item.view}-${item.labelKey}-${itemIdx}`;

                      return (
                        <div key={itemKey} className="relative group/navitem">
                          {/* Parent Button */}
                          <div
                            className={`w-full flex items-center justify-between rounded-xl transition-all duration-150 text-xs font-semibold outline-none ${
                              isOpen ? 'px-2.5 py-2' : 'h-11 justify-center'
                            } ${
                              isParentActive
                                ? 'bg-blue-50 text-blue-700 font-bold border-s-4 border-blue-600 shadow-sm shadow-blue-500/10'
                                : isChildActive
                                ? 'bg-blue-50/50 text-blue-800 font-bold border-s-4 border-blue-400'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 border-s-4 border-transparent'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleItemClick(item)}
                              className="flex items-center gap-3 flex-1 min-w-0 text-start cursor-pointer focus:outline-none"
                              title={!isOpen ? t(item.labelKey) : undefined}
                            >
                              <Icon 
                                size={18} 
                                className={`shrink-0 transition-colors ${
                                  isParentActive || isChildActive ? 'text-blue-600' : 'text-slate-400 group-hover/navitem:text-blue-600'
                                }`} 
                              />

                              {isOpen && (
                                <div className="flex-1 flex items-center justify-between min-w-0 pe-1">
                                  <span className="truncate">{t(item.labelKey)}</span>
                                  {item.badge && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ${getBadgeStyle(item.badgeColor)}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>

                            {/* Submenu Expand / Collapse Chevron Button */}
                            {isOpen && hasChildren && (
                              <button
                                type="button"
                                onClick={(e) => toggleSubmenu(item.id, e)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors shrink-0"
                                aria-label={isSubmenuExpanded ? `Collapse ${t(item.labelKey)} submenu` : `Expand ${t(item.labelKey)} submenu`}
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-200 ${isSubmenuExpanded ? 'rotate-0' : '-rotate-90'}`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Render Submenu in Expanded Sidebar */}
                          {isOpen && hasChildren && isSubmenuExpanded && (
                            <div className="ms-4 ps-2.5 my-1 space-y-0.5 border-s-2 border-slate-200">
                              {item.children!.map((child) => {
                                const isSubActive = currentView === child.view;
                                return (
                                  <button
                                    key={child.id}
                                    type="button"
                                    onClick={(e) => handleChildClick(child, e)}
                                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-start transition-all outline-none ${
                                      isSubActive
                                        ? 'bg-blue-100/70 text-blue-800 font-bold border-s-2 border-blue-600 shadow-xs'
                                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/70 border-s-2 border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isSubActive ? 'bg-blue-600' : 'bg-slate-300'
                                        }`}
                                      />
                                      <span className="truncate">{t(child.labelKey)}</span>
                                    </div>
                                    {child.badge && (
                                      <span
                                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 ${getBadgeStyle(
                                          child.badgeColor
                                        )}`}
                                      >
                                        {child.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Hover Tooltip or Flyout in Collapsed Mode */}
                          {!isOpen && (
                            <>
                              {!hasChildren ? (
                                <div className={`hidden lg:group-hover/navitem:flex fixed z-50 items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-bold whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                                  dir === 'rtl' ? 'right-20 mr-2' : 'left-20 ml-2'
                                }`}>
                                  <span>{t(item.labelKey)}</span>
                                  {item.badge && (
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${getBadgeStyle(item.badgeColor)}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className={`hidden lg:group-hover/navitem:block fixed z-50 py-2 px-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-56 animate-in fade-in zoom-in-95 duration-150 ${
                                  dir === 'rtl' ? 'right-20 mr-2' : 'left-20 ml-2'
                                }`}>
                                  <div className="px-3 py-1 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 truncate">{t(item.labelKey)}</span>
                                    {item.badge && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${getBadgeStyle(item.badgeColor)}`}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                                    <button
                                      type="button"
                                      onClick={() => handleItemClick(item)}
                                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-start rounded-xl font-medium transition-colors ${
                                        isParentActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Icon size={14} className={isParentActive ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0'} />
                                      <span className="truncate">{t('Overview')}</span>
                                    </button>
                                    {item.children!.map((child) => {
                                      const isSubActive = currentView === child.view;
                                      return (
                                        <button
                                          key={child.id}
                                          type="button"
                                          onClick={(e) => handleChildClick(child, e)}
                                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-start rounded-xl font-medium transition-colors ${
                                            isSubActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                          <span className="truncate">{t(child.labelKey)}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Operational Context Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-white/70 shrink-0">
          {isOpen ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs hover:border-blue-300 transition-all group">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full flex items-start gap-2.5 text-start cursor-pointer focus:outline-none"
                title={`Click to view ${activeUser?.name || 'User'}'s full profile, designations, assigned sites and records`}
              >
                {/* User Profile Avatar with Online Status Indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser?.name || 'User')}`}
                      alt={activeUser?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-600/20 ${
                      isSuspended ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    title={isSuspended ? 'Account Suspended' : 'Active Authenticated Session'}
                  />
                </div>

                {/* User Details Rendered Directly Alongside the Avatar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {activeUser?.name || 'Authorized Operator'}
                    </p>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${
                      isSuspended ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isSuspended ? 'Suspended' : 'Profile'}
                    </span>
                  </div>

                  {/* Job Designation */}
                  <p className="text-[10px] text-blue-700 font-semibold truncate leading-tight mt-0.5">
                    {userDesignation}
                  </p>

                  {/* Assigned Operational Sites */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                      <span>Sites:</span>
                    </div>
                    {assignedSites.map((siteName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[9px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 px-1.5 py-0.5 rounded-md truncate max-w-[130px]"
                        title={`Assigned Operational Site: ${siteName}`}
                      >
                        {siteName}
                      </span>
                    ))}
                  </div>
                </div>
              </button>

              {/* Connected Facility & Tenant Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSuspended ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span className="font-semibold text-slate-700 truncate">{currentTenant.shortName}</span>
                </div>
                <span className="font-mono text-blue-700 font-bold shrink-0 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {currentSite.code}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="relative w-9 h-9 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                title={`${activeUser?.name || 'User'} · ${userDesignation} · Assigned Sites: ${assignedSites.join(', ')}`}
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser?.name || 'User')}`}
                  alt={activeUser?.name || 'User'}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                  isSuspended ? 'bg-red-500' : 'bg-emerald-500'
                }`} />
              </button>
              <div 
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600"
                title={`${currentTenant.shortName} - ${currentSite.name}`}
              >
                <span className={`w-2 h-2 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Enterprise User Profile Modal */}
      {isProfileModalOpen && activeUser && (
        <UserProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={activeUser}
        />
      )}
    </>
  );
};

export default Sidebar;
