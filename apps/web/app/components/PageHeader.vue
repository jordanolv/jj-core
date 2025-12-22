<script setup lang="ts">
import { useProfiles } from "../features/profiles/composables/useProfiles";

defineProps<{
  title: string;
  description?: string;
}>();

const emit = defineEmits(['toggle-features']);

const { selectedProfile } = useProfiles();
const showProfileMenu = ref(false);

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
}

function closeProfileMenu() {
  showProfileMenu.value = false;
}

function toggleFeatures() {
  emit('toggle-features');
}
</script>

<template>
  <header class="mb-6 backdrop-blur-xl bg-white/5 border-b border-white/10 relative z-50">
    <div class="flex items-center justify-between px-4 py-3 sm:px-6">
      <!-- Back & Home Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Back Button -->
        <button
          @click="$router.back()"
          class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 sm:hover:bg-white/20"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Home Button -->
        <NuxtLink
          to="/"
          class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 sm:hover:bg-white/20"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Title & Description (centered) -->
      <div class="flex-1 text-center px-4">
        <h1 class="text-lg sm:text-xl font-bold text-white">{{ title }}</h1>
        <p v-if="description" class="text-xs sm:text-sm text-slate-400 mt-0.5">{{ description }}</p>
      </div>

      <!-- Features & Profile Menu Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Features Menu Button -->
        <button
          @click="toggleFeatures"
          class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 sm:hover:bg-white/20"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        <!-- Profile Menu Button -->
        <div class="relative">
          <button
            @click="toggleProfileMenu"
            class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 sm:hover:bg-white/20"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

        <!-- Profile Menu Dropdown -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showProfileMenu"
            class="absolute right-0 top-12 w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-100"
          >
            <div class="p-3 border-b border-white/10">
              <p class="text-xs text-slate-400">Connecté en tant que</p>
              <p class="text-sm font-semibold text-white mt-1">{{ selectedProfile?.name }}</p>
            </div>

            <div class="p-2">
              <NuxtLink
                to="/profiles"
                @click="closeProfileMenu"
                class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all active:bg-white/10 sm:hover:bg-white/10"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="text-sm text-white">Changer de profil</span>
              </NuxtLink>

              <NuxtLink
                to="/settings"
                @click="closeProfileMenu"
                class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all active:bg-white/10 sm:hover:bg-white/10"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-sm text-white">Paramètres</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
        </div>
      </div>
    </div>

    <!-- Backdrop to close menu -->
    <div
      v-if="showProfileMenu"
      @click="closeProfileMenu"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>
