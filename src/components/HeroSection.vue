<template>
  <section
    id="hero"
    class="relative w-full overflow-hidden"
    style="height: calc(100vh - 72px); margin-top: 72px"
  >
    <!-- Video background -->
    <video
      ref="videoEl"
      autoplay
      muted
      loop
      playsinline
      :poster="heroPoster"
      class="absolute inset-0 w-full h-full object-cover"
    >
      <source :src="heroVideo" type="video/mp4" />
    </video>

    <!-- Gradient overlay — warmer tones -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-charcoal/60" />

    <!-- Organic decorative blob -->
    <div
      class="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, var(--color-coral) 0%, var(--color-gold) 100%)"
    />
    <div
      class="absolute top-32 left-8 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, var(--color-gold-light) 0%, var(--color-ocean-light) 100%)"
    />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
      <p ref="welcomeEl" class="text-lg md:text-xl font-body tracking-wider mb-2 opacity-90">
        {{ t('hero.welcome') }}
      </p>
      <h1 ref="brandEl" class="font-display text-6xl sm:text-7xl md:text-8xl text-shimmer drop-shadow-lg mb-2">
        ILOT
      </h1>
      <h2 ref="subEl" class="font-heading text-2xl sm:text-3xl font-light tracking-wide mb-4 text-gold-light">
        Coco Beach
      </h2>
      <p ref="taglineEl" class="italic text-base md:text-lg opacity-80 mb-8 max-w-md">
        {{ t('hero.tagline') }}
      </p>
      <a
        ref="ctaEl"
        href="#experience"
        class="bg-coral hover:bg-coral-light text-white font-heading font-semibold px-8 py-3 rounded-full text-lg transition-colors duration-200 shadow-lg"
        @click.prevent="scrollToExperience"
      >
        {{ t('hero.cta') }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'

import heroVideo from '@/assets/images/beach-video.mp4'
import heroPoster from '@/assets/images/hero-beach-lounge.jpg'

const { t } = useI18n()

const videoEl = ref(null)
const welcomeEl = ref(null)
const brandEl = ref(null)
const subEl = ref(null)
const taglineEl = ref(null)
const ctaEl = ref(null)

function scrollToExperience() {
  const el = document.getElementById('experience')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  // Stagger fade-in from below — elements start visible, animate FROM offset
  const els = [welcomeEl.value, brandEl.value, subEl.value, taglineEl.value, ctaEl.value].filter(Boolean)
  gsap.from(els, {
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power2.out',
    clearProps: 'all',
  })
})
</script>
