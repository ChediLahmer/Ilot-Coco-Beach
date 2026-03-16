<template>
  <section id="experience" class="relative overflow-hidden bg-sand px-6 py-24 md:px-16 md:py-32">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,166,179,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,125,97,0.16),transparent_28%)]" />
    <div class="sand-texture absolute inset-0 opacity-40" />

    <div class="relative z-10 mx-auto max-w-7xl">
      <div class="text-center">
        <p class="section-kicker justify-center">{{ t('experience.eyebrow') }}</p>
        <h2 class="section-title mt-6">{{ t('experience.title') }}</h2>
        <div class="mx-auto mt-5 h-px w-14 bg-gold" />
        <p class="mx-auto mt-8 max-w-2xl text-base leading-8 text-charcoal/68 md:text-lg">
          {{ t('experience.subtitle') }}
        </p>
      </div>

      <div class="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <p class="max-w-2xl text-sm leading-7 text-charcoal/58">
          {{ t('about.story') }}
        </p>

        <div class="flex items-center gap-3 self-start lg:self-auto">
          <span class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-coral/80">
            {{ t('ui.scrollHint') }}
          </span>
          <button
            type="button"
            class="tropical-arrow"
            :aria-label="t('ui.previous')"
            :disabled="!canScrollLeft"
            @click="scrollByStep(-1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="tropical-arrow"
            :aria-label="t('ui.next')"
            :disabled="!canScrollRight"
            @click="scrollByStep(1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-12 overflow-hidden" @mouseenter="pause" @mouseleave="resume" @touchstart.passive="pause" @touchend.passive="resume">
        <div
          ref="scrollerEl"
          class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          @scroll="updateScrollState"
        >
          <article
            v-for="space in spaces"
            :key="space.id"
            data-rail-item
            class="editorial-frame group relative min-h-[29rem] min-w-[19rem] overflow-hidden rounded-[2rem] text-white sm:min-w-[21rem] lg:min-w-[23rem]"
          >
            <img
              v-if="space.image"
              :src="space.image"
              :alt="space.name[locale] || space.name.fr"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div v-else class="absolute inset-0 bg-[linear-gradient(135deg,rgba(49,112,124,0.9),rgba(10,24,32,0.95))]" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,23,0.08)_0%,rgba(7,17,23,0.52)_48%,rgba(7,17,23,0.92)_100%)]" />

            <div class="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
              <div class="flex flex-wrap items-center gap-3">
                <span class="rounded-full border border-white/16 bg-white/12 px-4 py-2 text-[0.68rem] font-heading font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur-xl">
                  {{ t('experience.startingAt') }} {{ space.price }} DT
                </span>
                <span class="rounded-full border border-coral-light/30 bg-coral/18 px-4 py-2 text-[0.68rem] font-heading font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur-xl">
                  {{ space.capacity }} {{ t('experience.persons') }}
                </span>
              </div>

              <div>
                <h3 class="font-brand text-3xl leading-tight sm:text-4xl">
                  {{ space.name[locale] || space.name.fr }}
                </h3>
                <p class="mt-4 text-sm leading-7 text-white/74 sm:text-base">
                  {{ space.desc[locale] || space.desc.fr }}
                </p>
                <a
                  href="#reservation"
                  class="mt-6 inline-flex items-center gap-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-coral-light hover:text-white"
                  @click.prevent="scrollToReservation"
                >
                  {{ t('experience.reserveCta') }}
                  <span class="block h-px w-10 bg-coral-light/80" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useHorizontalRail } from '@/composables/useHorizontalRail'
import { emplacements } from '@/data/mock'

const { t, locale } = useI18n()

const spaces = emplacements

const {
  scrollerEl,
  canScrollLeft,
  canScrollRight,
  scrollByStep,
  updateScrollState,
  pause,
  resume,
} = useHorizontalRail(computed(() => spaces.length))

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

watch(locale, async () => {
  await nextTick()
  updateScrollState()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
