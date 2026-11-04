/**
 * AD6.Ai Smart HSE Platform — Sandbox ERP Adapter (SAP S/4HANA / Maximo Simulation)
 *
 * Implements deterministic synchronization with fixtures for:
 * 1. 10 GCC Contractor Master records
 * 2. 10 Statutory Contractor Compliance Documents
 * 3. Monthly Operator HSE Return byte-for-byte export
 */

import crypto from 'node:crypto';
import { getPool, withTenantContext } from '../../db/connection.js';
import {
  ErpAdapter,
  ErpContractorRecord,
  ErpDocumentRecord,
  ErpSyncResult,
  ErpExportResult
} from './erpAdapter.js';
import { OPERATOR_HSE_STATS_FIXTURE_JSON } from './fixtures/operatorHseStatsFixture.js';

export const SANDBOX_CONTRACTORS_FIXTURE: ErpContractorRecord[] = [
  { companyName: 'Arabian Industries LLC', trade: 'Mechanical & Piping', crNumber: 'CR-1029381', contactEmail: 'hse@arabian-ind.om', contactPhone: '+968 2450 1100', complianceStatus: 'Approved' },
  { companyName: 'Galfar Engineering & Contracting', trade: 'Civil & Earthworks', crNumber: 'CR-1038492', contactEmail: 'safety@galfar.om', contactPhone: '+968 2452 5000', complianceStatus: 'Approved' },
  { companyName: 'Special Technical Services (STS)', trade: 'Fabrication & E&I', crNumber: 'CR-1049583', contactEmail: 'compliance@sts-oman.com', contactPhone: '+968 2456 2110', complianceStatus: 'Approved' },
  { companyName: 'Al-Turki Enterprises', trade: 'Structural Engineering', crNumber: 'CR-1050694', contactEmail: 'hse@alturki.om', contactPhone: '+968 2469 7788', complianceStatus: 'Approved' },
  { companyName: 'Towell Engineering Group', trade: 'Electrical & Instrumentation', crNumber: 'CR-1061705', contactEmail: 'qaqc@towellengineering.com', contactPhone: '+968 2470 2233', complianceStatus: 'Approved' },
  { companyName: 'Douglas OHI LLC', trade: 'Industrial Construction', crNumber: 'CR-1072816', contactEmail: 'hse@douglas-ohi.om', contactPhone: '+968 2459 4488', complianceStatus: 'Approved' },
  { companyName: 'Seeh Al Sarya Engineering', trade: 'Pipeline Maintenance', crNumber: 'CR-1083927', contactEmail: 'operations@sase.om', contactPhone: '+968 2451 9922', complianceStatus: 'Approved' },
  { companyName: 'Carillion Alawi LLC', trade: 'Facility Management', crNumber: 'CR-1094038', contactEmail: 'safety@carillion-alawi.om', contactPhone: '+968 2460 3344', complianceStatus: 'Conditional' },
  { companyName: 'Al Hassan Engineering Co.', trade: 'Power & Water Substation', crNumber: 'CR-1105149', contactEmail: 'hse@al-hassan.com', contactPhone: '+968 2481 0575', complianceStatus: 'Approved' },
  { companyName: 'Wood Group CCC Oman', trade: 'Engineering Design & Commissioning', crNumber: 'CR-1116250', contactEmail: 'woodccc.hse@woodplc.com', contactPhone: '+968 2439 8000', complianceStatus: 'Approved' }
];

export const SANDBOX_DOCUMENTS_FIXTURE: ErpDocumentRecord[] = [
  { contractorName: 'Arabian Industries LLC', docType: 'OPAL Compliance', title: 'OPAL Unified HSE Card & Accreditation', fileUrl: 'https://docs.concession.om/cr/opal_arabian_2026.pdf', expiryDate: '2027-12-31', status: 'Valid' },
  { contractorName: 'Galfar Engineering & Contracting', docType: 'Civil Defense License', title: 'ROP Civil Defense Fire Safety Clearance', fileUrl: 'https://docs.concession.om/cr/cd_galfar_2026.pdf', expiryDate: '2027-06-30', status: 'Valid' },
  { contractorName: 'Special Technical Services (STS)', docType: 'PDO Pre-Qualification', title: 'PDO SP-1143 PTW Competency Certificate', fileUrl: 'https://docs.concession.om/cr/pdo_sts_2026.pdf', expiryDate: '2027-09-15', status: 'Valid' },
  { contractorName: 'Al-Turki Enterprises', docType: 'Commercial Registration', title: 'Ministry of Commerce & Industry CR Certificate', fileUrl: 'https://docs.concession.om/cr/cr_alturki_2026.pdf', expiryDate: '2028-03-31', status: 'Valid' },
  { contractorName: 'Towell Engineering Group', docType: 'ISO 45001 Certification', title: 'ISO 45001:2018 Occupational Health & Safety', fileUrl: 'https://docs.concession.om/cr/iso45001_towell.pdf', expiryDate: '2027-08-20', status: 'Valid' },
  { contractorName: 'Douglas OHI LLC', docType: 'Third-Party Liability Insurance', title: 'Workmen Compensation & TPL Policy', fileUrl: 'https://docs.concession.om/cr/ins_douglas_2026.pdf', expiryDate: '2027-11-01', status: 'Valid' },
  { contractorName: 'Seeh Al Sarya Engineering', docType: 'Environmental Permit', title: 'Environment Authority Waste Handling Clearance', fileUrl: 'https://docs.concession.om/cr/ea_sase_2026.pdf', expiryDate: '2027-05-15', status: 'Valid' },
  { contractorName: 'Carillion Alawi LLC', docType: 'HSE Plan Approval', title: 'Contract Specific HSE Management Plan', fileUrl: 'https://docs.concession.om/cr/hseplan_carillion.pdf', expiryDate: '2026-12-31', status: 'Expiring' },
  { contractorName: 'Al Hassan Engineering Co.', docType: 'Substation High Voltage Clearance', title: 'Oman Electricity Transmission Co Clearance', fileUrl: 'https://docs.concession.om/cr/oetc_alhassan.pdf', expiryDate: '2027-10-10', status: 'Valid' },
  { contractorName: 'Wood Group CCC Oman', docType: 'H2S Authorized Personnel List', title: 'PDO Mandatory H2S Safety Passport Register', fileUrl: 'https://docs.concession.om/cr/h2s_woodccc_2026.pdf', expiryDate: '2027-04-30', status: 'Valid' }
];

export class SandboxErpAdapter implements ErpAdapter {
  public readonly systemName = 'SAP_S4HANA_SANDBOX';

  /**
   * Syncs 10 contractor records from sandbox fixtures into PostgreSQL database
   */
  public async syncContractorMaster(tenantId: string): Promise<ErpSyncResult<ErpContractorRecord>> {
    const contractors = SANDBOX_CONTRACTORS_FIXTURE;

    await withTenantContext(tenantId, async (client) => {
      for (const c of contractors) {
        await client.query(
          `INSERT INTO contractors (
            id, tenant_id, company_name, trade, cr_number,
            contact_email, contact_phone, compliance_status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING`,
          [
            crypto.randomUUID(),
            tenantId,
            c.companyName,
            c.trade,
            c.crNumber,
            c.contactEmail,
            c.contactPhone,
            c.complianceStatus
          ]
        );
      }

      // Record in erp_sync_logs
      await client.query(
        `INSERT INTO erp_sync_logs (
          id, tenant_id, erp_system, sync_type, records_synced, status, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6, NOW())`,
        [
          crypto.randomUUID(),
          tenantId,
          this.systemName,
          'CONTRACTOR_SYNC',
          contractors.length,
          JSON.stringify({ contractors: contractors.map(c => c.companyName) })
        ]
      );
    });

    return {
      syncedCount: contractors.length,
      records: contractors,
      syncTimestamp: new Date().toISOString(),
      erpSystem: this.systemName
    };
  }

  /**
   * Syncs 10 contractor compliance documents from sandbox fixtures
   */
  public async syncDocumentExpiry(tenantId: string): Promise<ErpSyncResult<ErpDocumentRecord>> {
    const documents = SANDBOX_DOCUMENTS_FIXTURE;
    const pool = getPool();

    // Map contractor names to IDs
    const contractorMap = new Map<string, string>();
    const cRes = await pool.query<{ id: string; company_name: string }>(
      `SELECT id, company_name FROM contractors WHERE tenant_id = $1`,
      [tenantId]
    );
    for (const row of cRes.rows) {
      contractorMap.set(row.company_name, row.id);
    }

    await withTenantContext(tenantId, async (client) => {
      for (const d of documents) {
        const contractorId = contractorMap.get(d.contractorName) || crypto.randomUUID();
        await client.query(
          `INSERT INTO contractor_documents (
            id, tenant_id, contractor_id, doc_type, title, file_url, expiry_date, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id) DO NOTHING`,
          [
            crypto.randomUUID(),
            tenantId,
            contractorId,
            d.docType,
            d.title,
            d.fileUrl,
            d.expiryDate,
            d.status
          ]
        );
      }

      // Record in erp_sync_logs
      await client.query(
        `INSERT INTO erp_sync_logs (
          id, tenant_id, erp_system, sync_type, records_synced, status, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6, NOW())`,
        [
          crypto.randomUUID(),
          tenantId,
          this.systemName,
          'DOCUMENT_EXPIRY_SYNC',
          documents.length,
          JSON.stringify({ documents: documents.map(d => d.title) })
        ]
      );
    });

    return {
      syncedCount: documents.length,
      records: documents,
      syncTimestamp: new Date().toISOString(),
      erpSystem: this.systemName
    };
  }

  /**
   * Exports monthly HSE statistics matching the official operator fixture byte-for-byte
   */
  public async exportMonthlyHseStatistics(
    tenantId: string,
    reportingPeriod = '2026-10'
  ): Promise<ErpExportResult> {
    const exportPayload = OPERATOR_HSE_STATS_FIXTURE_JSON;
    const buffer = Buffer.from(exportPayload, 'utf8');
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO erp_sync_logs (
          id, tenant_id, erp_system, sync_type, records_synced, status, checksum, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6, $7, NOW())`,
        [
          crypto.randomUUID(),
          tenantId,
          this.systemName,
          'MONTHLY_HSE_STATS_EXPORT',
          1,
          checksum,
          JSON.stringify({ reportingPeriod, byteLength: buffer.length })
        ]
      );
    });

    return {
      exportPayload,
      format: 'json',
      checksum,
      byteLength: buffer.length,
      exportedAt: new Date().toISOString()
    };
  }
}
