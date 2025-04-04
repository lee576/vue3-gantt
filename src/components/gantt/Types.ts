// 定义数据源中每个任务的接口
export interface Task {
    id: string;
    pid: string;
    taskNo: string;
    level: string;
    start_date: string;
    end_date: string;
    job_progress: string;
    spend_time: string | null;
  }
  
  // 定义 mapFields 返回对象的接口
  export interface MapFields {
    id: string;
    parentId: string;
    task: string;
    priority: string;
    startdate: string;
    enddate: string;
    takestime: string;
    progress: string;
  }
  
  // 定义 taskHeaders 返回数组中每个元素的接口
  export type TaskHeader = {
    title: string;
    width: number;
    property: string;
    show: boolean;
  }
  
  // 定义数据配置的接口
  export interface DataConfig {
    queryStartDate: string;
    queryEndDate: string;
    dataSource:  Task[];
    mapFields: MapFields;
    taskHeaders: TaskHeader[];
  }
  
  // 定义样式配置的接口
  export interface StyleConfig {
    headersHeight: number;
    rowHeight: number;
    setBarColor: (row: Record<string, any>) => string;
  }
  
  // 定义事件配置的接口
  export interface EventConfig {
    addRootTask: (row: Record<string, any> | null) => void;
    addSubTask: (task: any) => void;
    removeTask: (task: any) => void;
    editTask: (task: any) => void;
    queryTask: (startDate: string, endDate: string, mode: string) => void;
    barDate: (id: any, startDate: string, endDate: string) => void;
    allowChangeTaskDate: (task: any) => boolean;
  }