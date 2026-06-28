<template>
  <footer class="section-dark px-6 pb-6 pt-14 text-white md:px-12">
    <div class="mx-auto max-w-6xl">
      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <p class="text-xs font-medium text-white/45">
            {{ t("hero.tagline") }}
          </p>
          <h3 class="mt-2 font-brand text-3xl text-white">{{ config.name }}</h3>
          <p class="mt-3 max-w-md text-sm leading-relaxed text-white/60">
            {{ t("footer.description") }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium text-white/45">
            {{ t("footer.explore") }}
          </p>
          <div class="mt-4 flex flex-col gap-2.5">
            <a
              v-for="link in footerLinks"
              :key="link.key"
              :href="link.path || '#' + link.id"
              class="text-sm text-white/60 hover:text-white py-1.5"
              @click.prevent="navigate(link)"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-white/45">
            {{ t("footer.follow") }}
          </p>
          <div class="mt-4 flex flex-col gap-2.5 text-sm text-white/60">
            <a
              :href="config.instagram"
              target="_blank"
              rel="noopener"
              class="hover:text-white"
              >Instagram</a
            >
            <a
              :href="config.facebook"
              target="_blank"
              rel="noopener"
              class="hover:text-white"
              >Facebook</a
            >
            <a :href="'tel:' + config.phone" class="hover:text-white"
              ><span dir="ltr">{{ config.phone }}</span></a
            >
            <a v-if="config.email" :href="mailtoUrl" class="hover:text-white">{{
              config.email
            }}</a>
          </div>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col gap-2 border-t border-white/8 pt-5 text-xs text-white/35 md:flex-row md:items-center md:justify-between"
      >
        <p>{{ t("footer.madeWith") }}</p>
        <p>
          &copy; {{ new Date().getFullYear() }} {{ config.name }}.
          {{ t("footer.rights") }}.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConfig } from "@/composables/useConfig";

const { t } = useI18n();
const config = useConfig();
const route = useRoute();
const router = useRouter();

const footerLinks = computed(() => [
  { key: "home", id: "hero", label: t("nav.home") },
  { key: "experience", path: "/spaces", label: t("nav.experience") },
  { key: "menu", path: "/menu", label: t("nav.menu") || "Menu" },
  { key: "gallery", path: "/gallery", label: t("nav.gallery") },
  { key: "reservation", id: "reservation", label: t("nav.reservation") },
  { key: "contact", id: "contact", label: t("nav.contact") },
]);

const mailtoUrl = computed(() => {
  const subject = encodeURIComponent(`Réservation - ${config.name}`);
  const body = encodeURIComponent(
    `Bonjour, je souhaite réserver chez ${config.name}.`,
  );
  return `mailto:${config.email}?subject=${subject}&body=${body}`;
});

function navigate(link) {
  if (link.path) {
    if (route.path === link.path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(link.path);
    return;
  }

  if (route.path === "/") {
    const el = document.getElementById(link.id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    return;
  }

  router.push(link.id === "hero" ? "/" : { path: "/", hash: `#${link.id}` });
}
</script>
