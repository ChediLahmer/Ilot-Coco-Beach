<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import posterImage from '@/assets/images/overwater-cabin.jpg'
import beachVideo from '@/assets/images/beach-video.mp4'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const videoRef = ref(null)
const containerRef = ref(null)
const isPlaying = ref(false)

function playVideo() {
  if (videoRef.value) {
    isPlaying.value = true
    videoRef.value.controls = true
    videoRef.value.play()
  }
}

function handleVideoEnd() {
  isPlaying.value = false
  if (videoRef.value) {
    videoRef.value.controls = false
  }
}

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(containerRef.value, {
      scale: 0.9,
      opacity: 0.6,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.value,
        start: 'top 85%',
        end: 'top 40%',
        scrub: 1,
      },
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <section id="video" class="relative py-20 bg-charcoal overflow-hidden">
    <!-- Decorative wave lines -->
    <div class="absolute top-8 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none">
      <svg class="w-32 md:w-48 h-6 text-ocean-light opacity-20" viewBox="0 0 200 24" fill="none">
        <path
          d="M0 12 Q25 0 50 12 T100 12 T150 12 T200 12"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
      </svg>
      <div class="w-2 h-2 rounded-full bg-ocean-light opacity-20 shrink-0" />
      <svg class="w-32 md:w-48 h-6 text-ocean-light opacity-20" viewBox="0 0 200 24" fill="none">
        <path
          d="M0 12 Q25 24 50 12 T100 12 T150 12 T200 12"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
      </svg>
    </div>

    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="font-display text-white text-3xl md:text-4xl mb-10">
        {{ t('video.title') }}
      </h2>

      <div ref="containerRef" class="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative">
        <video
          ref="videoRef"
          class="w-full block"
          :poster="posterImage"
          :src="beachVideo"
          preload="metadata"
          playsinline
          @ended="handleVideoEnd"
          @pause="handleVideoEnd"
        />

        <!-- Play button overlay -->
        <Transition name="fade">
          <button
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center bg-charcoal/30 cursor-pointer border-none"
            :aria-label="t('video.play')"
            @click="playVideo"
          >
            <span
              class="w-20 h-20 rounded-full bg-ocean/80 backdrop-blur-sm flex items-center justify-center
                     hover:scale-110 transition-transform duration-300 shadow-lg"
            >
              <svg class="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </Transition>
      </div>
    </div>

    <!-- Bottom decorative wave lines -->
    <div class="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none">
      <svg class="w-24 md:w-40 h-6 text-ocean-light opacity-20" viewBox="0 0 200 24" fill="none">
        <path
          d="M0 12 Q25 24 50 12 T100 12 T150 12 T200 12"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
        />
      </svg>
      <div class="w-1.5 h-1.5 rounded-full bg-ocean-light opacity-20 shrink-0" />
      <svg class="w-24 md:w-40 h-6 text-ocean-light opacity-20" viewBox="0 0 200 24" fill="none">
        <path
          d="M0 12 Q25 0 50 12 T100 12 T150 12 T200 12"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
        />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
