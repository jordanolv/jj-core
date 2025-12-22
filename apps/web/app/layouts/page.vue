<script setup lang="ts">
const route = useRoute();

// Get page title and description from route meta
const pageTitle = computed(() => route.meta.pageTitle as string || '');
const pageDescription = computed(() => route.meta.pageDescription as string || '');
</script>

<template>
  <div class="min-h-screen text-white relative bg-linear-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
    <!-- Gradient backgrounds -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 pb-24">
      <!-- Page Header -->
      <PageHeader :title="pageTitle" :description="pageDescription" />

      <!-- Page Content -->
      <slot />
    </div>
  </div>
</template>
