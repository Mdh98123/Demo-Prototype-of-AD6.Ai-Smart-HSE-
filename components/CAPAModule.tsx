import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, Plus, Filter, Search, Clock, CheckCircle2, 
  AlertOctagon, AlertTriangle, ShieldCheck, User, Calendar, 
  MapPin, ArrowUpRight, RotateCcw, Building2, Check, X,
  ExternalLink, Layers, ChevronRight, Sparkles
} from 'lucide-react';
import { DemoDataLoader, EnterpriseCapa, GULF_ENERGY_CAPAS } from '../services/demoDataLoader';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { VoiceDictationButton } from './media/VoiceDictationButton';

export const CAPAModule: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const canCloseCapa = currentUser?.role !== 'Worker';
  const [capas, setCapas] = useState<EnterpriseCapa[]>(() => {
    return DemoDataLoader.getStoredCapas();
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'Open' | 'In-Progress' | 'Pending Verification' | 'Closed'>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapa, setSelectedCapa] = useState<EnterpriseCapa | null>(null);
  const [closureNotes, setClosureNotes] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  const openCapa = (capa: EnterpriseCapa) => {
    setSelectedCapa(capa);
    setClosureNotes(capa.closureEvidence || '');
  };

  useEffect(() => {
    const handleReset = () => {
      setCapas(DemoDataLoader.getStoredCapas());
    };
    window.addEventListener('ad6-demo-data-reset', handleReset);
    return () => window.removeEventListener('ad6-demo-data-reset', handleReset);
  }, []);

  const handleManualReset = async () => {
    setIsResetting(true);
    try {
      const counts = await DemoDataLoader.resetDemoData();
      setCapas(DemoDataLoader.getStoredCapas());
      setResetSuccessNotice(`Restored ${counts.capasCount} CAPAs, ${counts.incidentsCount} Incidents, and ${counts.permitsCount} PTWs for Gulf Energy & Infrastructure Group.`);
      setTimeout(() => setResetSuccessNotice(null), 5000);
    } finally {
      setIsResetting(false);
    }
  };

  const handleStatusChange = (capaId: string, newStatus: EnterpriseCapa['status']) => {
    if (newStatus === 'Closed' && !canCloseCapa) {
      alert('⚠️ Access Denied: Only designated HSE Officers, Supervisors, or Administrators can formally close and verify CAPAs.');
      return;
    }
    const updatedEvidence = closureNotes.trim() || (newStatus === 'Closed' ? 'Verified closed by Lead Safety Specialist.' : undefined);
    const updated = capas.map(c => {
      if (c.id === capaId) {
        return {
          ...c,
          status: newStatus,
          closureEvidence: updatedEvidence || c.closureEvidence
        };
      }
      return c;
    });
    setCapas(updated);
    localStorage.setItem('ad6_enterprise_capas', JSON.stringify(updated));
    if (selectedCapa && selectedCapa.id === capaId) {
      setSelectedCapa({ 
        ...selectedCapa, 
        status: newStatus, 
        closureEvidence: updatedEvidence || selectedCapa.closureEvidence 
      });
    }
  };

  const filteredCapas = useMemo(() => {
    return capas.filter(c => {
      if (activeTab !== 'ALL' && c.status !== activeTab) return false;
      if (siteFilter !== 'ALL' && !c.siteName.includes(siteFilter)) return false;
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          c.title.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q) ||
          c.sourceId.toLowerCase().includes(q) ||
          c.details.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [capas, activeTab, siteFilter, priorityFilter, searchQuery]);

  // Metric counts
  const openCount = capas.filter(c => c.status === 'Open').length;
  const inProgressCount = capas.filter(c => c.status === 'In-Progress').length;
  const pendingCount = capas.filter(c => c.status === 'Pending Verification').length;
  const closedCount = capas.filter(c => c.status === 'Closed').length;
  const overdueCount = capas.filter(c => c.isOverdue).length;

  const getPriorityBadge = (priority: EnterpriseCapa['priority']) => {
    switch (priority) {
      case 'P1 - Critical':
        return 'bg-red-500/20 text-red-400 border border-red-500/40';
      case 'P2 - High':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'P3 - Medium':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getStatusBadge = (status: EnterpriseCapa['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'In-Progress':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Pending Verification':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'Closed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Gulf Energy & Infrastructure Group
            </span>
            <span className="text-xs text-slate-400 font-mono">15 Synthetic Actions Seeded</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
            <Target className="text-emerald-400 w-6 h-6" />
            CAPA Management & Closed-Loop Remediation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ISO 45001 / OSHAD-SF compliant corrective and preventive action ledger across Oman, UAE & KSA operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleManualReset}
            disabled={isResetting}
            title="Reset synthetic baseline demonstration data"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {resetSuccessNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resetSuccessNotice}</span>
          </div>
          <button onClick={() => setResetSuccessNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Open Actions</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{openCount}</span>
            <span className="text-[11px] font-bold text-red-400">({overdueCount} Overdue)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending initial containment</p>
        </div>

        {/* In-Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>In-Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{inProgressCount}</span>
            <span className="text-[11px] font-bold text-amber-400">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Engineering & administrative work</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Verification</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{pendingCount}</span>
            <span className="text-[11px] font-bold text-purple-400">Review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Lead Safety Officer audit</p>
        </div>

        {/* Closed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Closed Remediation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{closedCount}</span>
            <span className="text-[11px] font-bold text-emerald-400">Verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% auditable evidence archived</p>
        </div>
      </div>

      {/* Filter Toolbar & Status Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            {(['ALL', 'Open', 'In-Progress', 'Pending Verification', 'Closed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? `All (${capas.length})` : `${tab} (${capas.filter(c => c.status === tab).length})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, owner, source ID..."
              className="w-full ps-9 pe-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 text-xs flex-wrap">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Filter Asset:</span>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All 3 GCC Sites</option>
            <option value="Fahud-West">Fahud-West Gas Station (Oman)</option>
            <option value="Al-Ruwais">Al-Ruwais Polyolefin Asset (UAE)</option>
            <option value="Ras Al-Khair">Ras Al-Khair Facility (KSA)</option>
          </select>

          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] ms-2">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1 - Critical">P1 - Critical</option>
            <option value="P2 - High">P2 - High</option>
            <option value="P3 - Medium">P3 - Medium</option>
          </select>
        </div>
      </div>

      {/* Main CAPA Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[10px]">
              <tr>
                <th className="px-4 py-3 text-start">CAPA ID & Source</th>
                <th className="px-4 py-3 text-start">Action Description</th>
                <th className="px-4 py-3 text-start">Operating Site</th>
                <th className="px-4 py-3 text-start">Assigned Owner</th>
                <th className="px-4 py-3 text-start">SLA Target Date</th>
                <th className="px-4 py-3 text-start">Hierarchy</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredCapas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No corrective actions matched your search filters.
                  </td>
                </tr>
              ) : (
                filteredCapas.map((capa) => (
                  <tr key={capa.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-400">{capa.id}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="font-semibold">{capa.sourceType}:</span>
                        <span>{capa.sourceId}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs sm:max-w-sm">
                      <p className="font-bold text-white line-clamp-1">{capa.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{capa.details}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{capa.siteName.split('(')[0]}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                          {capa.ownerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">{capa.ownerName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{capa.ownerRole}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{capa.dueDate}</div>
                      <div className={`text-[10px] font-bold ${capa.isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        {capa.countdownText}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {capa.hierarchy}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(capa.status)}`}>
                        {capa.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-end whitespace-nowrap">
                      <button
                        onClick={() => openCapa(capa)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAPA Detail & Verification Drawer Modal */}
      {selectedCapa && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{selectedCapa.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadge(selectedCapa.priority)}`}>
                    {selectedCapa.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(selectedCapa.status)}`}>
                    {selectedCapa.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedCapa.title}</h3>
              </div>
              <button onClick={() => setSelectedCapa(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Source Reference:</span>
                  <p className="font-semibold text-slate-200">{selectedCapa.sourceType} ({selectedCapa.sourceId})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Operating Asset:</span>
                  <p className="font-semibold text-slate-200">{selectedCapa.siteName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Assigned Owner:</span>
                  <p className="font-semibold text-slate-200">{selectedCapa.ownerName} ({selectedCapa.ownerRole})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">SLA Due Date:</span>
                  <p className="font-semibold text-slate-200">{selectedCapa.dueDate} ({selectedCapa.countdownText})</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Technical Scope & Remediation Plan:</span>
                <p className="mt-1 p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 leading-relaxed text-slate-200">
                  {selectedCapa.details}
                </p>
              </div>

              {/* Field Verification & Closure Evidence with Voice Dictation */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Field Verification & Closure Evidence:
                  </span>
                  <VoiceDictationButton
                    value={closureNotes}
                    onTranscript={(val) => setClosureNotes(val)}
                    size="sm"
                    mode="append"
                  />
                </div>
                <textarea
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Dictate with mic or type field verification notes & auditable evidence..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
                {selectedCapa.verifiedBy && (
                  <p className="text-[10px] text-slate-400">Verified by: {selectedCapa.verifiedBy}</p>
                )}
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Transition Status:</span>
              <div className="flex items-center gap-2">
                {selectedCapa.status !== 'In-Progress' && selectedCapa.status !== 'Closed' && (
                  <button
                    onClick={() => handleStatusChange(selectedCapa.id, 'In-Progress')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    Start Work
                  </button>
                )}

                {selectedCapa.status !== 'Pending Verification' && selectedCapa.status !== 'Closed' && (
                  <button
                    onClick={() => handleStatusChange(selectedCapa.id, 'Pending Verification')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                  >
                    Submit for Review
                  </button>
                )}

                {selectedCapa.status !== 'Closed' && (
                  <button
                    disabled={!canCloseCapa}
                    onClick={() => handleStatusChange(selectedCapa.id, 'Closed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition"
                    title={!canCloseCapa ? 'Restricted: HSE Officer or Supervisor role required' : undefined}
                  >
                    {canCloseCapa ? 'Verify & Close' : 'Close Restricted (HSE Role Required)'}
                  </button>
                )}

                <button
                  onClick={() => setSelectedCapa(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CAPAModule;
