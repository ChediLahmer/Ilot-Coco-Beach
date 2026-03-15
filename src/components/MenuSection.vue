<template>
  <section id="menu" class="relative bg-white py-24 md:py-32 px-6 md:px-16">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('menu.title') }}
        </h2>
        <div class="w-10 h-[1px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-charcoal/50 text-sm md:text-base max-w-xl mx-auto">
          {{ t('menu.subtitle') }}
        </p>
      </div>

      <!-- Standard / Extra toggle -->
      <div class="flex justify-center items-center gap-3 mb-10">
        <button
          :class="[
            'font-heading text-sm transition-colors duration-200',
            priceMode === 'standard'
              ? 'font-bold text-charcoal'
              : 'text-charcoal/40 hover:text-charcoal/60',
          ]"
          @click="priceMode = 'standard'"
        >
          {{ t('menu.standard') }}
        </button>
        <span class="text-charcoal/20 text-sm select-none">|</span>
        <button
          :class="[
            'font-heading text-sm transition-colors duration-200',
            priceMode === 'extra'
              ? 'font-bold text-charcoal'
              : 'text-charcoal/40 hover:text-charcoal/60',
          ]"
          @click="priceMode = 'extra'"
        >
          {{ t('menu.extra') }}
        </button>
      </div>

      <!-- Category tabs -->
      <div class="flex flex-wrap justify-center gap-6 mb-10">
        <button
          v-for="cat in menuCategories"
          :key="cat.id"
          :class="[
            'relative pb-2 font-heading text-sm transition-all duration-200',
            activeCategory === cat.id
              ? 'text-charcoal font-semibold'
              : 'text-charcoal/40 hover:text-charcoal/60',
          ]"
          @click="activeCategory = cat.id"
        >
          {{ cat.name[locale] || cat.name.fr }}
          <span
            :class="[
              'absolute bottom-0 left-0 h-[2px] bg-charcoal transition-all duration-300 ease-out',
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
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-charcoal hover:border-charcoal/30 transition-all duration-200"
          @click="prevPage"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Items grid with fade transition -->
        <Transition name="menu-fade" mode="out-in">
          <div
            :key="currentPage"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="item in pageItems"
              :key="item.id"
              class="group bg-sand/50 rounded-xl p-4"
            >
              <!-- Image -->
              <div v-if="item.image" class="rounded-xl h-40 overflow-hidden mb-3">
                <img
                  :src="item.image"
                  :alt="item.name[locale] || item.name.fr"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="rounded-xl h-40 bg-sand/80 flex items-center justify-center text-2xl mb-3">
                🍽️
              </div>

              <!-- Info -->
              <div>
                <h3 class="font-heading font-semibold text-charcoal text-base leading-tight mb-1">
                  {{ item.name[locale] || item.name.fr }}
                </h3>
                <p class="font-body text-charcoal/40 text-xs leading-relaxed line-clamp-2 mb-2">
                  {{ item.desc[locale] || item.desc.fr }}
                </p>
                <div class="w-full h-[1px] bg-charcoal/10 mb-2" />
                <div class="flex items-center justify-between">
                  <span class="shrink-0 font-heading font-bold text-ocean text-base">
                    {{ priceMode === 'standard' ? item.priceStandard : item.priceExtra }} DT
                  </span>
                  <span
                    v-if="!item.available"
                    class="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-heading font-bold rounded-full"
                  >
                    {{ t('menu.unavailable') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <p v-if="activeItems.length === 0" class="text-center text-charcoal/40 font-body py-8">
          Aucun plat disponible dans cette catégorie.
        </p>

        <!-- Next arrow -->
        <button
          v-if="totalPages > 1"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal/40 hover:text-charcoal hover:border-charcoal/30 transition-all duration-200"
          @click="nextPage"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Dots -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center gap-2">
        <button
          v-for="i in totalPages"
          :key="i"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-all duration-200',
            currentPage === i - 1
              ? 'bg-charcoal'
              : 'bg-charcoal/15 hover:bg-charcoal/30',
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
