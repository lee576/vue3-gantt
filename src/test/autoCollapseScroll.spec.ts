// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskRecursionRow from '../components/gantt/task/TaskRecursionRow.vue'
import { mutations, store } from '../components/gantt/state/Store'
import { visibleTasks } from '../components/gantt/state/DerivedState'
import { useScrollState } from '../components/gantt/state/ShareState'
import { PerformanceConfig } from '../components/gantt/composables/PerformanceConfig'
import type { GanttMapFields, GanttTask } from '../components/gantt/types/GanttTypes'

const mapFields: GanttMapFields = {
  id: 'id',
  parentId: 'pid',
  task: 'taskNo',
  priority: 'level',
  startdate: 'start_date',
  enddate: 'end_date',
  takestime: 'spend_time',
  progress: 'job_progress',
}

const buildTasks = (groupCount: number): GanttTask[] => {
  const tasks: GanttTask[] = []

  for (let index = 0; index < groupCount; index += 1) {
    const rootId = `root-${index}`
    const childId = `child-${index}`

    tasks.push({
      id: rootId,
      pid: '0',
      taskNo: `Root ${index}`,
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.5,
      no: `${index + 1}`,
      treeLevel: 1,
    } as GanttTask)

    tasks.push({
      id: childId,
      pid: rootId,
      taskNo: `Child ${index}`,
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.25,
      no: `${index + 1}.1`,
      treeLevel: 2,
    } as GanttTask)
  }

  return tasks
}

describe('TaskRecursionRow 自动折叠与滚动稳定性', () => {
  const originalConfig = {
    enableViewportCollapse: PerformanceConfig.ENABLE_VIEWPORT_COLLAPSE,
    viewportCollapseThreshold: PerformanceConfig.VIEWPORT_COLLAPSE_THRESHOLD,
    viewportCollapseBuffer: PerformanceConfig.VIEWPORT_COLLAPSE_BUFFER,
    viewportCollapseDebounceDelay: PerformanceConfig.VIEWPORT_COLLAPSE_DEBOUNCE_DELAY,
    enableVirtualScroll: PerformanceConfig.ENABLE_VIRTUAL_SCROLL,
    virtualScrollThreshold: PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD,
  }

  beforeEach(() => {
    vi.useFakeTimers()

    PerformanceConfig.ENABLE_VIEWPORT_COLLAPSE = false
    PerformanceConfig.VIEWPORT_COLLAPSE_THRESHOLD = 1
    PerformanceConfig.VIEWPORT_COLLAPSE_BUFFER = 0
    PerformanceConfig.VIEWPORT_COLLAPSE_DEBOUNCE_DELAY = 1
    PerformanceConfig.ENABLE_VIRTUAL_SCROLL = true
    PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD = 1

    mutations.setMapFields(mapFields)
    mutations.expandAllTasks()
    mutations.clearAutoCollapsedTasks()
    mutations.setTasks(buildTasks(120))

    const { setScrollTop, setViewportHeight } = useScrollState()
    setViewportHeight(200)
    setScrollTop(0)
  })

  afterEach(() => {
    PerformanceConfig.ENABLE_VIEWPORT_COLLAPSE = originalConfig.enableViewportCollapse
    PerformanceConfig.VIEWPORT_COLLAPSE_THRESHOLD = originalConfig.viewportCollapseThreshold
    PerformanceConfig.VIEWPORT_COLLAPSE_BUFFER = originalConfig.viewportCollapseBuffer
    PerformanceConfig.VIEWPORT_COLLAPSE_DEBOUNCE_DELAY =
      originalConfig.viewportCollapseDebounceDelay
    PerformanceConfig.ENABLE_VIRTUAL_SCROLL = originalConfig.enableVirtualScroll
    PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD = originalConfig.virtualScrollThreshold

    mutations.expandAllTasks()
    mutations.clearAutoCollapsedTasks()
    mutations.setTasks([])
    vi.useRealTimers()
  })

  it('默认关闭视口自动折叠后，滚动不会再改写可见列表和 scrollTop', async () => {
    const initialScrollTop = 40 * 180

    shallowMount(TaskRecursionRow, {
      props: {
        headers: [],
        rowHeight: 40,
        tasks: visibleTasks.value,
      },
      global: {
        stubs: {
          TaskRow: true,
        },
      },
    })

    await nextTick()
    const { setScrollTop } = useScrollState()
    setScrollTop(initialScrollTop)
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    await nextTick()

    const collapsedSizeAfterUpdate = store.autoCollapsedTasks.size
    const { scrollTop } = useScrollState()

    await vi.advanceTimersByTimeAsync(20)
    await nextTick()

    expect(collapsedSizeAfterUpdate).toBe(0)
    expect(store.autoCollapsedTasks.size).toBe(0)
    expect(visibleTasks.value.length).toBe(store.tasks.length)
    expect(scrollTop.value).toBe(initialScrollTop)
  })
})
