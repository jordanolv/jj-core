<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔔 Préférences de notifications
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérez vos notifications pour le profil <span class="font-semibold">{{ selectedProfile?.name }}</span>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Recevez des notifications push dans votre navigateur
            </p>
          </div>
          <button
            v-if="isPushSupported && !isPushEnabled"
            @click="enablePush"
            :disabled="isLoading"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
          >
            Activer
          </button>
          <span v-else-if="isPushEnabled" class="text-green-600 dark:text-green-400 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Activé
          </span>
          <span v-else class="text-red-600 dark:text-red-400">
            Non supporté
          </span>
        </div>
      </div>

      <div v-if="notificationTypes.length === 0" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="category in categories"
          :key="category"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>{{ getCategoryIcon(category) }}</span>
            <span class="capitalize">{{ category }}</span>
          </h3>

          <div class="space-y-3">
            <div
              v-for="notif in getNotificationsByCategory(category)"
              :key="notif.type"
              class="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ notif.label }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ notif.description }}
                </p>
                <div v-if="notif.hasSchedule" class="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Envoi automatique</span>
                </div>
              </div>

              <label class="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  :checked="isSubscribed(notif.type)"
                  @change="toggleNotification(notif.type, ($event.target as HTMLInputElement).checked)"
                  :disabled="isLoading"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProfiles } from '~/features/profiles/composables/useProfiles';
import { useNotifications } from '~/features/notifications/composables/useNotifications';

definePageMeta({
  middleware: 'authenticated',
});

const { selectedProfile } = useProfiles();
const {
  notificationTypes,
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
} = useNotifications();

onMounted(async () => {
  checkPushStatus();
  await fetchNotificationTypes();
  if (selectedProfile.value) {
    await fetchSubscriptions(selectedProfile.value.id);
  }
});

const categories = computed(() => {
  const cats = new Set(notificationTypes.value.map((n: any) => n.category));
  return Array.from(cats);
});

const getNotificationsByCategory = (category: string) => {
  return notificationTypes.value.filter((n: any) => n.category === category);
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    budget: '💰',
    test: '🧪',
    gardes: '🐾',
    cuisine: '🍳',
  };
  return icons[category] || '📢';
};

const toggleNotification = async (notificationType: string, enabled: boolean) => {
  console.log('Toggle called:', notificationType, enabled, selectedProfile.value);
  if (!selectedProfile.value) {
    console.error('No profile selected');
    return;
  }

  try {
    await toggleSubscription(selectedProfile.value.id, notificationType, enabled);
    console.log('Toggle successful');
  } catch (error) {
    console.error('Failed to toggle notification:', error);
  }
};

const enablePush = async () => {
  if (!selectedProfile.value) return;

  try {
    const granted = await requestPushPermission();
    if (granted) {
      await subscribeToPush(selectedProfile.value.id);
    }
  } catch (error) {
    console.error('Failed to enable push:', error);
  }
};
</script>
