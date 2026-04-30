<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi.js";

const route = useRoute();
const router = useRouter();
const api = useApi();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);

const token = route.query.token;

if (!token) {
  router.push("/login");
}

async function handleSubmit() {
  error.value = "";

  if (password.value.length < 6) {
    error.value = "Le mot de passe doit contenir au moins 6 caractères";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  loading.value = true;
  try {
    await api.post("/auth/reset-password", {
      token,
      password: password.value,
    });
    success.value = true;
  } catch (e) {
    error.value = "Lien invalide ou expiré. Veuillez refaire une demande.";
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
          <h1 class="text-xl font-bold text-text">Nouveau mot de passe</h1>
          <p class="text-sm text-text-muted mt-1">
            Choisissez un nouveau mot de passe
          </p>
        </div>

        <div v-if="success" class="text-center space-y-4">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            ✓
          </div>
          <p class="text-sm text-text">Mot de passe mis à jour avec succès !</p>
          <router-link
            to="/login"
            class="inline-block mt-4 py-2.5 px-6 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Se connecter
          </router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Nouveau mot de passe</label
            >
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Confirmer le mot de passe</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
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
            {{ loading ? "Mise à jour..." : "Réinitialiser" }}
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
