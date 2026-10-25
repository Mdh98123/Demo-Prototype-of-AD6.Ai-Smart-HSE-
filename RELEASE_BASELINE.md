# AD6.Ai Smart HSE Enterprise Platform — Release Baseline Specification

**Baseline Release Version:** 1.0.0-verified  
**Inspection & Verification Date:** 2026-10-23  
**Target Environment:** Node.js 20.6+ / Node 22 LTS, Express 5 Gateway, Vite 6, React 19 SPA, Google AI Studio / Google Cloud Run  
**Assessed Status:** Complete, Verified, Zero-Regression State  

---

## 1. Runtime Environment & Toolchain Baseline

| Layer | Specification | Standard Command | Operational Notes |
|---|---|---|---|
| **Node Runtime** | Node.js `>= 20.6.0` (Verified on Node 22.14.0) | `node -v` | Supports native `process.loadEnvFile()` |
| **Development Server** | Vite 6 + Express 5 Gateway | `npm run dev` | Runs `tsx server.ts` on port 3000 |
| **Type Check / Linter** | TypeScript Compiler 5.8.2 (`tsc --noEmit`) | `npm run lint` | 0 errors across 400+ TypeScript files |
| **Production Build** | Vite + esbuild Node.js bundle | `npm run build` | Generates `/dist` and `dist/server.cjs` |
| **Automated Tests** | Node.js Native Test Runner (`node:test`) | `npm test` | Runs health and auth regression test suites |
| **RBAC Unit Suite** | Node.js Native Runner via tsx | `npx tsx --test test/rbac_navigation.test.mjs` | Runs 12 granular RBAC persona tests |
| **Production Server** | Node.js runtime | `npm start` | Runs `node dist/server.cjs` (Port 8080) |
| **Container Engine** | Multi-stage Dockerfile (Node 22 Alpine) | `docker build -t ad6-hse-platform .` | Cloud Run healthcheck at `/api/healthz` |

---

## 2. Dynamic Port Resolution Specification

To maintain strict compliance with both the Google AI Studio iframe sandbox environment and Google Cloud Run container hosting, dynamic port binding is implemented in `/server.ts` (lines 21–53):

```text
┌────────────────────────────────────────────────────────┐
│               PORT RESOLUTION FLOW                     │
└────────────────────────────────────────────────────────┘
                           │
       CLI Argument '--port <N>' present?
              ├── YES ──> Bind to <N> (Vite / AI Studio runner)
              │
              └── NO  ──> Environment is Production?
                            ├── YES ──> Bind to process.env.PORT || 8080 (Cloud Run)
                            │
                            └── NO  ──> Bind to 3000 (AI Studio iframe requirement)
```

**Critical Invariant:** In development mode (`NODE_ENV !== "production"`), the server MUST NOT blindly bind to `PORT=8080` if set by an ambient host container, because Nginx inside the AI Studio environment already binds port 8080 as a reverse proxy targeting port 3000. Binding to 8080 in dev results in `EADDRINUSE` crash.

---

## 3. Verified Quality & Test Baseline

### 3.1 Automated Test Execution Results (`npm test`)
- **Suite 1:** `/test/auth_regression.test.mjs`
  - `[PASS]` fresh unauthenticated session: session user is strictly null with zero admin access
  - `[PASS]` explicit demo entry: sets demo flag and provisions explicit persona (admin and worker)
  - `[PASS]` demo role switching: allows switching between personas in demo mode only
  - `[PASS]` authenticated session restoration: restores valid sessions and safely fails corrupted tokens
  - `[PASS]` Regression Guard: `isDemoSession` strictly returns false when no storage key exists
  - `[PASS]` Segregation of Duties (SoD) Invariant: Self-authorization is strictly rejected
- **Suite 2:** `/test/health.test.mjs`
  - `[PASS]` Health check payload validation (`status`, `version`, `timestamp`)
  - `[PASS]` Port resolution logic across Cloud Run, CLI flags, and development fallbacks
- **Summary:** 8 tests passed, 0 failures, 0 skipped.

### 3.2 RBAC Persona Test Results (`npx tsx --test test/rbac_navigation.test.mjs`)
- `[PASS]` Scenario 1: User with standard permissions (Worker)
- `[PASS]` Scenario 2: User with administrative privileges (ADMIN)
- `[PASS]` Scenario 3: User with restricted privileges (Security Officer & Store Keeper)
- `[PASS]` Scenario 4: User with multiple assigned roles (Worker + Site_Supervisor)
- `[PASS]` Scenario 5: User with a newly granted permission
- `[PASS]` Scenario 6: User whose permission has been revoked / explicitly denied
- `[PASS]` Scenario 7: User with an inactive or suspended account
- `[PASS]` Scenario 8: Direct route guard enforcement for unauthorized URL
- `[PASS]` Scenario 9: Internal Auditor role permissions boundary
- `[PASS]` Scenario 10: Environmental Officer specialized permissions
- `[PASS]` Scenario 11: Server-side authorization check simulation (`/api/auth/verify-access`)
- `[PASS]` Scenario 12: Empty section suppression rule
- **Summary:** 12 tests passed, 0 failures, 0 skipped.

### 3.3 Static Analysis (`npm run lint`)
- Command: `tsc --noEmit`
- Result: Clean exit code 0. Zero TypeScript syntax, import, or type mismatches.

### 3.4 Production Build (`npm run build`)
- Command: `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
- Result: Clean exit code 0. Complete bundles generated in `/dist` and `/dist/server.cjs`.

---

## 4. Environment Variables & Secrets Inventory

| Variable | Sensitivity | Required | Purpose & Location |
|---|---|---|---|
| `NODE_ENV` | Non-sensitive | No | Sets runtime mode (`development` vs `production`). |
| `PORT` | Non-sensitive | No | Port assignment override (3000 in dev, 8080 in prod). |
| `AUTH_MODE` / `VITE_AUTH_MODE` | Non-sensitive | No | Sets authentication subsystem mode (`demo` \| `firebase` \| `enterprise`). Defined in `.env.example` and `services/authService.ts`. |
| `DEMO_MODE` / `VITE_DEMO_MODE` | Non-sensitive | No | Toggles demonstration mode availability (`true` \| `false`). Defined in `.env.example` and `services/authService.ts`. |
| `GEMINI_API_KEY` | **Secret** | **Yes (for AI)** | Server-side Gemini API key. Never exposed to browser. Used in `/routes/geminiRouter.ts`. |
| `OSHAD_API_TOKEN` | Secret | No | Token for UAE statutory connector `/api/oshad/*`. |
| `ADNOC_SAFETY_TOKEN` | Secret | No | Token for ADNOC CoP integration. |
| `ENABLE_CLOUD_LOGGING` | Non-sensitive | No | Toggles Google Cloud Logging output in `/services/audit.js`. |
| `VITE_FIREBASE_*` | Public Client | No | Firebase configuration overrides in `/lib/firebase.ts`. |

---

## 5. Security & Invariant Baseline

1. **Unauthenticated Session Gating:**
   - Fresh browser sessions initialize with `currentUser = null` and `isDemoMode = false`.
   - Access to IAM, System Logs, Tenant Settings, and operational modules is blocked until the user signs in or explicitly launches the Demo Sandbox.
   - Automatic admin fallback has been permanently eradicated from the initialization flow.
2. **Explicit Demo Mode:**
   - Dedicated "Synthetic Demonstration Data · DEMO MODE" card on the login screen.
   - Supports explicit launch as **System Admin (`Sarah Connor`)**, **Frontline Worker (`Rahul Gupta`)**, or **Site Supervisor (`Marcus Chen`)**.
   - Prominently displays a sticky banner: `Synthetic Demonstration Data · DEMO MODE`.
   - Immediate session exit via `Exit Demonstration Mode` action.
   - Role switching is strictly gated to active demonstration sessions only (`if (!isDemoMode) return;`).
3. **Segregation of Duties (SoD):**
   - Permit to Work: Receiver / Performing Authority cannot self-authorize as Area Authority Issuer.
   - CAPA: Action Owner cannot self-verify and close their own action.
4. **Server-Side AI Gateway:**
   - All LLM operations route through `/api/gemini/*` on Express 5.
   - 30-second abort timeouts and multi-model fallback chain (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.1-flash-lite`).
   - Human-in-the-Loop review enforced via `AIGovernanceCard.tsx`.

---

## 6. Architecture State: Current Sandbox vs Strategic Monorepo

| Dimension | Current Sandbox Baseline (Verified Reality) | Strategic Architecture (Exported in `/enterprise-architecture`) |
|---|---|---|
| **App Architecture** | Vite 6 React 19 SPA + Express 5 Gateway | Next.js 15 (App Router) + NestJS Microservices (Turborepo) |
| **Persistence** | Dual-key `localStorage` + IndexedDB (`idb`) | PostgreSQL with PostGIS + Row-Level Security (RLS) |
| **ORM / Data Access** | Central `EnterpriseDataStore` & `DemoDataLoader` | Prisma ORM (`01_Database_Schema_RLS.prisma`) |
| **Authentication** | Simulated token + Firebase Google SSO popup + RBAC matrix | SAML 2.0 / OpenID Connect + Keycloak / Azure AD MFA |
| **Messaging** | Socket.IO server in `/server.ts` | Apache Kafka / RabbitMQ (`07_Kafka_Event_Schema.json`) |
| **Container Hosting**| Single-container Node 22 on Cloud Run (`Dockerfile`) | Azure Kubernetes Service (AKS) (`06_Kubernetes_Orchestration.yaml`) |
| **AI Processing** | Server-side Gemini API proxy with Search & Maps Grounding | 3-Tier AI: Edge TensorRT (<300ms) + GenAI RAG + Predictive Models |

---

## 7. Zero-Regression Verification Checklist

Before any future pull request or code edit is approved:
- [ ] **Preservation Contract:** Confirm no existing component, service, route, export, or mock dataset was deleted, renamed, or disabled.
- [ ] **Compilation Clean:** Verify `npm run lint` (`tsc --noEmit`) passes with 0 errors.
- [ ] **Tests Pass:** Verify `npm test` passes all tests.
- [ ] **RBAC Tests Pass:** Verify `npx tsx --test test/rbac_navigation.test.mjs` passes all 12 tests.
- [ ] **Production Build:** Verify `npm run build` succeeds without bundle errors.
- [ ] **SoD Invariants:** Verify Permit receiver cannot sign as issuer, and CAPA owner cannot close their own action.
- [ ] **Zero Admin Leak:** Verify fresh browser sessions remain strictly unauthenticated with `currentUser = null`.
