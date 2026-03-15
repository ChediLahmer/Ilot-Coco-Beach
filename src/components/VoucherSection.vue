<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vouchers } from '@/data/mock.js'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const cardsContainer = ref(null)

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.voucher-card', {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.7)',
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

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <section id="vouchers" class="py-16 px-6 bg-sand sand-texture">
    <!-- Title -->
    <div class="text-center mb-12">
      <h2 class="font-display text-ocean text-4xl md:text-5xl">
        {{ t('vouchers.title') }}
      </h2>
      <p class="text-charcoal/60 text-lg mt-3 max-w-xl mx-auto">
        {{ t('vouchers.subtitle') }}
      </p>
    </div>

    <!-- Voucher cards -->
    <div
      ref="cardsContainer"
      class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
    >
      <div
        v-for="voucher in vouchers"
        :key="voucher.id"
        class="voucher-card relative bg-white rounded-2xl p-6 shadow-lg border-2 border-dashed border-ocean/30 overflow-hidden"
      >
        <!-- Perforated edge left -->
        <div class="absolute top-0 -left-3 h-full w-6 flex flex-col justify-around pointer-events-none">
          <div
            v-for="n in 8"
            :key="'l' + n"
            class="w-6 h-6 rounded-full bg-sand"
          />
        </div>

        <!-- Perforated edge right -->
        <div class="absolute top-0 -right-3 h-full w-6 flex flex-col justify-around pointer-events-none">
          <div
            v-for="n in 8"
            :key="'r' + n"
            class="w-6 h-6 rounded-full bg-sand"
          />
        </div>

        <!-- Discount badge -->
        <div class="text-center mb-4">
          <div class="inline-flex items-baseline gap-1">
            <span class="font-display text-coral text-5xl leading-none">
              {{ voucher.discountPercent }}%
            </span>
          </div>
          <p class="text-charcoal/60 text-sm mt-1">
            {{ t('vouchers.off') }}
          </p>
        </div>

        <!-- Dashed divider -->
        <div class="border-t-2 border-dashed border-ocean/20 my-4" />

        <!-- Code -->
        <div class="text-center mb-4">
          <p class="text-xs text-charcoal/50 mb-1 uppercase tracking-wide">
            {{ t('vouchers.code') }}
          </p>
          <div class="inline-flex items-center gap-2 bg-sand px-4 py-2 rounded-lg">
            <span class="font-mono text-lg font-bold tracking-widest text-ocean">
              {{ voucher.code }}
            </span>
            <!-- Copy icon -->
            <svg
              class="w-4 h-4 text-ocean/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </div>
        </div>

        <!-- Valid until -->
        <p class="text-sm text-charcoal/50 text-center">
          {{ t('vouchers.validUntil') }} {{ formatDate(voucher.validUntil) }}
        </p>

        <!-- Use code hint -->
        <p class="text-xs text-charcoal/40 text-center mt-3 italic">
          {{ t('vouchers.useCode') }}
        </p>

        <!-- Active indicator dot -->
        <div
          v-if="voucher.isActive"
          class="absolute top-3 right-4 flex items-center gap-1"
        >
          <span class="w-2 h-2 rounded-full bg-leaf animate-pulse" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.voucher-card {
  background-image:
    radial-gradient(circle at 0% 50%, var(--color-sand) 12px, transparent 12px),
    radial-gradient(circle at 100% 50%, var(--color-sand) 12px, transparent 12px);
}
</style>
