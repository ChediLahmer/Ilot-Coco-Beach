<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function applyLangAttrs(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

applyLangAttrs(locale.value)

watch(locale, (lang) => {
  applyLangAttrs(lang)
})
</script>
