<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/composables/useApi.js";

const api = useApi();
const stats = ref({
  categories: 0,
  items: 0,
  spaces: 0,
  flashSales: 0,
  vouchers: 0,
  gallery: 0,
});
const loading = ref(true);

onMounted(async () => {
  try {
    const [cats, spaces, sales, vouchers, galleryCount] = await Promise.all([
      api.get("/menu/categories"),
      api.get("/spaces?limit=1"),
      api.get("/flash-sales?limit=1"),
      api.get("/vouchers?limit=1"),
      api.get("/gallery/count"),
    ]);
    stats.value = {
      categories: cats.length,
      items: cats.reduce((sum, c) => sum + (c.items?.length || 0), 0),
      spaces: spaces.total || 0,
      flashSales: sales.total || 0,
      vouchers: vouchers.total || 0,
      gallery: galleryCount.total || 0,
    };
  } catch {
    /* ignore */
  } finally {
    loading.value = false;
  }
});

const cards = [
  {
    key: "categories",
    label: "Catégories",
    icon: "grid",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    key: "items",
    label: "Articles menu",
    icon: "list",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    key: "spaces",
    label: "Espaces",
    icon: "building",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    key: "flashSales",
    label: "Ventes flash",
    icon: "bolt",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    key: "vouchers",
    label: "Vouchers",
    icon: "ticket",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    key: "gallery",
    label: "Images",
    icon: "photo",
    gradient: "from-cyan-500 to-sky-600",
  },
];
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-text">Tableau de bord</h1>
      <p class="mt-1 text-sm text-text-muted">
        Vue d'ensemble de votre contenu
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="card in cards"
        :key="card.key"
        class="relative overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-text-muted">{{ card.label }}</p>
            <p
              class="mt-2 text-3xl font-bold text-text"
              :class="{ 'animate-pulse text-slate-300': loading }"
            >
              {{ loading ? "—" : stats[card.key] }}
            </p>
          </div>
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-black/5"
            :class="card.gradient"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="1.75"
            >
              <path
                v-if="card.icon === 'grid'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
              <path
                v-if="card.icon === 'list'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
              <path
                v-if="card.icon === 'building'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z"
              />
              <path
                v-if="card.icon === 'bolt'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
              <path
                v-if="card.icon === 'ticket'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
              />
              <path
                v-if="card.icon === 'photo'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        </div>
        <!-- Decorative subtle gradient -->
        <div
          class="absolute -bottom-6 -right-6 h-20 w-20 rounded-full opacity-5 bg-gradient-to-br"
          :class="card.gradient"
        ></div>
      </div>
    </div>

    <!-- Quick info -->
    <div class="mt-10 rounded-2xl border border-border bg-surface p-6">
      <h3 class="text-sm font-semibold text-text">Accès rapide</h3>
      <p class="mt-2 text-sm text-text-muted leading-relaxed">
        Gérez votre contenu depuis le menu latéral. Chaque section permet
        d'ajouter, modifier et supprimer vos éléments. Les modifications sont
        immédiatement visibles sur le site client.
      </p>
    </div>
  </div>
</template>
