<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const { getYears, getMonths } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = ref<number[]>([]);
const months = ref<number[]>([]);
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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="mx-auto max-w-5xl">
      <header class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <NuxtLink to="/" class="text-sm text-slate-600 hover:text-slate-900">
            ← Retour
          </NuxtLink>
          <NuxtLink
            to="/budget/subscriptions"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            🔄 Abonnements
          </NuxtLink>
        </div>

        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-slate-900">💰 Budget</h1>

          <div class="flex items-center gap-3">
            <button
              @click="changeYear(-1)"
              class="rounded-lg bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ←
            </button>
            <div class="rounded-lg bg-white px-6 py-2 font-bold text-slate-900 shadow-sm">
              {{ selectedYear }}
            </div>
            <button
              @click="changeYear(1)"
              class="rounded-lg bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              →
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <template v-for="month in 12" :key="month">
          <NuxtLink
            v-if="months.includes(month)"
            :to="`/budget/${selectedYear}/${month}`"
            class="group rounded-xl bg-white p-5 shadow-sm transition hover:shadow-lg"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-900">{{ monthNames[month - 1] }}</h2>
                <p class="text-sm text-slate-600">Voir le détail</p>
              </div>
              <div class="text-xl text-slate-300 transition group-hover:translate-x-1">→</div>
            </div>
          </NuxtLink>

          <button
            v-else
            @click="createNewMonth(month)"
            class="rounded-xl border-2 border-dashed border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-400">{{ monthNames[month - 1] }}</h2>
                <p class="text-sm text-slate-500">Créer</p>
              </div>
              <div class="text-xl text-slate-300">+</div>
            </div>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
