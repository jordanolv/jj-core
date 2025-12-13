<script setup lang="ts">
import { useAuth } from "../features/auth/composables/useAuth";
import { useProfiles } from "../features/profiles/composables/useProfiles";

definePageMeta({
  middleware: ["authenticated"],
  layout: "auth",
});

const auth = useAuth();
const { fetchProfiles, selectProfile } = useProfiles();

const profiles = ref<any[]>([]);
const loading = ref(true);
const showCreateForm = ref(false);
const newProfileName = ref("");

onMounted(async () => {
  try {
    profiles.value = await fetchProfiles();
  } catch (error) {
    console.error("Failed to fetch profiles", error);
  } finally {
    loading.value = false;
  }
});

function handleSelectProfile(profile: any) {
  selectProfile(profile);
  navigateTo("/");
}

async function handleCreateProfile() {
  if (!newProfileName.value.trim()) return;

  try {
    const { createProfile } = useProfiles();
    const newProfile = await createProfile({ name: newProfileName.value });
    profiles.value.push(newProfile);
    newProfileName.value = "";
    showCreateForm.value = false;
  } catch (error) {
    console.error("Failed to create profile", error);
  }
}
</script>

<template>
  <div class="min-h-screen px-4 pb-4 sm:px-6 sm:pb-6 flex items-center justify-center">
    <div class="w-full max-w-4xl">
      <header class="mb-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-purple-300">Qui est-ce ?</h1>
        <p class="mt-2 text-slate-400">Sélectionnez votre profil pour continuer</p>
      </header>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          @click="handleSelectProfile(profile)"
          class="group flex flex-col items-center gap-3 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 active:scale-95"
        >
          <div class="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-2xl sm:text-3xl font-bold text-white transition group-hover:scale-110">
            {{ profile.name.charAt(0).toUpperCase() }}
          </div>
          <span class="text-base sm:text-lg font-semibold text-white">{{ profile.name }}</span>
        </button>

        <button
          v-if="!showCreateForm"
          @click="showCreateForm = true"
          class="flex flex-col items-center gap-3 rounded-2xl backdrop-blur-xl bg-white/5 border-2 border-dashed border-white/20 p-6 transition-all hover:bg-white/10 hover:border-white/30 active:scale-95"
        >
          <div class="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/10 text-3xl sm:text-4xl text-slate-400">
            +
          </div>
          <span class="text-base sm:text-lg font-semibold text-slate-400">Ajouter</span>
        </button>

        <div
          v-else
          class="flex flex-col items-center gap-3 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <input
            v-model="newProfileName"
            @keyup.enter="handleCreateProfile"
            type="text"
            placeholder="Nom"
            class="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-center text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            autofocus
          />
          <div class="flex gap-2 w-full">
            <button
              @click="handleCreateProfile"
              class="flex-1 rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95"
            >
              Créer
            </button>
            <button
              @click="showCreateForm = false; newProfileName = ''"
              class="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition-all active:scale-95"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <button
          @click="async () => { await auth.logout(); navigateTo('/login'); }"
          class="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>
