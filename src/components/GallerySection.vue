<template>
  <section
    id="gallery"
    class="relative py-20 px-6 md:px-16"
    style="background: linear-gradient(135deg, #0f1923 0%, #1a2a36 50%, #0a1a24 100%)"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-14">
        <h2 class="font-display text-white text-4xl md:text-5xl tracking-wide">
          {{ t('gallery.title') }}
        </h2>
        <div class="w-10 h-[1px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-white/40 text-base md:text-lg max-w-xl mx-auto">
          {{ t('gallery.subtitle') }}
        </p>
      </div>

      <!-- Masonry grid (first 8 images only) -->
      <div v-if="images.length > 0" class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        <router-link
          v-for="(img, idx) in images"
          :key="idx"
          to="/gallery"
          class="break-inside-avoid cursor-pointer overflow-hidden rounded-xl block"
        >
          <img
            :src="img.src"
            :alt="img.alt"
            class="w-full object-cover transition-all duration-500 hover:brightness-110 hover:scale-[1.02] rounded-xl"
            loading="lazy"
          />
        </router-link>
      </div>
      <p v-else class="text-center text-white/40 font-body py-10">
        {{ t('gallery.subtitle') }}
      </p>

      <!-- CTA -->
      <div class="text-center mt-12">
        <router-link
          to="/gallery"
          class="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full font-heading font-semibold text-sm tracking-wider transition-all duration-300"
        >
          {{ t('gallery.viewAll') || 'Voir toute la galerie' }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { allImages } from '@/data/mock'

const { t } = useI18n()

const images = Object.entries(allImages)
  .slice(0, 8)
  .map(([key, src]) => ({
    src,
    alt: key.replace(/Img$/, '').replace(/([A-Z])/g, ' $1').trim(),
  }))
</script>
