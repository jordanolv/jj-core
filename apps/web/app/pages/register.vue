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
  <div class="min-h-screen flex items-center justify-center px-4 pb-4 sm:px-6 sm:pb-6">
    <section class="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
      <header class="mb-6 sm:mb-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-purple-300">JJ Core</h1>
        <p class="mt-2 text-slate-400">Créez votre compte pour commencer</p>
      </header>

      <form class="space-y-4 sm:space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="text-sm font-medium text-slate-300">Nom</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            placeholder="Jordan"
          />
        </div>

        <div>
          <label for="email" class="text-sm font-medium text-slate-300">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            placeholder="jordan@jj-core.app"
          />
        </div>

        <div>
          <label for="password" class="text-sm font-medium text-slate-300">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="6"
            required
            class="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <p v-if="state.error" class="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm text-red-300">
          {{ state.error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-base font-semibold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="state.loading"
        >
          <span v-if="state.loading">Création...</span>
          <span v-else>Créer mon compte</span>
        </button>

        <p class="text-center text-sm text-slate-400">
          Vous avez déjà un compte ?
          <NuxtLink to="/login" class="font-semibold text-purple-300 hover:text-white transition-colors">
            Se connecter
          </NuxtLink>
        </p>
      </form>
    </section>
  </div>
</template>
