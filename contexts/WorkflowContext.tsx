import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { io as createSocket } from 'socket.io-client';
import { useUser } from './UserContext';
import { WORKFLOW_DEMO_USERS } from '../services/workflowDemoUsers';
import { LocalStorageWorkflowRepository, mergeWorkflowStates, WORKFLOW_STORAGE_KEY } from '../services/workflowRepository';
import { WorkflowService } from '../services/workflowService';
import type {
  WorkflowAction,
  WorkflowActor,
  WorkflowEvent,
  WorkflowNotification,
  WorkflowRecordInput,
  WorkflowState,
  WorkItem
} from '../types/workflow';

type ServerStatus = 'checking' | 'enabled' | 'disabled' | 'unavailable';

interface WorkflowContextValue {
  enabled: boolean;
  clientConfigured: boolean;
  settingEnabled: boolean;
  serverStatus: ServerStatus;
  workItems: WorkItem[];
  events: WorkflowEvent[];
  notifications: WorkflowNotification[];
  unreadCount: number;
  error: string | null;
  setWorkflowEnabled: (enabled: boolean) => void;
  createForRecord: (input: Omit<WorkflowRecordInput, 'createdBy'>) => Promise<WorkflowState>;
  act: (itemId: string, action: WorkflowAction) => Promise<WorkflowState>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  runSampleScenario: () => Promise<void>;
  refresh: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);
const SETTINGS_KEY = 'ad6_workflow_linking_enabled';
const BROADCAST_CHANNEL = 'ad6-workflow-events';
const emptyState: WorkflowState = { workItems: [], events: [], notifications: [] };
const clientConfigured = (import.meta as any).env?.VITE_WORKFLOW_LINKING === 'true';

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useUser();
  const repository = useMemo(() => new LocalStorageWorkflowRepository(), []);
  const localService = useMemo(() => new WorkflowService(repository), [repository]);
  const [state, setState] = useState<WorkflowState>(emptyState);
  const stateRef = useRef(state);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [settingEnabled, setSettingEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(SETTINGS_KEY) === 'true';
  });
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workflowDemoUser = Boolean(currentUser && WORKFLOW_DEMO_USERS.some(user => user.id === currentUser.id));
  const enabled = clientConfigured
    && settingEnabled
    && isDemoMode
    && workflowDemoUser
    && (serverStatus === 'unavailable' || (serverStatus === 'enabled' && Boolean(token)));
  const currentActor = useMemo<WorkflowActor | null>(() => currentUser ? ({
    id: currentUser.id,
    role: currentUser.role,
    department: currentUser.department,
    siteId: 'site-sohar'
  }) : null, [currentUser]);

  const updateState = useCallback(async (incoming: WorkflowState, broadcast = true): Promise<WorkflowState> => {
    const merged = mergeWorkflowStates(stateRef.current, incoming);
    const withNotifications = mergeWorkflowStates(merged, {
      workItems: [],
      events: [],
      notifications: currentUser
        ? notificationsForEvents(merged.events, currentUser.id, currentUser.role, 'site-sohar')
        : []
    });
    await repository.write(withNotifications);
    const persisted = mergeWorkflowStates(withNotifications, await repository.read());
    stateRef.current = persisted;
    setState(persisted);
    if (broadcast) channelRef.current?.postMessage({ type: 'state', state: persisted });
    return persisted;
  }, [currentUser, repository]);

  const refresh = useCallback(async () => {
    try {
      const localState = await repository.read();
      await updateState(localState, false);
      if (serverStatus === 'enabled' && token) {
        const remote = await workflowRequest<WorkflowState>('/api/workflow/state', token);
        await updateState(remote);
      }
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [repository, serverStatus, token, updateState]);

  useEffect(() => {
    let cancelled = false;
    if (!clientConfigured) {
      setServerStatus('disabled');
      return;
    }
    setServerStatus('checking');
    fetch('/api/workflow/status')
      .then(async response => {
        if (!response.ok) throw new Error(`Workflow status request failed (${response.status}).`);
        return response.json() as Promise<{ enabled: boolean }>;
      })
      .then(result => {
        if (!cancelled) setServerStatus(result.enabled ? 'enabled' : 'disabled');
      })
      .catch(() => {
        if (!cancelled) setServerStatus('unavailable');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setToken(null);
    if (serverStatus !== 'enabled' || !currentUser || !isDemoMode) return;
    fetch('/api/workflow/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(async response => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || `Workflow session request failed (${response.status}).`);
        }
        return response.json() as Promise<{ token: string }>;
      })
      .then(result => {
        if (cancelled) return;
        sessionStorage.setItem('ad6_workflow_demo_token', result.token);
        setToken(result.token);
        setError(null);
      })
      .catch(cause => {
        if (!cancelled) {
          sessionStorage.removeItem('ad6_workflow_demo_token');
          setError(errorMessage(cause));
        }
      });
    return () => { cancelled = true; };
  }, [currentUser?.id, currentUser?.role, isDemoMode, serverStatus]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    repository.read()
      .then(localState => updateState(localState, false))
      .then(() => {
        if (serverStatus === 'enabled' && token) {
          return workflowRequest<WorkflowState>('/api/workflow/state', token)
            .then(remoteState => updateState(remoteState));
        }
      })
      .catch(cause => {
        if (!cancelled) setError(errorMessage(cause));
      });
    return () => { cancelled = true; };
  }, [enabled, repository, serverStatus, token, updateState]);

  useEffect(() => {
    if (!enabled || typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = event => {
      if (event.data?.type === 'state' && isWorkflowState(event.data.state)) {
        void updateState(event.data.state, false).catch(cause => setError(errorMessage(cause)));
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [enabled, updateState]);

  useEffect(() => {
    if (!enabled || serverStatus !== 'enabled' || !token) return;
    const socket = createSocket('/workflow', { auth: { token }, reconnection: true });
    socket.on('workflow:event', (event: WorkflowEvent) => {
      if (stateRef.current.events.some(existing => existing.id === event.id)) return;
      const incoming: WorkflowState = {
        workItems: [],
        events: [event],
        notifications: []
      };
      void updateState(incoming)
        .then(() => workflowRequest<WorkflowState>('/api/workflow/state', token))
        .then(remoteState => updateState(remoteState))
        .catch(cause => setError(errorMessage(cause)));
    });
    socket.on('connect_error', cause => setError(`Workflow live connection failed: ${cause.message}`));
    return () => { socket.disconnect(); };
  }, [enabled, serverStatus, token, updateState]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WORKFLOW_STORAGE_KEY || !event.newValue) return;
      void repository.read()
        .then(next => updateState(next, false))
        .catch(cause => setError(errorMessage(cause)));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [repository, updateState]);

  const setWorkflowEnabled = useCallback((nextEnabled: boolean) => {
    if (!clientConfigured) return;
    localStorage.setItem(SETTINGS_KEY, String(nextEnabled));
    setSettingEnabled(nextEnabled);
  }, []);

  const createForRecord = useCallback(async (input: Omit<WorkflowRecordInput, 'createdBy'>) => {
    if (!enabled || !currentActor) throw new Error('Workflow linking is not enabled for this demo session.');
    try {
      if (serverStatus === 'enabled' && token) {
        const result = await workflowRequest<WorkflowState>('/api/workflow/records', token, input);
        setError(null);
        return await updateState(result);
      }
      const result = await localService.createForRecord({ ...input, createdBy: currentActor });
      return await updateState(result);
    } catch (cause) {
      if (serverStatus === 'enabled' && isNetworkFailure(cause)) {
        setServerStatus('unavailable');
        const result = await localService.createForRecord({ ...input, createdBy: currentActor });
        setError('Workflow server unavailable; using this browser’s demo workflow store.');
        return await updateState(result);
      }
      setError(errorMessage(cause));
      throw cause;
    }
  }, [currentActor, enabled, isDemoMode, localService, serverStatus, token, updateState]);

  const act = useCallback(async (itemId: string, action: WorkflowAction) => {
    if (!enabled || !currentActor) throw new Error('Workflow linking is not enabled for this demo session.');
    try {
      if (serverStatus === 'enabled' && token) {
        const result = await workflowRequest<WorkflowState>(`/api/workflow/items/${encodeURIComponent(itemId)}/actions`, token, action);
        setError(null);
        return await updateState(result);
      }
      const result = await localService.act(itemId, currentActor, action);
      return await updateState(result);
    } catch (cause) {
      if (serverStatus === 'enabled' && isNetworkFailure(cause)) {
        setServerStatus('unavailable');
        const result = await localService.act(itemId, currentActor, action);
        setError('Workflow server unavailable; using this browser’s demo workflow store.');
        return await updateState(result);
      }
      setError(errorMessage(cause));
      throw cause;
    }
  }, [currentActor, enabled, localService, serverStatus, token, updateState]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    const nextState = {
      ...stateRef.current,
      notifications: stateRef.current.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    };
    await updateState(nextState);
  }, [updateState]);

  const runSampleScenario = useCallback(async () => {
    if (!enabled) throw new Error('Enable workflow linking in settings to run the demo scenario.');
    const recordId = `INC-WF-${Date.now()}`;
    const scenarioInput = {
      recordType: 'Incident' as const,
      recordId,
      title: 'Synthetic high-potential equipment incident',
      priority: 'Critical' as const,
      highPotential: true,
      serious: true,
      siteId: 'site-sohar',
      department: 'Sohar Operations'
    };
    try {
      if (serverStatus === 'enabled' && token) {
        const workerToken = await requestDemoToken('usr-workflow-worker-oman');
        const officerToken = await requestDemoToken('usr-workflow-hse-officer-oman');
        const managerToken = await requestDemoToken('usr-workflow-hse-manager-oman');
        const created = await workflowRequest<WorkflowState>('/api/workflow/records', workerToken, scenarioInput);
        const investigation = created.workItems.find(item => item.recordType === 'Investigation');
        if (!investigation) throw new Error('The sample incident did not create an investigation task.');
        await workflowRequest(`/api/workflow/items/${encodeURIComponent(investigation.id)}/actions`, officerToken, { type: 'claim' });
        await workflowRequest(`/api/workflow/items/${encodeURIComponent(investigation.id)}/actions`, officerToken, { type: 'complete' });
        const approved = await workflowRequest<WorkflowState>(`/api/workflow/items/${encodeURIComponent(investigation.id)}/actions`, managerToken, { type: 'approve' });
        await updateState(approved);
      } else {
        const worker = demoActor('usr-workflow-worker-oman');
        const officer = demoActor('usr-workflow-hse-officer-oman');
        const manager = demoActor('usr-workflow-hse-manager-oman');
        const created = await localService.createForRecord({ ...scenarioInput, createdBy: worker });
        const investigation = created.workItems.find(item => item.recordType === 'Investigation');
        if (!investigation) throw new Error('The sample incident did not create an investigation task.');
        await localService.act(investigation.id, officer, { type: 'claim' });
        await localService.act(investigation.id, officer, { type: 'complete' });
        const approved = await localService.act(investigation.id, manager, { type: 'approve' });
        await updateState(approved);
      }
      setError(null);
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
      throw cause;
    }
  }, [enabled, localService, refresh, serverStatus, token, updateState]);

  const value = useMemo<WorkflowContextValue>(() => ({
    enabled,
    clientConfigured,
    settingEnabled,
    serverStatus,
    workItems: state.workItems,
    events: state.events,
    notifications: currentUser
      ? state.notifications.filter(notification => notification.userId === currentUser.id)
      : [],
    unreadCount: currentUser
      ? state.notifications.filter(notification => notification.userId === currentUser.id && !notification.read).length
      : 0,
    error,
    setWorkflowEnabled,
    createForRecord,
    act,
    markNotificationRead,
    runSampleScenario,
    refresh
  }), [act, createForRecord, currentUser, enabled, error, markNotificationRead, refresh, runSampleScenario, serverStatus, setWorkflowEnabled, settingEnabled, state]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

export function useWorkflow(): WorkflowContextValue {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return context;
}

async function workflowRequest<T = WorkflowState>(path: string, token: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch (cause) {
    throw new Error(cause instanceof Error ? cause.message : 'Workflow server is unreachable.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Workflow request failed (${response.status}).`);
  return data as T;
}

async function requestDemoToken(userId: string): Promise<string> {
  const response = await fetch('/api/workflow/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Could not create demo session (${response.status}).`);
  if (typeof result.token !== 'string') throw new Error('Workflow server returned an invalid synthetic demo credential.');
  return result.token;
}

function demoActor(userId: string): WorkflowActor {
  const profile = WORKFLOW_DEMO_USERS.find(user => user.id === userId);
  if (!profile) throw new Error('The sample scenario profile is not configured.');
  return {
    id: profile.id,
    role: profile.role,
    department: profile.department,
    siteId: 'site-sohar'
  };
}

function notificationsForEvents(
  events: WorkflowEvent[],
  userId: string,
  role: WorkflowActor['role'],
  siteId: string
): WorkflowNotification[] {
  return events
    .filter(event =>
      event.targetUserIds.includes(userId)
      || event.targetRoles?.includes(role)
      || event.siteIds?.includes(siteId)
    )
    .map(event => ({
      id: `${event.id}:${userId}`,
      userId,
      eventId: event.id,
      message: {
        en: `${event.type.replaceAll('.', ' ')}: ${String(event.payload.title ?? event.recordRef.recordId)}`,
        ar: `تحديث سير العمل: ${String(event.payload.title ?? event.recordRef.recordId)}`
      },
      severity: event.payload.priority === 'Critical' ? 'critical' : event.payload.priority === 'High' ? 'warning' : 'info',
      read: false,
      actionLink: `/workflow/${encodeURIComponent(event.recordRef.recordId)}`,
      createdAt: event.createdAt
    }));
}

function isWorkflowState(value: unknown): value is WorkflowState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WorkflowState>;
  return Array.isArray(candidate.workItems)
    && Array.isArray(candidate.events)
    && Array.isArray(candidate.notifications);
}

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && /failed to fetch|network|unreachable/i.test(error.message));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Workflow operation failed.';
}
