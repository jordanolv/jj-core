<script setup lang="ts">
import { useAuth } from "../features/auth/composables/useAuth";

definePageMeta({
  middleware: ["guest"],
});

const auth = useAuth();
const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

const state = reactive({
  loading: false,
  error: "",
});

async function handleSubmit() {
  state.error = "";
  state.loading = true;
  try {
    await auth.register(form);
    router.push("/profiles");
  } catch (error) {
    console.error(error);
    state.error =
      error instanceof Error ? error.message : "Impossible de créer le compte.";
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <section class="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6">
      <header class="mb-6 space-y-1">
        <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
          JJ Core
        </p>
        <h1 class="text-2xl font-bold text-white">Créer un compte</h1>
        <p class="text-sm text-slate-300">
          Remplissez les informations ci-dessous pour créer votre compte.
        </p>
      </header>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-white">Nom</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-slate-400"
            placeholder="Jordan"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-white">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-slate-400"
            placeholder="jordan@jj-core.app"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-white"
            >Mot de passe</label
          >
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="6"
            required
            class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-slate-400"
            placeholder="••••••••"
          />
        </div>

        <p v-if="state.error" class="rounded-lg bg-red-500/20 border border-red-400/30 px-3 py-2 text-sm text-red-300">
          {{ state.error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2.5 font-semibold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="state.loading"
        >
          <span v-if="state.loading">Création...</span>
          <span v-else>Créer mon compte</span>
        </button>

        <p class="text-center text-sm text-slate-300">
          Vous avez déjà un compte ?
          <NuxtLink to="/login" class="font-semibold text-white hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </form>
    </section>
  </div>
</template>
