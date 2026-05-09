<template>
  <!-- Loading skeleton -->
  <section
    v-if="dataLoading && !flashSales.length"
    class="px-6 py-14 md:px-12 lg:px-20 bg-gradient-to-r from-ocean-dark/5 via-lagoon/8 to-sunset/10"
  >
    <div class="mx-auto max-w-6xl animate-pulse">
      <div class="flex flex-col gap-2 mb-8">
        <div class="h-3 w-20 rounded-full bg-charcoal/10" />
        <div class="h-7 w-48 rounded-full bg-charcoal/10" />
        <div class="h-0.5 w-14 rounded-full bg-charcoal/8" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="j in 3"
          :key="j"
          class="rounded-lg overflow-hidden min-h-[14rem] bg-charcoal/8"
        />
      </div>
    </div>
  </section>

  <section
    v-else-if="flashSalesError && !flashSales.length"
    id="flash-offers"
    class="px-6 py-14 md:px-12 lg:px-20 bg-gradient-to-r from-ocean-dark/5 via-lagoon/8 to-sunset/10"
  >
    <div class="mx-auto max-w-6xl text-center">
      <p class="section-kicker">{{ t("vouchers.title") }}</p>
      <h2 class="section-title mt-3">{{ t("flash.title") }}</h2>
      <div class="mx-auto section-divider" />
      <p class="mt-6 text-sm text-charcoal/60">{{ t("error.description") }}</p>
      <button
        class="mt-5 rounded-full bg-ocean px-5 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-ocean/90"
        @click="retryFlashSales"
      >
        {{ t("error.retry") }}
      </button>
    </div>
  </section>

  <section
    v-else-if="flashSales.length > 0"
    id="flash-offers"
    class="px-6 py-14 md:px-12 lg:px-20 bg-gradient-to-r from-ocean-dark/5 via-lagoon/8 to-sunset/10"
  >
    <div class="mx-auto max-w-6xl">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="section-kicker">{{ t("vouchers.title") }}</p>
          <h2 class="section-title mt-3">{{ t("flash.title") }}</h2>
          <div class="section-divider" />
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/offers"
            class="text-sm font-medium text-ocean hover:text-ocean-dark"
          >
            {{ t("flash.seeAll") }} &rarr;
          </router-link>
          <div class="flex items-center gap-1">
            <button ref="flashPrev" class="tropical-arrow">
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
            <button ref="flashNext" class="tropical-arrow">
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
      </div>

      <!-- Swiper -->
      <div class="mt-8">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1.1"
          :space-between="16"
          :speed="500"
          :autoplay="{
            delay: 5500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :navigation="{ prevEl: flashPrev, nextEl: flashNext }"
          :breakpoints="{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }"
          :centered-slides="false"
          :grab-cursor="true"
          class="overflow-hidden rounded-xl"
          @slideChange="onSlideChange"
        >
          <SwiperSlide
            v-for="sale in flashSales"
            :key="sale.id"
            class="!h-auto"
          >
            <article
              class="group relative flex min-h-[14rem] h-full flex-col justify-between overflow-hidden rounded-lg text-white"
              :class="{ 'opacity-60': !sale.isActive }"
            >
              <img
                v-if="sale.image"
                :src="sale.image"
                :alt="sale.title[locale] || sale.title.fr"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div v-else class="absolute inset-0 bg-deep" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"
              />

              <div
                class="relative z-10 flex h-full flex-col justify-between p-5"
              >
                <div class="flex flex-wrap items-start gap-2">
                  <span
                    class="rounded bg-coral px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    -{{ sale.discountPercent }}%
                  </span>
                  <span
                    v-if="!sale.isActive"
                    class="rounded bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {{ t("flash.unavailable") }}
                  </span>
                </div>

                <div>
                  <h3 class="font-brand text-xl leading-tight sm:text-2xl">
                    {{ sale.title[locale] || sale.title.fr }}
                  </h3>
                  <p class="mt-1.5 text-sm text-white/70 line-clamp-2">
                    {{ sale.description[locale] || sale.description.fr }}
                  </p>

                  <div
                    v-if="getOriginalPrice(sale)"
                    class="mt-2 flex items-center gap-2"
                  >
                    <span class="text-sm text-white/50 line-through">
                      {{ getOriginalPrice(sale) }} DT
                    </span>
                    <span class="text-lg font-bold text-gold">
                      {{ getDiscountedPrice(sale) }} DT
                    </span>
                  </div>

                  <div
                    v-if="!isSaleExpired(sale)"
                    class="mt-3 flex flex-wrap gap-1.5"
                  >
                    <div
                      v-for="unit in getSaleCountdown(sale)"
                      :key="unit.label"
                      class="min-w-[3rem] rounded border border-white/15 bg-white/10 px-2 py-1 text-center"
                    >
                      <p class="text-sm font-semibold text-white">
                        {{ String(unit.value).padStart(2, "0") }}
                      </p>
                      <p class="text-[0.6rem] text-white/50">
                        {{ unit.label }}
                      </p>
                    </div>
                  </div>
                  <p v-else class="mt-3 text-xs font-medium text-coral-light">
                    {{ t("flash.expired") }}
                  </p>

                  <a
                    href="#reservation"
                    class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-coral-light"
                    @click.prevent="scrollToReservation"
                  >
                    {{ t("flash.bookNow") }} &rarr;
                  </a>
                </div>
              </div>
            </article>
          </SwiperSlide>
          <SwiperSlide v-if="flashSalesLoading" class="!h-auto">
            <div
              class="flex min-h-[14rem] h-full items-center justify-center rounded-lg border border-charcoal/8 bg-white/50"
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

  <section
    v-else
    id="flash-offers"
    class="px-6 py-14 md:px-12 lg:px-20 bg-gradient-to-r from-ocean-dark/5 via-lagoon/8 to-sunset/10"
  >
    <div class="mx-auto max-w-6xl text-center">
      <p class="section-kicker">{{ t("vouchers.title") }}</p>
      <h2 class="section-title mt-3">{{ t("flash.title") }}</h2>
      <div class="mx-auto section-divider" />
      <p class="mt-6 text-sm text-charcoal/60">{{ t("flash.empty") }}</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";

import { useData } from "@/composables/useData";
import { useCountdown } from "@/composables/useCountdown";
import { trackReserveClick } from "@/composables/useAnalytics";

const swiperModules = [Navigation, Autoplay];
const { t, locale } = useI18n();
const now = useCountdown();

const {
  flashSales,
  flashSalesHasMore,
  flashSalesError,
  flashSalesLoading,
  loadMoreFlashSales,
  loading: dataLoading,
  retryFlashSales,
} = useData();

const flashPrev = ref(null);
const flashNext = ref(null);

function onSlideChange(swiper) {
  const perView = Math.ceil(
    typeof swiper.params.slidesPerView === "number"
      ? swiper.params.slidesPerView
      : 1,
  );
  if (
    swiper.activeIndex + perView + 2 >= flashSales.value.length &&
    flashSalesHasMore.value
  ) {
    loadMoreFlashSales();
  }
}

function isSaleExpired(sale) {
  return now.value >= new Date(sale.endsAt).getTime();
}

function getSaleCountdown(sale) {
  const diff = Math.max(0, new Date(sale.endsAt).getTime() - now.value);
  const seconds = Math.floor(diff / 1000);

  return [
    { label: t("flash.days"), value: Math.floor(seconds / 86400) },
    { label: t("flash.hours"), value: Math.floor((seconds % 86400) / 3600) },
    { label: t("flash.minutes"), value: Math.floor((seconds % 3600) / 60) },
    { label: t("flash.seconds"), value: seconds % 60 },
  ];
}

function scrollToReservation() {
  trackReserveClick();
  const el = document.getElementById("reservation");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function getOriginalPrice(sale) {
  if (sale.menuItem) return Number(sale.menuItem.priceStandard);
  if (sale.space) return Number(sale.space.price);
  return null;
}

function getDiscountedPrice(sale) {
  const original = getOriginalPrice(sale);
  if (!original) return null;
  return (original * (1 - sale.discountPercent / 100)).toFixed(2);
}
</script>
