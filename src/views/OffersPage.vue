<template>
  <div class="min-h-screen bg-[#FAF7F2]">
    <NavBar />

    <!-- Page header -->
    <div class="pt-[72px]">
      <div class="max-w-7xl mx-auto px-6 pt-12 pb-2">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal font-heading text-sm transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          {{ t('gallery.backHome') || 'Retour à l\u2019accueil' }}
        </router-link>
      </div>

      <div class="text-center py-10">
        <h1 class="font-display text-charcoal text-4xl md:text-5xl tracking-wide">
          {{ t('flash.title') }}
        </h1>
        <div class="w-12 h-[2px] bg-gold mx-auto mt-5 mb-3" />
        <p class="font-body text-charcoal/50 text-base md:text-lg max-w-xl mx-auto">
          {{ t('flash.subtitle') || '' }}
        </p>
      </div>
    </div>

    <!-- Sales grid -->
    <div class="max-w-7xl mx-auto px-6 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="sale in activeSales"
          :key="sale.id"
          class="relative rounded-2xl overflow-hidden group"
          style="aspect-ratio: 3 / 4"
        >
          <!-- Full card image -->
          <img
            v-if="sale.image"
            :src="sale.image"
            :alt="sale.title[locale] || sale.title.fr"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div v-else class="absolute inset-0 bg-charcoal" />

          <!-- Dark gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <!-- Discount badge -->
          <span class="absolute top-4 right-4 bg-coral text-white font-heading font-bold text-sm px-3 py-1 rounded-full z-10">
            -{{ sale.discountPercent }}%
          </span>

          <!-- Content at bottom -->
          <div class="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3 z-10">
            <h3 class="font-heading font-semibold text-white text-lg leading-tight">
              {{ sale.title[locale] || sale.title.fr }}
            </h3>
            <p class="font-body text-white/70 text-sm line-clamp-2">
              {{ sale.description[locale] || sale.description.fr }}
            </p>

            <!-- Countdown -->
            <div v-if="!isSaleExpired(sale)" class="flex gap-2 mt-1">
              <div
                v-for="unit in getSaleCountdown(sale)"
                :key="unit.label"
                class="flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1"
              >
                <span class="font-heading font-bold text-white text-sm leading-none">
                  {{ String(unit.value).padStart(2, '0') }}
                </span>
                <span class="text-white/50 text-[10px] leading-tight mt-0.5">
                  {{ unit.label }}
                </span>
              </div>
            </div>
            <p v-else class="font-heading font-semibold text-coral-light text-sm">
              {{ t('flash.expired') }}
            </p>

            <!-- CTA -->
            <a
              v-if="!isSaleExpired(sale)"
              href="#reservation"
              class="text-gold-light hover:text-gold font-heading text-xs uppercase tracking-wider transition-colors duration-200 mt-1"
              @click.prevent="scrollToReservation"
            >
              {{ t('flash.bookNow') }} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>

    <FooterSection />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import { flashSales } from '@/data/mock'

const { t, locale } = useI18n()
const router = useRouter()

const now = ref(Date.now())
let countdownTimer = null

const activeSales = computed(() => flashSales.filter(s => s.isActive))

function isSaleExpired(sale) {
  return now.value >= new Date(sale.endsAt).getTime()
}

function getSaleCountdown(sale) {
  const diff = Math.max(0, new Date(sale.endsAt).getTime() - now.value)
  const s = Math.floor(diff / 1000)
  return [
    { label: t('flash.days'), value: Math.floor(s / 86400) },
    { label: t('flash.hours'), value: Math.floor((s % 86400) / 3600) },
    { label: t('flash.minutes'), value: Math.floor((s % 3600) / 60) },
    { label: t('flash.seconds'), value: s % 60 },
  ]
}

function scrollToReservation() {
  router.push('/#reservation')
}

onMounted(() => {
  countdownTimer = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
