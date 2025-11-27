<script setup lang="ts">
import { useAuth } from "../features/auth/composables/useAuth";
import { useProfiles } from "../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const auth = useAuth();
const { selectedProfile, loadSelectedProfile } = useProfiles();

onMounted(() => {
  loadSelectedProfile();
  if (!selectedProfile.value) {
    navigateTo("/profiles");
  }
});

const features = [
  {
    name: "Budget",
    description: "Gérez vos finances personnelles",
    icon: "💰",
    path: "/budget",
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Gardes",
    description: "Suivez vos gardes d'animaux",
    icon: "🐾",
    path: "/gardes",
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Recettes",
    description: "Vos recettes de cuisine",
    icon: "🍳",
    path: "/recettes",
    color: "from-orange-500 to-red-600",
  },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Bienvenue, {{ selectedProfile?.name }} 👋
          </h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">Que voulez-vous faire aujourd'hui ?</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/profiles"
            class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Changer de profil
          </NuxtLink>
          <button
            @click="async () => { await auth.logout(); navigateTo('/login'); }"
            class="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-100"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="feature in features"
          :key="feature.name"
          :to="feature.path"
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:shadow-lg"
        >
          <div class="absolute inset-0 bg-gradient-to-br opacity-5 transition group-hover:opacity-10" :class="feature.color"></div>
          <div class="relative">
            <div class="mb-4 text-5xl">{{ feature.icon }}</div>
            <h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{{ feature.name }}</h2>
            <p class="text-slate-600 dark:text-slate-400">{{ feature.description }}</p>
          </div>
          <div class="absolute bottom-4 right-4 text-2xl text-slate-300 dark:text-slate-600 transition group-hover:translate-x-1">
            →
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
