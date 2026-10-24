# AD6.Ai Smart HSE Enterprise Platform — Feature Preservation Register

**Document Version:** 1.0.0  
**Inspection Date:** 2026-10-23  
**Status:** Mandatory Preservation Baseline  

---

## 1. Non-Negotiable Preservation Contract

Under the **Non-Negotiable Preservation Contract**, developers, agents, and architects operating on the AD6.Ai Smart HSE platform are strictly bound to the following directives:
1. **Zero Deletion:** Do not remove, delete, disable, hide, rename, or replace any existing function, feature, component, route, module, export, navigation item, mock dataset, demo workflow, AI fallback, PWA capability, report format, or UI element.
2. **Backward Compatibility:** All storage keys (canonical `ad6_*` and legacy `ad6_enterprise_*`), custom DOM event names (`ad6-*-updated`), role privileges, and export schemas must remain intact during future remediations.
3. **Preservation Over Replacement:** When adding new capabilities (e.g. backend database drivers, real SSO, external API connectors), existing mock, local, and simulated fallback flows MUST remain functional as fallback pathways for demo and offline execution.

---

## 2. Master Feature Register

### 2.1 Incident Management & Statutory Investigations
- **Feature Name:** Incident Management & Statutory Reporting
- **File Paths:**
  - `/components/IncidentForm.tsx` (Main entry form, multi-tab investigation suite)
  - `/components/RootCauseAnalysisTool.tsx` (5-Whys & Ishikawa fishbone)
  - `/components/BowtieAnalysisTool.tsx` (Barrier risk modeling)
  - `/services/enterpriseDataStore.ts` (CRUD, persistence, event dispatching)
  - `/services/demoDataLoader.ts` (`GULF_ENERGY_INCIDENTS` seed data)
  - `/services/gccStatutoryReportingService.ts` (UAE Form G & Oman 24h statutory notices)
- **Route / Nav Entry:** `View.INCIDENTS` (`/incidents`), `View.INCIDENT_MANAGEMENT`
- **Current Data Source:** `EnterpriseDataStore`, `DemoDataLoader.GULF_ENERGY_INCIDENTS`, dual-key storage
- **Storage Type:** Persisted in `localStorage` (`ad6_incidents` & `ad6_enterprise_incidents`); real-time broadcast via WebSocket (`io.emit('incidentUpdate')` in `/server.ts`)
- **Implementation Status:** Functional (client-side persisted + live reactive events)
- **Dependencies:** `lucide-react`, `jspdf`, `jspdf-autotable`, `EnterpriseDataStore`, `UserContext`
- **Known Limitations:** Storage is scoped to the browser local environment; no direct connection to live SQL database.
- **Preservation Strategy:** Maintain dual-key syncing and `ad6-incidents-updated` CustomEvent on all mutations. In backend migration, layer the API service on top of `EnterpriseDataStore` without altering component props or event interfaces.

---

### 2.2 Corrective and Preventive Actions (CAPA)
- **Feature Name:** Central CAPA Action Register
- **File Paths:**
  - `/components/CAPAModule.tsx` (CAPA grid, SLA timer, evidence upload modal, status transitions)
  - `/services/enterpriseDataStore.ts` (`getCapas()`, `saveCapa()`)
  - `/services/demoDataLoader.ts` (`GULF_ENERGY_CAPAS`)
- **Route / Nav Entry:** `View.CAPA`
- **Current Data Source:** `EnterpriseDataStore`, dual-key storage
- **Storage Type:** Persisted in `localStorage` (`ad6_capas` & `ad6_enterprise_capas`)
- **Implementation Status:** Functional with hard Segregation of Duties (Action Owner cannot self-verify action)
- **Dependencies:** `EnterpriseDataStore`, `UserContext`, `AITag`
- **Known Limitations:** Evidence attachment stores base64/object URLs locally.
- **Preservation Strategy:** Retain all status states (`Open`, `In Progress`, `Under Review`, `Closed`, `Overdue`), SLA calculation logic, and SoD validation hooks.

---

### 2.3 Permit to Work (PTW) & Control of Work
- **Feature Name:** Electronic Permit to Work (PTW) & Hazardous Work Authorization
- **File Paths:**
  - `/components/controlOfWork/ControlOfWorkModule.tsx` (PTW tabs, Level 1/2/3 permits, digital sign-off)
  - `/components/PermitForm.tsx` (Permit creation wizard)
  - `/services/simopsService.ts` (Spatial clash detection)
  - `/services/demoDataLoader.ts` (`GULF_ENERGY_PERMITS`)
  - `/services/offlineStorage.ts` (IndexedDB offline caching)
- **Route / Nav Entry:** `View.PERMIT_TO_WORK` (`/control-of-work`), `View.PERMITS`
- **Current Data Source:** `EnterpriseDataStore`, `DemoDataLoader.GULF_ENERGY_PERMITS`, IndexedDB cache
- **Storage Type:** Dual-key `localStorage` (`ad6_permits`, `ad6_enterprise_permits`) + IndexedDB (`offlineStorage`)
- **Implementation Status:** Functional (Level 1/2/3 permit workflows, digital canvas signature, AGT gas testing for LEL/H2S/O2/CO, PDF export)
- **Dependencies:** `simopsService`, `offlineStorage`, `jspdf`, `jspdf-autotable`, `UserContext`
- **Known Limitations:** Digital signature uses canvas base64 rather than hardware cryptographic smartcard token.
- **Preservation Strategy:** Preserve the complete permit lifecycle (`Draft` -> `Pending Review` -> `Authorized` -> `Active` -> `Suspended` -> `Closed`), gas testing fields, and SoD invariants.

---

### 2.4 Lockout / Tagout (LOTO) Zero-Energy Isolations
- **Feature Name:** Digital LOTO Isolation Register
- **File Paths:**
  - `/components/LOTOModule.tsx` (Isolation plans, padlocks, tag numbers, master key lockbox)
  - `/components/controlOfWork/ControlOfWorkModule.tsx` (Integrated LOTO tab)
  - `/routes/predictiveMaintenanceRouter.ts` (Mandatory LOTO trigger validation)
- **Route / Nav Entry:** `View.LOTO`
- **Current Data Source:** `localStorage` (`ad6_loto_isolations`), mock isolation registers
- **Storage Type:** Persisted in `localStorage`
- **Implementation Status:** Functional (Mechanical, electrical, pneumatic zero-energy boundary isolation steps)
- **Dependencies:** `lucide-react`, `UserContext`, `predictiveMaintenanceRouter`
- **Known Limitations:** Physical lockbox synchronization is simulated via digital tag verification.
- **Preservation Strategy:** Maintain isolation type matrices (Electrical, Mechanical, Hydraulic, Pneumatic) and mandatory linking to active permits.

---

### 2.5 SIMOPS De-Confliction Engine
- **Feature Name:** Simultaneous Operations (SIMOPS) Spatial Collision Detection
- **File Paths:**
  - `/services/simopsService.ts` (Haversine formula, 50m conflict radius, hazard clash matrix)
  - `/components/controlOfWork/SimopsClashModal.tsx` (Interactive collision warning and mitigation modal)
  - `/components/GISMapModule.tsx` (Spatial visualization of overlapping permit zones)
- **Route / Nav Entry:** `View.ADNOC_OSHAD` (SIMOPS Matrix), integrated into `ControlOfWorkModule.tsx`
- **Current Data Source:** Active permit locations and coordinates from `EnterpriseDataStore`
- **Storage Type:** Computed dynamically in-memory from stored permits
- **Implementation Status:** Functional mathematical algorithm
- **Dependencies:** `simopsService.ts`, `GISMapModule.tsx`
- **Known Limitations:** Computes planar/haversine 2D radius; elevation/vertical clash is simulated.
- **Preservation Strategy:** Retain the full hazard combination rules matrix (Hot Work + Confined Space, Heavy Lift + High Voltage, Excavation + Gas Processing).

---

### 2.6 Audits Management
- **Feature Name:** Comprehensive Audit Planning & Execution
- **File Paths:**
  - `/components/AuditModule.tsx` (Main audit portal)
  - `/components/audit/AuditDashboard.tsx`, `/components/audit/AuditExecution.tsx`
  - `/components/audit/AuditFindings.tsx`, `/components/audit/AuditPlanner.tsx`
  - `/components/audit/AuditReports.tsx`, `/components/audit/ChecklistEngine.tsx`
  - `/components/audit/AuditMockData.ts` (ISO 45001, OSHAD-SF, ADNOC protocols)
- **Route / Nav Entry:** `View.AUDITS`, `View.SAFETY_AUDIT`
- **Current Data Source:** `AuditMockData.ts`, `localStorage`
- **Storage Type:** In-memory with `localStorage` persistence
- **Implementation Status:** Functional (Audit schedules, finding severity grading, non-conformance logging)
- **Dependencies:** `lucide-react`, `AuditTypes.ts`, `AuditMockData.ts`
- **Known Limitations:** External auditor portal authentication is currently integrated into the single tenant space.
- **Preservation Strategy:** Retain ISO 45001 / OSHAD-SF / ADNOC audit protocols, finding severity grading, and checklist engines.

---

### 2.7 Field Safety Inspections & Mobile PWA
- **Feature Name:** Field Safety Inspections & Offline Checklists
- **File Paths:**
  - `/components/InspectionModule.tsx` (Desktop inspection register)
  - `/components/pwa/MobileInspectionApp.tsx` (Mobile touch-friendly field inspection UI)
  - `/components/pwa/InspectionChecklist.tsx`, `/components/pwa/InspectionDetail.tsx`
  - `/services/offlineStorage.ts` (IndexedDB storage)
- **Route / Nav Entry:** `View.INSPECTIONS`, `View.PWA_INSPECTIONS`, `View.VISUAL_INSPECTION`
- **Current Data Source:** IndexedDB (`offlineStorage`), `localStorage`, mock inspection checklists
- **Storage Type:** IndexedDB + `localStorage`
- **Implementation Status:** Functional (Offline-first inspection execution, photo attachments, scoring, sync queue)
- **Dependencies:** `idb`, `lucide-react`, `usePWAInstall`
- **Known Limitations:** Device camera uses browser standard `MediaDevices` / `<input type="file" capture>`; fallback handles desktop uploads.
- **Preservation Strategy:** Preserve offline queue schema and IndexedDB storage interfaces.

---

### 2.8 Safety Observations & Behavioral Safety
- **Feature Name:** Safety Observations & Stop Work Authority (SWA)
- **File Paths:**
  - `/components/SafetyObservationForm.tsx` (Positive vs Improvement report capture)
  - `/contexts/UserContext.tsx` (`allObservations`, `addObservation`)
  - `/services/authService.ts` (`SecureStorage`)
- **Route / Nav Entry:** `View.OBSERVATIONS`, `View.WORKFORCE_SAFETY`
- **Current Data Source:** `localStorage` (`hse_observations`), mock seed observations in `UserContext.tsx`
- **Storage Type:** Persisted in `localStorage`
- **Implementation Status:** Functional (Anonymous option, location tagging, photo upload, safety score calculation)
- **Dependencies:** `UserContext`, `lucide-react`
- **Known Limitations:** Storage is scoped to browser storage.
- **Preservation Strategy:** Retain positive/improvement taxonomy, anonymous submission toggle, and user safety score gamification.

---

### 2.9 Contractor Safety Portal & Onboarding
- **Feature Name:** Contractor Prequalification & Safety Passport
- **File Paths:**
  - `/components/ContractorPortal.tsx`, `/components/contractors/ContractorPortal.tsx`
  - `/components/contractors/ContractorOnboarding.tsx`
  - `/services/contractorCore.ts` (Contractor tiering, prequalification formulas, safety passport verification)
- **Route / Nav Entry:** `View.CONTRACTOR_PORTAL`, `View.CONTRACTORS`
- **Current Data Source:** `contractorCore.ts` mock contractor roster (Consolidated Contractors, Petrofac, Lamprell)
- **Storage Type:** In-memory with `localStorage` state
- **Implementation Status:** Functional (Prequalification scoring, safety passport checks, induction logs)
- **Dependencies:** `contractorCore.ts`, `lucide-react`
- **Known Limitations:** Contractor external file uploads are simulated in client memory.
- **Preservation Strategy:** Keep contractor risk tiering algorithms (Tier 1 High Risk, Tier 2 Medium, Tier 3 Low) and safety passport expiration validation.

---

### 2.10 Training, Competency & Certifications
- **Feature Name:** Employee HSE Training Matrix & Certification Tracker
- **File Paths:**
  - `/components/TrainingModule.tsx` (Matrix view, upcoming sessions, course catalog)
  - `/components/regulatory/EmployeeCertificationTracker.tsx` (Passport credentials, 30/60/90-day expiry)
  - `/contexts/UserContext.tsx` (`UserProfile.certifications`)
- **Route / Nav Entry:** `View.TRAINING`, `View.TRAINING_COMPETENCY`
- **Current Data Source:** `UserProfile` models in `UserContext.tsx` & `demoDataLoader.ts`
- **Storage Type:** Persisted via `UserContext` and `localStorage`
- **Implementation Status:** Functional (OPITO, H2S Awareness, First Aid, Confined Space certification tracking)
- **Dependencies:** `UserContext`, `lucide-react`
- **Known Limitations:** LMS SCORM integration is not connected; completion records are managed internally.
- **Preservation Strategy:** Maintain certification expiry countdown logic, alert threshold badges, and mandatory competency gates for PTW roles.

---

### 2.11 Environmental Management & ESG Carbon Accounting
- **Feature Name:** Environmental Sustainability, Waste Management & Scope 1-3 Carbon Accounting
- **File Paths:**
  - `/components/EnvironmentalModule.tsx` (Spill management, water effluent, waste manifest)
  - `/components/CarbonAccountingModule.tsx` (Scope 1 direct flaring, Scope 2 electricity, Scope 3 supply chain)
  - `/services/esgDataStore.ts`, `/services/esgReportingService.ts`
  - `/services/esgEmissionFactors.ts`, `/services/esgValidationService.ts`
  - `/types/esg.ts`
- **Route / Nav Entry:** `View.ENVIRONMENTAL`, `View.ESG`
- **Current Data Source:** `esgDataStore.ts`, `localStorage` (`ad6_esg_metrics`)
- **Storage Type:** Persisted in `localStorage`
- **Implementation Status:** Functional (GHG Protocol compliant carbon calculations, flaring emissions, water consumption benchmarks)
- **Dependencies:** `recharts`, `esgDataStore`, `types/esg.ts`
- **Known Limitations:** Direct IoT utility meter ingestion is simulated through synthetic baseline feeds.
- **Preservation Strategy:** Keep GHG emission conversion factors, flaring volume calculations, and environmental statutory export templates.

---

### 2.12 Document Management System (DMS)
- **Feature Name:** Controlled HSE Document Register & Policies
- **File Paths:**
  - `/components/DMSModule.tsx` (Document tree, version tracking, approval workflow, OSHAD manuals)
- **Route / Nav Entry:** `View.DMS`
- **Current Data Source:** In-memory repository with `localStorage` overrides
- **Storage Type:** In-memory / `localStorage`
- **Implementation Status:** Functional (Controlled document lifecycle: Draft -> Review -> Approved -> Superseded)
- **Dependencies:** `lucide-react`, `AITag`
- **Known Limitations:** PDF viewing uses embedded mock previews rather than deep cloud PDF rendering.
- **Preservation Strategy:** Preserve document category hierarchy (Policies, CoPs, RAMS, SOPs, Forms) and version revision tagging.

---

### 2.13 AI Safety Copilot (Safi)
- **Feature Name:** Grounded Enterprise AI Copilot & Voice Assistant
- **File Paths:**
  - `/components/ai/AICopilotDrawer.tsx` (Sliding chat drawer, audio transcription, grounding citations)
  - `/components/ai/ComplianceAssistant.tsx` (Full-page AI regulatory advisor)
  - `/components/ai/AIGovernanceCard.tsx` (Human-in-the-Loop review and approval card)
  - `/components/ChatBot.tsx` (Floating chatbot trigger)
  - `/routes/geminiRouter.ts` (Express server proxy `/api/gemini/chat`, `/api/gemini/generate`, `/api/gemini/transcribe`, `/api/gemini/maps-grounding`, `/api/gemini/search-grounding`)
  - `/hooks/useAudioRecorder.ts` (Microphone recording & base64 conversion)
- **Route / Nav Entry:** Global Header "AI Copilot" button, `View.COMPLIANCE_ASSISTANT` (`/ai-assistant`)
- **Current Data Source:** Server-side proxy calling Google Gen AI SDK (`@google/genai`)
- **Storage Type:** In-memory conversation state + server audit logging
- **Implementation Status:** Functional with graceful fallback (returns informative status if `GEMINI_API_KEY` is omitted)
- **Dependencies:** `@google/genai`, `lucide-react`, `AIGovernanceCard`, `useAudioRecorder`
- **Known Limitations:** Live streaming requires active API key; multi-model fallback chain provides resilience.
- **Preservation Strategy:** Strictly retain server-side proxy boundary (never expose API key to client), role prompts (hse_advisor, rca_expert, process_safety, site_supervisor, executive_analyst), and `AIGovernanceCard` HITL controls.

---

### 2.14 Retrieval-Augmented Generation (RAG) Regulatory Engine
- **Feature Name:** Cross-Border Regulatory Knowledge Retrieval
- **File Paths:**
  - `/services/ragOrchestrator.ts` (Hybrid vector/keyword similarity search)
  - `/services/ragDataPipeline.ts` (Codified chunks of OSHAD-SF, UAE Labor Law, Oman RD 53/2023, PDO SP-1143)
  - `/services/regulatoryIntelligenceService.ts` (Live regulatory bulletins)
  - `/components/regulatory/LiveRegulatoryNoticeBoard.tsx`
- **Route / Nav Entry:** `View.COMPLIANCE_INTELLIGENCE`, embedded in `ComplianceAssistant.tsx`
- **Current Data Source:** In-memory codified statutory knowledge base
- **Storage Type:** In-memory vector chunk store
- **Implementation Status:** Functional (Cosine similarity calculation and statutory citation injection)
- **Dependencies:** `ragDataPipeline.ts`, `ragOrchestrator.ts`
- **Known Limitations:** Static pre-compiled vector chunks; external web scraping is handled via server Google Search grounding.
- **Preservation Strategy:** Maintain UAE and Oman statutory corpus chunks and cross-border citation formatting.

---

### 2.15 Predictive Safety & SIF Precursor Modeling
- **Feature Name:** SIF Precursor Prediction & Safety Analytics
- **File Paths:**
  - `/components/PredictiveSafetyView.tsx` (Heinrich pyramid ratio, SIF precursor scoring, leading indicators)
  - `/components/PredictiveRiskDashboard.tsx` (Heat stress and operational risk heatmaps)
  - `/services/enterpriseDataStore.ts` (Calculates live stats from stored incidents)
- **Route / Nav Entry:** `View.PREDICTIVE_SAFETY` (`/predictive-safety`), `View.PREDICTIVE_RISK`
- **Current Data Source:** `EnterpriseDataStore` incident data
- **Storage Type:** Computed dynamically from stored incidents
- **Implementation Status:** Functional (Zero hardcoded values; recalculates dynamically on incident mutations)
- **Dependencies:** `recharts`, `enterpriseDataStore.ts`
- **Known Limitations:** Machine learning inference is calculated using mathematical forward modeling rather than an external Python ML service.
- **Preservation Strategy:** Retain SIF classification rules (High-Energy Contact, Fall from Height, Toxic Gas, Mobile Plant Collision) and 12-month rolling trends.

---

### 2.16 Predictive Maintenance & Asset Integrity Validation
- **Feature Name:** Industrial Machinery IoT Telemetry & ISO 10816 Validation
- **File Paths:**
  - `/components/PredictiveMaintenanceModule.tsx` (Live asset telemetry, sensor gauges, maintenance scheduling)
  - `/components/PredictiveMaintenanceLog.tsx` (Audit log of equipment inspections and certifications)
  - `/routes/predictiveMaintenanceRouter.ts` (Server endpoints `/api/predictive-maintenance/*`)
  - `/services/predictiveMaintenanceValidation.ts` (Client validation mirrors)
- **Route / Nav Entry:** `View.MAINTENANCE`
- **Current Data Source:** API-backed server validation + `UserContext.tsx` equipment state (`MOCK_EQUIPMENT`)
- **Storage Type:** Hybrid API-validated and `localStorage` persisted
- **Implementation Status:** Fully Functional API-backed module (ISO 10816-3 vibration limits, API 670 temperature limits, mandatory LOTO flags)
- **Dependencies:** `predictiveMaintenanceRouter.ts`, `UserContext`, `lucide-react`
- **Known Limitations:** Sensor telemetry is simulated at runtime via randomized industrial jitter around realistic baselines.
- **Preservation Strategy:** Preserve all codified ISO and HSE threshold constants, work order SLA calculation, and mandatory LOTO trip rules.

---

### 2.17 GIS Interactive Concession Map
- **Feature Name:** Geospatial HSE Concession Mapping & Asset Geofencing
- **File Paths:**
  - `/components/GISMapModule.tsx` (Interactive Leaflet map, layer toggles, permit clusters, hazard heatmaps)
- **Route / Nav Entry:** `View.GIS_MAP`
- **Current Data Source:** Real coordinates for Ruwais, Fahud, Mina Zayed, and Ras Al-Khair concessions from `TenantContext.tsx` and `demoDataLoader.ts`
- **Storage Type:** In-memory with reactive updates from `EnterpriseDataStore`
- **Implementation Status:** Functional (Interactive pan/zoom, layer filtering, SIMOPS permit radius circles, heat stress weather overlays)
- **Dependencies:** `leaflet`, `react-leaflet`, `leaflet.heat`, `lucide-react`
- **Known Limitations:** Offline tile caching requires pre-downloaded map tiles; defaults to OpenStreetMap with robust offline fallback container.
- **Preservation Strategy:** Preserve concession coordinates, SIMOPS permit radius overlays, and heatmap intensity calculation.

---

### 2.18 Digital Twin 2D/3D Operational Viewer
- **Feature Name:** Industrial Facility Digital Twin & Real-Time Sensor Overlay
- **File Paths:**
  - `/components/DigitalTwinViewer.tsx` (Interactive SVG/Canvas schematic of gas processing plant & refinery)
- **Route / Nav Entry:** `View.DIGITAL_TWIN`
- **Current Data Source:** Live telemetry feeds from equipment state in `UserContext.tsx`
- **Storage Type:** In-memory
- **Implementation Status:** Functional (Interactive node inspection, temperature/vibration/pressure hotspots, alarm flashing)
- **Dependencies:** `lucide-react`, `framer-motion`
- **Known Limitations:** Rendered using vector SVG and Canvas layers rather than a WebGL Three.js model.
- **Preservation Strategy:** Maintain process schematic layout (Separators, Compressors, Flare Headers, Substations) and live hotspot bindings.

---

### 2.19 Connected Worker & Biometric Telemetry
- **Feature Name:** Wearable IoT Biometric Monitoring & Heat Strain Prevention
- **File Paths:**
  - `/components/ConnectedWorkerDashboard.tsx` (Worker roster, heart rate, skin temp, core heat strain index, fall detection, panic alerts)
- **Route / Nav Entry:** `View.CONNECTED_WORKER`
- **Current Data Source:** In-memory simulated wearable IoT streams
- **Storage Type:** In-memory
- **Implementation Status:** Functional (WBGT / TWL work-rest schedule calculations, threshold breaches, emergency muster call)
- **Dependencies:** `recharts`, `lucide-react`, `framer-motion`
- **Known Limitations:** Bluetooth LE wearable gateway is simulated; real smartwatch Web Bluetooth API is documented for future phase.
- **Preservation Strategy:** Keep physiological strain index (PSI) calculation, heat alert triggers, and emergency alert broadcasts.

---

### 2.20 PWA / Offline Sync Engine
- **Feature Name:** Progressive Web App (PWA) Offline-First Architecture
- **File Paths:**
  - `/components/pwa/OfflineBanner.tsx` (Top sticky connectivity status banner)
  - `/components/pwa/MobileBottomNav.tsx` (Thumb-accessible field navigation)
  - `/components/pwa/PWAInstallButton.tsx` (`beforeinstallprompt` event handler)
  - `/components/pwa/SyncStatusBar.tsx` (Pending sync count indicator)
  - `/components/pwa/ConflictResolver.tsx` (Two-way data collision resolution)
  - `/services/offlineStorage.ts` (IndexedDB stores)
  - `/services/syncEngine.ts` (Background replay queue)
  - `/public/manifest.json`, `/public/sw.js`
- **Route / Nav Entry:** Rendered globally in `components/App.tsx`
- **Current Data Source:** IndexedDB (`idb`) and `navigator.onLine`
- **Storage Type:** IndexedDB
- **Implementation Status:** Functional (Service worker caching enabled in production builds; gracefully bypassed in AI Studio preview to prevent stale dev caching)
- **Dependencies:** `idb`, `usePWAInstall.ts`, `lucide-react`
- **Known Limitations:** Background Sync API is supported only on Chromium-based browsers; fallback manual sync button handles iOS Safari.
- **Preservation Strategy:** Keep `OfflineBanner`, `MobileBottomNav`, `offlineStorage.ts` schema, and `SyncStatusBar` intact across all shell views.

---

### 2.21 Bilingual Localization & RTL (Arabic / English)
- **Feature Name:** Native Arabic & English Localization with Dual Calendars
- **File Paths:**
  - `/contexts/LanguageContext.tsx` (Language state, `dir="rtl"` / `dir="ltr"` DOM switching)
  - `/components/ArabicComponentsModule.tsx` (Arabic showcase)
  - `/components/HijriDatePicker.tsx`, `/components/DualCalendarComponent.tsx` (Umm al-Qura Hijri calendar engine)
  - `/services/arabicNLPUtils.ts` (Arabic text normalization, root extraction)
  - `/src/i18n/config.ts` (Translation key dictionaries)
- **Route / Nav Entry:** Global Header Language Switcher (EN / AR)
- **Current Data Source:** Built-in translation dictionaries in `/src/i18n/config.ts`
- **Storage Type:** Persisted in `localStorage` (`ad6_language`)
- **Implementation Status:** Functional (Full UI RTL mirroring, typography switching to Dubai/Arabic fonts, Hijri/Gregorian dual date conversion)
- **Dependencies:** `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- **Known Limitations:** Advanced Arabic NLP sentiment analysis uses lightweight client heuristics when offline.
- **Preservation Strategy:** Preserve bidirectional CSS layouts, all translation dictionary keys, and `HijriDatePicker` algorithms.

---

### 2.22 Executive BI Dashboards & Statutory KPI Reporting
- **Feature Name:** Executive Command Center & Automated Statutory Reporting
- **File Paths:**
  - `/components/Dashboard.tsx` (Operational dashboard)
  - `/components/ComplianceDashboard.tsx` (Statutory compliance status)
  - `/components/system/ExecutiveDashboard.tsx` (C-Suite & Board directorate KPIs: TRIR, LTIFR, 12M trends)
  - `/components/AdnocOshadDashboard.tsx` (ADNOC CoP & OSHAD compliance scorecard)
- **Route / Nav Entry:** `View.DASHBOARD`, `View.EXECUTIVE_DASHBOARD`, `View.EXECUTIVE_COMMAND_CENTER`
- **Current Data Source:** Dynamic mathematical aggregation of `EnterpriseDataStore` incidents and safe hours
- **Storage Type:** In-memory aggregation of persisted records
- **Implementation Status:** Functional (Zero hardcoded values; OSHA 1904 / OSHAD-SF compliant TRIR & LTIFR formulas)
- **Dependencies:** `recharts`, `enterpriseDataStore.ts`, `lucide-react`
- **Known Limitations:** Historical data beyond the seeded period is calculated based on entered records.
- **Preservation Strategy:** Strictly retain formula calculations:
  - `TRIR = (Total Recordable Injuries * 200,000) / Total Man-Hours`
  - `LTIFR = (Lost Time Injuries * 1,000,000) / Total Man-Hours`

---

### 2.23 Statutory Report Generators & Document Exports
- **Feature Name:** PDF, CSV & Excel Statutory Export Engine
- **File Paths:**
  - `/services/ReportEngine.ts` (Executive PDF reports)
  - `/services/ProcurementExport.ts` (Procurement and tender safety compliance dossiers)
  - `/services/oshadReportGenerator.ts` (Abu Dhabi OSHAD Form G & quarterly performance returns)
  - `/services/gccStatutoryReportingService.ts` (Oman Ministry of Labour & Civil Defence notifications)
- **Route / Nav Entry:** Triggered via "Export Report" / "Download PDF" buttons across all modules
- **Current Data Source:** Live application data stores
- **Storage Type:** Ephemeral client-side generation
- **Implementation Status:** Functional (High-fidelity vector PDF generation with auto-table formatting and corporate headers)
- **Dependencies:** `jspdf`, `jspdf-autotable`
- **Known Limitations:** Complex multi-page charts render as table data summaries in exported PDFs.
- **Preservation Strategy:** Retain all statutory template layouts (UAE Form G, Form E, Oman MD 286/2008 format).

---

### 2.24 Multi-Jurisdiction Regulatory Governance
- **Feature Name:** Cross-Border Regulatory Governance (UAE, Oman, Combined)
- **File Paths:**
  - `/contexts/RegionalComplianceContext.tsx` (Global multi-jurisdiction context)
  - `/components/regulatory/JurisdictionSelectorDropdown.tsx` (Header dropdown selector)
  - `/components/regulatory/RegionalConfigConfirmDialog.tsx` (Admin confirmation dialog with audit reason)
  - `/components/system/GovernanceModule.tsx` (Governance rules matrix)
  - `/services/regionalComplianceService.ts` (Statutory validation rules)
  - `/server.ts` (`/api/admin/regional-compliance`)
- **Route / Nav Entry:** Header dropdown (`JurisdictionSelectorDropdown`), `View.GOVERNANCE`
- **Current Data Source:** Server-side API store synchronized with React context and `localStorage`
- **Storage Type:** API-backed + `localStorage`
- **Implementation Status:** Functional (Switching jurisdictions instantly adapts active legal frameworks, heat stress rest rules, and currency symbols across all modules)
- **Dependencies:** `RegionalComplianceContext`, `server.ts`
- **Known Limitations:** Changing mode requires ADMIN role; client prompts for change reason.
- **Preservation Strategy:** Keep the 3 modes (`UAE`, `OMAN`, `COMBINED`) and all legal citations (OSHAD-SF v3.1, Oman RD 53/2023, PDO SP-1143, PDO SP-1170).

---

### 2.25 Identity & Access Management (IAM) & Role-Based Access Control (RBAC)
- **Feature Name:** Enterprise IAM & Fine-Grained Permission Matrix
- **File Paths:**
  - `/components/system/IAMModule.tsx` (User list, role assignment, permission grant/deny editor, suspension toggle)
  - `/services/permissionService.ts` (18 roles, 60+ permissions, navigation generator)
  - `/services/userProfileService.ts` (Profile CRUD, live stats)
  - `/contexts/UserContext.tsx`
  - `/server.ts` (`/api/auth/verify-access`)
- **Route / Nav Entry:** `View.IAM`
- **Current Data Source:** `services/userProfileService.ts`, `localStorage` (`hse_user_profiles`)
- **Storage Type:** Persisted in `localStorage`
- **Implementation Status:** Functional (Granular permission grants, explicit permission denials, account suspension, multi-role assignment)
- **Dependencies:** `permissionService.ts`, `userProfileService.ts`, `UserContext`
- **Known Limitations:** User passwords are not stored locally; authentication relies on simulated token or Firebase SSO.
- **Preservation Strategy:** Strictly preserve all 18 `UserRole` enums, all `PERMISSIONS` constants, and `buildAuthorizedNavigation()` filtering logic.

---

### 2.26 System Audit Logs & Tamper-Evident Trail
- **Feature Name:** Immutable Audit Logging & System Event Monitor
- **File Paths:**
  - `/components/system/SystemLogsModule.tsx` (System logs viewer, filter by user/operation, export)
  - `/services/audit.js`, `/services/auditLogger.ts`
  - `/services/immutableAuditLogger.ts` (SHA-256 block hash chaining)
  - `/services/unifiedAuditTrailService.ts`
  - `/server.ts` (`/api/audit-log`, `/api/audit/trail`)
- **Route / Nav Entry:** `View.SYSTEM_LOGS`
- **Current Data Source:** Server in-memory ring buffer (500 items) + Cloud Logging adapter + client-side audit store
- **Storage Type:** Server in-memory + optional Google Cloud Logging
- **Implementation Status:** Functional (Tamper-evident hash chain simulation, security violation logging, CSV export)
- **Dependencies:** `audit.js`, `server.ts`, `SystemLogsModule.tsx`
- **Known Limitations:** In-memory server ring buffer resets on cold container restart if Cloud Logging is disabled.
- **Preservation Strategy:** Retain audit event schemas (timestamp, userId, operation, payload, previousHash, hash) and API endpoints.

---

### 2.27 Demo Mode & Fictional Concession Sandbox
- **Feature Name:** Interactive Demo Sandbox & Synthetic Concession Environment
- **File Paths:**
  - `/components/LoginPage.tsx` (Distinct Demo Sandbox card & launch button)
  - `/components/App.tsx` (Sticky amber DEMO MODE banner with Exit button)
  - `/components/GuestDemoModule.tsx` (Standalone walkthrough module)
  - `/contexts/UserContext.tsx` (`loginDemo`, `isDemoMode`, `logout`)
  - `/services/authService.ts` (`loginDemo`, `isDemoSession`)
  - `/services/demoDataLoader.ts` (Synthetic dataset)
- **Route / Nav Entry:** Login Page "Launch Demo Sandbox" button
- **Current Data Source:** `demoDataLoader.ts`, `hse_is_demo_mode` in `localStorage`
- **Storage Type:** Persisted in `localStorage` (`hse_is_demo_mode`)
- **Implementation Status:** Functional (Explicit activation, assigns non-admin Worker persona, labels synthetic nature prominently, zero unauthenticated admin access)
- **Dependencies:** `authService.ts`, `UserContext.tsx`, `demoDataLoader.ts`
- **Known Limitations:** Data reset requires clearing browser storage or clicking "Reset Demo Data" in demo settings.
- **Preservation Strategy:** Never revert to automatic admin fallback; preserve explicit demo button, sticky amber banner, and clean logout reset.

---

### 2.28 Role Switcher & Persona Simulation
- **Feature Name:** Fast Role Switcher & Sales Pitch Personas
- **File Paths:**
  - `/components/RoleSwitcher.tsx` (Floating bottom-left role switcher)
  - `/components/EnterpriseGlobalHeader.tsx` (`PITCH_PERSONAS` dropdown menu)
  - `/contexts/UserContext.tsx` (`switchUser`)
- **Route / Nav Entry:** Header Persona Dropdown (Active in Demo Mode)
- **Current Data Source:** `MOCK_USERS` and `PITCH_PERSONAS` in `EnterpriseGlobalHeader.tsx`
- **Storage Type:** Client runtime state
- **Implementation Status:** Functional (Strictly guarded by `if (!isDemoMode) return;` to prevent unauthorized role escalation in production)
- **Dependencies:** `UserContext`, `EnterpriseGlobalHeader.tsx`
- **Known Limitations:** Enabled exclusively when `isDemoMode === true`.
- **Preservation Strategy:** Preserve the 5 core pitch personas (Frontline Worker, Permit Issuer / Supervisor, Site HSE Officer, Site HSE Manager, Regional HSE Director) and demo mode guard.

---

### 2.29 Multi-Tenant & Multi-Site Selection
- **Feature Name:** Enterprise Multi-Tenant & Operational Concession Switcher
- **File Paths:**
  - `/contexts/TenantContext.tsx` (Tenant & site state management)
  - `/components/EnterpriseGlobalHeader.tsx` (Tenant & site dropdown selectors)
  - `/services/demoDataLoader.ts` (`GULF_ENERGY_TENANT`, `GULF_ENERGY_SITES`)
- **Route / Nav Entry:** Global Header Tenant & Site Dropdowns
- **Current Data Source:** `localStorage` (`ad6_current_tenant_id`, `ad6_current_site_id`), `demoDataLoader.ts`
- **Storage Type:** Persisted in `localStorage`
- **Implementation Status:** Functional (Switching site updates live weather, heat stress index, active permit counts, and concession boundary layers)
- **Dependencies:** `TenantContext.tsx`, `EnterpriseGlobalHeader.tsx`
- **Known Limitations:** Multi-tenancy operates via client context isolation; cross-tenant backend database isolation is specified in `/enterprise-architecture/01_Database_Schema_RLS.prisma`.
- **Preservation Strategy:** Retain the 3 flagship sites (Fahud-West OMN-FHD-02, Al-Ruwais Polyolefin UAE-RUW-03, Ras Al-Khair KSA-RAK-01) and reactive change listeners.

---

### 2.30 Job Safety Analysis (JSA) & Risk Assessment (RAMS)
- **Feature Name:** Job Safety Analysis (JSA) & RAMS Method Statement Engine
- **File Paths:**
  - `/components/JSAModule.tsx` (Step-by-step task breakdown, hazard identification, control assignment)
  - `/components/RAMSModule.tsx` (Risk Assessment & Method Statement lifecycle, high-risk work approval)
- **Route / Nav Entry:** `View.JSA`, `View.RAMS`
- **Current Data Source:** In-memory templates with `localStorage` persistence
- **Storage Type:** In-memory / `localStorage`
- **Implementation Status:** Functional (5x5 risk matrix, residual risk calculation, mandatory PPE assignment)
- **Dependencies:** `lucide-react`, `AITag`
- **Known Limitations:** Method statements are generated via templated schemas; AI generation is available via Safi Copilot.
- **Preservation Strategy:** Retain risk scoring formulas (Likelihood x Severity) and RAMS sign-off gates.

---

### 2.31 Digital Forms & OSHAD Workflow Designer
- **Feature Name:** Drag-and-Drop Digital Forms & OSHAD Mechanism Designer
- **File Paths:**
  - `/components/DigitalFormsBuilderModule.tsx` (Form designer with field canvas)
  - `/components/oshad/OshadWorkflowDesigner.tsx` (OSHAD Mechanism 1 to 11 enforcement workflow builder)
- **Route / Nav Entry:** `View.FORMS_BUILDER`
- **Current Data Source:** In-memory form schemas with `localStorage` export
- **Storage Type:** In-memory / `localStorage`
- **Implementation Status:** Functional (Custom form builder with text, number, select, date, signature, and photo fields)
- **Dependencies:** `lucide-react`, `framer-motion`
- **Known Limitations:** Form response aggregation is scoped to the client session.
- **Preservation Strategy:** Retain the OSHAD Mechanism 1-11 workflow sequence and form field types.

---

### 2.32 Management of Change (MOC) & Regulatory Compliance Register (ComplyFlow)
- **Feature Name:** MOC Risk Governance & ComplyFlow Statutory Register
- **File Paths:**
  - `/components/MOCModule.tsx` (Permanent/temporary process modifications, pre-commissioning safety review)
  - `/components/ComplyFlowModule.tsx` (Legal compliance obligations register, UAE & Oman statutory cross-reference)
- **Route / Nav Entry:** `View.MOC`, `View.COMPLY_FLOW`
- **Current Data Source:** In-memory registers with `localStorage` backing
- **Storage Type:** In-memory / `localStorage`
- **Implementation Status:** Functional (MOC risk assessment, technical authority sign-offs, statutory audit trail)
- **Dependencies:** `lucide-react`, `AITag`
- **Known Limitations:** Third-party regulatory scraping is executed through the Gemini Search Grounding endpoint.
- **Preservation Strategy:** Maintain MOC hazard review stages (PSSR, Hazop trigger, Environmental impact) and compliance obligation tracker.
