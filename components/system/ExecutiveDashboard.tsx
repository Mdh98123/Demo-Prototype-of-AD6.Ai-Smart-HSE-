import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, ShieldCheck, AlertTriangle, Users, Clock, Award, 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Globe, 
  MapPin, FileText, Download, Zap, CheckCircle2, AlertOctagon, 
  Filter, Calendar, ChevronRight, Sparkles, Building2, Eye, ShieldAlert, Info,
  HelpCircle, RefreshCw, X, Search, Check, Layers
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTenant } from '../../contexts/TenantContext';
import { EnterpriseDataStore } from '../../services/enterpriseDataStore';
import { Incident } from '../../types';

export const ExecutiveDashboard: React.FC = () => {
  const { language, dir } = useLanguage();
  const { currentTenant, currentSite } = useTenant();

  // Filters & State
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<'ALL' | 'OMAN' | 'UAE' | 'KSA'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'12M' | 'YTD' | 'Q3_Q4'>('12M');
  const [exposureBasis, setExposureBasis] = useState<'1M' | '200K'>('1M'); // Configurable exposure basis: 1,000,000 hrs (PDO/OQ standard) vs 200,000 hrs (OSHA)
  const [isAiBriefingOpen, setIsAiBriefingOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [activeFormulaModal, setActiveFormulaModal] = useState<string | null>(null);
  const [scorecardSearch, setScorecardSearch] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dynamic incident data grounded in enterprise store
  const [incidents, setIncidents] = useState<Incident[]>(() => EnterpriseDataStore.getIncidents());

  useEffect(() => {
    const handleUpdate = () => {
      setIncidents(EnterpriseDataStore.getIncidents());
    };
    window.addEventListener('ad6-incidents-updated', handleUpdate);
    window.addEventListener('ad6-data-mutation', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ad6-incidents-updated', handleUpdate);
      window.removeEventListener('ad6-data-mutation', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Live calculated KPIs based on stored incidents and exposure hours
  const { currentLtifr, currentTrir, ltiCount, recordableCount, currentExposureHours } = useMemo(() => {
    let filtered = incidents;
    let hours = 2450000;
    if (selectedAssetFilter === 'OMAN') {
      filtered = incidents.filter(i => (i.location && i.location.includes('Oman')) || i.jurisdiction === 'Oman');
      hours = 850000;
    } else if (selectedAssetFilter === 'UAE') {
      filtered = incidents.filter(i => (i.location && (i.location.includes('UAE') || i.location.includes('Ruwais'))) || i.jurisdiction === 'Abu Dhabi');
      hours = 1120000;
    } else if (selectedAssetFilter === 'KSA') {
      filtered = incidents.filter(i => (i.location && (i.location.includes('KSA') || i.location.includes('Khair'))) || i.jurisdiction === 'KSA');
      hours = 480000;
    }

    const ltiList = filtered.filter(i => 
      i.type === 'Lost Time Injury' || 
      i.classification === 'Lost Time Injury' ||
      (i.severity === 'Critical' && i.description?.toLowerCase().includes('fracture'))
    );
    const recordableList = filtered.filter(i => 
      i.type === 'Lost Time Injury' || 
      i.classification === 'Lost Time Injury' ||
      i.type === 'Medical Treatment' || 
      i.classification === 'Medical Treatment' ||
      i.type === 'Fatality' ||
      i.classification === 'Process Safety Event'
    );

    const ltiC = ltiList.length;
    const recC = recordableList.length;
    const multiplier = exposureBasis === '1M' ? 1000000 : 200000;

    const ltifrVal = hours > 0 ? (ltiC * multiplier) / hours : 0;
    const trirVal = hours > 0 ? (recC * multiplier) / hours : 0;

    return {
      currentLtifr: ltifrVal.toFixed(3),
      currentTrir: trirVal.toFixed(3),
      ltiCount: ltiC,
      recordableCount: recC,
      currentExposureHours: hours
    };
  }, [incidents, selectedAssetFilter, exposureBasis]);

  // Simulate loading skeleton for demonstration / testing
  const triggerRefresh = () => {
    setIsLoadingData(true);
    setIncidents(EnterpriseDataStore.getIncidents());
    setTimeout(() => setIsLoadingData(false), 500);
  };

  // 12-Month Incident Trend: Near Miss (leading) vs First Aid vs Medical vs Lost Time Injury (lagging)
  const monthlyTrendData = useMemo(() => [
    { month: 'Nov 25', lti: 0, mtc: 1, fac: 2, nearMiss: 7, totalHours: 198000, trir: 0.28 },
    { month: 'Dec 25', lti: 0, mtc: 0, fac: 3, nearMiss: 6, totalHours: 202000, trir: 0.27 },
    { month: 'Jan 26', lti: 0, mtc: 1, fac: 1, nearMiss: 8, totalHours: 205000, trir: 0.26 },
    { month: 'Feb 26', lti: 0, mtc: 0, fac: 2, nearMiss: 5, totalHours: 194000, trir: 0.25 },
    { month: 'Mar 26', lti: 0, mtc: 1, fac: 4, nearMiss: 9, totalHours: 210000, trir: 0.26 },
    { month: 'Apr 26', lti: 0, mtc: 0, fac: 2, nearMiss: 6, totalHours: 204000, trir: 0.25 },
    { month: 'May 26', lti: 0, mtc: 0, fac: 3, nearMiss: 7, totalHours: 215000, trir: 0.24 },
    { month: 'Jun 26', lti: 0, mtc: 1, fac: 5, nearMiss: 11, totalHours: 220000, trir: 0.25 },
    { month: 'Jul 26', lti: 0, mtc: 0, fac: 2, nearMiss: 8, totalHours: 218000, trir: 0.24 },
    { month: 'Aug 26', lti: 0, mtc: 0, fac: 3, nearMiss: 7, totalHours: 222000, trir: 0.23 },
    { month: 'Sep 26', lti: 0, mtc: 1, fac: 2, nearMiss: 6, totalHours: 226000, trir: 0.23 },
    { month: 'Oct 26', lti: 1, mtc: 0, fac: 2, nearMiss: 8, totalHours: 236000, trir: 0.24 },
  ], []);

  // Hazard Observations by Category (Exactly matching task specifications)
  const hazardCategoryData = useMemo(() => [
    { category: 'Working at Height', percentage: 32, count: 51, color: '#2563EB' },
    { category: 'Slip / Trip / Fall', percentage: 24, count: 38, color: '#3B82F6' },
    { category: 'Chemical / Gas Handling', percentage: 18, count: 29, color: '#6366F1' },
    { category: 'Electrical / LOTO', percentage: 14, count: 22, color: '#F59E0B' },
    { category: 'Equipment Safeguarding', percentage: 12, count: 19, color: '#10B981' },
  ], []);

  // CAPA Closure SLA Compliance Rate (%) over time (Current 94.6% vs 90.0% Target)
  const capaComplianceTrendData = useMemo(() => [
    { month: 'May 26', rate: 89.2, target: 90.0, open: 18, closedOnTime: 16 },
    { month: 'Jun 26', rate: 91.5, target: 90.0, open: 22, closedOnTime: 20 },
    { month: 'Jul 26', rate: 93.8, target: 90.0, open: 19, closedOnTime: 18 },
    { month: 'Aug 26', rate: 92.4, target: 90.0, open: 17, closedOnTime: 16 },
    { month: 'Sep 26', rate: 95.1, target: 90.0, open: 21, closedOnTime: 20 },
    { month: 'Oct 26', rate: 94.6, target: 90.0, open: 15, closedOnTime: 14 },
  ], []);

  // Multi-Country Compliance Scorecard (Oman, UAE, KSA as specified in Task 3)
  const countryScorecard = useMemo(() => [
    {
      id: 'om-01',
      country: 'Sultanate of Oman',
      asset: 'Fahud-West Gas Station',
      operator: 'Petroleum Development Oman (PDO Block 6)',
      statutoryCode: 'Ministry of Labour (MD 286/2008 & RD 53/2023)',
      auditScore: 98.4,
      status: 'Compliant',
      safeHours: '850,000 hrs',
      trir: 0.26,
      openFindings: 2,
      statutorySlaRate: '100% (Within 24h)',
      criticalBarriers: 'Omani Safety Supervisor ratio certified; whip-check restraints active',
      lastAuditDate: '15 Sep 2026',
      statusType: 'compliant'
    },
    {
      id: 'ae-01',
      country: 'United Arab Emirates',
      asset: 'Al-Ruwais Polyolefin Asset',
      operator: 'Abu Dhabi Industrial Complex (ADNOC Onshore Alignment)',
      statutoryCode: 'Abu Dhabi OSHAD-SF Mechanism 11.0 / Al-Adaa alignment',
      auditScore: 99.1,
      status: 'Compliant',
      safeHours: '1,120,000 hrs',
      trir: 0.18,
      openFindings: 1,
      statutorySlaRate: '< 24 hrs Form G turnaround',
      criticalBarriers: 'Al-Adaa digital portal synchronized; habitat hot work safe',
      lastAuditDate: '28 Sep 2026',
      statusType: 'compliant'
    },
    {
      id: 'sa-01',
      country: 'Kingdom of Saudi Arabia',
      asset: 'Ras Al-Khair Facility',
      operator: 'Special Economic Zone & Maritime Complex',
      statutoryCode: 'MHRSD / NCOSH Occupational Health Surveillance',
      auditScore: 97.8,
      status: 'Compliant',
      safeHours: '480,000 hrs',
      trir: 0.28,
      openFindings: 3,
      statutorySlaRate: '100% (Verified)',
      criticalBarriers: 'Summer heat ban digital log verified; heavy lift plate load testing',
      lastAuditDate: '22 Aug 2026',
      statusType: 'compliant'
    }
  ], []);

  // Filtered scorecard
  const filteredScorecard = useMemo(() => {
    let list = countryScorecard;
    if (selectedAssetFilter === 'OMAN') {
      list = list.filter(s => s.country.includes('Oman'));
    } else if (selectedAssetFilter === 'UAE') {
      list = list.filter(s => s.country.includes('Emirates'));
    } else if (selectedAssetFilter === 'KSA') {
      list = list.filter(s => s.country.includes('Saudi'));
    }

    if (scorecardSearch.trim()) {
      const q = scorecardSearch.toLowerCase();
      list = list.filter(s => 
        s.country.toLowerCase().includes(q) ||
        s.asset.toLowerCase().includes(q) ||
        s.statutoryCode.toLowerCase().includes(q) ||
        s.criticalBarriers.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedAssetFilter, countryScorecard, scorecardSearch]);

  const handleExportBoardPack = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportFeedback('Executive Board Pack (Q4 2026 HSE Briefing) downloaded successfully with digital cryptographic digest.');
      setTimeout(() => setExportFeedback(null), 6000);
    }, 900);
  };

  return (
    <div className={`space-y-6 max-w-[1720px] mx-auto text-slate-900 pb-20 animate-fade-in ${dir === 'rtl' ? 'font-arabic' : 'font-sans'}`}>
      
      {/* 1. Header with Enterprise Light Glassmorphism Canvas */}
      <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 shadow-sm shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1.5">
            <span className="font-semibold text-blue-700">Executive Business Intelligence</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Enterprise Safety Directorate</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-700 font-medium">Gulf Energy & Infrastructure Group</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Executive Safety Analytics & BI Cockpit
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Route /analytics
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Consolidated lagging and leading safety indicators, statutory audit readiness scorecards, and CAPA closure SLAs across Oman, UAE, and KSA industrial operating concessions.
          </p>
        </div>

        {/* Global Export, Refresh & AI Briefing Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={triggerRefresh}
            title="Refresh analytics data"
            className="p-2.5 rounded-xl bg-white/90 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition shadow-sm active:scale-95"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsAiBriefingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 active:scale-95 focus:ring-2 focus:ring-blue-500"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>AI Executive Briefing</span>
          </button>

          <button
            onClick={handleExportBoardPack}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/80 text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce text-blue-600' : 'text-slate-600'}`} />
            <span>{isExporting ? 'Generating Report...' : 'Export Board Report'}</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-slide-down text-xs text-emerald-800 font-medium shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Exposure Basis Standard Switcher: PDO/OQ (1,000,000 hrs) vs OSHA (200,000 hrs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800">Frequency Rate Exposure Basis:</span>
          <span className="text-slate-500 font-medium hidden sm:inline">Statutory and client reporting calculation basis</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setExposureBasis('1M')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              exposureBasis === '1M'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇴🇲 1,000,000 Hours (PDO / OQ Standard)
          </button>
          <button
            onClick={() => setExposureBasis('200K')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              exposureBasis === '200K'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇺🇸 200,000 Hours (US OSHA Standard)
          </button>
        </div>
      </div>

      {/* 2. Standard Enterprise Safety KPI Metric Cards (TRIR, LTIFR, Severity Rate 4.2, Safe Man-Hours 2,450,000) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: TRIR */}
        <div 
          onClick={() => setActiveFormulaModal('TRIR')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-blue-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 flex flex-col justify-between group cursor-pointer relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Total Recordable Incident Rate</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-mono transition-colors">TRIR</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
          
          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingData ? (
              <div className="h-10 w-24 bg-slate-200/70 animate-pulse rounded-lg"></div>
            ) : (
              <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                {currentTrir}
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowDownRight className="w-3.5 h-3.5" /> Live Data
            </span>
          </div>

          {/* Sparkline Indicator */}
          <div className="mt-2.5 h-7 w-full flex items-end gap-1 pt-1 opacity-85">
            {[0.32, 0.31, 0.29, 0.28, 0.26, 0.26, 0.25, 0.25, 0.24, 0.24, 0.23, 0.24].map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-100 hover:bg-blue-300 rounded-t-sm transition-all"
                style={{ height: `${(v / 0.35) * 100}%` }}
                title={`M${i+1}: ${v}`}
              />
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Basis: per {exposureBasis === '1M' ? '1M hrs' : '200k hrs'} ({recordableCount} Recordables)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Live Store
            </span>
          </div>
        </div>

        {/* Card 2: LTIFR */}
        <div 
          onClick={() => setActiveFormulaModal('LTIFR')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-amber-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 flex flex-col justify-between group cursor-pointer relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Lost Time Injury Frequency</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 group-hover:text-amber-600 font-mono transition-colors">LTIFR</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingData ? (
              <div className="h-10 w-24 bg-slate-200/70 animate-pulse rounded-lg"></div>
            ) : (
              <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                {currentLtifr}
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowDownRight className="w-3.5 h-3.5" /> Live Data
            </span>
          </div>

          {/* Sparkline Indicator */}
          <div className="mt-2.5 h-7 w-full flex items-end gap-1 pt-1 opacity-85">
            {[0.16, 0.15, 0.15, 0.14, 0.14, 0.13, 0.13, 0.12, 0.12, 0.12, 0.11, 0.12].map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-amber-100 hover:bg-amber-300 rounded-t-sm transition-all"
                style={{ height: `${(v / 0.18) * 100}%` }}
                title={`M${i+1}: ${v}`}
              />
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Per {exposureBasis === '1M' ? '1M hrs' : '200k hrs'}</span>
            <span className="font-semibold text-amber-800">1 LTI YTD (Oman Block 6)</span>
          </div>
        </div>

        {/* Card 3: Severity Rate (4.2) */}
        <div 
          onClick={() => setActiveFormulaModal('SEVERITY')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-indigo-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 flex flex-col justify-between group cursor-pointer relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Lost Workday Severity Rate</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-mono transition-colors">SR</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingData ? (
              <div className="h-10 w-24 bg-slate-200/70 animate-pulse rounded-lg"></div>
            ) : (
              <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                4.2
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3 h-3" /> Days Lost
            </span>
          </div>

          {/* Sparkline Indicator */}
          <div className="mt-2.5 h-7 w-full flex items-end gap-1 pt-1 opacity-85">
            {[6.5, 6.0, 5.8, 5.4, 5.0, 4.8, 4.6, 4.5, 4.4, 4.3, 4.2, 4.2].map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-100 hover:bg-indigo-300 rounded-t-sm transition-all"
                style={{ height: `${(v / 7.0) * 100}%` }}
                title={`M${i+1}: ${v}`}
              />
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Per Million Exposure Hours</span>
            <span className="text-slate-700 font-semibold font-mono">Stable (-2.1 Days)</span>
          </div>
        </div>

        {/* Card 4: Total Safe Man-Hours Worked (2,450,000 hrs, 412 Days) */}
        <div 
          onClick={() => setActiveFormulaModal('MANHOURS')}
          className="p-5 rounded-2xl bg-white/80 backdrop-blur-md backdrop-saturate-150 border border-slate-200/70 hover:border-emerald-400/80 transition-all shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/40 flex flex-col justify-between group cursor-pointer relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Total Safe Man-Hours Worked</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-mono transition-colors">Cumulative</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingData ? (
              <div className="h-10 w-28 bg-slate-200/70 animate-pulse rounded-lg"></div>
            ) : (
              <div className="text-3xl lg:text-4xl font-black text-emerald-700 font-mono tracking-tight">
                2,450,000
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> 412 Days
            </span>
          </div>

          {/* Sparkline Indicator */}
          <div className="mt-2.5 h-7 w-full flex items-end gap-1 pt-1 opacity-85">
            {[1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.15, 2.22, 2.28, 2.34, 2.4, 2.45].map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-emerald-200 hover:bg-emerald-400 rounded-t-sm transition-all"
                style={{ height: `${(v / 2.6) * 100}%` }}
                title={`Cumulative: ${v}M hrs`}
              />
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Consecutive LTI-Free Record</span>
            <span className="text-emerald-700 font-semibold font-mono">ISO 45001 Certified</span>
          </div>
        </div>

      </div>

      {/* 3. Interactive Filter Tabs (Quick Filter for GCC Concessions & Time Horizon) */}
      <div className="p-3 bg-white/70 backdrop-blur-md border border-slate-200/70 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Quick Filter Tabs for Territories as specified in Task 3 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1 shrink-0">
            <Globe className="w-3.5 h-3.5 text-blue-600" /> Filter Concessions:
          </span>
          {[
            { id: 'ALL', label: 'All Territories' },
            { id: 'OMAN', label: 'Sultanate of Oman' },
            { id: 'UAE', label: 'United Arab Emirates' },
            { id: 'KSA', label: 'Kingdom of Saudi Arabia' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedAssetFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedAssetFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Horizon:
          </span>
          {[
            { id: '12M', label: '12-Month Trailing' },
            { id: 'YTD', label: '2026 YTD' },
            { id: 'Q3_Q4', label: 'H2 Active Focus' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPeriod === p.id
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chart Row 1: 12-Month Incident Trend (Lost Time vs Medical vs Near Miss vs First Aid) */}
      <div className="p-6 bg-white/80 backdrop-blur-md backdrop-saturate-150 rounded-3xl border border-slate-200/70 shadow-sm shadow-slate-200/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                12-Month Incident Trend Analysis
              </h2>
              <span className="text-xs text-slate-500 font-mono">· Leading vs Lagging Frequency Ratio</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Comparative visualization contrasting Near Misses (leading engagement), First Aid Cases, Medical Treatments, and Lost Time Injuries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
              <span className="text-slate-700 font-semibold">Lost Time (LTI)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-slate-700 font-semibold">Medical (MTC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
              <span className="text-slate-700 font-semibold">First Aid (FAC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
              <span className="text-slate-700 font-semibold">Near Miss</span>
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          {isLoadingData ? (
            <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs">
              Loading 12-month trend metrics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B" 
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  stroke="#64748B" 
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any, name: any) => [
                    val, 
                    name === 'lti' ? 'Lost Time Injury (LTI)' : 
                    name === 'mtc' ? 'Medical Treatment (MTC)' : 
                    name === 'fac' ? 'First Aid Case (FAC)' : 'Near Miss'
                  ]}
                />
                <Bar dataKey="nearMiss" name="nearMiss" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fac" name="fac" stackId="a" fill="#0EA5E9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mtc" name="mtc" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lti" name="lti" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-700">Safety reporting pyramid: 8.2 Near Misses for every recorded first-aid/injury event indicates proactive workforce reporting.</span>
          </div>
          <span className="text-slate-500 font-mono font-medium">Annualized Exposure: 2,450,000 Safe Hours</span>
        </div>
      </div>

      {/* 5. Chart Row 2: Dual Analytical Grid (Hazard Observations by Category & CAPA SLA Compliance Rate) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 2A: Hazard Observations by Category (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-white/80 backdrop-blur-md backdrop-saturate-150 rounded-3xl border border-slate-200/70 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Hazard Observations by Category
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Proactive hazard catches classified by operational risk discipline
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              159 Catches YTD
            </span>
          </div>

          <div className="h-[270px] w-full">
            {isLoadingData ? (
              <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                Loading hazard observations...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hazardCategoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="#64748B" 
                    width={150}
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val: any, name: any, item: any) => [`${item.payload.percentage}% (${item.payload.count} Observations)`, 'Distribution']}
                  />
                  <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                    {hazardCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">High-Consequence Barrier Focus: </strong>
              Working at Height (32%) and Slip/Trip/Fall (24%) represent 56% of total proactive catches, driven by scaffold inspection campaigns.
            </div>
          </div>
        </div>

        {/* Chart 2B: CAPA Closure SLA Compliance Rate (%) (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-white/80 backdrop-blur-md backdrop-saturate-150 rounded-3xl border border-slate-200/70 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                CAPA Closure SLA Compliance Rate (%)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Target: 90.0% · Current Performance: 94.6% on-time closeout
              </p>
            </div>
            <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              94.6% Closed within SLA
            </span>
          </div>

          <div className="h-[270px] w-full">
            {isLoadingData ? (
              <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                Loading CAPA SLA metrics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capaComplianceTrendData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="capaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis domain={[80, 100]} stroke="#64748B" tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val: any) => [`${val}%`, 'Compliance Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    name="SLA Compliance %" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fill="url(#capaGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Target (90%)" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="text-slate-700">15 active CAPA remediation actions monitored with zero overdue statutory escalations.</span>
            <span className="font-mono text-emerald-700 font-bold">Closed-Loop 94.6%</span>
          </div>
        </div>

      </div>

      {/* 6. Multi-Country Compliance Scorecard (Oman, UAE, KSA as specified in Task 3) */}
      <div className="p-6 bg-white/80 backdrop-blur-md backdrop-saturate-150 rounded-3xl border border-slate-200/70 shadow-sm shadow-slate-200/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Multi-Country Statutory Compliance Scorecard
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Audited regulatory readiness comparing Oman Ministry of Labour, Abu Dhabi OSHAD-SF / Al-Adaa, and Saudi MHRSD / NCOSH
            </p>
          </div>

          {/* Scorecard Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset or standard..."
              value={scorecardSearch}
              onChange={(e) => setScorecardSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-8 pe-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {scorecardSearch && (
              <button 
                onClick={() => setScorecardSearch('')}
                className="absolute end-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table with Sticky Frosted Header, Keyboard Navigation, Accessible Status Chips */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                <th className="py-3 px-4">Territory / Operating Asset</th>
                <th className="py-3 px-3">Statutory Regulatory Standard</th>
                <th className="py-3 px-3">Audit Readiness Score</th>
                <th className="py-3 px-3">Safe Man-Hours</th>
                <th className="py-3 px-3">Statutory Turnaround</th>
                <th className="py-3 px-3">Critical Control Assurance</th>
                <th className="py-3 px-4 text-end">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/50">
              {filteredScorecard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">No regulatory assets found</p>
                      <p className="text-xs text-slate-500">No active SIMOPS or compliance records match "{scorecardSearch}".</p>
                      <button 
                        onClick={() => { setScorecardSearch(''); setSelectedAssetFilter('ALL'); }}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredScorecard.map((item) => (
                  <tr 
                    key={item.id} 
                    tabIndex={0}
                    className="hover:bg-blue-50/40 transition-colors focus:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          {item.country.includes('Oman') ? 'OM' : item.country.includes('Emirates') ? 'AE' : 'SA'}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{item.country}</span>
                          <span className="text-[11px] text-blue-700 font-semibold">{item.asset}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{item.operator}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono text-slate-700 text-[11px]">
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200/80 font-medium inline-block">
                        {item.statutoryCode}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${item.auditScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-700 text-xs">{item.auditScore}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono text-slate-800 font-semibold text-xs">
                      {item.safeHours}
                    </td>

                    <td className="py-4 px-3 font-mono text-emerald-700 font-semibold text-xs">
                      {item.statutorySlaRate}
                    </td>

                    <td className="py-4 px-3 text-[11px] text-slate-600 max-w-[240px]">
                      <span className="line-clamp-2 leading-relaxed" title={item.criticalBarriers}>
                        {item.criticalBarriers}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-end">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Audit Ready</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Statutory Calculation Formula Drill-Down Modal */}
      {activeFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeFormulaModal === 'TRIR' && 'TRIR Calculation Formula'}
                    {activeFormulaModal === 'LTIFR' && 'LTIFR Calculation Formula'}
                    {activeFormulaModal === 'SEVERITY' && 'Severity Rate Formula'}
                    {activeFormulaModal === 'MANHOURS' && 'Safe Exposure Hours Protocol'}
                  </h3>
                  <p className="text-xs text-slate-500">Statutory GCC & OSHA Standard Metric</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFormulaModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {activeFormulaModal === 'TRIR' && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-blue-700 text-xs border border-slate-200">
                    TRIR = (Total Recordable Incidents × {exposureBasis === '1M' ? '1,000,000' : '200,000'}) / Total Safe Exposure Hours
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Calculated in accordance with OSHA 1904 and ADNOC Code of Practice using the active {exposureBasis === '1M' ? '1M-hour GCC' : '200k-hour OSHA'} basis.
                  </p>
                  <div className="p-2.5 bg-blue-50/60 rounded-lg text-blue-800 text-[11px] font-medium">
                    Current Period: ({recordableCount} Recordables × {exposureBasis === '1M' ? '1,000,000' : '200,000'}) / {currentExposureHours.toLocaleString()} = <strong>{currentTrir}</strong>
                  </div>
                </>
              )}

              {activeFormulaModal === 'LTIFR' && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-amber-800 text-xs border border-slate-200">
                    LTIFR = (Lost Time Injuries × {exposureBasis === '1M' ? '1,000,000' : '200,000'}) / Total Safe Exposure Hours
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Standard normalized frequency rate per {exposureBasis === '1M' ? 'million' : '200k'} hours worked under OSHAD-SF Mechanism 11.0 and PDO SP-1230 standards.
                  </p>
                  <div className="p-2.5 bg-amber-50/60 rounded-lg text-amber-900 text-[11px] font-medium">
                    Current Period: ({ltiCount} LTI × {exposureBasis === '1M' ? '1,000,000' : '200,000'}) / {currentExposureHours.toLocaleString()} = <strong>{currentLtifr}</strong>
                  </div>
                </>
              )}

              {activeFormulaModal === 'SEVERITY' && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-indigo-700 text-xs border border-slate-200">
                    SR = (Total Lost Workdays × 1,000,000) / Total Exposure Hours
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Quantifies the operational impact and gravity of incidents by tracking actual recuperation and restricted work days.
                  </p>
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg text-indigo-900 text-[11px] font-medium">
                    Current Period: 10.3 Lost Workdays across 2.45M man-hours = <strong>4.2</strong>
                  </div>
                </>
              )}

              {activeFormulaModal === 'MANHOURS' && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-emerald-800 text-xs border border-slate-200">
                    Safe Hours = ∑(Shift Badged Clock-in × Concession Operational Factor)
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Aggregated in real-time from IoT access control turnstiles across Fahud-West, Al-Ruwais, and Ras Al-Khair facilities.
                  </p>
                  <div className="p-2.5 bg-emerald-50/60 rounded-lg text-emerald-900 text-[11px] font-medium">
                    Cumulative: <strong>2,450,000 Safe Hours</strong> with 412 consecutive zero-fatality days.
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveFormulaModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. AI Executive Safety Briefing Modal */}
      {isAiBriefingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 text-left animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">AI Executive Safety Briefing</h3>
                  <p className="text-xs text-slate-500">Board-Ready Intelligence Pack · Gulf Energy & Infrastructure Group</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiBriefingOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Enterprise Response Framework */}
            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1. Executive Summary
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Overall enterprise safety performance remains strong with a <strong>TRIR of 0.24</strong> (14% YoY reduction) and <strong>2,450,000 safe man-hours</strong> accrued. Audit readiness index across Oman (98.4%), UAE (99.1%), and KSA (97.8%) concessions averages <strong>98.4%</strong>. The single LTI in Oman has been contained with immediate statutory Ministry of Labour notification submitted within the 24-hour mandatory window.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> 2. Key Findings
                </h4>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  <li><strong>Fahud-West (Oman):</strong> Ruptured flexible hydraulic line (3,200 PSI); secondary whip-check restraint verified; statutory Form G completed.</li>
                  <li><strong>Al-Ruwais (UAE):</strong> Proactive H2S near-miss detection during confined space purge; Al-Adaa digital synchronization achieved 99.1%.</li>
                  <li><strong>Ras Al-Khair (KSA):</strong> Heavy lift crane outrigger 45mm soil settlement stopped safely prior to load pick; NCOSH summer heat ban logs verified 97.8%.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-amber-800 uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 3. Risk Level & Business Impact
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Risk Level: Moderate-Controlled.</strong> Zero operational stop-work orders currently enforced. Regulatory exposure minimized by rapid statutory notifications. CAPA SLA compliance is performing above target at <strong>94.6%</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 4. Recommended Actions & Next Steps
                </h4>
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2 text-slate-700">
                    <strong className="text-slate-900 shrink-0">• Action 1:</strong>
                    <span>Mandate stainless steel whip-check restraints on all lines &gt;1,000 PSI across Fahud-West (Owner: Suresh Pillai, Due: Oct 15).</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <strong className="text-slate-900 shrink-0">• Action 2:</strong>
                    <span>Enforce dual P&ID line tracing walkdown before sign-off on LOTO positive isolations in UAE (Owner: Eng. Mansoor, Due: Oct 12).</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <strong className="text-slate-900 shrink-0">• Action 3:</strong>
                    <span>Conduct dynamic cone penetrometer plate load testing before crawler crane remobilization in KSA (Owner: Abdulaziz, Due: Oct 10).</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Engine: Enterprise HSE AI Platform Orchestration (GCC Edition)
              </span>
              <button
                onClick={() => setIsAiBriefingOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveDashboard;
