/**
 * 甘特图国际化系统
 * 支持中文、英文等多语言切换
 */

import { ref, computed } from 'vue';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';
import frFR from './locales/fr-FR';
import deDE from './locales/de-DE';
import esES from './locales/es-ES';
import ruRU from './locales/ru-RU';

// 支持的语言类型
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ru-RU';

// 语言包类型
export type Messages = typeof zhCN;

// 所有语言包
const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
  'es-ES': esES,
  'ru-RU': ruRU
};

// 当前语言
const currentLocale = ref<Locale>('zh-CN');

// 从localStorage读取保存的语言设置
const savedLocale = localStorage.getItem('gantt-locale') as Locale;
if (savedLocale && messages[savedLocale]) {
  currentLocale.value = savedLocale;
}

/**
 * 获取翻译文本
 * @param key 翻译键，支持点号路径如 'common.confirm'
 * @returns 翻译后的文本
 */
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = messages[currentLocale.value];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 如果找不到，返回原key
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * 设置当前语言
 * @param locale 语言代码
 */
export function setLocale(locale: Locale) {
  if (messages[locale]) {
    currentLocale.value = locale;
    localStorage.setItem('gantt-locale', locale);
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return currentLocale.value;
}

/**
 * 获取所有支持的语言
 */
export function getLocales(): { value: Locale; label: string }[] {
  return [
    { value: 'zh-CN', label: '🇨🇳 简体中文' },
    { value: 'en-US', label: '🇺🇸 English' },
    { value: 'ja-JP', label: '🇯🇵 日本語' },
    { value: 'ko-KR', label: '🇰🇷 한국어' },
    { value: 'fr-FR', label: '🇫🇷 Français' },
    { value: 'de-DE', label: '🇩🇪 Deutsch' },
    { value: 'es-ES', label: '🇪🇸 Español' },
    { value: 'ru-RU', label: '🇷🇺 Русский' }
  ];
}

/**
 * 创建响应式i18n hook
 */
export function useI18n() {
  const locale = computed(() => currentLocale.value);
  
  return {
    locale,
    t,
    setLocale,
    getLocale,
    getLocales
  };
}

export default {
  t,
  setLocale,
  getLocale,
  getLocales,
  useI18n
};
