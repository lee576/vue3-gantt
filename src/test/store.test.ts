import { describe, it, expect } from 'vitest'
import { store, mutations } from '../components/gantt/state/Store'
import type { GanttTask, GanttMapFields, GanttHeader, GanttTaskHeader, GanttViewMode } from '../components/gantt/types/GanttTypes'

describe('状态管理', () => {
  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.monthHeaders).toEqual([])
      expect(store.weekHeaders).toEqual([])
      expect(store.dayHeaders).toEqual([])
      expect(store.hourHeaders).toEqual([])
      expect(store.tasks).toEqual([])
      expect(store.taskHeaders).toEqual([])
      expect(store.mapFields).toEqual({})
      expect(store.scale).toBe(90)
      expect(store.timelineCellCount).toBe(0)
      expect(store.startGanttDate).toBeNull()
      expect(store.endGanttDate).toBeNull()
      expect(store.scrollFlag).toBe(true)
      expect(store.mode).toBeNull()
      expect(store.daySubMode).toBe('full')
      expect(store.hourSubMode).toBe('60')
      expect(store.expandRow).toEqual({ pid: 0, expand: true })
      expect(store.collapsedTasks.size).toBe(0)
      expect(store.allCollapsed).toBe(false)
      expect(store.allCollapsedTaskIds.size).toBe(0)
      expect(store.rootTask).toEqual({})
      expect(store.subTask).toEqual({})
      expect(store.editTask).toEqual({})
      expect(store.removeTask).toEqual({})
      expect(store.allowChangeTaskDate).toEqual({})
      expect(store.barDate).toEqual({ id: '', startDate: '', endDate: '' })
    })
  })

  describe('mutations', () => {
    describe('setMonthHeaders', () => {
      it('应该设置季度视图表头', () => {
        const headers: GanttHeader[] = [
          { label: '2024-Q1', date: '2024-01-01', index: 0 },
          { label: '2024-Q2', date: '2024-04-01', index: 1 },
        ]
        mutations.setMonthHeaders(headers)
        expect(store.monthHeaders).toEqual(headers)
      })
    })

    describe('setWeekHeaders', () => {
      it('应该设置周视图表头', () => {
        const headers: GanttHeader[] = [
          { label: 'Week 1', date: '2024-01-01', index: 0 },
          { label: 'Week 2', date: '2024-01-08', index: 1 },
        ]
        mutations.setWeekHeaders(headers)
        expect(store.weekHeaders).toEqual(headers)
      })
    })

    describe('setDayHeaders', () => {
      it('应该设置日视图表头', () => {
        const headers: GanttHeader[] = [
          { label: '2024-01-01', date: '2024-01-01', index: 0 },
          { label: '2024-01-02', date: '2024-01-02', index: 1 },
        ]
        mutations.setDayHeaders(headers)
        expect(store.dayHeaders).toEqual(headers)
      })
    })

    describe('setHourHeaders', () => {
      it('应该设置时视图表头', () => {
        const headers: GanttHeader[] = [
          { label: '00:00', date: '2024-01-01 00:00', index: 0 },
          { label: '01:00', date: '2024-01-01 01:00', index: 1 },
        ]
        mutations.setHourHeaders(headers)
        expect(store.hourHeaders).toEqual(headers)
      })
    })

    describe('setTasks', () => {
      it('应该设置任务列表', () => {
        const tasks: GanttTask[] = [
          {
            id: '1',
            pid: '0',
            start_date: '2024-01-01',
            end_date: '2024-01-10',
            job_progress: 0.5,
          },
          {
            id: '2',
            pid: '1',
            start_date: '2024-01-02',
            end_date: '2024-01-05',
            job_progress: 0.3,
          },
        ]
        mutations.setTasks(tasks)
        expect(store.tasks).toEqual(tasks)
      })
    })

    describe('setTaskHeaders', () => {
      it('应该设置任务表格列配置', () => {
        const headers: GanttTaskHeader[] = [
          { title: '任务名称', key: 'name', width: 200, align: 'left' },
          { title: '开始日期', key: 'start_date', width: 120, align: 'center' },
        ]
        mutations.setTaskHeaders(headers)
        expect(store.taskHeaders).toEqual(headers)
      })
    })

    describe('setScale', () => {
      it('应该设置时间轴缩放比例', () => {
        mutations.setScale(120)
        expect(store.scale).toBe(120)
      })
    })

    describe('setMapFields', () => {
      it('应该设置字段映射配置', () => {
        const mapFields: GanttMapFields = {
          id: 'id',
          parentId: 'pid',
          task: 'name',
          priority: 'priority',
          startdate: 'start_date',
          enddate: 'end_date',
          takestime: 'duration',
          progress: 'progress',
        }
        mutations.setMapFields(mapFields)
        expect(store.mapFields).toEqual(mapFields)
      })
    })

    describe('setTimelineCellCount', () => {
      it('应该设置时间轴单元格总数', () => {
        mutations.setTimelineCellCount(100)
        expect(store.timelineCellCount).toBe(100)
      })
    })

    describe('setStartGanttDate', () => {
      it('应该设置甘特图开始日期', () => {
        const date = new Date('2024-01-01')
        mutations.setStartGanttDate(date)
        expect(store.startGanttDate).toEqual(date)
      })

      it('应该能够设置为 null', () => {
        mutations.setStartGanttDate(null)
        expect(store.startGanttDate).toBeNull()
      })
    })

    describe('setEndGanttDate', () => {
      it('应该设置甘特图结束日期', () => {
        const date = new Date('2024-12-31')
        mutations.setEndGanttDate(date)
        expect(store.endGanttDate).toEqual(date)
      })

      it('应该能够设置为 null', () => {
        mutations.setEndGanttDate(null)
        expect(store.endGanttDate).toBeNull()
      })
    })

    describe('setScrollFlag', () => {
      it('应该设置滚动标志', () => {
        mutations.setScrollFlag(false)
        expect(store.scrollFlag).toBe(false)
      })
    })

    describe('setMode', () => {
      it('应该设置视图模式', () => {
        const mode: GanttViewMode = '月'
        mutations.setMode(mode)
        expect(store.mode).toBe(mode)
      })

      it('应该能够设置为 null', () => {
        mutations.setMode(null)
        expect(store.mode).toBeNull()
      })
    })

    describe('setDaySubMode', () => {
      it('应该设置日模式的子模式', () => {
        mutations.setDaySubMode('half')
        expect(store.daySubMode).toBe('half')
      })
    })

    describe('setHourSubMode', () => {
      it('应该设置时模式的子模式', () => {
        mutations.setHourSubMode('30')
        expect(store.hourSubMode).toBe('30')
      })
    })

    describe('setExpandRow', () => {
      it('应该设置展开/折叠行状态', () => {
        mutations.setExpandRow({ pid: 1, expand: false })
        expect(store.expandRow).toEqual({ pid: 1, expand: false })
      })
    })

    describe('toggleTaskCollapse', () => {
      beforeEach(() => {
        const mapFields: GanttMapFields = {
          id: 'id',
          parentId: 'pid',
          task: 'name',
          priority: 'priority',
          startdate: 'start_date',
          enddate: 'end_date',
          takestime: 'duration',
          progress: 'progress',
        }
        mutations.setMapFields(mapFields)
        mutations.expandAllTasks()
      })

      it('应该能够折叠任务', () => {
        mutations.toggleTaskCollapse('1')
        expect(store.collapsedTasks.has('1')).toBe(true)
      })

      it('应该能够展开任务', () => {
        mutations.toggleTaskCollapse('1')
        expect(store.collapsedTasks.has('1')).toBe(true)

        mutations.toggleTaskCollapse('1')
        expect(store.collapsedTasks.has('1')).toBe(false)
      })
    })

    describe('collapseAllTasks', () => {
      beforeEach(() => {
        const mapFields: GanttMapFields = {
          id: 'id',
          parentId: 'pid',
          task: 'name',
          priority: 'priority',
          startdate: 'start_date',
          enddate: 'end_date',
          takestime: 'duration',
          progress: 'progress',
        }
        mutations.setMapFields(mapFields)

        const tasks: GanttTask[] = [
          { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-10', job_progress: 0.5 },
          { id: '2', pid: '1', start_date: '2024-01-02', end_date: '2024-01-05', job_progress: 0.3 },
          { id: '3', pid: '1', start_date: '2024-01-06', end_date: '2024-01-09', job_progress: 0.7 },
        ]
        mutations.setTasks(tasks)
      })

      it('应该折叠所有有子节点的任务', () => {
        mutations.collapseAllTasks()
        expect(store.collapsedTasks.has('1')).toBe(true)
        expect(store.allCollapsed).toBe(true)
      })
    })

    describe('expandAllTasks', () => {
      beforeEach(() => {
        mutations.toggleTaskCollapse('1')
        mutations.toggleTaskCollapse('2')
      })

      it('应该展开所有任务', () => {
        mutations.expandAllTasks()
        expect(store.collapsedTasks.size).toBe(0)
        expect(store.allCollapsed).toBe(false)
        expect(store.allCollapsedTaskIds.size).toBe(0)
      })
    })

    describe('setRootTask', () => {
      it('应该设置根任务', () => {
        const task: Partial<GanttTask> = {
          id: '1',
          pid: '0',
          start_date: '2024-01-01',
          end_date: '2024-01-10',
        }
        mutations.setRootTask(task)
        expect(store.rootTask).toHaveProperty('id', '1')
        expect(store.rootTask).toHaveProperty('_timestamp')
      })
    })

    describe('setSubTask', () => {
      it('应该设置子任务', () => {
        const task: Partial<GanttTask> = {
          id: '2',
          pid: '1',
          start_date: '2024-01-02',
          end_date: '2024-01-05',
        }
        mutations.setSubTask(task)
        expect(store.subTask).toHaveProperty('id', '2')
        expect(store.subTask).toHaveProperty('_timestamp')
      })
    })

    describe('setEditTask', () => {
      it('应该设置编辑任务', () => {
        const task: Partial<GanttTask> = {
          id: '1',
          pid: '0',
          start_date: '2024-01-01',
          end_date: '2024-01-10',
        }
        mutations.setEditTask(task)
        expect(store.editTask).toHaveProperty('id', '1')
        expect(store.editTask).toHaveProperty('_timestamp')
      })
    })

    describe('setRemoveTask', () => {
      it('应该设置删除任务', () => {
        const task: Partial<GanttTask> = {
          id: '1',
          pid: '0',
          start_date: '2024-01-01',
          end_date: '2024-01-10',
        }
        mutations.setRemoveTask(task)
        expect(store.removeTask).toHaveProperty('id', '1')
        expect(store.removeTask).toHaveProperty('_timestamp')
      })
    })

    describe('setBarDate', () => {
      it('应该设置任务日期变更数据', () => {
        const barDate = {
          id: '1',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
        }
        mutations.setBarDate(barDate)
        expect(store.barDate).toEqual(barDate)
      })
    })

    describe('setAllowChangeTaskDate', () => {
      it('应该设置是否允许修改任务日期', () => {
        const task: Partial<GanttTask> = {
          id: '1',
          pid: '0',
          start_date: '2024-01-01',
          end_date: '2024-01-10',
        }
        mutations.setAllowChangeTaskDate(task)
        expect(store.allowChangeTaskDate).toEqual(task)
      })
    })
  })
})
