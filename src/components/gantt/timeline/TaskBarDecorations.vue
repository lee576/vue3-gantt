<template>
  <div v-if="visible" class="task-bar-decorations">
    <div
      v-if="decorations.indicators.length"
      class="task-bar-decorations__indicators"
      :style="indicatorsStyle"
    >
      <span
        v-for="indicator in decorations.indicators"
        :key="indicator.key"
        class="task-bar-decorations__indicator"
        :class="indicator.className"
        :title="indicator.title"
        :style="getIndicatorStyle(indicator)"
      >
        {{ indicator.text }}
      </span>
    </div>
    <div
      v-if="decorations.labels.top"
      class="task-bar-decorations__label is-top"
      :style="topLabelStyle"
    >
      {{ decorations.labels.top }}
    </div>
    <div
      v-if="decorations.labels.left"
      class="task-bar-decorations__label is-left"
      :style="leftLabelStyle"
    >
      {{ decorations.labels.left }}
    </div>
    <div
      v-if="decorations.labels.right"
      class="task-bar-decorations__label is-right"
      :style="rightLabelStyle"
    >
      {{ decorations.labels.right }}
    </div>
    <div
      v-if="decorations.labels.bottom"
      class="task-bar-decorations__label is-bottom"
      :style="bottomLabelStyle"
    >
      {{ decorations.labels.bottom }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import type {
  ResolvedTaskBarDecorations,
  ResolvedTaskBarIndicator,
} from '../types/Types'
import { hasTaskBarDecorations } from '../utils/taskBarDecorations'

export default defineComponent({
  name: 'TaskBarDecorations',
  props: {
    anchorX: {
      type: Number,
      required: true,
    },
    barWidth: {
      type: Number,
      required: true,
    },
    rowHeight: {
      type: Number,
      required: true,
    },
    barHeight: {
      type: Number,
      required: true,
    },
    decorations: {
      type: Object as PropType<ResolvedTaskBarDecorations>,
      required: true,
    },
  },
  setup(props) {
    const visible = computed(() => hasTaskBarDecorations(props.decorations))
    const barTop = computed(() => Math.max(0, (props.rowHeight - props.barHeight) / 2))
    const centerX = computed(() => props.anchorX + props.barWidth / 2)
    const indicatorsOffset = computed(() => (props.decorations.indicators.length ? 30 : 0))

    const indicatorsStyle = computed(() => ({
      left: `${props.anchorX}px`,
      top: `${Math.max(2, barTop.value - 28)}px`,
      maxWidth: `${Math.max(140, props.barWidth + 120)}px`,
    }))

    const topLabelStyle = computed(() => ({
      left: `${centerX.value}px`,
      top: `${Math.max(2, barTop.value - 8 - indicatorsOffset.value)}px`,
      transform: 'translate(-50%, -100%)',
    }))

    const leftLabelStyle = computed(() => ({
      left: `${props.anchorX - 10}px`,
      top: `${props.rowHeight / 2}px`,
      transform: 'translate(-100%, -50%)',
    }))

    const rightLabelStyle = computed(() => ({
      left: `${props.anchorX + props.barWidth + 10}px`,
      top: `${props.rowHeight / 2}px`,
      transform: 'translate(0, -50%)',
    }))

    const bottomLabelStyle = computed(() => ({
      left: `${centerX.value}px`,
      top: `${barTop.value + props.barHeight + 8}px`,
      transform: 'translate(-50%, 0)',
    }))

    const getIndicatorStyle = (indicator: ResolvedTaskBarIndicator) => ({
      color: indicator.color ?? '#0f172a',
      background: indicator.backgroundColor ?? 'rgba(255, 255, 255, 0.92)',
      borderColor: indicator.borderColor ?? 'rgba(148, 163, 184, 0.45)',
    })

    return {
      visible,
      indicatorsStyle,
      topLabelStyle,
      leftLabelStyle,
      rightLabelStyle,
      bottomLabelStyle,
      getIndicatorStyle,
    }
  },
})
</script>

<style lang="scss" scoped>
.task-bar-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 135;
}

.task-bar-decorations__indicators {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.task-bar-decorations__indicator {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(8px);
}

.task-bar-decorations__label {
  position: absolute;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary, #334155);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);

  &.is-top,
  &.is-bottom {
    text-align: center;
  }
}
</style>
