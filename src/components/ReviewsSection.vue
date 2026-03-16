<template>
  <section id="reviews" class="px-6 py-24 md:px-16 md:py-32">
    <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
      <div class="lg:pr-10">
        <p class="section-kicker">{{ t('reviews.eyebrow') }}</p>
        <h2 class="section-title mt-6">
          {{ t('reviews.title') }}
        </h2>
        <div class="section-divider" />
        <p class="section-copy mt-8 max-w-xl">
          {{ t('reviews.subtitle') }}
        </p>

        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <article class="premium-card rounded-[1.75rem] p-6">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
              {{ t('reviews.ratingLabel') }}
            </p>
            <p class="mt-4 font-brand text-5xl text-deep">
              {{ averageRating }}
            </p>
            <p class="mt-2 text-sm text-charcoal/60">{{ sortedReviews.length }} {{ t('reviews.reviewsLabel') }}</p>
          </article>

          <article class="premium-card rounded-[1.75rem] p-6">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
              {{ t('reviews.recommendationLabel') }}
            </p>
            <p class="mt-4 font-brand text-5xl text-deep">
              {{ recommendationRate }}%
            </p>
            <p class="mt-2 text-sm text-charcoal/60">{{ t('reviews.recommendationText') }}</p>
          </article>
        </div>
      </div>

      <div>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-coral/80">
              {{ t('ui.scrollHint') }}
            </p>
            <p class="mt-2 text-sm text-charcoal/55">
              {{ sortedReviews.length }} {{ t('reviews.reviewsLabel') }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="tropical-arrow"
              :aria-label="t('ui.previous')"
              :disabled="!canScrollLeft"
              @click="scrollByStep(-1)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="tropical-arrow"
              :aria-label="t('ui.next')"
              :disabled="!canScrollRight"
              @click="scrollByStep(1)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-6 overflow-hidden" @mouseenter="pause" @mouseleave="resume" @touchstart.passive="pause" @touchend.passive="resume">
          <div
            ref="scrollerEl"
            class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            @scroll="updateScrollState"
          >
            <article
              v-for="review in sortedReviews"
              :key="review.id"
              data-rail-item
              class="premium-card flex min-h-[19rem] min-w-[19rem] flex-col rounded-[1.75rem] p-6 sm:min-w-[21rem]"
            >
              <div class="flex gap-0.5 text-coral">
                <span v-for="star in 5" :key="star">
                  {{ star <= review.rating ? '★' : '☆' }}
                </span>
              </div>

              <p class="mt-5 flex-1 text-base leading-8 text-charcoal/72">
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
import { computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useHorizontalRail } from '@/composables/useHorizontalRail'
import { reviews } from '@/data/mock'

const { t, locale } = useI18n()

const sortedReviews = computed(() => [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date)))

const {
  scrollerEl,
  canScrollLeft,
  canScrollRight,
  scrollByStep,
  updateScrollState,
  pause,
  resume,
} = useHorizontalRail(computed(() => sortedReviews.value.length))

const averageRating = computed(() => {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return (total / reviews.length).toFixed(1)
})

const recommendationRate = computed(() => {
  const recommended = reviews.filter((review) => review.rating >= 4).length
  return Math.round((recommended / reviews.length) * 100)
})

watch(locale, async () => {
  await nextTick()
  updateScrollState()
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
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
