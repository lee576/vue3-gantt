import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useVirtualScroll, shouldEnableVirtualScroll } from '../components/gantt/composables/useVirtualScroll'
import { PerformanceConfig } from '../components/gantt/composables/PerformanceConfig'

describe('虚拟滚动功能', () => {
  describe('useVirtualScroll', () => {
    let containerRef: any
    let itemHeight: number
    let totalItems: any

    beforeEach(() => {
      containerRef = ref(null)
      itemHeight = 40
      totalItems = ref(100)
    })

    it('应该正确初始化虚拟滚动状态', () => {
      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      expect(result.startIndex.value).toBe(0)
      expect(result.endIndex.value).toBe(0)
      expect(result.totalHeight.value).toBe(4000)
      expect(result.offsetY.value).toBe(0)
    })

    it('应该正确计算总高度', () => {
      totalItems.value = 50
      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      expect(result.totalHeight.value).toBe(2000)
    })

    it('应该在容器挂载后更新可见范围', () => {
      const mockContainer = {
        scrollTop: 0,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      expect(result.startIndex.value).toBeGreaterThanOrEqual(0)
      expect(result.endIndex.value).toBeGreaterThanOrEqual(result.startIndex.value)
    })

    it('应该根据滚动位置更新可见项', () => {
      const mockContainer = {
        scrollTop: 800,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      expect(result.startIndex.value).toBeGreaterThanOrEqual(0)
      expect(result.offsetY.value).toBeGreaterThanOrEqual(0)
    })

    it('应该正确计算可见项的偏移量', () => {
      const mockContainer = {
        scrollTop: 0,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      const visibleItems = result.visibleItems.value
      if (visibleItems.length > 0) {
        expect(visibleItems[0].offset).toBe(0)
      }
    })

    it('应该使用默认缓冲区', () => {
      const mockContainer = {
        scrollTop: 0,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      const visibleCount = result.endIndex.value - result.startIndex.value + 1
      const expectedVisibleCount = Math.ceil(400 / itemHeight) + PerformanceConfig.VIRTUAL_SCROLL_BUFFER * 2
      expect(visibleCount).toBeLessThanOrEqual(expectedVisibleCount)
    })

    it('应该支持自定义缓冲区', () => {
      const mockContainer = {
        scrollTop: 0,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const customBuffer = 5
      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
        buffer: customBuffer,
      })

      result.onScroll()

      const visibleCount = result.endIndex.value - result.startIndex.value + 1
      const expectedVisibleCount = Math.ceil(400 / itemHeight) + customBuffer * 2
      expect(visibleCount).toBeLessThanOrEqual(expectedVisibleCount)
    })

    it('应该在滚动到底部时正确处理边界', () => {
      const mockContainer = {
        scrollTop: 3600,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      expect(result.endIndex.value).toBeLessThan(totalItems.value)
    })

    it('应该在总项数变化时更新可见范围', () => {
      const mockContainer = {
        scrollTop: 0,
        clientHeight: 400,
      }
      containerRef.value = mockContainer

      const result = useVirtualScroll({
        containerRef,
        itemHeight,
        totalItems,
      })

      result.onScroll()

      const initialEndIndex = result.endIndex.value

      totalItems.value = 200

      expect(result.totalHeight.value).toBe(8000)
    })
  })

  describe('shouldEnableVirtualScroll', () => {
    it('应该在任务数量达到阈值时启用虚拟滚动', () => {
      const taskCount = PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD
      expect(shouldEnableVirtualScroll(taskCount)).toBe(true)
    })

    it('应该在任务数量超过阈值时启用虚拟滚动', () => {
      const taskCount = PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD + 100
      expect(shouldEnableVirtualScroll(taskCount)).toBe(true)
    })

    it('应该在任务数量低于阈值时禁用虚拟滚动', () => {
      const taskCount = PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD - 1
      expect(shouldEnableVirtualScroll(taskCount)).toBe(false)
    })

    it('应该在虚拟滚动功能被禁用时返回 false', () => {
      const originalEnableVirtualScroll = PerformanceConfig.ENABLE_VIRTUAL_SCROLL
      PerformanceConfig.ENABLE_VIRTUAL_SCROLL = false

      const taskCount = PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD + 100
      expect(shouldEnableVirtualScroll(taskCount)).toBe(false)

      PerformanceConfig.ENABLE_VIRTUAL_SCROLL = originalEnableVirtualScroll
    })

    it('应该在任务数量为 0 时禁用虚拟滚动', () => {
      expect(shouldEnableVirtualScroll(0)).toBe(false)
    })
  })
})
