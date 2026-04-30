<script setup>
import { ref } from "vue";
import { useApi } from "@/composables/useApi.js";

const api = useApi();
const email = ref("");
const loading = ref(false);
const sent = ref(false);
const error = ref("");

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await api.post("/auth/forgot-password", { email: email.value });
    sent.value = true;
  } catch (e) {
    error.value = "Une erreur est survenue. Réessayez plus tard.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-sidebar">
    <div class="w-full max-w-sm">
      <div
        class="bg-surface rounded-2xl shadow-2xl shadow-black/20 p-8 border border-border"
      >
        <div class="text-center mb-8">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg mb-4"
          >
            IC
          </div>
          <h1 class="text-xl font-bold text-text">Mot de passe oublié</h1>
          <p class="text-sm text-text-muted mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div v-if="sent" class="text-center space-y-4">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            ✓
          </div>
          <p class="text-sm text-text-muted">
            Si cette adresse email est associée à un compte, vous recevrez un
            lien de réinitialisation dans quelques instants.
          </p>
          <router-link
            to="/login"
            class="inline-block mt-4 text-sm text-primary hover:underline"
          >
            ← Retour à la connexion
          </router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              placeholder="admin@ilotcocobeach.tn"
            />
          </div>
          <p v-if="error" class="text-sm text-danger font-medium">
            {{ error }}
          </p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 shadow-sm transition-colors"
          >
            {{ loading ? "Envoi..." : "Envoyer le lien" }}
          </button>
          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-primary hover:underline"
            >
              ← Retour à la connexion
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
