<template>
  <section
    v-if="flashSale.isActive"
    class="relative py-16 px-6 md:px-16 overflow-hidden"
    style="background: linear-gradient(135deg, var(--color-ocean-dark) 0%, var(--color-charcoal) 100%)"
  >
    <!-- Decorative circles -->
    <div class="absolute top-10 right-10 w-40 h-40 bg-ocean-light/10 rounded-full blur-2xl" />
    <div class="absolute bottom-10 left-10 w-32 h-32 bg-coral/10 rounded-full blur-2xl" />

    <div ref="contentEl" class="relative z-10 max-w-4xl mx-auto text-center text-white">
      <!-- Flash sale badge -->
      <div class="inline-flex items-center gap-2 bg-coral/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
        <span class="w-2.5 h-2.5 bg-coral rounded-full animate-pulse" />
        <span class="font-heading font-bold text-sm text-coral-light uppercase tracking-wider">
          {{ t('flash.title') }}
        </span>
      </div>

      <!-- Discount badge with rotating dashed ring -->
      <div class="flex justify-center mb-6">
        <div class="relative flex items-center justify-center w-32 h-32">
          <!-- Rotating dashed SVG circle -->
          <svg
            class="absolute inset-0 w-32 h-32 dashed-ring text-coral-light/50"
            viewBox="0 0 128 128"
            fill="none"
          >
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="8 6"
              fill="none"
            />
          </svg>
          <!-- Inner coral badge -->
          <div class="w-24 h-24 bg-coral rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-coral/30">
            <span class="font-heading font-black text-2xl text-white">
              -{{ flashSale.discountPercent }}%
            </span>
          </div>
        </div>
      </div>

      <h2 class="font-heading text-2xl md:text-3xl font-bold mb-3">
        {{ flashSale.title[locale] || flashSale.title.fr }}
      </h2>
      <p class="font-body text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-8">
        {{ flashSale.description[locale] || flashSale.description.fr }}
      </p>

      <!-- Countdown -->
      <div v-if="!expired" class="flex justify-center gap-3 md:gap-4 mb-8">
        <div
          v-for="unit in countdownUnits"
          :key="unit.label"
          class="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px]"
        >
          <div class="font-heading font-black text-2xl md:text-3xl text-white">
            {{ String(unit.value).padStart(2, '0') }}
          </div>
          <div class="font-body text-white/60 text-xs uppercase tracking-wide mt-1">
            {{ unit.label }}
          </div>
        </div>
      </div>
      <p v-else class="text-coral-light text-lg font-heading font-semibold mb-8">
        {{ t('flash.expired') }}
      </p>

      <!-- CTA -->
      <a
        v-if="!expired"
        href="#reservation"
        class="inline-block bg-coral hover:bg-coral-light text-white font-heading font-semibold px-8 py-3 rounded-full text-lg transition-colors duration-200 shadow-lg"
        @click.prevent="scrollToReservation"
      >
        {{ t('flash.bookNow') }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flashSale } from '@/data/mock'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()
const contentEl = ref(null)
const now = ref(Date.now())
let timer = null

const endTime = new Date(flashSale.endsAt).getTime()
const expired = computed(() => now.value >= endTime)

const countdownUnits = computed(() => {
  const diff = Math.max(0, endTime - now.value)
  const seconds = Math.floor(diff / 1000)
  return [
    { label: t('flash.days'), value: Math.floor(seconds / 86400) },
    { label: t('flash.hours'), value: Math.floor((seconds % 86400) / 3600) },
    { label: t('flash.minutes'), value: Math.floor((seconds % 3600) / 60) },
    { label: t('flash.seconds'), value: seconds % 60 },
  ]
})

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  // Gentle slide-up, NO opacity:0
  if (contentEl.value) {
    gsap.from(contentEl.value, {
      y: 30,
      scale: 0.98,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contentEl.value,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
