<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import cabinHammock from '@/assets/images/cabin-hammock.jpg'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const config = useConfig()

const formCard = ref(null)

const form = ref({
  name: '',
  phone: '',
  date: '',
  guests: '',
  message: '',
})

const shakeFields = ref({
  name: false,
  phone: false,
  date: false,
})

const todayDate = computed(() => {
  const d = new Date()
  return d.toISOString().split('T')[0]
})

function triggerShake(field) {
  shakeFields.value[field] = true
  setTimeout(() => {
    shakeFields.value[field] = false
  }, 600)
}

function sendWhatsApp() {
  let hasError = false

  if (!form.value.name.trim()) {
    triggerShake('name')
    hasError = true
  }
  if (!form.value.phone.trim()) {
    triggerShake('phone')
    hasError = true
  }
  if (!form.value.date) {
    triggerShake('date')
    hasError = true
  }

  if (hasError) return

  const lines = [
    'Reservation Ilot Coco Beach',
    `Nom: ${form.value.name}`,
    `Tel: ${form.value.phone}`,
    `Date: ${form.value.date}`,
    `Personnes: ${form.value.guests}`,
  ]

  if (form.value.message.trim()) {
    lines.push(`Message: ${form.value.message}`)
  }

  const text = encodeURIComponent(lines.join('\n'))
  window.open(`https://wa.me/${config.whatsapp}?text=${text}`, '_blank')
}

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(formCard.value, {
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: formCard.value,
        start: 'top 85%',
        once: true,
      },
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <section id="reservation" class="relative py-20 px-6 overflow-hidden">
    <!-- Background image with blur -->
    <div class="absolute inset-0 z-0">
      <img
        :src="cabinHammock"
        alt=""
        class="w-full h-full object-cover"
        style="filter: blur(8px); transform: scale(1.05)"
      />
    </div>
    <!-- Dark overlay -->
    <div class="absolute inset-0 z-[1] bg-charcoal/60"></div>

    <!-- Form card -->
    <div
      ref="formCard"
      class="relative z-10 max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl"
    >
      <!-- Title -->
      <div class="text-center mb-8">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-2">
          {{ t('reservation.title') }}
        </h2>
        <p class="text-charcoal/60 font-body">
          {{ t('reservation.subtitle') }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="sendWhatsApp" class="space-y-5">
        <!-- Name -->
        <div :class="{ 'animate-shake': shakeFields.name }">
          <label class="text-sm font-semibold text-charcoal/80 mb-1 block">
            {{ t('reservation.name') }}
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            :placeholder="t('reservation.namePlaceholder')"
            class="w-full px-4 py-3 rounded-xl border border-driftwood-light/50 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body"
          />
        </div>

        <!-- Phone -->
        <div :class="{ 'animate-shake': shakeFields.phone }">
          <label class="text-sm font-semibold text-charcoal/80 mb-1 block">
            {{ t('reservation.phone') }}
          </label>
          <input
            v-model="form.phone"
            type="tel"
            required
            :placeholder="t('reservation.phonePlaceholder')"
            class="w-full px-4 py-3 rounded-xl border border-driftwood-light/50 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body"
          />
        </div>

        <!-- Date -->
        <div :class="{ 'animate-shake': shakeFields.date }">
          <label class="text-sm font-semibold text-charcoal/80 mb-1 block">
            {{ t('reservation.date') }}
          </label>
          <input
            v-model="form.date"
            type="date"
            required
            :min="todayDate"
            class="w-full px-4 py-3 rounded-xl border border-driftwood-light/50 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body"
          />
        </div>

        <!-- Guests -->
        <div>
          <label class="text-sm font-semibold text-charcoal/80 mb-1 block">
            {{ t('reservation.guests') }}
          </label>
          <select
            v-model="form.guests"
            class="w-full px-4 py-3 rounded-xl border border-driftwood-light/50 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body bg-white"
          >
            <option value="" disabled>{{ t('reservation.guestOptions.select') }}</option>
            <option value="1-2">{{ t('reservation.guestOptions.1-2') }}</option>
            <option value="3-5">{{ t('reservation.guestOptions.3-5') }}</option>
            <option value="6-10">{{ t('reservation.guestOptions.6-10') }}</option>
            <option value="10+">{{ t('reservation.guestOptions.10+') }}</option>
          </select>
        </div>

        <!-- Message -->
        <div>
          <label class="text-sm font-semibold text-charcoal/80 mb-1 block">
            {{ t('reservation.message') }}
          </label>
          <textarea
            v-model="form.message"
            rows="3"
            :placeholder="t('reservation.messagePlaceholder')"
            class="w-full px-4 py-3 rounded-xl border border-driftwood-light/50 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition font-body resize-none"
          ></textarea>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <!-- WhatsApp button -->
          <button
            type="submit"
            class="whatsapp-pulse flex-1 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full px-8 py-4 text-lg font-bold transition-colors cursor-pointer"
          >
            <!-- WhatsApp icon -->
            <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {{ t('reservation.whatsapp') }}
          </button>

          <!-- Call button -->
          <a
            :href="`tel:${config.phone}`"
            class="flex items-center justify-center gap-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-full px-6 py-3 font-bold transition-colors"
          >
            <!-- Phone icon -->
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            {{ t('reservation.call') }}
          </a>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}
</style>
