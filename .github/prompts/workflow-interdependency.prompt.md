@workspace #codebase

You are a senior full-stack engineer. In this React 19 + TypeScript (Vite) + Express/Socket.IO demo app (AD6 HSE platform, Oman QHSE & ESG), make user tasks and actions INTERDEPENDENT across users: when one user reports or completes an action, every relevant user is notified on their profile and dashboard, the next responsible user gets the task, and another authorised user can take it over and complete it according to job role and hierarchy.

RULES
- Additive only. Do not redesign screens, rename modules, or change existing data shapes in a breaking way. Put everything behind a flag: WORKFLOW_LINKING=true (env + a settings toggle). With the flag off, the app behaves exactly as before.
- Follow existing patterns (contexts/, services/, types.ts, current theme, EN/AR RTL). Oman-only wording; no UAE references.
- Step 1: inspect the code and reply with a PLAN (files to touch, new files, data model, events list, role map found). Wait for my "go" before editing.
- Then implement in small steps; after each step run type-check, build and tests, and fix before continuing. Never leave the app in a broken state.
- Do not break the demo-token / DEMO_MODE security already added. All new API and socket traffic must use it, validate payloads (zod) and rate-limit.

1. CORE MODEL (new, in types/workflow.ts + services/workflowService.ts)
- WorkItem: id, recordType (Incident, NearMiss, Observation, NCR, CAPA, Permit, Inspection, Audit, Training, Investigation, StatutoryNotification...), recordId, title, status (Open, Assigned, InProgress, PendingReview, PendingApproval, Done, Rejected, Escalated), priority, dueAt, createdBy, assignedToUser, assignedToRole, pool (role queue when unassigned), history[].
- WorkflowEvent: id, type (e.g., incident.reported, task.assigned, task.claimed, task.reassigned, task.completed, approval.requested, approval.granted, task.overdue, task.escalated), actorId, recordRef, targetUserIds, createdAt, payload.
- Notification: id, userId, eventId, message EN/AR, severity, read, actionLink.
- Audit entry on every state change (who, what, when, from/to). Persist with the same storage the app already uses (localStorage/IndexedDB); keep it behind one repository interface so a real DB can replace it later.

2. WORKFLOW RULES (config-driven, one file: config/workflowRules.ts, no hard-coded logic in screens)
Define the chains below as data (trigger -> next task -> default owner role -> approver role -> due time):
- Observation/NearMiss reported -> Supervisor reviews -> HSE Officer actions/closes; high potential -> Investigation.
- Incident reported -> Supervisor notified + HSE Officer assigned -> Investigation task (HSE Officer leads) -> HSE Manager approves -> GM notified if serious; serious accident -> Statutory Notification task for HR/HSE with GM authorisation.
- NCR raised -> QA/QC Manager disposition -> CAPA task for owner -> QA/QC verifies closure.
- Any inspection/audit finding -> CAPA with owner and due date.
- Permit requested -> Area Authority issues -> HSE verifies -> Applicant closes.
- Training expiry / medical due / calibration due -> task to HR/Training or QA/QC.
Each rule has: who is notified, who owns the next step, who may approve, SLA hours, escalation target.

3. ROLES, HIERARCHY AND TAKE-OVER
- Use the existing roles; add a hierarchy map in config (Worker < Foreman/Supervisor < HSE Officer / QA-QC Inspector < Project Manager < HSE/QHSE Manager < Top Management). Do not invent roles that clash with existing ones.
- Actions on a task: Claim (from role pool), Reassign (to a same-role peer or a lower role the user supervises), Take over (a higher-hierarchy user, or a same-role peer if the owner is unavailable/overdue), Delegate (with note), Escalate (manual and automatic when SLA is missed), Return/Reject with reason.
- A user may complete a task only if their role is the task's owner role or higher in the same department chain. Show disabled buttons with a tooltip explaining why.
- Segregation of duties: the reporter/creator cannot approve or close their own record; an approver cannot be the same person as the performer.
- Every take-over/reassign requires a short reason, notifies the previous owner, and is audit-logged.

4. REAL-TIME DELIVERY ("reflect on all users")
- Server: Socket.IO rooms per user, per role and per site. On each WorkflowEvent, emit to targetUserIds plus role/site rooms. Authenticate with the demo token.
- Client: a useWorkflow() hook/context that subscribes, updates state instantly, and de-duplicates events.
- Offline/no-server fallback for the demo: use BroadcastChannel + storage events so two browser tabs signed in as different demo users still update live.
- Persist undelivered notifications so a user who logs in later sees them.

5. UI (reuse existing components and theme, bilingual, RTL-safe)
- Header bell with unread count and a notification panel (mark read, filter, click to open the record).
- Dashboard widgets for every role: My Tasks, Team/Pool Tasks (claimable), Pending My Approval, Overdue/Escalated, Recent Activity feed, and live KPI counters that update from events.
- Task card actions: Claim, Take over, Reassign, Delegate, Complete, Approve/Reject, Escalate, each gated by role rules.
- On each record screen, a "Workflow" panel showing status, current owner, next step, and a timeline of history.
- Profile page: assigned items, completed items, delegations.
- Demo helper (visible only in DEMO_MODE): a "Switch demo user" dropdown to jump between role profiles, and a "Run sample scenario" button that triggers: Worker reports incident -> Supervisor and HSE Officer notified -> HSE Officer takes over -> investigation task -> HSE Manager approves -> GM notified, so the cross-user effect is visible in 60 seconds.

6. TESTS AND DONE CRITERIA
Add unit tests for rules, permissions, SoD, take-over and escalation, plus an integration test of the sample scenario. Done when:
a. Reporting an incident as one demo user shows a notification and dashboard task for the right users within 1 second, in a second tab or window.
b. A higher-role user can take over an overdue task and complete it; an unauthorised role cannot, and sees why.
c. A creator cannot approve their own record.
d. Overdue tasks escalate automatically and notify the escalation target.
e. WORKFLOW_LINKING=false restores original behaviour; type-check, build and existing tests pass; no console errors.
Output after each step: what changed, files touched, test results, and how to roll back.
