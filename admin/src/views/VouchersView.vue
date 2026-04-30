<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/composables/useApi.js";
import AppToggle from "@/components/AppToggle.vue";
import AppModal from "@/components/AppModal.vue";

const api = useApi();
const vouchers = ref([]);
const showModal = ref(false);
const editing = ref(null);
const form = ref(resetForm());

function resetForm() {
  return { code: "", discountPercent: 10, validUntil: "", isActive: true };
}

async function loadData() {
  const res = await api.get("/vouchers/all");
  vouchers.value = res.items || res;
}

onMounted(loadData);

function openModal(v = null) {
  editing.value = v;
  form.value = v
    ? {
        code: v.code,
        discountPercent: v.discountPercent,
        validUntil: v.validUntil.slice(0, 10),
        isActive: v.isActive,
      }
    : resetForm();
  showModal.value = true;
}

async function save() {
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
}

async function remove(v) {
  if (!confirm(`Supprimer le voucher "${v.code}" ?`)) return;
  await api.del(`/vouchers/${v.id}`);
  await loadData();
}

async function toggleActive(v) {
  await api.put(`/vouchers/${v.id}`, { isActive: !v.isActive });
  await loadData();
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR");
}
</script>

<template>
  <div>
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
                Statut
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
                />
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openModal(v)"
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
                    @click="remove(v)"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="!vouchers.length"
        class="py-12 text-center text-text-muted text-sm"
      >
        Aucun voucher pour le moment
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
              class="w-full px-3 py-2 border border-border rounded-lg uppercase font-mono tracking-wider focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="EX: SUMMER20"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Réduction (%)</label
              >
              <input
                v-model.number="form.discountPercent"
                type="number"
                min="1"
                max="100"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1"
                >Valide jusqu'au</label
              >
              <input
                v-model="form.validUntil"
                type="date"
                class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2.5 text-sm text-text cursor-pointer"
            >
              <AppToggle v-model="form.isActive" />
              Actif
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
            class="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
