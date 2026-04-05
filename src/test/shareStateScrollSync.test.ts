// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resetSharedScrollStateForTests,
  useScrollState,
} from '../components/gantt/state/ShareState'

describe('ShareState 垂直滚动镜像同步', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetSharedScrollStateForTests()
  })

  afterEach(() => {
    resetSharedScrollStateForTests()
    vi.useRealTimers()
  })

  it('应该把源容器的 scrollTop 直接镜像到对侧容器', () => {
    const { registerVerticalScrollElement, syncVerticalScrollToPeer } = useScrollState()
    const taskElement = document.createElement('div')
    const timelineElement = document.createElement('div')

    registerVerticalScrollElement('task', taskElement)
    registerVerticalScrollElement('timeline', timelineElement)

    syncVerticalScrollToPeer('task', 240)

    expect(timelineElement.scrollTop).toBe(240)
    expect(taskElement.scrollTop).toBe(0)
  })

  it('应该只消费一次镜像滚动事件，避免双向回声循环', () => {
    const {
      registerVerticalScrollElement,
      syncVerticalScrollToPeer,
      consumeMirroredVerticalScroll,
    } = useScrollState()
    const taskElement = document.createElement('div')
    const timelineElement = document.createElement('div')

    registerVerticalScrollElement('task', taskElement)
    registerVerticalScrollElement('timeline', timelineElement)

    syncVerticalScrollToPeer('timeline', 360)

    expect(consumeMirroredVerticalScroll('task', 360)).toBe(true)
    expect(consumeMirroredVerticalScroll('task', 360)).toBe(false)
  })

  it('如果目标 scroll 事件没有触发，也应该自动清理过期镜像标记', () => {
    const {
      registerVerticalScrollElement,
      syncVerticalScrollToPeer,
      consumeMirroredVerticalScroll,
    } = useScrollState()
    const taskElement = document.createElement('div')
    const timelineElement = document.createElement('div')

    registerVerticalScrollElement('task', taskElement)
    registerVerticalScrollElement('timeline', timelineElement)

    syncVerticalScrollToPeer('task', 180)
    vi.runAllTimers()

    expect(consumeMirroredVerticalScroll('timeline', 180)).toBe(false)
  })
})
