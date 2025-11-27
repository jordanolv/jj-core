<script setup lang="ts">
import { useAuth } from "../features/auth/composables/useAuth";

definePageMeta({
  middleware: ["guest"],
  layout: "auth",
});

const auth = useAuth();
const router = useRouter();

const form = reactive({
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
    await auth.login(form);
    router.push("/profiles");
  } catch (error) {
    console.error(error);
    state.error =
      error instanceof Error ? error.message : "Impossible de se connecter.";
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
    <section class="w-full max-w-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 shadow-xl rounded-2xl p-6">
      <header class="mb-6 space-y-1">
        <p class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          JJ Core
        </p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Connexion</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Entrez votre email et votre mot de passe pour accéder au tableau de bord.
        </p>
      </header>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white shadow-sm focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            placeholder="jordan@jj-core.app"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-slate-700 dark:text-slate-300"
            >Mot de passe</label
          >
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="6"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white shadow-sm focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            placeholder="••••••••"
          />
        </div>

        <p v-if="state.error" class="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {{ state.error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="state.loading"
        >
          <span v-if="state.loading">Connexion...</span>
          <span v-else>Se connecter</span>
        </button>

        <p class="text-center text-sm text-slate-600 dark:text-slate-400">
          Pas encore de compte ?
          <NuxtLink to="/register" class="font-semibold text-slate-900 dark:text-white hover:underline">
            Créer un compte
          </NuxtLink>
        </p>
      </form>
    </section>
  </div>
</template>

