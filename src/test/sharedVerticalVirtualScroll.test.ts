import { computed, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  resetSharedVerticalVirtualScrollForTests,
  useSharedVerticalVirtualScroll,
} from '../components/gantt/composables/useSharedVerticalVirtualScroll'
import {
  resetSharedScrollStateForTests,
  useScrollState,
} from '../components/gantt/state/ShareState'
import { PerformanceConfig } from '../components/gantt/composables/PerformanceConfig'

describe('useSharedVerticalVirtualScroll 共享窗口', () => {
  const originalVirtualScroll = PerformanceConfig.ENABLE_VIRTUAL_SCROLL
  const originalThreshold = PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD

  beforeEach(() => {
    PerformanceConfig.ENABLE_VIRTUAL_SCROLL = true
    PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD = 1
    resetSharedScrollStateForTests()
    resetSharedVerticalVirtualScrollForTests()
  })

  afterEach(() => {
    PerformanceConfig.ENABLE_VIRTUAL_SCROLL = originalVirtualScroll
    PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD = originalThreshold
    resetSharedVerticalVirtualScrollForTests()
    resetSharedScrollStateForTests()
  })

  it('左右两次调用应该复用同一份窗口索引和可见切片', () => {
    const items = ref(Array.from({ length: 200 }, (_, index) => ({ id: index })))
    const rowHeight = computed(() => 40)
    const { setScrollTop, setViewportHeight } = useScrollState()

    setViewportHeight(160)
    setScrollTop(320)

    const left = useSharedVerticalVirtualScroll(items, rowHeight)
    const right = useSharedVerticalVirtualScroll(items, rowHeight)

    expect(left.startIndex).toBe(right.startIndex)
    expect(left.endIndex).toBe(right.endIndex)
    expect(left.visibleItems.value).toBe(right.visibleItems.value)
    expect(left.visibleItems.value.length).toBeGreaterThan(0)
    expect(left.visibleItems.value[0]?.index).toBe(right.visibleItems.value[0]?.index)
  })
})
