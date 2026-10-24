export type PermitType = 
  | 'Hot Work' 
  | 'Cold Work' 
  | 'Confined Space Entry' 
  | 'Working at Height' 
  | 'Critical Lift' 
  | 'Excavation';

export type PermitStatus = 
  | 'Draft' 
  | 'Requested' 
  | 'Authorized' 
  | 'Active' 
  | 'Suspended' 
  | 'Closed';

export type IsolationType = 'Mechanical' | 'Electrical';
export type IsolationStatus = 'Applied & Padlocked' | 'Zero Energy Verified' | 'De-isolated';

export interface LOTOItem {
  id: string;
  tagNumber: string;
  isolationPoint: string;
  equipmentName: string;
  isolationType: IsolationType;
  status: IsolationStatus;
  isolatorSignature: string;
  isolatorId: string;
  isolatorTimestamp: string;
  verifierSignature: string;
  verifierId?: string;
  verifierTimestamp?: string;
}

export interface GasReading {
  id: string;
  timestamp: string;
  oxygen: number;        // Normal: 19.5 - 23.5%
  lel: number;           // Normal: < 10%
  h2s: number;           // Normal: < 10 ppm
  co: number;            // Normal: < 25 ppm
  testerName: string;
  testerCertNo: string;
  detectorSerial: string;
  bumpTested: boolean;
  status: 'SAFE' | 'WARNING' | 'DANGER';
  notes?: string;
}

export interface DigitalSignature {
  signed: boolean;
  signatoryName: string;
  signatoryRole: string;
  signatoryOrg: string;
  certNumber?: string;
  timestamp: string;
  digestHash?: string;
  checklistConfirmed: boolean;
}

export interface Permit {
  id: string;
  permitNumber: string;
  title: string;
  type: PermitType;
  status: PermitStatus;
  zone: string;
  exactLocation: string;
  contractor: string;
  crewSize: number;
  validFrom: string;
  validTo: string;
  description: string;
  riskScore: number;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  flammableVentingOrHydrocarbonRisk: boolean;
  heavyCraneRadiusMeters?: number;
  gasTestingLog: GasReading[];
  lotoIsolations: LOTOItem[];
  issuerSignature: DigitalSignature;
  receiverSignature: DigitalSignature;
  simopsClashLocked: boolean;
  simopsClashDetails?: string;
  overrideJustification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimopsConflict {
  hasConflict: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'NONE';
  clashingPermitId: string;
  clashingPermitNumber: string;
  clashingPermitType: string;
  clashingPermitTitle: string;
  clashingZone: string;
  separationDistanceMeters: number;
  minSeparationRequiredMeters: number;
  hazardDescription: string;
  statutoryRule: string;
  mandatoryMitigations: string[];
}

export function evaluateGasAtmosphere(oxygen: number, lel: number, h2s: number, co: number): {
  status: 'SAFE' | 'WARNING' | 'DANGER';
  isSafe: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Oxygen threshold: Safe 19.5% - 23.5%
  if (oxygen < 19.5) {
    errors.push(`Oxygen deficiency (${oxygen}% < 19.5%). Asphyxiation hazard.`);
  } else if (oxygen > 23.5) {
    errors.push(`Oxygen enriched atmosphere (${oxygen}% > 23.5%). Severe fire/explosion hazard.`);
  }

  // LEL threshold: Safe < 10%
  if (lel >= 10) {
    errors.push(`LEL combustible gas critical breach (${lel}% >= 10%). Immediate ignition danger.`);
  } else if (lel >= 5) {
    warnings.push(`LEL elevated combustible presence (${lel}% >= 5%). Monitor continuously.`);
  }

  // H2S threshold: Safe < 10 ppm
  if (h2s >= 10) {
    errors.push(`H2S toxic threshold exceeded (${h2s} ppm >= 10 ppm). Respiratory hazard.`);
  } else if (h2s >= 5) {
    warnings.push(`H2S trace detected (${h2s} ppm). Ensure personal monitors active.`);
  }

  // CO threshold: Safe < 25 ppm
  if (co >= 25) {
    errors.push(`Carbon Monoxide limit exceeded (${co} ppm >= 25 ppm). Toxic gas hazard.`);
  } else if (co >= 15) {
    warnings.push(`CO elevated level (${co} ppm). Ensure continuous mechanical ventilation.`);
  }

  const isSafe = errors.length === 0;
  const status = errors.length > 0 ? 'DANGER' : (warnings.length > 0 ? 'WARNING' : 'SAFE');

  return { status, isSafe, errors, warnings };
}

export function detectSimopsConflict(currentPermit: Permit, allPermits: Permit[]): SimopsConflict {
  // Find other active or authorized permits that overlap in zone
  const otherPermits = allPermits.filter(p => 
    p.id !== currentPermit.id && 
    (p.status === 'Active' || p.status === 'Authorized') &&
    p.zone === currentPermit.zone
  );

  for (const other of otherPermits) {
    // 1. Hot Work vs Confined Space venting flammables or hydrocarbons
    if (
      (currentPermit.type === 'Hot Work' && other.type === 'Confined Space Entry' && other.flammableVentingOrHydrocarbonRisk) ||
      (currentPermit.type === 'Confined Space Entry' && currentPermit.flammableVentingOrHydrocarbonRisk && other.type === 'Hot Work')
    ) {
      return {
        hasConflict: true,
        severity: 'CRITICAL',
        clashingPermitId: other.id,
        clashingPermitNumber: other.permitNumber,
        clashingPermitType: other.type,
        clashingPermitTitle: other.title,
        clashingZone: other.zone,
        separationDistanceMeters: 18,
        minSeparationRequiredMeters: 50,
        hazardDescription: 'Ignition Source (Hot Work welding/grinding) positioned directly adjacent to active Confined Space venting flammable hydrocarbon vapors. Severe vapor cloud ignition & flash fire risk.',
        statutoryRule: 'ADNOC CoP Safe Systems of Work / PDO PR-1172 SIMOPS Section 4.3 & OSHAD-SF CoP 2.0 (Mandatory 50m clear boundary)',
        mandatoryMitigations: [
          'De-authorize hot work until confined space degassing & purging confirms 0% LEL at boundary',
          'Deploy spark containment pressurized habitat with certified positive pressure ventilation',
          'Reroute forced draft exhaust ducting at least 60m away in non-hazardous downwind location',
          'Continuous combustible gas LEL perimeter monitoring by certified AGT'
        ]
      };
    }

    // 2. Critical Lift vs Working at Height / Personnel below
    if (
      (currentPermit.type === 'Critical Lift' && other.type === 'Working at Height') ||
      (currentPermit.type === 'Working at Height' && other.type === 'Critical Lift')
    ) {
      return {
        hasConflict: true,
        severity: 'CRITICAL',
        clashingPermitId: other.id,
        clashingPermitNumber: other.permitNumber,
        clashingPermitType: other.type,
        clashingPermitTitle: other.title,
        clashingZone: other.zone,
        separationDistanceMeters: 22,
        minSeparationRequiredMeters: 75,
        hazardDescription: 'Critical Tandem Crane Lift boom and suspended load radius directly overflies scaffolders and personnel working at height in same process structure.',
        statutoryRule: 'LEEA / PDO PR-1708 Lifting Operations & UAE Federal Ministerial Order 32/1982',
        mandatoryMitigations: [
          'Immediate evacuation of scaffold platforms during load suspension and swing',
          'Establish 100% hard barricade exclusion zone at ground and intermediate deck levels',
          'Lift director radio synchronization with area supervisor'
        ]
      };
    }

    // 3. Excavation vs Hot Work near uncovered hydrocarbon lines
    if (
      (currentPermit.type === 'Excavation' && other.type === 'Hot Work') ||
      (currentPermit.type === 'Hot Work' && other.type === 'Excavation')
    ) {
      return {
        hasConflict: true,
        severity: 'HIGH',
        clashingPermitId: other.id,
        clashingPermitNumber: other.permitNumber,
        clashingPermitType: other.type,
        clashingPermitTitle: other.title,
        clashingZone: other.zone,
        separationDistanceMeters: 30,
        minSeparationRequiredMeters: 50,
        hazardDescription: 'Deep trench mechanical excavation adjacent to structural hot work welding sparks. Vibration may destabilize trench walls while sparks risk ignition of soil-entrained gas pockets.',
        statutoryRule: 'OSHAD-SF CoP 27.0 Excavation & Trenching / PDO PR-1072',
        mandatoryMitigations: [
          'Install fire-retardant welding blankets and spark catchers',
          'Continuous LEL monitoring at trench base and rim',
          'Trench box shoring certified prior to vibration-inducing work'
        ]
      };
    }
  }

  return {
    hasConflict: false,
    severity: 'NONE',
    clashingPermitId: '',
    clashingPermitNumber: '',
    clashingPermitType: '',
    clashingPermitTitle: '',
    clashingZone: currentPermit.zone,
    separationDistanceMeters: 120,
    minSeparationRequiredMeters: 50,
    hazardDescription: '',
    statutoryRule: '',
    mandatoryMitigations: []
  };
}

export const INITIAL_MOCK_PERMITS: Permit[] = [
  {
    id: 'p-001',
    permitNumber: 'PTW-2026-0842',
    title: 'Hot Work: Flange Welding on Crude Export Line Header',
    type: 'Hot Work',
    status: 'Requested',
    zone: 'Zone 2 - Gas Sweetening & Fractionation',
    exactLocation: 'Train-2 Feed Manifold, Elevation +4.5m',
    contractor: 'Target Engineering & Construction LLC',
    crewSize: 8,
    validFrom: new Date(Date.now() - 3600000).toISOString(),
    validTo: new Date(Date.now() + 18000000).toISOString(),
    description: 'Hot work torch cutting and TIG welding of 12-inch ASME Class 600 flange joint on sour crude bypass manifold.',
    riskScore: 18,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: true,
    simopsClashLocked: true,
    simopsClashDetails: 'Detected proximity to active Confined Space degassing in Vessel V-201 (18m separation vs 50m requirement).',
    gasTestingLog: [
      {
        id: 'gt-1',
        timestamp: '2026-10-04T07:15:00Z',
        oxygen: 20.8,
        lel: 0.0,
        h2s: 0.0,
        co: 2.0,
        testerName: 'Rashid Al-Nuaimi',
        testerCertNo: 'AGT-III-8821',
        detectorSerial: 'BW-ULTRA-7741',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Initial morning baseline test. Atmospheric conditions normal at weld envelope.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-1',
        tagNumber: 'LOTO-M-104',
        isolationPoint: 'MOV-102 Manifold Suction Valve',
        equipmentName: 'Crude Booster Pump P-102A',
        isolationType: 'Mechanical',
        status: 'Zero Energy Verified',
        isolatorSignature: 'M. Mansoori (Lead Mech)',
        isolatorId: 'EMP-9021',
        isolatorTimestamp: '2026-10-04 06:40 GST',
        verifierSignature: 'T. Al-Hashmi (Area Auth)',
        verifierId: 'AA-4412',
        verifierTimestamp: '2026-10-04 07:00 GST'
      },
      {
        id: 'loto-2',
        tagNumber: 'LOTO-E-209',
        isolationPoint: 'MCC-4B Feeder Breaker Cubicle #12',
        equipmentName: 'Booster Pump Electric Motor Driver 450kW',
        isolationType: 'Electrical',
        status: 'Applied & Padlocked',
        isolatorSignature: 'K. Pillai (Senior Elect)',
        isolatorId: 'EMP-7714',
        isolatorTimestamp: '2026-10-04 06:50 GST',
        verifierSignature: 'T. Al-Hashmi (Area Auth)',
        verifierId: 'AA-4412',
        verifierTimestamp: '2026-10-04 07:05 GST'
      }
    ],
    issuerSignature: {
      signed: false,
      signatoryName: 'Eng. Tariq Al-Hashmi',
      signatoryRole: 'Area Authority / Shift Superintendent',
      signatoryOrg: 'ADNOC Gas Processing',
      certNumber: 'AA-CERT-9942',
      timestamp: '',
      checklistConfirmed: false
    },
    receiverSignature: {
      signed: false,
      signatoryName: 'Rajesh Kumar',
      signatoryRole: 'Performing Authority / Task Lead',
      signatoryOrg: 'Target Engineering LLC',
      certNumber: 'PA-TAR-5510',
      timestamp: '',
      checklistConfirmed: false
    },
    createdAt: '2026-10-04T06:00:00Z',
    updatedAt: '2026-10-04T07:20:00Z'
  },
  {
    id: 'p-002',
    permitNumber: 'PTW-2026-0839',
    title: 'Confined Space Entry: Separator V-201 Internal Degassing & Inspection',
    type: 'Confined Space Entry',
    status: 'Active',
    zone: 'Zone 2 - Gas Sweetening & Fractionation',
    exactLocation: 'Degassing Vessel V-201, Bay 3',
    contractor: 'Consolidated Contractors Co. (CCC)',
    crewSize: 6,
    validFrom: new Date(Date.now() - 7200000).toISOString(),
    validTo: new Date(Date.now() + 21600000).toISOString(),
    description: 'Internal vessel sludge clearance, ultrasonic wall thickness scanning, and nitrogen inerting purge with forced mechanical exhaust.',
    riskScore: 22,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: true,
    simopsClashLocked: false,
    gasTestingLog: [
      {
        id: 'gt-2',
        timestamp: '2026-10-04T06:30:00Z',
        oxygen: 20.6,
        lel: 3.5,
        h2s: 1.2,
        co: 4.0,
        testerName: 'Salem Al-Jabri',
        testerCertNo: 'AGT-II-3319',
        detectorSerial: 'DRAGER-XAM-8000',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Continuous extraction fan active. LEL within permissible entry limit.'
      }
    ],
    lotoIsolations: [
      {
        id: 'loto-3',
        tagNumber: 'LOTO-M-088',
        isolationPoint: 'Inlet Header Spectacle Blind (Reversed)',
        equipmentName: 'Separator V-201 Inlet',
        isolationType: 'Mechanical',
        status: 'Zero Energy Verified',
        isolatorSignature: 'H. Al-Balushi',
        isolatorId: 'EMP-6621',
        isolatorTimestamp: '2026-10-04 05:30 GST',
        verifierSignature: 'T. Al-Hashmi',
        verifierId: 'AA-4412',
        verifierTimestamp: '2026-10-04 06:00 GST'
      }
    ],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Tariq Al-Hashmi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'ADNOC Gas Processing',
      certNumber: 'AA-CERT-9942',
      timestamp: '2026-10-04 06:15 GST',
      digestHash: 'SHA256:4d8a1c90e2b588fa2981ce81',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Mohamed Farooq',
      signatoryRole: 'Performing Authority',
      signatoryOrg: 'CCC Industrial Services',
      certNumber: 'PA-CCC-1109',
      timestamp: '2026-10-04 06:20 GST',
      digestHash: 'SHA256:7b91ee40a921ff04d88e63',
      checklistConfirmed: true
    },
    createdAt: '2026-10-04T05:00:00Z',
    updatedAt: '2026-10-04T06:25:00Z'
  },
  {
    id: 'p-003',
    permitNumber: 'PTW-2026-0845',
    title: 'Critical Lift: Dual Crane Tandem Lift of Heat Exchanger Bundle (38 Tons)',
    type: 'Critical Lift',
    status: 'Authorized',
    zone: 'Zone 1 - Crude Distillation Unit',
    exactLocation: 'Crude Preheat Train Exchanger E-104 Bay',
    contractor: 'Mammoet Gulf Lifting Services',
    crewSize: 12,
    validFrom: new Date(Date.now() - 1800000).toISOString(),
    validTo: new Date(Date.now() + 25200000).toISOString(),
    description: 'Heavy tandem mobilization of 38-metric ton tube bundle utilizing 250T and 150T mobile telescopic cranes over live piperack.',
    riskScore: 21,
    riskRating: 'Critical',
    flammableVentingOrHydrocarbonRisk: false,
    heavyCraneRadiusMeters: 45,
    simopsClashLocked: false,
    gasTestingLog: [],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Sultan Al-Ketbi',
      signatoryRole: 'Site Operations Lead',
      signatoryOrg: 'PDO Exploration & Production',
      certNumber: 'AA-PDO-7710',
      timestamp: '2026-10-04 07:00 GST',
      digestHash: 'SHA256:91cbf8912e9871ab01e92c43',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: false,
      signatoryName: 'David MacIntyre',
      signatoryRole: 'Appointed Rigging Superintendent',
      signatoryOrg: 'Mammoet Heavy Lift',
      certNumber: 'LEEA-LIFT-9901',
      timestamp: '',
      checklistConfirmed: false
    },
    createdAt: '2026-10-04T05:30:00Z',
    updatedAt: '2026-10-04T07:05:00Z'
  },
  {
    id: 'p-004',
    permitNumber: 'PTW-2026-0848',
    title: 'Working at Height: Flare Stack Tip Thermocouple Sensor Replacement',
    type: 'Working at Height',
    status: 'Active',
    zone: 'Zone 4 - Flare & Utilities Header',
    exactLocation: 'Main High-Pressure Flare Tip #1 (Elevation 78m)',
    contractor: 'Target Engineering LLC',
    crewSize: 4,
    validFrom: new Date(Date.now() - 14400000).toISOString(),
    validTo: new Date(Date.now() + 10800000).toISOString(),
    description: 'Rope access certified technicians replacing redundant pilot thermocouples on online flare system with radiation heat shielding.',
    riskScore: 16,
    riskRating: 'High',
    flammableVentingOrHydrocarbonRisk: false,
    simopsClashLocked: false,
    gasTestingLog: [
      {
        id: 'gt-4',
        timestamp: '2026-10-04T04:45:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Rashid Al-Nuaimi',
        testerCertNo: 'AGT-III-8821',
        detectorSerial: 'BW-ULTRA-7741',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Flare header boundary tested. Zero hydrocarbon release detected.'
      }
    ],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Tariq Al-Hashmi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'ADNOC Gas Processing',
      certNumber: 'AA-CERT-9942',
      timestamp: '2026-10-04 04:30 GST',
      digestHash: 'SHA256:1198fba012c8e907a552bce',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Liam O’Connor',
      signatoryRole: 'IRATA Level 3 Rig Lead',
      signatoryOrg: 'Target Access Services',
      certNumber: 'IRATA-3-88210',
      timestamp: '2026-10-04 04:35 GST',
      digestHash: 'SHA256:881cf42a0018b109e51244',
      checklistConfirmed: true
    },
    createdAt: '2026-10-04T04:00:00Z',
    updatedAt: '2026-10-04T04:40:00Z'
  },
  {
    id: 'p-005',
    permitNumber: 'PTW-2026-0850',
    title: 'Excavation: Trenching for 132kV Substation Underground Tie-in',
    type: 'Excavation',
    status: 'Draft',
    zone: 'Zone 5 - High Voltage Substation',
    exactLocation: 'Feeder Yard Boundary, Cable Trench Corridor 4',
    contractor: 'Al Hassan Engineering Group',
    crewSize: 10,
    validFrom: new Date(Date.now() + 7200000).toISOString(),
    validTo: new Date(Date.now() + 36000000).toISOString(),
    description: 'Manual and micro-excavator trenching to 1.8m depth for high-voltage feeder cable raceway. GPR scan required prior to mechanical breaking.',
    riskScore: 12,
    riskRating: 'Medium',
    flammableVentingOrHydrocarbonRisk: false,
    simopsClashLocked: false,
    gasTestingLog: [],
    lotoIsolations: [
      {
        id: 'loto-5',
        tagNumber: 'LOTO-E-330',
        isolationPoint: 'Substation Yard Busbar Isolator Switch 4A',
        equipmentName: '132kV Incoming Feeder Cable Feeder 4',
        isolationType: 'Electrical',
        status: 'Applied & Padlocked',
        isolatorSignature: 'K. Pillai (Elect Lead)',
        isolatorId: 'EMP-7714',
        isolatorTimestamp: '2026-10-04 07:10 GST',
        verifierSignature: '',
        verifierId: '',
        verifierTimestamp: ''
      }
    ],
    issuerSignature: {
      signed: false,
      signatoryName: '',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'DEWA / Utility Operations',
      timestamp: '',
      checklistConfirmed: false
    },
    receiverSignature: {
      signed: false,
      signatoryName: '',
      signatoryRole: 'Excavation Supervisor',
      signatoryOrg: 'Al Hassan Engineering',
      timestamp: '',
      checklistConfirmed: false
    },
    createdAt: '2026-10-04T07:10:00Z',
    updatedAt: '2026-10-04T07:10:00Z'
  },
  {
    id: 'p-006',
    permitNumber: 'PTW-2026-0852',
    title: 'Cold Work: Differential Pressure Transmitter DP-402 Calibration',
    type: 'Cold Work',
    status: 'Active',
    zone: 'Zone 3 - Tank Farm & Loading Gantry',
    exactLocation: 'Crude Storage Tank TK-502 Instrument Ring',
    contractor: 'Yokogawa Engineering Services',
    crewSize: 3,
    validFrom: new Date(Date.now() - 10800000).toISOString(),
    validTo: new Date(Date.now() + 7200000).toISOString(),
    description: 'Zero/span calibration and HART communicator diagnostic verification on crude tank hydrostatic level transmitter. Intrinsically safe hand tools only.',
    riskScore: 6,
    riskRating: 'Low',
    flammableVentingOrHydrocarbonRisk: false,
    simopsClashLocked: false,
    gasTestingLog: [
      {
        id: 'gt-6',
        timestamp: '2026-10-04T05:00:00Z',
        oxygen: 20.9,
        lel: 0.0,
        h2s: 0.0,
        co: 0.0,
        testerName: 'Rashid Al-Nuaimi',
        testerCertNo: 'AGT-III-8821',
        detectorSerial: 'BW-ULTRA-7741',
        bumpTested: true,
        status: 'SAFE',
        notes: 'Atmosphere safe and stable.'
      }
    ],
    lotoIsolations: [],
    issuerSignature: {
      signed: true,
      signatoryName: 'Eng. Tariq Al-Hashmi',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'ADNOC Gas Processing',
      certNumber: 'AA-CERT-9942',
      timestamp: '2026-10-04 04:50 GST',
      digestHash: 'SHA256:5508cce89021da33b6',
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Anas Al-Harthy',
      signatoryRole: 'Lead Instrument Specialist',
      signatoryOrg: 'Yokogawa Services',
      certNumber: 'INST-YK-884',
      timestamp: '2026-10-04 04:55 GST',
      digestHash: 'SHA256:7721ba09de4890c218',
      checklistConfirmed: true
    },
    createdAt: '2026-10-04T04:30:00Z',
    updatedAt: '2026-10-04T05:05:00Z'
  }
];
