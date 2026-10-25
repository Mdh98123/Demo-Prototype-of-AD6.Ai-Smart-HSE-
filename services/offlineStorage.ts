import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface InspectionRecord {
  id: string;
  templateId: string;
  status: 'DRAFT' | 'PENDING_SYNC' | 'SYNCED' | 'CONFLICT';
  priority?: 'URGENT' | 'NORMAL'; // Urgent Sync Priority Queue
  data: any; // Answers, photos, GPS
  location?: { lat: number; lng: number };
  serverData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DraftIncidentRecord {
  id: string;
  title: string;
  site: string;
  facility: string;
  classification: string;
  severity: string;
  timestamp: string;
  narrative: string;
  immediateActions: string;
  evidence: Array<{ url: string; caption: string }>;
  status: 'DRAFT' | 'PENDING_SYNC' | 'SYNCED';
  jurisdiction: string;
  gpsCoordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export interface CachedPermitRecord {
  id: string;
  permitNumber: string;
  type: string;
  title: string;
  exactLocation: string;
  zone: string;
  status: string;
  validFrom: string;
  validTo: string;
  issuerSignature?: string;
  receiverSignature?: string;
  gasTestingLog: Array<{
    oxygen: number;
    lel: number;
    h2s: number;
    co: number;
    timestamp: string;
    testerName: string;
    status: string;
  }>;
  lotoIsolations: Array<{
    tagNumber: string;
    isolationPoint: string;
    equipmentName: string;
    isolationType: string;
    status: string;
    isolatorSignature: string;
  }>;
  cachedAt: string;
}

export interface SyncQueueItem {
  id: string; // uuid
  action: 'SUBMIT_INSPECTION' | 'UPLOAD_PHOTO' | 'SUBMIT_INCIDENT' | 'UPDATE_PERMIT' | 'AUTHORIZE_PERMIT';
  entityType?: 'INSPECTION' | 'INCIDENT' | 'PERMIT';
  priority?: 'URGENT' | 'NORMAL'; // Urgent Sync Priority
  title?: string;
  payload: any;
  retryCount: number;
  lastTried?: string;
  createdAt: string;
  status?: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  version: string;
  schema: any;
}

interface HSE_DB_SCHEMA extends DBSchema {
  inspections: {
    key: string;
    value: InspectionRecord;
    indexes: { 'by-status': string };
  };
  draftIncidents: {
    key: string;
    value: DraftIncidentRecord;
    indexes: { 'by-status': string };
  };
  activePermits: {
    key: string;
    value: CachedPermitRecord;
    indexes: { 'by-status': string; 'by-zone': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
  };
  templates: {
    key: string;
    value: TemplateRecord;
  };
}

class OfflineStorageService {
  private dbPromise: Promise<IDBPDatabase<HSE_DB_SCHEMA>>;

  constructor() {
    this.dbPromise = openDB<HSE_DB_SCHEMA>('hse-offline-db', 2, {
      upgrade(db, oldVersion) {
        // Version 1 stores
        if (!db.objectStoreNames.contains('inspections')) {
          const store = db.createObjectStore('inspections', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }

        // Version 2 additions: Draft Incidents & Active Permits
        if (!db.objectStoreNames.contains('draftIncidents')) {
          const incStore = db.createObjectStore('draftIncidents', { keyPath: 'id' });
          incStore.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('activePermits')) {
          const ptwStore = db.createObjectStore('activePermits', { keyPath: 'id' });
          ptwStore.createIndex('by-status', 'status');
          ptwStore.createIndex('by-zone', 'zone');
        }
      },
    });

    // Auto-seed baseline offline data on first initialization
    this.seedBaselineOfflineData();
  }

  // --- Inspections ---
  async saveInspection(record: InspectionRecord) {
    const db = await this.dbPromise;
    await db.put('inspections', record);
  }

  async getInspection(id: string) {
    const db = await this.dbPromise;
    return db.get('inspections', id);
  }

  async getInspectionsByStatus(status: InspectionRecord['status']) {
    const db = await this.dbPromise;
    return db.getAllFromIndex('inspections', 'by-status', status);
  }

  async getAllInspections() {
    const db = await this.dbPromise;
    return db.getAll('inspections');
  }

  async deleteInspection(id: string) {
    const db = await this.dbPromise;
    return db.delete('inspections', id);
  }

  async setInspectionUrgentPriority(id: string, isUrgent: boolean): Promise<InspectionRecord | null> {
    const db = await this.dbPromise;
    const record = await db.get('inspections', id);
    if (record) {
      record.priority = isUrgent ? 'URGENT' : 'NORMAL';
      record.updatedAt = new Date().toISOString();
      await db.put('inspections', record);

      // Also update matching syncQueue entry if queued
      const queue = await db.getAll('syncQueue');
      const queueItem = queue.find(q => q.payload?.id === id || q.id === id);
      if (queueItem) {
        queueItem.priority = isUrgent ? 'URGENT' : 'NORMAL';
        await db.put('syncQueue', queueItem);
      }
      return record;
    }
    return null;
  }

  // --- Draft Incidents (Offline Field Reporting) ---
  async saveDraftIncident(record: DraftIncidentRecord) {
    const db = await this.dbPromise;
    await db.put('draftIncidents', record);
  }

  async getDraftIncident(id: string) {
    const db = await this.dbPromise;
    return db.get('draftIncidents', id);
  }

  async getAllDraftIncidents() {
    const db = await this.dbPromise;
    return db.getAll('draftIncidents');
  }

  async deleteDraftIncident(id: string) {
    const db = await this.dbPromise;
    return db.delete('draftIncidents', id);
  }

  // --- Active Permits (Offline Field Verification & Custody) ---
  async saveActivePermit(record: CachedPermitRecord) {
    const db = await this.dbPromise;
    await db.put('activePermits', record);
  }

  async cachePermitsBatch(records: CachedPermitRecord[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('activePermits', 'readwrite');
    await Promise.all(records.map(r => tx.store.put(r)));
    await tx.done;
  }

  async getActivePermit(id: string) {
    const db = await this.dbPromise;
    return db.get('activePermits', id);
  }

  async getAllActivePermits() {
    const db = await this.dbPromise;
    return db.getAll('activePermits');
  }

  // --- Sync Queue (Offline Submission Serialization) ---
  async enqueueSyncItem(item: SyncQueueItem) {
    const db = await this.dbPromise;
    await db.put('syncQueue', item);
  }

  async getSyncQueue() {
    const db = await this.dbPromise;
    return db.getAll('syncQueue');
  }

  async getPendingCount(): Promise<number> {
    const db = await this.dbPromise;
    return db.count('syncQueue');
  }

  async removeFromQueue(id: string) {
    const db = await this.dbPromise;
    await db.delete('syncQueue', id);
  }

  async updateSyncItem(item: SyncQueueItem) {
    const db = await this.dbPromise;
    await db.put('syncQueue', item);
  }

  async clearQueue() {
    const db = await this.dbPromise;
    await db.clear('syncQueue');
  }

  // --- Templates ---
  async saveTemplates(templates: TemplateRecord[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('templates', 'readwrite');
    await Promise.all(templates.map(t => tx.store.put(t)));
    await tx.done;
  }

  async getTemplates() {
    const db = await this.dbPromise;
    return db.getAll('templates');
  }

  // Seed baseline data so offline execution immediately has active permits and templates
  private async seedBaselineOfflineData() {
    try {
      const db = await this.dbPromise;
      const count = await db.count('activePermits');
      if (count === 0) {
        const baselinePermits: CachedPermitRecord[] = [
          {
            id: 'ptw-1',
            permitNumber: 'PTW-2026-8812',
            type: 'Hot Work',
            title: 'Flare Header Pipeline Hot Tapping & High Pressure Flange Tie-in',
            exactLocation: 'Mina Al Fahal Industrial Complex - Unit 42 Offsites',
            zone: 'Zone 4A - Process Unit 2',
            status: 'Active',
            validFrom: '2026-10-04T06:00:00Z',
            validTo: '2026-10-04T18:00:00Z',
            issuerSignature: 'Eng. Mansoor Al-Ketbi (Senior Operations Lead)',
            receiverSignature: 'Tariq Al-Hashemi (Lead Mechanical Specialist)',
            gasTestingLog: [
              {
                oxygen: 20.9,
                lel: 0.0,
                h2s: 0.0,
                co: 1.0,
                timestamp: '2026-10-04T07:15:00Z',
                testerName: 'Rashid Al-Kindi (AGT-1049)',
                status: 'SAFE'
              }
            ],
            lotoIsolations: [
              {
                tagNumber: 'LOTO-FL-401A',
                isolationPoint: 'Suction Inlet MOV-101 Gate Valve',
                equipmentName: 'Booster Pump P-102A',
                isolationType: 'Mechanical',
                status: 'Applied & Padlocked',
                isolatorSignature: 'Khalfan Al-Zaabi'
              }
            ],
            cachedAt: new Date().toISOString()
          },
          {
            id: 'ptw-2',
            permitNumber: 'PTW-2026-8815',
            type: 'Confined Space Entry',
            title: 'Internal Hydrocarbon Vessel Descaling & Ultrasonic Wall Thickness Scan',
            exactLocation: 'Mina Al Fahal Industrial Complex - Column C-102',
            zone: 'Zone 4B - Distillation Column C-102',
            status: 'Authorized',
            validFrom: '2026-10-04T08:00:00Z',
            validTo: '2026-10-04T20:00:00Z',
            issuerSignature: 'Saeed Al-Ghafri (Operations Superintendent)',
            gasTestingLog: [
              {
                oxygen: 20.8,
                lel: 0.0,
                h2s: 0.0,
                co: 2.0,
                timestamp: '2026-10-04T07:30:00Z',
                testerName: 'Hamad Al-Kaabi (AGT-2210)',
                status: 'SAFE'
              }
            ],
            lotoIsolations: [
              {
                tagNumber: 'LOTO-CS-201',
                isolationPoint: 'Nitrogen Purge Inlet Spectacle Flange',
                equipmentName: 'Vessel V-102 Hydrocarbon Degasser',
                isolationType: 'Mechanical',
                status: 'Zero Energy Verified',
                isolatorSignature: 'Jamal Al-Harthi'
              }
            ],
            cachedAt: new Date().toISOString()
          }
        ];
        await this.cachePermitsBatch(baselinePermits);
      }

      // Seed baseline template if empty
      const tCount = await db.count('templates');
      if (tCount === 0) {
        await this.saveTemplates([
          {
            id: 'tmpl-general-hse',
            name: 'High-Risk Field Safety & Environmental Audit',
            version: '2.4.0',
            schema: {
              sections: [
                {
                  id: 's1',
                  title: 'Life Saving Rules & Work at Height',
                  questions: [
                    { id: 'q1', text: 'Are safety harnesses anchored to certified 22kN points?', type: 'YES_NO' },
                    { id: 'q2', text: 'Is drop-tool tethering rigorously enforced on elevated catwalks?', type: 'YES_NO' }
                  ]
                },
                {
                  id: 's2',
                  title: 'Control of Work & Gas Testing',
                  questions: [
                    { id: 'q3', text: 'Is calibrated multi-gas detector operating within continuous 15m radius?', type: 'YES_NO' },
                    { id: 'q4', text: 'Are LOTO padlocks tagged with individual personnel contact details?', type: 'YES_NO' }
                  ]
                }
              ]
            }
          }
        ]);
      }

      // Seed baseline inspections with locations if empty
      const iCount = await db.count('inspections');
      if (iCount === 0) {
        const baselineInspections: InspectionRecord[] = [
          {
            id: 'insp-001',
            templateId: 'High-Risk Field Safety & Environmental Audit',
            status: 'PENDING_SYNC',
            priority: 'URGENT',
            data: {
              inspectorName: 'Rahul Gupta',
              answers: { q1: 'YES', q2: 'NO', q3: 'YES', q4: 'YES' },
              notes: 'Tethering wire loose on Catwalk 4; urgent sync flagged for immediate supervisor response.'
            },
            location: { lat: 24.1107, lng: 52.7306 },
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 'insp-002',
            templateId: 'Life Saving Rules & Work at Height',
            status: 'PENDING_SYNC',
            priority: 'URGENT',
            data: {
              inspectorName: 'Marcus Chen',
              answers: { q1: 'NO', q2: 'NO' },
              notes: 'Harness lanyard damaged; worker stood down under SWA.'
            },
            location: { lat: 24.1125, lng: 52.7328 },
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
          },
          {
            id: 'insp-003',
            templateId: 'Control of Work & Gas Testing',
            status: 'SYNCED',
            priority: 'NORMAL',
            data: {
              inspectorName: 'Fatima Al-Kaabi',
              answers: { q3: 'YES', q4: 'YES' },
              notes: 'Atmospheric test verified compliant (0.0 LEL, 20.9% O2).'
            },
            location: { lat: 24.1085, lng: 52.7275 },
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
          },
          {
            id: 'insp-004',
            templateId: 'High-Risk Field Safety & Environmental Audit',
            status: 'DRAFT',
            priority: 'NORMAL',
            data: {
              inspectorName: 'Rahul Gupta',
              answers: { q1: 'YES', q2: 'YES' },
              notes: 'Routine scaffolding audit underway in Sector 3.'
            },
            location: { lat: 24.1140, lng: 52.7345 },
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
          },
          {
            id: 'insp-005',
            templateId: 'Control of Work & Gas Testing',
            status: 'CONFLICT',
            priority: 'URGENT',
            data: {
              inspectorName: 'Tariq Al-Hashemi',
              answers: { q3: 'YES', q4: 'NO' },
              notes: 'Concurrent padlocking tag mismatch conflict detected on MOV-101.'
            },
            location: { lat: 24.1162, lng: 52.7290 },
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
          },
          {
            id: 'insp-006',
            templateId: 'Scaffolding & Rigging Walkthrough',
            status: 'SYNCED',
            priority: 'NORMAL',
            data: {
              inspectorName: 'Alice Smith',
              answers: { q1: 'YES', q2: 'YES', q3: 'YES', q4: 'YES' },
              notes: 'Green Scafftag valid and verified.'
            },
            location: { lat: 24.1095, lng: 52.7360 },
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ];
        for (const item of baselineInspections) {
          await db.put('inspections', item);
        }
      }
    } catch (err) {
      console.warn('[OfflineStorage] Baseline seed skipped or already initialized:', err);
    }
  }
}

export const offlineStorage = new OfflineStorageService();
