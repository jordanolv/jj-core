<script setup lang="ts">
import type { NavItem } from '~/composables/useNavigation';

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Navigation",
});

const { availableNavItems, defaultNavItems, getIcon } = useNavigation();

const MAX_ITEMS = 5;

const selectedItems = ref<NavItem[]>(defaultNavItems);

const showAddModal = ref(false);

onMounted(() => {
  const saved = localStorage.getItem('navigation-items');
  if (saved) {
    try {
      selectedItems.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse navigation items', e);
    }
  }
});

function saveNavigation() {
  localStorage.setItem('navigation-items', JSON.stringify(selectedItems.value));
  // Dispatch custom event to update navigation in real-time
  window.dispatchEvent(new Event('navigation-updated'));
}

function addItem(item: NavItem) {
  if (selectedItems.value.length >= MAX_ITEMS) return;
  if (selectedItems.value.find(i => i.id === item.id)) return;

  selectedItems.value.push(item);
  saveNavigation();
  showAddModal.value = false;
}

function removeItem(index: number) {
  selectedItems.value.splice(index, 1);
  saveNavigation();
}

function moveUp(index: number) {
  if (index === 0) return;
  const item = selectedItems.value[index];
  if (!item) return;
  selectedItems.value.splice(index, 1);
  selectedItems.value.splice(index - 1, 0, item);
  saveNavigation();
}

function moveDown(index: number) {
  if (index === selectedItems.value.length - 1) return;
  const item = selectedItems.value[index];
  if (!item) return;
  selectedItems.value.splice(index, 1);
  selectedItems.value.splice(index + 1, 0, item);
  saveNavigation();
}

const availableToAdd = computed(() => {
  return availableNavItems.filter(item => !selectedItems.value.find(i => i.id === item.id));
});
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">

      <div class="space-y-3 mb-6">
        <div
          v-for="(item, index) in selectedItems"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
          </svg>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white">{{ item.label }}</p>
            <p class="text-xs text-slate-400">{{ item.description || 'Action' }}</p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="moveUp(index)"
              :disabled="index === 0"
              class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 transition active:scale-95 disabled:opacity-30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <button
              @click="moveDown(index)"
              :disabled="index === selectedItems.length - 1"
              class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 transition active:scale-95 disabled:opacity-30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              @click="removeItem(index)"
              class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 transition active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="selectedItems.length < MAX_ITEMS && availableToAdd.length > 0"
        @click="showAddModal = true"
        class="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white font-semibold transition-all active:scale-95 hover:bg-white/10"
      >
        + Ajouter un élément
      </button>

      <p v-else-if="selectedItems.length >= MAX_ITEMS" class="text-center text-sm text-slate-400 py-4">
        Maximum d'éléments atteint
      </p>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border-t sm:border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-white">Ajouter un élément</h3>

        <div class="space-y-2">
          <button
            v-for="item in availableToAdd"
            :key="item.id"
            @click="addItem(item)"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
          >
            <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
            </svg>

            <div class="flex-1 text-left">
              <p class="text-sm font-semibold text-white">{{ item.label }}</p>
              <p class="text-xs text-slate-400">{{ item.description || 'Action' }}</p>
            </div>
          </button>

          <button
            v-if="availableToAdd.length === 0"
            class="w-full px-4 py-8 text-center text-sm text-slate-400"
          >
            Tous les éléments sont déjà ajoutés
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
