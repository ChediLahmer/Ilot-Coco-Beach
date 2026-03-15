<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reviews } from '@/data/mock.js'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const cardsContainer = ref(null)
let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.review-card', {
      x: 80,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cardsContainer.value,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <section id="reviews" class="py-20 px-6 md:px-16 bg-sand">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="font-display text-ocean text-4xl">
          {{ t('reviews.title') }}
        </h2>
        <p class="text-charcoal/60 text-lg mt-3">
          {{ t('reviews.subtitle') }}
        </p>
      </div>

      <!-- Review Cards — horizontal scroll on desktop, vertical stack on mobile -->
      <div
        ref="cardsContainer"
        class="flex flex-col md:flex-row gap-6 md:overflow-x-auto md:pb-4 reviews-scroll-container"
      >
        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-card md:min-w-[320px] md:max-w-[380px] bg-white rounded-2xl p-6 shadow-lg md:flex-shrink-0 border-l-4 border-ocean"
        >
          <!-- Star Rating -->
          <div class="flex items-center gap-1 mb-3">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-5 h-5"
              :class="star <= review.rating ? 'text-coral' : 'text-gray-300'"
              viewBox="0 0 24 24"
              :fill="star <= review.rating ? 'currentColor' : 'none'"
              :stroke="star <= review.rating ? 'none' : 'currentColor'"
              stroke-width="1.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <!-- Comment -->
          <div class="relative">
            <span class="text-4xl text-ocean/20 leading-none font-display absolute -top-2 -left-1">&ldquo;</span>
            <p class="text-charcoal/80 italic text-sm leading-relaxed pl-5 pt-1">
              {{ review.comment }}
            </p>
          </div>

          <!-- User Info -->
          <div class="mt-4 pt-3 border-t border-gray-100">
            <p class="font-heading font-bold text-charcoal text-sm">
              {{ review.userName }}
            </p>
            <p class="text-xs text-charcoal/40">
              {{ review.date }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center mt-10">
        <button
          class="bg-ocean text-white rounded-full px-6 py-3 font-heading font-semibold transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          {{ t('reviews.writeReview') }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews-scroll-container {
  scrollbar-width: none;
}

.reviews-scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
