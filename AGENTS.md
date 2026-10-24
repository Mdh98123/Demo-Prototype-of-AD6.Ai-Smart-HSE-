# AGENTS.md — AI Agent & Developer Operating Constitution
### Project: AD6.Ai Smart HSE Enterprise Platform

---

# 1. SYSTEM IDENTITY & AGENT PURPOSE

You are an AI coding agent or software engineer operating on the **AD6.Ai Smart HSE Enterprise Platform**.

You are working on a regulated, life-safety enterprise application. Your code directly impacts worker health, safety compliance, industrial permit authorization, and statutory reporting across GCC industrial environments (Sultanate of Oman, UAE, and KSA).

### Primary Directives:
1. **Safety before speed:** Never introduce bypasses, backdoor logins, or disabled safety gates.
2. **Segregation of Duties (SoD) is absolute:** A permit receiver can never self-authorize as issuer; a CAPA owner can never self-verify and close their own action.
3. **Inspect before modifying:** Always read existing code, types, and services before proposing or implementing changes.
4. **Preserve verified design & architecture:** Use the established light-glassmorphism visual system (Tailwind CSS) and multi-jurisdiction reactive state.

---

## 2. Verified Technology Stack & Commands

| Tool / Layer | Specification | Standard Command | Notes |
|---|---|---|---|
| **Runtime** | Node.js `>= 20.6.0` (tested with v22) | `node -v` | Native `.env` file loading |
| **Development** | Vite 6 + Express 5 Gateway | `npm run dev` | Runs `tsx server.ts` on port 3000 |
| **Compilation Check** | TypeScript Compiler | `npm run lint` | Runs `tsc --noEmit` |
| **Production Build** | Vite + esbuild Node bundle | `npm run build` | Builds `/dist` and `dist/server.cjs` |
| **Unit / Health Test** | Node test runner | `npm test` | Runs `node --test test/health.test.mjs` |
| **Production Start** | Node runtime | `npm start` | Runs `node dist/server.cjs` (Port 8080) |

---

## 3. Repository Structure & Module Boundaries

```
/
├── server.ts                  # Express 5 gateway & WebSocket hub
├── index.html                 # HTML shell & font definitions
├── index.tsx                  # Client entry point
├── routes/                    # Server-side API routers
│   ├── geminiRouter.ts        # Gemini AI suite & proxy (/api/gemini/*)
│   ├── healthz.ts             # Container liveness & readiness probes
│   └── predictiveMaintenanceRouter.ts
├── services/                  # Business logic & data access
│   ├── demoDataLoader.ts      # Unified demo data & storage keys
│   ├── enterpriseDataStore.ts # Central reactive storage & CRUD
│   ├── regionalComplianceService.ts # UAE/Oman statutory rules & validation
│   ├── simopsService.ts       # Permit collision & spatial conflict engine
│   └── permissionService.ts   # RBAC & SoD permission matrix
├── components/                # React 19 UI components
│   ├── IncidentForm.tsx       # Incident capture, 5-Whys, Fishbone, Form G
│   ├── CAPAModule.tsx         # Central corrective action register
│   ├── controlOfWork/         # PTW, LOTO isolations, gas testing
│   ├── system/                # Executive dashboards, KPI formulas
│   └── ai/                    # AIGovernanceCard, HITL review widgets
├── contexts/                  # React contexts (Language, Tenant, User, Regional)
├── docs/                      # Comprehensive technical documentation
└── enterprise-architecture/   # Reference Prisma, OpenAPI, and Kubernetes specs
```

---

## 4. Coding & Architecture Conventions

### 4.1 Storage & Mutation Rules
1. **Never write to a single storage key:** Always dual-sync canonical (`ad6_incidents`, `ad6_permits`, `ad6_capas`) and legacy keys (`ad6_enterprise_*`).
2. **Always dispatch event notifications on mutation:**
   - Incidents: `window.dispatchEvent(new CustomEvent('ad6-incidents-updated'));`
   - Permits: `window.dispatchEvent(new CustomEvent('ad6-permits-updated'));`
   - CAPAs: `window.dispatchEvent(new CustomEvent('ad6-capas-updated'));`
3. **Prefer `EnterpriseDataStore` or `DemoDataLoader`:** Never execute raw `localStorage.setItem` directly inside presentation components.

### 4.2 Segregation of Duties (SoD) Implementation
- **Permit to Work:**
  ```typescript
  if (permit.receiverSignature?.signatoryName === currentUser.name || permit.receiverId === currentUser.id) {
    throw new Error("SoD Violation: Permit Receiver cannot self-authorize as Area Authority.");
  }
  ```
- **CAPA Management:**
  ```typescript
  if (targetCapa.ownerName === currentUser.name || targetCapa.assigneeId === currentUser.id) {
    throw new Error("SoD Violation: Action Owner cannot self-verify and close action.");
  }
  ```

### 4.3 AI & LLM Integration Rules
1. **Zero Client SDK Calls:** Never instantiate `GoogleGenAI` in client React components using browser environment variables.
2. **Server-Side Proxy Mandatory:** Call `/api/gemini/generate` or `/api/gemini/chat`.
3. **Proxy Timeout:** Maintain a 30-second (`30000ms`) abort timeout on fetch requests to prevent premature timeouts.
4. **Human-In-The-Loop:** Every AI output that suggests a classification, hazard control, or investigation step must render using `AIGovernanceCard` with human approval controls.

---

## 5. Definition of Done (DoD)

A task or pull request is complete only when:
1. **Compilation Clean:** `npm run lint` (`tsc --noEmit`) passes with zero errors.
2. **Full File Outputs:** Code edits are delivered as complete, pristine files with exact file paths.
3. **No Secret Leaks:** No API keys, credentials, or personal tokens are included.
4. **Verification Path Provided:** Exact click-paths and expected results are documented for manual testing.
5. **No Regressions:** Neighboring modules continue to operate without broken imports or storage collisions.

---

## 6. Prohibited Practices

- ❌ **Do NOT hardcode KPI values:** Never display hardcoded strings for LTIFR, TRIR, or safe hours when live storage records exist.
- ❌ **Do NOT bypass SoD:** Never allow a user to sign off on their own work.
- ❌ **Do NOT expose secrets:** Never put `GEMINI_API_KEY` into client files or `.env.example`.
- ❌ **Do NOT invent unverified dependencies:** Only install npm packages when strictly necessary, and always justify them.
- ❌ **Do NOT use chatbot filler:** Maintain a formal, authoritative, executive-grade enterprise tone.
