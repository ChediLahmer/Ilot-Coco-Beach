<template>
  <section v-if="displayedSales.length > 0" id="flash-offers" class="relative overflow-hidden px-6 py-20 md:px-16 md:py-24">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,125,97,0.18),transparent_22%),radial-gradient(circle_at_top_right,rgba(239,186,82,0.16),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(29,166,179,0.16),transparent_28%)]" />
    <div class="sand-texture absolute inset-0 opacity-40" />

    <div class="relative z-10 mx-auto max-w-7xl">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="section-kicker">{{ t('vouchers.title') }}</p>
          <h2 class="section-title mt-6">{{ t('flash.title') }}</h2>
          <div class="section-divider" />
          <p class="mt-8 max-w-xl text-base leading-8 text-charcoal/70 md:text-lg">
            {{ t('flash.subtitle') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 lg:justify-end">
          <p v-if="hasMore" class="text-sm text-charcoal/56">
            +{{ activeSales.length - displayedSales.length }} {{ t('flash.moreOffers') }}
          </p>
          <router-link
            to="/offers"
            class="inline-flex items-center gap-3 rounded-full border border-coral/14 bg-white/78 px-5 py-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-deep shadow-[0_18px_36px_rgba(255,125,97,0.1)] backdrop-blur-xl hover:border-coral/30 hover:bg-white"
          >
            {{ t('flash.seeAll') }}
            <span class="block h-px w-8 bg-coral/60" />
          </router-link>
        </div>
      </div>

      <div class="mt-12 grid gap-5 lg:grid-cols-3">
        <article
          v-for="sale in displayedSales"
          :key="sale.id"
          class="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-deep shadow-[0_28px_70px_rgba(7,17,23,0.22)]"
        >
          <img
            v-if="sale.image"
            :src="sale.image"
            :alt="sale.title[locale] || sale.title.fr"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div v-else class="absolute inset-0 bg-charcoal" />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,35,48,0.08)_0%,rgba(15,85,99,0.36)_44%,rgba(11,35,48,0.94)_100%)]" />

          <div class="absolute inset-x-5 top-5 flex items-center justify-between gap-4">
            <span class="rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] px-3 py-1 text-[0.72rem] font-heading font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_28px_rgba(255,125,97,0.28)]">
              -{{ sale.discountPercent }}%
            </span>
            <span class="rounded-full border border-ocean-light/30 bg-white/12 px-3 py-1 text-[0.68rem] font-heading font-bold uppercase tracking-[0.16em] text-ocean-light backdrop-blur-xl">
              {{ t('flash.title') }}
            </span>
          </div>

          <div class="absolute inset-x-0 bottom-0 p-6">
            <h3 class="font-brand text-[2rem] leading-none text-white sm:text-[2.35rem]">
              {{ sale.title[locale] || sale.title.fr }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-white/72 sm:text-base">
              {{ sale.description[locale] || sale.description.fr }}
            </p>

            <div v-if="!isSaleExpired(sale)" class="mt-5 flex flex-wrap gap-2">
              <div
                v-for="unit in getSaleCountdown(sale)"
                :key="unit.label"
                class="min-w-[4.4rem] rounded-[1.15rem] border border-ocean-light/22 bg-white/12 px-3 py-2 text-center backdrop-blur-xl"
              >
                <p class="font-heading text-lg font-bold text-white">
                  {{ String(unit.value).padStart(2, '0') }}
                </p>
                <p class="mt-1 text-[0.6rem] font-heading uppercase tracking-[0.18em] text-white/56">
                  {{ unit.label }}
                </p>
              </div>
            </div>
            <p v-else class="mt-5 font-heading text-sm font-semibold uppercase tracking-[0.14em] text-coral-light">
              {{ t('flash.expired') }}
            </p>

            <div class="mt-6 flex items-center justify-between gap-4">
              <a
                href="#reservation"
                class="inline-flex items-center gap-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-coral-light hover:text-white"
                @click.prevent="scrollToReservation"
              >
                {{ t('flash.bookNow') }}
                <span class="block h-px w-8 bg-coral-light/80" />
              </a>
              <router-link to="/offers" class="text-sm text-white/62 hover:text-white">
                {{ t('flash.seeAll') }}
              </router-link>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { flashSales } from '@/data/mock'

const { t, locale } = useI18n()
const now = ref(Date.now())
let countdownTimer = null

const activeSales = computed(() => flashSales.filter((sale) => sale.isActive))
const displayedSales = computed(() => activeSales.value.slice(0, 3))
const hasMore = computed(() => activeSales.value.length > displayedSales.value.length)

function isSaleExpired(sale) {
  return now.value >= new Date(sale.endsAt).getTime()
}

function getSaleCountdown(sale) {
  const diff = Math.max(0, new Date(sale.endsAt).getTime() - now.value)
  const seconds = Math.floor(diff / 1000)

  return [
    { label: t('flash.days'), value: Math.floor(seconds / 86400) },
    { label: t('flash.hours'), value: Math.floor((seconds % 86400) / 3600) },
    { label: t('flash.minutes'), value: Math.floor((seconds % 3600) / 60) },
    { label: t('flash.seconds'), value: seconds % 60 },
  ]
}

function scrollToReservation() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  countdownTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
})
</script>
