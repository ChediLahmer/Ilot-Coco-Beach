<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useApi } from "@/composables/useApi.js";
import { useToast } from "@/composables/useToast.js";

const api = useApi();
const toast = useToast();
const stats = ref([]);
const selectedJob = ref(null);
const jobHistory = ref([]);
const totalItems = ref(0);
const loading = ref(false);
const page = ref(1);
const ITEMS_PER_PAGE = 15;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / ITEMS_PER_PAGE)),
);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDuration = (ms) => {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "text-success";
    case "error":
      return "text-danger";
    case "running":
      return "text-warning";
    default:
      return "text-text-muted";
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "success":
      return "bg-success/10 text-success";
    case "error":
      return "bg-danger/10 text-danger";
    case "running":
      return "bg-warning/10 text-warning";
    default:
      return "bg-border text-text-muted";
  }
};

const loadStats = async () => {
  try {
    const response = await api.get("/jobs/stats");
    stats.value = response.jobs || [];
  } catch (err) {
    toast.error("Failed to load job statistics");
  }
};

const selectJob = async (jobName) => {
  selectedJob.value = jobName;
  page.value = 1;
  await loadJobHistory();
};

const loadJobHistory = async () => {
  if (!selectedJob.value) return;
  loading.value = true;
  try {
    const offset = (page.value - 1) * ITEMS_PER_PAGE;
    const response = await api.get(`/jobs/${selectedJob.value}`, {
      limit: ITEMS_PER_PAGE,
      offset,
    });
    jobHistory.value = response.runs || [];
    totalItems.value = response.total || 0;
  } catch (err) {
    toast.error("Failed to load job history");
  } finally {
    loading.value = false;
  }
};

const refreshAll = async () => {
  await loadStats();
  if (selectedJob.value) {
    await loadJobHistory();
  }
};

let refreshInterval;

onMounted(() => {
  loadStats();
  // Refresh stats every 30 seconds
  refreshInterval = setInterval(loadStats, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-text">Tâches Programmées</h1>
        <p class="text-sm text-text-muted mt-1">
          Historique et statistiques des jobs du planificateur
        </p>
      </div>
      <button
        @click="refreshAll"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': loading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ loading ? "Chargement..." : "Rafraîchir" }}
      </button>
    </div>

    <!-- Job Statistics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div
        v-for="job in stats"
        :key="job.jobName"
        @click="selectJob(job.jobName)"
        class="p-4 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-all"
        :class="{ 'border-primary bg-primary/5': selectedJob === job.jobName }"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-semibold text-text">{{ job.jobName }}</h3>
            <p class="text-xs text-text-muted mt-0.5">
              {{ job.totalRuns }} exécution(s)
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <div class="p-2 bg-success/10 rounded">
            <p class="text-xs text-text-muted">Réussites</p>
            <p class="text-lg font-bold text-success">{{ job.successCount }}</p>
          </div>
          <div class="p-2 bg-danger/10 rounded">
            <p class="text-xs text-text-muted">Erreurs</p>
            <p class="text-lg font-bold text-danger">{{ job.errorCount }}</p>
          </div>
        </div>
        <div class="text-xs text-text-muted space-y-1">
          <p v-if="job.lastRun">Dernière: {{ formatDate(job.lastRun) }}</p>
          <p v-if="job.avgDurationMs">
            Durée moyenne: {{ formatDuration(job.avgDurationMs) }}
          </p>
          <p v-if="job.totalItemsProcessed">
            Total traité: {{ job.totalItemsProcessed }} item(s)
          </p>
        </div>
      </div>
    </div>

    <!-- Job History Table -->
    <div
      v-if="selectedJob"
      class="bg-surface rounded-xl border border-border shadow-sm"
    >
      <div class="px-6 py-4 border-b border-border">
        <h2 class="text-lg font-semibold text-text">
          Historique: {{ selectedJob }}
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-alt">
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Statut
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Début
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Fin
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Durée
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Items
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="jobHistory.length === 0"
              class="border-b border-border hover:bg-surface-alt transition-colors"
            >
              <td colspan="6" class="px-6 py-4 text-center text-text-muted">
                Aucun historique trouvé
              </td>
            </tr>
            <tr
              v-for="run in jobHistory"
              :key="run.id"
              class="border-b border-border hover:bg-surface-alt transition-colors"
            >
              <td class="px-6 py-3">
                <span
                  class="inline-block px-2.5 py-1 rounded text-xs font-medium"
                  :class="getStatusBadge(run.status)"
                >
                  {{ run.status }}
                </span>
              </td>
              <td class="px-6 py-3 text-xs">
                {{ formatDate(run.startedAt) }}
              </td>
              <td class="px-6 py-3 text-xs">
                {{ formatDate(run.completedAt) }}
              </td>
              <td class="px-6 py-3 text-xs font-mono">
                {{ formatDuration(run.durationMs) }}
              </td>
              <td class="px-6 py-3 text-xs font-mono">
                {{ run.itemsCount }}
              </td>
              <td class="px-6 py-3 text-xs">
                <span
                  v-if="run.errorMessage"
                  class="text-danger"
                  :title="run.errorMessage"
                >
                  {{ run.errorMessage.slice(0, 50)
                  }}{{ run.errorMessage.length > 50 ? "..." : "" }}
                </span>
                <span v-else class="text-text-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="px-6 py-4 border-t border-border flex items-center justify-between"
      >
        <p class="text-xs text-text-muted">
          Page {{ page }} / {{ totalPages }}
          <span v-if="totalItems > 0" class="ml-2"
            >{{ totalItems }} exécution(s)</span
          >
        </p>
        <div class="flex gap-1">
          <button
            :disabled="page <= 1"
            @click="
              page--;
              loadJobHistory();
            "
            class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <button
            :disabled="page >= totalPages"
            @click="
              page++;
              loadJobHistory();
            "
            class="px-4 py-2.5 text-xs rounded-lg border border-border hover:bg-surface-alt disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-surface rounded-xl border border-border p-8 text-center"
    >
      <p class="text-text-muted">
        Sélectionnez un job pour voir son historique
      </p>
    </div>
  </div>
</template>
