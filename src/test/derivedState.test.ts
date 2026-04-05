import { describe, it, expect, beforeEach } from 'vitest'
import { mutations, store } from '../components/gantt/state/Store'
import {
  taskHierarchyIndex,
  visibleTaskIdSet,
  visibleTasks,
} from '../components/gantt/state/DerivedState'
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

const tasks: GanttTask[] = [
  {
    id: '1',
    pid: '0',
    taskNo: 'Root-1',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    job_progress: 0,
  },
  {
    id: '2',
    pid: '1',
    taskNo: 'Child-1',
    start_date: '2024-01-02',
    end_date: '2024-01-03',
    job_progress: 0,
  },
  {
    id: '3',
    pid: '1',
    taskNo: 'Child-2',
    start_date: '2024-01-03',
    end_date: '2024-01-04',
    job_progress: 0,
  },
  {
    id: '4',
    pid: '2',
    taskNo: 'Grandchild',
    start_date: '2024-01-03',
    end_date: '2024-01-04',
    job_progress: 0,
  },
]

describe('DerivedState 派生索引', () => {
  beforeEach(() => {
    mutations.setMapFields(mapFields)
    mutations.expandAllTasks()
    mutations.clearAutoCollapsedTasks()
    mutations.setTasks(tasks.map(task => ({ ...task })))
  })

  it('应该构建任务层级索引', () => {
    const index = taskHierarchyIndex.value

    expect(index.rootTaskIds).toEqual(['1'])
    expect(index.hasChildrenById.has('1')).toBe(true)
    expect(index.hasChildrenById.has('2')).toBe(true)
    expect(index.lastChildByParentId.get('1')).toBe('3')
    expect(index.ancestorChainById.get('4')).toEqual(['1', '2'])
  })

  it('应该在手动折叠后过滤可见任务', () => {
    mutations.toggleTaskCollapse('1')

    expect(visibleTasks.value.map(task => task.id)).toEqual(['1'])
    expect(visibleTaskIdSet.value.has('2')).toBe(false)
    expect(store.allCollapsedTaskIds.has('4')).toBe(true)
  })

  it('应该把自动折叠也合并进隐藏缓存', () => {
    mutations.updateAutoCollapsedTasks(new Set(['2']))

    expect(store.allCollapsedTaskIds.has('4')).toBe(true)
    expect(visibleTasks.value.map(task => task.id)).toEqual(['1', '2', '3'])
  })

  it('应该在全部折叠时只保留根节点', () => {
    mutations.collapseAllTasks()

    expect(visibleTasks.value.map(task => task.id)).toEqual(['1'])
    expect(store.allCollapsedTaskIds.has('2')).toBe(true)
    expect(store.allCollapsedTaskIds.has('3')).toBe(true)
    expect(store.allCollapsedTaskIds.has('4')).toBe(true)
  })
})
