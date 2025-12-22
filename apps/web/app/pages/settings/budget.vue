<script setup lang="ts">
import { useBudget } from "../../features/budget/composables/useBudget";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Budget",
  pageDescription: "Personnalisez vos catégories",
});

const { getGlobalCategories, createGlobalCategory } = useBudget();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const activeTab = ref("budget");
const categories = ref<any[]>([]);
const loading = ref(true);
const showAddCategory = ref(false);
const newCategory = reactive({
  name: "",
  color: "#9333ea",
  icon: "💰",
});

onMounted(async () => {
  loadSelectedProfile();
  if (!selectedProfile.value) {
    navigateTo("/profiles");
    return;
  }
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    categories.value = await getGlobalCategories();
  } catch (error) {
    console.error("Failed to load categories", error);
  } finally {
    loading.value = false;
  }
}

async function handleCreateCategory() {
  if (!newCategory.name.trim()) return;

  try {
    await createGlobalCategory({
      name: newCategory.name,
      type: "expense",
      color: newCategory.color,
      icon: newCategory.icon,
    });

    showAddCategory.value = false;
    newCategory.name = "";
    newCategory.color = "#9333ea";
    newCategory.icon = "💰";

    await loadCategories();
  } catch (error) {
    console.error("Failed to create category", error);
  }
}

const availableIcons = ["💰", "🏠", "🍔", "🚗", "⚡", "🎮", "📱", "💊", "🎓", "✈️", "🛒", "🎬", "💻", "👕", "🏋️"];
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-4xl">

      <!-- Tabs -->
      <div class="mb-6 flex gap-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-1">
        <button
          @click="activeTab = 'budget'"
          :class="[
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
            activeTab === 'budget'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          ]"
        >
          💰 Budget
        </button>
        <button
          @click="activeTab = 'animaux'"
          :class="[
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
            activeTab === 'animaux'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          ]"
        >
          🐾 Animaux
        </button>
      </div>

      <!-- Budget Tab -->
      <div v-if="activeTab === 'budget'">
        <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-white">Catégories de dépenses</h2>
              <p class="text-sm text-slate-400 mt-1">Gérer vos catégories par défaut</p>
            </div>
            <button
              @click="showAddCategory = true"
              class="rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95"
            >
              + Ajouter
            </button>
          </div>

          <div v-if="loading" class="flex justify-center py-12">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
          </div>

          <div v-else-if="categories.length === 0" class="text-center py-12">
            <p class="text-slate-500">Aucune catégorie</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10"
            >
              <div class="text-2xl">{{ category.icon || "💰" }}</div>
              <div class="flex-1">
                <p class="text-base font-semibold text-white">{{ category.name }}</p>
              </div>
              <div
                class="w-8 h-8 rounded-full border-2 border-white/20"
                :style="{ backgroundColor: category.color || '#9333ea' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animaux Tab (placeholder) -->
      <div v-if="activeTab === 'animaux'">
        <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <h2 class="text-lg font-bold text-white">Paramètres Animaux</h2>
          <p class="text-sm text-slate-400 mt-1">À venir...</p>
        </div>
      </div>
    </div>

    <!-- Modal Add Category -->
    <div v-if="showAddCategory" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showAddCategory = false">
      <div class="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border-t sm:border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg sm:text-xl font-bold text-purple-300">Nouvelle catégorie</h3>
          <button @click="showAddCategory = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateCategory" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-300">Nom</label>
            <input
              v-model="newCategory.name"
              required
              class="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              placeholder="Ex: Courses, Loyer..."
            />
          </div>

          <div>
            <label class="text-sm font-medium text-slate-300">Icône</label>
            <div class="mt-1.5 grid grid-cols-5 gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                @click="newCategory.icon = icon"
                :class="[
                  'w-full aspect-square rounded-lg border-2 text-2xl transition-all active:scale-95',
                  newCategory.icon === icon
                    ? 'border-purple-400 bg-purple-600/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-slate-300">Couleur</label>
            <input
              v-model="newCategory.color"
              type="color"
              class="mt-1.5 w-full h-12 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
            />
          </div>

          <div class="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-3 text-base font-semibold text-white transition-all active:scale-95"
            >
              Créer
            </button>
            <button
              type="button"
              @click="showAddCategory = false"
              class="w-full rounded-lg bg-white/10 border border-white/20 py-3 text-base font-semibold text-slate-300 transition-all active:scale-95"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
