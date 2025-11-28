<template>
  <div class="py-4 px-4 sm:py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Mobile-first header -->
      <div class="mb-6 sm:mb-8 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <h1 class="text-2xl sm:text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          🔔 Préférences de notifications
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Gérez vos notifications pour le profil <span class="font-semibold">{{ selectedProfile?.name }}</span>
        </p>
      </div>

      <!-- Mobile-first push notification card -->
      <div class="backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
              Push Notifications
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Recevez des notifications push dans votre navigateur
            </p>
          </div>
          <button
            v-if="isPushSupported && !isPushEnabled"
            @click="enablePush"
            :disabled="isLoading"
            class="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl active:scale-95 sm:hover:shadow-lg sm:hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            Activer
          </button>
          <span v-else-if="isPushEnabled" class="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold text-sm sm:text-base justify-center sm:justify-start">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Activé
          </span>
          <span v-else class="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base text-center sm:text-left">
            Non supporté
          </span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="notificationTypes.length === 0" class="text-center py-12 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl shadow-xl">
        <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">Chargement...</p>
      </div>

      <!-- Mobile-first categories -->
      <div v-else class="space-y-3 sm:space-y-4">
        <div
          v-for="category in categories"
          :key="category"
          class="backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 active:scale-[0.99] sm:hover:shadow-2xl"
        >
          <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span class="text-xl sm:text-2xl">{{ getCategoryIcon(category) }}</span>
            <span class="capitalize">{{ category }}</span>
          </h3>

          <!-- Mobile-first notification items -->
          <div class="space-y-2 sm:space-y-3">
            <div
              v-for="notif in getNotificationsByCategory(category)"
              :key="notif.type"
              class="flex items-start justify-between gap-3 p-3 sm:p-4 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl active:scale-[0.99] sm:hover:bg-white/80 dark:sm:hover:bg-white/10 transition-all duration-300 sm:hover:shadow-lg"
            >
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm sm:text-base text-slate-900 dark:text-white">
                  {{ notif.label }}
                </h4>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                  {{ notif.description }}
                </p>
                <div v-if="notif.hasSchedule" class="flex items-center gap-1 mt-1.5 sm:mt-2 text-xs text-slate-500 dark:text-slate-500">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Envoi automatique</span>
                </div>
              </div>

              <!-- Mobile-friendly toggle -->
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  :checked="isSubscribed(notif.type)"
                  @change="toggleNotification(notif.type, ($event.target as HTMLInputElement).checked)"
                  :disabled="isLoading"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-linear-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
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
