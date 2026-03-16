<template>
  <section id="contact" class="px-6 py-24 md:px-16 md:py-32">
    <div class="mx-auto max-w-7xl">
      <div class="max-w-3xl">
        <p class="section-kicker">{{ t('location.eyebrow') }}</p>
        <h2 class="section-title mt-6">
          {{ t('location.title') }}
        </h2>
        <div class="section-divider" />
        <p class="section-copy mt-8 max-w-2xl">
          {{ t('location.subtitle') }}
        </p>
      </div>

      <div class="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div class="premium-card rounded-[2rem] p-4 sm:p-5">
          <div class="overflow-hidden rounded-[1.55rem]">
            <iframe
              :src="mapUrl"
              width="100%"
              height="100%"
              class="h-[26rem] w-full"
              style="border: 0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              :title="config.name + ' location'"
            />
          </div>
        </div>

        <div class="grid gap-4">
          <article class="premium-card rounded-[2rem] p-6 sm:p-8">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                  {{ t('location.address') }}
                </p>
                <p class="mt-4 text-base leading-7 text-charcoal/70">
                  {{ config.address }}
                </p>
              </div>

              <div>
                <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                  {{ t('location.phone') }}
                </p>
                <a :href="'tel:' + config.phone" class="mt-4 block text-base leading-7 text-charcoal/70 hover:text-charcoal">
                  {{ config.phone }}
                </a>
              </div>

              <div>
                <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                  {{ t('location.hours') }}
                </p>
                <p class="mt-4 text-base leading-7 text-charcoal/70">
                  {{ t('location.hoursValue') }}
                </p>
              </div>

              <div>
                <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                  {{ t('location.howTo') }}
                </p>
                <p class="mt-4 text-base leading-7 text-charcoal/70">
                  {{ t('location.howToDesc') }}
                </p>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap items-center gap-4 border-t border-charcoal/8 pt-6">
              <a :href="config.instagram" target="_blank" rel="noopener" class="font-heading text-sm font-semibold text-ocean hover:text-ocean-dark">
                Instagram
              </a>
              <span class="text-charcoal/20">·</span>
              <a :href="config.facebook" target="_blank" rel="noopener" class="font-heading text-sm font-semibold text-ocean hover:text-ocean-dark">
                Facebook
              </a>
              <a
                :href="directionsUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center rounded-full border border-charcoal/10 px-5 py-3 text-sm font-heading font-semibold text-charcoal hover:bg-charcoal hover:text-white sm:ml-auto"
              >
                {{ t('location.directions') }}
              </a>
            </div>
          </article>

          <div class="grid gap-4 sm:grid-cols-3">
            <article
              v-for="step in steps"
              :key="step.index"
              class="premium-outline rounded-[1.65rem] px-5 py-6"
            >
              <p class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65">
                {{ step.index }}
              </p>
              <h3 class="mt-4 text-lg font-semibold text-deep">
                {{ step.title }}
              </h3>
              <p class="mt-3 text-sm leading-7 text-charcoal/62">
                {{ step.description }}
              </p>
            </article>
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
  () => `https://www.google.com/maps?q=${config.lat},${config.lng}&z=15&output=embed`
)

const directionsUrl = computed(
  () => `https://www.google.com/maps/dir/?api=1&destination=${config.lat},${config.lng}`
)

const steps = computed(() => [
  {
    index: '01',
    title: t('location.steps.oneTitle'),
    description: t('location.steps.oneDesc'),
  },
  {
    index: '02',
    title: t('location.steps.twoTitle'),
    description: t('location.steps.twoDesc'),
  },
  {
    index: '03',
    title: t('location.steps.threeTitle'),
    description: t('location.steps.threeDesc'),
  },
])
</script>
