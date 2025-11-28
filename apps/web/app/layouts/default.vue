<script setup lang="ts">
// ThemeToggle is auto-imported from app/components/
// No import needed - Nuxt auto-imports components
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-rose-900 text-white">
    <!-- Mobile-first header -->
    <header class="sticky top-0 z-50 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all duration-300"
        >
          <span class="text-xl">🏠</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/notifications"
            class="w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all duration-300"
            title="Notifications"
          >
            <span class="text-xl">🔔</span>
          </NuxtLink>
          <button class="w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-all duration-300">
            <span class="text-xl">⚙️</span>
          </button>
        </div>
      </div>
    </header>
    <main class="w-full">
      <slot />
    </main>
  </div>
</template>

