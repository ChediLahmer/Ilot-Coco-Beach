<template>
  <section id="hero" class="relative overflow-hidden px-6 pb-12 pt-32 text-white md:px-10 lg:px-16">
    <div class="absolute inset-0">
      <video
        class="h-full w-full object-cover object-center"
        :poster="heroPoster"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
        tabindex="-1"
      >
        <source :src="heroVideo" type="video/mp4" />
      </video>
      <div class="absolute inset-0 bg-[linear-gradient(112deg,rgba(11,35,48,0.78)_0%,rgba(15,85,99,0.56)_42%,rgba(255,125,97,0.18)_100%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,125,97,0.24),transparent_24%),radial-gradient(circle_at_top_left,rgba(239,186,82,0.2),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(135,225,219,0.18),transparent_30%)]" />
    </div>

    <div class="hero-grain absolute inset-0 pointer-events-none" />
    <div class="pointer-events-none absolute -right-16 top-28 h-56 w-56 rounded-full bg-coral/22 blur-3xl" />
    <div class="pointer-events-none absolute -left-12 bottom-20 h-48 w-48 rounded-full bg-ocean-light/18 blur-3xl" />

    <div class="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <div ref="contentEl" class="max-w-3xl self-end pb-8 lg:pb-16">
        <p data-animate class="section-kicker !text-white/72">
          {{ t('hero.welcome') }}
        </p>

        <h1
          data-animate
          class="mt-6 font-brand text-[clamp(3.7rem,8vw,7.5rem)] leading-[0.88] tracking-[-0.05em] text-white"
        >
          {{ config.name }}
        </h1>

        <p
          data-animate
          class="mt-5 max-w-2xl font-heading text-sm font-semibold uppercase tracking-[0.28em] text-gold-light/90 md:text-base"
        >
          {{ t('hero.tagline') }}
        </p>

        <p
          data-animate
          class="mt-6 max-w-2xl text-base leading-8 text-white/74 md:text-lg"
        >
          {{ t('hero.description') }}
        </p>

        <div data-animate class="mt-10 flex flex-wrap gap-3">
          <a
            href="#reservation"
            class="premium-button"
            @click.prevent="scrollTo('reservation')"
          >
            {{ t('nav.reservation') }}
          </a>
          <router-link
            to="/menu"
            class="premium-button-secondary"
          >
            {{ t('hero.cta') }}
          </router-link>
        </div>

        <div data-animate class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/72">
          <a
            href="#experience"
            class="font-heading uppercase tracking-[0.18em] text-white/82 hover:text-coral-light"
            @click.prevent="scrollTo('experience')"
          >
            {{ t('nav.experience') }}
          </a>
          <a
            href="#flash-offers"
            class="font-heading uppercase tracking-[0.18em] text-white/82 hover:text-coral-light"
            @click.prevent="scrollTo('flash-offers')"
          >
            {{ t('flash.title') }}
          </a>
          <a
            :href="'tel:' + config.phone"
            class="font-heading uppercase tracking-[0.18em] text-coral-light hover:text-white"
          >
            {{ config.phone }}
          </a>
        </div>

        <div data-animate class="mt-10 grid gap-3 md:grid-cols-3">
          <article class="metric-card">
            <p class="text-[0.68rem] font-heading font-semibold uppercase tracking-[0.22em] text-white/52">
              {{ t('hero.notes.locationLabel') }}
            </p>
            <p class="mt-3 text-sm font-medium text-white/88 md:text-base">
              {{ t('hero.notes.locationValue') }}
            </p>
          </article>

          <article class="metric-card">
            <p class="text-[0.68rem] font-heading font-semibold uppercase tracking-[0.22em] text-white/52">
              {{ t('hero.notes.arrivalLabel') }}
            </p>
            <p class="mt-3 text-sm font-medium text-white/88 md:text-base">
              {{ t('hero.notes.arrivalValue') }}
            </p>
          </article>

          <article class="metric-card">
            <p class="text-[0.68rem] font-heading font-semibold uppercase tracking-[0.22em] text-white/52">
              {{ t('hero.notes.occasionLabel') }}
            </p>
            <p class="mt-3 text-sm font-medium text-white/88 md:text-base">
              {{ t('hero.notes.occasionValue') }}
            </p>
          </article>
        </div>
      </div>

      <div ref="panelEl" class="self-end lg:pb-16">
        <div class="premium-card-dark rounded-[2rem] p-6 sm:p-8 shadow-[0_24px_70px_rgba(11,35,48,0.34)]">
          <p class="font-heading text-[0.72rem] font-bold uppercase tracking-[0.24em] text-gold-light/80">
            {{ t('hero.panelTitle') }}
          </p>
          <p class="mt-4 font-brand text-3xl leading-tight text-white sm:text-4xl">
            {{ t('hero.panelText') }}
          </p>

          <div class="my-6 h-px bg-white/10" />

          <div class="space-y-4 text-sm text-white/78">
            <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
              <span class="font-heading uppercase tracking-[0.16em] text-white/48">{{ t('location.address') }}</span>
              <span class="max-w-[16rem] text-right leading-6">{{ config.address }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
              <span class="font-heading uppercase tracking-[0.16em] text-white/48">{{ t('location.hours') }}</span>
              <span class="text-right">{{ t('location.hoursValue') }}</span>
            </div>
            <div class="flex items-start justify-between gap-4">
              <span class="font-heading uppercase tracking-[0.16em] text-white/48">{{ t('nav.reservation') }}</span>
              <a :href="'tel:' + config.phone" class="text-right text-white hover:text-gold-light">
                {{ config.phone }}
              </a>
            </div>
          </div>

          <a
            href="#contact"
            class="mt-8 inline-flex items-center gap-3 text-sm font-heading font-semibold uppercase tracking-[0.18em] text-white/84"
            @click.prevent="scrollTo('contact')"
          >
            {{ t('nav.contact') }}
            <span class="block h-px w-10 bg-gold/70" />
          </a>
        </div>
      </div>
    </div>

    <div class="relative z-10 mx-auto mt-4 flex max-w-7xl justify-center lg:justify-start">
      <span class="scroll-line block h-10 w-px bg-white/20" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'

import { useConfig } from '@/composables/useConfig'
import heroVideo from '@/assets/images/beach-video.mp4'
import heroPoster from '@/assets/images/overwater-cabin.jpg'

const { t } = useI18n()
const config = useConfig()

const contentEl = ref(null)
const panelEl = ref(null)

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const animatedEls = contentEl.value
    ? Array.from(contentEl.value.querySelectorAll('[data-animate]'))
    : []

  gsap.from(animatedEls, {
    y: 28,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    clearProps: 'all',
  })

  if (panelEl.value) {
    gsap.from(panelEl.value, {
      y: 24,
      opacity: 0,
      duration: 1,
      delay: 0.35,
      ease: 'power3.out',
      clearProps: 'all',
    })
  }
})
</script>

<style scoped>
.hero-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
}

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
