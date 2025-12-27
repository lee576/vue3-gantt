import { reactive } from 'vue';

// 定义 Store 接口
interface StoreType {
  monthHeaders: any[];
  weekHeaders: any[];
  dayHeaders: any[];
  hourHeaders: any[];
  tasks: any[];
  taskHeaders: any[];
  mapFields: Record<string, any>;
  scale: number;
  timelineCellCount: number;
  startGanttDate: Date | null;
  endGanttDate: Date | null;
  scrollFlag: boolean;
  mode: string | null;
  daySubMode: 'full' | 'half'; // 日模式的子模式：全天或半天
  hourSubMode: '60' | '30' | '15'; // 时模式的子模式：60分钟、30分钟或15分钟
  expandRow: {
    pid: number;
    expand: boolean;
  };
  collapsedTasks: Set<any>; // 记录已折叠的任务ID集合
  allCollapsed: boolean; // 全局折叠状态：true表示所有节点都折叠，false表示所有节点都展开
  allCollapsedTaskIds: Set<any>; // 缓存所有被折叠的任务ID（包括子孙任务）
  rootTask: any;
  subTask: any;
  editTask: any;
  removeTask: any;
  allowChangeTaskDate: any;
  barDate: {
    id: string;
    startDate: string;
    endDate: string;
  };
}

// 初始状态
const initialStore: StoreType = {
  monthHeaders: [],
  weekHeaders: [],
  dayHeaders: [],
  hourHeaders: [],
  tasks: [],
  taskHeaders: [],
  mapFields: {},
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
    expand: true
  },
  collapsedTasks: new Set(),
  allCollapsed: false, // 默认全部展开
  allCollapsedTaskIds: new Set(), // 缓存所有被折叠的任务ID（包括子孙任务）
  rootTask: {},
  subTask: {},
  editTask: {},
  removeTask: {},
  allowChangeTaskDate: {},
  barDate: {
    id: '',
    startDate: '',
    endDate: ''
  }
};

export let serialNumber: number = 0;
// 使用reactive保证响应式正常工作
export let store = reactive(initialStore) as StoreType;

// 辅助函数：获取某个任务的所有子孙任务ID
const getAllChildrenIds = (parentId: any, tasks: any[], parentIdField: string): Set<any> => {
  const childrenIds = new Set<any>();
  
  const collectChildren = (pid: any) => {
    const children = tasks.filter(task => task[parentIdField] === pid);
    children.forEach(child => {
      const childId = child[store.mapFields['id']];
      childrenIds.add(childId);
      collectChildren(childId);
    });
  };
  
  collectChildren(parentId);
  return childrenIds;
};

// 辅助函数：更新所有被折叠的任务ID缓存
const updateAllCollapsedTaskIds = () => {
  const allCollapsedIds = new Set<any>();
  const parentIdField = store.mapFields['parentId'];
  
  store.collapsedTasks.forEach(collapsedId => {
    const childrenIds = getAllChildrenIds(collapsedId, store.tasks, parentIdField);
    childrenIds.forEach(id => allCollapsedIds.add(id));
  });
  
  store.allCollapsedTaskIds = allCollapsedIds;
};

// 定义 Mutations 类型
interface MutationsType {
  setMonthHeaders: (monthHeaders: any[]) => void;
  setDayHeaders: (dayHeaders: any[]) => void;
  setTasks: (tasks: any[]) => void;
  setTaskHeaders: (taskHeaders: any[]) => void;
  setWeekHeaders: (weekHeaders: any[]) => void;
  setHourHeaders: (hourHeaders: any[]) => void;
  setScale: (scale: number) => void;
  setMapFields: (mapFields: Record<string, any>) => void;
  setTimelineCellCount: (timelineCellCount: number) => void;
  setStartGanttDate: (startGanttDate: Date | null) => void;
  setEndGanttDate: (endGanttDate: Date | null) => void;
  setScrollFlag: (scrollFlag: boolean) => void;
  setMode: (mode: string | null) => void;
  setDaySubMode: (daySubMode: 'full' | 'half') => void; // 设置日模式的子模式
  setHourSubMode: (hourSubMode: '60' | '30' | '15') => void; // 设置时模式的子模式
  setExpandRow: (expandRow: { pid: number; expand: boolean }) => void;
  toggleTaskCollapse: (taskId: any) => void; // 切换任务折叠状态
  collapseAllTasks: () => void; // 折叠所有有子节点的任务
  expandAllTasks: () => void; // 展开所有任务
  setRootTask: (rootTask: any) => void;
  setSubTask: (subTask: any) => void;
  setEditTask: (editTask: any) => void;
  setRemoveTask: (removeTask: any) => void;
  setBarDate: (barDate: { id: string; startDate: string; endDate: string }) => void;
  setAllowChangeTaskDate: (task: any) => void;
}

// 定义 Mutations
export let mutations: MutationsType = {
  setMonthHeaders(monthHeaders: any[]): void {
    store.monthHeaders = monthHeaders;
  },
  setDayHeaders(dayHeaders: any[]): void {
    store.dayHeaders = dayHeaders;
  },
  setTasks(tasks: any[]): void {
    store.tasks = tasks;
  },
  setTaskHeaders(taskHeaders: any[]): void {
    store.taskHeaders = taskHeaders;
  },
  setWeekHeaders(weekHeaders: any[]): void {
    store.weekHeaders = weekHeaders;
  },
  setHourHeaders(hourHeaders: any[]): void {
    store.hourHeaders = hourHeaders;
  },
  setScale(scale: number): void {
    store.scale = scale;
  },
  setMapFields(mapFields: Record<string, any>): void {
    store.mapFields = mapFields;
  },
  setTimelineCellCount(timelineCellCount: number): void {
    store.timelineCellCount = timelineCellCount;
  },
  setStartGanttDate(startGanttDate: Date | null): void {
    store.startGanttDate = startGanttDate;
  },
  setEndGanttDate(endGanttDate: Date | null): void {
    store.endGanttDate = endGanttDate;
  },
  setScrollFlag(scrollFlag: boolean): void {
    store.scrollFlag = scrollFlag;
  },
  setMode(mode: string | null): void {
    store.mode = mode;
  },
  setDaySubMode(daySubMode: 'full' | 'half'): void {
    store.daySubMode = daySubMode;
  },
  setHourSubMode(hourSubMode: '60' | '30' | '15'): void {
    store.hourSubMode = hourSubMode;
  },
  setExpandRow(expandRow: { pid: number; expand: boolean }): void {
    store.expandRow = expandRow;
  },
  toggleTaskCollapse(taskId: any): void {
    if (store.collapsedTasks.has(taskId)) {
      store.collapsedTasks.delete(taskId);
    } else {
      store.collapsedTasks.add(taskId);
    }
    // 触发响应式更新
    store.collapsedTasks = new Set(store.collapsedTasks);
    // 更新缓存
    updateAllCollapsedTaskIds();
  },
  collapseAllTasks(): void {
    // 找出所有有子节点的任务ID
    const parentTasks = new Set<any>();
    const parentIdField = store.mapFields['parentId'];
    
    store.tasks.forEach(task => {
      const parentId = task[parentIdField];
      if (parentId && parentId !== '0') {
        parentTasks.add(parentId);
      }
    });
    
    // 将这些任务ID添加到折叠集合
    store.collapsedTasks = new Set(parentTasks);
    store.allCollapsed = true;
    // 更新缓存
    updateAllCollapsedTaskIds();
  },
  expandAllTasks(): void {
    // 清空折叠集合
    store.collapsedTasks = new Set();
    store.allCollapsed = false;
    // 清空缓存
    store.allCollapsedTaskIds = new Set();
  },
  setRootTask(rootTask: any): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.rootTask = { ...rootTask, _timestamp: Date.now() };
  },
  setSubTask(subTask: any): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.subTask = { ...subTask, _timestamp: Date.now() };
  },
  setEditTask(editTask: any): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    // 这样即使双击同一任务多次，也能正确触发编辑对话框
    store.editTask = { ...editTask, _timestamp: Date.now() };
  },
  setRemoveTask(removeTask: any): void {
    // 创建新对象并添加时间戳，确保每次都能触发 watch
    store.removeTask = { ...removeTask, _timestamp: Date.now() };
  },
  setBarDate(barDate: { id: string; startDate: string; endDate: string }): void {
    store.barDate = barDate;
  },
  setAllowChangeTaskDate(task: any): void {
    store.allowChangeTaskDate = task;
  }
};