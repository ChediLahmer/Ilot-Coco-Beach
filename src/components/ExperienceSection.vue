<template>
  <section id="experience" class="relative bg-sand sand-texture py-24 md:py-32 px-6 md:px-16">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('experience.title') }}
        </h2>
        <div class="w-10 h-[1px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-charcoal/50 text-sm md:text-base max-w-xl mx-auto">
          {{ t('experience.subtitle') }}
        </p>
      </div>

      <p v-if="emplacements.length === 0" class="text-center text-charcoal/40 font-body py-10">
        {{ t('experience.subtitle') }}
      </p>

      <!-- Carousel -->
      <div
        v-if="emplacements.length > 0"
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
            v-for="emp in emplacements"
            :key="emp.id"
            class="flex-shrink-0 px-3"
            :style="{ width: cardPercent + '%' }"
          >
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <!-- Image -->
              <div class="relative h-52 overflow-hidden">
                <img
                  :src="emp.image"
                  :alt="emp.name[locale] || emp.name.fr"
                  class="w-full h-full object-cover rounded-t-xl"
                />
                <!-- Price badge -->
                <div class="absolute top-3 right-3 bg-white text-charcoal font-bold text-xs font-heading px-2.5 py-1 rounded-full shadow-sm">
                  {{ emp.price }} DT
                </div>
              </div>
              <!-- Content -->
              <div class="p-6">
                <h3 class="font-heading font-semibold text-charcoal text-base mb-1.5">
                  {{ emp.name[locale] || emp.name.fr }}
                </h3>
                <p class="font-body text-charcoal/40 text-xs leading-relaxed mb-4 line-clamp-2">
                  {{ emp.desc[locale] || emp.desc.fr }}
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-charcoal/30 font-heading">
                    <svg class="w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ emp.capacity }} {{ t('experience.persons') || 'pers.' }}
                  </span>
                  <a
                    href="#reservation"
                    class="bg-ocean/10 text-ocean px-3 py-1 rounded-full text-xs font-heading font-semibold hover:bg-ocean/20 transition-colors"
                    @click.prevent="scrollToReservation"
                  >
                    Réserver →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prev button -->
        <button
          @click="prev"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-charcoal hover:border-charcoal/30 flex items-center justify-center transition-all duration-200 z-10"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Next button -->
        <button
          @click="next"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-charcoal hover:border-charcoal/30 flex items-center justify-center transition-all duration-200 z-10"
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
              'w-1.5 h-1.5 rounded-full transition-all duration-200',
              current === i - 1
                ? 'bg-charcoal'
                : 'bg-charcoal/15 hover:bg-charcoal/30',
            ]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { emplacements } from '@/data/mock'

const { t, locale } = useI18n()

// Responsive screen width tracking
const screenW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { screenW.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Card width % based on breakpoint
const cardPercent = computed(() => {
  if (screenW.value >= 1280) return 25
  if (screenW.value >= 1024) return 33.333
  if (screenW.value >= 640) return 50
  return 100
})

// Carousel state
const current = ref(0)
const paused = ref(false)
let timer = null

const dotCount = computed(() => emplacements.length)

const trackTransform = computed(() => `translateX(-${current.value * cardPercent.value}%)`)

function next() {
  current.value = current.value >= emplacements.length - 1 ? 0 : current.value + 1
}

function prev() {
  current.value = current.value <= 0 ? emplacements.length - 1 : current.value - 1
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

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 4000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
