/**
 * 甘特图任务数据接口
 * @description 定义任务对象的基本结构
 */
export interface GanttTask {
  /** 任务唯一标识符 */
  id: string | number;
  /** 父任务ID，'0' 表示根任务 */
  pid: string | number;
  /** 任务名称 */
  taskNo?: string;
  /** 任务优先级 */
  level?: string;
  /** 开始日期时间 */
  start_date: string;
  /** 结束日期时间 */
  end_date: string;
  /** 任务进度 (0-1) */
  job_progress: string | number;
  /** 耗时（自动计算） */
  spend_time?: string | number;
  /** 任务类型：普通任务/项目/里程碑 */
  type?: 'task' | 'project' | 'milestone';
  /** 其他自定义字段 */
  [key: string]: any;
}

/**
 * 任务表头配置接口
 */
export interface GanttTaskHeader {
  /** 列标题 */
  title: string;
  /** 列属性名 */
  property: string;
  /** 列键名（可选，向后兼容） */
  key?: string;
  /** 列宽度 */
  width?: number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否显示 */
  show?: boolean;
}

/**
 * 字段映射配置接口
 */
export interface GanttMapFields {
  /** 任务ID字段 */
  id: string;
  /** 父任务ID字段 */
  parentId: string;
  /** 任务名称字段 */
  task: string;
  /** 优先级字段 */
  priority: string;
  /** 开始日期字段 */
  startdate: string;
  /** 结束日期字段 */
  enddate: string;
  /** 耗时字段 */
  takestime: string;
  /** 进度字段 */
  progress: string;
}

/**
 * 时间轴表头数据接口
 */
export interface GanttHeader {
  /** 显示文本 */
  label: string;
  /** 日期值 */
  date: string;
  /** 索引 */
  index: number;
}

/**
 * 展开/折叠行状态接口
 */
export interface GanttExpandRow {
  /** 父ID */
  pid: number;
  /** 是否展开 */
  expand: boolean;
}

/**
 * 任务日期变更数据接口
 */
export interface GanttBarDate {
  /** 任务ID */
  id: string;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

/**
 * 视图模式类型
 */
export type GanttViewMode = '季度' | '月' | '周' | '日' | '时' | null;

/**
 * 日视图子模式
 */
export type GanttDaySubMode = 'full' | 'half';

/**
 * 时视图子模式
 */
export type GanttHourSubMode = '60' | '30' | '15';
