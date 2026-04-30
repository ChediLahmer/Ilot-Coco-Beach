<template>
  <section id="contact" class="px-6 py-20 md:px-12 lg:px-20">
    <div class="mx-auto max-w-6xl">
      <div>
        <p class="section-kicker">{{ t("location.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("location.title") }}</h2>
        <div class="section-divider" />
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <div class="overflow-hidden rounded-lg border border-charcoal/8">
          <iframe
            :src="mapUrl"
            width="100%"
            height="100%"
            class="h-[16rem] sm:h-[20rem] w-full"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :title="config.name + ' location'"
          />
        </div>

        <div class="space-y-6">
          <div class="rounded-lg border border-charcoal/8 bg-white p-6">
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <p class="text-xs font-medium text-charcoal/50">
                  {{ t("location.address") }}
                </p>
                <p class="mt-1.5 text-sm text-charcoal/75">
                  {{ config.address }}
                </p>
              </div>
              <div>
                <p class="text-xs font-medium text-charcoal/50">
                  {{ t("location.phone") }}
                </p>
                <a
                  :href="'tel:' + config.phone"
                  class="mt-1.5 block text-sm text-charcoal/75 hover:text-ocean"
                  >{{ config.phone }}</a
                >
              </div>
              <div>
                <p class="text-xs font-medium text-charcoal/50">
                  {{ t("location.hours") }}
                </p>
                <p class="mt-1.5 text-sm text-charcoal/75">
                  {{ t("location.hoursValue") }}
                </p>
              </div>
              <div>
                <p class="text-xs font-medium text-charcoal/50">
                  {{ t("location.howTo") }}
                </p>
                <p class="mt-1.5 text-sm text-charcoal/75">
                  {{ t("location.howToDesc") }}
                </p>
              </div>
            </div>

            <div
              class="mt-6 flex flex-wrap items-center gap-4 border-t border-charcoal/6 pt-5"
            >
              <a
                :href="config.instagram"
                target="_blank"
                rel="noopener"
                class="text-sm font-medium text-ocean hover:text-ocean-dark"
                >Instagram</a
              >
              <span class="text-charcoal/20">&middot;</span>
              <a
                :href="config.facebook"
                target="_blank"
                rel="noopener"
                class="text-sm font-medium text-ocean hover:text-ocean-dark"
                >Facebook</a
              >
              <a
                :href="directionsUrl"
                target="_blank"
                rel="noopener"
                class="premium-button sm:ms-auto"
              >
                {{ t("location.directions") }}
              </a>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <article
              v-for="step in steps"
              :key="step.index"
              class="rounded-lg border border-charcoal/8 p-4"
            >
              <p class="text-xs font-medium text-ocean">{{ step.index }}</p>
              <h3 class="mt-2 text-sm font-semibold text-deep">
                {{ step.title }}
              </h3>
              <p class="mt-1 text-xs leading-relaxed text-charcoal/55">
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useConfig } from "@/composables/useConfig";

const { t } = useI18n();
const config = useConfig();

const mapUrl = computed(
  () =>
    `https://www.google.com/maps?q=${config.lat},${config.lng}&z=15&output=embed`,
);

const directionsUrl = computed(
  () =>
    `https://www.google.com/maps/dir/?api=1&destination=${config.lat},${config.lng}`,
);

const steps = computed(() => [
  {
    index: "01",
    title: t("location.steps.oneTitle"),
    description: t("location.steps.oneDesc"),
  },
  {
    index: "02",
    title: t("location.steps.twoTitle"),
    description: t("location.steps.twoDesc"),
  },
  {
    index: "03",
    title: t("location.steps.threeTitle"),
    description: t("location.steps.threeDesc"),
  },
]);
</script>
