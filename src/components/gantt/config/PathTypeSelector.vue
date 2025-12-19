<template>
  <div class="path-type-grid">
    <div 
      v-for="pathType in pathTypes" 
      :key="pathType.value"
      class="path-type-card"
      :class="{ active: modelValue === pathType.value }"
      @click="$emit('update:modelValue', pathType.value)"
    >
      <svg width="60" height="35" viewBox="0 0 60 40">
        <!-- 起点圆点 -->
        <circle cx="10" cy="20" r="2.5" fill="currentColor" v-if="pathType.value === 'straight'" />
        <circle cx="10" cy="25" r="2.5" fill="currentColor" v-if="pathType.value === 'bezier'" />
        <circle cx="10" cy="15" r="2.5" fill="currentColor" v-if="pathType.value === 'right-angle'" />
        
        <!-- 路径 -->
        <path 
          :d="pathType.preview" 
          stroke="currentColor" 
          stroke-width="2.5" 
          fill="none"
          stroke-linecap="round"
        />
        
        <!-- 终点箭头 -->
        <path 
          v-if="pathType.value === 'straight'"
          d="M 50 20 L 46 17 M 50 20 L 46 23" 
          stroke="currentColor" 
          stroke-width="2.5" 
          fill="none"
          stroke-linecap="round"
        />
        <path 
          v-if="pathType.value === 'bezier'"
          d="M 50 25 L 46 22 M 50 25 L 46 28" 
          stroke="currentColor" 
          stroke-width="2.5" 
          fill="none"
          stroke-linecap="round"
        />
        <path 
          v-if="pathType.value === 'right-angle'"
          d="M 50 25 L 46 22 M 50 25 L 46 28" 
          stroke="currentColor" 
          stroke-width="2.5" 
          fill="none"
          stroke-linecap="round"
        />
      </svg>
      <span class="path-name">{{ pathType.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from '../i18n';
import { LinkPathType } from '../composables/LinkConfig';

export default defineComponent({
  name: 'PathTypeSelector',
  props: {
    modelValue: {
      type: String as PropType<LinkPathType>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const { t } = useI18n();
    
    const pathTypes = computed(() => [
      { value: LinkPathType.STRAIGHT, name: t('configPanel.linkConfig.straight'), preview: 'M 10 20 L 50 20' },
      { value: LinkPathType.BEZIER, name: t('configPanel.linkConfig.bezier'), preview: 'M 10 25 Q 30 5 50 25' },
      { value: LinkPathType.RIGHT_ANGLE, name: t('configPanel.linkConfig.rightAngle'), preview: 'M 10 15 L 25 15 L 25 25 L 50 25' }
    ]);

    return { pathTypes };
  }
});
</script>

<style lang="scss" scoped>
.path-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.path-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 2px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  color: var(--text-secondary, #666666);

  &:hover {
    border-color: var(--primary, #0078d4);
    color: var(--primary, #0078d4);
  }

  &.active {
    border-color: var(--primary, #0078d4);
    background: var(--bg-content, #ffffff);
    box-shadow: 0 0 0 2px var(--primary, #0078d4), 0 2px 8px rgba(0, 120, 212, 0.15);
    
    .path-name {
      color: var(--primary, #0078d4);
    }
  }

  .path-name {
    font-size: 11px;
    font-weight: 600;
  }
}
</style>
