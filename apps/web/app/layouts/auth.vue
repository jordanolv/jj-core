<template>
  <div class="min-h-screen text-white relative bg-black overflow-hidden">
    <!-- Effets de glow en arrière-plan -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Contenu -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
