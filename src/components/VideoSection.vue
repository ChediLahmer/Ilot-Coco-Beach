<template>
  <section class="relative bg-sand sand-texture py-20 px-6 md:px-16">
    <!-- Section editorial number -->
    <div class="section-number">06</div>

    <div class="max-w-4xl mx-auto text-center">
      <div class="gold-accent mb-10">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('video.title') }}
        </h2>
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('hero.tagline') }}
        </p>
      </div>

      <!-- Video container -->
      <div class="relative rounded-2xl overflow-hidden shadow-2xl group">
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
            class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-200"
            @click="togglePlay"
          >
            <div class="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
              <svg class="w-8 h-8 text-ocean ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </Transition>
      </div>
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
