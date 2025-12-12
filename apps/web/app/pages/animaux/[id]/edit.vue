<script setup lang="ts">
import { useAnimaux, type Garde } from "../../../features/animaux/composables/useAnimaux";

definePageMeta({
  middleware: ["authenticated"],
});

const route = useRoute();
const router = useRouter();
const { getGarde, updateGarde } = useAnimaux();

const garde = ref<Garde | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref("");

const form = reactive({
  typeAnimal: "",
  nomAnimal: "",
  nomClient: "",
  contact: "",
  source: "",
  dateDebut: "",
  dateFin: "",
  duree: "",
  tarif: 0,
  typeGarde: "",
  statut: "confirmé" as "confirmé" | "en_cours" | "terminé" | "annulé",
  notes: "",
  photos: [] as string[],
  isShared: false,
});

onMounted(async () => {
  try {
    const id = route.params.id as string;
    garde.value = await getGarde(id);

    // Populate form
    form.typeAnimal = garde.value.typeAnimal;
    form.nomAnimal = garde.value.nomAnimal;
    form.nomClient = garde.value.nomClient;
    form.contact = garde.value.contact || "";
    form.source = garde.value.source || "";
    form.dateDebut = new Date(garde.value.dateDebut).toISOString().split('T')[0];
    form.dateFin = new Date(garde.value.dateFin).toISOString().split('T')[0];
    form.duree = garde.value.duree || "";
    form.tarif = garde.value.tarif;
    form.typeGarde = garde.value.typeGarde;
    form.statut = garde.value.statut;
    form.notes = garde.value.notes || "";
    form.photos = garde.value.photos;
    form.isShared = garde.value.isShared;
  } catch (err) {
    console.error("Failed to fetch garde", err);
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  error.value = "";
  saving.value = true;

  try {
    const id = route.params.id as string;
    await updateGarde(id, {
      typeAnimal: form.typeAnimal,
      nomAnimal: form.nomAnimal,
      nomClient: form.nomClient,
      contact: form.contact || undefined,
      source: form.source || undefined,
      dateDebut: new Date(form.dateDebut).toISOString(),
      dateFin: new Date(form.dateFin).toISOString(),
      duree: form.duree || undefined,
      tarif: form.tarif,
      typeGarde: form.typeGarde,
      statut: form.statut,
      notes: form.notes || undefined,
      photos: form.photos,
      isShared: form.isShared,
    });

    router.push(`/animaux/${id}`);
  } catch (err) {
    console.error(err);
    error.value = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
  } finally {
    saving.value = false;
  }
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="px-4 pb-4 sm:px-6 sm:pb-6">
    <div class="mx-auto max-w-2xl">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-6">
          <button
            @click="goBack"
            class="mb-4 px-3 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white text-sm transition-all hover:bg-white/15"
          >
            ← Retour
          </button>
          <h1 class="text-2xl font-bold text-white">Éditer la garde</h1>
          <p class="text-sm text-slate-300 mt-1">Modifiez les informations de la garde</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Type d'animal -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Type d'animal</label>
            <select
              v-model="form.typeAnimal"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="Chien">Chien</option>
              <option value="Chat">Chat</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <!-- Nom de l'animal -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Nom de l'animal *</label>
            <input
              v-model="form.nomAnimal"
              type="text"
              required
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Rex"
            />
          </div>

          <!-- Nom du client -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Nom du client *</label>
            <input
              v-model="form.nomClient"
              type="text"
              required
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Marie Dupont"
            />
          </div>

          <!-- Contact -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Contact</label>
            <input
              v-model="form.contact"
              type="text"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="06 12 34 56 78"
            />
          </div>

          <!-- Source -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Source</label>
            <input
              v-model="form.source"
              type="text"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Recommandation, réseaux sociaux..."
            />
          </div>

          <!-- Dates -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-white mb-2">Date de début *</label>
                <input
                  v-model="form.dateDebut"
                  type="date"
                  required
                  class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Date de fin *</label>
                <input
                  v-model="form.dateFin"
                  type="date"
                  required
                  class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>

          <!-- Durée -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Durée</label>
            <input
              v-model="form.duree"
              type="text"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="3 jours, 1 semaine..."
            />
          </div>

          <!-- Type de garde -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Type de garde</label>
            <input
              v-model="form.typeGarde"
              type="text"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Domicile, Promenade..."
            />
          </div>

          <!-- Tarif -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Tarif (€) *</label>
            <input
              v-model.number="form.tarif"
              type="number"
              step="0.01"
              required
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="50.00"
            />
          </div>

          <!-- Statut -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Statut</label>
            <select
              v-model="form.statut"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="confirmé">Confirmé</option>
              <option value="en_cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="block text-sm font-medium text-white mb-2">Notes</label>
            <textarea
              v-model="form.notes"
              rows="4"
              class="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Informations supplémentaires..."
            ></textarea>
          </div>

          <!-- Garde partagée -->
          <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="form.isShared"
                type="checkbox"
                class="rounded border-white/20"
              />
              <span class="text-sm font-medium text-white">Garde partagée</span>
            </label>
            <p class="text-xs text-slate-300 mt-2">Cette garde sera visible par tous les profils</p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-xl p-4">
            <p class="text-sm text-red-300">{{ error }}</p>
          </div>

          <!-- Submit -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="goBack"
              class="flex-1 px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold transition-all hover:bg-white/15 active:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>
