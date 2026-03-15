<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'

import heroBeachLounge from '@/assets/images/hero-beach-lounge.jpg'
import surfboardSign from '@/assets/images/surfboard-sign.jpg'
import swingPergola from '@/assets/images/swing-pergola.jpg'
import waterSwing from '@/assets/images/water-swing.jpg'
import overwaterCabin from '@/assets/images/overwater-cabin.jpg'
import hammockArea from '@/assets/images/hammock-area.jpg'
import cabinHammock from '@/assets/images/cabin-hammock.jpg'
import cabinInterior from '@/assets/images/cabin-interior.jpg'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const images = [
  { src: heroBeachLounge, alt: 'Beach lounge', aspect: 'tall' },
  { src: surfboardSign, alt: 'Surfboard sign', aspect: 'wide' },
  { src: swingPergola, alt: 'Swing pergola', aspect: 'tall' },
  { src: waterSwing, alt: 'Water swing', aspect: 'wide' },
  { src: overwaterCabin, alt: 'Overwater cabin', aspect: 'tall' },
  { src: hammockArea, alt: 'Hammock area', aspect: 'wide' },
  { src: cabinHammock, alt: 'Cabin hammock', aspect: 'tall' },
  { src: cabinInterior, alt: 'Cabin interior', aspect: 'wide' },
]

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const galleryGrid = ref(null)

let ctx

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

function prevImage() {
  lightboxIndex.value = (lightboxIndex.value - 1 + images.length) % images.length
}

function nextImage() {
  lightboxIndex.value = (lightboxIndex.value + 1) % images.length
}

function handleKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  ctx = gsap.context(() => {
    // Hero text animation
    gsap.from('.gallery-hero-title', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3,
    })
    gsap.from('.gallery-hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5,
    })

    // Each gallery item reveals with clip-path animation on scroll
    const items = document.querySelectorAll('.gallery-item')
    items.forEach((item) => {
      gsap.from(item, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
      })
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (ctx) ctx.revert()
  document.body.style.overflow = ''
})
</script>

<template>
  <div>
    <NavBar />

    <!-- Page Hero -->
    <section class="relative h-[50vh] min-h-[360px] flex items-center justify-center overflow-hidden">
      <!-- Background image -->
      <img
        :src="cabinHammock"
        alt=""
        class="absolute inset-0 w-full h-full object-cover ken-burns"
      />
      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-charcoal/55"></div>
      <!-- Hero content -->
      <div class="relative z-10 text-center px-6">
        <h1 class="gallery-hero-title font-display text-white text-5xl md:text-6xl mb-4 drop-shadow-lg">
          Notre Univers
        </h1>
        <p class="gallery-hero-subtitle text-white/80 text-lg md:text-xl font-heading max-w-xl mx-auto">
          Explorez notre île en images
        </p>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="bg-sand py-16 md:py-24 px-4 md:px-8">
      <div ref="galleryGrid" class="max-w-7xl mx-auto columns-2 lg:columns-3 gap-3">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="gallery-item rounded-xl overflow-hidden mb-3 break-inside-avoid cursor-pointer group"
          @click="openLightbox(index)"
        >
          <img
            :src="image.src"
            :alt="image.alt"
            loading="lazy"
            class="w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-110 group-hover:shadow-2xl"
          />
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-md"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <button
            class="absolute top-5 right-5 z-10 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close"
            @click="closeLightbox"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev button -->
          <button
            class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Previous image"
            @click="prevImage"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image -->
          <div class="max-w-5xl max-h-[85vh] px-16">
            <img
              :src="images[lightboxIndex].src"
              :alt="images[lightboxIndex].alt"
              class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <!-- Next button -->
          <button
            class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Next image"
            @click="nextImage"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter -->
          <div class="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-heading tracking-wider">
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <FooterSection />
  </div>
</template>

<style scoped>
.gallery-item {
  clip-path: inset(0);
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
