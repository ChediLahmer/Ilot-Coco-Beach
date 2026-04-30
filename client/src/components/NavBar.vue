<template>
  <nav
    class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-charcoal/6"
  >
    <div
      class="absolute bottom-0 start-0 h-[2px] bg-ocean transition-[width] duration-150 ease-out"
      :style="{ width: scrollProgress + '%' }"
    />
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8"
    >
      <a href="/" class="shrink-0" @click.prevent="goHome">
        <p class="font-brand text-xl text-deep">{{ config.name }}</p>
      </a>

      <div class="hidden lg:flex items-center gap-8">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.path || '#' + link.id"
          class="text-[0.85rem] font-medium text-charcoal/60 hover:text-charcoal"
          @click.prevent="navigate(link)"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="hidden lg:flex items-center gap-4">
        <div class="flex items-center gap-1 border-r border-charcoal/10 pr-4">
          <button
            v-for="lang in langs"
            :key="lang"
            :class="[
              'px-2 py-1 text-xs font-medium uppercase',
              currentLang === lang
                ? 'text-ocean'
                : 'text-charcoal/40 hover:text-charcoal/70',
            ]"
            @click="switchLang(lang)"
          >
            {{ lang }}
          </button>
        </div>
        <a
          href="#reservation"
          class="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-dark"
          @click.prevent="scrollTo('reservation')"
        >
          {{ t("nav.reservation") }}
        </a>
      </div>

      <button
        class="flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/10 lg:hidden"
        @click="mobileOpen = true"
      >
        <svg
          class="h-5 w-5 text-charcoal/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-width="1.5"
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="mobile-nav">
        <div v-if="mobileOpen" class="fixed inset-0 z-[100] bg-white px-6 py-6">
          <div class="mx-auto flex h-full max-w-md flex-col">
            <div class="flex items-center justify-between">
              <p class="font-brand text-xl text-deep">{{ config.name }}</p>
              <button
                class="flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/10"
                @click="mobileOpen = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-width="1.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="flex flex-1 flex-col justify-center gap-6">
              <a
                v-for="link in navLinks"
                :key="link.key"
                :href="link.path || '#' + link.id"
                class="text-2xl font-medium text-deep"
                @click.prevent="
                  navigate(link);
                  mobileOpen = false;
                "
              >
                {{ link.label }}
              </a>
            </div>

            <div class="space-y-4 pb-4">
              <div class="flex items-center gap-2">
                <button
                  v-for="lang in langs"
                  :key="lang"
                  :class="[
                    'rounded-md border px-3 py-1.5 text-xs font-medium uppercase',
                    currentLang === lang
                      ? 'border-ocean/20 bg-ocean/5 text-ocean'
                      : 'border-charcoal/10 text-charcoal/50',
                  ]"
                  @click="switchLang(lang)"
                >
                  {{ lang }}
                </button>
              </div>
              <a
                href="#reservation"
                class="block w-full rounded-md bg-ocean py-3 text-center text-sm font-semibold text-white"
                @click.prevent="
                  scrollTo('reservation');
                  mobileOpen = false;
                "
              >
                {{ t("nav.reservation") }}
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { setLanguage } from "@/i18n";
import { useConfig } from "@/composables/useConfig";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const config = useConfig();

const mobileOpen = ref(false);
const scrollProgress = ref(0);
const currentLang = computed(() => locale.value);
const langs = ["fr", "ar", "en"];

function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0;
}

onMounted(() =>
  window.addEventListener("scroll", updateProgress, { passive: true }),
);
onUnmounted(() => window.removeEventListener("scroll", updateProgress));

const navLinks = computed(() => [
  { key: "home", id: "hero", label: t("nav.home") },
  { key: "experience", path: "/spaces", label: t("nav.experience") },
  { key: "menu", path: "/menu", label: t("nav.menu") },
  { key: "gallery", path: "/gallery", label: t("nav.gallery") },
  { key: "reservation", id: "reservation", label: t("nav.reservation") },
  { key: "contact", id: "contact", label: t("nav.contact") },
]);

function goHome() {
  if (route.path === "/") {
    scrollTo("hero");
    return;
  }

  router.push("/");
}

function scrollTo(id) {
  if (route.path === "/") {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    return;
  }

  router.push(id === "hero" ? { path: "/" } : { path: "/", hash: `#${id}` });
}

function navigate(link) {
  if (link.path) {
    if (route.path === link.path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(link.path);
    return;
  }

  scrollTo(link.id);
}

function switchLang(lang) {
  setLanguage(lang);
}
</script>

<style scoped>
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.25s ease;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}
</style>
