/**
 * 甘特图国际化系统
 * 支持中文、英文等多语言切换
 */

import { ref, computed } from 'vue';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';
import frFR from './locales/fr-FR';
import deDE from './locales/de-DE';
import esES from './locales/es-ES';
import ruRU from './locales/ru-RU';

// 支持的语言类型
export type Locale = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ru-RU';

// 语言包类型
export type Messages = typeof zhCN;

// 所有语言包
const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
  'es-ES': esES,
  'ru-RU': ruRU
};

/**
 * 检测浏览器语言并映射到支持的语言
 * @returns 匹配的语言代码，找不到则返回英文
 */
export function detectBrowserLocale(): Locale {
  // 获取浏览器语言设置
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // 浏览器语言到系统支持语言的映射
  const localeMap: Record<string, Locale> = {
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-Hans': 'zh-CN',
    'zh-Hans-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-Hant': 'zh-TW',
    'zh-Hant-TW': 'zh-TW',
    'zh-HK': 'zh-TW',
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-US',
    'ja': 'ja-JP',
    'ja-JP': 'ja-JP',
    'ko': 'ko-KR',
    'ko-KR': 'ko-KR',
    'fr': 'fr-FR',
    'fr-FR': 'fr-FR',
    'de': 'de-DE',
    'de-DE': 'de-DE',
    'es': 'es-ES',
    'es-ES': 'es-ES',
    'ru': 'ru-RU',
    'ru-RU': 'ru-RU'
  };
  
  // 精确匹配
  if (localeMap[browserLang]) {
    return localeMap[browserLang];
  }
  
  // 尝试匹配语言前缀（例如 en-AU -> en）
  const langPrefix = browserLang.split('-')[0];
  if (localeMap[langPrefix]) {
    return localeMap[langPrefix];
  }
  
  // 默认返回英文
  return 'en-US';
}

// 当前语言
const currentLocale = ref<Locale>('zh-CN');

// 初始化语言设置：优先使用localStorage，其次使用浏览器语言，最后默认英文
const savedLocale = localStorage.getItem('gantt-locale') as Locale;
if (savedLocale && messages[savedLocale]) {
  // 使用已保存的语言设置
  currentLocale.value = savedLocale;
} else {
  // 根据浏览器语言自动设置
  currentLocale.value = detectBrowserLocale();
}

/**
 * 获取翻译文本
 * @param key 翻译键，支持点号路径如 'common.confirm'
 * @param params 模板参数对象
 * @returns 翻译后的文本
 */
export function t(key: string, params?: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = messages[currentLocale.value];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 如果找不到，返回原key
    }
  }
  
  let result = typeof value === 'string' ? value : key;
  
  // 如果有参数，进行模板替换
  if (params && typeof result === 'string') {
    Object.keys(params).forEach(paramKey => {
      const placeholder = `{${paramKey}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
    });
  }
  
  return result;
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
    { value: 'zh-TW', label: '🇹🇼 繁體中文' },
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
    getLocales,
    detectBrowserLocale
  };
}

export default {
  t,
  setLocale,
  getLocale,
  getLocales,
  useI18n,
  detectBrowserLocale
};
