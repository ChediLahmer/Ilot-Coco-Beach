<template>
  <section id="menu" class="relative overflow-hidden bg-sand/45 px-6 py-24 md:px-16 md:py-32">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,125,97,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(29,166,179,0.14),transparent_28%)]" />
    <div class="sand-texture absolute inset-0 opacity-40" />

    <div class="relative z-10 mx-auto max-w-7xl">
      <div class="text-center">
        <p class="section-kicker justify-center">{{ t('menu.eyebrow') }}</p>
        <h2 class="section-title mt-6">{{ t('menu.title') }}</h2>
        <div class="mx-auto mt-5 h-px w-14 bg-gold" />
        <p class="mx-auto mt-8 max-w-2xl text-base leading-8 text-charcoal/70 md:text-lg">
          {{ t('menu.subtitle') }}
        </p>
      </div>

      <div class="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="inline-flex w-fit items-center rounded-full border border-charcoal/10 bg-white/75 p-1 shadow-[0_18px_40px_rgba(10,24,32,0.06)] backdrop-blur-xl">
          <button
            v-for="mode in ['standard', 'extra']"
            :key="mode"
            :class="[
              'rounded-full px-4 py-2 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors duration-200',
              priceMode === mode ? 'bg-[linear-gradient(135deg,var(--color-coral),var(--color-ocean))] text-white shadow-[0_10px_24px_rgba(255,125,97,0.18)]' : 'text-charcoal/52 hover:text-deep',
            ]"
            @click="priceMode = mode"
          >
            {{ t(`menu.${mode}`) }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <router-link
            to="/menu"
            class="inline-flex items-center gap-3 rounded-full border border-coral/16 bg-white/82 px-5 py-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-deep shadow-[0_14px_30px_rgba(255,125,97,0.08)] hover:border-coral/32 hover:text-coral"
          >
            {{ t('menu.viewAll') }}
            <span class="block h-px w-8 bg-coral/45" />
          </router-link>

          <div class="flex items-center gap-3">
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
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button
          v-for="category in menuCategories"
          :key="category.id"
          :class="[
            'rounded-full border px-4 py-2 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors duration-200',
            activeCategory === category.id
              ? 'border-transparent bg-[linear-gradient(135deg,var(--color-coral),var(--color-ocean))] text-white shadow-[0_10px_24px_rgba(255,125,97,0.18)]'
              : 'border-charcoal/10 bg-white/65 text-charcoal/58 hover:border-ocean/30 hover:text-ocean',
          ]"
          @click="activeCategory = category.id"
        >
          {{ category.name[locale] || category.name.fr }}
        </button>
      </div>

      <div class="mt-10 overflow-hidden" @mouseenter="pause" @mouseleave="resume" @touchstart.passive="pause" @touchend.passive="resume">
        <div
          ref="scrollerEl"
          class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          @scroll="updateScrollState"
        >
          <article
            v-for="item in activeItems"
            :key="item.id"
            data-rail-item
            class="group flex min-h-[29rem] min-w-[18.5rem] flex-col overflow-hidden rounded-[1.75rem] border border-charcoal/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,239,0.92))] shadow-[0_22px_50px_rgba(10,24,32,0.08)] sm:min-w-[20rem]"
          >
            <div class="relative h-56 overflow-hidden bg-sand/70">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name[locale] || item.name.fr"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(49,112,124,0.12),rgba(184,148,86,0.14))]">
                <span class="font-heading text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ocean/70">
                  {{ activeCategoryLabel }}
                </span>
              </div>

              <div class="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                <p class="rounded-full border border-white/30 bg-white/88 px-3 py-1 font-heading text-[0.62rem] font-bold uppercase tracking-[0.18em] text-charcoal/78 shadow-sm">
                  {{ activeCategoryLabel }}
                </p>
                <p class="rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] px-3 py-1 text-[0.72rem] font-heading font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(255,125,97,0.18)]">
                  {{ displayPrice(item) }} DT
                </p>
              </div>
            </div>

            <div class="flex flex-1 flex-col p-6">
              <h3 class="font-brand text-[2rem] leading-tight text-deep">
                {{ item.name[locale] || item.name.fr }}
              </h3>
              <p class="mt-3 text-sm font-heading font-semibold uppercase tracking-[0.16em] text-charcoal/45">
                {{ t(`menu.${priceMode}`) }}
              </p>
              <p class="mt-4 flex-1 text-sm leading-7 text-charcoal/66 sm:text-base">
                {{ item.desc[locale] || item.desc.fr }}
              </p>

              <div class="mt-6 flex items-center justify-between gap-4 border-t border-charcoal/8 pt-5">
                <span class="font-heading text-lg font-bold text-deep">
                  {{ displayPrice(item) }} DT
                </span>
                <span
                  v-if="!item.available"
                  class="rounded-full bg-coral/12 px-3 py-1 text-[0.68rem] font-heading font-bold uppercase tracking-[0.16em] text-coral"
                >
                  {{ t('menu.unavailable') }}
                </span>
                <a
                  v-else
                  href="#reservation"
                  class="inline-flex items-center gap-3 font-heading text-[0.7rem] font-bold uppercase tracking-[0.2em] text-coral hover:text-deep"
                  @click.prevent="scrollTo('reservation')"
                >
                  {{ t('menu.reserveCta') }}
                  <span class="block h-px w-8 bg-coral/45" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <article
          v-for="note in menuNotes"
          :key="note"
          class="rounded-[1.5rem] border border-charcoal/8 bg-white/72 px-5 py-4 text-left shadow-[0_18px_40px_rgba(10,24,32,0.05)] backdrop-blur-xl"
        >
          <p class="text-sm leading-7 text-charcoal/66">
            {{ note }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useHorizontalRail } from '@/composables/useHorizontalRail'
import { menuCategories } from '@/data/mock'

const { t, locale } = useI18n()

const priceMode = ref('standard')
const activeCategory = ref(menuCategories[0]?.id || 1)

const activeCategoryData = computed(() => menuCategories.find((category) => category.id === activeCategory.value) ?? menuCategories[0])

const activeCategoryLabel = computed(() => activeCategoryData.value?.name[locale.value] || activeCategoryData.value?.name.fr || '')

const activeItems = computed(() => activeCategoryData.value?.items || [])

const menuNotes = computed(() => [
  t('menu.notes.one'),
  t('menu.notes.two'),
  t('menu.notes.three'),
])

const {
  scrollerEl,
  canScrollLeft,
  canScrollRight,
  scrollByStep,
  updateScrollState,
  reset,
  pause,
  resume,
} = useHorizontalRail(computed(() => activeItems.value.length))

function displayPrice(item) {
  return priceMode.value === 'extra' ? item.priceExtra : item.priceStandard
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

watch(activeCategory, async () => {
  await nextTick()
  reset('auto')
  updateScrollState()
})

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
