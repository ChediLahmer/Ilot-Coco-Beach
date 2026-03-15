<template>
  <div class="min-h-screen">
    <!-- Scroll progress bar -->
    <div
      class="scroll-progress"
      :style="{ width: scrollProgress + '%' }"
    />

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

const scrollProgress = ref(0)

function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
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
