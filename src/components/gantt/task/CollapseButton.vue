<template>
  <span
    class="collapse-btn"
    :class="{ collapsed: collapsed }"
    :title="title"
    role="button"
    tabindex="0"
    @click="$emit('toggle')"
    @keydown.enter="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path class="arrow" d="M5 4 L14 9 L5 14 Z" fill="currentColor" />
    </svg>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CollapseButton',
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '折叠',
    },
  },
  emits: ['toggle'],
})
</script>

<style lang="scss" scoped>
.collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #6c757d;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  svg {
    width: 16px;
    height: 16px;
    transition: all 0.2s ease;
  }

  .arrow {
    transform-origin: center;
    transition: transform 0.2s ease;
    transform: rotate(90deg);
  }

  &.collapsed .arrow {
    transform: rotate(0deg);
  }

  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    color: #495057;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    background: linear-gradient(135deg, #dee2e6 0%, #ced4da 100%);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 1px 2px rgba(0, 0, 0, 0.1);

    svg {
      transform: scale(0.95);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--primary, #3370ff);
    outline-offset: 2px;
  }
}
</style>
