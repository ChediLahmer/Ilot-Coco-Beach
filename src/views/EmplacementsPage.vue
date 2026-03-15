<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import { emplacements } from '@/data/mock.js'
import waterSwingImg from '@/assets/images/water-swing.jpg'

gsap.registerPlugin(ScrollTrigger)

const { locale } = useI18n()

const labels = {
  fr: {
    title: 'Nos Emplacements',
    subtitle: 'Chaque espace est une invitation à l\'évasion',
    persons: 'personnes',
    perPerson: '/ personne',
    reserve: 'Réserver',
    ctaTitle: 'Réservez votre emplacement',
    ctaDesc: 'Choisissez votre coin de paradis et vivez une expérience inoubliable sur notre île.',
    ctaButton: 'Réserver maintenant',
    currency: 'DT',
  },
  en: {
    title: 'Our Locations',
    subtitle: 'Every space is an invitation to escape',
    persons: 'persons',
    perPerson: '/ person',
    reserve: 'Book Now',
    ctaTitle: 'Reserve your spot',
    ctaDesc: 'Choose your corner of paradise and live an unforgettable experience on our island.',
    ctaButton: 'Book now',
    currency: 'DT',
  },
  ar: {
    title: 'أماكننا',
    subtitle: 'كل مكان هو دعوة للهروب',
    persons: 'أشخاص',
    perPerson: '/ للشخص',
    reserve: 'احجز',
    ctaTitle: 'احجز مكانك',
    ctaDesc: 'اختر ركنك من الجنة وعش تجربة لا تُنسى على جزيرتنا.',
    ctaButton: 'احجز الآن',
    currency: 'د.ت',
  },
}

function l(key) {
  return labels[locale.value]?.[key] ?? labels.fr[key]
}

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    const sections = document.querySelectorAll('.emp-section')
    sections.forEach((section, idx) => {
      const isReversed = idx % 2 !== 0
      gsap.from(section, {
        x: isReversed ? 80 : -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      })
    })

    gsap.from('.emp-cta', {
      y: 50,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.emp-cta',
        start: 'top 85%',
        once: true,
      },
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <div>
    <NavBar />

    <!-- Hero Section -->
    <section class="relative w-full overflow-hidden" style="height: 60vh; margin-top: 72px">
      <div class="absolute inset-0">
        <img
          :src="waterSwingImg"
          alt="Emplacements — Ilot Coco Beach"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1
          class="font-display text-white text-5xl md:text-7xl leading-tight"
          style="text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35)"
        >
          {{ l('title') }}
        </h1>
        <p class="font-heading text-white/80 text-lg md:text-xl mt-4 max-w-lg">
          {{ l('subtitle') }}
        </p>
      </div>
      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 w-full z-10 leading-[0]">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="w-full h-[50px] md:h-[70px]">
          <path d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z" fill="white" />
        </svg>
      </div>
    </section>

    <!-- Alternating Emplacement Sections -->
    <div class="bg-white">
      <div
        v-for="(emp, idx) in emplacements"
        :key="emp.id"
        class="emp-section"
      >
        <div
          class="flex flex-col min-h-[400px] md:min-h-[480px]"
          :class="idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
        >
          <!-- Image Side -->
          <div class="w-full md:w-1/2 relative overflow-hidden group">
            <img
              :src="emp.image"
              :alt="emp.name[locale]"
              class="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <!-- Price badge on image -->
            <div class="absolute top-4 right-4 md:top-6 md:right-6 bg-ocean/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-heading font-bold shadow-lg">
              {{ emp.price }} {{ l('currency') }} {{ l('perPerson') }}
            </div>
          </div>

          <!-- Content Side -->
          <div
            class="w-full md:w-1/2 flex items-center"
            :class="idx % 2 === 0 ? 'bg-sand' : 'bg-white'"
          >
            <div class="px-8 py-10 md:px-14 md:py-16 lg:px-20 max-w-xl">
              <h2 class="font-display text-ocean text-3xl md:text-4xl leading-snug">
                {{ emp.name[locale] }}
              </h2>

              <p class="text-charcoal/70 text-base md:text-lg leading-relaxed mt-5">
                {{ emp.desc[locale] }}
              </p>

              <!-- Details row -->
              <div class="flex flex-wrap items-center gap-4 mt-6">
                <!-- Price badge -->
                <span class="inline-flex items-center bg-ocean text-white rounded-full px-4 py-2 text-sm font-heading font-bold shadow-sm">
                  {{ emp.price }} {{ l('currency') }}
                </span>
                <!-- Capacity -->
                <span class="inline-flex items-center gap-1.5 text-charcoal/60 text-sm font-heading">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ emp.capacity }} {{ l('persons') }}
                </span>
              </div>

              <!-- CTA Button -->
              <a
                href="/#reservation"
                class="inline-block mt-8 bg-coral text-white font-heading font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
              >
                {{ l('reserve') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom CTA Section -->
    <section class="emp-cta bg-ocean-dark py-16 md:py-24 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <h2
          class="font-display text-white text-3xl md:text-5xl leading-tight"
          style="text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2)"
        >
          {{ l('ctaTitle') }}
        </h2>
        <p class="text-white/70 text-base md:text-lg font-heading mt-4 max-w-xl mx-auto leading-relaxed">
          {{ l('ctaDesc') }}
        </p>
        <a
          href="/#reservation"
          class="inline-block mt-8 bg-coral text-white font-heading font-semibold text-lg px-10 py-4 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
        >
          {{ l('ctaButton') }}
        </a>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<style scoped>
.emp-section + .emp-section {
  border-top: 1px solid rgba(194, 149, 107, 0.15);
}
</style>
