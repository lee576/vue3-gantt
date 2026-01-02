import { computed, ref } from 'vue'
import zhCN from './zh-CN'
import zhTW from './zh-TW'
import enUS from './en-US'
import jaJP from './ja-JP'
import koKR from './ko-KR'
import frFR from './fr-FR'
import deDE from './de-DE'
import esES from './es-ES'
import ruRU from './ru-RU'

export type Locale =
  | 'zh-CN'
  | 'zh-TW'
  | 'en-US'
  | 'ja-JP'
  | 'ko-KR'
  | 'fr-FR'
  | 'de-DE'
  | 'es-ES'
  | 'ru-RU'

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
  'es-ES': esES,
  'ru-RU': ruRU,
}

const currentLocale = ref<Locale>('zh-CN')

const savedLocale = localStorage.getItem('app-locale') as Locale
if (savedLocale && messages[savedLocale]) {
  currentLocale.value = savedLocale
} else {
  const browserLang = navigator.language || (navigator as any).userLanguage
  const localeMap: Record<string, Locale> = {
    zh: 'zh-CN', 'zh-CN': 'zh-CN', 'zh-Hans': 'zh-CN',
    'zh-TW': 'zh-TW', 'zh-Hant': 'zh-TW', 'zh-HK': 'zh-TW',
    en: 'en-US', 'en-US': 'en-US', 'en-GB': 'en-US',
    ja: 'ja-JP', 'ja-JP': 'ja-JP',
    ko: 'ko-KR', 'ko-KR': 'ko-KR',
    fr: 'fr-FR', 'fr-FR': 'fr-FR',
    de: 'de-DE', 'de-DE': 'de-DE',
    es: 'es-ES', 'es-ES': 'es-ES',
    ru: 'ru-RU', 'ru-RU': 'ru-RU',
  }
  const langPrefix = browserLang.split('-')[0]
  currentLocale.value = localeMap[browserLang] || localeMap[langPrefix] || 'zh-CN'
}

export function t(key: string, params?: Record<string, string | number>): string {
  let message = messages[currentLocale.value]?.[key] || messages['zh-CN']?.[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    })
  }
  return message
}

export function setLocale(locale: Locale) {
  if (messages[locale]) {
    currentLocale.value = locale
    localStorage.setItem('app-locale', locale)
  }
}

export function getLocale(): Locale {
  return currentLocale.value
}

export function useI18n() {
  const locale = computed(() => currentLocale.value)
  return { locale, t, setLocale, getLocale }
}

export const i18n = {
  global: {
    t: (key: string, params?: Record<string, string | number>): string => t(key, params)
  }
}
