// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import Gantt from '../components/gantt/core/Gantt.vue'
import TaskHeader from '../components/gantt/task/TaskHeader.vue'
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
      taskHeaderCellStyle: {
        fontSize: '13px',
      },
      taskHeaderTextColor: '#654321',
      taskHeaderBackgroundColor: '#f5f5f5',
      taskContentCellStyle: {
        fontWeight: 500,
      },
      taskContentTextColor: '#123456',
      taskContentBackgroundColor: '#fafafa',
      taskRowHoverBackgroundColor: '#e0f2fe',
      taskRowHoverTextColor: '#0f172a',
      taskTreeLineColor: '#94a3b8',
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

    expect(wrapper.attributes('style')).toContain('--task-header-text-color: #654321;')
    expect(wrapper.attributes('style')).toContain('--task-header-background-color: #f5f5f5;')
    expect(wrapper.attributes('style')).toContain('--text-content: #123456;')
    expect(wrapper.attributes('style')).toContain('--task-content-background-color: #fafafa;')
    expect(wrapper.attributes('style')).toContain('--task-row-hover-background-color: #e0f2fe;')
    expect(wrapper.attributes('style')).toContain('--task-row-hover-text-color: #0f172a;')
    expect(wrapper.attributes('style')).toContain('--task-tree-line-color: #94a3b8;')
  })

  it('应该支持表头单元格的通用和动态样式配置', () => {
    const headers: GanttTaskHeader[] = [
      { title: '任务名称', property: 'task', width: 180, show: true },
      { title: '优先级', property: 'priority', width: 100, show: true },
    ]

    const wrapper = mount(TaskHeader, {
      props: {
        headers,
      },
      global: {
        provide: {
          [Symbols.TaskHeaderCellStyleSymbol]: {
            fontSize: '13px',
            fontWeight: 600,
          },
          [Symbols.SetTaskHeaderCellStyleSymbol]: (header: GanttTaskHeader) => {
            if (header.property === 'task') {
              return {
                textAlign: 'left',
              }
            }
            return undefined
          },
        },
      },
    })

    const taskHeaderCell = wrapper.find('.headerCaption[columnindex="0"]')
    const priorityHeaderCell = wrapper.find('.headerCaption[columnindex="1"]')

    expect(taskHeaderCell.attributes('style')).toContain('font-size: 13px;')
    expect(taskHeaderCell.attributes('style')).toContain('font-weight: 600;')
    expect(taskHeaderCell.attributes('style')).toContain('text-align: left;')
    expect(priorityHeaderCell.attributes('style')).toContain('font-size: 13px;')
    expect(priorityHeaderCell.attributes('style')).toContain('font-weight: 600;')
    expect(priorityHeaderCell.attributes('style')).not.toContain('text-align: left;')
  })

  it('应该支持按列动态设置表头文本颜色', () => {
    const headers: GanttTaskHeader[] = [
      { title: '任务名称', property: 'task', width: 180, show: true },
      { title: '优先级', property: 'priority', width: 100, show: true },
    ]

    const wrapper = mount(TaskHeader, {
      props: {
        headers,
      },
      global: {
        provide: {
          [Symbols.SetTaskHeaderTextColorSymbol]: (header: GanttTaskHeader) => {
            if (header.property === 'priority') {
              return '#7c3aed'
            }
            return undefined
          },
        },
      },
    })

    const taskHeaderCell = wrapper.find('.headerCaption[columnindex="0"]')
    const priorityHeaderCell = wrapper.find('.headerCaption[columnindex="1"]')

    expect(taskHeaderCell.attributes('style')).not.toContain('color: rgb(124, 58, 237);')
    expect(priorityHeaderCell.attributes('style')).toContain('color: rgb(124, 58, 237);')
  })

  it('应该支持按列动态设置表头背景色', () => {
    const headers: GanttTaskHeader[] = [
      { title: '任务名称', property: 'task', width: 180, show: true },
      { title: '优先级', property: 'priority', width: 100, show: true },
    ]

    const wrapper = mount(TaskHeader, {
      props: {
        headers,
      },
      global: {
        provide: {
          [Symbols.SetTaskHeaderBackgroundColorSymbol]: (header: GanttTaskHeader) => {
            if (header.property === 'priority') {
              return '#f3e8ff'
            }
            return undefined
          },
        },
      },
    })

    const taskHeaderCell = wrapper.find('.headerCaption[columnindex="0"]')
    const priorityHeaderCell = wrapper.find('.headerCaption[columnindex="1"]')

    expect(taskHeaderCell.attributes('style')).not.toContain(
      'background-color: rgb(243, 232, 255);'
    )
    expect(priorityHeaderCell.attributes('style')).toContain(
      'background-color: rgb(243, 232, 255);'
    )
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

  it('应该支持正文单元格的通用和动态样式配置', () => {
    const headers: GanttTaskHeader[] = [
      { title: '任务名称', property: 'task', width: 180, show: true },
      { title: '优先级', property: 'priority', width: 100, show: true },
      { title: '耗时', property: 'takestime', width: 100, show: true },
    ]

    const row: GanttTask = {
      id: '1',
      pid: '0',
      taskNo: '需求分析',
      level: '紧急',
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '12天',
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
          [Symbols.TaskContentCellStyleSymbol]: {
            fontSize: '12px',
            fontWeight: 500,
          },
          [Symbols.SetTaskContentCellStyleSymbol]: (
            _currentRow: GanttTask,
            header: GanttTaskHeader,
            value: unknown
          ) => {
            if (header.property === 'priority') {
              return {
                textAlign: 'center',
                fontWeight: 600,
              }
            }

            if (header.property === 'takestime' && value === '12天') {
              return {
                fontWeight: 700,
              }
            }

            return undefined
          },
        },
      },
    })

    const taskCell = wrapper.find('.cell[columnindex="0"]')
    const priorityCell = wrapper.find('.cell[columnindex="1"]')
    const durationCell = wrapper.find('.cell[columnindex="2"]')

    expect(taskCell.attributes('style')).toContain('font-size: 12px;')
    expect(taskCell.attributes('style')).toContain('font-weight: 500;')
    expect(priorityCell.attributes('style')).toContain('font-size: 12px;')
    expect(priorityCell.attributes('style')).toContain('font-weight: 600;')
    expect(priorityCell.attributes('style')).toContain('text-align: center;')
    expect(durationCell.attributes('style')).toContain('font-weight: 700;')
  })

  it('应该支持自定义树缩进距离', () => {
    const headers: GanttTaskHeader[] = [
      { title: '序号', property: 'no', width: 160, show: true },
    ]

    const row: GanttTask = {
      id: '1.1',
      pid: '1',
      taskNo: '子任务',
      level: '一般',
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.5,
      no: '1.1',
      treeLevel: 2,
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
          [Symbols.TaskTreeIndentSizeSymbol]: 20,
        },
      },
    })

    const leftSection = wrapper.find('.no-left-section')

    expect(leftSection.attributes('style')).toContain('padding-left: 40px;')
  })

  it('应该支持按列和单元格值动态设置正文背景色', () => {
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
          [Symbols.SetTaskContentBackgroundColorSymbol]: (
            currentRow: GanttTask,
            header: GanttTaskHeader,
            value: unknown
          ) => {
            if (currentRow.id === '1' && header.property === 'priority' && value === '紧急') {
              return '#fef2f2'
            }
            return undefined
          },
        },
      },
    })

    const taskCell = wrapper.find('.cell[columnindex="0"]')
    const priorityCell = wrapper.find('.cell[columnindex="1"]')

    expect(taskCell.attributes('style')).not.toContain(
      'background-color: rgb(254, 242, 242);'
    )
    expect(priorityCell.attributes('style')).toContain(
      'background-color: rgb(254, 242, 242);'
    )
  })

  it('应该支持折叠按钮的通用和动态样式配置', () => {
    const headers: GanttTaskHeader[] = [
      { title: '序号', property: 'no', width: 160, show: true },
    ]

    const parentRow: GanttTask = {
      id: '1',
      pid: '0',
      taskNo: '父任务',
      level: '紧急',
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.5,
      no: '1',
      treeLevel: 1,
    }

    const childRow: GanttTask = {
      id: '1.1',
      pid: '1',
      taskNo: '子任务',
      level: '一般',
      start_date: '2026-04-02 00:00:00',
      end_date: '2026-04-03 00:00:00',
      spend_time: '1天',
      job_progress: 0.2,
      no: '1.1',
      treeLevel: 2,
    }

    mutations.setTasks([parentRow, childRow])

    const rowWrapper = mount(TaskRow, {
      props: {
        headers,
        row: parentRow,
        rowHeight: 40,
      },
      global: {
        provide: {
          [Symbols.TaskCollapseButtonStyleSymbol]: {
            backgroundColor: '#e2e8f0',
            '--task-collapse-button-hover-background': '#cbd5e1',
          },
          [Symbols.SetTaskCollapseButtonStyleSymbol]: (context: {
            collapsed: boolean
            row?: GanttTask
            scope: 'header' | 'row'
          }) => {
            if (context.scope === 'row' && context.row?.id === '1') {
              return {
                color: '#1d4ed8',
              }
            }
            return undefined
          },
        },
      },
    })

    const headerWrapper = mount(TaskHeader, {
      props: {
        headers,
      },
      global: {
        provide: {
          [Symbols.TaskCollapseButtonStyleSymbol]: {
            backgroundColor: '#e2e8f0',
          },
          [Symbols.SetTaskCollapseButtonStyleSymbol]: (context: {
            collapsed: boolean
            row?: GanttTask
            scope: 'header' | 'row'
          }) => {
            if (context.scope === 'header') {
              return {
                color: '#7c3aed',
              }
            }
            return undefined
          },
        },
      },
    })

    const rowCollapseButton = rowWrapper.find('.collapse-btn[data-scope="row"]')
    const headerCollapseButton = headerWrapper.find('.collapse-btn[data-scope="header"]')

    expect(rowCollapseButton.attributes('style')).toContain(
      'background-color: rgb(226, 232, 240);'
    )
    expect(rowCollapseButton.attributes('style')).toContain('color: rgb(29, 78, 216);')
    expect(rowCollapseButton.attributes('style')).toContain(
      '--task-collapse-button-hover-background: #cbd5e1;'
    )
    expect(headerCollapseButton.attributes('style')).toContain(
      'background-color: rgb(226, 232, 240);'
    )
    expect(headerCollapseButton.attributes('style')).toContain('color: rgb(124, 58, 237);')
  })

  it('应该支持操作按钮的通用和动态样式配置', () => {
    const headers: GanttTaskHeader[] = [
      { title: '序号', property: 'no', width: 160, show: true },
    ]

    const parentRow: GanttTask = {
      id: '1',
      pid: '0',
      taskNo: '父任务',
      level: '紧急',
      start_date: '2026-04-01 00:00:00',
      end_date: '2026-04-02 00:00:00',
      spend_time: '2天',
      job_progress: 0.5,
      no: '1',
      treeLevel: 1,
    }

    const childRow: GanttTask = {
      id: '1.1',
      pid: '1',
      taskNo: '子任务',
      level: '一般',
      start_date: '2026-04-02 00:00:00',
      end_date: '2026-04-03 00:00:00',
      spend_time: '1天',
      job_progress: 0.2,
      no: '1.1',
      treeLevel: 2,
    }

    mutations.setTasks([parentRow, childRow])

    const wrapper = mount(TaskRow, {
      props: {
        headers,
        row: parentRow,
        rowHeight: 40,
      },
      global: {
        provide: {
          [Symbols.TaskActionButtonStyleSymbol]: {
            backgroundColor: '#f8fafc',
            borderRadius: '999px',
          },
          [Symbols.SetTaskActionButtonStyleSymbol]: (context: {
            row: GanttTask
            type: 'add' | 'delete'
          }) => {
            if (context.row.id === '1' && context.type === 'delete') {
              return {
                color: '#dc2626',
                '--task-action-button-delete-hover-background': '#fee2e2',
              }
            }
            return undefined
          },
        },
      },
    })

    const addButton = wrapper.find('.action-btn.add-btn')
    const deleteButton = wrapper.find('.action-btn.delete-btn')

    expect(addButton.attributes('style')).toContain('background-color: rgb(248, 250, 252);')
    expect(addButton.attributes('style')).toContain('border-radius: 999px;')
    expect(deleteButton.attributes('style')).toContain('background-color: rgb(248, 250, 252);')
    expect(deleteButton.attributes('style')).toContain('color: rgb(220, 38, 38);')
    expect(deleteButton.attributes('style')).toContain(
      '--task-action-button-delete-hover-background: #fee2e2;'
    )
  })
})
