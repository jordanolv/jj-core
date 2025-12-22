<script setup lang="ts">
import { useAuth } from "../features/auth/composables/useAuth";
import { useProfiles } from "../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Home",
});

const auth = useAuth();
const { selectedProfile, loadSelectedProfile } = useProfiles();
const { features } = useAppFeatures();

onMounted(() => {
  loadSelectedProfile();
  if (!selectedProfile.value) {
    navigateTo("/profiles");
  }
});
</script>

<template>
  <div class="p-4 sm:p-6">
    <div class="mx-auto max-w-6xl">
      <!-- Mobile-first header -->
      <header class="mb-6 sm:mb-8 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Bienvenue, {{ selectedProfile?.name }} 👋
            </h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">Que voulez-vous faire aujourd'hui ?</p>
          </div>
          <div class="flex gap-2 sm:gap-3">
            <NuxtLink
              to="/profiles"
              class="flex-1 sm:flex-none backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition active:scale-95 sm:hover:bg-white/80 dark:sm:hover:bg-white/10 text-center"
            >
              Changer de profil
            </NuxtLink>
            <button
              @click="async () => { await auth.logout(); navigateTo('/login'); }"
              class="flex-1 sm:flex-none backdrop-blur-xl bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition active:scale-95 sm:hover:shadow-lg sm:hover:shadow-purple-500/50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile-first grid -->
      <div class="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="feature in features"
          :key="feature.name"
          :to="feature.route"
          class="group relative overflow-hidden backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 active:scale-[0.98] sm:hover:shadow-2xl sm:hover:scale-[1.02] sm:hover:bg-white/60 dark:sm:hover:bg-white/10"
        >
          <div class="absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10" :class="feature.gradient"></div>
          <div class="relative">
            <div class="mb-3 sm:mb-4 text-4xl sm:text-5xl transform transition-transform duration-300 group-hover:scale-110">{{ feature.icon }}</div>
            <h2 class="mb-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{{ feature.name }}</h2>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">{{ feature.description }}</p>
          </div>
          <div class="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-xl sm:text-2xl text-slate-400 dark:text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-600 dark:group-hover:text-slate-300">
            →
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
