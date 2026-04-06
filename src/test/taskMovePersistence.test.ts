import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mutations, store } from '../components/gantt/state/Store'
import {
  cloneTaskSnapshot,
  createTaskStructureSignature,
  notifyTaskMoveWithRollback,
} from '../components/gantt/timeline/utils/taskMovePersistence'
import type { GanttMapFields } from '../components/gantt/types/GanttTypes'

describe('taskMovePersistence', () => {
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
    mutations.setTasks([
      { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-02', job_progress: 0 },
      { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-04', job_progress: 0 },
    ])
  })

  it('应该在服务端返回 false 时回滚本次拖动', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    mutations.moveTask('2', '1', 'above')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: cloneTaskSnapshot(store.tasks),
      },
      previousTasks,
      {
        moveTask: vi.fn().mockResolvedValue(false),
      },
      'id',
      'pid'
    )

    expect(store.tasks.map(task => task.id)).toEqual(['1', '2'])
  })

  it('不应该在后续结构已经变化时回滚旧请求', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    mutations.moveTask('2', '1', 'above')
    const movedTasks = cloneTaskSnapshot(store.tasks)
    const deferred = Promise.resolve(false)

    mutations.moveTask('1', '2', 'child')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: movedTasks,
      },
      previousTasks,
      {
        moveTask: vi.fn().mockReturnValue(deferred),
      },
      'id',
      'pid'
    )

    expect(createTaskStructureSignature(store.tasks, 'id', 'pid')).toBe(
      createTaskStructureSignature(cloneTaskSnapshot(store.tasks), 'id', 'pid')
    )
    expect(store.tasks.map(task => task.id)).toEqual(['2', '1'])
    expect(store.tasks.find(task => task.id === '1')?.pid).toBe('2')
  })

  it('应该在服务端抛错时回滚本次拖动', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    mutations.moveTask('2', '1', 'above')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: cloneTaskSnapshot(store.tasks),
      },
      previousTasks,
      {
        moveTask: vi.fn().mockRejectedValue(new Error('network')),
      },
      'id',
      'pid'
    )

    expect(store.tasks.map(task => task.id)).toEqual(['1', '2'])
  })

  it('应该在服务端返回规范化任务列表时采用服务端结果', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    mutations.moveTask('2', '1', 'above')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: cloneTaskSnapshot(store.tasks),
      },
      previousTasks,
      {
        moveTask: vi.fn().mockResolvedValue({
          accepted: true,
          tasks: [
            { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-02', job_progress: 0 },
            { id: '2', pid: '1', start_date: '2024-01-03', end_date: '2024-01-04', job_progress: 0 },
          ],
        }),
      },
      'id',
      'pid'
    )

    expect(store.tasks.map(task => task.id)).toEqual(['1', '2'])
    expect(store.tasks.find(task => task.id === '2')?.pid).toBe('1')
    expect(store.tasks.find(task => task.id === '2')?.treeLevel).toBe(2)
  })

  it('应该触发 moveTaskStart 和 moveTaskSettled 生命周期事件', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    const moveTaskStart = vi.fn()
    const moveTaskSettled = vi.fn()
    mutations.moveTask('2', '1', 'above')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: cloneTaskSnapshot(store.tasks),
      },
      previousTasks,
      {
        moveTaskStart,
        moveTask: vi.fn().mockResolvedValue(true),
        moveTaskSettled,
      },
      'id',
      'pid'
    )

    expect(moveTaskStart).toHaveBeenCalledTimes(1)
    expect(moveTaskStart.mock.calls[0]?.[0]).toMatchObject({
      draggedTaskId: '2',
      targetTaskId: '1',
      position: 'above',
    })

    expect(moveTaskSettled).toHaveBeenCalledTimes(1)
    expect(moveTaskSettled.mock.calls[0]?.[0]).toMatchObject({
      accepted: true,
      rolledBack: false,
    })
  })

  it('应该在服务端抛错时触发 moveTaskError 和带回滚状态的 moveTaskSettled', async () => {
    const previousTasks = cloneTaskSnapshot(store.tasks)
    const error = new Error('network')
    const moveTaskError = vi.fn()
    const moveTaskSettled = vi.fn()
    mutations.moveTask('2', '1', 'above')

    await notifyTaskMoveWithRollback(
      {
        draggedTaskId: '2',
        targetTaskId: '1',
        position: 'above',
        tasks: cloneTaskSnapshot(store.tasks),
      },
      previousTasks,
      {
        moveTask: vi.fn().mockRejectedValue(error),
        moveTaskError,
        moveTaskSettled,
      },
      'id',
      'pid'
    )

    expect(moveTaskError).toHaveBeenCalledTimes(1)
    expect(moveTaskError.mock.calls[0]?.[0]).toMatchObject({
      draggedTaskId: '2',
      error,
    })

    expect(moveTaskSettled).toHaveBeenCalledTimes(1)
    expect(moveTaskSettled.mock.calls[0]?.[0]).toMatchObject({
      accepted: false,
      rolledBack: true,
      error,
    })
  })
})
