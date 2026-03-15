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
      class="absolute inset-0 w-full h-full object-cover scale-105"
      style="filter: brightness(0.85) saturate(1.1)"
    >
      <source :src="heroVideo" type="video/mp4" />
    </video>

    <!-- Cinematic gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

    <!-- Film grain noise overlay -->
    <div class="hero-grain absolute inset-0 pointer-events-none" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
      <!-- Welcome text -->
      <p
        ref="welcomeEl"
        class="font-body text-xs uppercase tracking-[0.3em] text-white/60 mb-6"
      >
        {{ t('hero.welcome') }}
      </p>

      <!-- Brand -->
      <h1
        ref="brandEl"
        class="font-brand font-black text-7xl md:text-[9rem] text-white leading-none mb-3"
      >
        ÎLOT
      </h1>

      <!-- Subtitle -->
      <h2
        ref="subEl"
        class="font-heading text-lg md:text-xl font-light tracking-[0.2em] uppercase text-gold-light mb-6"
      >
        Coco Beach
      </h2>

      <!-- Gold divider -->
      <div ref="dividerEl" class="w-12 h-[1px] bg-gold/50 my-5" />

      <!-- Tagline -->
      <p
        ref="taglineEl"
        class="font-body italic text-sm md:text-base text-white/60 max-w-sm mb-10"
      >
        {{ t('hero.tagline') }}
      </p>

      <!-- CTA -->
      <a
        ref="ctaEl"
        href="#experience"
        class="border border-white/30 text-white hover:bg-white/10 rounded-none px-8 py-3 text-xs uppercase tracking-[0.2em] font-heading font-medium transition-all duration-300"
        @click.prevent="scrollToExperience"
      >
        {{ t('hero.cta') }}
      </a>
    </div>

    <!-- Location text -->
    <p class="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs text-white/30 tracking-wide">
      Ghar El Melh — Tunisie
    </p>

    <!-- Scroll indicator -->
    <div ref="scrollEl" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
      <span class="scroll-line block w-[1px] h-8 bg-white/20" />
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
const dividerEl = ref(null)
const taglineEl = ref(null)
const ctaEl = ref(null)
const scrollEl = ref(null)

function scrollToExperience() {
  const el = document.getElementById('experience')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  const els = [
    welcomeEl.value,
    brandEl.value,
    subEl.value,
    dividerEl.value,
    taglineEl.value,
    ctaEl.value,
  ].filter(Boolean)

  gsap.from(els, {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    clearProps: 'all',
  })
})
</script>

<style scoped>
/* Film grain noise */
.hero-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

/* Scroll line animation */
.scroll-line {
  animation: scroll-drift 2s ease-in-out infinite;
}

@keyframes scroll-drift {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.2;
  }
  50% {
    transform: translateY(6px);
    opacity: 0.5;
  }
}
</style>
