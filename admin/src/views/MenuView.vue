<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useApi } from "@/composables/useApi.js";
import AppToggle from "@/components/AppToggle.vue";
import AppModal from "@/components/AppModal.vue";

const api = useApi();
const categories = ref([]);
const activeCategory = ref(null);
const showCatModal = ref(false);
const showItemModal = ref(false);
const editingCat = ref(null);
const editingItem = ref(null);

// Search, sort & pagination
const itemSearch = ref("");
const itemSort = ref("order");
const itemPage = ref(1);
const ITEMS_PER_PAGE = 10;

const catForm = ref({ name: { fr: "", en: "", ar: "" }, order: 0 });
const itemForm = ref({
  name: { fr: "", en: "", ar: "" },
  description: { fr: "", en: "", ar: "" },
  priceStandard: 0,
  priceExtra: 0,
  available: true,
  visible: true,
  order: 0,
  image: null,
});
const itemImagePreview = ref(null);
const removeItemImage = ref(false);

const currentItemImage = computed(() => {
  if (removeItemImage.value) return null;
  return editingItem.value?.image || null;
});

function onItemFileChange(e) {
  const file = e.target.files[0];
  itemForm.value.image = file;
  if (file) {
    itemImagePreview.value = URL.createObjectURL(file);
    removeItemImage.value = false;
  } else {
    itemImagePreview.value = null;
  }
}

function clearItemImage() {
  removeItemImage.value = true;
  itemImagePreview.value = null;
  itemForm.value.image = null;
}

const activeItems = computed(() => {
  const cat = categories.value.find((c) => c.id === activeCategory.value);
  return cat?.items || [];
});

const filteredItems = computed(() => {
  let items = activeItems.value;
  if (itemSearch.value.trim()) {
    const q = itemSearch.value.toLowerCase();
    items = items.filter(
      (item) =>
        (item.name.fr || "").toLowerCase().includes(q) ||
        (item.name.en || "").toLowerCase().includes(q) ||
        (item.name.ar || "").includes(q),
    );
  }
  return items;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / ITEMS_PER_PAGE)),
);

const paginatedItems = computed(() => {
  const start = (itemPage.value - 1) * ITEMS_PER_PAGE;
  return filteredItems.value.slice(start, start + ITEMS_PER_PAGE);
});

async function loadData() {
  const sort = itemSort.value !== "order" ? `?sort=${itemSort.value}` : "";
  categories.value = await api.get(`/menu/categories${sort}`);
  if (!activeCategory.value && categories.value.length) {
    activeCategory.value = categories.value[0].id;
  }
}

onMounted(loadData);
watch(itemSort, loadData);

function openCatModal(cat = null) {
  editingCat.value = cat;
  catForm.value = cat
    ? { name: { ...cat.name }, order: cat.order }
    : { name: { fr: "", en: "", ar: "" }, order: categories.value.length };
  showCatModal.value = true;
}

async function saveCat() {
  if (editingCat.value) {
    await api.put(`/menu/categories/${editingCat.value.id}`, catForm.value);
  } else {
    await api.post("/menu/categories", catForm.value);
  }
  showCatModal.value = false;
  await loadData();
}

async function deleteCat(cat) {
  if (!confirm(`Supprimer la catégorie "${cat.name.fr}" et tous ses plats ?`))
    return;
  await api.del(`/menu/categories/${cat.id}`);
  if (activeCategory.value === cat.id) activeCategory.value = null;
  await loadData();
}

function openItemModal(item = null) {
  editingItem.value = item;
  itemImagePreview.value = null;
  removeItemImage.value = false;
  itemForm.value = item
    ? {
        name: { ...item.name },
        description: { ...(item.description || { fr: "", en: "", ar: "" }) },
        priceStandard: Number(item.priceStandard),
        priceExtra: Number(item.priceExtra),
        available: item.available,
        visible: item.visible,
        order: item.order,
        image: null,
      }
    : {
        name: { fr: "", en: "", ar: "" },
        description: { fr: "", en: "", ar: "" },
        priceStandard: 0,
        priceExtra: 0,
        available: true,
        visible: true,
        order: activeItems.value.length,
        image: null,
      };
  showItemModal.value = true;
}

async function saveItem() {
  let imageUrl = editingItem.value?.image || null;
  if (removeItemImage.value) {
    imageUrl = null;
  } else if (itemForm.value.image) {
    const res = await api.upload("/upload", itemForm.value.image);
    imageUrl = res.url;
  }
  const payload = {
    name: itemForm.value.name,
    description: itemForm.value.description,
    priceStandard: Number(itemForm.value.priceStandard),
    priceExtra: Number(itemForm.value.priceExtra),
    available: itemForm.value.available,
    visible: itemForm.value.visible,
    order: itemForm.value.order,
    categoryId: activeCategory.value,
    image: imageUrl,
  };
  if (editingItem.value) {
    await api.put(`/menu/items/${editingItem.value.id}`, payload);
  } else {
    await api.post("/menu/items", payload);
  }
  showItemModal.value = false;
  await loadData();
}

async function deleteItem(item) {
  if (!confirm(`Supprimer "${item.name.fr}" ?`)) return;
  await api.del(`/menu/items/${item.id}`);
  await loadData();
}

async function toggleAvailability(item) {
  await api.put(`/menu/items/${item.id}`, { available: !item.available });
  await loadData();
}

async function toggleVisible(item) {
  await api.put(`/menu/items/${item.id}`, { visible: !item.visible });
  await loadData();
}
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-text">Menu / Carte</h1>
        <p class="mt-1 text-sm text-text-muted">
          Gérez vos catégories et articles
        </p>
      </div>
      <button
        @click="openCatModal()"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Catégorie
      </button>
    </div>

    <!-- Categories tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="group flex items-center shrink-0"
      >
        <button
          @click="
            activeCategory = cat.id;
            itemPage = 1;
            itemSearch = '';
          "
          class="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150"
          :class="
            activeCategory === cat.id
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-surface text-text-muted border-border hover:border-primary/40 hover:text-text'
          "
        >
          {{ cat.name.fr }}
        </button>
        <div
          class="ml-1 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <button
            @click="openCatModal(cat)"
            class="p-2 rounded text-text-muted hover:text-primary hover:bg-primary/5"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
          <button
            @click="deleteCat(cat)"
            class="p-2 rounded text-text-muted hover:text-danger hover:bg-danger/5"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Items table -->
    <div
      class="rounded-2xl border border-border bg-surface shadow-sm overflow-x-auto"
    >
      <div
        class="flex flex-wrap justify-between items-center gap-3 px-6 py-4 border-b border-border"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
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
              v-model="itemSearch"
              placeholder="Rechercher un plat..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              @input="itemPage = 1"
            />
          </div>
          <p class="text-sm text-text-muted whitespace-nowrap">
            {{ filteredItems.length }} article(s)
          </p>
          <select
            v-model="itemSort"
            class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
          >
            <option value="order">Tri: Ordre</option>
            <option value="name">Tri: Nom</option>
            <option value="price">Tri: Prix</option>
          </select>
        </div>
        <button
          @click="openItemModal()"
          :disabled="!activeCategory"
          class="inline-flex items-center gap-2 rounded-lg bg-success px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Article
        </button>
      </div>
      <table class="w-full text-sm">
        <thead
          class="bg-surface-alt text-left text-text-muted text-xs uppercase tracking-wider"
        >
          <tr>
            <th class="px-6 py-3 font-medium">Nom</th>
            <th class="px-6 py-3 font-medium">Standard</th>
            <th class="px-6 py-3 font-medium">Extra</th>
            <th class="px-6 py-3 font-medium">Disponible</th>
            <th class="px-6 py-3 font-medium">Visible</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="item in paginatedItems"
            :key="item.id"
            class="hover:bg-surface-alt/50 transition-colors"
          >
            <td
              class="px-6 py-3.5 font-medium text-text max-w-[200px] truncate"
            >
              {{ item.name.fr }}
            </td>
            <td class="px-6 py-3.5 text-text-muted">
              {{ item.priceStandard }} DT
            </td>
            <td class="px-6 py-3.5 text-text-muted">
              {{ item.priceExtra }} DT
            </td>
            <td class="px-6 py-3.5">
              <AppToggle
                :model-value="item.available"
                @update:model-value="toggleAvailability(item)"
              />
            </td>
            <td class="px-6 py-3.5">
              <AppToggle
                :model-value="item.visible"
                @update:model-value="toggleVisible(item)"
              />
            </td>
            <td class="px-6 py-3.5">
              <div class="flex gap-1">
                <button
                  @click="openItemModal(item)"
                  class="p-2.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteItem(item)"
                  class="p-2.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="!activeItems.length"
        class="px-6 py-12 text-center text-text-muted text-sm"
      >
        Aucun article dans cette catégorie
      </div>
      <div
        v-else-if="!filteredItems.length"
        class="px-6 py-8 text-center text-text-muted text-sm"
      >
        Aucun résultat pour "{{ itemSearch }}"
      </div>
      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-3 border-t border-border"
      >
        <p class="text-xs text-text-muted">
          Page {{ itemPage }} / {{ totalPages }}
        </p>
        <div class="flex gap-1">
          <button
            :disabled="itemPage <= 1"
            @click="itemPage--"
            class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <button
            :disabled="itemPage >= totalPages"
            @click="itemPage++"
            class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <AppModal
      :open="showCatModal"
      max-width="max-w-md"
      @close="showCatModal = false"
    >
      <div class="p-6">
        <h3 class="text-lg font-semibold text-text mb-5">
          {{ editingCat ? "Modifier la" : "Nouvelle" }} catégorie
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Nom FR *</label
            >
            <input
              v-model="catForm.name.fr"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Nom EN</label
            >
            <input
              v-model="catForm.name.en"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Nom AR</label
            >
            <input
              v-model="catForm.name.ar"
              dir="rtl"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Ordre d'affichage</label
            >
            <input
              v-model.number="catForm.order"
              type="number"
              class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            @click="showCatModal = false"
            class="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-alt rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveCat"
            class="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Item Modal -->
    <AppModal
      :open="showItemModal"
      max-width="max-w-xl"
      @close="showItemModal = false"
    >
      <div class="p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-text mb-5">
          {{ editingItem ? "Modifier l'" : "Nouvel " }}article
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Nom (trilingue)</label
            >
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                v-model="itemForm.name.fr"
                placeholder="Français *"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                v-model="itemForm.name.en"
                placeholder="English"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                v-model="itemForm.name.ar"
                placeholder="العربية"
                dir="rtl"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Description (trilingue)</label
            >
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <textarea
                v-model="itemForm.description.fr"
                rows="4"
                placeholder="Français"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y min-h-[5rem]"
              ></textarea>
              <textarea
                v-model="itemForm.description.en"
                rows="4"
                placeholder="English"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y min-h-[5rem]"
              ></textarea>
              <textarea
                v-model="itemForm.description.ar"
                rows="4"
                placeholder="العربية"
                dir="rtl"
                class="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y min-h-[5rem]"
              ></textarea>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5"
                >Prix Standard (DT)</label
              >
              <input
                v-model.number="itemForm.priceStandard"
                type="number"
                step="0.01"
                class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5"
                >Prix Extra (DT)</label
              >
              <input
                v-model.number="itemForm.priceExtra"
                type="number"
                step="0.01"
                class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5"
                >Ordre</label
              >
              <input
                v-model.number="itemForm.order"
                type="number"
                class="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div class="flex items-end pb-1">
              <label
                class="flex items-center gap-3 text-sm text-text cursor-pointer"
              >
                <AppToggle v-model="itemForm.available" />
                Disponible
              </label>
            </div>
            <div class="flex items-end pb-1">
              <label
                class="flex items-center gap-3 text-sm text-text cursor-pointer"
              >
                <AppToggle v-model="itemForm.visible" />
                Visible
              </label>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1.5"
              >Image</label
            >
            <div
              v-if="currentItemImage || itemImagePreview"
              class="mb-3 flex items-center gap-3"
            >
              <img
                :src="itemImagePreview || currentItemImage"
                class="h-20 w-20 rounded-lg object-cover border border-border"
              />
              <div class="flex flex-col gap-1">
                <span class="text-xs text-text-muted">{{
                  itemImagePreview ? "Nouvelle image" : "Image actuelle"
                }}</span>
                <button
                  type="button"
                  @click="clearItemImage"
                  class="text-xs text-danger hover:text-red-700 font-medium transition-colors text-left"
                >
                  Supprimer l'image
                </button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              @change="onItemFileChange"
              class="w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-surface-alt file:text-text hover:file:bg-border cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            @click="showItemModal = false"
            class="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-alt rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveItem"
            class="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
