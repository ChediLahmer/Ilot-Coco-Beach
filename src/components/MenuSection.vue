<template>
  <section id="menu" class="relative bg-white py-20 px-6 md:px-16">
    <!-- Section editorial number -->
    <div class="section-number">02</div>

    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 gold-accent">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('menu.title') }}
        </h2>
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('menu.subtitle') }}
        </p>
      </div>

      <!-- Standard / Extra toggle -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex bg-sand rounded-full p-1">
          <button
            v-for="mode in ['standard', 'extra']"
            :key="mode"
            :class="[
              'px-6 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-200',
              priceMode === mode
                ? 'bg-ocean text-white shadow-md'
                : 'text-charcoal/60 hover:text-charcoal',
            ]"
            @click="priceMode = mode"
          >
            {{ t(`menu.${mode}`) }}
          </button>
        </div>
      </div>

      <!-- Category tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="cat in menuCategories"
          :key="cat.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-heading font-medium transition-all duration-200 border',
            activeCategory === cat.id
              ? 'bg-ocean text-white border-ocean'
              : 'bg-white text-charcoal/70 border-charcoal/15 hover:border-ocean hover:text-ocean',
          ]"
          @click="activeCategory = cat.id"
        >
          {{ cat.name[locale] || cat.name.fr }}
        </button>
      </div>

      <!-- Items grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="item in activeItems"
          :key="item.id"
          :class="[
            'flex gap-4 p-4 rounded-2xl transition-all duration-200',
            item.available
              ? 'bg-sand/50 hover:bg-sand hover:shadow-sm'
              : 'bg-gray-100/50 opacity-60',
          ]"
        >
          <!-- Thumbnail -->
          <div v-if="item.image" class="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
            <img
              :src="item.image"
              :alt="item.name[locale] || item.name.fr"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="shrink-0 w-20 h-20 rounded-xl bg-ocean/5 flex items-center justify-center text-2xl">
            🍽️
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-heading font-bold text-charcoal text-sm leading-tight">
                {{ item.name[locale] || item.name.fr }}
              </h3>
              <span class="shrink-0 font-heading font-bold text-ocean text-sm">
                {{ priceMode === 'standard' ? item.priceStandard : item.priceExtra }} DT
              </span>
            </div>
            <!-- Dotted separator -->
            <div class="border-b border-dotted border-charcoal/20 my-1.5" />
            <p class="font-body text-charcoal/50 text-xs leading-relaxed line-clamp-2">
              {{ item.desc[locale] || item.desc.fr }}
            </p>
            <span
              v-if="!item.available"
              class="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-heading font-bold rounded-full"
            >
              {{ t('menu.unavailable') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { menuCategories } from '@/data/mock'

const { t, locale } = useI18n()

const priceMode = ref('standard')
const activeCategory = ref(menuCategories[0]?.id || 1)

const activeItems = computed(() => {
  const cat = menuCategories.find((c) => c.id === activeCategory.value)
  return cat ? cat.items : []
})
</script>
