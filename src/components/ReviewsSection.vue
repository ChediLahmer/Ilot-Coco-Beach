<template>
  <section class="bg-sand sand-texture py-24 md:py-32 px-6 md:px-16">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('reviews.title') }}
        </h2>
        <div class="w-10 h-[2px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-charcoal/50 text-base md:text-lg max-w-xl mx-auto">
          {{ t('reviews.subtitle') }}
        </p>
      </div>

      <!-- Carousel -->
      <div
        @mouseenter="pause"
        @mouseleave="resume"
        dir="ltr"
        class="relative overflow-hidden"
      >
        <!-- Track -->
        <div
          class="flex transition-transform duration-500 ease-out"
          :style="{ transform: trackTransform }"
        >
          <div
            v-for="review in reviews"
            :key="review.id"
            class="flex-shrink-0 px-3"
            :style="{ width: cardPercent + '%' }"
          >
            <div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col border-l-2 border-ocean/20">
              <!-- Stars -->
              <div class="flex gap-0.5">
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="[
                    'text-base',
                    star <= review.rating ? 'text-coral' : 'text-charcoal/10',
                  ]"
                >
                  ★
                </span>
              </div>

              <!-- Comment -->
              <p class="font-body text-charcoal/70 text-base leading-relaxed mt-3 line-clamp-4 flex-1">
                {{ review.comment }}
              </p>

              <!-- User info -->
              <div class="flex items-center gap-3 mt-4 pt-4 border-t border-charcoal/5">
                <div class="w-10 h-10 bg-charcoal/5 rounded-full flex items-center justify-center font-heading font-bold text-sm text-charcoal/40">
                  {{ review.userName.charAt(0) }}
                </div>
                <div>
                  <span class="font-heading font-semibold text-sm text-charcoal block">
                    {{ review.userName }}
                  </span>
                  <span class="font-body text-charcoal/30 text-xs">
                    {{ formatDate(review.date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prev button -->
        <button
          @click="prev"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 border border-charcoal/10 hover:border-charcoal/30 rounded-full flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors z-10 bg-white/80"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Next button -->
        <button
          @click="next"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 border border-charcoal/10 hover:border-charcoal/30 rounded-full flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors z-10 bg-white/80"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="i in dotCount"
            :key="i"
            @click="goTo(i - 1)"
            :class="[
              'rounded-full transition-all duration-300',
              current === i - 1 ? 'bg-ocean w-4 h-1.5' : 'bg-charcoal/15 w-1.5 h-1.5',
            ]"
          />
        </div>
      </div>

      <!-- Write review link -->
      <div class="text-center mt-10">
        <button class="border border-ocean/30 text-ocean px-5 py-2 rounded-full hover:bg-ocean/5 font-heading text-sm transition-colors">
          {{ t('reviews.writeReview') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { reviews } from '@/data/mock'

const { t } = useI18n()

// Responsive screen width tracking
const screenW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { screenW.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Card width % based on breakpoint
const cardPercent = computed(() => {
  if (screenW.value >= 1024) return 33.333
  if (screenW.value >= 768) return 50
  return 100
})

// Carousel state
const current = ref(0)
const paused = ref(false)
let timer = null

const dotCount = computed(() => reviews.length)

const trackTransform = computed(() => `translateX(-${current.value * cardPercent.value}%)`)

function next() {
  current.value = current.value >= reviews.length - 1 ? 0 : current.value + 1
}

function prev() {
  current.value = current.value <= 0 ? reviews.length - 1 : current.value - 1
}

function goTo(i) {
  current.value = i
}

function pause() {
  paused.value = true
}

function resume() {
  paused.value = false
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 3500)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
