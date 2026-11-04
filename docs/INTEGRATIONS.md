# Integration Catalogue & External Interface Guide — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Integration Lead:** Senior Full-Stack & Cloud Integration Engineer  
**Security Standard:** Zero-Trust Ingress / Egress Control  

---

## 1. Verified Implemented Integrations

### 1.1 Google Gemini AI Platform (`@google/genai v1.42.0`)
- **Status:** **Implemented & Verified**
- **Purpose:** Multimodal incident classification, 5-Why root cause tree formulation, Safi conversational advice, and field audio transcription.
- **Architectural Boundary:** Invoked exclusively from backend `routes/geminiRouter.ts` via server environment variable `GEMINI_API_KEY`.
- **Primary Models Used:**
  - `gemini-3.8-flash`: Primary high-speed reasoning model for structured incident analysis and JSA generation.
  - `gemini-3.1-flash-lite`: Low-latency fallback model when primary encounters rate limits.
  - `gemini-3.5-transcribe`: High-fidelity audio speech-to-text for field observations.
- **Resilience:** Automatic 3-tier retry with exponential backoff and a 30-second abort controller.

### 1.2 Real-Time WebSocket Hub (`Socket.IO v4.8.3`)
- **Status:** **Implemented & Verified**
- **Purpose:** Low-latency bi-directional event broadcast for real-time Control Room incident alerts and SIMOPS clashes.
- **Implementation:** Integrated into `server.ts` listening for `'newIncident'`, broadcasting `'incidentUpdate'` to all active supervisory clients.

### 1.3 Interactive Geospatial GIS (`Leaflet v1.9.4` & `Leaflet.heat`)
- **Status:** **Implemented & Verified**
- **Purpose:** Concession risk heatmap rendering, asset GPS coordinate visualization, and SIMOPS spatial exclusion zones.
- **Components:** `components/GISMapModule.tsx`, `components/LocationSelector.tsx`.

### 1.4 Client-Side Evidence Generation (`jsPDF 2.5.1` & `XLSX 0.18.5`)
- **Status:** **Implemented & Verified**
- **Purpose:** Instant client-side compilation of Oman MoL 24-Hour Notice Form (MD 286/2008 Annex 1) statutory reporting packets, Oman MoL notices, and Excel CAPA registers.

---

## 2. Proposed Enterprise Integrations (Target State)

```mermaid
graph TD
    AD6[AD6.Ai Enterprise Core]

    subgraph Operational Portals [Government & Statutory]
        AlAdaa[Oman Ministry of Labour Digital Portal]
        OmanMoL[Oman Ministry of Labour Portal]
    end

    subgraph Field IoT [Industrial Field Telemetry]
        Weather[Desert Weather Stations: TWL & WBGT Index]
        GasSensors[Fixed Crowcon / Honeywell H2S & LEL Monitors]
        Turnstiles[Badge Turnstiles: Cumulative Safe Man-Hours]
    end

    subgraph Corporate IT [Enterprise ERP / CMMS]
        SAP[SAP S/4HANA Plant Maintenance / Work Orders]
        Maximo[IBM Maximo Asset Integrity]
        EntraID[Microsoft Entra ID: SAML 2.0 SSO]
    end

    AD6 <-->|Encrypted REST / XML| AlAdaa
    AD6 <-->|REST Webhook| OmanMoL
    Weather -->|MQTT / Modbus TCP| AD6
    GasSensors -->|OPC-UA / MQTT| AD6
    Turnstiles -->|REST Webhook| AD6
    AD6 <-->|OData / BAPI| SAP
    AD6 <-->|REST API| Maximo
    AD6 <-->|OIDC / SAML| EntraID
```

---

## 3. Integration Specifications

### 3.1 Desert Thermal Stress Weather Station Ingestion (IoT)
- **Protocol:** MQTT over TLS 1.3
- **Ingestion Frequency:** Every 10 minutes
- **Payload Schema:**
```json
{
  "stationId": "WX-FHD-06",
  "facilityCode": "OMN-FHD-01",
  "ambientTempC": 44.2,
  "relativeHumidity": 38.5,
  "windSpeedMps": 3.2,
  "twlWattsPerSqM": 108.4,
  "wbgtIndexC": 33.1,
  "timestamp": "2026-10-23T10:30:00Z"
}
```
- **Automated Rule:** If `twlWattsPerSqM < 115.0` or `wbgtIndexC >= 32.2`, trigger immediate broadcast stand-down notification to all active field work permits in that sector.

### 3.2 Enterprise CMMS Integration (SAP / IBM Maximo)
- **Direction:** Bi-directional synchronization.
- **Workflow:** When an incident RCA identifies an equipment failure (e.g., failed pump mechanical seal), the resulting CAPA creates a high-priority Maintenance Work Order (Order Type `PM01`) in SAP. Upon work order completion in SAP, the CAPA status in AD6.Ai transitions to `Pending Verification`.

---

## 4. Phase 7 Delivered Integration Adapters

### 4.1 Enterprise Identity & SCIM 2.0 User Provisioning
- **Location:** `apps/api/src/integrations/identity/`
- **Adapters:** `OidcSamlConnector.ts`, `ScimService.ts`
- **Supported Providers:** Microsoft Entra ID (Azure AD), Okta Enterprise, Keycloak (GCC Sovereign Cloud).
- **Documentation:** Complete matrix in `/docs/IDP_MATRIX.md`.
- **SCIM Endpoints:** `/api/v1/scim/v2/Users` with CRUD, pagination, and soft-deactivation.

### 4.2 IoT Weather Telemetry & TWL Worker (PDO SP-1170)
- **Location:** `apps/api/src/integrations/weather/`
- **Adapters:** `PublicWeatherProvider.ts` (live Open-Meteo), `MockWeatherProvider.ts`, `TwlEvaluationWorker.ts`.
- **Thermal Logic:** Computes wet bulb temperature (Stull formulation) and Thermal Work Limit (TWL) in W/m².
- **Permit Safety Gate:** Evaluates active TWL against the mandatory 115 W/m² withdrawal threshold per PDO SP-1170. If TWL < 115 W/m², logs `twl_breaches` and blocks permit activation.

### 4.3 ERP / Procurement Integration (SAP S/4HANA & IBM Maximo)
- **Location:** `apps/api/src/integrations/erp/`
- **Adapters:** `SandboxErpAdapter.ts` (with 10 contractor & 10 document fixtures), `LiveErpAdapter.ts` (skeleton with strict fail-closed security).
- **Features:** Contractor master sync, compliance document expiry sync, and byte-for-byte monthly HSE statistics export matching the official operator return template.

### 4.4 Multi-Channel Notification Outbox
- **Location:** `apps/api/src/integrations/notification/`
- **Adapters:** `TemplatedNotificationService.ts`, `MockNotificationProvider.ts`, `LiveNotificationProvider.ts`.
- **Channels:** Email (SendGrid/SMTP), SMS (Twilio), WhatsApp Business.
- **Templates:** Statutory Form G 24-hr escalation (MD 286/2008), CAPA overdue, TWL heat breach stand-down, Permit pending approval.
- **Auditing:** All attempts and delivery receipts persisted in `notification_outbox`.

---

## 5. Failure Modes, Dead-Letter Queues & Runbooks

| Integration Point | Failure Scenario | Automated Recovery Behavior | Manual Runbook Action |
|---|---|---|---|
| **Gemini AI API** | Quota exhausted / HTTP 429 | Failover to `gemini-3.1-flash-lite`. If both fail, return structured fallback template. | Verify billing credit in Google Cloud Console; increase quota limits. |
| **IoT Weather Stream** | Loss of station connectivity $> 30\text{m}$ | Default to conservative summer midday work stoppage policy (12:30–15:30 ban). | Site safety officer takes manual psychrometric / sling hygrometer reading. |
| **Live ERP Gateway** | Missing credentials or host unreachable | Fails closed with descriptive error; logs event in `erp_sync_logs`. | Configure `SAP_ODATA_ENDPOINT` and `SAP_CLIENT_SECRET`. |
| **Statutory Outbox** | Notification delivery failure | Recorded as `FAILED` in `notification_outbox` with error message for retry. | Re-dispatch or use manual email notification channel. |
