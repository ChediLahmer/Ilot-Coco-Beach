<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const config = useConfig()

const infoCards = ref(null)

const mapsEmbedUrl = computed(() => {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${config.lng}!3d${config.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${config.lat},${config.lng}!5e0!3m2!1sen!2s!4v1700000000000`
})

const directionsUrl = computed(() => {
  return `https://www.google.com/maps/dir/?api=1&destination=${config.lat},${config.lng}`
})

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    const cards = infoCards.value?.querySelectorAll('.info-card')
    if (cards && cards.length) {
      gsap.from(cards, {
        x: 60,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: infoCards.value,
          start: 'top 80%',
          once: true,
        },
      })
    }
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <section id="contact" class="py-20 px-6 md:px-16 bg-white">
    <!-- Title -->
    <h2 class="font-display text-ocean text-4xl text-center mb-12">
      {{ t('location.title') }}
    </h2>

    <!-- Two column layout -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Left: Map -->
      <div class="rounded-2xl overflow-hidden shadow-lg h-[400px]">
        <iframe
          :src="mapsEmbedUrl"
          width="100%"
          height="100%"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <!-- Right: Info cards -->
      <div ref="infoCards" class="flex flex-col gap-4 justify-center">
        <!-- Address -->
        <div class="info-card bg-sand rounded-xl p-5 flex items-start gap-4">
          <div class="w-10 h-10 bg-ocean/10 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h3 class="font-heading font-semibold text-charcoal mb-1">{{ t('location.address') }}</h3>
            <p class="text-charcoal/70">{{ config.address }}</p>
          </div>
        </div>

        <!-- Phone -->
        <a :href="`tel:${config.phone}`" class="info-card bg-sand rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-ocean/10 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-heading font-semibold text-charcoal mb-1">{{ t('location.phone') }}</h3>
            <p class="text-charcoal/70">{{ config.phone }}</p>
          </div>
        </a>

        <!-- Hours -->
        <div class="info-card bg-sand rounded-xl p-5 flex items-start gap-4">
          <div class="w-10 h-10 bg-ocean/10 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h3 class="font-heading font-semibold text-charcoal mb-1">{{ t('location.hours') }}</h3>
            <p class="text-charcoal/70">{{ t('location.hoursValue') }}</p>
          </div>
        </div>

        <!-- How to get there -->
        <div class="info-card bg-sand rounded-xl p-5 flex items-start gap-4">
          <div class="w-10 h-10 bg-ocean/10 rounded-full flex items-center justify-center shrink-0">
            <!-- Boat icon -->
            <svg class="w-5 h-5 text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 20c2-1 4-2 6-2s4 1 6 2 4 2 6 2"/>
              <path d="M4 18l-1-5h18l-1 5"/>
              <path d="M12 2v11"/>
              <path d="M8 7l4-5 4 5"/>
            </svg>
          </div>
          <div>
            <h3 class="font-heading font-semibold text-charcoal mb-1">{{ t('location.howTo') }}</h3>
            <p class="text-charcoal/70">{{ t('location.howToDesc') }}</p>
          </div>
        </div>

        <!-- Get directions link -->
        <a
          :href="directionsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="info-card inline-flex items-center gap-2 text-ocean hover:text-ocean-dark font-heading font-semibold transition-colors mt-2"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
            <path d="M20.18 8.02l-7.39-4.27a1.58 1.58 0 00-1.58 0L3.82 8.02a1.58 1.58 0 00-.79 1.37v5.22c0 .57.3 1.09.79 1.37l7.39 4.27c.49.28 1.1.28 1.58 0l7.39-4.27c.49-.28.79-.8.79-1.37V9.39c0-.57-.3-1.09-.79-1.37z"/>
          </svg>
          {{ t('location.directions') }}
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Social media row -->
    <div class="flex items-center justify-center gap-6 mt-12">
      <a
        :href="config.instagram"
        target="_blank"
        rel="noopener noreferrer"
        class="text-ocean hover:text-coral transition-colors"
        aria-label="Instagram"
      >
        <!-- Instagram icon -->
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      </a>
      <a
        :href="config.facebook"
        target="_blank"
        rel="noopener noreferrer"
        class="text-ocean hover:text-coral transition-colors"
        aria-label="Facebook"
      >
        <!-- Facebook icon -->
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
    </div>
  </section>
</template>
