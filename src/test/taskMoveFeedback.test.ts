import { describe, expect, it, vi } from 'vitest'
import { createTaskMoveFeedbackHandlers } from '../components/gantt/utils/taskMoveFeedback'
import type {
  TaskMoveErrorDetail,
  TaskMoveSettledDetail,
  TaskMoveStartDetail,
} from '../components/gantt/types/Types'

const createBaseStartDetail = (): TaskMoveStartDetail => ({
  draggedTaskId: '2',
  targetTaskId: '1',
  position: 'above',
  tasks: [{ id: '2', pid: '0' }, { id: '1', pid: '0' }] as any,
  previousTasks: [{ id: '1', pid: '0' }, { id: '2', pid: '0' }] as any,
})

describe('taskMoveFeedback', () => {
  it('应该在 accepted 时发送成功消息', () => {
    const notify = vi.fn()
    const handlers = createTaskMoveFeedbackHandlers({
      notify,
      successMessage: '任务移动成功',
    })

    handlers.moveTaskSettled?.({
      ...createBaseStartDetail(),
      accepted: true,
      rolledBack: false,
      finalTasks: [{ id: '2', pid: '0' }, { id: '1', pid: '0' }] as any,
    } satisfies TaskMoveSettledDetail)

    expect(notify).toHaveBeenCalledWith('任务移动成功', 'success')
  })

  it('应该在 rolledBack 时发送失败消息', () => {
    const notify = vi.fn()
    const handlers = createTaskMoveFeedbackHandlers({
      notify,
      rollbackMessage: '任务移动失败，已回滚',
    })

    handlers.moveTaskSettled?.({
      ...createBaseStartDetail(),
      accepted: false,
      rolledBack: true,
      finalTasks: [{ id: '1', pid: '0' }, { id: '2', pid: '0' }] as any,
    } satisfies TaskMoveSettledDetail)

    expect(notify).toHaveBeenCalledWith('任务移动失败，已回滚', 'error')
  })

  it('应该在结果过期时发送警告消息', () => {
    const notify = vi.fn()
    const handlers = createTaskMoveFeedbackHandlers({
      notify,
      staleMessage: '任务移动结果已过期，已忽略',
    })

    handlers.moveTaskSettled?.({
      ...createBaseStartDetail(),
      accepted: false,
      rolledBack: false,
      finalTasks: [{ id: '3', pid: '0' }, { id: '1', pid: '0' }, { id: '2', pid: '0' }] as any,
    } satisfies TaskMoveSettledDetail)

    expect(notify).toHaveBeenCalledWith('任务移动结果已过期，已忽略', 'warning')
  })

  it('应该支持自定义 start 和 error 处理', () => {
    const notify = vi.fn()
    const onStart = vi.fn()
    const onError = vi.fn()
    const handlers = createTaskMoveFeedbackHandlers({
      notify,
      onStart,
      onError,
    })

    const startDetail = createBaseStartDetail()
    const errorDetail: TaskMoveErrorDetail = {
      ...startDetail,
      error: new Error('network'),
    }

    handlers.moveTaskStart?.(startDetail)
    handlers.moveTaskError?.(errorDetail)

    expect(onStart).toHaveBeenCalledWith(startDetail)
    expect(onError).toHaveBeenCalledWith(errorDetail)
    expect(notify).not.toHaveBeenCalled()
  })

  it('允许通过返回空值来静默某个消息', () => {
    const notify = vi.fn()
    const handlers = createTaskMoveFeedbackHandlers({
      notify,
      successMessage: () => '',
    })

    handlers.moveTaskSettled?.({
      ...createBaseStartDetail(),
      accepted: true,
      rolledBack: false,
      finalTasks: [{ id: '2', pid: '0' }, { id: '1', pid: '0' }] as any,
    } satisfies TaskMoveSettledDetail)

    expect(notify).not.toHaveBeenCalled()
  })
})
