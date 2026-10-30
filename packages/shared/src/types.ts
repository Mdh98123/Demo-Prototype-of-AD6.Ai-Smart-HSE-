/**
 * AD6.Ai Smart HSE Platform — Shared TypeScript Types
 */

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
  jurisdiction: 'OMAN' | 'UAE' | 'KSA' | 'QATAR';
  crNumber: string;
  isActive: boolean;
}

export interface IncidentRecord {
  id: string;
  tenantId: string;
  incidentNumber: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Under Investigation' | 'Awaiting Approval' | 'Closed';
  siteLocation: string;
  occurredAt: string;
  reportedBy: string;
  formGSubmitted: boolean;
  formGReceiptNumber?: string;
  details: Record<string, any>;
}

export interface BarrierItem {
  id: string;
  name: string;
  type: 'preventative' | 'mitigative';
  effectiveness: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Degraded' | 'Failed';
}

export interface BowtieModel {
  topEvent: string;
  hazard: string;
  threats: Array<{ id: string; name: string; barriers: BarrierItem[] }>;
  consequences: Array<{ id: string; name: string; barriers: BarrierItem[] }>;
}

export interface ThermalWorkLimitReading {
  siteId: string;
  siteName: string;
  twlWattsPerSqMeter: number;
  wbgtIndexCelsius?: number;
  ambientTempCelsius: number;
  recordedAt: string;
  workStoppageMandated: boolean;
}
