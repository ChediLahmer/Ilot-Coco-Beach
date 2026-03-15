<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flashSale } from '@/data/mock.js'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()

const timerContainer = ref(null)
const badgeRef = ref(null)
let ctx
let timerInterval = null

// Reactive countdown state
const now = ref(Date.now())

const endTime = computed(() => new Date(flashSale.endsAt).getTime())

const isExpired = computed(() => now.value >= endTime.value)

const timeLeft = computed(() => {
  const diff = Math.max(0, endTime.value - now.value)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
})

const pad = (n) => String(n).padStart(2, '0')

const localizedTitle = computed(() => {
  const lang = locale.value
  return flashSale.title[lang] || flashSale.title.fr
})

const localizedDescription = computed(() => {
  const lang = locale.value
  return flashSale.description[lang] || flashSale.description.fr
})

onMounted(() => {
  // Start countdown timer
  timerInterval = setInterval(() => {
    now.value = Date.now()
    if (now.value >= endTime.value) {
      clearInterval(timerInterval)
    }
  }, 1000)

  // GSAP animations
  ctx = gsap.context(() => {
    // Timer boxes slide up with stagger
    gsap.from('.timer-box', {
      y: 60,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: timerContainer.value,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    // Pulsing badge
    if (badgeRef.value) {
      gsap.to(badgeRef.value, {
        scale: 1.08,
        duration: 0.8,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      })
    }
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
  if (timerInterval) clearInterval(timerInterval)
})

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section
    id="flash-sale"
    class="relative py-16 px-6 overflow-hidden"
    :style="{
      background: `linear-gradient(135deg, var(--color-ocean-dark) 0%, var(--color-charcoal) 100%)`,
    }"
  >
    <!-- Background image overlay -->
    <div
      v-if="flashSale.image"
      class="absolute inset-0 bg-cover bg-center opacity-10"
      :style="{ backgroundImage: `url(${flashSale.image})` }"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

    <!-- Content -->
    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <!-- Title -->
      <h2 class="font-display text-white text-4xl md:text-5xl mb-3">
        {{ t('flash.title') }}
      </h2>
      <p class="text-white/60 text-lg mb-8">
        {{ t('flash.subtitle') }}
      </p>

      <!-- Discount badge -->
      <div class="flex justify-center mb-8">
        <div
          ref="badgeRef"
          class="relative w-28 h-28 rounded-full bg-coral flex flex-col items-center justify-center shadow-lg"
          style="box-shadow: 0 0 40px rgba(249, 115, 22, 0.4)"
        >
          <span class="font-display text-white text-3xl leading-none">
            {{ flashSale.discountPercent }}%
          </span>
          <span class="text-white/90 text-xs font-heading font-bold uppercase tracking-wider mt-1">
            OFF
          </span>
          <!-- Decorative ring -->
          <div class="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-spin" style="animation-duration: 20s" />
        </div>
      </div>

      <!-- Flash sale title & description -->
      <h3 class="font-heading font-bold text-white text-xl md:text-2xl mb-2">
        {{ localizedTitle }}
      </h3>
      <p class="text-white/80 max-w-lg mx-auto mb-10">
        {{ localizedDescription }}
      </p>

      <!-- Countdown timer -->
      <div
        v-if="!isExpired"
        ref="timerContainer"
        class="flex justify-center gap-3 md:gap-5 mb-10"
      >
        <!-- Days -->
        <div class="timer-box bg-white/10 backdrop-blur rounded-xl p-4 min-w-[80px] text-center">
          <span class="block text-4xl md:text-5xl font-bold text-white font-heading leading-none">
            {{ pad(timeLeft.days) }}
          </span>
          <span class="block text-sm text-white/60 mt-2">
            {{ t('flash.days') }}
          </span>
        </div>

        <!-- Hours -->
        <div class="timer-box bg-white/10 backdrop-blur rounded-xl p-4 min-w-[80px] text-center">
          <span class="block text-4xl md:text-5xl font-bold text-white font-heading leading-none">
            {{ pad(timeLeft.hours) }}
          </span>
          <span class="block text-sm text-white/60 mt-2">
            {{ t('flash.hours') }}
          </span>
        </div>

        <!-- Separator -->
        <div class="hidden md:flex items-center text-white/40 text-3xl font-bold self-start mt-4">:</div>

        <!-- Minutes -->
        <div class="timer-box bg-white/10 backdrop-blur rounded-xl p-4 min-w-[80px] text-center">
          <span class="block text-4xl md:text-5xl font-bold text-white font-heading leading-none">
            {{ pad(timeLeft.minutes) }}
          </span>
          <span class="block text-sm text-white/60 mt-2">
            {{ t('flash.minutes') }}
          </span>
        </div>

        <!-- Seconds -->
        <div class="timer-box bg-white/10 backdrop-blur rounded-xl p-4 min-w-[80px] text-center">
          <span class="block text-4xl md:text-5xl font-bold text-white font-heading leading-none">
            {{ pad(timeLeft.seconds) }}
          </span>
          <span class="block text-sm text-white/60 mt-2">
            {{ t('flash.seconds') }}
          </span>
        </div>
      </div>

      <!-- Expired message -->
      <div
        v-else
        class="mb-10 py-6"
      >
        <p class="text-white/60 text-xl font-heading italic">
          {{ t('flash.expired') }}
        </p>
      </div>

      <!-- CTA button -->
      <button
        class="inline-flex items-center gap-2 bg-coral text-white font-heading font-semibold rounded-full px-8 py-4 text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
        style="box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4)"
        @click="scrollToReservation"
      >
        <!-- Lightning bolt icon -->
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" />
        </svg>
        {{ t('flash.bookNow') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
@keyframes pulse-coral {
  0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
  50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); }
}
</style>
