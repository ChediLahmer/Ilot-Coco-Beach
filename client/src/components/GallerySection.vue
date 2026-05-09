<template>
  <!-- Loading skeleton -->
  <section
    v-if="dataLoading && !images.length"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-b from-mist via-white to-sand-dark/30"
  >
    <div class="mx-auto max-w-6xl animate-pulse">
      <div class="flex flex-col gap-3 mb-8">
        <div class="h-3 w-20 rounded-full bg-charcoal/10" />
        <div class="h-7 w-36 rounded-full bg-charcoal/10" />
        <div class="h-0.5 w-14 rounded-full bg-charcoal/8" />
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          class="col-span-2 row-span-2 aspect-square rounded-lg bg-charcoal/8"
        />
        <div
          v-for="j in 4"
          :key="j"
          class="aspect-square rounded-lg bg-charcoal/8"
        />
      </div>
    </div>
  </section>

  <section
    v-else
    id="gallery"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-b from-mist via-white to-sand-dark/30"
  >
    <div class="mx-auto max-w-6xl">
      <div class="max-w-md">
        <p class="section-kicker">{{ t("gallery.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("gallery.title") }}</h2>
        <div class="section-divider" />
        <router-link
          to="/gallery"
          class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:text-ocean-dark"
        >
          {{ t("gallery.viewAll") }}
          <svg
            class="h-4 w-4 rtl-flip"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </router-link>
      </div>

      <div
        v-if="images.length > 0"
        class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <router-link
          to="/gallery"
          :class="[
            'group relative min-h-[14rem] overflow-hidden rounded-lg',
            images.length > 1
              ? 'sm:col-span-2 lg:col-span-2 sm:min-h-[18rem]'
              : 'sm:min-h-[18rem]',
          ]"
        >
          <div
            v-if="
              images[0].video &&
              !isVideoReady(images[0].src) &&
              !hasVideoError(images[0].src)
            "
            class="absolute inset-0 animate-pulse bg-charcoal/10"
          />
          <video
            v-if="images[0].video"
            :src="images[0].src"
            class="absolute inset-0 h-full w-full object-cover"
            :class="{
              'opacity-0':
                !isVideoReady(images[0].src) || hasVideoError(images[0].src),
            }"
            muted
            autoplay
            loop
            playsinline
            preload="auto"
            crossorigin="anonymous"
            @loadeddata="markVideoReady(images[0].src)"
            @error="markVideoError(images[0].src)"
          />
          <div
            v-if="images[0].video && hasVideoError(images[0].src)"
            class="absolute inset-0 flex items-center justify-center bg-charcoal/10 px-4 text-center text-sm text-charcoal/55"
          >
            {{ t("video.unavailable") }}
          </div>
          <img
            v-else
            :src="images[0].src"
            :alt="images[0].alt"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          />
        </router-link>

        <router-link
          v-for="image in images.slice(1, 4)"
          :key="image.alt"
          to="/gallery"
          class="group relative min-h-[11rem] overflow-hidden rounded-lg"
        >
          <div
            v-if="
              image.video &&
              !isVideoReady(image.src) &&
              !hasVideoError(image.src)
            "
            class="absolute inset-0 animate-pulse bg-charcoal/10"
          />
          <video
            v-if="image.video"
            :src="image.src"
            class="absolute inset-0 h-full w-full object-cover"
            :class="{
              'opacity-0': !isVideoReady(image.src) || hasVideoError(image.src),
            }"
            muted
            autoplay
            loop
            playsinline
            preload="auto"
            crossorigin="anonymous"
            @loadeddata="markVideoReady(image.src)"
            @error="markVideoError(image.src)"
          />
          <div
            v-if="image.video && hasVideoError(image.src)"
            class="absolute inset-0 flex items-center justify-center bg-charcoal/10 px-4 text-center text-sm text-charcoal/55"
          >
            {{ t("video.unavailable") }}
          </div>
          <img
            v-else
            :src="image.src"
            :alt="image.alt"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          />
        </router-link>
      </div>

      <div
        v-else-if="galleryError"
        class="mt-10 rounded-2xl border border-charcoal/8 bg-white/72 px-6 py-10 text-center shadow-sm"
      >
        <p class="text-sm text-charcoal/60">{{ t("error.description") }}</p>
        <button
          class="mt-5 rounded-full bg-ocean px-5 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-ocean/90"
          @click="retryGallery"
        >
          {{ t("error.retry") }}
        </button>
      </div>

      <div
        v-else
        class="mt-10 rounded-2xl border border-charcoal/8 bg-white/72 px-6 py-10 text-center shadow-sm"
      >
        <p class="text-sm text-charcoal/60">{{ t("gallery.empty") }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useData } from "@/composables/useData";

const { t } = useI18n();
const {
  galleryError,
  galleryImages,
  loading: dataLoading,
  retryGallery,
} = useData();
const readyVideos = ref({});
const erroredVideos = ref({});

function markVideoReady(src) {
  readyVideos.value = { ...readyVideos.value, [src]: true };
}

function markVideoError(src) {
  erroredVideos.value = { ...erroredVideos.value, [src]: true };
}

function isVideoReady(src) {
  return !!readyVideos.value[src];
}

function hasVideoError(src) {
  return !!erroredVideos.value[src];
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

const images = computed(() =>
  galleryImages.value.map((img) => ({
    src: img.url,
    alt: img.alt || "Ilot Coco Beach",
    video: isVideo(img.url),
    labelKey: img.category
      ? `gallery.labels.${img.category}`
      : "gallery.labels.overwater",
  })),
);
</script>
