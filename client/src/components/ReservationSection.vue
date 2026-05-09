<template>
  <section
    id="reservation"
    class="px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-tr from-ocean-light/35 via-mist to-sand-dark/25"
  >
    <div class="mx-auto max-w-3xl text-center">
      <p class="text-sm font-medium text-ocean">
        {{ t("reservation.eyebrow") }}
      </p>
      <h2 class="mt-3 font-brand text-3xl leading-tight text-deep md:text-4xl">
        {{ t("reservation.title") }}
      </h2>
      <p class="mx-auto mt-4 max-w-lg text-sm text-charcoal/60">
        {{ t("reservation.responseTime") }}
      </p>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-3 rounded-lg border border-charcoal/8 bg-white px-5 py-6 transition-shadow hover:shadow-md"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/10"
          >
            <svg
              class="h-5 w-5 text-[#25D366]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-deep">WhatsApp</span>
        </a>

        <a
          :href="'tel:' + config.phone"
          class="flex flex-col items-center gap-3 rounded-lg border border-charcoal/8 bg-white px-5 py-6 transition-shadow hover:shadow-md"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-ocean/10"
          >
            <svg
              class="h-5 w-5 text-ocean"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25A2.25 2.25 0 0 0 21.75 19.5v-1.372c0-.516-.351-.966-.85-1.09l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.392 12.035 12.035 0 0 1-7.158-7.158 1.125 1.125 0 0 1 .392-1.21l1.293-.97c.38-.285.55-.774.417-1.173L6.962 3.1a1.125 1.125 0 0 0-1.09-.85H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-deep">{{ config.phone }}</span>
        </a>

        <a
          :href="config.instagram"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-3 rounded-lg border border-charcoal/8 bg-white px-5 py-6 transition-shadow hover:shadow-md"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#E1306C]/10"
          >
            <svg
              class="h-5 w-5 text-[#E1306C]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 2.25a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-deep">Instagram</span>
        </a>

        <a
          :href="messengerUrl"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-3 rounded-lg border border-charcoal/8 bg-white px-5 py-6 transition-shadow hover:shadow-md"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#0099FF]/10"
          >
            <svg
              class="h-5 w-5 text-[#0099FF]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2C6.477 2 2 6.145 2 11.259c0 2.915 1.453 5.515 3.724 7.213V22l3.219-1.766c.957.265 1.97.407 3.057.407 5.523 0 10-4.145 10-9.259S17.523 2 12 2Zm.994 12.567-2.546-2.718-4.966 2.718 5.466-5.81 2.593 2.718 4.919-2.718-5.466 5.81Z"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-deep">Messenger</span>
        </a>

        <a
          v-if="config.tiktok"
          :href="config.tiktok"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-3 rounded-lg border border-charcoal/8 bg-white px-5 py-6 transition-shadow hover:shadow-md"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-black/8"
          >
            <svg
              class="h-5 w-5 text-black"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.76 1.5V7.12a4.83 4.83 0 0 1-1-.43Z"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-deep">TikTok</span>
        </a>
      </div>

      <div class="mt-8 text-sm text-charcoal/50">
        {{ t("reservation.hoursLabel") }} · {{ hoursText }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useConfig } from "@/composables/useConfig";

const { t, locale } = useI18n();
const config = useConfig();

const hoursText = computed(() => {
  try {
    const parsed = JSON.parse(config.hours || "{}");
    return parsed[locale.value] || parsed.fr || config.hours || "";
  } catch {
    return config.hours || "";
  }
});

const whatsappUrl = computed(() => {
  const text = encodeURIComponent(
    `Bonjour, je souhaite réserver chez ${config.name}.`,
  );
  return `https://wa.me/${config.whatsapp}?text=${text}`;
});

const messengerUrl = computed(() => {
  const fbId = (config.facebook || "").split("/").filter(Boolean).pop();
  return `https://m.me/${fbId || ""}`;
});
</script>
