<template>
  <section id="reservation" class="relative overflow-hidden px-6 py-24 md:px-16 md:py-32">
    <div class="absolute inset-0">
      <img :src="cabinHammockImg" alt="" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,231,0.92)_0%,rgba(244,239,231,0.88)_100%)]" />
    </div>

    <div class="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <div class="premium-card-dark rounded-[2rem] p-6 text-white sm:p-8">
        <p class="section-kicker !text-white/70">{{ t('reservation.eyebrow') }}</p>
        <h2 class="mt-6 font-brand text-4xl leading-tight text-white sm:text-5xl">
          {{ t('reservation.title') }}
        </h2>
        <p class="mt-6 text-base leading-8 text-white/72">
          {{ t('reservation.subtitle') }}
        </p>

        <div class="my-8 h-px bg-white/10" />

        <div class="space-y-5 text-sm text-white/78">
          <div class="border-b border-white/8 pb-5">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-light/78">
              {{ t('reservation.hoursLabel') }}
            </p>
            <p class="mt-3 text-base leading-7 text-white">
              {{ t('location.hoursValue') }}
            </p>
          </div>

          <div class="border-b border-white/8 pb-5">
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-light/78">
              {{ t('reservation.occasionsLabel') }}
            </p>
            <p class="mt-3 text-base leading-7 text-white/82">
              {{ t('reservation.occasionsValue') }}
            </p>
          </div>

          <div>
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-light/78">
              {{ t('reservation.channelsLabel') }}
            </p>
            <p class="mt-3 text-base leading-7 text-white/82">
              {{ t('reservation.responseTime') }}
            </p>
          </div>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="flex items-center justify-between gap-3 rounded-[1.45rem] bg-[#25D366] px-5 py-4 text-left text-white shadow-[0_20px_40px_rgba(37,211,102,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </span>
              <span>
                <span class="block font-heading text-[0.76rem] font-bold uppercase tracking-[0.18em] text-white">WhatsApp</span>
                <span class="mt-1 block text-sm text-white/92">{{ config.phone }}</span>
              </span>
            </span>
            <span class="text-white/92">↗</span>
          </a>

          <a
            :href="messengerUrl"
            target="_blank"
            rel="noopener"
            class="flex items-center justify-between gap-3 rounded-[1.45rem] bg-[linear-gradient(135deg,#0099FF,#006AFF)] px-5 py-4 text-left text-white shadow-[0_20px_40px_rgba(0,153,255,0.26)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.915 1.453 5.515 3.724 7.213V22l3.219-1.766c.957.265 1.97.407 3.057.407 5.523 0 10-4.145 10-9.259S17.523 2 12 2Zm.994 12.567-2.546-2.718-4.966 2.718 5.466-5.81 2.593 2.718 4.919-2.718-5.466 5.81Z"/></svg>
              </span>
              <span>
                <span class="block font-heading text-[0.76rem] font-bold uppercase tracking-[0.18em] text-white">Messenger</span>
                <span class="mt-1 block text-sm text-white/92">{{ config.name }}</span>
              </span>
            </span>
            <span class="text-white/92">↗</span>
          </a>

          <a
            :href="config.instagram"
            target="_blank"
            rel="noopener"
            class="flex items-center justify-between gap-3 rounded-[1.45rem] bg-[linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] px-5 py-4 text-left text-white shadow-[0_20px_40px_rgba(225,48,108,0.24)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 2.25a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/></svg>
              </span>
              <span>
                <span class="block font-heading text-[0.76rem] font-bold uppercase tracking-[0.18em] text-white">Instagram</span>
                <span class="mt-1 block text-sm text-white/92">{{ instagramHandle }}</span>
              </span>
            </span>
            <span class="text-white/92">↗</span>
          </a>

          <a
            :href="'tel:' + config.phone"
            class="flex items-center justify-between gap-3 rounded-[1.45rem] bg-[linear-gradient(135deg,var(--color-coral),var(--color-gold))] px-5 py-4 text-left text-white shadow-[0_20px_40px_rgba(255,125,97,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25A2.25 2.25 0 0 0 21.75 19.5v-1.372c0-.516-.351-.966-.85-1.09l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.392 12.035 12.035 0 0 1-7.158-7.158 1.125 1.125 0 0 1 .392-1.21l1.293-.97c.38-.285.55-.774.417-1.173L6.962 3.1a1.125 1.125 0 0 0-1.09-.85H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
              </span>
              <span>
                <span class="block font-heading text-[0.76rem] font-bold uppercase tracking-[0.18em] text-white">{{ t('reservation.call') }}</span>
                <span class="mt-1 block text-sm text-white/92">{{ config.phone }}</span>
              </span>
            </span>
            <span class="text-white/92">↗</span>
          </a>
        </div>
      </div>

      <div class="premium-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ocean/65">
              {{ t('nav.reservation') }}
            </p>
            <p class="mt-3 font-brand text-3xl leading-tight text-deep sm:text-4xl">
              {{ t('reservation.formTitle') }}
            </p>
          </div>
          <p class="max-w-sm text-sm leading-7 text-charcoal/58">
            {{ t('reservation.formHint') }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.name') }}
            </label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="t('reservation.namePlaceholder')"
              class="booking-field"
            />
          </div>

          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.phone') }}
            </label>
            <input
              v-model="form.phone"
              type="tel"
              :placeholder="t('reservation.phonePlaceholder')"
              class="booking-field"
            />
          </div>

          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.date') }}
            </label>
            <input
              v-model="form.date"
              type="date"
              class="booking-field"
            />
          </div>

          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.guests') }}
            </label>
            <select v-model="form.guests" class="booking-field appearance-none">
              <option value="" disabled>{{ t('reservation.guestOptions.select') }}</option>
              <option value="1-2">{{ t('reservation.guestOptions.1-2') }}</option>
              <option value="3-5">{{ t('reservation.guestOptions.3-5') }}</option>
              <option value="6-10">{{ t('reservation.guestOptions.6-10') }}</option>
              <option value="10+">{{ t('reservation.guestOptions.10+') }}</option>
            </select>
          </div>
        </div>

        <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.message') }}
            </label>
            <textarea
              v-model="form.message"
              rows="5"
              :placeholder="t('reservation.messagePlaceholder')"
              class="booking-field resize-none"
            />
          </div>

          <div>
            <label class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48">
              {{ t('reservation.voucherCode') }}
            </label>
            <input
              v-model="form.voucher"
              type="text"
              :placeholder="t('reservation.voucherPlaceholder')"
              class="booking-field uppercase tracking-[0.18em]"
            />
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-4 border-t border-charcoal/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm leading-7 text-charcoal/55">
            {{ t('reservation.submitHint') }}
          </p>

          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-3.5 font-heading text-[0.78rem] font-bold uppercase tracking-[0.16em] text-white shadow-[0_20px_40px_rgba(37,211,102,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {{ t('reservation.whatsapp') }}
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
    `Bonjour, je souhaite réserver chez ${config.name}.\nNom: ${form.name}\nTél: ${form.phone}\nDate: ${form.date}\nPersonnes: ${form.guests}\n${form.voucher ? 'Code promo: ' + form.voucher + '\n' : ''}${form.message ? 'Message: ' + form.message : ''}`
  )
  return `https://wa.me/${config.whatsapp}?text=${text}`
})

const messengerUrl = computed(() => {
  const fbId = config.facebook.split('/').filter(Boolean).pop()
  return `https://m.me/${fbId}`
})

const instagramHandle = computed(() => {
  const handle = config.instagram
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .split('?')[0]
    .replace(/\/$/, '')

  return handle ? `@${handle}` : 'Instagram'
})
</script>
