import { getRoleChain, roleRankInChain, WORKFLOW_RULES } from '../config/workflowRules';
import type {
  WorkflowAction,
  WorkflowActor,
  WorkflowEvent,
  WorkflowEventType,
  WorkflowRecordInput,
  WorkflowRepository,
  WorkflowState,
  WorkflowStatus,
  WorkItem
} from '../types/workflow';
import type { UserRole } from '../types';

export class WorkflowService {
  private mutationQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly repository: WorkflowRepository,
    private readonly now: () => Date = () => new Date(),
    private readonly makeId: () => string = () => crypto.randomUUID()
  ) {}

  createForRecord(input: WorkflowRecordInput): Promise<WorkflowState> {
    return this.serialize(async () => {
    const rule = WORKFLOW_RULES[input.recordType];
    if (!rule) throw new Error(`No workflow rule is configured for ${input.recordType}.`);

    const state = await this.repository.read();
    const ownerRole = input.ownerRole ?? (input.highPotential && rule.highPotentialRole
      ? rule.highPotentialRole
      : rule.ownerRole);
    const dueAt = new Date(this.now().getTime() + rule.slaHours * 60 * 60 * 1000).toISOString();
    const item = this.newItem({
      recordType: input.recordType === 'Incident' && input.highPotential ? 'Investigation' : input.recordType,
      recordId: input.recordId,
      title: input.title,
      priority: input.priority ?? 'Medium',
      dueAt,
      createdBy: input.createdBy.id,
      assignedToRole: ownerRole,
      pool: ownerRole,
      approverRole: rule.approverRole,
      finalApproverRole: rule.finalApproverRole,
      siteId: input.siteId ?? input.createdBy.siteId,
      department: input.department ?? input.createdBy.department,
      serious: input.serious,
      actor: input.createdBy,
      action: 'created',
      toStatus: 'Open'
    });
    state.workItems.push(item);
    const eventType: WorkflowEventType = input.recordType === 'Incident'
      ? 'incident.reported'
      : input.recordType === 'Observation' || input.recordType === 'NearMiss'
        ? 'observation.reported'
        : 'task.assigned';
    state.events.push(this.makeEvent(eventType, input.createdBy, item, [
      ...rule.notifyRoles,
      ...(input.serious ? rule.seriousNotifyRoles ?? [] : [])
    ], { title: item.title, priority: item.priority, highPotential: Boolean(input.highPotential) }));
    if (input.recordType === 'Incident' && input.serious) {
      const statutoryRule = WORKFLOW_RULES.StatutoryNotification;
      if (!statutoryRule) throw new Error('No statutory notification workflow rule is configured.');
      const statutoryItem = this.newItem({
        recordType: 'StatutoryNotification',
        recordId: input.recordId,
        title: `Statutory notification: ${input.title}`,
        priority: 'Critical',
        dueAt: new Date(this.now().getTime() + statutoryRule.slaHours * 60 * 60 * 1000).toISOString(),
        createdBy: input.createdBy.id,
        assignedToRole: statutoryRule.ownerRole,
        pool: statutoryRule.ownerRole,
        approverRole: statutoryRule.approverRole,
        siteId: item.siteId,
        department: item.department,
        actor: input.createdBy,
        action: 'created',
        toStatus: 'Open'
      });
      statutoryItem.parentWorkItemId = item.id;
      statutoryItem.serious = true;
      state.workItems.push(statutoryItem);
      state.events.push(this.makeEvent('task.assigned', input.createdBy, statutoryItem, statutoryRule.notifyRoles, {
        title: statutoryItem.title,
        priority: statutoryItem.priority
      }));
    }
    await this.repository.write(state);
    return state;
    });
  }

  act(itemId: string, actor: WorkflowActor, action: WorkflowAction): Promise<WorkflowState> {
    return this.serialize(async () => {
    const state = await this.repository.read();
    const item = state.workItems.find(candidate => candidate.id === itemId);
    if (!item) throw new Error('Workflow task was not found.');
    if (item.status === 'Done' || item.status === 'Rejected') throw new Error('This workflow task is already closed.');

    const previousStatus = item.status;
    const event = this.applyAction(item, actor, action, state);
    const auditAction = action.type;
    item.history.push({
      id: this.makeId(),
      actorId: actor.id,
      actorRole: actor.role,
      action: auditAction,
      at: this.now().toISOString(),
      fromStatus: previousStatus,
      toStatus: item.status,
      ...('reason' in action ? { reason: action.reason } : {})
    });
    state.events.push(event);
    await this.repository.write(state);
    return state;
    });
  }

  escalateOverdue(): Promise<WorkflowState> {
    return this.serialize(async () => {
    const state = await this.repository.read();
    const currentTime = this.now().getTime();
    const overdue = state.workItems.filter(item =>
      item.status !== 'Done'
      && item.status !== 'Rejected'
      && !item.escalatedToRole
      && Date.parse(item.dueAt) <= currentTime
    );
    for (const item of overdue) {
      const rule = WORKFLOW_RULES[item.recordType];
      if (!rule) continue;
      const fromStatus = item.status;
      item.status = 'Escalated';
      item.escalatedToRole = rule.escalationRole;
      item.history.push({
        id: this.makeId(),
        actorId: 'workflow-system',
        actorRole: rule.escalationRole,
        action: 'automatic-escalation',
        at: this.now().toISOString(),
        fromStatus,
        toStatus: 'Escalated',
        reason: 'The workflow SLA elapsed.'
      });
      state.events.push(this.makeEvent('task.overdue', {
        id: 'workflow-system',
        role: rule.escalationRole,
        siteId: item.siteId
      }, item, [rule.escalationRole], { dueAt: item.dueAt }));
      state.events.push(this.makeEvent('task.escalated', {
        id: 'workflow-system',
        role: rule.escalationRole,
        siteId: item.siteId
      }, item, [rule.escalationRole], { escalationRole: rule.escalationRole }));
    }
    if (overdue.length > 0) await this.repository.write(state);
    return state;
    });
  }

  private applyAction(item: WorkItem, actor: WorkflowActor, action: WorkflowAction, state: WorkflowState): WorkflowEvent {
    switch (action.type) {
      case 'claim':
        if (item.pool !== actor.role || item.assignedToUser) throw new Error('Only a member of the task role pool can claim this task.');
        item.assignedToUser = actor.id;
        item.pool = undefined;
        item.status = 'Assigned';
        return this.makeEvent('task.claimed', actor, item, [item.assignedToRole], {});
      case 'takeover':
        this.requireReason(action.reason);
        if (!item.assignedToUser || item.assignedToUser === actor.id) throw new Error('A different assigned owner is required for takeover.');
        if (!this.canTakeOver(item, actor, action.ownerUnavailable ?? false)) throw new Error('Takeover is limited to a higher role in the same chain, or an overdue/unavailable same-role peer.');
        {
          const previousOwner = item.assignedToUser;
          item.assignedToUser = actor.id;
          item.pool = undefined;
          item.status = 'InProgress';
          return this.makeEvent('task.reassigned', actor, item, [item.assignedToRole], { previousOwner, reason: action.reason });
        }
      case 'reassign':
        this.requireReason(action.reason);
        if (!this.canReassign(item, actor, action.target)) throw new Error('Reassignment is limited to a same-role peer or a supervised lower role in the same chain.');
        {
          const previousOwner = item.assignedToUser;
          item.assignedToUser = action.target.id;
          item.assignedToRole = action.target.role;
          item.pool = undefined;
          return this.makeEvent('task.reassigned', actor, item, [action.target.role], { previousOwner, reason: action.reason });
        }
      case 'delegate':
        if (!action.note.trim()) throw new Error('A delegation note is required.');
        if (action.target.role !== item.assignedToRole && !this.isHigherInSameChain(actor.role, item.assignedToRole)) {
          throw new Error('Delegation requires the task owner role or a higher role in the same chain.');
        }
        item.delegatedToUser = action.target.id;
        return this.makeEvent('task.delegated', actor, item, [action.target.role], { note: action.note });
      case 'complete':
        if (item.createdBy === actor.id) throw new Error('Segregation of duties: the record creator cannot close their own record.');
        this.requireCanPerform(item, actor);
        if (item.approverRole) {
          item.performedByUser = actor.id;
          item.assignedToRole = item.approverRole;
          item.assignedToUser = undefined;
          item.pool = item.approverRole;
          item.status = 'PendingApproval';
          return this.makeEvent('approval.requested', actor, item, [item.approverRole], { performedByUser: actor.id });
        }
        {
          const rule = WORKFLOW_RULES[item.recordType];
          if (rule?.followUpRole) {
            item.status = 'Done';
            item.performedByUser = actor.id;
            const followUpRole = item.recordType === 'Inspection' || item.recordType === 'Audit' || item.recordType === 'NCR'
              ? (item.assignedToRole === rule.ownerRole ? rule.followUpRole : item.assignedToRole)
              : rule.followUpRole;
            const followUpItem = this.newItem({
              recordType: rule.followUpRecordType ?? item.recordType,
              recordId: item.recordId,
              title: item.title,
              priority: item.priority,
              dueAt: new Date(this.now().getTime() + (WORKFLOW_RULES[rule.followUpRecordType ?? item.recordType]?.slaHours ?? rule.slaHours) * 60 * 60 * 1000).toISOString(),
              createdBy: item.createdBy,
              assignedToRole: followUpRole,
              pool: followUpRole,
              approverRole: rule.followUpApproverRole,
              finalApproverRole: rule.finalApproverRole,
              siteId: item.siteId,
              department: item.department,
              actor,
              action: 'follow-up-created',
              toStatus: 'Open'
            });
            followUpItem.parentWorkItemId = item.id;
            followUpItem.serious = item.serious;
            state.workItems.push(followUpItem);
            return this.makeEvent('task.assigned', actor, followUpItem, [followUpRole], {
              parentWorkItemId: item.id,
              title: followUpItem.title
            });
          }
        }
        item.status = 'Done';
        item.performedByUser = actor.id;
        return this.makeEvent('task.completed', actor, item, [], {});
      case 'approve':
        if (!item.approverRole || actor.role !== item.approverRole) throw new Error('Only the configured approver role may approve this task.');
        if (item.status !== 'PendingApproval') throw new Error('This task is not awaiting approval.');
        if (item.createdBy === actor.id || item.performedByUser === actor.id) throw new Error('Segregation of duties: the creator or performer cannot approve their own work.');
        if (item.finalApproverRole && item.finalApproverRole !== item.approverRole) {
          item.approverRole = item.finalApproverRole;
          item.finalApproverRole = undefined;
          item.assignedToRole = item.approverRole;
          item.assignedToUser = undefined;
          item.pool = item.approverRole;
          return this.makeEvent('approval.requested', actor, item, [item.approverRole], {
            previousApproverRole: actor.role,
            finalApproval: true
          });
        }
        item.status = 'Done';
        return this.makeEvent('approval.granted', actor, item, item.serious ? ['CEO'] : [], {
          serious: Boolean(item.serious)
        });
      case 'reject':
        this.requireReason(action.reason);
        if (!item.approverRole || actor.role !== item.approverRole) throw new Error('Only the configured approver role may reject this task.');
        if (item.status !== 'PendingApproval') throw new Error('This task is not awaiting approval.');
        if (item.createdBy === actor.id || item.performedByUser === actor.id) throw new Error('Segregation of duties: the creator or performer cannot reject their own work.');
        item.status = 'Rejected';
        return this.makeEvent('approval.rejected', actor, item, [item.assignedToRole], { reason: action.reason });
      case 'return':
        this.requireReason(action.reason);
        if (!item.approverRole || actor.role !== item.approverRole) throw new Error('Only the configured approver role may return this task.');
        if (item.status !== 'PendingApproval') throw new Error('This task is not awaiting approval.');
        if (item.createdBy === actor.id || item.performedByUser === actor.id) throw new Error('Segregation of duties: the creator or performer cannot return their own work.');
        item.status = 'Assigned';
        item.assignedToRole = roleForRecord(item.recordType);
        item.assignedToUser = undefined;
        item.pool = item.assignedToRole;
        return this.makeEvent('task.returned', actor, item, [item.assignedToRole], { reason: action.reason });
      case 'escalate':
        this.requireReason(action.reason);
        if (actor.id !== item.assignedToUser && actor.role !== item.assignedToRole) {
          throw new Error('Only the task owner or a same-role user can escalate this task.');
        }
        {
          const targetRole = WORKFLOW_RULES[item.recordType]?.escalationRole;
          if (!targetRole) throw new Error('No escalation target is configured.');
          item.status = 'Escalated';
          item.escalatedToRole = targetRole;
          return this.makeEvent('task.escalated', actor, item, [targetRole], { reason: action.reason });
        }
    }
  }

  private canTakeOver(item: WorkItem, actor: WorkflowActor, ownerUnavailable: boolean): boolean {
    if (this.isHigherInSameChain(actor.role, item.assignedToRole)) return true;
    const overdue = Date.parse(item.dueAt) <= this.now().getTime();
    return actor.role === item.assignedToRole && (ownerUnavailable || overdue);
  }

  private canReassign(item: WorkItem, actor: WorkflowActor, target: WorkflowActor): boolean {
    if (target.id === actor.id) return false;
    const sameDepartment = !item.department || !target.department || item.department === target.department;
    if (actor.role === target.role && sameDepartment) return true;
    return Boolean(
      actor.supervisedUserIds?.includes(target.id)
      && target.department === actor.department
      && this.isHigherInSameChain(actor.role, target.role)
    );
  }

  private requireCanPerform(item: WorkItem, actor: WorkflowActor): void {
    if (actor.id !== item.assignedToUser && !this.isHigherInSameChain(actor.role, item.assignedToRole)) {
      throw new Error('Your role is not authorized to perform this task.');
    }
  }

  private isHigherInSameChain(actorRole: UserRole, requiredRole: UserRole): boolean {
    const chain = getRoleChain(requiredRole);
    if (!chain || !chain.includes(actorRole)) return false;
    return roleRankInChain(actorRole, chain) > roleRankInChain(requiredRole, chain);
  }

  private newItem(input: {
    recordType: WorkItem['recordType'];
    recordId: string;
    title: string;
    priority: WorkItem['priority'];
    dueAt: string;
    createdBy: string;
    assignedToRole: UserRole;
    pool: UserRole;
    approverRole?: UserRole;
    finalApproverRole?: UserRole;
    siteId?: string;
    department?: string;
    serious?: boolean;
    actor: WorkflowActor;
    action: string;
    toStatus: WorkflowStatus;
  }): WorkItem {
    return {
      id: this.makeId(),
      recordType: input.recordType,
      recordId: input.recordId,
      title: input.title,
      status: input.toStatus,
      priority: input.priority,
      dueAt: input.dueAt,
      createdBy: input.createdBy,
      assignedToRole: input.assignedToRole,
      pool: input.pool,
      approverRole: input.approverRole,
      finalApproverRole: input.finalApproverRole,
      serious: input.serious,
      siteId: input.siteId,
      department: input.department,
      history: [{
        id: this.makeId(),
        actorId: input.actor.id,
        actorRole: input.actor.role,
        action: input.action,
        at: this.now().toISOString(),
        toStatus: input.toStatus
      }]
    };
  }

  private makeEvent(
    type: WorkflowEventType,
    actor: WorkflowActor,
    item: WorkItem,
    targetRoles: UserRole[],
    payload: Record<string, unknown>
  ): WorkflowEvent {
    return {
      id: this.makeId(),
      type,
      actorId: actor.id,
      recordRef: { recordType: item.recordType, recordId: item.recordId, workItemId: item.id },
      targetUserIds: [],
      targetRoles: [...new Set(targetRoles)],
      siteIds: item.siteId ? [item.siteId] : [],
      createdAt: this.now().toISOString(),
      payload
    };
  }

  private requireReason(reason: string): void {
    if (!reason.trim()) throw new Error('A reason is required for this workflow action.');
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(operation, operation);
    this.mutationQueue = result.then(() => undefined, () => undefined);
    return result;
  }
}

function roleForRecord(recordType: WorkItem['recordType']): UserRole {
  return WORKFLOW_RULES[recordType]?.ownerRole ?? 'HSE_Officer';
}
