<script setup lang="ts">
import { useAnimaux, type Garde } from "../../../features/animaux/composables/useAnimaux";

definePageMeta({
  middleware: ["authenticated"],
});

const route = useRoute();
const router = useRouter();
const { getGarde } = useAnimaux();

const garde = ref<Garde | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const id = route.params.id as string;
    garde.value = await getGarde(id);
  } catch (error) {
    console.error("Failed to fetch garde", error);
  } finally {
    loading.value = false;
  }
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getStatutColor(statut: string) {
  switch (statut) {
    case "confirmé":
      return "from-blue-400 to-indigo-500";
    case "en_cours":
      return "from-amber-400 to-orange-500";
    case "terminé":
      return "from-emerald-400 to-teal-500";
    case "annulé":
      return "from-red-400 to-rose-500";
    default:
      return "from-slate-400 to-slate-500";
  }
}

function getStatutLabel(statut: string) {
  switch (statut) {
    case "confirmé":
      return "Confirmé";
    case "en_cours":
      return "En cours";
    case "terminé":
      return "Terminé";
    case "annulé":
      return "Annulé";
    default:
      return statut;
  }
}

function goBack() {
  router.push("/animaux");
}

function navigateToEdit() {
  router.push(`/animaux/${route.params.id}/edit`);
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <!-- Not found state -->
      <div v-else-if="!garde" class="text-center py-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
        <h3 class="text-lg font-bold text-white mb-2">Garde introuvable</h3>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white font-medium transition-all hover:bg-white/15"
        >
          ← Retour à la liste
        </button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <button
            @click="goBack"
            class="px-3 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white text-sm transition-all hover:bg-white/15"
          >
            ← Retour
          </button>
          <button
            @click="navigateToEdit"
            class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-semibold shadow-md transition-all active:scale-95"
          >
            Éditer
          </button>
        </div>

        <!-- Badge partagé -->
        <div v-if="garde.isShared" class="flex justify-center">
          <span class="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-md">
            Garde partagée
          </span>
        </div>

        <!-- Nom et statut -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shrink-0">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white">{{ garde.nomAnimal }}</h1>
                <p class="text-sm text-slate-300">{{ garde.typeAnimal }}</p>
              </div>
            </div>
            <div :class="`px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatutColor(garde.statut)} text-white shadow-md`">
              {{ getStatutLabel(garde.statut) }}
            </div>
          </div>
        </div>

        <!-- Tarif -->
        <div class="backdrop-blur-xl bg-gradient-to-r from-rose-500/50 to-pink-500/50 border border-white/20 rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-white">Tarif de la garde</span>
            </div>
            <div class="text-3xl font-bold text-white">{{ formatCurrency(garde.tarif) }}</div>
          </div>
        </div>

        <!-- Informations principales -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informations
          </h2>

          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p class="text-xs text-slate-400">Client</p>
                <p class="text-sm font-medium text-white">{{ garde.nomClient }}</p>
              </div>
            </div>

            <div v-if="garde.contact" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p class="text-xs text-slate-400">Contact</p>
                <p class="text-sm font-medium text-white">{{ garde.contact }}</p>
              </div>
            </div>

            <div v-if="garde.source" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="text-xs text-slate-400">Source</p>
                <p class="text-sm font-medium text-white">{{ garde.source }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-xs text-slate-400">Type de garde</p>
                <p class="text-sm font-medium text-white">{{ garde.typeGarde }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Période
          </h2>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-xs text-slate-400">Du</p>
                <p class="text-sm font-medium text-white">{{ formatDate(garde.dateDebut) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-xs text-slate-400">Au</p>
                <p class="text-sm font-medium text-white">{{ formatDate(garde.dateFin) }}</p>
              </div>
            </div>

            <div v-if="garde.duree" class="mt-3 p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg">
              <p class="text-xs text-slate-400">Durée</p>
              <p class="text-sm font-semibold text-white">{{ garde.duree }}</p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="garde.notes" class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 class="text-lg font-bold text-white mb-3">Notes</h2>
          <p class="text-sm text-slate-300 whitespace-pre-wrap">{{ garde.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
