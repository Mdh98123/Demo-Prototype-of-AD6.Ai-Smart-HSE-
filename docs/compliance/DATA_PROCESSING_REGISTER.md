# Record of Processing Activities (RoPA) & Data Processing Register
### Platform: AD6.Ai Smart HSE Enterprise Platform
**Applicable Legal Frameworks:**
- Sultanate of Oman Personal Data Protection Law (Royal Decree 6/2022) & Executive Regulations
- Sultanate of Oman Ministry of Labour Ministerial Decision 286/2008 & Royal Decree 53/2023
- Kingdom of Saudi Arabia Personal Data Protection Law (Royal Decree M/19 1443H / Amended M/148)
- Petroleum Development Oman (PDO SP-1143 PTW, PDO SP-1170 TWL)
- ISO/IEC 27001:2022 & ISO/IEC 27701:2019

---

## 1. Controller & Processor Governance

| Role | Entity | Contact / Officer |
|---|---|---|
| **Data Controller** | Tenant Enterprise Operating Company (e.g. Concession Operator, EPC Contractor) | Designated Data Protection Officer (DPO) |
| **Data Processor** | AD6.Ai Enterprise Cloud Infrastructure & Processing Services | `dpo@ad6.ai` / Head of Information Security |
| **Supervisory Authorities** | Oman Ministry of Transport, Communications and Information Technology (MTCIT) / Ministry of Labour (MoL) | KSA Saudi Data & AI Authority (SDAIA) |

---

## 2. Inventory of Processing Activities

### Activity 1: Incident & Injury Management (Form G Statutory Notification)
- **Purpose**: Recording workplace accidents, dangerous occurrences, and occupational illnesses to comply with Oman Ministry of Labour statutory 24-hour reporting mandate (MD 286/2008).
- **Categories of Data Subjects**: Field personnel, subcontractor workers, eyewitnesses, injured workers.
- **Categories of Personal Data**:
  - Full Name, Civil ID / National ID / Passport Number
  - Trade / Job Title, Contractor Employer Name
  - Injury Details, Treatment Administered, Medical Certificates
  - Field-level encrypted medical notes (`medical_notes_encrypted`, AES-256-GCM)
  - Witness testimonies and audio statements
- **Lawful Basis**: Legal Obligation (Oman Labour Law RD 53/2023 Art. 109, MD 286/2008 Art. 16) and Vital Interests of the worker.
- **Retention Schedule**: 5 years for serious injuries and dangerous occurrences; 10 years for occupational diseases / chronic exposures.
- **Recipients**: Oman Ministry of Labour (MoL), Concession Operator HSE Directorate, Royal Oman Police (in fatal events).

### Activity 2: Control of Work & Safe Systems of Work (PTW & Isolations)
- **Purpose**: Authorizing high-risk energy isolation, confined space entry, hot work, and critical lifts under PDO SP-1143.
- **Categories of Data Subjects**: Permit Applicants, Area Authorities, Performing Authorities, Gas Testers.
- **Categories of Personal Data**: Signatory Name, Badge Number, Competency Certification ID, Digital Signature timestamp, GPS Location.
- **Lawful Basis**: Performance of Contract & Statutory Workplace Safety Obligations.
- **Retention Schedule**: 1 year post-permit closure (PDO SP-1143).
- **Recipients**: Operating Asset Managers, Independent Safety Auditors.

### Activity 3: Heat Stress & Thermal Work Limit Monitoring (TWL)
- **Purpose**: Safeguarding workers against thermal injury and heat exhaustion in GCC desert climates under PDO SP-1170 and Oman MoL mid-day work bans.
- **Categories of Data Subjects**: Work crews assigned to field asset clusters.
- **Categories of Personal Data**: Geo-location of work crews, hydration regime compliance, stop-work order acknowledgments.
- **Lawful Basis**: Protection of Vital Interests and Statutory Health Compliance.
- **Retention Schedule**: 3 years for continuous telemetry; 5 years for stop-work breach events.

### Activity 4: SCIM 2.0 User Identity & RBAC Lifecycle Management
- **Purpose**: Enterprise Single Sign-On, multi-factor authentication enforcement, and segregation of duties (SoD) governance.
- **Categories of Data Subjects**: Platform end-users (contractors, HSE officers, site managers, directors).
- **Categories of Personal Data**: Work Email, Full Name, Corporate ID, Enterprise Roles, MFA Token Status.
- **Lawful Basis**: Performance of Contract and Legitimate Enterprise Interests.
- **Retention Schedule**: Duration of employment + 5 years.

---

## 3. Technical & Organizational Safeguards (TOMs)

1. **Multi-Tenant Isolation**: PostgreSQL Row-Level Security (RLS) enforcing `tenant_id = current_setting('app.tenant_id')::uuid` on 100% of tenant tables.
2. **Field-Level Encryption**: AES-256-GCM field encryption for sensitive medical notes, national IDs, and witness identities.
3. **Cryptographic Audit Trail**: Append-only hash-chained ledger (`audit_ledger`) anchored with SHA-256 hashes that survives process restart.
4. **Segregation of Duties (SoD)**: Enforced both at application and database level (`chk_capa_sod_owner_not_verifier`, `chk_permit_sod_receiver_not_issuer`).
5. **AI Safety Gates**: Zero autonomous permit issuance or regulatory determination; mandatory human approval recorded with user ID and timestamp (`AIGovernanceCard`).
