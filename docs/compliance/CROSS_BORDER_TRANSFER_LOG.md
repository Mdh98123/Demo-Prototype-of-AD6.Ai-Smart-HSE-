# Cross-Border Data Transfer Log & Sovereignty Register
### Platform: AD6.Ai Smart HSE Enterprise Platform
**Regulatory Anchors**:
- Sultanate of Oman Personal Data Protection Law (RD 6/2022) Article 23 (Transfer of Personal Data Outside the Sultanate)
- Sultanate of Oman Ministry of Transport, Communications & Information Technology (MTCIT) Cloud Policy
- Kingdom of Saudi Arabia PDPL Article 29 & Transfer Regulations (SDAIA)

---

## 1. Data Sovereignty & Localization Architecture

| Data Tier | Storage Mechanism | Residency Constraint | Status |
|---|---|---|---|
| **Core Operational Data** (Incidents, Permits, CAPAs, Inspections) | PostgreSQL 16 with RLS | **Strictly In-Country** (Oman / KSA Sovereign Region) | **Compliant** |
| **Personal Identifiers & Medical Data** | AES-256-GCM Field-Level Encrypted | **Strictly In-Country**; Keys managed via local KMS | **Compliant** |
| **Audit Ledger & Hash Chains** | Append-Only On-Disk Database | **Strictly In-Country** | **Compliant** |
| **Transient Weather Telemetry** | In-Memory / PostgreSQL | GCC Regional Open Data / Local Sensor Feed | **Compliant** |
| **AI Inference Payload (LLM Assist)** | Server-side Ephemeral Proxy | Stateless LLM API Call | **Governed Transfer** |

---

## 2. Transfer Assessment: AI Inference Proxy

- **Data Exporter**: AD6.Ai Enterprise Gateway (Server-Side Proxy `/api/gemini/*`)
- **Data Importer**: Google Gemini / Vertex AI Enterprise Cloud Endpoint
- **Data Categories Transferred**: Incident descriptions, checklist items, draft investigation questions.
- **Data Excluded (Redacted prior to transit)**:
  - ❌ Worker Civil IDs and National Identification Numbers
  - ❌ Worker Full Legal Names (tokenized as `Worker_1`, `Worker_2`)
  - ❌ Raw Medical Records & Doctor Diagnosis Notes
- **Transfer Mechanism**:
  - Encrypted TLS 1.3 in transit with mutual authentication.
  - Zero-Data Retention (ZDR) enterprise agreement: customer prompts and completions are NOT logged or used for model fine-tuning.
- **Risk Assessment**: Low residual risk; high utility for field safety extraction and hazard categorization.
