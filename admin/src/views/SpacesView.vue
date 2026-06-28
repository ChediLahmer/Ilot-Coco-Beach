<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useApi } from "@/composables/useApi.js";
import { useFormValidation } from "@/composables/useFormValidation.js";
import { useToast } from "@/composables/useToast.js";
import { useConfirm } from "@/composables/useConfirm.js";
import FieldError from "@/components/FieldError.vue";
import AppToggle from "@/components/AppToggle.vue";
import AppModal from "@/components/AppModal.vue";

const {
  fieldErrors,
  clearErrors,
  validateRequired,
  validateMin,
  validateMaxLength,
  validateGreaterThan,
  hasErrors,
} = useFormValidation();

const api = useApi();
const toast = useToast();
const { confirm } = useConfirm();
const spaces = ref([]);
const totalItems = ref(0);
const showModal = ref(false);
const editing = ref(null);
const form = ref(resetForm());
const imagePreview = ref(null);
const previewIsVideo = ref(false);
const removeImage = ref(false);
const loading = ref(false);
const saving = ref(false);
const busy = ref(new Set());
const error = ref(null);

// Search, filter, sort, pagination
const searchQuery = ref("");
const filterStatus = ref("all");
const sortBy = ref("order");
const page = ref(1);
const ITEMS_PER_PAGE = 10;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / ITEMS_PER_PAGE)),
);

let debounceTimer = null;

function buildQuery() {
  const params = new URLSearchParams();
  params.set("page", page.value);
  params.set("limit", ITEMS_PER_PAGE);
  if (searchQuery.value.trim()) params.set("search", searchQuery.value.trim());
  if (filterStatus.value !== "all")
    params.set(
      "available",
      filterStatus.value === "available" ? "true" : "false",
    );
  if (sortBy.value !== "order") params.set("sort", sortBy.value);
  return params.toString();
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get(`/spaces?${buildQuery()}`);
    spaces.value = res.items;
    totalItems.value = res.total;
  } catch {
    error.value = "Erreur de chargement";
    toast.error("Erreur de chargement des espaces");
  } finally {
    loading.value = false;
  }
}

watch([filterStatus, sortBy, page], () => {
  if (!loading.value) loadData();
});
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    if (!loading.value) loadData();
  }, 300);
});

onMounted(loadData);

const currentImage = computed(() => {
  if (removeImage.value) return null;
  return editing.value?.image || null;
});

function isVideoMedia(url) {
  return typeof url === "string" && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function isProcessing(url) {
  return (
    typeof url === "string" &&
    (url.includes("/incoming/") || url.includes("%2Fincoming%2F"))
  );
}

async function retryProcessing() {
  try {
    await api.post("/upload/process-incoming");
    toast.success("Traitement relancé. Cela peut prendre un instant.");
  } catch (e) {
    toast.error(e?.message || "Échec du relancement du traitement");
  }
}

let processingTimer = null;
const hasProcessing = computed(() =>
  spaces.value.some((s) => isProcessing(s.image)),
);
watch(hasProcessing, (active) => {
  if (active && !processingTimer) {
    processingTimer = setInterval(() => loadData(), 5000);
  } else if (!active && processingTimer) {
    clearInterval(processingTimer);
    processingTimer = null;
  }
});
onUnmounted(() => {
  if (processingTimer) clearInterval(processingTimer);
});

const currentIsVideo = computed(() => isVideoMedia(currentImage.value));

function onFileChange(e) {
  const file = e.target.files[0];
  form.value.imageFile = file;
  if (file) {
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
    imagePreview.value = URL.createObjectURL(file);
    previewIsVideo.value = file.type.startsWith("video/");
    removeImage.value = false;
  } else {
    imagePreview.value = null;
    previewIsVideo.value = false;
  }
}

function clearImage() {
  removeImage.value = true;
  imagePreview.value = null;
  previewIsVideo.value = false;
  form.value.imageFile = null;
}

function resetForm() {
  return {
    name: { fr: "", en: "", ar: "" },
    description: { fr: "", en: "", ar: "" },
    price: 0,
    capacity: 2,
    available: true,
    visible: true,
    order: 0,
    imageFile: null,
  };
}

function openModal(space = null) {
  if (loading.value) return; // Prevent opening modal during loading
  editing.value = space;
  imagePreview.value = null;
  removeImage.value = false;
  form.value = space
    ? {
        name: { ...space.name },
        description: { ...(space.description || { fr: "", en: "", ar: "" }) },
        price: Number(space.price),
        capacity: space.capacity,
        available: space.available,
        visible: space.visible,
        order: space.order,
        imageFile: null,
      }
    : { ...resetForm(), order: spaces.value.length };
  showModal.value = true;
}

async function save() {
  clearErrors();
  // Validate name
  validateRequired(form.value.name.fr, "nameFr", "Nom (FR)");
  validateMaxLength(form.value.name.fr, "nameFr", "Nom (FR)", 200);
  validateMaxLength(form.value.name.en, "nameEn", "Nom (EN)", 200);
  validateMaxLength(form.value.name.ar, "nameAr", "Nom (AR)", 200);

  // Validate description
  validateMaxLength(
    form.value.description.fr,
    "descFr",
    "Description (FR)",
    2000,
  );
  validateMaxLength(
    form.value.description.en,
    "descEn",
    "Description (EN)",
    2000,
  );
  validateMaxLength(
    form.value.description.ar,
    "descAr",
    "Description (AR)",
    2000,
  );

  // Validate price and capacity
  validateGreaterThan(form.value.price, "price", "Prix", 0);
  validateGreaterThan(form.value.capacity, "capacity", "Capacité", 0);
  validateMin(form.value.order, "order", "Ordre", 0);

  if (hasErrors()) return;
  saving.value = true;
  error.value = null;
  let uploadedImageUrl = null;
  try {
    let imageUrl = editing.value?.image || null;
    if (removeImage.value) {
      imageUrl = null;
    } else if (form.value.imageFile) {
      const res = await api.upload("/upload", form.value.imageFile);
      imageUrl = res.url;
      if (imageUrl && imageUrl !== editing.value?.image) {
        uploadedImageUrl = imageUrl;
      }
    }
    const payload = {
      name: form.value.name,
      description: form.value.description,
      price: Number(form.value.price),
      capacity: Number(form.value.capacity),
      available: form.value.available,
      visible: form.value.visible,
      order: form.value.order,
      image: imageUrl,
    };
    if (editing.value) {
      await api.put(`/spaces/${editing.value.id}`, payload);
    } else {
      await api.post("/spaces", payload);
    }
    showModal.value = false;
    await loadData();
    toast.success(editing.value ? "Espace mis à jour" : "Espace créé");
  } catch (e) {
    if (uploadedImageUrl) {
      await api
        .post("/upload/cleanup", { url: uploadedImageUrl })
        .catch((err) => {
          console.error("Upload cleanup failed:", err);
        });
    }
    toast.error(
      e.response?.data?.message || e.message || "Erreur lors de la sauvegarde",
    );
  } finally {
    saving.value = false;
  }
}

async function remove(space) {
  const ok = await confirm({
    title: "Supprimer l'espace",
    message: `Êtes-vous sûr de vouloir supprimer "${space.name.fr}" ? Cette action est irréversible.`,
  });
  if (!ok) return;
  busy.value.add(space.id);
  try {
    await api.del(`/spaces/${space.id}`);
    await loadData();
    toast.success("Espace supprimé");
  } catch (e) {
    toast.error(
      e.response?.data?.message || e.message || "Erreur lors de la suppression",
    );
  } finally {
    busy.value.delete(space.id);
  }
}

async function toggleAvailability(space) {
  busy.value.add(space.id);
  try {
    await api.put(`/spaces/${space.id}`, { available: !space.available });
    await loadData();
    toast.success(
      space.available ? "Marqué indisponible" : "Marqué disponible",
    );
  } catch (e) {
    toast.error(
      e.response?.data?.message || e.message || "Erreur de mise à jour",
    );
  } finally {
    busy.value.delete(space.id);
  }
}

async function toggleVisible(space) {
  busy.value.add(space.id);
  try {
    await api.put(`/spaces/${space.id}`, { visible: !space.visible });
    await loadData();
    toast.success(space.visible ? "Masqué" : "Rendu visible");
  } catch (e) {
    toast.error(
      e.response?.data?.message || e.message || "Erreur de mise à jour",
    );
  } finally {
    busy.value.delete(space.id);
  }
}

onUnmounted(() => {
  clearTimeout(debounceTimer);
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});
</script>

<template>
  <div>
    <div
      v-if="error"
      class="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm flex items-center justify-between"
    >
      <span>{{ error }}</span>
      <div class="flex gap-3 ml-4 shrink-0">
        <button @click="loadData" class="underline font-medium">
          Réessayer
        </button>
        <button @click="error = null" class="underline opacity-70">
          Fermer
        </button>
      </div>
    </div>
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
    >
      <div>
        <h2 class="text-xl font-bold text-text">Espaces</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Gérer les espaces et leur disponibilité
        </p>
      </div>
      <button
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
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
        Nouvel espace
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs min-w-[160px]">
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
          placeholder="Rechercher un espace..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        />
      </div>
      <select
        v-model="filterStatus"
        class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
      >
        <option value="all">Tous</option>
        <option value="available">Disponibles</option>
        <option value="unavailable">Indisponibles</option>
      </select>
      <select
        v-model="sortBy"
        class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
      >
        <option value="order">Tri: Ordre</option>
        <option value="name">Tri: Nom</option>
        <option value="price">Tri: Prix</option>
        <option value="capacity">Tri: Capacité</option>
      </select>
      <p class="text-sm text-text-muted whitespace-nowrap">
        {{ totalItems }} espace(s)
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="space in spaces"
        :key="space.id"
        class="bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
        :class="{ 'opacity-60': !space.available }"
      >
        <div class="relative">
          <video
            v-if="space.image && isVideoMedia(space.image)"
            :src="space.image"
            class="h-36 w-full object-cover"
            muted
            loop
            playsinline
            preload="metadata"
          />
          <div
            v-else-if="space.image"
            class="h-36 bg-cover bg-center"
            :style="{ backgroundImage: `url(${space.image})` }"
          ></div>
          <div
            v-else
            class="h-36 bg-surface-alt flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-text-muted/40"
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
          </div>
          <div
            v-if="isProcessing(space.image)"
            class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-white text-xs font-medium"
          >
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>En cours de traitement…</span>
            <button
              type="button"
              @click.stop="retryProcessing"
              class="mt-1 rounded-md border border-white/40 px-2 py-0.5 text-[11px] font-medium hover:bg-white/10"
            >
              Relancer
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-text">{{ space.name.fr }}</h3>
              <p class="text-sm text-text-muted mt-0.5">
                {{ space.capacity }} places · {{ space.price }} DT
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-3">
            <label
              class="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer"
            >
              <AppToggle
                :model-value="space.available"
                :disabled="busy.has(space.id)"
                @update:model-value="toggleAvailability(space)"
              />
              Disponible
            </label>
            <label
              class="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer"
            >
              <AppToggle
                :model-value="space.visible"
                :disabled="busy.has(space.id)"
                @update:model-value="toggleVisible(space)"
              />
              Visible
            </label>
          </div>
          <div
            class="flex items-center justify-end mt-4 pt-3 border-t border-border"
          >
            <div class="flex items-center gap-1">
              <button
                @click="openModal(space)"
                class="p-2.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
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
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  />
                </svg>
              </button>
              <button
                @click="remove(space)"
                :disabled="busy.has(space.id)"
                class="p-2.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
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
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"
      />
    </div>
    <div
      v-else-if="!spaces.length && !searchQuery && filterStatus === 'all'"
      class="py-12 text-center text-text-muted text-sm"
    >
      Aucun espace pour le moment
    </div>
    <div
      v-else-if="!spaces.length"
      class="py-8 text-center text-text-muted text-sm"
    >
      Aucun résultat
    </div>
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
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

    <!-- Modal -->
    <AppModal :open="showModal" @close="showModal = false">
      <div class="p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-text">
            {{ editing ? "Modifier" : "Nouvel" }} espace
          </h3>
          <button
            @click="showModal = false"
            class="p-1.5 rounded-md text-text-muted hover:bg-surface-alt transition-colors"
          >
            <svg
              class="w-5 h-5"
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
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom FR *</label
              >
              <input
                v-model="form.name.fr"
                required
                maxlength="200"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.nameFr ? 'border-danger' : 'border-border'"
              />
              <p class="text-xs text-text-muted mt-1">
                Requis, max 200 caractères
              </p>
              <FieldError :message="fieldErrors.nameFr" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom EN</label
              >
              <input
                v-model="form.name.en"
                maxlength="200"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.nameEn ? 'border-danger' : 'border-border'"
              />
              <p class="text-xs text-text-muted mt-1">
                Optionnel, max 200 caractères
              </p>
              <FieldError :message="fieldErrors.nameEn" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom AR</label
              >
              <input
                v-model="form.name.ar"
                maxlength="200"
                dir="rtl"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.nameAr ? 'border-danger' : 'border-border'"
              />
              <p class="text-xs text-text-muted mt-1">
                Optionnel, max 200 caractères
              </p>
              <FieldError :message="fieldErrors.nameAr" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc FR</label
              >
              <textarea
                v-model="form.description.fr"
                maxlength="2000"
                rows="4"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
                :class="fieldErrors.descFr ? 'border-danger' : 'border-border'"
              ></textarea>
              <p class="text-xs text-text-muted mt-1">
                Optionnel, max 2000 caractères
              </p>
              <FieldError :message="fieldErrors.descFr" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc EN</label
              >
              <textarea
                v-model="form.description.en"
                maxlength="2000"
                rows="4"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
                :class="fieldErrors.descEn ? 'border-danger' : 'border-border'"
              ></textarea>
              <p class="text-xs text-text-muted mt-1">
                Optionnel, max 2000 caractères
              </p>
              <FieldError :message="fieldErrors.descEn" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc AR</label
              >
              <textarea
                v-model="form.description.ar"
                maxlength="2000"
                dir="rtl"
                rows="4"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
                :class="fieldErrors.descAr ? 'border-danger' : 'border-border'"
              ></textarea>
              <p class="text-xs text-text-muted mt-1">
                Optionnel, max 2000 caractères
              </p>
              <FieldError :message="fieldErrors.descAr" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Prix (DT/h) *</label
              >
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.price ? 'border-danger' : 'border-border'"
              />
              <p class="text-xs text-text-muted mt-1">> 0 DT, prix par heure</p>
              <FieldError :message="fieldErrors.price" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Capacité (personnes) *</label
              >
              <input
                v-model.number="form.capacity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="
                  fieldErrors.capacity ? 'border-danger' : 'border-border'
                "
              />
              <p class="text-xs text-text-muted mt-1">> 0 personnes</p>
              <FieldError :message="fieldErrors.capacity" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Ordre d'affichage</label
              >
              <input
                v-model.number="form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.order ? 'border-danger' : 'border-border'"
              />
              <p class="text-xs text-text-muted mt-1">
                0 = premier, puis croissant
              </p>
              <FieldError :message="fieldErrors.order" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2.5 text-sm text-text cursor-pointer"
            >
              <AppToggle v-model="form.available" />
              Disponible
            </label>
            <label
              class="flex items-center gap-2.5 text-sm text-text cursor-pointer"
            >
              <AppToggle v-model="form.visible" />
              Visible
            </label>
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1"
              >Image ou vidéo</label
            >
            <div
              v-if="currentImage || imagePreview"
              class="mb-3 flex items-center gap-3"
            >
              <video
                v-if="imagePreview ? previewIsVideo : currentIsVideo"
                :src="imagePreview || currentImage"
                class="h-24 w-36 rounded-lg object-cover border border-border"
                muted
                autoplay
                loop
                playsinline
              />
              <img
                v-else
                :src="imagePreview || currentImage"
                class="h-24 w-36 rounded-lg object-cover border border-border"
              />
              <div class="flex flex-col gap-1">
                <span class="text-xs text-text-muted">{{
                  imagePreview ? "Nouveau média" : "Média actuel"
                }}</span>
                <button
                  type="button"
                  @click="clearImage"
                  class="text-xs text-danger hover:text-red-700 font-medium transition-colors text-left"
                >
                  Supprimer le média
                </button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              @change="onFileChange"
              class="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:cursor-pointer hover:file:bg-primary/20 transition-colors"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-alt rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="save"
            :disabled="saving"
            class="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
          >
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
