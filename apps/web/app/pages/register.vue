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
  <section class="rounded-2xl bg-white p-6 shadow-sm">
    <header class="mb-6 space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">
        JJ Core
      </p>
      <h1 class="text-2xl font-bold text-slate-900">Créer un compte</h1>
      <p class="text-sm text-slate-500">
        Remplissez les informations ci-dessous pour créer votre compte.
      </p>
    </header>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-slate-700">Nom</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="Jordan"
        />
      </div>

      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="jordan@jj-core.app"
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="text-sm font-medium text-slate-700"
          >Mot de passe</label
        >
        <input
          id="password"
          v-model="form.password"
          type="password"
          minlength="6"
          required
          class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="••••••••"
        />
      </div>

      <p v-if="state.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ state.error }}
      </p>

      <button
        type="submit"
        class="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="state.loading"
      >
        <span v-if="state.loading">Création...</span>
        <span v-else>Créer mon compte</span>
      </button>

      <p class="text-center text-sm text-slate-600">
        Vous avez déjà un compte ?
        <NuxtLink to="/login" class="font-semibold text-slate-900 hover:underline">
          Se connecter
        </NuxtLink>
      </p>
    </form>
  </section>
</template>
