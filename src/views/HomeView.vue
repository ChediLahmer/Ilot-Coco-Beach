<script setup>
import { onMounted } from 'vue'
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

const config = useConfig()

onMounted(() => {
  document.title = import.meta.env.VITE_META_TITLE || `${config.name} — Votre ile, votre evasion`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute('content',
      import.meta.env.VITE_META_DESCRIPTION ||
      `${config.name} — Un paradis cache aux eaux cristallines a ${config.address}`
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    url: window.location.origin,
    telephone: config.phone,
    address: { '@type': 'PostalAddress', streetAddress: config.address },
    geo: { '@type': 'GeoCoordinates', latitude: config.lat, longitude: config.lng },
    sameAs: [config.instagram, config.facebook],
  }
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(script)
})
</script>

<template>
  <div>
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
