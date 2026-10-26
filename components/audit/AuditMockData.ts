import { SafetyAudit, AuditTemplate, AuditorProfile, Finding } from './AuditTypes';

export const MOCK_AUDIT_TEMPLATES: AuditTemplate[] = [
    {
        id: 'TPL-001',
        name: 'General Facility & PPE Safety Audit',
        type: 'General',
        description: 'Comprehensive multi-site general safety inspection aligned with Oman MoL MD 286/2008 & PDO Specifications v4.0',
        frameworks: ['Oman MoL MD 286/2008 & PDO Specifications', 'Oman Labour Law', 'ISO 45001'],
        sections: [
            {
                id: 'S-001',
                name: 'PPE Compliance',
                questions: [
                    { id: 'Q-001', question: 'Are all workers wearing proper hard hats and chin straps?', type: 'PassFail', weight: 10, guidance: 'Check all active zones.' },
                    { id: 'Q-002', question: 'Is high-visibility class 3 clothing worn appropriately?', type: 'PassFail', weight: 10, guidance: 'Required for all plant areas.' }
                ]
            },
            {
                id: 'S-002',
                name: 'Housekeeping & Egress',
                questions: [
                    { id: 'Q-003', question: 'Are primary walkways clear of slip/trip hazards and unobstructed?', type: 'PassFail', weight: 10, guidance: 'Walk through primary access routes.' }
                ]
            }
        ]
    },
    {
        id: 'TPL-002',
        name: 'Heavy Construction & Critical Lifting Audit',
        type: 'Construction',
        description: 'Structural installation, scaffolding, and lifting operations verification',
        frameworks: ['PDO HSE', 'Oman MoL MD 286/2008 & PDO Specifications', 'LEEA Standards'],
        sections: [
            {
                id: 'S-003',
                name: 'Work at Height',
                questions: [
                    { id: 'Q-004', question: 'Are scaffolds inspected every 7 days with valid Scafftag?', type: 'YesNo', weight: 20, guidance: 'Check physical tags.' },
                    { id: 'Q-005', question: 'Is engineered edge protection installed on all exposed drops >1.8m?', type: 'PassFail', weight: 20, guidance: 'Check slabs and roof areas.' }
                ]
            }
        ]
    },
    {
        id: 'TPL-003',
        name: 'Environmental Management & Waste Disposal Audit',
        type: 'Environmental',
        description: 'Hazardous waste manifests, oily water separators, and emission control',
        frameworks: ['ISO 14001:2015', 'EAD Regulations', 'COP28 ESG Framework'],
        sections: [
            {
                id: 'S-004',
                name: 'Hazardous Waste Segregation',
                questions: [
                    { id: 'Q-006', question: 'Are waste oils stored within impermeable bunded containment?', type: 'PassFail', weight: 25, guidance: 'Inspect chemical yard bunds.' },
                    { id: 'Q-007', question: 'Are EAD digital waste transfer manifests registered?', type: 'PassFail', weight: 25, guidance: 'Verify Bolisaty tracking.' }
                ]
            }
        ]
    }
];

export const MOCK_AUDITORS: AuditorProfile[] = [
    {
        id: 'A-001',
        name: 'Sarah Jones',
        certifications: ['NEBOSH IGC', 'ISO 45001 Lead Auditor', 'IRCA Registered'],
        experienceYears: 9,
        department: 'Corporate HSE Assurance',
        assignedAudits: 14,
        performanceScore: 96,
        completionRate: 100
    },
    {
        id: 'A-002',
        name: 'Ahmed Al-Mansoori',
        certifications: ['NEBOSH Oil & Gas', 'Oman MoL MD 286/2008 Practitioner Grade A'],
        experienceYears: 14,
        department: 'Operations HSE',
        assignedAudits: 11,
        performanceScore: 98,
        completionRate: 100
    },
    {
        id: 'A-003',
        name: 'Dr. Layla Hassan',
        certifications: ['Ph.D. Industrial Safety', 'ISO 14001 Principal Auditor'],
        experienceYears: 16,
        department: 'Regulatory Compliance',
        assignedAudits: 8,
        performanceScore: 99,
        completionRate: 100
    }
];

export const MOCK_AUDITS: SafetyAudit[] = [
    {
        id: 'SA-2024-001',
        templateId: 'TPL-001',
        title: 'Weekly Polyolefin Sector 4 General Safety Audit',
        location: 'Mina Al Fahal Industrial Complex',
        department: 'Operations',
        auditorId: 'A-001',
        auditorName: 'Sarah Jones',
        scheduledDate: '2026-04-10',
        completionDate: '2026-04-10',
        status: 'Completed',
        score: 88,
        findings: [
            {
                id: 'F-101',
                auditId: 'SA-2024-001',
                questionId: 'Q-001',
                description: 'Three contractors observed without chin-straps fastened on 14m scaffold deck.',
                category: 'PPE',
                severity: 'High',
                evidenceUrls: [],
                responsiblePersonId: 'u2',
                status: 'Closed',
                dueDate: '2026-04-12',
                correctiveAction: {
                    id: 'CA-101',
                    description: 'Conduct immediate safety stand-down with subcontractor; replace chin-straps.',
                    assignedTo: 'u2',
                    priority: 'High',
                    targetDate: '2026-04-12',
                    status: 'Verified'
                },
                rca: {
                    method: '5Why',
                    causes: ['Subcontractor rushed to resume work', 'No chin-strap check at turnstile', 'Lax supervision'],
                    rootCause: 'Turnstile PPE visual verification did not mandate strap fastening check.',
                    preventiveAction: 'Deploy AI CCTV gate monitor with mandatory chin-strap detection.'
                },
                regulationRef: 'Oman MoL MD 286/2008 & PDO Specifications CoP 2.0 PPE Clause 4.2'
            }
        ]
    },
    {
        id: 'SA-2024-002',
        templateId: 'TPL-002',
        title: 'Khazzan Gas Asset Sulfur Recovery Flare Modernization Audit',
        location: 'Khazzan Tight Gas Complex Block 61',
        department: 'Construction',
        contractor: 'Gulf Technical Services',
        auditorId: 'A-002',
        auditorName: 'Ahmed Al-Mansoori',
        scheduledDate: '2026-04-12',
        completionDate: '2026-04-12',
        status: 'Completed',
        score: 94,
        findings: [
            {
                id: 'F-102',
                auditId: 'SA-2024-002',
                questionId: 'Q-004',
                description: 'Scafftag missing on pipe rack access ladder module 3.',
                category: 'Work at Height',
                severity: 'Medium',
                evidenceUrls: [],
                responsiblePersonId: 'u5',
                status: 'Under Action',
                dueDate: '2026-04-16',
                correctiveAction: {
                    id: 'CA-102',
                    description: 'Third-party scaffolding inspector re-inspected and signed off tag.',
                    assignedTo: 'u5',
                    priority: 'Medium',
                    targetDate: '2026-04-16',
                    status: 'Pending'
                },
                regulationRef: 'BS EN 12811 / PDO HSE CoP'
            }
        ]
    },
    {
        id: 'SA-2024-003',
        templateId: 'TPL-001',
        title: 'Mina Zayed Berth 4 Container Terminal Housekeeping Audit',
        location: 'Mina Zayed Terminal',
        department: 'Logistics',
        auditorId: 'A-001',
        auditorName: 'Sarah Jones',
        scheduledDate: '2026-04-08',
        completionDate: '2026-04-08',
        status: 'Completed',
        score: 92,
        findings: [
             {
                id: 'F-103',
                auditId: 'SA-2024-003',
                questionId: 'Q-003',
                description: 'Pallets obstructing marine fire hydrant line access.',
                category: 'Housekeeping',
                severity: 'Medium',
                evidenceUrls: [],
                responsiblePersonId: 'u8',
                status: 'Closed',
                dueDate: '2026-04-09',
                correctiveAction: {
                    id: 'CA-103',
                    description: 'Clear access route immediately; apply yellow reflective crosshatch box.',
                    assignedTo: 'u8',
                    priority: 'Medium',
                    targetDate: '2026-04-09',
                    status: 'Verified'
                },
                rca: {
                    method: '5Why',
                    causes: ['Forklift operator ran out of designated floor space', 'Temporary overflow cargo from vessel berth'],
                    rootCause: 'Surge container cargo lacked designated overflow buffer zone.',
                    preventiveAction: 'Establish dedicated buffer staging yard B with clear demarcation lines.'
                },
                regulationRef: 'Civil Defence and Ambulance Authority (CDAA Oman) Fire & Life Safety Code'
            }
        ]
    },
    {
        id: 'SA-2024-004',
        templateId: 'TPL-003',
        title: 'Fahud Wellhead Sump & Chemical Storage Environmental Audit',
        location: 'Fahud Field Operation',
        department: 'Production',
        auditorId: 'A-003',
        auditorName: 'Dr. Layla Hassan',
        scheduledDate: '2026-04-14',
        status: 'In Progress',
        score: 79,
        findings: [
            {
                id: 'F-104',
                auditId: 'SA-2024-004',
                questionId: 'Q-006',
                description: 'Oily water skimmer drainage valve weeping drops into unlined desert soil.',
                category: 'Environmental',
                severity: 'Critical',
                evidenceUrls: [],
                responsiblePersonId: 'u9',
                status: 'Open',
                dueDate: '2026-04-15',
                correctiveAction: {
                    id: 'CA-104',
                    description: 'Isolate line, excavate contaminated sand for bioremediation, replace valve packing.',
                    assignedTo: 'u9',
                    priority: 'Critical',
                    targetDate: '2026-04-15',
                    status: 'Pending'
                },
                regulationRef: 'Oman MECA Ministerial Decision 18/93'
            }
        ]
    },
    {
        id: 'SA-2024-005',
        templateId: 'TPL-002',
        title: 'NEOM Sindalah Island Marina Structural Piling HSE Audit',
        location: 'NEOM Sindalah Island Base',
        department: 'Marine Engineering',
        contractor: 'Red Sea Marine Solutions',
        auditorId: 'A-002',
        auditorName: 'Ahmed Al-Mansoori',
        scheduledDate: '2026-04-16',
        status: 'Scheduled',
        score: 0,
        findings: []
    },
    {
        id: 'SA-2024-006',
        templateId: 'TPL-001',
        title: 'Duqm Industrial Port Logistics Distribution Center Forklift Safety Audit',
        location: 'Duqm Industrial Port Logistics Hub',
        department: 'Warehousing',
        auditorId: 'A-001',
        auditorName: 'Sarah Jones',
        scheduledDate: '2026-04-18',
        status: 'Scheduled',
        score: 0,
        findings: []
    },
    {
        id: 'SA-2024-007',
        templateId: 'TPL-002',
        title: 'Ras Al Khair Maritime Yard Gantry Crane 600T Commissioning Audit',
        location: 'Ras Al Khair Maritime Yard',
        department: 'Lifting & Rigging',
        contractor: 'Arabian Rigging Co.',
        auditorId: 'A-002',
        auditorName: 'Ahmed Al-Mansoori',
        scheduledDate: '2026-04-04',
        completionDate: '2026-04-05',
        status: 'Completed',
        score: 96,
        findings: [
            {
                id: 'F-105',
                auditId: 'SA-2024-007',
                questionId: 'Q-004',
                description: 'Anemometer telemetry cutoff calibrated at 28 knots instead of site limit 25 knots.',
                category: 'Equipment',
                severity: 'High',
                evidenceUrls: [],
                responsiblePersonId: 'u7',
                status: 'Closed',
                dueDate: '2026-04-06',
                correctiveAction: {
                    id: 'CA-105',
                    description: 'Recalibrate PLC cut-off threshold to strict 25 knots per Aramco standard.',
                    assignedTo: 'u7',
                    priority: 'High',
                    targetDate: '2026-04-06',
                    status: 'Verified'
                },
                regulationRef: 'Saudi Aramco Safety Management System GI 7.027'
            }
        ]
    },
    {
        id: 'SA-2024-008',
        templateId: 'TPL-003',
        title: 'Al Dhafra Solar Substation SF6 Gas Handling Audit',
        location: 'Al Dhafra Solar Farm',
        department: 'High Voltage Electrical',
        auditorId: 'A-003',
        auditorName: 'Dr. Layla Hassan',
        scheduledDate: '2026-03-29',
        completionDate: '2026-03-30',
        status: 'Completed',
        score: 91,
        findings: [
            {
                id: 'F-106',
                auditId: 'SA-2024-008',
                questionId: 'Q-007',
                description: 'SF6 recovery cart cylinder logbook missing batch serial number entry.',
                category: 'Documentation',
                severity: 'Low',
                evidenceUrls: [],
                responsiblePersonId: 'u4',
                status: 'Closed',
                dueDate: '2026-04-01',
                correctiveAction: {
                    id: 'CA-106',
                    description: 'Updated digital asset register with manufacturer gas verification certificate.',
                    assignedTo: 'u4',
                    priority: 'Low',
                    targetDate: '2026-04-01',
                    status: 'Verified'
                },
                regulationRef: 'Kyoto Protocol / Oman Climate Neutrality 2050 Framework'
            }
        ]
    },
    {
        id: 'SA-2024-009',
        templateId: 'TPL-001',
        title: 'Musaffah Steel Mill Noise & Vibration Baseline Audit',
        location: 'Musaffah Industrial Zone',
        department: 'Rolling Mill Operations',
        auditorId: 'A-001',
        auditorName: 'Sarah Jones',
        scheduledDate: '2026-03-22',
        completionDate: '2026-03-23',
        status: 'Completed',
        score: 84,
        findings: [
            {
                id: 'F-107',
                auditId: 'SA-2024-009',
                questionId: 'Q-001',
                description: 'Noise levels at roughing stand reached 93 dBA; workers using foam earplugs with only 18dB NRR rating.',
                category: 'Occupational Health',
                severity: 'High',
                evidenceUrls: [],
                responsiblePersonId: 'u1',
                status: 'Closed',
                dueDate: '2026-03-28',
                correctiveAction: {
                    id: 'CA-107',
                    description: 'Upgraded to dual hearing protection (earmuffs + custom molded earplugs) NRR 33dB.',
                    assignedTo: 'u1',
                    priority: 'High',
                    targetDate: '2026-03-28',
                    status: 'Verified'
                },
                regulationRef: 'Oman MoL MD 286/2008 & PDO Specifications CoP 3.0 Occupational Noise'
            }
        ]
    },
    {
        id: 'SA-2024-010',
        templateId: 'TPL-002',
        title: 'Das Island Offshore Platform Flare Stack Turnaround Audit',
        location: 'Das Island Offshore',
        department: 'Turnaround Team',
        auditorId: 'A-002',
        auditorName: 'Ahmed Al-Mansoori',
        scheduledDate: '2026-04-20',
        status: 'Scheduled',
        score: 0,
        findings: []
    }
];
