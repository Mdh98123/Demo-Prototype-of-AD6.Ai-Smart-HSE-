# AD6.Ai Smart HSE Platform — PWA Offline Synchronization & Conflict Resolution Policy
### Document Reference: `DOC-SYNC-POL-V2`
### Juridical Alignment: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143 Section 4.2)
### Target Guardrails: G-1 (Encrypted Queue, No Plain LocalStorage), G-3 (Feature Preservation), G-5 (No Auto-Approval)

---

## 1. Executive Summary & Objective

In remote desert concessions, offshore facilities, and heavy industrial fabrication sites across the Sultanate of Oman (PDO Interior Blocks, Sohar Port, Duqm Special Economic Zone), field frontline personnel operate under intermittent, high-latency, or zero-connectivity conditions. 

The **AD6.Ai PWA Offline Synchronization Engine (Phase 6 / Gap G5)** guarantees:
1. **Zero Data Loss:** Frontline incident submissions and safety observations are captured locally in an encrypted client-side IndexedDB queue.
2. **Deterministic Conflict Resolution:** Entity-specific strategies ensure life-safety data is never silently overwritten or discarded.
3. **Strict Segregation of Duties (SoD):** Offline actions (such as CAPA closure or PTW authorization) are re-validated against PostgreSQL security triggers upon reconnection. Unauthorized attempts are rejected with recorded audit trails and user notification.
4. **Idempotency Guarantee:** Retried network requests utilize deterministic idempotency keys (`idempotency_key`), preventing duplicate database records.

---

## 2. Entity-Level Synchronization & Conflict Strategies

| Entity Type | Conflict Strategy | Resolution Rule & Justification | Audit & Traceability |
|---|---|---|---|
| **Incident Reports** (`incidents`) | **Append-Only with Duplicate Flagging** | **Never Overwrite:** Every reported near-miss, injury, or environmental spill is accepted into the database. If a payload matches an existing report (same reporter, location, and narrative within 10 minutes), the server sets `duplicate_flag = TRUE` and flags it for human HSE officer consolidation. This prevents accidental suppression of vital eyewitness testimony. | Logged as `INCIDENT_SYNC_INGESTED` or `INCIDENT_SYNC_FLAGGED_DUPLICATE` in the append-only audit trail. |
| **Field Inspections** (`inspections`) | **Last-Writer-Wins Per Field (LWW-F)** | **Field-Level Granularity:** When two devices inspect the same facility section concurrently offline, the server compares field-level client timestamps (`client_updated_at`). The latest timestamp wins on a per-field basis. Both conflicting payloads and the merged diff are permanently stored in `sync_conflict_audits`. | Pre-resolution client payload, server payload, and resolved output preserved in `sync_conflict_audits` and `audit_log`. |
| **CAPA Management** (`capas`) | **Server-Authoritative with SoD Re-Validation** | **SoD Integrity is Non-Negotiable:** If a field worker queues a CAPA status change to `Closed` while offline, the sync endpoint re-executes the database trigger check (`enforce_capa_sod`). If `owner_name == verified_by_name`, the sync transaction **rejects** the closure, retains the previous open status on the server, notifies the worker, and logs `CAPA_SYNC_SOD_VIOLATION`. | Recorded in `audit_log` as an unauthorized closure attempt; client receives explicit feedback. |
| **Permits to Work** (`permits`) | **Server-Authoritative Multi-Party Gate** | **Life-Critical Safety Gate:** PTW gas test entries and LOTO isolation check-ins are merged into the permit history. Authorizations require validation against server-stored active role delegations (`role_delegations`). Self-authorization (receiver = issuer) is rejected. | Logged in `audit_log` with device identity and delegation ID. |

---

## 3. Client-Side Encryption & Queue Architecture

### 3.1 Web Crypto API (AES-GCM-256)
Field devices maintain an offline queue in IndexedDB (`ad6_offline_sync_db`). In accordance with **Guardrail G-1**, unencrypted domain payloads are never stored in plain browser storage.
- **Key Derivation:** At user authentication, a cryptographic key is derived using `crypto.subtle.deriveKey` (PBKDF2 with 100,000 iterations and per-device salt) or generated as an exportable non-extractable CryptoKey.
- **Payload Encryption:** Each queue item payload is serialized, encrypted with `AES-GCM` using a fresh 96-bit Initialization Vector (IV), and stored as ciphertext:
  ```typescript
  interface EncryptedSyncQueueRecord {
    id: string; // Client UUID
    idempotency_key: string;
    entity_type: 'INCIDENT' | 'INSPECTION' | 'CAPA' | 'PERMIT';
    device_id: string;
    client_timestamp: string;
    ciphertext: string; // Base64 AES-GCM ciphertext
    iv: string;         // Base64 12-byte IV
    status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'REJECTED_SOD';
    retry_count: number;
    error_reason?: string;
  }
  ```

---

## 4. Server Ingestion & Idempotency Pipeline

```
[ PWA Client (Reconnected) ]
           │
           │ POST /api/v1/sync/batch (Items with Idempotency Keys)
           ▼
[ Idempotency Deduplication Guard ] ──(Key Found?)──► [ Return Cached Response (idempotent: true) ]
           │ No
           ▼
[ Entity Dispatcher ]
    ├── INCIDENT ────► Append to incidents; evaluate duplicate heuristic; flag if duplicate
    ├── INSPECTION ──► Compare timestamps; execute Last-Writer-Wins per field; write conflict audit
    └── CAPA ────────► Check SoD triggers; if Action Owner == Closer ──► REJECT + Audit Log
           │
           ▼
[ Atomic Commit & Sync Audit ]
           │
           ▼
[ HTTP 200 OK Response: per-item status & resolution outcome ]
```

---

## 5. User Feedback & Exception Reporting

Frontline personnel are kept informed of sync state via the PWA `SyncStatusBar`:
1. **Connectivity Meter:** Live indicators for `ONLINE (4G/WiFi)`, `OFFLINE (Local Queue Active)`, and `SYNCING`.
2. **Pending Queue Count:** Number of items awaiting upstream transmission.
3. **Item Failure Reasons:** Clear, human-readable explanations when an item is rejected (e.g., *"CAPA #1042 Rejected: Action owner cannot self-verify closure per ISO 45001"*).
4. **Manual Retry Trigger:** Allows immediate queue flush when entering camp WiFi or satellite coverage zones.
