<template>
  <section id="experience" class="relative bg-sand sand-texture py-20 px-6 md:px-16">
    <!-- Section editorial number -->
    <div class="section-number">03</div>

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 gold-accent">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('experience.title') }}
        </h2>
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('experience.subtitle') }}
        </p>
      </div>

      <!-- Horizontal scroll layout -->
      <div class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-2 px-2 scrollbar-thin">
        <div
          v-for="emp in emplacements"
          :key="emp.id"
          ref="cardEls"
          class="snap-start shrink-0 w-[340px] md:w-[380px] bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <!-- Image -->
          <div class="relative h-52 overflow-hidden">
            <img
              :src="emp.image"
              :alt="emp.name[locale] || emp.name.fr"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <!-- Price badge -->
            <div class="absolute top-3 right-3 bg-ocean text-white font-heading font-bold text-sm px-3 py-1 rounded-full shadow-md">
              {{ emp.price }} DT
            </div>
          </div>
          <!-- Content -->
          <div class="p-5">
            <h3 class="font-heading font-bold text-charcoal text-lg mb-2">
              {{ emp.name[locale] || emp.name.fr }}
            </h3>
            <p class="font-body text-charcoal/60 text-sm leading-relaxed mb-4 line-clamp-3">
              {{ emp.desc[locale] || emp.desc.fr }}
            </p>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-xs font-heading text-charcoal/50">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ emp.capacity }} {{ t('experience.persons') || 'pers.' }}
              </span>
              <a
                href="#reservation"
                class="text-sm font-heading font-semibold text-coral hover:text-coral-light transition-colors"
                @click.prevent="scrollToReservation"
              >
                {{ t('nav.reservation') || 'Réserver' }} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { emplacements } from '@/data/mock'

const { t, locale } = useI18n()

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}
</script>
