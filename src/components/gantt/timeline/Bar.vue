<template>
  <div
    v-if="showRow"
    class="barRow"
    :class="['barRow-base', barRowClassName, { active: hover }]"
    :style="barRowStyle"
    @mouseover="hoverActive()"
    @mouseleave="hoverInactive()"
    :data-task-id="row[mapFields.id]"
  >
    <slot name="bar" :row="row">
      <svg
        key="row.no"
        v-if="showRow"
        ref="bar"
        class="bar"
        :class="['bar-base', barClassName, { active: hover }]"
        :height="barHeight + 'px'"
        style="overflow: visible"
      >
        <slot name="progress" :row="row" :progress="progress">
          <slot name="label" :row="row"></slot>
        </slot>
      </svg>
    </slot>
    <slot :row="row" :progress="progress"></slot>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
  computed,
  onMounted,
  onDeactivated,
  onBeforeUnmount,
  inject,
  type PropType,
  type VNode,
} from 'vue'
import interact from 'interactjs'
import { store, mutations } from '../state/Store'
import { Symbols } from '../state/Symbols'
import { useBarGeometry } from './composables/useBarGeometry'
import { useBarTheme } from './composables/useBarTheme'
import { useHover } from './composables/useHover'
import { useProgress } from './composables/useProgress'
import { useInteractions } from './composables/useInteractions'
import type { GanttTask } from '../types/GanttTypes'

export default defineComponent({
  name: 'GanttBar',
  emits: ['progress-update'],
  slots: Object as {
    default?: (props: { row: GanttTask; progress: number }) => VNode[]
    bar?: (props: { row: GanttTask }) => VNode[]
    progress?: (props: { row: GanttTask; progress: number }) => VNode[]
    label?: (props: { row: GanttTask }) => VNode[]
  },
  props: {
    rowHeight: { type: Number as () => number, default: 0 },
    row: { type: Object as () => GanttTask, default: () => ({}) },
    startGanttDate: { type: [String, Date] as PropType<string | Date>, required: true },
    endGanttDate: { type: [String, Date] as PropType<string | Date>, required: true },
    barClassName: { type: String, default: '' },
    barRowClassName: { type: String, default: '' },
    progressHandleClassName: { type: String, default: '' },
  },
  setup(props, { emit }) {
    const bar = ref<SVGSVGElement | null>(null)
    const barHeight = ref(props.rowHeight * 0.7)
    const showRow = ref(true)
    const barColor = ref('')
    const isBarInteracted = ref(false)

    const {
      barClassName,
      barRowClassName,
      progressHandleClassName,
    } = props

    // 使用 useBarGeometry composables
    const { oldBarDataX, oldBarWidth, computePosition } = useBarGeometry(props, store.mapFields)

    // 使用 useBarTheme composables
    const { barRowStyle, setupThemeObserver } = useBarTheme(bar, props)

    const scale = computed(() => store.scale)
    const mode = computed(() => store.mode)
    const mapFields = computed(() => store.mapFields)
    // 使用 useProgress composables
    const {
      progress,
      isProgressDragging: isProgressDraggingFromComposable,
      emitProgressUpdate: emitProgressUpdateFromComposable,
    } = useProgress(props, emit, store.mapFields)

    const setBarColor = inject(Symbols.SetBarColorSymbol) as (() => string) | undefined

    // 使用 useHover composables
    const { hover: hoverFromComposable, hoverActive, hoverInactive } = useHover(props)

    const setBarDate = mutations.setBarDate

    // 用于存储交互功能
    // eslint-disable-next-line no-unused-vars
    let drawBarFromComposable: ((barElement?: SVGSVGElement) => void) | null = null
    let destroyInteractions: (() => void) | null = null

    // 初始化交互功能
    const initInteractions = (_barElement: SVGSVGElement) => {
      const interactions = useInteractions({
      bar: _barElement,
      barHeight: barHeight.value,
      mapFields: store.mapFields,
      props,
      oldBarDataX,
      oldBarWidth,
      progress,
      barColor,
      isProgressDragging: isProgressDraggingFromComposable,
      emitProgressUpdate: emitProgressUpdateFromComposable,
      computePosition,
      barClassName,
      barRowClassName,
      progressHandleClassName,
    })
      drawBarFromComposable = interactions.drawBar
      destroyInteractions = interactions.destroy
    }

    const drowBar = (_barElement: SVGSVGElement) => {
      // 使用 useBarGeometry 的计算结果
      const { dataX, width } = computePosition()
      oldBarDataX.value = dataX
      oldBarWidth.value = width

      // 设置基本的 SVG 属性
      const borderColor = getComputedStyle(_barElement).getPropertyValue('--border') || '#cecece'
      _barElement.setAttribute('data-x', dataX.toString())
      _barElement.setAttribute('width', oldBarWidth.value.toString())
      _barElement.setAttribute('stroke', borderColor)
      _barElement.setAttribute('stroke-width', '1px')
      _barElement.style.transform = `translate(${dataX}px, 0px)`

      // 初始化交互功能（如果尚未初始化）
      if (!drawBarFromComposable) {
        initInteractions(_barElement)
      }

      // 调用交互绘制功能
      if (drawBarFromComposable) {
        drawBarFromComposable(_barElement)
      }

      setBarDate({
        id: props.row[mapFields.value.id],
        startDate: props.row[mapFields.value.startdate],
        endDate: props.row[mapFields.value.enddate],
      })
    }

    watch(
      () => [props.row[mapFields.value.startdate], props.row[mapFields.value.enddate]],
      () => {
        if (bar.value && isBarInteracted.value) drowBar(bar.value)
      },
      { deep: false }
    )

    // 监听模式和缩放变化，重新绘制 bar
    watch([mode, scale], () => {
      if (bar.value && isBarInteracted.value) {
        drowBar(bar.value)
      }
    })

    onMounted(() => {
      if (bar.value && !isBarInteracted.value) {
        drowBar(bar.value)
        isBarInteracted.value = true
      }
      if (setBarColor) {
        barColor.value = setBarColor(props.row)
        if (bar.value) drowBar(bar.value)
      }
      // 使用 useBarTheme 提供的主题观察器
      if (bar.value) {
        setupThemeObserver()
      }
    })

    onDeactivated(() => {
      if (bar.value) {
        try {
          interact(bar.value).unset()
        } catch (e) {
          console.warn('Error unsetting interact:', e)
        }
      }
      showRow.value = false
    })

    onBeforeUnmount(() => {
      if (bar.value) {
        try {
          interact(bar.value).unset()
        } catch (e) {
          console.warn('Error unsetting interact:', e)
        }
      }
      // 清理交互功能
      if (destroyInteractions) {
        destroyInteractions()
      }
      showRow.value = false
    })

    return {
      bar,
      barHeight,
      showRow,
      hover: hoverFromComposable,
      hoverActive,
      hoverInactive,
      barRowStyle,
      mapFields,
      barClassName,
      barRowClassName,
      progressHandleClassName,
      progress,
    }
  },
})
</script>

<style lang="scss" scoped>
.barRow-base {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  position: relative;
  overflow: visible;
  @apply transition-colors duration-200;

  &.active {
    background: var(--row-hover, #fff3a1) !important;
  }
}

.bar-base {
  position: absolute;
  z-index: 100;
  background-color: #faf7ec;
  border-radius: 10px;
  overflow: visible;
  cursor: move;
  @apply transition-all duration-200;
}

.progressHandle {
  pointer-events: auto !important;
  cursor: ew-resize !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.progressHandle:hover {
  cursor: ew-resize !important;
}

.progressGuideLine {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>
