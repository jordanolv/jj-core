import { ref } from 'vue';

interface NotificationType {
  type: string;
  label: string;
  description: string;
  category: string;
  userSubscribable: boolean;
  defaultEnabled: boolean;
  hasSchedule: boolean;
}

interface NotificationSubscription {
  _id: string;
  profileId: string;
  notificationType: string;
  enabled: boolean;
  preferences?: any;
  createdAt: string;
  updatedAt: string;
}

export const useNotifications = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:4491';

  const notificationTypes = ref<NotificationType[]>([]);
  const subscriptions = ref<NotificationSubscription[]>([]);
  const isLoading = ref(false);
  const isPushSupported = ref(false);
  const isPushEnabled = ref(false);

  const fetchNotificationTypes = async () => {
    try {
      const response = await $fetch<{ types: NotificationType[] }>(
        `${apiUrl}/notifications/types`
      );
      notificationTypes.value = response.types;
    } catch (error) {
      console.error('Error fetching notification types:', error);
    }
  };

  const fetchSubscriptions = async (profileId: string) => {
    try {
      const response = await $fetch<{ subscriptions: NotificationSubscription[] }>(
        `${apiUrl}/notifications/subscriptions`,
        {
          headers: {
            'X-Profile-Id': profileId,
          },
          credentials: 'include',
        }
      );
      subscriptions.value = response.subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const toggleSubscription = async (
    profileId: string,
    notificationType: string,
    enabled: boolean
  ) => {
    isLoading.value = true;
    try {
      console.log('Sending subscription request to:', `${apiUrl}/notifications/subscriptions`);
      await $fetch(`${apiUrl}/notifications/subscriptions`, {
        method: 'POST',
        headers: {
          'X-Profile-Id': profileId,
        },
        credentials: 'include',
        body: {
          notificationType,
          enabled,
        },
      });

      console.log('Subscription saved, fetching updated list');
      await fetchSubscriptions(profileId);
    } catch (error) {
      console.error('Error toggling subscription:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      isPushSupported.value = false;
      return false;
    }

    isPushSupported.value = true;

    const permission = await Notification.requestPermission();
    isPushEnabled.value = permission === 'granted';
    return permission === 'granted';
  };

  const subscribeToPush = async (profileId: string) => {
    if (!isPushSupported.value || !isPushEnabled.value) {
      console.warn('Push notifications not enabled');
      return;
    }

    try {
      const vapidResponse = await $fetch<{ publicKey: string }>(
        `${apiUrl}/notifications/vapid-public-key`
      );

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidResponse.publicKey,
      });

      await $fetch(`${apiUrl}/notifications/push-subscription`, {
        method: 'POST',
        headers: {
          'X-Profile-Id': profileId,
        },
        credentials: 'include',
        body: subscription.toJSON(),
      });

      console.log('Push subscription successful');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  };

  const isSubscribed = (notificationType: string) => {
    return subscriptions.value.some(
      (s) => s.notificationType === notificationType && s.enabled
    );
  };

  const checkPushStatus = async () => {
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;

    isPushSupported.value = hasNotification && hasServiceWorker && hasPushManager;

    if (isPushSupported.value) {
      isPushEnabled.value = Notification.permission === 'granted';
    }
  };

  return {
    notificationTypes,
    subscriptions,
    isLoading,
    isPushSupported,
    isPushEnabled,
    fetchNotificationTypes,
    fetchSubscriptions,
    toggleSubscription,
    requestPushPermission,
    subscribeToPush,
    isSubscribed,
    checkPushStatus,
  };
};
