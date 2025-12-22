<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Budget",
  pageDescription: "Gérer vos finances",
});

const { getYears, getMonths, getMonthDetails } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const selectedYear = ref(currentYear);
const availableYears = ref<number[]>([]);
const months = ref<number[]>([]);
const monthBalances = ref<Record<number, number>>({});
const monthExpenses = ref<Record<number, any[]>>({});
const loading = ref(true);

const sortedMonths = computed(() => {
  if (selectedYear.value === currentYear) {
    const monthsArray = [];
    for (let i = currentMonth; i <= 12; i++) {
      monthsArray.push(i);
    }
    for (let i = 1; i < currentMonth; i++) {
      monthsArray.push(i);
    }
    return monthsArray;
  }
  return Array.from({ length: 12 }, (_, i) => i + 1);
});

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

function getPercentageChange(month: number): string {
  const currentBalance = monthBalances.value[month] ?? 0;
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousBalance = monthBalances.value[previousMonth] ?? 0;

  if (previousBalance === 0) {
    return currentBalance >= 0 ? '+100%' : '-100%';
  }

  const change = ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
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
  const width = 70;
  const height = 28;
  const points = dailyExpenses.map((expense, index) => {
    const x = (index / Math.max(daysInMonth - 1, 1)) * width;
    const y = height - (expense / maxExpense) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}

// Gradients uniques par mois
const monthGradients = [
  { tailwind: 'from-blue-400 to-blue-600', colors: ['#60a5fa', '#2563eb'] },      // Janvier - Bleu glacé
  { tailwind: 'from-pink-400 to-rose-600', colors: ['#f9a8d4', '#e11d48'] },      // Février - Rose/Rouge
  { tailwind: 'from-green-400 to-emerald-600', colors: ['#4ade80', '#059669'] },  // Mars - Vert printemps
  { tailwind: 'from-yellow-400 to-amber-600', colors: ['#facc15', '#d97706'] },   // Avril - Jaune/Ambre
  { tailwind: 'from-purple-400 to-purple-600', colors: ['#c084fc', '#9333ea'] },  // Mai - Violet
  { tailwind: 'from-orange-400 to-orange-600', colors: ['#fb923c', '#ea580c'] },  // Juin - Orange été
  { tailwind: 'from-red-400 to-red-600', colors: ['#f87171', '#dc2626'] },        // Juillet - Rouge chaud
  { tailwind: 'from-cyan-400 to-cyan-600', colors: ['#22d3ee', '#0891b2'] },      // Août - Cyan océan
  { tailwind: 'from-amber-400 to-yellow-600', colors: ['#fbbf24', '#ca8a04'] },   // Septembre - Ambre automne
  { tailwind: 'from-rose-400 to-pink-600', colors: ['#fb7185', '#db2777'] },      // Octobre - Rose automnal
  { tailwind: 'from-slate-400 to-slate-600', colors: ['#94a3b8', '#475569'] },    // Novembre - Gris nuageux
  { tailwind: 'from-indigo-400 to-blue-600', colors: ['#818cf8', '#2563eb'] },    // Décembre - Indigo hivernal
];

function getMonthGradient(month: number): string {
  return monthGradients[month - 1]?.tailwind || 'from-slate-400 to-slate-600';
}

function getMonthColors(month: number): string[] {
  return monthGradients[month - 1]?.colors || ['#94a3b8', '#475569'];
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
      <div class="mx-auto max-w-2xl">
        <!-- Sélecteur d'année + Abonnements -->
        <div class="flex items-center justify-center gap-3 mb-6 relative">
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

          <NuxtLink
            to="/budget/subscriptions"
            class="absolute right-0 w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all active:scale-95"
            title="Abonnements"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
        </div>

        <!-- Liste style crypto -->
        <div v-else class="space-y-1">
        <template v-for="month in sortedMonths" :key="month">
          <div
            v-if="selectedYear === currentYear && month === 1"
            class="py-2"
          >
            <div class="h-px bg-linear-to-r from-transparent via-slate-700 to-transparent"></div>
          </div>

          <NuxtLink
            v-if="months.includes(month)"
            :to="`/budget/${selectedYear}/${month}`"
            class="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
          >
            <!-- Numéro du mois avec gradient unique -->
            <div class="min-w-0 flex gap-3">
              <div
                class="w-10 h-10 rounded-full bg-linear-to-br flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg"
                :class="month === currentMonth && selectedYear === currentYear ? getMonthGradient(month) : 'from-slate-400 to-slate-600'"
              >
                {{ month.toString().padStart(2, '0') }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-white">{{ monthNames[month - 1] }}</h3>
                <p class="text-xs text-slate-400">{{ selectedYear }}</p>
              </div>
            </div>

            <!-- Mini sparkline avec la couleur du mois -->
            <svg
              v-if="monthExpenses[month]?.length > 0"
              class="w-[70px] h-7 shrink-0 opacity-80 -mr-2"
              viewBox="0 0 70 28"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <defs>
                <linearGradient :id="`gradient-${month}`" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    :stop-color="month === currentMonth && selectedYear === currentYear ? getMonthColors(month)[0] : '#94a3b8'"
                  />
                  <stop
                    offset="100%"
                    :stop-color="month === currentMonth && selectedYear === currentYear ? getMonthColors(month)[1] : '#475569'"
                  />
                </linearGradient>
              </defs>
              <path :d="generateSparkline(month)" :stroke="`url(#gradient-${month})`" />
            </svg>

            <!-- Solde + % -->
            <div class="text-right shrink-0">
              <p class="text-sm font-medium text-slate-200">{{ formatBalance(monthBalances[month] ?? 0) }}</p>
              <p
                class="text-xs font-medium"
                :class="getPercentageChange(month).startsWith('+') ? 'text-emerald-500' : 'text-rose-500'"
              >
                {{ getPercentageChange(month) }}
              </p>
            </div>
          </NuxtLink>

          <button
            v-else
            @click="createNewMonth(month)"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5 opacity-40"
          >
            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">
              ➕
            </div>
            <div class="flex-1 text-left">
              <h3 class="text-base font-semibold text-slate-400">{{ monthNames[month - 1] }}</h3>
              <p class="text-xs text-slate-500">Créer</p>
            </div>
          </button>
        </template>
        </div>
      </div>
  </div>
</template>
