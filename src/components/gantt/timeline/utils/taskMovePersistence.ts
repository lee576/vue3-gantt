import { mutations, store } from '../../state/Store'
import type { GanttTask } from '../../types/GanttTypes'
import { flattenTasksByHierarchy } from '../../utils/taskTree'
import type {
  TaskMoveDetail,
  TaskMoveEventHandlers,
  TaskMoveHandlerResult,
  TaskMoveResolution,
  TaskMoveResolvedResult,
} from '../../types/Types'

export const cloneTaskSnapshot = (tasks: GanttTask[]): GanttTask[] => {
  return tasks.map(task => ({ ...task }))
}

export const createTaskStructureSignature = (
  tasks: GanttTask[],
  idField: string,
  parentIdField: string
): string => {
  return tasks
    .map(task => `${String(task[idField])}:${String(task[parentIdField] ?? '0')}`)
    .join('|')
}

export const notifyTaskMoveWithRollback = async (
  detail: TaskMoveDetail,
  previousTasks: GanttTask[],
  handlers: TaskMoveEventHandlers | undefined,
  idField: string,
  parentIdField: string
) => {
  const movedSignature = createTaskStructureSignature(detail.tasks, idField, parentIdField)
  const snapshotPreviousTasks = cloneTaskSnapshot(previousTasks)
  const startDetail = {
    ...detail,
    previousTasks: snapshotPreviousTasks,
  }
  const normalizeResultTasks = (tasks: GanttTask[]) => {
    const hasTreeMetadata = tasks.some(
      task =>
        typeof task.flatIndex === 'number' ||
        typeof task.subtreeEndIndex === 'number' ||
        typeof task.treeLevel === 'number'
    )

    if (hasTreeMetadata) {
      return tasks
    }

    return flattenTasksByHierarchy(tasks.map(task => ({ ...task })), {
      id: idField,
      parentId: parentIdField,
    })
  }
  const rollbackIfStillCurrent = () => {
    if (createTaskStructureSignature(store.tasks, idField, parentIdField) === movedSignature) {
      mutations.setTasks(previousTasks)
      return true
    }

    return false
  }

  handlers?.moveTaskStart?.(startDetail)

  let accepted = true
  let rolledBack = false
  let result: TaskMoveResolvedResult | undefined
  let settledError: unknown

  try {
    if (!handlers?.moveTask) {
      return
    }

    result = (await handlers.moveTask(detail)) as TaskMoveResolvedResult

    if (result === false) {
      accepted = false
      rolledBack = rollbackIfStillCurrent()
      return
    }

    if (
      typeof result === 'object' &&
      result !== null &&
      'accepted' in result &&
      (result as TaskMoveResolution).accepted === false
    ) {
      accepted = false
      rolledBack = rollbackIfStillCurrent()
      return
    }

    if (
      typeof result === 'object' &&
      result !== null &&
      Array.isArray((result as TaskMoveResolution).tasks)
      && createTaskStructureSignature(store.tasks, idField, parentIdField) === movedSignature
    ) {
      mutations.setTasks(normalizeResultTasks((result as TaskMoveResolution).tasks ?? []))
    }
  } catch (error) {
    accepted = false
    settledError = error
    rolledBack = rollbackIfStillCurrent()
    handlers?.moveTaskError?.({
      ...startDetail,
      error,
    })
  } finally {
    handlers?.moveTaskSettled?.({
      ...startDetail,
      accepted,
      rolledBack,
      finalTasks: cloneTaskSnapshot(store.tasks),
      result,
      error: settledError,
    })
  }
}
