# Enterprise Threat Model: STRIDE Analysis
### Platform: AD6.Ai Smart HSE Enterprise Platform
**Methodology**: Microsoft STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) applied to the Top 10 Enterprise Safety & Compliance Workflows.

---

## Top 10 Core Workflows & Mitigations

### 1. Incident Reporting & Form G Statutory Escalation
- **Description**: Capture of workplace accidents, 24-hr serious event clock start, Form G submission to Oman Ministry of Labour.
- **Threats**:
  - *Spoofing*: Malicious actor submits fraudulent incident under another worker's identity.
  - *Tampering*: Altering incident severity from "Fatal" to "Near Miss" to avoid statutory reporting.
  - *Repudiation*: Manager claims they never received statutory notification.
- **Mitigations & Code References**:
  - `apps/api/src/clock/statutoryClock.ts`: Starts immutable countdown timer on serious severity ingestion.
  - `apps/api/src/audit/writeAudit.ts`: SHA-256 hash-chained log on every state change; cannot be repudiated.
  - `apps/api/src/repositories/incidentRepository.ts`: Validates actor permissions via `requirePermission(Permission.INCIDENT_CREATE)`.

### 2. Permit to Work (PTW) Issue & Segregation of Duties (SoD)
- **Description**: Area Authority issues permit to Permit Receiver for high-risk work under PDO SP-1143.
- **Threats**:
  - *Elevation of Privilege*: Permit Receiver self-approves as Area Authority to bypass safety isolation check.
  - *Tampering*: Gas test readings forged after permit issuance.
- **Mitigations & Code References**:
  - `apps/api/src/sod/sodDatabaseEnforcer.ts`: Application & SQL checks prevent identical receiver and issuer (`chk_permit_sod_receiver_not_issuer`).
  - `apps/api/src/repositories/permitRepository.ts`: Blocks activation if gas tests fail or are missing.

### 3. CAPA Creation, Ownership, and Independent Closure
- **Description**: Assigning corrective actions following safety audit or incident investigation.
- **Threats**:
  - *Tampering / SoD Violation*: Action owner closes their own action without independent physical verification.
- **Mitigations & Code References**:
  - `apps/api/src/repositories/capaRepository.ts`: Verifies `owner_name !== verified_by_name` and enforces `chk_capa_sod_owner_not_verifier`.
  - Database constraint rejects closure when verifier is null or identical to owner.

### 4. AI Incident Analysis & Classification Gate
- **Description**: LLM suggests incident categorization, 5-Whys root causes, and corrective actions.
- **Threats**:
  - *Elevation of Privilege / AI Autonomy*: LLM hallucinates an unauthorized permit issuance or self-closes a CAPA.
  - *Information Disclosure*: Sensitive worker PII sent directly in browser prompt to AI model.
- **Mitigations & Code References**:
  - `apps/api/src/middleware/aiGate.ts`: Non-negotiable AI-Assistive guardrail; zero autonomous state changes.
  - `routes/geminiRouter.ts`: Proxied strictly server-side; browser never receives API keys.
  - `components/ai/AIGovernanceCard.tsx`: Human-in-the-loop review interface required before output can be adopted.

### 5. Multi-Tenant Data Isolation & RLS Enforcement
- **Description**: Shared PostgreSQL 16 database storing records for multiple industrial operators.
- **Threats**:
  - *Information Disclosure*: Tenant B queries Tenant A's incidents or trade secrets via SQL injection or missing where-clauses.
- **Mitigations & Code References**:
  - `migrations/0002_phase1_full_schema.up.sql`: `ENABLE ROW LEVEL SECURITY;` on 100% of tenant tables.
  - `apps/api/src/db/connection.ts`: `withTenantContext(tenantId)` sets `SET LOCAL app.tenant_id = $1`.
  - `infra/migrations-runner.mjs`: Guardrail G-6 dry-run fails CI if any table lacks tenant_id or RLS policy.

### 6. Field Worker Offline Synchronization & Conflict Resolution
- **Description**: Field personnel report observations without cell connectivity in remote desert concessions.
- **Threats**:
  - *Tampering / Replay Attacks*: Intercepted sync payloads replayed multiple times to inflate safety counts.
  - *Information Disclosure*: Unencrypted pending reports stored on lost Android field tablet.
- **Mitigations & Code References**:
  - `apps/api/src/sync/syncService.ts`: Idempotency keys (`sync_idempotency_key`) deduplicate retry attempts.
  - Web Crypto encrypted IndexedDB cache on client device.
  - SoD re-evaluation on sync: offline CAPA closures that violate SoD are rejected on the server.

### 7. SCIM 2.0 Identity Provisioning & Role Delegation
- **Description**: Enterprise IdP (Azure AD / Okta) synchronizes employee roles and temporary delegations.
- **Threats**:
  - *Spoofing*: Attacker calls SCIM endpoint with fabricated user attributes.
  - *Elevation of Privilege*: Delegated supervisor usurps site manager permissions indefinitely.
- **Mitigations & Code References**:
  - `apps/api/src/integrations/identity/scimService.ts`: Requires `Permission.SCIM_MANAGE` and valid bearer token.
  - `apps/api/src/delegation/delegationService.ts`: Strict temporal expiration on delegations; automatic reversion.

### 8. IoT Weather Ingestion & Thermal Work Limit (TWL) Stop-Work
- **Description**: Automated weather station readings trigger mandatory work-rest regimes under PDO SP-1170.
- **Threats**:
  - *Denial of Service*: Spoofed extreme heat readings shut down entire refinery production.
  - *Tampering*: Falsified mild temperatures during extreme summer heat leading to worker fatalities.
- **Mitigations & Code References**:
  - `apps/api/src/integrations/weather/twlEvaluationWorker.ts`: Dual-sensor sanity cross-validation.
  - Breaches recorded in `twl_breaches` table and require supervisor physical signature to override.

### 9. Statutory Data Retention Purge & Legal Hold
- **Description**: Scheduled worker purges records older than statutory retention periods.
- **Threats**:
  - *Tampering / Evidence Destruction*: Operator purges incident records subject to active regulatory investigation.
- **Mitigations & Code References**:
  - `apps/api/src/security/retentionWorker.ts`: Strict `legal_hold = true` bypass immunity.
  - All purges recorded in hash-chained audit ledger with count, entity type, and regulatory authority basis.

### 10. Subject Access Request (SAR) Data Export
- **Description**: Data subject requests a machine-readable export of all their personal data.
- **Threats**:
  - *Information Disclosure*: Unauthorized actor requests SAR export for another employee.
- **Mitigations & Code References**:
  - `apps/api/src/security/subjectAccessService.ts`: Restricts exports to authenticated users with `Permission.SAR_MANAGE`.
  - Machine-readable ISO 27701 JSON bundle generated with scoped tenant isolation.
