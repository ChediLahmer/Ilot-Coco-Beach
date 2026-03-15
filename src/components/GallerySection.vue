<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  { src: heroBeachLounge, alt: 'Beach lounge' },
  { src: surfboardSign, alt: 'Surfboard sign' },
  { src: swingPergola, alt: 'Swing pergola' },
  { src: waterSwing, alt: 'Water swing' },
  { src: overwaterCabin, alt: 'Overwater cabin' },
  { src: hammockArea, alt: 'Hammock area' },
  { src: cabinHammock, alt: 'Cabin hammock' },
  { src: cabinInterior, alt: 'Cabin interior' },
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
    gsap.from('.gallery-item', {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: galleryGrid.value,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
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
  <section id="gallery" class="bg-white py-20 px-6 md:px-16">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="font-display text-ocean text-4xl">
          {{ t('gallery.title') }}
        </h2>
        <p class="text-charcoal/60 text-lg mt-3">
          {{ t('gallery.subtitle') }}
        </p>
      </div>

      <!-- Masonry Grid -->
      <div ref="galleryGrid" class="columns-1 sm:columns-2 lg:columns-3 gap-4">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="gallery-item rounded-xl overflow-hidden mb-4 break-inside-avoid cursor-pointer group"
          @click="openLightbox(index)"
        >
          <img
            :src="image.src"
            :alt="image.alt"
            class="w-full h-auto object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-110 group-hover:shadow-xl"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition p-2"
            aria-label="Close"
            @click="closeLightbox"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev button -->
          <button
            class="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition p-2"
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
            class="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition p-2"
            aria-label="Next image"
            @click="nextImage"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-body">
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
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
