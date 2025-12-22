<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Abonnements",
  pageDescription: "Dépenses récurrentes",
});

const { getSubscriptions, createSubscription, deleteSubscription, getMonthDetails } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const subscriptions = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newSubscription = reactive({
  name: "",
  amount: 0,
  categoryId: "",
  frequency: "monthly" as "monthly" | "yearly",
  startDate: new Date().toISOString().split('T')[0],
});

async function loadData() {
  loading.value = true;
  try {
    subscriptions.value = await getSubscriptions();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthData = await getMonthDetails(currentYear, currentMonth);
    categories.value = monthData.categories.filter((c: any) => c.type === "expense");
  } catch (error) {
    console.error("Failed to load subscriptions", error);
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

async function handleAddSubscription() {
  try {
    await createSubscription({
      ...newSubscription,
      startDate: new Date(newSubscription.startDate!).toISOString(),
    });
    showAddModal.value = false;
    newSubscription.name = "";
    newSubscription.amount = 0;
    newSubscription.categoryId = "";
    await loadData();
  } catch (error) {
    console.error("Failed to create subscription", error);
  }
}

async function handleDeleteSubscription(id: string) {
  if (!confirm("Voulez-vous vraiment supprimer cet abonnement ?")) return;
  try {
    await deleteSubscription(id);
    await loadData();
  } catch (error) {
    console.error("Failed to delete subscription", error);
  }
}

const totalMonthly = computed(() => {
  return subscriptions.value
    .filter((s: any) => s.frequency === "monthly")
    .reduce((sum: number, s: any) => sum + s.amount, 0);
});

const totalYearly = computed(() => {
  return subscriptions.value
    .filter((s: any) => s.frequency === "yearly")
    .reduce((sum: number, s: any) => sum + s.amount, 0);
});

const totalMonthlyEquivalent = computed(() => {
  return totalMonthly.value + (totalYearly.value / 12);
});
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">
      <div class="flex justify-end mb-6">
        <button
          @click="showAddModal = true"
          class="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-semibold transition-all active:scale-95"
        >
          +
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <div v-else>
        <div class="mb-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 p-4">
            <p class="text-xs font-medium text-slate-400">Mensuel</p>
            <p class="mt-1 text-xl font-bold text-blue-400">{{ totalMonthly.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">{{ subscriptions.filter(s => s.frequency === 'monthly').length }} abonnements</p>
          </div>
          <div class="rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 p-4">
            <p class="text-xs font-medium text-slate-400">Annuel</p>
            <p class="mt-1 text-xl font-bold text-purple-400">{{ totalYearly.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">{{ subscriptions.filter(s => s.frequency === 'yearly').length }} abonnements</p>
          </div>
          <div class="rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 p-4">
            <p class="text-xs font-medium text-slate-400">Par mois</p>
            <p class="mt-1 text-xl font-bold text-emerald-400">{{ totalMonthlyEquivalent.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">Équivalent</p>
          </div>
        </div>

        <div v-if="subscriptions.length === 0" class="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
          <div class="mb-4 text-5xl opacity-50">🔄</div>
          <h2 class="mb-2 text-lg font-bold text-white">Aucun abonnement</h2>
          <p class="mb-6 text-sm text-slate-400">Ajoutez vos dépenses récurrentes</p>
          <button
            @click="showAddModal = true"
            class="rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 px-6 py-2 font-semibold text-white transition-all active:scale-95"
          >
            Créer
          </button>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="sub in subscriptions"
            :key="sub.id"
            class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-white truncate">{{ sub.name }}</h3>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold shrink-0"
                  :class="sub.frequency === 'monthly' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'"
                >
                  {{ sub.frequency === 'monthly' ? 'M' : 'A' }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-slate-400 truncate">
                Depuis {{ new Date(sub.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-200">{{ sub.amount.toFixed(2) }} €</p>
                <p v-if="sub.frequency === 'yearly'" class="text-xs text-slate-500">
                  {{ (sub.amount / 12).toFixed(2) }} €/mois
                </p>
              </div>
              <button
                @click="handleDeleteSubscription(sub.id)"
                class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 transition active:bg-red-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border-t sm:border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-purple-300">Nouvel abonnement</h3>
        <form @submit.prevent="handleAddSubscription" class="space-y-3 sm:space-y-4">
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Nom</label>
            <input
              v-model="newSubscription.name"
              required
              placeholder="Netflix, Spotify..."
              class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Montant (€)</label>
            <input
              v-model.number="newSubscription.amount"
              type="number"
              step="0.01"
              inputmode="decimal"
              required
              placeholder="0.00"
              class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Fréquence</label>
            <select v-model="newSubscription.frequency" class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-purple-400 focus:outline-none">
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Date de début</label>
            <input
              v-model="newSubscription.startDate"
              type="date"
              required
              class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div class="flex gap-2 sm:gap-3 pt-2">
            <button type="submit" class="flex-1 rounded-lg bg-linear-to-r from-purple-600 to-violet-600 py-2 text-sm sm:text-base font-semibold text-white transition-all active:scale-95">
              Créer
            </button>
            <button type="button" @click="showAddModal = false" class="flex-1 rounded-lg bg-white/10 border border-white/20 py-2 text-sm sm:text-base font-semibold text-slate-300 transition-all active:scale-95">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
