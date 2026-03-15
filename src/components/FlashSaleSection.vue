<template>
  <section
    v-if="activeSales.length > 0"
    class="relative bg-[#0F3341] py-20 px-6 md:px-16 overflow-hidden"
  >
    <div ref="contentEl" class="relative z-10 max-w-7xl mx-auto">
      <!-- Section header -->
      <div class="text-center mb-14">
        <h2 class="font-display text-white text-4xl md:text-5xl tracking-wide">
          {{ t('flash.title') }}
        </h2>
        <div class="w-10 h-[1px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-white/50 text-base md:text-lg max-w-xl mx-auto">
          {{ t('flash.subtitle') || '' }}
        </p>
      </div>

      <!-- Carousel -->
      <div
        @mouseenter="pauseCarousel = true"
        @mouseleave="pauseCarousel = false"
        dir="ltr"
        class="relative overflow-hidden"
      >
        <div
          class="flex transition-transform duration-500 ease-out"
          :style="{ transform: `translateX(-${currentIdx * cardPct}%)` }"
        >
          <div
            v-for="sale in activeSales"
            :key="sale.id"
            class="flex-shrink-0 px-3"
            :style="{ width: cardPct + '%' }"
          >
            <div class="relative bg-white/10 rounded-xl p-10 border border-white/8">
              <!-- Sale image thumbnail -->
              <img
                v-if="sale.image"
                :src="sale.image"
                :alt="sale.title[locale] || sale.title.fr"
                class="absolute top-4 right-4 w-16 h-16 rounded-lg object-cover opacity-80"
              />

              <!-- Discount -->
              <div class="text-center">
                <span class="font-heading font-black text-6xl text-white">
                  -{{ sale.discountPercent }}%
                </span>
              </div>

              <h3 class="font-heading font-semibold text-lg text-white text-center mt-4">
                {{ sale.title[locale] || sale.title.fr }}
              </h3>
              <p class="font-body text-white/50 text-sm text-center mt-2">
                {{ sale.description[locale] || sale.description.fr }}
              </p>

              <!-- Countdown -->
              <div v-if="!isSaleExpired(sale)" class="flex justify-center gap-3 mt-6">
                <div
                  v-for="unit in getSaleCountdown(sale)"
                  :key="unit.label"
                  class="text-center"
                >
                  <div class="font-heading font-black text-3xl text-white">{{ String(unit.value).padStart(2, '0') }}</div>
                  <div class="text-white/30 text-xs uppercase tracking-wide mt-0.5">{{ unit.label }}</div>
                </div>
              </div>
              <p v-else class="text-coral-light text-sm font-heading font-semibold text-center mt-6">{{ t('flash.expired') }}</p>

              <div class="text-center mt-6">
                <a
                  v-if="!isSaleExpired(sale)"
                  href="#reservation"
                  class="inline-block bg-coral hover:bg-coral-light text-white font-heading text-sm px-8 py-3 rounded-full transition-colors duration-200"
                  @click.prevent="scrollToReservation"
                >{{ t('flash.bookNow') }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Prev / Next -->
        <button
          v-if="activeSales.length > visibleCnt"
          @click="prevCard"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 border border-white/15 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          v-if="activeSales.length > visibleCnt"
          @click="nextCard"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 border border-white/15 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- Dots -->
      <div v-if="dotCount > 1" class="flex justify-center gap-2 mt-8">
        <button
          v-for="i in dotCount"
          :key="i"
          @click="currentIdx = i - 1"
          :class="[currentIdx === i-1 ? 'bg-white w-1.5 h-1.5' : 'bg-white/30 w-1.5 h-1.5', 'rounded-full transition-all duration-300']"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flashSales } from '@/data/mock'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()
const contentEl = ref(null)
const now = ref(Date.now())
let countdownTimer = null
let carouselTimer = null

const activeSales = computed(() => flashSales.filter(s => s.isActive))

function isSaleExpired(sale) { return now.value >= new Date(sale.endsAt).getTime() }

function getSaleCountdown(sale) {
  const diff = Math.max(0, new Date(sale.endsAt).getTime() - now.value)
  const s = Math.floor(diff / 1000)
  return [
    { label: t('flash.days'), value: Math.floor(s / 86400) },
    { label: t('flash.hours'), value: Math.floor((s % 86400) / 3600) },
    { label: t('flash.minutes'), value: Math.floor((s % 3600) / 60) },
    { label: t('flash.seconds'), value: s % 60 },
  ]
}

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

// Carousel
const screenW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { screenW.value = window.innerWidth }
const visibleCnt = computed(() => { if (screenW.value >= 1024) return 3; if (screenW.value >= 768) return 2; return 1 })
const cardPct = computed(() => 100 / visibleCnt.value)
const currentIdx = ref(0)
const pauseCarousel = ref(false)
const maxIdx = computed(() => Math.max(0, activeSales.value.length - visibleCnt.value))
const dotCount = computed(() => maxIdx.value + 1)

function nextCard() { currentIdx.value = currentIdx.value >= maxIdx.value ? 0 : currentIdx.value + 1 }
function prevCard() { currentIdx.value = currentIdx.value <= 0 ? maxIdx.value : currentIdx.value - 1 }

onMounted(() => {
  window.addEventListener('resize', onResize)
  countdownTimer = setInterval(() => { now.value = Date.now() }, 1000)
  carouselTimer = setInterval(() => { if (!pauseCarousel.value && maxIdx.value > 0) nextCard() }, 4000)

  if (contentEl.value) {
    gsap.from(contentEl.value, {
      y: 20, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: contentEl.value, start: 'top 85%', toggleActions: 'play none none none' },
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (countdownTimer) clearInterval(countdownTimer)
  if (carouselTimer) clearInterval(carouselTimer)
})
</script>
