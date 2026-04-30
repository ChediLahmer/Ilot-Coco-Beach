<template>
  <section class="px-4 py-20 sm:px-6 md:px-12 lg:px-20">
    <div class="mx-auto max-w-4xl text-center">
      <h2 class="font-brand text-2xl text-deep md:text-3xl">
        {{ t("video.title") }}
      </h2>
      <div class="mx-auto mt-3 section-divider" />

      <div
        class="relative mt-8 overflow-hidden rounded-lg ring-1 ring-charcoal/8"
      >
        <video
          ref="videoEl"
          :poster="heroPoster"
          class="w-full aspect-video object-cover"
          playsinline
          preload="metadata"
          @click="togglePlay"
        >
          <source :src="heroVideo" type="video/mp4" />
        </video>

        <Transition name="fade">
          <button
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/20"
            @click="togglePlay"
          >
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-ocean text-white shadow-lg transition-transform hover:scale-105"
            >
              <svg
                class="ml-0.5 h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import heroVideo from "@/assets/images/beach-video.mp4";
import heroPoster from "@/assets/images/hero-beach-lounge.jpg";

const { t } = useI18n();

const videoEl = ref(null);
const isPlaying = ref(false);

function togglePlay() {
  if (!videoEl.value) return;
  if (videoEl.value.paused) {
    videoEl.value.play();
    isPlaying.value = true;
  } else {
    videoEl.value.pause();
    isPlaying.value = false;
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
