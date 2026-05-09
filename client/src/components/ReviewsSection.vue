<template>
  <section
    id="reviews"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-br from-ocean-light/20 via-white to-sand/30"
  >
    <!-- Loading state -->
    <div
      v-if="loading && !reviews.length"
      class="mx-auto max-w-6xl flex items-center justify-center py-20"
    >
      <svg
        class="h-8 w-8 animate-spin text-ocean/60"
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

    <!-- Error state -->
    <div
      v-else-if="reviewsError && !reviews.length"
      class="mx-auto max-w-6xl flex flex-col items-center justify-center py-20 text-center"
    >
      <svg
        class="h-10 w-10 text-coral/50 mb-3"
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
      <p class="text-sm text-charcoal/60 mb-4">{{ t("error.description") }}</p>
      <button
        class="rounded-full bg-ocean px-5 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-ocean/90"
        @click="retryReviews"
      >
        {{ t("error.retry") }}
      </button>
    </div>

    <div
      v-else
      class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:items-start"
    >
      <!-- Left: info + stats -->
      <div>
        <p class="section-kicker">{{ t("reviews.eyebrow") }}</p>
        <h2 class="section-title mt-6">
          {{ t("reviews.title") }}
        </h2>
        <div class="section-divider" />
        <p class="section-copy mt-8 max-w-xl">
          {{ t("reviews.subtitle") }}
        </p>

        <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
          <article
            class="rounded-lg border border-charcoal/8 bg-white p-3 sm:p-5 min-w-0 overflow-hidden"
          >
            <p
              class="text-[0.6rem] sm:text-xs font-medium text-charcoal/50 truncate"
            >
              {{ t("reviews.ratingLabel") }}
            </p>
            <p
              class="mt-2 sm:mt-4 font-brand text-2xl sm:text-4xl lg:text-5xl text-deep"
            >
              {{ averageRating }}
            </p>
            <p class="mt-1 sm:mt-2 text-[0.65rem] sm:text-sm text-charcoal/60">
              {{ reviewCount }} {{ t("reviews.reviewsLabel") }}
            </p>
          </article>

          <article
            class="rounded-lg border border-charcoal/8 bg-white p-3 sm:p-5 min-w-0 overflow-hidden"
          >
            <p
              class="text-[0.6rem] sm:text-xs font-medium text-charcoal/50 truncate"
            >
              {{ t("reviews.recommendationLabel") }}
            </p>
            <p
              class="mt-2 sm:mt-4 font-brand text-2xl sm:text-4xl lg:text-5xl text-deep"
            >
              {{ displayedRate
              }}<span class="text-lg sm:text-2xl lg:text-3xl">%</span>
            </p>
            <p class="mt-1 sm:mt-2 text-[0.65rem] sm:text-sm text-charcoal/60">
              {{ t("reviews.recommendationText") }}
            </p>
          </article>
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <router-link to="/reviews" class="premium-button">
            {{ t("reviews.viewAll") }}
          </router-link>

          <router-link
            to="/reviews"
            class="rounded-md border border-charcoal/12 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-charcoal hover:text-white transition-colors"
          >
            {{ t("reviews.writeReview") }}
          </router-link>
        </div>
      </div>

      <!-- Right: vertical marquee -->
      <div
        v-if="reviews.length"
        class="relative overflow-hidden rounded-xl"
        :style="{ maxHeight: marqueeHeight + 'px' }"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
        @touchstart.passive="paused = true"
        @touchend.passive="paused = false"
      >
        <!-- Top/bottom fade masks -->
        <div
          class="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-white/80 to-transparent"
        />
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-white/80 to-transparent"
        />

        <div
          ref="marqueeRef"
          class="marquee-track"
          :class="{ 'marquee-paused': paused }"
          :style="{ animationDuration: reviews.length * 6 + 's' }"
        >
          <div class="flex flex-col gap-4">
            <article
              v-for="review in reviews"
              :key="'a-' + review.id"
              :dir="locale === 'ar' ? 'rtl' : 'ltr'"
              class="rounded-lg border border-charcoal/8 bg-white p-5"
            >
              <div class="flex gap-0.5 text-coral">
                <span v-for="star in 5" :key="star">{{
                  star <= review.rating ? "★" : "☆"
                }}</span>
              </div>
              <p class="mt-4 break-words text-base leading-7 text-charcoal/72">
                "{{ review.comment }}"
              </p>
              <div class="mt-5 border-t border-charcoal/8 pt-4">
                <p class="font-heading text-base font-semibold text-deep">
                  {{ review.userName }}
                </p>
                <p class="mt-1 text-sm text-charcoal/45">
                  {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </article>
          </div>
          <div class="flex flex-col gap-4" aria-hidden="true">
            <article
              v-for="review in reviews"
              :key="'b-' + review.id"
              :dir="locale === 'ar' ? 'rtl' : 'ltr'"
              class="rounded-lg border border-charcoal/8 bg-white p-5"
            >
              <div class="flex gap-0.5 text-coral">
                <span v-for="star in 5" :key="star">{{
                  star <= review.rating ? "★" : "☆"
                }}</span>
              </div>
              <p class="mt-4 break-words text-base leading-7 text-charcoal/72">
                "{{ review.comment }}"
              </p>
              <div class="mt-5 border-t border-charcoal/8 pt-4">
                <p class="font-heading text-base font-semibold text-deep">
                  {{ review.userName }}
                </p>
                <p class="mt-1 text-sm text-charcoal/45">
                  {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-charcoal/8 bg-white/75 px-6 py-10 text-center shadow-sm"
      >
        <p class="text-sm text-charcoal/60">{{ t("reviews.empty") }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import { useConfig } from "@/composables/useConfig";
import { useReviews } from "@/composables/useReviews";

const { t, locale } = useI18n();
const config = useConfig();
const {
  reviews,
  averageRating,
  recommendationRate,
  reviewCount,
  loading,
  error: reviewsError,
  retryReviews,
} = useReviews();

const displayedRate = computed(() => {
  const manual = parseInt(config.satisfactionRate, 10);
  return !isNaN(manual) && manual >= 0 && manual <= 100
    ? manual
    : recommendationRate.value;
});

const marqueeRef = ref(null);
const paused = ref(false);
const marqueeHeight = 520;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<style scoped>
.marquee-track {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: marquee-scroll 30s linear infinite;
}

.marquee-paused {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    overflow-y: auto;
    max-height: 100%;
  }
}
</style>
