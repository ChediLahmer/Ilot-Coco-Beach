<script setup>
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

const { t } = useI18n()
const config = useConfig()
</script>

<template>
  <footer class="relative bg-ocean-dark text-white">
    <!-- Wave SVG separator -->
    <div class="wave-separator">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        class="w-full h-[60px]"
      >
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          fill="#FBF7F0"
          opacity="0.5"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          fill="#FFFFFF"
          opacity="0.3"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          fill="#FFFFFF"
          opacity="0.5"
        />
      </svg>
    </div>

    <!-- Footer content -->
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center lg:text-left">
        <!-- Column 1: Brand -->
        <div>
          <h3 class="font-display text-3xl text-white">ILOT</h3>
          <p class="font-heading text-lg text-white mt-1">Coco Beach</p>
          <p class="text-white/60 mt-3">Votre île, votre évasion</p>
        </div>

        <!-- Column 2: Quick Links -->
        <div>
          <h4 class="font-heading font-semibold text-white text-lg mb-4">{{ t('nav.home') }}</h4>
          <nav class="flex flex-col gap-2">
            <a href="#hero" class="text-white/70 hover:text-coral transition">{{ t('nav.home') }}</a>
            <a href="#gallery" class="text-white/70 hover:text-coral transition">{{ t('nav.gallery') }}</a>
            <a href="#experience" class="text-white/70 hover:text-coral transition">{{ t('nav.experience') }}</a>
            <a href="#reservation" class="text-white/70 hover:text-coral transition">{{ t('nav.reservation') }}</a>
            <a href="#contact" class="text-white/70 hover:text-coral transition">{{ t('nav.contact') }}</a>
          </nav>
        </div>

        <!-- Column 3: Social & Contact -->
        <div>
          <h4 class="font-heading font-semibold text-white text-lg mb-4">{{ t('footer.follow') }}</h4>
          <div class="flex items-center gap-4 justify-center lg:justify-start">
            <!-- Instagram -->
            <a
              :href="config.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="text-white/70 hover:text-white transition"
              aria-label="Instagram"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <!-- Facebook -->
            <a
              :href="config.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="text-white/70 hover:text-white transition"
              aria-label="Facebook"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p class="text-white/70 mt-4">
            <a :href="'tel:' + config.phone" class="hover:text-white transition">
              {{ config.phone }}
            </a>
          </p>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/20 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-white/50">
        <p>&copy; 2025 Ilot Coco Beach. {{ t('footer.rights') }}</p>
        <div>
          <!-- Placeholder for future legal links -->
        </div>
      </div>
    </div>
  </footer>
</template>
