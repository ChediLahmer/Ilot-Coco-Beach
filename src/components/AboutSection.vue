<template>
  <section id="about" class="relative bg-sand sand-texture py-20 px-6 md:px-16 overflow-hidden">
    <!-- Section editorial number -->
    <span class="section-number top-6 left-6 text-charcoal">01</span>

    <!-- Organic decorative blob -->
    <div
      class="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, var(--color-gold-light) 0%, var(--color-ocean-light) 100%)"
    />
    <div
      class="absolute bottom-10 -left-20 w-48 h-48 rounded-full opacity-8 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, var(--color-coral) 0%, var(--color-gold) 100%)"
    />

    <div class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Text column — lg:col-span-5 -->
      <div ref="textCol" class="lg:col-span-5">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-6 gold-accent">
          {{ t('about.title') }}
        </h2>
        <p class="font-body text-charcoal/80 text-base md:text-lg leading-relaxed mb-8">
          {{ t('about.description') }}
        </p>

        <!-- Feature cards 2x2 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <span class="text-2xl mb-2 block">{{ feature.icon }}</span>
            <h3 class="font-heading font-bold text-charcoal text-sm mb-1">
              {{ t(`about.features.${feature.key}`) }}
            </h3>
            <p class="font-body text-charcoal/60 text-xs leading-relaxed">
              {{ t(`about.features.${feature.key}Desc`) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Image column — lg:col-span-7 -->
      <div ref="imageCol" class="relative lg:col-span-7">
        <img
          :src="waterSwingImg"
          alt="Water swing at Ilot Coco Beach"
          class="rounded-3xl shadow-2xl w-full object-cover max-h-[520px] rotate-1"
        />
        <!-- Decorative accent -->
        <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-ocean/10 rounded-full -z-10" />
        <div class="absolute -top-4 -right-4 w-16 h-16 bg-coral/10 rounded-full -z-10" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import waterSwingImg from '@/assets/images/water-swing.jpg'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const textCol = ref(null)
const imageCol = ref(null)

const features = [
  { key: 'cabins', icon: '🏠' },
  { key: 'water', icon: '🌊' },
  { key: 'hammocks', icon: '🏖️' },
  { key: 'vibes', icon: '🎶' },
]

onMounted(() => {
  // Subtle animations — elements are visible by default, animate y and scale slightly
  if (textCol.value) {
    gsap.from(textCol.value, {
      y: 30,
      scale: 0.98,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: textCol.value,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  }
  if (imageCol.value) {
    gsap.from(imageCol.value, {
      y: 40,
      scale: 0.96,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: imageCol.value,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  }
})
</script>
