# Compliance & Regulatory Mapping Document

As dictated by the Strategic Architecture, this document maps regional GCC requirements to specific technical implementation layers within the platform.

## 1. Data Residency & Privacy
**Standard:** KSA SACS-002 / UAE IA Standard v2.0
**Requirement:** Strict data localization and isolation.
**Technical Implementation:**
- **Hosting:** Azure UAE (Dubai/Abu Dhabi) or local KSA data centers.
- **Database:** PostgreSQL with Row-Level Security (RLS) ensuring Tenant A cannot query Tenant B's data even on the application backend layer.
- **Encryption:** AES-256 for data at rest. TLS 1.3 in transit.

## 2. ADOSH-SF (Abu Dhabi Occupational Safety and Health System Framework)
**Standard:** ADOSH-SF v4.0
**Requirement:** Mandatory OSH risk management, incident notification, and auditing.
**Technical Implementation:**
- **Risk Management Module:** Pre-configured with 5x5 Risk Matrix templates mandated by ADOSH.
- **Copilot Agent:** GenAI trained on ADOSH-SF codes of practice to validate Method Statements.
- **Reporting Engine:** Automated extraction to OSHAD required XML/PDF forms.

## 3. ADNOC HSE-MS & KOC Standards
**Standard:** ADNOC HSE Management System & Kuwait Oil Company regulations.
**Requirement:** Rigorous PTW systems, SIMOPS (Simultaneous Operations) management, Life Saving Rules (LSR).
**Technical Implementation:**
- **SIMOPS Engine:** Spatial computation using PostGIS. If PTW A (Hot Work) intersects geometrically and chronologically with PTW B (Confined Space), the API returns a `409 Conflict` and halts issuance.
- **Contractor Prequalification:** Automated vetting workflows before badge access is granted.

## 4. Accessibility & UI
**Standard:** WCAG 2.1 AA
**Requirement:** Inclusive design, accessible to all workers.
**Technical Implementation:**
- **Atomic Design System:** Built on Shadcn UI/Radix primitives which natively support screen readers (ARIA).
- **Localization:** Arabic RTL (Right-to-Left) rendering enforced at the root DOM level.
- **High Contrast:** Verified contrast ratios in Light/Dark modes.

## 5. ESG & Decarbonization Reporting (Oman & UAE Standards)
**Standards:**
- **UAE:** Abu Dhabi Securities Exchange (ADX) ESG Disclosure Guidance (31 Core Indicators), Dubai Financial Market (DFM) ESG Reporting Guide (30 Metrics), SCA Corporate Governance Decision 3/RM 2020 (Female Board Representation), MOHRE Emiratisation (Tawteen & Nafis).
- **Oman:** Muscat Stock Exchange (MSX) ESG Reporting Guidelines, Capital Market Authority (CMA) Code of Corporate Governance, Oman Environment Authority (EA - Royal Decree 114/2001), Ministry of Labour Omanisation Quotas, Ministry of Energy & Minerals (MoEM) Tawreed / In-Country Value (ICV Oman).
- **International:** GHG Protocol Corporate Accounting Standard (Scopes 1, 2, 3), GRI Universal Standards 2021, ISSB IFRS S1/S2, ISAE 3000 (Revised) Limited Assurance.
**Technical Implementation:**
- **Carbon Accounting Engine:** `services/esgEmissionFactors.ts` provides certified regional grid factors (DEWA 0.416, EWEC 0.395, Nama Oman 0.468 kgCO2e/kWh) with automated conversion from activity data to metric tonnes CO2e.
- **Logical Validation Service:** `services/esgValidationService.ts` evaluates boundary definitions, grid factor mismatches, Omanisation & Emiratisation statutory deficits, 100% Wage Protection System (WPS) electronic compliance, and 0-incident Summer Midday Work Ban adherence.
- **Export & Reporting Engine:** `services/esgReportingService.ts` generates board-ready executive PDF disclosures (`jspdf`), multi-tab audit workbooks (`xlsx`), and machine-readable regulatory JSON schema for direct electronic portal filings.
- **AI ESG Advisor:** `services/geminiService.ts` runs automated compliance gap analysis and provides enterprise-grade recommendations following the required Enterprise Response Framework.

