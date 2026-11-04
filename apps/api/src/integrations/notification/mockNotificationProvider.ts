/**
 * AD6.Ai Smart HSE Platform — Mock Notification Provider
 *
 * Captures sent messages and generates verified delivery receipts for testing.
 */

import crypto from 'node:crypto';
import {
  NotificationProvider,
  NotificationChannel,
  NotificationMessage,
  DeliveryReceipt
} from './notificationAdapter.js';

export class MockNotificationProvider implements NotificationProvider {
  public readonly providerName = 'MockTestDispatch';
  public readonly supportedChannels: NotificationChannel[] = ['email', 'sms', 'whatsapp'];

  public readonly sentMessages: Array<{
    message: NotificationMessage;
    receipt: DeliveryReceipt;
  }> = [];

  public async send(message: NotificationMessage): Promise<DeliveryReceipt> {
    const receipt: DeliveryReceipt = {
      receiptId: `rcpt_${crypto.randomUUID()}`,
      provider: this.providerName,
      channel: message.channel,
      status: 'DELIVERED',
      recipient: message.to,
      deliveredAt: new Date().toISOString(),
      providerResponseCode: '250_OK_DELIVERED'
    };

    this.sentMessages.push({ message, receipt });
    return receipt;
  }

  public getReceiptCount(): number {
    return this.sentMessages.length;
  }

  public clear(): void {
    this.sentMessages.length = 0;
  }
}
