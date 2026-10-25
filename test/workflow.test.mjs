import test from 'node:test';
import assert from 'node:assert/strict';
import { WORKFLOW_RULES } from '../config/workflowRules.ts';
import { WorkflowService } from '../services/workflowService.ts';

class MemoryRepository {
  state = { workItems: [], events: [], notifications: [] };
  async read() { return structuredClone(this.state); }
  async write(state) { this.state = structuredClone(state); }
}

const actor = (id, role, extras = {}) => ({ id, role, department: 'Sohar Operations', siteId: 'site-sohar', ...extras });

function createService(now = () => new Date('2026-10-25T00:00:00.000Z')) {
  const repository = new MemoryRepository();
  let id = 0;
  return {
    repository,
    service: new WorkflowService(repository, now, () => `workflow-${++id}`)
  };
}

test('workflow rules route observations and incidents to configured Oman roles', () => {
  assert.equal(WORKFLOW_RULES.Observation.ownerRole, 'Site_Supervisor');
  assert.equal(WORKFLOW_RULES.Observation.followUpRole, 'HSE_Officer');
  assert.equal(WORKFLOW_RULES.Incident.ownerRole, 'HSE_Officer');
  assert.equal(WORKFLOW_RULES.Incident.approverRole, 'Site_HSE_Manager');
  assert.equal(WORKFLOW_RULES.NCR.ownerRole, 'QA_QC_Manager');
  assert.equal(WORKFLOW_RULES.NCR.followUpApproverRole, 'QA_QC_Manager');
  assert.equal(WORKFLOW_RULES.NCR.finalApproverRole, 'Site_HSE_Manager');
});

test('creating workflow for the same record is idempotent', async () => {
  const { service } = createService();
  const input = {
    recordType: 'Incident',
    recordId: 'INC-IDEMPOTENT',
    title: 'Repeated submission',
    createdBy: actor('reporter', 'Worker')
  };
  const first = await service.createForRecord(input);
  const second = await service.createForRecord(input);
  assert.equal(second.workItems.length, 1);
  assert.equal(second.events.length, 1);
  assert.equal(second.workItems[0].id, first.workItems[0].id);
});

test('creator cannot close own incident and a different configured approver can approve', async () => {
  const { service } = createService();
  const created = await service.createForRecord({
    recordType: 'Incident',
    recordId: 'INC-1',
    title: 'Equipment contact',
    createdBy: actor('reporter', 'Worker')
  });
  const item = created.workItems[0];
  await assert.rejects(
    service.act(item.id, actor('reporter', 'Worker'), { type: 'complete' }),
    /creator cannot close/
  );
  await service.act(item.id, actor('hse-officer', 'HSE_Officer'), { type: 'claim' });
  await service.act(item.id, actor('hse-officer', 'HSE_Officer'), { type: 'complete' });
  await assert.rejects(
    service.act(item.id, actor('hse-officer', 'HSE_Officer'), { type: 'approve' }),
    /configured approver role/
  );
  const approved = await service.act(item.id, actor('site-manager', 'Site_HSE_Manager'), { type: 'approve' });
  assert.equal(approved.workItems[0].status, 'Done');
});

test('only same-role pool members can claim and higher hierarchy can take over with a reason', async () => {
  const { service } = createService();
  const created = await service.createForRecord({
    recordType: 'Incident',
    recordId: 'INC-2',
    title: 'Near equipment miss',
    createdBy: actor('reporter', 'Worker')
  });
  const item = created.workItems[0];
  await assert.rejects(service.act(item.id, actor('supervisor', 'Site_Supervisor'), { type: 'claim' }), /role pool/);
  await assert.rejects(service.act(item.id, actor('other-worker', 'Worker'), { type: 'complete' }), /role is not authorized/);
  await service.act(item.id, actor('officer', 'HSE_Officer'), { type: 'claim' });
  await assert.rejects(service.act(item.id, actor('manager', 'Site_HSE_Manager'), { type: 'takeover', reason: ' ' }), /reason is required/);
  const taken = await service.act(item.id, actor('manager', 'Site_HSE_Manager'), { type: 'takeover', reason: 'Owner unavailable' });
  assert.equal(taken.workItems[0].assignedToUser, 'manager');
  assert.equal(taken.workItems[0].history.at(-1).reason, 'Owner unavailable');
  assert.ok(taken.events.at(-1).targetUserIds.includes('officer'));
  await service.act(item.id, actor('manager', 'Site_HSE_Manager'), { type: 'complete' });
  await assert.rejects(
    service.act(item.id, actor('manager', 'Site_HSE_Manager'), { type: 'approve' }),
    /performer cannot approve/
  );
  const approved = await service.act(item.id, actor('site-manager-2', 'Site_HSE_Manager'), { type: 'approve' });
  assert.equal(approved.workItems[0].status, 'Done');
});

test('only the task owner or a higher role may reassign a workflow task', async () => {
  const { service } = createService();
  const created = await service.createForRecord({
    recordType: 'Incident',
    recordId: 'INC-REASSIGN',
    title: 'Owner-gated reassignment',
    createdBy: actor('reporter', 'Worker')
  });
  const item = created.workItems[0];
  await assert.rejects(
    service.act(item.id, actor('peer-one', 'HSE_Officer'), {
      type: 'reassign',
      target: actor('peer-two', 'HSE_Officer'),
      reason: 'Coverage change'
    }),
    /task owner or a higher role/
  );
  await service.act(item.id, actor('owner', 'HSE_Officer'), { type: 'claim' });
  const state = await service.act(item.id, actor('owner', 'HSE_Officer'), {
    type: 'reassign',
    target: actor('peer-two', 'HSE_Officer'),
    reason: 'Coverage change'
  });
  assert.equal(state.workItems[0].assignedToUser, 'peer-two');
});

test('overdue task escalates once and notifies its configured escalation role', async () => {
  let currentTime = new Date('2026-10-25T00:00:00.000Z');
  const { service } = createService(() => currentTime);
  const created = await service.createForRecord({
    recordType: 'Incident',
    recordId: 'INC-OVERDUE',
    title: 'Unresolved incident investigation',
    createdBy: actor('creator', 'Worker')
  });
  currentTime = new Date('2026-10-27T00:00:00.000Z');
  const state = await service.escalateOverdue();
  assert.equal(state.workItems[0].status, 'Escalated');
  assert.equal(state.workItems[0].escalatedToRole, 'Site_HSE_Manager');
  assert.ok(state.events.some(event => event.type === 'task.escalated' && event.targetRoles.includes('Site_HSE_Manager')));
  const eventCount = state.events.length;
  const again = await service.escalateOverdue();
  assert.equal(again.events.length, eventCount);
  assert.equal(created.workItems[0].status, 'Open');
});

test('high-potential incident starts an investigation and notifies the supervisor and HSE roles', async () => {
  const { service } = createService();
  const state = await service.createForRecord({
    recordType: 'Incident',
    recordId: 'INC-3',
    title: 'High potential process release',
    createdBy: actor('worker', 'Worker'),
    highPotential: true,
    serious: true
  });
  assert.equal(state.workItems[0].recordType, 'Investigation');
  assert.equal(state.workItems[0].assignedToRole, 'HSE_Officer');
  assert.deepEqual(state.events[0].targetRoles, ['Site_Supervisor', 'HSE_Officer', 'CEO', 'HR_Coordinator']);
});

test('NCR disposition creates a CAPA, which requires QA/QC verification and Site HSE Manager authorization', async () => {
  const { service } = createService();
  const created = await service.createForRecord({
    recordType: 'NCR',
    recordId: 'NCR-1',
    title: 'Inspection finding',
    createdBy: actor('worker', 'Worker')
  });
  const dispositionTask = created.workItems[0];
  await service.act(dispositionTask.id, actor('qa-manager', 'QA_QC_Manager'), { type: 'claim' });
  await service.act(dispositionTask.id, actor('qa-manager', 'QA_QC_Manager'), { type: 'complete' });
  const state = await service.repository.read();
  const capa = state.workItems.find(item => item.recordType === 'CAPA');
  assert.equal(capa.assignedToRole, 'QA_QC_Inspector');
  await service.act(capa.id, actor('qa-inspector', 'QA_QC_Inspector'), { type: 'claim' });
  await service.act(capa.id, actor('qa-inspector', 'QA_QC_Inspector'), { type: 'complete' });
  await service.act(capa.id, actor('qa-manager', 'QA_QC_Manager'), { type: 'approve' });
  const awaitingSiteAuthorization = await service.repository.read();
  const awaitingSiteItem = awaitingSiteAuthorization.workItems.find(item => item.id === capa.id);
  assert.equal(awaitingSiteItem.approverRole, 'Site_HSE_Manager');
  const closed = await service.act(capa.id, actor('site-manager', 'Site_HSE_Manager'), { type: 'approve' });
  assert.equal(closed.workItems.find(item => item.id === capa.id).status, 'Done');
});
