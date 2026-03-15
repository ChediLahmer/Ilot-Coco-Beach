<template>
  <section id="contact" class="relative bg-sand py-20 px-6 md:px-16">
    <!-- Section number -->
    <div class="section-number">09</div>

    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 gold-accent">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('location.title') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Map -->
        <div class="rounded-2xl overflow-hidden shadow-lg h-[350px] lg:h-full min-h-[300px]">
          <iframe
            :src="mapUrl"
            width="100%"
            height="100%"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :title="config.name + ' location'"
          />
        </div>

        <!-- Info cards -->
        <div class="flex flex-col gap-5">
          <!-- Address -->
          <div class="bg-white rounded-2xl p-5 flex items-start gap-4">
            <div class="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-heading font-bold text-charcoal text-sm mb-1">{{ t('location.address') }}</h3>
              <p class="font-body text-charcoal/60 text-sm">{{ config.address }}</p>
            </div>
          </div>

          <!-- Phone -->
          <div class="bg-white rounded-2xl p-5 flex items-start gap-4">
            <div class="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="font-heading font-bold text-charcoal text-sm mb-1">{{ t('location.phone') }}</h3>
              <a :href="'tel:' + config.phone" class="font-body text-ocean text-sm hover:underline">{{ config.phone }}</a>
            </div>
          </div>

          <!-- Hours -->
          <div class="bg-white rounded-2xl p-5 flex items-start gap-4">
            <div class="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-heading font-bold text-charcoal text-sm mb-1">{{ t('location.hours') }}</h3>
              <p class="font-body text-charcoal/60 text-sm">{{ t('location.hoursValue') }}</p>
            </div>
          </div>

          <!-- How to get there -->
          <div class="bg-ocean/5 rounded-2xl p-5 flex items-start gap-4">
            <div class="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-heading font-bold text-charcoal text-sm mb-1">{{ t('location.howTo') }}</h3>
              <p class="font-body text-charcoal/60 text-sm">{{ t('location.howToDesc') }}</p>
            </div>
          </div>

          <!-- Social links -->
          <div class="flex gap-3 mt-2">
            <a
              :href="config.instagram"
              target="_blank"
              rel="noopener"
              class="w-10 h-10 bg-ocean/10 hover:bg-ocean/20 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <svg class="w-5 h-5 text-ocean" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a
              :href="config.facebook"
              target="_blank"
              rel="noopener"
              class="w-10 h-10 bg-ocean/10 hover:bg-ocean/20 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <svg class="w-5 h-5 text-ocean" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a
              :href="directionsUrl"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 bg-gold hover:bg-gold-light text-white text-sm font-heading font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {{ t('location.directions') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

const { t } = useI18n()
const config = useConfig()

const mapUrl = computed(
  () => `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${config.lng}!3d${config.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${config.lat},${config.lng}!5e0!3m2!1sfr!2stn!4v1`
)

const directionsUrl = computed(
  () => `https://www.google.com/maps/dir/?api=1&destination=${config.lat},${config.lng}`
)
</script>
