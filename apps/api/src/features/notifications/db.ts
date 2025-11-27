import { ObjectId } from 'mongodb';
import { getDatabase } from '../../shared/db/mongo';
import type {
  NotificationSubscription,
  PushSubscription,
  NotificationLog,
} from './types';

const COLLECTIONS = {
  SUBSCRIPTIONS: 'notification_subscriptions',
  PUSH_SUBSCRIPTIONS: 'push_subscriptions',
  LOGS: 'notification_logs',
} as const;

export const notificationDb = {
  async getSubscription(profileId: string, notificationType: string) {
    const db = await getDatabase();
    return db
      .collection<NotificationSubscription>(COLLECTIONS.SUBSCRIPTIONS)
      .findOne({ profileId, notificationType });
  },

  async getProfileSubscriptions(profileId: string) {
    const db = await getDatabase();
    return db
      .collection<NotificationSubscription>(COLLECTIONS.SUBSCRIPTIONS)
      .find({ profileId })
      .toArray();
  },

  async upsertSubscription(
    profileId: string,
    notificationType: string,
    data: Partial<NotificationSubscription>
  ) {
    const db = await getDatabase();
    const now = new Date();

    const result = await db
      .collection<NotificationSubscription>(COLLECTIONS.SUBSCRIPTIONS)
      .findOneAndUpdate(
        { profileId, notificationType },
        {
          $set: {
            ...data,
            updatedAt: now,
          },
          $setOnInsert: {
            profileId,
            notificationType,
            createdAt: now,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

    return result;
  },

  async deleteSubscription(profileId: string, notificationType: string) {
    const db = await getDatabase();
    return db
      .collection<NotificationSubscription>(COLLECTIONS.SUBSCRIPTIONS)
      .deleteOne({ profileId, notificationType });
  },

  async savePushSubscription(profileId: string, subscription: PushSubscriptionJSON) {
    const db = await getDatabase();
    const now = new Date();

    const result = await db
      .collection<PushSubscription>(COLLECTIONS.PUSH_SUBSCRIPTIONS)
      .findOneAndUpdate(
        { profileId, endpoint: subscription.endpoint },
        {
          $set: {
            keys: subscription.keys as { p256dh: string; auth: string },
          },
          $setOnInsert: {
            profileId,
            endpoint: subscription.endpoint!,
            createdAt: now,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

    return result;
  },

  async getPushSubscriptions(profileId: string) {
    const db = await getDatabase();
    return db
      .collection<PushSubscription>(COLLECTIONS.PUSH_SUBSCRIPTIONS)
      .find({ profileId })
      .toArray();
  },

  async deletePushSubscription(endpoint: string) {
    const db = await getDatabase();
    return db
      .collection<PushSubscription>(COLLECTIONS.PUSH_SUBSCRIPTIONS)
      .deleteOne({ endpoint });
  },

  async logNotification(log: Omit<NotificationLog, '_id'>) {
    const db = await getDatabase();
    const result = await db
      .collection<NotificationLog>(COLLECTIONS.LOGS)
      .insertOne({ ...log, _id: new ObjectId() });

    return result;
  },

  async getNotificationLogs(profileId: string, limit = 50) {
    const db = await getDatabase();
    return db
      .collection<NotificationLog>(COLLECTIONS.LOGS)
      .find({ profileId })
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray();
  },
}

