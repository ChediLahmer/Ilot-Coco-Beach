<template>
  <section class="relative bg-sand sand-texture py-20 px-6 md:px-16 overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-14">
        <h2 class="font-display text-ocean text-4xl md:text-5xl tracking-wide">
          {{ t('vouchers.title') }}
        </h2>
        <div class="w-10 h-[2px] bg-gold/60 mx-auto mt-4 mb-2" />
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('vouchers.subtitle') }}
        </p>
      </div>

      <!-- Carousel container -->
      <div
        v-if="activeVouchers.length > 0"
        class="relative"
        dir="ltr"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <!-- Prev arrow -->
        <button
          v-if="activeVouchers.length > visibleCount"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 z-10 w-9 h-9 flex items-center justify-center border border-charcoal/10 bg-white/80 hover:bg-white rounded-full text-charcoal/40 hover:text-charcoal/70 transition-all duration-200"
          @click="prevSlide"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Carousel track -->
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * cardPercent}%)` }"
          >
            <div
              v-for="voucher in activeVouchers"
              :key="voucher.id"
              class="shrink-0 px-2.5"
              :style="{ width: `${cardPercent}%` }"
            >
              <div class="bg-white rounded-xl p-6 border border-charcoal/5 hover:shadow-md transition-shadow duration-300">
                <!-- Discount -->
                <div class="text-center">
                  <span class="font-heading font-black text-5xl text-ocean">
                    -{{ voucher.discountPercent }}%
                  </span>
                  <span class="block font-body text-charcoal/40 text-base mt-1">
                    {{ t('vouchers.off') }}
                  </span>
                </div>

                <!-- Divider -->
                <div class="w-full h-[1px] bg-charcoal/5 my-4" />

                <!-- Code -->
                <div class="text-center">
                  <div class="font-heading font-bold text-lg text-charcoal bg-sand rounded-lg py-2 px-4 tracking-widest inline-flex items-center gap-2">
                    {{ voucher.code }}
                    <button
                      class="p-1 rounded-md text-charcoal/30 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                      :title="t('vouchers.copy') || 'Copier'"
                      @click.stop="copyCode(voucher.code)"
                    >
                      <svg v-if="copiedCode !== voucher.code" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Valid until -->
                <div class="text-center mt-3">
                  <span class="font-body text-charcoal/30 text-xs inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {{ t('vouchers.validUntil') }}: {{ formatDate(voucher.validUntil) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next arrow -->
        <button
          v-if="activeVouchers.length > visibleCount"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 z-10 w-9 h-9 flex items-center justify-center border border-charcoal/10 bg-white/80 hover:bg-white rounded-full text-charcoal/40 hover:text-charcoal/70 transition-all duration-200"
          @click="nextSlide"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <p v-if="activeVouchers.length === 0" class="text-center text-charcoal/40 font-body py-10">
        {{ t('vouchers.subtitle') }}
      </p>

      <!-- Dots -->
      <div v-if="activeVouchers.length > 0 && totalDots > 1" class="mt-8 flex justify-center gap-2">
        <button
          v-for="i in totalDots"
          :key="i"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-all duration-300',
            currentIndex === i - 1
              ? 'bg-ocean'
              : 'bg-charcoal/20',
          ]"
          @click="goToSlide(i - 1)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { vouchers } from '@/data/mock'

const { t } = useI18n()

const activeVouchers = computed(() => vouchers.filter((v) => v.isActive))
const copiedCode = ref(null)

function copyCode(code) {
  navigator.clipboard.writeText(code).catch(() => {})
  copiedCode.value = code
  setTimeout(() => { copiedCode.value = null }, 2000)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Responsive card sizing
const screenW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { screenW.value = window.innerWidth }

const cardPercent = computed(() => {
  if (screenW.value >= 1024) return 33.333
  if (screenW.value >= 768) return 50
  return 100
})

const visibleCount = computed(() => {
  if (screenW.value >= 1024) return 3
  if (screenW.value >= 768) return 2
  return 1
})

// Carousel state
const currentIndex = ref(0)
const paused = ref(false)
let timer = null

const maxIndex = computed(() => {
  const max = activeVouchers.value.length - visibleCount.value
  return max > 0 ? max : 0
})

const totalDots = computed(() => maxIndex.value + 1)

function nextSlide() {
  currentIndex.value = currentIndex.value >= maxIndex.value ? 0 : currentIndex.value + 1
}

function prevSlide() {
  currentIndex.value = currentIndex.value <= 0 ? maxIndex.value : currentIndex.value - 1
}

function goToSlide(i) {
  currentIndex.value = i
}

function startTimer() {
  timer = setInterval(() => {
    if (!paused.value && maxIndex.value > 0) {
      nextSlide()
    }
  }, 4000)
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  startTimer()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  clearInterval(timer)
})
</script>
