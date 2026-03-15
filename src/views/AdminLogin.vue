<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (authError) {
      error.value = authError.message
    } else {
      router.push('/admin')
    }
  } catch (e) {
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-sand min-h-screen flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="font-display text-ocean text-2xl">ILOT</h1>
        <p class="font-heading text-charcoal/60 mt-1">Administration</p>
      </div>

      <!-- Supabase not configured message -->
      <div v-if="!supabase" class="text-center py-8">
        <div class="text-coral text-4xl mb-4">⚠️</div>
        <p class="font-heading text-charcoal font-semibold">Supabase non configuré</p>
        <p class="text-charcoal/60 mt-2 text-sm">
          Configurez les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer l'authentification.
        </p>
      </div>

      <!-- Login form -->
      <form v-else @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-heading font-medium text-charcoal/70 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="admin@ilotcocobeach.com"
            class="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-heading font-medium text-charcoal/70 mb-1">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body"
          />
        </div>

        <!-- Error message -->
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-ocean text-white rounded-xl w-full py-3 font-heading font-semibold hover:bg-ocean-dark transition disabled:opacity-50"
        >
          {{ loading ? '...' : 'Connexion' }}
        </button>
      </form>
    </div>
  </div>
</template>
