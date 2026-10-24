import { TenantOrg, OperationalSite } from '../contexts/TenantContext';
import { UserProfile, Incident, IncidentCapaAction } from '../types';
import { Permit } from './simopsService';
import { offlineStorage, CachedPermitRecord } from './offlineStorage';

// -------------------------------------------------------------
// 1. Flagship Enterprise Tenant: Gulf Energy & Infrastructure Group
// -------------------------------------------------------------
export const GULF_ENERGY_TENANT: TenantOrg = {
  id: 'tenant-geig',
  name: 'Gulf Energy & Infrastructure Group',
  shortName: 'Gulf Energy',
  country: 'GCC',
  code: 'GCC-GEIG-01',
  sector: 'Integrated Energy, Oil & Gas, Maritime & Industrial Infrastructure',
  brandColor: '#059669', // Emerald GCC Theme
  sitesCount: 3
};

// -------------------------------------------------------------
// 2. The 3 Required Operating Sites
// -------------------------------------------------------------
export const GULF_ENERGY_SITES: OperationalSite[] = [
  {
    id: 'site-fahud-west',
    tenantId: 'tenant-geig',
    name: 'Fahud-West Gas Station (Oman)',
    code: 'OMN-FHD-02',
    country: 'Oman',
    location: 'Ad Dhahirah Governorate, Sultanate of Oman (PDO Block 6 Concession)',
    coordinates: '22.3167, 56.4833',
    type: 'Gas Processing',
    riskLevel: 'High Risk',
    heatStressLevel: 4,
    heatStressTemp: '44.8°C',
    h2sPpm: '1.2 ppm',
    activePermitsCount: 14,
    openIncidentsCount: 2,
    headcountOnSite: 1150
  },
  {
    id: 'site-ruwais-polyolefin',
    tenantId: 'tenant-geig',
    name: 'Al-Ruwais Polyolefin Asset (UAE)',
    code: 'UAE-RUW-03',
    country: 'UAE',
    location: 'Ruwais Industrial Complex, Al Dhafra Region, Abu Dhabi, UAE',
    coordinates: '24.1107, 52.7306',
    type: 'Refinery',
    riskLevel: 'High Risk',
    heatStressLevel: 3,
    heatStressTemp: '42.1°C',
    h2sPpm: '0.4 ppm',
    activePermitsCount: 22,
    openIncidentsCount: 1,
    headcountOnSite: 2480
  },
  {
    id: 'site-ras-alkhair',
    tenantId: 'tenant-geig',
    name: 'Ras Al-Khair Facility (KSA)',
    code: 'KSA-RAK-01',
    country: 'GCC',
    location: 'Ras Al-Khair Special Economic Zone & Maritime Complex, Eastern Province, KSA',
    coordinates: '27.5333, 49.1667',
    type: 'Industrial Port',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '38.5°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 11,
    openIncidentsCount: 1,
    headcountOnSite: 1890
  }
];

// -------------------------------------------------------------
// 3. 10 Enterprise Users Across Tiers
// -------------------------------------------------------------
export const GULF_ENERGY_USERS: UserProfile[] = [
  // 1. Site Safety Officer (UAE)
  {
    id: 'usr-tariq-hashemi',
    name: 'Tariq Al-Hashemi',
    email: 'tariq.hashemi@gulfenergy.com',
    role: 'HSE_Officer',
    department: 'Site Safety Operations - Al-Ruwais Polyolefin',
    safetyScore: 1240,
    recentIncidents: ['Conducted H2S evacuation drill', 'Investigated offsites valve packing leak'],
    observations: [],
    certifications: [
      { name: 'NEBOSH International Diploma in OHS', status: 'Valid', expiryDate: '2028-04-15' },
      { name: 'OSHAD General Safety Practitioner', status: 'Valid', expiryDate: '2027-09-30' }
    ],
    achievements: [
      { id: 'ach-1', title: 'Life Saver', description: 'Zero lost time injuries in supervised zone for 365 days', dateEarned: '2026-06-01', icon: 'Shield', tier: 'Gold' }
    ]
  },
  // 2. Permit Issuer & Area Authority (UAE)
  {
    id: 'usr-mansoor-ketbi',
    name: 'Eng. Mansoor Al-Ketbi',
    email: 'mansoor.ketbi@gulfenergy.com',
    role: 'Site_HSE_Manager',
    department: 'Operations & Control of Work - Al-Ruwais',
    safetyScore: 1450,
    recentIncidents: ['Authorized Flare Header Hot Tap Tie-In'],
    observations: [],
    certifications: [
      { name: 'Certified Area Authority (PTW Level 3)', status: 'Valid', expiryDate: '2027-11-20' },
      { name: 'Authorized Gas Tester Level I (AGT-I)', status: 'Valid', expiryDate: '2027-05-18' }
    ],
    achievements: [
      { id: 'ach-2', title: 'Zero Clash Champion', description: 'Validated 500+ SIMOPS permits without operational conflict', dateEarned: '2026-08-10', icon: 'CheckCircle', tier: 'Gold' }
    ]
  },
  // 3. Lead Occupational Health Physician (Oman)
  {
    id: 'usr-mariam-balushi',
    name: 'Dr. Mariam Al-Balushi',
    email: 'dr.mariam@gulfenergy.com',
    role: 'HSE_Officer',
    department: 'Occupational Health & Industrial Hygiene - Oman Assets',
    safetyScore: 980,
    recentIncidents: ['Managed thermal heat strain case in Fahud field clinic'],
    observations: [],
    certifications: [
      { name: 'Fellow of the Faculty of Occupational Medicine (FFOM)', status: 'Valid', expiryDate: '2029-01-01' },
      { name: 'Oman Medical Specialty Board (OMSB) Certified', status: 'Valid', expiryDate: '2028-12-31' },
      { name: 'OSHAD Occupational Health Assessor', status: 'Valid', expiryDate: '2027-08-15' }
    ],
    achievements: [
      { id: 'ach-3', title: 'Wellness Vanguard', description: 'Implemented WBGT Heat Stress biometric monitoring protocol', dateEarned: '2026-05-20', icon: 'HeartPulse', tier: 'Gold' }
    ]
  },
  // 4. Subcontractor Construction Lead (Al-Futtaim Engineering)
  {
    id: 'usr-suresh-pillai',
    name: 'Suresh Pillai',
    email: 'suresh.pillai@alfuttaim-contractors.com',
    role: 'Site_Supervisor',
    department: 'Al-Futtaim EPC Construction Consortium',
    safetyScore: 890,
    recentIncidents: ['Supervised crane rigging setup in heavy modules area'],
    observations: [],
    certifications: [
      { name: 'IOSH Managing Safely in Construction', status: 'Valid', expiryDate: '2027-03-10' },
      { name: 'Certified Rigging & Slinging Supervisor (LEEA Level 3)', status: 'Valid', expiryDate: '2027-10-05' }
    ],
    achievements: []
  },
  // 5. Senior Permit Issuer & Gas Tester (Oman Fahud-West)
  {
    id: 'usr-salim-harthy',
    name: 'Salim Al-Harthy',
    email: 'salim.harthy@gulfenergy.com',
    role: 'Site_Supervisor',
    department: 'Gas Production & Wellhead Gathering - Fahud-West',
    safetyScore: 1120,
    recentIncidents: ['Initiated emergency ESD for hydraulic line pressure bleed'],
    observations: [],
    certifications: [
      { name: 'Authorized Gas Tester Level III (AGT-III Sour Gas Specialist)', status: 'Valid', expiryDate: '2027-06-30' },
      { name: 'PDO PTW Permit Signatory Level 2', status: 'Valid', expiryDate: '2027-12-15' }
    ],
    achievements: []
  },
  // 6. Field HSE Compliance & Inspection Officer (UAE)
  {
    id: 'usr-fatima-kaabi',
    name: 'Fatima Al-Kaabi',
    email: 'fatima.kaabi@gulfenergy.com',
    role: 'HSE_Officer',
    department: 'HSE Assurance & Compliance Audit - UAE',
    safetyScore: 1310,
    recentIncidents: ['Issued Stop Work Authority for unanchored scaffold board'],
    observations: [],
    certifications: [
      { name: 'ISO 45001:2018 Lead Auditor (IRCA Certified)', status: 'Valid', expiryDate: '2028-02-28' },
      { name: 'NEBOSH Environmental Management', status: 'Valid', expiryDate: '2027-07-22' }
    ],
    achievements: [
      { id: 'ach-4', title: 'Inspection Ace', description: 'Logged 250+ digital field observations in mobile PWA offline mode', dateEarned: '2026-07-14', icon: 'ClipboardCheck', tier: 'Gold' }
    ]
  },
  // 7. Operations Superintendent & Issuer (KSA Ras Al-Khair)
  {
    id: 'usr-abdulaziz-ghamdi',
    name: 'Abdulaziz Al-Ghamdi',
    email: 'abdulaziz.ghamdi@gulfenergy.com',
    role: 'Site_HSE_Manager',
    department: 'Marine Fabrication & Port Terminals - Ras Al-Khair',
    safetyScore: 1190,
    recentIncidents: ['Paused crawler crane operations due to soil compaction verification'],
    observations: [],
    certifications: [
      { name: 'Saudi Civil Defence High-Hazard Facility Safety Officer', status: 'Valid', expiryDate: '2028-06-15' },
      { name: 'Aramco SAPMT Work Permit Receiver Certified', status: 'Valid', expiryDate: '2027-11-01' }
    ],
    achievements: []
  },
  // 8. Lead Risk & Root Cause Investigation Specialist (Group Level)
  {
    id: 'usr-vikram-malhotra',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@gulfenergy.com',
    role: 'Regional_HSE_Director',
    department: 'Group Risk, Process Safety & Causal Analysis',
    safetyScore: 1680,
    recentIncidents: ['Chaired 5-Why & Bowtie analysis on high-pressure line failure'],
    observations: [],
    certifications: [
      { name: 'Certified Safety Professional (CSP - BCSP USA)', status: 'Valid', expiryDate: '2029-03-31' },
      { name: 'TapRooT Advanced Root Cause Team Leader', status: 'Valid', expiryDate: '2028-05-19' }
    ],
    achievements: [
      { id: 'ach-5', title: 'Master Investigator', description: 'Closed 50+ major high-potential investigations with zero repeat incidents', dateEarned: '2026-04-30', icon: 'BrainCircuit', tier: 'Platinum' }
    ]
  },
  // 9. Environmental & Thermal Heat Stress Specialist
  {
    id: 'usr-khalid-dhaheri',
    name: 'Khalid Al-Dhaheri',
    email: 'khalid.dhaheri@gulfenergy.com',
    role: 'Environmental_Officer',
    department: 'Environmental Management & Climate Resilience',
    safetyScore: 940,
    recentIncidents: ['Triggered Black Flag WBGT Midday Heat Work Suspension'],
    observations: [],
    certifications: [
      { name: 'Certified Environmental Systems Lead (ISO 14001:2015)', status: 'Valid', expiryDate: '2028-08-14' },
      { name: 'OSHA / OSHAD Heat Illness Prevention Champion', status: 'Valid', expiryDate: '2027-04-10' }
    ],
    achievements: []
  },
  // 10. Contractor Mechanical Supervisor (Petrofac KSA)
  {
    id: 'usr-zaid-otaibi',
    name: 'Zaid Al-Otaibi',
    email: 'zaid.otaibi@petrofac-contractors.com',
    role: 'Worker',
    department: 'Piping & Mechanical Subcontractor Services',
    safetyScore: 820,
    recentIncidents: ['Reported burred grating hazard in module 3'],
    observations: [],
    certifications: [
      { name: 'H2S Breathing Apparatus Escape Set (BAES)', status: 'Valid', expiryDate: '2027-02-15' },
      { name: 'Flange Joint Integrity Specialist (ASME PCC-1)', status: 'Valid', expiryDate: '2027-09-01' }
    ],
    achievements: []
  }
];

// -------------------------------------------------------------
// 4. 6 Realistic Incident Records
// -------------------------------------------------------------
export const GULF_ENERGY_INCIDENTS: Incident[] = [
  // Incident 1: Lost Time Injury in Oman (Full 5-Why & MoL Notification)
  {
    id: 'INC-2026-OMN-0891',
    type: 'Lost Time Injury',
    classification: 'Lost Time Injury',
    description: 'During scheduled high-pressure hydraulic actuation testing of the Wellhead Choke Valve (HCV-301) on Gathering Manifold Block 6, a 1/2-inch braided steel flexible hydraulic supply line ruptured at the crimped swivel collar under 3,200 PSI working pressure. The pressurized whipping hose struck a mechanical maintenance technician on the lower left leg, causing a compound fibula fracture and tissue laceration.',
    immediateActionsTaken: 'Emergency shutdown (ESD-1) immediately activated by area operator; pressure isolated and line vented to zero energy; primary trauma stabilization applied by on-site paramedic; splinted and immobilized; worker medevaced via PDO/Royal Oman Police air ambulance to Nizwa Regional Hospital.',
    location: 'Fahud-West Gas Station (Oman) · Wellhead Gathering Manifold Block 6',
    jurisdiction: 'Oman',
    severity: 'Critical',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-02T08:35:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy (Senior Permit Issuer & Gas Tester)',
    reportDeadline: '2026-10-03T08:35:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        caption: 'Failed flexible hydraulic line showing parted crimp ferrule and wire braid fatigue fracture.',
        timestamp: '2026-10-02T09:15:00Z',
        uploadedBy: 'Salim Al-Harthy'
      },
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        caption: 'Choke manifold HCV-301 isolation barrier where whipping occurred; barricade tape erected.',
        timestamp: '2026-10-02T09:30:00Z',
        uploadedBy: 'Salim Al-Harthy'
      }
    ],
    fiveWhys: [
      {
        step: 1,
        whyText: 'Why did the worker sustain a lower limb fracture? Struck directly by a flailing 1/2" flexible steel hydraulic hose whipping under 3,200 PSI discharge pressure.',
        verificationEvidence: 'Scene physical inspection and fracture marks on manifold structure matching hose fitting dimensions.'
      },
      {
        step: 2,
        whyText: 'Why did the flexible hydraulic hose flail violently? The hose collar parted from the swaged male BSPP fitting end due to mechanical fatigue at the hose-to-crimp junction.',
        verificationEvidence: 'Metallurgical photo evidence of inner elastomer lining tears and stripped outer wire braid.'
      },
      {
        step: 3,
        whyText: 'Why did the crimp fitting part under normal operating pressure? The flexible hose was past its design cycle fatigue life and exhibited micro-cracking from unmitigated pressure pulsation spikes.',
        verificationEvidence: 'Pressure log recorder showing pressure ripple from positive displacement pump P-102.'
      },
      {
        step: 4,
        whyText: 'Why was an aged, fatigue-degraded flexible hose still installed in high-pressure service? The preventive maintenance management system (CMMS) did not track cumulative hydraulic pulse cycle counts or shelf-life for flexible assemblies.',
        verificationEvidence: 'SAP PM work order history: hose was installed 42 months prior with only visual external checks scheduled.'
      },
      {
        step: 5,
        whyText: 'Root Cause: Absence of an enterprise lifecycle replacement policy and mandatory whip-check restraining cables on flexible lines > 1,000 PSI.',
        verificationEvidence: 'Company Mechanical Integrity Standard SOP-MEC-412 lacked mandatory whip-check requirement for testing manifolds.'
      }
    ],
    rootCauseConclusion: 'Root Cause: Inadequate asset lifecycle governance for high-pressure flexible hoses in CMMS, compounded by missing secondary physical whip-check restraining cables as mandated by Oman MD 286/2008 and PDO PR-1148.',
    fishboneFactors: {
      manpower: [
        'Technician positioned within line-of-fire during live pressure actuation test',
        'Pressure test safety perimeter not cleared before pump start'
      ],
      machine: [
        'Fatigue failure of crimp ferrule on 3,200 PSI hydraulic hose',
        'Absence of whip-check safety restraint cables'
      ],
      method: [
        'Work procedure did not require pressure step-testing and remote actuation',
        'CMMS PM schedule lacked retirement criteria for flexible assemblies'
      ],
      material: [
        'Swivel fitting susceptible to cyclic micro-fatigue under pulse loads'
      ],
      measurement: [
        'Pressure gauge dampener failed, allowing pressure shocks to transmit directly to hose collar'
      ],
      environment: [
        'High ambient heat (44°C) Accelerated thermal degradation of inner rubber sleeve'
      ]
    },
    capaActions: [
      {
        id: 'capa-omn-01',
        description: 'Mandate installation of certified stainless steel whip-check restraining cables on all flexible lines operating above 1,000 PSI across Fahud-West.',
        assignee: 'Suresh Pillai',
        targetDate: '2026-10-15',
        priority: 'P1 - Critical',
        status: 'In Progress',
        type: 'Corrective'
      },
      {
        id: 'capa-omn-02',
        description: 'Update SAP PM master data to enforce maximum 24-month hard retirement cycle for all high-pressure hydraulic flex lines.',
        assignee: 'Eng. Mansoor Al-Ketbi',
        targetDate: '2026-10-25',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Preventive'
      },
      {
        id: 'capa-omn-03',
        description: 'Submit formal Oman Ministry of Labour Statutory Notification Form (MD 286/2008 Schedule 1) within regulatory 24-hour window.',
        assignee: 'Dr. Mariam Al-Balushi',
        targetDate: '2026-10-03',
        priority: 'P1 - Critical',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-10-02T08:35:00Z',
        actorId: 'usr-salim-harthy',
        actorName: 'Salim Al-Harthy',
        action: 'Incident Reported',
        details: 'Initial emergency notification logged via Mobile PWA Field App.'
      },
      {
        timestamp: '2026-10-02T11:00:00Z',
        actorId: 'usr-vikram-malhotra',
        actorName: 'Dr. Vikram Malhotra',
        action: 'Investigation Initiated',
        details: 'Formal 5-Why and Fishbone Causal Panel formed in accordance with Oman MoL guidelines.'
      }
    ]
  },

  // Incident 2: Confined Space H2S Near-Miss in UAE (OSHAD Form G Draft)
  {
    id: 'INC-2026-UAE-0419',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During preparation for authorized confined space entry into De-ethanizer Overhead Reflux Drum (V-102) for internal ultrasonic shell thickness measurement, the Lead Authorized Gas Tester lowered an aspirated multi-gas probe into the lower vessel sump. The detector sounded a high-level audio-visual alarm indicating H2S concentration of 14.8 PPM (surpassing the 10.0 PPM UAE statutory ceiling) along with 0.0% LEL and 20.8% O2.',
    immediateActionsTaken: 'Entry instantly halted; Standby Safety Watch ordered all personnel back to muster point; Positive mechanical spade isolations inspected; Found weeping bypass valve on sour condensate purge header; Valve chained and blinded; Vessel re-purged with dry nitrogen for 6 hours followed by forced air mechanical eductors.',
    location: 'Al-Ruwais Polyolefin Asset (UAE) · Unit 42 Offsites Vessel V-102',
    jurisdiction: 'Abu Dhabi',
    severity: 'High',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-03T07:45:00Z',
    reportedBy: 'usr-tariq-hashemi',
    reportedByName: 'Tariq Al-Hashemi (Senior Site Safety Officer)',
    reportDeadline: '2026-10-04T07:45:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        caption: 'Calibrated Honeywell BW Ultra multi-gas instrument showing peak 14.8 PPM H2S reading at sump manway.',
        timestamp: '2026-10-03T08:00:00Z',
        uploadedBy: 'Tariq Al-Hashemi'
      }
    ],
    fiveWhys: [
      {
        step: 1,
        whyText: 'Why did the multi-gas detector alarm? H2S concentration of 14.8 PPM accumulated inside vessel V-102 lower dished head.',
        verificationEvidence: 'Data log downloaded from multi-gas detector serial BW-ULTRA-7741.'
      },
      {
        step: 2,
        whyText: 'Why was sour gas present in a tagged, isolated vessel? Residual sour condensate bypassed a 2" bypass valve on the condensate blowdown header.',
        verificationEvidence: 'Thermal imaging camera revealed cold liquid seepage across closed gate valve bonnet.'
      },
      {
        step: 3,
        whyText: 'Why was the bypass valve leaking through? The valve disc suffered internal wire-drawing seat erosion and was not positively isolated by a spade blind.',
        verificationEvidence: 'Physical disassembly revealed 3mm scoring on stellite seat face.'
      },
      {
        step: 4,
        whyText: 'Why was positive mechanical spade isolation omitted for this bypass? The LOTO Isolation Schedule (ICC-402) mistakenly classified the line as non-hazardous utility nitrogen.',
        verificationEvidence: 'P&ID marking error on P&ID Rev 4.1 versus actual field line routing.'
      },
      {
        step: 5,
        whyText: 'Root Cause: Failure to perform physical walkdown verification of P&ID line tracers before signing off the LOTO positive isolation boundary.',
        verificationEvidence: 'LOTO permit lacked secondary independent field walkdown signature.'
      }
    ],
    rootCauseConclusion: 'Root Cause: Discrepancy between CAD P&ID diagram and physical line routing allowed an unblinded sour condensate bypass valve to pass toxic H2S into the confined vessel.',
    fishboneFactors: {
      manpower: ['LOTO isolator did not perform physical line tracing to header origin'],
      machine: ['Internal seat scoring on 2-inch gate valve MOV-104'],
      method: ['LOTO standard operating procedure allowed single-block valve isolation without spade blind'],
      material: ['High sour condensate H2S concentration (5,000 ppm dissolved in fluid)'],
      measurement: ['Initial gas sample taken only at upper manway, missing heavier-than-air H2S at bottom head'],
      environment: ['Night cooling caused condensation of volatile mercaptans inside deadleg']
    },
    capaActions: [
      {
        id: 'capa-uae-01',
        description: 'Complete OSHAD-SF Form G (Serious Incident Notification) submission to Abu Dhabi Public Health Centre (ADPHC) Mechanism 11.0.',
        assignee: 'Fatima Al-Kaabi',
        targetDate: '2026-10-04',
        priority: 'P1 - Critical',
        status: 'In Progress',
        type: 'Corrective'
      },
      {
        id: 'capa-uae-02',
        description: 'Install positive spectacle blind on 2" bypass line and conduct helium leak test prior to entry re-authorization.',
        assignee: 'Eng. Mansoor Al-Ketbi',
        targetDate: '2026-10-05',
        priority: 'P1 - Critical',
        status: 'In Progress',
        type: 'Corrective'
      },
      {
        id: 'capa-uae-03',
        description: 'Conduct comprehensive As-Built P&ID walkdown and line tagging across all Unit 42 offsites vessels.',
        assignee: 'Dr. Vikram Malhotra',
        targetDate: '2026-10-30',
        priority: 'P2 - High',
        status: 'Open',
        type: 'Preventive'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-10-03T07:45:00Z',
        actorId: 'usr-tariq-hashemi',
        actorName: 'Tariq Al-Hashemi',
        action: 'Incident Reported',
        details: 'Near-miss logged with high potential rating (SIF exposure).'
      }
    ]
  },

  // Incident 3: Minor First Aid - Hand Laceration (KSA)
  {
    id: 'INC-2026-KSA-0112',
    type: 'First Aid',
    classification: 'First Aid',
    description: 'A pipefitter assistant sustained a superficial 3cm laceration across the right palm while handling newly fabricated galvanized steel pipe rack grating. The edge possessed burrs left after plasma flame cutting.',
    immediateActionsTaken: 'Worker escorted to onsite medical clinic; wound irrigated with sterile saline, butterfly suture strip applied, tetanus booster validated, cut-resistant Level 5 gloves issued; returned to normal light duties after 30 minutes.',
    location: 'Ras Al-Khair Facility (KSA) · Fabrication Yard Module 3',
    jurisdiction: 'KSA',
    severity: 'Low',
    potentialSeverity: 'Low',
    status: 'Closed',
    timestamp: '2026-09-28T14:15:00Z',
    reportedBy: 'usr-zaid-otaibi',
    reportedByName: 'Zaid Al-Otaibi (Contractor Mechanical Supervisor)',
    reportDeadline: '2026-09-29T14:15:00Z',
    coordinates: { lat: 27.5333, lng: 49.1667 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Inadequate grinding and deburring inspection by steel fabrication subcontractor prior to material release.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-ksa-01',
        description: 'Enforce mandatory ISO 13997 Cut Level 5 impact gloves for all steel handling crews in Module 3.',
        assignee: 'Zaid Al-Otaibi',
        targetDate: '2026-10-01',
        priority: 'P3 - Medium',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-09-28T14:15:00Z',
        actorId: 'usr-zaid-otaibi',
        actorName: 'Zaid Al-Otaibi',
        action: 'Incident Reported',
        details: 'First-aid treated and closed.'
      }
    ]
  },

  // Incident 4: Minor First Aid - Heat Exhaustion Warning (UAE)
  {
    id: 'INC-2026-UAE-0518',
    type: 'First Aid',
    classification: 'First Aid',
    description: 'During afternoon scaffold dismantling, a contract rigger reported dizziness, heavy sweating, and mild headache under ambient WBGT heat flag Yellow (31.8°C). Core temperature measured 37.9°C at the air-conditioned rest shelter.',
    immediateActionsTaken: 'Worker rested in cooled climate trailer; oral electrolyte hydration therapy administered; vital signs monitored for 45 minutes; symptoms fully resolved; rehydration protocol reviewed with entire crew.',
    location: 'Al-Ruwais Polyolefin Asset (UAE) · Polypropylene Extrusion Line',
    jurisdiction: 'Abu Dhabi',
    severity: 'Low',
    potentialSeverity: 'Medium',
    status: 'Closed',
    timestamp: '2026-09-29T13:40:00Z',
    reportedBy: 'usr-khalid-dhaheri',
    reportedByName: 'Khalid Al-Dhaheri (Environmental Specialist)',
    reportDeadline: '2026-09-30T13:40:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Worker skipped mandatory 15-minute rest/hydration cycle to finish scaffold dismantling ahead of shift change.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-uae-04',
        description: 'Supervisor to enforce buddy system and biometric heart rate alerts during WBGT Flag Yellow/Orange conditions.',
        assignee: 'Khalid Al-Dhaheri',
        targetDate: '2026-10-05',
        priority: 'P2 - High',
        status: 'Verified_Closed',
        type: 'Preventive'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-09-29T13:40:00Z',
        actorId: 'usr-khalid-dhaheri',
        actorName: 'Khalid Al-Dhaheri',
        action: 'Incident Closed',
        details: 'Hydration recovery completed successfully.'
      }
    ]
  },

  // Incident 5: Equipment Damage - Forklift Mast Strike (Oman)
  {
    id: 'INC-2026-OMN-0944',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'A 5-tonne diesel counterbalance forklift reversing in Warehouse Bay 4 clipped an overhead instrument cable ladder tray while carrying an oversized crated control valve. The tray deflected 120mm; no personnel were injured and no cables were severed.',
    immediateActionsTaken: 'Forklift operations suspended; structural rigger inspected tray anchor brackets; temporary scaffolding support installed; electrical cabling megger-tested without fault; driver submitted to post-incident drug/alcohol test (clean).',
    location: 'Fahud-West Gas Station (Oman) · Logistics Warehouse & Spares Depot',
    jurisdiction: 'Oman',
    severity: 'Low',
    potentialSeverity: 'High',
    status: 'CAPA Pending',
    timestamp: '2026-09-30T10:20:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy',
    reportDeadline: '2026-10-01T10:20:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Absence of physical height clearance limiters (goalposts) and marshaling spotter for oversized crate transit.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-04',
        description: 'Fabricate and install yellow steel clearance barrier goalposts at Warehouse Bay 4 entry marked with 3.8m limit.',
        assignee: 'Suresh Pillai',
        targetDate: '2026-10-18',
        priority: 'P2 - High',
        status: 'In Progress',
        type: 'Corrective'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-09-30T10:20:00Z',
        actorId: 'usr-salim-harthy',
        actorName: 'Salim Al-Harthy',
        action: 'Incident Logged',
        details: 'Equipment strike investigation opened.'
      }
    ]
  },

  // Incident 6: Equipment Incident - Crane Outrigger Settling (KSA)
  {
    id: 'INC-2026-KSA-0188',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During pre-lift proof loading of a 150-Tonne Demag Crawler Crane hoisting an 18-tonne subsea spool piece, the front-left outrigger steel spreader mat settled 45mm into uncompacted marl backfill near the quay wall. The crane boom angle indicator tipped 1.2 degrees.',
    immediateActionsTaken: 'Load immediately lowered to ground in controlled sequence; crane operator engaged slew lock; civil engineering team mobilized for dynamic cone penetrometer soil bearing capacity test; found void beneath subsurface gravel layer.',
    location: 'Ras Al-Khair Facility (KSA) · Heavy Lift Berth 2',
    jurisdiction: 'KSA',
    severity: 'Low',
    potentialSeverity: 'Critical',
    status: 'Under Triage',
    timestamp: '2026-10-01T15:10:00Z',
    reportedBy: 'usr-abdulaziz-ghamdi',
    reportedByName: 'Abdulaziz Al-Ghamdi (Operations Superintendent)',
    reportDeadline: '2026-10-02T15:10:00Z',
    coordinates: { lat: 27.5333, lng: 49.1667 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Ground compaction test certificate was outdated by 6 months; recent underground storm drainage trenching undermined soil density.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-ksa-02',
        description: 'Complete soil compaction re-grouting and require third-party plate load test before crane re-mobilization.',
        assignee: 'Abdulaziz Al-Ghamdi',
        targetDate: '2026-10-12',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Corrective'
      }
    ],
    auditLog: [
      {
        timestamp: '2026-10-01T15:10:00Z',
        actorId: 'usr-abdulaziz-ghamdi',
        actorName: 'Abdulaziz Al-Ghamdi',
        action: 'Incident Reported',
        details: 'Critical lift stopped by crane crew.'
      }
    ]
  },

  // Incident 7: Near Miss - Scaffolding Coupler Drop (UAE)
  {
    id: 'INC-2026-UAE-0622',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During 18m scaffolding erection on the Polyethylene Reactor Tower (R-201), an unsecured swivel scaffolding coupler slipped from a rigger\'s hand and fell 14 meters onto the secondary containment deck. The drop zone was barricaded; no workers were struck.',
    immediateActionsTaken: 'Work stopped immediately at height; rigger tethering bags and 100% tool lanyard compliance verified; scaffold crew stood down for 30-minute drop prevention toolbox talk; safety net installed below working platform.',
    location: 'Al-Ruwais Polyolefin Asset (UAE) · Reactor R-201 Structure',
    jurisdiction: 'Abu Dhabi',
    severity: 'Medium',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-04T11:20:00Z',
    reportedBy: 'usr-tariq-hashemi',
    reportedByName: 'Tariq Al-Hashemi',
    reportDeadline: '2026-10-05T11:20:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: [],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80',
        caption: 'Dropped coupler impact point on concrete containment plinth.',
        timestamp: '2026-10-04T11:35:00Z',
        uploadedBy: 'Tariq Al-Hashemi'
      }
    ],
    fiveWhys: [
      { step: 1, whyText: 'Why did the scaffolding fitting fall? Slipped from worker\'s gloved hand during transfer at 18m height.', verificationEvidence: 'Physical inspection and witness statements.' },
      { step: 2, whyText: 'Why was the fitting handled manually without mechanical hoist? Crane hook was occupied on flare piping lift.', verificationEvidence: 'SIMOPS log clash.' },
      { step: 3, whyText: 'Why was no tool lanyard or parts pouch used? The worker\'s tether bag was full and spare couplers were carried loosely.', verificationEvidence: 'Tool bag inspection.' }
    ],
    rootCauseConclusion: 'Failure to use tethered parts pouches for loose scaffolding components at heights > 10m.',
    fishboneFactors: { manpower: ['Worker carried loose fittings'], machine: [], method: ['Lacking mandatory parts pouch rule'], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-uae-07',
        description: 'Provide certified zip-lock tether pouches for all scaffolding crews across Al-Ruwais asset.',
        assignee: 'Eng. Mansoor Al-Ketbi',
        targetDate: '2026-10-14',
        priority: 'P2 - High',
        status: 'In Progress',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-04T11:20:00Z', actorId: 'usr-tariq-hashemi', actorName: 'Tariq Al-Hashemi', action: 'Incident Reported', details: 'Dropped object near-miss logged.' }]
  },

  // Incident 8: Medical Treatment Case - Acid Splash from Sample Point (Oman)
  {
    id: 'INC-2026-OMN-1014',
    type: 'Medical Treatment',
    classification: 'Medical Treatment',
    description: 'A laboratory chemist taking an organic chloride process sample from Sampling Station SS-04 experienced a pressurized back-spray of dilute wash acid due to a blocked needle vent needle. The chemical droplet breached the worker\'s face shield edge, splashing the left eyebrow.',
    immediateActionsTaken: 'Emergency eyewash / drench shower activated within 8 seconds; flushed for 20 minutes continuous; escort to Fahud clinic; ophthalmic examination confirmed no corneal abrasion; soothing eye drops prescribed; worker cleared for modified duty.',
    location: 'Fahud-West Gas Station (Oman) · Chemical Injection Skid C-04',
    jurisdiction: 'Oman',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'CAPA Pending',
    timestamp: '2026-10-05T09:15:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy',
    reportDeadline: '2026-10-06T09:15:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Sampling station closed-loop needle septum port was fouled with scale, causing localized pressure build-up upon vial insertion.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-08',
        description: 'Retrofit closed-loop Dopak sampling cabinets with positive interlock pressure relief valves.',
        assignee: 'Dr. Mariam Al-Balushi',
        targetDate: '2026-10-20',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-05T09:15:00Z', actorId: 'usr-salim-harthy', actorName: 'Salim Al-Harthy', action: 'Incident Logged', details: 'Medical treatment case recorded.' }]
  },

  // Incident 9: Environmental Spill - 25 Liters Hydraulic Fluid Contained (KSA)
  {
    id: 'INC-2026-KSA-0219',
    type: 'Environmental Incident',
    classification: 'Process Safety Event',
    description: 'Burst O-ring seal on a mobile hydraulic power unit (HPU-02) resulted in 25 liters of synthetic hydraulic fluid discharging onto paved concrete hardstanding. Spill stayed entirely within curbed containment and was captured by absorbent pads before reaching storm drains.',
    immediateActionsTaken: 'HPU shut down immediately; spill kit deployed within 2 minutes; drain gully covers sealed with magnetic neoprene covers; contaminated absorbent recovered into UN-certified hazardous waste drums; zero discharge to marine or soil environment.',
    location: 'Ras Al-Khair Facility (KSA) · Dry Dock Gate 1',
    jurisdiction: 'KSA',
    severity: 'Low',
    potentialSeverity: 'Medium',
    status: 'Closed',
    timestamp: '2026-10-01T16:40:00Z',
    reportedBy: 'usr-zaid-otaibi',
    reportedByName: 'Zaid Al-Otaibi',
    reportDeadline: '2026-10-02T16:40:00Z',
    coordinates: { lat: 27.5333, lng: 49.1667 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Nitrile O-ring degraded due to high operational fluid temperature exceeding 95°C during continuous pumping.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-ksa-09',
        description: 'Upgrade HPU pump seal material to Viton fluoroelastomer capable of 200°C continuous service.',
        assignee: 'Zaid Al-Otaibi',
        targetDate: '2026-10-10',
        priority: 'P3 - Medium',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-01T16:40:00Z', actorId: 'usr-zaid-otaibi', actorName: 'Zaid Al-Otaibi', action: 'Incident Closed', details: 'Environmental spill remediated.' }]
  },

  // Incident 10: Near Miss - High Voltage Switching Lockout Bypass (Oman)
  {
    id: 'INC-2026-OMN-1055',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During 33kV substation transformer feeder breaker routine maintenance, an electrical rigger inadvertently inserted an operating handle into energized breaker compartment B-03 instead of de-energized compartment B-04. The physical mechanical padlock interlock prevented closure, preventing an arc-flash event.',
    immediateActionsTaken: 'Work immediately frozen; electrical team stepped back; physical tagging and color-coded compartment signage reviewed; breaker padlock verified; human performance review conducted with lead electrical engineer.',
    location: 'Fahud-West Gas Station (Oman) · Substation SS-02 33kV Switchgear',
    jurisdiction: 'Oman',
    severity: 'Medium',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-06T07:10:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy',
    reportDeadline: '2026-10-07T07:10:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Identical grey cabinet doors with small font labels 2 meters above ground contributed to human error under low ambient substation lighting.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-10',
        description: 'Install high-visibility reflective neon yellow boundary barriers over all live breaker cubicles during maintenance.',
        assignee: 'Salim Al-Harthy',
        targetDate: '2026-10-16',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-06T07:10:00Z', actorId: 'usr-salim-harthy', actorName: 'Salim Al-Harthy', action: 'Incident Reported', details: 'Arc-flash prevention near-miss recorded.' }]
  },

  // Incident 11: Polyolefin Extruder Drive Bearing Overheating & High Temperature Alarm (#INC-2026-0142)
  {
    id: 'INC-2026-0142',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During continuous production on Polymer Extruder Unit EX-04 in Zone C, an anomalous thermal rise to 142°C caused bearing friction and an audible high-temperature smoke detector alarm. Emergency power stop tripped automatically with zero flame or toxic release.',
    immediateActionsTaken: 'Extruder drive motor powered down; fire warden deployed dry powder standby; cooling cycle engaged; LOTO padlock applied by maintenance crew; zero flames or toxic gas release verified.',
    location: 'Al-Ruwais Polyolefin Asset (UAE) · Extrusion Hall Zone C',
    jurisdiction: 'Abu Dhabi',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'Closed',
    timestamp: '2026-09-28T08:15:00Z',
    reportedBy: 'usr-tariq-hashemi',
    reportedByName: 'Tariq Al-Hashemi',
    reportDeadline: '2026-09-29T08:15:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: [],
    evidenceItems: [],
    fiveWhys: [
      { step: 1, whyText: 'Why did the extruder bearing overheat? Insufficient lubricant film under heavy summer operational load.', verificationEvidence: 'Physical teardown analysis.' },
      { step: 2, whyText: 'Why was lubricant degraded? Ambient temperature reached 48°C and lubricant exceeded OEM thermal ceiling.', verificationEvidence: 'Chemical viscosity analysis.' },
      { step: 3, whyText: 'Why was early warning missed? Thermocouple probe was miscalibrated without redundant alarm telemetry.', verificationEvidence: 'Sensor log audit.' }
    ],
    rootCauseConclusion: 'Lubricant viscosity breakdown under elevated ambient temperatures combined with lack of dual infrared telemetry redundancy.',
    fishboneFactors: { manpower: [], machine: ['Sensor alarm telemetry lag'], method: [], material: ['Thermal lube degradation'], measurement: [], environment: ['Ambient heat 48°C'] },
    capaActions: [
      {
        id: 'CA-2026-0287',
        description: 'Retrofit dual infrared thermal telemetry sensors and replace drive bearing lubricant with synthetic polyalphaolefin high-temp grease.',
        assignee: 'Eng. Mansoor Al-Ketbi',
        targetDate: '2026-10-02',
        priority: 'P2 - High',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [
      { timestamp: '2026-09-28T08:15:00Z', actorId: 'usr-tariq-hashemi', actorName: 'Tariq Al-Hashemi', action: 'Incident Reported', details: 'Extruder thermal rise and smoke alarm logged.' },
      { timestamp: '2026-09-29T11:00:00Z', actorId: 'usr-fatima-kaabi', actorName: 'Fatima Al-Kaabi', action: 'Investigation Completed', details: 'Conducted 5-Why analysis, formulated CAPA #CA-2026-0287.' },
      { timestamp: '2026-10-04T15:30:00Z', actorId: 'usr-vikram-malhotra', actorName: 'Dr. Vikram Malhotra', action: 'Executive Closure', details: 'Verified root cause containment, closed incident #INC-2026-0142.' }
    ]
  },

  // Incident 12: Restricted Work Case - Heat Syncope During Berth Shoring (KSA)
  {
    id: 'INC-2026-KSA-0312',
    type: 'Occupational Illness',
    classification: 'Restricted Work Case',
    description: 'A civil contractor worker setting steel trench shoring boxes in Quay 4 Berth experienced lightheadedness, pale skin, and fainting after 90 minutes of continuous trench work during WBGT Orange condition (32.4°C). The worker regained consciousness within 30 seconds after being moved to shade.',
    immediateActionsTaken: 'Worker immediately rested in cooled field shelter; oral rehydration salt therapy administered; vital signs stabilized (BP 110/72, pulse 88 bpm); transported to Ras Al-Khair Occupational Clinic for 4 hours observation; assigned 3 days indoor light duty with zero sun exposure.',
    location: 'Ras Al-Khair Facility (KSA) · Quay 4 Subsea Trench Corridor',
    jurisdiction: 'KSA',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'CAPA Pending',
    timestamp: '2026-10-06T13:20:00Z',
    reportedBy: 'usr-abdulaziz-ghamdi',
    reportedByName: 'Abdulaziz Al-Ghamdi',
    reportDeadline: '2026-10-07T13:20:00Z',
    coordinates: { lat: 27.5333, lng: 49.1667 },
    images: [],
    evidenceItems: [],
    fiveWhys: [
      { step: 1, whyText: 'Why did the worker faint? Peripheral vasodilation and dehydration caused acute cerebral hypoperfusion.', verificationEvidence: 'Medical clinic evaluation records.' },
      { step: 2, whyText: 'Why was the worker dehydrated? Had consumed only 500ml water over previous 4 hours despite heavy manual shoring work.', verificationEvidence: 'Supervisor shift hydration log check.' },
      { step: 3, whyText: 'Why was hydration not enforced? The subcontractor hydration station was located 180m away from the trench excavation site.', verificationEvidence: 'Site layout inspection walk.' }
    ],
    rootCauseConclusion: 'Inadequate proximity of cooled hydration point to active trenching zone, compounded by lack of mandatory supervisor-prompted water breaks during WBGT Orange flag.',
    fishboneFactors: { manpower: ['Worker did not self-report thirst until fainting'], machine: [], method: ['Hydration breaks voluntary rather than clocked'], material: [], measurement: ['WBGT reading taken at main gate rather than trench microclimate'], environment: ['Ambient heat 39°C with high coastal humidity 72%'] },
    capaActions: [
      {
        id: 'capa-ksa-12',
        description: 'Establish portable shaded hydration canopies within 30m of all active trenching works with timed buzzer alerts every 30 minutes.',
        assignee: 'Abdulaziz Al-Ghamdi',
        targetDate: '2026-10-12',
        priority: 'P1 - Critical',
        status: 'In Progress',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-06T13:20:00Z', actorId: 'usr-abdulaziz-ghamdi', actorName: 'Abdulaziz Al-Ghamdi', action: 'Incident Reported', details: 'Restricted Work Case heat incident recorded.' }]
  }
];

// -------------------------------------------------------------
// 5. 8 Active and Historical Permits to Work
// -------------------------------------------------------------
export const GULF_ENERGY_PERMITS: Permit[] = [
  // Permit 1: Active Confined Space Entry with valid gas test logs
  {
    id: 'ptw-geig-001',
    permitNumber: 'PTW-2026-8815',
    title: 'Internal Hydrocarbon Vessel Descaling & Ultrasonic Shell Scan',
    type: 'Confined Space Entry',
    status: 'Active',
    zone: 'Zone 4B - Distillation Column C-102',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · Column C-102 Lower Head',
    contractor: 'Gulf Petrochemical Maintenance Services',
    crewSize: 6,
    validFrom: '2026-10-04T07:00:00Z',
    validTo: '2026-10-04T19:00:00Z',
    description: 'Entry into Column C-102 for descaling and phased-array ultrasonic wall thickness examination under continuous mechanical eductor ventilation.',
    riskScore: 16,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [
      {
        id: 'gas-001',
        timestamp: '2026-10-04T07:30:00Z',
        oxygen: 20.8,
        lel: 0.0,
        h2s: 0.0,
        co: 2.0,
        testerName: 'Hamad Al-Kaabi',
        testerCertNo: 'AGT-II-9912',
        detectorSerial: 'BW-ULTRA-7741',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Passed all 4-gas statutory parameters. Continuous ventilation active.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-cs-101',
        tagNumber: 'LOTO-CS-201',
        isolationPoint: 'Nitrogen Purge Inlet Spectacle Flange',
        equipmentName: 'Vessel V-102 Hydrocarbon Degasser',
        isolationType: 'Mechanical',
        status: 'Zero Energy Verified',
        isolatorSignature: 'Jamal Al-Harthi',
        isolatorId: 'usr-jamal',
        isolatorTimestamp: '2026-10-04T06:30:00Z',
        verifierSignature: 'Tariq Al-Hashemi',
        verifierId: 'usr-tariq-hashemi',
        verifierTimestamp: '2026-10-04T06:50:00Z'
      }
    ],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Area Authority / Permit Issuer',
      signatoryOrg: 'Gulf Energy UAE',
      certNumber: 'AA-PTW-8812',
      timestamp: '2026-10-04T06:55:00Z',
      digestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Tariq Al-Hashemi',
      signatoryRole: 'Permit Receiver / Lead Mechanical Specialist',
      signatoryOrg: 'Gulf Energy Operations',
      certNumber: 'PR-PTW-4012',
      timestamp: '2026-10-04T07:05:00Z',
      digestHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-04T06:00:00Z',
    updatedAt: '2026-10-04T07:30:00Z'
  },

  // Permit 2: Active Hot Work permit with LOTO isolation certificates
  {
    id: 'ptw-geig-002',
    permitNumber: 'PTW-2026-8812',
    title: 'Flare Header Pipeline Hot Tapping & High Pressure Flange Tie-in',
    type: 'Hot Work',
    status: 'Active',
    zone: 'Zone 4A - Process Unit 2',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · Offsites Unit 42 Flare Header',
    contractor: 'Al-Futtaim Engineering & Construction',
    crewSize: 8,
    validFrom: '2026-10-04T06:00:00Z',
    validTo: '2026-10-04T18:00:00Z',
    description: 'Hot tap welding on live 16-inch flare header line using certified spark-containment habitat with positive purge ventilation and fire watch.',
    riskScore: 18,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: true,
    gasTestingLog: [
      {
        id: 'gas-002',
        timestamp: '2026-10-04T07:15:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 1.0,
        testerName: 'Rashid Al-Kindi',
        testerCertNo: 'AGT-I-1049',
        detectorSerial: 'BW-MAX-5521',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Habitat positive pressure verified at +35 Pa; 0% LEL around welding coupon.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-hw-001',
        tagNumber: 'LOTO-FL-401A',
        isolationPoint: 'Suction Inlet MOV-101 Gate Valve',
        equipmentName: 'Booster Pump P-102A',
        isolationType: 'Mechanical',
        status: 'Applied & Padlocked',
        isolatorSignature: 'Khalfan Al-Zaabi',
        isolatorId: 'usr-khalfan',
        isolatorTimestamp: '2026-10-04T05:30:00Z',
        verifierSignature: 'Eng. Mansoor Al-Ketbi',
        verifierId: 'usr-mansoor-ketbi',
        verifierTimestamp: '2026-10-04T05:50:00Z'
      },
      {
        id: 'loto-hw-002',
        tagNumber: 'LOTO-EL-401B',
        isolationPoint: 'MCC Breaker 415V Panel B-08',
        equipmentName: 'Booster Pump Electric Motor Driver',
        isolationType: 'Electrical',
        status: 'Applied & Padlocked',
        isolatorSignature: 'Nasser Al-Shamsi',
        isolatorId: 'usr-nasser',
        isolatorTimestamp: '2026-10-04T05:40:00Z',
        verifierSignature: 'Eng. Mansoor Al-Ketbi',
        verifierId: 'usr-mansoor-ketbi',
        verifierTimestamp: '2026-10-04T05:55:00Z'
      }
    ],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Area Authority / Permit Issuer',
      signatoryOrg: 'Gulf Energy UAE',
      certNumber: 'AA-PTW-8812',
      timestamp: '2026-10-04T05:58:00Z',
      digestHash: 'a718b5b57d078ef40316ec1bf584b42b93fc9fd7502c3ec78e4708170c017bc9',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Suresh Pillai',
      signatoryRole: 'Permit Receiver / Subcontractor Lead',
      signatoryOrg: 'Al-Futtaim Engineering',
      certNumber: 'PR-ALF-771',
      timestamp: '2026-10-04T06:05:00Z',
      digestHash: '7d793037a0760186574b0282f2f435e7b1e516b9cfba8feda0e3524cc36d24d8',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-04T05:00:00Z',
    updatedAt: '2026-10-04T07:15:00Z'
  },

  // Permit 3: Suspended: WBGT Heat Ban Threshold Breached
  {
    id: 'ptw-geig-003',
    permitNumber: 'PTW-2026-8840',
    title: 'High-Elevation Flare Tip Inspection & Thermocouple Cable Replacement',
    type: 'Working at Height',
    status: 'Suspended',
    zone: 'Flare Stack Gantry Structure (Elevation 48m)',
    exactLocation: 'Fahud-West Gas Station (Oman) · Flare Stack D-104',
    contractor: 'Petrofac Oman High-Access Team',
    crewSize: 4,
    validFrom: '2026-10-04T05:30:00Z',
    validTo: '2026-10-04T17:30:00Z',
    description: 'Suspended: WBGT Heat Ban Threshold Breached. Ambient WBGT reached 33.2°C (Black Flag / Mandatory UAE/Oman Midday Heat Work Stoppage 12:30–15:00). All elevated hot work halted until temperature drops below 30.5°C.',
    riskScore: 20,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [
      {
        id: 'gas-003',
        timestamp: '2026-10-04T06:00:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Salim Al-Harthy',
        testerCertNo: 'AGT-III-8821',
        detectorSerial: 'BW-MAX-9914',
        bumpTested: true,
        status: 'SAFE'
      }
    ],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Salim Al-Harthy',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy Oman',
      certNumber: 'AA-FHD-109',
      timestamp: '2026-10-04T05:45:00Z',
      digestHash: 'b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Zaid Al-Otaibi',
      signatoryRole: 'Permit Receiver',
      signatoryOrg: 'Petrofac',
      certNumber: 'PR-PET-551',
      timestamp: '2026-10-04T05:55:00Z',
      digestHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    overrideJustification: 'Suspended: WBGT Heat Ban Threshold Breached. Ambient thermal monitor reading 33.2°C triggered automatic field suspension protocol.',
    createdAt: '2026-10-04T05:00:00Z',
    updatedAt: '2026-10-04T12:35:00Z'
  },

  // Permit 4: Active Critical Lift (Ras Al-Khair KSA)
  {
    id: 'ptw-geig-004',
    permitNumber: 'PTW-2026-8822',
    title: 'Tandem Crane Dual Lift of 62-Tonne Slug Catcher Vessel',
    type: 'Critical Lift',
    status: 'Active',
    zone: 'Heavy Lift Berth 2 - Subsea Fabrications',
    exactLocation: 'Ras Al-Khair Facility (KSA) · Quay 4 Berth',
    contractor: 'Mammoet Heavy Lifting KSA',
    crewSize: 12,
    validFrom: '2026-10-04T06:00:00Z',
    validTo: '2026-10-04T18:00:00Z',
    description: 'Tandem crane lift utilizing CC-2800 crawler and 500T telescopic crane under approved 3D engineering lift study.',
    riskScore: 19,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: false,
    heavyCraneRadiusMeters: 45,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Abdulaziz Al-Ghamdi',
      signatoryRole: 'Port Area Authority',
      signatoryOrg: 'Gulf Energy KSA',
      certNumber: 'AA-RAK-401',
      timestamp: '2026-10-04T06:15:00Z',
      digestHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Suresh Pillai',
      signatoryRole: 'Appointed Rigging Supervisor',
      signatoryOrg: 'Mammoet',
      certNumber: 'PR-MAM-112',
      timestamp: '2026-10-04T06:25:00Z',
      digestHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-04T05:30:00Z',
    updatedAt: '2026-10-04T06:30:00Z'
  },

  // Permit 5: Authorized Excavation (Fahud-West Oman)
  {
    id: 'ptw-geig-005',
    permitNumber: 'PTW-2026-8831',
    title: 'Manual Cable Trenching for Cathodic Protection Ground Bed',
    type: 'Excavation',
    status: 'Authorized',
    zone: 'Zone 2 - Gathering Manifold Perimeter',
    exactLocation: 'Fahud-West Gas Station (Oman) · South Fence Line',
    contractor: 'Special Technical Services (STS Oman)',
    crewSize: 5,
    validFrom: '2026-10-04T07:00:00Z',
    validTo: '2026-10-04T17:00:00Z',
    description: 'Manual hand digging after electromagnetic cable locating to depth 1.4m. Shoring installed at 1.2m intervals.',
    riskScore: 12,
    riskRating: 'Medium',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Salim Al-Harthy',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy Oman',
      certNumber: 'AA-FHD-109',
      timestamp: '2026-10-04T06:40:00Z',
      digestHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Zaid Al-Otaibi',
      signatoryRole: 'Civil Works Supervisor',
      signatoryOrg: 'STS Oman',
      certNumber: 'PR-STS-304',
      timestamp: '2026-10-04T06:50:00Z',
      digestHash: 'e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-04T06:00:00Z',
    updatedAt: '2026-10-04T06:55:00Z'
  },

  // Permit 6: Active Cold Work (Al-Ruwais UAE)
  {
    id: 'ptw-geig-006',
    permitNumber: 'PTW-2026-8828',
    title: 'Hydraulic Bolt Torquing on Seawater Intake Heat Exchanger Ex-104',
    type: 'Cold Work',
    status: 'Active',
    zone: 'Zone 1 - Seawater Pumphouse',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · Pumphouse Basin B',
    contractor: 'Hydratight Middle East',
    crewSize: 4,
    validFrom: '2026-10-04T07:30:00Z',
    validTo: '2026-10-04T17:30:00Z',
    description: 'Bolt tensioning using calibrated Enerpac hydraulic pump with calibrated torque limits per ASME PCC-1 standard.',
    riskScore: 8,
    riskRating: 'Low',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy UAE',
      certNumber: 'AA-PTW-8812',
      timestamp: '2026-10-04T07:15:00Z',
      digestHash: '7905f51525346807ab99184f352bff467cb4ba3b8b56a61fa966b93da277d6c4',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Tariq Al-Hashemi',
      signatoryRole: 'Mechanical Specialist',
      signatoryOrg: 'Gulf Energy',
      certNumber: 'PR-PTW-4012',
      timestamp: '2026-10-04T07:25:00Z',
      digestHash: 'b5a2c94e655f6a179e3f32f615e86e604730d829144d47c4a52dd8694e3f9fad',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-04T06:30:00Z',
    updatedAt: '2026-10-04T07:30:00Z'
  },

  // Permit 7: Closed Hot Work - Historical (Ras Al-Khair KSA)
  {
    id: 'ptw-geig-007',
    permitNumber: 'PTW-2026-8790',
    title: 'Replacement of Offshore Deck Handrail Section via Oxy-Acetylene Cut',
    type: 'Hot Work',
    status: 'Closed',
    zone: 'Fabrication Yard Module 3',
    exactLocation: 'Ras Al-Khair Facility (KSA) · Module 3 West',
    contractor: 'Petrofac KSA',
    crewSize: 3,
    validFrom: '2026-10-02T06:00:00Z',
    validTo: '2026-10-02T16:00:00Z',
    description: 'Hot cutting and welding of replacement marine-grade 316L handrail. Successfully completed with 2-hour continuous fire watch.',
    riskScore: 10,
    riskRating: 'Medium',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Abdulaziz Al-Ghamdi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy KSA',
      certNumber: 'AA-RAK-401',
      timestamp: '2026-10-02T05:50:00Z',
      digestHash: 'd3b07384d113edec49eaa6238ad5ff00',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Zaid Al-Otaibi',
      signatoryRole: 'Permit Receiver',
      signatoryOrg: 'Petrofac KSA',
      certNumber: 'PR-PET-551',
      timestamp: '2026-10-02T06:00:00Z',
      digestHash: 'c4ca4238a0b923820dcc509a6f75849b',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-02T05:00:00Z',
    updatedAt: '2026-10-02T18:15:00Z'
  },

  // Permit 8: Closed Confined Space - Historical (Fahud-West Oman)
  {
    id: 'ptw-geig-008',
    permitNumber: 'PTW-2026-8775',
    title: 'Slug Catcher V-101 Annual Internal Desand & Wall Inspection',
    type: 'Confined Space Entry',
    status: 'Closed',
    zone: 'Slug Catcher Manifold Yard',
    exactLocation: 'Fahud-West Gas Station (Oman) · Slug Catcher V-101',
    contractor: 'Special Technical Services (STS)',
    crewSize: 6,
    validFrom: '2026-09-28T06:00:00Z',
    validTo: '2026-09-28T18:00:00Z',
    description: 'Sludge extraction and non-destructive wall testing. De-isolated and sealed into service with operational sign-off.',
    riskScore: 16,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Salim Al-Harthy',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy Oman',
      certNumber: 'AA-FHD-109',
      timestamp: '2026-09-28T05:40:00Z',
      digestHash: 'c81e728d9d4c2f636f067f89cc14862c',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Zaid Al-Otaibi',
      signatoryRole: 'Permit Receiver',
      signatoryOrg: 'STS',
      certNumber: 'PR-STS-304',
      timestamp: '2026-09-28T05:55:00Z',
      digestHash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-09-28T05:00:00Z',
    updatedAt: '2026-09-28T19:00:00Z'
  },

  // Permit 9: Hot Work - Flare Knockout Drum Welding
  {
    id: 'ptw-geig-009',
    permitNumber: 'PTW-2026-8848',
    title: 'Flare Knockout Drum Relief Header Structural Welding',
    type: 'Hot Work',
    status: 'Requested',
    zone: 'Zone 1 - Main Flare Header Base',
    exactLocation: 'Fahud-West Gas Station (Oman) · Flare Knockout Skid K-101',
    contractor: 'Oman Special Technical Services (STS)',
    crewSize: 4,
    validFrom: '2026-10-07T07:00:00Z',
    validTo: '2026-10-07T17:00:00Z',
    description: 'SMAW structural welding of pipe shoe support on 16-inch flare discharge line with certified fire blanket habitat and pressurized water hose on standby.',
    riskScore: 18,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: true,
    gasTestingLog: [
      {
        id: 'gas-009',
        timestamp: '2026-10-07T06:45:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Salim Al-Harthy',
        testerCertNo: 'PDO-AGT-098',
        detectorSerial: 'BW-GAS-9912',
        bumpTested: true,
        status: 'SAFE',
        notes: '0.0% LEL verified across 15m radius around habitat.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-hw-09',
        tagNumber: 'LOTO-HW-409',
        isolationPoint: 'Header Block Valve HV-101',
        equipmentName: 'Flare K.O. Drum K-101',
        isolationType: 'Mechanical',
        status: 'Zero Energy Verified',
        isolatorSignature: 'Salim Al-Harthy',
        isolatorId: 'usr-salim-harthy',
        isolatorTimestamp: '2026-10-07T06:15:00Z',
        verifierSignature: 'Marcus Chen'
      }
    ],
    issuerSignature: {
      signed: false,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Area Authority / Permit Issuer',
      signatoryOrg: 'Gulf Energy UAE',
      timestamp: '2026-10-07T06:00:00Z',
      checklistConfirmed: false
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Rahul Gupta',
      signatoryRole: 'Lead Welder & Permit Receiver',
      signatoryOrg: 'STS Oman',
      timestamp: '2026-10-07T06:50:00Z',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-07T06:00:00Z',
    updatedAt: '2026-10-07T06:50:00Z'
  },

  // Permit 10: Working at Height - Flare Tip Thermocouple Replacement
  {
    id: 'ptw-geig-010',
    permitNumber: 'PTW-2026-8852',
    title: 'Flare Tip Thermocouple Sensor Replacement & Cable Pulling',
    type: 'Working at Height',
    status: 'Active',
    zone: 'Zone 1 - Main Flare Stack',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · 65m Flare Tip Platform',
    contractor: 'Al Jaber Industrial Services',
    crewSize: 3,
    validFrom: '2026-10-06T06:00:00Z',
    validTo: '2026-10-06T18:00:00Z',
    description: 'Rope access certified technicians replacing redundant temperature transmitters on top flare shroud.',
    riskScore: 16,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Permit Issuer',
      signatoryOrg: 'Gulf Energy UAE',
      timestamp: '2026-10-06T05:45:00Z',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Tariq Al-Hashemi',
      signatoryRole: 'Rope Access Lead',
      signatoryOrg: 'Al Jaber Industrial',
      timestamp: '2026-10-06T05:55:00Z',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-06T05:00:00Z',
    updatedAt: '2026-10-06T05:55:00Z'
  },

  // Permit 11: Cold Work - Centrifugal Pump Impeller Overhaul
  {
    id: 'ptw-geig-011',
    permitNumber: 'PTW-2026-8809',
    title: 'Cold Work & Mechanical Isolation: Pump P-204 Impeller Replacement',
    type: 'Cold Work',
    status: 'Active',
    zone: 'Zone 3 - Water Treatment Area',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · Water Treatment Train B',
    contractor: 'Gulf Energy Internal Maintenance',
    crewSize: 4,
    validFrom: '2026-10-06T08:00:00Z',
    validTo: '2026-10-07T18:00:00Z',
    description: 'Pump uncoupling, casing split, and impeller replacement under mechanical padlocks Box #LOTO-14.',
    riskScore: 8,
    riskRating: 'Medium',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [
      {
        id: 'gas-011',
        timestamp: '2026-10-06T07:45:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Hamad Al-Kaabi',
        testerCertNo: 'ADNOC-AGT-441',
        detectorSerial: 'BW-GAS-102',
        status: 'SAFE',
        bumpTested: true
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-cw-11',
        tagNumber: 'LOTO-MEC-204',
        isolationPoint: 'Suction and Discharge Butterfly Valves',
        equipmentName: 'Pump P-204',
        isolationType: 'Mechanical',
        status: 'Zero Energy Verified',
        isolatorSignature: 'Marcus Chen',
        isolatorId: 'usr-marcus-chen',
        isolatorTimestamp: '2026-10-06T07:30:00Z',
        verifierSignature: 'Eng. Mansoor Al-Ketbi'
      }
    ],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Mansoor Al-Ketbi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy UAE',
      timestamp: '2026-10-06T07:50:00Z',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Rahul Gupta',
      signatoryRole: 'Lead Mechanical Technician',
      signatoryOrg: 'Gulf Energy',
      timestamp: '2026-10-06T07:55:00Z',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-06T07:00:00Z',
    updatedAt: '2026-10-06T07:55:00Z'
  },

  // Permit 12: Excavation - Trenching for Subsea Cable Conduit
  {
    id: 'ptw-geig-012',
    permitNumber: 'PTW-2026-8860',
    title: 'Underground Cable Trench Excavation (Depth 2.2m)',
    type: 'Excavation',
    status: 'Active',
    zone: 'Zone 5 - Coastal Utility Corridor',
    exactLocation: 'Ras Al-Khair Facility (KSA) · Subsea Interconnector Trench',
    contractor: 'Petrofac Civil Subcontractors',
    crewSize: 6,
    validFrom: '2026-10-05T07:00:00Z',
    validTo: '2026-10-08T18:00:00Z',
    description: 'Mechanical hydraulic excavator digging 2.2m deep trench with aluminum hydraulic shoring trench boxes installed.',
    riskScore: 14,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Abdulaziz Al-Ghamdi',
      signatoryRole: 'Permit Issuer',
      signatoryOrg: 'Gulf Energy KSA',
      timestamp: '2026-10-05T06:30:00Z',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Zaid Al-Otaibi',
      signatoryRole: 'Civil Site Supervisor',
      signatoryOrg: 'Petrofac Civil',
      timestamp: '2026-10-05T06:40:00Z',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-05T06:00:00Z',
    updatedAt: '2026-10-05T06:40:00Z'
  },

  // Permit 13: Interconnected Hot Work & Line Breaking (#PTW-2026-0186)
  {
    id: 'ptw-geig-0186',
    permitNumber: 'PTW-2026-0186',
    title: 'Hot Work & Line Breaking on 24-Inch Hydrocarbon Trunkline',
    type: 'Hot Work',
    status: 'Authorized',
    zone: 'Zone C - Hydrocarbon Processing Header',
    exactLocation: 'Al-Ruwais Polyolefin Asset (UAE) · Header Manifold HM-03',
    contractor: 'Gulf Energy Technical Services',
    crewSize: 6,
    validFrom: '2026-10-08T06:00:00Z',
    validTo: '2026-10-08T18:00:00Z',
    description: 'Hot tap tie-in, spool piece installation, and positive mechanical isolation on trunkline header HM-03.',
    riskScore: 20,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: true,
    gasTestingLog: [
      {
        id: 'gas-0186',
        timestamp: '2026-10-08T05:30:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Marcus Chen',
        testerCertNo: 'AGT-III-8891',
        detectorSerial: 'BW-GAS-9912',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Pre-entry gas test 0.0% LEL verified across 25m perimeter.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-0186-01',
        tagNumber: 'LOTO-HM03-01',
        isolationPoint: 'Upstream Isolation Valve V-101',
        equipmentName: 'Header Manifold HM-03',
        isolationType: 'Mechanical',
        status: 'Applied & Padlocked',
        isolatorSignature: 'Rahul Gupta',
        isolatorId: 'usr-rahul-gupta',
        isolatorTimestamp: '2026-10-08T05:15:00Z',
        verifierSignature: 'Marcus Chen',
        verifierId: 'usr-marcus-chen',
        verifierTimestamp: '2026-10-08T05:30:00Z'
      }
    ],
    issuerSignature: {
      signed: true,
      signatoryName: 'Sarah Jones',
      signatoryRole: 'Site HSE Manager / Issuing Authority',
      signatoryOrg: 'Gulf Energy',
      timestamp: '2026-10-08T06:00:00Z',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Marcus Chen',
      signatoryRole: 'Area Authority / Performing Authority',
      signatoryOrg: 'Gulf Energy',
      timestamp: '2026-10-08T05:45:00Z',
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: '2026-10-07T14:00:00Z',
    updatedAt: '2026-10-08T06:00:00Z'
  }
];

// -------------------------------------------------------------
// 6. 15 Corrective Actions (CAPA) Across Various Statuses
// -------------------------------------------------------------
export interface EnterpriseCapa {
  id: string;
  title: string;
  sourceType: 'Incident' | 'Audit' | 'Inspection' | 'Regulatory' | 'PTW';
  sourceId: string;
  siteName: string;
  ownerName: string;
  ownerRole: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium';
  status: 'Open' | 'In-Progress' | 'Pending Verification' | 'Closed';
  dueDate: string;
  countdownText: string;
  isOverdue: boolean;
  hierarchy: 'Elimination' | 'Substitution' | 'Engineering' | 'Administrative' | 'PPE';
  details: string;
  closureEvidence?: string;
  verifiedBy?: string;
}

export const GULF_ENERGY_CAPAS: EnterpriseCapa[] = [
  // 1. Open (Critical)
  {
    id: 'CAPA-2026-01',
    title: 'Install certified stainless whip-checks on all lines > 1,000 PSI',
    sourceType: 'Incident',
    sourceId: 'INC-2026-OMN-0891',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Suresh Pillai',
    ownerRole: 'Subcontractor Construction Lead',
    priority: 'P1 - Critical',
    status: 'Open',
    dueDate: '2026-10-15',
    countdownText: 'Due in 11 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Procure and install 450 certified whip-checks with serialized tagging across all wellhead gathering test manifolds.'
  },
  // 2. Open
  {
    id: 'CAPA-2026-02',
    title: 'Mandate As-Built P&ID tracing walkdown before LOTO authorization',
    sourceType: 'Incident',
    sourceId: 'INC-2026-UAE-0419',
    siteName: 'Al-Ruwais Polyolefin Asset (UAE)',
    ownerName: 'Eng. Mansoor Al-Ketbi',
    ownerRole: 'Chief Permit Issuer',
    priority: 'P1 - Critical',
    status: 'Open',
    dueDate: '2026-10-12',
    countdownText: 'Due in 8 days',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'Revise PTW Procedure Section 7 to require dual physical walkdown with ultrasonic line leak detector before spade blind sign-off.'
  },
  // 3. Open
  {
    id: 'CAPA-2026-03',
    title: 'Soil bearing plate compaction re-test for Heavy Lift Berth 2',
    sourceType: 'Incident',
    sourceId: 'INC-2026-KSA-0188',
    siteName: 'Ras Al-Khair Facility (KSA)',
    ownerName: 'Abdulaziz Al-Ghamdi',
    ownerRole: 'Operations Superintendent',
    priority: 'P1 - Critical',
    status: 'Open',
    dueDate: '2026-10-10',
    countdownText: 'Due in 6 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Engage accredited civil geotechnical laboratory to certify 250 kN/m² ground capacity on quay outrigger pads.'
  },
  // 4. Open (Overdue)
  {
    id: 'CAPA-2026-04',
    title: 'Recalibrate toxic H2S fixed optical sensors in Train 2 compressor shelter',
    sourceType: 'Audit',
    sourceId: 'AUD-2026-OMN-402',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Salim Al-Harthy',
    ownerRole: 'Senior Gas Tester',
    priority: 'P1 - Critical',
    status: 'Open',
    dueDate: '2026-10-02',
    countdownText: 'Overdue by 2 days',
    isOverdue: true,
    hierarchy: 'Engineering',
    details: 'Calibrate 12 Dräger PointGard optical gas sensors that exceeded 90-day bump test interval.'
  },

  // 5. In-Progress
  {
    id: 'CAPA-2026-05',
    title: 'Deploy WBGT IoT ambient telemetry beacons on elevated scaffolds',
    sourceType: 'Regulatory',
    sourceId: 'OSHAD-M11-HEAT',
    siteName: 'Al-Ruwais Polyolefin Asset (UAE)',
    ownerName: 'Khalid Al-Dhaheri',
    ownerRole: 'Environmental Specialist',
    priority: 'P2 - High',
    status: 'In-Progress',
    dueDate: '2026-10-18',
    countdownText: 'Due in 14 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Install 8 solar-powered wireless weather stations with automated siren strobe lights for thermal flag status.'
  },
  // 6. In-Progress
  {
    id: 'CAPA-2026-06',
    title: 'Fabricate warehouse entry height limiter goalposts (3.8m)',
    sourceType: 'Incident',
    sourceId: 'INC-2026-OMN-0944',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Suresh Pillai',
    ownerRole: 'Contractor Lead',
    priority: 'P2 - High',
    status: 'In-Progress',
    dueDate: '2026-10-16',
    countdownText: 'Due in 12 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Steel fabrication underway in contractor shop; footings surveyed in logistics bay.'
  },
  // 7. In-Progress
  {
    id: 'CAPA-2026-07',
    title: 'Update SAP PM master data for 24-month hydraulic hose retirement',
    sourceType: 'Incident',
    sourceId: 'INC-2026-OMN-0891',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Eng. Mansoor Al-Ketbi',
    ownerRole: 'Chief Permit Issuer',
    priority: 'P1 - Critical',
    status: 'In-Progress',
    dueDate: '2026-10-20',
    countdownText: 'Due in 16 days',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'Batch update script prepared with enterprise asset management team for 1,200 flexible lines.'
  },
  // 8. In-Progress
  {
    id: 'CAPA-2026-08',
    title: 'Distribute Level 5 cut-resistant impact gloves to module 3 crews',
    sourceType: 'Incident',
    sourceId: 'INC-2026-KSA-0112',
    siteName: 'Ras Al-Khair Facility (KSA)',
    ownerName: 'Zaid Al-Otaibi',
    ownerRole: 'Contractor Supervisor',
    priority: 'P3 - Medium',
    status: 'In-Progress',
    dueDate: '2026-10-08',
    countdownText: 'Due in 4 days',
    isOverdue: false,
    hierarchy: 'PPE',
    details: 'Initial 150 pairs distributed; final shipment of 200 pairs clearing customs at Dammam port.'
  },

  // 9. Pending Verification
  {
    id: 'CAPA-2026-09',
    title: 'Conduct acoustic ultrasonic inspection on V-102 isolation bypass valve',
    sourceType: 'Incident',
    sourceId: 'INC-2026-UAE-0419',
    siteName: 'Al-Ruwais Polyolefin Asset (UAE)',
    ownerName: 'Tariq Al-Hashemi',
    ownerRole: 'Site Safety Officer',
    priority: 'P1 - Critical',
    status: 'Pending Verification',
    dueDate: '2026-10-06',
    countdownText: 'Due in 2 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Valve seat replaced; acoustic leak test completed at 150 PSI with zero leakage recorded. Awaiting Lead Auditor sign-off.'
  },
  // 10. Pending Verification
  {
    id: 'CAPA-2026-10',
    title: 'Recertify all 14 overhead crane rigging slings and shackles (LEEA)',
    sourceType: 'Audit',
    sourceId: 'AUD-2026-KSA-102',
    siteName: 'Ras Al-Khair Facility (KSA)',
    ownerName: 'Abdulaziz Al-Ghamdi',
    ownerRole: 'Operations Superintendent',
    priority: 'P2 - High',
    status: 'Pending Verification',
    dueDate: '2026-10-05',
    countdownText: 'Due in 1 day',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'LEEA certified inspector completed MPI and proof testing. Certificates uploaded to Document Management System.'
  },
  // 11. Pending Verification
  {
    id: 'CAPA-2026-11',
    title: 'Conduct emergency medevac response drill with Oman Royal Police Air Wing',
    sourceType: 'Incident',
    sourceId: 'INC-2026-OMN-0891',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Dr. Mariam Al-Balushi',
    ownerRole: 'Lead Occupational Physician',
    priority: 'P2 - High',
    status: 'Pending Verification',
    dueDate: '2026-10-07',
    countdownText: 'Due in 3 days',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'Simulated medevac completed in 28 minutes. Drill critique report pending final group sign-off.'
  },
  // 12. Pending Verification
  {
    id: 'CAPA-2026-12',
    title: 'Complete SIMOPS clash radius calibration in digital PTW module',
    sourceType: 'PTW',
    sourceId: 'PTW-2026-8812',
    siteName: 'Al-Ruwais Polyolefin Asset (UAE)',
    ownerName: 'Fatima Al-Kaabi',
    ownerRole: 'HSE Compliance Officer',
    priority: 'P2 - High',
    status: 'Pending Verification',
    dueDate: '2026-10-06',
    countdownText: 'Due in 2 days',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Spatial clash engine updated with 50m hot work vs flammable venting proximity logic per ADNOC COP-HSE.'
  },

  // 13. Closed
  {
    id: 'CAPA-2026-13',
    title: 'Submit Oman MoL Statutory Notification Form for hydraulic line failure',
    sourceType: 'Incident',
    sourceId: 'INC-2026-OMN-0891',
    siteName: 'Fahud-West Gas Station (Oman)',
    ownerName: 'Dr. Mariam Al-Balushi',
    ownerRole: 'Lead Occupational Physician',
    priority: 'P1 - Critical',
    status: 'Closed',
    dueDate: '2026-10-03',
    countdownText: 'Closed on-time',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'Form submitted electronically to Muscat Ministry of Labour portal with tracking receipt #OMN-MOL-2026-88192.',
    closureEvidence: 'Official MoL portal PDF acknowledgment attached.',
    verifiedBy: 'Dr. Vikram Malhotra'
  },
  // 14. Closed
  {
    id: 'CAPA-2026-14',
    title: 'Revise chemical safety eyewash station weekly flushing log',
    sourceType: 'Inspection',
    sourceId: 'INSP-2026-UAE-082',
    siteName: 'Al-Ruwais Polyolefin Asset (UAE)',
    ownerName: 'Fatima Al-Kaabi',
    ownerRole: 'HSE Compliance Officer',
    priority: 'P3 - Medium',
    status: 'Closed',
    dueDate: '2026-09-30',
    countdownText: 'Closed on-time',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: 'Digital QR-code inspection tags affixed to all 24 eyewash stations with automatic weekly alerts.',
    closureEvidence: 'Field audit confirmed 100% scanning compliance over 14 consecutive days.',
    verifiedBy: 'Tariq Al-Hashemi'
  },
  // 15. Closed
  {
    id: 'CAPA-2026-15',
    title: 'De-isolate and archive historical Hot Work permit PTW-2026-8790',
    sourceType: 'PTW',
    sourceId: 'PTW-2026-8790',
    siteName: 'Ras Al-Khair Facility (KSA)',
    ownerName: 'Abdulaziz Al-Ghamdi',
    ownerRole: 'Operations Superintendent',
    priority: 'P3 - Medium',
    status: 'Closed',
    dueDate: '2026-10-02',
    countdownText: 'Closed on-time',
    isOverdue: false,
    hierarchy: 'Administrative',
    details: '2-hour fire watch completed with zero smolder; LOTO padlocks returned to lockbox.',
    closureEvidence: 'Dual digital signature closure block signed off.',
    verifiedBy: 'Abdulaziz Al-Ghamdi'
  }
];

// -------------------------------------------------------------
// 7. Data Loader & Seeding Engine
// -------------------------------------------------------------
export class DemoDataLoader {
  private static STORAGE_KEY_FLAG = 'ad6_demo_data_seeded_v1';
  public static readonly STORAGE_KEY_INCIDENTS = 'ad6_incidents';
  public static readonly STORAGE_KEY_INCIDENTS_ALT = 'ad6_enterprise_incidents';
  public static readonly STORAGE_KEY_PERMITS = 'ad6_permits';
  public static readonly STORAGE_KEY_PERMITS_ALT = 'ad6_enterprise_permits';
  public static readonly STORAGE_KEY_CAPAS = 'ad6_capas';
  public static readonly STORAGE_KEY_CAPAS_ALT = 'ad6_enterprise_capas';

  // Seed baseline data if not present or if force = true
  public static async seedDemoData(force = false) {
    if (typeof window === 'undefined') return;

    const isAlreadySeeded = localStorage.getItem(this.STORAGE_KEY_FLAG) === 'true';
    if (isAlreadySeeded && !force) {
      console.log('[DemoDataLoader] Synthetic GCC demonstration data already loaded.');
      return;
    }

    console.log('[DemoDataLoader] Seeding comprehensive GCC Synthetic Enterprise Data for "Gulf Energy & Infrastructure Group"...');

    // 1. Save Incidents to unified localStorage keys
    localStorage.setItem(this.STORAGE_KEY_INCIDENTS, JSON.stringify(GULF_ENERGY_INCIDENTS));
    localStorage.setItem(this.STORAGE_KEY_INCIDENTS_ALT, JSON.stringify(GULF_ENERGY_INCIDENTS));

    // 2. Save Permits to unified localStorage keys
    localStorage.setItem(this.STORAGE_KEY_PERMITS, JSON.stringify(GULF_ENERGY_PERMITS));
    localStorage.setItem(this.STORAGE_KEY_PERMITS_ALT, JSON.stringify(GULF_ENERGY_PERMITS));

    // 3. Save CAPAs to unified localStorage keys
    localStorage.setItem(this.STORAGE_KEY_CAPAS, JSON.stringify(GULF_ENERGY_CAPAS));
    localStorage.setItem(this.STORAGE_KEY_CAPAS_ALT, JSON.stringify(GULF_ENERGY_CAPAS));

    // 4. Cache Permits to IndexedDB
    try {
      const recordsToCache: CachedPermitRecord[] = GULF_ENERGY_PERMITS.map(p => ({
        id: p.id,
        permitNumber: p.permitNumber,
        type: p.type,
        title: p.title,
        exactLocation: p.exactLocation,
        zone: p.zone,
        status: p.status,
        validFrom: p.validFrom,
        validTo: p.validTo,
        issuerSignature: p.issuerSignature?.signatoryName,
        receiverSignature: p.receiverSignature?.signatoryName,
        gasTestingLog: p.gasTestingLog.map(g => ({
          oxygen: g.oxygen,
          lel: g.lel,
          h2s: g.h2s,
          co: g.co,
          timestamp: g.timestamp,
          testerName: g.testerName,
          status: g.status
        })),
        lotoIsolations: p.lotoIsolations.map(l => ({
          tagNumber: l.tagNumber,
          isolationPoint: l.isolationPoint,
          equipmentName: l.equipmentName,
          isolationType: l.isolationType,
          status: l.status,
          isolatorSignature: l.isolatorSignature
        })),
        cachedAt: new Date().toISOString()
      }));

      await offlineStorage.cachePermitsBatch(recordsToCache);
      console.log('[DemoDataLoader] Successfully cached 8 permits to IndexedDB activePermits store.');
    } catch (err) {
      console.warn('[DemoDataLoader] IndexedDB permit caching warning:', err);
    }

    // 5. Mark as seeded
    localStorage.setItem(this.STORAGE_KEY_FLAG, 'true');

    // 6. Broadcast event so open UI views refresh immediately
    window.dispatchEvent(new CustomEvent('ad6-demo-data-reset', {
      detail: {
        timestamp: new Date().toISOString(),
        tenant: GULF_ENERGY_TENANT.name,
        sitesCount: GULF_ENERGY_SITES.length,
        usersCount: GULF_ENERGY_USERS.length,
        incidentsCount: GULF_ENERGY_INCIDENTS.length,
        permitsCount: GULF_ENERGY_PERMITS.length,
        capasCount: GULF_ENERGY_CAPAS.length
      }
    }));

    console.log('[DemoDataLoader] GCC Synthetic Enterprise Dataset loaded successfully!');
  }

  // Force reset back to pristine demo state
  public static async resetDemoData(): Promise<{
    sitesCount: number;
    usersCount: number;
    incidentsCount: number;
    permitsCount: number;
    capasCount: number;
  }> {
    await this.seedDemoData(true);
    return {
      sitesCount: GULF_ENERGY_SITES.length,
      usersCount: GULF_ENERGY_USERS.length,
      incidentsCount: GULF_ENERGY_INCIDENTS.length,
      permitsCount: GULF_ENERGY_PERMITS.length,
      capasCount: GULF_ENERGY_CAPAS.length
    };
  }

  public static getStoredIncidents(): Incident[] {
    if (typeof window === 'undefined') return GULF_ENERGY_INCIDENTS;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_INCIDENTS) || localStorage.getItem(this.STORAGE_KEY_INCIDENTS_ALT);
      return data ? JSON.parse(data) : GULF_ENERGY_INCIDENTS;
    } catch (e) {
      return GULF_ENERGY_INCIDENTS;
    }
  }

  public static saveIncident(incident: Incident): Incident[] {
    if (typeof window === 'undefined') return [incident];
    try {
      const incidents = this.getStoredIncidents();
      const existingIndex = incidents.findIndex(i => i.id === incident.id);
      let updated: Incident[];
      if (existingIndex >= 0) {
        updated = [...incidents];
        updated[existingIndex] = incident;
      } else {
        updated = [incident, ...incidents];
      }
      localStorage.setItem(this.STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
      localStorage.setItem(this.STORAGE_KEY_INCIDENTS_ALT, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ad6-incidents-updated', { detail: incident }));
      return updated;
    } catch (e) {
      console.warn('[DemoDataLoader] Failed to save incident to localStorage:', e);
      return [incident];
    }
  }

  public static getStoredPermits(): Permit[] {
    if (typeof window === 'undefined') return GULF_ENERGY_PERMITS;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_PERMITS) || localStorage.getItem(this.STORAGE_KEY_PERMITS_ALT);
      return data ? JSON.parse(data) : GULF_ENERGY_PERMITS;
    } catch (e) {
      return GULF_ENERGY_PERMITS;
    }
  }

  public static saveAllPermits(permits: Permit[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY_PERMITS, JSON.stringify(permits));
      localStorage.setItem(this.STORAGE_KEY_PERMITS_ALT, JSON.stringify(permits));
      window.dispatchEvent(new CustomEvent('ad6-permits-updated', { detail: permits }));
    } catch (e) {
      console.warn('[DemoDataLoader] Failed to save permits to localStorage:', e);
    }
  }

  public static getStoredCapas(): EnterpriseCapa[] {
    if (typeof window === 'undefined') return GULF_ENERGY_CAPAS;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CAPAS) || localStorage.getItem(this.STORAGE_KEY_CAPAS_ALT);
      return data ? JSON.parse(data) : GULF_ENERGY_CAPAS;
    } catch (e) {
      return GULF_ENERGY_CAPAS;
    }
  }

  public static saveCapa(capa: EnterpriseCapa): EnterpriseCapa[] {
    if (typeof window === 'undefined') return [capa];
    try {
      const capas = this.getStoredCapas();
      const existingIndex = capas.findIndex(c => c.id === capa.id);
      let updated: EnterpriseCapa[];
      if (existingIndex >= 0) {
        updated = [...capas];
        updated[existingIndex] = capa;
      } else {
        updated = [capa, ...capas];
      }
      localStorage.setItem(this.STORAGE_KEY_CAPAS, JSON.stringify(updated));
      localStorage.setItem(this.STORAGE_KEY_CAPAS_ALT, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ad6-capas-updated', { detail: capa }));
      return updated;
    } catch (e) {
      console.warn('[DemoDataLoader] Failed to save CAPA to localStorage:', e);
      return [capa];
    }
  }

  public static saveAllCapas(capas: EnterpriseCapa[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY_CAPAS, JSON.stringify(capas));
      localStorage.setItem(this.STORAGE_KEY_CAPAS_ALT, JSON.stringify(capas));
      window.dispatchEvent(new CustomEvent('ad6-capas-updated', { detail: capas }));
    } catch (e) {
      console.warn('[DemoDataLoader] Failed to save all CAPAs to localStorage:', e);
    }
  }
}
