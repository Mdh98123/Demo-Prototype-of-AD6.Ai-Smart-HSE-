# Feature Development Lifecycle & Engineering Playbook — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Target Audience:** Senior Full-Stack Engineers, AI Specialists, QA Engineers  
**Engineering Standard:** Regulated Safety Software Lifecycle  

---

## 1. Feature Development Lifecycle (FDLC)

Every feature added to the AD6.Ai Smart HSE platform must follow a disciplined 8-stage lifecycle to protect system stability, statutory compliance, and data integrity:

```
[1. Intake & Safety Classification]
           │
[2. Regulatory & SoD Impact Analysis]
           │
[3. Technical Specification (RFC)]
           │
[4. Implementation & Storage Sync]
           │
[5. AI Safety & Grounding Controls]
           │
[6. Automated Testing (Unit, SoD, WCAG)]
           │
[7. Peer Code Review & ASVS Check]
           │
[8. Staged Release & Audit Logging]
```

---

## 2. Mandatory Architectural Guardrails

### 2.1 Storage Sync Rule
- Any mutation affecting Incidents, Permits, or CAPAs **must** update both the canonical key (`ad6_*`) and legacy key (`ad6_enterprise_*`).
- The mutation **must** dispatch the corresponding CustomEvent (`ad6-incidents-updated`, `ad6-permits-updated`, `ad6-capas-updated`) to trigger reactive UI updates across all open views.

### 2.2 Segregation of Duties (SoD) Rule
- If the feature introduces approval, sign-off, or closure, the author/assignee and the verifier/authorizer **must** be enforced as distinct roles.
- UI buttons must be disabled when SoD is violated, and the backend route must return `403 Forbidden`.

### 2.3 AI Safety & HITL Rule
- Features that generate safety recommendations, risk ratings, or investigation steps **must** use `AIGovernanceCard` with human-in-the-loop confirmation controls.
- AI features must route through `/api/gemini/generate` on the backend, never calling external AI SDKs directly from client components.

---

## 3. Reusable Feature Specification Template

```markdown
# Feature Specification: [Feature ID] - [Feature Title]

## 1. Business Objective & HSE Rationale
- **Problem Statement:** What field safety gap or compliance friction does this solve?
- **Regulatory Framework:** Which clause of ISO 45001, OSHAD, or Oman MoL applies?

## 2. User Story & Personas
- **As a** [Role / Persona]
- **I want to** [Perform Action]
- **So that** [Safety or Business Outcome Achieved]

## 3. Technical Design & Architecture Impact
- **Affected Components:** Which `.tsx` files are created or modified?
- **Services & Storage:** What keys or database tables are read/written?
- **API Contracts:** Any new routes or schema additions in `server.ts`?
- **Segregation of Duties Check:** Does this action require independent approval?

## 4. Test Scenarios & Acceptance Criteria
- [ ] **AC-1:** Positive execution with valid user session.
- [ ] **AC-2:** Negative execution: Unauthorized user blocked (HTTP 403).
- [ ] **AC-3:** Negative execution: SoD violation blocked (Self-approval prevented).
- [ ] **AC-4:** Data persistence verified across page refresh.
- [ ] **AC-5:** Mobile viewport (375px) responsive check passed.
- [ ] **AC-6:** Arabic RTL layout rendering correctly.
```

---

## 4. Concrete Example: High-Pressure Hydrostatic Test PTW Add-on

### Feature ID: `FEAT-PTW-042`
- **Objective:** Add specialized safety barrier gating for hydrostatic pressure testing $> 100\text{ bar}$ in Fahud-West Gas Station (Oman Block 6).
- **SoD Enforced:** The Mechanical Isolation Engineer signing the test manifold barrier cannot be the Permit Issuer authorizing the exclusion zone.
- **Implementation Target:** `components/controlOfWork/ControlOfWorkModule.tsx`, `services/simopsService.ts`.
- **Acceptance:** Verification that exclusion zone barricade checklist item is mandatory before issuer signature pad is unlocked.
