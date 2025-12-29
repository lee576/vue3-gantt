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
} from 'vue'
import { store } from '../state/Store'
import { differenceInDays, parseISO } from '../utils/dateUtils'

export default defineComponent({
  name: 'BaselineBarRow',
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
    const barHeight = ref(props.rowHeight * 0.3)
    const showRow = ref(true)

    const scale = computed(() => store.scale)
    const mode = computed(() => store.mode)

    const baselineRowStyle = computed(() => ({
      position: 'absolute',
      top: `${props.rowHeight * 0.75}px`,
      left: '0',
      width: '100%',
      height: `${props.rowHeight}px`,
      zIndex: 40,
      pointerEvents: 'none',
    }))

    const calculateBaselinePosition = computed(() => {
      if (!props.baselineData || !props.startGanttDate || !props.endGanttDate) {
        return { dataX: 0, width: 0 }
      }

      const ganttStart = parseISO(props.startGanttDate.split(' ')[0])
      const ganttEnd = parseISO(props.endGanttDate.split(' ')[0])
      const baselineStart = parseISO(props.baselineData.plannedStartDate)
      const baselineEnd = parseISO(props.baselineData.plannedEndDate)

      const ganttDuration = differenceInDays(ganttEnd, ganttStart) + 1
      const baselineDuration = differenceInDays(baselineEnd, baselineStart) + 1

      let dataX = 0
      if (baselineStart < ganttStart) {
        dataX = 0
      } else {
        const daysFromStart = differenceInDays(baselineStart, ganttStart)
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
      rect.setAttribute('fill', props.baselineColor)
      rect.setAttribute('fill-opacity', '0.5')
      rect.setAttribute('stroke', props.baselineColor)
      rect.setAttribute('stroke-width', '1px')
      rect.setAttribute('stroke-opacity', '0.8')

      barElement.appendChild(rect)

      const baselineProgress = props.baselineData.plannedProgress || 0
      if (baselineProgress > 0) {
        const progressRect = document.createElementNS(svgNS, 'rect')
        progressRect.setAttribute('x', `${dataX}%`)
        progressRect.setAttribute('y', '0')
        progressRect.setAttribute('width', `${width * (baselineProgress / 100)}%`)
        progressRect.setAttribute('height', `${barHeight.value}px`)
        progressRect.setAttribute('fill', props.baselineColor)
        progressRect.setAttribute('fill-opacity', '0.8')
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
  position: absolute;
  overflow: visible;
  z-index: 40;

  .baseline-bar {
    position: absolute;
    width: 100%;
    z-index: 40;
  }
}
</style>
