# Product Requirements Document (PRD) — AD6.Ai Smart HSE Enterprise Platform

**Document Version:** 2.0.0-PROD  
**Status:** Approved for Implementation  
**Product Owner:** Principal Product Manager & HSE Solutions Architect  
**Technical Stakeholders:** Principal Software Architect, Lead Security Engineer, Senior Full-Stack Engineer  
**Target Industries:** Oil & Gas, Energy, Maritime, Petrochemical, Utilities, and High-Risk Infrastructure across GCC (Sultanate of Oman, Oman, KSA)  
**Regulatory Frameworks:** ISO 45001:2018, ISO 14001:2015, ISO 9001:2015, Oman MoL MD 286/2008 & PDO Specifications, Oman Labour Law RD 53/2023, MD 286/2008, PDO SP-1143 / SP-1170, PDO 12 Life-Saving Rules.

---

## 1. Executive Summary

The **AD6.Ai Smart HSE Enterprise Platform** is an intelligent, multi-jurisdictional Health, Safety, Environment (HSE), and ESG operations operating system. Originally conceived as a digital operating prototype for industrial enterprises in Oman and the Sultanate of Oman, AD6.Ai transitions organizations from lagging, reactive incident tracking to proactive, AI-grounded hazard mitigation, dynamic barrier verification, and closed-loop compliance governance.

The platform combines real-time Control of Work (PTW/SIMOPS), statutory Heat Stress (TWL / WBGT) monitoring, root-cause investigations (5-Whys and Fishbone), AI-assisted Job Safety Analysis (JSA), contractor pre-qualification governance, and Scope 1/2/3 carbon accounting into a unified, role-governed web application and Progressive Web App (PWA).

---

## 2. Product Vision & Strategic Objectives

### 2.1 Vision Statement
To establish the enterprise standard for intelligent industrial safety in the Middle East, eliminating fatal and severe injury events (SIF) through predictive risk synthesis, strict statutory compliance, and zero-compromise Segregation of Duties.

### 2.2 Core Strategic Goals
1. **Zero SIF (Serious Injury or Fatality) Precursors:** Real-time flagging of high-energy hazards and simultaneous operations (SIMOPS) conflicts before field permit authorization.
2. **Statutory Compliance Automation:** Full adherence to Oman MoL 24-Hour Notice Form (MD 286/2008 Annex 1), Oman MoL MD 286/2008 summer midday work ban (12:30-15:30), Oman Ministry of Labour (MD 286/2008) notifications, and PDO Thermal Work Limit (TWL) thresholds.
3. **Audit Readiness & Tamper-Resistant Traceability:** Continuous audit log generation with cryptographic hash digests capturing all status transitions, barrier overrides, and approvals.
4. **Sub-24-Hour CAPA Closure Acceleration:** Automated SLA aging alerts, hierarchical escalation, and mandatory verification of corrective action effectiveness.

---

## 3. Target User Personas & Stakeholder Matrix

| Persona | Primary Role | Core Needs & Pain Points | Primary System Views |
|---|---|---|---|
| **Dr. Layla Hassan** (Executive Director / Board Member) | Executive Oversight & Corporate Governance | Needs real-time TRIR/LTIFR, ESG footprint, board packs, multi-site compliance scoring; fatigued by stale monthly slide decks. | `EXECUTIVE_DASHBOARD`, `ESG_SUSTAINABILITY`, `COMPLIANCE_HEATMAP` |
| **Sarah Jones** (QHSE Corporate Director) | Quality, Safety & Environmental Strategy | Needs statutory filing exports (Form G / Oman MoL), ISO 45001 surveillance tracking, policy repository management. | `INCIDENT_MANAGEMENT`, `AUDIT_INSPECTION`, `REGULATORY_INTELLIGENCE` |
| **Marcus Chen** (Area Authority / HSE Manager) | Operational HSE Governance & Risk Control | Needs SIMOPS clash resolution, permit issuance, high-risk CAPA assignment, Root Cause Analysis verification. | `CONTROL_OF_WORK`, `SIMOPS_MATRIX`, `RISK_REGISTER`, `CAPA_MANAGEMENT` |
| **Tariq Al-Hashemi** (Field Safety Officer / Inspector) | On-site Field Inspection & Verification | Needs mobile/PWA offline forms, gas test bump logging, LOTO verification, digital photo evidence upload, heat index alerts. | `MY_WORK_COCKPIT`, `FIELD_INSPECTIONS`, `JSA_DRA`, `TOOLBOX_TALKS` |
| **Rahul Gupta** (Permit Receiver / Lead Technician) | Contractor Execution & Work Delivery | Needs rapid permit sign-off, clear hazard barrier briefings, live Stop Work Authority access without fear of reprisal. | `MY_WORK_COCKPIT`, `PERMIT_TO_WORK`, `STOP_WORK_AUTHORITY` |
| **Alice Smith** (Lead Statutory & Quality Auditor) | Regulatory & Compliance Audit | Needs immutable evidence trails, non-conformance logging, ISO/Oman MoL clause cross-referencing. | `AUDIT_INSPECTION`, `UNIFIED_AUDIT_TRAIL` |

---

## 4. Prototype Feature Inventory (Implemented vs. Proposed)

| Module / Feature | Implemented Status | Evidence in Codebase | Proposed Enhancements |
|---|---|---|---|
| **Incident Management & Investigation** | **Implemented** | `components/IncidentForm.tsx`, `services/enterpriseDataStore.ts` | Multi-party witness statement e-signatures; video frame extraction. |
| **Root Cause Analysis (5-Whys & Fishbone)** | **Implemented** | `components/RootCauseAnalysisTool.tsx`, `components/IncidentForm.tsx` | Auto-population from Gemini RCA prompts with confidence scoring. |
| **Control of Work (PTW) & SIMOPS** | **Implemented** | `components/controlOfWork/ControlOfWorkModule.tsx`, `services/simopsService.ts` | Live IoT gas sensor integration via MQTT; Bluetooth beacon lockouts. |
| **CAPA Management & Closed-Loop SLA** | **Implemented** | `components/CAPAModule.tsx`, `services/enterpriseDataStore.ts` | WhatsApp / SMS escalation gateway for overdue P1 actions. |
| **Executive KPI Dashboard & Formulas** | **Implemented** | `components/system/ExecutiveDashboard.tsx` | Direct automated PDF board-pack compilation with executive notes. |
| **Regional Compliance Engine (Oman/Oman)** | **Implemented** | `services/regionalComplianceService.ts`, `contexts/RegionalComplianceContext.tsx` | Expansion to KSA (NCOSH) and Qatar (MOPH) statutory profiles. |
| **Thermal Stress & Heat Ban Tracking** | **Implemented** | `services/regionalComplianceService.ts` | Real-time weather station API telemetry hooks. |
| **Carbon Accounting & ESG Reporting** | **Implemented** | `components/CarbonAccountingModule.tsx`, `services/esgReportingService.ts` | Automated Scope 3 supply chain procurement invoice parsing. |
| **Safi AI Copilot & Voice Transcription** | **Implemented** | `components/ChatBot.tsx`, `services/geminiService.ts`, `routes/geminiRouter.ts` | Streaming tokens over WebSocket; multimodal camera live feed. |
| **Role-Based Access Control (RBAC)** | **Implemented** | `services/permissionService.ts`, `server.ts` | OIDC / SAML 2.0 integration with Azure AD / Okta. |
| **Persistent Relational Database** | **Proposed** | Currently dual `localStorage` + in-memory Express. | PostgreSQL 16 schema with Row-Level Security (RLS) via Prisma/Drizzle. |
| **Model Context Protocol (MCP) Server** | **Proposed** | Specification in `enterprise-architecture/` | Standardized MCP tools for safe incident queries & permit checks. |

---

## 5. Functional Requirements (FR)

### Module 1: Incident Reporting & Investigation
- **FR-001 (Capture):** System shall allow all authenticated roles to submit an initial incident report with title, classification (Near Miss, First Aid, Medical Treatment, LTI, Process Safety Event, Fatality), exact location, GPS coordinates, initial photos, and immediate containment actions within < 3 minutes. *(Status: Implemented)*
- **FR-002 (Statutory Clock):** System shall automatically trigger statutory notification timers based on jurisdiction:
  - Oman / Oman MoL: 24-hour statutory deadline for initial notification (Form G).
  - Oman / MoL: 24-hour notice for serious/lost-time incidents per MD 286/2008. *(Status: Implemented)*
- **FR-003 (RCA Tree):** System shall provide an interactive 5-Why analysis builder and an Ishikawa 6M (Manpower, Machine, Method, Material, Measurement, Environment) fishbone diagram for all incidents classified as Medium or higher. *(Status: Implemented)*
- **FR-004 (Direct CAPA Spawning):** Action items formulated during RCA or investigation shall be synchronized directly to the Central CAPA Register without re-keying. *(Status: Implemented)*

### Module 2: Control of Work (PTW) & SIMOPS
- **FR-010 (Permit Lifecycle):** System shall enforce a strict 6-state Permit to Work workflow: `Draft` ➔ `Requested` ➔ `Under Review` ➔ `Authorized (Active)` ➔ `Suspended` ➔ `Closed / Cancelled`. *(Status: Implemented)*
- **FR-011 (Segregation of Duties - SoD):** The system shall strictly prevent the Permit Receiver/Applicant from self-authorizing the permit as Area Authority / Issuer. Any attempt shall be blocked with an explicit error and logged in the security audit trail. *(Status: Implemented)*
- **FR-012 (Competency Barrier Gating):** System shall check contractor and worker competency certificates. If mandatory certifications (e.g., Gas Tester, Confined Space Entry, Rigger Level 2) have expired or are unverified, the system shall disable permit sign-off. *(Status: Implemented)*
- **FR-013 (SIMOPS Clashing):** System shall cross-reference active permit zones and co-located work (e.g., Hot Work within 15 meters of Flammable Hydrocarbon Venting or Crane Heavy Lifting above a manned trench) and lock authorization pending formal SIMOPS risk mitigation. *(Status: Implemented)*
- **FR-014 (Atmospheric Gas Log):** Hot Work and Confined Space permits shall require valid gas test readings ($O_2$ 19.5%–23.5%, LEL 0.0%, $H_2S$ < 10 ppm, $CO$ < 25 ppm) with bump test serial numbers recorded before permit activation. *(Status: Implemented)*

### Module 3: Corrective & Preventive Action (CAPA) Governance
- **FR-020 (Central Register):** All actions originating from Incidents, Safety Audits, Field Inspections, and JSA reviews shall aggregate into a unified searchable register. *(Status: Implemented)*
- **FR-021 (SoD Closure Enforcement):** The designated Action Assignee cannot close or verify their own action. Verification and closure requires approval by an HSE Inspector, HSE Director, or Area Authority. *(Status: Implemented)*
- **FR-022 (SLA Aging & Escalation):** System shall flag actions past target date as Overdue, recalculating compliance rate ($SLA = \frac{\text{Closed On Time}}{\text{Total Actions}} \times 100$) and notifying department leads. *(Status: Implemented)*

### Module 4: Regional Compliance Engine
- **FR-030 (Jurisdiction Switching):** System shall support dynamic switching between `Oman`, `Oman`, and `Combined` modes, updating terminology (e.g., "Oman MoL CoP" vs "PDO SP", "OMR" vs "OMR", "Al-Adaa" vs "MoL Portal"). *(Status: Implemented)*
- **FR-031 (Summer Midday Heat Ban):**
  - **Oman Mode:** Flag work stoppage during 12:30–15:00 from June 15 to September 15.
  - **Oman Mode:** Enforce work stoppage during 12:30–15:30 throughout June, July, and August per MD 286/2008, plus PDO TWL < 115 $W/m^2$ mandatory stand-down. *(Status: Implemented)*

### Module 5: Executive Analytics & Dynamic Calculations
- **FR-040 (Live Formula Calculation):** System shall calculate TRIR and LTIFR dynamically using stored incident records and active exposure man-hours:
  $$\text{LTIFR} = \frac{\text{Count of Lost Time Injuries} \times \text{Exposure Basis}}{\text{Total Safe Man-Hours Worked}}$$
  $$\text{TRIR} = \frac{\text{Count of Recordable Incidents} \times \text{Exposure Basis}}{\text{Total Safe Man-Hours Worked}}$$
  Configurable between 1,000,000 hours (GCC/PDO standard) and 200,000 hours (OSHA standard). *(Status: Implemented)*

### Module 6: Safi AI Copilot & AI Governance
- **FR-050 (Server-Side Proxy):** All client AI requests shall route through the server-side proxy (`/api/gemini/generate` or `/api/gemini/chat`) with strict 30-second timeout and API key isolation. *(Status: Implemented)*
- **FR-051 (Human-In-The-Loop AI Markers):** Every AI-generated output (e.g., JSA hazards, draft 5-Whys, incident classification) shall display an explicit AI badge, source citations, confidence indicators, and a mandatory human review/acceptance control before being committed to persistent records. *(Status: Implemented)*

---

## 6. Non-Functional Requirements (NFR)

- **NFR-001 (Performance & Latency):** First Contentful Paint (FCP) $\le 1.2\text{s}$ on 4G connections. P95 API response time for transactional endpoints $\le 150\text{ms}$.
- **NFR-002 (Availability & Reliability):** 99.9% uptime target. Offline PWA capabilities ensuring zero data loss during field network disconnects using IndexedDB queueing.
- **NFR-003 (Security & Least Privilege):** Strict OWASP Top 10 compliance. Multi-tenant isolation. Zero API key leaks in client bundles. CSP headers with strict frame and script sources.
- **NFR-004 (Accessibility & Localization):** WCAG 2.2 Level AA compliance across all primary screens. High-contrast themes for desert outdoor sunlight operations. Full English and Arabic (RTL) localization with native Hijri/Gregorian date switching.
- **NFR-005 (Auditability):** Unalterable, append-only audit trail logging user identity, IP address, exact timestamp, action verb, entity UUID, previous state, and new state.

---

## 7. Requirements Traceability Matrix

| Requirement ID | Module | Implementation Target | Architecture Reference | Test Case ID |
|---|---|---|---|---|
| FR-001 | Incidents | `components/IncidentForm.tsx` | Data Flow §4.1 | TC-INC-001 |
| FR-002 | Statutory | `services/regionalComplianceService.ts` | Regulatory §5.3 | TC-STAT-002 |
| FR-011 | PTW SoD | `components/controlOfWork/ControlOfWorkModule.tsx` | Security §3.2 | TC-PTW-005 |
| FR-021 | CAPA SoD | `components/CAPAModule.tsx` | Security §3.3 | TC-CAPA-003 |
| FR-040 | KPIs | `components/system/ExecutiveDashboard.tsx` | Analytics §2.4 | TC-KPI-001 |
| FR-050 | AI Proxy | `routes/geminiRouter.ts` | AI Architecture §6 | TC-AI-001 |
| FR-051 | HITL AI | `components/ai/AIGovernanceCard.tsx` | AI Governance §6.4 | TC-AI-004 |
