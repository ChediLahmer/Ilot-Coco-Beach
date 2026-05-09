<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/composables/useApi.js";
import { useToast } from "@/composables/useToast.js";
import AppToggle from "@/components/AppToggle.vue";

const api = useApi();
const toast = useToast();
const config = ref({});
const hours = ref({ fr: "", en: "", ar: "" });
const showReviews = ref(false);
const reviewStats = ref(null);
const saving = ref(false);
const saved = ref(false);
const uploading = ref("");
const loading = ref(false);
const error = ref(null);

const fields = [
  { key: "name", label: "Nom du site", type: "text" },
  { key: "email", label: "Email de contact", type: "email" },
  { key: "phone", label: "Téléphone", type: "text" },
  { key: "whatsapp", label: "WhatsApp (numéro)", type: "text" },
  { key: "instagram", label: "Instagram (URL)", type: "url" },
  { key: "messenger", label: "Messenger (URL)", type: "url" },
  { key: "facebook", label: "Facebook (URL)", type: "url" },
  { key: "tiktok", label: "TikTok (URL)", type: "url" },
  { key: "address", label: "Adresse", type: "text" },
  { key: "lat", label: "Latitude", type: "text" },
  { key: "lng", label: "Longitude", type: "text" },
  {
    key: "satisfaction_rate",
    label: "Taux de satisfaction (%)",
    type: "number",
  },
];

function isVideoUrl(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

const mediaFields = [
  {
    key: "hero_video_url",
    label: "Vidéo Hero (arrière-plan)",
    accept: "video/mp4,video/webm",
  },
  {
    key: "hero_poster_url",
    label: "Poster Hero (image de couverture)",
    accept: "image/*",
  },
  {
    key: "section_video_url",
    label: "Vidéo section (présentation)",
    accept: "video/mp4,video/webm",
  },
  {
    key: "section_poster_url",
    label: "Poster section vidéo",
    accept: "image/*",
  },
  {
    key: "about_image_1",
    label: "Image À propos 1 (grande, gauche)",
    accept: "image/*",
  },
  {
    key: "about_image_2",
    label: "Image À propos 2 (petite, droite)",
    accept: "image/*",
  },
];

async function uploadMedia(key, event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = key;
  try {
    const { url } = await api.upload("/upload", file);
    config.value[key] = url;
    await api.put(`/config/${key}`, { value: url });
    toast.success("Fichier téléversé");
  } catch (e) {
    toast.error(e.message || "Erreur lors de l'upload");
  }
  uploading.value = "";
}

async function removeMedia(key) {
  try {
    config.value[key] = "";
    await api.put(`/config/${key}`, { value: "" });
    toast.success("Média supprimé");
  } catch (e) {
    toast.error(e.message || "Erreur lors de la suppression");
  }
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    config.value = await api.get("/config");
    try {
      const parsed = JSON.parse(config.value.hours || "{}");
      if (typeof parsed === "object" && parsed !== null) {
        hours.value = {
          fr: parsed.fr || "",
          en: parsed.en || "",
          ar: parsed.ar || "",
        };
      } else {
        hours.value = { fr: config.value.hours || "", en: "", ar: "" };
      }
    } catch {
      hours.value = { fr: config.value.hours || "", en: "", ar: "" };
    }
    showReviews.value = config.value.show_reviews === "true";
    try {
      const res = await api.get("/reviews?limit=50");
      const items = res.items || [];
      const total = items.length;
      const avg = total
        ? (items.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : "0.0";
      const approved = items.filter((r) => r.visible).length;
      const pending = items.filter((r) => !r.visible).length;
      const recommend = total
        ? Math.round((items.filter((r) => r.rating >= 4).length / total) * 100)
        : 0;
      reviewStats.value = { total, avg, approved, pending, recommend };
    } catch {
      reviewStats.value = null;
    }
  } catch {
    error.value = "Erreur de chargement";
    toast.error("Erreur de chargement de la configuration");
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

async function save() {
  saving.value = true;
  saved.value = false;
  error.value = null;
  try {
    const payload = {};
    for (const field of fields) {
      if (config.value[field.key] !== undefined) {
        payload[field.key] = String(config.value[field.key]);
      }
    }
    payload.hours = JSON.stringify(hours.value);
    payload.show_reviews = showReviews.value ? "true" : "false";
    await api.put("/config", payload);
    saved.value = true;
    toast.success("Configuration enregistrée");
    setTimeout(() => (saved.value = false), 2000);
  } catch (e) {
    error.value = e.message || "Erreur lors de la sauvegarde";
    toast.error(e.message || "Erreur lors de la sauvegarde");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
    >
      <div>
        <h2 class="text-xl font-bold text-text">Configuration du site</h2>
        <p class="text-sm text-text-muted mt-0.5">
          Paramètres généraux affichés sur le site public
        </p>
      </div>
      <button
        @click="save"
        :disabled="saving"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
      >
        <svg
          v-if="!saving && !saved"
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        <svg
          v-if="saving"
          class="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
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
        <svg
          v-if="saved"
          class="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        {{
          saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"
        }}
      </button>
    </div>

    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Loading spinner -->
    <div
      v-if="loading && !Object.keys(config).length"
      class="flex items-center justify-center py-16"
    >
      <svg
        class="h-8 w-8 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
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
    </div>

    <template v-else>
      <div
        class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl"
      >
        <div class="divide-y divide-border">
          <div v-for="field in fields" :key="field.key" class="px-6 py-4">
            <label class="block text-sm font-medium text-text mb-1.5">{{
              field.label
            }}</label>
            <input
              v-model="config[field.key]"
              :type="field.type"
              :min="field.key === 'satisfaction_rate' ? 0 : undefined"
              :max="field.key === 'satisfaction_rate' ? 100 : undefined"
              class="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-surface"
            />
            <p
              v-if="field.key === 'satisfaction_rate' && reviewStats"
              class="mt-1.5 text-xs text-text-muted"
            >
              Valeur calculée (avis ≥ 4★) :
              <span class="font-semibold text-text"
                >{{ reviewStats.recommend }}%</span
              >
              — Laissez vide pour utiliser la valeur calculée automatiquement.
            </p>
          </div>
        </div>
      </div>

      <!-- Sections visibles -->
      <h3 class="text-lg font-bold text-text mt-8 mb-4">Sections du site</h3>
      <div
        class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl"
      >
        <div class="px-6 py-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-text">Section Avis clients</p>
            <p class="text-xs text-text-muted mt-0.5">
              Afficher la section avis et le lien vers la page avis sur la page
              d'accueil
            </p>
          </div>
          <AppToggle v-model="showReviews" />
        </div>
        <div
          v-if="reviewStats"
          class="px-6 py-4 border-t border-border bg-surface/50"
        >
          <p
            class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3"
          >
            Aperçu des avis
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="text-center">
              <p class="text-lg font-bold text-text">{{ reviewStats.total }}</p>
              <p class="text-[0.65rem] text-text-muted">Total</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-text">{{ reviewStats.avg }}</p>
              <p class="text-[0.65rem] text-text-muted">Note moy.</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-emerald-600">
                {{ reviewStats.approved }}
              </p>
              <p class="text-[0.65rem] text-text-muted">Approuvés</p>
            </div>
            <div class="text-center">
              <p
                class="text-lg font-bold"
                :class="reviewStats.pending ? 'text-amber-600' : 'text-text'"
              >
                {{ reviewStats.pending }}
              </p>
              <p class="text-[0.65rem] text-text-muted">En attente</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-text-muted text-center">
            {{ reviewStats.recommend }}% de recommandation
          </p>
        </div>
      </div>

      <!-- Horaires multilangues -->
      <h3 class="text-lg font-bold text-text mt-8 mb-4">Horaires</h3>
      <div
        class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl"
      >
        <div class="divide-y divide-border">
          <div class="px-6 py-4">
            <label class="block text-sm font-medium text-text mb-1.5"
              >Français</label
            >
            <input
              v-model="hours.fr"
              type="text"
              placeholder="Ex: Tous les jours 10h - 00h"
              class="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-surface"
            />
          </div>
          <div class="px-6 py-4">
            <label class="block text-sm font-medium text-text mb-1.5"
              >English</label
            >
            <input
              v-model="hours.en"
              type="text"
              placeholder="Ex: Every day 10am - 12am"
              class="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-surface"
            />
          </div>
          <div class="px-6 py-4">
            <label class="block text-sm font-medium text-text mb-1.5"
              >العربية</label
            >
            <input
              v-model="hours.ar"
              type="text"
              dir="rtl"
              placeholder="مثال: كل يوم 10 صباحًا - 12 مساءً"
              class="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-surface"
            />
          </div>
        </div>
      </div>

      <!-- Media uploads -->
      <h3 class="text-lg font-bold text-text mt-8 mb-4">Médias Hero</h3>
      <div
        class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl"
      >
        <div class="divide-y divide-border">
          <div v-for="mf in mediaFields" :key="mf.key" class="px-6 py-4">
            <label class="block text-sm font-medium text-text mb-1.5">{{
              mf.label
            }}</label>
            <div class="flex items-center gap-3">
              <label
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {{ uploading === mf.key ? "Upload..." : "Choisir un fichier" }}
                <input
                  type="file"
                  :accept="mf.accept"
                  class="hidden"
                  @change="uploadMedia(mf.key, $event)"
                  :disabled="uploading === mf.key"
                />
              </label>
              <span
                v-if="config[mf.key]"
                class="text-xs text-green-600 truncate max-w-[200px]"
                >✓ {{ config[mf.key].split("/").pop() }}</span
              >
              <button
                v-if="config[mf.key]"
                @click="removeMedia(mf.key)"
                class="text-xs text-danger hover:text-red-700 font-medium transition-colors"
              >
                Supprimer
              </button>
              <span v-else class="text-xs text-text-muted">Aucun fichier</span>
            </div>
            <div
              v-if="config[mf.key] && isVideoUrl(config[mf.key])"
              class="mt-3"
            >
              <video
                :src="config[mf.key]"
                class="w-full max-w-md rounded-lg border border-border aspect-video object-cover"
                controls
                muted
              />
            </div>
            <div
              v-else-if="config[mf.key] && !isVideoUrl(config[mf.key])"
              class="mt-3"
            >
              <img
                :src="config[mf.key]"
                class="w-full max-w-md rounded-lg border border-border aspect-video object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
