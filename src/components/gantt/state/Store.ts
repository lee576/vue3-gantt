import { reactive } from 'vue'
import type {
  GanttTask,
  GanttTaskHeader,
  GanttMapFields,
  GanttExpandRow,
  GanttBarDate,
  GanttViewMode,
  GanttDaySubMode,
  GanttHourSubMode
} from '../types/GanttTypes'

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

/**
 * 获取某个任务的所有子孙任务ID
 * @param parentId - 父任务ID
 * @param tasks - 任务列表
 * @param parentIdField - 父ID字段名
 * @returns 包含所有子孙任务ID的集合
 */
const getAllChildrenIds = (parentId: any, tasks: any[], parentIdField: string): Set<any> => {
  const childrenIds = new Set<any>()

  const collectChildren = (pid: any) => {
    const children = tasks.filter(task => task[parentIdField] === pid)
    children.forEach(child => {
      const childId = child[store.mapFields['id']]
      childrenIds.add(childId)
      collectChildren(childId)
    })
  }

  collectChildren(parentId)
  return childrenIds
}

/**
 * 更新所有被折叠的任务ID缓存
 * @description 递归收集所有被折叠任务的子孙任务ID，用于虚拟滚动优化
 */
const updateAllCollapsedTaskIds = () => {
  const allCollapsedIds = new Set<any>()
  const parentIdField = store.mapFields['parentId']

  store.collapsedTasks.forEach(collapsedId => {
    const childrenIds = getAllChildrenIds(collapsedId, store.tasks, parentIdField)
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
    // 找出所有有子节点的任务ID
    const parentTasks = new Set<string | number>()
    const parentIdField = store.mapFields['parentId']

    store.tasks.forEach(task => {
      const parentId = task[parentIdField]
      if (parentId && parentId !== '0') {
        parentTasks.add(parentId)
      }
    })

    // 将这些任务ID添加到折叠集合
    store.collapsedTasks = new Set(parentTasks)
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
  },
  clearAutoCollapsedTasks(): void {
    store.autoCollapsedTasks = new Set()
  },
}
