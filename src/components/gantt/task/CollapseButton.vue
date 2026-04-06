<template>
  <span
    class="collapse-btn"
    :class="{ collapsed: collapsed }"
    :style="resolvedStyle"
    :data-scope="scope"
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
import { computed, defineComponent, inject, type PropType } from 'vue'
import { Symbols } from '../state/Symbols'
import type { GanttTask } from '../types/GanttTypes'
import type { StyleConfig } from '../types/Types'

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
    row: {
      type: Object as PropType<GanttTask | undefined>,
      default: undefined,
    },
    scope: {
      type: String as PropType<'header' | 'row'>,
      default: 'row',
    },
  },
  emits: ['toggle'],
  setup(props) {
    const taskCollapseButtonStyle = inject<Record<string, string | number> | undefined>(
      Symbols.TaskCollapseButtonStyleSymbol,
      undefined
    )
    const setTaskCollapseButtonStyle = inject<
      StyleConfig['setTaskCollapseButtonStyle'] | undefined
    >(Symbols.SetTaskCollapseButtonStyleSymbol, undefined)

    const resolvedStyle = computed<Record<string, string | number>>(() => {
      const style: Record<string, string | number> = {}

      if (taskCollapseButtonStyle) {
        Object.assign(style, taskCollapseButtonStyle)
      }

      const dynamicStyle = setTaskCollapseButtonStyle?.({
        collapsed: props.collapsed,
        row: props.row,
        scope: props.scope,
      })

      if (dynamicStyle) {
        Object.entries(dynamicStyle).forEach(([key, value]) => {
          if (value !== undefined) {
            style[key] = value
          }
        })
      }

      return style
    })

    return {
      resolvedStyle,
    }
  },
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
  background: var(
    --task-collapse-button-background,
    linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
  );
  color: var(--task-collapse-button-color, #6c757d);
  cursor: pointer;
  border-radius: var(--task-collapse-button-radius, 6px);
  transition: var(--task-collapse-button-transition, all 0.2s ease);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: var(
    --task-collapse-button-shadow,
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8)
  );

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
    background: var(
      --task-collapse-button-hover-background,
      linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)
    );
    color: var(--task-collapse-button-hover-color, #495057);
    box-shadow: var(
      --task-collapse-button-hover-shadow,
      0 2px 6px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9)
    );

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    background: var(
      --task-collapse-button-active-background,
      linear-gradient(135deg, #dee2e6 0%, #ced4da 100%)
    );
    color: var(
      --task-collapse-button-active-color,
      var(--task-collapse-button-hover-color, #495057)
    );
    box-shadow: var(
      --task-collapse-button-active-shadow,
      0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 1px 2px rgba(0, 0, 0, 0.1)
    );

    svg {
      transform: scale(0.95);
    }
  }

  &:focus-visible {
    outline: var(--task-collapse-button-focus-outline, 2px solid var(--primary, #3370ff));
    outline-offset: var(--task-collapse-button-focus-offset, 2px);
  }
}
</style>
