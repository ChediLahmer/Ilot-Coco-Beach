<template>
  <section
    v-if="images.length > 0"
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

      <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          to="/gallery"
          :class="[
            'group relative min-h-[14rem] overflow-hidden rounded-lg',
            images.length > 1
              ? 'sm:col-span-2 lg:col-span-2 sm:min-h-[18rem]'
              : 'sm:min-h-[18rem]',
          ]"
        >
          <video
            v-if="images[0].video"
            :src="images[0].src"
            class="absolute inset-0 h-full w-full object-cover"
            muted
            autoplay
            loop
            playsinline
            preload="metadata"
          />
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
          <video
            v-if="image.video"
            :src="image.src"
            class="absolute inset-0 h-full w-full object-cover"
            muted
            autoplay
            loop
            playsinline
            preload="metadata"
          />
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
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useData } from "@/composables/useData";

const { t } = useI18n();
const { galleryImages } = useData();

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
