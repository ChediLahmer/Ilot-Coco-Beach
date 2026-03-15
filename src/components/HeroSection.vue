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
      preload="auto"
      :poster="heroPoster"
      class="absolute inset-0 w-full h-full object-cover"
      style="filter: saturate(1.1) contrast(1.05)"
    >
      <source :src="heroVideo" type="video/mp4" />
    </video>

    <!-- Overlay — cinematic gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
      <h1 ref="brandEl" class="font-brand font-black text-8xl md:text-[10rem] text-white tracking-tight">
        ÎLOT
      </h1>
      <h2 ref="subEl" class="font-brand italic text-xl md:text-2xl text-white/80 tracking-wide mt-2">
        Coco Beach
      </h2>

      <!-- Gold divider -->
      <div ref="dividerEl" class="w-12 h-[1px] bg-gold/60 mx-auto my-6" />

      <p ref="taglineEl" class="font-body text-sm md:text-base text-white/70 max-w-sm tracking-wide">
        {{ t('hero.tagline') }}
      </p>

      <!-- CTA button — coral -->
      <a
        ref="ctaEl"
        href="#experience"
        class="bg-coral hover:bg-coral-light text-white font-heading font-semibold px-8 py-3 rounded-full mt-8 text-sm uppercase tracking-wider transition-colors duration-200"
        @click.prevent="scrollToExperience"
      >
        {{ t('hero.cta') }}
      </a>

      <!-- Scroll indicator -->
      <div ref="scrollEl" class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
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
const brandEl = ref(null)
const subEl = ref(null)
const dividerEl = ref(null)
const taglineEl = ref(null)
const ctaEl = ref(null)
const scrollEl = ref(null)

function scrollToExperience() {
  const el = document.getElementById('experience')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  const els = [brandEl.value, subEl.value, dividerEl.value, taglineEl.value, ctaEl.value].filter(Boolean)
  gsap.from(els, {
    y: 30,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power2.out',
    clearProps: 'all',
  })
})
</script>
