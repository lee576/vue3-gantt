import DateUtils from '../components/gantt/utils/dateUtils'
import { LinkType } from '../components/gantt/types/Types'

export interface MockTask {
  id: string
  pid: string
  taskNo: string
  level: string
  start_date: string
  end_date: string
  job_progress: string
  spend_time: string | null
  type?: string
  customFieldValues?: Record<string, any>
}

export interface MockDependency {
  sourceTaskId: string
  targetTaskId: string
  type: LinkType
}

export interface MockResponse {
  tasks: MockTask[]
  dependencies: MockDependency[]
  baseline?: {
    name: string
    description: string
    createdAt: string
    taskBaselines: Array<{
      taskId: string
      plannedStartDate: string
      plannedEndDate: string
      plannedProgress: number
    }>
  }
}

export const getMockResponse = (): MockResponse => {
  const currentMonth = DateUtils.format(DateUtils.now(), 'YYYY-MM')

  // 生成基线数据：为每个任务创建计划开始日期、结束日期和进度
  const baselineTasks = [
    // 为每个任务创建基线数据，模拟初始计划
    {
      taskId: '1',
      plannedStartDate: `${currentMonth}-01 08:00:00`,
      plannedEndDate: `${currentMonth}-05 18:00:00`,
      plannedProgress: 0.85,
    },
    {
      taskId: '2',
      plannedStartDate: `${currentMonth}-01 08:00:00`,
      plannedEndDate: `${currentMonth}-02 18:00:00`,
      plannedProgress: 1.0,
    },
    {
      taskId: '3',
      plannedStartDate: `${currentMonth}-03 08:00:00`,
      plannedEndDate: `${currentMonth}-04 18:00:00`,
      plannedProgress: 0.9,
    },
    {
      taskId: '4',
      plannedStartDate: `${currentMonth}-05 08:00:00`,
      plannedEndDate: `${currentMonth}-06 18:00:00`,
      plannedProgress: 0.7,
    },
    {
      taskId: '5',
      plannedStartDate: `${currentMonth}-07 08:00:00`,
      plannedEndDate: `${currentMonth}-18 18:00:00`,
      plannedProgress: 0.5,
    },
    {
      taskId: '6',
      plannedStartDate: `${currentMonth}-07 08:00:00`,
      plannedEndDate: `${currentMonth}-15 18:00:00`,
      plannedProgress: 0.6,
    },
    {
      taskId: '7',
      plannedStartDate: `${currentMonth}-07 08:00:00`,
      plannedEndDate: `${currentMonth}-09 18:00:00`,
      plannedProgress: 1.0,
    },
    {
      taskId: '8',
      plannedStartDate: `${currentMonth}-10 08:00:00`,
      plannedEndDate: `${currentMonth}-13 18:00:00`,
      plannedProgress: 0.7,
    },
    {
      taskId: '9',
      plannedStartDate: `${currentMonth}-10 08:00:00`,
      plannedEndDate: `${currentMonth}-15 18:00:00`,
      plannedProgress: 0.4,
    },
    {
      taskId: '10',
      plannedStartDate: `${currentMonth}-07 08:00:00`,
      plannedEndDate: `${currentMonth}-18 18:00:00`,
      plannedProgress: 0.5,
    },
    {
      taskId: '11',
      plannedStartDate: `${currentMonth}-07 08:00:00`,
      plannedEndDate: `${currentMonth}-09 18:00:00`,
      plannedProgress: 1.0,
    },
    {
      taskId: '12',
      plannedStartDate: `${currentMonth}-10 08:00:00`,
      plannedEndDate: `${currentMonth}-12 18:00:00`,
      plannedProgress: 0.8,
    },
    {
      taskId: '13',
      plannedStartDate: `${currentMonth}-13 08:00:00`,
      plannedEndDate: `${currentMonth}-18 18:00:00`,
      plannedProgress: 0.3,
    },
    {
      taskId: '14',
      plannedStartDate: `${currentMonth}-19 08:00:00`,
      plannedEndDate: `${currentMonth}-24 18:00:00`,
      plannedProgress: 0.3,
    },
    {
      taskId: '15',
      plannedStartDate: `${currentMonth}-19 08:00:00`,
      plannedEndDate: `${currentMonth}-20 18:00:00`,
      plannedProgress: 0.8,
    },
    {
      taskId: '16',
      plannedStartDate: `${currentMonth}-21 08:00:00`,
      plannedEndDate: `${currentMonth}-22 18:00:00`,
      plannedProgress: 0.4,
    },
    {
      taskId: '17',
      plannedStartDate: `${currentMonth}-23 08:00:00`,
      plannedEndDate: `${currentMonth}-24 12:00:00`,
      plannedProgress: 0.2,
    },
    {
      taskId: '18',
      plannedStartDate: `${currentMonth}-23 08:00:00`,
      plannedEndDate: `${currentMonth}-24 18:00:00`,
      plannedProgress: 0.1,
    },
    {
      taskId: '19',
      plannedStartDate: `${currentMonth}-25 08:00:00`,
      plannedEndDate: `${currentMonth}-27 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '20',
      plannedStartDate: `${currentMonth}-25 08:00:00`,
      plannedEndDate: `${currentMonth}-25 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '21',
      plannedStartDate: `${currentMonth}-26 08:00:00`,
      plannedEndDate: `${currentMonth}-26 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '22',
      plannedStartDate: `${currentMonth}-27 08:00:00`,
      plannedEndDate: `${currentMonth}-27 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '23',
      plannedStartDate: `${currentMonth}-28 08:00:00`,
      plannedEndDate: `${currentMonth}-30 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '24',
      plannedStartDate: `${currentMonth}-28 08:00:00`,
      plannedEndDate: `${currentMonth}-30 12:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '25',
      plannedStartDate: `${currentMonth}-28 08:00:00`,
      plannedEndDate: `${currentMonth}-30 12:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '26',
      plannedStartDate: `${currentMonth}-01 08:00:00`,
      plannedEndDate: `${currentMonth}-25 18:00:00`,
      plannedProgress: 0.5,
    },
    {
      taskId: '27',
      plannedStartDate: `${currentMonth}-01 08:00:00`,
      plannedEndDate: `${currentMonth}-15 18:00:00`,
      plannedProgress: 0.7,
    },
    {
      taskId: '28',
      plannedStartDate: `${currentMonth}-01 08:00:00`,
      plannedEndDate: `${currentMonth}-20 18:00:00`,
      plannedProgress: 0.4,
    },
    {
      taskId: '29',
      plannedStartDate: `${currentMonth}-15 08:00:00`,
      plannedEndDate: `${currentMonth}-25 18:00:00`,
      plannedProgress: 0.3,
    },
    {
      taskId: '30',
      plannedStartDate: `${currentMonth}-26 08:00:00`,
      plannedEndDate: `${currentMonth}-30 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '31',
      plannedStartDate: `${currentMonth}-26 08:00:00`,
      plannedEndDate: `${currentMonth}-28 18:00:00`,
      plannedProgress: 0.0,
    },
    {
      taskId: '32',
      plannedStartDate: `${currentMonth}-26 08:00:00`,
      plannedEndDate: `${currentMonth}-30 18:00:00`,
      plannedProgress: 0.0,
    },
  ]

  return {
    tasks: [
      // 第一个主任务组 - 项目规划阶段
      {
        id: '1',
        pid: '0',
        taskNo: '项目规划阶段',
        level: '重要',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '0.85',
        spend_time: null,
      },
      {
        id: '2',
        pid: '1',
        taskNo: '需求分析',
        level: '紧急',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-02 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
      },
      // 里程碑：需求分析完成
      {
        id: 'milestone-1',
        pid: '1',
        taskNo: '🎯 需求分析完成',
        level: '紧急',
        start_date: `${currentMonth}-02 18:00:00`,
        end_date: `${currentMonth}-02 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone',
      },
      {
        id: '3',
        pid: '1',
        taskNo: '技术选型',
        level: '重要',
        start_date: `${currentMonth}-03 08:00:00`,
        end_date: `${currentMonth}-04 18:00:00`,
        job_progress: '0.9',
        spend_time: null,
      },
      {
        id: '4',
        pid: '1',
        taskNo: '架构设计',
        level: '重要',
        start_date: `${currentMonth}-05 08:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '0.7',
        spend_time: null,
      },
      // 里程碑：项目规划完成
      {
        id: 'milestone-2',
        pid: '0',
        taskNo: '✅ 项目规划阶段完成',
        level: '重要',
        start_date: `${currentMonth}-06 18:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone',
      },

      // 第二个主任务组 - 开发阶段
      {
        id: '5',
        pid: '0',
        taskNo: '开发阶段',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null,
      },
      {
        id: '6',
        pid: '5',
        taskNo: '前端开发',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.6',
        spend_time: null,
      },
      {
        id: '7',
        pid: '6',
        taskNo: '页面布局',
        level: '一般',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
      },
      {
        id: '8',
        pid: '6',
        taskNo: '组件开发',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-13 18:00:00`,
        job_progress: '0.7',
        spend_time: null,
      },
      {
        id: '9',
        pid: '6',
        taskNo: '状态管理',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.4',
        spend_time: null,
      },
      {
        id: '10',
        pid: '5',
        taskNo: '后端开发',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null,
      },
      {
        id: '11',
        pid: '10',
        taskNo: 'API设计',
        level: '紧急',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
      },
      // 里程碑：API设计完成
      {
        id: 'milestone-3',
        pid: '10',
        taskNo: '🔧 API设计完成',
        level: '紧急',
        start_date: `${currentMonth}-09 18:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone',
      },
      {
        id: '12',
        pid: '10',
        taskNo: '数据库设计',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-12 18:00:00`,
        job_progress: '0.8',
        spend_time: null,
      },
      {
        id: '13',
        pid: '10',
        taskNo: '业务逻辑实现',
        level: '重要',
        start_date: `${currentMonth}-13 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.3',
        spend_time: null,
      },
      // 里程碑：开发阶段完成
      {
        id: 'milestone-4',
        pid: '0',
        taskNo: '🚀 开发阶段完成',
        level: '重要',
        start_date: `${currentMonth}-18 18:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null,
        type: 'milestone',
      },

      // 第三个主任务组 - 测试阶段
      {
        id: '14',
        pid: '0',
        taskNo: '测试阶段',
        level: '重要',
        start_date: `${currentMonth}-19 08:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.3',
        spend_time: null,
      },
      {
        id: '15',
        pid: '14',
        taskNo: '单元测试',
        level: '重要',
        start_date: `${currentMonth}-19 08:00:00`,
        end_date: `${currentMonth}-20 18:00:00`,
        job_progress: '0.8',
        spend_time: null,
      },
      {
        id: '16',
        pid: '14',
        taskNo: '集成测试',
        level: '重要',
        start_date: `${currentMonth}-21 08:00:00`,
        end_date: `${currentMonth}-22 18:00:00`,
        job_progress: '0.4',
        spend_time: null,
      },
      {
        id: '17',
        pid: '14',
        taskNo: '性能测试',
        level: '一般',
        start_date: `${currentMonth}-23 08:00:00`,
        end_date: `${currentMonth}-24 12:00:00`,
        job_progress: '0.2',
        spend_time: null,
      },
      {
        id: '18',
        pid: '14',
        taskNo: '用户验收测试',
        level: '紧急',
        start_date: `${currentMonth}-23 08:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.1',
        spend_time: null,
      },
      // 里程碑：测试阶段完成
      {
        id: 'milestone-5',
        pid: '0',
        taskNo: '✔️ 测试阶段完成',
        level: '重要',
        start_date: `${currentMonth}-24 18:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.3',
        spend_time: null,
        type: 'milestone',
      },

      // 第四个主任务组 - 部署上线
      {
        id: '19',
        pid: '0',
        taskNo: '部署上线',
        level: '紧急',
        start_date: `${currentMonth}-25 08:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '20',
        pid: '19',
        taskNo: '环境准备',
        level: '重要',
        start_date: `${currentMonth}-25 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '21',
        pid: '19',
        taskNo: '代码部署',
        level: '紧急',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-26 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '22',
        pid: '19',
        taskNo: '上线验证',
        level: '紧急',
        start_date: `${currentMonth}-27 08:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      // 里程碑：项目上线
      {
        id: 'milestone-6',
        pid: '0',
        taskNo: '🎉 项目正式上线',
        level: '紧急',
        start_date: `${currentMonth}-27 18:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
        type: 'milestone',
      },

      // 第五个主任务组 - 维护优化
      {
        id: '23',
        pid: '0',
        taskNo: '维护优化',
        level: '一般',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '24',
        pid: '23',
        taskNo: '性能监控',
        level: '重要',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 12:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '25',
        pid: '23',
        taskNo: '用户反馈收集',
        level: '一般',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 12:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },

      // 第六个主任务组 - 文档编写（贯穿整个项目）
      {
        id: '26',
        pid: '0',
        taskNo: '文档编写',
        level: '一般',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.5',
        spend_time: null,
      },
      {
        id: '27',
        pid: '26',
        taskNo: '技术文档',
        level: '重要',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.7',
        spend_time: null,
      },
      {
        id: '28',
        pid: '26',
        taskNo: '用户手册',
        level: '一般',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-20 18:00:00`,
        job_progress: '0.4',
        spend_time: null,
      },
      {
        id: '29',
        pid: '26',
        taskNo: '部署指南',
        level: '一般',
        start_date: `${currentMonth}-15 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.3',
        spend_time: null,
      },

      // 第七个主任务组 - 培训支持
      {
        id: '30',
        pid: '0',
        taskNo: '培训支持',
        level: '一般',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '31',
        pid: '30',
        taskNo: '用户培训',
        level: '重要',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-28 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
      {
        id: '32',
        pid: '30',
        taskNo: '技术支持',
        level: '重要',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
      },
    ],
    baseline: {
      name: '初始基线',
      description: '项目初始基线，基于项目计划创建',
      createdAt: new Date().toISOString(),
      taskBaselines: baselineTasks,
    },
    dependencies: [
      // ===== 里程碑依赖关系 =====
      { sourceTaskId: '2', targetTaskId: 'milestone-1', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '4', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
      { sourceTaskId: 'milestone-2', targetTaskId: '5', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '6', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '10', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
      { sourceTaskId: 'milestone-3', targetTaskId: '14', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '18', targetTaskId: 'milestone-4', type: LinkType.FINISH_TO_START },
      { sourceTaskId: 'milestone-4', targetTaskId: '19', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '22', targetTaskId: 'milestone-5', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '32', targetTaskId: 'milestone-6', type: LinkType.FINISH_TO_START },

      // ===== 完成-开始 (FINISH_TO_START) =====
      { sourceTaskId: '2', targetTaskId: '3', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '3', targetTaskId: '4', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '1', targetTaskId: '5', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '7', targetTaskId: '8', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '11', targetTaskId: '12', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '12', targetTaskId: '13', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '5', targetTaskId: '14', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '15', targetTaskId: '16', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '16', targetTaskId: '17', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '14', targetTaskId: '19', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '20', targetTaskId: '21', type: LinkType.FINISH_TO_START },
      { sourceTaskId: '21', targetTaskId: '22', type: LinkType.FINISH_TO_START },

      // ===== 开始-开始 (START_TO_START) =====
      { sourceTaskId: '6', targetTaskId: '10', type: LinkType.START_TO_START },
      { sourceTaskId: '8', targetTaskId: '9', type: LinkType.START_TO_START },
      { sourceTaskId: '17', targetTaskId: '18', type: LinkType.START_TO_START },
      { sourceTaskId: '27', targetTaskId: '28', type: LinkType.START_TO_START },
      { sourceTaskId: '31', targetTaskId: '32', type: LinkType.START_TO_START },

      // ===== 完成-完成 (FINISH_TO_FINISH) =====
      { sourceTaskId: '6', targetTaskId: '10', type: LinkType.FINISH_TO_FINISH },
      { sourceTaskId: '26', targetTaskId: '19', type: LinkType.FINISH_TO_FINISH },
      { sourceTaskId: '24', targetTaskId: '25', type: LinkType.FINISH_TO_FINISH },

      // ===== 开始-完成 (START_TO_FINISH) =====
      { sourceTaskId: '19', targetTaskId: '23', type: LinkType.START_TO_FINISH },
      { sourceTaskId: '31', targetTaskId: '29', type: LinkType.START_TO_FINISH },
    ],
  }
}

export const getPerformanceTestResponse = (): MockResponse => {
  const currentMonth = DateUtils.format(DateUtils.now(), 'YYYY-MM')
  const tasks: MockTask[] = []
  const dependencies: MockDependency[] = []
  const priorities = ['紧急', '重要', '一般', '不重要']
  const taskTypes = ['开发', '测试', '设计', '文档', '部署', '优化', '修复', '分析', '规划', '维护']

  const generateTasks = (
    parentId: string,
    level: number,
    count: number,
    startDateOffset: number
  ) => {
    const generatedTasks: MockTask[] = []
    for (let i = 0; i < count; i++) {
      const taskId = `${parentId}-${i}`
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]
      const duration = Math.floor(Math.random() * 5) + 1
      const startDate = DateUtils.add(DateUtils.create(`${currentMonth}-01`), startDateOffset + i, 'day')
      const endDate = DateUtils.add(startDate, duration, 'day')
      const progress = Math.random().toFixed(2)

      generatedTasks.push({
        id: taskId,
        pid: parentId,
        taskNo: `${taskType}任务 ${i + 1}`,
        level: priority,
        start_date: DateUtils.format(startDate, 'YYYY-MM-DD HH:mm:ss'),
        end_date: DateUtils.format(endDate, 'YYYY-MM-DD HH:mm:ss'),
        job_progress: progress,
        spend_time: null,
      })

      if (level < 2 && Math.random() > 0.5) {
        const subTasks = generateTasks(
          taskId,
          level + 1,
          Math.floor(Math.random() * 3) + 1,
          startDateOffset + i
        )
        generatedTasks.push(...subTasks)
      }
    }
    return generatedTasks
  }

  const rootTaskCount = 50
  for (let i = 0; i < rootTaskCount; i++) {
    const rootTaskId = `root-${i}`
    const startDateOffset = Math.floor(Math.random() * 20)
    const rootTask = {
      id: rootTaskId,
      pid: '0',
      taskNo: `项目 ${i + 1}`,
      level: priorities[Math.floor(Math.random() * priorities.length)],
      start_date: DateUtils.format(
        DateUtils.add(DateUtils.create(`${currentMonth}-01`), startDateOffset, 'day'),
        'YYYY-MM-DD HH:mm:ss'
      ),
      end_date: DateUtils.format(
        DateUtils.add(DateUtils.create(`${currentMonth}-01`), startDateOffset + 10, 'day'),
        'YYYY-MM-DD HH:mm:ss'
      ),
      job_progress: Math.random().toFixed(2),
      spend_time: null,
    }
    tasks.push(rootTask)

    const subTasks = generateTasks(
      rootTaskId,
      1,
      Math.floor(Math.random() * 5) + 2,
      startDateOffset
    )
    tasks.push(...subTasks)

    if (subTasks.length > 0) {
      dependencies.push({
        sourceTaskId: subTasks[0].id,
        targetTaskId: subTasks[subTasks.length - 1].id,
        type: LinkType.FINISH_TO_START,
      })
    }
  }

  while (tasks.length < 2000) {
    const taskId = `extra-${tasks.length}`
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const duration = Math.floor(Math.random() * 5) + 1
    const startDate = DateUtils.add(DateUtils.create(`${currentMonth}-01`), Math.floor(Math.random() * 25), 'day')
    const endDate = DateUtils.add(startDate, duration, 'day')
    const progress = Math.random().toFixed(2)

    tasks.push({
      id: taskId,
      pid: '0',
      taskNo: `${taskType}任务 ${tasks.length}`,
      level: priority,
      start_date: DateUtils.format(startDate, 'YYYY-MM-DD HH:mm:ss'),
      end_date: DateUtils.format(endDate, 'YYYY-MM-DD HH:mm:ss'),
      job_progress: progress,
      spend_time: null,
    })
  }

  return { tasks, dependencies }
}
