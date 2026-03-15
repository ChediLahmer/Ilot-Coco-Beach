<template>
  <section
    id="gallery"
    class="relative py-20 px-6 md:px-16"
    style="background: linear-gradient(135deg, #0f1923 0%, #1a2a36 50%, #0a1a24 100%)"
  >
    <!-- Section editorial number -->
    <div class="section-number text-white/[0.04]">04</div>

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 gold-accent">
        <h2 class="font-display text-white text-3xl md:text-4xl mb-3">
          {{ t('gallery.title') }}
        </h2>
        <p class="font-body text-white/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('gallery.subtitle') }}
        </p>
      </div>

      <!-- Masonry grid -->
      <div class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="break-inside-avoid cursor-pointer overflow-hidden rounded-xl group"
          @click="openLightbox(idx)"
        >
          <img
            :src="img.src"
            :alt="img.alt"
            class="w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:ring-2 group-hover:ring-gold/30 rounded-xl"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          @click.self="closeLightbox"
          @keydown.escape="closeLightbox"
        >
          <!-- Close -->
          <button
            class="absolute top-4 right-4 text-white/80 hover:text-white text-4xl leading-none z-10"
            @click="closeLightbox"
          >
            &times;
          </button>
          <!-- Prev -->
          <button
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 p-2"
            @click="prevImage"
          >
            ‹
          </button>
          <!-- Image -->
          <img
            :src="images[lightboxIndex]?.src"
            :alt="images[lightboxIndex]?.alt"
            class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
          <!-- Next -->
          <button
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 p-2"
            @click="nextImage"
          >
            ›
          </button>
          <!-- Counter -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-heading">
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { allImages } from '@/data/mock'

const { t } = useI18n()

const images = Object.entries(allImages).map(([key, src]) => ({
  src,
  alt: key.replace(/Img$/, '').replace(/([A-Z])/g, ' $1').trim(),
}))

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(idx) {
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function nextImage() {
  lightboxIndex.value = (lightboxIndex.value + 1) % images.length
}

function prevImage() {
  lightboxIndex.value = (lightboxIndex.value - 1 + images.length) % images.length
}

function handleKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
