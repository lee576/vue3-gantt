// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import Gantt from '../components/gantt/core/Gantt.vue'
import TaskRow from '../components/gantt/task/TaskRow.vue'
import { Symbols } from '../components/gantt/state/Symbols'
import { mutations } from '../components/gantt/state/Store'
import type {
  DataConfig,
  EventConfig,
  StyleConfig,
} from '../components/gantt/types/Types'
import type { GanttMapFields, GanttTask, GanttTaskHeader } from '../components/gantt/types/GanttTypes'

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

const dataConfig: DataConfig = {
  queryStartDate: '2026-04-01',
  queryEndDate: '2026-04-30',
  dataSource: [],
  taskHeaders: [],
  mapFields,
  dependencies: [],
}

const eventConfig: EventConfig = {
  addRootTask: () => undefined,
  addSubTask: () => undefined,
  removeTask: () => undefined,
  editTask: () => undefined,
  queryTask: () => undefined,
  barDate: () => undefined,
  allowChangeTaskDate: () => undefined,
}

describe('Gantt StyleConfig', () => {
  beforeEach(() => {
    mutations.setMapFields(mapFields)
  })

  afterEach(() => {
    mutations.expandAllTasks()
    mutations.clearAutoCollapsedTasks()
    mutations.setTasks([])
  })

  it('应该把任务表正文文本颜色写入根容器 CSS 变量', () => {
    const styleConfig: StyleConfig = {
      headersHeight: 100,
      rowHeight: 60,
      setBarColor: () => '#0078d4',
      taskContentTextColor: '#123456',
    }

    const wrapper = shallowMount(Gantt, {
      props: {
        styleConfig,
        dataConfig,
        eventConfig,
      },
      global: {
        stubs: {
          DatePicker: true,
          SplitPane: true,
          TaskTable: true,
          RightTable: true,
          GanttConfigPanel: true,
          Teleport: true,
        },
      },
    })

    expect(wrapper.attributes('style')).toContain('--text-content: #123456;')
  })

  it('应该支持按列和单元格值动态设置正文文本颜色', () => {
    const headers: GanttTaskHeader[] = [
      { title: '任务名称', property: 'task', width: 180, show: true },
      { title: '优先级', property: 'priority', width: 100, show: true },
    ]

    const row: GanttTask = {
      id: '1',
      pid: '0',
      taskNo: '需求分析',
      level: '紧急',
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.5,
      no: '1',
      treeLevel: 1,
    }

    mutations.setTasks([row])

    const wrapper = mount(TaskRow, {
      props: {
        headers,
        row,
        rowHeight: 40,
      },
      global: {
        provide: {
          [Symbols.SetTaskContentTextColorSymbol]: (
            currentRow: GanttTask,
            header: GanttTaskHeader,
            value: unknown
          ) => {
            if (currentRow.id === '1' && header.property === 'priority' && value === '紧急') {
              return '#dc2626'
            }
            return undefined
          },
        },
      },
    })

    const taskCell = wrapper.find('.cell[columnindex="0"]')
    const priorityCell = wrapper.find('.cell[columnindex="1"]')

    expect(taskCell.attributes('style')).not.toContain('color: rgb(220, 38, 38);')
    expect(priorityCell.attributes('style')).toContain('color: rgb(220, 38, 38);')
  })
})
