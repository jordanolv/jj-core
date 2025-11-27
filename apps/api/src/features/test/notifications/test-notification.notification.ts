import type { NotificationDefinition } from '../types';

export const testNotification: NotificationDefinition = {
  type: 'test_notification',
  label: 'Test Notification',
  description: 'Notification de test envoyée toutes les 10 secondes',
  category: 'test',
  schedule: '*/10 * * * * *',
  userSubscribable: true,
  defaultEnabled: false,

  handler: async (profileId?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR');

    return {
      title: '🧪 Test Notification',
      body: `Test envoyé à ${timeStr}`,
      data: {
        timestamp: now.toISOString(),
        profileId,
      },
      icon: '/icon.png',
      tag: 'test-notification',
      requireInteraction: false,
    };
  },
};
