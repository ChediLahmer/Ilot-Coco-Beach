<template>
  <section class="relative py-16 px-6 md:px-16 bg-white">
    <!-- Section editorial number -->
    <div class="section-number">05</div>

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 gold-accent">
        <h2 class="font-display text-ocean text-3xl md:text-4xl mb-3">
          {{ t('vouchers.title') }}
        </h2>
        <p class="font-body text-charcoal/60 text-base md:text-lg max-w-xl mx-auto">
          {{ t('vouchers.subtitle') }}
        </p>
      </div>

      <!-- Horizontal scroll container -->
      <div class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 -mx-2 px-2 scrollbar-thin">
        <div
          v-for="voucher in activeVouchers"
          :key="voucher.id"
          class="snap-start shrink-0 w-[300px] md:w-[340px] border-t-2 border-gold border-2 border-dashed border-ocean/30 rounded-2xl bg-white p-6 relative overflow-hidden"
        >
          <!-- Decorative circles -->
          <div class="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full" />
          <div class="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full" />
          <div class="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full" />
          <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full" />

          <!-- Discount -->
          <div class="text-center mb-4">
            <span class="font-heading font-black text-4xl text-coral">
              -{{ voucher.discountPercent }}%
            </span>
            <span class="block font-body text-charcoal/50 text-sm mt-1">
              {{ t('vouchers.off') }}
            </span>
          </div>

          <!-- Dashed divider -->
          <div class="border-t-2 border-dashed border-ocean/20 my-4" />

          <!-- Code -->
          <div class="text-center">
            <span class="font-body text-xs text-charcoal/50 uppercase tracking-wider">
              {{ t('vouchers.code') }}
            </span>
            <div class="font-heading font-bold text-lg text-ocean bg-ocean/5 rounded-lg py-2 px-4 mt-1 tracking-widest select-all">
              {{ voucher.code }}
            </div>
          </div>

          <!-- Valid until -->
          <div class="text-center mt-4">
            <span class="font-body text-xs text-charcoal/40">
              {{ t('vouchers.validUntil') }}: {{ formatDate(voucher.validUntil) }}
            </span>
          </div>

          <!-- Hint -->
          <p class="text-center font-body text-[11px] text-charcoal/40 mt-3 leading-relaxed">
            {{ t('vouchers.useCode') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vouchers } from '@/data/mock'

const { t } = useI18n()

const activeVouchers = computed(() => vouchers.filter((v) => v.isActive))

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
