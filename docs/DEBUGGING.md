# Diagnostic Manual & Troubleshooting Playbook — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Target Audience:** Site Reliability Engineers, DevOps Engineers, Full-Stack Developers  
**Format:** Symptom ➔ Likely Causes ➔ Diagnostic Steps ➔ Resolution ➔ Verification ➔ Prevention  

---

## 1. Diagnostic Principles & Golden Signals

When diagnosing operational anomalies in the AD6.Ai platform, engineers must observe four fundamental golden signals:
1. **Latency:** Transactional API endpoints should respond within $< 150\text{ms}$; AI generation proxy within $< 15\text{s}$.
2. **Traffic:** Monitor HTTP request velocity across `/api/gemini/*` and WebSocket event rates on Socket.IO.
3. **Errors:** HTTP 4xx (client authorization / validation) vs HTTP 5xx (server proxy / unhandled exceptions).
4. **Saturation:** Memory utilization in Node.js process buffer and browser `localStorage` capacity ($< 5\text{MB}$ budget).

---

## 2. Troubleshooting Playbooks

### Playbook 1: Premature AI Model Timeout or Stale Fallback
- **Symptom:** AI 5-Why analysis or incident classification fails or returns generic fallback data with warning in console.
- **Likely Causes:**
  1. Server proxy timeout set too low (previously 7s abort timeout).
  2. Missing or expired `GEMINI_API_KEY` in server environment.
  3. Google AI Studio rate limit (HTTP 429).
- **Diagnostic Steps:**
  1. Inspect browser Network tab for `POST /api/gemini/generate`.
  2. Inspect server terminal logs for `[GEMINI GENERATE ROUTE ERROR]` or `[GEMINI GENERATE] Attempt encountered`.
  3. Verify `.env` file exists at workspace root and contains `GEMINI_API_KEY`.
- **Resolution:**
  - In `services/geminiService.ts`, ensure `setTimeout(() => controller.abort(), 30000)` is set to 30,000ms.
  - In `routes/geminiRouter.ts`, ensure fallback candidate models (`gemini-3.8-flash` ➔ `gemini-3.1-flash-lite`) are active.
- **Verification:** Run a test prompt in Safi AI Copilot; verify full response generated within 8–14 seconds.
- **Prevention:** Centralize server-side key health probes via `/api/healthz`.

---

### Playbook 2: Permit Authorization Blocked by Segregation of Duties (SoD)
- **Symptom:** User clicks "Authorize Permit as Area Authority" but the signature pad is locked and button is disabled.
- **Likely Causes:**
  1. Current logged-in user identity matches the Permit Receiver / Applicant.
  2. User does not possess the `AREA_AUTHORITY` or `ADMIN` role.
- **Diagnostic Steps:**
  1. Check the active user in the top-right header menu.
  2. Inspect Permit Receiver signature block (`permit.receiverSignature.signatoryName` or `receiverId`).
  3. Review console output for `[SoD Violation]` message.
- **Resolution:**
  - Switch active role using the development **Role Switcher** in the top navigation to `Area Authority (Marcus Chen)` or `HSE Director`.
- **Verification:** Confirm the "Authorize Permit" button becomes active and emits an audit event upon signing.
- **Prevention:** Display clear contextual banner: *"You are viewing this permit as Receiver. Issuance requires Area Authority sign-off."*

---

### Playbook 3: Missing Incident or CAPA Records Across Module Views
- **Symptom:** An incident reported in `IncidentForm` does not appear in `ExecutiveDashboard` or `CAPAModule`.
- **Likely Causes:**
  1. Component reading from legacy storage key (`ad6_enterprise_incidents`) while writer updated canonical key (`ad6_incidents`).
  2. Missing `ad6-incidents-updated` or `ad6-capas-updated` CustomEvent dispatch.
- **Diagnostic Steps:**
  1. Open browser DevTools ➔ Application ➔ Local Storage.
  2. Inspect keys `ad6_incidents` and `ad6_enterprise_incidents`.
  3. Verify whether item count matches.
- **Resolution:**
  - Verify that `DemoDataLoader` and `EnterpriseDataStore` methods dual-sync both keys.
  - In `IncidentForm.tsx`, ensure `DemoDataLoader.saveIncident()` and `DemoDataLoader.saveCapa()` are called.
- **Verification:** Create a test incident; observe immediate increment in `ExecutiveDashboard` recordable count without manual page reload.
- **Prevention:** Never call raw `localStorage.setItem` directly inside React components; route all persistence through `EnterpriseDataStore`.

---

### Playbook 4: Container Health Probe Failure on Cloud Run
- **Symptom:** Cloud Run deployment fails with container crash or failed readiness probe on `PORT 8080`.
- **Likely Causes:**
  1. Server listening on hardcoded port 3000 instead of injected `process.env.PORT`.
  2. Nginx or proxy conflict.
- **Diagnostic Steps:**
  1. Inspect Cloud Run container startup logs.
  2. Search `server.ts` for port resolution logic.
- **Resolution:**
  - Confirm `resolvePort()` function checks `process.env.PORT` when `process.env.NODE_ENV === 'production'`.
  - Ensure `/healthz` and `/api/healthz` return HTTP 200 JSON payload without requiring database locks.
- **Verification:** Run `docker run -p 8080:8080 -e PORT=8080 -e NODE_ENV=production ad6-hse-platform:latest` and execute `curl -I http://localhost:8080/healthz`.
- **Prevention:** Include automated container smoke test in CI pipeline.
