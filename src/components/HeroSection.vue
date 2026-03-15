<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import heroImg from '@/assets/images/hero-beach-lounge.jpg'

const { t } = useI18n()

const welcomeRef = ref(null)
const brandRef = ref(null)
const subRef = ref(null)
const taglineRef = ref(null)
const ctaRef = ref(null)
const chevronRef = ref(null)

onMounted(() => {
  const elements = [
    welcomeRef.value,
    brandRef.value,
    subRef.value,
    taglineRef.value,
    ctaRef.value,
  ].filter(Boolean)

  gsap.set(elements, { opacity: 0, y: 40 })

  gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.3,
  })

  // Chevron bounce
  if (chevronRef.value) {
    gsap.to(chevronRef.value, {
      y: 10,
      duration: 1.2,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    })
  }
})
</script>

<template>
  <section id="hero" class="relative w-full overflow-hidden" style="height: calc(100vh - 72px); margin-top: 72px">
    <!-- Background image with ken-burns -->
    <div class="absolute inset-0">
      <img
        :src="heroImg"
        alt="Ilot Coco Beach"
        class="ken-burns w-full h-full object-cover"
      />
    </div>

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
      <p
        ref="welcomeRef"
        class="font-heading text-white text-xl md:text-2xl mb-2"
      >
        {{ t('hero.welcome') }}
      </p>

      <h1
        ref="brandRef"
        class="font-display text-5xl md:text-8xl text-white leading-none mb-2"
        style="text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)"
      >
        ILOT
      </h1>

      <p
        ref="subRef"
        class="font-heading text-2xl md:text-3xl text-white/90 mb-4"
      >
        Coco Beach
      </p>

      <p
        ref="taglineRef"
        class="text-lg text-white/80 italic mb-8 max-w-md"
      >
        {{ t('hero.tagline') }}
      </p>

      <a
        ref="ctaRef"
        href="#experience"
        class="hero-cta bg-coral text-white font-heading font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105"
        @click.prevent="
          document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })
        "
      >
        {{ t('hero.cta') }}
      </a>
    </div>

    <!-- Scroll-down chevron -->
    <div
      ref="chevronRef"
      class="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-8 h-8 text-white/70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Wave separator -->
    <div class="absolute bottom-0 left-0 w-full z-10 leading-[0]">
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        class="w-full h-[60px] md:h-[80px]"
      >
        <path
          d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z"
          class="fill-sand"
        />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.hero-cta {
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
}

.hero-cta:hover {
  box-shadow: 0 4px 30px rgba(249, 115, 22, 0.6), 0 0 0 4px rgba(249, 115, 22, 0.15);
}
</style>
