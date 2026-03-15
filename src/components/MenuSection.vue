<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { menuCategories } from '@/data/mock.js'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()

const selectedMenu = ref('standard')
const menuGrid = ref(null)

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    const cards = menuGrid.value?.querySelectorAll('.menu-item-card')
    if (cards?.length) {
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: menuGrid.value,
          start: 'top 85%',
          once: true,
        },
      })
    }
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})

function getPrice(item) {
  const price = selectedMenu.value === 'standard' ? item.priceStandard : item.priceExtra
  return `${price} DT`
}
</script>

<template>
  <section id="menu" class="py-20 px-6 md:px-16 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h2 class="font-display text-ocean text-4xl mb-3">
          {{ t('menu.title') }}
        </h2>
        <p class="font-heading text-charcoal/60 text-base md:text-lg">
          {{ t('menu.subtitle') }}
        </p>
      </div>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-12">
        <div class="inline-flex rounded-full overflow-hidden border border-ocean/20 p-1 bg-sand">
          <button
            class="px-6 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-300 cursor-pointer border-none"
            :class="selectedMenu === 'standard'
              ? 'bg-ocean text-white shadow-md'
              : 'bg-sand text-charcoal hover:bg-sand-dark'"
            @click="selectedMenu = 'standard'"
          >
            {{ t('menu.standard') }}
          </button>
          <button
            class="px-6 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-300 cursor-pointer border-none"
            :class="selectedMenu === 'extra'
              ? 'bg-ocean text-white shadow-md'
              : 'bg-sand text-charcoal hover:bg-sand-dark'"
            @click="selectedMenu = 'extra'"
          >
            {{ t('menu.extra') }}
          </button>
        </div>
      </div>

      <!-- Menu Categories -->
      <div ref="menuGrid" class="space-y-12">
        <div v-for="category in menuCategories" :key="category.id">
          <!-- Category heading with decorative line -->
          <div class="flex items-center gap-4 mb-6">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent to-driftwood/40"></div>
            <h3 class="font-heading font-bold text-xl text-ocean whitespace-nowrap">
              {{ category.name[locale] }}
            </h3>
            <div class="h-px flex-1 bg-gradient-to-l from-transparent to-driftwood/40"></div>
          </div>

          <!-- Items Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="item in category.items"
              :key="item.id"
              class="menu-item-card relative bg-sand/50 rounded-2xl p-4 flex items-start gap-4 transition-shadow duration-300 hover:shadow-md"
              :class="{ 'opacity-50': !item.available }"
            >
              <!-- Unavailable badge -->
              <div
                v-if="!item.available"
                class="absolute top-3 right-3 z-10 bg-charcoal/80 text-white text-xs font-heading font-semibold px-3 py-1 rounded-full"
              >
                {{ t('menu.unavailable') }}
              </div>

              <!-- Thumbnail -->
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name[locale]"
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                loading="lazy"
              />

              <!-- Content + Price -->
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <!-- Name -->
                  <span class="font-heading font-bold text-charcoal whitespace-nowrap">
                    {{ item.name[locale] }}
                  </span>
                  <!-- Dotted line -->
                  <span class="flex-1 border-b-2 border-dotted border-driftwood/40 translate-y-[-4px]"></span>
                  <!-- Price -->
                  <span class="font-heading font-bold text-ocean whitespace-nowrap">
                    {{ getPrice(item) }}
                  </span>
                </div>
                <p class="text-sm text-charcoal/60 mt-1 leading-relaxed">
                  {{ item.desc[locale] }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wave SVG separator -->
    <div class="mt-20 -mb-px leading-[0]">
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        class="w-full h-[60px] md:h-[80px]"
      >
        <path
          d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z"
          class="fill-sand"
        />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.menu-item-card {
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.menu-item-card:hover {
  transform: translateY(-2px);
}
</style>
