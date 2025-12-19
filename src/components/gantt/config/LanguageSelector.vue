<template>
  <div class="language-selector-inline">
    <div
      v-for="locale in locales"
      :key="locale.value"
      class="language-option"
      :class="{ active: modelValue === locale.value }"
      @click="$emit('update:modelValue', locale.value)"
    >
      <span class="lang-label">{{ locale.label }}</span>
      <div v-if="modelValue === locale.value" class="lang-check">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Locale } from '../i18n';

export interface LocaleOption {
  value: Locale;
  label: string;
}

export default defineComponent({
  name: 'LanguageSelector',
  props: {
    modelValue: {
      type: String as PropType<Locale>,
      required: true
    },
    locales: {
      type: Array as PropType<LocaleOption[]>,
      required: true
    }
  },
  emits: ['update:modelValue']
});
</script>

<style lang="scss" scoped>
.language-selector-inline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  
  .language-option {
    padding: 10px 12px;
    border: 1px solid var(--border, #d0d0d0);
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all var(--transition-fast, 0.15s ease);
    box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));

    &:hover {
      border-color: var(--primary, #0078d4);
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      transform: translateY(-1px);
    }

    &.active {
      border-color: var(--primary, #0078d4);
      background: var(--bg-content, #ffffff);
      box-shadow: 0 0 0 2px var(--primary, #0078d4), 0 2px 8px rgba(0, 120, 212, 0.15);
      
      .lang-label {
        color: var(--primary, #0078d4);
        font-weight: 600;
      }
    }

    .lang-label {
      font-size: 12px;
      flex: 1;
      color: var(--text-primary, #333333);
    }

    .lang-check {
      color: var(--primary, #0078d4);
      display: flex;
      align-items: center;
      margin-left: 8px;
    }
  }
}
</style>
