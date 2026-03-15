<template>
  <footer class="relative bg-ocean-dark text-white pt-16 pb-8">
    <!-- Top gold separator -->
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

    <div class="max-w-6xl mx-auto px-6 md:px-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <!-- Brand -->
        <div>
          <h3 class="font-brand font-black text-white text-3xl mb-1 tracking-tight">ÎLOT</h3>
          <p class="font-body text-white/60 text-sm">Coco Beach</p>
          <p class="font-body text-white/40 text-xs mt-2">{{ t('hero.tagline') }}</p>
          <p class="font-body text-white/50 text-sm mt-4 leading-relaxed">
            {{ config.address }}
          </p>
        </div>

        <!-- Quick links -->
        <div>
          <h4 class="font-heading font-semibold text-white/80 text-xs uppercase tracking-wider mb-4">
            {{ t('nav.home') }}
          </h4>
          <div class="flex flex-col gap-2">
            <a
              v-for="link in footerLinks"
              :key="link.id"
              :href="'#' + link.id"
              class="font-body text-white/60 hover:text-white text-sm transition-colors duration-200"
              @click.prevent="scrollTo(link.id)"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <!-- Social -->
        <div>
          <h4 class="font-heading font-semibold text-white/80 text-xs uppercase tracking-wider mb-4">
            {{ t('footer.follow') }}
          </h4>
          <div class="flex items-center gap-0 flex-wrap">
            <a
              :href="config.instagram"
              target="_blank"
              rel="noopener"
              class="font-body text-ocean-light hover:text-white text-sm font-semibold transition-colors duration-200"
            >
              Instagram
            </a>
            <span class="text-white/30 mx-2">·</span>
            <a
              :href="config.facebook"
              target="_blank"
              rel="noopener"
              class="font-body text-ocean-light hover:text-white text-sm font-semibold transition-colors duration-200"
            >
              Facebook
            </a>

          </div>
          <a
            :href="'tel:' + config.phone"
            class="inline-block mt-4 font-body text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            {{ config.phone }}
          </a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-white/10 pt-6 text-center">
        <p class="font-body text-white/40 text-xs">
          {{ t('footer.madeWith') || 'Fait avec ♥ en Tunisie' }} — &copy; {{ new Date().getFullYear() }} {{ config.name }}. {{ t('footer.rights') }}.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

const { t } = useI18n()
const config = useConfig()

const footerLinks = computed(() => [
  { id: 'hero', label: t('nav.home') },
  { id: 'menu', label: t('nav.menu') || 'Menu' },
  { id: 'experience', label: t('nav.experience') },
  { id: 'gallery', label: t('nav.gallery') },
  { id: 'reservation', label: t('nav.reservation') },
  { id: 'contact', label: t('nav.contact') },
])

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'instant' })
}
</script>
