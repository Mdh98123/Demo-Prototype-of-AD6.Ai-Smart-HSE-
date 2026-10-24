import { offlineStorage, SyncQueueItem, InspectionRecord, DraftIncidentRecord } from './offlineStorage';

export interface SyncNotification {
  id: string;
  type: 'SUCCESS' | 'CONFLICT' | 'ERROR';
  message: string;
  itemCount: number;
  timestamp: string;
}

// Simulated API dispatchers with network delay simulation
const mockApiSubmitInspection = async (payload: any) => {
  await new Promise(res => setTimeout(res, 600));
  // Simulate potential conflict
  if (payload.__forceConflict) {
    throw { status: 409, serverData: { ...payload, conflictedField: 'Server modified this field concurrently' } };
  }
  return { success: true, id: payload.id };
};

const mockApiSubmitIncident = async (payload: any) => {
  await new Promise(res => setTimeout(res, 600));
  // Save to localStorage or backend
  const existing = JSON.parse(localStorage.getItem('ad6_enterprise_incidents') || '[]');
  const updated = [payload, ...existing.filter((i: any) => i.id !== payload.id)];
  localStorage.setItem('ad6_enterprise_incidents', JSON.stringify(updated));
  return { success: true, id: payload.id };
};

const mockApiUpdatePermit = async (payload: any) => {
  await new Promise(res => setTimeout(res, 500));
  return { success: true, id: payload.id };
};

export class SyncEngine {
  public static isSyncing = false;
  private static listeners: ((status: 'IDLE' | 'SYNCING' | 'ERROR', pendingCount: number, notification?: SyncNotification) => void)[] = [];
  private static lastNotification: SyncNotification | null = null;
  private static isInitialized = false;

  public static subscribe(listener: (status: 'IDLE' | 'SYNCING' | 'ERROR', pendingCount: number, notification?: SyncNotification) => void) {
    this.listeners.push(listener);
    this.notify('IDLE');
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static async notify(status: 'IDLE' | 'SYNCING' | 'ERROR' = 'IDLE', notification?: SyncNotification) {
    const queue = await offlineStorage.getSyncQueue();
    if (notification) {
      this.lastNotification = notification;
    }
    this.listeners.forEach(l => l(status, queue.length, this.lastNotification || undefined));
  }

  // Queue an inspection submission
  public static async queueInspection(record: InspectionRecord, title?: string, priority?: 'URGENT' | 'NORMAL') {
    const queueItem: SyncQueueItem = {
      id: `queue-insp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'SUBMIT_INSPECTION',
      entityType: 'INSPECTION',
      priority: priority || record.priority || 'NORMAL',
      title: title || `Inspection ${record.id}`,
      payload: record,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      status: 'QUEUED'
    };

    record.status = 'PENDING_SYNC';
    record.priority = queueItem.priority;
    await offlineStorage.saveInspection(record);
    await offlineStorage.enqueueSyncItem(queueItem);

    console.log('[Sync Engine] Queued inspection for offline sync (Priority: ' + queueItem.priority + '):', queueItem.id);
    await this.notify('IDLE');

    // If online, immediately attempt sync
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Queue an incident submission
  public static async queueIncident(incident: DraftIncidentRecord, title?: string) {
    const queueItem: SyncQueueItem = {
      id: `queue-inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'SUBMIT_INCIDENT',
      entityType: 'INCIDENT',
      title: title || `Incident Report: ${incident.title}`,
      payload: incident,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      status: 'QUEUED'
    };

    incident.status = 'PENDING_SYNC';
    await offlineStorage.saveDraftIncident(incident);
    await offlineStorage.enqueueSyncItem(queueItem);

    console.log('[Sync Engine] Queued incident report for offline sync:', queueItem.id);
    await this.notify('IDLE');

    // If online, attempt immediate sync
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Process all queued offline submissions
  public static async processQueue(): Promise<number> {
    if (this.isSyncing) return 0;
    if (!navigator.onLine) {
      this.notify('IDLE');
      return 0;
    }

    const queue = await offlineStorage.getSyncQueue();
    if (queue.length === 0) {
      this.notify('IDLE');
      return 0;
    }

    // Sort queue by priority: URGENT items first, then by earliest timestamp
    queue.sort((a, b) => {
      const aUrgent = a.priority === 'URGENT' ? 1 : 0;
      const bUrgent = b.priority === 'URGENT' ? 1 : 0;
      if (aUrgent !== bUrgent) return bUrgent - aUrgent;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    this.isSyncing = true;
    this.notify('SYNCING');
    let syncedCount = 0;

    try {
      for (const item of queue) {
        try {
          if (item.action === 'SUBMIT_INSPECTION') {
            await mockApiSubmitInspection(item.payload);
            const record = await offlineStorage.getInspection(item.payload.id);
            if (record) {
              record.status = 'SYNCED';
              await offlineStorage.saveInspection(record);
            }
          } else if (item.action === 'SUBMIT_INCIDENT') {
            await mockApiSubmitIncident(item.payload);
            const record = await offlineStorage.getDraftIncident(item.payload.id);
            if (record) {
              record.status = 'SYNCED';
              await offlineStorage.saveDraftIncident(record);
            }
          } else if (item.action === 'UPDATE_PERMIT' || item.action === 'AUTHORIZE_PERMIT') {
            await mockApiUpdatePermit(item.payload);
          }

          await offlineStorage.removeFromQueue(item.id);
          syncedCount++;
        } catch (error: any) {
          if (error.status === 409) {
            // Conflict resolution workflow
            const record = await offlineStorage.getInspection(item.payload.id);
            if (record) {
              record.status = 'CONFLICT';
              record.serverData = error.serverData;
              await offlineStorage.saveInspection(record);
            }
            await offlineStorage.removeFromQueue(item.id);
          } else {
            // Exponential backoff attempt
            item.retryCount += 1;
            item.lastTried = new Date().toISOString();
            item.errorMessage = error?.message || 'Sync attempt failed';
            await offlineStorage.updateSyncItem(item);
          }
        }
      }

      if (syncedCount > 0) {
        const notification: SyncNotification = {
          id: `notif-${Date.now()}`,
          type: 'SUCCESS',
          message: `Connection restored: Successfully synchronized ${syncedCount} offline record(s) with enterprise ledger.`,
          itemCount: syncedCount,
          timestamp: new Date().toISOString()
        };

        // Dispatch browser custom event for toasts across app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hse-sync-complete', { detail: notification }));
        }

        this.notify('IDLE', notification);
      }
    } finally {
      this.isSyncing = false;
      this.notify('IDLE');
    }

    return syncedCount;
  }

  // Initialize event listeners for network changes & service worker background sync
  public static initAutoSync() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Listen to native online event
    window.addEventListener('online', () => {
      console.log('[Sync Engine] Network revived (online event). Triggering queue sync...');
      this.processQueue();
    });

    // Listen to messages from Service Worker (Background Sync)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'DISPATCH_BACKGROUND_SYNC') {
          console.log('[Sync Engine] Background Sync received from Service Worker. Processing queue...');
          this.processQueue();
        }
      });
    }

    // Attempt initial sync on boot if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 1500);
    }
  }

  public static async forceSync() {
    return this.processQueue();
  }

  public static async resolveConflict(inspectionId: string, resolvedData: any) {
    const record = await offlineStorage.getInspection(inspectionId);
    if (!record) return;

    record.data = resolvedData;
    record.status = 'PENDING_SYNC';
    record.serverData = undefined;
    record.updatedAt = new Date().toISOString();

    await offlineStorage.saveInspection(record);

    await offlineStorage.enqueueSyncItem({
      id: `queue-conflict-${Date.now()}`,
      action: 'SUBMIT_INSPECTION',
      entityType: 'INSPECTION',
      title: `Resolved Inspection ${inspectionId}`,
      payload: record,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      status: 'QUEUED'
    });

    if (navigator.onLine) {
      this.processQueue();
    }
  }
}
