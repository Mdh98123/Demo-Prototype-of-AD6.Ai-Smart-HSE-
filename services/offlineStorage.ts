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

export type ChecklistFieldType = 'text' | 'boolean' | 'photo' | 'signature' | 'select';

export interface DynamicChecklistItem {
  id: string;
  label: string;
  type: ChecklistFieldType;
  required: boolean;
  helpText?: string;
  category?: string;
  options?: string[]; // for 'select'
  booleanTrueLabel?: string; // e.g. 'Compliant' or 'Pass' or 'Yes'
  booleanFalseLabel?: string; // e.g. 'Non-Compliant' or 'Fail' or 'No'
  allowNA?: boolean; // allow N/A
  requirePhotoOnFail?: boolean; // require photo evidence if check fails
  signerRole?: string; // for 'signature' e.g. 'Inspector' or 'Area Supervisor'
}

export interface TemplateRecord {
  id: string;
  name: string;
  title?: string;
  category?: string;
  regulatoryStandard?: string;
  version: string;
  description?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  schema?: any;
  items?: DynamicChecklistItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isSystemDefault?: boolean;
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
  private memoryTemplates: Map<string, TemplateRecord> = new Map();

  constructor() {
    if (typeof indexedDB === 'undefined') {
      this.dbPromise = Promise.resolve(null as any);
      return;
    }
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
    templates.forEach(t => this.memoryTemplates.set(t.id, t));
    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction('templates', 'readwrite');
        await Promise.all(templates.map(t => tx.store.put(t)));
        await tx.done;
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB saveTemplates warning:', e);
    }
    // Dual-sync to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('ad6_inspection_templates', JSON.stringify(templates));
      } catch (err) {
        console.warn('[OfflineStorage] LocalStorage sync warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-templates-updated'));
    }
  }

  async saveTemplate(template: TemplateRecord): Promise<void> {
    const updated = {
      ...template,
      title: template.title || template.name,
      updatedAt: new Date().toISOString()
    };
    this.memoryTemplates.set(updated.id, updated);
    try {
      const db = await this.dbPromise;
      if (db) {
        await db.put('templates', updated);
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB saveTemplate warning:', e);
    }

    // Dual-sync to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const existing = await this.getTemplates();
        const idx = existing.findIndex(t => t.id === updated.id);
        if (idx >= 0) {
          existing[idx] = updated;
        } else {
          existing.unshift(updated);
        }
        localStorage.setItem('ad6_inspection_templates', JSON.stringify(existing));
      } catch (err) {
        console.warn('[OfflineStorage] LocalStorage update warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-templates-updated'));
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    this.memoryTemplates.delete(id);
    try {
      const db = await this.dbPromise;
      if (db) {
        await db.delete('templates', id);
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB deleteTemplate warning:', e);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const existing = await this.getTemplates();
        const filtered = existing.filter(t => t.id !== id);
        localStorage.setItem('ad6_inspection_templates', JSON.stringify(filtered));
      } catch (err) {
        console.warn('[OfflineStorage] LocalStorage delete warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-templates-updated'));
    }
  }

  async getTemplate(id: string): Promise<TemplateRecord | undefined> {
    try {
      const db = await this.dbPromise;
      if (db) {
        const item = await db.get('templates', id);
        if (item) return item;
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB getTemplate warning:', e);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('ad6_inspection_templates');
        if (raw) {
          const list: TemplateRecord[] = JSON.parse(raw);
          const found = list.find(t => t.id === id);
          if (found) return found;
        }
      } catch (err) {
        console.warn('[OfflineStorage] LocalStorage getTemplate warning:', err);
      }
    }
    return this.memoryTemplates.get(id);
  }

  async getTemplates(): Promise<TemplateRecord[]> {
    let results: TemplateRecord[] = [];
    try {
      const db = await this.dbPromise;
      if (db) {
        results = await db.getAll('templates');
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB getTemplates warning:', e);
    }

    if (results.length === 0 && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('ad6_inspection_templates');
        if (raw) {
          results = JSON.parse(raw);
        }
      } catch (err) {
        console.warn('[OfflineStorage] LocalStorage parse warning:', err);
      }
    }

    if (results.length === 0 && this.memoryTemplates.size > 0) {
      results = Array.from(this.memoryTemplates.values());
    }

    // Normalize titles & ensure all default templates exist
    return results.map(t => ({
      ...t,
      title: t.title || t.name
    }));
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

      // Seed baseline templates if empty
      const tCount = await db.count('templates');
      if (tCount === 0) {
        await this.saveTemplates([
          {
            id: 'tmpl-general-hse',
            name: 'High-Risk Field Safety & Environmental Audit',
            title: 'High-Risk Field Safety & Environmental Audit',
            category: 'Workplace Safety & Life Saving Rules',
            regulatoryStandard: 'Oman MoL MD 286/2008 & PDO Mechanism 7',
            version: '2.4.0',
            status: 'ACTIVE',
            isSystemDefault: true,
            description: 'Statutory field audit covering high-risk operations, personal protective equipment, atmospheric gas tests, and photo evidence.',
            createdAt: '2026-01-15T08:00:00Z',
            updatedAt: '2026-10-20T10:00:00Z',
            createdBy: 'Directorate of HSE Compliance',
            items: [
              {
                id: 'item-location-desc',
                label: 'Operational Zone & Specific Work Area',
                type: 'text',
                required: true,
                category: 'General Identification',
                helpText: 'Record the exact concession block, plant unit, or process area.'
              },
              {
                id: 'item-ppe-compliance',
                label: 'Are all personnel wearing certified OPAL/PDO approved PPE?',
                type: 'boolean',
                required: true,
                category: 'Workforce Safety',
                booleanTrueLabel: 'Compliant (Pass)',
                booleanFalseLabel: 'Deficient (Fail)',
                allowNA: false,
                requirePhotoOnFail: true,
                helpText: 'Includes flame-resistant coveralls, safety helmets, high-visibility vest, and safety boots.'
              },
              {
                id: 'item-gas-detector',
                label: 'Is a calibrated multi-gas detector operating within 15m radius?',
                type: 'boolean',
                required: true,
                category: 'Atmospheric Safety',
                booleanTrueLabel: 'Operational (Pass)',
                booleanFalseLabel: 'Non-Compliant (Fail)',
                allowNA: true,
                requirePhotoOnFail: true,
                helpText: 'Bump test must be verified within the past 30 days.'
              },
              {
                id: 'item-loto-isolation',
                label: 'Are energy isolation padlocks tagged with individual technician details?',
                type: 'boolean',
                required: false,
                category: 'Energy Isolation & LOTO',
                booleanTrueLabel: 'Verified (Pass)',
                booleanFalseLabel: 'Missing (Fail)',
                allowNA: true
              },
              {
                id: 'item-hazard-photo',
                label: 'Site Condition & Evidence Photo',
                type: 'photo',
                required: true,
                category: 'Photographic Evidence',
                helpText: 'Capture high-resolution photo evidence of the working environment or observed defects.'
              },
              {
                id: 'item-inspector-notes',
                label: 'Field Observations & Corrective Recommendations',
                type: 'text',
                required: false,
                category: 'Findings & Remarks',
                helpText: 'Dictate by voice or record any housekeeping, contractor, or safety observations.'
              },
              {
                id: 'item-lead-signature',
                label: 'Lead Field Inspector Sign-off',
                type: 'signature',
                required: true,
                category: 'Authorization',
                signerRole: 'Lead HSE Inspector',
                helpText: 'Digital signature certifying that physical verification was performed at the work face.'
              }
            ]
          },
          {
            id: 'tmpl-scaffold-inspection',
            name: 'Scaffolding & Work-at-Height Pre-Task Checklist',
            title: 'Scaffolding & Work-at-Height Pre-Task Checklist',
            category: 'Work at Height & Structural',
            regulatoryStandard: 'PDO SP-1232 / Oman Labour Law RD 53/2023',
            version: '1.8.0',
            status: 'ACTIVE',
            isSystemDefault: true,
            description: 'Structural safety inspection for erected scaffolding, access ladders, harnesses, and dropped object prevention.',
            createdAt: '2026-03-01T08:00:00Z',
            updatedAt: '2026-10-18T14:30:00Z',
            createdBy: 'Scaffolding Safety Superintendent',
            items: [
              {
                id: 'scaff-id-text',
                label: 'Scaffold Identification Number & Elevation',
                type: 'text',
                required: true,
                category: 'Structure Metadata',
                helpText: 'Enter scaffold tag ID (e.g. SCF-MAF-402) and working platform elevation.'
              },
              {
                id: 'scaff-green-tag',
                label: 'Is the Green Scafftag valid, legible, and inspected within 7 days?',
                type: 'boolean',
                required: true,
                category: 'Tagging & Certification',
                booleanTrueLabel: 'Valid Tag (Pass)',
                booleanFalseLabel: 'Expired / Red Tag (Fail)',
                allowNA: false,
                requirePhotoOnFail: true
              },
              {
                id: 'scaff-guardrails',
                label: 'Are top-rails, mid-rails, and toe-boards fully installed on all open sides?',
                type: 'boolean',
                required: true,
                category: 'Fall Protection',
                booleanTrueLabel: 'Compliant (Pass)',
                booleanFalseLabel: 'Deficient (Fail)',
                allowNA: false
              },
              {
                id: 'scaff-tethering',
                label: 'Are all handheld tools 100% tethered with certified drop-prevention lanyards?',
                type: 'boolean',
                required: true,
                category: 'Dropped Object Prevention',
                booleanTrueLabel: 'Enforced (Pass)',
                booleanFalseLabel: 'Violated (Fail)',
                allowNA: false
              },
              {
                id: 'scaff-photo',
                label: 'Working Platform & Base Foundation Photo Evidence',
                type: 'photo',
                required: true,
                category: 'Photographic Evidence',
                helpText: 'Capture wide view of sole boards, base plates, and working decks.'
              },
              {
                id: 'scaff-signature',
                label: 'Certified Scaffolding Inspector Sign-off',
                type: 'signature',
                required: true,
                category: 'Authorization',
                signerRole: 'Competent Scaffolding Inspector (CISRS)'
              }
            ]
          },
          {
            id: 'tmpl-confined-space',
            name: 'Confined Space Entry & Continuous Gas Monitoring',
            title: 'Confined Space Entry & Continuous Gas Monitoring',
            category: 'Control of Work & High Risk',
            regulatoryStandard: 'PDO SP-1143 / Process Safety Guidelines',
            version: '2.1.0',
            status: 'ACTIVE',
            isSystemDefault: true,
            description: 'Mandatory pre-entry checklist verifying mechanical isolations, atmospheric gas levels, forced ventilation, and standby rescue readiness.',
            createdAt: '2026-05-10T09:00:00Z',
            updatedAt: '2026-10-22T11:00:00Z',
            createdBy: 'Process Safety Authority',
            items: [
              {
                id: 'cs-vessel-text',
                label: 'Vessel / Tank / Column Designation & Asset ID',
                type: 'text',
                required: true,
                category: 'Asset Identification'
              },
              {
                id: 'cs-isolation-bool',
                label: 'Are all process inlet/outlet lines blinded or physically disconnected?',
                type: 'boolean',
                required: true,
                category: 'Positive Isolation',
                booleanTrueLabel: 'Blinded & Locked (Pass)',
                booleanFalseLabel: 'Incomplete Isolation (Fail)',
                allowNA: false
              },
              {
                id: 'cs-gas-test-bool',
                label: 'Atmospheric Test: O2 (19.5%-22.5%), LEL (0%), H2S (0 ppm), CO (<25 ppm)?',
                type: 'boolean',
                required: true,
                category: 'Atmospheric Gas Testing',
                booleanTrueLabel: 'Safe to Enter (Pass)',
                booleanFalseLabel: 'Hazardous Atmosphere (Fail)',
                allowNA: false,
                requirePhotoOnFail: true
              },
              {
                id: 'cs-standby-man',
                label: 'Is a dedicated Standby Man present at the manway with two-way radio?',
                type: 'boolean',
                required: true,
                category: 'Emergency Preparedness',
                booleanTrueLabel: 'Positioned & Alert (Pass)',
                booleanFalseLabel: 'Missing Standby (Fail)',
                allowNA: false
              },
              {
                id: 'cs-detector-photo',
                label: 'Multi-Gas Detector Screen Display Photo',
                type: 'photo',
                required: true,
                category: 'Photographic Evidence',
                helpText: 'Photograph gas meter screen showing live O2, LEL, H2S, and CO readings.'
              },
              {
                id: 'cs-agt-signature',
                label: 'Authorized Gas Tester (AGT) Sign-off',
                type: 'signature',
                required: true,
                category: 'Authorization',
                signerRole: 'Authorized Gas Tester (Level 2)'
              }
            ]
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
