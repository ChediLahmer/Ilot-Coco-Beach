<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import { menuCategories } from '@/data/mock.js'
import heroImg from '@/assets/images/hero-beach-lounge.jpg'

gsap.registerPlugin(ScrollTrigger)

const { locale } = useI18n()

const selectedMenu = ref('standard')
const menuContent = ref(null)

const labels = {
  fr: {
    title: 'Notre Menu',
    subtitle: 'Des saveurs méditerranéennes, les pieds dans le sable',
    standard: 'Standard',
    extra: 'Extra',
    unavailable: 'Indisponible',
    currency: 'DT',
  },
  en: {
    title: 'Our Menu',
    subtitle: 'Mediterranean flavors, feet in the sand',
    standard: 'Standard',
    extra: 'Extra',
    unavailable: 'Unavailable',
    currency: 'DT',
  },
  ar: {
    title: 'قائمتنا',
    subtitle: 'نكهات البحر الأبيض المتوسط، أقدامكم على الرمال',
    standard: 'عادي',
    extra: 'إكسترا',
    unavailable: 'غير متوفر',
    currency: 'د.ت',
  },
}

function l(key) {
  return labels[locale.value]?.[key] ?? labels.fr[key]
}

function getPrice(item) {
  const price = selectedMenu.value === 'standard' ? item.priceStandard : item.priceExtra
  return `${price} ${l('currency')}`
}

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    const items = menuContent.value?.querySelectorAll('.menu-item')
    if (items?.length) {
      gsap.from(items, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: menuContent.value,
          start: 'top 85%',
          once: true,
        },
      })
    }

    const headings = menuContent.value?.querySelectorAll('.category-heading')
    if (headings?.length) {
      headings.forEach((heading) => {
        gsap.from(heading, {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%',
            once: true,
          },
        })
      })
    }
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
    <section class="relative w-full overflow-hidden" style="height: 50vh; margin-top: 72px">
      <div class="absolute inset-0">
        <img
          :src="heroImg"
          alt="Menu — Ilot Coco Beach"
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
          <path d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z" class="fill-sand" />
        </svg>
      </div>
    </section>

    <!-- Menu Body -->
    <section class="bg-sand py-12 md:py-20 px-4 md:px-8">
      <!-- Toggle Pills -->
      <div class="flex justify-center mb-14">
        <div class="inline-flex items-center rounded-full p-1.5 bg-white shadow-lg shadow-charcoal/5">
          <button
            class="px-7 py-2.5 rounded-full text-sm font-heading font-semibold transition-all duration-300 cursor-pointer border-none"
            :class="selectedMenu === 'standard'
              ? 'bg-ocean text-white shadow-md'
              : 'text-charcoal/60 hover:text-ocean'"
            @click="selectedMenu = 'standard'"
          >
            {{ l('standard') }}
          </button>
          <button
            class="px-7 py-2.5 rounded-full text-sm font-heading font-semibold transition-all duration-300 cursor-pointer border-none"
            :class="selectedMenu === 'extra'
              ? 'bg-ocean text-white shadow-md'
              : 'text-charcoal/60 hover:text-ocean'"
            @click="selectedMenu = 'extra'"
          >
            {{ l('extra') }}
          </button>
        </div>
      </div>

      <!-- Menu Content -->
      <div ref="menuContent" class="max-w-5xl mx-auto">
        <div v-for="(category, catIdx) in menuCategories" :key="category.id">
          <!-- Category Heading -->
          <div class="category-heading flex items-center gap-5 mb-8">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-driftwood/30 to-driftwood/50" />
            <h2 class="font-heading font-bold text-2xl md:text-3xl text-ocean whitespace-nowrap tracking-tight">
              {{ category.name[locale] }}
            </h2>
            <div class="h-px flex-1 bg-gradient-to-l from-transparent via-driftwood/30 to-driftwood/50" />
          </div>

          <!-- Menu Items -->
          <div class="space-y-4">
            <div
              v-for="item in category.items"
              :key="item.id"
              class="menu-item group"
              :class="{ 'opacity-50': !item.available }"
            >
              <!-- Card with image -->
              <div
                v-if="item.image"
                class="flex items-center gap-5 md:gap-6 bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <!-- Thumbnail -->
                <img
                  :src="item.image"
                  :alt="item.name[locale]"
                  class="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-300"
                  loading="lazy"
                />
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h3 class="font-heading font-bold text-lg text-charcoal">
                        {{ item.name[locale] }}
                      </h3>
                      <p class="text-sm text-charcoal/60 mt-1 leading-relaxed line-clamp-2">
                        {{ item.desc[locale] }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-ocean font-bold text-xl font-heading">
                        {{ getPrice(item) }}
                      </span>
                      <span
                        v-if="!item.available"
                        class="bg-charcoal/80 text-white text-[10px] font-heading font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {{ l('unavailable') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card without image (classic dotted line style) -->
              <div
                v-else
                class="flex items-start gap-4 bg-white/60 rounded-2xl px-5 py-4 hover:bg-white transition-colors duration-300"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-2">
                    <span class="font-heading font-bold text-lg text-charcoal whitespace-nowrap">
                      {{ item.name[locale] }}
                    </span>
                    <span class="flex-1 border-b-2 border-dotted border-driftwood/40 translate-y-[-3px]" />
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span
                        v-if="!item.available"
                        class="bg-charcoal/80 text-white text-[10px] font-heading font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {{ l('unavailable') }}
                      </span>
                      <span class="text-ocean font-bold text-xl font-heading whitespace-nowrap">
                        {{ getPrice(item) }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-charcoal/60 mt-1 leading-relaxed">
                    {{ item.desc[locale] }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative Divider between categories -->
          <div
            v-if="catIdx < menuCategories.length - 1"
            class="flex items-center justify-center gap-3 my-12"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-driftwood/30" />
            <svg class="w-10 h-4 text-driftwood/30" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,8 C5,2 10,14 15,8 C20,2 25,14 30,8 C35,2 40,14 40,8" stroke="currentColor" stroke-width="1.5" fill="none" />
            </svg>
            <span class="w-1.5 h-1.5 rounded-full bg-driftwood/30" />
            <svg class="w-10 h-4 text-driftwood/30" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,8 C5,2 10,14 15,8 C20,2 25,14 30,8 C35,2 40,14 40,8" stroke="currentColor" stroke-width="1.5" fill="none" />
            </svg>
            <span class="w-1.5 h-1.5 rounded-full bg-driftwood/30" />
          </div>
        </div>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<style scoped>
.menu-item {
  transition: transform 0.2s ease;
}

.menu-item:hover {
  transform: translateY(-1px);
}
</style>
