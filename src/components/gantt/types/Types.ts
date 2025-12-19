// 任务类型枚举
export enum TaskType {
  TASK = 'task',           // 普通任务
  PROJECT = 'project',     // 项目（有子任务的任务）
  MILESTONE = 'milestone'  // 里程碑（零持续时间）
}

// 连线类型枚举
export enum LinkType {
  FINISH_TO_START = 'finish-to-start',  // 完成-开始（最常用）
  START_TO_START = 'start-to-start',    // 开始-开始
  FINISH_TO_FINISH = 'finish-to-finish', // 完成-完成
  START_TO_FINISH = 'start-to-finish',   // 开始-完成
  PARENT_CHILD = 'parent-child'          // 父子关系
}

// 连线路径类型枚举
export enum LinkPathType {
  STRAIGHT = 'straight',      // 直线
  BEZIER = 'bezier',         // 贝塞尔曲线
  RIGHT_ANGLE = 'right-angle' // 直角连线
}

// 连线类型颜色配置
export interface LinkTypeColors {
  finishToStart: string;  // FS - 完成-开始
  startToStart: string;   // SS - 开始-开始
  finishToFinish: string; // FF - 完成-完成
  startToFinish: string;  // SF - 开始-完成
}

// 连线类型显示控制
export interface LinkTypeVisibility {
  finishToStart: boolean;  // FS - 完成-开始
  startToStart: boolean;   // SS - 开始-开始
  finishToFinish: boolean; // FF - 完成-完成
  startToFinish: boolean;  // SF - 开始-完成
  parentChild: boolean;    // 父子关系
}

// 基础连线配置接口
export interface LinkConfig {
  color: string;
  width: number;
  dashArray?: string;
  showArrow: boolean;
  arrowColor?: string;
  arrowSize: number;
  showLabels: boolean;
  labelColor: string;
  labelFontSize: number;
  cornerRadius: number;
  pathType: LinkPathType;
  bezierCurvature: number;
  rightAngleOffset: number;
  smoothCorners: boolean;
  enableDashAnimation: boolean;
  dashAnimationSpeed: number;
  parentChildStyle: {
    color: string;
    width: number;
    dashArray?: string;
  };
  linkTypeColors?: LinkTypeColors;
  linkTypeVisibility?: LinkTypeVisibility;
}

// 连线数据接口
export interface TaskLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: LinkType;
  label?: string;
  path: string;
  arrowPoints: string;
  labelX: number;
  labelY: number;
}

// 任务依赖关系接口
export interface TaskDependency {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: LinkType;
  lag?: number; // 延迟天数
  label?: string;
}

// 样式配置接口
export interface StyleConfig {
  headersHeight: number;
  rowHeight: number;
  setBarColor: (row: Record<string, any>) => string;
  setTaskType?: (row: Record<string, any>) => TaskType; // 可选：自定义任务类型判断
}

// 数据配置接口
export interface DataConfig {
  dataSource: any[];
  taskHeaders: any[];
  mapFields: Record<string, any>;
  queryStartDate: string;
  queryEndDate: string;
  dependencies?: Omit<TaskDependency, 'id'>[];
}

// 进度更新事件详情接口
export interface ProgressUpdateDetail {
  taskId: any;
  oldProgress: number;
  newProgress: number;
  task: Record<string, any>;
}

// 事件配置接口
export interface EventConfig {
  addRootTask: (row: Record<string, any> | null) => void;
  addSubTask: (task: any) => void;
  removeTask: (task: any) => void;
  editTask: (task: any) => void;
  queryTask: (startDate: string, endDate: string, mode: string) => void;
  barDate: (id: any, startDate: string, endDate: string) => void;
  allowChangeTaskDate: (allow: boolean) => void;
  updateProgress?: (detail: ProgressUpdateDetail) => void;
}

// 任务表头接口
export interface TaskHeader {
  title: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}