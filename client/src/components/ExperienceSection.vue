<template>
  <section
    v-if="spaces.length > 0"
    id="experience"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-br from-lagoon/10 via-ocean-light/25 to-foam"
  >
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <p class="section-kicker">{{ t("experience.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("experience.title") }}</h2>
        <div class="mx-auto section-divider" />
      </div>

      <div class="mt-6 flex items-center justify-between">
        <router-link
          to="/spaces"
          class="text-sm font-medium text-ocean hover:text-ocean-dark"
        >
          {{ t("experience.viewAll") }} &rarr;
        </router-link>
        <div class="flex items-center gap-1">
          <button ref="spacePrev" class="tropical-arrow">
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button ref="spaceNext" class="tropical-arrow">
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Swiper -->
      <div class="mt-6">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1.1"
          :space-between="16"
          :speed="500"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :navigation="{ prevEl: spacePrev, nextEl: spaceNext }"
          :breakpoints="{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }"
          :grab-cursor="true"
          class="overflow-hidden rounded-xl"
          @slideChange="onSlideChange"
        >
          <SwiperSlide v-for="space in spaces" :key="space.id" class="!h-auto">
            <article
              class="group relative min-h-[18rem] h-full overflow-hidden rounded-lg text-white"
            >
              <div v-if="space.image" class="absolute inset-0 overflow-hidden">
                <img
                  :src="space.image"
                  :alt="space.name[locale] || space.name.fr"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div v-else class="absolute inset-0 bg-deep" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              />

              <div
                class="relative z-10 flex h-full flex-col justify-between p-5"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    v-if="!space.available"
                    class="rounded bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {{ t("experience.unavailable") }}
                  </span>
                  <span
                    class="rounded bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90"
                  >
                    {{ t("experience.startingAt") }} {{ space.price }} DT
                  </span>
                  <span
                    class="rounded bg-coral/80 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {{ space.capacity }} {{ t("experience.persons") }}
                  </span>
                </div>

                <div>
                  <h3 class="font-brand text-xl leading-tight sm:text-2xl">
                    {{ space.name[locale] || space.name.fr }}
                  </h3>
                  <p class="mt-1.5 text-sm text-white/70 line-clamp-2">
                    {{
                      (space.desc || space.description || {})[locale] ||
                      (space.desc || space.description || {}).fr
                    }}
                  </p>
                  <a
                    href="#reservation"
                    class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-coral-light"
                    @click.prevent="scrollToReservation"
                  >
                    {{ t("experience.reserveCta") }} &rarr;
                  </a>
                </div>
              </div>
            </article>
          </SwiperSlide>
          <SwiperSlide v-if="spacesLoading" class="!h-auto">
            <div
              class="flex min-h-[18rem] h-full items-center justify-center rounded-lg border border-charcoal/8 bg-white/50"
            >
              <svg
                class="h-6 w-6 animate-spin text-ocean"
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
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";

import { useData } from "@/composables/useData";
import { trackReserveClick } from "@/composables/useAnalytics";

const swiperModules = [Navigation, Autoplay];
const { t, locale } = useI18n();
const { spaces, spacesHasMore, spacesLoading, loadMoreSpaces } = useData();

const spacePrev = ref(null);
const spaceNext = ref(null);

function onSlideChange(swiper) {
  const perView = Math.ceil(
    typeof swiper.params.slidesPerView === "number"
      ? swiper.params.slidesPerView
      : 1,
  );
  if (
    swiper.activeIndex + perView + 2 >= spaces.value.length &&
    spacesHasMore.value
  ) {
    loadMoreSpaces();
  }
}

function scrollToReservation() {
  trackReserveClick();
  const el = document.getElementById("reservation");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
</script>
