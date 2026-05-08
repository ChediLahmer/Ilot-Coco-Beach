<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { useApi } from "@/composables/useApi.js";

const router = useRouter();
const { setToken } = useAuth();
const api = useApi();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    const data = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });
    setToken(data.token);
    router.push("/");
  } catch (e) {
    error.value = "Email ou mot de passe incorrect";
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
          <h1 class="text-xl font-bold text-text">Ilot Coco Beach</h1>
          <p class="text-sm text-text-muted mt-1">Espace administration</p>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              placeholder="admin@ilotcocobeach.tn"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Mot de passe</label
            >
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
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
            {{ loading ? "Connexion..." : "Se connecter" }}
          </button>
          <div class="text-center">
            <router-link
              to="/forgot-password"
              class="text-sm text-primary hover:underline"
            >
              Mot de passe oublié ?
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
