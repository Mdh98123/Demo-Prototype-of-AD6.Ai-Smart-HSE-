# Workflow Linking Handoff

## Status

Workflow linking is implemented for the Oman demo profile and gated by server/client environment flags, demo mode, an allowlisted synthetic user, and the demo settings toggle. With the feature disabled, the workflow server reports `{"enabled":false,"demoOnly":true}` and existing app behavior remains the default.

The reusable task prompt is in `.github/prompts/workflow-interdependency.prompt.md`. Core/server commits are `faaf3a9` and `30e7e00`; client integration and handoff are finalized in the current client commit.

## Completed

- Typed workflow records, state transitions, configured role chains, notifications, and audit history.
- Permission checks for claiming, taking over, reassigning, delegating, completing, approving, and escalating.
- Demo-guarded API and Socket.IO delivery with validated request payloads and rate limiting.
- Client context, dashboard, record/profile panels, notifications, demo-user switching, and sample scenario.
- Triggers for incident, observation/near miss, permit, inspection/audit finding, and training expiry flows.
- Browser-local persistence plus tab synchronization fallback.
- EN/AR localization and workflow settings UI.

## Main files and entry points

- `types/workflow.ts`: workflow model types.
- `config/workflowRules.ts`: Oman role/task chains, approvers, SLAs, and escalation targets.
- `services/workflowService.ts`: `WorkflowService` record creation, transitions, and escalation.
- `services/workflowPermissions.ts`: `canClaimWorkflowItem`, `canTakeOverWorkflowItem`, `canReassignWorkflowItem`, `canDelegateWorkflowItem`, `canCompleteWorkflowItem`, `canApproveWorkflowItem`, `canEscalateWorkflowItem`, and shared action permission resolution.
- `services/workflowRepository.ts`: repository interface, local-storage repository, and state merge behavior.
- `routes/workflowRouter.ts`: `createWorkflowRouter`, demo token validation, API routes, and Socket.IO room/event delivery.
- `contexts/WorkflowContext.tsx`: `WorkflowProvider`, `useWorkflow`, client/server state synchronization, notifications, and sample scenario.
- `components/workflow/`: role dashboard, record timeline/actions, and profile task panels.
- `components/NotificationCenter.tsx`, `components/system/GovernanceModule.tsx`, `components/UserProfileModal.tsx`: notification UI, feature toggle, and profile surface.
- `components/App.tsx`: notification navigation to records.
- Workflow triggers/panels are wired in `components/IncidentForm.tsx`, `components/SafetyObservationForm.tsx`, `components/controlOfWork/ControlOfWorkModule.tsx`, `components/InspectionModule.tsx`, `components/audit/AuditFindings.tsx`, and `components/TrainingModule.tsx`.
- `test/workflow.test.mjs` and `test/workflow-server.test.mjs`: core permissions/rules and API/socket integration tests.

## Configuration and operation

Set `WORKFLOW_LINKING=true` and `VITE_WORKFLOW_LINKING=true` to enable the server and client portions; keep `DEMO_MODE=true` and `VITE_DEMO_MODE=true` for the synthetic demo workflow. An optional synthetic workflow token secret is documented in `.env.example`. The in-app toggle is also required. Do not enable against real users or treat synthetic identities as production authentication.

Run `npm run lint`, `npm test`, `npm run build`, then `npm start`. The verified production server returned HTTP 200 from `/api/healthz`, `/api/workflow/status`, and `/` (the page request succeeded on retry). `npm test` passed 17 tests. No deployment was performed because no distinct staging target was identified.

## Known limits and deferred items

- Server workflow state is in memory and resets on server restart; browser fallback is local to a browser and synchronizes tabs, not devices. Persistent cross-device delivery requires a durable shared database.
- `Permit` has no trustworthy applicant user ID. Applicant closure remains unavailable unless a distinct applicant identity is added and proven different from creator and performer; do not infer identity or relax SoD.
- The sample scenario and synthetic identities are demo-only.
- No staging deployment or production verification was performed.
- A prior dependency audit reported 3 low, 15 moderate, 17 high, and 4 critical findings; this workflow task did not remediate or re-audit dependencies.

## Verification and rollback

Verified commands: `npm run lint`, `npm test` (17/17), and `npm run build`. Runtime smoke checks on port 4174 returned HTTP 200 for `/api/healthz` and `/api/workflow/status`; `/` returned HTTP 200 after an initial short-timeout failure.

To roll back the workflow feature without rewriting history, revert the workflow client integration commit and then commits `30e7e00` and `faaf3a9` with `git revert`, one commit at a time, running the checks above after each revert. The reusable prompt commit `55db260` can remain or be reverted separately. Do not use `reset` or force-push.

## Continuation prompt

> Continue the AD6 Smart HSE workflow-linking implementation from this handoff. Preserve the demo-only gates, Oman wording, tab-scoped synthetic users, and strict segregation of duties. Do not infer permit applicant identity. First inspect the current git status and commits, then address only the remaining explicitly requested workflow gaps. Run `npm run lint`, `npm test`, `npm run build`, and a local production smoke test; do not deploy without a distinct staging target.
