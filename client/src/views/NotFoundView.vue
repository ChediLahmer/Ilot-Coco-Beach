<template>
  <div class="min-h-screen bg-transparent flex flex-col">
    <NavBar />
    <div class="flex-1 flex items-center justify-center px-6 py-20">
      <div class="text-center max-w-md">
        <p class="font-brand text-8xl text-ocean/30">404</p>
        <h1 class="mt-4 font-brand text-2xl text-deep">
          {{ t("errors.notFoundTitle") }}
        </h1>
        <p class="mt-3 text-sm text-charcoal/55">
          {{ t("errors.notFoundDesc") }}
        </p>
        <router-link
          to="/"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 font-heading text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-ocean-dark transition-colors"
        >
          {{ t("errors.backHome") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import NavBar from "@/components/NavBar.vue";

const { t } = useI18n();
</script>
