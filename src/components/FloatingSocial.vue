<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useConfig } from '@/composables/useConfig.js'

const config = useConfig()

const expanded = ref(true)
const visible = ref(false)
let scrollThreshold = 0

function toggleExpanded() {
  expanded.value = !expanded.value
}

function handleScroll() {
  if (!scrollThreshold) {
    const hero = document.getElementById('hero')
    scrollThreshold = hero ? hero.offsetHeight : 400
  }
  visible.value = window.scrollY > scrollThreshold
}

onMounted(() => {
  // On desktop, always visible; on mobile, show after scrolling past hero
  if (window.innerWidth >= 768) {
    visible.value = true
  } else {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="fab-slide">
    <div
      v-show="visible"
      class="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3"
    >
      <!-- Social buttons — expand/collapse -->
      <Transition name="fab-expand">
        <div v-show="expanded" class="flex flex-col items-center gap-3">
          <!-- WhatsApp -->
          <a
            :href="`https://wa.me/${config.whatsapp}`"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            class="whatsapp-pulse w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
          >
            <svg class="w-6 h-6 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          <!-- Instagram -->
          <a
            :href="config.instagram"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            class="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
            style="background: linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)"
          >
            <svg class="w-6 h-6 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>

          <!-- Messenger -->
          <a
            :href="config.facebook"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger"
            class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0084FF] shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
          >
            <svg class="w-6 h-6 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z" />
            </svg>
          </a>
        </div>
      </Transition>

      <!-- Toggle FAB -->
      <button
        aria-label="Toggle social links"
        class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-ocean shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
        @click="toggleExpanded"
      >
        <!-- Chat icon when collapsed, close icon when expanded -->
        <svg
          v-if="!expanded"
          class="w-6 h-6 md:w-7 md:h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        <svg
          v-else
          class="w-6 h-6 md:w-7 md:h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fab-slide-enter-active,
.fab-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fab-slide-enter-from,
.fab-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fab-expand-enter-active,
.fab-expand-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fab-expand-enter-from,
.fab-expand-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
</style>
