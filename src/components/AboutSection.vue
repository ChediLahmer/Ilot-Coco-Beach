<template>
  <section id="about" class="relative bg-sand sand-texture py-24 md:py-32 px-6 md:px-16 overflow-hidden">
    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('about.title') }}
        </h2>
        <div class="w-10 h-[1px] bg-gold/60 mx-auto mt-4 mb-2" />
      </div>

      <!-- Description -->
      <div class="max-w-2xl mx-auto text-center mb-16">
        <p class="font-body text-charcoal/70 leading-relaxed">
          {{ t('about.description') }}
        </p>
      </div>

      <!-- Two large images side by side -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
        <div class="rounded-xl overflow-hidden">
          <img
            :src="overwaterImg"
            alt="Ilot Coco Beach"
            class="w-full aspect-[3/2] object-cover hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
        <div class="rounded-xl overflow-hidden">
          <img
            :src="waterSwingImg"
            alt="Ilot Coco Beach"
            class="w-full aspect-[3/2] object-cover hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
      </div>

      <!-- Feature cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="text-center"
        >
          <div class="w-12 h-12 mx-auto mb-3 text-ocean" v-html="feature.svg" />
          <h3 class="font-heading font-semibold text-charcoal text-base mb-1">
            {{ t(`about.features.${feature.key}`) }}
          </h3>
          <p class="font-body text-charcoal/50 text-sm leading-relaxed">
            {{ t(`about.features.${feature.key}Desc`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import overwaterImg from '@/assets/images/overwater-cabin.jpg'
import waterSwingImg from '@/assets/images/water-swing.jpg'
import hammockImg from '@/assets/images/hammock-area.jpg'
import cabinImg from '@/assets/images/cabin-interior.jpg'
import cabinHammockImg from '@/assets/images/cabin-hammock.jpg'
import surfboardImg from '@/assets/images/surfboard-sign.jpg'
import swingImg from '@/assets/images/swing-pergola.jpg'
import heroImg from '@/assets/images/hero-beach-lounge.jpg'

const { t } = useI18n()

const features = [
  { key: 'cabins', svg: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>' },
  { key: 'water', svg: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"/></svg>' },
  { key: 'hammocks', svg: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>' },
  { key: 'vibes', svg: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/></svg>' },
]

const slideshowImages = [
  overwaterImg,
  waterSwingImg,
  hammockImg,
  cabinImg,
  cabinHammockImg,
  surfboardImg,
  swingImg,
  heroImg,
]
</script>
