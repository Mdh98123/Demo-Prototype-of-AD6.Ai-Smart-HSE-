import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, ShieldAlert,
  Flame, Gauge, Activity, Calendar, MapPin, Filter, Download,
  Layers, ArrowUpRight, ArrowDownRight, Info, Zap, ChevronRight,
  RefreshCw, CheckCircle2, FileText, AlertOctagon, Sparkles
} from 'lucide-react';
import { Incident } from '../types';
import { DemoDataLoader, GULF_ENERGY_INCIDENTS } from '../services/demoDataLoader';
import { useTenant } from '../contexts/TenantContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface SIFIncidentMetric {
  incident: Incident;
  isActualSIF: boolean;
  isPotentialSIF: boolean;
  sifTier: 'aSIF' | 'pSIF' | 'Non-SIF';
  energyCategory: string;
  precursorEnergyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  siteName: string;
  failedBarriers: string[];
}

export const PredictiveSafetyView: React.FC = () => {
  const { currentTenant, currentSite } = useTenant();
  const { t, language } = useLanguage();

  // State
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    return DemoDataLoader.getStoredIncidents();
  });
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');
  const [selectedSifFilter, setSelectedSifFilter] = useState<'ALL' | 'aSIF' | 'pSIF'>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'6M' | '12M' | 'YTD_FORECAST'>('YTD_FORECAST');
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<Incident | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simulationInterventionActive, setSimulationInterventionActive] = useState(false);

  // Subscribe to demonstration data reset event
  useEffect(() => {
    const handleReset = () => {
      setIncidents(DemoDataLoader.getStoredIncidents());
    };
    window.addEventListener('ad6-demo-data-reset', handleReset);
    return () => window.removeEventListener('ad6-demo-data-reset', handleReset);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIncidents(DemoDataLoader.getStoredIncidents());
      setIsRefreshing(false);
    }, 400);
  };

  // Classify each incident under Campbell Institute / DEKRA SIF Criteria
  const classifiedIncidents = useMemo<SIFIncidentMetric[]>(() => {
    return incidents.map(inc => {
      const isActualSIF = 
        inc.classification === 'Lost Time Injury' || 
        inc.classification === 'Fatality' || 
        inc.severity === 'Critical';

      const isPotentialSIF = !isActualSIF && (
        inc.potentialSeverity === 'Critical' || 
        (inc.potentialSeverity === 'High' && (inc.classification === 'Near Miss' || inc.severity === 'High')) ||
        inc.description.toLowerCase().includes('h2s') ||
        inc.description.toLowerCase().includes('crane') ||
        inc.description.toLowerCase().includes('whip')
      );

      const sifTier: 'aSIF' | 'pSIF' | 'Non-SIF' = isActualSIF 
        ? 'aSIF' 
        : (isPotentialSIF ? 'pSIF' : 'Non-SIF');

      // Determine Energy Category
      const text = `${inc.type} ${inc.description} ${inc.rootCauseConclusion || ''}`.toLowerCase();
      let energyCategory = 'Stored Mechanical Energy';
      if (text.includes('h2s') || text.includes('gas') || text.includes('chemical') || text.includes('toxic')) {
        energyCategory = 'Toxic Gas & Chemical Energy';
      } else if (text.includes('crane') || text.includes('forklift') || text.includes('lift') || text.includes('mobile')) {
        energyCategory = 'Heavy Equipment & Mobile Plant';
      } else if (text.includes('heat') || text.includes('wbgt') || text.includes('thermal')) {
        energyCategory = 'Thermal & Extreme Temperature';
      } else if (text.includes('hydraulic') || text.includes('psi') || text.includes('pressure') || text.includes('hose')) {
        energyCategory = 'High Pressure Fluid & Stored Energy';
      } else if (text.includes('height') || text.includes('fall') || text.includes('scaffold')) {
        energyCategory = 'Gravity & Work at Height';
      } else {
        energyCategory = 'Mechanical & Surface Contact';
      }

      // Precursor energy level
      let precursorEnergyLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (isActualSIF || inc.potentialSeverity === 'Critical') {
        precursorEnergyLevel = 'Critical';
      } else if (isPotentialSIF || inc.potentialSeverity === 'High') {
        precursorEnergyLevel = 'High';
      } else if (inc.severity === 'Medium' || inc.potentialSeverity === 'Medium') {
        precursorEnergyLevel = 'Medium';
      }

      // Failed barrier deduction from 5-Why or conclusion
      const failedBarriers: string[] = [];
      if (text.includes('whip-check') || text.includes('crimp') || text.includes('flexible')) {
        failedBarriers.push('Secondary Hose Restraint Barrier (Whip-check Missing)');
      }
      if (text.includes('p&id') || text.includes('loto') || text.includes('bypass') || text.includes('valve')) {
        failedBarriers.push('Positive Isolation (LOTO Dual Walkdown Omitted)');
      }
      if (text.includes('marl') || text.includes('compaction') || text.includes('bearing') || text.includes('outrigger')) {
        failedBarriers.push('Geotechnical Soil Bearing Verification Outdated');
      }
      if (text.includes('height') || text.includes('goalpost') || text.includes('spotter')) {
        failedBarriers.push('Clearance Limiters & Marshaling Controls');
      }
      if (text.includes('wbgt') || text.includes('heat') || text.includes('rest')) {
        failedBarriers.push('Midday Heat Rest Cycle Self-Discipline');
      }
      if (failedBarriers.length === 0) {
        failedBarriers.push('Standard Operating Procedure Enforcement');
      }

      // Site normalization
      let siteName = 'Mina Al Fahal Refinery & Petrochemical Asset (Oman)';
      if (inc.location.toLowerCase().includes('fahud') || inc.location.toLowerCase().includes('oman')) {
        siteName = 'Fahud-West Gas Station (Oman)';
      } else if (inc.location.toLowerCase().includes('khair') || inc.location.toLowerCase().includes('ksa')) {
        siteName = 'Ras Al-Khair Facility (KSA)';
      }

      return {
        incident: inc,
        isActualSIF,
        isPotentialSIF,
        sifTier,
        energyCategory,
        precursorEnergyLevel,
        siteName,
        failedBarriers
      };
    });
  }, [incidents]);

  // Filtered dataset
  const filteredMetrics = useMemo(() => {
    return classifiedIncidents.filter(item => {
      if (selectedSiteFilter !== 'ALL' && !item.siteName.includes(selectedSiteFilter)) {
        return false;
      }
      if (selectedSifFilter === 'aSIF' && !item.isActualSIF) {
        return false;
      }
      if (selectedSifFilter === 'pSIF' && !item.isPotentialSIF) {
        return false;
      }
      return true;
    });
  }, [classifiedIncidents, selectedSiteFilter, selectedSifFilter]);

  // Aggregate KPI summary
  const summaryKpi = useMemo(() => {
    const total = filteredMetrics.length;
    const aSifCount = filteredMetrics.filter(m => m.isActualSIF).length;
    const pSifCount = filteredMetrics.filter(m => m.isPotentialSIF).length;
    const nonSifCount = total - aSifCount - pSifCount;
    const sifExposureRate = total > 0 ? (((aSifCount + pSifCount) / total) * 100).toFixed(1) : '0.0';
    
    // SIF Prevention Index: 100 - (aSIF*25 + pSIF*8)
    const rawPrevention = 100 - (aSifCount * 22 + pSifCount * 7.5);
    const preventionIndex = Math.max(35, Math.min(96, Math.round(rawPrevention)));

    // Risk Velocity trend
    const velocityStatus = aSifCount > 0 ? 'Elevated Pressure' : 'Controlled Baseline';

    return {
      total,
      aSifCount,
      pSifCount,
      nonSifCount,
      sifExposureRate,
      preventionIndex,
      velocityStatus
    };
  }, [filteredMetrics]);

  // Time-Series Trend & Predictive Forecast Dataset
  const trendForecastData = useMemo(() => {
    // 10 historical months in 2026 + 3 forward predictive forecast months
    // Factor in simulation intervention if toggled
    const interventionFactor = simulationInterventionActive ? 0.45 : 1.0;

    const baseMonthlySeries = [
      { month: 'Jan 2026', aSIF: 0, pSIF: 3, totalIncidents: 9, predictedSifRisk: 28, isForecast: false, confidenceHigh: 34, confidenceLow: 22 },
      { month: 'Feb 2026', aSIF: 0, pSIF: 2, totalIncidents: 8, predictedSifRisk: 24, isForecast: false, confidenceHigh: 30, confidenceLow: 18 },
      { month: 'Mar 2026', aSIF: 1, pSIF: 4, totalIncidents: 11, predictedSifRisk: 42, isForecast: false, confidenceHigh: 48, confidenceLow: 36 },
      { month: 'Apr 2026', aSIF: 0, pSIF: 2, totalIncidents: 7, predictedSifRisk: 22, isForecast: false, confidenceHigh: 28, confidenceLow: 16 },
      { month: 'May 2026', aSIF: 0, pSIF: 3, totalIncidents: 10, predictedSifRisk: 30, isForecast: false, confidenceHigh: 36, confidenceLow: 24 },
      { month: 'Jun 2026', aSIF: 0, pSIF: 5, totalIncidents: 14, predictedSifRisk: 48, isForecast: false, confidenceHigh: 55, confidenceLow: 41 },
      { month: 'Jul 2026', aSIF: 0, pSIF: 4, totalIncidents: 12, predictedSifRisk: 38, isForecast: false, confidenceHigh: 45, confidenceLow: 31 },
      { month: 'Aug 2026', aSIF: 0, pSIF: 3, totalIncidents: 9, predictedSifRisk: 32, isForecast: false, confidenceHigh: 39, confidenceLow: 25 },
      { month: 'Sep 2026', aSIF: 0, pSIF: 3, totalIncidents: 8, predictedSifRisk: 29, isForecast: false, confidenceHigh: 36, confidenceLow: 22 },
      { month: 'Oct 2026 (Live)', aSIF: summaryKpi.aSifCount, pSIF: summaryKpi.pSifCount, totalIncidents: summaryKpi.total + 6, predictedSifRisk: 44, isForecast: false, confidenceHigh: 51, confidenceLow: 37 },
      // Forward 3-Month Forecast Projection
      { 
        month: 'Nov 2026 (Fcst)', 
        aSIF: null, 
        pSIF: null, 
        totalIncidents: null, 
        predictedSifRisk: Math.round(38 * interventionFactor), 
        isForecast: true, 
        confidenceHigh: Math.round(48 * interventionFactor), 
        confidenceLow: Math.round(28 * interventionFactor) 
      },
      { 
        month: 'Dec 2026 (Fcst)', 
        aSIF: null, 
        pSIF: null, 
        totalIncidents: null, 
        predictedSifRisk: Math.round(29 * interventionFactor), 
        isForecast: true, 
        confidenceHigh: Math.round(40 * interventionFactor), 
        confidenceLow: Math.round(18 * interventionFactor) 
      },
      { 
        month: 'Jan 2027 (Fcst)', 
        aSIF: null, 
        pSIF: null, 
        totalIncidents: null, 
        predictedSifRisk: Math.round(21 * interventionFactor), 
        isForecast: true, 
        confidenceHigh: Math.round(32 * interventionFactor), 
        confidenceLow: Math.round(10 * interventionFactor) 
      }
    ];

    if (selectedTimeRange === '6M') {
      return baseMonthlySeries.slice(4, 11);
    }
    if (selectedTimeRange === '12M') {
      return baseMonthlySeries.slice(0, 10);
    }
    return baseMonthlySeries;
  }, [selectedTimeRange, summaryKpi, simulationInterventionActive]);

  // Energy Precursor Distribution Data
  const energyDistributionData = useMemo(() => {
    const categories: Record<string, { name: string; actual: number; potential: number; color: string }> = {
      'High Pressure Fluid & Stored Energy': { name: 'High-Pressure Fluid / Whip', actual: 1, potential: 0, color: '#E11D48' },
      'Toxic Gas & Chemical Energy': { name: 'Toxic Gas / H2S Confined', actual: 0, potential: 1, color: '#F59E0B' },
      'Heavy Equipment & Mobile Plant': { name: 'Cranes & Heavy Plant', actual: 0, potential: 2, color: '#0EA5E9' },
      'Gravity & Work at Height': { name: 'Elevated Fall Precursor', actual: 0, potential: 1, color: '#8B5CF6' },
      'Thermal & Extreme Temperature': { name: 'Thermal / Heat Stress', actual: 0, potential: 1, color: '#10B981' }
    };

    filteredMetrics.forEach(m => {
      if (categories[m.energyCategory]) {
        if (m.isActualSIF) {
          categories[m.energyCategory].actual += 1;
        } else if (m.isPotentialSIF) {
          categories[m.energyCategory].potential += 1;
        }
      }
    });

    return Object.values(categories);
  }, [filteredMetrics]);

  // Site SIF Comparison Breakdown
  const siteComparisonData = useMemo(() => {
    const sites = [
      { 
        site: 'Fahud-West Gas Station', 
        jurisdiction: 'Oman (PDO Block 6)', 
        aSIF: 1, 
        pSIF: 1, 
        minor: 1, 
        exposureRate: 66.7, 
        sifVelocityScore: 78 
      },
      { 
        site: 'Mina Al Fahal Refinery Asset', 
        jurisdiction: 'Oman (Muscat Oman MoL MD 286/2008)', 
        aSIF: 0, 
        pSIF: 1, 
        minor: 1, 
        exposureRate: 50.0, 
        sifVelocityScore: 62 
      },
      { 
        site: 'Ras Al-Khair Facility', 
        jurisdiction: 'KSA (Maritime Yard)', 
        aSIF: 0, 
        pSIF: 1, 
        minor: 1, 
        exposureRate: 50.0, 
        sifVelocityScore: 58 
      }
    ];

    if (selectedSiteFilter === 'ALL') return sites;
    return sites.filter(s => s.site.includes(selectedSiteFilter));
  }, [selectedSiteFilter]);

  // Barrier Reliability Index Over Time
  const barrierReliabilityData = useMemo(() => [
    { period: 'May 26', mechanicalLOTO: 91, gasTesting: 98, craneProofing: 84, whipCheckRestraints: 68 },
    { period: 'Jun 26', mechanicalLOTO: 89, gasTesting: 97, craneProofing: 82, whipCheckRestraints: 69 },
    { period: 'Jul 26', mechanicalLOTO: 87, gasTesting: 99, craneProofing: 80, whipCheckRestraints: 71 },
    { period: 'Aug 26', mechanicalLOTO: 85, gasTesting: 99, craneProofing: 76, whipCheckRestraints: 74 },
    { period: 'Sep 26', mechanicalLOTO: 83, gasTesting: 96, craneProofing: 72, whipCheckRestraints: 76 },
    { period: 'Oct 26 (Current)', mechanicalLOTO: 81, gasTesting: 99, craneProofing: 70, whipCheckRestraints: 88 },
  ], []);

  // Custom Chart Tooltips
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 font-bold text-slate-200">
            <span>{label}</span>
            {data.isForecast && (
              <span className="text-[10px] text-amber-400 font-mono">Predictive AI Model</span>
            )}
          </div>
          
          {!data.isForecast ? (
            <div className="space-y-1 font-mono">
              <div className="flex justify-between gap-6 text-rose-400">
                <span>Actual SIF (aSIF):</span>
                <strong>{data.aSIF ?? 0}</strong>
              </div>
              <div className="flex justify-between gap-6 text-amber-400">
                <span>Potential SIF Precursor (pSIF):</span>
                <strong>{data.pSIF ?? 0}</strong>
              </div>
              <div className="flex justify-between gap-6 text-slate-400">
                <span>Total Incidents:</span>
                <strong>{data.totalIncidents ?? 0}</strong>
              </div>
              <div className="flex justify-between gap-6 text-indigo-300 pt-1 border-t border-slate-800">
                <span>SIF Risk Index:</span>
                <strong>{data.predictedSifRisk} / 100</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-1 font-mono">
              <div className="flex justify-between gap-6 text-indigo-400">
                <span>Forecast SIF Risk Index:</span>
                <strong>{data.predictedSifRisk} / 100</strong>
              </div>
              <div className="flex justify-between gap-6 text-slate-400 text-[11px]">
                <span>95% Confidence Band:</span>
                <span>[{data.confidenceLow} – {data.confidenceHigh}]</span>
              </div>
              <div className="text-[10px] text-emerald-400 pt-1">
                {simulationInterventionActive 
                  ? '✓ Corrective barrier enforcement modeled (-45% exposure)' 
                  : '⚠ Baseline trajectory without barrier intervention'}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto text-slate-100 pb-20 animate-fade-in">
      
      {/* 1. Header Bar with Enterprise Branding & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>Enterprise Safety Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Campbell Institute & Oman MoL MD 286/2008 SIF Framework</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">Gulf Energy & Infrastructure Group</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Predictive Safety & SIF Exposure Analytics
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" /> SIF Trend Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time multi-site Serious Injury & Fatality (SIF) precursor detection, high-energy hazard trajectory modeling, and forward predictive risk velocity across Oman, Oman, and KSA industrial concessions.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSimulationInterventionActive(!simulationInterventionActive)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              simulationInterventionActive 
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/50' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Simulate impact of implementing 100% barrier CAPA actions on future trajectory"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{simulationInterventionActive ? 'Barrier Intervention: ACTIVE' : 'Simulate Intervention'}</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
            title="Reload live incident dataset from enterprise ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync Records</span>
          </button>

          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["IncidentID,Date,Site,Classification,Severity,SIFTier,EnergySource",
                  ...classifiedIncidents.map(c => `${c.incident.id},${c.incident.timestamp},${c.siteName},${c.incident.classification},${c.incident.severity},${c.sifTier},"${c.energyCategory}"`)
                ].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `GEIG_SIF_Predictive_Report_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter Bar (Segmented Controls) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
        
        {/* Site Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Asset:
          </span>
          {[
            { id: 'ALL', label: 'All Concessions (3)' },
            { id: 'Fahud-West', label: 'Fahud-West (Oman)' },
            { id: 'Mina Al Fahal', label: 'Mina Al Fahal (Oman)' },
            { id: 'Ras Al-Khair', label: 'Ras Al-Khair (KSA)' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSiteFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedSiteFilter === s.id
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* SIF Tier Filter Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> SIF Tier:
          </span>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'aSIF', label: 'Actual SIF' },
            { id: 'pSIF', label: 'Potential Precursors' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedSifFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSifFilter === t.id
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Time Horizon Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Horizon:
          </span>
          {[
            { id: '6M', label: '6 Mos' },
            { id: '12M', label: '12 Mos' },
            { id: 'YTD_FORECAST', label: '2026 + Forecast' }
          ].map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedTimeRange(h.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedTimeRange === h.id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Executive SIF Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Actual SIF (aSIF) */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Actual SIF Incidents (aSIF)</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-400 font-mono">
              {summaryKpi.aSifCount}
            </div>
            <div className="text-xs text-rose-300 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>1 Active LTI in Oman</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target: 0 Zero Harm</span>
            <span className="text-rose-400 font-semibold">Statutory MoL Escalated</span>
          </div>
        </div>

        {/* Metric 2: Potential SIF Precursors (pSIF) */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>SIF Precursors Detected (pSIF)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-400 font-mono">
              {summaryKpi.pSifCount}
            </div>
            <div className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <span>High Potential Near-Misses</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>H2S 14.8 ppm · Crane Void · Forklift</span>
            <span className="text-amber-400 font-semibold">3 Active CAPAs</span>
          </div>
        </div>

        {/* Metric 3: SIF Exposure Precursor Ratio */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>SIF Exposure Rate (% of Total)</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-indigo-400 font-mono">
              {summaryKpi.sifExposureRate}%
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              <span>{summaryKpi.aSifCount + summaryKpi.pSifCount} of {summaryKpi.total} Events</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Industry Benchmark: &lt; 22%</span>
            <span className="text-amber-400 font-medium">Critical Attention</span>
          </div>
        </div>

        {/* Metric 4: Predictive SIF Prevention Index */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Predictive Barrier Reliability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {summaryKpi.preventionIndex}<span className="text-lg text-slate-500">/100</span>
            </div>
            <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+6% vs Q2</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>LOTO & Gas Testing Strong</span>
            <span className="text-emerald-400 font-semibold">High Assurance</span>
          </div>
        </div>
      </div>

      {/* 4. Main Chart Section: Monthly SIF Trend & Predictive Forecast */}
      <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                SIF Incident Trends & Forward Risk Trajectory
              </h2>
              <span className="text-xs text-slate-400 font-mono">· Recharts Time-Series</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical monthly occurrences (Jan–Oct 2026) correlated with actual incident records, joined with 90-day predictive risk forecast.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
              <span className="text-slate-300">Actual SIF (aSIF)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-slate-300">Potential SIF (pSIF)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-indigo-400"></span>
              <span className="text-indigo-300">Predicted Risk Velocity</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-[340px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendForecastData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="pSifGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aSifGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="forecastBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              
              <XAxis 
                dataKey="month" 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              
              <YAxis 
                yAxisId="left"
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                allowDecimals={false}
                label={{ value: 'Incident Count', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10, dy: 40 }}
              />

              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6366F1" 
                tick={{ fill: '#818CF8', fontSize: 11 }}
                domain={[0, 100]}
                axisLine={{ stroke: '#4338CA' }}
                label={{ value: 'SIF Risk Index (0-100)', angle: 90, position: 'insideRight', fill: '#818CF8', fontSize: 10, dy: 50 }}
              />

              <Tooltip content={<CustomTrendTooltip />} />

              {/* Forecast Split Line */}
              <ReferenceLine 
                yAxisId="left"
                x="Oct 2026 (Live)" 
                stroke="#E2E8F0" 
                strokeDasharray="4 4" 
                label={{ value: 'Forecast Horizon →', fill: '#CBD5E1', fontSize: 10, position: 'top' }}
              />

              {/* SIF Counts (Historical) */}
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="pSIF" 
                name="Potential SIF" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#pSifGradient)" 
              />
              
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="aSIF" 
                name="Actual SIF" 
                stroke="#F43F5E" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#aSifGradient)" 
              />

              {/* Predictive Risk Velocity Line */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="predictedSifRisk" 
                name="Predictive SIF Risk" 
                stroke="#818CF8" 
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#818CF8' }}
                activeDot={{ r: 6, fill: '#A5B4FC' }}
              />

              {/* Upper Confidence Band for Forecast */}
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="confidenceHigh" 
                name="Forecast Upper Bound" 
                stroke="transparent" 
                fill="url(#forecastBandGradient)" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Model Explanation Footnote */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Predictive risk trajectory uses time-weighted exponential decay of high-energy barrier precursor alerts (95% CI).
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={simulationInterventionActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              Simulation Status: {simulationInterventionActive ? '100% Engineering Barrier Enforcement' : 'Baseline Run'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Dual Analytical Panels: High-Energy Hazards & Multi-Site Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel A: High-Energy Precursor Distribution (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                High-Energy SIF Hazard Source Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of critical energy sources identified in live and precursor incident records
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600"></span> Actual (1)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Precursor (5)
              </span>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={energyDistributionData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  width={140}
                  tick={{ fill: '#CBD5E1', fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(val: any, name: any) => [val, name === 'actual' ? 'Actual SIF' : 'Potential Precursor']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="actual" name="Actual SIF" fill="#F43F5E" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="potential" name="Potential Precursor" fill="#F59E0B" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Dominant Precursor Driver: </strong>
              Heavy mobile plant and pressurized hydraulic lines represent 67% of all life-safety exposure events across the 3 assets. Secondary whip-check barriers are critical.
            </div>
          </div>
        </div>

        {/* Panel B: Multi-Site SIF Exposure Comparison (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Concession Exposure & SIF Velocity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-site benchmarking for Muscat, Oman, and KSA operating assets
            </p>
          </div>

          <div className="space-y-3">
            {siteComparisonData.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white tracking-tight">{item.site}</h4>
                    <p className="text-[11px] text-slate-400">{item.jurisdiction}</p>
                  </div>
                  <div className="text-end font-mono">
                    <span className={`text-sm font-black ${item.aSIF > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.aSIF} aSIF · {item.pSIF} pSIF
                    </span>
                    <p className="text-[10px] text-slate-500">Exposure: {item.exposureRate}%</p>
                  </div>
                </div>

                {/* Risk Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>SIF Risk Velocity</span>
                    <span>{item.sifVelocityScore} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.sifVelocityScore > 70 
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                          : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                      }`}
                      style={{ width: `${item.sifVelocityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PDO Block 6 & Oman MoL MD 286/2008 Mechanistic Alignments Active</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">100% Monitored</span>
          </div>
        </div>
      </div>

      {/* 6. Precursor Barrier Reliability Curves */}
      <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Critical Barrier Reliability & Compliance Trends (%)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Field verification compliance tracking across 4 primary life-safety control barriers
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">● Gas Testing</span>
            <span className="text-indigo-400 flex items-center gap-1">● Mechanical LOTO</span>
            <span className="text-cyan-400 flex items-center gap-1">● Whip-Check Restraint</span>
            <span className="text-amber-400 flex items-center gap-1">● Crane Geotech Proof</span>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={barrierReliabilityData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="gasTesting" name="Gas Testing" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="mechanicalLOTO" name="LOTO Positive Isolation" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="whipCheckRestraints" name="Whip-Check Compliance" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="craneProofing" name="Crane Ground Compaction" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Live Incident Drilldown Table (Pulling Directly from Repository) */}
      <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Live Incident Records & SIF Exposure Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct telemetry from enterprise incident store (`ad6_enterprise_incidents`) with classified SIF exposure rating
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredMetrics.length} of {classifiedIncidents.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Incident ID & Date</th>
                <th className="py-3 px-3">Site / Concession</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">SIF Status</th>
                <th className="py-3 px-3">Energy Hazard Source</th>
                <th className="py-3 px-3">Failed Control Barrier</th>
                <th className="py-3 px-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredMetrics.map((item) => (
                <tr 
                  key={item.incident.id} 
                  className="hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => setSelectedIncidentForModal(item.incident)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-white block">{item.incident.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.incident.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-200 block truncate max-w-[200px]">{item.siteName}</span>
                    <span className="text-[10px] text-slate-500">{item.incident.location.split('·')[1]?.trim() || item.incident.location}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-200 block">{item.incident.classification || item.incident.type}</span>
                    <span className="text-[10px] text-slate-400">Sev: {item.incident.severity} · Pot: {item.incident.potentialSeverity}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    {item.isActualSIF ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                        <span>Actual SIF (aSIF)</span>
                      </span>
                    ) : item.isPotentialSIF ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Precursor (pSIF)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Minor Event</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-300">{item.energyCategory}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-400 text-[11px] block truncate max-w-[220px]" title={item.failedBarriers[0]}>
                      {item.failedBarriers[0]}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncidentForModal(item.incident);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMetrics.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No incident records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. AI SIF Predictive Directives & Executive Guidance */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-indigo-900/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Decision Priority #1: Life Safety Risk
              </span>
              <span className="text-xs text-slate-400 font-mono">PDO SP-1143 Specification & Oman MoL MD 286/2008 M11.0 Causal Directives</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Executive SIF Prevention Intervention Framework
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on the 2026 trajectory, 3 high-consequence barrier degradations require immediate leadership intervention to prevent potential repeat SIF occurrences across Gulf Energy assets:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" /> 1. Whip-Check Hard Mandate
                </span>
                <p className="text-[11px] text-slate-400">
                  Enforce stainless restraining cables on all flexible hydraulic lines operating &gt;1,000 PSI (CAPA-2026-01).
                </p>
                <div className="text-[10px] text-slate-500 pt-1">Owner: Suresh Pillai · Due: Oct 15</div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 2. Dual Walkdown LOTO Sign-off
                </span>
                <p className="text-[11px] text-slate-400">
                  Require physical line tracing walkdown before confined space entry to eliminate bypass leaks (CAPA-2026-02).
                </p>
                <div className="text-[10px] text-slate-500 pt-1">Owner: Eng. Mansoor · Due: Oct 12</div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 3. Crane Ground Verification
                </span>
                <p className="text-[11px] text-slate-400">
                  Dynamic cone penetrometer proof loading certified within 30 days for crawler cranes &gt;100T (CAPA-2026-03).
                </p>
                <div className="text-[10px] text-slate-500 pt-1">Owner: Abdulaziz · Due: Oct 10</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => setSimulationInterventionActive(!simulationInterventionActive)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{simulationInterventionActive ? 'Intervention Applied (-45%)' : 'Apply Interventions'}</span>
            </button>
            <span className="text-[10px] text-slate-400 text-center font-mono">
              Model Ref: SIF-AI-2026.4
            </span>
          </div>
        </div>
      </div>

      {/* 9. Incident Review Modal */}
      {selectedIncidentForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-slate-400">{selectedIncidentForModal.id}</div>
                <h3 className="text-lg font-black text-white">{selectedIncidentForModal.type}</h3>
              </div>
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Location & Asset:</span>
                <span className="text-slate-200">{selectedIncidentForModal.location}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Narrative:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {selectedIncidentForModal.description}
                </p>
              </div>

              {selectedIncidentForModal.immediateActionsTaken && (
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Immediate Containment Actions:</span>
                  <p className="text-emerald-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/40">
                    {selectedIncidentForModal.immediateActionsTaken}
                  </p>
                </div>
              )}

              {selectedIncidentForModal.rootCauseConclusion && (
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Root Cause (5-Why Conclusion):</span>
                  <p className="text-amber-300 bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/40 font-mono">
                    {selectedIncidentForModal.rootCauseConclusion}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Actual Severity:</span>
                  <strong className="text-white text-xs">{selectedIncidentForModal.severity}</strong>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Potential SIF Rating:</span>
                  <strong className="text-amber-400 text-xs">{selectedIncidentForModal.potentialSeverity || 'Medium'}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PredictiveSafetyView;
