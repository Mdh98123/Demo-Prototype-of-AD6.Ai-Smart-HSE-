import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Scale, Bell, AlertTriangle, CheckCircle2, Clock, 
  ExternalLink, Search, RefreshCw, Filter, ShieldCheck, 
  Radio, Calendar, Building2, Tag, BookOpen, ChevronRight,
  Sparkles, Check, ArrowUpRight, Plus, X, Layers,
  AlertOctagon, Info, FileText
} from 'lucide-react';
import { View, RegulatoryAnnouncementItem, RegulatoryBadgeType } from '../../types';
import { RegulatoryIntelligenceService, RegulatoryObligation } from '../../services/regulatoryIntelligenceService';
import { useUser } from '../../contexts/UserContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface RegulatoryUpdatesDashboardProps {
  onNavigate?: (view: View, params?: any) => void;
}

export const RegulatoryUpdatesDashboard: React.FC<RegulatoryUpdatesDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useUser();
  const { t } = useLanguage();

  // Primary data state
  const [updates, setUpdates] = useState<RegulatoryAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<'ALL' | RegulatoryBadgeType | 'REGISTERED'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');

  // Modal State for Add to Legal Register
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedUpdateForRegister, setSelectedUpdateForRegister] = useState<RegulatoryAnnouncementItem | null>(null);
  const [modalFormSite, setModalFormSite] = useState<string>('Mina Al Fahal Refinery & Terminal');
  const [modalFormRole, setModalFormRole] = useState<string>('Site HSE Manager');
  const [modalFormCategory, setModalFormCategory] = useState<'Workforce Safety' | 'Plant & Machinery' | 'Environmental ESG' | 'Reporting & Audit'>('Workforce Safety');
  const [modalFormDueDate, setModalFormDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [modalFormComplianceStatus, setModalFormComplianceStatus] = useState<'Fully Compliant' | 'Partially Compliant' | 'At Risk / Non-Compliant'>('Partially Compliant');
  const [isSubmittingRegister, setIsSubmittingRegister] = useState<boolean>(false);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; obligationId?: string } | null>(null);

  // Local obligations cache to mark items in register
  const [registeredObligationsMap, setRegisteredObligationsMap] = useState<Record<string, RegulatoryObligation>>({});

  // Sync registered obligations map from local storage
  const syncRegisteredMap = useCallback(() => {
    const currentObligations = RegulatoryIntelligenceService.getRegulatoryObligations();
    const mapping: Record<string, RegulatoryObligation> = {};
    for (const obl of currentObligations) {
      mapping[obl.regulationId] = obl;
    }
    setRegisteredObligationsMap(mapping);
  }, []);

  // Fetch from the server-side API route: /api/regulatory/latest
  const loadRegulatoryFeed = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await RegulatoryIntelligenceService.fetchLatestRegulatoryAnnouncements(refresh);
      if (data && data.updates) {
        setUpdates(data.updates);
        setLastChecked(data.lastChecked || new Date().toISOString());
      }
    } catch (err: any) {
      console.error('[REGULATORY DASHBOARD] Error loading feed:', err);
      setErrorMessage(err.message || 'Unable to communicate with /api/regulatory/latest. Displaying cached intelligence.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    syncRegisteredMap();
    loadRegulatoryFeed(false);

    // Listen to custom event for legal register mutations across tabs/modules
    const handleObligationsUpdate = () => {
      syncRegisteredMap();
    };

    window.addEventListener('ad6-reg-obligations-updated', handleObligationsUpdate);
    return () => {
      window.removeEventListener('ad6-reg-obligations-updated', handleObligationsUpdate);
    };
  }, [loadRegulatoryFeed, syncRegisteredMap]);

  // Extract all unique topic chips
  const allTopicChips = useMemo(() => {
    const chipSet = new Set<string>();
    updates.forEach(u => {
      if (u.topicChips && Array.isArray(u.topicChips)) {
        u.topicChips.forEach(chip => chipSet.add(chip));
      }
    });
    return Array.from(chipSet).sort();
  }, [updates]);

  // Extract unique authorities
  const allAuthorities = useMemo(() => {
    const authSet = new Set<string>();
    updates.forEach(u => {
      if (u.authority) authSet.add(u.authority);
    });
    return Array.from(authSet).sort();
  }, [updates]);

  // Filtered list
  const filteredUpdates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return updates.filter(item => {
      const isRegistered = !!registeredObligationsMap[item.id];

      // Badge filter
      if (selectedBadgeFilter === 'OFFICIAL' && item.badgeType !== 'OFFICIAL') return false;
      if (selectedBadgeFilter === 'REPORTED' && item.badgeType !== 'REPORTED') return false;
      if (selectedBadgeFilter === 'REGISTERED' && !isRegistered) return false;

      // Topic filter
      if (selectedTopic !== 'ALL' && (!item.topicChips || !item.topicChips.includes(selectedTopic))) {
        return false;
      }

      // Authority filter
      if (selectedAuthority !== 'ALL' && item.authority !== selectedAuthority) {
        return false;
      }

      // Search query filter
      if (q) {
        const titleMatch = item.title.toLowerCase().includes(q);
        const titleArMatch = item.titleAr ? item.titleAr.includes(q) : false;
        const summaryMatch = item.summary.toLowerCase().includes(q);
        const authMatch = item.authority.toLowerCase().includes(q);
        const chipsMatch = item.topicChips?.some(chip => chip.toLowerCase().includes(q));
        const obligationsMatch = item.keyObligations?.some(ob => ob.toLowerCase().includes(q));

        if (!titleMatch && !titleArMatch && !summaryMatch && !authMatch && !chipsMatch && !obligationsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [updates, searchQuery, selectedBadgeFilter, selectedTopic, selectedAuthority, registeredObligationsMap]);

  // Open modal to configure and add update to legal register
  const handleOpenAddModal = (update: RegulatoryAnnouncementItem) => {
    setSelectedUpdateForRegister(update);
    // Preset appropriate category based on update
    if (update.topicChips?.some(c => c.toLowerCase().includes('heat') || c.toLowerCase().includes('environment') || c.toLowerCase().includes('waste'))) {
      setModalFormCategory('Environmental ESG');
    } else if (update.topicChips?.some(c => c.toLowerCase().includes('scaffold') || c.toLowerCase().includes('fire') || c.toLowerCase().includes('loto'))) {
      setModalFormCategory('Plant & Machinery');
    } else {
      setModalFormCategory('Workforce Safety');
    }
    setIsAddModalOpen(true);
  };

  // Confirm and persist to Legal Register
  const handleConfirmAddToLegalRegister = async () => {
    if (!selectedUpdateForRegister) return;

    setIsSubmittingRegister(true);
    try {
      // 1. Client-side persistence and dual-key sync via service
      const newObligation = RegulatoryIntelligenceService.addObligationToLegalRegister({
        regulationId: selectedUpdateForRegister.id,
        regulationTitle: selectedUpdateForRegister.title,
        authority: selectedUpdateForRegister.authority,
        obligationText: selectedUpdateForRegister.keyObligations?.[0] || selectedUpdateForRegister.summary,
        operationalCategory: modalFormCategory,
        assignedSite: modalFormSite,
        responsibleRole: modalFormRole,
        complianceStatus: modalFormComplianceStatus,
        nextAuditDueDate: modalFormDueDate,
        penaltyExposureAed: selectedUpdateForRegister.penaltyExposureAed || 5000
      });

      // 2. Call server-side endpoint POST /api/regulatory/add-legal-register for compliance logging
      try {
        await fetch('/api/regulatory/add-legal-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updateId: selectedUpdateForRegister.id,
            title: selectedUpdateForRegister.title,
            authority: selectedUpdateForRegister.authority,
            obligationText: selectedUpdateForRegister.keyObligations?.[0] || selectedUpdateForRegister.summary,
            operationalCategory: modalFormCategory,
            assignedSite: modalFormSite,
            responsibleRole: modalFormRole,
            penaltyExposureAed: selectedUpdateForRegister.penaltyExposureAed,
            nextAuditDueDate: modalFormDueDate,
            complianceStatus: modalFormComplianceStatus,
            userId: currentUser?.id || 'usr-hse-officer',
            userName: currentUser?.name || 'HSE Compliance Specialist'
          })
        });
      } catch (err) {
        console.warn('[REGULATORY] Server log non-fatal error:', err);
      }

      // Update registered map state
      syncRegisteredMap();

      // Show toast
      setToastMessage({
        id: selectedUpdateForRegister.id,
        text: `"${selectedUpdateForRegister.title.slice(0, 48)}..." added to Enterprise Legal Register`,
        obligationId: newObligation.id
      });

      setIsAddModalOpen(false);
      setSelectedUpdateForRegister(null);
    } catch (err: any) {
      console.error('[REGULATORY] Error adding to legal register:', err);
      alert(err.message || 'Failed to add obligation to Legal Register.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  // Quick 1-click addition with default settings
  const handleQuickAdd = async (update: RegulatoryAnnouncementItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newObligation = RegulatoryIntelligenceService.addObligationToLegalRegister({
        regulationId: update.id,
        regulationTitle: update.title,
        authority: update.authority,
        obligationText: update.keyObligations?.[0] || update.summary,
        operationalCategory: 'Workforce Safety',
        assignedSite: 'Mina Al Fahal Refinery & Terminal',
        responsibleRole: 'Site HSE Manager',
        complianceStatus: 'Partially Compliant',
        penaltyExposureAed: update.penaltyExposureAed || 5000
      });

      fetch('/api/regulatory/add-legal-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateId: update.id,
          title: update.title,
          authority: update.authority,
          obligationText: update.keyObligations?.[0] || update.summary,
          operationalCategory: 'Workforce Safety',
          assignedSite: 'Mina Al Fahal Refinery & Terminal',
          responsibleRole: 'Site HSE Manager',
          penaltyExposureAed: update.penaltyExposureAed || 5000,
          userId: currentUser?.id,
          userName: currentUser?.name
        })
      }).catch(() => {});

      syncRegisteredMap();

      setToastMessage({
        id: update.id,
        text: `"${update.title.slice(0, 48)}..." mapped to Legal Register`,
        obligationId: newObligation.id
      });
    } catch (err: any) {
      console.error('[REGULATORY] Quick add error:', err);
    }
  };

  // Formatter for timestamp
  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  // Format publication date
  const formatPublicationDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const officialCount = updates.filter(u => u.badgeType === 'OFFICIAL').length;
  const reportedCount = updates.filter(u => u.badgeType === 'REPORTED').length;
  const inRegisterCount = Object.keys(registeredObligationsMap).length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="glass-card bg-emerald-50/95 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Added to Enterprise Legal Register
              </p>
              <p className="text-xs text-emerald-800 font-medium">
                {toastMessage.text} {toastMessage.obligationId && <span className="font-mono font-bold text-emerald-900">({toastMessage.obligationId})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate(View.COMPLY_FLOW)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <BookOpen size={13} />
                <span>Open Legal Register</span>
              </button>
            )}
            <button
              onClick={() => setToastMessage(null)}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Top Header & 'Last Checked' Timestamp */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -end-16 -top-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute end-40 -bottom-20 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                Live Regulatory Feed
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 bg-white/5 border border-white/10">
                Route: /api/regulatory/latest
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                Sultanate of Oman & GCC Frameworks
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-none">
              Latest Regulatory Updates & Announcements
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
              Real-time monitoring of official ministerial decrees, summer heat bans (MD 286/2008), PDO HSE specifications, Civil Defence notices, and reported industry regulatory intelligence with direct Legal Register ingestion.
            </p>
          </div>

          {/* Last Checked Badge & Refresh Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            <div className="glass-card bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3 shadow-md">
              <Clock size={16} className="text-teal-400 shrink-0" />
              <div className="text-start sm:text-end">
                <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Last Checked</p>
                <p className="text-xs font-mono font-bold text-white whitespace-nowrap">
                  {formatTimestamp(lastChecked)}
                </p>
              </div>
            </div>

            <button
              onClick={() => loadRegulatoryFeed(true)}
              disabled={isRefreshing || isLoading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Scanning Gazettes...' : 'Scan / Refresh Feed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-200/90 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Scanned</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{updates.length}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Decrees & Advisories</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div 
          onClick={() => setSelectedBadgeFilter('OFFICIAL')}
          className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all ${
            selectedBadgeFilter === 'OFFICIAL' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : 'border-slate-200/90 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Official Decrees</p>
              <p className="text-2xl font-black text-blue-950 mt-0.5">{officialCount}</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">OFFICIAL Gazettes</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedBadgeFilter('REPORTED')}
          className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all ${
            selectedBadgeFilter === 'REPORTED' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' : 'border-slate-200/90 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Reported Circulars</p>
              <p className="text-2xl font-black text-amber-950 mt-0.5">{reportedCount}</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">REPORTED Alerts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Radio size={22} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'REGISTERED' ? 'ALL' : 'REGISTERED')}
          className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all ${
            selectedBadgeFilter === 'REGISTERED' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50' : 'border-slate-200/90 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">In Legal Register</p>
              <p className="text-2xl font-black text-emerald-950 mt-0.5">{inRegisterCount}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Mapped Obligations</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scale size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter Tabs & Topic Chips Selector */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
        
        {/* Top Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute start-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements by title, decree, authority, obligation, or topic..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl ps-10 pe-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Badge Filter Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedBadgeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedBadgeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({updates.length})
            </button>
            <button
              onClick={() => setSelectedBadgeFilter('OFFICIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedBadgeFilter === 'OFFICIAL' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-800 hover:text-blue-900'
              }`}
            >
              <ShieldCheck size={12} />
              <span>OFFICIAL ({officialCount})</span>
            </button>
            <button
              onClick={() => setSelectedBadgeFilter('REPORTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedBadgeFilter === 'REPORTED' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              <Radio size={12} />
              <span>REPORTED ({reportedCount})</span>
            </button>
            <button
              onClick={() => setSelectedBadgeFilter('REGISTERED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedBadgeFilter === 'REGISTERED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>In Register ({inRegisterCount})</span>
            </button>
          </div>

          {/* Authority Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              aria-label="Filter updates by authority"
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-2xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Authorities</option>
              {allAuthorities.map(auth => (
                <option key={auth} value={auth}>{auth}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Chips Filter Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 shrink-0 pe-2">
            <Tag size={12} />
            <span>Topics:</span>
          </span>
          <button
            onClick={() => setSelectedTopic('ALL')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedTopic === 'ALL' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Topics
          </button>
          {allTopicChips.map(chip => (
            <button
              key={chip}
              onClick={() => setSelectedTopic(selectedTopic === chip ? 'ALL' : chip)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedTopic === chip 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-blue-50/80 text-blue-700 hover:bg-blue-100/90 border border-blue-200/50'
              }`}
            >
              #{chip}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card p-6 rounded-3xl border border-slate-200 bg-white animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-36 bg-slate-200 rounded-full" />
                <div className="h-6 w-28 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-16 w-full bg-slate-100 rounded-xl" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {errorMessage && !isLoading && (
        <div className="glass-card p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600" />
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
          <button
            onClick={() => loadRegulatoryFeed(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
          >
            Retry /api/regulatory/latest
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredUpdates.length === 0 && (
        <div className="glass-card p-16 rounded-3xl border border-slate-200 bg-white text-center space-y-4">
          <Scale size={48} className="mx-auto text-slate-300" />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No Matching Regulatory Updates Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No announcements matched your current filter criteria. Try resetting the search query or selecting "All Topics".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBadgeFilter('ALL');
              setSelectedTopic('ALL');
              setSelectedAuthority('ALL');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Card List of Regulatory Announcements */}
      {!isLoading && filteredUpdates.length > 0 && (
        <div className="space-y-4">
          {filteredUpdates.map((update) => {
            const isOfficial = update.badgeType === 'OFFICIAL';
            const mappedObligation = registeredObligationsMap[update.id];
            const isAlreadyInRegister = !!mappedObligation;

            return (
              <div 
                key={update.id}
                className={`glass-card p-6 md:p-7 rounded-3xl border transition-all duration-200 group bg-white hover:shadow-xl ${
                  isAlreadyInRegister 
                    ? 'border-emerald-200 bg-emerald-50/15 ring-1 ring-emerald-500/10' 
                    : isOfficial 
                    ? 'border-slate-200/90 hover:border-blue-300' 
                    : 'border-amber-200/90 hover:border-amber-400 bg-amber-50/10'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* OFFICIAL / REPORTED BADGE */}
                    {isOfficial ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs">
                        <ShieldCheck size={13} className="text-white" />
                        <span>OFFICIAL DECREE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs">
                        <Radio size={13} className="animate-pulse text-white" />
                        <span>REPORTED CIRCULAR</span>
                      </span>
                    )}

                    {/* Authority Name */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
                      <Building2 size={11} className="text-slate-500" />
                      <span>{update.authority}</span>
                    </span>

                    {/* Impact Level */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      update.impactLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      update.impactLevel === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {update.impactLevel} Impact
                    </span>

                    {/* In Legal Register Tag */}
                    {isAlreadyInRegister && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        <span>In Legal Register ({mappedObligation.id})</span>
                      </span>
                    )}
                  </div>

                  {/* Dates: Publication Date & Effective Date */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Published: {formatPublicationDate(update.publicationDate)}</span>
                    </span>
                    {update.effectiveDate && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Effective: {update.effectiveDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Bilingual Subtitle */}
                <div className="space-y-1 mb-3">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition-colors">
                    {update.title}
                  </h3>
                  {update.titleAr && (
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed" dir="rtl">
                      {update.titleAr}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mb-4">
                  {update.summary}
                </p>

                {/* Key Statutory Obligations Checklist */}
                {update.keyObligations && update.keyObligations.length > 0 && (
                  <div className="mb-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <FileText size={12} />
                      <span>Key Statutory Obligations:</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {update.keyObligations.map((obligation, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-snug">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obligation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topic Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider me-1">Topics:</span>
                  {update.topicChips?.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setSelectedTopic(chip)}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/70"
                    >
                      #{chip}
                    </button>
                  ))}
                  {update.statutoryFine && (
                    <span className="ms-auto text-[11px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                      Penalty Exposure: {update.statutoryFine}
                    </span>
                  )}
                </div>

                {/* Bottom Actions Row: Open Source Link & Add to Legal Register */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* 'Open source' Link */}
                  <a
                    href={update.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors group/link"
                    title={`Open source decree on ${update.sourceName || 'official portal'}`}
                  >
                    <span>Open source: {update.sourceName || 'Official Source Gazette'}</span>
                    <ExternalLink size={13} className="text-blue-500 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>

                  {/* Legal Register Action */}
                  <div className="flex items-center gap-2">
                    {isAlreadyInRegister ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-600" />
                          <span>In Legal Register ({mappedObligation.id})</span>
                        </span>
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate(View.COMPLY_FLOW)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>View in Register</span>
                            <ArrowUpRight size={13} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleQuickAdd(update, e)}
                          title="Quick 1-Click addition with default parameters"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Quick Add</span>
                        </button>
                        <button
                          onClick={() => handleOpenAddModal(update)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                        >
                          <Scale size={14} />
                          <span>Add to Legal Register</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Modal: Add to Legal Register */}
      {isAddModalOpen && selectedUpdateForRegister && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-register-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="glass-card bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 id="legal-register-modal-title" className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Add to Enterprise Legal Register
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Map this statutory decree into your site-specific compliance register & obligations ledger.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Regulation Preview */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedUpdateForRegister.badgeType === 'OFFICIAL' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedUpdateForRegister.badgeType}
                </span>
                <span className="text-[11px] font-bold text-slate-600">{selectedUpdateForRegister.authority}</span>
                <span className="ms-auto text-[11px] font-mono text-slate-500 font-bold">{selectedUpdateForRegister.id}</span>
              </div>
              <h4 className="text-xs font-black text-slate-900">{selectedUpdateForRegister.title}</h4>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{selectedUpdateForRegister.summary}</p>
            </div>

            {/* Modal Form Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Assigned Operational Site
                </label>
                <select
                  value={modalFormSite}
                  onChange={(e) => setModalFormSite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mina Al Fahal Refinery & Terminal">Mina Al Fahal Refinery & Terminal (Oman)</option>
                  <option value="Khazzan Gas Processing Complex">Khazzan Gas Processing Complex (Block 61)</option>
                  <option value="Sohar Industrial Port Terminal">Sohar Industrial Port Terminal (Oman)</option>
                  <option value="Fahud Concession Field Block 6">Fahud Concession Field Block 6 (Oman)</option>
                  <option value="Duqm Special Economic Zone (SEZAD)">Duqm Special Economic Zone (SEZAD)</option>
                  <option value="All Concessions & Assets">All Concessions & Assets (Enterprise-wide)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Responsible Role Owner
                </label>
                <select
                  value={modalFormRole}
                  onChange={(e) => setModalFormRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Site HSE Manager">Site HSE Manager</option>
                  <option value="Site Supervisor">Site Supervisor</option>
                  <option value="Environmental Officer">Environmental Officer</option>
                  <option value="Regional HSE Director">Regional HSE Director</option>
                  <option value="Scaffolding Supervisor">Scaffolding Supervisor</option>
                  <option value="Maintenance Lead">Maintenance Lead</option>
                  <option value="Legal Team">Legal Team</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Operational Category
                </label>
                <select
                  value={modalFormCategory}
                  onChange={(e) => setModalFormCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Workforce Safety">Workforce Safety</option>
                  <option value="Plant & Machinery">Plant & Machinery</option>
                  <option value="Environmental ESG">Environmental ESG</option>
                  <option value="Reporting & Audit">Reporting & Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Next Audit Due Date
                </label>
                <input
                  type="date"
                  value={modalFormDueDate}
                  onChange={(e) => setModalFormDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Initial Compliance Assessment Posture
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fully Compliant', 'Partially Compliant', 'At Risk / Non-Compliant'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setModalFormComplianceStatus(status)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        modalFormComplianceStatus === status
                          ? status === 'Fully Compliant' 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : status === 'Partially Compliant'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToLegalRegister}
                disabled={isSubmittingRegister}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingRegister ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Confirm & Add to Register</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryUpdatesDashboard;
