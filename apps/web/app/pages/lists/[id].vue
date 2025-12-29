<script setup lang="ts">
import { useLists, type ListItem } from "../../features/lists/composables/useLists";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
});

const route = useRoute();
const listId = route.params.id as string;

const { getList, createItem, updateItem, deleteItem, updateList } = useLists();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const list = ref<any>(null);
const items = ref<ListItem[]>([]);
const loading = ref(true);
const showAddItem = ref(false);
const showEditList = ref(false);

const newItemText = ref("");
const editListName = ref("");
const editListIsShared = ref(false);

async function loadData() {
  loading.value = true;
  try {
    const data = await getList(listId);
    list.value = data.list;
    items.value = data.items;
    route.meta.pageTitle = data.list.name;
  } catch (error) {
    console.error("Failed to fetch list", error);
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

async function handleAddItem() {
  if (!newItemText.value.trim()) return;
  try {
    await createItem(listId, newItemText.value);
    newItemText.value = "";
    showAddItem.value = false;
    await loadData();
  } catch (error) {
    console.error("Failed to create item", error);
  }
}

async function toggleItemComplete(item: ListItem) {
  try {
    await updateItem(listId, item.id, { completed: !item.completed });
    await loadData();
  } catch (error) {
    console.error("Failed to update item", error);
  }
}

async function handleDeleteItem(itemId: string) {
  if (!confirm("Supprimer cet item ?")) return;
  try {
    await deleteItem(listId, itemId);
    await loadData();
  } catch (error) {
    console.error("Failed to delete item", error);
  }
}

function openEditList() {
  editListName.value = list.value.name;
  editListIsShared.value = list.value.isShared;
  showEditList.value = true;
}

async function handleUpdateList() {
  try {
    await updateList(listId, {
      name: editListName.value,
      isShared: editListIsShared.value,
    });
    showEditList.value = false;
    await loadData();
  } catch (error) {
    console.error("Failed to update list", error);
  }
}

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });
});

const completedCount = computed(() => items.value.filter(i => i.completed).length);
const totalCount = computed(() => items.value.length);
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-4xl">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <div v-else-if="list">
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <button
              @click="navigateTo('/lists')"
              class="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button
              @click="openEditList"
              class="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Modifier
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">{{ list.name }}</h1>
              <div class="flex items-center gap-3">
                <span
                  v-if="list.isShared"
                  class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
                >
                  Partagée
                </span>
                <span class="text-sm text-slate-400">
                  {{ completedCount }} / {{ totalCount }} complétés
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <button
            @click="showAddItem = true"
            class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-base font-semibold text-white transition-all active:scale-95"
          >
            + Ajouter un item
          </button>
        </div>

        <div v-if="sortedItems.length === 0" class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <p class="text-slate-400">Aucun item dans cette liste</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="item in sortedItems"
            :key="item.id"
            class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
            :class="{ 'opacity-60': item.completed }"
          >
            <div class="flex items-center gap-3 flex-1">
              <button
                @click="toggleItemComplete(item)"
                class="flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all"
                :class="item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400 hover:border-emerald-500'"
              >
                <svg v-if="item.completed" class="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <span
                class="text-base text-white"
                :class="{ 'line-through': item.completed }"
              >
                {{ item.text }}
              </span>
            </div>
            <button
              @click="handleDeleteItem(item.id)"
              class="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 ml-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddItem" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showAddItem = false">
      <div class="w-full sm:max-w-md rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5 sm:p-6 shadow-2xl">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-purple-300">Nouvel item</h3>
        <form @submit.prevent="handleAddItem" class="space-y-4">
          <div>
            <input
              v-model="newItemText"
              required
              autofocus
              class="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              placeholder="Texte de l'item..."
            />
          </div>
          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-base font-semibold text-white transition-all active:scale-95"
            >
              Ajouter
            </button>
            <button
              type="button"
              @click="showAddItem = false"
              class="flex-1 rounded-lg bg-white/10 border border-white/20 py-2 text-base font-semibold text-slate-300 transition-all active:scale-95"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditList" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showEditList = false">
      <div class="w-full sm:max-w-md rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5 sm:p-6 shadow-2xl">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-purple-300">Modifier la liste</h3>
        <form @submit.prevent="handleUpdateList" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-300">Nom de la liste</label>
            <input
              v-model="editListName"
              required
              class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="editListIsShared"
              type="checkbox"
              id="editIsShared"
              class="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label for="editIsShared" class="text-sm font-medium text-slate-300">Liste partagée avec le profil</label>
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-base font-semibold text-white transition-all active:scale-95"
            >
              Enregistrer
            </button>
            <button
              type="button"
              @click="showEditList = false"
              class="flex-1 rounded-lg bg-white/10 border border-white/20 py-2 text-base font-semibold text-slate-300 transition-all active:scale-95"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
