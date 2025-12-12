<script setup lang="ts">
import { useAnimaux, type Garde } from "../../features/animaux/composables/useAnimaux";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const { getGardes, updateGarde, deleteGarde } = useAnimaux();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const gardes = ref<Garde[]>([]);
const loading = ref(true);
const showShared = ref(false);

async function loadData() {
  loading.value = true;
  try {
    gardes.value = await getGardes(showShared.value);
  } catch (error) {
    console.error("Failed to fetch gardes", error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  loadSelectedProfile();
  if (!selectedProfile.value) {
    navigateTo("/profiles");
    return;
  }
  await loadData();
});

watch(showShared, () => {
  loadData();
});

const totalRevenu = computed(() => {
  return gardes.value
    .filter((g) => g.statut === "terminé")
    .reduce((sum, g) => sum + g.tarif, 0);
});

const revenuAVenir = computed(() => {
  return gardes.value
    .filter((g) => g.statut === "confirmé" || g.statut === "en_cours")
    .reduce((sum, g) => sum + g.tarif, 0);
});

const gardesTerminees = computed(() => {
  return gardes.value.filter((g) => g.statut === "terminé").length;
});

const gardesAVenir = computed(() => {
  return gardes.value.filter((g) => g.statut === "confirmé" || g.statut === "en_cours").length;
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

async function handleStatusChange(gardeId: string, newStatus: string) {
  try {
    await updateGarde(gardeId, { statut: newStatus as any });
    await loadData();
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

async function handleDelete(gardeId: string, nomAnimal: string) {
  if (confirm(`Supprimer la garde de ${nomAnimal} ?`)) {
    try {
      await deleteGarde(gardeId);
      await loadData();
    } catch (error) {
      console.error("Error deleting garde:", error);
    }
  }
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

function navigateToNew() {
  navigateTo("/animaux/new");
}

function navigateToDetail(id: string) {
  navigateTo(`/animaux/${id}`);
}

function navigateToEdit(id: string) {
  navigateTo(`/animaux/${id}/edit`);
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">
      <!-- Header with actions -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Gardes d'animaux</h1>
          <p class="text-sm text-slate-300 mt-1">Gérez vos gardes d'animaux</p>
        </div>
        <button
          @click="navigateToNew"
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold shadow-md transition-all active:scale-95"
        >
          + Nouvelle
        </button>
      </div>

      <!-- Filter for shared gardes -->
      <div class="mb-6 flex justify-end">
        <label class="inline-flex items-center gap-2 cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2">
          <input
            v-model="showShared"
            type="checkbox"
            class="rounded border-white/20"
          />
          <span class="text-sm text-white">Afficher les gardes partagées</span>
        </label>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs text-slate-300 uppercase tracking-wide">Revenus</p>
              <p class="text-lg font-bold text-white">{{ formatCurrency(totalRevenu) }}</p>
              <p class="text-xs text-emerald-400">{{ gardesTerminees }} terminées</p>
            </div>
          </div>
        </div>

        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs text-slate-300 uppercase tracking-wide">À venir</p>
              <p class="text-lg font-bold text-white">{{ formatCurrency(revenuAVenir) }}</p>
              <p class="text-xs text-blue-400">{{ gardesAVenir }} gardes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <!-- Liste des gardes -->
      <div v-else-if="gardes.length === 0" class="text-center py-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Aucune garde</h3>
        <p class="text-sm text-slate-300 mb-4">Commencez par créer votre première garde</p>
        <button
          @click="navigateToNew"
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold shadow-md transition-all active:scale-95"
        >
          + Créer une garde
        </button>
      </div>

      <!-- Gardes list -->
      <div v-else class="space-y-2">
        <div
          v-for="garde in gardes"
          :key="garde.id"
          class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 transition-all hover:bg-white/15 active:bg-white/5"
        >
          <!-- Badge partagé -->
          <div v-if="garde.isShared" class="mb-2">
            <span class="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-purple-400 to-violet-400 text-white">
              Partagée
            </span>
          </div>

          <div class="flex items-start gap-3">
            <!-- Animal icon -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shrink-0">
              <svg v-if="garde.typeAnimal.toLowerCase().includes('chien')" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-white">{{ garde.nomAnimal }}</h3>
              <p class="text-sm text-slate-300">{{ garde.nomClient }}</p>
              <p class="text-xs text-slate-400 mt-1">
                {{ formatDate(garde.dateDebut) }} → {{ formatDate(garde.dateFin) }}
              </p>
            </div>

            <!-- Prix -->
            <div class="text-right shrink-0">
              <p class="text-lg font-bold text-white">{{ formatCurrency(garde.tarif) }}</p>
              <select
                :value="garde.statut"
                @change="(e) => handleStatusChange(garde.id, (e.target as HTMLSelectElement).value)"
                :class="`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-md border-0 bg-gradient-to-r ${getStatutColor(garde.statut)} text-white mt-1`"
              >
                <option value="confirmé">Confirmé</option>
                <option value="en_cours">En cours</option>
                <option value="terminé">Terminé</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-3 pt-3 border-t border-white/10">
            <button
              @click="navigateToDetail(garde.id)"
              class="flex-1 px-3 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/20 text-white text-sm font-medium transition-all hover:bg-white/10 active:bg-white/5"
            >
              Voir
            </button>
            <button
              @click="navigateToEdit(garde.id)"
              class="flex-1 px-3 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/20 text-white text-sm font-medium transition-all hover:bg-white/10 active:bg-white/5"
            >
              Éditer
            </button>
            <button
              @click="handleDelete(garde.id, garde.nomAnimal)"
              class="flex-1 px-3 py-2 rounded-lg backdrop-blur-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm font-medium transition-all hover:bg-red-500/30 active:bg-red-500/10"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
