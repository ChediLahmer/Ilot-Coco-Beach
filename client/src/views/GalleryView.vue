<template>
  <div class="min-h-screen bg-transparent">
    <NavBar />

    <!-- Hero banner -->
    <div class="relative h-[40vh] mt-[72px] overflow-hidden">
      <video
        v-if="isVideo(heroImage)"
        :src="heroImage"
        v-play-visible
        class="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsinline
        preload="metadata"
      />
      <img
        v-else
        :src="heroImage"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/20 via-deep/50 to-deep/85"
      />
      <div
        class="relative z-10 flex flex-col items-center justify-center h-full text-center"
      >
        <h1
          class="font-brand font-black text-5xl md:text-7xl text-white tracking-tight"
        >
          {{ t("gallery.title") || "Galerie" }}
        </h1>
        <div class="w-10 h-[2px] bg-gold/60 mx-auto mt-4" />
        <p class="font-body text-white/60 text-sm md:text-base mt-3 max-w-md">
          {{ t("gallery.subtitle") || "Découvrez notre univers en images" }}
        </p>
      </div>
    </div>

    <!-- Category tabs -->
    <div
      class="sticky top-[72px] z-30 bg-sand/95 backdrop-blur-sm border-b border-charcoal/5"
    >
      <div
        dir="ltr"
        class="max-w-7xl mx-auto px-6 py-4 flex gap-6 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="[
            'whitespace-nowrap font-heading text-sm transition-all duration-200 pb-1',
            activeCategory === cat.id
              ? 'text-charcoal font-semibold border-b-2 border-charcoal'
              : 'text-charcoal/40 hover:text-charcoal/60',
          ]"
          @click="setCategory(cat.id)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Masonry grid with infinite scroll -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <!-- Initial loading skeleton -->
      <div
        v-if="!visibleImages.length && galleryHasMore"
        class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 animate-pulse"
      >
        <div
          v-for="j in 8"
          :key="j"
          class="break-inside-avoid rounded-xl bg-charcoal/8"
          :style="{ height: 140 + (j % 3) * 60 + 'px' }"
        />
      </div>

      <!-- Data validation error -->
      <div
        v-else-if="
          galleryImages.length > 0 && validatedGalleryImages.length === 0
        "
        class="text-center py-16"
      >
        <p class="text-charcoal/60 text-sm">
          {{
            t("error.dataValidation") ||
            "Impossible de charger les images valides"
          }}
        </p>
      </div>

      <div v-else class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        <div
          v-for="(img, idx) in visibleImages"
          :key="img.key + '-' + idx"
          class="break-inside-avoid cursor-pointer overflow-hidden rounded-xl relative"
          @click="openLightbox(idx)"
        >
          <video
            v-if="isVideo(img.src)"
            :src="img.src"
            v-play-visible
            class="w-full object-cover rounded-xl pointer-events-none"
            muted
            loop
            playsinline
            preload="metadata"
          />
          <img
            v-else
            :src="img.src"
            :alt="img.alt"
            class="w-full object-cover transition-all duration-500 hover:brightness-110 hover:scale-[1.02] rounded-xl"
            loading="lazy"
            decoding="async"
          />
          <div
            v-if="isVideo(img.src)"
            class="absolute top-2 start-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
          >
            Vidéo
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div ref="sentinelEl" class="h-1" />
      <div v-if="galleryLoading" class="flex justify-center py-10">
        <div
          class="w-8 h-8 border-2 border-charcoal/10 border-t-ocean rounded-full animate-spin"
        />
      </div>

      <!-- No more images -->
      <p
        v-if="!hasMore && visibleImages.length > 0"
        class="text-center text-charcoal/30 font-body text-sm py-12"
      >
        {{ t("gallery.noMore") || "Vous avez tout vu !" }}
      </p>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          @click.self="closeLightbox"
        >
          <button
            class="absolute top-4 end-4 w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 text-4xl leading-none z-10"
            @click="closeLightbox"
          >
            &times;
          </button>
          <button
            class="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 text-4xl z-10"
            @click="prevImage"
          >
            &#8249;
          </button>
          <video
            v-if="isVideo(visibleImages[lightboxIndex]?.src)"
            :key="visibleImages[lightboxIndex]?.src"
            :src="visibleImages[lightboxIndex]?.src"
            class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            controls
            autoplay
            playsinline
            preload="metadata"
          />
          <img
            v-else
            :src="visibleImages[lightboxIndex]?.src"
            :alt="visibleImages[lightboxIndex]?.alt"
            class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
          <button
            class="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 text-4xl z-10"
            @click="nextImage"
          >
            &#8250;
          </button>
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-heading"
          >
            {{ lightboxIndex + 1 }} / {{ visibleImages.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Back to home -->
    <div class="text-center pb-16">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal font-heading text-sm transition-colors"
      >
        <svg
          class="w-4 h-4 rtl-flip"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg>
        {{ t("gallery.backHome") || "Retour \u00e0 l\u2019accueil" }}
      </router-link>
    </div>

    <FooterSection />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import NavBar from "@/components/NavBar.vue";
import FooterSection from "@/components/FooterSection.vue";
import { useData } from "@/composables/useData";
import { useConfig } from "@/composables/useConfig";

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function validateGalleryImage(img) {
  try {
    if (!img || typeof img !== "object") {
      throw new Error("Image is not an object");
    }
    const imageId = Number(img.id);
    if (!Number.isInteger(imageId) || imageId <= 0) {
      throw new Error("Image id is missing or invalid");
    }
    if (
      !img.url ||
      typeof img.url !== "string" ||
      !img.url.startsWith("http")
    ) {
      throw new Error("Image url must be a valid HTTP(S) URL");
    }
    if (
      img.alt !== null &&
      img.alt !== undefined &&
      typeof img.alt !== "string"
    ) {
      throw new Error("Image alt must be a string or null");
    }
    if (
      img.categoryId !== null &&
      img.categoryId !== undefined &&
      (!Number.isInteger(Number(img.categoryId)) || Number(img.categoryId) <= 0)
    ) {
      throw new Error("Image categoryId must be an integer or null");
    }
    return true;
  } catch (error) {
    console.error("[GalleryView] Validation error:", error.message, { img });
    return false;
  }
}

const { t, locale } = useI18n();
const { galleryImages, galleryHasMore, galleryLoading, loadMoreGallery } =
  useData();
const config = useConfig();

const validatedGalleryImages = computed(() => {
  try {
    return galleryImages.value.filter((img) => validateGalleryImage(img));
  } catch (error) {
    console.error("[GalleryView] Error filtering gallery images:", error);
    return [];
  }
});

const heroImage = computed(() => {
  // Use the banner explicitly chosen in the admin when it still exists in the
  // gallery; otherwise fall back to the first item. This keeps the banner
  // stable and under the user's control (order is per-category, so it can't
  // reliably pick one global "first" image on its own).
  const chosen = config.galleryHero;
  if (
    chosen &&
    validatedGalleryImages.value.some((img) => img.url === chosen)
  ) {
    return chosen;
  }
  return validatedGalleryImages.value[0]?.url ?? "";
});

const allMappedImages = computed(() =>
  validatedGalleryImages.value.map((img) => ({
    key: img.id,
    src: img.url,
    alt: img.alt || "Ilot Coco Beach",
    categoryId: img.categoryId || null,
    categoryLabel: img.catRef
      ? img.catRef.name[locale.value] || img.catRef.name.fr
      : null,
  })),
);

// --- Categories (dynamic from data, i18n-aware) ---
const categories = computed(() => {
  const catMap = new Map();
  for (const img of galleryImages.value) {
    if (img.catRef && !catMap.has(img.catRef.id)) {
      catMap.set(img.catRef.id, img.catRef);
    }
  }
  const sorted = [...catMap.values()].sort((a, b) => a.order - b.order);
  return [
    { id: "all", label: t("gallery.allCategories") || "Tout" },
    ...sorted.map((c) => ({
      id: c.id,
      label: c.name[locale.value] || c.name.fr,
    })),
  ];
});

const activeCategory = ref("all");

// --- Filtered images ---
const filteredImages = computed(() => {
  if (activeCategory.value === "all") return allMappedImages.value;
  return allMappedImages.value.filter(
    (img) => img.categoryId === activeCategory.value,
  );
});

// --- Infinite scroll ---
const PAGE_SIZE = 8;
const visibleCount = ref(PAGE_SIZE);

const visibleImages = computed(() =>
  filteredImages.value.slice(0, visibleCount.value),
);
const hasMore = computed(
  () =>
    visibleCount.value < filteredImages.value.length || !!galleryHasMore.value,
);

const sentinelEl = ref(null);
let observer = null;

function loadMore() {
  if (visibleCount.value < filteredImages.value.length) {
    visibleCount.value = Math.min(
      visibleCount.value + PAGE_SIZE,
      filteredImages.value.length,
    );
  } else if (galleryHasMore.value) {
    loadMoreGallery();
  }
}

function setCategory(id) {
  activeCategory.value = id;
  visibleCount.value = PAGE_SIZE;
}

function setupObserver() {
  if (observer) observer.disconnect();
  if (!sentinelEl.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "200px" },
  );
  observer.observe(sentinelEl.value);
}

// --- Lightbox ---
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(idx) {
  lightboxIndex.value = idx;
  lightboxOpen.value = true;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightboxOpen.value = false;
  document.body.style.overflow = "";
}

function nextImage() {
  lightboxIndex.value = (lightboxIndex.value + 1) % visibleImages.value.length;
}

function prevImage() {
  lightboxIndex.value =
    (lightboxIndex.value - 1 + visibleImages.value.length) %
    visibleImages.value.length;
}

function handleKeydown(e) {
  if (!lightboxOpen.value) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
}

// --- Lifecycle ---
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  nextTick(() => setupObserver());
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (observer) observer.disconnect();
  document.body.style.overflow = "";
});
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
