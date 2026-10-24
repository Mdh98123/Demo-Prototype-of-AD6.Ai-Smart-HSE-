# Quality Assurance & Verification Strategy — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**QA Lead:** Principal QA Automation Engineer & Regulated Systems Auditor  
**Standard:** ISO/IEC/IEEE 29119 Software Testing & ISTQB Advanced Test Management  

---

## 1. Test Strategy & The Testing Pyramid

The testing strategy for AD6.Ai Smart HSE reflects its mission-critical, life-safety operational environment. Failure of a safety barrier or incorrect permit authorization can have catastrophic real-world consequences.

```
            / \
           / E2E \       <-- 25+ Playwright Automated Scenarios
          /-------\
         / Integration \   <-- API Contracts, Storage Sync, SoD Rules
        /---------------\
       / Unit & Component \ <-- Business Formulas (TRIR, TWL), State Machines
      /---------------------\
```

---

## 2. CI/CD Quality Gates

Every Pull Request must satisfy the following automated criteria before merging:
1. **TypeScript Compilation:** `npm run lint` (`tsc --noEmit`) passes with zero type errors.
2. **Unit Test Coverage:** Vitest test suite achieves $\ge 85\%$ coverage on business services (`enterpriseDataStore`, `regionalComplianceService`, `simopsService`).
3. **Security Audit:** `npm audit` reveals zero High or Critical CVEs.
4. **Secret Scanning:** Zero hardcoded API keys detected by git-leaks / secret linter.
5. **SoD Automation Suite:** All Segregation of Duties regression tests pass.

---

## 3. Prioritized Master Test Catalog (25 Test Scenarios)

| Test ID | PRD Req | Priority | Objective | Preconditions | Test Steps | Expected Result |
|---|---|:---:|---|---|---|---|
| **TC-PTW-001** | FR-011 | **P1 (Critical)** | Verify Permit Receiver cannot self-authorize as Area Authority (SoD) | Logged in as Rahul Gupta (Permit Receiver) | 1. Open Permit `PTW-2026-8848`.<br>2. Attempt to sign Area Authority block. | Sign button is disabled. Attempted submission returns SoD violation error. |
| **TC-PTW-002** | FR-012 | **P1 (Critical)** | Verify permit authorization blocked by expired gas test certification | Welder cert expired on 2026-09-01 | 1. Assign uncertified worker.<br>2. Attempt permit issue. | System displays `"Expired Competency: AGT-098"` and locks authorization. |
| **TC-PTW-003** | FR-013 | **P1 (Critical)** | Verify SIMOPS clash blocks Hot Work within 15m of hydrocarbon venting | Active cold venting permit in Zone 1 | 1. Submit Hot Work welding permit in Zone 1.<br>2. Review SIMOPS matrix. | Clash warning triggered: `"Clash with Permit PTW-2026-8848"`; authorization locked. |
| **TC-PTW-004** | FR-014 | **P1 (Critical)** | Verify explosive LEL gas reading aborts permit issuance | Tester logs LEL = 5.0% | 1. Record gas test with LEL 5.0%.<br>2. Submit test reading. | Status flagged as `DANGER / EXPLOSIVE ATMOSPHERE`. Permit transitions to Suspended. |
| **TC-CAPA-001** | FR-021 | **P1 (Critical)** | Verify CAPA Assignee cannot self-verify and close action (SoD) | Logged in as Action Owner (Vikram) | 1. Navigate to assigned CAPA.<br>2. Attempt to mark status as 'Closed'. | System blocks closure. Action can only be marked 'Pending Verification'. |
| **TC-CAPA-002** | FR-020 | **P2 (High)** | Verify incident 5-Why actions synchronize to Central CAPA Register | New incident reported | 1. Complete 5-Why analysis.<br>2. Add corrective action.<br>3. Open CAPA module. | New action appears immediately in Central CAPA Register with source incident ID. |
| **TC-CAPA-003** | FR-022 | **P2 (High)** | Verify overdue CAPA triggers SLA compliance rate degradation | CAPA due date is 2026-10-01 | 1. Advance system clock.<br>2. View SLA compliance percentage. | SLA compliance drops from 95% to 94.6%; overdue badge rendered in red. |
| **TC-INC-001** | FR-001 | **P1 (Critical)** | Verify incident report persistence across full browser refresh | User reporting incident | 1. Fill 3-step incident form.<br>2. Submit incident.<br>3. Hard refresh browser. | Incident persists in list; `ad6_incidents` contains new record. |
| **TC-INC-002** | FR-002 | **P1 (Critical)** | Verify statutory 24-hour Form G countdown timer activation | New incident submitted | 1. Report Medium severity event.<br>2. View statutory tab. | Form G countdown timer displays active countdown ($< 24\text{ hours}$ remaining). |
| **TC-INC-003** | FR-003 | **P2 (High)** | Verify 5-Why root cause tree formulation saves correctly | Active investigation | 1. Enter 5 sequential why-answers.<br>2. Click Save Investigation Tree. | Data saved in incident state; confirmation alert displayed. |
| **TC-STAT-001** | FR-030 | **P2 (High)** | Verify jurisdiction switch updates statutory framework terminology | Set to Combined mode | 1. Switch active jurisdiction to 'Oman'. | All labels update to Oman Labour Law RD 53/2023, MD 286/2008, OMR currency. |
| **TC-STAT-002** | FR-031 | **P1 (Critical)** | Verify Oman summer midday work ban triggers between 12:30 and 15:30 | Date in July; time 13:00 | 1. Run compliance validation on outdoor permit in Oman. | System returns `NON_COMPLIANT: MD 286/2008 Summer Midday Break active`. |
| **TC-STAT-003** | FR-031 | **P1 (Critical)** | Verify Thermal Work Limit (TWL) < 115 W/m² triggers work stoppage | TWL sensor = 104 W/m² | 1. Input ambient TWL 104 W/m².<br>2. Check heat stress status. | System raises High Alert: `"PDO SP-1170 Mandatory Work Stoppage"`. |
| **TC-KPI-001** | FR-040 | **P1 (Critical)** | Verify TRIR dynamically recalculates when recordable incident is added | Exposure basis = 1M hrs | 1. View current TRIR.<br>2. Add 1 Medical Treatment Case.<br>3. Re-inspect TRIR. | TRIR dynamically increments; live data badge rendered. |
| **TC-KPI-002** | FR-040 | **P2 (High)** | Verify switching exposure basis from 1M to 200K scales formula correctly | TRIR = 0.24 on 1M | 1. Toggle exposure basis to '200K'. | TRIR card updates to $0.24 \times 0.2 = 0.048$; formula modal shows 200,000 multiplier. |
| **TC-AI-001** | FR-050 | **P1 (Critical)** | Verify AI generation calls server proxy without client key exposure | Dev tools network open | 1. Trigger AI RCA suggestion.<br>2. Inspect outgoing request. | Request posts to `/api/gemini/generate`; zero API keys visible in client headers. |
| **TC-AI-002** | FR-050 | **P2 (High)** | Verify 30-second proxy timeout allows completion of complex prompts | Server proxy active | 1. Submit long narrative prompt.<br>2. Observe response. | Request succeeds at 12s without triggering premature client abort. |
| **TC-AI-003** | FR-051 | **P1 (Critical)** | Verify human-in-the-loop review marker on AI suggestions | AI generated JSA | 1. View AI hazard controls.<br>2. Check persistence. | Data is marked as draft until user clicks `"Accept AI Suggestion"`. |
| **TC-RBAC-001** | NFR-003 | **P1 (Critical)** | Verify Field Technician cannot access Executive Board Pack view | User role = RECEIVER | 1. Attempt navigation to `/executive-dashboard`. | Server returns 403 Forbidden; UI redirects to My Work Cockpit. |
| **TC-OFFLINE-001** | NFR-002 | **P1 (Critical)** | Verify offline incident queuing and sync upon network reconnection | Device offline | 1. Set browser offline.<br>2. Submit incident report.<br>3. Set browser online. | Report queued in IndexedDB; sync engine uploads to server upon reconnection. |
| **TC-ESG-001** | FR-001 | **P2 (High)** | Verify Scope 1 and Scope 2 emissions calculate with Omani grid factors | 10,000 kWh entered | 1. Record electricity consumption in Fahud. | Emissions calculate as $10,000 \times 0.492 = 4,920\text{ kg }CO_2e$. |
| **TC-AUDIT-001** | NFR-005 | **P1 (Critical)** | Verify append-only audit trail logs status transition with SHA-256 | Action status edited | 1. Transition CAPA status.<br>2. Query `/api/audit/trail`. | Audit entry contains userId, previous status, new status, and hash digest. |
| **TC-RTL-001** | NFR-004 | **P3 (Medium)** | Verify complete Arabic RTL mirror layout rendering | Language = Arabic | 1. Toggle language to Arabic (العربية). | `dir="rtl"` applied, sidebar docked to right, Arabic typography rendered. |
| **TC-HIJRI-001** | NFR-004 | **P3 (Medium)** | Verify Dual Calendar toggles accurately between Gregorian and Hijri | Viewing audit date | 1. Open Dual Calendar selector. | Correct Hijri date calculated and displayed for GCC government filings. |
| **TC-SWA-001** | FR-001 | **P1 (Critical)** | Verify Stop Work Authority trigger halts all operations in sector | Active SWA submitted | 1. Press emergency SWA button.<br>2. State immediate hazard. | High-priority banner displayed across all connected site devices. |
