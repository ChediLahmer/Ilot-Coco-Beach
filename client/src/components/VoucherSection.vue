<template>
  <section
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-br from-sunset/8 via-gold-light/15 to-coral-light/10"
  >
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <h2 class="font-brand text-2xl text-deep md:text-3xl">
          {{ t("vouchers.title") }}
        </h2>
        <p class="mt-2 text-sm text-charcoal/55 max-w-md mx-auto">
          {{ t("vouchers.subtitle") }}
        </p>
      </div>

      <div class="mt-6 flex items-center justify-center gap-3">
        <router-link
          to="/offers"
          class="text-sm font-medium text-ocean hover:text-ocean-dark"
        >
          {{ t("flash.seeAll") }} &rarr;
        </router-link>
        <div class="flex items-center gap-1">
          <button ref="voucherPrev" class="tropical-arrow">
            <svg
              class="w-4 h-4"
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
          <button ref="voucherNext" class="tropical-arrow">
            <svg
              class="w-4 h-4"
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
      <!-- Loading skeleton -->
      <div
        v-if="dataLoading && !vouchers.length"
        class="mt-8 animate-pulse grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="j in 3"
          :key="j"
          class="rounded-lg border border-charcoal/8 bg-white p-5"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="h-8 w-20 rounded bg-charcoal/8" />
            <div class="h-3 w-12 rounded bg-charcoal/6" />
          </div>
          <div class="my-4 h-px bg-charcoal/6" />
          <div class="flex justify-center">
            <div class="h-8 w-32 rounded-md bg-charcoal/8" />
          </div>
          <div class="mt-3 flex justify-center">
            <div class="h-3 w-28 rounded bg-charcoal/6" />
          </div>
        </div>
      </div>

      <div v-else-if="vouchers.length > 0" class="mt-8">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1"
          :space-between="16"
          :speed="500"
          :autoplay="{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :navigation="{ prevEl: voucherPrev, nextEl: voucherNext }"
          :breakpoints="{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }"
          :grab-cursor="true"
          class="overflow-hidden rounded-xl"
          @slideChange="onSlideChange"
        >
          <SwiperSlide
            v-for="voucher in vouchers"
            :key="voucher.id"
            class="!h-auto"
          >
            <div
              class="h-full rounded-lg border border-charcoal/8 bg-white p-5"
              :class="{ 'opacity-60': !voucher.isActive }"
            >
              <div class="text-center">
                <span class="text-3xl font-bold text-coral"
                  >-{{ voucher.discountPercent }}%</span
                >
                <span class="block text-sm text-charcoal/40 mt-1">{{
                  t("vouchers.off")
                }}</span>
                <span
                  v-if="!voucher.isActive"
                  class="mt-2 inline-block rounded bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600"
                >
                  {{ t("vouchers.unavailable") }}
                </span>
              </div>

              <div class="my-4 h-px bg-charcoal/6" />

              <div class="text-center">
                <div
                  class="inline-flex items-center gap-2 rounded-md bg-sand px-4 py-2 font-mono text-sm font-semibold text-ocean-dark tracking-wider"
                >
                  {{ voucher.code }}
                  <button
                    class="p-2 rounded text-charcoal/30 hover:text-charcoal transition-colors"
                    @click.stop="copyCode(voucher.code)"
                  >
                    <svg
                      v-if="copiedCode !== voucher.code"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-3.5 h-3.5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <p class="mt-3 text-center text-xs text-charcoal/40">
                {{ t("vouchers.validUntil") }}:
                {{ formatDate(voucher.validUntil) }}
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide v-if="vouchersLoading" class="!h-auto">
            <div
              class="flex h-full min-h-[10rem] items-center justify-center rounded-lg border border-charcoal/8 bg-white/50"
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

      <p
        v-if="!dataLoading && vouchers.length === 0"
        class="mt-8 text-center text-sm text-charcoal/40"
      >
        {{ t("vouchers.subtitle") }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";

import { useData } from "@/composables/useData";

const swiperModules = [Navigation, Autoplay, Scrollbar];
const { t, locale } = useI18n();
const {
  vouchers,
  vouchersHasMore,
  vouchersLoading,
  loadMoreVouchers,
  loading: dataLoading,
} = useData();

const copiedCode = ref(null);

const voucherPrev = ref(null);
const voucherNext = ref(null);

function onSlideChange(swiper) {
  const perView = Math.ceil(
    typeof swiper.params.slidesPerView === "number"
      ? swiper.params.slidesPerView
      : 1,
  );
  if (
    swiper.activeIndex + perView + 2 >= vouchers.value.length &&
    vouchersHasMore.value
  ) {
    loadMoreVouchers();
  }
}

function copyCode(code) {
  navigator.clipboard.writeText(code).catch(() => {});
  copiedCode.value = code;
  setTimeout(() => {
    copiedCode.value = null;
  }, 2000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value || "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>
