<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="page-shell" mode="out-in" appear>
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<script setup>
import { watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

function applyLangAttrs(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

applyLangAttrs(locale.value);

watch(locale, (lang) => {
  applyLangAttrs(lang);
});
</script>

<style>
.page-shell-enter-active {
  transition: opacity 0.32s cubic-bezier(0.23, 1, 0.32, 1);
}
.page-shell-leave-active {
  transition: opacity 0.24s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.page-shell-enter-from,
.page-shell-leave-to {
  opacity: 0;
}
</style>
