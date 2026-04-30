<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/composables/useApi.js";

const api = useApi();
const images = ref([]);
const uploading = ref(false);
const previewUrl = ref(null);

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function openPreview(img) {
  previewUrl.value = img.url;
}
function closePreview() {
  previewUrl.value = null;
}

async function loadData() {
  let all = [];
  let cursor = undefined;
  // Load all images for admin (paginated fetch)
  while (true) {
    const res = await api.get(
      `/gallery?limit=50${cursor ? `&cursor=${cursor}` : ""}`,
    );
    all = [...all, ...res.items];
    if (!res.nextCursor) break;
    cursor = res.nextCursor;
  }
  images.value = all;
}

onMounted(loadData);

async function handleUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  uploading.value = true;
  for (const file of files) {
    await api.upload("/gallery", file);
  }
  uploading.value = false;
  event.target.value = "";
  await loadData();
}

async function updateImage(img, data) {
  await api.put(`/gallery/${img.id}`, data);
  await loadData();
}

async function remove(img) {
  if (!confirm("Supprimer cette image ?")) return;
  await api.del(`/gallery/${img.id}`);
  await loadData();
}
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
    >
      <div>
        <h2 class="text-xl font-bold text-text">Galerie</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Gérer les images de la galerie photo
        </p>
      </div>
      <label
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ uploading ? "Envoi en cours..." : "Ajouter des médias" }}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          class="hidden"
          @change="handleUpload"
          :disabled="uploading"
        />
      </label>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
    >
      <div
        v-for="img in images"
        :key="img.id"
        class="group bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
      >
        <div class="relative aspect-[4/3] overflow-hidden bg-surface-alt">
          <video
            v-if="isVideo(img.url)"
            :src="img.url"
            class="w-full h-full object-cover cursor-pointer"
            muted
            @click="openPreview(img)"
          />
          <img
            v-else
            :src="img.url"
            :alt="img.alt"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            loading="lazy"
            @click="openPreview(img)"
          />
          <div
            v-if="isVideo(img.url)"
            class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
          >
            Vidéo
          </div>
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
          >
            <button
              @click="remove(img)"
              class="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-2 bg-danger text-white text-xs font-medium rounded-lg shadow-lg hover:bg-red-600"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
        <div class="p-3 flex gap-2 items-center">
          <input
            :value="img.category || ''"
            @change="updateImage(img, { category: $event.target.value })"
            placeholder="Catégorie"
            class="flex-1 text-xs px-2.5 py-1.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          />
          <input
            :value="img.order"
            type="number"
            @change="updateImage(img, { order: Number($event.target.value) })"
            class="w-14 text-xs px-2.5 py-1.5 border border-border rounded-lg text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>
    </div>

    <div v-if="!images.length" class="py-16 text-center">
      <svg
        class="w-12 h-12 mx-auto text-text-muted/30 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
      <p class="text-sm text-text-muted">Aucune image dans la galerie</p>
      <p class="text-xs text-text-muted/60 mt-1">
        Utilisez le bouton ci-dessus pour ajouter des images
      </p>
    </div>

    <!-- Lightbox Preview -->
    <Teleport to="body">
      <div
        v-if="previewUrl"
        class="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
        @click.self="closePreview"
      >
        <button
          @click="closePreview"
          class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <video
          v-if="isVideo(previewUrl)"
          :src="previewUrl"
          controls
          autoplay
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
        />
        <img
          v-else
          :src="previewUrl"
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        />
      </div>
    </Teleport>
  </div>
</template>
