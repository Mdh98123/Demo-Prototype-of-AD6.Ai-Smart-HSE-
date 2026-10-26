# API Architecture & Endpoint Contracts — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Base URL:** `https://<domain>/api` (Development: `http://localhost:3000/api`)  
**Specification Standard:** OpenAPI 3.1.0  
**Authentication Scheme:** Bearer JWT / Server Session Token  
**Content-Type:** `application/json` (Multipart for evidence media)  

---

## 1. API Architecture & Standards

### 1.1 Design Conventions
- **RESTful Resource URIs:** Nouns in plural (`/api/incidents`, `/api/permits`, `/api/capas`).
- **Idempotency:** `PUT` and `PATCH` operations support `Idempotency-Key` headers for network-resilient field sync.
- **Consistent Response Envelope:**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-10-23T06:30:00Z",
    "correlationId": "req-98f2-4bc1",
    "version": "v1"
  }
}
```

### 1.2 Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "SOD_VIOLATION",
    "message": "Segregation of Duties: Permit Receiver cannot authorize as Area Authority Issuer.",
    "targetField": "issuerSignature",
    "regulatoryReference": "PDO SP-1143 PTW Specification Clause 4.2"
  }
}
```

---

## 2. Verified Implemented Endpoints vs. Proposed Contracts

| Method | Path | Status | Purpose & Role Requirement |
|---|---|---|---|
| `GET` | `/healthz` | **Implemented** | Root container liveness probe (Unauthenticated). |
| `GET` | `/api/healthz` | **Implemented** | System readiness probe (Checks DB, Memory, Gemini). |
| `POST` | `/api/gemini/generate` | **Implemented** | Server-side structured generation proxy (30s timeout). |
| `POST` | `/api/gemini/chat` | **Implemented** | Multi-turn Safi AI Copilot streaming/chat endpoint. |
| `POST` | `/api/audit-log` | **Implemented** | Append-only system action audit ingestion. |
| `GET` | `/api/audit/trail` | **Implemented** | Retrieve recent audit records (Auditor / Admin only). |
| `POST` | `/api/auth/verify-access` | **Implemented** | Server-side RBAC and SoD permission evaluator. |
| `GET` | `/api/incidents` | **Proposed** | Paginated incident list with jurisdiction filter. |
| `POST` | `/api/incidents` | **Proposed** | Submit new incident report and trigger statutory clock. |
| `POST` | `/api/permits/:id/authorize`| **Proposed** | Area Authority digital signature with SoD check. |
| `PATCH`| `/api/capas/:id/status` | **Proposed** | Transition action status with verification evidence. |

---

## 3. Core Endpoint Specifications

### 3.1 AI Generation Proxy
- **Operation ID:** `generateGeminiContent`
- **Method / Path:** `POST /api/gemini/generate`
- **Auth:** Required (Active User Session)
- **Request Body:**
```json
{
  "prompt": "Analyze the following incident description for SIF precursors...",
  "contents": [ ... ],
  "model": "gemini-3.8-flash",
  "config": {
    "temperature": 0.2,
    "responseMimeType": "application/json"
  },
  "isJson": true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "model": "gemini-3.8-flash",
  "data": {
    "classification": "Lost Time Injury",
    "sifPrecursor": true,
    "confidenceScore": 0.94,
    "suggestedBarriers": [
      "Secondary mechanical whip-check restraints",
      "Isolation of hydraulic accumulator pressure"
    ]
  },
  "timestamp": "2026-10-23T06:30:00Z"
}
```

### 3.2 Server-Side Access Verification & SoD
- **Operation ID:** `verifyAccessAndSoD`
- **Method / Path:** `POST /api/auth/verify-access`
- **Request Body:**
```json
{
  "userId": "usr-rahul-gupta",
  "role": "PERMIT_RECEIVER",
  "requestedView": "PERMIT_TO_WORK",
  "requestedPermission": "ptw:authorize_issuer",
  "entityContext": {
    "permitId": "PTW-2026-8848",
    "receiverId": "usr-rahul-gupta"
  }
}
```
- **Response (403 Forbidden - SoD Block):**
```json
{
  "authorized": false,
  "reason": "Segregation of Duties Violation: Receiver cannot sign as Issuer",
  "sodViolation": true
}
```

---

## 4. Rate Limiting & Abuse Prevention

- **Standard API Endpoints:** 300 requests per minute per IP address.
- **AI Gateway (`/api/gemini/*`):** 30 requests per minute per user identity; burst buffer of 5 concurrent requests.
- **File Uploads (`/api/evidence/upload`):** Maximum $50\text{MB}$ per multi-part request; MIME types strictly validated against magic numbers (JPEG, PNG, WEBP, PDF only).
