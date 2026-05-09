<template>
  <div ref="homeRef" class="min-h-screen bg-sand">
    <NavBar />
    <main>
      <div
        v-if="configError"
        class="border-b border-coral/15 bg-coral/8 px-4 py-3 text-center"
      >
        <div
          class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 text-sm text-deep sm:flex-row sm:gap-4"
        >
          <p>
            <span class="font-semibold">{{ t("error.configTitle") }}</span>
            {{ t("error.configDescription") }}
          </p>
          <button
            class="rounded-full bg-ocean px-4 py-2 font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-ocean/90"
            @click="retrySiteConfig"
          >
            {{ t("error.retry") }}
          </button>
        </div>
      </div>

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
import {
  ref,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  watch,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  useConfig,
  retryConfig,
  useConfigStatus,
} from "@/composables/useConfig";
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
const { error: configError } = useConfigStatus();
const { error: dataError, retry: retryData } = useData();

const homeRef = ref(null);
const showStickyBar = ref(false);

function validateConfig(cfg) {
  try {
    if (!cfg || typeof cfg !== "object") {
      throw new Error("Config is not an object");
    }
    if (typeof cfg.name !== "string" || cfg.name.length === 0) {
      throw new Error("Config name must be a non-empty string");
    }
    if (typeof cfg.phone !== "string" || !/^[0-9+\-\s()]*$/.test(cfg.phone)) {
      throw new Error("Config phone must be a valid phone format");
    }
    if (
      typeof cfg.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)
    ) {
      throw new Error("Config email must be a valid email format");
    }
    if (cfg.instagram && !cfg.instagram.startsWith("http")) {
      console.warn("[HomeView] Instagram URL appears invalid:", cfg.instagram);
    }
    if (cfg.facebook && !cfg.facebook.startsWith("http")) {
      console.warn("[HomeView] Facebook URL appears invalid:", cfg.facebook);
    }
    if (
      cfg.lat !== undefined &&
      (typeof cfg.lat !== "number" || cfg.lat < -90 || cfg.lat > 90)
    ) {
      console.warn("[HomeView] Latitude appears invalid:", cfg.lat);
    }
    if (
      cfg.lng !== undefined &&
      (typeof cfg.lng !== "number" || cfg.lng < -180 || cfg.lng > 180)
    ) {
      console.warn("[HomeView] Longitude appears invalid:", cfg.lng);
    }
    return true;
  } catch (error) {
    console.error("[HomeView] Config validation error:", error.message, {
      config: cfg,
    });
    return false;
  }
}

const isValidConfig = computed(() => {
  try {
    return validateConfig(config);
  } catch (error) {
    console.error("[HomeView] Error validating config:", error);
    return false;
  }
});

useScrollReveal(homeRef);

function onScroll() {
  const scrollTop = window.scrollY;
  showStickyBar.value = scrollTop > window.innerHeight * 0.8;
}

function scrollToRes() {
  const el = document.getElementById("reservation");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function retrySiteConfig() {
  retryConfig();
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
  if (!isValidConfig.value) {
    console.error("[HomeView] Config validation failed, skipping head updates");
    return;
  }

  try {
    document.title = `${config.name || "Ilot Coco Beach"} — ${t("hero.tagline")}`;

    setMeta("description", t("about.description"));
    setMeta(
      "keywords",
      "ilot coco beach, ghar el melh, bizerte, waterfront dining, private cabins, beach restaurant, tunisia",
    );

    setOG(
      "og:title",
      `${config.name || "Ilot Coco Beach"} | ${t("hero.tagline")}`,
    );
    setOG("og:description", t("about.description"));
    setOG("og:type", "website");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: config.name || "Ilot Coco Beach",
      description: t("about.description"),
      address: {
        "@type": "PostalAddress",
        streetAddress: config.address || "",
      },
      telephone: config.phone || "",
      email: config.email || "",
      geo: {
        "@type": "GeoCoordinates",
        latitude: config.lat || 0,
        longitude: config.lng || 0,
      },
      sameAs: [config.instagram || "", config.facebook || ""].filter(Boolean),
    };

    let scriptEl = document.getElementById("json-ld");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "json-ld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  } catch (error) {
    console.error("[HomeView] Error applying head metadata:", error);
  }
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
