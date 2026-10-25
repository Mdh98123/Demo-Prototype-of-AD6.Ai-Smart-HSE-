import type { UserRole } from '../types';

export type WorkflowRecordType =
  | 'Incident'
  | 'NearMiss'
  | 'Observation'
  | 'NCR'
  | 'CAPA'
  | 'Permit'
  | 'Inspection'
  | 'Audit'
  | 'Training'
  | 'Investigation'
  | 'StatutoryNotification'
  | 'Medical'
  | 'Calibration';

export type WorkflowStatus =
  | 'Open'
  | 'Assigned'
  | 'InProgress'
  | 'PendingReview'
  | 'PendingApproval'
  | 'Done'
  | 'Rejected'
  | 'Escalated';

export type WorkflowPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WorkflowAuditEntry {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  at: string;
  fromStatus?: WorkflowStatus;
  toStatus: WorkflowStatus;
  reason?: string;
}

export interface WorkItem {
  id: string;
  recordType: WorkflowRecordType;
  recordId: string;
  title: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  dueAt: string;
  createdBy: string;
  assignedToUser?: string;
  assignedToRole: UserRole;
  pool?: UserRole;
  delegatedToUser?: string;
  performedByUser?: string;
  approverRole?: UserRole;
  finalApproverRole?: UserRole;
  escalatedToRole?: UserRole;
  parentWorkItemId?: string;
  serious?: boolean;
  siteId?: string;
  department?: string;
  history: WorkflowAuditEntry[];
}

export type WorkflowEventType =
  | 'incident.reported'
  | 'observation.reported'
  | 'task.assigned'
  | 'task.claimed'
  | 'task.reassigned'
  | 'task.delegated'
  | 'task.completed'
  | 'approval.requested'
  | 'approval.granted'
  | 'approval.rejected'
  | 'task.returned'
  | 'task.overdue'
  | 'task.escalated';

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventType;
  actorId: string;
  recordRef: { recordType: WorkflowRecordType; recordId: string; workItemId: string };
  targetUserIds: string[];
  targetRoles?: UserRole[];
  siteIds?: string[];
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface WorkflowNotification {
  id: string;
  userId: string;
  eventId: string;
  message: { en: string; ar: string };
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  actionLink: string;
  createdAt: string;
}

export interface WorkflowState {
  workItems: WorkItem[];
  events: WorkflowEvent[];
  notifications: WorkflowNotification[];
}

export interface WorkflowRepository {
  read(): Promise<WorkflowState>;
  write(state: WorkflowState): Promise<void>;
}

export interface WorkflowActor {
  id: string;
  role: UserRole;
  department?: string;
  siteId?: string;
  supervisedUserIds?: string[];
}

export interface WorkflowRecordInput {
  recordType: WorkflowRecordType;
  recordId: string;
  title: string;
  createdBy: WorkflowActor;
  priority?: WorkflowPriority;
  siteId?: string;
  department?: string;
  highPotential?: boolean;
  serious?: boolean;
  ownerRole?: UserRole;
}

export type WorkflowAction =
  | { type: 'claim' }
  | { type: 'takeover'; reason: string; ownerUnavailable?: boolean }
  | { type: 'reassign'; reason: string; target: WorkflowActor }
  | { type: 'delegate'; note: string; target: WorkflowActor }
  | { type: 'complete' }
  | { type: 'approve' }
  | { type: 'reject'; reason: string }
  | { type: 'return'; reason: string }
  | { type: 'escalate'; reason: string };
