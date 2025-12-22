<script setup lang="ts">
const { features } = useAppFeatures();
const { defaultNavItems, getIcon } = useNavigation();
const route = useRoute();

const showFeatureSwitcher = ref(false);
const navItems = ref(defaultNavItems);

function toggleSwitcher() {
  showFeatureSwitcher.value = !showFeatureSwitcher.value;
}

function navigateToFeature(route: string) {
  showFeatureSwitcher.value = false;
  navigateTo(route);
}

function handleNavClick(item: any) {
  if (item.type === 'action' && item.id === 'features') {
    toggleSwitcher();
  }
}

function loadNavigationItems() {
  const saved = localStorage.getItem('navigation-items');
  if (saved) {
    try {
      navItems.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse navigation items', e);
    }
  }
}

// Force dark mode
onMounted(() => {
  document.documentElement.classList.add('dark');

  loadNavigationItems();

  // Listen for storage changes from other tabs/windows
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'navigation-items') {
      loadNavigationItems();
    }
  };

  // Listen for custom event from same tab
  const handleNavigationUpdate = () => {
    loadNavigationItems();
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      showFeatureSwitcher.value = false;
    }
  };

  window.addEventListener('keydown', handleEscape);
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('navigation-updated', handleNavigationUpdate);

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('navigation-updated', handleNavigationUpdate);
  });
});
</script>

<template>
  <div class="min-h-screen text-white relative bg-black overflow-hidden">
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Contenu -->
    <div class="relative z-10">
      <main class="w-full pb-24">
        <PageHeader
          v-if="route.meta.pageTitle"
          :title="route.meta.pageTitle as string"
          :description="route.meta.pageDescription as string || ''"
          @toggle-features="toggleSwitcher"
        />
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 sm:pb-4">
      <div class="mx-auto max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
        <div class="flex items-center justify-around px-1 py-2">
          <template v-for="item in navItems" :key="item.id">
            <!-- Link items -->
            <NuxtLink
              v-if="item.type === 'link'"
              :to="item.route"
              class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              :class="$route.path === item.route || $route.path.startsWith(item.route + '/') ? 'text-white' : 'text-slate-400'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
              </svg>
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </NuxtLink>

            <!-- Action items -->
            <button
              v-else
              @click="handleNavClick(item)"
              class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              :class="(item.id === 'features' && showFeatureSwitcher) ? 'text-white' : 'text-slate-400'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
              </svg>
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Feature Switcher Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showFeatureSwitcher"
        class="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        @click="showFeatureSwitcher = false"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 sm:scale-100 opacity-100"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
        >
          <div
            v-if="showFeatureSwitcher"
            @click.stop
            class="w-full max-w-md mx-4 mb-4 sm:mb-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <!-- Header -->
            <div class="px-4 py-4 sm:px-6 flex items-center justify-between border-b border-white/10">
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-white">Fonctionnalités</h2>
                <p class="text-xs text-slate-400 mt-0.5">Appuyez sur Échap pour fermer</p>
              </div>
              <button
                @click="showFeatureSwitcher = false"
                class="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Features List -->
            <div class="p-4 sm:p-6 space-y-1 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              <button
                v-for="feature in features"
                :key="feature.route"
                @click="navigateToFeature(feature.route)"
                class="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
              >
                <!-- Icon avec gradient -->
                <div
                  class="w-12 h-12 rounded-full bg-linear-to-br flex items-center justify-center text-xl shrink-0 shadow-lg"
                  :class="feature.gradient"
                >
                  {{ feature.icon }}
                </div>

                <!-- Info -->
                <div class="flex-1 text-left min-w-0">
                  <h3 class="text-base font-semibold text-white">{{ feature.name }}</h3>
                  <p class="text-xs text-slate-400">{{ feature.description }}</p>
                </div>

                <!-- Arrow -->
                <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

