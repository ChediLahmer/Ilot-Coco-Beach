<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useApi } from "@/composables/useApi.js";
import AppToggle from "@/components/AppToggle.vue";

const api = useApi();
const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const nextCursor = ref(null);
const hasMore = ref(true);

const searchQuery = ref("");
const filterRating = ref("all");

let debounceTimer = null;

const filteredReviews = computed(() => {
  let list = reviews.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q),
    );
  }
  if (filterRating.value !== "all") {
    list = list.filter((r) => r.rating === Number(filterRating.value));
  }
  return list;
});

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    reviews.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    let cursor = null;
    let all = [];
    let iterations = 0;
    while (hasMore.value && iterations < 20) {
      const res = await api.get(
        `/reviews?limit=50${cursor ? `&cursor=${cursor}` : ""}`,
      );
      all = [...all, ...res.items];
      cursor = res.nextCursor;
      hasMore.value = !!res.nextCursor;
      nextCursor.value = res.nextCursor;
      iterations++;
    }
    reviews.value = all;
  } catch (e) {
    error.value = "Impossible de charger les avis";
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
onUnmounted(() => clearTimeout(debounceTimer));

async function remove(r) {
  if (!confirm(`Supprimer l'avis de "${r.userName}" ?`)) return;
  try {
    await api.del(`/reviews/${r.id}`);
    await loadData();
  } catch {
    error.value = "Erreur lors de la suppression";
  }
}

async function toggleVisible(r) {
  try {
    await api.put(`/reviews/${r.id}`, { visible: !r.visible });
    await loadData();
  } catch {
    error.value = "Erreur lors de la mise à jour";
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
    >
      <div>
        <h2 class="text-xl font-bold text-text">Avis clients</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Modérer les avis et commentaires
        </p>
      </div>
      <p class="text-sm text-text-muted">{{ reviews.length }} avis au total</p>
    </div>

    <div
      v-if="error"
      class="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ error }}
      <button @click="loadData" class="ml-2 underline">Réessayer</button>
    </div>

    <div
      class="bg-surface rounded-xl border border-border overflow-hidden shadow-sm"
    >
      <div
        class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 px-4 sm:px-5 py-4 border-b border-border"
      >
        <div class="relative flex-1 max-w-xs min-w-[140px]">
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
            placeholder="Rechercher un avis..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
          />
        </div>
        <select
          v-model="filterRating"
          class="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-surface"
        >
          <option value="all">Toutes les notes</option>
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="3">★★★☆☆ (3)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="1">★☆☆☆☆ (1)</option>
        </select>
        <p class="text-sm text-text-muted whitespace-nowrap">
          {{ filteredReviews.length }} résultat(s)
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"
        />
      </div>

      <div
        v-else-if="filteredReviews.length === 0"
        class="py-12 text-center text-text-muted text-sm"
      >
        Aucun avis trouvé
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="review in filteredReviews"
          :key="review.id"
          class="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4"
          :class="{ 'opacity-50': !review.visible }"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <p class="font-semibold text-text text-sm">
                {{ review.userName }}
              </p>
              <span class="text-coral text-sm tracking-wider">{{
                stars(review.rating)
              }}</span>
              <span class="text-xs text-text-muted">{{
                formatDate(review.createdAt)
              }}</span>
            </div>
            <p class="mt-2 text-sm text-text-muted leading-relaxed">
              {{ review.comment }}
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <AppToggle
              :modelValue="review.visible"
              @update:modelValue="toggleVisible(review)"
              label="Visible"
            />
            <button
              @click="remove(review)"
              class="p-2 rounded text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
              title="Supprimer"
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
    </div>
  </div>
</template>
