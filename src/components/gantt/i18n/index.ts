/**
 * 甘特图国际化系统
 * 支持中文、英文等多语言切换
 */

import { ref, computed } from 'vue';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// 支持的语言类型
export type Locale = 'zh-CN' | 'en-US';

// 语言包类型
export type Messages = typeof zhCN;

// 所有语言包
const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS
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
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' }
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
