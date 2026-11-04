/**
 * AD6.Ai Smart HSE Platform — ERP / Procurement Adapter Interface
 *
 * Supports bi-directional synchronization with SAP S/4HANA (Ariba / PM) and IBM Maximo:
 * 1. Contractor master sync (syncing approved vendors, CR numbers, HSE pre-qualification)
 * 2. Contractor document expiry sync (statutory licenses, OPAL certificates, civil defense)
 * 3. Monthly HSE statistics export (standard operator return)
 */

export interface ErpContractorRecord {
  companyName: string;
  trade: string;
  crNumber: string;
  contactEmail: string;
  contactPhone: string;
  complianceStatus: 'Approved' | 'Conditional' | 'Suspended';
}

export interface ErpDocumentRecord {
  contractorName: string;
  docType: string;
  title: string;
  fileUrl: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring' | 'Expired';
}

export interface ErpSyncResult<T> {
  syncedCount: number;
  records: T[];
  syncTimestamp: string;
  erpSystem: string;
}

export interface ErpExportResult {
  exportPayload: string;
  format: 'json' | 'xml' | 'csv';
  checksum: string;
  byteLength: number;
  exportedAt: string;
}

export interface ErpAdapter {
  systemName: string;
  syncContractorMaster(tenantId: string): Promise<ErpSyncResult<ErpContractorRecord>>;
  syncDocumentExpiry(tenantId: string): Promise<ErpSyncResult<ErpDocumentRecord>>;
  exportMonthlyHseStatistics(tenantId: string, reportingPeriod: string): Promise<ErpExportResult>;
}
