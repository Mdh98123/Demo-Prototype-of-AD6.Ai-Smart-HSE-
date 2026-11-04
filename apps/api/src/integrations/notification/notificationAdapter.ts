/**
 * AD6.Ai Smart HSE Platform — Notification Provider Adapter Interface
 *
 * Multi-channel delivery gateway for Email (SendGrid / SMTP), SMS (Twilio),
 * and WhatsApp Business Cloud API.
 */

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export interface NotificationMessage {
  to: string;
  subject?: string;
  body: string;
  channel: NotificationChannel;
  metadata?: Record<string, any>;
}

export interface DeliveryReceipt {
  receiptId: string;
  provider: string;
  channel: NotificationChannel;
  status: 'DELIVERED' | 'FAILED';
  recipient: string;
  deliveredAt: string;
  providerResponseCode?: string;
}

export interface NotificationProvider {
  providerName: string;
  supportedChannels: NotificationChannel[];
  send(message: NotificationMessage): Promise<DeliveryReceipt>;
}
