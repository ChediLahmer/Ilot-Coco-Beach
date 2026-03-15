<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '@/i18n/index.js'

const { t, locale } = useI18n()

const mobileOpen = ref(false)
const activeSection = ref('hero')
const scrolled = ref(false)

const navLinks = [
  { key: 'nav.home', hash: '#hero', id: 'hero' },
  { key: 'nav.menu', hash: '#menu', id: 'menu' },
  { key: 'nav.experience', hash: '#experience', id: 'experience' },
  { key: 'nav.gallery', hash: '#gallery', id: 'gallery' },
  { key: 'nav.reservation', hash: '#reservation', id: 'reservation' },
  { key: 'nav.contact', hash: '#contact', id: 'contact' },
]

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
]

function switchLang(code) {
  setLanguage(code)
}

function closeMobile() {
  mobileOpen.value = false
}

function scrollTo(hash) {
  closeMobile()
  const el = document.querySelector(hash)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

/* IntersectionObserver to detect active section */
let observer = null

function setupObserver() {
  const sections = navLinks
    .map((link) => document.getElementById(link.id))
    .filter(Boolean)

  if (!sections.length) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  )

  sections.forEach((section) => observer.observe(section))
}

function handleScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  setupObserver()
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="fixed top-0 inset-x-0 z-50 h-[72px] bg-white/90 backdrop-blur-sm transition-shadow duration-300"
    :class="scrolled ? 'shadow-md' : ''"
  >
    <div class="max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-8">
      <!-- Brand -->
      <a
        href="#hero"
        class="font-display text-ocean text-2xl tracking-wide select-none"
        @click.prevent="scrollTo('#hero')"
      >
        ILOT
      </a>

      <!-- Desktop nav links -->
      <ul class="hidden md:flex items-center gap-1">
        <li v-for="link in navLinks" :key="link.id">
          <a
            :href="link.hash"
            class="relative px-3 py-2 text-sm font-heading font-medium transition-colors duration-200"
            :class="
              activeSection === link.id
                ? 'text-ocean'
                : 'text-charcoal/70 hover:text-ocean'
            "
            @click.prevent="scrollTo(link.hash)"
          >
            {{ t(link.key) }}
            <span
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-ocean rounded-full transition-transform duration-300 origin-left"
              :class="activeSection === link.id ? 'scale-x-100' : 'scale-x-0'"
            />
          </a>
        </li>
      </ul>

      <!-- Desktop right side -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Language switcher -->
        <div class="flex items-center rounded-full bg-sand p-0.5 gap-0.5">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="px-3 py-1 text-xs font-heading font-semibold rounded-full transition-all duration-200"
            :class="
              locale === lang.code
                ? 'bg-ocean text-white shadow-sm'
                : 'text-charcoal/60 hover:text-ocean'
            "
            @click="switchLang(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>

        <!-- CTA -->
        <a
          href="#reservation"
          class="bg-coral text-white font-heading font-semibold text-sm px-5 py-2.5 rounded-full hover:scale-105 transition-transform duration-200 shadow-sm"
          @click.prevent="scrollTo('#reservation')"
        >
          {{ t('nav.reservation') }}
        </a>
      </div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        @click="mobileOpen = !mobileOpen"
      >
        <span
          class="block w-6 h-0.5 bg-charcoal rounded-full transition-all duration-300 origin-center"
          :class="mobileOpen ? 'rotate-45 translate-y-[4px]' : ''"
        />
        <span
          class="block w-6 h-0.5 bg-charcoal rounded-full transition-all duration-300"
          :class="mobileOpen ? 'opacity-0 scale-x-0' : ''"
        />
        <span
          class="block w-6 h-0.5 bg-charcoal rounded-full transition-all duration-300 origin-center"
          :class="mobileOpen ? '-rotate-45 -translate-y-[4px]' : ''"
        />
      </button>
    </div>
  </nav>

  <!-- Mobile overlay -->
  <Transition name="mobile-menu">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8"
      style="padding-top: 72px"
    >
      <a
        v-for="link in navLinks"
        :key="link.id"
        :href="link.hash"
        class="font-heading text-2xl font-semibold transition-colors duration-200"
        :class="activeSection === link.id ? 'text-ocean' : 'text-charcoal/70'"
        @click.prevent="scrollTo(link.hash)"
      >
        {{ t(link.key) }}
      </a>

      <!-- Mobile language switcher -->
      <div class="flex items-center rounded-full bg-sand p-1 gap-1 mt-4">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="px-4 py-2 text-sm font-heading font-semibold rounded-full transition-all duration-200"
          :class="
            locale === lang.code
              ? 'bg-ocean text-white shadow-sm'
              : 'text-charcoal/60 hover:text-ocean'
          "
          @click="switchLang(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>

      <!-- Mobile CTA -->
      <a
        href="#reservation"
        class="bg-coral text-white font-heading font-semibold text-lg px-8 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-md mt-2"
        @click.prevent="scrollTo('#reservation')"
      >
        {{ t('nav.reservation') }}
      </a>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
