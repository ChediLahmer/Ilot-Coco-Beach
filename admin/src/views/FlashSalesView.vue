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
  validateMax,
  hasErrors,
} = useFormValidation();

const api = useApi();
const toast = useToast();
const { confirm } = useConfirm();
const sales = ref([]);
const totalItems = ref(0);
const showModal = ref(false);
const editing = ref(null);
const form = ref(resetForm());
const imagePreview = ref(null);
const removeImage = ref(false);
const loading = ref(false);
const saving = ref(false);
const busy = ref(new Set());
const error = ref(null);
const menuItems = ref([]);
const spaces = ref([]);
const targetType = ref("none"); // "none" | "menuItem" | "space"

// Search, filter, sort, pagination
const searchQuery = ref("");
const filterStatus = ref("all");
const sortBy = ref("date");
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
    params.set("active", filterStatus.value === "active" ? "true" : "false");
  if (sortBy.value !== "date") params.set("sort", sortBy.value);
  return params.toString();
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get(`/flash-sales?${buildQuery()}`);
    sales.value = res.items;
    totalItems.value = res.total;
  } catch {
    error.value = "Erreur de chargement";
    toast.error("Erreur de chargement des ventes flash");
  } finally {
    loading.value = false;
  }
}

watch([filterStatus, sortBy, page], loadData);
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 300);
});

onMounted(() => {
  loadData();
  loadTargets();
});

async function loadTargets() {
  try {
    const [menuRes, spacesRes] = await Promise.all([
      api.get("/menu/categories"),
      api.get("/spaces?limit=100"),
    ]);
    menuItems.value = menuRes.flatMap((cat) =>
      (cat.items || []).map((item) => ({
        ...item,
        categoryName: cat.name?.fr || "",
      })),
    );
    spaces.value = spacesRes.items || [];
  } catch {
    /* non-blocking */
  }
}

const currentImage = computed(() => {
  if (removeImage.value) return null;
  return editing.value?.image || null;
});

function onFileChange(e) {
  const file = e.target.files[0];
  form.value.imageFile = file;
  if (file) {
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
    imagePreview.value = URL.createObjectURL(file);
    removeImage.value = false;
  } else {
    imagePreview.value = null;
  }
}

function clearImage() {
  removeImage.value = true;
  imagePreview.value = null;
  form.value.imageFile = null;
}

function resetForm() {
  return {
    title: { fr: "", en: "", ar: "" },
    description: { fr: "", en: "", ar: "" },
    discountPercent: 10,
    endsAt: "",
    isActive: true,
    visible: true,
    imageFile: null,
    menuItemId: null,
    spaceId: null,
  };
}

function openModal(sale = null) {
  editing.value = sale;
  imagePreview.value = null;
  removeImage.value = false;
  form.value = sale
    ? {
        title: { ...sale.title },
        description: { ...sale.description },
        discountPercent: sale.discountPercent,
        endsAt: (sale.endsAt || "").slice(0, 16),
        isActive: sale.isActive,
        visible: sale.visible,
        imageFile: null,
        menuItemId: sale.menuItemId || null,
        spaceId: sale.spaceId || null,
      }
    : resetForm();
  targetType.value = sale?.menuItemId
    ? "menuItem"
    : sale?.spaceId
      ? "space"
      : "none";
  showModal.value = true;
}

async function save() {
  clearErrors();
  validateRequired(form.value.title.fr, "titleFr", "Titre (FR)");
  validateRequired(form.value.endsAt, "endsAt", "Date d'expiration");
  validateMin(form.value.discountPercent, "discountPercent", "Réduction", 0);
  validateMax(form.value.discountPercent, "discountPercent", "Réduction", 100);
  if (hasErrors()) return;
  saving.value = true;
  error.value = null;
  try {
    let imageUrl = editing.value?.image || null;
    if (removeImage.value) {
      imageUrl = null;
    } else if (form.value.imageFile) {
      const res = await api.upload("/upload", form.value.imageFile);
      imageUrl = res.url;
    }
    const payload = {
      title: form.value.title,
      description: form.value.description,
      discountPercent: Number(form.value.discountPercent),
      endsAt: new Date(form.value.endsAt).toISOString(),
      isActive: form.value.isActive,
      visible: form.value.visible,
      image: imageUrl,
      menuItemId:
        targetType.value === "menuItem" ? form.value.menuItemId : null,
      spaceId: targetType.value === "space" ? form.value.spaceId : null,
    };
    if (editing.value) {
      await api.put(`/flash-sales/${editing.value.id}`, payload);
    } else {
      await api.post("/flash-sales", payload);
    }
    showModal.value = false;
    await loadData();
    toast.success(
      editing.value ? "Vente flash mise à jour" : "Vente flash créée",
    );
  } catch (e) {
    toast.error(e.message || "Erreur lors de la sauvegarde");
  } finally {
    saving.value = false;
  }
}

async function remove(sale) {
  const ok = await confirm({
    title: "Supprimer la vente flash",
    message: `Êtes-vous sûr de vouloir supprimer "${sale.title.fr}" ? Cette action est irréversible.`,
  });
  if (!ok) return;
  busy.value.add(sale.id);
  try {
    await api.del(`/flash-sales/${sale.id}`);
    await loadData();
    toast.success("Vente flash supprimée");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la suppression");
  } finally {
    busy.value.delete(sale.id);
  }
}

async function toggleActive(sale) {
  busy.value.add(sale.id);
  try {
    await api.put(`/flash-sales/${sale.id}`, { isActive: !sale.isActive });
    await loadData();
    toast.success(sale.isActive ? "Désactivée" : "Activée");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  } finally {
    busy.value.delete(sale.id);
  }
}

async function toggleVisible(sale) {
  busy.value.add(sale.id);
  try {
    await api.put(`/flash-sales/${sale.id}`, { visible: !sale.visible });
    await loadData();
    toast.success(sale.visible ? "Masquée" : "Rendue visible");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  } finally {
    busy.value.delete(sale.id);
  }
}

onUnmounted(() => {
  clearTimeout(debounceTimer);
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});

function formatDate(d) {
  return new Date(d).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
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
        <h2 class="text-xl font-bold text-text">Ventes Flash</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Gérer les offres promotionnelles à durée limitée
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
        Nouvelle vente flash
      </button>
    </div>

    <div
      class="bg-surface rounded-xl border border-border overflow-hidden shadow-sm"
    >
      <!-- Toolbar -->
      <div
        class="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border"
      >
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
            placeholder="Rechercher..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
          />
        </div>
        <select
          v-model="filterStatus"
          class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        >
          <option value="all">Tous</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
        <select
          v-model="sortBy"
          class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        >
          <option value="date">Tri: Date</option>
          <option value="title">Tri: Titre</option>
          <option value="discount">Tri: Réduction</option>
        </select>
        <p class="text-sm text-text-muted whitespace-nowrap">
          {{ totalItems }} résultat(s)
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-alt">
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Titre
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Réduction
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Expire
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Disponible
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Visible
              </th>
              <th
                class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="sale in sales"
              :key="sale.id"
              class="hover:bg-surface-alt/50 transition-colors"
              :class="{ 'opacity-50': !sale.isActive }"
            >
              <td class="px-5 py-3.5 font-medium text-text">
                {{ sale.title.fr }}
                <span
                  v-if="sale.menuItem"
                  class="block text-xs text-text-muted font-normal"
                >
                  Plat : {{ sale.menuItem.name?.fr }} ({{
                    sale.menuItem.priceStandard
                  }}
                  DT)
                </span>
                <span
                  v-else-if="sale.space"
                  class="block text-xs text-text-muted font-normal"
                >
                  Espace : {{ sale.space.name?.fr }} ({{ sale.space.price }} DT)
                </span>
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent"
                  >-{{ sale.discountPercent }}%</span
                >
              </td>
              <td class="px-5 py-3.5 text-text-muted">
                {{ formatDate(sale.endsAt) }}
              </td>
              <td class="px-5 py-3.5">
                <AppToggle
                  :model-value="sale.isActive"
                  @update:model-value="toggleActive(sale)"
                  :disabled="busy.has(sale.id)"
                />
              </td>
              <td class="px-5 py-3.5">
                <AppToggle
                  :model-value="sale.visible"
                  @update:model-value="toggleVisible(sale)"
                  :disabled="busy.has(sale.id)"
                />
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openModal(sale)"
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
                    @click="remove(sale)"
                    :disabled="busy.has(sale.id)"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"
        />
      </div>
      <div
        v-else-if="!sales.length && !searchQuery && filterStatus === 'all'"
        class="py-12 text-center text-text-muted text-sm"
      >
        Aucune vente flash pour le moment
      </div>
      <div
        v-else-if="!sales.length"
        class="py-8 text-center text-text-muted text-sm"
      >
        Aucun résultat
      </div>
      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-border"
      >
        <p class="text-xs text-text-muted">
          Page {{ page }} / {{ totalPages }}
        </p>
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
    </div>

    <!-- Modal -->
    <AppModal :open="showModal" @close="showModal = false">
      <div class="p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-text">
            {{ editing ? "Modifier" : "Nouvelle" }} vente flash
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
                >Titre FR *</label
              >
              <input
                v-model="form.title.fr"
                required
                maxlength="200"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.titleFr ? 'border-danger' : 'border-border'"
              />
              <FieldError :message="fieldErrors.titleFr" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Titre EN</label
              >
              <input
                v-model="form.title.en"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Titre AR</label
              >
              <input
                v-model="form.title.ar"
                dir="rtl"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc FR</label
              >
              <textarea
                v-model="form.description.fr"
                rows="4"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc EN</label
              >
              <textarea
                v-model="form.description.en"
                rows="4"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Desc AR</label
              >
              <textarea
                v-model="form.description.ar"
                dir="rtl"
                rows="4"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y min-h-[5rem]"
              ></textarea>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Réduction (%)</label
              >
              <input
                v-model.number="form.discountPercent"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="
                  fieldErrors.discountPercent
                    ? 'border-danger'
                    : 'border-border'
                "
              />
              <FieldError :message="fieldErrors.discountPercent" />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Expire le</label
              >
              <input
                v-model="form.endsAt"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :class="fieldErrors.endsAt ? 'border-danger' : 'border-border'"
              />
              <FieldError :message="fieldErrors.endsAt" />
            </div>
          </div>
          <div class="space-y-3">
            <label class="block text-xs font-medium text-text-muted"
              >Appliquer à</label
            >
            <div class="flex gap-3">
              <button
                type="button"
                @click="
                  targetType = 'none';
                  form.menuItemId = null;
                  form.spaceId = null;
                "
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="
                  targetType === 'none'
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-muted hover:bg-surface-alt'
                "
              >
                Général
              </button>
              <button
                type="button"
                @click="
                  targetType = 'menuItem';
                  form.spaceId = null;
                "
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="
                  targetType === 'menuItem'
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-muted hover:bg-surface-alt'
                "
              >
                Plat du menu
              </button>
              <button
                type="button"
                @click="
                  targetType = 'space';
                  form.menuItemId = null;
                "
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="
                  targetType === 'space'
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-muted hover:bg-surface-alt'
                "
              >
                Espace
              </button>
            </div>
            <div v-if="targetType === 'menuItem'">
              <select
                v-model="form.menuItemId"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
              >
                <option :value="null">-- Choisir un plat --</option>
                <option
                  v-for="item in menuItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.categoryName }} › {{ item.name?.fr || "—" }} ({{
                    item.priceStandard
                  }}
                  DT)
                </option>
              </select>
            </div>
            <div v-if="targetType === 'space'">
              <select
                v-model="form.spaceId"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
              >
                <option :value="null">-- Choisir un espace --</option>
                <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                  {{ sp.name?.fr || "—" }} ({{ sp.price }} DT)
                </option>
              </select>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2.5 text-sm text-text cursor-pointer"
            >
              <AppToggle v-model="form.isActive" />
              Actif
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
              >Image</label
            >
            <div
              v-if="currentImage || imagePreview"
              class="mb-3 flex items-center gap-3"
            >
              <img
                :src="imagePreview || currentImage"
                class="h-24 w-36 rounded-lg object-cover border border-border"
              />
              <div class="flex flex-col gap-1">
                <span class="text-xs text-text-muted">{{
                  imagePreview ? "Nouvelle image" : "Image actuelle"
                }}</span>
                <button
                  type="button"
                  @click="clearImage"
                  class="text-xs text-danger hover:text-red-700 font-medium transition-colors text-left"
                >
                  Supprimer l'image
                </button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
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
