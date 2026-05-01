<script setup>
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavBar from "@/components/NavBar.vue";
import FooterSection from "@/components/FooterSection.vue";
import { useData } from "@/composables/useData";
import waterSwingImg from "@/assets/images/water-swing.jpg";

gsap.registerPlugin(ScrollTrigger);

const { locale } = useI18n();
const { spaces: emplacements } = useData();

const labels = {
  fr: {
    title: "Nos Emplacements",
    subtitle: "Chaque espace est une invitation à l'évasion",
    persons: "personnes",
    perPerson: "/ personne",
    reserve: "Réserver",
    ctaTitle: "Réservez votre emplacement",
    ctaDesc:
      "Choisissez votre coin de paradis et vivez une expérience inoubliable sur notre île.",
    ctaButton: "Réserver maintenant",
    currency: "DT",
  },
  en: {
    title: "Our Locations",
    subtitle: "Every space is an invitation to escape",
    persons: "persons",
    perPerson: "/ person",
    reserve: "Book Now",
    ctaTitle: "Reserve your spot",
    ctaDesc:
      "Choose your corner of paradise and live an unforgettable experience on our island.",
    ctaButton: "Book now",
    currency: "DT",
  },
  ar: {
    title: "أماكننا",
    subtitle: "كل مكان هو دعوة للهروب",
    persons: "أشخاص",
    perPerson: "/ للشخص",
    reserve: "احجز",
    ctaTitle: "احجز مكانك",
    ctaDesc: "اختر ركنك من الجنة وعش تجربة لا تُنسى على جزيرتنا.",
    ctaButton: "احجز الآن",
    currency: "د.ت",
  },
};

function l(key) {
  return labels[locale.value]?.[key] ?? labels.fr[key];
}

let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    const sections = document.querySelectorAll(".emp-section");
    sections.forEach((section, idx) => {
      const isReversed = idx % 2 !== 0;
      gsap.from(section, {
        x: isReversed ? 80 : -80,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });
    });

    gsap.from(".emp-cta", {
      y: 50,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".emp-cta",
        start: "top 85%",
        once: true,
      },
    });
  });
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div>
    <NavBar />

    <!-- Hero Section -->
    <section
      class="relative w-full overflow-hidden"
      style="height: 60vh; margin-top: 72px"
    >
      <div class="absolute inset-0">
        <img
          :src="waterSwingImg"
          alt="Emplacements — Ilot Coco Beach"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"
      />
      <div
        class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
      >
        <h1
          class="font-display text-white text-5xl md:text-7xl leading-tight"
          style="text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35)"
        >
          {{ l("title") }}
        </h1>
        <p class="font-heading text-white/80 text-lg md:text-xl mt-4 max-w-lg">
          {{ l("subtitle") }}
        </p>
      </div>
      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 w-full z-10 leading-[0]">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          class="w-full h-[50px] md:h-[70px]"
        >
          <path
            d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>

    <!-- Spaces Grid -->
    <div class="bg-white py-12 md:py-16 px-6 md:px-16">
      <div
        class="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="emp in emplacements"
          :key="emp.id"
          class="emp-section group overflow-hidden rounded-2xl border border-charcoal/8 bg-white shadow-[0_8px_30px_rgba(10,24,32,0.06)] transition-shadow hover:shadow-[0_12px_40px_rgba(10,24,32,0.1)]"
        >
          <!-- Image -->
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              v-if="emp.image"
              :src="emp.image"
              :alt="emp.name[locale]"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              class="w-full h-full bg-charcoal/5 flex items-center justify-center"
            >
              <svg
                class="w-12 h-12 text-charcoal/20"
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
            <div
              class="absolute top-3 right-3 bg-ocean/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-heading font-bold shadow-md"
            >
              {{ emp.price }} {{ l("currency") }} {{ l("perPerson") }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="font-display text-ocean text-xl leading-snug">
              {{ emp.name[locale] }}
            </h3>
            <p
              class="text-charcoal/65 text-sm leading-relaxed mt-2 line-clamp-3"
            >
              {{ emp.desc[locale] }}
            </p>

            <div class="flex items-center gap-3 mt-4">
              <span
                class="inline-flex items-center gap-1 text-charcoal/50 text-xs font-heading"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {{ emp.capacity }} {{ l("persons") }}
              </span>
            </div>

            <a
              href="/#reservation"
              class="mt-4 inline-flex items-center gap-2 font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-coral hover:text-deep transition-colors"
            >
              {{ l("reserve") }}
              <span class="block h-px w-6 bg-coral/50" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom CTA Section -->
    <section class="emp-cta bg-ocean-dark py-12 md:py-16 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <h2
          class="font-display text-white text-3xl md:text-5xl leading-tight"
          style="text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2)"
        >
          {{ l("ctaTitle") }}
        </h2>
        <p
          class="text-white/70 text-base md:text-lg font-heading mt-4 max-w-xl mx-auto leading-relaxed"
        >
          {{ l("ctaDesc") }}
        </p>
        <a
          href="/#reservation"
          class="inline-block mt-8 bg-coral text-white font-heading font-semibold text-lg px-10 py-4 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
        >
          {{ l("ctaButton") }}
        </a>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<style scoped></style>
