/**
 * 甘特图基线管理模块
 * @description 支持基线创建、存储、对比和显示
 */

import type { GanttTask } from '../types/GanttTypes'
import type { TaskDependency } from '../types/Types'
import DateUtils from '../utils/dateUtils'

const { differenceInDays, addDays, parseISO, format } = DateUtils

/**
 * 基线数据接口
 */
export interface Baseline {
  /** 基线唯一标识 */
  id: string
  /** 基线名称 */
  name: string
  /** 基线描述 */
  description?: string
  /** 创建时间 */
  createdAt: string
  /** 创建者 */
  createdBy?: string
  /** 任务基线数据 */
  taskBaselines: TaskBaseline[]
  /** 依赖基线数据 */
  dependencyBaselines?: DependencyBaseline[]
}

/**
 * 单个任务的基线数据
 */
export interface TaskBaseline {
  /** 任务ID */
  taskId: string | number
  /** 计划开始日期 */
  plannedStartDate: string
  /** 计划结束日期 */
  plannedEndDate: string
  /** 计划进度 */
  plannedProgress: number
  /** 计划耗时（天） */
  plannedDuration: number
}

/**
 * 依赖关系基线数据
 */
export interface DependencyBaseline {
  /** 依赖ID */
  dependencyId: string
  /** 源任务ID */
  sourceTaskId: string | number
  /** 目标任务ID */
  targetTaskId: string | number
}

/**
 * 基线比较结果
 */
export interface BaselineComparison {
  taskId: string | number
  taskName: string
  /** 开始日期偏差（天） */
  startDateVariance: number
  /** 结束日期偏差（天） */
  endDateVariance: number
  /** 进度偏差（%） */
  progressVariance: number
  /** 状态：按时/提前/延迟/问题 */
  status: 'on-time' | 'ahead' | 'behind' | 'critical'
  /** 偏差描述 */
  message: string
}

/**
 * 基线管理器
 */
export class BaselineManager {
  private baselines: Map<string, Baseline> = new Map()
  private currentBaselineId: string | null = null

  constructor() {}

  /**
   * 创建新基线
   */
  createBaseline(
    name: string,
    tasks: GanttTask[],
    dependencies: TaskDependency[],
    options?: { description?: string; createdBy?: string }
  ): Baseline {
    const id = `baseline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const taskBaselines: TaskBaseline[] = tasks.map(task => ({
      taskId: task.id,
      plannedStartDate: task.start_date,
      plannedEndDate: task.end_date,
      plannedProgress: typeof task.job_progress === 'string' 
        ? parseFloat(task.job_progress) 
        : (task.job_progress as number) || 0,
      plannedDuration: this.calculateDuration(task.start_date, task.end_date)
    }))

    const dependencyBaselines: DependencyBaseline[] = dependencies.map(dep => ({
      dependencyId: dep.id,
      sourceTaskId: dep.sourceTaskId,
      targetTaskId: dep.targetTaskId
    }))

    const baseline: Baseline = {
      id,
      name,
      description: options?.description,
      createdAt: now,
      createdBy: options?.createdBy,
      taskBaselines,
      dependencyBaselines
    }

    this.baselines.set(id, baseline)
    return baseline
  }

  /**
   * 获取所有基线
   */
  getAllBaselines(): Baseline[] {
    return Array.from(this.baselines.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  /**
   * 获取指定基线
   */
  getBaseline(id: string): Baseline | undefined {
    return this.baselines.get(id)
  }

  /**
   * 删除基线
   */
  deleteBaseline(id: string): boolean {
    return this.baselines.delete(id)
  }

  /**
   * 设置当前活跃基线
   */
  setCurrentBaseline(id: string | null): void {
    if (id === null || this.baselines.has(id)) {
      this.currentBaselineId = id
    }
  }

  /**
   * 获取当前活跃基线
   */
  getCurrentBaseline(): Baseline | undefined {
    return this.currentBaselineId ? this.baselines.get(this.currentBaselineId) : undefined
  }

  /**
   * 对比当前任务数据与基线
   */
  compareWithBaseline(baselineId: string, currentTasks: GanttTask[]): BaselineComparison[] {
    const baseline = this.baselines.get(baselineId)
    if (!baseline) return []

    const comparisons: BaselineComparison[] = []
    const baselineTaskMap = new Map(baseline.taskBaselines.map(tb => [tb.taskId, tb]))

    for (const task of currentTasks) {
      const taskBaseline = baselineTaskMap.get(task.id)
      if (!taskBaseline) continue

      const startVariance = differenceInDays(
        task.start_date,
        taskBaseline.plannedStartDate
      )
      const endVariance = differenceInDays(
        task.end_date,
        taskBaseline.plannedEndDate
      )
      const progressVariance = ((typeof task.job_progress === 'string' 
        ? parseFloat(task.job_progress) 
        : (task.job_progress as number) || 0) - taskBaseline.plannedProgress) * 100

      let status: BaselineComparison['status']
      let message: string

      if (endVariance > 2) {
        status = 'behind'
        message = `延迟 ${endVariance} 天`
      } else if (endVariance < -2) {
        status = 'ahead'
        message = `提前 ${Math.abs(endVariance)} 天`
      } else if (startVariance > 2) {
        status = 'behind'
        message = `开始延迟 ${startVariance} 天`
      } else if (progressVariance < -10) {
        status = 'behind'
        message = `进度落后 ${Math.abs(progressVariance).toFixed(0)}%`
      } else {
        status = 'on-time'
        message = '按计划进行'
      }

      if (status === 'behind' && Math.abs(endVariance) > 5) {
        status = 'critical'
        message = `严重延迟 ${endVariance} 天！`
      }

      comparisons.push({
        taskId: task.id,
        taskName: task.taskNo || String(task.id),
        startDateVariance: startVariance,
        endDateVariance: endVariance,
        progressVariance,
        status,
        message
      })
    }

    return comparisons
  }

  /**
   * 导出基线数据
   */
  exportBaseline(id: string): string | null {
    const baseline = this.baselines.get(id)
    if (!baseline) return null
    return JSON.stringify(baseline, null, 2)
  }

  /**
   * 导入基线数据
   */
  importBaseline(jsonData: string): Baseline | null {
    try {
      const data = JSON.parse(jsonData)
      const baseline: Baseline = {
        ...data,
        id: `baseline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }
      this.baselines.set(baseline.id, baseline)
      return baseline
    } catch {
      return null
    }
  }

  /**
   * 计算任务持续天数
   */
  private calculateDuration(startDate: string, endDate: string): number {
    return differenceInDays(endDate, startDate) + 1
  }
}

/**
 * 创建基线管理器单例
 */
let baselineManagerInstance: BaselineManager | null = null

export function getBaselineManager(): BaselineManager {
  if (!baselineManagerInstance) {
    baselineManagerInstance = new BaselineManager()
  }
  return baselineManagerInstance
}


