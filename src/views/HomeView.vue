<template>
  <div class="min-h-screen">
    <NavBar />
    <HeroSection />
    <AboutSection />
    <FlashSaleSection />
    <MenuSection />
    <ExperienceSection />
    <GallerySection />
    <VoucherSection />
    <VideoSection />
    <ReviewsSection />
    <ReservationSection />
    <LocationSection />
    <FooterSection />
    <FloatingSocial />

    <!-- Sticky mobile reservation bar -->
    <div
      v-if="showStickyBar"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-charcoal/10 px-4 py-3 flex items-center justify-between lg:hidden"
    >
      <div>
        <p class="font-brand font-bold text-charcoal text-sm">ÎLOT Coco Beach</p>
        <p class="font-body text-charcoal/60 text-xs">{{ t('hero.tagline') }}</p>
      </div>
      <a
        href="#reservation"
        class="bg-coral hover:bg-coral-light text-white font-heading font-semibold px-5 py-2.5 rounded-full text-sm transition-colors shadow-md"
        @click.prevent="scrollToRes"
      >
        {{ t('nav.reservation') }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import FlashSaleSection from '@/components/FlashSaleSection.vue'
import MenuSection from '@/components/MenuSection.vue'
import ExperienceSection from '@/components/ExperienceSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import VoucherSection from '@/components/VoucherSection.vue'
import VideoSection from '@/components/VideoSection.vue'
import ReviewsSection from '@/components/ReviewsSection.vue'
import ReservationSection from '@/components/ReservationSection.vue'
import LocationSection from '@/components/LocationSection.vue'
import FooterSection from '@/components/FooterSection.vue'
import FloatingSocial from '@/components/FloatingSocial.vue'

const { t } = useI18n()
const config = useConfig()

const showStickyBar = ref(false)

function onScroll() {
  const scrollTop = window.scrollY
  showStickyBar.value = scrollTop > window.innerHeight * 0.8
}

function scrollToRes() {
  const el = document.getElementById('reservation')
  if (el) el.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  // SEO meta
  document.title = `${config.name} — ${t('hero.tagline')}`

  const setMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setMeta('description', t('about.description'))
  setMeta('keywords', 'ilot coco beach, bizerte, tunisie, restaurant, plage, cabane, overwater')

  // Open Graph
  const setOG = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', prop)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setOG('og:title', config.name)
  setOG('og:description', t('about.description'))
  setOG('og:type', 'website')

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: config.name,
    description: t('about.description'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
    },
    telephone: config.phone,
    email: config.email,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.lat,
      longitude: config.lng,
    },
    sameAs: [config.instagram, config.facebook],
  }

  let scriptEl = document.getElementById('json-ld')
  if (!scriptEl) {
    scriptEl = document.createElement('script')
    scriptEl.id = 'json-ld'
    scriptEl.type = 'application/ld+json'
    document.head.appendChild(scriptEl)
  }
  scriptEl.textContent = JSON.stringify(jsonLd)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
