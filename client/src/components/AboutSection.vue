<template>
  <section
    id="about"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-br from-ocean-light/30 via-mist to-sand-dark/40"
  >
    <div class="mx-auto max-w-6xl">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div class="lg:sticky lg:top-28">
          <p class="section-kicker">{{ t("about.eyebrow") }}</p>
          <h2 class="section-title mt-3">{{ t("about.title") }}</h2>
          <div class="section-divider" />

          <p class="section-copy mt-6 max-w-md">
            {{ t("about.description") }}
          </p>

          <a
            href="#reservation"
            class="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:text-ocean-dark"
            @click.prevent="scrollTo('reservation')"
          >
            {{ t("about.cta") }}
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:row-span-2 overflow-hidden rounded-lg">
            <img
              :src="overwaterImg"
              alt="Overwater dining"
              class="h-full min-h-[14rem] sm:min-h-[18rem] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="overflow-hidden rounded-lg">
            <img
              :src="cabinHammockImg"
              alt="Private cabin"
              class="aspect-[4/3] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="rounded-lg bg-sand p-6">
            <p class="text-sm font-medium text-ocean">
              {{ t("about.features.vibes") }}
            </p>
            <p class="mt-2 font-brand text-xl leading-snug text-deep">
              {{ t("about.features.vibesDesc") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

import overwaterImg from "@/assets/images/overwater-cabin.jpg";
import cabinHammockImg from "@/assets/images/cabin-hammock.jpg";

const { t } = useI18n();

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
</script>
