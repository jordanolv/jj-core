import { ObjectId } from 'mongodb';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export type NotificationHandler = (
  profileId?: string,
  context?: Record<string, any>
) => Promise<NotificationPayload | NotificationPayload[]>;

export interface NotificationDefinition {
  type: string;
  label: string;
  description: string;
  schedule?: string;
  handler: NotificationHandler;
  category?: string;
  userSubscribable?: boolean;
  defaultEnabled?: boolean;
}

export interface NotificationSubscription {
  _id?: ObjectId;
  profileId: string;
  notificationType: string;
  enabled: boolean;
  preferences?: {
    channels?: ('push' | 'email')[];
    customSchedule?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PushSubscription {
  _id?: ObjectId;
  profileId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

export interface NotificationLog {
  _id?: ObjectId;
  profileId: string;
  notificationType: string;
  payload: NotificationPayload;
  channel: 'push' | 'email';
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt: Date;
}

export interface NotificationRegistryEntry extends NotificationDefinition {
  sourcePath: string;
  registeredAt: Date;
}
