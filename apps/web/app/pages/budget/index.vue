<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const { getYears, getMonths, getMonthDetails } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = ref<number[]>([]);
const months = ref<number[]>([]);
const monthBalances = ref<Record<number, number>>({});
const monthExpenses = ref<Record<number, any[]>>({});
const loading = ref(true);

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

async function loadData() {
  loading.value = true;
  try {
    availableYears.value = await getYears();
    if (!availableYears.value.includes(selectedYear.value)) {
      availableYears.value.push(selectedYear.value);
      availableYears.value.sort((a, b) => b - a);
    }
    months.value = await getMonths(selectedYear.value);

    // Charger le solde et les dépenses pour chaque mois
    monthBalances.value = {};
    monthExpenses.value = {};
    for (const month of months.value) {
      try {
        const details = await getMonthDetails(selectedYear.value, month);
        const totalIncomes = details.incomes.reduce((sum: number, income: any) => sum + income.amount, 0);
        const totalExpenses = details.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
        monthBalances.value[month] = totalIncomes - totalExpenses;
        monthExpenses.value[month] = details.expenses;
      } catch (error) {
        console.error(`Failed to fetch balance for month ${month}`, error);
        monthBalances.value[month] = 0;
        monthExpenses.value[month] = [];
      }
    }
  } catch (error) {
    console.error("Failed to fetch data", error);
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

watch(selectedYear, () => {
  loadData();
});

function changeYear(offset: number) {
  selectedYear.value += offset;
}

function createNewMonth(month: number) {
  navigateTo(`/budget/${selectedYear.value}/${month}`);
}

function formatBalance(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function generateSparkline(month: number): string {
  const expenses = monthExpenses.value[month] || [];
  if (expenses.length === 0) return '';

  // Grouper les dépenses par jour
  const expensesByDay: Record<number, number> = {};
  expenses.forEach((expense: any) => {
    const day = new Date(expense.date).getDate();
    expensesByDay[day] = (expensesByDay[day] || 0) + expense.amount;
  });

  // Créer un tableau de 30 jours avec les dépenses cumulées
  const daysInMonth = new Date(selectedYear.value, month, 0).getDate();
  const dailyExpenses: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    dailyExpenses.push(expensesByDay[i] || 0);
  }

  // Trouver le max pour normaliser
  const maxExpense = Math.max(...dailyExpenses, 1);

  // Générer le path SVG (sparkline)
  const width = 60;
  const height = 24;
  const points = dailyExpenses.map((expense, index) => {
    const x = (index / (daysInMonth - 1)) * width;
    const y = height - (expense / maxExpense) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}
</script>

<template>
  <div class="p-4 sm:p-6">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <header class="mb-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl sm:text-4xl font-bold text-purple-300">Budget</h1>
          <NuxtLink
            to="/budget/subscriptions"
            class="rounded-full backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95"
          >
            🔄 Abonnements
          </NuxtLink>
        </div>

        <div class="flex items-center justify-center gap-3">
          <button
            @click="changeYear(-1)"
            class="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-semibold transition-all active:scale-95"
          >
            ←
          </button>
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-2 font-bold text-white">
            {{ selectedYear }}
          </div>
          <button
            @click="changeYear(1)"
            class="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-semibold transition-all active:scale-95"
          >
            →
          </button>
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <!-- Liste style crypto -->
      <div v-else class="space-y-2">
        <template v-for="month in 12" :key="month">
          <NuxtLink
            v-if="months.includes(month)"
            :to="`/budget/${selectedYear}/${month}`"
            class="group flex items-center gap-4 p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all active:scale-[0.98] sm:hover:bg-white/10"
          >
            <!-- Icône emoji ronde -->
            <div class="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shrink-0">
              📅
            </div>

            <!-- Nom du mois + symbole -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base sm:text-lg font-bold text-white">{{ monthNames[month - 1] }}</h3>
              <p class="text-xs text-white/60">{{ selectedYear }}</p>
            </div>

            <!-- Mini sparkline -->
            <svg
              v-if="generateSparkline(month)"
              class="w-[80px] sm:w-[100px] h-8 shrink-0 hidden sm:block"
              viewBox="0 0 80 32"
              :class="(monthBalances[month] ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="generateSparkline(month)" />
            </svg>

            <!-- Solde + % -->
            <div class="text-right shrink-0">
              <p class="text-base sm:text-lg font-bold text-white">{{ formatBalance(monthBalances[month] ?? 0) }}</p>
              <p
                class="text-xs font-semibold"
                :class="(monthBalances[month] ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'"
              >
                {{ (monthBalances[month] ?? 0) >= 0 ? '+' : '' }}{{ ((monthBalances[month] ?? 0) / 1000).toFixed(1) }}k
              </p>
            </div>
          </NuxtLink>

          <button
            v-else
            @click="createNewMonth(month)"
            class="w-full flex items-center gap-4 p-4 backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-2xl transition-all active:scale-[0.98] sm:hover:bg-white/10"
          >
            <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
              ➕
            </div>
            <div class="flex-1 text-left">
              <h3 class="text-base sm:text-lg font-bold text-white/60">{{ monthNames[month - 1] }}</h3>
              <p class="text-xs text-white/40">Créer le mois</p>
            </div>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
