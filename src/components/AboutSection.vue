<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import waterSwingImg from '@/assets/images/water-swing.jpg'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const featureCards = ref(null)
const parallaxImage = ref(null)
const parallaxContainer = ref(null)

const features = [
  {
    key: 'cabins',
    icon: 'cabin',
  },
  {
    key: 'water',
    icon: 'water',
  },
  {
    key: 'hammocks',
    icon: 'hammock',
  },
  {
    key: 'vibes',
    icon: 'vibes',
  },
]

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    // Stagger feature cards from left
    gsap.from('.about-feature-card', {
      x: -60,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: featureCards.value,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })

    // Parallax effect on image
    gsap.to(parallaxImage.value, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: parallaxContainer.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <section id="about" class="py-20 px-6 md:px-16 sand-texture bg-sand">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left side -->
      <div>
        <h2 class="font-display text-ocean text-4xl md:text-5xl">
          {{ t('about.title') }}
        </h2>
        <p class="text-charcoal/80 text-lg leading-relaxed mt-6">
          {{ t('about.description') }}
        </p>

        <!-- 2x2 Feature Grid -->
        <div ref="featureCards" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="about-feature-card bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition border-l-4 border-ocean"
          >
            <!-- Cabin icon -->
            <svg
              v-if="feature.icon === 'cabin'"
              class="w-8 h-8 text-ocean mb-2"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 16L16 6L28 16" />
              <path d="M8 14V26H24V14" />
              <path d="M14 26V20H18V26" />
              <path d="M2 28C6 26 10 28 14 26C18 28 22 26 26 28C28 27 30 28 30 28" />
            </svg>
            <!-- Water icon -->
            <svg
              v-if="feature.icon === 'water'"
              class="w-8 h-8 text-ocean mb-2"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 4C16 4 8 14 8 20C8 24.4 11.6 28 16 28C20.4 28 24 24.4 24 20C24 14 16 4 16 4Z" />
              <path d="M12 22C13 23.5 14.5 24 16 24" />
            </svg>
            <!-- Hammock icon -->
            <svg
              v-if="feature.icon === 'hammock'"
              class="w-8 h-8 text-ocean mb-2"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 8V26" />
              <path d="M28 8V26" />
              <path d="M4 14C10 24 22 24 28 14" />
              <path d="M2 8H6" />
              <path d="M26 8H30" />
            </svg>
            <!-- Vibes / Palm tree icon -->
            <svg
              v-if="feature.icon === 'vibes'"
              class="w-8 h-8 text-ocean mb-2"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 14V28" />
              <path d="M16 14C16 14 10 8 4 10C4 10 8 14 16 14Z" />
              <path d="M16 14C16 14 22 8 28 10C28 10 24 14 16 14Z" />
              <path d="M16 10C16 10 14 4 8 4C8 4 10 10 16 10Z" />
              <path d="M16 10C16 10 18 4 24 4C24 4 22 10 16 10Z" />
              <path d="M12 28H20" />
            </svg>

            <h3 class="font-heading font-bold text-sm text-charcoal">
              {{ t(`about.features.${feature.key}`) }}
            </h3>
            <p class="text-xs text-charcoal/60 mt-1">
              {{ t(`about.features.${feature.key}Desc`) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="relative flex justify-center">
        <!-- Decorative dashed circle -->
        <div class="deco-circle absolute -top-5 -right-5 w-72 h-72 rounded-full border-2 border-dashed border-driftwood opacity-40 pointer-events-none"></div>

        <!-- Image container -->
        <div
          ref="parallaxContainer"
          class="rounded-3xl overflow-hidden shadow-2xl relative w-full max-w-lg"
        >
          <img
            ref="parallaxImage"
            :src="waterSwingImg"
            alt="Water swing at Ilot Coco Beach"
            class="w-full h-auto object-cover scale-110"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.deco-circle {
  animation: spin-slow 30s linear infinite;
}
</style>
