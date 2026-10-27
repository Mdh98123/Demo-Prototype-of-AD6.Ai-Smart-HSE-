import { Router, Request, Response } from 'express';
import { logAccess } from '../services/audit.js';

export const regulatoryRouter = Router();

export type RegulatoryBadgeType = 'OFFICIAL' | 'REPORTED';

export interface RegulatoryUpdatePayload {
  id: string;
  title: string;
  titleAr?: string;
  authority: string;
  jurisdiction: string;
  badgeType: RegulatoryBadgeType;
  topicChips: string[];
  publicationDate: string;
  effectiveDate: string;
  summary: string;
  keyObligations: string[];
  sourceUrl: string;
  sourceName: string;
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  statutoryFine: string;
  penaltyExposureAed: number; // Penalty amount (in OMR for Oman context)
  category: 'Labor & Workforce' | 'Heat Stress & Environment' | 'Process Safety & Fire' | 'Hazardous Chemicals & Waste' | 'Maritime & Offsites';
}

// In-memory persistent updates and legal register items
let lastCheckedTimestamp = new Date().toISOString();

const MOCK_REGULATORY_UPDATES: RegulatoryUpdatePayload[] = [
  {
    id: 'REG-OMN-2026-104',
    title: 'Ministry of Labour MD 286/2008 & RD 53/2023 - Mandatory Summer Heat Stress & Midday Work Stoppage Enforcement',
    titleAr: 'قرار وزاري رقم 286/2008 والمرسوم السلطاني 53/2023 - ضوابط الوقاية من الإجهاد الحراري والوقف الإلزامي للعمل',
    authority: 'Ministry of Labour (MoL) - Sultanate of Oman',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'OFFICIAL',
    topicChips: ['Heat Stress', 'Oman Labour Law', 'TWL Monitoring', 'Summer Work Ban', 'Life Safety'],
    publicationDate: '2026-05-15',
    effectiveDate: '2026-06-01',
    summary: 'Strict statutory enforcement requiring all outdoor and hydrocarbon industrial operators to cease open-air work when Thermal Work Limit (TWL) drops below 115 W/m² or between 12:30 PM and 3:30 PM throughout the summer. Calibrated WBGT/TWL telemetry sensors and shaded rehydration hubs are mandatory.',
    keyObligations: [
      'Cease all outdoor and open-air tasks from 12:30 PM to 3:30 PM daily during statutory summer months (June-August)',
      'Deploy calibrated Thermal Work Limit (TWL in W/m²) continuous monitors on all concession sites per PDO SP-1170',
      'Provide shaded cooling shelters equipped with certified potable cold drinking water and electrolyte supplements',
      'Submit quarterly thermal safety compliance reports to the MoL Occupational Health Inspection Directorate'
    ],
    sourceUrl: 'https://mol.gov.om/decrees/md-286-2008-heat-stress',
    sourceName: 'Official Oman Ministry of Labour Gazette',
    impactLevel: 'Critical',
    statutoryFine: 'OMR 5,000 per violation & operational stoppage',
    penaltyExposureAed: 5000,
    category: 'Heat Stress & Environment'
  },
  {
    id: 'REG-PDO-2026-088',
    title: 'PDO Code of Practice SP-1232: Enhanced Working at Height & 100% Tool Tethering Protocol',
    titleAr: 'المواصفة SP-1232 لشركة تنمية نفط عمان: إلزامية ربط المعدات والحماية المزدوجة من السقوط',
    authority: 'Petroleum Development Oman (PDO)',
    jurisdiction: 'Sultanate of Oman (Concession Block 6)',
    badgeType: 'OFFICIAL',
    topicChips: ['Working at Height', 'Scaffolding Safety', 'Drop Prevention', 'OPAL / CISRS', 'PDO SP-1232'],
    publicationDate: '2026-06-12',
    effectiveDate: '2026-07-01',
    summary: 'Mandates 100% tool lanyard tethering for all tasks above 1.8 meters, certified OPAL/CISRS green scaffold inspection tags renewed every 7 calendar days, and automated harness inspection tracking on elevated hydrocarbon platforms.',
    keyObligations: [
      'Inspect and re-tag all scaffolding platforms every 7 calendar days by certified OPAL/CISRS Scaffold Inspectors',
      'Enforce 100% anti-drop tool lanyards and tether pouches on structural pipe racks and hydrocarbon towers',
      'Conduct third-party NDT certification for personnel basket hoists prior to high-consequence crane lifts',
      'Decommission and retire fall arrest harnesses exceeding 5 years from manufacturer dispatch'
    ],
    sourceUrl: 'https://pdo.co.om/hse/sp-1232-working-at-height',
    sourceName: 'PDO Corporate HSE Standards Portal',
    impactLevel: 'High',
    statutoryFine: 'Immediate site stand-down & contractor demerit points',
    penaltyExposureAed: 7500,
    category: 'Labor & Workforce'
  },
  {
    id: 'REG-CDAA-2026-052',
    title: 'Civil Defence & Ambulance Authority (CDAA): Industrial Hazardous Chemical Warehouse Fire Containment Directive',
    titleAr: 'توجيهات هيئة الدفاع المدني والإسعاف: اشتراطات الوقاية من الحرائق لمستودعات المواد الخطرة',
    authority: 'Civil Defence and Ambulance Authority (CDAA)',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'OFFICIAL',
    topicChips: ['Fire Safety', 'Hazardous Chemicals', 'CDAA Approval', 'Deluge Systems', 'Emergency Readiness'],
    publicationDate: '2026-08-01',
    effectiveDate: '2026-09-01',
    summary: 'Mandatory 24/7 direct telemetry link between Class-A chemical storage alarm panels and the CDAA national industrial operations dispatch. Secondary containment bunds must accommodate at least 110% of largest storage vessel volume.',
    keyObligations: [
      'Install certified telemetry gateway link to CDAA industrial dispatch center',
      'Perform bi-annual hydrostatic flow and pressure tests on foam deluge rings and hydrants',
      'Maintain certified fire warden staffing ratio of 1:25 personnel across all operating shifts',
      'Archive hazardous chemical inventories and SDS sheets in CDAA emergency cloud database'
    ],
    sourceUrl: 'https://cdaa.gov.om/regulations/industrial-fire-2026',
    sourceName: 'CDAA Official Directorate of Prevention',
    impactLevel: 'Critical',
    statutoryFine: 'OMR 10,000 fine & facility closure',
    penaltyExposureAed: 10000,
    category: 'Process Safety & Fire'
  },
  {
    id: 'REG-EA-2026-039',
    title: 'Environment Authority (EA) Royal Decree 114/2001: Digital Hazardous Waste Consignment Manifest Integration with be\'ah',
    titleAr: 'هيئة البيئة - المرسوم السلطاني 114/2001: ربط بيانات النفايات الخطرة رقمياً مع شركة بيئة',
    authority: 'Environment Authority (EA) - Sultanate of Oman',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'OFFICIAL',
    topicChips: ['Environmental ESG', 'Hazardous Waste', 'be\'ah Manifest', 'RD 114/2001', 'Chemical Transport'],
    publicationDate: '2026-09-10',
    effectiveDate: '2026-10-01',
    summary: 'Eliminates paper manifest forms for chemical sludge, oily residue, and spent solvent transport. Every hazardous waste consignment vehicle must be logged on the EA digital manifest portal prior to leaving facility gates.',
    keyObligations: [
      'Log electronic waste manifests before tanker departure to authorized be\'ah hazardous facilities',
      'Verify transport contractor holds active EA hazardous cargo operator permits',
      'Retain digital chain-of-custody disposal certificates for 7 statutory audit years',
      'Submit monthly VOC and toxic emission inventory logs to EA regional branch'
    ],
    sourceUrl: 'https://ea.gov.om/laws/hazardous-waste-manifest-rd114',
    sourceName: 'Environment Authority Official Portal',
    impactLevel: 'High',
    statutoryFine: 'OMR 15,000 fine & environmental permit suspension',
    penaltyExposureAed: 15000,
    category: 'Hazardous Chemicals & Waste'
  },
  {
    id: 'REG-REP-2026-015',
    title: 'Regional Industry Advisory: Gulf Energy Gazette Reports Enhanced Offshore H2S Detection Standards Under Review',
    titleAr: 'تقرير استشاري صناعي: معايير فحص كبريتيد الهيدروجين للمنشآت البحرية قيد المراجعة',
    authority: 'GCC Industrial Safety Review Board / Trade Press',
    jurisdiction: 'GCC Regional / Oman Maritime',
    badgeType: 'REPORTED',
    topicChips: ['H2S Gas Safety', 'Offshore Platforms', 'Industry Alert', 'Sensor Calibration', 'Reported Circular'],
    publicationDate: '2026-10-18',
    effectiveDate: '2026-12-01 (Anticipated)',
    summary: 'Regional industry intelligence indicates Gulf standardization committees are finalizing an update to fixed H2S detector threshold triggers (lowering Low Alarm from 10ppm to 5ppm). Facility managers should audit sensor calibration inventories.',
    keyObligations: [
      'Conduct audit of field H2S sensor sensitivity ranges across drilling rigs and offshore platforms',
      'Review bump-test frequency for fixed and personal wireless gas monitors',
      'Verify availability of positive-pressure 30-min emergency escape breathing devices (EEBD)'
    ],
    sourceUrl: 'https://gcc-safety-advisory.org/reports/h2s-threshold-review-2026',
    sourceName: 'Gulf Industrial Safety Intelligence Bulletin',
    impactLevel: 'Medium',
    statutoryFine: 'Advisory Guidance / Pre-Statutory',
    penaltyExposureAed: 3500,
    category: 'Process Safety & Fire'
  },
  {
    id: 'REG-REP-2026-022',
    title: 'Reported Draft Circular: Oman MoL Proposed Revisions to Contractor HSE Pre-Qualification Criteria',
    titleAr: 'مسودة تعميم: مقترحات وزارة العمل لتحديث معايير التأهيل المسبق للسلامة للمقاولين',
    authority: 'Industry Regulatory Monitor (Reported Draft)',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'REPORTED',
    topicChips: ['Contractor Management', 'Pre-qualification', 'Draft Circular', 'Subcontractor Vetting', 'Industry Alert'],
    publicationDate: '2026-10-22',
    effectiveDate: '2027-01-01 (Proposed)',
    summary: 'Ministry of Labour stakeholder working groups are evaluating a unified mandatory digital passport requirement for all third-party contractor personnel entering petrochemical and high-hazard industrial facilities.',
    keyObligations: [
      'Verify contractor company safety track record and 3-year LTIFR/TRIR filings',
      'Audit subcontractor safety passports ahead of the proposed ministerial decree rollout',
      'Ensure all contractor site supervisors hold accredited IOSH or NEBOSH certifications'
    ],
    sourceUrl: 'https://oman-hse-forum.org/drafts/contractor-prequalification-rev2',
    sourceName: 'Oman HSE Industry Forum Circular',
    impactLevel: 'Medium',
    statutoryFine: 'Draft Consultative Phase',
    penaltyExposureAed: 4000,
    category: 'Labor & Workforce'
  },
  {
    id: 'REG-OPAL-2026-031',
    title: 'OPAL Unified HSE Competency Framework (CAMS) 2026: Mandatory Defensive Driving & Rig Pass Verification',
    titleAr: 'معايير كفاءة الصحة والسلامة الموحدة لأوبال 2026: اعتماد القيادة الوقائية وتصريح العمل في منصات الحفر',
    authority: 'Oman Society for Petroleum Services (OPAL)',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'OFFICIAL',
    topicChips: ['OPAL CAMS', 'Driver Safety', 'Competency Passport', 'Road Safety', 'Vehicle Telemetry'],
    publicationDate: '2026-07-20',
    effectiveDate: '2026-08-15',
    summary: 'Unified requirement for all commercial logistics and heavy goods transport contractors operating within Oman concession roads to maintain valid OPAL Defensive Driving permits and IVMS telemetry verification.',
    keyObligations: [
      'Enforce In-Vehicle Monitoring System (IVMS) real-time speed tracking for all transport fleets',
      'Verify OPAL Driver ID card validity at all concession access security gates',
      'Implement mandatory Journey Management Plans (JMP) for all field trips exceeding 50km',
      'Conduct daily fatigue assessment sobriety checks prior to night driving dispatches'
    ],
    sourceUrl: 'https://opaloman.org/standards/cams-2026-defensive-driving',
    sourceName: 'OPAL Official Standards Directorate',
    impactLevel: 'High',
    statutoryFine: 'Concession Gate Denial & License Revocation',
    penaltyExposureAed: 6000,
    category: 'Labor & Workforce'
  },
  {
    id: 'REG-MOH-2026-018',
    title: 'Ministry of Health (MOH) & MoL: Periodic Occupational Medical Surveillance Protocol for Chemical Handlers',
    titleAr: 'وزارة الصحة ووزارة العمل: بروتوكول الفحص الطبي الدوري الإلزامي للعمال المتداولين للمواد الكيميائية',
    authority: 'Ministry of Health (MOH) & Ministry of Labour (MoL)',
    jurisdiction: 'Sultanate of Oman',
    badgeType: 'OFFICIAL',
    topicChips: ['Occupational Health', 'Medical Surveillance', 'Benzene & VOCs', 'Audiometry', 'MOH Protocol'],
    publicationDate: '2026-04-05',
    effectiveDate: '2026-05-01',
    summary: 'Mandates annual biological exposure monitoring (urinary metabolites and spirometry) for all operators handling Class 1 carcinogens, aromatic hydrocarbons, and solvent degreasers in accordance with Oman Labour Law.',
    keyObligations: [
      'Schedule certified MOH occupational health physician examinations annually for at-risk workforce',
      'Maintain sealed medical surveillance confidentiality records for 30 statutory years',
      'Provide personal respirator fit-testing (quantitative PortaCount) annually for sprayers and loaders',
      'Rotate employees showing early biomarker elevation away from chemical handling zones'
    ],
    sourceUrl: 'https://moh.gov.om/occupational-health/surveillance-protocol',
    sourceName: 'Ministry of Health Directorate of Specialized Health Care',
    impactLevel: 'High',
    statutoryFine: 'OMR 8,000 fine & medical stop-work order',
    penaltyExposureAed: 8000,
    category: 'Labor & Workforce'
  }
];

// In-memory server-side legal register ledger for synced items
const inMemoryLegalRegister: any[] = [];

// GET /api/regulatory/latest
regulatoryRouter.get('/latest', (req: Request, res: Response) => {
  const { refresh, category, badgeType } = req.query;

  if (refresh === 'true' || !lastCheckedTimestamp) {
    lastCheckedTimestamp = new Date().toISOString();
  }

  let filtered = [...MOCK_REGULATORY_UPDATES];

  if (category && typeof category === 'string' && category !== 'ALL') {
    filtered = filtered.filter(u => u.category === category || u.topicChips.includes(category));
  }

  if (badgeType && typeof badgeType === 'string' && badgeType !== 'ALL') {
    filtered = filtered.filter(u => u.badgeType === badgeType.toUpperCase());
  }

  const officialCount = MOCK_REGULATORY_UPDATES.filter(u => u.badgeType === 'OFFICIAL').length;
  const reportedCount = MOCK_REGULATORY_UPDATES.filter(u => u.badgeType === 'REPORTED').length;

  res.json({
    status: 'success',
    lastChecked: lastCheckedTimestamp,
    totalCount: filtered.length,
    officialCount,
    reportedCount,
    registeredCount: inMemoryLegalRegister.length,
    updates: filtered
  });
});

// POST /api/regulatory/add-legal-register
regulatoryRouter.post('/add-legal-register', async (req: Request, res: Response) => {
  try {
    const {
      updateId,
      title,
      authority,
      obligationText,
      operationalCategory,
      assignedSite,
      responsibleRole,
      penaltyExposureAed,
      nextAuditDueDate,
      complianceStatus,
      userId,
      userName
    } = req.body;

    if (!updateId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: updateId and title are mandatory.'
      });
    }

    const obligationId = `OBL-${Date.now().toString().slice(-6)}`;
    const newEntry = {
      id: obligationId,
      regulationId: updateId,
      regulationTitle: title,
      authority: authority || 'Oman Regulatory Authority',
      obligationText: obligationText || `Statutory obligation for ${title}`,
      operationalCategory: operationalCategory || 'Workforce Safety',
      penaltyExposureAed: Number(penaltyExposureAed) || 5000,
      responsibleRole: responsibleRole || 'Site HSE Manager',
      assignedSite: assignedSite || 'Mina Al Fahal Refinery & Terminal',
      complianceStatus: complianceStatus || 'Fully Compliant',
      nextAuditDueDate: nextAuditDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      addedBy: userName || userId || 'Authorized Enterprise Officer'
    };

    inMemoryLegalRegister.unshift(newEntry);

    // Audit log this statutory legal register mutation
    await logAccess(userId || 'anonymous', 'ADD_TO_LEGAL_REGISTER', {
      obligationId,
      updateId,
      title,
      assignedSite: newEntry.assignedSite,
      responsibleRole: newEntry.responsibleRole
    });

    return res.status(201).json({
      success: true,
      message: `Successfully mapped update ${updateId} to enterprise Legal Register under ID ${obligationId}`,
      obligation: newEntry
    });
  } catch (err: any) {
    console.error('[REGULATORY API] Error adding to legal register:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process Legal Register mapping.'
    });
  }
});
