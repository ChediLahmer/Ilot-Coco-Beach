<template>
  <section class="relative overflow-hidden bg-white py-24 px-6 md:px-16 md:py-32">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,166,179,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,125,97,0.14),transparent_24%)]" />

    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <!-- Header -->
      <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
        {{ t('video.title') }}
      </h2>
      <div class="w-10 h-[2px] bg-gold/60 mx-auto mt-4 mb-2" />
      <p class="font-body text-charcoal/50 text-base md:text-lg max-w-xl mx-auto mb-12">
        {{ t('hero.tagline') }}
      </p>

      <!-- Video -->
      <div class="relative overflow-hidden rounded-[2rem] shadow-[0_30px_70px_rgba(10,24,32,0.12)] ring-1 ring-charcoal/5">
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
            class="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(11,35,48,0.08),rgba(11,35,48,0.32))] transition-colors duration-200"
            @click="togglePlay"
          >
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] shadow-[0_18px_40px_rgba(255,125,97,0.28)] transition-transform duration-200 hover:scale-105">
              <svg class="ml-0.5 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </Transition>
      </div>

      <!-- Description text below video -->
      <p class="mt-6 text-center text-sm text-charcoal/52">
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
