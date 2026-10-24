# Authentication & Security Architecture Guide — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Security Standard:** OWASP ASVS 4.0 Level 2 / ISO 27001 Control Themes  
**Lead Security Architect:** Principal Application Security Engineer  

---

## 1. Security Threat Model (STRIDE Assessment)

| Threat Category | System Vulnerability Target | Implemented / Proposed Mitigation |
|---|---|---|
| **Spoofing** | Forged user identities signing permits or closing actions | Cryptographic digest signing in `UnifiedAuditTrailService`; server-side session authentication with verified `userId`. |
| **Tampering** | Alteration of incident timestamps to bypass 24h statutory deadline | Append-only audit trail logging forward hashes; immutable record status transitions logged via `AuditLogger`. |
| **Repudiation** | Denying issuance of high-risk Hot Work permit in hazardous zone | Dual-signature requirement (Issuer + Receiver) with digital timestamp, role badge, and IP logging. |
| **Information Disclosure** | Leakage of Gemini API key or classified concession coordinates | Server-side proxy isolation; API keys never sent to browser; coordinates restricted to authorized tenant roles. |
| **Denial of Service** | Volumetric flooding of AI generation endpoints | Server-side rate limiting on `/api/gemini/*` (30 req/min); 30s abort controllers preventing connection exhaustion. |
| **Elevation of Privilege** | Permit Receiver authorizing own permit (SoD Bypass) | Hard-coded Segregation of Duties checks in both React UI state and Express `/api/auth/verify-access` backend route. |

---

## 2. Role-Based Access Control (RBAC) & SoD Matrix

```
Roles:
1. ADMIN: System Administration & Tenant Configuration
2. HSE_DIRECTOR: Corporate Strategy, Global Analytics, Statutory Exports
3. AREA_AUTHORITY: Site-level Permit Issuance & Operational Risk Approval
4. SITE_SUPERVISOR: Field Work Control, Daily Inspections, Toolbox Talks
5. PERMIT_RECEIVER: Contractor Lead, Custody Acknowledgment, Hazard Reporting
6. AUDITOR: Read-only access to Audit Trails, Records, and Evidence Logs
```

### 2.1 Permission Mapping Matrix

| Permission ID | ADMIN | HSE_DIR | AREA_AUTH | SITE_SUP | RECEIVER | AUDITOR |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `incident:report` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `incident:investigate_rca` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `incident:statutory_export` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `ptw:request` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `ptw:authorize_issuer` | ✅ | ❌ | ✅ | ❌ | ❌ (SoD) | ❌ |
| `ptw:acknowledge_custody` | ❌ | ❌ | ❌ (SoD) | ✅ | ✅ | ❌ |
| `capa:assign` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `capa:verify_close` | ✅ | ✅ | ✅ | ❌ (If Owner) | ❌ (SoD) | ❌ |
| `audit:view_trail` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Segregation of Duties (SoD) Rules

### 3.1 Permit to Work Custody Separation
$$\text{Issuer ID} \ne \text{Receiver ID}$$
The individual operating as the Permit Receiver (the entity executing work in the hazardous field zone) cannot act as the Area Authority (the entity authorizing work and confirming zero-energy state). Attempting to do so triggers an immediate SoD violation error in `ControlOfWorkModule.tsx` and Express gateway.

### 3.2 Corrective Action Closure Separation
$$\text{Action Owner ID} \ne \text{Closing Verifier ID}$$
A technician or contractor assigned to execute a CAPA (e.g. replacing a faulty relief valve) cannot sign off on the statutory closure of that action. Independent physical verification by an HSE Inspector or Area Authority is mandatory under ISO 45001 Clause 10.2.

---

## 4. Prompt Injection & AI Safety Defense

1. **System Prompt Immutability:** System instructions in `routes/geminiRouter.ts` are injected strictly on the server and cannot be overwritten by client-sent payloads.
2. **Context Escaping:** User-submitted incident narratives and field transcripts are encapsulated within tagged markdown delimiters (`<user_incident_narrative> ... </user_incident_narrative>`) to prevent prompt boundary escaping.
3. **Model Output Schema Enforcement:** Structured JSON mode (`responseMimeType: 'application/json'`) forces the model into predetermined typed interfaces, discarding adversarial unstructured instruction outputs.
4. **Human Review Gate:** No AI recommendation directly commits database modifications. Every recommendation requires human affirmation via `AIGovernanceCard`.

---

## 5. Production Security Hardening Checklist

- [x] All Gemini API credentials isolated to backend server environment.
- [x] HTTP security headers configured (X-Content-Type-Options: nosniff, Referrer-Policy).
- [x] Multi-tenant isolation verified with tenant ID foreign keys.
- [x] Segregation of Duties enforced on both UI buttons and API verification routes.
- [x] Audit trail records forward SHA-256 hashes for all state mutations.
- [x] Input payload limits enforced ($50\text{MB}$ max for multi-part evidence).
- [x] Passwords and credentials never logged or stored in clear text.
