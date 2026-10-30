/**
 * Encrypted Offline Queue Stub (Phase 6 Placeholder)
 *
 * Persists transient encrypted offline operation tokens in browser localStorage
 * awaiting connection re-establishment.
 * In compliance with Guardrail G-1 (Allowed ONLY for encrypted offline queue).
 */

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  encryptedPayload: string;
  timestamp: string;
  retryCount: number;
}

const OFFLINE_QUEUE_KEY = 'ad6_offline_queue_stub';

export class OfflineQueueStub {
  public static getQueue(): OfflineQueueItem[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static enqueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): OfflineQueueItem {
    const queue = this.getQueue();
    const newItem: OfflineQueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    queue.push(newItem);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {
      // Storage quota or browser security restriction
    }
    return newItem;
  }

  public static dequeue(id: string): void {
    const queue = this.getQueue().filter(i => i.id !== id);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {
      // Ignore
    }
  }
}
