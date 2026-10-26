import { getRoleChain, roleRankInChain } from '../config/workflowRules';
import type { WorkflowAction, WorkflowActor, WorkflowStatus, WorkItem } from '../types/workflow';
import type { UserRole } from '../types';

export interface WorkflowPermissionResult {
  allowed: boolean;
  reason?: string;
}

export function canClaimWorkflowItem(item: WorkItem, actor: WorkflowActor): WorkflowPermissionResult {
  if (item.pool !== actor.role || item.assignedToUser) {
    return { allowed: false, reason: 'Only a member of the task role pool can claim this task.' };
  }
  return { allowed: true };
}

export function canTakeOverWorkflowItem(item: WorkItem, actor: WorkflowActor, now = new Date()): WorkflowPermissionResult {
  if (!item.assignedToUser || item.assignedToUser === actor.id) {
    return { allowed: false, reason: 'A different assigned owner is required for takeover.' };
  }
  if (isHigherInSameChain(actor.role, item.assignedToRole)) return { allowed: true };
  const overdue = Date.parse(item.dueAt) <= now.getTime();
  if (actor.role === item.assignedToRole && overdue) return { allowed: true };
  return {
    allowed: false,
    reason: 'Takeover requires a higher role in the same chain or an overdue task owned by a same-role peer.'
  };
}

export function canReassignWorkflowItem(item: WorkItem, actor: WorkflowActor, target: WorkflowActor): WorkflowPermissionResult {
  if (actor.id !== item.assignedToUser && !isHigherInSameChain(actor.role, item.assignedToRole)) {
    return { allowed: false, reason: 'Only the task owner or a higher role in the same chain may reassign.' };
  }
  if (target.id === actor.id) return { allowed: false, reason: 'A task cannot be reassigned to yourself.' };
  const sameDepartment = !item.department || !target.department || item.department === target.department;
  if (actor.role === target.role && sameDepartment) return { allowed: true };
  const supervisedLowerRole = actor.supervisedUserIds?.includes(target.id)
    && target.department === actor.department
    && isHigherInSameChain(actor.role, target.role);
  if (supervisedLowerRole) return { allowed: true };
  return {
    allowed: false,
    reason: 'Reassignment is limited to a same-role peer or a supervised lower role in the same chain.'
  };
}

export function canDelegateWorkflowItem(item: WorkItem, actor: WorkflowActor, target: WorkflowActor): WorkflowPermissionResult {
  if (actor.id !== item.assignedToUser && !isHigherInSameChain(actor.role, item.assignedToRole)) {
    return { allowed: false, reason: 'Only the task owner or a higher role in the same chain may delegate.' };
  }
  const sameRolePeer = target.role === item.assignedToRole
    && (!item.department || !target.department || item.department === target.department);
  const supervisedLowerRole = actor.supervisedUserIds?.includes(target.id)
    && target.department === actor.department
    && isHigherInSameChain(actor.role, target.role);
  if (!sameRolePeer && !supervisedLowerRole) return { allowed: false, reason: 'Delegation is limited to a same-role peer or a supervised lower role.' };
  return { allowed: true };
}

export function canCompleteWorkflowItem(item: WorkItem, actor: WorkflowActor): WorkflowPermissionResult {
  if (item.createdBy === actor.id) {
    return { allowed: false, reason: 'Segregation of duties: the record creator cannot close their own record.' };
  }
  if (actor.id !== item.assignedToUser && !isHigherInSameChain(actor.role, item.assignedToRole)) {
    return { allowed: false, reason: 'Your role is not authorized to perform this task.' };
  }
  return { allowed: true };
}

export function canApproveWorkflowItem(item: WorkItem, actor: WorkflowActor): WorkflowPermissionResult {
  if (!item.approverRole || actor.role !== item.approverRole) {
    return { allowed: false, reason: 'Only the configured approver role may approve this task.' };
  }
  if (item.status !== 'PendingApproval') {
    return { allowed: false, reason: 'This task is not awaiting approval.' };
  }
  if (item.createdBy === actor.id || item.performedByUser === actor.id) {
    return { allowed: false, reason: 'Segregation of duties: the creator or performer cannot approve their own work.' };
  }
  return { allowed: true };
}

export function canEscalateWorkflowItem(item: WorkItem, actor: WorkflowActor): WorkflowPermissionResult {
  if (actor.id !== item.assignedToUser && actor.role !== item.assignedToRole) {
    return { allowed: false, reason: 'Only the task owner or a same-role user can escalate this task.' };
  }
  return { allowed: true };
}

export function isHigherInSameChain(actorRole: UserRole, requiredRole: UserRole): boolean {
  const chain = getRoleChain(requiredRole);
  return Boolean(
    chain
    && chain.includes(actorRole)
    && roleRankInChain(actorRole, chain) > roleRankInChain(requiredRole, chain)
  );
}

export function getWorkflowActionPermission(
  item: WorkItem,
  actor: WorkflowActor,
  action: WorkflowAction['type'],
  now = new Date()
): WorkflowPermissionResult {
  switch (action) {
    case 'claim':
      return canClaimWorkflowItem(item, actor);
    case 'takeover':
      return canTakeOverWorkflowItem(item, actor, now);
    case 'complete':
      return canCompleteWorkflowItem(item, actor);
    case 'approve':
      return canApproveWorkflowItem(item, actor);
    case 'escalate':
      return canEscalateWorkflowItem(item, actor);
    case 'reassign':
    case 'delegate':
      return { allowed: false, reason: 'Select an eligible recipient and provide a reason.' };
    case 'reject':
    case 'return':
      return canApproveWorkflowItem(item, actor);
  }
}

export function isOverdueStatus(status: WorkflowStatus, dueAt: string, now = new Date()): boolean {
  return status === 'Escalated' || (status !== 'Done' && status !== 'Rejected' && Date.parse(dueAt) <= now.getTime());
}
