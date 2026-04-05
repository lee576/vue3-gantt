<template>
  <div
    ref="barContent"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    v-if="tasks"
    class="content"
    :class="['content-base']"
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
        :bar-class-name="barClassName"
        :progress-handle-class-name="progressHandleClassName"
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
import { visibleTasks } from '../state/DerivedState'

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
    barClassName: {
      type: String,
      default: '',
    },
    progressHandleClassName: {
      type: String,
      default: '',
    },
  },
  components: {
    BarRecursionRow,
    TaskLinks,
  },
  setup(props) {
    const barContent = ref<HTMLDivElement | null>(null)
    const {
      scrollTop,
      setScrollTop,
      setViewportHeight,
      markVerticalScrolling,
      registerVerticalScrollElement,
      unregisterVerticalScrollElement,
      syncVerticalScrollToPeer,
      consumeMirroredVerticalScroll,
    } = useScrollState()
    const { config: linkConfig } = useLinkConfig()

    // 时间线和左侧任务表共享同一份可见任务列表。
    // 这样条形、里程碑、连线层都天然对齐左侧渲染顺序，不需要再各自过滤折叠节点。
    const tasks = computed(() => visibleTasks.value)
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

    const syncScrollFromWatcher = () => {
      if (barContent.value && scrollTop.value !== undefined) {
        barContent.value.scrollTop = scrollTop.value
        setViewportHeight(barContent.value.clientHeight)
      }
    }

    watch(
      () => scrollTop.value,
      () => {
        syncScrollFromWatcher()
      },
      {
        // 自动折叠或程序性定位改写共享 scrollTop 时，时间线需要立即对齐。
        flush: 'sync',
      }
    )

    let rafId: number | null = null

    const handleScrollEvent = () => {
      if (!barContent.value) return

      const currentScrollTop = barContent.value.scrollTop

      // 如果这次 scroll 是左侧表格镜像过来的，就直接消费掉，
      // 避免再次写回共享状态，把一次用户滚动放大成双向联动循环。
      if (consumeMirroredVerticalScroll('timeline', currentScrollTop)) {
        return
      }

      // 先同帧把左侧表格的 DOM 滚动位置对齐，保证拖动滚动条时两边肉眼同步。
      // 共享状态的更新继续放在 rAF 里，避免滚动期间把派生计算推到每一个原生事件上。
      syncVerticalScrollToPeer('timeline', currentScrollTop)

      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        if (barContent.value) {
          // 滚动位置和视口高度在同一帧里一起提交。
          // 这样共享虚拟窗口会基于同一时刻的输入计算，避免“位置是新的，高度还是旧的”抖动。
          setScrollTop(barContent.value.scrollTop)
          setViewportHeight(barContent.value.clientHeight)
          markVerticalScrolling()
        }
        rafId = null
      })
    }

    let resizeObserver: ResizeObserver | null = null

    onMounted(() => {
      if (barContent.value) {
        registerVerticalScrollElement('timeline', barContent.value)
        barContent.value.addEventListener('scroll', handleScrollEvent, { passive: true })
        barContent.value.scrollTop = scrollTop.value || 0
        setViewportHeight(barContent.value.clientHeight)
        resizeObserver = new ResizeObserver(() => {
          if (barContent.value) {
            // 右侧区域宽高变化时，同步刷新共享视口高度。
            // 左右任一面板先感知到尺寸变化，都足以驱动共享虚拟窗口更新。
            setViewportHeight(barContent.value.clientHeight)
          }
        })
        resizeObserver.observe(barContent.value)
      }
    })

    onUnmounted(() => {
      if (barContent.value) {
        barContent.value.removeEventListener('scroll', handleScrollEvent)
      }
      unregisterVerticalScrollElement('timeline')
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      resizeObserver?.disconnect()
    })

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
      tasks,
      timelineCellCount,
      scale,
      mode,
      startGanttDate,
      endGanttDate,
      mapFields,
      handleScrollEvent,
      containerWidth,
      containerHeight,
      linkConfig,
      showGuideLine,
      guideLineX,
      handleMouseMove,
      handleMouseLeave,
      barClassName: props.barClassName,
      progressHandleClassName: props.progressHandleClassName,
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
