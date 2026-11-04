# Personal Data Breach Response & Statutory Notification Runbook
### Platform: AD6.Ai Smart HSE Enterprise Platform
**Statutory SLA**: Maximum 72 hours to notify Oman MTCIT / MoL / Saudi SDAIA; Maximum 36 hours from Processor to Tenant Controller.

---

## 1. Incident Severity Triage Matrix

| Severity | Definition | Notification Trigger |
|---|---|---|
| **P1 - Critical** | Unauthorized exfiltration of worker medical notes, national civil IDs, or systemic tenant isolation breach. | Immediate executive escalation; 36-hr Controller notice; 72-hr Regulator notice. |
| **P2 - Major** | Exposure of non-medical operational data (PTW schedules, contractor compliance documents). | Escalation within 4 hours; Controller notification within 48 hours. |
| **P3 - Minor** | Isolated credential lockout or rate-limiter anomalous spike without data leakage. | Handled internally by SecOps; documented in quarterly security log. |

---

## 2. Five-Phase Response Workflow

```
[Phase 1: Detection & Triage] (0 - 2 Hours)
  ├── Automated SIEM / WAF alert or user report
  ├── SecOps lead initiates Incident Response Room
  └── Forensic snapshot of affected container & database state

[Phase 2: Containment & Isolation] (2 - 6 Hours)
  ├── Revoke compromised session tokens via SessionService.revokeAllSessions()
  ├── Rotate field encryption master keys via SecretsManager
  └── Apply network perimeter isolation if container compromised

[Phase 3: Impact Analysis & Forensics] (6 - 24 Hours)
  ├── Query audit_ledger using verifyAuditChain() to trace exact exfiltration scope
  ├── Identify affected data subjects (workers, contractors, tenants)
  └── Determine whether encrypted data tags were decrypted

[Phase 4: Statutory & Controller Notification] (24 - 48 Hours)
  ├── Transmit formal Breach Notification to Tenant DPO
  ├── Submit Form N-1 to Oman MTCIT & Ministry of Labour
  └── Provide recommended mitigation actions for affected workers

[Phase 5: Eradication & Post-Incident Review] (48 - 72 Hours)
  ├── Patch vulnerability and run regression test suite
  ├── Issue Root Cause Analysis (RCA) with 5-Whys methodology
  └── File permanent record in the tamper-evident audit ledger
```

---

## 3. Statutory Authority Contact Points

- **Oman Ministry of Transport, Communications and Information Technology (MTCIT)**:
  - Cyber Defence Centre (OCERT): `incident@cert.gov.om` / +968 2416 6800
- **Oman Ministry of Labour (MoL)**:
  - Occupational Safety Directorate: `hse-inspection@mol.gov.om`
- **Saudi Data & AI Authority (SDAIA)**:
  - National Data Management Office: `privacy@sdaia.gov.sa`
