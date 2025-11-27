import webpush from 'web-push';
import { notificationRegistry } from './registry';
import { notificationDb } from './db';
import type { NotificationPayload } from './types';

interface SendNotificationOptions {
  profileId: string;
  notificationType: string;
  context?: Record<string, any>;
}

export class NotificationService {
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;

  constructor() {
    this.initializeVapid();
  }

  private initializeVapid() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org';

    if (publicKey && privateKey) {
      this.vapidKeys = { publicKey, privateKey };
      webpush.setVapidDetails(subject, publicKey, privateKey);
      console.log('[Notification Service] VAPID keys configured');
    } else {
      console.warn('[Notification Service] VAPID keys not configured. Push notifications will not work.');
    }
  }

  async send(options: SendNotificationOptions): Promise<boolean> {
    const { profileId, notificationType, context } = options;

    const definition = notificationRegistry.get(notificationType);
    if (!definition) {
      throw new Error(`Notification type "${notificationType}" not found in registry`);
    }

    const subscription = await notificationDb.getSubscription(profileId, notificationType);
    if (!subscription || !subscription.enabled) {
      console.log(`[Notification Service] Profile ${profileId} not subscribed to ${notificationType}`);
      return false;
    }

    try {
      const payload = await definition.handler(profileId, context);
      const payloads = Array.isArray(payload) ? payload : [payload];

      for (const p of payloads) {
        await this.sendPushNotification(profileId, p);
        await notificationDb.logNotification({
          profileId,
          notificationType,
          payload: p,
          channel: 'push',
          status: 'sent',
          sentAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error(`[Notification Service] Failed to send ${notificationType} to ${profileId}:`, error);
      await notificationDb.logNotification({
        profileId,
        notificationType,
        payload: { title: 'Error', body: 'Failed to generate notification' },
        channel: 'push',
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        sentAt: new Date(),
      });
      return false;
    }
  }

  private async sendPushNotification(profileId: string, payload: NotificationPayload) {
    const subscriptions = await notificationDb.getPushSubscriptions(profileId);

    if (subscriptions.length === 0) {
      console.log(`[Notification Service] No push subscriptions for profile ${profileId}`);
      return;
    }

    const pushPayload = JSON.stringify(payload);

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          pushPayload
        );
        console.log(`[Notification Service] Push sent to ${sub.endpoint.substring(0, 50)}...`);
      } catch (error: any) {
        if (error.statusCode === 410) {
          console.log(`[Notification Service] Subscription expired, removing: ${sub.endpoint}`);
          await notificationDb.deletePushSubscription(sub.endpoint);
        } else {
          console.error(`[Notification Service] Push failed:`, error);
        }
      }
    }
  }

  async sendToAllSubscribers(notificationType: string, context?: Record<string, any>) {
    const definition = notificationRegistry.get(notificationType);
    if (!definition) {
      throw new Error(`Notification type "${notificationType}" not found in registry`);
    }

    console.log(`[Notification Service] Broadcasting ${notificationType} to all subscribers`);

    const allProfiles = await this.getAllProfilesForNotificationType(notificationType);

    let sent = 0;
    let failed = 0;

    for (const profileId of allProfiles) {
      const success = await this.send({ profileId, notificationType, context });
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`[Notification Service] Broadcast complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  private async getAllProfilesForNotificationType(notificationType: string): Promise<string[]> {
    const db = await (await import('../../shared/db/mongo')).getDatabase();
    const subscriptions = await db
      .collection('notification_subscriptions')
      .find({ notificationType, enabled: true })
      .toArray();

    return subscriptions.map((s: any) => s.profileId);
  }

  async subscribe(profileId: string, notificationType: string, enabled: boolean = true) {
    const definition = notificationRegistry.get(notificationType);
    if (!definition) {
      throw new Error(`Notification type "${notificationType}" not found`);
    }

    if (definition.userSubscribable === false) {
      throw new Error(`Cannot subscribe to ${notificationType}: not user-subscribable`);
    }

    await notificationDb.upsertSubscription(profileId, notificationType, { enabled });
    console.log(`[Notification Service] Profile ${profileId} ${enabled ? 'subscribed' : 'unsubscribed'} to ${notificationType}`);
  }

  async savePushSubscription(profileId: string, subscription: PushSubscriptionJSON) {
    await notificationDb.savePushSubscription(profileId, subscription);
    console.log(`[Notification Service] Push subscription saved for profile ${profileId}`);
  }

  generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }
}

export const notificationService = new NotificationService();
