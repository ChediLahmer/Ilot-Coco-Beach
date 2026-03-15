<template>
  <section class="relative bg-white py-20 px-6 md:px-16">
    <!-- Section editorial number -->
    <div class="section-number">07</div>

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 gold-accent">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('reviews.title') }}
        </h2>
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('reviews.subtitle') }}
        </p>
      </div>

      <!-- Horizontal scroll -->
      <div class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 -mx-2 px-2">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="snap-start shrink-0 w-[320px] md:w-[360px] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <!-- Quote -->
          <div class="text-gold/20 text-4xl font-display leading-none mb-2">"</div>

          <!-- Stars -->
          <div class="flex gap-1 mb-3">
            <span
              v-for="star in 5"
              :key="star"
              :class="[
                'text-lg',
                star <= review.rating ? 'text-coral' : 'text-charcoal/15',
              ]"
            >
              ★
            </span>
          </div>

          <!-- Comment -->
          <p class="font-body text-charcoal/70 text-sm leading-relaxed mb-4 line-clamp-4">
            {{ review.comment }}
          </p>

          <!-- User info -->
          <div class="flex items-center justify-between pt-3 border-t border-charcoal/5">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-ocean/10 rounded-full flex items-center justify-center text-xs font-heading font-bold text-ocean">
                {{ review.userName.charAt(0) }}
              </div>
              <span class="font-heading font-semibold text-sm text-charcoal">
                {{ review.userName }}
              </span>
            </div>
            <span class="font-body text-xs text-charcoal/40">
              {{ formatDate(review.date) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Write review button -->
      <div class="text-center mt-8">
        <button
          class="inline-flex items-center gap-2 bg-ocean/10 hover:bg-ocean/20 text-ocean font-heading font-semibold text-sm px-6 py-2.5 rounded-full transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ t('reviews.writeReview') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { reviews } from '@/data/mock'

const { t } = useI18n()

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
