import { computed } from 'vue'
import type { GanttTask } from '../types/GanttTypes'
import { store } from './Store'

export type TaskKey = string

export interface TaskHierarchyIndex {
  orderedTasks: GanttTask[]
  taskById: Map<TaskKey, GanttTask>
  allTaskIdSet: Set<TaskKey>
  childrenByParentId: Map<TaskKey, GanttTask[]>
  rootTaskIds: TaskKey[]
  hasChildrenById: Set<TaskKey>
  lastChildByParentId: Map<TaskKey, TaskKey>
  ancestorChainById: Map<TaskKey, TaskKey[]>
}

// 统一把任务 ID / parentId 归一成字符串键，避免后续在 Map / Set 中出现
// `1` 和 `'1'` 被当成两个不同节点的情况。
export const normalizeTaskKey = (value: string | number | null | undefined): TaskKey => {
  if (value === null || value === undefined || value === '') {
    return '0'
  }
  return String(value)
}

const buildTaskHierarchyIndex = (tasks: GanttTask[]): TaskHierarchyIndex => {
  const idField = store.mapFields.id
  const parentIdField = store.mapFields.parentId
  const taskById = new Map<TaskKey, GanttTask>()
  const allTaskIdSet = new Set<TaskKey>()
  const childrenByParentId = new Map<TaskKey, GanttTask[]>()
  const ancestorChainById = new Map<TaskKey, TaskKey[]>()

  // 第一遍遍历只做最基础的索引构建：
  // 1. taskById 负责 O(1) 查任务
  // 2. childrenByParentId 负责 O(1) 查子节点列表
  // 这样后续组件就不需要在每一行里反复 filter / find 全量任务数组。
  for (const task of tasks) {
    const taskId = normalizeTaskKey(task[idField])
    const parentId = normalizeTaskKey(task[parentIdField])

    taskById.set(taskId, task)
    allTaskIdSet.add(taskId)

    const siblings = childrenByParentId.get(parentId)
    if (siblings) {
      siblings.push(task)
    } else {
      childrenByParentId.set(parentId, [task])
    }
  }

  const rootTaskIds = (childrenByParentId.get('0') ?? []).map(task =>
    normalizeTaskKey(task[idField])
  )
  const hasChildrenById = new Set<TaskKey>()
  const lastChildByParentId = new Map<TaskKey, TaskKey>()

  // 第二遍把“结构性判断”提前算出来：
  // - 某个任务是否有子节点
  // - 某个父节点的最后一个子节点是谁
  // 这些都是 TaskRow 里高频读取但低频变化的数据，适合在这里集中计算。
  childrenByParentId.forEach((children, parentId) => {
    if (parentId !== '0' && children.length > 0) {
      hasChildrenById.add(parentId)
    }

    const lastChild = children[children.length - 1]
    if (lastChild) {
      lastChildByParentId.set(parentId, normalizeTaskKey(lastChild[idField]))
    }
  })

  const buildAncestorChain = (taskId: TaskKey): TaskKey[] => {
    const cached = ancestorChainById.get(taskId)
    if (cached) {
      return cached
    }

    const task = taskById.get(taskId)
    if (!task) {
      ancestorChainById.set(taskId, [])
      return []
    }

    const parentId = normalizeTaskKey(task[parentIdField])
    if (parentId === '0' || !taskById.has(parentId)) {
      ancestorChainById.set(taskId, [])
      return []
    }

    // 祖先链用递归 + 缓存来生成。
    // 一旦某个节点的祖先链算出来，后续兄弟节点复用时几乎没有额外成本。
    const chain = [...buildAncestorChain(parentId), parentId]
    ancestorChainById.set(taskId, chain)
    return chain
  }

  taskById.forEach((_task, taskId) => {
    buildAncestorChain(taskId)
  })

  return {
    orderedTasks: tasks,
    taskById,
    allTaskIdSet,
    childrenByParentId,
    rootTaskIds,
    hasChildrenById,
    lastChildByParentId,
    ancestorChainById,
  }
}

// 整个项目统一从这里拿树形结构派生数据，避免每个组件各自维护一份近似逻辑。
export const taskHierarchyIndex = computed(() => buildTaskHierarchyIndex(store.tasks))

const visibleTaskView = computed(() => {
  const hiddenIds = store.allCollapsedTaskIds
  const idField = store.mapFields.id
  const hierarchyIndex = taskHierarchyIndex.value
  const orderedTasks = hierarchyIndex.orderedTasks
  const effectiveCollapsedTasks = new Set([
    ...store.collapsedTasks,
    ...store.autoCollapsedTasks,
  ])

  // `store.tasks` 仍然保留“完整有序列表”的职责；
  // 这里在点击折叠按钮后不再逐条 filter 整份任务数组，而是利用 DFS 顺序下
  // “同一子树是连续区间”的特性，遇到折叠节点时直接跳过整段子树。
  // 大数据量下，这条链路比基于隐藏 Set 的全量过滤更稳。
  if (effectiveCollapsedTasks.size === 0) {
    return {
      tasks: orderedTasks,
      idSet: hierarchyIndex.allTaskIdSet,
    }
  }

  const supportsSubtreeSkipping =
    orderedTasks.length > 0 && typeof (orderedTasks[0] as GanttTask & { subtreeEndIndex?: number }).subtreeEndIndex === 'number'

  if (!supportsSubtreeSkipping) {
    // 测试里有一部分数据会直接把“原始树节点数组”塞进 store.tasks，
    // 它们没有 flattenTasksByHierarchy 补上的 `subtreeEndIndex`。
    // 这时退回到旧的隐藏 Set 过滤逻辑，保证行为兼容。
    const visibleTaskList: GanttTask[] = []
    const visibleIdSet = new Set<TaskKey>()

    for (const task of orderedTasks) {
      if (hiddenIds.has(task[idField] as string | number)) {
        continue
      }

      visibleTaskList.push(task)
      visibleIdSet.add(normalizeTaskKey(task[idField]))
    }

    return {
      tasks: visibleTaskList,
      idSet: visibleIdSet,
    }
  }

  const visibleTaskList: GanttTask[] = []
  const visibleIdSet = new Set<TaskKey>()

  for (let index = 0; index < orderedTasks.length; index += 1) {
    const task = orderedTasks[index] as GanttTask & { subtreeEndIndex?: number }
    visibleTaskList.push(task)
    visibleIdSet.add(normalizeTaskKey(task[idField]))

    if (!effectiveCollapsedTasks.has(task[idField] as string | number)) {
      continue
    }

    const subtreeEndIndex = task.subtreeEndIndex ?? index
    if (subtreeEndIndex > index) {
      index = subtreeEndIndex
    }
  }

  return {
    tasks: visibleTaskList,
    idSet: visibleIdSet,
  }
})

export const visibleTasks = computed(() => visibleTaskView.value.tasks)

export const visibleTaskIdSet = computed(() => visibleTaskView.value.idSet)
