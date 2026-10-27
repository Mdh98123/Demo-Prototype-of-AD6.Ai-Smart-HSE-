import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, LabelList
} from 'recharts';
import { 
  Gavel, ShieldAlert, CheckCircle2, AlertTriangle, Clock, Landmark, 
  ArrowUpRight, TrendingUp, Scale, Target, Calendar,
  Activity, Zap, ShieldCheck, BrainCircuit, ChevronRight,
  ChevronDown, ChevronUp, BookOpen, AlertOctagon, Bell, ExternalLink,
  RefreshCw, Check, Plus, Building2, Layers,
  Briefcase, HeartPulse, Truck, Factory, Tag
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { View, RegulatoryAnnouncementItem } from '../types';
import { 
  RegulatoryIntelligenceService, 
  RegulatoryObligation 
} from '../services/regulatoryIntelligenceService';

export type DepartmentKey = 
  | 'ALL'
  | 'QHSE'
  | 'OPERATIONS'
  | 'PROCESS_SAFETY'
  | 'ENVIRONMENTAL'
  | 'LOGISTICS'
  | 'OCCUPATIONAL_HEALTH';

interface DepartmentMeta {
  key: DepartmentKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  statutoryFocus: string[];
  primaryAuthorities: string[];
  color: string;
}

const DEPARTMENTS: DepartmentMeta[] = [
  {
    key: 'ALL',
    label: 'Enterprise-Wide Global Overview',
    shortLabel: 'All Departments',
    icon: Building2,
    description: 'Consolidated regulatory adherence across all operational divisions and concessions',
    statutoryFocus: ['Labour Law RD 53/2023', 'MD 286/2008', 'CDAA Fire Directives', 'EA RD 114/2001', 'OPAL Standards'],
    primaryAuthorities: ['MoL Oman', 'PDO HSE', 'CDAA', 'Environment Authority', 'OPAL'],
    color: 'indigo'
  },
  {
    key: 'QHSE',
    label: 'Corporate QHSE & Governance',
    shortLabel: 'QHSE Directorate',
    icon: ShieldCheck,
    description: 'Regulatory audit readiness, statutory reporting, ISO 45001/14001, and contractor pre-qualification',
    statutoryFocus: ['Oman Labour Law RD 53/2023', 'Statutory SF7 Reporting', 'Contractor HSE Passports', 'Audit Defense'],
    primaryAuthorities: ['Ministry of Labour (MoL)', 'PDO HSE Directorate'],
    color: 'emerald'
  },
  {
    key: 'OPERATIONS',
    label: 'Field Operations & Maintenance',
    shortLabel: 'Operations & Maint',
    icon: Factory,
    description: 'Permit to Work, LOTO energy isolation, scaffolding tags, and summer midday heat stoppage',
    statutoryFocus: ['Midday Work Ban (12:30-15:30)', 'TWL Heat Stress Monitoring (<115 W/m²)', 'Working at Height / Tethering', 'LOTO Verification'],
    primaryAuthorities: ['MoL Welfare Inspectorate', 'PDO SP-1143 / SP-1232'],
    color: 'blue'
  },
  {
    key: 'PROCESS_SAFETY',
    label: 'Process Safety & Loss Prevention',
    shortLabel: 'Process Safety & Fire',
    icon: AlertTriangle,
    description: 'Major accident hazard prevention, hazardous storage containment, CDAA fire telemetry & H2S detection',
    statutoryFocus: ['CDAA Telemetry Dispatch Link', 'Secondary Containment 110%', 'Fixed H2S Detector Calibration', 'Deluge Flow Testing'],
    primaryAuthorities: ['Civil Defence & Ambulance Authority (CDAA)', 'MEM Oman'],
    color: 'orange'
  },
  {
    key: 'ENVIRONMENTAL',
    label: 'Environmental Protection & Waste (ESG)',
    shortLabel: 'Environmental / ESG',
    icon: Layers,
    description: 'Hazardous waste manifests with be\'ah, industrial emissions, effluent limits, and spill containment',
    statutoryFocus: ['Electronic Manifests (be\'ah Portal)', 'EA Royal Decree 114/2001', 'CEMS Stack Emission Logs', 'Chemical Sludge Consignment'],
    primaryAuthorities: ['Environment Authority (EA)', 'be\'ah'],
    color: 'teal'
  },
  {
    key: 'LOGISTICS',
    label: 'Logistics, Fleet & Transport',
    shortLabel: 'Logistics & Fleet',
    icon: Truck,
    description: 'Concession road safety, IVMS real-time telemetry, OPAL Defensive Driving permits, and heavy haulage',
    statutoryFocus: ['OPAL CAMS 2026 Driving Passport', 'IVMS Continuous Speed Logs', 'Mandatory Journey Plans (>50km)', 'Driver Fatigue Checks'],
    primaryAuthorities: ['Oman Energy Association (OPAL)', 'Royal Oman Police'],
    color: 'amber'
  },
  {
    key: 'OCCUPATIONAL_HEALTH',
    label: 'Occupational Health & Medical Services',
    shortLabel: 'Occupational Health',
    icon: HeartPulse,
    description: 'MOH statutory medical surveillance, chemical handler biological assays, audiometry & thermal hydration',
    statutoryFocus: ['MOH Annual Exposure Screening', 'Respirator Fit Testing', 'Benzene & VOC Biological Markers', 'Electrolyte Stations'],
    primaryAuthorities: ['Ministry of Health (MOH)', 'MoL OSH Directorate'],
    color: 'rose'
  }
];

// Statutory adherence data across regional authorities
const authorityCompliance = [
  { name: 'MoL (MD 286 / RD 53)', compliance: 98, ncrCount: 0, status: 'Verified', jurisdiction: 'National' },
  { name: 'PDO HSE Standards', compliance: 96, ncrCount: 1, status: 'Compliant', jurisdiction: 'Concession' },
  { name: 'CDAA Industrial Fire', compliance: 93, ncrCount: 2, status: 'Compliant', jurisdiction: 'National' },
  { name: 'Environment Auth (EA)', compliance: 91, ncrCount: 3, status: 'Correction Pending', jurisdiction: 'National' },
  { name: 'OPAL Unified Standards', compliance: 95, ncrCount: 1, status: 'Compliant', jurisdiction: 'Industry' },
  { name: 'MOH Occupational Health', compliance: 94, ncrCount: 1, status: 'Verified', jurisdiction: 'National' },
];

const getPerformanceColor = (score: number) => {
  if (score >= 95) return '#10b981'; // emerald-500
  if (score >= 90) return '#6366f1'; // indigo-500
  if (score >= 80) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

const complianceTrend = [
  { month: 'Jun', overall: 89, mol: 90, pdo: 89, cdaa: 86, ea: 84 },
  { month: 'Jul', overall: 91, mol: 93, pdo: 92, cdaa: 88, ea: 86 },
  { month: 'Aug', overall: 93, mol: 95, pdo: 94, cdaa: 90, ea: 88 },
  { month: 'Sep', overall: 94, mol: 97, pdo: 95, cdaa: 91, ea: 90 },
  { month: 'Oct', overall: 96, mol: 98, pdo: 96, cdaa: 93, ea: 91 },
];

// Department statutory deadlines aligned with current regional enforcement calendar
const DEPARTMENT_DEADLINES: Record<DepartmentKey, { id: string; title: string; authority: string; date: string; status: string; priority: 'Critical' | 'High' | 'Medium'; requirement: string }[]> = {
  ALL: [
    { id: 'D-01', title: 'MoL Midday Work Ban (12:30-15:30) Compliance Filing', authority: 'Ministry of Labour', date: '2026-11-15', status: 'Awaiting Audit Evidence', priority: 'Critical', requirement: 'Submit telemetry records of shaded rest shelters and TWL heat monitors per MD 286/2008.' },
    { id: 'D-02', title: 'EA Digital Manifest Consignment Integration with be\'ah', authority: 'Environment Authority', date: '2026-11-30', status: 'In Progress (85%)', priority: 'High', requirement: 'Cut over paper manifests to digital waste tracking portal per RD 114/2001.' },
    { id: 'D-03', title: 'CDAA Chemical Storage Telemetry Gateway Audit', authority: 'Civil Defence & Ambulance', date: '2026-12-10', status: 'Scheduled', priority: 'Critical', requirement: 'Verify 24/7 direct telemetry link to national emergency operations dispatch.' },
    { id: 'D-04', title: 'OPAL CAMS Defensive Driving Fleet Certification', authority: 'OPAL Standards', date: '2026-12-20', status: 'Upcoming', priority: 'Medium', requirement: 'Audit subcontractor IVMS speed logs and valid driver permits.' }
  ],
  QHSE: [
    { id: 'D-Q1', title: 'Annual MoL Statutory SF-7 HSE Performance Report', authority: 'Ministry of Labour', date: '2026-11-20', status: 'Draft Ready', priority: 'Critical', requirement: 'Executive sign-off on 1M-hour LTIFR, TRIR, and occupational disease statistics.' },
    { id: 'D-Q2', title: 'Contractor HSE Pre-Qualification Digital Passport Audit', authority: 'MoL & PDO Standards', date: '2026-12-05', status: 'In Review', priority: 'High', requirement: 'Validate third-party contractor NEBOSH/IOSH supervisor ratio compliance.' }
  ],
  OPERATIONS: [
    { id: 'D-O1', title: 'Thermal Work Limit (TWL) Continuous Sensor Re-Calibration', authority: 'MoL MD 286 & PDO SP-1170', date: '2026-11-12', status: 'Active Field Check', priority: 'Critical', requirement: 'Deploy freshly calibrated TWL sensors on structural platforms (<115 W/m² stop-work triggers).' },
    { id: 'D-O2', title: '100% Tool Tethering & Scaffold Green Tag Recertification', authority: 'PDO SP-1232 / CISRS', date: '2026-11-25', status: 'In Progress', priority: 'High', requirement: 'Inspect scaffolding tags every 7 days and verify dual lanyard compliance for >1.8m work.' }
  ],
  PROCESS_SAFETY: [
    { id: 'D-P1', title: 'CDAA Industrial Fire Alarm Telemetry Direct Link Test', authority: 'CDAA Prevention Directorate', date: '2026-11-18', status: 'Simulation Scheduled', priority: 'Critical', requirement: 'Demonstrate live alarm failover from Class-A chemical storage panels to CDAA operations.' },
    { id: 'D-P2', title: 'Fixed H2S Detection Threshold Sensitivity Audit (5ppm trigger)', authority: 'MEM / GCC Standards', date: '2026-12-01', status: 'Field Audit', priority: 'High', requirement: 'Inspect detector calibration logs and positive-pressure EEBD availability across tank farms.' }
  ],
  ENVIRONMENTAL: [
    { id: 'D-E1', title: 'EA RD 114/2001 Digital Hazardous Waste Consignment Mandate', authority: 'Environment Authority (EA)', date: '2026-11-30', status: 'API Gateway Live', priority: 'Critical', requirement: 'All chemical sludge and oily residue tankers must register electronic manifests before gate dispatch.' },
    { id: 'D-E2', title: 'Quarterly CEMS Air Quality & VOC Emission Submission', authority: 'Environment Authority', date: '2026-12-15', status: 'Telemetry Aggregation', priority: 'High', requirement: 'Submit continuous stack emissions logs for sulfur dioxide and volatile hydrocarbons.' }
  ],
  LOGISTICS: [
    { id: 'D-L1', title: 'OPAL CAMS 2026 Defensive Driving Permit Verification', authority: 'OPAL Road Safety', date: '2026-11-22', status: 'Gate Audit Active', priority: 'High', requirement: 'Verify valid OPAL driver IDs and IVMS telemetry upload compliance at all concession access points.' },
    { id: 'D-L2', title: 'Mandatory Journey Management Plans (>50km Concession Trips)', authority: 'PDO & OPAL', date: '2026-12-08', status: 'Automated in App', priority: 'Medium', requirement: 'Confirm night driving curfew waivers and driver fatigue sobriety verification.' }
  ],
  OCCUPATIONAL_HEALTH: [
    { id: 'D-H1', title: 'MOH Periodic Occupational Medical Surveillance for Chemical Handlers', authority: 'Ministry of Health & MoL', date: '2026-11-28', status: 'Clinic Cohort 3 Active', priority: 'Critical', requirement: 'Complete biological exposure monitoring (urinary metabolites and spirometry) for solvent workers.' },
    { id: 'D-H2', title: 'Annual Quantitative Respirator PortaCount Fit-Testing', authority: 'MoL OSH Directorate', date: '2026-12-12', status: 'Scheduled', priority: 'High', requirement: 'Certify negative-pressure half/full-face respirators for spray paint and catalyst loading teams.' }
  ]
};

// Department specific regulatory elements and statutory controls
const DEPARTMENT_REGULATORY_CONTROLS: Record<DepartmentKey, { id: string; title: string; authority: string; status: 'Compliant' | 'Partial' | 'At Risk'; score: number; gaps: string[] }[]> = {
  ALL: [
    { id: 'MD-286-CH1', title: 'Occupational Health & Summer Midday Work Stoppage (12:30-15:30)', authority: 'Ministry of Labour', status: 'Compliant', score: 98, gaps: [] },
    { id: 'PDO-SP-1143', title: 'Permit to Work & Mechanical/Electrical Isolation Verification', authority: 'PDO HSE Standards', status: 'Compliant', score: 96, gaps: [] },
    { id: 'CDAA-DIR-2026', title: 'Hazardous Chemical Storage Direct Fire Telemetry Link', authority: 'Civil Defence & Ambulance', status: 'Compliant', score: 93, gaps: [] },
    { id: 'EA-RD-114', title: 'Digital Hazardous Waste Manifest Consignment (be\'ah)', authority: 'Environment Authority', status: 'Partial', score: 88, gaps: ['Subcontractor manifest upload latency at Sohar terminal'] },
    { id: 'OPAL-CAMS-26', title: 'Defensive Driving & Real-Time IVMS Concession Road Fleet', authority: 'OPAL Standards', status: 'Compliant', score: 95, gaps: [] },
  ],
  QHSE: [
    { id: 'RD-53-2023', title: 'Oman Labour Law: Statutory Safety Officer Ratios & Joint Committees', authority: 'Ministry of Labour', status: 'Compliant', score: 100, gaps: [] },
    { id: 'MD-286-STAT', title: 'Semi-Annual Statutory HSE Performance Filing (Form SF-7)', authority: 'MoL Welfare Directorate', status: 'Compliant', score: 98, gaps: [] },
    { id: 'ISO-45001-CH', title: 'Legal Register Maintenance & Management of Change (MOC)', authority: 'Enterprise Governance', status: 'Compliant', score: 97, gaps: [] },
    { id: 'CONT-HSE-VET', title: 'Contractor 3-Year Safety Performance & NEBOSH Staffing Vetting', authority: 'PDO / MoL Guidelines', status: 'Partial', score: 86, gaps: ['2 secondary maintenance contractors pending NEBOSH cert renewal'] }
  ],
  OPERATIONS: [
    { id: 'PDO-SP-1170', title: 'Thermal Work Limit (TWL) Heat Ergonomics (<115 W/m² stop-work)', authority: 'MoL MD 286 & PDO SP-1170', status: 'Compliant', score: 98, gaps: [] },
    { id: 'PDO-SP-1232', title: '100% Anti-Drop Tool Tethering & 7-Day Scaffolding Re-Tagging', authority: 'PDO Code of Practice', status: 'Compliant', score: 95, gaps: [] },
    { id: 'PDO-SP-1231', title: 'Lockout / Tagout (LOTO) Zero Energy Positive Verification', authority: 'PDO / ISO 14118', status: 'Partial', score: 87, gaps: ['Duqm sub-station isolation log sign-off backlog'] },
    { id: 'SIMOPS-CON-01', title: 'Simultaneous Operations Spatial Clash Prevention Matrix', authority: 'Site HSE Directorate', status: 'Compliant', score: 96, gaps: [] }
  ],
  PROCESS_SAFETY: [
    { id: 'CDAA-HAZMAT', title: 'Hazardous Chemical Secondary Containment (110% Capacity)', authority: 'Civil Defence (CDAA)', status: 'Compliant', score: 96, gaps: [] },
    { id: 'CDAA-ALARM', title: '24/7 Fire & Gas Alarm Gateway to National CDAA Dispatch', authority: 'Civil Defence (CDAA)', status: 'Compliant', score: 92, gaps: [] },
    { id: 'H2S-SENS-5P', title: 'Fixed H2S Detector Sensitivity Range & Daily Bump-Test Audit', authority: 'MEM / API RP 55', status: 'Compliant', score: 94, gaps: [] },
    { id: 'DELUGE-PMP', title: 'Bi-Annual Deluge Foam & Hydrostatic Pressure Flow Certification', authority: 'NFPA / CDAA', status: 'Partial', score: 84, gaps: ['Mina Al Fahal Tank Farm 4 foam concentrate replacement scheduled'] }
  ],
  ENVIRONMENTAL: [
    { id: 'EA-MANIFEST', title: 'be\'ah Digital Consignment Tracking for Hazardous Chemical Waste', authority: 'Environment Authority (EA)', status: 'Partial', score: 86, gaps: ['Pre-dispatch barcode validation required on contractor sludge trucks'] },
    { id: 'EA-RD-114', title: 'Environmental Protection Law: Industrial Wastewater Discharge Consents', authority: 'Environment Authority (EA)', status: 'Compliant', score: 95, gaps: [] },
    { id: 'CEMS-AIR-01', title: 'Continuous Emission Monitoring System (CEMS) SO2 & VOC Telemetry', authority: 'EA Directorate of Licensing', status: 'Compliant', score: 93, gaps: [] },
    { id: 'SPILL-DEP-02', title: 'Tier 1 & Tier 2 Marine Oil Spill Rapid Containment Readiness', authority: 'EA Marine Pollution Center', status: 'Compliant', score: 94, gaps: [] }
  ],
  LOGISTICS: [
    { id: 'OPAL-DEF-DRV', title: 'OPAL CAMS Certified Defensive Driving Permit Verification', authority: 'OPAL Road Safety Standard', status: 'Compliant', score: 97, gaps: [] },
    { id: 'IVMS-SPEED', title: 'In-Vehicle Monitoring System (IVMS) Speed & Acceleration Geofencing', authority: 'PDO SP-2000 / OPAL', status: 'Compliant', score: 95, gaps: [] },
    { id: 'JOURNEY-MGT', title: 'Concession Journey Management Plan (JMP) Dispatch Clearance', authority: 'Transport Logistics', status: 'Compliant', score: 93, gaps: [] },
    { id: 'FATIGUE-REST', title: 'Driver Hours of Service & Mandatory Rest Period Enforcement', authority: 'MoL & OPAL', status: 'Partial', score: 89, gaps: ['Night haulage driver rest log verification latency'] }
  ],
  OCCUPATIONAL_HEALTH: [
    { id: 'MOH-SURV-01', title: 'Periodic Biological & Health Surveillance for Carcinogen Handlers', authority: 'Ministry of Health (MOH)', status: 'Compliant', score: 96, gaps: [] },
    { id: 'RESP-FIT-TEST', title: 'Annual Quantitative PortaCount Respiratory Fit Testing', authority: 'MoL OSH Directorate', status: 'Compliant', score: 95, gaps: [] },
    { id: 'HEAT-ERGON', title: 'Thermal Stress Hydration, Shaded Shelters & Electrolyte Logs', authority: 'MoL MD 286 / PDO SP-1170', status: 'Compliant', score: 98, gaps: [] },
    { id: 'NOISE-AUD-02', title: 'Audiometric Baseline Testing for High-Decibel Plant Operators (>85 dBA)', authority: 'MOH / ISO 1999', status: 'Partial', score: 88, gaps: ['Compressor house operator audiometry renewals due this month'] }
  ]
};

interface ComplianceDashboardProps {
  onNavigate: (view: View, params?: any) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useUser();

  // Determine user's initial department
  const initialDept: DepartmentKey = useMemo(() => {
    if (!currentUser?.department) return 'ALL';
    const deptStr = currentUser.department.toLowerCase();
    if (deptStr.includes('qhse') || deptStr.includes('governance') || deptStr.includes('security') || deptStr.includes('architect')) {
      return 'QHSE';
    }
    if (deptStr.includes('operation') || deptStr.includes('maint') || deptStr.includes('field') || deptStr.includes('sohar') || deptStr.includes('duqm')) {
      return 'OPERATIONS';
    }
    if (deptStr.includes('process') || deptStr.includes('fire') || deptStr.includes('loss')) {
      return 'PROCESS_SAFETY';
    }
    if (deptStr.includes('environ') || deptStr.includes('esg') || deptStr.includes('waste')) {
      return 'ENVIRONMENTAL';
    }
    if (deptStr.includes('logistics') || deptStr.includes('transport') || deptStr.includes('fleet')) {
      return 'LOGISTICS';
    }
    if (deptStr.includes('medical') || deptStr.includes('health') || deptStr.includes('clinic')) {
      return 'OCCUPATIONAL_HEALTH';
    }
    return 'ALL';
  }, [currentUser]);

  const [selectedDept, setSelectedDept] = useState<DepartmentKey>(initialDept);
  const [filterToDeptUpdatesOnly, setFilterToDeptUpdatesOnly] = useState<boolean>(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Live Regulatory Updates Feed state from /api/regulatory/latest
  const [updates, setUpdates] = useState<RegulatoryAnnouncementItem[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [feedError, setFeedError] = useState<string | null>(null);

  // Modal State for "Add to Legal Register"
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeItemForRegister, setActiveItemForRegister] = useState<RegulatoryAnnouncementItem | null>(null);
  const [assignedSite, setAssignedSite] = useState<string>('Mina Al Fahal Refinery Complex (Muscat)');
  const [responsibleRole, setResponsibleRole] = useState<string>('Site HSE Manager');
  const [operationalCategory, setOperationalCategory] = useState<'Workforce Safety' | 'Plant & Machinery' | 'Environmental ESG' | 'Reporting & Audit'>('Workforce Safety');
  const [auditDueDate, setAuditDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [complianceStatus, setComplianceStatus] = useState<'Fully Compliant' | 'Partially Compliant' | 'At Risk / Non-Compliant'>('Partially Compliant');

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; oblId?: string } | null>(null);

  // Legal Register local mapping cache
  const [registeredMap, setRegisteredMap] = useState<Record<string, RegulatoryObligation>>({});

  const syncRegisteredMap = useCallback(() => {
    const obligations = RegulatoryIntelligenceService.getRegulatoryObligations();
    const map: Record<string, RegulatoryObligation> = {};
    for (const obl of obligations) {
      map[obl.regulationId] = obl;
    }
    setRegisteredMap(map);
  }, []);

  // Fetch from the server route /api/regulatory/latest
  const fetchFeed = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoadingUpdates(true);
    setFeedError(null);

    try {
      const data = await RegulatoryIntelligenceService.fetchLatestRegulatoryAnnouncements(refresh);
      if (data && data.updates) {
        setUpdates(data.updates);
        setLastChecked(data.lastChecked || new Date().toISOString());
      }
    } catch (err: any) {
      console.error('[COMPLIANCE MONITOR] Error fetching feed:', err);
      setFeedError(err.message || 'Unable to fetch /api/regulatory/latest. Displaying cached intelligence.');
    } finally {
      setIsLoadingUpdates(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    syncRegisteredMap();
    fetchFeed(false);

    const onRegUpdated = () => {
      syncRegisteredMap();
    };

    window.addEventListener('ad6-reg-obligations-updated', onRegUpdated);
    return () => {
      window.removeEventListener('ad6-reg-obligations-updated', onRegUpdated);
    };
  }, [syncRegisteredMap, fetchFeed]);

  // Active department metadata
  const activeDeptMeta = useMemo(() => {
    return DEPARTMENTS.find(d => d.key === selectedDept) || DEPARTMENTS[0];
  }, [selectedDept]);

  // Controls for the active department
  const activeControls = useMemo(() => {
    return DEPARTMENT_REGULATORY_CONTROLS[selectedDept] || DEPARTMENT_REGULATORY_CONTROLS.ALL;
  }, [selectedDept]);

  // Deadlines for the active department
  const activeDeadlines = useMemo(() => {
    return DEPARTMENT_DEADLINES[selectedDept] || DEPARTMENT_DEADLINES.ALL;
  }, [selectedDept]);

  // Department metrics
  const deptAverageScore = useMemo(() => {
    if (!activeControls.length) return 95;
    return Math.round(activeControls.reduce((sum, c) => sum + c.score, 0) / activeControls.length);
  }, [activeControls]);

  const deptActiveGapsCount = useMemo(() => {
    return activeControls.reduce((acc, c) => acc + c.gaps.length, 0);
  }, [activeControls]);

  // Filter regulatory updates by department relevance
  const filteredUpdates = useMemo(() => {
    if (selectedDept === 'ALL' || !filterToDeptUpdatesOnly) {
      return updates;
    }

    return updates.filter(item => {
      const cat = (item.category || '').toLowerCase();
      const chips = (item.topicChips || []).map(c => c.toLowerCase()).join(' ');

      switch (selectedDept) {
        case 'QHSE':
          return cat.includes('labor') || chips.includes('contractor') || chips.includes('law') || chips.includes('audit');
        case 'OPERATIONS':
          return cat.includes('labor') || cat.includes('heat') || chips.includes('working at height') || chips.includes('scaffold') || chips.includes('heat stress');
        case 'PROCESS_SAFETY':
          return cat.includes('process') || cat.includes('fire') || chips.includes('chemical') || chips.includes('cdaa') || chips.includes('h2s');
        case 'ENVIRONMENTAL':
          return cat.includes('waste') || cat.includes('environment') || chips.includes('be\'ah') || chips.includes('manifest') || chips.includes('esg');
        case 'LOGISTICS':
          return chips.includes('opal') || chips.includes('driving') || chips.includes('vehicle') || chips.includes('transport') || cat.includes('transport');
        case 'OCCUPATIONAL_HEALTH':
          return chips.includes('medical') || chips.includes('surveillance') || chips.includes('heat stress') || chips.includes('benzene');
        default:
          return true;
      }
    });
  }, [updates, selectedDept, filterToDeptUpdatesOnly]);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  // Open "Add to Legal Register" modal
  const handleOpenRegisterModal = (item: RegulatoryAnnouncementItem) => {
    setActiveItemForRegister(item);
    // Tailor defaults according to department
    if (selectedDept === 'ENVIRONMENTAL') {
      setOperationalCategory('Environmental ESG');
      setResponsibleRole('Lead Environmental Engineer');
    } else if (selectedDept === 'OPERATIONS') {
      setOperationalCategory('Plant & Machinery');
      setResponsibleRole('Site Operations Manager');
    } else if (selectedDept === 'PROCESS_SAFETY') {
      setOperationalCategory('Plant & Machinery');
      setResponsibleRole('Process Safety Lead');
    } else {
      setOperationalCategory('Workforce Safety');
      setResponsibleRole('Site HSE Manager');
    }
    setIsModalOpen(true);
  };

  // Confirm "Add to Legal Register"
  const handleConfirmAddToRegister = () => {
    if (!activeItemForRegister) return;

    try {
      const newObl = RegulatoryIntelligenceService.addObligationToLegalRegister({
        regulationId: activeItemForRegister.id,
        regulationTitle: activeItemForRegister.title,
        authority: activeItemForRegister.authority,
        obligationText: activeItemForRegister.summary,
        operationalCategory,
        penaltyExposureAed: activeItemForRegister.penaltyExposureAed,
        responsibleRole,
        assignedSite,
        complianceStatus,
        nextAuditDueDate: auditDueDate
      });

      syncRegisteredMap();
      setIsModalOpen(false);

      setToastMessage({
        id: Date.now().toString(),
        text: `Successfully mapped "${activeItemForRegister.title}" to ${assignedSite} Legal Register!`,
        oblId: newObl.id
      });

      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error adding to legal register:', err);
      alert('Failed to add obligation to Legal Register: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-slate-900 border border-emerald-500/40 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-300">Added to Legal Register</h5>
              {toastMessage.oblId && (
                <span className="font-mono text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  {toastMessage.oblId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md line-clamp-2">{toastMessage.text}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ms-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Autonomous Regional Gazette Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Oman Labour Law RD 53/2023 · MD 286/2008 · CDAA · EA RD 114
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Compliance Adherence Monitor
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium border-s-4 border-indigo-500 ps-4 max-w-3xl">
            Tailored departmental compliance posture, statutory obligations, and real-time regional decrees continuously updated via <span className="font-mono text-indigo-600 font-semibold">/api/regulatory/latest</span> without external API token dependencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => fetchFeed(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 glass-card hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 shadow-sm transition-all font-bold text-xs active:scale-95 disabled:opacity-50"
            title="Refresh latest updates from official gazette feed"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span>{isRefreshing ? 'Syncing Gazette...' : 'Sync Updates'}</span>
          </button>

          <button 
            onClick={() => onNavigate(View.REGULATORY_INTELLIGENCE)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl shadow-xl transition-all font-bold text-xs active:scale-95"
          >
            <Bell size={15} className="text-teal-300 animate-pulse" />
            <span>Open Regulatory Bulletin</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* AUTONOMOUS INTEGRATION CALLOUT BANNER */}
      <div className="glass-card p-5 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-teal-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Scale size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Self-Contained GCC Statutory Compliance Architecture
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Zero External Token Locks
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              External <span className="font-mono font-bold text-slate-700">MOL_OMAN</span> and <span className="font-mono font-bold text-slate-700">PDO_SAFETY</span> API tokens are not required. The platform operates autonomously with internal statutory engines, continuous official gazette monitoring, and real-time Legal Register mapping.
            </p>
          </div>
        </div>

        {lastChecked && (
          <div className="text-end shrink-0 ps-2 border-s border-indigo-200/60 hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Last Gazette Check</span>
            <span className="text-xs font-mono font-bold text-indigo-700">
              {new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* DEPARTMENT SELECTOR BAR */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Tailor Monitor by Department / Division
            </span>
            {currentUser?.department && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Logged as: {currentUser.department}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-indigo-600">
            Active: {activeDeptMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {DEPARTMENTS.map(dept => {
            const isSelected = selectedDept === dept.key;
            const Icon = dept.icon;
            return (
              <button
                key={dept.key}
                onClick={() => setSelectedDept(dept.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black tracking-tight whitespace-nowrap transition-all active:scale-95 ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-xl ring-2 ring-indigo-500/30' 
                    : 'glass-card border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-teal-300' : 'text-slate-400'} />
                <span>{dept.shortLabel}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DEPARTMENT-TAILORED KPI STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Department Score */}
        <div 
          onClick={() => onNavigate(View.AUDITS)}
          className="glass-card p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-emerald-500/30 transition-all active:scale-95 group"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedDept === 'ALL' ? 'Portfolio Adherence' : `${activeDeptMeta.shortLabel} Score`}
              </p>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors"/>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{deptAverageScore}%</h3>
            <div className="flex items-center gap-1 text-emerald-600 mt-2">
              <TrendingUp size={12}/>
              <span className="text-[9px] font-bold uppercase">+2.8% vs statutory threshold</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl ms-4">
            <ShieldCheck size={24}/>
          </div>
        </div>

        {/* Identified Gaps */}
        <div 
          onClick={() => onNavigate(View.CAPA)}
          className="glass-card p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-amber-500/30 transition-all active:scale-95 group"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Gaps</p>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors"/>
            </div>
            <h3 className="text-3xl font-black text-amber-600">{deptActiveGapsCount}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Active remedial CAPAs mapped</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl ms-4">
            <ShieldAlert size={24}/>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div 
          onClick={() => onNavigate(View.PLANNING)}
          className="glass-card p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-xl hover:border-indigo-500/30 transition-all active:scale-95 group"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enforcement Milestones</p>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors"/>
            </div>
            <h3 className="text-3xl font-black text-indigo-600">{activeDeadlines.length}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Next 30–60 Days</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl ms-4">
            <Clock size={24}/>
          </div>
        </div>

        {/* Defensibility Posture */}
        <div 
          onClick={() => onNavigate(View.COMPLY_FLOW)}
          className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white flex items-start justify-between cursor-pointer hover:shadow-2xl hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Legal Register Ingestion</p>
              <ArrowUpRight size={14} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
            <h3 className="text-3xl font-black text-teal-400">
              {Object.keys(registeredMap).length} <span className="text-xs text-white/50 font-normal">Active</span>
            </h3>
            <div className="flex items-center gap-1 mt-2">
              <Zap size={12} className="text-yellow-400"/>
              <span className="text-[9px] text-teal-300 uppercase font-black">Ready for MoL / PDO Audit</span>
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl ms-4">
            <Scale size={24} className="text-teal-300"/>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Department Controls & Live Regional Updates */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* LATEST REGIONAL UPDATES & ANNOUNCEMENTS (TAILORED FEED) */}
          <div className="glass-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Bell size={18} className="text-indigo-600" />
                    Latest Regional Decrees & Announcements
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ingested live from <span className="font-mono text-slate-700">/api/regulatory/latest</span> · Tailored for {activeDeptMeta.label}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterToDeptUpdatesOnly(!filterToDeptUpdatesOnly)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    filterToDeptUpdatesOnly 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {filterToDeptUpdatesOnly ? `Filtering: ${activeDeptMeta.shortLabel}` : 'Show All Gazettes'}
                </button>
              </div>
            </div>

            {/* Updates list */}
            {isLoadingUpdates ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <RefreshCw size={28} className="animate-spin text-indigo-500 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Retrieving Latest Regional Decrees (/api/regulatory/latest)...
                </p>
              </div>
            ) : feedError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-3">
                <AlertOctagon size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error loading live feed</p>
                  <p className="mt-0.5">{feedError}</p>
                </div>
              </div>
            ) : filteredUpdates.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">
                <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">No specific decrees found for this filter</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Show All Gazettes" above to review decrees across other departments.
                </p>
                <button
                  onClick={() => setFilterToDeptUpdatesOnly(false)}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  View All Regional Announcements
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUpdates.map((item) => {
                  const isRegistered = !!registeredMap[item.id];
                  const existingObl = registeredMap[item.id];

                  return (
                    <div 
                      key={item.id} 
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 glass-card transition-all space-y-3 group"
                    >
                      {/* Top Badges & Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Official vs Reported Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            item.badgeType === 'OFFICIAL'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.badgeType === 'OFFICIAL' ? '✓ OFFICIAL GAZETTE' : '⚡ REPORTED / DRAFT'}
                          </span>

                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.authority}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400">
                            · {item.jurisdiction}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Calendar size={12} />
                          <span>Pub: {item.publicationDate}</span>
                        </div>
                      </div>

                      {/* Title & Arabic */}
                      <div>
                        <h4 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {item.title}
                        </h4>
                        {item.titleAr && (
                          <p className="text-xs text-slate-500 mt-0.5 font-arabic font-medium" dir="rtl">
                            {item.titleAr}
                          </p>
                        )}
                      </div>

                      {/* Topic Chips */}
                      {item.topicChips && item.topicChips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.topicChips.map((chip, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold tracking-tight transition-colors flex items-center gap-1"
                            >
                              <Tag size={9} className="text-slate-400" />
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {item.summary}
                      </p>

                      {/* Key Obligations list */}
                      {item.keyObligations && item.keyObligations.length > 0 && (
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Target size={11} className="text-indigo-600" /> Key Statutory Obligations:
                          </p>
                          <ul className="space-y-1">
                            {item.keyObligations.slice(0, 2).map((ob, obIdx) => (
                              <li key={obIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-snug">
                                <span className="text-indigo-600 font-bold shrink-0">•</span>
                                <span>{ob}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action & Links Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          {item.statutoryFine && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                              Fine: {item.statutoryFine}
                            </span>
                          )}

                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 hover:underline"
                            >
                              <span>Open source</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        {/* Add to Legal Register Button */}
                        <div>
                          {isRegistered ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>In Legal Register</span>
                              {existingObl?.id && (
                                <span className="font-mono text-[9px] text-emerald-800 bg-emerald-100 px-1 rounded">
                                  {existingObl.id}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenRegisterModal(item)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                              <Plus size={13} />
                              <span>Add to Legal Register</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DEPARTMENT SPECIFIC REGULATORY CONTROL BREAKDOWN */}
          <div className="glass-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  {activeDeptMeta.shortLabel} Compliance Controls Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active statutory checklist items & non-conformity remediation
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activeControls.length} Controlled Areas
              </span>
            </div>

            <div className="space-y-3">
              {activeControls.map((el) => (
                <div key={el.id} className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all hover:border-indigo-200 glass-card">
                  <button 
                    onClick={() => toggleSection(el.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        el.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600' : 
                        el.status === 'Partial' ? 'bg-amber-50 text-amber-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {el.score}%
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{el.id}</p>
                          <span className="text-[9px] font-bold text-slate-400">· {el.authority}</span>
                        </div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{el.title}</h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border ${
                        el.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        el.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {el.status}
                      </span>
                      {expandedSection === el.id ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                    </div>
                  </button>
                  
                  {expandedSection === el.id && (
                    <div className="p-5 bg-slate-50/60 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-1">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Compliance Rate</span>
                          <span>{el.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${el.score > 90 ? 'bg-emerald-500' : el.score > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${el.score}%` }}
                          ></div>
                        </div>
                      </div>

                      {el.gaps.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-red-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <AlertOctagon size={12} /> Identified Non-Conformities & Action Items:
                          </p>
                          <ul className="space-y-1.5">
                            {el.gaps.map((gap, i) => (
                              <li key={i} className="text-xs font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-red-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => onNavigate(View.AUDITS)}
                          className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-all"
                        >
                          View Audit Evidence
                        </button>
                        <button 
                          onClick={() => onNavigate(View.CAPA)}
                          className="flex-1 bg-slate-900 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-all"
                        >
                          Raise Remedial CAPA
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* MULTI-AUTHORITY ADHERENCE MATRIX */}
          <div className="glass-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Landmark size={18} className="text-indigo-600" />
                  Statutory Adherence Across GCC & Oman Authorities
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Benchmarked against statutory inspection standards
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authorityCompliance} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="compliance" name="Compliance %" radius={[10, 10, 0, 0]} barSize={40}>
                    {authorityCompliance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.compliance)} />
                    ))}
                    <LabelList dataKey="compliance" position="top" formatter={(val: number) => `${val}%`} style={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {authorityCompliance.map((auth, i) => (
                <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{auth.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-slate-800">{auth.compliance}%</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      auth.ncrCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {auth.ncrCount} NCRs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Department Milestones & AI Strategic Insights */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* STATUTORY CALENDAR & ENFORCEMENT DEADLINES */}
          <div className="glass-card p-6 lg:p-8 rounded-[3rem] shadow-xl border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  {activeDeptMeta.shortLabel} Enforcement Calendar
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">2026 Mandates</span>
            </div>

            <div className="space-y-3.5">
              {activeDeadlines.map((d, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 glass-card transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        d.priority === 'Critical' 
                          ? 'bg-red-50 text-red-600 border border-red-100' 
                          : d.priority === 'High' 
                          ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.priority} Priority
                      </span>
                      <h5 className="font-black text-slate-800 text-xs uppercase tracking-tight mt-1.5 leading-snug">
                        {d.title}
                      </h5>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-xs font-mono font-black text-slate-800">{d.date}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{d.authority}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {d.requirement}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${d.priority === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-indigo-400'}`}></div>
                      <span className="font-bold text-slate-500 uppercase">{d.status}</span>
                    </div>

                    <button 
                      onClick={() => onNavigate(View.PLANNING)}
                      className="font-black text-indigo-600 hover:text-indigo-800 uppercase flex items-center gap-1 hover:underline"
                    >
                      Prepare Dossier <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate(View.PLANNING)}
              className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Review Statutory Submission Bridge</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* AI STRATEGIC COMPLIANCE INTELLIGENCE CARD */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 end-0 p-6 opacity-10 pointer-events-none">
              <Gavel size={180} />
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="bg-teal-500 p-2.5 rounded-2xl text-slate-900 shadow-md">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Departmental Compliance Advisory
                </h4>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                  Grounded in Sultanate of Oman & GCC Regulations
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10 flex-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-teal-400" />
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">
                    High Probability Risk for {activeDeptMeta.shortLabel}
                  </p>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  {selectedDept === 'OPERATIONS' || selectedDept === 'QHSE'
                    ? 'Failure to retain continuous TWL (<115 W/m²) heat stress telemetry logs on elevated platforms may trigger automatic site stand-down orders under MoL MD 286/2008.'
                    : selectedDept === 'ENVIRONMENTAL'
                    ? 'Failure to submit digital hazardous waste manifests to the be\'ah electronic portal prior to tanker dispatch incurs penalties up to OMR 15,000 under EA RD 114/2001.'
                    : selectedDept === 'LOGISTICS'
                    ? 'Concession gate access will be denied to transport contractors lacking verified OPAL CAMS Defensive Driving permits and IVMS telemetry calibration.'
                    : selectedDept === 'PROCESS_SAFETY'
                    ? 'CDAA industrial chemical warehouse direct telemetry links must be tested with zero latency to maintain operating fire safety clearance permits.'
                    : 'Annual MOH medical surveillance records for hazardous chemical handlers must be updated and securely archived to prevent regulatory fines.'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-teal-400" />
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">
                    Recommended Proactive Remediation
                  </p>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  Add recent decrees to your departmental Legal Register and bind corrective actions to designated concession site managers with verified Segregation of Duties.
                </p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate(View.COMPLY_FLOW)}
              className="w-full mt-6 bg-teal-500 hover:bg-teal-400 text-slate-900 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Statutory Register Matrix</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* COMPLIANCE TRAJECTORY MINI-CARD */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-teal-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  Compliance Trajectory (H2 2026)
                </h4>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                +4.2% Growth
              </span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrend}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="overall" name="Global Adherence" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD TO LEGAL REGISTER */}
      {isModalOpen && activeItemForRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                    Add to Department Legal Register
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {activeItemForRegister.id} · {activeItemForRegister.authority}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Decree preview */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Regulation Title</p>
              <h5 className="font-bold text-xs text-slate-800">{activeItemForRegister.title}</h5>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{activeItemForRegister.summary}</p>
            </div>

            {/* Form inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Assigned Concession Site
                </label>
                <select
                  value={assignedSite}
                  onChange={(e) => setAssignedSite(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Mina Al Fahal Refinery Complex (Muscat)">Mina Al Fahal Refinery (Muscat)</option>
                  <option value="Sohar Industrial Port Petrochemical Complex">Sohar Industrial Port Complex</option>
                  <option value="Duqm Heavy Refining Terminal">Duqm Heavy Refining Terminal</option>
                  <option value="Fahud Concession Block 6 Facility">Fahud Concession (Block 6)</option>
                  <option value="Corporate Operations HQ (Muscat)">Corporate Operations HQ</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Responsible Role
                </label>
                <select
                  value={responsibleRole}
                  onChange={(e) => setResponsibleRole(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Site HSE Manager">Site HSE Manager</option>
                  <option value="Lead Environmental Engineer">Lead Environmental Engineer</option>
                  <option value="Process Safety Lead">Process Safety Lead</option>
                  <option value="Site Operations Manager">Site Operations Manager</option>
                  <option value="Logistics Fleet Coordinator">Logistics Fleet Coordinator</option>
                  <option value="Occupational Health Physician">Occupational Health Physician</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Operational Category
                </label>
                <select
                  value={operationalCategory}
                  onChange={(e) => setOperationalCategory(e.target.value as any)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Workforce Safety">Workforce Safety</option>
                  <option value="Plant & Machinery">Plant & Machinery</option>
                  <option value="Environmental ESG">Environmental ESG</option>
                  <option value="Reporting & Audit">Reporting & Audit</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Next Audit Due Date
                </label>
                <input
                  type="date"
                  value={auditDueDate}
                  onChange={(e) => setAuditDueDate(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Current Compliance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fully Compliant', 'Partially Compliant', 'At Risk / Non-Compliant'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setComplianceStatus(status)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                        complianceStatus === status 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToRegister}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Confirm & Add to Register</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;
