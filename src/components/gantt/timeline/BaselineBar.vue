<template>
  <div
    v-if="showRow && baselineData"
    class="baseline-bar-row"
    :style="baselineRowStyle"
  >
    <svg
      v-if="showRow"
      ref="baselineBar"
      class="baseline-bar"
      :height="barHeight + 'px'"
      style="overflow: visible"
    ></svg>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  inject,
} from 'vue'
import { store } from '../state/Store'
import { diff, addDays, parseISO } from '../utils/dateUtils'

export default defineComponent({
  name: 'BaselineBar',
  props: {
    rowHeight: { type: Number as () => number, default: 0 },
    row: { type: Object as () => Record<string, any>, default: () => ({}) },
    startGanttDate: { type: String as () => string },
    endGanttDate: { type: String as () => string },
    baselineData: {
      type: Object as () => {
        plannedStartDate: string
        plannedEndDate: string
        plannedProgress: number
      } | null,
      default: null,
    },
    baselineColor: {
      type: String,
      default: '#95a5a6',
    },
  },
  setup(props) {
    const baselineBar = ref<SVGSVGElement | null>(null)
    const barHeight = ref(props.rowHeight * 0.4)
    const showRow = ref(true)

    const scale = computed(() => store.scale)
    const mode = computed(() => store.mode)
    const mapFields = computed(() => store.mapFields)

    const baselineRowStyle = computed(() => ({
      position: 'absolute',
      top: `${props.rowHeight * 0.15}px`,  // 调整到任务条上方
      left: '0',
      width: '100%',
      height: `${barHeight.value}px`,  // 只占用基线条自身的高度
      zIndex: 100,
      pointerEvents: 'none' as const,
    }))

    const calculateBaselinePosition = computed(() => {
      if (!props.baselineData || !props.startGanttDate || !props.endGanttDate) {
        return { dataX: 0, width: 0 }
      }

      const ganttStart = parseISO(props.startGanttDate.split(' ')[0])
      const ganttEnd = parseISO(props.endGanttDate.split(' ')[0])
      const baselineStart = parseISO(props.baselineData.plannedStartDate)
      const baselineEnd = parseISO(props.baselineData.plannedEndDate)

      // 将 dayjs 对象转换为 Date 对象以兼容 diff 函数
      const ganttStartAsDate = ganttStart.toDate()
      const ganttEndAsDate = ganttEnd.toDate()
      const baselineStartAsDate = baselineStart.toDate()
      const baselineEndAsDate = baselineEnd.toDate()

      const ganttDuration = diff(ganttEndAsDate, ganttStartAsDate, 'day') + 1
      const baselineDuration = diff(baselineEndAsDate, baselineStartAsDate, 'day') + 1

      let dataX = 0
      if (baselineStart < ganttStart) {
        dataX = 0
      } else {
        const daysFromStart = diff(baselineStartAsDate, ganttStartAsDate, 'day')
        dataX = (daysFromStart / ganttDuration) * 100
      }

      const widthPercent = (baselineDuration / ganttDuration) * 100

      return { dataX, width: widthPercent }
    })

    const drawBaselineBar = (barElement: SVGSVGElement) => {
      if (!props.baselineData || !props.startGanttDate || !props.endGanttDate) {
        return
      }

      const { dataX, width } = calculateBaselinePosition.value

      barElement.innerHTML = ''

      const svgNS = 'http://www.w3.org/2000/svg'
      const rect = document.createElementNS(svgNS, 'rect')
      rect.setAttribute('x', `${dataX}%`)
      rect.setAttribute('y', '0')
      rect.setAttribute('width', `${width}%`)
      rect.setAttribute('height', `${barHeight.value}px`)
      rect.setAttribute('rx', '3')
      rect.setAttribute('ry', '3')
      rect.setAttribute('fill', 'none')  // 改为透明填充
      rect.setAttribute('stroke', props.baselineColor)
      rect.setAttribute('stroke-width', '2px')  // 增加边框宽度
      rect.setAttribute('stroke-dasharray', '5,3')  // 添加虚线样式
      rect.setAttribute('stroke-opacity', '1')  // 完全不透明

      barElement.appendChild(rect)

      const baselineProgress = props.baselineData.plannedProgress || 0
      if (baselineProgress > 0) {
        const progressRect = document.createElementNS(svgNS, 'rect')
        progressRect.setAttribute('x', `${dataX}%`)
        progressRect.setAttribute('y', '0')
        progressRect.setAttribute('width', `${width * baselineProgress}%`)
        progressRect.setAttribute('height', `${barHeight.value}px`)
        progressRect.setAttribute('rx', '3')
        progressRect.setAttribute('ry', '3')
        progressRect.setAttribute('fill', props.baselineColor)
        progressRect.setAttribute('fill-opacity', '0.3')  // 半透明填充
        barElement.appendChild(progressRect)
      }

      barElement.style.transform = `translate(0, 0)`
    }

    watch(
      () => [
        props.baselineData?.plannedStartDate,
        props.baselineData?.plannedEndDate,
        props.baselineData?.plannedProgress,
      ],
      () => {
        if (baselineBar.value) {
          drawBaselineBar(baselineBar.value)
        }
      },
      { deep: false }
    )

    watch([mode, scale], () => {
      if (baselineBar.value) {
        drawBaselineBar(baselineBar.value)
      }
    })

    onMounted(() => {
      if (baselineBar.value && props.baselineData) {
        drawBaselineBar(baselineBar.value)
      }
    })

    return {
      baselineBar,
      barHeight,
      showRow,
      baselineRowStyle,
      mapFields,
    }
  },
})
</script>
<style lang="scss" scoped>
.baseline-bar-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  position: absolute;  // 绝对定位
  overflow: visible;
  z-index: 100 !important;

  .baseline-bar {
    position: absolute;
    width: 100%;
    z-index: 100 !important;
  }
}
</style>
