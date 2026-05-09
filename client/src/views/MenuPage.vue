<template>
  <div class="min-h-screen bg-sand">
    <NavBar />

    <section
      class="relative overflow-hidden px-6 pb-16 pt-[7.5rem] md:px-16 md:pb-20 md:pt-[8.5rem]"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,93,74,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(32,178,170,0.12),transparent_28%)]"
      />
      <div class="sand-texture absolute inset-0 opacity-40" />

      <div class="relative z-10 mx-auto max-w-7xl">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-sm font-heading font-semibold uppercase tracking-[0.16em] text-charcoal/45 hover:text-coral"
        >
          <svg
            class="h-4 w-4 rtl-flip"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ copy.backHome }}
        </router-link>

        <div
          class="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"
        >
          <div>
            <p class="section-kicker">{{ t("menu.eyebrow") }}</p>
            <h1 class="section-title mt-6">{{ copy.title }}</h1>
            <div class="section-divider" />
            <p class="section-copy mt-8 max-w-xl">
              {{ copy.subtitle }}
            </p>

            <div class="premium-card mt-8 rounded-[1.75rem] p-6 sm:p-8">
              <p
                class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ocean/70"
              >
                {{ copy.selectionTitle }}
              </p>
              <p class="mt-4 text-sm leading-7 text-charcoal/60">
                {{ copy.selectionSubtitle }}
              </p>

              <div
                class="mt-6 inline-flex w-fit items-center rounded-lg border border-charcoal/8 bg-sand/50 p-1"
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

              <router-link
                :to="{ path: '/', hash: '#reservation' }"
                class="mt-6 flex items-center gap-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-coral hover:text-deep"
              >
                {{ t("menu.reserveCta") }}
                <span class="block h-px w-8 bg-coral/45" />
              </router-link>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <article
              class="premium-card rounded-[1.75rem] p-6 sm:col-span-1 overflow-hidden"
            >
              <p
                class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-coral/80"
              >
                {{ copy.activeCategory }}
              </p>
              <p class="mt-4 font-brand text-2xl text-deep truncate">
                {{ activeCategoryLabel }}
              </p>
            </article>

            <article class="premium-card rounded-[1.75rem] p-6 sm:col-span-1">
              <p
                class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-coral/80"
              >
                {{ copy.itemCount }}
              </p>
              <p class="mt-4 font-brand text-3xl text-deep">
                {{ activeItems.length }}
              </p>
            </article>

            <article class="premium-card rounded-[1.75rem] p-6 sm:col-span-1">
              <p
                class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-coral/80"
              >
                {{ copy.priceMode }}
              </p>
              <p class="mt-4 font-brand text-3xl text-deep">
                {{ t(`menu.${priceMode}`) }}
              </p>
            </article>

            <div class="premium-card rounded-[1.75rem] p-4 sm:col-span-3">
              <div
                class="relative"
                @mouseenter="pause"
                @mouseleave="resume"
                @touchstart.passive="pause"
                @touchend.passive="resume"
              >
                <button
                  v-if="canScrollLeft"
                  @click="scrollByStep(-1)"
                  class="absolute -start-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md text-charcoal/60 hover:text-charcoal transition-colors"
                  aria-label="Scroll left"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div
                  ref="catScrollerEl"
                  class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                  @scroll="updateScrollState"
                >
                  <button
                    v-for="category in menuCategories"
                    :key="category.id"
                    data-rail-item
                    :class="[
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap shrink-0 snap-start',
                      activeCategory === category.id
                        ? 'bg-deep text-white'
                        : 'bg-sand text-charcoal/55 hover:bg-sand-dark hover:text-charcoal/75',
                    ]"
                    @click="activeCategory = category.id"
                  >
                    {{ category.name[locale] || category.name.fr }}
                  </button>
                </div>
                <button
                  v-if="canScrollRight"
                  @click="scrollByStep(1)"
                  class="absolute -end-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md text-charcoal/60 hover:text-charcoal transition-colors"
                  aria-label="Scroll right"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
        </div>

        <div v-if="!menuCategories.length" class="mt-12 py-16">
          <div v-if="loading" class="animate-pulse space-y-6">
            <div class="flex gap-2 mb-6">
              <div
                v-for="j in 4"
                :key="j"
                class="h-8 w-20 rounded-full bg-charcoal/8"
              />
            </div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div
                v-for="j in 6"
                :key="j"
                class="flex gap-4 rounded-lg border border-charcoal/8 bg-white p-4"
              >
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-3/4 rounded bg-charcoal/8" />
                  <div class="h-3 w-full rounded bg-charcoal/6" />
                  <div class="h-3 w-1/3 rounded bg-charcoal/6" />
                </div>
                <div class="h-4 w-12 rounded bg-charcoal/8" />
              </div>
            </div>
          </div>
          <p v-else class="text-charcoal/50 text-sm text-center">
            {{ copy.emptyMenu }}
          </p>
        </div>

        <div v-else class="mt-12 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div v-if="featureItems.length">
            <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <article
                v-for="item in featureItems"
                :key="item.id"
                class="premium-card overflow-hidden rounded-[1.75rem]"
              >
                <div class="relative aspect-[4/3] overflow-hidden bg-sand/70">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name[locale] || item.name.fr"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    class="absolute inset-x-4 top-4 flex items-start justify-between gap-3"
                  >
                    <p
                      class="rounded-full border border-white/30 bg-white/88 px-3 py-1 font-heading text-[0.62rem] font-bold uppercase tracking-[0.18em] text-charcoal/78 shadow-sm"
                    >
                      {{ activeCategoryLabel }}
                    </p>
                    <p
                      class="rounded-full bg-[linear-gradient(135deg,var(--color-sunset),var(--color-gold))] px-3 py-1 text-[0.72rem] font-heading font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(255,123,58,0.18)]"
                    >
                      {{ displayPrice(item) }} {{ copy.currency }}
                    </p>
                  </div>
                </div>

                <div class="p-6 overflow-hidden">
                  <h2
                    class="font-brand text-[2rem] leading-tight text-deep line-clamp-2"
                  >
                    {{ item.name[locale] || item.name.fr }}
                  </h2>
                  <p
                    class="mt-4 text-sm leading-7 text-charcoal/66 line-clamp-3"
                  >
                    {{ item.desc[locale] || item.desc.fr }}
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div class="premium-card rounded-[1.75rem] p-6 sm:p-8">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p
                  class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ocean/70"
                >
                  {{ copy.fullList }}
                </p>
                <h2 class="mt-4 font-brand text-3xl text-deep">
                  {{ activeCategoryLabel }}
                </h2>
              </div>
              <span
                class="rounded-full bg-coral/10 px-3 py-1 text-[0.68rem] font-heading font-bold uppercase tracking-[0.16em] text-coral"
              >
                {{ activeItems.length }} {{ copy.itemsLabel }}
              </span>
            </div>

            <div class="mt-8 space-y-4">
              <article
                v-for="item in visibleItems"
                :key="item.id"
                class="rounded-[1.35rem] border border-charcoal/8 bg-white/70 px-5 py-4"
              >
                <div class="flex items-start gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline gap-3">
                      <h3 class="font-heading text-base font-bold text-deep">
                        {{ item.name[locale] || item.name.fr }}
                      </h3>
                      <span
                        v-if="item.available === false"
                        class="shrink-0 rounded bg-red-100 px-2 py-0.5 text-[0.65rem] font-semibold text-red-600"
                      >
                        {{ t("menu.unavailable") }}
                      </span>
                      <span
                        class="flex-1 border-b border-dotted border-charcoal/18"
                      />
                      <span
                        class="font-heading text-base font-bold text-ocean-dark"
                      >
                        {{ displayPrice(item) }} {{ copy.currency }}
                      </span>
                    </div>
                    <p class="mt-3 text-sm leading-7 text-charcoal/60">
                      {{ item.desc[locale] || item.desc.fr }}
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <button
              v-if="hasMoreItems"
              @click="loadMoreItems"
              class="mt-6 w-full rounded-xl border border-charcoal/10 bg-white/60 py-3 text-sm font-heading font-semibold text-charcoal/60 hover:bg-white hover:text-charcoal transition-colors"
            >
              {{
                t("menu.showMore", {
                  count: remainingCount,
                })
              }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import FooterSection from "@/components/FooterSection.vue";
import NavBar from "@/components/NavBar.vue";
import { useData } from "@/composables/useData";
import { useHorizontalRail } from "@/composables/useHorizontalRail";

const { locale, t } = useI18n();
const { menuCategories, loading } = useData();

const {
  scrollerEl: catScrollerEl,
  canScrollLeft,
  canScrollRight,
  scrollByStep,
  updateScrollState,
  pause,
  resume,
} = useHorizontalRail(
  computed(() => menuCategories.value.length),
  {
    autoInterval: 5000,
    wrap: true,
  },
);

const priceMode = ref("standard");
const activeCategory = ref(menuCategories.value[0]?.id ?? null);
watch(
  () => menuCategories.value,
  (cats) => {
    if (activeCategory.value === null && cats.length) {
      activeCategory.value = cats[0].id;
    }
  },
);

watch(activeCategory, () => {
  itemsPage.value = 1;
});

const activeCategoryData = computed(
  () =>
    menuCategories.value.find(
      (category) => category.id === activeCategory.value,
    ) ?? menuCategories.value[0],
);
const activeCategoryLabel = computed(
  () =>
    activeCategoryData.value?.name[locale.value] ||
    activeCategoryData.value?.name.fr ||
    "",
);
const activeItems = computed(() => activeCategoryData.value?.items || []);
const featureItems = computed(() =>
  visibleItems.value.filter((item) => item.image).slice(0, 4),
);

const ITEMS_PAGE_SIZE = 8;
const itemsPage = ref(1);
const visibleItems = computed(() => {
  return activeItems.value.slice(0, itemsPage.value * ITEMS_PAGE_SIZE);
});
const hasMoreItems = computed(
  () => visibleItems.value.length < activeItems.value.length,
);
const remainingCount = computed(
  () => activeItems.value.length - visibleItems.value.length,
);
function loadMoreItems() {
  itemsPage.value++;
}

const copy = computed(
  () =>
    ({
      fr: {
        title: "La carte complète",
        subtitle:
          "Une lecture claire de la carte, catégorie par catégorie, pour éviter une page interminable tout en gardant toute l’offre accessible.",
        selectionTitle: "Préparer votre choix",
        selectionSubtitle:
          "Choisissez votre catégorie, consultez les prix standard ou extra, puis revenez vers la réservation quand votre sélection est prête.",
        activeCategory: "Catégorie active",
        itemCount: "Nombre de plats",
        priceMode: "Tarification",
        fullList: "Liste détaillée",
        itemsLabel: "plats",
        currency: "DT",
        backHome: "Retour à l’accueil",
        emptyMenu: "Aucun plat disponible pour le moment.",
      },
      en: {
        title: "The full menu",
        subtitle:
          "A clearer way to browse the menu, one category at a time, without forcing guests through one endless page.",
        selectionTitle: "Plan your order",
        selectionSubtitle:
          "Choose a category, switch between standard and extra pricing, then jump back to reservation once you are ready.",
        activeCategory: "Active category",
        itemCount: "Number of dishes",
        priceMode: "Price mode",
        fullList: "Detailed list",
        itemsLabel: "items",
        currency: "DT",
        backHome: "Back to home",
        emptyMenu: "No dishes available at the moment.",
      },
      ar: {
        title: "القائمة الكاملة",
        subtitle:
          "طريقة أوضح لتصفح القائمة حسب الفئة، بدون جعل الزائر يمر في صفحة طويلة بلا نهاية.",
        selectionTitle: "حضّر اختيارك",
        selectionSubtitle:
          "اختر الفئة، بدّل بين التسعير العادي والإضافي، ثم ارجع إلى الحجز عندما تصبح جاهزاً.",
        activeCategory: "الفئة الحالية",
        itemCount: "عدد الأطباق",
        priceMode: "نوع التسعير",
        fullList: "القائمة التفصيلية",
        itemsLabel: "طبق",
        currency: "د.ت",
        backHome: "العودة للرئيسية",
        emptyMenu: "لا توجد أطباق متاحة حالياً.",
      },
    })[locale.value] || {
      title: "La carte complète",
      subtitle:
        "Une lecture claire de la carte, catégorie par catégorie, pour éviter une page interminable tout en gardant toute l’offre accessible.",
      selectionTitle: "Préparer votre choix",
      selectionSubtitle:
        "Choisissez votre catégorie, consultez les prix standard ou extra, puis revenez vers la réservation quand votre sélection est prête.",
      activeCategory: "Catégorie active",
      itemCount: "Nombre de plats",
      priceMode: "Tarification",
      fullList: "Liste détaillée",
      itemsLabel: "plats",
      currency: "DT",
      backHome: "Retour à l’accueil",
      emptyMenu: "Aucun plat disponible pour le moment.",
    },
);

function displayPrice(item) {
  const price =
    priceMode.value === "extra" ? item.priceExtra : item.priceStandard;
  return price ?? item.priceStandard ?? "—";
}
</script>
