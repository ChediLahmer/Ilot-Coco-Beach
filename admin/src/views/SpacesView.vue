<script setup>
import { ref, computed, onMounted } from "vue";
import { useApi } from "@/composables/useApi.js";
import AppToggle from "@/components/AppToggle.vue";
import AppModal from "@/components/AppModal.vue";

const api = useApi();
const spaces = ref([]);
const showModal = ref(false);
const editing = ref(null);
const form = ref(resetForm());
const imagePreview = ref(null);

const currentImage = computed(() => editing.value?.image || null);

function onFileChange(e) {
  const file = e.target.files[0];
  form.value.imageFile = file;
  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  } else {
    imagePreview.value = null;
  }
}

function resetForm() {
  return {
    name: { fr: "", en: "", ar: "" },
    description: { fr: "", en: "", ar: "" },
    price: 0,
    capacity: 2,
    available: true,
    order: 0,
    imageFile: null,
  };
}

async function loadData() {
  spaces.value = await api.get("/spaces/all");
}

onMounted(loadData);

function openModal(space = null) {
  editing.value = space;
  imagePreview.value = null;
  form.value = space
    ? {
        name: { ...space.name },
        description: { ...(space.description || { fr: "", en: "", ar: "" }) },
        price: Number(space.price),
        capacity: space.capacity,
        available: space.available,
        order: space.order,
        imageFile: null,
      }
    : { ...resetForm(), order: spaces.value.length };
  showModal.value = true;
}

async function save() {
  let imageUrl = editing.value?.image || null;
  if (form.value.imageFile) {
    const res = await api.upload("/upload", form.value.imageFile);
    imageUrl = res.url;
  }
  const payload = {
    name: form.value.name,
    description: form.value.description,
    price: Number(form.value.price),
    capacity: Number(form.value.capacity),
    available: form.value.available,
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
}

async function remove(space) {
  if (!confirm(`Supprimer "${space.name.fr}" ?`)) return;
  await api.del(`/spaces/${space.id}`);
  await loadData();
}

async function toggleAvailability(space) {
  await api.put(`/spaces/${space.id}`, { available: !space.available });
  await loadData();
}
</script>

<template>
  <div>
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

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="space in spaces"
        :key="space.id"
        class="bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
        :class="{ 'opacity-60': !space.available }"
      >
        <div
          v-if="space.image"
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
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-text">{{ space.name.fr }}</h3>
              <p class="text-sm text-text-muted mt-0.5">
                {{ space.capacity }} places · {{ space.price }} DT
              </p>
            </div>
            <AppToggle
              :model-value="space.available"
              @update:model-value="toggleAvailability(space)"
              class="shrink-0"
            />
          </div>
          <div
            class="flex items-center justify-between mt-4 pt-3 border-t border-border"
          >
            <span
              class="text-xs font-medium"
              :class="space.available ? 'text-success' : 'text-danger'"
            >
              {{ space.available ? "Disponible" : "Indisponible" }}
            </span>
            <div class="flex items-center gap-1">
              <button
                @click="openModal(space)"
                class="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
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
                class="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
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
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom EN</label
              >
              <input
                v-model="form.name.en"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Nom AR</label
              >
              <input
                v-model="form.name.ar"
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Prix (DT)</label
              >
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Capacité</label
              >
              <input
                v-model.number="form.capacity"
                type="number"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Ordre</label
              >
              <input
                v-model.number="form.order"
                type="number"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2.5 text-sm text-text cursor-pointer"
            >
              <AppToggle v-model="form.available" />
              Disponible
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
              <span class="text-xs text-text-muted">{{
                imagePreview ? "Nouvelle image" : "Image actuelle"
              }}</span>
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
            class="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
