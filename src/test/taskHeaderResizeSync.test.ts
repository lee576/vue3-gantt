// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import TaskHeader from '../components/gantt/task/TaskHeader.vue'
import TaskRow from '../components/gantt/task/TaskRow.vue'
import { mutations } from '../components/gantt/state/Store'
import type {
  GanttMapFields,
  GanttTask,
  GanttTaskHeader,
} from '../components/gantt/types/GanttTypes'

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

const headers: GanttTaskHeader[] = [
  { title: '序号', property: 'no', width: 80, show: true },
  { title: '任务名称', property: 'task', width: 160, show: true },
]

const row: GanttTask = {
  id: 1,
  pid: '0',
  no: '1',
  taskNo: '示例任务',
  start_date: '2026-04-01 00:00:00',
  end_date: '2026-04-02 00:00:00',
  spend_time: '1天',
  job_progress: 0.5,
  treeLevel: 1,
}

describe('TaskHeader 列宽拖拽预览', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    mutations.setMapFields(mapFields)
    mutations.expandAllTasks()
    mutations.clearAutoCollapsedTasks()
    mutations.setTasks([row])
  })

  afterEach(() => {
    mutations.setTasks([])
    vi.unstubAllGlobals()
  })

  it('拖拽过程中应该同步更新表头和内容列宽', async () => {
    const Harness = defineComponent({
      components: {
        TaskHeader,
        TaskRow,
      },
      setup() {
        const localHeaders = ref(headers.map(header => ({ ...header })))

        const syncWidth = ({ index, width }: { index: number; width: number }) => {
          localHeaders.value = localHeaders.value.map((header, headerIndex) =>
            headerIndex === index ? { ...header, width } : header
          )
        }

        return {
          localHeaders,
          row,
          syncWidth,
        }
      },
      template: `
        <div>
          <TaskHeader
            :headers="localHeaders"
            @preview:headerWidth="syncWidth"
            @update:headerWidth="syncWidth"
          />
          <TaskRow :headers="localHeaders" :row="row" :row-height="40" />
        </div>
      `,
    })

    const wrapper = mount(Harness, {
      attachTo: document.body,
    })

    const resizeHandle = wrapper.find('.resize-handle')
    expect(resizeHandle.exists()).toBe(true)

    await resizeHandle.trigger('mousedown', {
      clientX: 100,
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    })

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, bubbles: true }))
    await nextTick()

    const headerCell = wrapper.find('.headerCaption[columnindex="0"]')
    const bodyCell = wrapper.find('.cellNo[columnindex="0"]')

    expect(headerCell.attributes('style')).toContain('width: var(--gantt-column-width-0, 120px);')
    expect(bodyCell.attributes('style')).toContain(
      'min-width: var(--gantt-column-width-0, 120px);'
    )
    expect(bodyCell.attributes('style')).toContain(
      'max-width: var(--gantt-column-width-0, 120px);'
    )

    wrapper.unmount()
  })

  it('鼠标移动时应该发出预览宽度事件，供父组件同步上下区域', async () => {
    const wrapper = mount(TaskHeader, {
      props: {
        headers: headers.map(header => ({ ...header })),
      },
    })

    const resizeHandle = wrapper.find('.resize-handle')

    await resizeHandle.trigger('mousedown', {
      clientX: 100,
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    })

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('preview:headerWidth')).toEqual([[{ index: 0, width: 120 }]])

    wrapper.unmount()
  })
})
