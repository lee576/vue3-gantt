import type { GanttMapFields } from '../types/GanttTypes'

type TaskRecord = Record<string, any>

interface TaskTraversalFrame<T extends TaskRecord> {
  task: T
  level: number
  siblingIndex: number
  parentNo: string
}

type FlattenedTask<T extends TaskRecord> = T & {
  treeLevel?: number
  index?: number
  no?: string
  flatIndex?: number
  subtreeEndIndex?: number
}

const ROOT_TASK_KEY = '0'

const normalizeTreeKey = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return ROOT_TASK_KEY
  }

  return String(value)
}

/**
 * 把扁平任务数组整理成甘特图当前需要的树形展开顺序。
 *
 * 旧实现会在每一层递归里重新扫描整份 `tasks`，大数据量下复杂度会退化到 O(n²)；
 * 6 万条记录时，即使把逻辑放进 worker，CPU 也会被长时间占满。
 *
 * 这里先一次遍历建立 `parentId -> children[]` 索引，再用显式栈做深度优先遍历，
 * 整体复杂度收敛到 O(n)。同时直接在现有任务对象上补 `treeLevel / index / no`，
 * 避免额外克隆 6 万个对象，减少主线程和 worker 的内存压力。
 */
export const flattenTasksByHierarchy = <T extends TaskRecord>(
  tasks: T[],
  mapFields: Pick<GanttMapFields, 'id' | 'parentId'> | Record<string, string>
): T[] => {
  const idField = mapFields.id
  const parentIdField = mapFields.parentId
  const childrenByParentId = new Map<string, T[]>()

  for (const task of tasks) {
    const parentKey = normalizeTreeKey(task[parentIdField])
    const siblings = childrenByParentId.get(parentKey)

    if (siblings) {
      siblings.push(task)
    } else {
      childrenByParentId.set(parentKey, [task])
    }
  }

  const orderedTasks: T[] = []
  const visitedTaskIds = new Set<string>()
  const traversalStack: TaskTraversalFrame<T>[] = []
  const rootTasks = childrenByParentId.get(ROOT_TASK_KEY) ?? []

  // 栈是后进先出，所以要倒序压栈，才能保证最终顺序仍与输入中的兄弟顺序一致。
  for (let index = rootTasks.length - 1; index >= 0; index -= 1) {
    traversalStack.push({
      task: rootTasks[index],
      level: 1,
      siblingIndex: index + 1,
      parentNo: '',
    })
  }

  while (traversalStack.length > 0) {
    const currentFrame = traversalStack.pop()
    if (!currentFrame) {
      continue
    }

    const currentTask = currentFrame.task as FlattenedTask<T>
    const taskId = normalizeTreeKey(currentTask[idField])
    if (visitedTaskIds.has(taskId)) {
      // 数据异常时可能存在重复 ID 或循环引用。
      // 这里跳过已访问节点，避免死循环把页面或 worker 卡死。
      continue
    }

    visitedTaskIds.add(taskId)

    currentTask.treeLevel = currentFrame.level
    currentTask.index = currentFrame.siblingIndex
    currentTask.no = currentFrame.parentNo
      ? `${currentFrame.parentNo}.${currentFrame.siblingIndex}`
      : `${currentFrame.siblingIndex}`
    currentTask.flatIndex = orderedTasks.length

    orderedTasks.push(currentTask)

    const children = childrenByParentId.get(taskId) ?? []
    for (let index = children.length - 1; index >= 0; index -= 1) {
      traversalStack.push({
        task: children[index],
        level: currentFrame.level + 1,
        siblingIndex: index + 1,
        parentNo: currentTask.no,
      })
    }
  }

  const subtreeStack: FlattenedTask<T>[] = []

  // 深度优先展开后的同一子树在数组里天然是连续区间。
  // 这里再补一遍 `subtreeEndIndex`，后续 visibleTasks 在遇到折叠节点时
  // 就能直接整段跳过整棵子树，而不是拿隐藏 Set 去逐条过滤 6 万条任务。
  for (let index = 0; index < orderedTasks.length; index += 1) {
    const currentTask = orderedTasks[index] as FlattenedTask<T>
    const currentTreeLevel = currentTask.treeLevel ?? 1

    while (
      subtreeStack.length > 0 &&
      (subtreeStack[subtreeStack.length - 1].treeLevel ?? 1) >= currentTreeLevel
    ) {
      const completedTask = subtreeStack.pop()
      if (completedTask) {
        completedTask.subtreeEndIndex = index - 1
      }
    }

    subtreeStack.push(currentTask)
  }

  while (subtreeStack.length > 0) {
    const completedTask = subtreeStack.pop()
    if (completedTask) {
      completedTask.subtreeEndIndex = orderedTasks.length - 1
    }
  }

  return orderedTasks
}
