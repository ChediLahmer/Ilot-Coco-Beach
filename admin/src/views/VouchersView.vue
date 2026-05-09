<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useApi } from "@/composables/useApi.js";
import { useFormValidation } from "@/composables/useFormValidation.js";
import { useToast } from "@/composables/useToast.js";
import { useConfirm } from "@/composables/useConfirm.js";
import FieldError from "@/components/FieldError.vue";
import AppToggle from "@/components/AppToggle.vue";
import AppModal from "@/components/AppModal.vue";
import DateTimeInput from "@/components/DateTimeInput.vue";

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
const vouchers = ref([]);
const totalItems = ref(0);
const showModal = ref(false);
const editing = ref(null);
const form = ref(resetForm());
const loading = ref(false);
const saving = ref(false);
const busy = ref(new Set());
const error = ref(null);

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
    const res = await api.get(`/vouchers?${buildQuery()}`);
    vouchers.value = res.items;
    totalItems.value = res.total;
  } catch {
    error.value = "Erreur de chargement";
    toast.error("Erreur de chargement des vouchers");
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

function resetForm() {
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 30);
  defaultExpiry.setHours(23, 59, 0, 0);
  const expiryIso = defaultExpiry.toISOString().slice(0, 16);

  return {
    code: "",
    discountPercent: 10,
    validUntil: expiryIso,
    isActive: true,
    visible: true,
  };
}

onMounted(loadData);

function openModal(v = null) {
  editing.value = v;
  form.value = v
    ? {
        code: v.code,
        discountPercent: v.discountPercent,
        validUntil: v.validUntil
          ? new Date(v.validUntil).toISOString().slice(0, 16)
          : "",
        isActive: v.isActive,
        visible: v.visible,
      }
    : resetForm();
  showModal.value = true;
}

async function save() {
  clearErrors();
  validateRequired(form.value.code, "code", "Code");
  validateRequired(form.value.validUntil, "validUntil", "Date de validité");
  validateMin(form.value.discountPercent, "discountPercent", "Réduction", 0);
  validateMax(form.value.discountPercent, "discountPercent", "Réduction", 100);
  if (hasErrors()) return;
  saving.value = true;
  error.value = null;
  try {
    const payload = {
      ...form.value,
      discountPercent: Number(form.value.discountPercent),
    };
    if (editing.value) {
      await api.put(`/vouchers/${editing.value.id}`, payload);
    } else {
      await api.post("/vouchers", payload);
    }
    showModal.value = false;
    await loadData();
    toast.success(editing.value ? "Voucher mis à jour" : "Voucher créé");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la sauvegarde");
  } finally {
    saving.value = false;
  }
}

async function remove(v) {
  const ok = await confirm({
    title: "Supprimer le voucher",
    message: `Êtes-vous sûr de vouloir supprimer le voucher "${v.code}" ? Cette action est irréversible.`,
  });
  if (!ok) return;
  busy.value.add(v.id);
  try {
    await api.del(`/vouchers/${v.id}`);
    await loadData();
    toast.success("Voucher supprimé");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la suppression");
  } finally {
    busy.value.delete(v.id);
  }
}

async function toggleActive(v) {
  busy.value.add(v.id);
  try {
    await api.put(`/vouchers/${v.id}`, { isActive: !v.isActive });
    await loadData();
    toast.success(v.isActive ? "Désactivé" : "Activé");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  } finally {
    busy.value.delete(v.id);
  }
}

async function toggleVisible(v) {
  busy.value.add(v.id);
  try {
    await api.put(`/vouchers/${v.id}`, { visible: !v.visible });
    await loadData();
    toast.success(v.visible ? "Masqué" : "Rendu visible");
  } catch (e) {
    toast.error(e.message || "Erreur de mise à jour");
  } finally {
    busy.value.delete(v.id);
  }
}

onUnmounted(() => clearTimeout(debounceTimer));

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR");
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
        <h2 class="text-xl font-bold text-text">Vouchers</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Gérer les codes promotionnels
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
        Nouveau voucher
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
            placeholder="Rechercher par code..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
          />
        </div>
        <select
          v-model="filterStatus"
          class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select
          v-model="sortBy"
          class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        >
          <option value="date">Tri: Date</option>
          <option value="code">Tri: Code</option>
          <option value="discount">Tri: Réduction</option>
        </select>
        <p class="text-sm text-text-muted whitespace-nowrap">
          {{ totalItems }} voucher(s)
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-alt">
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Code
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Réduction
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Valide jusqu'au
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
              v-for="v in vouchers"
              :key="v.id"
              class="hover:bg-surface-alt/50 transition-colors"
              :class="{ 'opacity-50': !v.isActive }"
            >
              <td
                class="px-5 py-3.5 font-mono font-semibold text-text tracking-wide"
              >
                {{ v.code }}
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent"
                  >-{{ v.discountPercent }}%</span
                >
              </td>
              <td class="px-5 py-3.5 text-text-muted">
                {{ formatDate(v.validUntil) }}
              </td>
              <td class="px-5 py-3.5">
                <AppToggle
                  :model-value="v.isActive"
                  @update:model-value="toggleActive(v)"
                  :disabled="busy.has(v.id)"
                />
              </td>
              <td class="px-5 py-3.5">
                <AppToggle
                  :model-value="v.visible"
                  @update:model-value="toggleVisible(v)"
                  :disabled="busy.has(v.id)"
                />
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openModal(v)"
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
                    @click="remove(v)"
                    :disabled="busy.has(v.id)"
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
        v-else-if="!vouchers.length && !searchQuery && filterStatus === 'all'"
        class="py-12 text-center text-text-muted text-sm"
      >
        Aucun voucher pour le moment
      </div>
      <div
        v-else-if="!vouchers.length"
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
    <AppModal :open="showModal" max-width="max-w-md" @close="showModal = false">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-text">
            {{ editing ? "Modifier" : "Nouveau" }} voucher
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
          <div>
            <label class="block text-xs font-medium text-text-muted mb-1"
              >Code *</label
            >
            <input
              v-model="form.code"
              required
              maxlength="50"
              class="w-full px-3 py-2 border rounded-lg uppercase font-mono tracking-wider focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              :class="fieldErrors.code ? 'border-danger' : 'border-border'"
              placeholder="EX: SUMMER20"
            />
            <FieldError :message="fieldErrors.code" />
          </div>
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
                fieldErrors.discountPercent ? 'border-danger' : 'border-border'
              "
            />
            <FieldError :message="fieldErrors.discountPercent" />
          </div>
          <DateTimeInput
            v-model="form.validUntil"
            label="Valide jusqu'au"
            :error="fieldErrors.validUntil"
            required
          />
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
