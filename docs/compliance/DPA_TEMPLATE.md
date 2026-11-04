# Enterprise Data Processing Agreement (DPA) Template
### Standard GCC Terms for Regulated Industrial & Concession Tenants
**Governing Laws**: Sultanate of Oman (RD 6/2022) / Kingdom of Saudi Arabia (RD M/19)

---

## 1. Scope & Definitions
- **"Customer Personal Data"**: Any personal data processed by AD6.Ai on behalf of Customer in connection with the HSE Platform Services.
- **"Applicable Data Protection Law"**: Oman Royal Decree 6/2022 (PDPL), Saudi Arabia PDPL, and relevant Gulf Cooperation Council sectoral directives.
- **"Sub-processor"**: Any third party appointed by AD6.Ai to process Customer Personal Data.

## 2. Customer as Controller & AD6.Ai as Processor
1. The Customer acts as the Data Controller, determining the purposes and lawful bases of processing under Oman Labour Law (RD 53/2023) and MoL Ministerial Decision 286/2008.
2. AD6.Ai acts solely as Data Processor, processing Customer Personal Data strictly pursuant to Customer's documented instructions.

## 3. Mandatory Security Standards
AD6.Ai warrants that it implements and maintains appropriate technical and organizational measures:
1. **In-Country Data Residency**: Production databases are hosted within the designated sovereign territory (e.g. Sultanate of Oman or KSA) as specified in the Tenant Concession Agreement.
2. **Field-Level Encryption**: Sensitive identifiers, national IDs, and medical notes are protected by AES-256-GCM encryption at rest.
3. **Multi-Tenant Logical Isolation**: Enforced via PostgreSQL Row-Level Security (RLS) with dedicated tenant context isolation per query.
4. **Append-Only Tamper-Evident Audit Logging**: All mutations, approvals, and access events are recorded to a hash-chained ledger.

## 4. Sub-processors
1. Current Authorized Infrastructure Sub-processors:
   - Primary Cloud Hosting: Sovereign Cloud GCC Region (Oracle Cloud Muscat / AWS Bahrain / Azure UAE)
   - LLM Inference Proxy: Google Vertex AI (stateless, zero customer data retention for model training)
2. Notification: AD6.Ai shall provide 30 days prior written notice before onboarding any new sub-processor.

## 5. Data Subject Rights & Support
AD6.Ai provides automated Subject Access Request (SAR) extraction tooling (`SubjectAccessService`) enabling the Controller to generate complete machine-readable portability exports within the statutory deadline.

## 6. Personal Data Breach Notification
In the event of a confirmed Personal Data Breach, AD6.Ai shall notify Customer without undue delay and in any event within **36 hours** of becoming aware of the breach, providing the information required for statutory notification to MTCIT and MoL.

## 7. Data Deletion & Return
Upon contract termination or expiry of the statutory retention period (e.g., 5 years for injuries, 1 year for permits), AD6.Ai shall securely purge or return all Customer Personal Data in accordance with the documented Retention Policy, generating an audited cryptographic proof of deletion.
