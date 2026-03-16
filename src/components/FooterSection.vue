<template>
  <footer class="section-dark relative overflow-hidden px-6 pb-8 pt-20 text-white md:px-16">
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

    <div class="mx-auto max-w-7xl">
      <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-light/78">
            {{ t('hero.tagline') }}
          </p>
          <h3 class="mt-4 font-brand text-5xl tracking-tight text-white">
            {{ config.name }}
          </h3>
          <p class="mt-5 max-w-xl text-base leading-8 text-white/68">
            {{ t('footer.description') }}
          </p>
        </div>

        <div>
          <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-light/78">
            {{ t('footer.explore') }}
          </p>
          <div class="mt-5 flex flex-col gap-3">
            <a
              v-for="link in footerLinks"
              :key="link.key"
              :href="link.path || ('#' + link.id)"
              class="text-sm text-white/68 hover:text-white"
              @click.prevent="navigate(link)"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <div>
          <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-light/78">
            {{ t('footer.follow') }}
          </p>
          <div class="mt-5 flex flex-col gap-3 text-sm text-white/68">
            <a :href="config.instagram" target="_blank" rel="noopener" class="hover:text-white">Instagram</a>
            <a :href="config.facebook" target="_blank" rel="noopener" class="hover:text-white">Facebook</a>
            <a :href="'tel:' + config.phone" class="hover:text-white">{{ config.phone }}</a>
            <a v-if="config.email" :href="'mailto:' + config.email" class="hover:text-white">{{ config.email }}</a>
          </div>
        </div>
      </div>

      <div class="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/42 md:flex-row md:items-center md:justify-between">
        <p>
          {{ t('footer.madeWith') }}
        </p>
        <p>
          &copy; {{ new Date().getFullYear() }} {{ config.name }}. {{ t('footer.rights') }}.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

const { t } = useI18n()
const config = useConfig()
const route = useRoute()
const router = useRouter()

const footerLinks = computed(() => [
  { key: 'home', id: 'hero', label: t('nav.home') },
  { key: 'experience', id: 'experience', label: t('nav.experience') },
  { key: 'menu', path: '/menu', label: t('nav.menu') || 'Menu' },
  { key: 'gallery', path: '/gallery', label: t('nav.gallery') },
  { key: 'reservation', id: 'reservation', label: t('nav.reservation') },
  { key: 'contact', id: 'contact', label: t('nav.contact') },
])

function navigate(link) {
  if (link.path) {
    if (route.path === link.path) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    router.push(link.path)
    return
  }

  if (route.path === '/') {
    const el = document.getElementById(link.id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    return
  }

  router.push(link.id === 'hero' ? '/' : { path: '/', hash: `#${link.id}` })
}
</script>
