<template>
  <div ref="homeRef" class="min-h-screen bg-sand">
    <NavBar />
    <main>
      <HeroSection />

      <!-- Global error state -->
      <div
        v-if="dataError"
        class="flex flex-col items-center justify-center px-4 py-24 text-center"
      >
        <svg
          class="h-12 w-12 text-coral/60 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <p class="font-brand text-lg text-deep mb-2">{{ t("error.title") }}</p>
        <p class="text-sm text-charcoal/60 mb-6">
          {{ t("error.description") }}
        </p>
        <button
          class="rounded-full bg-ocean px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-ocean/90 transition-colors"
          @click="retryData"
        >
          {{ t("error.retry") }}
        </button>
      </div>

      <template v-else>
        <!-- Loading skeleton while data fetches -->
        <div v-if="dataLoading" class="mx-auto max-w-6xl px-6 py-16 space-y-16">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="flex flex-col items-center gap-3 mb-8">
              <div class="h-3 w-24 rounded-full bg-charcoal/10" />
              <div class="h-7 w-56 rounded-full bg-charcoal/10" />
              <div class="h-0.5 w-16 rounded-full bg-charcoal/8" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="j in 3"
                :key="j"
                class="rounded-lg border border-charcoal/8 bg-white overflow-hidden"
              >
                <div class="aspect-[4/3] bg-charcoal/8" />
                <div class="p-4 space-y-3">
                  <div class="h-5 w-3/4 rounded bg-charcoal/8" />
                  <div class="h-3 w-full rounded bg-charcoal/6" />
                  <div class="h-3 w-2/3 rounded bg-charcoal/6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-else>
          <div data-reveal><AboutSection /></div>
          <div data-reveal><FlashSaleSection /></div>
          <div data-reveal><MenuSection /></div>
          <div data-reveal><ExperienceSection /></div>
          <div data-reveal><GallerySection /></div>
          <div data-reveal><VoucherSection /></div>
          <div v-if="config.showReviews" data-reveal><ReviewsSection /></div>
          <div v-if="config.sectionVideo" data-reveal><VideoSection /></div>
          <div data-reveal><ReservationSection /></div>
          <div data-reveal><LocationSection /></div>
        </template>
      </template>
    </main>
    <FooterSection />
    <FloatingSocial />

    <div
      v-if="showStickyBar"
      class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t border-charcoal/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
    >
      <div class="min-w-0">
        <p class="truncate font-brand text-base text-deep">{{ config.name }}</p>
        <p
          class="mt-1 truncate font-heading text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-charcoal/55"
        >
          {{ t("hero.tagline") }}
        </p>
      </div>
      <a
        href="#reservation"
        class="shrink-0 rounded-full bg-ocean px-5 py-2.5 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(32,178,170,0.24)]"
        @click.prevent="scrollToRes"
      >
        {{ t("nav.reservation") }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useConfig } from "@/composables/useConfig";
import { useData } from "@/composables/useData";
import { useScrollReveal } from "@/composables/useScrollReveal";

import NavBar from "@/components/NavBar.vue";
import HeroSection from "@/components/HeroSection.vue";

// Lazy-load below-fold sections for faster initial paint
const AboutSection = defineAsyncComponent(
  () => import("@/components/AboutSection.vue"),
);
const FlashSaleSection = defineAsyncComponent(
  () => import("@/components/FlashSaleSection.vue"),
);
const MenuSection = defineAsyncComponent(
  () => import("@/components/MenuSection.vue"),
);
const ExperienceSection = defineAsyncComponent(
  () => import("@/components/ExperienceSection.vue"),
);
const GallerySection = defineAsyncComponent(
  () => import("@/components/GallerySection.vue"),
);
const VoucherSection = defineAsyncComponent(
  () => import("@/components/VoucherSection.vue"),
);
const VideoSection = defineAsyncComponent(
  () => import("@/components/VideoSection.vue"),
);
const ReservationSection = defineAsyncComponent(
  () => import("@/components/ReservationSection.vue"),
);
const ReviewsSection = defineAsyncComponent(
  () => import("@/components/ReviewsSection.vue"),
);
const LocationSection = defineAsyncComponent(
  () => import("@/components/LocationSection.vue"),
);
const FooterSection = defineAsyncComponent(
  () => import("@/components/FooterSection.vue"),
);
const FloatingSocial = defineAsyncComponent(
  () => import("@/components/FloatingSocial.vue"),
);

const { t, locale } = useI18n();
const config = useConfig();
const { error: dataError, retry: retryData, loading: dataLoading } = useData();

const homeRef = ref(null);
const showStickyBar = ref(false);

useScrollReveal(homeRef);

function onScroll() {
  const scrollTop = window.scrollY;
  showStickyBar.value = scrollTop > window.innerHeight * 0.8;
}

function scrollToRes() {
  const el = document.getElementById("reservation");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOG(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function applyHead() {
  document.title = `${config.name} — ${t("hero.tagline")}`;

  setMeta("description", t("about.description"));
  setMeta(
    "keywords",
    "ilot coco beach, ghar el melh, bizerte, waterfront dining, private cabins, beach restaurant, tunisia",
  );

  setOG("og:title", `${config.name} | ${t("hero.tagline")}`);
  setOG("og:description", t("about.description"));
  setOG("og:type", "website");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: config.name,
    description: t("about.description"),
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address,
    },
    telephone: config.phone,
    email: config.email,
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.lat,
      longitude: config.lng,
    },
    sameAs: [config.instagram, config.facebook],
  };

  let scriptEl = document.getElementById("json-ld");
  if (!scriptEl) {
    scriptEl = document.createElement("script");
    scriptEl.id = "json-ld";
    scriptEl.type = "application/ld+json";
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });

  applyHead();
});

watch(locale, () => {
  applyHead();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>
