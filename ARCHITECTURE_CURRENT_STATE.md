# AD6.Ai Smart HSE Enterprise Platform — Architecture Current State Assessment

**Inspection Timestamp:** 2026-10-23T10:30:00Z  
**Application Identity:** AD6.Ai Smart HSE Enterprise Platform  
**Target Environment:** Node.js 20.6+ / Node 22, Express 5 Gateway, Vite 6 React 19 SPA, Google AI Studio Sandbox / Cloud Run Container  
**Assessed By:** Principal Software Quality Architect & Full-Stack Systems Engineer  

---

## Executive Summary & Inspection Methodology

This document details the exact, verified technical reality of the **AD6.Ai Smart HSE Enterprise Platform** codebase. Every claim in this specification is categorized using strict evidence criteria:
- **Verified Facts:** Directly confirmed by inspection of functional source code with exact file paths and line numbers.
- **Partially Verified Items:** Partial runtime code or client-side simulation present without persistent infrastructure backing.
- **Unverified Items:** Architectural specifications, reference SQL schemas, or Prisma definitions stored as documentation or blueprints without active runtime database drivers.
- **Missing Capabilities:** Enterprise or statutory features that are either mocked, bypassed, or absent.

### Comprehensive Audit Log of Files Read
1. `/package.json` — Project manifests, scripts, dependencies, devDependencies.
2. `/package-lock.json` — Exact lockfile dependency tree.
3. `/server.ts` — Express 5 gateway, WebSocket server, dynamic port binding, security headers, in-memory routes.
4. `/routes/geminiRouter.ts` — Server-side Gemini AI proxy, prompt engineering, audio transcription, Google Maps/Search grounding.
5. `/routes/healthz.ts` — Cloud Run container probe route.
6. `/routes/predictiveMaintenanceRouter.ts` — Industrial asset integrity and sensor telemetry validation (ISO 10816, API 670).
7. `/contexts/UserContext.tsx` — Client-side user session, mock user registry, role privileges state, explicit demo mode initializer.
8. `/contexts/LanguageContext.tsx` — English / Arabic bilingual state, RTL text direction binding.
9. `/contexts/RegionalComplianceContext.tsx` — Multi-jurisdiction state (Oman, Oman, Combined), statutory framework switches.
10. `/contexts/TenantContext.tsx` — Multi-tenant organization and multi-site concession switcher.
11. `/services/authService.ts` — Authentication simulation, dummy JWT generator, explicit demo login, Firebase popup integration.
12. `/lib/firebase.ts` — Firebase App, Auth, and Firestore client initialization.
13. `/firebase-applet-config.json` — Firebase client configuration credentials.
14. `/services/enterpriseDataStore.ts` — Central reactive client storage, localStorage dual-key syncing, seed data loader.
15. `/services/demoDataLoader.ts` — Single source of truth for synthetic GCC enterprise data (incidents, permits, CAPAs, users, sites).
16. `/services/simopsService.ts` — Haversine spatial clash detection and simultaneous operations conflict engine.
17. `/services/permissionService.ts` — RBAC engine, 18 UserRoles, 60+ granular permissions, navigation hierarchy builder.
18. `/services/userProfileService.ts` — User profile retrieval, stats calculation, and persistence.
19. `/services/regionalComplianceService.ts` — Oman / Oman statutory compliance rules engine and audit service.
20. `/services/esgDataStore.ts` & `/services/esgReportingService.ts` — GHG Protocol Scope 1-3 carbon accounting and environmental reporting.
21. `/services/offlineStorage.ts` & `/services/syncEngine.ts` — IndexedDB caching, offline queue, background replay.
22. `/services/audit.js` & `/services/auditLogger.ts` — Structured audit ledger ring-buffer and Google Cloud Logging adapter.
23. `/types.ts` — System domain models, UserRole, View enum, and HSE metric schemas.
24. `/.env.example` — Environment variable schema and template.
25. `/index.tsx` — React 19 root mount, context providers, PWA service worker lifecycle.
26. `/components/App.tsx` — Shell component, view switching, desktop statutory status bar, mobile bottom navigation, DEMO MODE banner.
27. `/components/LoginPage.tsx` — Work email login, Google SSO, and explicit Demo Sandbox access.
28. `/components/SignUpPage.tsx` — Registration workflow.
29. `/components/Sidebar.tsx` — Context-aware permission-filtered navigation sidebar.
30. `/components/EnterpriseGlobalHeader.tsx` — Master global header, multi-tenant & site switchers, persona simulator.
31. `/components/regulatory/JurisdictionSelectorDropdown.tsx` — Dedicated keyboard-accessible header jurisdiction switcher.
32. `/components/controlOfWork/ControlOfWorkModule.tsx` — Permit to Work (PTW) workflow, LOTO, digital signatures, gas testing.
33. `/components/CAPAModule.tsx` — Central Corrective & Preventive Action register.
34. `/components/IncidentForm.tsx` — Incident reporting, 5-Whys, Fishbone, Form G, Oman 24h notice.
35. `/test/health.test.mjs` — Health check payload and port resolution tests.
36. `/test/auth_regression.test.mjs` — Unauthenticated session gating, zero admin fallback, and SoD tests.
37. `/test/rbac_navigation.test.mjs` — Granular role-based navigation and permission unit tests.
38. `/database/omanMoL_schema.sql` — Reference PostgreSQL schema with RLS policies and audit tables.
39. `/enterprise-architecture/01_Database_Schema_RLS.prisma` — Strategic Prisma ORM schema specification.
40. `/enterprise-export/README.md` — Monorepo export and migration instructions.
41. `/Dockerfile` — Multi-stage Node 22 Cloud Run container configuration.
42. `/metadata.json` — Google AI Studio applet metadata and capabilities.

---

## 1. Application Entry Points

### Verified Facts
- **Client Entry Point (`/index.tsx` lines 1–35):**
  - Mounts React 19 root (`ReactDOM.createRoot`) into `div#root` inside `/index.html`.
  - Initializes internationalization (`/src/i18n/config`).
  - Wraps root in 4 foundational context providers in execution order:
    1. `<LanguageProvider>` (`/contexts/LanguageContext.tsx`)
    2. `<UserProvider>` (`/contexts/UserContext.tsx`)
    3. `<RegionalComplianceProvider>` (`/contexts/RegionalComplianceContext.tsx`)
    4. `<TenantProvider>` (`/contexts/TenantContext.tsx`)
    5. `<App />` (`/components/App.tsx`)
  - Calls `DemoDataLoader.seedDemoData().catch(console.error)` on startup (`/index.tsx` line 13).
- **Server Entry Point (`/server.ts` lines 1–68, 370–408):**
  - Runs with Node.js (`tsx server.ts` via `npm run dev` or `node dist/server.cjs` via `npm start`).
  - Native `.env` file loading via `(process as any).loadEnvFile?.()` (`/server.ts` line 3).
  - Dynamic port binding: Port 3000 in development (guaranteeing compliance with AI Studio iframe constraints), dynamically falling back to `$PORT` or 8080 in production (`/server.ts` lines 21–53).
  - Mounts Vite middlewares in development (`/server.ts` lines 370–375) or serves `/dist` statically in production with wildcard fallback to `/dist/index.html` (`/server.ts` lines 376–382).
- **Build Output Entry (`/package.json` line 9):**
  - Command: `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`.
  - Bundles React frontend into `/dist` and Express 5 server into `dist/server.cjs`.

### Partially Verified / Platform Limitations
- **Service Worker Lifecycle (`/index.tsx` lines 38–60):**
  - Service worker registration is intentionally bypassed in development / preview hosts (`localhost`, `ais-dev-`, `ais-pre-`, `run.app`) to prevent stale Vite asset caching. Offline caching is active only in standalone production PWA builds.

---

## 2. Frontend Routes and Modules

### Verified Facts
- **Routing Paradigm:** Single-Page Application (SPA) driven by local state `currentView: View` inside `/components/App.tsx` (lines 120–155), with URL path synchronization for deep linking (`/control-of-work`, `/incidents`, `/ai-assistant`, `/my-work`, `/predictive-safety`).
- **View Enumeration (`/types.ts` lines 6–75):** Defines 50+ explicit `View` enum members covering the complete QHSE lifecycle.
- **Lazy Module Loading (`/components/App.tsx` lines 12–50, 86–100):**
  - All heavy presentation views are loaded via `React.lazy()` inside a central `React.Suspense` wrapper (fallback: industrial skeleton loader).
- **Verified Module List:**
  1. *Dashboard & KPIs:* `/components/Dashboard.tsx`, `/components/ComplianceDashboard.tsx`, `/components/system/ExecutiveDashboard.tsx`, `/components/pdoomanMoLDashboard.tsx`.
  2. *Incidents & Investigations:* `/components/IncidentForm.tsx` (captures 5-Whys, Fishbone, SIF precursor analysis, Oman Form G, Oman 24h Notice).
  3. *Control of Work & PTW:* `/components/controlOfWork/ControlOfWorkModule.tsx` (Level 1/2/3 permits, SIMOPS conflict matrix, electronic LOTO, AGT gas testing).
  4. *Corrective Actions (CAPA):* `/components/CAPAModule.tsx` (SMART action register, SLA countdown, evidence uploads, SoD enforcement).
  5. *Audits & Inspections:* `/components/AuditModule.tsx`, `/components/InspectionModule.tsx`, `/components/pwa/MobileInspectionApp.tsx`.
  6. *Risk & Process Safety:* `/components/HazardRegisterModule.tsx`, `/components/BowtieAnalysisTool.tsx`, `/components/RootCauseAnalysisTool.tsx`, `/components/JSAModule.tsx`, `/components/RAMSModule.tsx`.
  7. *Occupational Health & Heat Stress:* `/components/HealthMonitoringModule.tsx` (WBGT & TWL threshold calculations, hydration schedules).
  8. *Environmental & ESG:* `/components/EnvironmentalModule.tsx`, `/components/CarbonAccountingModule.tsx`.
  9. *Contractor Safety:* `/components/ContractorPortal.tsx`, `/components/contractors/ContractorOnboarding.tsx`.
  10. *Enterprise IAM & Governance:* `/components/system/GovernanceModule.tsx`, `/components/system/IAMModule.tsx`, `/components/system/SystemLogsModule.tsx`.
  11. *Interactive Navigation Elements:* `/components/EnterpriseGlobalHeader.tsx`, `/components/regulatory/JurisdictionSelectorDropdown.tsx`, `/components/Sidebar.tsx`.
  12. *Asset Integrity & Telemetry:* `/components/PredictiveMaintenanceModule.tsx`, `/components/PredictiveMaintenanceLog.tsx`.
  13. *Emergency & Continuity:* `/components/EmergencyModule.tsx`, `/components/BusinessContinuityModule.tsx`.
  14. *Logistics & Field:* `/components/TransportModule.tsx`, `/components/PPEModule.tsx`, `/components/LiftingModule.tsx`, `/components/ExcavationModule.tsx`, `/components/ChemicalsModule.tsx`, `/components/MOCModule.tsx`.

---

## 3. Server Routes

### Verified Facts (Server-Side Routes in `/server.ts` & `/routes/`)

| Method | Path | Implementation File | Function / Description |
|---|---|---|---|
| `GET` | `/healthz` | `/server.ts` | Root-level health check probe for Google Cloud Run |
| `GET` | `/api/healthz` | `/routes/healthz.ts` | Detailed system status, uptime, memory, version |
| `GET` | `/api/health` | `/server.ts` | Backward-compatible lightweight JSON status |
| `POST` | `/api/gemini/chat` | `/routes/geminiRouter.ts` | Multi-turn AI chat with role prompts and search/maps grounding |
| `POST` | `/api/gemini/generate` | `/routes/geminiRouter.ts` | Structured JSON generation with multi-model fallback |
| `POST` | `/api/gemini/transcribe` | `/routes/geminiRouter.ts` | Audio speech-to-text via `gemini-3.5-transcribe` |
| `POST` | `/api/gemini/maps-grounding` | `/routes/geminiRouter.ts` | Real-world GCC facility grounding via `googleMaps` tool |
| `POST` | `/api/gemini/search-grounding`| `/routes/geminiRouter.ts` | Live regulatory updates via `googleSearch` tool |
| `POST` | `/api/predictive-maintenance/validate-telemetry` | `/routes/predictiveMaintenanceRouter.ts` | ISO 10816 vibration & API 670 temperature validation |
| `POST` | `/api/predictive-maintenance/equipment` | `/routes/predictiveMaintenanceRouter.ts` | Validates & sanitizes equipment record with HSE limit enforcement |
| `POST` | `/api/predictive-maintenance/work-order` | `/routes/predictiveMaintenanceRouter.ts` | Work order creation with SLA hours and mandatory LOTO checks |
| `GET` | `/api/predictive-maintenance/standards` | `/routes/predictiveMaintenanceRouter.ts` | Returns codified ISO & HSE limits to clients |
| `POST` | `/api/audit-log` / `/api/audit/log` | `/server.ts` | In-memory ring-buffer audit logging and Cloud Logging adapter |
| `GET` | `/api/audit/trail` | `/server.ts` | Returns recent 50 audit entries |
| `POST` | `/api/auth/verify-access` | `/server.ts` | Server-side authorization check against user roles & permissions |
| `GET` | `/api/auth/role-permissions/:role` | `/server.ts` | Returns permission list for a specific role |
| `GET` | `/api/admin/regional-compliance` | `/server.ts` | Fetches active regional mode (Oman / OMAN / COMBINED) and audit log |
| `POST` | `/api/admin/regional-compliance` | `/server.ts` | Updates regional mode with strict ADMIN role requirement |
| `POST` | `/api/cron/reminder` | `/server.ts` | Cloud Scheduler webhook for permit expiry and compliance alerts |
| `GET` | `/api/omanMoL/risk/:riskId` | `/server.ts` | Simulated Oman MoL MD 286/2008 & PDO Specifications risk classification connector |
| `GET` | `/api/oman/regulatory/status/:siteId` | `/server.ts` | Simulated Oman MoL & PDO SP-1143 compliance connector |

---

## 4. Authentication and Authorization Paths

### Verified Facts
- **Initial Session State:** Unauthenticated browser sessions initialize with `currentUser = null` and `isDemoMode = false` (`/contexts/UserContext.tsx`). There is zero automatic admin fallback on hydration or logout.
- **Authentication Gateway:** When `currentUser === null`, the user is gated at `/components/LoginPage.tsx` or `/components/SignUpPage.tsx`. Access to IAM, System Logs, Projects, and operational views is blocked.
- **Demo Access:** An explicit "Synthetic Demonstration Data · DEMO MODE" card on the login page initiates demonstration mode via `loginDemo(personaId)`. Supports explicit launch as **System Admin (`Sarah Connor`)**, **Frontline Worker (`Rahul Gupta`)**, or **Site Supervisor (`Marcus Chen`)**. When demo mode is active:
  - `isDemoMode === true`.
  - Configured via `AUTH_MODE=demo` and `DEMO_MODE=true` flags in `.env.example` and `services/authService.ts`.
  - A prominent sticky **Synthetic Demonstration Data · DEMO MODE** banner is displayed across the top of the application with persona badge.
  - An **Exit Demonstration Mode** button allows immediate session termination and reset to sign-in.
  - The interactive `RoleSwitcher` drawer is rendered strictly during active demonstration mode sessions (`isDemoMode === true`).
- **Role-Based Access Control (RBAC):** Codified in `/services/permissionService.ts`:
  - 18 distinct `UserRole` personas (ADMIN, Board Director, CEO, Head of Group HSE, Regional HSE Director, Site HSE Manager, HSE Officer, Site Supervisor, Worker, etc.).
  - 60+ granular permissions.
  - Server-side verification via `POST /api/auth/verify-access` in `/server.ts`.
- **Segregation of Duties (SoD) Invariants:**
  - Permit to Work: Performing Authority (Receiver) cannot self-authorize as Area Authority (Issuer).
  - CAPA: Action Owner cannot self-verify and close their own action.
- **External SSO:** Firebase Google SSO client configured in `/lib/firebase.ts` with popup flow.

### Partially Verified / Prototype Boundary
- **Simulated JWT Generator (`/services/authService.ts` lines 8–22):** Generates base64 tokens with dummy signature hashes for client prototype state. Real RS256/Ed25519 cryptographic token signing and server session verification are specified in `/enterprise-architecture/02_API_OpenAPI_Spec.yaml`.

---

## 5. Data Stores and Persistence

### Verified Facts
1. **Client Reactive Store (`/services/enterpriseDataStore.ts` & `/services/demoDataLoader.ts`):**
   - Central storage engine maintaining dual-key syncing between canonical keys (`ad6_incidents`, `ad6_permits`, `ad6_capas`) and legacy keys (`ad6_enterprise_*`).
   - Dispatches CustomEvents on mutations (`ad6-incidents-updated`, `ad6-permits-updated`, `ad6-capas-updated`).
   - Seeds initial synthetic records for 3 operational GCC sites.
2. **IndexedDB Offline Storage (`/services/offlineStorage.ts`):**
   - Offline storage utilizing the `idb` library. Caches permits, inspections, checklists, and sync queue.
3. **Server In-Memory Ring Buffer (`/server.ts` lines 129–155):**
   - Stores up to 500 audit log entries in memory; adapter dispatches to Google Cloud Logging if `ENABLE_CLOUD_LOGGING=true`.
4. **Firebase Firestore Client (`/lib/firebase.ts`):**
   - Initialized with project ID `gen-lang-client-0550864622` and database `ai-studio-5b5a1037-02f3-432b-9dda-3ffca9f637f0`.

### Unverified / Strategic Blueprints
- **PostgreSQL Database (`/database/omanMoL_schema.sql`):** 123 lines of reference DDL containing tables for tenants, users, mechanisms, requirements, workflow tasks, and audit logs with RLS policies. Not actively connected to a live database driver in the current Vite/Express prototype sandbox.
- **Prisma Schema (`/enterprise-architecture/01_Database_Schema_RLS.prisma`):** Comprehensive enterprise relational schema specified for Phase 1 enterprise monorepo migration.

---

## 6. AI Integrations

### Verified Facts
- **Server-Side Proxy Architecture (`/routes/geminiRouter.ts`):** Client components never instantiate `GoogleGenAI` directly. All AI requests route through Express endpoints (`/api/gemini/chat`, `/api/gemini/generate`, `/api/gemini/transcribe`, `/api/gemini/maps-grounding`, `/api/gemini/search-grounding`).
- **SDK & Models:** Uses official `@google/genai` TypeScript SDK:
  - `gemini-3.8-flash`: Primary generation model.
  - `gemini-3.5-flash`: General chat, Google Search Grounding (`tools: [{ googleSearch: {} }]`), and Google Maps Grounding (`tools: [{ googleMaps: {} }]`).
  - `gemini-3.1-pro-preview`: Complex reasoning tasks.
  - `gemini-3.1-flash-lite`: Fast tasks and fallback retry candidate.
  - `gemini-3.5-transcribe`: Voice audio transcription from base64 input.
- **Human-in-the-Loop (HITL):** Suggestions render through `/components/ai/AIGovernanceCard.tsx`, requiring human review and approval before adopting AI recommendations into permits, CAPAs, or investigations.
- **Resilient Fallback:** If `GEMINI_API_KEY` is not set or quota is exhausted, endpoints return structured JSON status messages without crashing the server.

---

## 7. Environment Variables

### Verified Facts (Inspected in `/.env.example` & `/server.ts`)

| Variable Name | Required | Default / Usage | Code Location |
|---|---|---|---|
| `NODE_ENV` | Optional | `development` / `production` | `/server.ts` line 33 |
| `PORT` | Optional | `3000` (dev) / `8080` (prod Cloud Run) | `/server.ts` lines 21–53 |
| `GEMINI_API_KEY` | **Required for AI** | Gemini API key for server routes | `/routes/geminiRouter.ts` line 8 |
| `ENABLE_CLOUD_LOGGING` | Optional | `false` (defaults to local memory ledger) | `/services/audit.js` line 2 |
| `Oman MoL_API_TOKEN` | Optional | Token for Oman statutory connector | `/.env.example` line 21 |
| `PDO_SAFETY_TOKEN` | Optional | Token for PDO SP-1143 connector | `/.env.example` line 22 |
| `VITE_FIREBASE_API_KEY` | Optional | Client Firebase API key override | `/lib/firebase.ts` line 9 |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Client Firebase Project ID override | `/lib/firebase.ts` line 11 |

---

## 8. Tests and Build Commands

### Verified Facts
- **Compilation Check:** `npm run lint` (`tsc --noEmit`) passes cleanly with 0 errors.
- **Unit & Regression Tests:** `npm test` runs `node --test test/health.test.mjs test/auth_regression.test.mjs`. All 7 tests pass.
- **RBAC Unit Suite:** `npx tsx --test test/rbac_navigation.test.mjs` runs 12 tests covering 6 persona access tiers. All 12 pass.
- **Production Build:** `npm run build` runs `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`. Output in `/dist`.
- **Production Container:** `Dockerfile` provides a multi-stage Node 22 Alpine build with container healthcheck on `/api/healthz`.

---

## 9. Demo and Mock Data Sources

### Verified Facts
- **Unified Source:** `/services/demoDataLoader.ts`:
  - `GULF_ENERGY_TENANT`: Enterprise holding entity "Gulf Energy & Infrastructure Group" (GCC-GEIG-01).
  - `GULF_ENERGY_SITES`:
    1. *Fahud-West Gas Station (Oman)* — OMN-FHD-02, Block 6 PDO concession.
    2. *Al-Mina Al Fahal Polyolefin Asset (Oman)* — OMN-MAF-01, Muscat industrial complex.
    3. *Ras Al-Khair Maritime Yard (KSA)* — KSA-RAK-01.
  - `GULF_ENERGY_USERS`: 12 personas representing frontline workers, supervisors, officers, managers, and executives.
  - `GULF_ENERGY_INCIDENTS`, `GULF_ENERGY_PERMITS`, `GULF_ENERGY_CAPAS`: Seed records with real GCC coordinates and statutory citations.

---

## 10. Security-Sensitive Code & Safeguards

### Verified Facts
1. **Unauthenticated Session Baseline:** Fresh browser sessions strictly receive `null` user. No automatic admin fallback.
2. **Segregation of Duties:** Enforced in code for PTW (receiver cannot sign as issuer) and CAPA (owner cannot close action).
3. **Server Proxy AI Boundary:** Zero client-side Gemini SDK instantiation. API keys are strictly server-side.
4. **Security Headers:** Express gateway sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
5. **Sanitization:** Input sanitization and ISO range checks implemented in `/routes/predictiveMaintenanceRouter.ts`.
