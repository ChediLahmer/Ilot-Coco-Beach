<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth.js";
import { useRouter, useRoute } from "vue-router";

const { logout } = useAuth();
const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(true);
const mobileMenuOpen = ref(false);

function handleLogout() {
  logout();
  router.push("/login");
}

function checkMobile() {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
    mobileMenuOpen.value = false;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});
onUnmounted(() => window.removeEventListener("resize", checkMobile));

const navItems = [
  { to: "/", label: "Tableau de bord", icon: "dashboard" },
  { to: "/menu", label: "Menu / Carte", icon: "menu" },
  { to: "/spaces", label: "Espaces", icon: "spaces" },
  { to: "/gallery", label: "Galerie", icon: "gallery" },
  { to: "/flash-sales", label: "Ventes flash", icon: "flash" },
  { to: "/vouchers", label: "Vouchers", icon: "vouchers" },
  { to: "/reviews", label: "Avis", icon: "reviews" },
  { to: "/config", label: "Configuration", icon: "config" },
];
</script>

<template>
  <div class="flex h-screen bg-surface-alt">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/50 md:hidden"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-sidebar text-white transition-all duration-300 fixed md:relative z-50 h-full"
      :class="[
        sidebarOpen ? 'w-64' : 'w-[4.5rem]',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm"
        >
          IC
        </div>
        <div v-show="sidebarOpen" class="overflow-hidden">
          <h1 class="text-sm font-semibold text-white truncate">
            Ilot Coco Beach
          </h1>
          <p class="text-[0.65rem] text-slate-400">Administration</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="mobileMenuOpen = false"
          class="group flex items-center gap-3 px-3 py-3 rounded-lg text-[0.8rem] font-medium transition-all duration-150"
          :class="[
            route.path === item.to
              ? 'bg-primary/20 text-primary-light'
              : 'text-slate-300 hover:bg-sidebar-hover hover:text-white',
          ]"
        >
          <!-- Icons -->
          <svg
            class="h-[1.15rem] w-[1.15rem] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.75"
          >
            <path
              v-if="item.icon === 'dashboard'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
            <path
              v-if="item.icon === 'menu'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
            <path
              v-if="item.icon === 'spaces'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z"
            />
            <path
              v-if="item.icon === 'gallery'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
            <path
              v-if="item.icon === 'flash'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
            <path
              v-if="item.icon === 'vouchers'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
            />
            <path
              v-if="item.icon === 'reviews'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
            <path
              v-if="item.icon === 'config'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <circle
              v-if="item.icon === 'config'"
              cx="12"
              cy="12"
              r="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-show="sidebarOpen" class="truncate">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Collapse toggle + Logout -->
      <div class="px-3 py-3 border-t border-white/10 space-y-1">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[0.8rem] text-slate-400 hover:bg-sidebar-hover hover:text-white transition-colors"
        >
          <svg
            class="h-[1.15rem] w-[1.15rem] shrink-0 transition-transform"
            :class="{ 'rotate-180': !sidebarOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.75"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
          <span v-show="sidebarOpen">Réduire</span>
        </button>
        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[0.8rem] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <svg
            class="h-[1.15rem] w-[1.15rem] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.75"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <span v-show="sidebarOpen">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden md:ml-0">
      <!-- Mobile header -->
      <div
        class="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden"
      >
        <button
          @click="mobileMenuOpen = true"
          class="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.75"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <span class="text-sm font-semibold text-text">Ilot Coco Beach</span>
      </div>
      <div class="p-4 sm:p-6 lg:p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>
