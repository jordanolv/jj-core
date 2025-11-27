<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const { getSubscriptions, createSubscription, deleteSubscription, getMonthDetails, generateSubscriptionExpenses } = useBudget();
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
      startDate: new Date(newSubscription.startDate).toISOString(),
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

async function handleGenerateExpenses() {
  try {
    const result = await generateSubscriptionExpenses();
    alert(`${result.generated} dépenses générées pour ce mois`);
  } catch (error) {
    console.error("Failed to generate expenses", error);
    alert("Erreur lors de la génération des dépenses");
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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <NuxtLink to="/budget" class="mb-2 inline-block text-sm text-slate-600 hover:text-slate-900">
          ← Retour au budget
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">🔄 Abonnements</h1>
            <p class="mt-1 text-slate-600">Gérez vos dépenses récurrentes</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="handleGenerateExpenses"
              class="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              ⚡ Générer ce mois
            </button>
            <button
              @click="showAddModal = true"
              class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Nouvel abonnement
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
      </div>

      <div v-else>
        <div class="mb-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Total mensuel</p>
            <p class="mt-2 text-2xl font-bold text-blue-600">{{ totalMonthly.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">{{ subscriptions.filter(s => s.frequency === 'monthly').length }} abonnements</p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Total annuel</p>
            <p class="mt-2 text-2xl font-bold text-purple-600">{{ totalYearly.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">{{ subscriptions.filter(s => s.frequency === 'yearly').length }} abonnements</p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Équivalent mensuel</p>
            <p class="mt-2 text-2xl font-bold text-green-600">{{ totalMonthlyEquivalent.toFixed(2) }} €</p>
            <p class="mt-1 text-xs text-slate-500">Total par mois</p>
          </div>
        </div>

        <div v-if="subscriptions.length === 0" class="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div class="mb-4 text-6xl">🔄</div>
          <h2 class="mb-2 text-xl font-bold text-slate-900">Aucun abonnement</h2>
          <p class="mb-6 text-slate-600">Ajoutez vos abonnements récurrents</p>
          <button
            @click="showAddModal = true"
            class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Créer un abonnement
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="sub in subscriptions"
            :key="sub.id"
            class="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-bold text-slate-900">{{ sub.name }}</h3>
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="sub.frequency === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
                >
                  {{ sub.frequency === 'monthly' ? 'Mensuel' : 'Annuel' }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-600">
                <span v-if="sub.category">{{ sub.category.name }}</span>
                <span v-else class="text-slate-400">Sans catégorie</span>
                <span class="mx-2">•</span>
                Depuis le {{ new Date(sub.startDate).toLocaleDateString('fr-FR') }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-2xl font-bold text-slate-900">{{ sub.amount.toFixed(2) }} €</p>
                <p v-if="sub.frequency === 'yearly'" class="text-sm text-slate-500">
                  {{ (sub.amount / 12).toFixed(2) }} €/mois
                </p>
              </div>
              <button
                @click="handleDeleteSubscription(sub.id)"
                class="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" @click.self="showAddModal = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-bold text-slate-900">Nouvel abonnement</h3>
        <form @submit.prevent="handleAddSubscription" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-700">Nom</label>
            <input
              v-model="newSubscription.name"
              required
              placeholder="Netflix, Spotify..."
              class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Montant (€)</label>
            <input
              v-model.number="newSubscription.amount"
              type="number"
              step="0.01"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Fréquence</label>
            <select v-model="newSubscription.frequency" class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Catégorie</label>
            <select v-model="newSubscription.categoryId" class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="">Sans catégorie</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Date de début</label>
            <input
              v-model="newSubscription.startDate"
              type="date"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
              Créer
            </button>
            <button type="button" @click="showAddModal = false" class="flex-1 rounded-lg bg-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-300">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
