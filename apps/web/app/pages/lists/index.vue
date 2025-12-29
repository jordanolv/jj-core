<script setup lang="ts">
import { useLists } from "../../features/lists/composables/useLists";
import { useProfiles } from "../../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  pageTitle: "Listes",
});

const { getLists, createList, deleteList } = useLists();
const { selectedProfile, loadSelectedProfile } = useProfiles();

const lists = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newList = reactive({
  name: "",
  isShared: false,
});

async function loadLists() {
  loading.value = true;
  try {
    lists.value = await getLists();
  } catch (error) {
    console.error("Failed to fetch lists", error);
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
  await loadLists();
});

async function handleCreateList() {
  try {
    await createList({
      name: newList.name,
      isShared: newList.isShared,
    });
    showAddModal.value = false;
    newList.name = "";
    newList.isShared = false;
    await loadLists();
  } catch (error) {
    console.error("Failed to create list", error);
  }
}

async function handleDeleteList(listId: string) {
  if (!confirm("Supprimer cette liste ?")) return;
  try {
    await deleteList(listId);
    await loadLists();
  } catch (error) {
    console.error("Failed to delete list", error);
  }
}

function goToList(listId: string) {
  navigateTo(`/lists/${listId}`);
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-6xl">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Mes listes</h1>
          <button
            @click="showAddModal = true"
            class="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm sm:text-base font-semibold text-white transition-all active:scale-95"
          >
            + Nouvelle liste
          </button>
        </div>

        <div v-if="lists.length === 0" class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 sm:p-12 text-center">
          <p class="text-lg text-slate-400">Aucune liste</p>
          <p class="text-sm text-slate-500 mt-2">Créez votre première liste pour commencer</p>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="list in lists"
            :key="list.id"
            class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div @click="goToList(list.id)" class="p-5 sm:p-6">
              <div class="flex items-start justify-between mb-3">
                <h2 class="text-lg sm:text-xl font-bold text-white">{{ list.name }}</h2>
                <span
                  v-if="list.isShared"
                  class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
                >
                  Partagée
                </span>
              </div>
              <p class="text-sm text-slate-400">
                Créée le {{ new Date(list.createdAt).toLocaleDateString('fr-FR') }}
              </p>
            </div>
            <div class="border-t border-white/10 p-3 flex justify-end bg-white/5">
              <button
                @click.stop="handleDeleteList(list.id)"
                class="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showAddModal = false">
      <div class="w-full sm:max-w-md rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="mb-4 text-lg sm:text-xl font-bold text-purple-300">Nouvelle liste</h3>
        <form @submit.prevent="handleCreateList" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-slate-300">Nom de la liste</label>
            <input
              v-model="newList.name"
              required
              class="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-base text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              placeholder="Ma liste..."
            />
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="newList.isShared"
              type="checkbox"
              id="isShared"
              class="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label for="isShared" class="text-sm font-medium text-slate-300">Liste partagée avec le profil</label>
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-base font-semibold text-white transition-all active:scale-95"
            >
              Créer
            </button>
            <button
              type="button"
              @click="showAddModal = false"
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
