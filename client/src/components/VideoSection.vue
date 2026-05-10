<template>
  <section v-if="sectionVideo" class="px-4 py-20 sm:px-6 md:px-12 lg:px-20">
    <div class="mx-auto max-w-4xl text-center">
      <h2 class="font-brand text-2xl text-deep md:text-3xl">
        {{ t("video.title") }}
      </h2>
      <div class="mx-auto mt-3 section-divider" />

      <div
        class="relative mt-8 overflow-hidden rounded-lg ring-1 ring-charcoal/8"
      >
        <video
          v-if="!videoError"
          ref="videoEl"
          :poster="sectionPoster"
          class="w-full aspect-video object-cover"
          playsinline
          preload="auto"
          @click="togglePlay"
          @ended="isPlaying = false"
          @canplay="videoReady = true"
          @waiting="videoBuffering = true"
          @playing="videoBuffering = false"
          @error="handleVideoError"
        >
          <source
            :src="videoSrc"
            :type="videoSrc?.endsWith('.webm') ? 'video/webm' : 'video/mp4'"
          />
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
                v-if="!videoBuffering"
                class="ms-0.5 h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg
                v-else
                class="h-6 w-6 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          </button>
        </Transition>

        <!-- Buffering overlay when playing -->
        <Transition name="fade">
          <div
            v-if="isPlaying && videoBuffering"
            class="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <svg
              class="h-10 w-10 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        </Transition>

        <!-- Video error fallback -->
        <div
          v-if="videoError"
          class="flex aspect-video items-center justify-center bg-charcoal/5"
        >
          <div class="text-center px-6">
            <svg
              class="mx-auto h-10 w-10 text-charcoal/30 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <p class="text-sm text-charcoal/50">{{ t("video.unavailable") }}</p>
            <button
              @click="retryVideo"
              class="mt-3 text-sm font-medium text-ocean hover:text-ocean-dark"
            >
              {{ t("error.retry") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useConfig } from "@/composables/useConfig";
import { useVideoPreload } from "@/composables/useVideoPreload";

const { t } = useI18n();
const config = useConfig();
const { preloadVideoMetadata } = useVideoPreload();

const sectionVideo = computed(() => config.sectionVideo || "");
const sectionPoster = computed(() => config.sectionPoster || "");

const videoEl = ref(null);
const isPlaying = ref(false);
const videoReady = ref(false);
const videoBuffering = ref(false);
const videoError = ref(false);
const proxyFallbackTried = ref(false);
const videoSrc = ref(sectionVideo.value);

function toProxyVideoUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("/api/media/proxy?url=")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${apiBase}/media/proxy?url=${encodeURIComponent(url)}`;
}

function handleVideoError() {
  if (!proxyFallbackTried.value && sectionVideo.value) {
    proxyFallbackTried.value = true;
    videoSrc.value = toProxyVideoUrl(sectionVideo.value);
    videoError.value = false;
    return;
  }
  videoError.value = true;
}

function retryVideo() {
  videoError.value = false;
  videoReady.value = false;
  proxyFallbackTried.value = false;
  videoSrc.value = sectionVideo.value;
}

watch(sectionVideo, (v) => {
  if (v) {
    preloadVideoMetadata(v, "high");
  }
  videoSrc.value = v;
  videoError.value = false;
  videoReady.value = false;
  videoBuffering.value = false;
  proxyFallbackTried.value = false;
});

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
