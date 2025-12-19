<template>
  <div class="link-type-colors">
    <div class="color-item">
      <div class="color-preview">
        <svg width="20" height="10" viewBox="0 0 20 10">
          <line x1="0" y1="5" x2="14" y2="5" :stroke="colors.finishToStart" stroke-width="2"/>
          <polygon :points="'20,5 14,2 14,8'" :fill="colors.finishToStart"/>
        </svg>
      </div>
      <span class="color-label">{{ t('link.fs') }}</span>
      <span class="color-desc">{{ t('link.finishToStart') }}</span>
      <input 
        type="color" 
        :value="colors.finishToStart" 
        @input="updateColor('finishToStart', $event)"
        class="color-input-small"
      />
    </div>
    
    <div class="color-item">
      <div class="color-preview">
        <svg width="20" height="10" viewBox="0 0 20 10">
          <line x1="0" y1="5" x2="14" y2="5" :stroke="colors.startToStart" stroke-width="2"/>
          <polygon :points="'20,5 14,2 14,8'" :fill="colors.startToStart"/>
        </svg>
      </div>
      <span class="color-label">{{ t('link.ss') }}</span>
      <span class="color-desc">{{ t('link.startToStart') }}</span>
      <input 
        type="color" 
        :value="colors.startToStart" 
        @input="updateColor('startToStart', $event)"
        class="color-input-small"
      />
    </div>
    
    <div class="color-item">
      <div class="color-preview">
        <svg width="20" height="10" viewBox="0 0 20 10">
          <line x1="0" y1="5" x2="14" y2="5" :stroke="colors.finishToFinish" stroke-width="2"/>
          <polygon :points="'20,5 14,2 14,8'" :fill="colors.finishToFinish"/>
        </svg>
      </div>
      <span class="color-label">{{ t('link.ff') }}</span>
      <span class="color-desc">{{ t('link.finishToFinish') }}</span>
      <input 
        type="color" 
        :value="colors.finishToFinish" 
        @input="updateColor('finishToFinish', $event)"
        class="color-input-small"
      />
    </div>
    
    <div class="color-item">
      <div class="color-preview">
        <svg width="20" height="10" viewBox="0 0 20 10">
          <line x1="0" y1="5" x2="14" y2="5" :stroke="colors.startToFinish" stroke-width="2"/>
          <polygon :points="'20,5 14,2 14,8'" :fill="colors.startToFinish"/>
        </svg>
      </div>
      <span class="color-label">{{ t('link.sf') }}</span>
      <span class="color-desc">{{ t('link.startToFinish') }}</span>
      <input 
        type="color" 
        :value="colors.startToFinish" 
        @input="updateColor('startToFinish', $event)"
        class="color-input-small"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useI18n } from '../i18n';

export interface LinkTypeColors {
  finishToStart: string;
  startToStart: string;
  finishToFinish: string;
  startToFinish: string;
}

export default defineComponent({
  name: 'LinkTypeColorConfig',
  props: {
    colors: {
      type: Object as PropType<LinkTypeColors>,
      required: true
    }
  },
  emits: ['update:colors', 'change'],
  setup(props, { emit }) {
    const { t } = useI18n();
    
    const updateColor = (key: keyof LinkTypeColors, event: Event) => {
      const target = event.target as HTMLInputElement;
      const newColors = { ...props.colors, [key]: target.value };
      emit('update:colors', newColors);
      emit('change');
    };

    return { t, updateColor };
  }
});
</script>

<style lang="scss" scoped>
.link-type-colors {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .color-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;

    .color-preview {
      display: flex;
      align-items: center;
      width: 24px;
    }

    .color-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary, #333333);
      min-width: 20px;
    }

    .color-desc {
      font-size: 11px;
      color: var(--text-secondary, #666666);
      flex: 1;
    }

    .color-input-small {
      width: 28px;
      height: 24px;
      border: 1px solid var(--border, #d0d0d0);
      border-radius: 3px;
      cursor: pointer;
      padding: 0;

      &::-webkit-color-swatch-wrapper {
        padding: 2px;
      }

      &::-webkit-color-swatch {
        border: none;
        border-radius: 2px;
      }
    }
  }
}
</style>
