<template>
  <section
    id="hero"
    class="relative flex min-h-screen items-end overflow-hidden"
  >
    <!-- Video background -->
    <div class="absolute inset-0">
      <!-- Always show poster first for instant visual -->
      <img
        v-if="heroPoster"
        :src="heroPoster"
        class="h-full w-full object-cover"
        :class="{ invisible: videoCanPlay }"
        fetchpriority="high"
      />
      <video
        v-if="videoSrc"
        ref="videoEl"
        :src="videoSrc"
        class="absolute inset-0 h-full w-full object-cover"
        :poster="heroPoster"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        @canplay="videoCanPlay = true"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"
      />
    </div>

    <!-- Content -->
    <div
      ref="contentEl"
      class="relative z-10 w-full px-6 pb-16 pt-32 md:px-12 lg:px-20"
    >
      <div class="mx-auto max-w-6xl">
        <p
          data-animate
          class="font-heading text-sm font-medium tracking-wide text-white/70"
        >
          {{ t("hero.welcome") }}
        </p>

        <h1
          data-animate
          class="mt-4 font-brand text-5xl leading-[1.05] text-white md:text-6xl lg:text-7xl"
        >
          {{ config.name }}
        </h1>

        <p
          data-animate
          class="mt-4 max-w-lg text-base leading-relaxed text-white/75 md:text-lg"
        >
          {{ t("hero.tagline") }}
        </p>

        <div data-animate class="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#reservation"
            class="premium-button"
            @click.prevent="scrollTo('reservation')"
          >
            {{ t("nav.reservation") }}
          </a>
          <router-link to="/menu" class="premium-button-secondary">
            {{ t("hero.cta") }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import gsap from "gsap";

import { useConfig } from "@/composables/useConfig";

const { t } = useI18n();
const config = useConfig();

const heroVideo = computed(() => config.heroVideo || "");
const heroPoster = computed(() => config.heroPoster || "");

const contentEl = ref(null);
const videoEl = ref(null);
const videoSrc = ref("");
const videoCanPlay = ref(false);

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function deferVideo() {
  if (!heroVideo.value) return;
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      videoSrc.value = heroVideo.value;
    });
  } else {
    setTimeout(() => {
      videoSrc.value = heroVideo.value;
    }, 200);
  }
}

watch(heroVideo, (v) => {
  if (v) deferVideo();
});

onMounted(() => {
  if (heroVideo.value) deferVideo();

  const els = contentEl.value
    ? Array.from(contentEl.value.querySelectorAll("[data-animate]"))
    : [];

  gsap.from(els, {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out",
    clearProps: "all",
  });
});
</script>
