<template>
  <section
    v-if="menuCategories.length > 0"
    id="menu"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-bl from-sand-dark/50 via-sand to-ocean-light/20"
  >
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <p class="section-kicker">{{ t("menu.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("menu.title") }}</h2>
        <div class="mx-auto section-divider" />
      </div>

      <!-- Controls -->
      <div
        class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div
          class="inline-flex items-center rounded-lg border border-charcoal/8 bg-sand/50 p-1"
        >
          <button
            v-for="mode in ['standard', 'extra']"
            :key="mode"
            :class="[
              'rounded-md px-5 py-2 text-sm font-medium transition-all',
              priceMode === mode
                ? 'bg-white text-deep shadow-sm'
                : 'text-charcoal/50 hover:text-charcoal/70',
            ]"
            @click="priceMode = mode"
          >
            {{ t(`menu.${mode}`) }}
          </button>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/menu"
            class="text-sm font-medium text-ocean hover:text-ocean-dark"
          >
            {{ t("menu.viewAll") }} &rarr;
          </router-link>
          <div class="flex items-center gap-1">
            <button ref="menuPrev" class="tropical-arrow">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button ref="menuNext" class="tropical-arrow">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Category filter -->
      <div class="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="category in menuCategories"
          :key="category.id"
          :class="[
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap shrink-0',
            activeCategory === category.id
              ? 'bg-deep text-white'
              : 'bg-sand text-charcoal/55 hover:bg-sand-dark hover:text-charcoal/75',
          ]"
          @click="activeCategory = category.id"
        >
          {{ category.name[locale] || category.name.fr }}
        </button>
      </div>

      <!-- Swiper carousel -->
      <div class="mt-6">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1.15"
          :space-between="16"
          :speed="500"
          :autoplay="{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :navigation="{ prevEl: menuPrev, nextEl: menuNext }"
          :breakpoints="{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }"
          :grab-cursor="true"
          class="overflow-hidden rounded-xl"
        >
          <SwiperSlide v-for="item in activeItems" :key="item.id">
            <article
              class="group flex h-full flex-col overflow-hidden rounded-lg border border-charcoal/8 bg-white"
            >
              <div
                class="relative aspect-[4/3] shrink-0 overflow-hidden bg-sand"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name[locale] || item.name.fr"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center"
                >
                  <svg
                    class="h-10 w-10 text-charcoal/15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
              </div>

              <div class="flex flex-1 flex-col p-4">
                <h3 class="font-brand text-lg text-deep">
                  {{ item.name[locale] || item.name.fr }}
                </h3>
                <p
                  class="mt-1.5 flex-1 text-sm leading-relaxed text-charcoal/55 line-clamp-2"
                >
                  {{
                    (item.desc || item.description || {})[locale] ||
                    (item.desc || item.description || {}).fr
                  }}
                </p>

                <div
                  class="mt-4 flex items-center justify-between border-t border-charcoal/6 pt-4"
                >
                  <span class="text-lg font-semibold text-deep">
                    {{ displayPrice(item) }} DT
                  </span>
                  <span
                    v-if="!item.available"
                    class="rounded bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral"
                  >
                    {{ t("menu.unavailable") }}
                  </span>
                </div>
              </div>
            </article>
          </SwiperSlide>
        </Swiper>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <article
          v-for="note in menuNotes"
          :key="note"
          class="rounded-lg border border-charcoal/8 bg-white px-5 py-4 text-left"
        >
          <p class="text-sm leading-7 text-charcoal/60">{{ note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";

import { useData } from "@/composables/useData";

const swiperModules = [Navigation, Autoplay];

const { t, locale } = useI18n();
const { menuCategories } = useData();

const priceMode = ref("standard");
const activeCategory = ref(menuCategories.value[0]?.id || 1);

const menuPrev = ref(null);
const menuNext = ref(null);

const activeCategoryData = computed(
  () =>
    menuCategories.value.find((c) => c.id === activeCategory.value) ??
    menuCategories.value[0],
);

const activeCategoryLabel = computed(
  () =>
    activeCategoryData.value?.name[locale.value] ||
    activeCategoryData.value?.name.fr ||
    "",
);

const activeItems = computed(() => activeCategoryData.value?.items || []);

const menuNotes = computed(() => [
  t("menu.notes.one"),
  t("menu.notes.two"),
  t("menu.notes.three"),
]);

function displayPrice(item) {
  return priceMode.value === "extra" ? item.priceExtra : item.priceStandard;
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
</script>
