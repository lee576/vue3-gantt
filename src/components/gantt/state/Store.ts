import { reactive } from 'vue'
import type {
  GanttTask,
  GanttTaskHeader,
  GanttMapFields,
  GanttExpandRow,
  GanttBarDate,
  GanttViewMode,
  GanttDaySubMode,
  GanttHourSubMode,
  GanttTaskDropPosition,
} from '../types/GanttTypes'
import { reorderTasksByHierarchy } from '../utils/taskTree'

type TaskId = string | number

/**
 * 甘特图全局状态接口
 * @description 管理甘特图的所有响应式状态，包括任务数据、视图模式、时间轴配置等
 */
interface StoreType {
  /** 季度视图的表头数据 */
  monthHeaders: any[]
  /** 周视图的表头数据 */
  weekHeaders: any[]
  /** 日视图的表头数据 */
  dayHeaders: any[]
  /** 时视图的表头数据 */
  hourHeaders: any[]
  /** 任务列表数据 */
  tasks: GanttTask[]
  /** 任务表格列配置 */
  taskHeaders: GanttTaskHeader[]
  /** 字段映射配置，将用户数据字段映射到内部字段 */
  mapFields: GanttMapFields
  /** 时间轴缩放比例（像素/单位） */
  scale: number
  /** 时间轴单元格总数 */
  timelineCellCount: number
  /** 甘特图开始日期 */
  startGanttDate: Date | null
  /** 甘特图结束日期 */
  endGanttDate: Date | null
  /** 滚动标志，用于控制滚动行为 */
  scrollFlag: boolean
  /** 当前视图模式：季度/月/周/日/时 */
  mode: GanttViewMode
  /** 日模式的子模式：全天或半天 */
  daySubMode: GanttDaySubMode
  /** 时模式的子模式：60分钟、30分钟或15分钟 */
  hourSubMode: GanttHourSubMode
  /** 当前展开/折叠的行状态 */
  expandRow: GanttExpandRow
  /** 记录已折叠的任务ID集合（手动折叠） */
  collapsedTasks: Set<string | number>
  /** 记录自动折叠的任务ID集合（基于视口自动折叠） */
  autoCollapsedTasks: Set<string | number>
  /** 全局折叠状态：true表示所有节点都折叠，false表示所有节点都展开 */
  allCollapsed: boolean
  /** 缓存所有被折叠的任务ID（包括子孙任务） */
  allCollapsedTaskIds: Set<string | number>
  /** 当前选中的根任务，用于添加子任务 */
  rootTask: Partial<GanttTask>
  /** 当前选中的子任务 */
  subTask: Partial<GanttTask>
  /** 当前正在编辑的任务 */
  editTask: Partial<GanttTask>
  /** 当前正在删除的任务 */
  removeTask: Partial<GanttTask>
  /** 是否允许修改任务日期 */
  allowChangeTaskDate: boolean
  /** 任务日期变更数据 */
  barDate: GanttBarDate
}

// 初始状态
const initialStore: StoreType = {
  monthHeaders: [],
  weekHeaders: [],
  dayHeaders: [],
  hourHeaders: [],
  tasks: [],
  taskHeaders: [],
  mapFields: {
    id: 'id',
    parentId: 'pid',
    task: 'taskNo',
    priority: 'level',
    startdate: 'start_date',
    enddate: 'end_date',
    takestime: 'spend_time',
    progress: 'job_progress',
  },
  scale: 90,
  timelineCellCount: 0,
  startGanttDate: null,
  endGanttDate: null,
  scrollFlag: true,
  mode: null,
  daySubMode: 'full', // 默认为全天模式
  hourSubMode: '60', // 默认为60分钟模式
  expandRow: {
    pid: 0,
    expand: true,
  },
  collapsedTasks: new Set(),
  autoCollapsedTasks: new Set(),
  allCollapsed: false, // 默认全部展开
  allCollapsedTaskIds: new Set(), // 缓存所有被折叠的任务ID（包括子孙任务）
  rootTask: {},
  subTask: {},
  editTask: {},
  removeTask: {},
  allowChangeTaskDate: false,
  barDate: {
    id: '',
    startDate: '',
    endDate: '',
  },
}

/** 序列号计数器，用于生成唯一ID */
export const serialNumber: number = 0

/**
 * 甘特图全局响应式状态
 * @description 使用 Vue 3 的 reactive API 创建响应式状态管理
 */
export const store = reactive(initialStore) as StoreType

interface TaskTreeCache {
  childIdsByParentKey: Map<string, TaskId[]>
  parentTaskIds: Set<TaskId>
  parentTaskIdByTaskKey: Map<string, TaskId>
  nonRootTaskIds: Set<TaskId>
  descendantIdsByTaskKey: Map<string, Set<TaskId>>
}

const taskTreeCache: TaskTreeCache = {
  childIdsByParentKey: new Map(),
  parentTaskIds: new Set(),
  parentTaskIdByTaskKey: new Map(),
  nonRootTaskIds: new Set(),
  descendantIdsByTaskKey: new Map(),
}

const normalizeTaskKey = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  return String(value)
}

const rebuildTaskTreeCache = () => {
  const idField = store.mapFields['id']
  const parentIdField = store.mapFields['parentId']
  const childIdsByParentKey = new Map<string, TaskId[]>()
  const parentTaskIds = new Set<TaskId>()
  const parentTaskIdByTaskKey = new Map<string, TaskId>()
  const nonRootTaskIds = new Set<TaskId>()
  const taskIdByKey = new Map<string, TaskId>()

  // 折叠/展开按钮点击很频繁，而任务结构真正变化只发生在 setTasks / mapFields 切换时。
  // 因此把“父子关系索引”前移到这里一次性构建，后续每次点击都复用缓存，
  // 避免 6 万条数据下重复扫描整份任务列表。
  for (const task of store.tasks) {
    const taskId = task[idField] as TaskId
    const parentId = task[parentIdField] as string | number | null | undefined
    const parentKey = normalizeTaskKey(parentId)
    taskIdByKey.set(normalizeTaskKey(taskId), taskId)
    const siblings = childIdsByParentKey.get(parentKey)

    if (siblings) {
      siblings.push(taskId)
    } else {
      childIdsByParentKey.set(parentKey, [taskId])
    }
  }

  childIdsByParentKey.forEach((childIds, parentKey) => {
    if (parentKey === '0' || childIds.length === 0) {
      return
    }

    // 这里把“归一化 key”再映射回原始 taskId。
    // 这样 collapsedTasks / autoCollapsedTasks / allCollapsedTaskIds 三个集合里的值类型始终一致，
    // 后续 visibleTasks 过滤时就不会出现 `'1'` 和 `1` 混用造成的误判。
    const originalParentTaskId = taskIdByKey.get(parentKey)
    if (originalParentTaskId !== undefined) {
      parentTaskIds.add(originalParentTaskId)
    }
  })

  for (const task of store.tasks) {
    const taskId = task[idField] as TaskId
    const parentKey = normalizeTaskKey(task[parentIdField] as string | number | null | undefined)

    if (parentKey === '0') {
      continue
    }

    nonRootTaskIds.add(taskId)

    const originalParentTaskId = taskIdByKey.get(parentKey)
    if (originalParentTaskId !== undefined) {
      parentTaskIdByTaskKey.set(normalizeTaskKey(taskId), originalParentTaskId)
    }
  }

  taskTreeCache.childIdsByParentKey = childIdsByParentKey
  taskTreeCache.parentTaskIds = parentTaskIds
  taskTreeCache.parentTaskIdByTaskKey = parentTaskIdByTaskKey
  taskTreeCache.nonRootTaskIds = nonRootTaskIds
  taskTreeCache.descendantIdsByTaskKey = new Map()
}

const getCollapsedRootTaskIds = (
  collapsedTaskIds: Set<string | number>
): Set<string | number> => {
  const collapsedRootTaskIds = new Set<string | number>()

  // 当祖先和子孙同时处于折叠集合里时，只保留最顶层祖先。
  // 这样 updateAllCollapsedTaskIds 在合并隐藏后代时不会重复遍历同一批节点，
  // 尤其是“全部折叠”或用户连续点多层折叠按钮时，能明显减少重复 DFS。
  collapsedTaskIds.forEach(taskId => {
    let currentParentTaskId =
      taskTreeCache.parentTaskIdByTaskKey.get(normalizeTaskKey(taskId)) ?? null
    let coveredByCollapsedAncestor = false

    while (currentParentTaskId !== null) {
      if (collapsedTaskIds.has(currentParentTaskId)) {
        coveredByCollapsedAncestor = true
        break
      }

      currentParentTaskId =
        taskTreeCache.parentTaskIdByTaskKey.get(normalizeTaskKey(currentParentTaskId)) ?? null
    }

    if (!coveredByCollapsedAncestor) {
      collapsedRootTaskIds.add(taskId)
    }
  })

  return collapsedRootTaskIds
}

/**
 * 获取某个任务的所有子孙任务ID
 * @param parentId - 父任务ID
 * @returns 包含所有子孙任务ID的集合
 */
const getAllChildrenIds = (parentId: TaskId): Set<TaskId> => {
  const normalizedParentId = normalizeTaskKey(parentId)
  const cachedDescendants = taskTreeCache.descendantIdsByTaskKey.get(normalizedParentId)
  if (cachedDescendants) {
    return cachedDescendants
  }

  const childrenIds = new Set<TaskId>()
  const stack = [...(taskTreeCache.childIdsByParentKey.get(normalizedParentId) ?? [])]

  // descendants 结果按 taskId 做懒缓存。
  // 某个节点第一次点击时做一次 DFS，后续重复展开/折叠同一节点直接 O(1) 复用。
  while (stack.length > 0) {
    const child = stack.pop()
    if (child === undefined) {
      continue
    }

    if (childrenIds.has(child)) {
      continue
    }

    childrenIds.add(child)
    const descendants = taskTreeCache.childIdsByParentKey.get(normalizeTaskKey(child))
    if (descendants && descendants.length > 0) {
      stack.push(...descendants)
    }
  }

  taskTreeCache.descendantIdsByTaskKey.set(normalizedParentId, childrenIds)
  return childrenIds
}

/**
 * 更新所有被折叠的任务ID缓存
 * @description 递归收集所有被折叠任务的子孙任务ID，用于虚拟滚动优化
 */
const updateAllCollapsedTaskIds = () => {
  const allCollapsedIds = new Set<TaskId>()

  const effectiveCollapsedTasks = new Set([
    ...store.collapsedTasks,
    ...store.autoCollapsedTasks,
  ])

  if (effectiveCollapsedTasks.size === 0) {
    store.allCollapsedTaskIds = allCollapsedIds
    return
  }

  if (store.allCollapsed && store.autoCollapsedTasks.size === 0) {
    // “全部折叠”时最终隐藏集其实就是所有非根节点。
    // 这里直接复用缓存，避免再对每个父节点分别展开后代集合。
    store.allCollapsedTaskIds = new Set(taskTreeCache.nonRootTaskIds)
    return
  }

  const collapsedRootTaskIds = getCollapsedRootTaskIds(effectiveCollapsedTasks)

  collapsedRootTaskIds.forEach(collapsedId => {
    const childrenIds = getAllChildrenIds(collapsedId)
    childrenIds.forEach(id => allCollapsedIds.add(id))
  })

  store.allCollapsedTaskIds = allCollapsedIds
}

/**
 * Store 状态变更方法接口
 * @description 定义所有修改 Store 状态的方法
 */
interface MutationsType {
  /** 设置季度视图表头 */
  setMonthHeaders: (monthHeaders: any[]) => void
  /** 设置日视图表头 */
  setDayHeaders: (dayHeaders: any[]) => void
  /** 设置任务列表 */
  setTasks: (tasks: GanttTask[]) => void
  /** 设置任务表格列配置 */
  setTaskHeaders: (taskHeaders: GanttTaskHeader[]) => void
  /** 设置周视图表头 */
  setWeekHeaders: (weekHeaders: any[]) => void
  /** 设置时视图表头 */
  setHourHeaders: (hourHeaders: any[]) => void
  /** 设置时间轴缩放比例 */
  setScale: (scale: number) => void
  /** 设置字段映射配置 */
  setMapFields: (mapFields: GanttMapFields) => void
  /** 设置时间轴单元格总数 */
  setTimelineCellCount: (timelineCellCount: number) => void
  /** 设置甘特图开始日期 */
  setStartGanttDate: (startGanttDate: Date | null) => void
  /** 设置甘特图结束日期 */
  setEndGanttDate: (endGanttDate: Date | null) => void
  /** 设置滚动标志 */
  setScrollFlag: (scrollFlag: boolean) => void
  /** 设置视图模式 */
  setMode: (mode: GanttViewMode) => void
  /** 设置日模式的子模式 */
  setDaySubMode: (daySubMode: GanttDaySubMode) => void
  /** 设置时模式的子模式 */
  setHourSubMode: (hourSubMode: GanttHourSubMode) => void
  /** 设置展开/折叠行状态 */
  setExpandRow: (expandRow: GanttExpandRow) => void
  /** 切换任务折叠状态 */
  toggleTaskCollapse: (taskId: string | number) => void
  /** 折叠所有有子节点的任务 */
  collapseAllTasks: () => void
  /** 展开所有任务 */
  expandAllTasks: () => void
  /** 设置根任务（用于添加子任务） */
  setRootTask: (rootTask: Partial<GanttTask>) => void
  /** 设置子任务 */
  setSubTask: (subTask: Partial<GanttTask>) => void
  /** 设置编辑任务 */
  setEditTask: (editTask: Partial<GanttTask>) => void
  /** 设置删除任务 */
  setRemoveTask: (removeTask: Partial<GanttTask>) => void
  /** 设置任务日期变更数据 */
  setBarDate: (barDate: GanttBarDate) => void
  /** 设置是否允许修改任务日期 */
  setAllowChangeTaskDate: (allow: boolean) => void
  /** 更新自动折叠的任务ID集合 */
  updateAutoCollapsedTasks: (taskIds: Set<string | number>) => void
  /** 清除所有自动折叠状态 */
  clearAutoCollapsedTasks: () => void
  /** 移动任务到新的父级或顺序 */
  moveTask: (
    draggedTaskId: string | number,
    targetTaskId: string | number,
    position: GanttTaskDropPosition
  ) => boolean
}

// 定义 Mutations
export const mutations: MutationsType = {
  setMonthHeaders(monthHeaders: any[]): void {
    store.monthHeaders = monthHeaders
  },
  setDayHeaders(dayHeaders: any[]): void {
    store.dayHeaders = dayHeaders
  },
  setTasks(tasks: GanttTask[]): void {
    store.tasks = tasks
    rebuildTaskTreeCache()
  },
  setTaskHeaders(taskHeaders: GanttTaskHeader[]): void {
    store.taskHeaders = taskHeaders
  },
  setWeekHeaders(weekHeaders: any[]): void {
    store.weekHeaders = weekHeaders
  },
  setHourHeaders(hourHeaders: any[]): void {
    store.hourHeaders = hourHeaders
  },
  setScale(scale: number): void {
    store.scale = scale
  },
  setMapFields(mapFields: GanttMapFields): void {
    store.mapFields = mapFields
    if (store.tasks.length > 0) {
      rebuildTaskTreeCache()
    }
  },
  setTimelineCellCount(timelineCellCount: number): void {
    store.timelineCellCount = timelineCellCount
  },
  setStartGanttDate(startGanttDate: Date | null): void {
    store.startGanttDate = startGanttDate
  },
  setEndGanttDate(endGanttDate: Date | null): void {
    store.endGanttDate = endGanttDate
  },
  setScrollFlag(scrollFlag: boolean): void {
    store.scrollFlag = scrollFlag
  },
  setMode(mode: GanttViewMode): void {
    store.mode = mode
  },
  setDaySubMode(daySubMode: GanttDaySubMode): void {
    store.daySubMode = daySubMode
  },
  setHourSubMode(hourSubMode: GanttHourSubMode): void {
    store.hourSubMode = hourSubMode
  },
  setExpandRow(expandRow: GanttExpandRow): void {
    store.expandRow = expandRow
  },
  toggleTaskCollapse(taskId: string | number): void {
    if (store.collapsedTasks.has(taskId)) {
      store.collapsedTasks.delete(taskId)
    } else {
      store.collapsedTasks.add(taskId)
    }
    // 触发响应式更新
    store.collapsedTasks = new Set(store.collapsedTasks)
    // 更新缓存
    updateAllCollapsedTaskIds()
  },
  collapseAllTasks(): void {
    // 全部折叠时直接复用 setTasks 阶段准备好的“有子节点任务”缓存。
    // 这样点击表头按钮不需要再重新遍历 6 万条任务去反推父节点集合。
    store.collapsedTasks = new Set(taskTreeCache.parentTaskIds)
    store.allCollapsed = true
    // 更新缓存
    updateAllCollapsedTaskIds()
  },
  expandAllTasks(): void {
    // 清空折叠集合
    store.collapsedTasks = new Set()
    store.allCollapsed = false
    // 清空缓存
    store.allCollapsedTaskIds = new Set()
  },
  setRootTask(rootTask: Partial<GanttTask>): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.rootTask = { ...rootTask, _timestamp: Date.now() }
  },
  setSubTask(subTask: Partial<GanttTask>): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.subTask = { ...subTask, _timestamp: Date.now() }
  },
  setEditTask(editTask: Partial<GanttTask>): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    // 这样即使双击同一任务多次，也能正确触发编辑对话框
    store.editTask = { ...editTask, _timestamp: Date.now() }
  },
  setRemoveTask(removeTask: Partial<GanttTask>): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.removeTask = { ...removeTask, _timestamp: Date.now() }
  },
  setBarDate(barDate: GanttBarDate): void {
    store.barDate = barDate
  },
  setAllowChangeTaskDate(allow: boolean): void {
    store.allowChangeTaskDate = allow
  },
  updateAutoCollapsedTasks(taskIds: Set<string | number>): void {
    store.autoCollapsedTasks = new Set(taskIds)
    updateAllCollapsedTaskIds()
  },
  clearAutoCollapsedTasks(): void {
    store.autoCollapsedTasks = new Set()
    updateAllCollapsedTaskIds()
  },
  moveTask(
    draggedTaskId: string | number,
    targetTaskId: string | number,
    position: GanttTaskDropPosition
  ): boolean {
    const reorderedTasks = reorderTasksByHierarchy(
      store.tasks,
      store.mapFields,
      draggedTaskId,
      targetTaskId,
      position
    )

    if (!reorderedTasks) {
      return false
    }

    if (position === 'child') {
      store.collapsedTasks.delete(targetTaskId)
      store.autoCollapsedTasks.delete(targetTaskId)
      store.collapsedTasks = new Set(store.collapsedTasks)
      store.autoCollapsedTasks = new Set(store.autoCollapsedTasks)
    }

    store.tasks = reorderedTasks
    rebuildTaskTreeCache()
    updateAllCollapsedTaskIds()
    return true
  },
}
