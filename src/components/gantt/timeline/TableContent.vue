<template>
  <div
    ref="barContent"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    v-if="tasks"
    class="content"
  >
    <div class="content-inner" :style="{ minHeight: containerHeight + 'px', position: 'relative' }">
      <!-- 竖线基准线 -->
      <div
        v-if="showGuideLine"
        class="column-guide-line"
        :style="{ left: guideLineX + 'px', height: containerHeight + 'px' }"
      ></div>
      <BarRecursionRow
        :key="`${mode}-${scale}-${timelineCellCount}`"
        :rowHeight="rowHeight"
        :tasks="tasks"
      ></BarRecursionRow>
      <!-- 任务连线层 -->
      <TaskLinks
        :containerWidth="containerWidth"
        :containerHeight="containerHeight"
        :linkConfig="linkConfig"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { store } from '../state/Store'
import { useScrollState } from '../state/ShareState'
import { useLinkConfig } from '../composables/LinkConfig'
import BarRecursionRow from './BarRecursionRow.vue'
import TaskLinks from '../links/TaskLinks.vue'

export default defineComponent({
  props: {
    rowHeight: {
      type: Number,
      required: true,
    },
    headers: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    BarRecursionRow,
    TaskLinks,
  },
  setup(props) {
    const barContent = ref<HTMLDivElement | null>(null)
    const { scrollTop, scrollFlag, setScrollTop, setScrollFlag } = useScrollState()
    const { config: linkConfig } = useLinkConfig()

    const tasks = computed(() => store.tasks)
    const timelineCellCount = computed(() => store.timelineCellCount)
    const scale = computed(() => store.scale)
    const mode = computed(() => store.mode)
    const startGanttDate = computed(() => store.startGanttDate)
    const endGanttDate = computed(() => store.endGanttDate)
    const mapFields = computed(() => store.mapFields)

    const containerWidth = computed(() => {
      const baseWidth = timelineCellCount.value * scale.value
      if (barContent.value) {
        const parentContainer = barContent.value.parentElement
        if (parentContainer) {
          const availableWidth = parentContainer.clientWidth
          return Math.max(baseWidth, availableWidth)
        }
      }
      return baseWidth
    })

    const containerHeight = computed(() => {
      return tasks.value.length * props.rowHeight
    })

    let isScrollingFromWatcher = false
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null

    const syncScrollFromWatcher = () => {
      if (barContent.value && scrollFlag.value && scrollTop.value !== undefined) {
        isScrollingFromWatcher = true
        barContent.value.scrollTop = scrollTop.value
        isScrollingFromWatcher = false
      }
    }

    watch(
      () => scrollTop.value,
      () => {
        syncScrollFromWatcher()
      }
    )

    const handleScrollEvent = () => {
      if (!barContent.value || isScrollingFromWatcher) return

      const currentScrollTop = barContent.value.scrollTop
      setScrollFlag(false)
      setScrollTop(currentScrollTop)

      if (scrollEndTimer) {
        clearTimeout(scrollEndTimer)
      }
      scrollEndTimer = setTimeout(() => {
        setScrollFlag(true)
      }, 150)
    }

    onMounted(() => {
      if (barContent.value) {
        barContent.value.addEventListener('scroll', handleScrollEvent, { passive: true })
        barContent.value.scrollTop = scrollTop.value || 0
      }
    })

    onUnmounted(() => {
      if (barContent.value) {
        barContent.value.removeEventListener('scroll', handleScrollEvent)
      }
      if (scrollEndTimer) {
        clearTimeout(scrollEndTimer)
      }
    })

    const getRootNode = () => {
      return tasks.value.filter(obj => obj[mapFields.value['parentId']] === '0')
    }

    const showGuideLine = ref(false)
    const guideLineX = ref(0)

    let mouseMoveRafId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      if (!barContent.value) return

      if (mouseMoveRafId) {
        cancelAnimationFrame(mouseMoveRafId)
      }

      mouseMoveRafId = requestAnimationFrame(() => {
        if (!barContent.value) return
        const rect = barContent.value.getBoundingClientRect()
        const mouseX = e.clientX - rect.left + barContent.value.scrollLeft

        const cellWidth = scale.value
        const columnIndex = Math.floor(mouseX / cellWidth)
        const columnCenterX = columnIndex * cellWidth + cellWidth / 2

        guideLineX.value = columnCenterX
        showGuideLine.value = true
      })
    }

    const handleMouseLeave = () => {
      showGuideLine.value = false
    }

    return {
      barContent,
      scrollFlag,
      tasks,
      timelineCellCount,
      scale,
      mode,
      startGanttDate,
      endGanttDate,
      mapFields,
      getRootNode,
      handleScrollEvent,
      setScrollFlag,
      containerWidth,
      containerHeight,
      linkConfig,
      showGuideLine,
      guideLineX,
      handleMouseMove,
      handleMouseLeave,
    }
  },
})
</script>
<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  margin: 0px 0px -1px 0px;
  font-size: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  /* 性能优化：使用GPU加速和合成层 */
  transform: translateZ(0);
  will-change: scroll-position;
  contain: layout style paint;

  .content-inner {
    width: 100%;
    position: relative;
    /* 避免不必要的布局计算 */
    contain: layout style;
  }
}

/* 竖线基准线 */
.column-guide-line {
  position: absolute;
  top: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--primary, #0078d4) 1%,
    var(--primary, #0078d4) 99%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1000;
  opacity: 0.6;
  box-shadow:
    0 0 8px rgba(0, 120, 212, 0.4),
    0 0 4px rgba(0, 120, 212, 0.6);
  animation: guide-line-fade-in 0.2s ease-out;

  /* 添加上下的圆点装饰 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 6px;
    height: 6px;
    background: var(--primary, #0078d4);
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 6px rgba(0, 120, 212, 0.8);
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
  }
}

@keyframes guide-line-fade-in {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 0.6;
    transform: scaleY(1);
  }
}
</style>
