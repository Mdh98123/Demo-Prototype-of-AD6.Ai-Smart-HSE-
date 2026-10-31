# Enterprise HSE Platform - Comprehensive Architecture Specifications

This repository contains the production-ready specifications, code scaffolds, configuration files, and architectural documentation implementing the full HSE platform vision for the Oman/GCC market.

## Included Artifacts

### 0. Foundational Blueprint & Prototype Gap Analysis
*   **`00_Enterprise_HSE_Operations_Platform_Blueprint.md`**: The master architectural blueprint, GCC regulatory framework (Oman, Oman, KSA, Qatar, Bahrain, Kuwait), prototype gap analysis (GAP-01 through GAP-12), and engineering transformation roadmap for enterprise-grade HSE operations across high-consequence industries.

### 1. Database & Security
*   **`01_Database_Schema_RLS.prisma`**: Defines the core relational data model utilizing PostgreSQL. Crucially, it documents the integration of Row-Level Security (RLS) necessary for strict data residency and multi-tenancy as mandated by KSA SACS-002.

### 2. API & Integration
*   **`02_API_OpenAPI_Spec.yaml`**: The OpenAPI 3.1 specification outlining the API-first design. It includes SAML 2.0/OAuth2 SSO configurations and endpoints for core workflows like SIMOPS conflict detection in Permit-to-Work (PTW) issuance.
*   **`07_Kafka_Event_Schema.json`**: JSON Schema defining the asynchronous event payload structure for the Kafka/RabbitMQ event-driven backbone, ensuring reliable cross-module communication.

### 3. Compliance & Governance
*   **`03_Compliance_Mapping.md`**: Directly maps the technological implementations (e.g., PostGIS SIMOPS, RLS, TLS 1.3) to the regional regulatory requirements (Oman MoL MD 286/2008, PDO HSE-MS, SACS-002, Oman National Cybersecurity Framework).

### 4. Artificial Intelligence & Analytics
*   **`04_AI_Architecture.md`**: Breaks down the three distinct AI tiers: Edge AI (<300ms computer vision), Generative AI (RAG-based Copilot for HIRA/Method Statements), and Leading-Indicator Analytics (Wearable IoT forward modeling).
*   **`08_EdgeAI_Configuration.yaml`**: Configuration scaffold for deploying optimized TensorRT object detection models (PPE, red-zone incursion) to edge devices (e.g., NVIDIA Jetson) with MQTT event publishing.

### 5. User Experience & Workflows
*   **`05_UX_Workflows.md`**: UX guidelines focusing on the mandated atomic design system, WCAG 2.1 AA accessibility, and the crucial "two-click critical path" for high-frequency field operations like offline incident reporting and biometric PTW approvals.

### 6. Infrastructure & Deployment
*   **`06_Kubernetes_Orchestration.yaml`**: Kubernetes deployment configurations targeting Azure Kubernetes Service (AKS). Includes pod resource limits, liveness/readiness probes, and an NGINX Ingress controller configured with ModSecurity WAF for regional compliance.

## Implementation Guidelines

1.  **Strict Adherence**: These documents form the source of truth based on the "Strategic Architecture".
2.  **Multi-Tenancy**: Do not bypass the RLS policies defined in the database layer. All backend services must inject the `X-Tenant-ID` into the database transaction context.
3.  **Edge Processing**: Ensure that computer vision nodes strictly discard video frames after metadata extraction to comply with worker privacy standards in the GCC.
