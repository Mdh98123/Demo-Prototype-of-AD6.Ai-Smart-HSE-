# CURRENT_STATE.md — Architecture & System Baseline (Phase 0)
**Project:** AD6.Ai Smart HSE Enterprise Platform  
**Target Industrial Frameworks:** Sultanate of Oman (Ministry of Labour MD 286/2008, Royal Decree 53/2023, PDO SP-1143 PTW, PDO SP-1170 TWL) & GCC Industrial Concessions  
**Status:** Baseline Locked (Phase 0 Complete)

---

## 1. System Identity & Core Directives

The **AD6.Ai Smart HSE Enterprise Platform** is a regulated, life-safety industrial management suite providing field operations, hazardous work permitting, statutory incident reporting, barrier risk modeling, and corrective action workflows.

### Primary Directives:
1. **Field-First:** 60-second incident capture with offline envelope storage, multi-language (Arabic/English) support, and voice dictation.
2. **Statutory-First:** Sultanate of Oman Ministry of Labour Form G 24-hour statutory notification (MD 286/2008 & Royal Decree 53/2023) and PDO control-of-work specifications (SP-1143, SP-1170) are core workflows.
3. **AI-Assistive, Never Autonomous (G-5):** AI may summarize, draft, and extract. AI is strictly prohibited from authorizing permits, self-closing CAPAs, or determining regulatory compliance without recorded human approval.
4. **Segregation of Duties (SoD) Invariants:**
   - Permit Receiver cannot self-authorize as Area Authority / Issuer (PDO SP-1143).
   - Action Owner cannot self-verify and close their own CAPA (ISO 45001 / GCC Enterprise Safety Standard).
5. **Auditable Integrity:** Append-only cryptographic hash-chained audit ledger (SHA-256) tracking every state change.

---

## 2. Monorepo Architecture

The platform has been organized into modular packages:

```
/
├── apps/
│   ├── web/                    # React 19 Frontend Web Client
│   │   ├── src/
│   │   │   ├── api/client.ts   # HTTP API client for /api/v1/* (Zero localStorage domain imports)
│   │   │   └── index.tsx       # React root shell
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                    # Express 5 Backend Gateway
│       ├── src/
│       │   └── index.ts        # Router and middleware aggregator
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                 # Shared Cross-Tier Modules
│       ├── src/
│       │   ├── featureFlags.ts # Phase-driven feature flag registry
│       │   ├── rbac.ts         # Roles, permissions, and SoD invariants
│       │   ├── schemas.ts      # Shared Zod validation schemas
│       │   ├── types.ts        # Cross-tier TypeScript interfaces
│       │   └── index.ts        # Shared module barrel export
│       ├── package.json
│       └── tsconfig.json
├── infra/                      # Infrastructure & Migrations
│   ├── docker-compose.yml      # Multi-container local stack (api, postgres, minio)
│   ├── migrations-runner.mjs   # Migration runner with RLS and dry-run validation
│   └── README.md
├── components/                 # Established React 19 visual system & forms
├── contexts/                   # React contexts (Language, Tenant, User, Regional)
├── services/                   # Business logic, statutory channels, cryptographic ledger
├── routes/                     # Express 5 API routers (/api/v1/*, /api/gemini/*)
├── migrations/                 # PostgreSQL 16 migration SQL (up/down with RLS)
└── test/                       # Comprehensive Node test suites (38/38 passing)
```

---

## 3. Verified Features Baseline (Guardrail G-3)

The following eight capabilities are locked by automated regression tests in `test/phase0_g3_regression.test.mjs`:

| Ref | G-3 Feature | Implementation Location | Verified Contract |
|---|---|---|---|
| **G-3.1** | **5-Whys RCA** | `/components/RootCauseAnalysisTool.tsx` | 5-level sequential causal decomposition from immediate symptom to systemic root cause. |
| **G-3.2** | **Ishikawa / Fishbone** | `/components/RootCauseAnalysisTool.tsx` | 5M/1E categorization (People, Machine, Method, Material, Environment, Measurement). |
| **G-3.3** | **Bowtie Risk Analysis** | `/components/BowtieAnalysisTool.tsx` | Top event, hazard, preventative barriers (threat side), and mitigative barriers (consequence side). |
| **G-3.4** | **Safi AI Copilot** | `/routes/geminiRouter.ts` | Server-side proxied Gemini client with strict Oman legal citations and mandatory human-in-the-loop gates. |
| **G-3.5** | **PDO SP-1170 TWL** | `/services/regionalComplianceService.ts` | TWL < 115 W/m² triggers mandatory work stoppage; summer rest hours (12:30-15:30) enforced per MD 286/2008. |
| **G-3.6** | **PTW SoD Enforcement** | `/services/persistence/enterpriseRepository.ts` | Area Authority and Permit Receiver cannot be the same signatory; self-authorization is blocked. |
| **G-3.7** | **Form G PDF Export** | `/services/gccStatutoryReportingService.ts` | A4 statutory export compliant with Oman MoL 24-hour serious incident filing requirements. |
| **G-3.8** | **CAPA SLA Timer** | `/components/CAPAModule.tsx` | Target countdown timers, overdue detection, and independent verifier requirements before closure. |

---

## 4. Feature Flag System

Managed through `packages/shared/src/featureFlags.ts` and `services/featureFlags.ts`.

### Phase 0 Defaults:
```typescript
durablePersistence = false
statutoryClock = false
auditLogV2 = false
sodDbEnforced = false
aiGates = false
offlineSyncV2 = false
integrations = false
```

Every subsequent phase flips exactly one flag in sequence, ensuring strictly incremental and auditable progression.

---

## 5. Storage & Persistence Architecture

1. **Storage Decoupling (Guardrail G-1):**
   - No business domain records (incidents, permits, CAPAs, audits) are persisted directly in raw `localStorage`.
   - Client domain operations communicate via `/api/v1/*` or enqueue in `EncryptedOfflineQueue` (`ad6_offline_submission_queue_enc`).
2. **Cryptographic Audit Ledger:**
   - Durable append-only log located at `data/audit_ledger.jsonl`.
   - Every state transition computes `hash = SHA256(sequenceId | timestamp | tenantId | actorId | action | entityType | entityId | payloadHash | prevHash)`.
   - Chain verification API at `/api/v1/audit-ledger/verify` and export at `/api/v1/audit-ledger/export`.
3. **Database Schema & Row-Level Security (G-6):**
   - Migration `migrations/0001_enterprise_rls_schema.up.sql` defines 6 tenant tables (`users`, `incidents`, `permits`, `capas`, `audits`, `audit_ledger_log`).
   - Every tenant table has `tenant_id UUID NOT NULL REFERENCES tenants(id)`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`, and an active tenant isolation policy.

---

## 6. Test Suite & Verification

The test harness runs with native Node.js test runner:
```bash
# Run all 38 regression tests:
npm test

# Run G-3 feature lock tests:
npm run test:g3

# Run static typecheck:
npm run typecheck

# Run codebase lint:
npm run lint

# Run migration dry-run:
node infra/migrations-runner.mjs --dry-run
```

All 38 test assertions pass cleanly with zero warnings or errors.
