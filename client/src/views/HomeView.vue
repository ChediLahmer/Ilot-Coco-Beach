<template>
  <div ref="homeRef" class="min-h-screen bg-sand">
    <NavBar />
    <main>
      <HeroSection />
      <div data-reveal><AboutSection /></div>
      <div data-reveal><FlashSaleSection /></div>
      <div data-reveal><MenuSection /></div>
      <div data-reveal><ExperienceSection /></div>
      <div data-reveal><GallerySection /></div>
      <div data-reveal><VoucherSection /></div>
      <div data-reveal><VideoSection /></div>
      <div data-reveal><ReservationSection /></div>
      <div data-reveal><LocationSection /></div>
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
