<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-4 md:px-8 bg-white backdrop-blur-sm border-b border-charcoal/5"
  >
    <!-- Logo -->
    <a
      href="/"
      class="flex flex-col items-start leading-none shrink-0"
      @click.prevent="scrollTo('hero')"
    >
      <span class="font-brand font-black text-2xl text-charcoal tracking-tight">ÎLOT</span>
      <span class="font-body text-[10px] text-charcoal/40 uppercase tracking-[0.2em]">Coco Beach</span>
    </a>

    <!-- Desktop links -->
    <div class="hidden lg:flex items-center gap-6">
      <a
        v-for="link in navLinks"
        :key="link.id"
        :href="'#' + link.id"
        :class="[
          'text-sm font-heading font-semibold transition-colors duration-200 hover:text-charcoal',
          activeSection === link.id ? 'text-charcoal' : 'text-charcoal/60',
        ]"
        @click.prevent="scrollTo(link.id)"
      >
        {{ link.label }}
      </a>
    </div>

    <!-- Right side -->
    <div class="hidden lg:flex items-center gap-4">
      <!-- Language pills — minimal text buttons -->
      <div class="flex items-center gap-1">
        <button
          v-for="lang in langs"
          :key="lang"
          :class="[
            'px-2 py-1 text-xs font-heading transition-colors duration-200',
            currentLang === lang
              ? 'font-bold text-charcoal'
              : 'text-charcoal/40 hover:text-charcoal/60',
          ]"
          @click="switchLang(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>
      <!-- Reservation button -->
      <a
        href="#reservation"
        class="bg-coral hover:bg-coral/90 text-white text-sm font-heading font-medium px-5 py-2 rounded-full transition-colors duration-200"
        @click.prevent="scrollTo('reservation')"
      >
        {{ t('nav.reservation') }}
      </a>
    </div>

    <!-- Mobile hamburger -->
    <button
      class="lg:hidden flex flex-col gap-1.5 p-2"
      @click="mobileOpen = true"
      :aria-label="'Open menu'"
    >
      <span class="w-6 h-0.5 rounded bg-charcoal" />
      <span class="w-6 h-0.5 rounded bg-charcoal" />
      <span class="w-4 h-0.5 rounded bg-charcoal" />
    </button>

    <!-- Mobile overlay -->
    <Teleport to="body">
      <Transition name="mobile-nav">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-6"
        >
          <button
            class="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-charcoal text-3xl leading-none"
            @click="mobileOpen = false"
          >
            &times;
          </button>

          <!-- Mobile logo -->
          <div class="absolute top-6 left-0 right-0 text-center">
            <span class="font-brand font-black text-2xl text-charcoal tracking-tight">ÎLOT</span>
            <p class="font-body text-[10px] text-charcoal/40 uppercase tracking-[0.2em]">Coco Beach</p>
          </div>

          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="'#' + link.id"
            class="text-charcoal text-2xl font-heading font-semibold hover:text-charcoal/60 transition-colors"
            @click.prevent="scrollTo(link.id); mobileOpen = false"
          >
            {{ link.label }}
          </a>
          <div class="flex gap-3 mt-4">
            <button
              v-for="lang in langs"
              :key="lang"
              :class="[
                'px-4 py-2 text-sm font-heading transition-colors',
                currentLang === lang
                  ? 'font-bold text-charcoal'
                  : 'text-charcoal/40 hover:text-charcoal/60',
              ]"
              @click="switchLang(lang)"
            >
              {{ lang.toUpperCase() }}
            </button>
          </div>
          <!-- Mobile Reservation button -->
          <a
            href="#reservation"
            class="mt-4 bg-coral hover:bg-coral/90 text-white text-lg font-heading font-semibold px-8 py-3 rounded-full transition-colors"
            @click.prevent="scrollTo('reservation'); mobileOpen = false"
          >
            {{ t('nav.reservation') }}
          </a>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '@/i18n'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const mobileOpen = ref(false)
const activeSection = ref('hero')
const currentLang = computed(() => locale.value)
const langs = ['fr', 'ar', 'en']

const navLinks = computed(() => [
  { id: 'hero', label: t('nav.home') },
  { id: 'menu', label: t('nav.menu') || 'Menu' },
  { id: 'experience', label: t('nav.experience') },
  { id: 'gallery', label: t('nav.gallery') },
  { id: 'reservation', label: t('nav.reservation') },
  { id: 'contact', label: t('nav.contact') },
])

function scrollTo(id) {
  if (route.path === '/') {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'instant' })
  } else {
    router.push('/#' + id)
  }
}

function switchLang(lang) {
  setLanguage(lang)
}

// IntersectionObserver for active section
let observer = null
const sectionIds = ['hero', 'about', 'menu', 'experience', 'gallery', 'reservation', 'contact']

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px' }
  )
  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
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
