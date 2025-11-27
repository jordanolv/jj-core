<script setup lang="ts">
import { useBudget } from "../../../../features/budget/composables/useBudget";
import { useProfiles } from "../../../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const route = useRoute();
const year = parseInt(route.params.year as string);
const month = parseInt(route.params.month as string);

const { getMonthDetails, createExpense, createIncome, createCategory } = useBudget();
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

const totalIncomes = computed(() => {
  return data.value?.incomes.reduce((sum, i) => sum + i.amount, 0) || 0;
});

const totalExpenses = computed(() => {
  return data.value?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
});

const balance = computed(() => totalIncomes.value - totalExpenses.value);

const expenseCategories = computed(() => {
  return data.value?.categories.filter(c => c.type === "expense") || [];
});

const incomeCategories = computed(() => {
  return data.value?.categories.filter(c => c.type === "income") || [];
});

function getExpensesByCategory(categoryId: string) {
  return data.value?.expenses.filter(e => e.categoryId?.toString() === categoryId) || [];
}

function getIncomesByCategory(categoryId: string) {
  return data.value?.incomes.filter(i => i.categoryId?.toString() === categoryId) || [];
}

const showAddExpense = ref(false);
const showAddIncome = ref(false);
const showAddCategory = ref(false);

const newExpense = reactive({
  description: "",
  amount: 0,
  categoryId: "",
  date: new Date().toISOString().split('T')[0],
});

const newIncome = reactive({
  description: "",
  amount: 0,
  categoryId: "",
  date: new Date().toISOString().split('T')[0],
});

const newCategory = reactive({
  name: "",
  type: "expense" as "expense" | "income",
  color: "#3b82f6",
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
    newIncome.categoryId = "";
    await loadData();
  } catch (error) {
    console.error("Failed to create income", error);
  }
}

async function handleAddCategory() {
  try {
    await createCategory({
      ...newCategory,
      year,
      month
    });
    showAddCategory.value = false;
    newCategory.name = "";
    await loadData();
  } catch (error) {
    console.error("Failed to create category", error);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <NuxtLink to="/budget" class="mb-2 inline-block text-sm text-slate-600 hover:text-slate-900">
          ← Retour
        </NuxtLink>
        <h1 class="text-3xl font-bold text-slate-900">{{ monthNames[month - 1] }} {{ year }}</h1>
      </header>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
      </div>

      <div v-else>
        <div class="mb-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Revenus</p>
            <p class="mt-2 text-2xl font-bold text-green-600">{{ totalIncomes.toFixed(2) }} €</p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Dépenses</p>
            <p class="mt-2 text-2xl font-bold text-red-600">{{ totalExpenses.toFixed(2) }} €</p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <p class="text-sm font-medium text-slate-600">Solde</p>
            <p class="mt-2 text-2xl font-bold" :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ balance.toFixed(2) }} €
            </p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">💰 Revenus</h2>
              <button
                @click="showAddIncome = true"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                + Ajouter
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="category in incomeCategories" :key="category.id" class="rounded-xl bg-white p-4 shadow-sm">
                <h3 class="mb-2 font-semibold text-slate-900">{{ category.name }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="income in getIncomesByCategory(category.id)"
                    :key="income.id"
                    class="flex items-center justify-between text-sm"
                  >
                    <span class="text-slate-600">{{ income.description }}</span>
                    <span class="font-semibold text-green-600">+{{ income.amount.toFixed(2) }} €</span>
                  </div>
                </div>
              </div>

              <div v-if="incomeCategories.length === 0" class="rounded-xl bg-white p-8 text-center shadow-sm">
                <p class="text-slate-500">Aucune catégorie de revenus</p>
              </div>
            </div>
          </section>

          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">💸 Dépenses</h2>
              <button
                @click="showAddExpense = true"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                + Ajouter
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="category in expenseCategories" :key="category.id" class="rounded-xl bg-white p-4 shadow-sm">
                <h3 class="mb-2 font-semibold text-slate-900">{{ category.name }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="expense in getExpensesByCategory(category.id)"
                    :key="expense.id"
                    class="flex items-center justify-between text-sm"
                  >
                    <span class="text-slate-600">{{ expense.description }}</span>
                    <span class="font-semibold text-red-600">-{{ expense.amount.toFixed(2) }} €</span>
                  </div>
                </div>
              </div>

              <div v-if="expenseCategories.length === 0" class="rounded-xl bg-white p-8 text-center shadow-sm">
                <p class="text-slate-500">Aucune catégorie de dépenses</p>
              </div>
            </div>
          </section>
        </div>

        <div class="mt-6">
          <button
            @click="showAddCategory = true"
            class="w-full rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          >
            + Créer une catégorie
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddExpense" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" @click.self="showAddExpense = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-bold text-slate-900">Nouvelle dépense</h3>
        <form @submit.prevent="handleAddExpense" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-700">Description</label>
            <input v-model="newExpense.description" required class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Montant (€)</label>
            <input v-model.number="newExpense.amount" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Catégorie</label>
            <select v-model="newExpense.categoryId" class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="">Sans catégorie</option>
              <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
              Créer
            </button>
            <button type="button" @click="showAddExpense = false" class="flex-1 rounded-lg bg-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-300">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddIncome" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" @click.self="showAddIncome = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-bold text-slate-900">Nouveau revenu</h3>
        <form @submit.prevent="handleAddIncome" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-700">Description</label>
            <input v-model="newIncome.description" required class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Montant (€)</label>
            <input v-model.number="newIncome.amount" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Catégorie</label>
            <select v-model="newIncome.categoryId" class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="">Sans catégorie</option>
              <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700">
              Créer
            </button>
            <button type="button" @click="showAddIncome = false" class="flex-1 rounded-lg bg-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-300">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddCategory" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" @click.self="showAddCategory = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-bold text-slate-900">Nouvelle catégorie</h3>
        <form @submit.prevent="handleAddCategory" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-700">Nom</label>
            <input v-model="newCategory.name" required class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700">Type</label>
            <select v-model="newCategory.type" class="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="expense">Dépense</option>
              <option value="income">Revenu</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
              Créer
            </button>
            <button type="button" @click="showAddCategory = false" class="flex-1 rounded-lg bg-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-300">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
