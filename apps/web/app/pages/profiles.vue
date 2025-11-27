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
  <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="w-full max-w-4xl">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-white">Qui est-ce ?</h1>
        <p class="mt-2 text-slate-400">Sélectionnez votre profil pour continuer</p>
      </header>

      <div v-if="loading" class="flex justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-white"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          @click="handleSelectProfile(profile)"
          class="group flex flex-col items-center gap-3 rounded-xl bg-slate-800/50 p-6 transition hover:bg-slate-700/50"
        >
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white transition group-hover:scale-110">
            {{ profile.name.charAt(0).toUpperCase() }}
          </div>
          <span class="text-lg font-semibold text-white">{{ profile.name }}</span>
        </button>

        <button
          v-if="!showCreateForm"
          @click="showCreateForm = true"
          class="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-700 p-6 transition hover:border-slate-600 hover:bg-slate-800/30"
        >
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-4xl text-slate-400">
            +
          </div>
          <span class="text-lg font-semibold text-slate-400">Ajouter</span>
        </button>

        <div
          v-else
          class="flex flex-col items-center gap-3 rounded-xl bg-slate-800/50 p-6"
        >
          <input
            v-model="newProfileName"
            @keyup.enter="handleCreateProfile"
            type="text"
            placeholder="Nom"
            class="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-center text-white focus:border-blue-500 focus:outline-none"
            autofocus
          />
          <div class="flex gap-2">
            <button
              @click="handleCreateProfile"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Créer
            </button>
            <button
              @click="showCreateForm = false; newProfileName = ''"
              class="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <button
          @click="async () => { await auth.logout(); navigateTo('/login'); }"
          class="text-slate-400 transition hover:text-white"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>
