<template>
  <section class="bg-white py-24 md:py-32 px-6 md:px-16">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Header -->
      <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
        {{ t('video.title') }}
      </h2>
      <div class="w-10 h-[2px] bg-gold/60 mx-auto mt-4 mb-2" />
      <p class="font-body text-charcoal/50 text-base md:text-lg max-w-xl mx-auto mb-12">
        {{ t('hero.tagline') }}
      </p>

      <!-- Video -->
      <div class="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-charcoal/5">
        <video
          ref="videoEl"
          :poster="heroPoster"
          class="w-full aspect-video object-cover"
          playsinline
          @click="togglePlay"
        >
          <source :src="heroVideo" type="video/mp4" />
        </video>

        <!-- Custom play button -->
        <Transition name="fade">
          <button
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-200"
            @click="togglePlay"
          >
            <div class="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
              <svg class="w-8 h-8 text-charcoal ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </Transition>
      </div>

      <!-- Description text below video -->
      <p class="text-charcoal/40 text-sm text-center mt-6">
        {{ t('video.description') || 'Plongez dans l\'atmosphère unique d\'Ilot Coco Beach' }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import heroVideo from '@/assets/images/beach-video.mp4'
import heroPoster from '@/assets/images/hero-beach-lounge.jpg'

const { t } = useI18n()

const videoEl = ref(null)
const isPlaying = ref(false)

function togglePlay() {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    videoEl.value.play()
    isPlaying.value = true
  } else {
    videoEl.value.pause()
    isPlaying.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
