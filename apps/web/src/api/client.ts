/**
 * @ad6/web Enterprise API Client
 *
 * Implements direct server API communication for domain data:
 * - Incidents, CAPAs, Permits, Inspections, Observations, Contractors, Documents, Training
 * - One-time LocalStorage Migration Importer
 * - GET /health/ready DB connectivity check
 *
 * In strict compliance with Guardrail G-1:
 * "NEVER persist incidents, permits, CAPAs, audits, training records, or contractor data in browser local storage."
 */

export interface ApiClientConfig {
  baseUrl?: string;
  tenantId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class EnterpriseApiClient {
  private baseUrl: string;
  private tenantId: string;
  private isClientStoreReadOnly: boolean = false;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/v1';
    this.tenantId = config.tenantId || '00000000-0000-0000-0000-000000000001';
  }

  public setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  public isReadOnly(): boolean {
    return this.isClientStoreReadOnly;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
      ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const msg = err.error?.message || err.error || `Request failed with status ${response.status}`;
      throw new Error(msg);
    }

    return response.json();
  }

  // ==========================================
  // DB CONNECTIVITY & HEALTH
  // ==========================================
  public async checkHealthReady() {
    return this.request<{ status: string; database: any }>('/health/ready');
  }

  // ==========================================
  // ONE-TIME LOCALSTORAGE MIGRATION
  // ==========================================
  public async importLocalStorage(payload: any) {
    const res = await this.request<{ success: boolean; data: any }>('/import/localstorage', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.isClientStoreReadOnly = true;
    return res;
  }

  // ==========================================
  // INCIDENTS CRUD
  // ==========================================
  public async getIncidents(params?: PaginationParams & { status?: string; severity?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/incidents${query ? `?${query}` : ''}`);
  }

  public async getIncidentById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/incidents/${id}`);
  }

  public async createIncident(data: any) {
    return this.request<{ success: boolean; data: any }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateIncident(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteIncident(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/incidents/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // CAPAS CRUD
  // ==========================================
  public async getCapas(params?: PaginationParams & { status?: string; priority?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/capas${query ? `?${query}` : ''}`);
  }

  public async getCapaById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/capas/${id}`);
  }

  public async createCapa(data: any) {
    return this.request<{ success: boolean; data: any }>('/capas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateCapa(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/capas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteCapa(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/capas/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // PERMITS CRUD
  // ==========================================
  public async getPermits(params?: PaginationParams & { status?: string; permit_type?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/permits${query ? `?${query}` : ''}`);
  }

  public async getPermitById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/permits/${id}`);
  }

  public async createPermit(data: any) {
    return this.request<{ success: boolean; data: any }>('/permits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updatePermit(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/permits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deletePermit(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/permits/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // INSPECTIONS CRUD
  // ==========================================
  public async getInspections(params?: PaginationParams & { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/inspections${query ? `?${query}` : ''}`);
  }

  public async getInspectionById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/inspections/${id}`);
  }

  public async createInspection(data: any) {
    return this.request<{ success: boolean; data: any }>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateInspection(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteInspection(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/inspections/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // OBSERVATIONS CRUD
  // ==========================================
  public async getObservations(params?: PaginationParams & { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/observations${query ? `?${query}` : ''}`);
  }

  public async getObservationById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/observations/${id}`);
  }

  public async createObservation(data: any) {
    return this.request<{ success: boolean; data: any }>('/observations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateObservation(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/observations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteObservation(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/observations/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // CONTRACTORS CRUD
  // ==========================================
  public async getContractors(params?: PaginationParams & { compliance_status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/contractors${query ? `?${query}` : ''}`);
  }

  public async getContractorById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/contractors/${id}`);
  }

  public async createContractor(data: any) {
    return this.request<{ success: boolean; data: any }>('/contractors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateContractor(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteContractor(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/contractors/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // DOCUMENTS CRUD
  // ==========================================
  public async getDocuments(params?: PaginationParams & { category?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/documents${query ? `?${query}` : ''}`);
  }

  public async getDocumentById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/documents/${id}`);
  }

  public async createDocument(data: any) {
    return this.request<{ success: boolean; data: any }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateDocument(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteDocument(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/documents/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // TRAINING CRUD
  // ==========================================
  public async getTrainingRecords(params?: PaginationParams & { course_code?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(`/training${query ? `?${query}` : ''}`);
  }

  public async getTrainingRecordById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/training/${id}`);
  }

  public async createTrainingRecord(data: any) {
    return this.request<{ success: boolean; data: any }>('/training', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateTrainingRecord(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/training/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async deleteTrainingRecord(id: string) {
    return this.request<{ success: boolean; data: { deleted: boolean } }>(`/training/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // STATUTORY FORM G & AUDIT LEDGER
  // ==========================================
  public async submitStatutoryFormG(payload: any) {
    return this.request<{ success: boolean; data: any }>('/statutory/form-g', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const apiClient = new EnterpriseApiClient();
