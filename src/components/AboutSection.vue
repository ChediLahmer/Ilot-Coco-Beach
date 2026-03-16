<template>
  <section id="about" class="relative overflow-hidden px-6 py-24 md:px-16 md:py-32">
    <div class="absolute inset-0 sand-texture opacity-60" />

    <div class="relative z-10 mx-auto max-w-7xl">
      <div class="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div class="lg:sticky lg:top-28 lg:pr-10">
          <p class="section-kicker">{{ t('about.eyebrow') }}</p>
          <h2 class="section-title mt-6 max-w-xl">
            {{ t('about.title') }}
          </h2>
          <div class="section-divider" />

          <p class="section-copy mt-8 max-w-xl">
            {{ t('about.description') }}
          </p>
          <p class="section-copy mt-6 max-w-xl text-charcoal/60">
            {{ t('about.story') }}
          </p>

          <a
            href="#reservation"
            class="mt-10 inline-flex items-center gap-3 font-heading text-sm font-bold uppercase tracking-[0.18em] text-ocean"
            @click.prevent="scrollTo('reservation')"
          >
            {{ t('about.cta') }}
            <span class="block h-px w-10 bg-gold/80" />
          </a>
        </div>

        <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <article class="editorial-frame premium-card rounded-[2rem] p-3 md:row-span-2">
            <img
              :src="overwaterImg"
              alt="Overwater dining at Ilot Coco Beach"
              class="h-full min-h-[22rem] w-full rounded-[1.5rem] object-cover"
            />
            <div class="px-4 pb-4 pt-5 sm:px-5">
              <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                {{ t('about.features.cabins') }}
              </p>
              <p class="mt-3 text-sm leading-7 text-charcoal/68 sm:text-base">
                {{ t('about.features.cabinsDesc') }}
              </p>
            </div>
          </article>

          <article class="editorial-frame premium-card rounded-[2rem] p-3">
            <img
              :src="cabinHammockImg"
              alt="Private cabin at Ilot Coco Beach"
              class="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
            />
            <div class="px-4 pb-4 pt-5 sm:px-5">
              <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                {{ t('about.features.water') }}
              </p>
              <p class="mt-3 text-sm leading-7 text-charcoal/68 sm:text-base">
                {{ t('about.features.waterDesc') }}
              </p>
            </div>
          </article>

          <article class="premium-card rounded-[2rem] p-6 sm:p-7">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
              {{ t('about.features.vibes') }}
            </p>
            <p class="mt-4 font-brand text-3xl leading-tight text-deep">
              {{ t('about.features.vibesDesc') }}
            </p>
            <div class="soft-divider mt-6" />
            <p class="mt-6 text-sm leading-7 text-charcoal/62 sm:text-base">
              {{ t('about.features.hammocksDesc') }}
            </p>
          </article>
        </div>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="feature in features"
          :key="feature.key"
          class="premium-outline rounded-[1.65rem] px-5 py-6"
        >
          <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/68">
            {{ feature.index }}
          </p>
          <h3 class="mt-4 text-lg font-semibold text-deep">
            {{ t(`about.features.${feature.key}`) }}
          </h3>
          <p class="mt-3 text-sm leading-7 text-charcoal/62">
            {{ t(`about.features.${feature.key}Desc`) }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import overwaterImg from '@/assets/images/overwater-cabin.jpg'
import cabinHammockImg from '@/assets/images/cabin-hammock.jpg'

const { t } = useI18n()

const features = [
  { key: 'cabins', index: '01' },
  { key: 'water', index: '02' },
  { key: 'hammocks', index: '03' },
  { key: 'vibes', index: '04' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>
