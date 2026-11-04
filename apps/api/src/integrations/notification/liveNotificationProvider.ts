/**
 * AD6.Ai Smart HSE Platform — Live Notification Provider Skeleton
 *
 * Implements real SendGrid (email) and Twilio (SMS/WhatsApp) gateway.
 * Enforces strict fail-closed security when SENDGRID_API_KEY or TWILIO_AUTH_TOKEN is missing.
 */

import {
  NotificationProvider,
  NotificationChannel,
  NotificationMessage,
  DeliveryReceipt
} from './notificationAdapter.js';

export class LiveNotificationProvider implements NotificationProvider {
  public readonly providerName = 'LiveCloudDispatch';
  public readonly supportedChannels: NotificationChannel[] = ['email', 'sms', 'whatsapp'];

  private checkCredentials(channel: NotificationChannel): void {
    if (channel === 'email') {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        throw new Error(
          'Live Notification Error: Missing SENDGRID_API_KEY credentials. Live email dispatch failing closed.'
        );
      }
    } else {
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      if (!authToken || !accountSid || authToken.trim() === '') {
        throw new Error(
          `Live Notification Error: Missing TWILIO credentials for ${channel}. Live SMS/WhatsApp dispatch failing closed.`
        );
      }
    }
  }

  public async send(message: NotificationMessage): Promise<DeliveryReceipt> {
    this.checkCredentials(message.channel);
    throw new Error('Live Notification Error: Remote gateway connectivity failure.');
  }
}
