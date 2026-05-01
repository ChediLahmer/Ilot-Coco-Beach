<template>
  <section id="reviews" class="px-6 py-20 md:px-12 lg:px-20">
    <div
      class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:items-start"
    >
      <div class="">
        <p class="section-kicker">{{ t("reviews.eyebrow") }}</p>
        <h2 class="section-title mt-6">
          {{ t("reviews.title") }}
        </h2>
        <div class="section-divider" />
        <p class="section-copy mt-8 max-w-xl">
          {{ t("reviews.subtitle") }}
        </p>

        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <article class="rounded-lg border border-charcoal/8 bg-white p-5">
            <p class="text-xs font-medium text-charcoal/50">
              {{ t("reviews.ratingLabel") }}
            </p>
            <p class="mt-4 font-brand text-5xl text-deep">
              {{ averageRating }}
            </p>
            <p class="mt-2 text-sm text-charcoal/60">
              {{ reviews.length }} {{ t("reviews.reviewsLabel") }}
            </p>
          </article>

          <article class="rounded-lg border border-charcoal/8 bg-white p-5">
            <p class="text-xs font-medium text-charcoal/50">
              {{ t("reviews.recommendationLabel") }}
            </p>
            <p class="mt-4 font-brand text-5xl text-deep">
              {{ recommendationRate }}%
            </p>
            <p class="mt-2 text-sm text-charcoal/60">
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
            class="rounded-md border border-charcoal/12 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-charcoal hover:text-white"
          >
            {{ t("reviews.writeReview") }}
          </router-link>
        </div>
      </div>

      <div>
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p v-if="hasOverflow" class="text-xs text-charcoal/40">
              {{ t("ui.scrollHint") }}
            </p>
            <p class="mt-2 text-sm text-charcoal/55">
              {{ reviews.length }} {{ t("reviews.reviewsLabel") }}
            </p>
          </div>

          <div v-if="hasOverflow" class="flex items-center gap-3">
            <button
              type="button"
              class="tropical-arrow"
              :aria-label="t('ui.previous')"
              :disabled="!canScrollLeft"
              @click="scrollByStep(-1)"
            >
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
            <button
              type="button"
              class="tropical-arrow"
              :aria-label="t('ui.next')"
              :disabled="!canScrollRight"
              @click="scrollByStep(1)"
            >
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

        <div
          class="mt-10 overflow-hidden"
          @mouseenter="pause"
          @mouseleave="resume"
          @touchstart.passive="pause"
          @touchend.passive="resume"
        >
          <div
            ref="scrollerEl"
            dir="ltr"
            class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            @scroll="updateScrollState"
          >
            <article
              v-for="review in reviews"
              :key="review.id"
              data-rail-item
              :dir="locale === 'ar' ? 'rtl' : 'ltr'"
              class="flex min-h-[14rem] min-w-[17rem] shrink-0 flex-col justify-between rounded-lg border border-charcoal/8 bg-white p-5 sm:min-w-[18rem]"
            >
              <div class="flex gap-0.5 text-coral">
                <span v-for="star in 5" :key="star">
                  {{ star <= review.rating ? "★" : "☆" }}
                </span>
              </div>

              <p
                class="mt-5 flex-1 break-words text-base leading-8 text-charcoal/72"
              >
                “{{ review.comment }}”
              </p>

              <div class="mt-8 border-t border-charcoal/8 pt-5">
                <p class="font-heading text-base font-semibold text-deep">
                  {{ review.userName }}
                </p>
                <p class="mt-1 text-sm text-charcoal/45">
                  {{ formatDate(review.date) }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useHorizontalRail } from "@/composables/useHorizontalRail";
import { useReviews } from "@/composables/useReviews";

const { t, locale } = useI18n();
const { reviews, averageRating, recommendationRate } = useReviews();

const {
  scrollerEl,
  canScrollLeft,
  canScrollRight,
  hasOverflow,
  scrollByStep,
  updateScrollState,
  pause,
  resume,
} = useHorizontalRail(computed(() => reviews.value.length));

watch(locale, async () => {
  await nextTick();
  updateScrollState();
});

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
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
