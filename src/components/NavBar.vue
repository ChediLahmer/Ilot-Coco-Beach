<template>
  <nav class="fixed inset-x-0 top-0 z-50 border-b border-ocean/10 bg-white/88 text-deep backdrop-blur-md shadow-[0_12px_32px_rgba(10,24,32,0.06)]">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
      <a href="/" class="min-w-0 shrink-0" @click.prevent="goHome">
        <p class="truncate font-brand text-xl tracking-tight text-deep md:text-2xl">
          {{ config.name }}
        </p>
        <p class="mt-1 truncate font-heading text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-coral/85">
          {{ t('hero.tagline') }}
        </p>
      </a>

      <div class="hidden xl:flex items-center gap-7">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.path || ('#' + link.id)"
          class="text-sm font-heading font-semibold text-charcoal/60 transition-colors duration-200 hover:text-coral"
          @click.prevent="navigate(link)"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="hidden xl:flex items-center gap-3">
        <a
          :href="'tel:' + config.phone"
          class="text-sm font-heading font-semibold text-coral hover:text-deep"
        >
          {{ config.phone }}
        </a>
        <div class="flex items-center gap-1">
          <button
            v-for="lang in langs"
            :key="lang"
            :class="[
              'px-2 py-1 text-[0.7rem] font-heading font-bold uppercase tracking-[0.18em]',
              currentLang === lang ? 'text-coral' : 'text-charcoal/45 hover:text-charcoal/75',
            ]"
            @click="switchLang(lang)"
          >
            {{ lang }}
          </button>
        </div>
        <a
          href="#reservation"
          class="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] px-5 py-3 font-heading text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(255,125,97,0.24)] transition-transform duration-200 hover:-translate-y-0.5"
          @click.prevent="scrollTo('reservation')"
        >
          {{ t('nav.reservation') }}
        </a>
      </div>

      <button
        class="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 bg-white xl:hidden"
        :aria-label="'Open menu'"
        @click="mobileOpen = true"
      >
        <span class="flex flex-col gap-1.5">
          <span class="h-0.5 w-5 rounded-full bg-ocean" />
          <span class="h-0.5 w-5 rounded-full bg-coral" />
          <span class="h-0.5 w-3 rounded-full bg-gold/80" />
        </span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="mobile-nav">
        <div v-if="mobileOpen" class="fixed inset-0 z-[100] bg-white px-6 py-8 text-deep">
          <div class="mx-auto flex h-full max-w-xl flex-col">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-brand text-3xl text-deep">{{ config.name }}</p>
                <p class="mt-2 max-w-xs font-heading text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-coral/75">
                  {{ t('hero.tagline') }}
                </p>
              </div>
              <button
                class="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 bg-white text-3xl leading-none text-coral"
                @click="mobileOpen = false"
              >
                &times;
              </button>
            </div>

            <div class="my-8 h-px bg-charcoal/10" />

            <div class="flex flex-1 flex-col justify-center gap-6">
              <a
                v-for="link in navLinks"
                :key="link.key"
                :href="link.path || ('#' + link.id)"
                class="font-brand text-3xl tracking-tight text-deep"
                @click.prevent="navigate(link); mobileOpen = false"
              >
                {{ link.label }}
              </a>
            </div>

            <div class="space-y-5">
              <div class="flex items-center gap-3">
                <button
                  v-for="lang in langs"
                  :key="lang"
                  :class="[
                    'rounded-full border px-4 py-2 text-xs font-heading font-bold uppercase tracking-[0.18em]',
                    currentLang === lang ? 'border-coral/20 bg-coral/8 text-coral' : 'border-charcoal/10 bg-white text-charcoal/55',
                  ]"
                  @click="switchLang(lang)"
                >
                  {{ lang }}
                </button>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <a
                  href="#reservation"
                  class="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] px-5 py-3 text-sm font-heading font-bold uppercase tracking-[0.16em] text-white"
                  @click.prevent="scrollTo('reservation'); mobileOpen = false"
                >
                  {{ t('nav.reservation') }}
                </a>
                <a
                  :href="'tel:' + config.phone"
                  class="inline-flex items-center justify-center rounded-full border border-charcoal/10 px-5 py-3 text-sm font-heading font-semibold text-charcoal/72"
                >
                  {{ config.phone }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { setLanguage } from '@/i18n'
import { useConfig } from '@/composables/useConfig'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const config = useConfig()

const mobileOpen = ref(false)
const currentLang = computed(() => locale.value)
const langs = ['fr', 'ar', 'en']

const navLinks = computed(() => [
  { key: 'home', id: 'hero', label: t('nav.home') },
  { key: 'experience', id: 'experience', label: t('nav.experience') },
  { key: 'menu', path: '/menu', label: t('nav.menu') },
  { key: 'gallery', path: '/gallery', label: t('nav.gallery') },
  { key: 'reservation', id: 'reservation', label: t('nav.reservation') },
  { key: 'contact', id: 'contact', label: t('nav.contact') },
])

function goHome() {
  if (route.path === '/') {
    scrollTo('hero')
    return
  }

  router.push('/')
}

function scrollTo(id) {
  if (route.path === '/') {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    return
  }

  router.push(id === 'hero' ? { path: '/' } : { path: '/', hash: `#${id}` })
}

function navigate(link) {
  if (link.path) {
    if (route.path === link.path) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    router.push(link.path)
    return
  }

  scrollTo(link.id)
}

function switchLang(lang) {
  setLanguage(lang)
}
</script>

<style scoped>
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.25s ease;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}
</style>
