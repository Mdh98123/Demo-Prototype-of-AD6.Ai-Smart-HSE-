# UX/UI & Workflow Design Specifications

Based on the Strategic Architecture mandate: "Atomic design system, WCAG 2.1 AA compliance, light/dark modes, two-click critical path hierarchy for core workflows."

## Two-Click Critical Path Definition
For high-frequency field operations, the user must be able to complete their primary objective within two interactions from the home screen.

### Workflow A: Report Near Miss / Incident (Mobile Offline-First)
**Constraint:** High-stress situation, requires immediacy.
1. **Click 1:** Tap large, persistent floating action button (FAB) or quick-action tile "Report Incident" on the Home Dashboard.
2. **Action:** Camera opens immediately (or basic form appears).
3. **Click 2:** Tap "Capture & Submit".
*Background Process:* Geolocation is automatically tagged. IndexedDB stores the payload if offline, syncing via Service Worker once connectivity is restored.

### Workflow B: Permit to Work (PTW) Approval (Supervisor Persona)
**Constraint:** High volume, requires rapid vetting.
1. **Click 1:** Tap "Pending Approvals" badge on Home Dashboard.
2. **Action:** Opens list view with expanded details of the top priority permit (SIMOPS checks pre-validated by AI).
3. **Click 2:** Tap "Authorize" (triggers Biometric / FaceID validation).
*Background Process:* Digital signature is recorded, Kafka event triggers physical access control integration (opening site turnstiles).

## Interface Design Standards
- **Component Library:** Based on Radix UI / Shadcn UI for accessible primitives.
- **Typography & Scale:** Touch targets minimum 48x48dp (Mobile-first requirement).
- **Gamification / Behavior-Based Safety (BBS):**
  - Subtle progress rings around user avatars indicating compliance score.
  - Positive reinforcement micro-interactions when submitting safety observations.
- **Biometric Integration:** 
  - Utilize WebAuthn API for passwordless login and critical step verification (e.g., signing a PTW).
