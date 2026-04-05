<template>
  <div ref="taskContent" class="content" @scroll="scroll()" @mouseover="mouseover()">
    <div class="content-inner" :style="{ minHeight: contentHeight + 'px' }">
      <TaskRecursionRow :headers="headers" :rowHeight="rowHeight" :tasks="tasks" :content-class-name="contentClassName" :bar-row-class-name="barRowClassName"></TaskRecursionRow>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useScrollState } from '../state/ShareState'
import TaskRecursionRow from './TaskRecursionRow.vue'
import { throttle } from '../composables/PerformanceConfig'
import { visibleTasks } from '../state/DerivedState'

export default defineComponent({
  props: {
    headers: {
      type: Array as () => any[],
      default: () => [],
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
    contentClassName: {
      type: String,
      default: '',
    },
    barRowClassName: {
      type: String,
      default: '',
    },
  },
  components: {
    TaskRecursionRow,
  },
  setup(props) {
    // 左侧任务表不再自己维护一份“根节点 + 递归可见树”。
    // 这里直接消费共享派生结果，确保左右两边看到的是同一份可见任务切片。
    const tasks = computed(() => visibleTasks.value)
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
    const taskContent = ref<HTMLDivElement | null>(null)

    const contentHeight = computed(() => {
      return tasks.value.length * props.rowHeight
    })

    watch(
      scrollTop,
      newValue => {
        if (taskContent.value && taskContent.value.scrollTop !== newValue) {
          taskContent.value.scrollTop = newValue
        }
      },
      {
        // 共享 scrollTop 被程序性改写时，左侧表格要尽快跟上。
        // 例如自动折叠修正锚点后，如果这里再等到默认 flush 时机，就容易出现短暂错位。
        flush: 'sync',
      }
    )

    let rafId: number | null = null

    const handleScroll = () => {
      if (!taskContent.value) return

      const currentScrollTop = taskContent.value.scrollTop

      // 如果这次 scroll 是右侧时间线镜像过来的，就不要再反向写回，
      // 否则左右两个容器会在高频滚动时相互“回声”触发，出现细微滞后。
      if (consumeMirroredVerticalScroll('task', currentScrollTop)) {
        return
      }

      // 先直接驱动右侧 DOM 滚动，保证用户当前这一帧看到的是对齐的。
      // 共享状态仍然会在下面的 rAF 中更新，用来驱动虚拟列表和连线等派生计算。
      syncVerticalScrollToPeer('task', currentScrollTop)

      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        if (taskContent.value) {
          setScrollTop(taskContent.value.scrollTop)
          markVerticalScrolling()
        }
        rafId = null
      })
    }

    const mouseover = () => {
      // 鼠标悬停时不改变滚动标志，让滚动事件处理
    }

    let resizeObserver: ResizeObserver | null = null

    const syncViewportHeight = () => {
      // 共享虚拟窗口需要的是“真实可滚动视口高度”，而不是内容总高度。
      // 任务区先把自己的 clientHeight 写入共享状态，右侧时间线就能复用同一窗口计算结果。
      if (taskContent.value) {
        setViewportHeight(taskContent.value.clientHeight)
      }
    }

    // 动态同步滚动区域高度
    const syncScrollHeight = () => {
      if (taskContent.value) {
        // 查找右侧的滚动容器
        const rightContent = document.querySelector('.table .content') as HTMLElement
        if (rightContent) {
          // 检测右侧是否有水平滚动条
          const hasHorizontalScrollbar = rightContent.scrollWidth > rightContent.clientWidth

          // 动态调整左侧的padding-bottom
          if (hasHorizontalScrollbar) {
            // 如果右侧有水平滚动条，给左侧添加相应的padding
            taskContent.value.style.paddingBottom = '20px'
          } else {
            // 如果右侧没有水平滚动条，移除左侧的padding
            taskContent.value.style.paddingBottom = '0px'
          }
        }
      }
    }

    // 监听任务变化，重新同步高度
    watch(tasks, () => {
      // 可见任务数量变化后，虚拟窗口和左右面板底部补偿都可能失效，
      // 因此这里同时刷新视口高度和滚动条占位。
      syncViewportHeight()
      setTimeout(syncScrollHeight, 50)
    })

    // 监听窗口大小变化，重新同步高度（使用 throttle 优化）
    const handleResize = throttle(() => {
      setTimeout(syncScrollHeight, 50)
    })

    onMounted(() => {
      if (taskContent.value) {
        registerVerticalScrollElement('task', taskContent.value)
        // 监听滚动位置的变化
        taskContent.value.scrollTop = scrollTop.value
        syncViewportHeight()

        // 延迟同步高度，确保DOM已渲染完成
        setTimeout(syncScrollHeight, 100)

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize)

        resizeObserver = new ResizeObserver(() => {
          // 这里不直接关心内容高度，只关心当前滚动视口是否变窄/变高，
          // 让共享虚拟窗口在 split pane 拉伸时也能保持两侧同步。
          syncViewportHeight()
        })
        resizeObserver.observe(taskContent.value)
      }
    })

    onUnmounted(() => {
      unregisterVerticalScrollElement('task')
      window.removeEventListener('resize', handleResize)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      resizeObserver?.disconnect()
    })

    return {
      tasks,
      taskContent,
      scroll: handleScroll,
      mouseover,
      contentHeight,
    }
  },
})
</script>

<style lang="scss" scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;

  /* 性能优化：使用GPU加速 */
  transform: translateZ(0);
  will-change: scroll-position;

  /* 使用硬件加速的合成层 */
  contain: layout style paint;

  .content-inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* 避免不必要的布局计算 */
    contain: layout style;
  }

  .moveToBar {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
  }

  .expandBar {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
