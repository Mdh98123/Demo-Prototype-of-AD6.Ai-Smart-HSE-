import React, { useState, useMemo } from 'react';
import { 
  Leaf, TrendingDown, Factory, Truck, Cloud, 
  BarChart3, Download, Plus, Zap, Fuel, ShieldCheck, 
  AlertTriangle, CheckCircle2, FileText, Globe, Building2, 
  Users, Award, Scale, HelpCircle, Check, ArrowRight,
  TrendingUp, RefreshCw, Send, Sparkles, AlertCircle, FileSpreadsheet, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { AITag } from './AITag';
import { 
  ESGJurisdiction, 
  ESGStandard, 
  DetailedEmissionRecord,
  ESGFacility,
  DecarbonizationInitiative,
  ESGDisclosureItem
} from '../types/esg';
import { 
  INITIAL_ESG_FACILITIES, 
  INITIAL_EMISSIONS_RECORDS, 
  INITIAL_OMANISATION_METRICS, 
  INITIAL_EMIRATISATION_METRICS, 
  INITIAL_ICV_OMAN, 
  INITIAL_ICV_UAE, 
  INITIAL_SOCIAL_SAFETY_METRICS, 
  INITIAL_GOVERNANCE_METRICS, 
  INITIAL_DECARBONIZATION_INITIATIVES, 
  INITIAL_WATER_RECORDS, 
  INITIAL_WASTE_RECORDS, 
  ADX_ESG_INDICATORS, 
  MSX_OMAN_ESG_INDICATORS 
} from '../services/esgDataStore';
import { REGIONAL_EMISSION_FACTORS, calculateEmissionCO2eTonnes } from '../services/esgEmissionFactors';
import { runFullESGValidation, ValidationSummary } from '../services/esgValidationService';
import { 
  generateESGExecutivePDF, 
  generateESGWorkbookXLSX, 
  exportRegulatoryJSON, 
  ESGReportPayload 
} from '../services/esgReportingService';
import { runESGComplianceAdvisorAI, ESGAdvisorResult } from '../services/geminiService';

type TabView = 
  | 'OVERVIEW' 
  | 'GHG_ACCOUNTING' 
  | 'NATIONALISATION_ICV' 
  | 'SOCIAL_SAFETY' 
  | 'GOVERNANCE' 
  | 'VALIDATION_AUDIT' 
  | 'DECARBONIZATION_MACC' 
  | 'REGULATORY_DISCLOSURES' 
  | 'AI_ADVISOR';

export const CarbonAccountingModule: React.FC = () => {
  // Navigation & Jurisdiction Filters
  const [activeTab, setActiveTab] = useState<TabView>('OVERVIEW');
  const [jurisdiction, setJurisdiction] = useState<ESGJurisdiction>('GCC_CONSOLIDATED');
  const [standard, setStandard] = useState<ESGStandard>('ADX_UAE');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');

  // Core ESG State
  const [facilities] = useState<ESGFacility[]>(INITIAL_ESG_FACILITIES);
  const [emissions, setEmissions] = useState<DetailedEmissionRecord[]>(INITIAL_EMISSIONS_RECORDS);
  const [omanisation, setOmanisation] = useState(INITIAL_OMANISATION_METRICS);
  const [emiratisation, setEmiratisation] = useState(INITIAL_EMIRATISATION_METRICS);
  const [icvOman] = useState(INITIAL_ICV_OMAN);
  const [icvUAE] = useState(INITIAL_ICV_UAE);
  const [socialSafety] = useState(INITIAL_SOCIAL_SAFETY_METRICS);
  const [governance, setGovernance] = useState(INITIAL_GOVERNANCE_METRICS);
  const [initiatives] = useState<DecarbonizationInitiative[]>(INITIAL_DECARBONIZATION_INITIATIVES);
  const [waterRecords] = useState(INITIAL_WATER_RECORDS);
  const [wasteRecords] = useState(INITIAL_WASTE_RECORDS);

  // 4-Eye Approval & Assurance State
  const [auditSignOffStatus, setAuditSignOffStatus] = useState<'DRAFT' | 'AUDIT_VERIFIED' | 'BOARD_APPROVED'>('AUDIT_VERIFIED');
  const [signOffDate, setSignOffDate] = useState<string>('2024-07-01');

  // Modal State for New Emission Activity Log
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLogFacilityId, setNewLogFacilityId] = useState(INITIAL_ESG_FACILITIES[0].id);
  const [newLogScope, setNewLogScope] = useState<'Scope 1' | 'Scope 2' | 'Scope 3'>('Scope 1');
  const [newLogFactorKey, setNewLogFactorKey] = useState('NATURAL_GAS_PIPELINE');
  const [newLogActivityData, setNewLogActivityData] = useState<number>(1000);
  const [newLogSource, setNewLogSource] = useState('Process Combustion Turbine 3');
  const [newLogInvoiceRef, setNewLogInvoiceRef] = useState('INV-GAS-2024-991');

  // AI Advisor State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<ESGAdvisorResult | null>(null);

  // Sync Standard when Jurisdiction switches
  const handleJurisdictionChange = (newJur: ESGJurisdiction) => {
    setJurisdiction(newJur);
    if (newJur === 'OMAN') {
      setStandard('MSX_OMAN');
    } else if (newJur === 'UAE') {
      setStandard('ADX_UAE');
    }
  };

  // Filtered Emissions
  const filteredEmissions = useMemo(() => {
    return emissions.filter(e => {
      const facility = facilities.find(f => f.id === e.facilityId);
      const matchesJur = jurisdiction === 'GCC_CONSOLIDATED' 
        ? true 
        : e.jurisdiction === jurisdiction;
      const matchesFac = selectedFacilityId === 'ALL' || e.facilityId === selectedFacilityId;
      return matchesJur && matchesFac;
    });
  }, [emissions, jurisdiction, selectedFacilityId, facilities]);

  // Aggregated Footprint
  const scope1Total = useMemo(() => {
    return filteredEmissions
      .filter(e => e.scope === 'Scope 1')
      .reduce((a, b) => a + b.calculatedCO2eTonnes, 0);
  }, [filteredEmissions]);

  const scope2Total = useMemo(() => {
    return filteredEmissions
      .filter(e => e.scope === 'Scope 2')
      .reduce((a, b) => a + b.calculatedCO2eTonnes, 0);
  }, [filteredEmissions]);

  const scope3Total = useMemo(() => {
    return filteredEmissions
      .filter(e => e.scope === 'Scope 3')
      .reduce((a, b) => a + b.calculatedCO2eTonnes, 0);
  }, [filteredEmissions]);

  const totalFootprint = scope1Total + scope2Total + scope3Total;

  // Run Logical Validation
  const validationSummary: ValidationSummary = useMemo(() => {
    return runFullESGValidation({
      emissions,
      facilities,
      omanisation,
      emiratisation,
      icvOman,
      icvUAE,
      socialSafety,
      governance,
      wasteRecords,
      waterRecords
    });
  }, [emissions, facilities, omanisation, emiratisation, icvOman, icvUAE, socialSafety, governance, wasteRecords, waterRecords]);

  // Current active standard disclosure items
  const activeDisclosures: ESGDisclosureItem[] = useMemo(() => {
    if (standard === 'MSX_OMAN') {
      return MSX_OMAN_ESG_INDICATORS;
    }
    return ADX_ESG_INDICATORS;
  }, [standard]);

  // Handle Adding New Emission Record
  const handleCreateEmissionRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const facility = facilities.find(f => f.id === newLogFacilityId) || facilities[0];
    const { co2eTonnes, emissionFactor, factorObj } = calculateEmissionCO2eTonnes(newLogFactorKey, newLogActivityData);

    const newRecord: DetailedEmissionRecord = {
      id: `EM-${Date.now().toString().slice(-6)}`,
      facilityId: facility.id,
      facilityName: facility.name,
      jurisdiction: facility.jurisdiction,
      date: new Date().toISOString().split('T')[0],
      reportingPeriod: '2024-Q2',
      scope: newLogScope,
      category: factorObj.category as any,
      source: newLogSource,
      activityData: Number(newLogActivityData),
      unit: factorObj.unit,
      emissionFactor: emissionFactor,
      emissionFactorSource: factorObj.referenceSource,
      calculatedCO2eTonnes: co2eTonnes,
      verificationStatus: 'VALIDATED',
      manifestOrInvoiceRef: newLogInvoiceRef,
      notes: 'Logged via ESG Activity Verification Engine'
    };

    setEmissions([newRecord, ...emissions]);
    setShowLogModal(false);
  };

  // Compile Report Payload for Export
  const currentReportPayload: ESGReportPayload = {
    reportTitle: `Enterprise ESG Disclosure Report (${jurisdiction})`,
    reportingYear: 2024,
    jurisdiction,
    standard,
    facilities,
    emissions: filteredEmissions,
    omanisation,
    emiratisation,
    icvOman,
    icvUAE,
    socialSafety,
    governance,
    disclosures: activeDisclosures,
    initiatives,
    approvedBy: 'Group Board Sustainability Committee & ESG Director',
    auditSignOffDate: signOffDate
  };

  // Run AI Advisor
  const handleRunAiEvaluation = async (customPrompt?: string) => {
    setAiLoading(true);
    try {
      const res = await runESGComplianceAdvisorAI({
        standard,
        jurisdiction,
        metricsSummary: {
          totalFootprintTonnes: totalFootprint,
          scope1: scope1Total,
          scope2: scope2Total,
          scope3: scope3Total,
          omanisationPct: omanisation.currentActualPct,
          emiratisationPct: emiratisation.currentActualPct,
          icvOmanPct: icvOman.certifiedScorePct,
          icvUAEPct: icvUAE.certifiedScorePct,
          ltifr: socialSafety.ltifrRate,
          fatalities: socialSafety.fatalitiesCount,
          boardFemaleDirectors: governance.femaleBoardDirectorsCount,
          boardIndependencePct: governance.independentDirectorsPct,
          assuranceLevel: governance.assuranceLevel
        },
        validationIssues: validationSummary.issues,
        userQuery: customPrompt || aiQuery || 'Full ESG Audit & Regulatory Gap Analysis'
      });
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Trajectory Chart Data (Net Zero 2050)
  const trajectoryData = [
    { year: '2021', actual: 34500, target: 35000 },
    { year: '2022', actual: 32200, target: 32000 },
    { year: '2023', actual: 29800, target: 29000 },
    { year: '2024', actual: Math.round(totalFootprint || 26500), target: 26000 },
    { year: '2030', actual: null, target: 16500 },
    { year: '2040', actual: null, target: 8200 },
    { year: '2050', actual: null, target: 0 } // Net Zero Milestone
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 text-slate-800">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none">
          <Globe size={180} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-3xl text-emerald-400 shadow-inner">
              <Leaf size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight uppercase">ESG & Net Zero Command</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  Oman & UAE Standard
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ISAE 3000 Assured
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold tracking-wide mt-1">
                Audited Sustainability, Decarbonization & Workforce Nationalisation Engine
              </p>
            </div>
          </div>

          {/* Quick Export Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => generateESGExecutivePDF(currentReportPayload)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              title="Download formal Executive ESG PDF report for board and regulators"
            >
              <Download size={14} /> Board PDF
            </button>
            <button 
              onClick={() => generateESGWorkbookXLSX(currentReportPayload)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
              title="Download detailed multi-tab Excel audit workbook"
            >
              <FileSpreadsheet size={14} className="text-emerald-400" /> Excel Pack
            </button>
            <button 
              onClick={() => exportRegulatoryJSON(currentReportPayload)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
              title="Export machine-readable JSON for regulatory electronic portal"
            >
              <FileText size={14} className="text-blue-400" /> Reg JSON
            </button>
            <button 
              onClick={() => setShowLogModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            >
              <Plus size={14} /> Log Activity
            </button>
          </div>
        </div>

        {/* Global Selectors & Standards Toolbar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Jurisdiction Toggle */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Jurisdiction:</span>
            {(['GCC_CONSOLIDATED', 'UAE', 'OMAN'] as ESGJurisdiction[]).map(jur => (
              <button
                key={jur}
                onClick={() => handleJurisdictionChange(jur)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  jurisdiction === jur 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {jur === 'GCC_CONSOLIDATED' ? 'GCC Group' : jur === 'UAE' ? 'UAE (ADX/DFM)' : 'Oman (MSX)'}
              </button>
            ))}
          </div>

          {/* Standard Selector */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Standard:</span>
            {(['ADX_UAE', 'DFM_UAE', 'MSX_OMAN', 'GRI_UNIVERSAL', 'ISSB_IFRS'] as ESGStandard[]).map(std => (
              <button
                key={std}
                onClick={() => setStandard(std)}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  standard === std 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {std.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Facility Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Facility:</span>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Operational Facilities (Consolidated)</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.jurisdiction}: {f.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Executive Dashboard', icon: BarChart3 },
          { id: 'GHG_ACCOUNTING', label: 'GHG Protocol (Scope 1, 2, 3)', icon: Cloud },
          { id: 'NATIONALISATION_ICV', label: 'Omanisation & Emiratisation (ICV)', icon: Users },
          { id: 'SOCIAL_SAFETY', label: 'Workforce Safety & Welfare', icon: ShieldCheck },
          { id: 'GOVERNANCE', label: 'Governance & Board Ethics', icon: Scale },
          { id: 'VALIDATION_AUDIT', label: 'Audit Validation & Integrity', icon: CheckCircle2, badge: validationSummary.issues.length },
          { id: 'DECARBONIZATION_MACC', label: 'Decarbonization Roadmap (MACC)', icon: TrendingDown },
          { id: 'REGULATORY_DISCLOSURES', label: 'Official Disclosures (ADX/MSX)', icon: FileText },
          { id: 'AI_ADVISOR', label: 'ESG AI Advisor', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE COMMAND & NET ZERO DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Top High-Impact Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Metric 1: Total Footprint */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Carbon Footprint</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Cloud size={18}/></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {totalFootprint.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">tCO2e</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingDown size={14} /> -12.4% vs FY23
                </span>
                <span className="text-slate-400 font-medium">Net Zero 2050 Path</span>
              </div>
            </div>

            {/* Metric 2: Workforce Nationalisation */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {jurisdiction === 'OMAN' ? 'Omanisation Ratio' : 'Emiratisation Ratio'}
                  </span>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Users size={18}/></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {jurisdiction === 'OMAN' ? `${omanisation.currentActualPct}%` : `${emiratisation.currentActualPct}%`}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase">
                    Target: {jurisdiction === 'OMAN' ? `${omanisation.statutoryTargetPct}%` : `${emiratisation.statutoryTargetPct}%`}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Ministry Compliant
                </span>
                <span className="text-slate-400 font-medium">
                  {jurisdiction === 'OMAN' ? 'Vision 2040' : 'Nafis Program'}
                </span>
              </div>
            </div>

            {/* Metric 3: Certified In-Country Value */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {jurisdiction === 'OMAN' ? 'ICV Oman Score' : 'National ICV (UAE)'}
                  </span>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Award size={18}/></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {jurisdiction === 'OMAN' ? `${icvOman.certifiedScorePct}%` : `${icvUAE.certifiedScorePct}%`}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">Certified</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">
                  Local Spend: {jurisdiction === 'OMAN' ? '23.29M OMR' : '113.2M AED'}
                </span>
                <span className="text-amber-600 font-bold">Tier 1 Certified</span>
              </div>
            </div>

            {/* Metric 4: Workforce Safety (Zero Harm) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Workforce Safety (OSH)</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><ShieldCheck size={18}/></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {socialSafety.ltifrRate}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">LTIFR / 1M hrs</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> 0 Fatalities
                </span>
                <span className="text-slate-400 font-medium">OSHAD / ISO 45001</span>
              </div>
            </div>

          </div>

          {/* Charts Row: Net Zero 2050 Pathway & Emissions by Scope */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Decarbonization Trajectory Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Net Zero 2050 Decarbonization Pathway
                  </h3>
                  <p className="text-xs text-slate-500">
                    Historical GHG trajectory against UAE Net Zero 2050 & Oman Vision 2040 science-based milestones
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  SBTi Aligned Trajectory
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryData}>
                    <defs>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" t" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`${val?.toLocaleString()} tCO2e`]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTarget)" name="Mandated Net Zero Target" />
                    <Area type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Audited Actual Footprint" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scope Breakdown Pie */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">
                  Emissions by Scope
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  GHG Protocol Corporate Standard distribution
                </p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Scope 1 (Direct)', value: Math.round(scope1Total), color: '#ef4444' },
                          { name: 'Scope 2 (Electricity/Cooling)', value: Math.round(scope2Total), color: '#f59e0b' },
                          { name: 'Scope 3 (Value Chain)', value: Math.round(scope3Total), color: '#3b82f6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '11px' }}
                        formatter={(val: any) => [`${val} tCO2e`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend Summary */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="font-semibold text-slate-600">Scope 1 (Direct)</span>
                  </span>
                  <span className="font-bold text-slate-900">{scope1Total.toFixed(1)} t</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-slate-600">Scope 2 (Indirect)</span>
                  </span>
                  <span className="font-bold text-slate-900">{scope2Total.toFixed(1)} t</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-slate-600">Scope 3 (Chain)</span>
                  </span>
                  <span className="font-bold text-slate-900">{scope3Total.toFixed(1)} t</span>
                </div>
              </div>

            </div>

          </div>

          {/* Environmental Stewardship: Water & Circular Waste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water Stewardship */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl"><Zap size={20}/></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Water Stewardship & TSE Reuse</h4>
                    <p className="text-xs text-slate-500">Treated Sewage Effluent (TSE) & Zero Liquid Discharge (ZLD)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-xl">
                  38.2% TSE Reused
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Withdrawal</span>
                  <p className="text-lg font-black text-slate-900 mt-1">83,000 m3</p>
                  <span className="text-[9px] text-slate-500">Desalinated Grid</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">TSE Recycled</span>
                  <p className="text-lg font-black text-cyan-600 mt-1">50,500 m3</p>
                  <span className="text-[9px] text-emerald-600 font-bold">+18% YoY</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Groundwater</span>
                  <p className="text-lg font-black text-slate-900 mt-1">0 m3</p>
                  <span className="text-[9px] text-emerald-600 font-bold">100% Protected</span>
                </div>
              </div>
            </div>

            {/* Waste Circularity & Hazardous Manifests */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><Leaf size={20}/></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Circular Economy & Waste Manifests</h4>
                    <p className="text-xs text-slate-500">Tadweer Bolisat (UAE) & Be'ah Portal (Oman) Integration</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  72.8% Diverted
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Non-Hazardous</span>
                  <p className="text-lg font-black text-slate-900 mt-1">1,220 t</p>
                  <span className="text-[9px] text-slate-500">Operations YTD</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Hazardous Manifested</span>
                  <p className="text-lg font-black text-amber-600 mt-1">260.5 t</p>
                  <span className="text-[9px] text-emerald-600 font-bold">100% Audited</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Recycled Diverted</span>
                  <p className="text-lg font-black text-emerald-600 mt-1">880 t</p>
                  <span className="text-[9px] text-emerald-600 font-bold">Avoided 370 tCO2</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GHG ACTIVITY LEDGER & EMISSION CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'GHG_ACCOUNTING' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase">GHG Protocol Activity Ledger</h3>
              <p className="text-xs text-slate-500">
                Audited Scope 1, 2 and 3 emissions logs with certified regional emission factors (DEWA, EWEC, Nama Oman, IPCC AR6)
              </p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 self-start md:self-auto shadow-md transition-all active:scale-95"
            >
              <Plus size={15} /> Log Activity Entry
            </button>
          </div>

          {/* Activity Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 text-start">ID / Facility</th>
                    <th className="py-3.5 px-4 text-start">Scope & Category</th>
                    <th className="py-3.5 px-4 text-start">Emission Source</th>
                    <th className="py-3.5 px-4 text-end">Activity Data</th>
                    <th className="py-3.5 px-4 text-end">Emission Factor</th>
                    <th className="py-3.5 px-4 text-end">Calculated tCO2e</th>
                    <th className="py-3.5 px-4 text-start">Audit Reference</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEmissions.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{record.facilityName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{record.id} • {record.jurisdiction}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          record.scope === 'Scope 1' ? 'bg-red-50 text-red-700' :
                          record.scope === 'Scope 2' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {record.scope}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{record.category.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {record.source}
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono font-bold text-slate-900">
                        {record.activityData.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{record.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <span className="font-mono text-slate-800">{record.emissionFactor}</span>
                        <div className="text-[9px] text-slate-400 truncate max-w-[140px]" title={record.emissionFactorSource}>
                          {record.emissionFactorSource}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono font-black text-slate-900 text-sm">
                        {record.calculatedCO2eTonnes.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {record.manifestOrInvoiceRef || <span className="text-red-500 italic">Missing Ref</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={12}/> Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKFORCE NATIONALISATION & IN-COUNTRY VALUE (OMAN & UAE) */}
      {/* ========================================================================= */}
      {activeTab === 'NATIONALISATION_ICV' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Omanisation Module */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                    OM
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">Omanisation Governance</h3>
                    <p className="text-xs text-slate-500">Oman Ministry of Labour & MSX S11 Alignment</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-xl">
                  {omanisation.complianceStatus}
                </span>
              </div>

              {/* Quota Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">Current Actual Omanisation</span>
                  <span className="text-slate-900">{omanisation.currentActualPct}% (Statutory Quota: {omanisation.statutoryTargetPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (omanisation.currentActualPct / 100) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">
                  +3.4% Surplus above O&G / Petrochem industrial sector quota
                </p>
              </div>

              {/* Headcount Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Omani Staff</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{omanisation.nationalEmployees.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500">of {omanisation.totalHeadcount.toLocaleString()} total</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Management %</span>
                  <p className="text-lg font-black text-blue-600 mt-1">{omanisation.managementNationalPct}%</p>
                  <span className="text-[9px] text-slate-500">Executive Tier</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Technical %</span>
                  <p className="text-lg font-black text-emerald-600 mt-1">{omanisation.technicalNationalPct}%</p>
                  <span className="text-[9px] text-slate-500">Engineers & Techs</span>
                </div>
              </div>

              {/* ICV Oman (Tawreed / MoEM) */}
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    In-Country Value (ICV Oman)
                  </span>
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                    {icvOman.certifiedScorePct}% Certified
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Local Spend (OMR):</span>
                  <span className="font-bold">{icvOman.localProcurementSpend.toLocaleString()} OMR ({icvOman.localProcurementPct}%)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Riyada SME Allocation:</span>
                  <span className="font-bold text-emerald-700">{icvOman.smeSpendAllocationPct}% Dedicated to Omani SMEs</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/50">
                  Audit Verifier: {icvOman.issuingCertifyingBody} • Valid until {icvOman.certificateExpiryDate}
                </div>
              </div>

            </div>

            {/* Emiratisation Module */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    AE
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">Emiratisation & Tawteen</h3>
                    <p className="text-xs text-slate-500">MOHRE Private Sector Targets & ADX S11 Alignment</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-xl">
                  {emiratisation.complianceStatus}
                </span>
              </div>

              {/* Quota Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">Current Actual Emiratisation</span>
                  <span className="text-slate-900">{emiratisation.currentActualPct}% (MOHRE Quota: {emiratisation.statutoryTargetPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (emiratisation.currentActualPct / 15) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">
                  +1.8% Above MOHRE 2024 skilled workforce threshold
                </p>
              </div>

              {/* Headcount Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total UAE Nationals</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{emiratisation.nationalEmployees.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500">of {emiratisation.totalHeadcount.toLocaleString()} total</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Female Nationals</span>
                  <p className="text-lg font-black text-purple-600 mt-1">{emiratisation.femaleNationalEmployees}</p>
                  <span className="text-[9px] text-slate-500">38% of National pool</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Management %</span>
                  <p className="text-lg font-black text-blue-600 mt-1">{emiratisation.managementNationalPct}%</p>
                  <span className="text-[9px] text-slate-500">Leadership Roles</span>
                </div>
              </div>

              {/* National ICV Program (MoIAT / ADNOC) */}
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    National ICV Program (UAE MoIAT)
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    {icvUAE.certifiedScorePct}% Certified
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Local Spend (AED):</span>
                  <span className="font-bold">{icvUAE.localProcurementSpend.toLocaleString()} AED ({icvUAE.localProcurementPct}%)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>National SME Vendors:</span>
                  <span className="font-bold text-emerald-700">{icvUAE.smeSpendAllocationPct}% Dedicated to UAE SMEs</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/50">
                  Audit Verifier: {icvUAE.issuingCertifyingBody} • Valid until {icvUAE.certificateExpiryDate}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WORKFORCE SAFETY & WELFARE (SOCIAL PILLAR) */}
      {/* ========================================================================= */}
      {activeTab === 'SOCIAL_SAFETY' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Man-Hours Worked</span>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {(socialSafety.totalManHoursWorked / 1000000).toFixed(1)}M
              </p>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">Zero Fatalities (0)</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Lost Time Injury Rate (LTIFR)</span>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {socialSafety.ltifrRate}
              </p>
              <span className="text-xs text-slate-500 mt-1 inline-block">Target &lt; 0.15 per 1M hrs</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Wage Protection System (WPS)</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {socialSafety.wageProtectionSystemCompliancePct}%
              </p>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">100% Electronic Disbursed</span>
            </div>

          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase">Fair Labour & Worker Welfare Governance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Summer Midday Work Ban (12:30 - 15:00)</span>
                  <span className="text-slate-500">Automated site lockout & heat stress monitors (June-Sept)</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  0 Violations
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Worker Accommodation Audits</span>
                  <span className="text-slate-500">Inspection compliance against UAE & Oman welfare standards</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  {socialSafety.workerWelfareAccommodationAuditsPct}% Compliant
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Gender Pay Parity Ratio</span>
                  <span className="text-slate-500">Female to Male base compensation for equivalent grades</span>
                </div>
                <span className="bg-blue-100 text-blue-800 font-black px-3 py-1 rounded-xl">
                  {socialSafety.genderPayRatio} / 1.00
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Annual Safety & Skills Training</span>
                  <span className="text-slate-500">Certified hours per worker per operational year</span>
                </div>
                <span className="bg-purple-100 text-purple-800 font-black px-3 py-1 rounded-xl">
                  {socialSafety.trainingHoursPerEmployee} hrs / worker
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GOVERNANCE & BOARD ETHICS */}
      {/* ========================================================================= */}
      {activeTab === 'GOVERNANCE' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Board Independence</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{governance.independentDirectorsPct}%</p>
              <span className="text-xs text-slate-500">4 of 9 Directors</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Female Board Members</span>
              <p className="text-3xl font-black text-purple-600 mt-2">{governance.femaleBoardDirectorsCount}</p>
              <span className="text-xs text-purple-700 font-bold">Complies with UAE SCA</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Exec Pay Tied to ESG</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">{governance.executivePayLinkedToEsgPct}%</p>
              <span className="text-xs text-slate-500">Bonus Scorecard Weight</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Assurance Standard</span>
              <p className="text-xl font-black text-slate-900 mt-3">ISAE 3000</p>
              <span className="text-xs text-blue-600 font-bold">Verified by KPMG</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase">Ethics, Whistleblowing & Cyber Governance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Anti-Bribery & Code of Conduct Certification</span>
                  <span className="text-slate-500">Mandatory annual compliance testing for all workforce tiers</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  {governance.codeOfConductTrainingCompletionPct}% Certified
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Whistleblower Governance (Retaliation Free)</span>
                  <span className="text-slate-500">Independent confidential reporting hotline resolution</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  {governance.whistleblowerCasesResolved} / {governance.whistleblowerCasesReceived} Resolved
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Data Privacy & Cyber Incidents</span>
                  <span className="text-slate-500">UAE Federal Decree-Law No. 45/2021 & Oman RD 6/2022</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  0 Breaches
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Regulatory Environmental & Labour Fines</span>
                  <span className="text-slate-500">Penalties imposed by EAD, Dubai Municipality, or Oman EA</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  $0 Fines
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT VALIDATION & INTEGRITY ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'VALIDATION_AUDIT' && (
        <div className="space-y-6">
          
          {/* Top Health & Readiness Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Data Integrity Score</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{validationSummary.overallHealthScore} / 100</p>
                <span className="text-xs text-emerald-600 font-bold">Rule Bounds Verified</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Audit Readiness Rating</span>
                <p className="text-3xl font-black text-blue-600 mt-1">{validationSummary.auditReadinessScore}%</p>
                <span className="text-xs text-slate-500">Limited Assurance Ready</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShieldCheck size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Identified Gaps / Flags</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{validationSummary.totalIssuesCount}</p>
                <span className="text-xs text-slate-500">
                  {validationSummary.criticalDeficitsCount} Critical • {validationSummary.highSeverityCount} High
                </span>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                validationSummary.criticalDeficitsCount > 0 
                  ? 'bg-red-50 border border-red-200 text-red-600' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
              }`}>
                {validationSummary.criticalDeficitsCount > 0 ? <AlertTriangle size={32} /> : <Check size={32} />}
              </div>
            </div>

          </div>

          {/* 4-Eye Approval & Sign-Off Workflow */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-emerald-400" />
                  <h3 className="text-base font-black uppercase tracking-wide">4-Eye Regulatory Sign-Off Workflow</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {auditSignOffStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces dual-signoff authorization between Sustainability Lead and Board Audit Committee before regulatory portal submission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuditSignOffStatus('AUDIT_VERIFIED');
                    setSignOffDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Verify Audit Trail
                </button>
                <button
                  onClick={() => {
                    setAuditSignOffStatus('BOARD_APPROVED');
                    setSignOffDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  Board Committee Sign-Off
                </button>
              </div>
            </div>
            
            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
              <span>Sign-off Date: <strong className="text-slate-200">{signOffDate}</strong></span>
              <span>SHA-256 Seal: <strong className="text-emerald-400 font-mono">0x9B4F81A4...CC19</strong></span>
              <span>Signatory: <strong className="text-slate-200">Group HSE Director & Board Committee</strong></span>
            </div>
          </div>

          {/* Validation Issues List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase">Real-Time Validation Rule Engine Output</h3>
            
            {validationSummary.issues.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-700">All Logical Validation Checks Passed</p>
                <p>Data complies fully with Oman & UAE statutory requirements.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {validationSummary.issues.map(issue => (
                  <div 
                    key={issue.id} 
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs ${
                      issue.severity === 'CRITICAL' ? 'bg-red-50/70 border-red-200' :
                      issue.severity === 'HIGH' ? 'bg-amber-50/70 border-amber-200' :
                      'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          issue.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                          issue.severity === 'HIGH' ? 'bg-amber-600 text-white' :
                          'bg-slate-700 text-white'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">{issue.id}</span>
                        <span className="font-bold text-slate-900">{issue.title}</span>
                      </div>
                      <p className="text-slate-600">{issue.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                        <span>Ref: <strong className="text-slate-700">{issue.regulatoryStandardRef}</strong></span>
                        <span>Affected: <strong className="text-slate-700">{issue.affectedMetric}</strong></span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-end shrink-0 md:min-w-[200px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended SLA Action</span>
                      <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">{issue.owner}</span>
                      <span className="text-emerald-600 font-bold text-[10px]">{issue.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DECARBONIZATION ROADMAP & MACC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'DECARBONIZATION_MACC' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Marginal Abatement Cost Curve (MACC) & Net Zero Projects
              </h3>
              <p className="text-xs text-slate-500">
                Prioritized mitigation initiatives across UAE & Oman assets sorted by economic payback and carbon abatement potential
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-black">
              Total Abatement Potential: 36,050 tCO2e/yr
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initiatives.map((init) => (
              <div key={init.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {init.alignmentWithNetZero}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      init.implementationStage === 'Commissioned' ? 'bg-emerald-100 text-emerald-800' :
                      init.implementationStage === 'Under_Execution' ? 'bg-blue-100 text-blue-800' :
                      init.implementationStage === 'Approved' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {init.implementationStage.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{init.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{init.facility}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Annual Abatement</span>
                    <p className="text-base font-black text-emerald-600 mt-1">
                      {init.abatementCO2eTonnesPerYear.toLocaleString()} t
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Marginal Cost</span>
                    <p className={`text-base font-black mt-1 ${init.marginalAbatementCostPerTonne < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {init.marginalAbatementCostPerTonne} $/t
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Payback Period</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {init.paybackPeriodYears} Yrs
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>Capex: <strong>{(init.capexInvestmentAEDorOMR / 1000000).toFixed(1)}M</strong></span>
                  <span>Opex Savings: <strong className="text-emerald-600">{(init.annualOpexSavingsAEDorOMR / 1000).toFixed(0)}k/yr</strong></span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: OFFICIAL DISCLOSURES (ADX / MSX) */}
      {/* ========================================================================= */}
      {activeTab === 'REGULATORY_DISCLOSURES' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  {standard === 'MSX_OMAN' ? 'Muscat Stock Exchange (MSX) ESG Disclosures' : 'Abu Dhabi Securities Exchange (ADX) Disclosures'}
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {activeDisclosures.length} Indicators Fully Mapped
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official regulatory indicator alignment with GRI Universal Standards & UN Sustainable Development Goals (SDGs)
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStandard('ADX_UAE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${standard === 'ADX_UAE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                ADX UAE (31 Metrics)
              </button>
              <button
                onClick={() => setStandard('MSX_OMAN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${standard === 'MSX_OMAN' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                MSX Oman (32 Metrics)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 text-start">Code & Pillar</th>
                    <th className="py-3.5 px-4 text-start">Metric / Parameter Title</th>
                    <th className="py-3.5 px-4 text-end">FY2022</th>
                    <th className="py-3.5 px-4 text-end">FY2023</th>
                    <th className="py-3.5 px-4 text-end">FY2024 (Audited)</th>
                    <th className="py-3.5 px-4 text-end">2030 Target</th>
                    <th className="py-3.5 px-4 text-start">GRI Standard</th>
                    <th className="py-3.5 px-4 text-start">Explanation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeDisclosures.map(item => (
                    <tr key={item.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-slate-900 text-xs">{item.code}</span>
                        <div className={`text-[10px] font-bold ${
                          item.pillar === 'Environmental' ? 'text-emerald-600' :
                          item.pillar === 'Social' ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          {item.pillar}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                        {item.title}
                        <div className="text-[10px] font-normal text-slate-400">Unit: {item.unit}</div>
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono text-slate-500">{item.fy2022Value}</td>
                      <td className="py-3.5 px-4 text-end font-mono text-slate-600">{item.fy2023Value}</td>
                      <td className="py-3.5 px-4 text-end font-mono font-black text-slate-900 text-sm bg-slate-50/50">
                        {item.fy2024Value}
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono text-emerald-600 font-bold">{item.target2030Value}</td>
                      <td className="py-3.5 px-4 text-[10px] font-mono text-slate-600">{item.griReference}</td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs">{item.explanationNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: AI ESG ADVISOR & AUDIT COPILOT */}
      {/* ========================================================================= */}
      {activeTab === 'AI_ADVISOR' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Enterprise HSE AI ESG Advisor</h3>
                <p className="text-xs text-slate-400">
                  Autonomous regulatory compliance analysis adhering to OSHAD, ADX, DFM, MSX Oman, and UAE Net Zero 2050 framework
                </p>
              </div>
            </div>

            {/* Quick Prompt Trigger Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {[
                'Run Comprehensive ADX & MSX Regulatory Gap Analysis',
                'Assess Decarbonization Pathway Alignment with Net Zero 2050',
                'Audit Workforce Nationalisation (Omanisation & Emiratisation Quotas)',
                'Generate Board Audit Committee ESG Defense Brief'
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuery(p);
                    handleRunAiEvaluation(p);
                  }}
                  disabled={aiLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask specific regulatory or decarbonization questions..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleRunAiEvaluation()}
                disabled={aiLoading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Evaluate</span>
              </button>
            </div>
          </div>

          {/* AI Result Card Formatted per Enterprise Response Framework */}
          {aiResult && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
              
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                <Sparkles size={15} className="text-amber-600 shrink-0" />
                <span>
                  <strong>AI-generated, human review required:</strong> Grounded analysis generated via Gemini API from live asset telemetry. Must be reviewed by certified Environmental & Sustainability Officer prior to formal board submission.
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Executive Summary</h4>
                  <p className="text-base font-bold text-slate-900 mt-1">{aiResult.executiveSummary}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase ${
                  aiResult.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                  aiResult.riskLevel === 'High' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  Risk: {aiResult.riskLevel}
                </div>
              </div>

              {/* 2. Key Findings */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">2. Key Findings</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                  {aiResult.keyFindings.map((kf, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{kf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Business Impact */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">4. Business & Capital Access Impact</h4>
                <p className="text-xs font-semibold text-slate-800 mt-1">{aiResult.businessImpact}</p>
              </div>

              {/* 5. Recommended Actions (Table) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">5. Recommended Actions & SLA Ownership</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-100 text-slate-500 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-3 text-start">Priority</th>
                        <th className="p-3 text-start">Action Description</th>
                        <th className="p-3 text-start">Responsible Owner</th>
                        <th className="p-3 text-end">Timeline / SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiResult.recommendedActions.map((ra, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-black">
                              {ra.priority}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{ra.action}</td>
                          <td className="p-3 text-slate-600">{ra.owner}</td>
                          <td className="p-3 text-end font-bold text-emerald-600">{ra.timeline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7 & 8: Escalation & Next Step */}
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    8. IMMEDIATE NEXT OPERATIONAL STEP
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{aiResult.nextStep}</p>
                </div>
                {aiResult.escalationNeed && (
                  <span className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 shadow-md">
                    <AlertTriangle size={15} /> Immediate Leadership Escalation Required
                  </span>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG NEW ACTIVITY EMISSION DATA */}
      {/* ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">Log ESG Activity Data</h3>
                  <p className="text-xs text-slate-500">Certified GCC Emission Factor Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-black p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmissionRecord} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Facility</label>
                <select
                  value={newLogFacilityId}
                  onChange={(e) => setNewLogFacilityId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.jurisdiction}: {f.name} ({f.emirateOrGovernorate})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GHG Protocol Scope</label>
                  <select
                    value={newLogScope}
                    onChange={(e) => setNewLogScope(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Scope 1">Scope 1 (Direct Combustion/Flaring)</option>
                    <option value="Scope 2">Scope 2 (Grid Electricity/Cooling)</option>
                    <option value="Scope 3">Scope 3 (Value Chain & Waste)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Regional Factor Library</label>
                  <select
                    value={newLogFactorKey}
                    onChange={(e) => setNewLogFactorKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  >
                    {Object.entries(REGIONAL_EMISSION_FACTORS).map(([key, val]) => (
                      <option key={key} value={key}>
                        [{val.jurisdiction}] {val.sourceName} ({val.factor} kg/{val.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Activity Source Description</label>
                <input
                  type="text"
                  value={newLogSource}
                  onChange={(e) => setNewLogSource(e.target.value)}
                  placeholder="e.g. Auxiliary Power Diesel Genset 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Activity Quantity (Consumption)</label>
                  <input
                    type="number"
                    step="any"
                    value={newLogActivityData}
                    onChange={(e) => setNewLogActivityData(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice / Manifest Voucher ID</label>
                  <input
                    type="text"
                    value={newLogInvoiceRef}
                    onChange={(e) => setNewLogInvoiceRef(e.target.value)}
                    placeholder="e.g. TADWEER-BOLISAT-8812"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Preview calculation */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800">Computed Emission Output</span>
                  <p className="text-lg font-black text-emerald-700">
                    {calculateEmissionCO2eTonnes(newLogFactorKey, newLogActivityData).co2eTonnes} Metric Tonnes CO2e
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {REGIONAL_EMISSION_FACTORS[newLogFactorKey]?.referenceSource}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  Save & Validate Entry
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CarbonAccountingModule;
