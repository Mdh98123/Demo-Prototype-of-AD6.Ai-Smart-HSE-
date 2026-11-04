/**
 * AD6.Ai Smart HSE Platform — Templated Notification Service
 *
 * Implements templated dispatch and persists all delivery attempts and receipts
 * into the `notification_outbox` table with full multi-tenant isolation.
 *
 * Templates:
 * 1. `statutory_clock_escalation`: Oman MoL MD 286/2008 Form G 24-Hour statutory escalation
 * 2. `capa_overdue`: Action owner SLA breach notification
 * 3. `twl_breach`: Extreme Heat Stand-Down Directive under PDO SP-1170
 * 4. `permit_pending_approval`: Area Authority review notice
 */

import crypto from 'node:crypto';
import { getPool, withTenantContext } from '../../db/connection.js';
import {
  NotificationProvider,
  NotificationChannel,
  DeliveryReceipt
} from './notificationAdapter.js';
import { MockNotificationProvider } from './mockNotificationProvider.js';

export type NotificationTemplateType =
  | 'statutory_clock_escalation'
  | 'capa_overdue'
  | 'twl_breach'
  | 'permit_pending_approval';

export interface TemplatePayload {
  incidentNumber?: string;
  hoursRemaining?: number;
  deadline?: string;
  actionNumber?: string;
  actionTitle?: string;
  ownerName?: string;
  daysOverdue?: number;
  twlValue?: number;
  location?: string;
  permitNumber?: string;
  permitType?: string;
  applicantName?: string;
  customDetails?: Record<string, any>;
}

export class TemplatedNotificationService {
  private static defaultProvider: NotificationProvider = new MockNotificationProvider();

  public static setDefaultProvider(provider: NotificationProvider): void {
    this.defaultProvider = provider;
  }

  public static getDefaultProvider(): NotificationProvider {
    return this.defaultProvider;
  }

  /**
   * Renders subject and body for statutory HSE templates
   */
  public static renderTemplate(
    templateId: NotificationTemplateType,
    payload: TemplatePayload
  ): { subject: string; body: string } {
    switch (templateId) {
      case 'statutory_clock_escalation':
        return {
          subject: `URGENT STATUTORY ALERT: Oman MoL 24-Hour Form G Notification Required [Incident #${payload.incidentNumber || 'N/A'}]`,
          body: `Attention HSE Leadership,\n\nUnder Sultanate of Oman Ministerial Decision 286/2008 and Royal Decree 53/2023, serious incident #${payload.incidentNumber || 'N/A'} requires mandatory Form G submission to the Ministry of Labour within 24 hours of occurrence.\n\nDeadline: ${payload.deadline || 'Imminent'}\nRemaining: ${payload.hoursRemaining ?? 0} hour(s).\n\nPlease verify and complete the statutory filing immediately via the AD6.Ai Form G compliance module.\n\nAD6.Ai Statutory Compliance Engine`
        };

      case 'capa_overdue':
        return {
          subject: `CAPA SLA OVERDUE ESCALATION: Action #${payload.actionNumber || 'N/A'} — ${payload.actionTitle || 'Corrective Action'}`,
          body: `Notice to Action Owner (${payload.ownerName || 'HSE Team'}):\n\nCorrective Action #${payload.actionNumber || 'N/A'} is now ${payload.daysOverdue ?? 1} day(s) past its agreed target completion date. In accordance with GCC Enterprise Safety Management standards, this action has been escalated to supervisory leadership.\n\nPlease update closure evidence or request an authorized management extension.\n\nAD6.Ai CAPA Management System`
        };

      case 'twl_breach':
        return {
          subject: `SAFETY STAND-DOWN DIRECTIVE: Thermal Work Limit Breach (< 115 W/m²) at ${payload.location || 'Site'} [PDO SP-1170]`,
          body: `IMMEDIATE ACTION REQUIRED: Area Authority & Field Supervision.\n\nDesert Weather IoT station has recorded a Thermal Work Limit of ${payload.twlValue ?? 108} W/m² at ${payload.location || 'the concession area'}, breaching the 115 W/m² withdrawal limit under PDO SP-1170.\n\nDIRECTIVE:\n1. All outdoor hot work and heavy manual labor must cease immediately.\n2. Field personnel must withdraw to cooled rest shelters.\n3. Active work permits in this sector are gated until recovery readings are confirmed.\n\nAD6.Ai Industrial IoT Hub`
        };

      case 'permit_pending_approval':
        return {
          subject: `PERMIT APPROVAL REQUIRED: Permit #${payload.permitNumber || 'N/A'} (${payload.permitType || 'Hot Work'}) — ${payload.location || 'Site'}`,
          body: `Attention Area Authority,\n\nPermit #${payload.permitNumber || 'N/A'} has been prepared by ${payload.applicantName || 'Permit Receiver'} and requires supervisory review and signature before work may commence (PDO SP-1143).\n\nLocation: ${payload.location || 'General Concession'}\nType: ${payload.permitType || 'Cold Work'}\n\nPlease review gas testing and spatial SIMOPS clash status in AD6.Ai Control of Work.\n\nAD6.Ai Control of Work Gateway`
        };

      default:
        return {
          subject: 'AD6.Ai Smart HSE Platform Notification',
          body: JSON.stringify(payload, null, 2)
        };
    }
  }

  /**
   * Dispatches a templated notification and records it in `notification_outbox`
   */
  public static async dispatch(
    tenantId: string,
    recipient: string,
    channel: NotificationChannel,
    templateId: NotificationTemplateType,
    payload: TemplatePayload,
    provider: NotificationProvider = this.defaultProvider
  ): Promise<{ outboxId: string; receipt: DeliveryReceipt }> {
    const { subject, body } = this.renderTemplate(templateId, payload);
    const outboxId = crypto.randomUUID();

    let receipt: DeliveryReceipt;
    let deliveryStatus = 'DELIVERED';
    let errorMessage: string | undefined = undefined;

    try {
      receipt = await provider.send({
        to: recipient,
        subject,
        body,
        channel,
        metadata: { tenantId, templateId, ...payload }
      });
      deliveryStatus = receipt.status;
    } catch (err: any) {
      deliveryStatus = 'FAILED';
      errorMessage = err.message || 'Dispatch failed';
      receipt = {
        receiptId: `failed_${crypto.randomUUID()}`,
        provider: provider.providerName,
        channel,
        status: 'FAILED',
        recipient,
        deliveredAt: new Date().toISOString(),
        providerResponseCode: '500_ERROR'
      };
    }

    // Persist into notification_outbox table
    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO notification_outbox (
          id, tenant_id, channel, recipient, template_id, subject, payload,
          status, delivery_receipt, error_message, attempts, created_at, sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, NOW(), NOW())`,
        [
          outboxId,
          tenantId,
          channel,
          recipient,
          templateId,
          subject,
          JSON.stringify(payload),
          deliveryStatus,
          JSON.stringify(receipt),
          errorMessage || null
        ]
      );
    });

    return { outboxId, receipt };
  }

  /**
   * Retrieves outbox records for a tenant
   */
  public static async getOutboxMessages(
    tenantId: string,
    limit = 20
  ): Promise<any[]> {
    const pool = getPool();
    const res = await pool.query(
      `SELECT * FROM notification_outbox WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows;
  }
}
