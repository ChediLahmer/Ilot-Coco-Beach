<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "@/composables/useApi.js";
import { useFormValidation } from "@/composables/useFormValidation.js";
import { useToast } from "@/composables/useToast.js";
import { useConfirm } from "@/composables/useConfirm.js";
import FieldError from "@/components/FieldError.vue";
import AppToggle from "@/components/AppToggle.vue";

const { fieldErrors, clearErrors, validateRequired, hasErrors } =
  useFormValidation();
const api = useApi();
const toast = useToast();
const { confirm } = useConfirm();
const images = ref([]);
const categories = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadTotal = ref(0);
const uploadDone = ref(0);
const previewUrl = ref(null);
const loading = ref(false);
const error = ref(null);
const busy = ref(new Set());

// Filters
const searchQuery = ref("");
const filterCategory = ref("");
const sortBy = ref("order"); // order | date | name

// Pagination
const page = ref(1);
const ITEMS_PER_PAGE = 24;

// Category modal
const showCatModal = ref(false);
const editingCat = ref(null);
const catForm = ref({ name: { fr: "", en: "", ar: "" }, order: 0 });

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function openPreview(img) {
  previewUrl.value = img.url;
}
function closePreview() {
  previewUrl.value = null;
}

// Filtered & sorted images
const filteredImages = computed(() => {
  let list = images.value;

  if (filterCategory.value) {
    const catId = Number(filterCategory.value);
    list = list.filter((img) => img.categoryId === catId);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (img) =>
        (img.alt || "").toLowerCase().includes(q) ||
        (img.url || "").toLowerCase().includes(q),
    );
  }

  const sorted = [...list];
  if (sortBy.value === "date") {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === "name") {
    sorted.sort((a, b) => (a.alt || "").localeCompare(b.alt || ""));
  } else {
    sorted.sort((a, b) => a.order - b.order);
  }
  return sorted;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredImages.value.length / ITEMS_PER_PAGE)),
);

const paginatedImages = computed(() => {
  const start = (page.value - 1) * ITEMS_PER_PAGE;
  return filteredImages.value.slice(start, start + ITEMS_PER_PAGE);
});

watch([searchQuery, filterCategory, sortBy], () => {
  page.value = 1;
});

async function loadCategories() {
  try {
    categories.value = await api.get("/gallery/categories");
  } catch {
    error.value = "Erreur de chargement des catégories";
    toast.error("Erreur de chargement des catégories");
  }
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    let all = [];
    let cursor = undefined;
    const MAX_PAGES = 50;
    for (let i = 0; i < MAX_PAGES; i++) {
      const res = await api.get(
        `/gallery?limit=50${cursor ? `&cursor=${cursor}` : ""}`,
      );
      all = [...all, ...res.items];
      if (!res.nextCursor) break;
      cursor = res.nextCursor;
    }
    images.value = all;
  } catch {
    error.value = "Erreur de chargement";
    toast.error("Erreur de chargement de la galerie");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadCategories();
  await loadData();
});

async function handleUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  uploading.value = true;
  uploadTotal.value = files.length;
  uploadDone.value = 0;
  uploadProgress.value = 0;
  let succeeded = 0;
  let failed = 0;
  try {
    for (const file of files) {
      try {
        uploadProgress.value = 0;
        await api.upload(
          "/gallery",
          file,
          {},
          {
            onProgress: (pct) => {
              uploadProgress.value = pct;
            },
          },
        );
        succeeded++;
      } catch (e) {
        failed++;
        toast.error(`${file.name} : ${e.message || "Erreur"}`);
      }
      uploadDone.value++;
    }
    event.target.value = "";
    await loadData();
    if (succeeded > 0) {
      toast.success(
        `${succeeded} fichier(s) ajouté(s)${failed ? `, ${failed} échoué(s)` : ""}`,
      );
    }
  } finally {
    uploading.value = false;
  }
}

async function updateImage(img, data) {
  try {
    await api.put(`/gallery/${img.id}`, data);
    await loadData();
    toast.success("Image mise à jour");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  }
}

async function remove(img) {
  const ok = await confirm({
    title: "Supprimer l'image",
    message:
      "Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.",
  });
  if (!ok) return;
  busy.value.add(img.id);
  try {
    await api.del(`/gallery/${img.id}`);
    await loadData();
    toast.success("Image supprimée");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la suppression");
  } finally {
    busy.value.delete(img.id);
  }
}

async function toggleVisible(img) {
  busy.value.add(img.id);
  try {
    await api.put(`/gallery/${img.id}`, { visible: !img.visible });
    await loadData();
    toast.success(img.visible ? "Image masquée" : "Image rendue visible");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  } finally {
    busy.value.delete(img.id);
  }
}

// Category CRUD
function openCatModal(cat = null) {
  editingCat.value = cat;
  catForm.value = cat
    ? { name: { ...cat.name }, order: cat.order }
    : { name: { fr: "", en: "", ar: "" }, order: categories.value.length };
  showCatModal.value = true;
}

async function saveCat() {
  clearErrors();
  validateRequired(catForm.value.name.fr, "nameFr", "Nom (FR)");
  if (hasErrors()) return;
  try {
    if (editingCat.value) {
      await api.put(
        `/gallery/categories/${editingCat.value.id}`,
        catForm.value,
      );
    } else {
      await api.post("/gallery/categories", catForm.value);
    }
    showCatModal.value = false;
    await loadCategories();
    toast.success(
      editingCat.value ? "Catégorie mise à jour" : "Catégorie créée",
    );
  } catch (e) {
    toast.error(e.message || "Erreur lors de la sauvegarde");
  }
}

async function deleteCat(cat) {
  const ok = await confirm({
    title: "Supprimer la catégorie",
    message: `Êtes-vous sûr de vouloir supprimer "${cat.name.fr}" ? Cette action est irréversible.`,
  });
  if (!ok) return;
  try {
    await api.del(`/gallery/categories/${cat.id}`);
    await loadCategories();
    toast.success("Catégorie supprimée");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la suppression");
  }
}
</script>

<template>
  <div>
    <div
      v-if="error"
      class="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ error }}
      <button @click="error = null" class="ml-2 underline">Fermer</button>
    </div>
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
        {{
          uploading
            ? `Envoi ${uploadDone}/${uploadTotal} (${uploadProgress}%)`
            : "Ajouter des médias"
        }}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          class="hidden"
          @change="handleUpload"
          :disabled="uploading"
        />
      </label>
      <!-- Upload progress -->
      <div v-if="uploading" class="w-full max-w-xs">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              :style="{ width: uploadProgress + '%' }"
            />
          </div>
          <span class="text-xs font-medium text-text-muted tabular-nums"
            >{{ uploadProgress }}%</span
          >
        </div>
      </div>
    </div>

    <!-- Categories management -->
    <div class="mb-6 p-4 bg-surface rounded-xl border border-border">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-text">Catégories</h3>
        <button
          @click="openCatModal()"
          class="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Ajouter
        </button>
      </div>
      <div v-if="categories.length" class="flex flex-wrap gap-2">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt rounded-lg border border-border text-xs"
        >
          <span class="font-medium">{{ cat.name.fr }}</span>
          <span class="text-text-muted">/ {{ cat.name.en || "–" }}</span>
          <button
            @click="openCatModal(cat)"
            class="ml-1 p-2 rounded text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
          >
            ✎
          </button>
          <button
            @click="deleteCat(cat)"
            class="p-2 rounded text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-else class="text-xs text-text-muted">Aucune catégorie créée</p>
    </div>

    <!-- Search, Filter, Sort bar -->
    <div class="mb-5 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          placeholder="Rechercher..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
        />
      </div>
      <select
        v-model="filterCategory"
        class="text-sm px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
      >
        <option value="">Toutes catégories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name.fr }}
        </option>
      </select>
      <select
        v-model="sortBy"
        class="text-sm px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
      >
        <option value="order">Tri: Ordre</option>
        <option value="date">Tri: Plus récent</option>
        <option value="name">Tri: Nom</option>
      </select>
      <span class="text-xs text-text-muted ml-auto"
        >{{ filteredImages.length }} média(s)</span
      >
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
    >
      <div
        v-for="img in paginatedImages"
        :key="img.id"
        class="group bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
      >
        <div
          class="relative aspect-[4/3] overflow-hidden bg-surface-alt cursor-pointer"
          :class="{ 'opacity-40': !img.visible }"
          @click="openPreview(img)"
        >
          <video
            v-if="isVideo(img.url)"
            :src="img.url"
            class="w-full h-full object-cover"
            muted
          />
          <img
            v-else
            :src="img.url"
            :alt="img.alt"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-if="isVideo(img.url)"
            class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
          >
            Vidéo
          </div>
          <button
            @click.stop="remove(img)"
            :disabled="busy.has(img.id)"
            class="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg shadow-lg hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
        <div class="p-3 flex gap-2 items-center">
          <AppToggle
            :model-value="img.visible"
            @update:model-value="toggleVisible(img)"
            :disabled="busy.has(img.id)"
          />
          <select
            :value="img.categoryId || ''"
            @change="
              updateImage(img, {
                categoryId: $event.target.value
                  ? Number($event.target.value)
                  : null,
              })
            "
            class="flex-1 text-xs px-2.5 py-1.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="">Sans catégorie</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name.fr }}
            </option>
          </select>
          <input
            :value="img.order"
            type="number"
            @change="updateImage(img, { order: Number($event.target.value) })"
            class="w-14 text-xs px-2.5 py-1.5 border border-border rounded-lg text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"
      />
    </div>
    <div v-else-if="!images.length" class="py-16 text-center">
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
    <div v-else-if="!filteredImages.length" class="py-12 text-center">
      <p class="text-sm text-text-muted">Aucun résultat pour ce filtre</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
      <p class="text-xs text-text-muted">Page {{ page }} / {{ totalPages }}</p>
      <div class="flex gap-1">
        <button
          :disabled="page <= 1"
          @click="page--"
          class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
        >
          ← Précédent
        </button>
        <button
          :disabled="page >= totalPages"
          @click="page++"
          class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
        >
          Suivant →
        </button>
      </div>
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
          :key="previewUrl"
          :src="previewUrl"
          controls
          autoplay
          muted
          playsinline
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
        />
        <img
          v-else
          :src="previewUrl"
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        />
      </div>
    </Teleport>

    <!-- Category Modal -->
    <Teleport to="body">
      <div
        v-if="showCatModal"
        class="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        @click.self="showCatModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h3 class="text-lg font-bold text-text mb-4">
            {{ editingCat ? "Modifier la catégorie" : "Nouvelle catégorie" }}
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom FR *</label
              >
              <input
                v-model="catForm.name.fr"
                required
                maxlength="200"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                :class="fieldErrors.nameFr ? 'border-danger' : 'border-border'"
              />
              <FieldError :message="fieldErrors.nameFr" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom EN</label
              >
              <input
                v-model="catForm.name.en"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom AR</label
              >
              <input
                v-model="catForm.name.ar"
                dir="rtl"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Ordre</label
              >
              <input
                v-model.number="catForm.order"
                type="number"
                class="w-20 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showCatModal = false"
              class="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              Annuler
            </button>
            <button
              @click="saveCat"
              :disabled="!catForm.name.fr"
              class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
