import type { WorkflowRepository, WorkflowState } from '../types/workflow';

export const WORKFLOW_STORAGE_KEY = 'ad6_workflow_state_v1';

const EMPTY_STATE: WorkflowState = {
  workItems: [],
  events: [],
  notifications: []
};

export class LocalStorageWorkflowRepository implements WorkflowRepository {
  async read(): Promise<WorkflowState> {
    if (typeof localStorage === 'undefined') {
      throw new Error('Workflow storage is unavailable outside a browser context.');
    }
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    const state: unknown = JSON.parse(raw);
    if (!isWorkflowState(state)) {
      throw new Error('Stored workflow state is invalid.');
    }
    return state;
  }

  async write(state: WorkflowState): Promise<void> {
    if (typeof localStorage === 'undefined') {
      throw new Error('Workflow storage is unavailable outside a browser context.');
    }
    const current = await this.read();
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(mergeWorkflowStates(current, state)));
  }
}

export function mergeWorkflowStates(current: WorkflowState, incoming: WorkflowState): WorkflowState {
  const workItems = new Map(current.workItems.map(item => [item.id, item]));
  for (const item of incoming.workItems) {
    const existing = workItems.get(item.id);
    if (!existing || item.history.length >= existing.history.length) workItems.set(item.id, item);
  }

  const events = new Map(current.events.map(event => [event.id, event]));
  for (const event of incoming.events) events.set(event.id, event);

  const notifications = new Map(current.notifications.map(notification => [notification.id, notification]));
  for (const notification of incoming.notifications) {
    const existing = notifications.get(notification.id);
    notifications.set(notification.id, existing?.read ? existing : notification);
  }

  return {
    workItems: Array.from(workItems.values()),
    events: Array.from(events.values()),
    notifications: Array.from(notifications.values())
  };
}

function isWorkflowState(value: unknown): value is WorkflowState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WorkflowState>;
  return Array.isArray(candidate.workItems)
    && Array.isArray(candidate.events)
    && Array.isArray(candidate.notifications);
}
