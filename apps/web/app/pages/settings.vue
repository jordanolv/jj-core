<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
});

const settingsItems = [
  {
    name: 'Notifications',
    description: 'Gérer les notifications push',
    icon: '🔔',
    route: '/notifications',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    name: 'Profil',
    description: 'Informations personnelles',
    icon: '👤',
    route: '/profiles',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    name: 'Thème',
    description: 'Apparence de l\'application',
    icon: '🎨',
    route: '#',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    name: 'Déconnexion',
    description: 'Se déconnecter de l\'application',
    icon: '🚪',
    route: '#',
    gradient: 'from-red-500 to-orange-600',
    action: 'logout'
  }
];

function handleItemClick(item: any) {
  if (item.action === 'logout') {
    // TODO: Implement logout
    console.log('Logout clicked');
  } else if (item.route !== '#') {
    navigateTo(item.route);
  }
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-purple-300">Paramètres</h1>
        <p class="text-sm text-slate-400 mt-1">Gérer votre compte et vos préférences</p>
      </header>

      <!-- Settings List -->
      <div class="space-y-1">
        <NuxtLink
          v-for="item in settingsItems.filter(i => i.route !== '#' && !i.action)"
          :key="item.name"
          :to="item.route"
          class="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
        >
          <!-- Icon avec gradient -->
          <div
            class="w-12 h-12 rounded-full bg-linear-to-br flex items-center justify-center text-xl shrink-0 shadow-lg"
            :class="item.gradient"
          >
            {{ item.icon }}
          </div>

          <!-- Info -->
          <div class="flex-1 text-left min-w-0">
            <h3 class="text-base font-semibold text-white">{{ item.name }}</h3>
            <p class="text-xs text-slate-400">{{ item.description }}</p>
          </div>

          <!-- Arrow -->
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>

        <button
          v-for="item in settingsItems.filter(i => i.route === '#' || i.action)"
          :key="item.name"
          @click="handleItemClick(item)"
          class="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:bg-white/5 sm:hover:bg-white/5"
        >
          <!-- Icon avec gradient -->
          <div
            class="w-12 h-12 rounded-full bg-linear-to-br flex items-center justify-center text-xl shrink-0 shadow-lg"
            :class="item.gradient"
          >
            {{ item.icon }}
          </div>

          <!-- Info -->
          <div class="flex-1 text-left min-w-0">
            <h3 class="text-base font-semibold text-white">{{ item.name }}</h3>
            <p class="text-xs text-slate-400">{{ item.description }}</p>
          </div>

          <!-- Arrow -->
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- App Info -->
      <div class="mt-8 text-center">
        <p class="text-xs text-slate-500">Version 1.0.0</p>
        <p class="text-xs text-slate-500 mt-1">© 2025 JJ Core</p>
      </div>
    </div>
  </div>
</template>
