<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getGalleryImages, uploadImage, deleteImage } from '@/lib/supabase'

const router = useRouter()

const images = ref([])
const loading = ref(true)
const uploading = ref(false)
const deletingId = ref(null)
const fileInput = ref(null)

onMounted(async () => {
  // Check auth
  if (!supabase) {
    loading.value = false
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/admin/login')
    return
  }

  await loadImages()
})

async function loadImages() {
  loading.value = true
  images.value = await getGalleryImages()
  loading.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploading.value = true
  const result = await uploadImage(file)
  if (result) {
    images.value.push(result)
  }
  uploading.value = false
  // Reset file input
  if (fileInput.value) fileInput.value.value = ''
}

async function handleDelete(image) {
  if (!confirm('Supprimer cette image ?')) return

  deletingId.value = image.id
  const success = await deleteImage(image.id, image.url)
  if (success) {
    images.value = images.value.filter((img) => img.id !== image.id)
  }
  deletingId.value = null
}

async function handleLogout() {
  if (supabase) {
    await supabase.auth.signOut()
  }
  router.push('/admin/login')
}
</script>

<template>
  <div class="bg-sand min-h-screen">
    <!-- Not configured fallback -->
    <div v-if="!supabase" class="flex items-center justify-center min-h-screen px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div class="text-coral text-4xl mb-4">⚙️</div>
        <h2 class="font-heading text-xl font-bold text-charcoal">Configuration requise</h2>
        <p class="text-charcoal/60 mt-3 text-sm leading-relaxed">
          Pour utiliser le panneau d'administration, configurez les variables d'environnement suivantes dans votre fichier <code class="bg-sand-dark px-1 rounded">.env</code> :
        </p>
        <div class="bg-charcoal text-white rounded-xl p-4 mt-4 text-left text-sm font-mono">
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
        </div>
      </div>
    </div>

    <!-- Admin panel -->
    <div v-else class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-heading text-2xl font-bold text-charcoal">Administration</h1>
          <p class="text-charcoal/50 text-sm mt-1">Gestion de la galerie</p>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 rounded-xl border border-charcoal/20 text-charcoal/70 hover:bg-charcoal hover:text-white transition font-heading text-sm"
        >
          Déconnexion
        </button>
      </div>

      <!-- Upload button -->
      <div class="mb-8">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          @click="triggerUpload"
          :disabled="uploading"
          class="bg-ocean text-white px-6 py-3 rounded-xl font-heading font-semibold hover:bg-ocean-dark transition disabled:opacity-50 inline-flex items-center gap-2"
        >
          <svg v-if="!uploading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span v-if="uploading">Envoi en cours...</span>
          <span v-else>Ajouter une image</span>
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block w-8 h-8 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin"></div>
        <p class="text-charcoal/50 mt-4 font-heading">Chargement...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="images.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm">
        <div class="text-5xl mb-4">🏝️</div>
        <p class="font-heading text-charcoal/60">Aucune image dans la galerie</p>
        <p class="text-charcoal/40 text-sm mt-1">Cliquez sur "Ajouter une image" pour commencer</p>
      </div>

      <!-- Image grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="image in images"
          :key="image.id"
          class="group relative rounded-xl overflow-hidden shadow-md bg-white"
        >
          <img
            :src="image.url"
            :alt="'Gallery image ' + image.id"
            class="w-full h-48 object-cover"
          />
          <!-- Delete overlay -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              @click="handleDelete(image)"
              :disabled="deletingId === image.id"
              class="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition disabled:opacity-50"
            >
              <svg v-if="deletingId !== image.id" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span v-else class="text-sm">...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
