<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-4 md:px-8 transition-all duration-300',
      'bg-white shadow-md',
    ]"
  >
    <!-- Logo -->
    <a
      href="#hero"
      class="text-2xl font-display text-ocean shrink-0"
      @click.prevent="scrollTo('hero')"
    >
      ILOT
    </a>

    <!-- Desktop links -->
    <div class="hidden lg:flex items-center gap-6">
      <a
        v-for="link in navLinks"
        :key="link.id"
        :href="'#' + link.id"
        :class="[
          'text-sm font-heading font-medium transition-colors duration-200 hover:text-ocean',
          activeSection === link.id ? 'text-ocean' : 'text-charcoal',
        ]"
        @click.prevent="scrollTo(link.id)"
      >
        {{ link.label }}
      </a>
    </div>

    <!-- Right side -->
    <div class="hidden lg:flex items-center gap-3">
      <!-- Language pills -->
      <div class="flex rounded-full overflow-hidden border border-ocean/30">
        <button
          v-for="lang in langs"
          :key="lang"
          :class="[
            'px-2.5 py-1 text-xs font-heading font-bold transition-colors duration-200',
            currentLang === lang
              ? 'bg-ocean text-white'
              : 'text-charcoal hover:bg-ocean/10',
          ]"
          @click="switchLang(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>
      <!-- Reservation button -->
      <a
        href="#reservation"
        class="bg-coral hover:bg-coral-light text-white text-sm font-heading font-semibold px-5 py-2 rounded-full transition-colors duration-200"
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
      <span class="w-6 h-0.5 rounded bg-charcoal transition-colors" />
      <span class="w-6 h-0.5 rounded bg-charcoal transition-colors" />
      <span class="w-4 h-0.5 rounded bg-charcoal transition-colors" />
    </button>

    <!-- Mobile overlay -->
    <Teleport to="body">
      <Transition name="mobile-nav">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-[100] bg-ocean-dark flex flex-col items-center justify-center gap-6"
        >
          <button
            class="absolute top-5 right-5 text-white text-3xl leading-none"
            @click="mobileOpen = false"
          >
            &times;
          </button>
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="'#' + link.id"
            class="text-white text-2xl font-heading font-semibold hover:text-ocean-light transition-colors"
            @click.prevent="scrollTo(link.id); mobileOpen = false"
          >
            {{ link.label }}
          </a>
          <div class="flex gap-3 mt-4">
            <button
              v-for="lang in langs"
              :key="lang"
              :class="[
                'px-4 py-2 rounded-full text-sm font-bold font-heading transition-colors',
                currentLang === lang
                  ? 'bg-white text-ocean-dark'
                  : 'border border-white/50 text-white hover:bg-white/10',
              ]"
              @click="switchLang(lang)"
            >
              {{ lang.toUpperCase() }}
            </button>
          </div>
          <a
            href="#reservation"
            class="mt-4 bg-coral hover:bg-coral-light text-white text-lg font-heading font-semibold px-8 py-3 rounded-full transition-colors"
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
import { useI18n } from 'vue-i18n'
import { setLanguage } from '@/i18n'

const { t, locale } = useI18n()

const scrolled = ref(false)
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
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'instant' })
  }
}

function switchLang(lang) {
  setLanguage(lang)
}

function onScroll() {
  scrolled.value = window.scrollY > 50
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
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  setupObserver()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
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
