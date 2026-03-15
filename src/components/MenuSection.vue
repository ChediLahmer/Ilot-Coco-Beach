<template>
  <section id="menu" class="relative bg-sand/30 py-24 md:py-32 px-6 md:px-16">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-20">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('menu.title') }}
        </h2>
        <div class="w-12 h-[2px] bg-gold/60 mx-auto mt-6 mb-4" />
        <p class="font-body text-charcoal/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {{ t('menu.subtitle') }}
        </p>
      </div>

      <!-- Standard / Extra toggle -->
      <div class="flex justify-center items-center gap-4 mb-12">
        <button
          :class="[
            'font-heading text-sm md:text-base uppercase tracking-wider transition-colors duration-300',
            priceMode === 'standard'
              ? 'font-bold text-ocean'
              : 'text-charcoal/40 hover:text-charcoal/70',
          ]"
          @click="priceMode = 'standard'"
        >
          {{ t('menu.standard') }}
        </button>
        <span class="text-charcoal/20 text-sm md:text-base select-none">|</span>
        <button
          :class="[
            'font-heading text-sm md:text-base uppercase tracking-wider transition-colors duration-300',
            priceMode === 'extra'
              ? 'font-bold text-ocean'
              : 'text-charcoal/40 hover:text-charcoal/70',
          ]"
          @click="priceMode = 'extra'"
        >
          {{ t('menu.extra') }}
        </button>
      </div>

      <!-- Category tabs -->
      <div class="flex flex-wrap justify-center gap-8 mb-16">
        <button
          v-for="cat in menuCategories"
          :key="cat.id"
          :class="[
            'relative pb-2 font-heading text-sm md:text-base tracking-wide transition-all duration-300',
            activeCategory === cat.id
              ? 'text-ocean font-semibold'
              : 'text-charcoal/50 hover:text-charcoal/80',
          ]"
          @click="activeCategory = cat.id"
        >
          {{ cat.name[locale] || cat.name.fr }}
          <span
            :class="[
              'absolute bottom-0 left-0 h-[2px] bg-ocean transition-all duration-300 ease-out',
              activeCategory === cat.id ? 'w-full' : 'w-0',
            ]"
          />
        </button>
      </div>

      <!-- Paginated items area -->
      <div
        class="relative"
        dir="ltr"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <!-- Prev arrow -->
        <button
          v-if="totalPages > 1"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-ocean hover:border-ocean/30 shadow-sm hover:shadow-md transition-all duration-300"
          @click="prevPage"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Items grid with fade transition -->
        <Transition name="menu-fade" mode="out-in">
          <div
            :key="currentPage"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <div
              v-for="item in pageItems"
              :key="item.id"
              class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <!-- Image -->
              <div v-if="item.image" class="rounded-xl h-48 overflow-hidden mb-5">
                <img
                  :src="item.image"
                  :alt="item.name[locale] || item.name.fr"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div v-else class="rounded-xl h-48 bg-sand/30 flex items-center justify-center text-3xl mb-5">
                🍽️
              </div>

              <!-- Info -->
              <div class="flex-grow flex flex-col">
                <h3 class="font-heading font-semibold text-ocean text-lg leading-tight mb-2 group-hover:text-ocean/80 transition-colors duration-300">
                  {{ item.name[locale] || item.name.fr }}
                </h3>
                <p class="font-body text-charcoal/60 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                  {{ item.desc[locale] || item.desc.fr }}
                </p>
                <div class="w-full h-[1px] bg-charcoal/5 mb-4" />
                <div class="flex items-center justify-between mt-auto">
                  <span class="shrink-0 font-heading font-bold text-ocean text-lg">
                    {{ priceMode === 'standard' ? item.priceStandard : item.priceExtra }} DT
                  </span>
                  <span
                    v-if="!item.available"
                    class="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-heading font-bold rounded-full uppercase tracking-wider"
                  >
                    {{ t('menu.unavailable') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <p v-if="activeItems.length === 0" class="text-center text-charcoal/50 font-body py-12">
          Aucun plat disponible dans cette catégorie.
        </p>

        <!-- Next arrow -->
        <button
          v-if="totalPages > 1"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-ocean hover:border-ocean/30 shadow-sm hover:shadow-md transition-all duration-300"
          @click="nextPage"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Dots -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-3">
        <button
          v-for="i in totalPages"
          :key="i"
          :class="[
            'w-2 h-2 rounded-full transition-all duration-300',
            currentPage === i - 1
              ? 'bg-ocean w-6'
              : 'bg-charcoal/20 hover:bg-ocean/50',
          ]"
          @click="goToPage(i - 1)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { menuCategories } from '@/data/mock'

const { t, locale } = useI18n()

const priceMode = ref('standard')
const activeCategory = ref(menuCategories[0]?.id || 1)

const activeItems = computed(() => {
  const cat = menuCategories.find((c) => c.id === activeCategory.value)
  return cat ? cat.items : []
})

const ITEMS_PER_PAGE = 6
const currentPage = ref(0)
const paused = ref(false)
let timer = null

const totalPages = computed(() => Math.ceil(activeItems.value.length / ITEMS_PER_PAGE))

const pageItems = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE
  return activeItems.value.slice(start, start + ITEMS_PER_PAGE)
})

function nextPage() {
  currentPage.value = currentPage.value >= totalPages.value - 1 ? 0 : currentPage.value + 1
}

function prevPage() {
  currentPage.value = currentPage.value <= 0 ? totalPages.value - 1 : currentPage.value - 1
}

function goToPage(i) {
  currentPage.value = i
}

// Reset page when category changes
watch(activeCategory, () => {
  currentPage.value = 0
})

// Auto-rotate pages
onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value && totalPages.value > 1) {
      nextPage()
    }
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
