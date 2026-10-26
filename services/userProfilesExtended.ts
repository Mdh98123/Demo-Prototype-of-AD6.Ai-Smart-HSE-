import { UserProfile } from '../types';

export const EXTENDED_ENTERPRISE_USERS: UserProfile[] = [
  // =========================================================================
  // 6. Sarah Jones - Site HSE Manager (Mina Al Fahal Operations, Oman)
  // =========================================================================
  {
    id: 'u4',
    name: 'Sarah Jones',
    email: 'sarah.jones@gulfenergy.ae',
    role: 'Site_HSE_Manager',
    department: 'Site Safety & Regulatory Governance',
    businessUnit: 'Downstream Petrochemicals & Refining',
    organization: 'Gulf Energy Maritime & Infrastructure',
    siteLocation: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman)',
    employeeId: 'GE-MCT-1088',
    jobTitle: 'Site HSE Manager & Level 3 PTW Issuing Authority',
    managerName: 'Ahmed Al-Mansoori (Regional HSE Director)',
    phoneExtension: '+968 24 602 1088',
    employmentStatus: 'Active',
    joiningDate: '2019-08-15',
    safetyScore: 1920,
    recentIncidents: [
      'Reviewed chemical spill containment in Zone C',
      'Approved CAPA #CA-2026-0287 for Extruder bearing overheating'
    ],
    observations: [],
    responsibilities: [
      'Site statutory compliance oversight under Oman MoL MD 286/2008 & PDO SP-1143 and Oman Royal Decrees & Labour Law',
      'Issuing Authority validation for Level 3 Critical Permits to Work and SIMOPS de-confliction',
      'Chairs weekly Asset HSE Steering Committee and reviews major incident root causes',
      'Asset crisis controller liaison with Civil Defence and Ambulance Authority (CDAA Oman) and Environment Agency'
    ],
    skills: [
      'Incident Investigation & RCA',
      'ISO 45001 Lead Auditor',
      'PTW Level 3 Issuing Authority',
      'Process Safety Management',
      'Oman MoL MD 286/2008 & PDO Specifications Framework'
    ],
    competencies: [
      { competency: 'Lead Auditor ISO 45001:2018', level: 'Expert', verifiedDate: '2025-10-14', verifierName: 'BSI Middle East' },
      { competency: 'Level 3 PTW Issuing Authority', level: 'Expert', verifiedDate: '2026-01-20', verifierName: 'PDO / Gulf Energy Board' },
      { competency: 'Advanced Root Cause Analysis (TapRooT)', level: 'Expert', verifiedDate: '2025-06-12', verifierName: 'TapRooT Middle East' },
      { competency: 'Oman MoL MD 286/2008 General Safety Practitioner', level: 'Expert', verifiedDate: '2026-03-01', verifierName: 'Ministry of Labour Occupational Safety & Health Directorate' }
    ],
    certifications: [
      { name: 'ISO 45001 Lead Auditor Certificate', status: 'Valid', expiryDate: '2028-09-30' },
      { name: 'NEBOSH International Diploma in Occupational Health and Safety', status: 'Valid', expiryDate: '2029-05-15' },
      { name: 'Certified Area Issuing Authority (PDO SP-1143 (PTW Specification))', status: 'Valid', expiryDate: '2027-11-10' }
    ],
    achievements: [
      { id: 'ach-sj-01', title: 'Zero LTI Champion', description: 'Led Mina Al Fahal asset to 5 Million Man-Hours without a Lost Time Injury', dateEarned: '2026-05-18', icon: 'Trophy', tier: 'Gold' },
      { id: 'ach-sj-02', title: 'Regulatory Grade-A', description: 'Achieved 100% Oman MoL MD 286/2008 compliance audit pass score in 2026 surveillance', dateEarned: '2026-08-30', icon: 'Shield', tier: 'Gold' }
    ],
    currentWorkload: { activeTasks: 7, pendingApprovals: 4, openCapas: 3, utilizationRate: 84 },
    assignedProjects: ['Borouge 4 Interconnect', 'Flare Gas Recovery Overhaul', 'Solar Integration Phase 2'],
    assignedSites: ['Mina Al Fahal Refinery Asset', 'Berth 1 Marine Terminal'],
    approvalResponsibilities: [
      'Level 3 Critical Hot Work Permits',
      'High-Risk Incident Triage and Classification',
      'CAPA Closure Verifications',
      'Management of Change (MOC) HSE Sign-Off'
    ],
    activities: [
      { id: 'ACT-SJ-01', timestamp: '2026-10-08T06:00:00Z', timePeriod: 'Recent', actionType: 'Approved Permit', category: 'Permit', entityId: 'PTW-2026-0186', entityTitle: 'Hot Work on 24-Inch Hydrocarbon Trunkline', details: 'Authorized PTW #PTW-2026-0186 after verifying LOTO padlocks and AGT gas test reading of 0.0% LEL.', impactResult: 'Safe execution authorized with zero SIMOPS clash.', relatedUsers: ['Marcus Chen', 'Rahul Gupta'] },
      { id: 'ACT-SJ-02', timestamp: '2026-10-06T14:30:00Z', timePeriod: 'Recent', actionType: 'Chaired HSE Governance Meeting', category: 'Meeting', entityId: 'MTG-2026-0089', entityTitle: 'Asset HSE & SIMOPS Governance Committee', details: 'Chaired monthly asset review with contractor managers; reviewed heat stress metrics and crane lifts.', impactResult: 'Actions allocated for night-shift lighting and hydrometer checks.', relatedUsers: ['Marcus Chen', 'Fatima Al-Kaabi'] },
      { id: 'ACT-SJ-03', timestamp: '2026-10-05T08:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Reviewed Inspection', category: 'Inspection', entityId: 'INS-2026-0314', entityTitle: 'Scaffolding & Working at Height Field Inspection', details: 'Reviewed field inspection conducted by Fatima Al-Kaabi at Berth 1 and reactor column; noted 96% score.', impactResult: 'Endorsed corrective replacement of 2 tether lanyards.', relatedUsers: ['Fatima Al-Kaabi'] },
      { id: 'ACT-SJ-04', timestamp: '2026-10-04T15:30:00Z', timePeriod: 'Last 7 Days', actionType: 'Closed Incident', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Extruder Bearing Overheating & High-Temp Alarm', details: 'Signed final site closure for INC-2026-0142 following successful verification of CA-2026-0287.', impactResult: 'Incident formally closed and filed with Group HSE.', relatedUsers: ['Rahul Gupta', 'Marcus Chen', 'Dr. Layla Hassan'] },
      { id: 'ACT-SJ-05', timestamp: '2026-10-03T16:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Audited Finding Follow-up', category: 'Audit', entityId: 'AUD-2026-0047', entityTitle: 'ISO 45001 / PDO SP-1143 Surveillance Audit', details: 'Reviewed Finding FND-2026-0221 raised by Alice Smith regarding extruder sensor telemetry.', impactResult: 'Evidence forwarded confirming completion of CA-2026-0287.', relatedUsers: ['Alice Smith'] },
      { id: 'ACT-SJ-06', timestamp: '2026-09-29T14:20:00Z', timePeriod: 'Last 30 Days', actionType: 'Approved CAPA', category: 'CAPA', entityId: 'CA-2026-0287', entityTitle: 'Extruder Dual Infrared Telemetry Retrofit', details: 'Approved corrective action plan CA-2026-0287 submitted by Fatima Al-Kaabi following INC-2026-0142.', impactResult: 'Budget released for procurement of dual infrared sensors.', relatedUsers: ['Fatima Al-Kaabi', 'Rahul Gupta'] },
      { id: 'ACT-SJ-07', timestamp: '2026-09-28T10:15:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed Incident', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Extruder Bearing Overheating Initial Triage', details: 'Reviewed initial containment report from Marcus Chen; confirmed zero toxic release and safe isolation.', impactResult: 'Classified incident as Medium severity and initiated 5-Why investigation.', relatedUsers: ['Marcus Chen', 'Fatima Al-Kaabi'] },
      { id: 'ACT-SJ-08', timestamp: '2026-09-25T11:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Approved Risk Assessment', category: 'Risk Assessment', entityId: 'RA-2026-0098', entityTitle: 'High-Pressure Gas Flange Break Assessment', details: 'Endorsed comprehensive Job Safety Analysis and Bowtie mitigation register for planned hot tap tie-in.', impactResult: 'Mandatory nitrogen purge barriers codified in permit requirements.', relatedUsers: ['Marcus Chen'] },
      { id: 'ACT-SJ-09', timestamp: '2026-09-20T09:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Verified Training Competency', category: 'Training', entityId: 'TRN-2026-0155', entityTitle: 'Advanced H2S Breathing Apparatus Certification', details: 'Verified full compliance of 28 maintenance technicians on SCBA rescue protocols.', impactResult: '100% crew readiness for sour gas zone interventions.', relatedUsers: ['Rahul Gupta'] },
      { id: 'ACT-SJ-10', timestamp: '2026-09-15T15:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed Safety Observation', category: 'Observation', entityId: 'OBS-2026-0412', entityTitle: 'Positive Heat Stress Hydration Station Setup', details: 'Commended shift teams for morning WBGT index checks and hydration monitoring at Berth 1.', impactResult: 'Awarded team positive safety recognition badge.', relatedUsers: ['Rahul Gupta'] }
    ],
    pendingActions: [
      { id: 'PND-SJ-01', title: 'Quarterly Asset HSE Committee Minutes Sign-off', sourceType: 'Meeting', sourceId: 'MTG-2026-0089', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 1, isOverdue: false, status: 'In Review', requiredAction: 'Review and digitally countersign official action register for committee distribution', location: 'Mina Al Fahal Admin HQ' },
      { id: 'PND-SJ-02', title: 'Civil Defence Annual Inspection Preparation Review', sourceType: 'Audit', sourceId: 'AUD-ADCD-2026', priority: 'P1 - Critical', dueDate: '2026-10-12', daysRemaining: 3, isOverdue: false, status: 'Action Required', requiredAction: 'Verify foam deluge test logs and emergency response drill timings', location: 'Tank Farm C' },
      { id: 'PND-SJ-03', title: 'Permit Renewal: Polyethylene Column Nitrogen Purge', sourceType: 'Permit', sourceId: 'PTW-2026-8809', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 0, isOverdue: false, status: 'Pending Approval', requiredAction: 'Review continuous multi-gas monitor logs before authorizing 24h extension', location: 'Column C-102' },
      { id: 'PND-SJ-04', title: 'Verify Contractor Safety Prequalification: Petrofac', sourceType: 'Audit', sourceId: 'VET-PETRO-Q4', priority: 'P2 - High', dueDate: '2026-10-14', daysRemaining: 5, isOverdue: false, status: 'Scheduled', requiredAction: 'Audit TRIR records and LEEA lifting certificates for subcontractor consortium', location: 'HSE Portal' },
      { id: 'PND-SJ-05', title: 'Overdue CAPA Closure Verification: Chemical Eyewash', sourceType: 'CAPA', sourceId: 'CAPA-OMN-EYE', priority: 'P1 - Critical', dueDate: '2026-10-07', daysRemaining: -2, isOverdue: true, status: 'Overdue', requiredAction: 'Sign off physical plumbed eyewash inspection checklist at Acid Skid #2', location: 'Acid Skid #2' },
      { id: 'PND-SJ-06', title: 'Review SIMOPS Clash Matrix for Berth 1 Dredging', sourceType: 'Permit', sourceId: 'SIMOPS-B1-DREDGE', priority: 'P2 - High', dueDate: '2026-10-13', daysRemaining: 4, isOverdue: false, status: 'In Review', requiredAction: 'De-conflict crane lift radius with marine tugboat fueling operations', location: 'Berth 1' },
      { id: 'PND-SJ-07', title: 'Submit Oman MoL MD 286/2008 Q3 Performance Scorecard to HQ', sourceType: 'Incident', sourceId: 'Oman MoL MD 286/2008-Q3-REP', priority: 'P2 - High', dueDate: '2026-10-15', daysRemaining: 6, isOverdue: false, status: 'Action Required', requiredAction: 'Review leading indicators, near misses, and LTIFR rate for Muscat Oman MoL MD 286/2008 portal', location: 'Group Legal Vault' },
      { id: 'PND-SJ-08', title: 'Approve MOC-2026-088 High-Temperature Gasket Change', sourceType: 'Risk Assessment', sourceId: 'MOC-2026-088', priority: 'P3 - Medium', dueDate: '2026-10-16', daysRemaining: 7, isOverdue: false, status: 'Pending Approval', requiredAction: 'Confirm material compatibility test results from metallurgical laboratory', location: 'Extrusion Hall' },
      { id: 'PND-SJ-09', title: 'Audit Scaffolding Tag Digital Register', sourceType: 'Inspection', sourceId: 'INS-SCAF-REG', priority: 'P3 - Medium', dueDate: '2026-10-18', daysRemaining: 9, isOverdue: false, status: 'Scheduled', requiredAction: 'Spot-check QR tag scanning compliance by scaffolding inspectors', location: 'Reactor Structure' },
      { id: 'PND-SJ-10', title: 'Review Industrial Hygiene Noise Map Survey', sourceType: 'Risk Assessment', sourceId: 'HYG-NOISE-2026', priority: 'P3 - Medium', dueDate: '2026-10-20', daysRemaining: 11, isOverdue: false, status: 'Upcoming', requiredAction: 'Verify acoustic insulation recommendations for compressor house C-3', location: 'Compressor House' }
    ],
    completedActions: [
      { id: 'CMP-SJ-01', title: 'Verified Incident #INC-2026-0142 Site Remediation', sourceType: 'Incident', sourceId: 'INC-2026-0142', completedDate: '2026-10-04T15:30:00Z', outcome: 'Extruder drive motor retrofitted with dual infrared sensors; verified 68°C steady temperature under load.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Digital temperature telemetry attached and archived.', location: 'Extrusion Hall Zone C' },
      { id: 'CMP-SJ-02', title: 'Authorized PTW #PTW-2026-0186 Critical Hot Work', sourceType: 'Permit', sourceId: 'PTW-2026-0186', completedDate: '2026-10-08T06:00:00Z', outcome: 'Safe work authorization stamped with LOTO isolation padlocks verified.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Digital signature recorded in blockchain ledger.', location: 'Header Manifold HM-03' },
      { id: 'CMP-SJ-03', title: 'Approved CAPA #CA-2026-0287 Procurement Budget', sourceType: 'CAPA', sourceId: 'CA-2026-0287', completedDate: '2026-09-29T14:20:00Z', outcome: 'High-temp synthetic polyalphaolefin grease and dual sensors procured.', verifiedBy: 'Sarah Jones', evidenceNotes: 'PO #PO-9921 approved.', location: 'Warehouse Bay 2' },
      { id: 'CMP-SJ-04', title: 'Closed Civil Defence and Ambulance Authority (CDAA Oman) Pre-Audit Observation', sourceType: 'Audit', sourceId: 'AUD-ADCD-OBS', completedDate: '2026-09-26T11:00:00Z', outcome: 'Emergency foam proportioner calibration verified with zero variation.', verifiedBy: 'Civil Defence and Ambulance Authority (CDAA Oman)', evidenceNotes: 'Inspection pass certificate issued.', location: 'Fire Station 2' },
      { id: 'CMP-SJ-05', title: 'Endorsed JSA for High-Pressure Flange Break', sourceType: 'Risk Assessment', sourceId: 'RA-2026-0098', completedDate: '2026-09-25T11:00:00Z', outcome: 'Nitrogen purge envelope and blind list approved for maintenance turnaround.', verifiedBy: 'Sarah Jones', evidenceNotes: 'JSA signed by Area Authority.', location: 'Header Manifold HM-03' },
      { id: 'CMP-SJ-06', title: 'Verified Scaffolding Tether Pouches Across Mina Al Fahal', sourceType: 'CAPA', sourceId: 'capa-omn-07', completedDate: '2026-09-22T16:00:00Z', outcome: '50 heavy-duty zip-lock tool tether bags issued to all rigging crews.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Equipment issue slips signed.', location: 'Scaffold Yard' },
      { id: 'CMP-SJ-07', title: 'Conducted Asset Crisis Simulation Tier-2 Drill', sourceType: 'Meeting', sourceId: 'DRILL-T2-RUW', completedDate: '2026-09-18T14:00:00Z', outcome: 'Simulated sour gas release handled within 7 minutes with 100% headcount accounted for.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Drill evaluation report filed.', location: 'Command Center' },
      { id: 'CMP-SJ-08', title: 'Reviewed ISO 45001 Surveillance Findings with Auditor', sourceType: 'Audit', sourceId: 'AUD-2026-0047', completedDate: '2026-09-15T17:00:00Z', outcome: 'All 3 minor observations resolved within 10-day corrective window.', verifiedBy: 'Alice Smith', evidenceNotes: 'Lead Auditor formal closeout email on file.', location: 'Admin Conference Room' },
      { id: 'CMP-SJ-09', title: 'Approved WBGT Automated Flagging Rules in Platform', sourceType: 'Inspection', sourceId: 'SYS-WBGT-CFG', completedDate: '2026-09-10T09:30:00Z', outcome: 'Automatic SMS push notification to site supervisors when heat index exceeds 32°C.', verifiedBy: 'Sarah Jones', evidenceNotes: 'System alert log tested.', location: 'Digital Platform' },
      { id: 'CMP-SJ-10', title: 'Completed Annual Process Safety Barrier Review', sourceType: 'Risk Assessment', sourceId: 'PSM-BAR-2026', completedDate: '2026-09-02T13:00:00Z', outcome: 'All 14 safety critical elements (SCE) confirmed operable with valid PM status.', verifiedBy: 'Dr. Layla Hassan', evidenceNotes: 'Asset integrity dashboard validated.', location: 'Technical HQ' }
    ],
    notifications: [
      { id: 'NTF-SJ-01', timestamp: '2026-10-08T06:05:00Z', title: 'Permit Authorized: PTW-2026-0186', message: 'Hot Work on 24-Inch Hydrocarbon Trunkline authorized and live on SIMOPS radar.', severity: 'High', category: 'Permit', sourceId: 'PTW-2026-0186', read: false, senderName: 'Marcus Chen' },
      { id: 'NTF-SJ-02', timestamp: '2026-10-06T15:00:00Z', title: 'HSE Committee Minutes Circulated', message: 'Monthly minutes for MTG-2026-0089 submitted for your final digital sign-off.', severity: 'Low', category: 'Governance', sourceId: 'MTG-2026-0089', read: true, senderName: 'Committee Secretary' },
      { id: 'NTF-SJ-03', timestamp: '2026-10-05T08:30:00Z', title: 'Inspection INS-2026-0314 Submitted', message: 'Fatima Al-Kaabi completed scaffolding field check with 96% pass score.', severity: 'Low', category: 'Inspection', sourceId: 'INS-2026-0314', read: true, senderName: 'Fatima Al-Kaabi' },
      { id: 'NTF-SJ-04', timestamp: '2026-10-04T15:35:00Z', title: 'Incident INC-2026-0142 Successfully Closed', message: 'Dr. Layla Hassan confirmed executive sign-off for extruder incident closure.', severity: 'Low', category: 'Incident', sourceId: 'INC-2026-0142', read: true, senderName: 'Dr. Layla Hassan' },
      { id: 'NTF-SJ-05', timestamp: '2026-10-03T16:30:00Z', title: 'Audit Finding FND-2026-0221 Closed', message: 'Alice Smith verified corrective evidence for ISO 45001 finding #0221.', severity: 'Low', category: 'Audit', sourceId: 'FND-2026-0221', read: true, senderName: 'Alice Smith' },
      { id: 'NTF-SJ-06', timestamp: '2026-10-02T16:15:00Z', title: 'CAPA CA-2026-0287 Executed by Technician', message: 'Rahul Gupta completed sensor retrofit and uploaded photo verification.', severity: 'Low', category: 'CAPA', sourceId: 'CA-2026-0287', read: true, senderName: 'Rahul Gupta' },
      { id: 'NTF-SJ-07', timestamp: '2026-09-29T14:30:00Z', title: 'CAPA Approval Confirmed', message: 'Your approval of CA-2026-0287 has been logged and assigned to Rahul Gupta.', severity: 'Medium', category: 'CAPA', sourceId: 'CA-2026-0287', read: true, senderName: 'Workflow Engine' },
      { id: 'NTF-SJ-08', timestamp: '2026-09-28T09:45:00Z', title: 'New Incident Review: INC-2026-0142', message: 'Marcus Chen forwarded Extruder EX-04 thermal incident for manager review.', severity: 'High', category: 'Incident', sourceId: 'INC-2026-0142', read: true, senderName: 'Marcus Chen' },
      { id: 'NTF-SJ-09', timestamp: '2026-09-25T11:30:00Z', title: 'Risk Assessment RA-2026-0098 Approved', message: 'JSA and nitrogen purge procedure approved for Header Manifold HM-03.', severity: 'Low', category: 'Risk Assessment', sourceId: 'RA-2026-0098', read: true, senderName: 'SIMOPS System' },
      { id: 'NTF-SJ-10', timestamp: '2026-09-20T09:15:00Z', title: 'Training Batch Certified: TRN-2026-0155', message: '28 technicians cleared for H2S SCBA certified hazardous work.', severity: 'Low', category: 'Training', sourceId: 'TRN-2026-0155', read: true, senderName: 'HSE Training Academy' }
    ]
  },

  // =========================================================================
  // 7. Ahmed Al-Mansoori - Regional HSE Director (Muscat & Interior Concessions)
  // =========================================================================
  {
    id: 'u3',
    name: 'Ahmed Al-Mansoori',
    email: 'ahmed.mansoori@gulfenergy.ae',
    role: 'Regional_HSE_Director',
    department: 'Muscat & Interior Concessionsal HSE Operations Directorate',
    businessUnit: 'Oman Onshore & Offshore Regional Asset Directorate',
    organization: 'Gulf Energy & Infrastructure Group',
    siteLocation: 'Muscat Operational Concession Center · Oman',
    employeeId: 'GE-MCT-0045',
    jobTitle: 'Regional HSE Director - Oman Industrial Concessions',
    managerName: 'Dr. Layla Hassan (Head of Group HSE)',
    phoneExtension: '+968 24 602 0045',
    employmentStatus: 'Active',
    joiningDate: '2017-02-01',
    safetyScore: 2150,
    recentIncidents: [
      'Regional oversight of dropped object near-miss INC-2026-OMN-0622',
      'Chaired quarterly statutory liaison with Muscat Oman MoL MD 286/2008'
    ],
    observations: [],
    responsibilities: [
      'Multi-site HSE governance across 4 major concession assets in Muscat emirate',
      'Executive liaison with Ministry of Labour Occupational Safety & Health Directorate (Oman MoL OSHD) and PDO HSE Directorate',
      'Strategic capital allocation for high-risk safety barrier integrity and decarbonization',
      'Tier-2 and Tier-3 regional incident escalation lead and crisis command team member'
    ],
    skills: [
      'Regional HSE Governance',
      'Oman MoL MD 286/2008 & PDO Specifications Strategic Implementation',
      'Tier-2 Crisis Management',
      'Contractor Prequalification & Assurance',
      'Statutory Regulatory Affairs'
    ],
    competencies: [
      { competency: 'NEBOSH Diploma in Occupational Health and Safety', level: 'Expert', verifiedDate: '2024-05-18', verifierName: 'NEBOSH UK' },
      { competency: 'Oman MoL MD 286/2008 Master Safety Practitioner', level: 'Expert', verifiedDate: '2025-08-20', verifierName: 'Muscat Oman MoL MD 286/2008 Authority' },
      { competency: 'Crisis Management & Strategic Incident Command', level: 'Expert', verifiedDate: '2025-11-12', verifierName: 'Cabinet Crisis Authority' }
    ],
    certifications: [
      { name: 'NEBOSH International Diploma in Occupational Safety', status: 'Valid', expiryDate: '2028-12-31' },
      { name: 'Certified Safety Executive (WSO-CSE)', status: 'Valid', expiryDate: '2027-06-30' },
      { name: 'Muscat Oman MoL MD 286/2008 Grade-1 Lead Assessor', status: 'Valid', expiryDate: '2028-04-15' }
    ],
    achievements: [
      { id: 'ach-am-01', title: 'Regional Safety Leadership', description: 'Maintained 0.14 TRIR across all 4 Muscat concessions over 3 years', dateEarned: '2026-06-01', icon: 'Award', tier: 'Platinum' }
    ],
    currentWorkload: { activeTasks: 5, pendingApprovals: 6, openCapas: 4, utilizationRate: 88 },
    assignedProjects: ['Mina Al Fahal Asset Expansion Phase 3', 'Offshore Island Decarbonization Grid', 'Sour Gas Safety Modernization'],
    assignedSites: ['Mina Al Fahal Refinery Asset', 'Khazzan Tight Gas Complex Block 61', 'Duqm Maritime Port Terminal'],
    approvalResponsibilities: [
      'Regional CAPA Extensions > 30 Days',
      'Major Capital Project HSE Cases',
      'Statutory Regulatory Filings (Oman MoL MD 286/2008)',
      'Contractor Tier-1 Prequalification Suspension'
    ],
    activities: [
      { id: 'ACT-AM-01', timestamp: '2026-10-07T11:00:00Z', timePeriod: 'Recent', actionType: 'Chaired Regional Review', category: 'Meeting', entityId: 'MTG-2026-0089', entityTitle: 'Oman Industrial Concessions Regional HSE Performance Review', details: 'Reviewed monthly TRIR benchmarks and SIMOPS compliance rates across Mina Al Fahal and Khazzan Gas Asset.', impactResult: 'Endorsed regional adoption of dual infrared telemetry sensor standard.', relatedUsers: ['Sarah Jones', 'Dr. Layla Hassan'] },
      { id: 'ACT-AM-02', timestamp: '2026-10-05T14:00:00Z', timePeriod: 'Recent', actionType: 'Reviewed Incident Investigation', category: 'Incident', entityId: 'INC-2026-OMN-0622', entityTitle: 'Dropped Scaffolding Coupler Near-Miss Investigation', details: 'Reviewed TapRooT causal factors with Tariq Al-Hashemi; validated secondary tethering mandate.', impactResult: 'Mandate extended to all Muscat contractor contracts.', relatedUsers: ['Tariq Al-Hashemi', 'Sarah Jones'] },
      { id: 'ACT-AM-03', timestamp: '2026-10-04T16:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Endorsed Audit Findings', category: 'Audit', entityId: 'AUD-2026-0047', entityTitle: 'ISO 45001 Surveillance Audit Exit Conference', details: 'Participated in exit meeting with Alice Smith; noted Grade-A rating and zero major non-conformances.', impactResult: 'Final audit report approved for executive board circulation.', relatedUsers: ['Alice Smith', 'Dr. Layla Hassan'] },
      { id: 'ACT-AM-04', timestamp: '2026-10-02T10:30:00Z', timePeriod: 'Last 7 Days', actionType: 'Approved Regional Procedure', category: 'Risk Assessment', entityId: 'RA-2026-0098', entityTitle: 'Standardized Hydrocarbon Line Break JSA Protocol', details: 'Approved new unified regional procedure for positive mechanical spade isolations.', impactResult: 'Implemented across all 4 Oman concession sites.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-AM-05', timestamp: '2026-09-30T15:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Conducted Regulatory Filing', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Submitted Extruder Incident Summary to Muscat Oman MoL MD 286/2008', details: 'Uploaded formal incident containment and corrective action evidence to the Oman MoL MD 286/2008 government portal.', impactResult: 'Regulatory acknowledgment received within 24 hours with zero statutory sanctions.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-AM-06', timestamp: '2026-09-28T09:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Approved High-Risk Permit Policy', category: 'Permit', entityId: 'PTW-2026-0186', entityTitle: 'Trunkline Hot Work Risk Governance Authorization', details: 'Endorsed regional high-risk protocol for 24-inch trunkline hot tap operations.', impactResult: 'Safety parameters set for Area Authority sign-off.', relatedUsers: ['Sarah Jones', 'Marcus Chen'] },
      { id: 'ACT-AM-07', timestamp: '2026-09-24T13:30:00Z', timePeriod: 'Last 30 Days', actionType: 'Inspected Contractor Camp', category: 'Inspection', entityId: 'INS-CAMP-2026', entityTitle: 'Regional Contractor Welfare & Life Safety Audit', details: 'Inspected Mina Al Fahal contractor residential complex; verified dining hygiene, clinic staffing, and cooling.', impactResult: 'Contractor welfare score 94.2% verified.', relatedUsers: ['Khalid Al-Dhaheri'] },
      { id: 'ACT-AM-08', timestamp: '2026-09-20T11:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed Emergency Readiness', category: 'Training', entityId: 'TRN-2026-0155', entityTitle: 'Regional Mutual Aid Emergency Protocol Exercise', details: 'Coordinated joint drill with Muscat Police Emergency Services and Civil Defence.', impactResult: 'Regional mutual aid dispatch confirmed under 8 minutes.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-AM-09', timestamp: '2026-09-15T16:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Verified Observation Trend', category: 'Observation', entityId: 'OBS-2026-0412', entityTitle: 'Midday Heat Stress Leading Indicators Analysis', details: 'Analyzed 450+ safety observations logged in Q3; noted 42% increase in proactive worker reporting.', impactResult: 'Recognized frontline crews for exemplary reporting culture.', relatedUsers: ['Rahul Gupta'] },
      { id: 'ACT-AM-10', timestamp: '2026-09-10T10:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Closed Audit Finding', category: 'Audit', entityId: 'AUD-2026-004', entityTitle: 'Oman MoL MD 286/2008 & PDO PR-1172 Verification Audit', details: 'Verified digital gas log timestamp validation feature deployed across mobile PWA.', impactResult: 'Finding F-401 closed and cleared by external auditor.', relatedUsers: ['Alice Smith'] }
    ],
    pendingActions: [
      { id: 'PND-AM-01', title: 'Sign Annual Oman Concession Statutory Declaration', sourceType: 'Audit', sourceId: 'STAT-DEC-2026', priority: 'P1 - Critical', dueDate: '2026-10-12', daysRemaining: 3, isOverdue: false, status: 'Action Required', requiredAction: 'Digitally certify regional Oman MoL MD 286/2008 & PDO Specifications compliance return for Muscat Executive Council', location: 'Muscat HQ' },
      { id: 'PND-AM-02', title: 'Review Major MOC: Khazzan Gas Asset Acid Gas Flare Header Upgrade', sourceType: 'Risk Assessment', sourceId: 'MOC-HAB-091', priority: 'P2 - High', dueDate: '2026-10-14', daysRemaining: 5, isOverdue: false, status: 'In Review', requiredAction: 'Validate Quantitative Risk Assessment (QRA) thermal radiation contours', location: 'Khazzan Gas Asset Operations' },
      { id: 'PND-AM-03', title: 'Regional Contractor Safety Suspension Review: Al-Futtaim EPC', sourceType: 'Audit', sourceId: 'CON-REV-FUTT', priority: 'P2 - High', dueDate: '2026-10-11', daysRemaining: 2, isOverdue: false, status: 'Pending Approval', requiredAction: 'Review lifting supervisor recertification evidence following Berth 2 minor rigging stop', location: 'Regional HQ' },
      { id: 'PND-AM-04', title: 'Approve High-Risk CAPA Extension Request: Substation Padlocks', sourceType: 'CAPA', sourceId: 'CAPA-EXT-SS3', priority: 'P3 - Medium', dueDate: '2026-10-15', daysRemaining: 6, isOverdue: false, status: 'Action Required', requiredAction: 'Review 14-day supply chain delay justification for master key lockboxes', location: 'Mina Al Fahal Substation' },
      { id: 'PND-AM-05', title: 'Overdue Oman MoL MD 286/2008 Performance Target Sign-off', sourceType: 'Audit', sourceId: 'Oman MoL MD 286/2008-TGT-Q4', priority: 'P1 - Critical', dueDate: '2026-10-06', daysRemaining: -3, isOverdue: true, status: 'Overdue', requiredAction: 'Approve 2027 regional leading safety KPI targets for submission to Oman MoL OSHD', location: 'Regional HQ' },
      { id: 'PND-AM-06', title: 'Authorize Annual Mutual Aid Agreement Renewal', sourceType: 'Meeting', sourceId: 'MUT-AID-2027', priority: 'P2 - High', dueDate: '2026-10-16', daysRemaining: 7, isOverdue: false, status: 'In Review', requiredAction: 'Renew industrial mutual aid firefighting memorandum with PDO Refining', location: 'PDO HQ' },
      { id: 'PND-AM-07', title: 'Review Incident #INC-2026-OMN-0622 Final Root Cause Report', sourceType: 'Incident', sourceId: 'INC-2026-OMN-0622', priority: 'P2 - High', dueDate: '2026-10-17', daysRemaining: 8, isOverdue: false, status: 'Scheduled', requiredAction: 'Review 5-Why analysis and verify mandatory tool pouch deployment across all contractors', location: 'Mina Al Fahal' },
      { id: 'PND-AM-08', title: 'Audit Regional Industrial Hygiene Exposure Register', sourceType: 'Risk Assessment', sourceId: 'HYG-REG-Q4', priority: 'P3 - Medium', dueDate: '2026-10-19', daysRemaining: 10, isOverdue: false, status: 'Upcoming', requiredAction: 'Verify Benzene and H2S personal dosimeter badge logging compliance', location: 'Regional Lab' },
      { id: 'PND-AM-09', title: 'Review SIMOPS Map Conflict Alerts in Duqm Industrial Port', sourceType: 'Permit', sourceId: 'SIMOPS-JA-04', priority: 'P3 - Medium', dueDate: '2026-10-21', daysRemaining: 12, isOverdue: false, status: 'Pending', requiredAction: 'Verify separation distances between bunkering vessel and dock welding', location: 'Duqm Industrial Port Marine' },
      { id: 'PND-AM-10', title: 'Validate ISO 14001 Regional Emissions Ledger', sourceType: 'Audit', sourceId: 'AUD-ENV-14001', priority: 'P3 - Medium', dueDate: '2026-10-23', daysRemaining: 14, isOverdue: false, status: 'Scheduled', requiredAction: 'Confirm continuous stack CEMS calibration records with Khalid Al-Dhaheri', location: 'Environmental Hub' }
    ],
    completedActions: [
      { id: 'CMP-AM-01', title: 'Endorsed Incident #INC-2026-0142 Statutory Filing', sourceType: 'Incident', sourceId: 'INC-2026-0142', completedDate: '2026-09-30T15:00:00Z', outcome: 'Formal summary transmitted to Muscat Oman MoL MD 286/2008 portal with zero enforcement notices.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Portal confirmation receipt #Oman MoL OSHD-99120 filed.', location: 'Muscat HQ' },
      { id: 'CMP-AM-02', title: 'Approved Trunkline Hot Work Risk Governance Protocol', sourceType: 'Permit', sourceId: 'PTW-2026-0186', completedDate: '2026-09-28T09:00:00Z', outcome: 'Risk controls and nitrogen purge verification endorsed.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Policy document attached to permit.', location: 'Mina Al Fahal Header Manifold' },
      { id: 'CMP-AM-03', title: 'Closed Finding FND-2026-0221 Regional Verification', sourceType: 'Audit', sourceId: 'FND-2026-0221', completedDate: '2026-10-04T16:00:00Z', outcome: 'Verified extruder temperature sensor retrofit across Mina Al Fahal and Khazzan Gas Asset sister units.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Engineering bulletin issued.', location: 'All Regional Assets' },
      { id: 'CMP-AM-04', title: 'Chaired Asset HSE Committee Meeting MTG-2026-0089', sourceType: 'Meeting', sourceId: 'MTG-2026-0089', completedDate: '2026-10-07T11:00:00Z', outcome: 'Regional performance targets established for Q4 2026.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Meeting minutes signed.', location: 'Muscat HQ' },
      { id: 'CMP-AM-05', title: 'Approved JSA High-Pressure Line Break Procedure', sourceType: 'Risk Assessment', sourceId: 'RA-2026-0098', completedDate: '2026-10-02T10:30:00Z', outcome: 'Mechanical spade isolation checklist made mandatory.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Standard operating procedure released.', location: 'Regional HQ' },
      { id: 'CMP-AM-06', title: 'Completed Regional Safety Leadership Tour in Mina Al Fahal', sourceType: 'Inspection', sourceId: 'TOUR-RUW-09', completedDate: '2026-09-21T12:00:00Z', outcome: 'Met 120+ workers, conducted frontline engagement on dropped objects.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Tour action items logged.', location: 'Mina Al Fahal' },
      { id: 'CMP-AM-07', title: 'Approved Emergency Response Mutual Aid Protocol', sourceType: 'Meeting', sourceId: 'EMG-MOU-2026', completedDate: '2026-09-17T15:30:00Z', outcome: 'Agreement signed with Civil Defence and Ambulance Authority (CDAA Oman).', verifiedBy: 'Civil Defence Directorate', evidenceNotes: 'Signed MoU archived.', location: 'Muscat Police HQ' },
      { id: 'CMP-AM-08', title: 'Audited Contractor Safety Prequalifications', sourceType: 'Audit', sourceId: 'CON-VET-Q3', completedDate: '2026-09-11T14:00:00Z', outcome: '18 contractor firms audited, 2 required corrective actions before mobilization.', verifiedBy: 'Ahmed Al-Mansoori', evidenceNotes: 'Vendor prequalification log updated.', location: 'HSE Portal' },
      { id: 'CMP-AM-09', title: 'Verified Automated Heat Stress Early Warning Engine', sourceType: 'Inspection', sourceId: 'SYS-HEAT-VERIF', completedDate: '2026-09-05T09:00:00Z', outcome: 'All 8 meteorological sensor stations broadcasting valid WBGT index.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Live telemetry verified.', location: 'All Sites' },
      { id: 'CMP-AM-10', title: 'Closed ISO 45001 Surveillance Audit Exit Actions', sourceType: 'Audit', sourceId: 'AUD-2026-004', completedDate: '2026-08-30T16:00:00Z', outcome: 'Zero non-conformances registered across Muscat operations.', verifiedBy: 'Alice Smith', evidenceNotes: 'Surveillance certificate validated.', location: 'Admin HQ' }
    ],
    notifications: [
      { id: 'NTF-AM-01', timestamp: '2026-10-07T11:15:00Z', title: 'Regional HSE Governance Review Completed', message: 'Committee approved adoption of dual telemetry sensor standards across all regional assets.', severity: 'Low', category: 'Governance', sourceId: 'MTG-2026-0089', read: false, senderName: 'Sarah Jones' },
      { id: 'NTF-AM-02', timestamp: '2026-10-05T14:30:00Z', title: 'Dropped Object Investigation Endorsed', message: 'Tariq Al-Hashemi updated incident INC-2026-OMN-0622 with tool pouch mandate.', severity: 'Medium', category: 'Incident', sourceId: 'INC-2026-OMN-0622', read: true, senderName: 'Tariq Al-Hashemi' },
      { id: 'NTF-AM-03', timestamp: '2026-10-04T16:15:00Z', title: 'Audit AUD-2026-0047 Exit Approved', message: 'Alice Smith filed clean audit return for Mina Al Fahal polyolefin facility.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-0047', read: true, senderName: 'Alice Smith' },
      { id: 'NTF-AM-04', timestamp: '2026-10-02T11:00:00Z', title: 'Procedure RA-2026-0098 Released', message: 'Hydrocarbon line break JSA protocol issued to all Oman Area Authorities.', severity: 'Low', category: 'Procedure', sourceId: 'RA-2026-0098', read: true, senderName: 'Technical Standards' },
      { id: 'NTF-AM-05', timestamp: '2026-09-30T15:15:00Z', title: 'Oman MoL MD 286/2008 Portal Acknowledgment Received', message: 'Ministry of Labour Occupational Safety & Health Directorate accepted incident INC-2026-0142 filing with zero citations.', severity: 'Low', category: 'Compliance', sourceId: 'INC-2026-0142', read: true, senderName: 'Muscat Oman MoL MD 286/2008' },
      { id: 'NTF-AM-06', timestamp: '2026-09-28T09:30:00Z', title: 'High-Risk Permit Protocol Activated', message: 'PTW-2026-0186 authorized with regional safety officer surveillance.', severity: 'High', category: 'Permit', sourceId: 'PTW-2026-0186', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-AM-07', timestamp: '2026-09-25T14:00:00Z', title: 'Monthly TRIR Benchmark Calculated: 0.14', message: 'Muscat region TRIR maintained at 0.14, outperforming annual target by 44%.', severity: 'Low', category: 'Metrics', sourceId: 'KPI-TRIR-MCT', read: true, senderName: 'BI Analytics Engine' },
      { id: 'NTF-AM-08', timestamp: '2026-09-20T11:30:00Z', title: 'Mutual Aid Exercise Completed Successfully', message: 'Joint drill with Civil Defence demonstrated rapid 8-minute emergency containment.', severity: 'Low', category: 'Emergency', sourceId: 'TRN-2026-0155', read: true, senderName: 'Civil Defence' },
      { id: 'NTF-AM-09', timestamp: '2026-09-15T16:15:00Z', title: 'Leading Indicators Report Published', message: 'Safety observations up 42% in Q3; heat stress hydration compliance reached 99%.', severity: 'Low', category: 'Observations', sourceId: 'OBS-2026-0412', read: true, senderName: 'Fatima Al-Kaabi' },
      { id: 'NTF-AM-10', timestamp: '2026-09-10T10:15:00Z', title: 'Audit Finding Closed: F-401', message: 'Digital gas log bump test timestamps now enforced across all mobile inspection tablets.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-004', read: true, senderName: 'Alice Smith' }
    ]
  },

  // =========================================================================
  // 8. James Sterling - Group Chief Executive Officer (CEO)
  // =========================================================================
  {
    id: 'u1',
    name: 'James Sterling',
    email: 'james.sterling@gulfenergy.com',
    role: 'CEO',
    department: 'Executive Office & Group Corporate Governance',
    businessUnit: 'Corporate Executive Leadership Group',
    organization: 'Gulf Energy Group Holding PJSC',
    siteLocation: 'Group Headquarters · Muscat Executive Tower',
    employeeId: 'GE-EXEC-0001',
    jobTitle: 'Group Chief Executive Officer & Executive Board Member',
    managerName: 'H.E. Sheikh Ahmed (Board Chairman)',
    phoneExtension: '+968 2 602 0001',
    employmentStatus: 'Active',
    joiningDate: '2016-01-10',
    safetyScore: 2800,
    recentIncidents: [
      'Chaired Group Executive Safety Council on zero-harm performance',
      'Reviewed and endorsed Oman MoL MD 286/2008 Grade-A surveillance audit pass'
    ],
    observations: [],
    responsibilities: [
      'Ultimate accountability for enterprise health, safety, and environmental stewardship',
      'Fosters executive safety culture where every worker has Stop Work Authority (SWA)',
      'Allocates multi-million dollar annual capital for barrier integrity and energy transition',
      'Presents comprehensive HSE board pack and leading indicators to Board of Directors'
    ],
    skills: [
      'Executive HSE Governance',
      'Safety Culture Transformation',
      'Tier-3 Crisis Leadership',
      'ESG & Decarbonization Strategy',
      'Enterprise Risk Management'
    ],
    competencies: [
      { competency: 'Executive Safety Leadership & Governance', level: 'Expert', verifiedDate: '2023-01-15', verifierName: 'Board of Directors' },
      { competency: 'Tier-3 Crisis Management Director', level: 'Expert', verifiedDate: '2024-04-10', verifierName: 'Cabinet Crisis Authority' }
    ],
    certifications: [
      { name: 'Institute of Directors (IoD) Chartered Director', status: 'Valid', expiryDate: '2030-01-01' },
      { name: 'Executive Safety Leadership Certification (DuPont Sustainable Solutions)', status: 'Valid', expiryDate: '2028-12-31' }
    ],
    achievements: [
      { id: 'ach-js-01', title: 'Visionary Safety Leader', description: 'Established Group Zero-Harm mandate across 14,000 workforce with industry-leading TRIR', dateEarned: '2026-01-15', icon: 'Award', tier: 'Platinum' }
    ],
    currentWorkload: { activeTasks: 4, pendingApprovals: 5, openCapas: 1, utilizationRate: 75 },
    assignedProjects: ['Group Decarbonization Roadmap 2030', 'Enterprise AI Safety Modernization', 'Safe Asset Growth Program'],
    assignedSites: ['All Concessions & Global Terminals'],
    approvalResponsibilities: [
      'Enterprise HSE Policy & Charter',
      'Board Safety Packs & Statutory Disclosures',
      'Major Capital Safety Investment > $5M',
      'Tier-3 Crisis Mobilization Orders'
    ],
    activities: [
      { id: 'ACT-JS-01', timestamp: '2026-10-07T08:00:00Z', timePeriod: 'Recent', actionType: 'Chaired Executive Council', category: 'Meeting', entityId: 'MTG-2026-0089', entityTitle: 'Group Executive HSE & Operational Integrity Council', details: 'Chaired quarterly session; reviewed 0.18 TRIR outperforming target; reaffirmed absolute worker SWA rights.', impactResult: 'Reaffirmed $12M capital allocation for IoT gas radar and telemetry.', relatedUsers: ['Dr. Layla Hassan', 'Ahmed Al-Mansoori'] },
      { id: 'ACT-JS-02', timestamp: '2026-10-05T09:00:00Z', timePeriod: 'Recent', actionType: 'Reviewed Board Safety Pack', category: 'Audit', entityId: 'AUD-2026-0047', entityTitle: 'Q3 Board HSE & Compliance Governance Pack', details: 'Reviewed executive scorecard showing Grade-A Oman MoL MD 286/2008 status and 100% ISO surveillance pass.', impactResult: 'Endorsed board presentation for H.E. Sheikh Ahmed.', relatedUsers: ['Dr. Layla Hassan', 'Alice Smith'] },
      { id: 'ACT-JS-03', timestamp: '2026-10-04T17:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Executive Incident Review', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Extruder Thermal Rise Containment & Closure Review', details: 'Received briefing from Dr. Layla Hassan on successful sensor retrofit and zero lost production time.', impactResult: 'Commended engineering team for fast proactive containment.', relatedUsers: ['Dr. Layla Hassan', 'Sarah Jones'] },
      { id: 'ACT-JS-04', timestamp: '2026-10-01T10:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Town Hall Safety Address', category: 'Meeting', entityId: 'TOWN-HALL-Q4', entityTitle: 'Global All-Hands Safety Town Hall Address', details: 'Addressed 4,200 employees live; emphasized that safety takes absolute priority over production schedule.', impactResult: '100% staff commitment to Stop Work Authority pledged.', relatedUsers: ['Dr. Layla Hassan'] },
      { id: 'ACT-JS-05', timestamp: '2026-09-28T14:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Approved Capital Budget', category: 'CAPA', entityId: 'CA-2026-0287', entityTitle: 'Enterprise Rotating Machinery Sensor Modernization', details: 'Approved group-wide expansion of dual infrared sensor standards for all heavy extruders and pumps.', impactResult: '$450K budget released for regional procurement.', relatedUsers: ['Sarah Jones', 'Ahmed Al-Mansoori'] },
      { id: 'ACT-JS-06', timestamp: '2026-09-25T16:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed High-Risk Governance', category: 'Permit', entityId: 'PTW-2026-0186', entityTitle: 'Critical Trunkline Maintenance Risk Assessment', details: 'Reviewed executive briefing on hydrocarbon tie-in with zero SIMOPS clash.', impactResult: 'Operations integrity assured.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-JS-07', timestamp: '2026-09-20T10:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Inspected Facility', category: 'Inspection', entityId: 'INS-2026-0314', entityTitle: 'Executive Safety Walkabout at Mina Al Fahal Refinery Asset', details: 'Walked extrusion halls and marine berths; spoke with frontline technicians on heat stress.', impactResult: 'Ordered additional shaded hydration rest shelters on Berth 1.', relatedUsers: ['Sarah Jones', 'Rahul Gupta'] },
      { id: 'ACT-JS-08', timestamp: '2026-09-15T11:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed ESG Progress', category: 'Risk Assessment', entityId: 'RA-2026-0098', entityTitle: 'Flaring & Fugitive Methane Reduction Governance', details: 'Reviewed Q3 carbon accounting; noted 4.2% drop in flare emissions after compressor overhaul.', impactResult: 'Target on track for 2030 net-zero operational goal.', relatedUsers: ['Khalid Al-Dhaheri'] },
      { id: 'ACT-JS-09', timestamp: '2026-09-10T14:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Endorsed Training Mandate', category: 'Training', entityId: 'TRN-2026-0155', entityTitle: 'Mandatory SCBA & Sour Gas Safety Competency Policy', details: 'Signed group policy requiring 100% verified competency for anyone entering Block 6 and Mina Al Fahal sour gas zones.', impactResult: 'Policy enforced by automated turnstiles.', relatedUsers: ['Dr. Layla Hassan'] },
      { id: 'ACT-JS-10', timestamp: '2026-09-01T09:00:00Z', timePeriod: 'Last 90 Days', actionType: 'Recognized Safety Champions', category: 'Observation', entityId: 'OBS-2026-0412', entityTitle: 'Annual Executive Safety Award Presentation', details: 'Presented Gold safety trophies to Mina Al Fahal and Fahud teams for multi-million LTI-free hours.', impactResult: 'Enhanced organizational safety motivation.', relatedUsers: ['Sarah Jones', 'Marcus Chen'] }
    ],
    pendingActions: [
      { id: 'PND-JS-01', title: 'Sign Q3 Enterprise Board HSE Disclosure Statement', sourceType: 'Audit', sourceId: 'BOD-HSE-Q3', priority: 'P1 - Critical', dueDate: '2026-10-10', daysRemaining: 1, isOverdue: false, status: 'Action Required', requiredAction: 'Formally sign audited HSE performance disclosure for Muscat Securities Exchange (MSX)', location: 'Executive HQ' },
      { id: 'PND-JS-02', title: 'Approve 2027 Group Capital Safety Investment Budget ($14M)', sourceType: 'Risk Assessment', sourceId: 'CAPEX-HSE-2027', priority: 'P2 - High', dueDate: '2026-10-14', daysRemaining: 5, isOverdue: false, status: 'In Review', requiredAction: 'Review ROI on automated drone inspections, flare gas recovery, and biometric heat sensors', location: 'Boardroom' },
      { id: 'PND-JS-03', title: 'Executive Review of Incident INC-2026-OMN-0891 Investigation', sourceType: 'Incident', sourceId: 'INC-2026-OMN-0891', priority: 'P2 - High', dueDate: '2026-10-12', daysRemaining: 3, isOverdue: false, status: 'Scheduled', requiredAction: 'Review TapRooT causal conclusions on drill pipe clamp slip with Dr. Layla Hassan', location: 'Executive Office' },
      { id: 'PND-JS-04', title: 'Endorse PDO Sustainability Joint Venture Charter', sourceType: 'Meeting', sourceId: 'JV-SUS-2026', priority: 'P3 - Medium', dueDate: '2026-10-16', daysRemaining: 7, isOverdue: false, status: 'Pending Approval', requiredAction: 'Review executive terms for joint carbon capture and storage (CCS) project', location: 'PDO HQ' },
      { id: 'PND-JS-05', title: 'Sign Off Corporate Crisis Management Drill Tier-3 Schedule', sourceType: 'Inspection', sourceId: 'CRISIS-T3-2026', priority: 'P2 - High', dueDate: '2026-10-18', daysRemaining: 9, isOverdue: false, status: 'Action Required', requiredAction: 'Authorize annual full-scale offshore crisis simulation involving Coast Guard', location: 'Crisis Center' },
      { id: 'PND-JS-06', title: 'Overdue Strategic ESG Carbon Disclosure Sign-off', sourceType: 'Audit', sourceId: 'ESG-DISC-2026', priority: 'P1 - Critical', dueDate: '2026-10-06', daysRemaining: -3, isOverdue: true, status: 'Overdue', requiredAction: 'Certify Scope 1 and Scope 2 verified emissions data for regional ESG index', location: 'Executive HQ' },
      { id: 'PND-JS-07', title: 'Review Board Safety Governance Charter Revision', sourceType: 'Meeting', sourceId: 'BOD-GOV-REV', priority: 'P2 - High', dueDate: '2026-10-20', daysRemaining: 11, isOverdue: false, status: 'In Review', requiredAction: 'Incorporate new Oman Statutory safety governance amendments into board rules', location: 'Legal Office' },
      { id: 'PND-JS-08', title: 'Approve Group Occupational Health Biometrics Policy', sourceType: 'Risk Assessment', sourceId: 'POL-BIO-HEAT', priority: 'P3 - Medium', dueDate: '2026-10-22', daysRemaining: 13, isOverdue: false, status: 'Upcoming', requiredAction: 'Authorize mandatory hydration checks and wearable pulse rate alarms during summer', location: 'Executive HQ' },
      { id: 'PND-JS-09', title: 'Review Major Contractor Safety Audit Findings', sourceType: 'Audit', sourceId: 'CON-MAJ-2026', priority: 'P3 - Medium', dueDate: '2026-10-25', daysRemaining: 16, isOverdue: false, status: 'Scheduled', requiredAction: 'Examine audit results of top 5 EPC contractors operating on concession lands', location: 'Procurement HQ' },
      { id: 'PND-JS-10', title: 'Executive Sign-off for Digital HSE Platform Upgrade', sourceType: 'Inspection', sourceId: 'SYS-UPG-SIGN', priority: 'P2 - High', dueDate: '2026-10-27', daysRemaining: 18, isOverdue: false, status: 'Pending', requiredAction: 'Formally accept delivery of enterprise AI operations platform from digital team', location: 'Command Center' }
    ],
    completedActions: [
      { id: 'CMP-JS-01', title: 'Signed Q3 Executive Safety Performance Board Report', sourceType: 'Audit', sourceId: 'AUD-2026-0047', completedDate: '2026-10-05T09:00:00Z', outcome: 'Board confirmed satisfaction with 0.18 TRIR and zero statutory breaches.', verifiedBy: 'James Sterling', evidenceNotes: 'Board resolution #BR-2026-09 signed.', location: 'Boardroom' },
      { id: 'CMP-JS-02', title: 'Approved Dual Sensor Standard Budget #CA-2026-0287', sourceType: 'CAPA', sourceId: 'CA-2026-0287', completedDate: '2026-09-28T14:00:00Z', outcome: '$450K enterprise capital released for thermal telemetry upgrades across all assets.', verifiedBy: 'James Sterling', evidenceNotes: 'Capex authorization signed.', location: 'Executive Office' },
      { id: 'CMP-JS-03', title: 'Endorsed Incident #INC-2026-0142 Containment Briefing', sourceType: 'Incident', sourceId: 'INC-2026-0142', completedDate: '2026-10-04T17:00:00Z', outcome: 'Validated root cause mitigation and approved closure documentation.', verifiedBy: 'James Sterling', evidenceNotes: 'Executive signature affixed.', location: 'Executive Office' },
      { id: 'CMP-JS-04', title: 'Conducted Global All-Hands Safety Town Hall Address', sourceType: 'Meeting', sourceId: 'TOWN-HALL-Q4', completedDate: '2026-10-01T10:00:00Z', outcome: 'Reiterated Stop Work Authority to 4,200 workforce members worldwide.', verifiedBy: 'James Sterling', evidenceNotes: 'Recording broadcast to all operations.', location: 'Auditorium' },
      { id: 'CMP-JS-05', title: 'Approved 2026 Group ESG Strategy & Flare Target', sourceType: 'Risk Assessment', sourceId: 'RA-2026-0098', completedDate: '2026-09-15T11:00:00Z', outcome: 'Committed to 30% reduction in routine flaring by Q4 2027.', verifiedBy: 'James Sterling', evidenceNotes: 'ESG Strategy document published.', location: 'Executive Office' },
      { id: 'CMP-JS-06', title: 'Conducted Executive Walkabout at Mina Al Fahal Refinery Asset', sourceType: 'Inspection', sourceId: 'INS-2026-0314', completedDate: '2026-09-20T10:00:00Z', outcome: 'Approved installation of additional shaded rest facilities on marine berths.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Field feedback memo distributed.', location: 'Mina Al Fahal' },
      { id: 'CMP-JS-07', title: 'Signed Mandatory SCBA Certification Policy', sourceType: 'Training', sourceId: 'TRN-2026-0155', completedDate: '2026-09-10T14:00:00Z', outcome: 'Mandatory turnstile badge lock enforced for uncertified personnel.', verifiedBy: 'James Sterling', evidenceNotes: 'Corporate policy #CP-HSE-04 enacted.', location: 'Group HQ' },
      { id: 'CMP-JS-08', title: 'Honored Zero-Harm Achievement at Mina Al Fahal', sourceType: 'Observation', sourceId: 'OBS-2026-0412', completedDate: '2026-09-01T09:00:00Z', outcome: 'Awarded 5 Million LTI-free man-hour trophy to asset leadership.', verifiedBy: 'James Sterling', evidenceNotes: 'Ceremony photographed for annual report.', location: 'Mina Al Fahal' },
      { id: 'CMP-JS-09', title: 'Authorized Multi-Tenant Enterprise Cloud Deployment', sourceType: 'Audit', sourceId: 'SYS-CLOUD-AUTH', completedDate: '2026-08-25T15:00:00Z', outcome: 'Secured high-availability ISO 27001 compliant cloud infrastructure.', verifiedBy: 'System Admin', evidenceNotes: 'Security clearance sign-off.', location: 'Command Center' },
      { id: 'CMP-JS-10', title: 'Reviewed Annual Statutory Audit Results with Regulators', sourceType: 'Audit', sourceId: 'AUD-2026-003', completedDate: '2026-08-15T11:30:00Z', outcome: 'Exemplary feedback received from Oman Ministry and Oman Ministry of Energy.', verifiedBy: 'Dr. Layla Hassan', evidenceNotes: 'Official commendation letters archived.', location: 'Government Relations' }
    ],
    notifications: [
      { id: 'NTF-JS-01', timestamp: '2026-10-07T08:15:00Z', title: 'Executive Safety Council Convened', message: 'Group TRIR registered at 0.18, outperforming annual target of 0.25.', severity: 'Low', category: 'Executive', sourceId: 'MTG-2026-0089', read: false, senderName: 'Dr. Layla Hassan' },
      { id: 'NTF-JS-02', timestamp: '2026-10-05T09:15:00Z', title: 'Board Safety Pack Finalized', message: 'Q3 Board pack ready with Grade-A Oman MoL MD 286/2008 and zero non-conformance audit rating.', severity: 'Low', category: 'Board', sourceId: 'AUD-2026-0047', read: true, senderName: 'Corporate Secretary' },
      { id: 'NTF-JS-03', timestamp: '2026-10-04T17:15:00Z', title: 'Extruder Incident INC-2026-0142 Successfully Closed', message: 'Remediation completed with zero environmental release or operational delay.', severity: 'Low', category: 'Incident', sourceId: 'INC-2026-0142', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-JS-04', timestamp: '2026-10-01T10:30:00Z', title: 'Town Hall Employee Engagement Recorded', message: '4,200 employees attended live; Stop Work Authority reaffirmed across 100% of workforce.', severity: 'Low', category: 'Culture', sourceId: 'TOWN-HALL-Q4', read: true, senderName: 'Corporate Communications' },
      { id: 'NTF-JS-05', timestamp: '2026-09-28T14:30:00Z', title: 'Capex Authorization Processed: CA-2026-0287', message: '$450K allocated for rotating machinery dual infrared sensor upgrades.', severity: 'Low', category: 'Finance', sourceId: 'CA-2026-0287', read: true, senderName: 'Chief Financial Officer' },
      { id: 'NTF-JS-06', timestamp: '2026-09-25T16:15:00Z', title: 'High-Pressure Trunkline JSA Endorsed', message: 'Operations team confirmed positive mechanical spade isolations in place.', severity: 'Low', category: 'Permit', sourceId: 'PTW-2026-0186', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-JS-07', timestamp: '2026-09-20T10:30:00Z', title: 'Executive Walkabout Actions Actioned', message: 'Mina Al Fahal team deployed 4 additional shaded rest shelters on Berth 1.', severity: 'Low', category: 'Welfare', sourceId: 'INS-2026-0314', read: true, senderName: 'Marcus Chen' },
      { id: 'NTF-JS-08', timestamp: '2026-09-15T11:30:00Z', title: 'Q3 Flare Emissions Down 4.2%', message: 'Compressor overhaul achieved significant flare gas capture and ESG metric gain.', severity: 'Low', category: 'ESG', sourceId: 'RA-2026-0098', read: true, senderName: 'Khalid Al-Dhaheri' },
      { id: 'NTF-JS-09', timestamp: '2026-09-10T14:30:00Z', title: 'Mandatory Turnstile Lock Enforced', message: 'Turnstile access now enforces valid H2S SCBA certification for all personnel.', severity: 'Medium', category: 'Security', sourceId: 'TRN-2026-0155', read: true, senderName: 'Security Lead' },
      { id: 'NTF-JS-10', timestamp: '2026-09-01T09:30:00Z', title: 'Zero-Harm Milestones Celebrated', message: 'Mina Al Fahal team celebrated 5 Million LTI-free man-hours.', severity: 'Low', category: 'Recognition', sourceId: 'OBS-2026-0412', read: true, senderName: 'Group HR' }
    ]
  },

  // =========================================================================
  // 9. Khalid Al-Dhaheri - Senior Environmental Officer & ESG Lead
  // =========================================================================
  {
    id: 'u10',
    name: 'Khalid Al-Dhaheri',
    email: 'khalid.dhaheri@gulfenergy.ae',
    role: 'Environmental_Officer',
    department: 'Environmental Management & Industrial Hygiene',
    businessUnit: 'Group Sustainability, Decarbonization & ESG',
    organization: 'Gulf Energy Maritime & Infrastructure',
    siteLocation: 'Mina Al Fahal Refinery & Petrochemical Concession Hub',
    employeeId: 'GE-ENV-4412',
    jobTitle: 'Senior Environmental Officer & Industrial Hygiene Specialist',
    managerName: 'Sarah Jones (Site HSE Manager)',
    phoneExtension: '+968 24 602 4412',
    employmentStatus: 'Active',
    joiningDate: '2021-09-01',
    safetyScore: 1680,
    recentIncidents: [
      'Investigated chemical spill containment at Acid Skid Skid-02',
      'Triggered automated Black Flag WBGT Midday Heat Work Suspension'
    ],
    observations: [],
    responsibilities: [
      'Continuous stack Continuous Emissions Monitoring System (CEMS) compliance',
      'Hazardous industrial chemical spill response, containment, and waste manifesting',
      'Real-time Wet Bulb Globe Temperature (WBGT) heat stress indexing and automated flagging',
      'Industrial hygiene acoustic noise dosimetry, VOC vapor monitoring, and ISO 14001 compliance'
    ],
    skills: [
      'ISO 14001 Environmental Management',
      'WBGT Heat Stress Indexing',
      'Continuous Emissions Monitoring (CEMS)',
      'Chemical Spill Remediation & Hazmat',
      'Industrial Hygiene & Air Sampling'
    ],
    competencies: [
      { competency: 'Certified Environmental Systems Lead (ISO 14001:2015)', level: 'Expert', verifiedDate: '2025-08-14', verifierName: 'DNV GL Middle East' },
      { competency: 'OSHA / Oman MoL MD 286/2008 Heat Illness Prevention Champion', level: 'Expert', verifiedDate: '2026-04-10', verifierName: 'Ministry of Labour Occupational Safety & Health Directorate' },
      { competency: 'Hazardous Waste & Chemical Spill Commander', level: 'Expert', verifiedDate: '2025-11-20', verifierName: 'Environment Authority (Oman EA RD 114/2001)' }
    ],
    certifications: [
      { name: 'ISO 14001:2015 Lead Auditor', status: 'Valid', expiryDate: '2028-08-14' },
      { name: 'HAZWOPER 40-Hour Emergency Specialist', status: 'Valid', expiryDate: '2027-05-20' },
      { name: 'Certified Industrial Hygienist (CIH) Candidate', status: 'Valid', expiryDate: '2028-11-30' }
    ],
    achievements: [
      { id: 'ach-kd-01', title: 'Zero Spill Champion', description: 'Maintained zero off-site environmental releases across 3 consecutive years', dateEarned: '2026-07-22', icon: 'Shield', tier: 'Gold' }
    ],
    currentWorkload: { activeTasks: 6, pendingApprovals: 3, openCapas: 2, utilizationRate: 82 },
    assignedProjects: ['Flare Gas Recovery Unit Overhaul', 'Automated Ambient Air VOC Monitoring Mesh', 'Industrial Wastewater Zero Liquid Discharge'],
    assignedSites: ['Mina Al Fahal Refinery Asset', 'Khazzan Tight Gas Complex Block 61'],
    approvalResponsibilities: [
      'Hazardous Waste Manifest Consignment Notes',
      'Chemical Spill Remediation Closeout Verification',
      'Midday Work Heat Stress Exemption Authorizations',
      'Environmental Impact Assessment (EIA) Sign-Off'
    ],
    activities: [
      { id: 'ACT-KD-01', timestamp: '2026-10-07T09:30:00Z', timePeriod: 'Recent', actionType: 'Executed Environmental Inspection', category: 'Inspection', entityId: 'INS-2026-0314', entityTitle: 'Polyolefin Effluent & Chemical Containment Inspection', details: 'Sampled tertiary wastewater clarifier; verified pH 7.2, COD < 50 ppm, and oil content < 5 ppm.', impactResult: '100% statutory compliance with Environment Authority (Oman EA RD 114/2001) discharge limits.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-KD-02', timestamp: '2026-10-06T06:30:00Z', timePeriod: 'Recent', actionType: 'Triggered WBGT Heat Flag', category: 'Observation', entityId: 'OBS-2026-0412', entityTitle: 'WBGT Heat Stress Index Automated Warning Alert', details: 'Measured 31.4°C WBGT at Berth 1 at 10:30 AM; hoisted Amber Flag and broadcast mandatory 15-minute rest breaks.', impactResult: 'Zero heat exhaustion or dehydration cases recorded across shift.', relatedUsers: ['Rahul Gupta', 'Marcus Chen'] },
      { id: 'ACT-KD-03', timestamp: '2026-10-05T11:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Reviewed Incident Environmental Impact', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Extruder Thermal Rise Flue & Vapor Check', details: 'Inspected local extraction hood filters following extruder overheating; confirmed zero hazardous VOC release.', impactResult: 'Environmental clearance certificate issued for unit restart.', relatedUsers: ['Rahul Gupta', 'Sarah Jones'] },
      { id: 'ACT-KD-04', timestamp: '2026-10-04T14:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Audited ISO 14001 Clause 9.1', category: 'Audit', entityId: 'AUD-2026-0047', entityTitle: 'ISO 14001 Environmental Surveillance Audit Evidence', details: 'Presented continuous stack emissions telemetry and calibrated zero/span calibration logs to Alice Smith.', impactResult: 'Audit finding cleared with positive observation from lead auditor.', relatedUsers: ['Alice Smith'] },
      { id: 'ACT-KD-05', timestamp: '2026-10-02T13:30:00Z', timePeriod: 'Last 7 Days', actionType: 'Completed Emergency Eyewash Audit', category: 'Inspection', entityId: 'INSP-2026-009', entityTitle: 'Emergency Eyewash & Chemical Drench Shower Audit', details: 'Tested 14 chemical emergency drench units across acid and caustic storage tanks; flow rates verified > 75 L/min.', impactResult: 'Replaced 1 dust cap on station ES-08; all units fully operational.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-KD-06', timestamp: '2026-09-29T15:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Remediated Chemical Spill', category: 'Incident', entityId: 'INC-2026-KSA-0219', entityTitle: 'Synthetic Hydraulic Fluid Spill Containment Audit', details: 'Audited waste consignment manifest for recovered absorbent drums following power unit O-ring rupture.', impactResult: 'All 4 UN-rated drums transferred to licensed hazardous waste incinerator.', relatedUsers: ['Zaid Al-Otaibi'] },
      { id: 'ACT-KD-07', timestamp: '2026-09-26T10:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Completed Ambient Air Monitoring', category: 'Risk Assessment', entityId: 'RA-2026-0098', entityTitle: 'Fugitive Hydrocarbon LDAR Infrared Camera Survey', details: 'Conducted FLIR optical gas imaging across 850 flanges on Header Manifold HM-03 ahead of planned hot tap.', impactResult: 'Zero fugitive hydrocarbon leaks detected across pipeline corridor.', relatedUsers: ['Marcus Chen', 'Sarah Jones'] },
      { id: 'ACT-KD-08', timestamp: '2026-09-22T08:30:00Z', timePeriod: 'Last 30 Days', actionType: 'Delivered Environmental Training', category: 'Training', entityId: 'TRN-2026-0155', entityTitle: 'Chemical Spill First Responder & SDS Competency', details: 'Trained 35 frontline operations workers on chemical PPE, neutralizing agents, and eyewash activation.', impactResult: '100% passing scores on practical containment drill.', relatedUsers: ['Rahul Gupta'] },
      { id: 'ACT-KD-09', timestamp: '2026-09-18T16:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Reviewed Environmental CAPA', category: 'CAPA', entityId: 'CA-2026-0287', entityTitle: 'Thermal Grease Degradation Eco-Toxicity Verification', details: 'Reviewed material safety data sheet (SDS) for synthetic polyalphaolefin grease; verified biodegradable rating.', impactResult: 'Eco-toxicity approval stamped for procurement.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-KD-10', timestamp: '2026-09-12T11:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Logged ESG Carbon Metrics', category: 'Meeting', entityId: 'MTG-2026-0089', entityTitle: 'Asset Carbon Footprint & Methane Accounting Ledger', details: 'Reported 4.2% drop in quarterly flare emissions to Asset HSE Committee.', impactResult: 'Contributed to Group ESG report publication.', relatedUsers: ['Sarah Jones', 'Dr. Layla Hassan'] }
    ],
    pendingActions: [
      { id: 'PND-KD-01', title: 'Submit Monthly CEMS Stack Emission Return to EAD', sourceType: 'Audit', sourceId: 'CEMS-EAD-SEP', priority: 'P1 - Critical', dueDate: '2026-10-10', daysRemaining: 1, isOverdue: false, status: 'Action Required', requiredAction: 'Digitally certify NOX, SO2, and CO continuous telemetry report for Environment Authority (Oman EA RD 114/2001)', location: 'Environmental Lab' },
      { id: 'PND-KD-02', title: 'Calibrate Ambient Air Quality VOC Gas Sensor Radar', sourceType: 'Inspection', sourceId: 'CAL-VOC-MESH', priority: 'P2 - High', dueDate: '2026-10-13', daysRemaining: 4, isOverdue: false, status: 'Scheduled', requiredAction: 'Perform zero and span calibration on photoionization detector (PID) sensor node #4', location: 'Fence-line Perimeter' },
      { id: 'PND-KD-03', title: 'Verify Hazardous Waste Consignment Manifest #WM-994', sourceType: 'Incident', sourceId: 'WM-HAZ-994', priority: 'P2 - High', dueDate: '2026-10-11', daysRemaining: 2, isOverdue: false, status: 'In Review', requiredAction: 'Sign hazardous chemical drum manifest for collection by Beah (Oman) authorized transporter', location: 'Hazmat Yard' },
      { id: 'PND-KD-04', title: 'Inspect Acid Storage Tank Secondary Containment Sump', sourceType: 'Inspection', sourceId: 'INS-SUMP-ACID', priority: 'P2 - High', dueDate: '2026-10-15', daysRemaining: 6, isOverdue: false, status: 'Pending', requiredAction: 'Verify rainwater drainage valve locked closed and sump sensor telemetry active', location: 'Acid Farm' },
      { id: 'PND-KD-05', title: 'Overdue Flare Tip Ignition Smoke Sensor Maintenance', sourceType: 'CAPA', sourceId: 'CAPA-FLARE-SMK', priority: 'P1 - Critical', dueDate: '2026-10-06', daysRemaining: -3, isOverdue: true, status: 'Overdue', requiredAction: 'Replace fouled optical lens on high-definition smokeless flare camera', location: 'Main Flare Stack' },
      { id: 'PND-KD-06', title: 'Conduct Acoustic Noise Dosimetry Survey: Extrusion Hall', sourceType: 'Risk Assessment', sourceId: 'SURV-NOISE-EX', priority: 'P3 - Medium', dueDate: '2026-10-17', daysRemaining: 8, isOverdue: false, status: 'Upcoming', requiredAction: 'Deploy personal noise badges on 8 operators for 8-hour TWA exposure validation', location: 'Extrusion Hall Zone C' },
      { id: 'PND-KD-07', title: 'Review Chemical Inventory SDS Updates for REACH Compliance', sourceType: 'Audit', sourceId: 'SDS-REACH-2026', priority: 'P3 - Medium', dueDate: '2026-10-19', daysRemaining: 10, isOverdue: false, status: 'In Review', requiredAction: 'Audit 45 newly added solvent and lubricant safety data sheets in central chemical registry', location: 'Warehouse Bay 2' },
      { id: 'PND-KD-08', title: 'Audit Oil/Water Separator Effluent Discharge Water', sourceType: 'Inspection', sourceId: 'INS-OWS-SEP', priority: 'P3 - Medium', dueDate: '2026-10-21', daysRemaining: 12, isOverdue: false, status: 'Scheduled', requiredAction: 'Take 24-hour composite sample from storm water retention basin outlet', location: 'Basin Gate 4' },
      { id: 'PND-KD-09', title: 'Verify Midday Work Suspension Flagging Protocol', sourceType: 'Observation', sourceId: 'WBGT-SUMMER-REV', priority: 'P2 - High', dueDate: '2026-10-23', daysRemaining: 14, isOverdue: false, status: 'Action Required', requiredAction: 'Review compliance logs for Oman Ministry of Labour (MoL) midday summer work ban', location: 'Operations Office' },
      { id: 'PND-KD-10', title: 'Update Asset ISO 14001 Environmental Aspect Register', sourceType: 'Risk Assessment', sourceId: 'ASP-REG-2027', priority: 'P3 - Medium', dueDate: '2026-10-26', daysRemaining: 17, isOverdue: false, status: 'Pending', requiredAction: 'Re-score environmental significance ratings for planned polymer reactor expansion', location: 'Environmental Hub' }
    ],
    completedActions: [
      { id: 'CMP-KD-01', title: 'Issued Environmental Clearance for Extruder EX-04', sourceType: 'Incident', sourceId: 'INC-2026-0142', completedDate: '2026-10-05T11:00:00Z', outcome: 'Air sampling verified zero harmful thermal degradation fumes or toxic volatile emissions.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Air sampling certificate attached.', location: 'Extrusion Hall Zone C' },
      { id: 'CMP-KD-02', title: 'Completed Tertiary Effluent Compliance Audit', sourceType: 'Inspection', sourceId: 'INS-2026-0314', completedDate: '2026-10-07T09:30:00Z', outcome: 'All statutory discharge parameters verified within Environment Authority (Oman EA) regulatory limits.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Lab test results archived.', location: 'Wastewater Facility' },
      { id: 'CMP-KD-03', title: 'Tested 14 Emergency Eyewash & Drench Showers', sourceType: 'Inspection', sourceId: 'INSP-2026-009', completedDate: '2026-10-02T13:30:00Z', outcome: 'All units compliant with ANSI Z358.1 continuous 15-minute flush specifications.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Inspection tag affixed.', location: 'Acid Farm' },
      { id: 'CMP-KD-04', title: 'Executed Optical Gas Imaging Survey Ahead of PTW-2026-0186', sourceType: 'Risk Assessment', sourceId: 'RA-2026-0098', completedDate: '2026-09-26T10:00:00Z', outcome: 'FLIR infrared survey of 850 flanges confirmed zero fugitive hydrocarbon venting.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Infrared video archived.', location: 'Header Manifold HM-03' },
      { id: 'CMP-KD-05', title: 'Supervised Remediation of Synthetic Fluid Spill', sourceType: 'Incident', sourceId: 'INC-2026-KSA-0219', completedDate: '2026-09-29T15:00:00Z', outcome: 'Contaminated absorbent recovered into UN-certified hazardous waste drums.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Waste manifest signed.', location: 'Ras Al-Khair Facility' },
      { id: 'CMP-KD-06', title: 'Provided ISO 14001 Evidence for Audit AUD-2026-0047', sourceType: 'Audit', sourceId: 'AUD-2026-0047', completedDate: '2026-10-04T14:00:00Z', outcome: 'Stack emissions logs verified compliant by Alice Smith.', verifiedBy: 'Alice Smith', evidenceNotes: 'Lead Auditor signed check-sheet.', location: 'Admin HQ' },
      { id: 'CMP-KD-07', title: 'Conducted Frontline Chemical Safety Training', sourceType: 'Training', sourceId: 'TRN-2026-0155', completedDate: '2026-09-22T08:30:00Z', outcome: '35 technicians qualified on chemical PPE and eyewash emergency activation.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Roster filed with HSE Academy.', location: 'Training Center' },
      { id: 'CMP-KD-08', title: 'Validated Eco-Toxicity of Replacement Synthetic Grease', sourceType: 'CAPA', sourceId: 'CA-2026-0287', completedDate: '2026-09-18T16:00:00Z', outcome: 'Confirmed lubricant compliance with marine aquatic toxicity standards.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Product SDS approved.', location: 'Warehouse Bay 2' },
      { id: 'CMP-KD-09', title: 'Maintained Zero Spill Record for Q3', sourceType: 'Incident', sourceId: 'Q3-ENV-PERF', completedDate: '2026-09-30T17:00:00Z', outcome: 'Zero reportable hydrocarbon or chemical spills to sea or soil.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Quarterly environmental return filed.', location: 'All Asset Areas' },
      { id: 'CMP-KD-10', title: 'Broadcast Midday WBGT Index Color Warnings', sourceType: 'Observation', sourceId: 'OBS-2026-0412', completedDate: '2026-10-06T06:30:00Z', outcome: 'Prevented heat exhaustion through automated work/rest scheduling.', verifiedBy: 'Marcus Chen', evidenceNotes: 'WBGT telemetry archived.', location: 'Berth 1 Staging' }
    ],
    notifications: [
      { id: 'NTF-KD-01', timestamp: '2026-10-07T09:45:00Z', title: 'Effluent Clarifier Compliance Confirmed', message: ' tertiary clarifier discharge meets all EAD standards with pH 7.2 and zero oil sheen.', severity: 'Low', category: 'Environmental', sourceId: 'INS-2026-0314', read: false, senderName: 'Lab Supervisor' },
      { id: 'NTF-KD-02', timestamp: '2026-10-06T06:45:00Z', title: 'Amber Flag WBGT Heat Warning Issued', message: 'WBGT temperature reached 31.4°C at Berth 1; 15-minute shaded rest breaks now mandatory.', severity: 'Medium', category: 'Health', sourceId: 'OBS-2026-0412', read: true, senderName: 'Weather Station 2' },
      { id: 'NTF-KD-03', timestamp: '2026-10-05T11:15:00Z', title: 'Environmental Clearance Issued for Extruder EX-04', message: 'Air quality testing confirmed zero VOC or toxic fume retention following incident #INC-2026-0142.', severity: 'Low', category: 'Incident', sourceId: 'INC-2026-0142', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-KD-04', timestamp: '2026-10-04T14:15:00Z', title: 'Audit AUD-2026-0047 Environmental Clause Cleared', message: 'Alice Smith verified stack emissions records with zero non-conformances.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-0047', read: true, senderName: 'Alice Smith' },
      { id: 'NTF-KD-05', timestamp: '2026-10-02T13:45:00Z', title: 'Eyewash Station ES-08 Remediated', message: 'Dust cap replaced and full flow tested on emergency station ES-08.', severity: 'Low', category: 'Maintenance', sourceId: 'INSP-2026-009', read: true, senderName: 'Maintenance Lead' },
      { id: 'NTF-KD-06', timestamp: '2026-09-29T15:15:00Z', title: 'Hazardous Waste Manifest WM-994 Approved', message: 'Recovered hydraulic spill drums dispatched to licensed thermal treatment plant.', severity: 'Low', category: 'Waste', sourceId: 'INC-2026-KSA-0219', read: true, senderName: 'Beah (Oman) Authority' },
      { id: 'NTF-KD-07', timestamp: '2026-09-26T10:15:00Z', title: 'LDAR Infrared Survey Complete', message: 'Zero hydrocarbon emissions detected across 850 flanges on Header Manifold HM-03.', severity: 'Low', category: 'Integrity', sourceId: 'RA-2026-0098', read: true, senderName: 'FLIR System' },
      { id: 'NTF-KD-08', timestamp: '2026-09-22T08:45:00Z', title: 'Chemical Hazmat Batch Certified', message: '35 technicians cleared for chemical spill response and neutralizing protocols.', severity: 'Low', category: 'Training', sourceId: 'TRN-2026-0155', read: true, senderName: 'HSE Academy' },
      { id: 'NTF-KD-09', timestamp: '2026-09-18T16:15:00Z', title: 'Synthetic Grease Eco-Toxicity Approved', message: 'Safety data sheet cleared for CA-2026-0287 replacement lubricant.', severity: 'Low', category: 'Compliance', sourceId: 'CA-2026-0287', read: true, senderName: 'Chemical Registry' },
      { id: 'NTF-KD-10', timestamp: '2026-09-12T11:15:00Z', title: 'Quarterly Emissions Down 4.2%', message: 'Scope 1 flaring reduction officially credited to corporate sustainability ledger.', severity: 'Low', category: 'ESG', sourceId: 'MTG-2026-0089', read: true, senderName: 'ESG Team' }
    ]
  },

  // =========================================================================
  // 10. Alice Smith - Lead Internal Auditor & ISO Specialist
  // =========================================================================
  {
    id: 'u12',
    name: 'Alice Smith',
    email: 'alice.smith@gulfenergy.ae',
    role: 'Internal_Auditor',
    department: 'Corporate Assurance & Integrated Management Systems',
    businessUnit: 'Group Quality, Health, Safety & Environment Assurance',
    organization: 'Gulf Energy & Infrastructure Group',
    siteLocation: 'Group Quality Assurance Center · Muscat HQ',
    employeeId: 'GE-AUD-2104',
    jobTitle: 'Lead Quality & Safety Auditor (ISO 45001 / 14001 / 9001)',
    managerName: 'Dr. Layla Hassan (Head of Group HSE)',
    phoneExtension: '+968 24 602 2104',
    employmentStatus: 'Active',
    joiningDate: '2020-11-15',
    safetyScore: 1980,
    recentIncidents: [
      'Conducted ISO 45001 / PDO SP-1143 surveillance audit AUD-2026-0047',
      'Logged audit finding FND-2026-0221 for extruder drive motor temperature alarms'
    ],
    observations: [],
    responsibilities: [
      'Leading independent compliance audits under ISO 45001:2018, ISO 14001:2015, and ISO 9001:2015',
      'Assessing statutory alignment with Oman MoL MD 286/2008 & PDO PR-1172 and Oman Statutory labour regulations',
      'Validating root cause analysis and evidence closeout for major non-conformances (NCR)',
      'Forensic sampling of digital cryptographic audit logs to verify tamper-proof traceability'
    ],
    skills: [
      'Lead Auditor ISO 45001 / 14001 / 9001',
      'Oman MoL MD 286/2008 & PDO Specifications Audit Protocols',
      'Forensic Audit Trail Verification',
      'Non-Conformance & Root Cause Analysis',
      'Risk-Based Process Safety Assurance'
    ],
    competencies: [
      { competency: 'IRCA Certified Lead Auditor ISO 45001:2018', level: 'Expert', verifiedDate: '2024-03-22', verifierName: 'IRCA International' },
      { competency: 'IRCA Certified Lead Auditor ISO 14001:2015', level: 'Expert', verifiedDate: '2024-06-15', verifierName: 'IRCA International' },
      { competency: 'Oman MoL MD 286/2008 & PDO SP-1143 Registered Lead Auditor', level: 'Expert', verifiedDate: '2025-09-10', verifierName: 'Ministry of Labour Occupational Safety & Health Directorate' }
    ],
    certifications: [
      { name: 'IRCA Lead Auditor ISO 45001 (Registration #A17882)', status: 'Valid', expiryDate: '2028-03-22' },
      { name: 'IRCA Lead Auditor ISO 14001 (Registration #E19041)', status: 'Valid', expiryDate: '2028-06-15' },
      { name: 'Certified Quality Engineer (ASQ CQE)', status: 'Valid', expiryDate: '2027-10-31' }
    ],
    achievements: [
      { id: 'ach-as-01', title: 'Audit Excellence Award', description: 'Conducted 45+ comprehensive surveillance audits with zero unaddressed non-conformances', dateEarned: '2026-03-15', icon: 'Award', tier: 'Gold' }
    ],
    currentWorkload: { activeTasks: 8, pendingApprovals: 4, openCapas: 5, utilizationRate: 85 },
    assignedProjects: ['Group Integrated Management System Recertification', 'Contractor Safety Compliance Assurance', 'Digital Audit Vault Automation'],
    assignedSites: ['All Group Concessions (Sultanate of Oman)'],
    approvalResponsibilities: [
      'Audit Non-Conformance Reports (NCR) Close-Out',
      'Corrective Action Evidence Validation',
      'Statutory Surveillance Audit Pass Reports',
      'External Certification Body Liaison Endorsement'
    ],
    activities: [
      { id: 'ACT-AS-01', timestamp: '2026-10-06T14:00:00Z', timePeriod: 'Recent', actionType: 'Closed Audit Finding', category: 'Audit', entityId: 'FND-2026-0221', entityTitle: 'Extruder Drive Motor Thermocouple Alarm Threshold Finding', details: 'Forensically verified corrective action CA-2026-0287; inspected photos, SCADA temperature trends, and signed off closure.', impactResult: 'Finding FND-2026-0221 formally marked Closed in Unified Audit Vault.', relatedUsers: ['Sarah Jones', 'Rahul Gupta'] },
      { id: 'ACT-AS-02', timestamp: '2026-10-06T12:00:00Z', timePeriod: 'Recent', actionType: 'Completed Surveillance Audit', category: 'Audit', entityId: 'AUD-2026-0047', entityTitle: 'ISO 45001 / PDO SP-1143 Compliance Surveillance Audit', details: 'Completed 3-day on-site surveillance audit at Mina Al Fahal Refinery Asset; verified 95.8% compliance score.', impactResult: 'Asset recommended for continued ISO 45001 / Oman MoL MD 286/2008 certification.', relatedUsers: ['Sarah Jones', 'Dr. Layla Hassan'] },
      { id: 'ACT-AS-03', timestamp: '2026-10-05T15:30:00Z', timePeriod: 'Last 7 Days', actionType: 'Audited Scaffolding Inspection', category: 'Inspection', entityId: 'INS-2026-0314', entityTitle: 'Field Verification of Scaffolding & Work at Height Inspection', details: 'Sampled field inspection records logged by Fatima Al-Kaabi; verified tagging, harness checks, and safety netting.', impactResult: 'Zero non-conformances identified in field execution.', relatedUsers: ['Fatima Al-Kaabi'] },
      { id: 'ACT-AS-04', timestamp: '2026-10-04T11:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Audited Incident Investigation', category: 'Incident', entityId: 'INC-2026-0142', entityTitle: 'Audit Sampling of Incident Investigation Process', details: 'Sampled 5-Why analysis, immediate containment, and CAPA formulation for incident INC-2026-0142.', impactResult: 'Verified adherence to Oman MoL MD 286/2008 & PDO PR-1172 statutory reporting timelines.', relatedUsers: ['Fatima Al-Kaabi', 'Sarah Jones'] },
      { id: 'ACT-AS-05', timestamp: '2026-10-03T09:00:00Z', timePeriod: 'Last 7 Days', actionType: 'Raised Audit Finding', category: 'Audit', entityId: 'FND-2026-0221', entityTitle: 'Minor Non-Conformance Raised on Sensor Alarm Redundancy', details: 'Logged finding FND-2026-0221 under ISO 45001 Clause 8.1.2 regarding thermocouple telemetry on Extruder EX-04.', impactResult: 'Triggered corrective action CA-2026-0287.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-AS-06', timestamp: '2026-09-29T10:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Audited Permit to Work Records', category: 'Permit', entityId: 'PTW-2026-0186', entityTitle: 'Sampled Control of Work Compliance on Header Manifold HM-03', details: 'Inspected gas testing log, isolation certificates, and joint signatures for PTW-2026-0186.', impactResult: '100% adherence to PDO SP-1143 (PTW Specification) issuing authority rules verified.', relatedUsers: ['Marcus Chen', 'Sarah Jones'] },
      { id: 'ACT-AS-07', timestamp: '2026-09-25T14:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Sampled Risk Assessment Records', category: 'Risk Assessment', entityId: 'RA-2026-0098', entityTitle: 'Audited High-Pressure Gas Flange Break Bowtie Risk Register', details: 'Reviewed preventive and mitigating barriers in Risk Assessment RA-2026-0098 against ISO 31000 standards.', impactResult: 'Barrier integrity confirmed robust.', relatedUsers: ['Sarah Jones'] },
      { id: 'ACT-AS-08', timestamp: '2026-09-20T11:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Audited Competency Training Records', category: 'Training', entityId: 'TRN-2026-0155', entityTitle: 'Audit Sampling of H2S SCBA Rescue Certifications', details: 'Sampled 50 random employee profiles; verified all active personnel in sour gas zones had valid certifications.', impactResult: '100% training compliance rate validated.', relatedUsers: ['Rahul Gupta', 'Sarah Jones'] },
      { id: 'ACT-AS-09', timestamp: '2026-09-17T16:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Closed Audit Finding in Oman', category: 'Audit', entityId: 'AUD-2026-003', entityTitle: 'Closed Whip-Check Restraint Finding F-301 in Block 6', details: 'Verified physical installation of whip-checks on flexible test manifolds at Fahud-West Gas Station.', impactResult: 'Finding closed with PDO and Oman Ministry of Labour.', relatedUsers: ['Salim Al-Harthy'] },
      { id: 'ACT-AS-10', timestamp: '2026-09-15T09:00:00Z', timePeriod: 'Last 30 Days', actionType: 'Sampled Safety Observations', category: 'Observation', entityId: 'OBS-2026-0412', entityTitle: 'Audited Worker Safety Observation Quality & Authenticity', details: 'Interviewed workers at Berth 1 regarding observation logging and Stop Work Authority empowerment.', impactResult: 'High workforce safety culture confirmed with zero fear of reprisal.', relatedUsers: ['Rahul Gupta'] }
    ],
    pendingActions: [
      { id: 'PND-AS-01', title: 'Compile Final Audit Report for ISO 45001 Surveillance', sourceType: 'Audit', sourceId: 'AUD-2026-0047', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 1, isOverdue: false, status: 'In Review', requiredAction: 'Finalize formal executive audit dossier for Lloyd\'s Register external assessment', location: 'Muscat HQ' },
      { id: 'PND-AS-02', title: 'Verify Closeout Evidence for Gas Log Timestamp Finding F-401', sourceType: 'Audit', sourceId: 'FND-401-CLOSE', priority: 'P2 - High', dueDate: '2026-10-12', daysRemaining: 3, isOverdue: false, status: 'Action Required', requiredAction: 'Inspect mobile PWA code release enforcing dock bump test timestamps', location: 'Audit Vault' },
      { id: 'PND-AS-03', title: 'Pre-Audit Review: Block 6 Oman Environmental Surveillance', sourceType: 'Audit', sourceId: 'AUD-OMN-ENV', priority: 'P2 - High', dueDate: '2026-10-14', daysRemaining: 5, isOverdue: false, status: 'Scheduled', requiredAction: 'Review groundwater monitoring borehole test results from Fahud-West camp', location: 'Fahud-West' },
      { id: 'PND-AS-04', title: 'Audit Cryptographic Hash Chain on Immutable Audit Trail', sourceType: 'Audit', sourceId: 'SEC-HASH-Q4', priority: 'P3 - Medium', dueDate: '2026-10-16', daysRemaining: 7, isOverdue: false, status: 'In Review', requiredAction: 'Verify SHA-256 digital seals on 650+ operational records with System Admin', location: 'Data Center' },
      { id: 'PND-AS-05', title: 'Overdue Contractor Safety Audit Finding Sign-off', sourceType: 'Audit', sourceId: 'CON-FIND-OVER', priority: 'P1 - Critical', dueDate: '2026-10-06', daysRemaining: -3, isOverdue: true, status: 'Overdue', requiredAction: 'Countersign closure of crane rigging non-conformance for Petrofac consortium', location: 'Ras Al-Khair' },
      { id: 'PND-AS-06', title: 'Schedule Q1 2027 Internal Audit Program with Department Heads', sourceType: 'Meeting', sourceId: 'MTG-AUD-2027', priority: 'P3 - Medium', dueDate: '2026-10-18', daysRemaining: 9, isOverdue: false, status: 'Upcoming', requiredAction: 'Publish annual audit calendar across all 14 operating concessions', location: 'Muscat HQ' },
      { id: 'PND-AS-07', title: 'Sample Emergency Eyewash Inspection Records in Mina Al Fahal', sourceType: 'Inspection', sourceId: 'INSP-2026-009', priority: 'P3 - Medium', dueDate: '2026-10-20', daysRemaining: 11, isOverdue: false, status: 'Scheduled', requiredAction: 'Forensically verify physical tags against digital database entries', location: 'Acid Farm' },
      { id: 'PND-AS-08', title: 'Audit Contractor Permit Authorization Competency Matrices', sourceType: 'Permit', sourceId: 'AUD-PTW-COMP', priority: 'P2 - High', dueDate: '2026-10-22', daysRemaining: 13, isOverdue: false, status: 'In Review', requiredAction: 'Verify Performing Authority training validity for 60 active permit holders', location: 'Control of Work Hub' },
      { id: 'PND-AS-09', title: 'Review Quality Non-Conformance Log on Marine Berth Pipe Spools', sourceType: 'CAPA', sourceId: 'NCR-BERTH-09', priority: 'P3 - Medium', dueDate: '2026-10-24', daysRemaining: 15, isOverdue: false, status: 'Pending', requiredAction: 'Verify ultrasonic testing thickness certificates for newly fabricated spools', location: 'Berth 1 Marine' },
      { id: 'PND-AS-10', title: 'Submit Annual Management Review (AMR) Audit Synthesis', sourceType: 'Audit', sourceId: 'AMR-SYN-2026', priority: 'P2 - High', dueDate: '2026-10-28', daysRemaining: 19, isOverdue: false, status: 'Upcoming', requiredAction: 'Present multi-site audit trends and systemic root causes to Dr. Layla Hassan', location: 'Executive HQ' }
    ],
    completedActions: [
      { id: 'CMP-AS-01', title: 'Closed Finding #FND-2026-0221 After Forensic Verification', sourceType: 'Audit', sourceId: 'FND-2026-0221', completedDate: '2026-10-06T14:00:00Z', outcome: 'Verified installation of dual infrared temperature sensors on Extruder EX-04.', verifiedBy: 'Alice Smith', evidenceNotes: 'Evidence dossier approved and archived in Audit Vault.', location: 'Extrusion Hall Zone C' },
      { id: 'CMP-AS-02', title: 'Completed ISO 45001 / Oman MoL MD 286/2008 Surveillance Audit AUD-2026-0047', sourceType: 'Audit', sourceId: 'AUD-2026-0047', completedDate: '2026-10-06T12:00:00Z', outcome: 'Overall audit score 95.8% achieved with zero major non-conformances.', verifiedBy: 'Alice Smith', evidenceNotes: 'Surveillance audit certificate recommendation issued.', location: 'Mina Al Fahal Refinery Asset' },
      { id: 'CMP-AS-03', title: 'Field Sampled Scaffolding Inspection #INS-2026-0314', sourceType: 'Inspection', sourceId: 'INS-2026-0314', completedDate: '2026-10-05T15:30:00Z', outcome: '100% adherence to scaffolding safety standards confirmed in field.', verifiedBy: 'Alice Smith', evidenceNotes: 'Field audit check-sheet signed.', location: 'Berth 1 & Reactor Tower' },
      { id: 'CMP-AS-04', title: 'Sampled Incident Investigation Process for INC-2026-0142', sourceType: 'Incident', sourceId: 'INC-2026-0142', completedDate: '2026-10-04T11:00:00Z', outcome: 'Confirmed rigorous 5-Why root cause determination and timely containment.', verifiedBy: 'Alice Smith', evidenceNotes: 'Investigation audit note filed.', location: 'Mina Al Fahal' },
      { id: 'CMP-AS-05', title: 'Audited Permit PTW-2026-0186 Control of Work Compliance', sourceType: 'Permit', sourceId: 'PTW-2026-0186', completedDate: '2026-09-29T10:00:00Z', outcome: 'Verified LOTO isolation tags, gas tester certificate, and Area Authority signatures.', verifiedBy: 'Alice Smith', evidenceNotes: 'Control of Work audit checklist completed.', location: 'Header Manifold HM-03' },
      { id: 'CMP-AS-06', title: 'Audited Bowtie Risk Register RA-2026-0098', sourceType: 'Risk Assessment', sourceId: 'RA-2026-0098', completedDate: '2026-09-25T14:00:00Z', outcome: 'Critical process safety barriers verified compliant with ISO 31000 guidelines.', verifiedBy: 'Alice Smith', evidenceNotes: 'Risk audit report archived.', location: 'Admin HQ' },
      { id: 'CMP-AS-07', title: 'Sampled H2S Rescue Training Certifications TRN-2026-0155', sourceType: 'Training', sourceId: 'TRN-2026-0155', completedDate: '2026-09-20T11:00:00Z', outcome: '50 technicians audited with 100% valid training records confirmed.', verifiedBy: 'Alice Smith', evidenceNotes: 'Training audit summary published.', location: 'HSE Academy' },
      { id: 'CMP-AS-08', title: 'Closed Secondary Whip-Check Finding F-301 in Block 6', sourceType: 'Audit', sourceId: 'AUD-2026-003', completedDate: '2026-09-17T16:00:00Z', outcome: 'Confirmed installation of stainless steel restraints on flexible test lines.', verifiedBy: 'Alice Smith', evidenceNotes: 'Closure confirmation letter issued.', location: 'Fahud-West Gas Station' },
      { id: 'CMP-AS-09', title: 'Sampled Frontline Safety Observations Authenticity', sourceType: 'Observation', sourceId: 'OBS-2026-0412', completedDate: '2026-09-15T09:00:00Z', outcome: 'Verified genuine worker engagement and active Stop Work Authority culture.', verifiedBy: 'Alice Smith', evidenceNotes: 'Culture assessment note archived.', location: 'Berth 1 Staging Area' },
      { id: 'CMP-AS-10', title: 'Cryptographically Validated Immutable Audit Ledger', sourceType: 'Audit', sourceId: 'SEC-LEDGER-Q3', completedDate: '2026-09-08T14:00:00Z', outcome: 'Zero hash discrepancies detected across 650+ operational event records.', verifiedBy: 'Alice Smith', evidenceNotes: 'Data integrity certificate signed with System Admin.', location: 'Data Center' }
    ],
    notifications: [
      { id: 'NTF-AS-01', timestamp: '2026-10-06T14:15:00Z', title: 'Finding FND-2026-0221 Formally Closed', message: 'Corrective action CA-2026-0287 verified and finding marked Closed in Audit Vault.', severity: 'Low', category: 'Audit', sourceId: 'FND-2026-0221', read: false, senderName: 'Audit System' },
      { id: 'NTF-AS-02', timestamp: '2026-10-06T12:15:00Z', title: 'Surveillance Audit AUD-2026-0047 Completed', message: 'Mina Al Fahal Refinery Asset achieved 95.8% compliance score under ISO 45001 / PDO SP-1143.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-0047', read: true, senderName: 'Audit System' },
      { id: 'NTF-AS-03', timestamp: '2026-10-05T15:45:00Z', title: 'Field Sample Check INS-2026-0314 Passed', message: 'Scaffolding field inspection verified with zero discrepancies.', severity: 'Low', category: 'Inspection', sourceId: 'INS-2026-0314', read: true, senderName: 'Fatima Al-Kaabi' },
      { id: 'NTF-AS-04', timestamp: '2026-10-04T11:15:00Z', title: 'Incident Investigation Audit Cleared', message: '5-Why causal investigation for INC-2026-0142 verified compliant with Oman MoL MD 286/2008 & PDO PR-1172.', severity: 'Low', category: 'Incident', sourceId: 'INC-2026-0142', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-AS-05', timestamp: '2026-10-03T09:15:00Z', title: 'New Audit Finding Raised: FND-2026-0221', message: 'Minor non-conformance logged for extruder sensor telemetry redundancy.', severity: 'Medium', category: 'Audit', sourceId: 'FND-2026-0221', read: true, senderName: 'Alice Smith' },
      { id: 'NTF-AS-06', timestamp: '2026-09-29T10:15:00Z', title: 'Control of Work Audit Passed', message: 'Permit PTW-2026-0186 verified with full LOTO isolation and gas testing compliance.', severity: 'Low', category: 'Permit', sourceId: 'PTW-2026-0186', read: true, senderName: 'Marcus Chen' },
      { id: 'NTF-AS-07', timestamp: '2026-09-25T14:15:00Z', title: 'Risk Register RA-2026-0098 Verified', message: 'Process safety barriers for hydrocarbon trunkline break verified robust.', severity: 'Low', category: 'Risk', sourceId: 'RA-2026-0098', read: true, senderName: 'Sarah Jones' },
      { id: 'NTF-AS-08', timestamp: '2026-09-20T11:15:00Z', title: 'Training Audit Passed: TRN-2026-0155', message: '100% active workforce compliance confirmed for H2S SCBA rescue certification.', severity: 'Low', category: 'Training', sourceId: 'TRN-2026-0155', read: true, senderName: 'HSE Academy' },
      { id: 'NTF-AS-09', timestamp: '2026-09-17T16:15:00Z', title: 'Finding F-301 Closed in Oman Block 6', message: 'Secondary whip-check restraints verified on flexible test manifolds.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-003', read: true, senderName: 'Salim Al-Harthy' },
      { id: 'NTF-AS-10', timestamp: '2026-09-08T14:15:00Z', title: 'Audit Ledger Hash Verified', message: 'Zero cryptographic collisions or tamper anomalies detected across all system records.', severity: 'Low', category: 'Security', sourceId: 'SEC-LEDGER-Q3', read: true, senderName: 'System Admin' }
    ]
  }
];
