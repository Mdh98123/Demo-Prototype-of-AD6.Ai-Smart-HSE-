import type { WorkflowRepository, WorkflowState } from '../types/workflow';

const WORKFLOW_STORAGE_KEY = 'ad6_workflow_state_v1';

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
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(state));
  }
}

function isWorkflowState(value: unknown): value is WorkflowState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WorkflowState>;
  return Array.isArray(candidate.workItems)
    && Array.isArray(candidate.events)
    && Array.isArray(candidate.notifications);
}
