<script setup lang="ts">
import { useBudget } from "../../../../features/budget/composables/useBudget";
import { useProfiles } from "../../../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const route = useRoute();
const year = parseInt(route.params.year as string);
const month = parseInt(route.params.month as string);

const { getMonthDetails, createExpense, createIncome } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const data = ref<{
  expenses: any[];
  incomes: any[];
  categories: any[];
} | null>(null);
const loading = ref(true);

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

async function loadData() {
  loading.value = true;
  try {
    data.value = await getMonthDetails(year, month);
  } catch (error) {
    console.error("Failed to fetch month details", error);
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

const totalExpenses = computed(() => {
  return data.value?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
});

const totalIncomes = computed(() => {
  return data.value?.incomes.reduce((sum, i) => sum + i.amount, 0) || 0;
});

const balance = computed(() => totalIncomes.value - totalExpenses.value);

const expenseCategories = computed(() => {
  return data.value?.categories.filter(c => c.type === "expense") || [];
});

function getExpensesByCategory(categoryId: string) {
  return data.value?.expenses.filter(e => e.categoryId?.toString() === categoryId) || [];
}

const showAddExpense = ref(false);
const showAddIncome = ref(false);

const expandedCategories = ref<Set<string>>(new Set());
const expensesExpanded = ref(false);
const incomesExpanded = ref(false);

function toggleCategory(categoryId: string) {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
}

function isCategoryExpanded(categoryId: string) {
  return expandedCategories.value.has(categoryId);
}

const newExpense = reactive({
  description: "",
  amount: 0,
  categoryId: "",
  date: new Date().toISOString().split('T')[0],
});

const newIncome = reactive({
  description: "",
  amount: 0,
  date: new Date().toISOString().split('T')[0],
});

async function handleAddExpense() {
  try {
    const day = newExpense.date?.split('-')[2] || '01';
    await createExpense({
      ...newExpense,
      date: new Date(`${year}-${month.toString().padStart(2, '0')}-${day}`).toISOString(),
    });
    showAddExpense.value = false;
    newExpense.description = "";
    newExpense.amount = 0;
    newExpense.categoryId = "";
    await loadData();
  } catch (error) {
    console.error("Failed to create expense", error);
  }
}

async function handleAddIncome() {
  try {
    const day = newIncome.date?.split('-')[2] || '01';
    await createIncome({
      ...newIncome,
      date: new Date(`${year}-${month.toString().padStart(2, '0')}-${day}`).toISOString(),
    });
    showAddIncome.value = false;
    newIncome.description = "";
    newIncome.amount = 0;
    await loadData();
  } catch (error) {
    console.error("Failed to create income", error);
  }
}

</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-6xl">
      <header class="mb-6">
        <NuxtLink to="/budget" class="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </NuxtLink>
        <h1 class="text-2xl sm:text-3xl font-bold text-purple-300">{{ monthNames[month - 1] }} {{ year }}</h1>
      </header>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <div v-else>
        <div class="mb-6 grid gap-3 sm:gap-4 sm:grid-cols-3">
          <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <p class="text-xs sm:text-sm font-medium text-slate-400">Revenus</p>
            <p class="mt-2 text-xl sm:text-2xl font-bold text-emerald-400">{{ totalIncomes.toFixed(2) }} €</p>
          </div>
          <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <p class="text-xs sm:text-sm font-medium text-slate-400">Dépenses</p>
            <p class="mt-2 text-xl sm:text-2xl font-bold text-rose-400">{{ totalExpenses.toFixed(2) }} €</p>
          </div>
          <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <p class="text-xs sm:text-sm font-medium text-slate-400">Solde</p>
            <p class="mt-2 text-xl sm:text-2xl font-bold" :class="balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ balance.toFixed(2) }} €
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <section class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              @click="incomesExpanded = !incomesExpanded"
              class="w-full flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-white/5"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 transition-transform text-emerald-400"
                  :class="{ 'rotate-90': incomesExpanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <h2 class="text-lg sm:text-xl font-bold text-white">💰 Revenus</h2>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm sm:text-base font-semibold text-emerald-400">
                  +{{ totalIncomes.toFixed(2) }} €
                </span>
                <button
                  @click.stop="showAddIncome = true"
                  class="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95"
                >
                  + Ajouter
                </button>
              </div>
            </button>

            <div v-if="incomesExpanded" class="px-4 sm:px-5 pb-4 space-y-2 border-t border-white/10 pt-3">
              <div
                v-for="income in data?.incomes"
                :key="income.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-slate-400">{{ income.description }}</span>
                <span class="font-semibold text-emerald-400">+{{ income.amount.toFixed(2) }} €</span>
              </div>
              <div v-if="!data?.incomes || data.incomes.length === 0" class="text-center py-4">
                <p class="text-sm text-slate-500">Aucun revenu</p>
              </div>
            </div>
          </section>

          <section class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              @click="expensesExpanded = !expensesExpanded"
              class="w-full flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-white/5"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 transition-transform text-rose-400"
                  :class="{ 'rotate-90': expensesExpanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <h2 class="text-lg sm:text-xl font-bold text-white">💸 Dépenses</h2>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm sm:text-base font-semibold text-rose-400">
                  -{{ totalExpenses.toFixed(2) }} €
                </span>
                <button
                  @click.stop="showAddExpense = true"
                  class="rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95"
                >
                  + Ajouter
                </button>
              </div>
            </button>

            <div v-if="expensesExpanded" class="px-4 sm:px-5 pb-4 space-y-2 border-t border-white/10 pt-3">
              <div class="space-y-2 sm:space-y-3">
                <div v-for="category in expenseCategories" :key="category.id" class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    @click="toggleCategory(category.id)"
                    class="w-full flex items-center justify-between p-3 sm:p-4 transition-colors hover:bg-white/5"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 transition-transform text-slate-400"
                        :class="{ 'rotate-90': isCategoryExpanded(category.id) }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <h3 class="text-sm sm:text-base font-semibold text-white">{{ category.name }}</h3>
                    </div>
                    <span class="text-xs sm:text-sm font-semibold text-rose-400">
                      -{{ getExpensesByCategory(category.id).reduce((sum, e) => sum + e.amount, 0).toFixed(2) }} €
                    </span>
                  </button>

                  <div v-if="isCategoryExpanded(category.id)" class="px-3 sm:px-4 pb-3 space-y-1.5 sm:space-y-2 border-t border-white/10 pt-2">
                    <div
                      v-for="expense in getExpensesByCategory(category.id)"
                      :key="expense.id"
                      class="flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span class="text-slate-400">{{ expense.description }}</span>
                      <span class="font-semibold text-rose-400">-{{ expense.amount.toFixed(2) }} €</span>
                    </div>
                  </div>
                </div>

                <div v-if="expenseCategories.length === 0" class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 text-center">
                  <p class="text-sm text-slate-500">Aucune catégorie de dépenses</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div v-if="showAddExpense" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6" @click.self="showAddExpense = false">
      <div class="w-full max-w-md rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10 p-4 sm:p-6 shadow-2xl">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-rose-300">Nouvelle dépense</h3>
        <form @submit.prevent="handleAddExpense" class="space-y-3 sm:space-y-4">
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Description</label>
            <input v-model="newExpense.description" required class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none" />
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Montant (€)</label>
            <input v-model.number="newExpense.amount" type="number" step="0.01" required class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none" />
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Catégorie <span class="text-rose-400">*</span></label>
            <select v-model="newExpense.categoryId" required class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-rose-400 focus:outline-none">
              <option value="" disabled class="bg-slate-800">Sélectionner une catégorie</option>
              <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id" class="bg-slate-800">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex gap-2 sm:gap-3 pt-2">
            <button type="submit" :disabled="!newExpense.categoryId" class="flex-1 rounded-lg bg-linear-to-r from-rose-600 to-red-600 py-2 text-sm sm:text-base font-semibold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
              Créer
            </button>
            <button type="button" @click="showAddExpense = false" class="flex-1 rounded-lg bg-white/10 border border-white/20 py-2 text-sm sm:text-base font-semibold text-slate-300 transition-all active:scale-95">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddIncome" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6" @click.self="showAddIncome = false">
      <div class="w-full max-w-md rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10 p-4 sm:p-6 shadow-2xl">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-emerald-300">Nouveau revenu</h3>
        <form @submit.prevent="handleAddIncome" class="space-y-3 sm:space-y-4">
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Description</label>
            <input v-model="newIncome.description" required class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none" />
          </div>
          <div>
            <label class="text-xs sm:text-sm font-medium text-slate-300">Montant (€)</label>
            <input v-model.number="newIncome.amount" type="number" step="0.01" required class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none" />
          </div>
          <div class="flex gap-2 sm:gap-3 pt-2">
            <button type="submit" class="flex-1 rounded-lg bg-linear-to-r from-emerald-600 to-green-600 py-2 text-sm sm:text-base font-semibold text-white transition-all active:scale-95">
              Créer
            </button>
            <button type="button" @click="showAddIncome = false" class="flex-1 rounded-lg bg-white/10 border border-white/20 py-2 text-sm sm:text-base font-semibold text-slate-300 transition-all active:scale-95">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
