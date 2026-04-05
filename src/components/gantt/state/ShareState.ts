import { reactive, shallowRef } from 'vue'

const sharedState = reactive({
  shouldScrollToToday: false,
  triggerScrollToToday() {
    this.shouldScrollToToday = true
  },

  shouldScroll: false,
  triggerScroll() {
    this.shouldScroll = true
  },

  highlightedId: <number | null>null,
  triggerHighlight(id: number | null) {
    this.highlightedId = id
  },
})
export default sharedState

const scrollTop = shallowRef(0)
type VerticalScrollContainer = 'task' | 'timeline'

// 左右面板共享同一份视口高度。
// 共享虚拟滚动窗口时，谁先拿到真实容器高度都可以把结果写进来，
// 这样任务列表和时间线就不会各自基于不同高度算出不同的可见区间。
const viewportHeight = shallowRef(0)
const isVerticalScrolling = shallowRef(false)
const taskScrollElement = shallowRef<HTMLElement | null>(null)
const timelineScrollElement = shallowRef<HTMLElement | null>(null)
let verticalScrollTimer: ReturnType<typeof setTimeout> | null = null
let mirroredScroll:
  | {
      target: VerticalScrollContainer
      value: number
    }
  | null = null
let mirroredScrollResetTimer: ReturnType<typeof setTimeout> | null = null

const setScrollTop = (value: number) => {
  if (scrollTop.value !== value) {
    scrollTop.value = value
  }
}

const setViewportHeight = (value: number) => {
  // 滚动、窗口 resize、左右面板布局切换时会频繁触发。
  // 只有高度真的变化时才写回，避免把虚拟窗口计算链条无意义地全部唤醒。
  if (viewportHeight.value !== value) {
    viewportHeight.value = value
  }
}

const markVerticalScrolling = (idleDelay = 120) => {
  // 把“最近正在滚动”收敛成一份共享状态。
  // 时间线条形、里程碑、连线层都基于它决定是否进入轻量渲染模式，
  // 避免每个组件自己单独猜测当前是不是还在拖滚动条。
  if (!isVerticalScrolling.value) {
    isVerticalScrolling.value = true
  }

  if (verticalScrollTimer) {
    clearTimeout(verticalScrollTimer)
  }

  verticalScrollTimer = setTimeout(() => {
    isVerticalScrolling.value = false
    verticalScrollTimer = null
  }, idleDelay)
}

const registerVerticalScrollElement = (
  container: VerticalScrollContainer,
  element: HTMLElement | null
) => {
  if (container === 'task') {
    taskScrollElement.value = element
    return
  }

  timelineScrollElement.value = element
}

const unregisterVerticalScrollElement = (container: VerticalScrollContainer) => {
  registerVerticalScrollElement(container, null)
}

const scheduleMirroredScrollReset = () => {
  if (mirroredScrollResetTimer) {
    clearTimeout(mirroredScrollResetTimer)
  }

  // 某些浏览器里，脚本改写 scrollTop 不一定总会触发目标元素的 scroll 事件。
  // 因此这里在下一轮事件循环兜底清空“镜像滚动”标记，避免旧标记误吞掉后续真实用户滚动。
  mirroredScrollResetTimer = setTimeout(() => {
    mirroredScroll = null
    mirroredScrollResetTimer = null
  }, 0)
}

const syncVerticalScrollToPeer = (source: VerticalScrollContainer, value: number) => {
  const targetElement =
    source === 'task' ? timelineScrollElement.value : taskScrollElement.value

  if (!targetElement || Math.abs(targetElement.scrollTop - value) < 1) {
    return
  }

  mirroredScroll = {
    target: source === 'task' ? 'timeline' : 'task',
    value,
  }

  targetElement.scrollTop = value
  scheduleMirroredScrollReset()
}

const consumeMirroredVerticalScroll = (
  container: VerticalScrollContainer,
  value: number
): boolean => {
  if (!mirroredScroll || mirroredScroll.target !== container) {
    return false
  }

  if (Math.abs(mirroredScroll.value - value) >= 1) {
    return false
  }

  mirroredScroll = null

  if (mirroredScrollResetTimer) {
    clearTimeout(mirroredScrollResetTimer)
    mirroredScrollResetTimer = null
  }

  return true
}

export const resetSharedScrollStateForTests = () => {
  scrollTop.value = 0
  viewportHeight.value = 0
  isVerticalScrolling.value = false
  taskScrollElement.value = null
  timelineScrollElement.value = null
  mirroredScroll = null

  if (verticalScrollTimer) {
    clearTimeout(verticalScrollTimer)
    verticalScrollTimer = null
  }

  if (mirroredScrollResetTimer) {
    clearTimeout(mirroredScrollResetTimer)
    mirroredScrollResetTimer = null
  }
}

export const useScrollState = () => {
  return {
    scrollTop,
    viewportHeight,
    isVerticalScrolling,
    setScrollTop,
    setViewportHeight,
    markVerticalScrolling,
    registerVerticalScrollElement,
    unregisterVerticalScrollElement,
    syncVerticalScrollToPeer,
    consumeMirroredVerticalScroll,
  }
}
