<template>
  <section id="gallery" class="relative px-6 py-24 md:px-16 md:py-32">
    <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
      <div class="lg:pr-10">
        <p class="section-kicker">{{ t('gallery.eyebrow') }}</p>
        <h2 class="section-title mt-6 max-w-xl">
          {{ t('gallery.title') }}
        </h2>
        <div class="section-divider" />
        <p class="section-copy mt-8 max-w-xl">
          {{ t('gallery.subtitle') }}
        </p>

        <router-link
          to="/gallery"
          class="mt-10 inline-flex items-center gap-3 font-heading text-sm font-bold uppercase tracking-[0.18em] text-ocean"
        >
          {{ t('gallery.viewAll') }}
          <span class="block h-px w-10 bg-gold/80" />
        </router-link>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <router-link
          to="/gallery"
          class="editorial-frame group relative min-h-[20rem] overflow-hidden rounded-[2rem] sm:col-span-2 sm:min-h-[27rem]"
        >
          <img
            :src="images[0].src"
            :alt="images[0].alt"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,23,0.1)_0%,rgba(7,17,23,0.72)_100%)]" />
          <div class="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-8">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-light/78">
              {{ t('gallery.eyebrow') }}
            </p>
            <p class="mt-3 font-brand text-3xl leading-tight sm:text-4xl">
              {{ t('gallery.title') }}
            </p>
          </div>
        </router-link>

        <router-link
          v-for="image in images.slice(1)"
          :key="image.alt"
          to="/gallery"
          class="editorial-frame group relative min-h-[15rem] overflow-hidden rounded-[2rem]"
        >
          <img
            :src="image.src"
            :alt="image.alt"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,23,0.06)_0%,rgba(7,17,23,0.66)_100%)]" />
          <div class="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
            <p class="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
              {{ t(image.labelKey) }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import overwaterImg from '@/assets/images/overwater-cabin.jpg'
import heroImg from '@/assets/images/hero-beach-lounge.jpg'
import cabinImg from '@/assets/images/cabin-interior.jpg'
import cabinHammockImg from '@/assets/images/cabin-hammock.jpg'
import swingImg from '@/assets/images/swing-pergola.jpg'

const { t } = useI18n()

const images = [
  { src: overwaterImg, alt: 'Overwater cabin at Ilot Coco Beach', labelKey: 'gallery.labels.overwater' },
  { src: heroImg, alt: 'Beachfront arrival at Ilot Coco Beach', labelKey: 'gallery.labels.arrival' },
  { src: cabinImg, alt: 'Dining cabin at Ilot Coco Beach', labelKey: 'gallery.labels.dining' },
  { src: cabinHammockImg, alt: 'Private lounge at Ilot Coco Beach', labelKey: 'gallery.labels.lounge' },
  { src: swingImg, alt: 'Panoramic terrace at Ilot Coco Beach', labelKey: 'gallery.labels.terrace' },
]
</script>
