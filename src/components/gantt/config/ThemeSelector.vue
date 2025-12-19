<template>
  <div class="theme-grid">
    <div
      v-for="theme in themes"
      :key="theme.id"
      class="theme-card"
      :class="{ active: modelValue === theme.id }"
      @click="$emit('update:modelValue', theme.id)"
    >
      <div class="theme-preview" :style="{ background: theme.preview }"></div>
      <div class="theme-info">
        <div class="theme-name">{{ t(theme.nameKey) }}</div>
        <div class="theme-desc">{{ t(theme.descKey) }}</div>
      </div>
      <div v-if="modelValue === theme.id" class="theme-check">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useI18n } from '../i18n';
import type { GanttTheme } from '../themes/GanttThemes';

export default defineComponent({
  name: 'ThemeSelector',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    themes: {
      type: Array as PropType<GanttTheme[]>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
});
</script>

<style lang="scss" scoped>
.theme-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 2px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  position: relative;

  &:hover {
    border-color: var(--primary, #0078d4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    border-color: var(--primary, #0078d4);
    background: var(--bg-content, #ffffff);
    box-shadow: 0 0 0 2px var(--primary, #0078d4), 0 2px 8px rgba(0, 120, 212, 0.15);
    
    .theme-info {
      .theme-name {
        color: var(--primary, #0078d4);
      }
      
      .theme-desc {
        color: var(--text-primary, #333333);
      }
    }
  }

  .theme-preview {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .theme-info {
    flex: 1;
    min-width: 0;

    .theme-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #333333);
      margin-bottom: 4px;
    }

    .theme-desc {
      font-size: 11px;
      color: var(--text-secondary, #666666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .theme-check {
    color: var(--primary, #0078d4);
    flex-shrink: 0;
  }
}
</style>
