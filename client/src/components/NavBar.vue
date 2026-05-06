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
        <p
          v-if="config.phone"
          class="text-[0.7rem] text-charcoal/50 font-medium"
        >
          {{ config.phone }}
        </p>
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
        <div class="flex items-center gap-2 border-r border-charcoal/10 pr-4">
          <a
            v-if="config.instagram"
            :href="config.instagram"
            target="_blank"
            rel="noopener"
            class="text-charcoal/40 hover:text-[#E1306C] transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
              />
            </svg>
          </a>
          <a
            v-if="config.facebook"
            :href="config.facebook"
            target="_blank"
            rel="noopener"
            class="text-charcoal/40 hover:text-[#1877F2] transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </a>
          <a
            v-if="config.tiktok"
            :href="config.tiktok"
            target="_blank"
            rel="noopener"
            class="text-charcoal/40 hover:text-black transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.41a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z"
              />
            </svg>
          </a>
        </div>
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
              <div>
                <p class="font-brand text-xl text-deep">{{ config.name }}</p>
                <p
                  v-if="config.phone"
                  class="text-xs text-charcoal/50 font-medium"
                >
                  {{ config.phone }}
                </p>
              </div>
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
import { trackReserveClick } from "@/composables/useAnalytics";

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
  if (id === "reservation") trackReserveClick();
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
