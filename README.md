# AD6.Ai Smart HSE Enterprise Platform

> **Next-generation, full-stack QHSE & ESG compliance and operations platform** engineered for enterprise industrial environments across the Sultanate of Oman and the GCC (Oil & Gas, LNG, Petrochemicals, Power & Utilities, Mining, Ports, and Manufacturing). Powered by the **Safi AI Copilot**, predictive SIF risk intelligence, dynamic safety barrier gating, and strict Segregation of Duties.

---

## 1. Executive Summary & Capabilities

The **AD6.Ai Smart HSE Enterprise Platform** is a digital operations platform aligning with **ISO 45001, ISO 14001, ISO 9001, GRI, and IFRS S1/S2** standards, localized specifically for Omani and Oman industrial statutory frameworks:
- **Sultanate of Oman**: Oman Labour Law (Royal Decree 53/2023), Ministerial Decision 286/2008, PDO SP-1143 (PTW Specification) & SP-1170 (Thermal Stress Management - mandatory stop when TWL < 115 W/m²), Environment Authority RD 114/2001, and MSX/FSA ESG guidelines.
- **Sultanate of Oman**: Oman Ministry of Labour Occupational Safety & Health Regulations (MD 286/2008 & RD 53/2023), PDO HSE Specifications (SP-1143 / SP-1170), and MoL Midday Break regulations (12:30–15:00 from June 15 to Sept 15).

### Key Functional Capabilities
1. **Safi AI Copilot & Voice Transcription:** Server-proxied multimodal reasoning assistant for incident classification, 5-Why root cause analysis (RCA), Ishikawa fishbone mapping, and hands-free field audio logging.
2. **Control of Work (PTW) & SIMOPS Engine:** Real-time safety barrier enforcement blocking permit authorization if worker competencies are expired, contractor is suspended, or hazardous gas thresholds are exceeded.
3. **Strict Segregation of Duties (SoD):** Built-in custody separation preventing Permit Receivers from self-authorizing permits, and preventing CAPA action owners from self-closing their own corrective actions.
4. **Thermal Stress & Heat Monitoring:** Automated midday work ban tracking and PDO SP-1170 Thermal Work Limit (TWL) index monitoring (< 115 W/m² stop limit).
5. **Incident & CAPA Lifecycle:** End-to-end incident capture with statutory 24-hour Form G countdown, direct RCA-to-CAPA synchronization, and SLA aging tracking.
6. **Live Executive Analytics:** Dynamically calculated TRIR and LTIFR based on live incident records and configurable 1,000,000-hour (GCC/PDO) vs. 200,000-hour (OSHA) exposure bases.
7. **Enterprise Carbon & ESG Accounting:** Scope 1, 2, and 3 GHG accounting, water, waste manifests, and Oman Vision 2040 net-zero trajectory modeling.
8. **Field Worker PWA:** Offline-tolerant inspection and hazard reporting designed for high-glare desert environments with biometric/device integration.

---

## 2. Technical Stack Inventory

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `19.2.4` | Component architecture & modern hooks |
| **Language** | TypeScript | `5.8.3` | End-to-end static type safety |
| **Build & Dev Tool** | Vite | `6.4.1` | Instant HMR and optimized asset bundling |
| **Styling & Design** | Tailwind CSS | Utility | Light glassmorphism & responsive desert UI |
| **Icons & Visuals** | Lucide React | `0.561.0` | Industrial iconography set |
| **Charts & Metrics** | Recharts | `3.8.1` | Live executive dashboards & sparklines |
| **GIS & Heatmaps** | Leaflet & Leaflet.heat | `1.9.4` | Concession spatial coordinates & risk mapping |
| **Backend Gateway** | Express | `5.2.1` | API Gateway, WebSocket hub, and AI proxy |
| **Real-time Engine** | Socket.IO | `4.8.3` | Bi-directional multi-client incident broadcast |
| **AI SDK & Model** | `@google/genai` | `1.42.0` | Gemini 3.8 Flash & Gemini 3.1 Flash-Lite |
| **Document Export** | jsPDF & XLSX | `2.5.1` / `0.18.5` | Form G statutory PDF and Excel register export |

---

## 3. Project Documentation Index

Comprehensive technical documentation is maintained in the [`docs/`](./docs) directory:

| Document | File Path | Scope & Purpose |
|---|---|---|
| **Product Requirements** | [`docs/PRD.md`](./docs/PRD.md) | Personas, user journeys, functional requirements (FR), NFRs, traceability matrix |
| **Design System** | [`docs/DESIGN.md`](./docs/DESIGN.md) | Design tokens, typography, glassmorphism UI, WCAG 2.2 AA, Arabic RTL |
| **Architecture** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System overview, C4 diagrams, request lifecycle, ADRs |
| **Database & Schema** | [`docs/DATABASE.md`](./docs/DATABASE.md) | Storage assessment, PostgreSQL schema, RLS policies, Mermaid ERD |
| **API Contracts** | [`docs/API.md`](./docs/API.md) | Endpoint inventory, request/response schemas, OpenAPI mapping |
| **Project Roadmap** | [`docs/PROJECT_IMPLEMENTATION.md`](./docs/PROJECT_IMPLEMENTATION.md) | 7-phase WBS, milestones, risk register, production roadmap |
| **Setup & Deployment** | [`docs/SETUP.md`](./docs/SETUP.md) | Prerequisites, local dev startup, Docker containerization, Cloud Run |
| **Feature Development** | [`docs/FEATURE_DEVELOPMENT.md`](./docs/FEATURE_DEVELOPMENT.md) | Engineering playbook, SoD rules, storage sync, feature template |
| **Auth & Security** | [`docs/AUTHENTICATION_SECURITY.md`](./docs/AUTHENTICATION_SECURITY.md) | Threat model, RBAC/ABAC matrix, SoD enforcement, OWASP ASVS |
| **MCP Integration** | [`docs/MCP_CONNECTION.md`](./docs/MCP_CONNECTION.md) | Model Context Protocol server architecture, tools, and security |
| **External Interfaces**| [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md) | Gemini AI, IoT weather stations, turnstiles, SAP CMMS |
| **Testing & QA** | [`docs/TESTING_QA.md`](./docs/TESTING_QA.md) | QA pyramid, CI gates, 25 prioritized master test cases |
| **Diagnostics Manual** | [`docs/DEBUGGING.md`](./docs/DEBUGGING.md) | Troubleshooting playbooks in Symptom ➔ Diagnosis ➔ Resolution format |

---

## 4. Quick Start Guide

### Prerequisites
- Node.js `v20.6.0` or higher
- npm `v9.x` or higher
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation & Startup
```bash
# 1. Clone repository
git clone https://github.com/Mdh98123/Demo-Prototype-of-AD6.Ai-Smart-HSE-.git
cd Demo-Prototype-of-AD6.Ai-Smart-HSE-

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Insert your GEMINI_API_KEY into .env

# 4. Start development server (Port 3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 5. Security & Responsible Disclosure

If you discover a potential security vulnerability, please report it directly to the security team rather than creating a public issue. We adhere to responsible disclosure principles and provide remediations within statutory SLAs.
