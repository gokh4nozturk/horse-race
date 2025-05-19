import { createI18n } from 'vue-i18n'

// Import locale messages
import en from './locales/en.json'
import tr from './locales/tr.json'

// Define message schema from English locale
export type MessageSchema = typeof en

// Create i18n instance
export const i18n = createI18n({
  legacy: false, // You must set `false`, to use Composition API
  locale: 'en', // Set default locale
  fallbackLocale: 'en', // Set fallback locale
  messages: {
    en,
    tr,
  },
})
