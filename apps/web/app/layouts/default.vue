<script setup lang="ts">
// ThemeToggle is auto-imported from app/components/
// No import needed - Nuxt auto-imports components
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <header class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold">JJ Core</NuxtLink>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/notifications"
            class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
            title="Notifications"
          >
            🔔
          </NuxtLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
    <main class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <slot />
    </main>
  </div>
</template>

