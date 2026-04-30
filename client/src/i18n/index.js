import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

const savedLang = typeof localStorage !== 'undefined'
  ? localStorage.getItem('ilot-lang') || 'fr'
  : 'fr'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'fr',
  messages: { fr, en, ar },
})

export default i18n

export function setLanguage(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('ilot-lang', lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}
