<template>
  <section id="reservation" class="relative py-20 px-6 md:px-16 overflow-hidden">
    <!-- Section number -->
    <div class="section-number text-white/[0.04]">08</div>

    <!-- Background image with overlay -->
    <div class="absolute inset-0">
      <img
        :src="cabinHammockImg"
        alt=""
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-charcoal/80 backdrop-blur-sm" />
    </div>

    <div class="relative z-10 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 gold-accent">
        <h2 class="font-display text-ocean-light text-3xl md:text-4xl mb-3">
          {{ t('reservation.title') }}
        </h2>
        <p class="font-body text-white/70 text-base md:text-lg max-w-xl mx-auto">
          {{ t('reservation.subtitle') }}
        </p>
      </div>

      <!-- Form -->
      <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-gold/20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <!-- Name -->
          <div>
            <label class="block text-white/70 text-sm font-heading mb-1.5">
              {{ t('reservation.name') }}
            </label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="t('reservation.namePlaceholder')"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-ocean-light transition-colors"
            />
          </div>
          <!-- Phone -->
          <div>
            <label class="block text-white/70 text-sm font-heading mb-1.5">
              {{ t('reservation.phone') }}
            </label>
            <input
              v-model="form.phone"
              type="tel"
              :placeholder="t('reservation.phonePlaceholder')"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-ocean-light transition-colors"
            />
          </div>
          <!-- Date -->
          <div>
            <label class="block text-white/70 text-sm font-heading mb-1.5">
              {{ t('reservation.date') }}
            </label>
            <input
              v-model="form.date"
              type="date"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ocean-light transition-colors"
            />
          </div>
          <!-- Guests -->
          <div>
            <label class="block text-white/70 text-sm font-heading mb-1.5">
              {{ t('reservation.guests') }}
            </label>
            <select
              v-model="form.guests"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ocean-light transition-colors appearance-none"
            >
              <option value="" disabled class="text-charcoal">{{ t('reservation.guestOptions.select') }}</option>
              <option value="1-2" class="text-charcoal">{{ t('reservation.guestOptions.1-2') }}</option>
              <option value="3-5" class="text-charcoal">{{ t('reservation.guestOptions.3-5') }}</option>
              <option value="6-10" class="text-charcoal">{{ t('reservation.guestOptions.6-10') }}</option>
              <option value="10+" class="text-charcoal">{{ t('reservation.guestOptions.10+') }}</option>
            </select>
          </div>
        </div>

        <!-- Message -->
        <div class="mb-5">
          <label class="block text-white/70 text-sm font-heading mb-1.5">
            {{ t('reservation.message') }}
          </label>
          <textarea
            v-model="form.message"
            rows="3"
            :placeholder="t('reservation.messagePlaceholder')"
            class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-ocean-light transition-colors resize-none"
          />
        </div>

        <!-- Voucher code -->
        <div class="mb-8">
          <label class="block text-white/70 text-sm font-heading mb-1.5">
            {{ t('reservation.voucherCode') }}
          </label>
          <input
            v-model="form.voucher"
            type="text"
            :placeholder="t('reservation.voucherPlaceholder')"
            class="w-full md:w-1/2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-ocean-light transition-colors uppercase tracking-wider"
          />
        </div>

        <!-- Contact buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <!-- WhatsApp -->
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-heading font-semibold px-6 py-3 rounded-full transition-colors duration-200 shadow-lg"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {{ t('reservation.whatsapp') }}
          </a>
          <!-- Instagram -->
          <a
            :href="config.instagram"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 text-white font-heading font-semibold px-6 py-3 rounded-full transition-opacity duration-200 shadow-lg hover:opacity-90"
            style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Instagram
          </a>
          <!-- Messenger -->
          <a
            :href="messengerUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 bg-[#0084FF] hover:bg-[#006FDB] text-white font-heading font-semibold px-6 py-3 rounded-full transition-colors duration-200 shadow-lg"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2.16.15.26.36.27.59l.05 1.85c.02.62.67 1.03 1.23.78l2.07-.91c.17-.08.37-.1.55-.06.9.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.5l-2.89 4.58c-.46.73-1.44.91-2.13.39l-2.3-1.72a.72.72 0 00-.86 0l-3.1 2.35c-.41.31-.95-.18-.68-.62l2.89-4.58c.46-.73 1.44-.91 2.13-.39l2.3 1.72a.72.72 0 00.86 0l3.1-2.35c.41-.31.95.18.68.62z"/></svg>
            Messenger
          </a>
        </div>

        <!-- Call button -->
        <div class="text-center mt-4">
          <a
            :href="'tel:' + config.phone"
            class="inline-flex items-center gap-2 text-white/70 hover:text-white font-heading text-sm transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ t('reservation.call') }}: {{ config.phone }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'
import cabinHammockImg from '@/assets/images/cabin-hammock.jpg'

const { t } = useI18n()
const config = useConfig()

const form = reactive({
  name: '',
  phone: '',
  date: '',
  guests: '',
  message: '',
  voucher: '',
})

const whatsappUrl = computed(() => {
  const text = encodeURIComponent(
    `Bonjour, je souhaite réserver chez Ilot Coco Beach.\nNom: ${form.name}\nTél: ${form.phone}\nDate: ${form.date}\nPersonnes: ${form.guests}\n${form.voucher ? 'Code promo: ' + form.voucher + '\n' : ''}${form.message ? 'Message: ' + form.message : ''}`
  )
  return `https://wa.me/${config.whatsapp}?text=${text}`
})

const messengerUrl = computed(() => {
  const fbId = config.facebook.split('/').pop()
  return `https://m.me/${fbId}`
})
</script>
