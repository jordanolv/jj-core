<script setup lang="ts">
// ThemeToggle is auto-imported from app/components/
// No import needed - Nuxt auto-imports components

const showFeatureSwitcher = ref(false);

const features = [
  {
    name: 'Budget',
    description: 'Gérer vos finances',
    icon: '💰',
    route: '/budget',
    gradient: 'from-emerald-500 to-green-600'
  },
  {
    name: 'Animaux',
    description: 'Suivi des animaux',
    icon: '🐾',
    route: '/animaux',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    name: 'Cuisine',
    description: 'Recettes et repas',
    icon: '🍳',
    route: '/cuisine',
    gradient: 'from-rose-500 to-pink-600'
  }
];

function toggleSwitcher() {
  showFeatureSwitcher.value = !showFeatureSwitcher.value;
}

function navigateToFeature(route: string) {
  showFeatureSwitcher.value = false;
  navigateTo(route);
}

// Force dark mode
onMounted(() => {
  document.documentElement.classList.add('dark');

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      showFeatureSwitcher.value = false;
    }
  };
  window.addEventListener('keydown', handleEscape);
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
  });
});
</script>

<template>
  <div class="min-h-screen text-white relative bg-black overflow-hidden">
    <!-- Effets de glow en arrière-plan (derrière tout) -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Contenu -->
    <div class="relative z-10">
      <!-- Header global -->
      <header class="sticky top-0 z-50 px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <button
            @click="toggleSwitcher"
            class="w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all duration-300"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <NuxtLink
            to="/settings"
            class="w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all duration-300"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NuxtLink>
        </div>
      </header>

      <main class="w-full">
        <slot />
      </main>
    </div>

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

