<template>
  <div class="min-h-screen bg-sand">
    <NavBar />

    <!-- Page header -->
    <div class="pt-[72px]">
      <div class="max-w-7xl mx-auto px-6 pt-12 pb-2">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal font-heading text-sm transition-colors"
        >
          <svg
            class="w-4 h-4"
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
          {{ t("gallery.backHome") || "Retour à l\u2019accueil" }}
        </router-link>
      </div>

      <div class="text-center py-10">
        <h1
          class="font-display text-charcoal text-4xl md:text-5xl tracking-wide"
        >
          {{ t("flash.title") }}
        </h1>
        <div class="w-12 h-[2px] bg-gold mx-auto mt-5 mb-3" />
        <p
          class="font-body text-charcoal/50 text-base md:text-lg max-w-xl mx-auto"
        >
          {{ t("flash.subtitle") || "" }}
        </p>
      </div>
    </div>

    <!-- Sales grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div
          v-for="sale in flashSales"
          :key="sale.id"
          class="relative rounded-2xl overflow-hidden group aspect-[3/4] sm:aspect-[3/4]"
          :class="{ 'opacity-60 pointer-events-none': !sale.isActive }"
        >
          <!-- Full card image -->
          <img
            v-if="sale.image"
            :src="sale.image"
            :alt="sale.title[locale] || sale.title.fr"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="absolute inset-0 bg-charcoal" />

          <!-- Dark gradient overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />

          <!-- Discount badge -->
          <span
            class="absolute top-4 right-4 bg-coral text-white font-heading font-bold text-sm px-3 py-1 rounded-full z-10"
          >
            -{{ sale.discountPercent }}%
          </span>
          <span
            v-if="!sale.isActive"
            class="absolute top-4 left-4 bg-red-500/90 text-white font-heading font-bold text-xs px-3 py-1 rounded-full z-10"
          >
            {{ t("flash.unavailable") }}
          </span>

          <!-- Content at bottom -->
          <div class="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3 z-10">
            <h3
              class="font-heading font-semibold text-white text-lg leading-tight"
            >
              {{ sale.title[locale] || sale.title.fr }}
            </h3>
            <p class="font-body text-white/70 text-sm line-clamp-2">
              {{ sale.description[locale] || sale.description.fr }}
            </p>

            <div
              v-if="getOriginalPrice(sale)"
              class="flex items-center gap-2 mt-1"
            >
              <span class="text-sm text-white/50 line-through">
                {{ getOriginalPrice(sale) }} DT
              </span>
              <span class="text-lg font-bold text-gold">
                {{ getDiscountedPrice(sale) }} DT
              </span>
            </div>

            <!-- Countdown -->
            <div v-if="!isSaleExpired(sale)" class="flex gap-2 mt-1">
              <div
                v-for="unit in getSaleCountdown(sale)"
                :key="unit.label"
                class="flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1"
              >
                <span
                  class="font-heading font-bold text-white text-sm leading-none"
                >
                  {{ String(unit.value).padStart(2, "0") }}
                </span>
                <span class="text-white/50 text-[10px] leading-tight mt-0.5">
                  {{ unit.label }}
                </span>
              </div>
            </div>
            <p
              v-else
              class="font-heading font-semibold text-coral-light text-sm"
            >
              {{ t("flash.expired") }}
            </p>

            <!-- CTA -->
            <a
              v-if="!isSaleExpired(sale)"
              href="#reservation"
              class="text-gold-light hover:text-gold font-heading text-xs uppercase tracking-wider transition-colors duration-200 mt-1"
              @click.prevent="scrollToReservation"
            >
              {{ t("flash.bookNow") }} &rarr;
            </a>
          </div>
        </div>
      </div>
      <!-- Sales sentinel for infinite scroll -->
      <div ref="salesSentinel" class="h-1" />
    </div>

    <div class="max-w-7xl mx-auto px-6 pb-20">
      <div class="premium-card rounded-[2rem] p-6 sm:p-8">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-coral/80"
            >
              {{ t("vouchers.title") }}
            </p>
            <h2 class="mt-4 font-brand text-3xl text-deep sm:text-4xl">
              {{ t("vouchers.subtitle") }}
            </h2>
          </div>
          <router-link
            :to="{ path: '/', hash: '#reservation' }"
            class="inline-flex items-center gap-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-coral hover:text-deep"
          >
            {{ t("menu.reserveCta") }}
            <span class="block h-px w-8 bg-coral/45" />
          </router-link>
        </div>

        <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="voucher in vouchers"
            :key="voucher.id"
            class="rounded-[1.5rem] border border-charcoal/8 bg-white/72 p-5"
            :class="{ 'opacity-60': !voucher.isActive }"
          >
            <p
              class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-coral/80"
            >
              {{ t("vouchers.code") }}
            </p>
            <p class="mt-4 font-brand text-3xl text-deep">
              {{ voucher.code }}
            </p>
            <p class="mt-4 text-sm text-charcoal/58">
              -{{ voucher.discountPercent }}% {{ t("vouchers.off") }}
            </p>
            <p class="mt-2 text-sm text-charcoal/48">
              {{ t("vouchers.validUntil") }}:
              {{ formatVoucherDate(voucher.validUntil) }}
            </p>
            <span
              v-if="!voucher.isActive"
              class="mt-3 inline-block rounded bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600"
            >
              {{ t("vouchers.unavailable") }}
            </span>
          </article>
        </div>
        <!-- Vouchers sentinel for infinite scroll -->
        <div ref="vouchersSentinel" class="h-1" />
      </div>
    </div>

    <FooterSection />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import FooterSection from "@/components/FooterSection.vue";
import { api } from "@/lib/supabase";
import { useCountdown } from "@/composables/useCountdown";

const { t, locale } = useI18n();
const router = useRouter();

const PAGE_SIZE = 10;

// Flash Sales state
const flashSales = ref([]);
const salesPage = ref(1);
const hasMoreSales = ref(true);
const loadingSales = ref(false);
const salesSentinel = ref(null);

// Vouchers state
const vouchers = ref([]);
const vouchersPage = ref(1);
const hasMoreVouchers = ref(true);
const loadingVouchers = ref(false);
const vouchersSentinel = ref(null);

async function loadSales() {
  if (loadingSales.value || !hasMoreSales.value) return;
  loadingSales.value = true;
  try {
    const res = await api.getFlashSales(salesPage.value, PAGE_SIZE);
    flashSales.value = [...flashSales.value, ...res.items];
    hasMoreSales.value = salesPage.value < res.totalPages;
    salesPage.value++;
  } catch {
    /* keep current */
  } finally {
    loadingSales.value = false;
  }
}

async function loadVouchers() {
  if (loadingVouchers.value || !hasMoreVouchers.value) return;
  loadingVouchers.value = true;
  try {
    const res = await api.getVouchers(vouchersPage.value, PAGE_SIZE);
    vouchers.value = [...vouchers.value, ...res.items];
    hasMoreVouchers.value = vouchersPage.value < res.totalPages;
    vouchersPage.value++;
  } catch {
    /* keep current */
  } finally {
    loadingVouchers.value = false;
  }
}

let salesObserver = null;
let vouchersObserver = null;
const now = useCountdown();

onMounted(async () => {
  await loadSales();
  await loadVouchers();

  salesObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadSales();
    },
    { rootMargin: "300px" },
  );
  vouchersObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadVouchers();
    },
    { rootMargin: "300px" },
  );
  if (salesSentinel.value) salesObserver.observe(salesSentinel.value);
  if (vouchersSentinel.value) vouchersObserver.observe(vouchersSentinel.value);
});

onUnmounted(() => {
  salesObserver?.disconnect();
  vouchersObserver?.disconnect();
});

function isSaleExpired(sale) {
  return now.value >= new Date(sale.endsAt).getTime();
}

function getSaleCountdown(sale) {
  const diff = Math.max(0, new Date(sale.endsAt).getTime() - now.value);
  const s = Math.floor(diff / 1000);
  return [
    { label: t("flash.days"), value: Math.floor(s / 86400) },
    { label: t("flash.hours"), value: Math.floor((s % 86400) / 3600) },
    { label: t("flash.minutes"), value: Math.floor((s % 3600) / 60) },
    { label: t("flash.seconds"), value: s % 60 },
  ];
}

function formatVoucherDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value || "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scrollToReservation() {
  router.push("/#reservation");
}

function getOriginalPrice(sale) {
  if (sale.menuItem) return Number(sale.menuItem.priceStandard);
  if (sale.space) return Number(sale.space.price);
  return null;
}

function getDiscountedPrice(sale) {
  const original = getOriginalPrice(sale);
  if (!original) return null;
  return (original * (1 - sale.discountPercent / 100)).toFixed(2);
}
</script>
