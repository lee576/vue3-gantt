/**
 * 关键路径分析模块
 * @description 计算任务的关键路径、总浮动时间和自由浮动时间
 */

import type { GanttTask } from '../types/GanttTypes'
import type { TaskDependency, LinkType } from '../types/Types'
import DateUtils from '../utils/dateUtils'

const { differenceInDays, addDays, parseISO } = DateUtils

/**
 * 任务分析结果
 */
export interface TaskAnalysis {
  taskId: string | number
  taskName: string
  /** 最早开始时间 */
  earlyStart: number
  /** 最早完成时间 */
  earlyFinish: number
  /** 最晚开始时间 */
  lateStart: number
  /** 最晚完成时间 */
  lateFinish: number
  /** 总浮动时间（Total Float） */
  totalFloat: number
  /** 自由浮动时间（Free Float） */
  freeFloat: number
  /** 是否在关键路径上 */
  isCritical: boolean
  /** 任务依赖深度 */
  depth: number
  /** 前置任务ID列表 */
  predecessorIds: (string | number)[]
  /** 后续任务ID列表 */
  successorIds: (string | number)[]
}

/**
 * 关键路径分析结果
 */
export interface CriticalPathResult {
  /** 所有任务的详细分析 */
  taskAnalysis: Map<string | number, TaskAnalysis>
  /** 关键路径上的任务ID列表 */
  criticalTaskIds: (string | number)[]
  /** 关键路径的依赖链 */
  criticalPath: (string | number)[]
  /** 项目总工期（天） */
  projectDuration: number
  /** 项目开始日期 */
  projectStartDate: string
  /** 项目结束日期 */
  projectEndDate: string
  /** 关键路径总时长 */
  criticalPathDuration: number
}

/**
 * 依赖关系图
 */
interface DependencyGraph {
  tasks: Map<string | number, GanttTask>
  dependencies: Map<string | number, TaskDependency[]>
  reverseDependencies: Map<string | number, TaskDependency[]>
  predecessors: Map<string | number, TaskDependency[]>
  successors: Map<string | number, TaskDependency[]>
}

/**
 * 关键路径分析器
 */
export class CriticalPathAnalyzer {
  private graph: DependencyGraph | null = null
  private criticalThreshold: number = 0

  constructor(criticalThreshold: number = 0) {
    this.criticalThreshold = criticalThreshold
  }

  /**
   * 分析关键路径
   */
  analyze(
    tasks: GanttTask[],
    dependencies: TaskDependency[]
  ): CriticalPathResult {
    this.buildGraph(tasks, dependencies)

    const analysis = this.calculateTimes(tasks)
    const criticalTaskIds = this.identifyCriticalTasks(analysis)
    const criticalPath = this.buildCriticalPath(analysis, criticalTaskIds)

    const projectStartDate = this.getProjectStartDate(tasks)
    const projectEndDate = this.getProjectEndDate(tasks)

    return {
      taskAnalysis: analysis,
      criticalTaskIds,
      criticalPath,
      projectDuration: differenceInDays(projectEndDate, projectStartDate) + 1,
      projectStartDate,
      projectEndDate,
      criticalPathDuration: this.calculateCriticalPathDuration(analysis, criticalPath)
    }
  }

  /**
   * 构建依赖图
   */
  private buildGraph(tasks: GanttTask[], dependencies: TaskDependency[]): void {
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const depMap = new Map<string | number, TaskDependency[]>()
    const reverseDepMap = new Map<string | number, TaskDependency[]>()
    const predMap = new Map<string | number, TaskDependency[]>()
    const succMap = new Map<string | number, TaskDependency[]>()
    const taskIds = new Set(tasks.map(t => t.id))

    for (const dep of dependencies) {
      if (taskIds.has(dep.sourceTaskId) && taskIds.has(dep.targetTaskId)) {
        if (!depMap.has(dep.sourceTaskId)) depMap.set(dep.sourceTaskId, [])
        depMap.get(dep.sourceTaskId)!.push(dep)

        if (!reverseDepMap.has(dep.targetTaskId)) reverseDepMap.set(dep.targetTaskId, [])
        reverseDepMap.get(dep.targetTaskId)!.push(dep)

        if (!predMap.has(dep.targetTaskId)) predMap.set(dep.targetTaskId, [])
        predMap.get(dep.targetTaskId)!.push(dep)

        if (!succMap.has(dep.sourceTaskId)) succMap.set(dep.sourceTaskId, [])
        succMap.get(dep.sourceTaskId)!.push(dep)
      }
    }

    this.graph = {
      tasks: taskMap,
      dependencies: depMap,
      reverseDependencies: reverseDepMap,
      predecessors: predMap,
      successors: succMap
    }
  }

  /**
   * 计算所有任务的时间参数
   */
  private calculateTimes(tasks: GanttTask[]): Map<string | number, TaskAnalysis> {
    if (!this.graph) return new Map()

    const analysis = new Map<string | number, TaskAnalysis>()
    const sortedTasks = this.topologicalSort(tasks)
    const projectStart = this.getProjectStartDate(tasks)
    const projectEnd = this.getProjectEndDate(tasks)
    const projectEndDays = differenceInDays(projectEnd, projectStart) + 1

    for (const task of sortedTasks) {
      const duration = differenceInDays(task.end_date, task.start_date) + 1

      analysis.set(task.id, {
        taskId: task.id,
        taskName: task.taskNo || String(task.id),
        earlyStart: 0,
        earlyFinish: duration,
        lateStart: projectEndDays,
        lateFinish: projectEndDays,
        totalFloat: 0,
        freeFloat: 0,
        isCritical: false,
        depth: 0,
        predecessorIds: [],
        successorIds: []
      })
    }

    for (const task of sortedTasks) {
      const analysisItem = analysis.get(task.id)!
      const predecessors = this.graph!.predecessors.get(task.id) || []
      const duration = differenceInDays(task.end_date, task.start_date) + 1

      for (const pred of predecessors) {
        const predAnalysis = analysis.get(pred.sourceTaskId)
        if (!predAnalysis) continue

        const lag = pred.lag || 0
        const predFinish = predAnalysis.earlyFinish + lag

        if (predFinish > analysisItem.earlyStart) {
          analysisItem.earlyStart = predFinish
        }
      }

      analysisItem.earlyFinish = analysisItem.earlyStart + duration
      analysisItem.predecessorIds = predecessors.map(p => p.sourceTaskId)
    }

    const reverseSortedTasks = [...sortedTasks].reverse()
    for (const task of reverseSortedTasks) {
      const analysisItem = analysis.get(task.id)!
      const successors = this.graph!.successors.get(task.id) || []
      const duration = differenceInDays(task.end_date, task.start_date) + 1

      if (successors.length > 0) {
        let minLateStart = projectEndDays
        for (const succ of successors) {
          const succAnalysis = analysis.get(succ.targetTaskId)
          if (succAnalysis && succAnalysis.lateStart < minLateStart) {
            minLateStart = succAnalysis.lateStart
          }
        }
        analysisItem.lateFinish = minLateStart - 1
      } else {
        analysisItem.lateFinish = projectEndDays
      }

      analysisItem.lateStart = analysisItem.lateFinish - duration + 1
      analysisItem.totalFloat = analysisItem.lateStart - analysisItem.earlyStart
      analysisItem.isCritical = analysisItem.totalFloat <= this.criticalThreshold
      analysisItem.successorIds = successors.map(s => s.targetTaskId)
    }

    for (const task of reverseSortedTasks) {
      const analysisItem = analysis.get(task.id)!
      const successors = this.graph!.successors.get(task.id) || []

      if (successors.length > 0) {
        let minEarlyStart = Infinity
        for (const succ of successors) {
          const succAnalysis = analysis.get(succ.targetTaskId)
          if (succAnalysis && succAnalysis.earlyStart < minEarlyStart) {
            minEarlyStart = succAnalysis.earlyStart
          }
        }
        analysisItem.freeFloat = Math.max(0, minEarlyStart - analysisItem.earlyFinish)
      } else {
        analysisItem.freeFloat = projectEndDays - analysisItem.earlyFinish
      }
    }

    return analysis
  }

  /**
   * 计算自由浮动时间
   */
  private calculateFreeFloat(
    task: GanttTask,
    analysis: Map<string | number, TaskAnalysis>,
    earlyFinishDays: number
  ): number {
    if (!this.graph) return 0

    const successors = this.graph!.successors.get(task.id) || []
    if (successors.length === 0) {
      const projectEnd = differenceInDays(
        this.getProjectEndDate([task]),
        this.getProjectStartDate([task])
      ) + 1
      return projectEnd - earlyFinishDays
    }

    let minEarlyStart = Infinity
    for (const succ of successors) {
      const succAnalysis = analysis.get(succ.targetTaskId)
      if (succAnalysis && succAnalysis.earlyStart < minEarlyStart) {
        minEarlyStart = succAnalysis.earlyStart
      }
    }

    return minEarlyStart - earlyFinishDays
  }

  /**
   * 识别关键任务
   */
  private identifyCriticalTasks(analysis: Map<string | number, TaskAnalysis>): (string | number)[] {
    const criticalTasks: (string | number)[] = []
    for (const [taskId, taskAnalysis] of analysis) {
      if (taskAnalysis.isCritical) {
        criticalTasks.push(taskId)
      }
    }
    return criticalTasks
  }

  /**
   * 构建关键路径
   */
  private buildCriticalPath(
    analysis: Map<string | number, TaskAnalysis>,
    criticalTaskIds: (string | number)[]
  ): (string | number)[] {
    const criticalTaskSet = new Set(criticalTaskIds)
    const taskArray = Array.from(analysis.values())
    
    const startTasks = taskArray.filter(t => 
      criticalTaskSet.has(t.taskId) && 
      !t.predecessorIds?.some((p: string | number) => criticalTaskSet.has(p))
    )

    const endTasks = taskArray.filter(t =>
      criticalTaskSet.has(t.taskId) &&
      !t.successorIds?.some((s: string | number) => criticalTaskSet.has(s))
    )

    const path: (string | number)[] = []

    function traverseBackwards(task: TaskAnalysis): void {
      path.unshift(task.taskId)
      const predecessors = task.predecessorIds || []
      const criticalPredecessors = predecessors.filter((p: string | number) => criticalTaskSet.has(p))
      
      if (criticalPredecessors.length > 0) {
        const predTask = Array.from(analysis.values()).find(t => t.taskId === criticalPredecessors[0])
        if (predTask) {
          traverseBackwards(predTask)
        }
      }
    }

    function traverseForwards(task: TaskAnalysis): void {
      path.push(task.taskId)
      const successors = task.successorIds || []
      const criticalSuccessors = successors.filter((s: string | number) => criticalTaskSet.has(s))
      
      if (criticalSuccessors.length > 0) {
        const succTask = Array.from(analysis.values()).find(t => t.taskId === criticalSuccessors[0])
        if (succTask) {
          traverseForwards(succTask)
        }
      }
    }

    if (startTasks.length > 0) {
      const startTask = startTasks[0]
      const endTask = endTasks.length > 0 ? endTasks[0] : startTask

      const startAnalysis = analysis.get(startTask.taskId)
      const endAnalysis = analysis.get(endTask.taskId)

      if (startAnalysis && endAnalysis) {
        if (startAnalysis.earlyStart <= endAnalysis.earlyStart) {
          traverseBackwards(startAnalysis)
          traverseForwards(endAnalysis)
        } else {
          traverseBackwards(endAnalysis)
          traverseForwards(startAnalysis)
        }
      }
    }

    return [...new Set(path)]
  }

  /**
   * 拓扑排序
   */
  private topologicalSort(tasks: GanttTask[]): GanttTask[] {
    const inDegree = new Map<string | number, number>()
    const graph = new Map<string | number, GanttTask[]>()
    const taskIds = new Set(tasks.map(t => t.id))

    for (const task of tasks) {
      inDegree.set(task.id, 0)
      graph.set(task.id, [])
    }

    if (this.graph) {
      for (const [sourceId, deps] of this.graph.dependencies) {
        for (const dep of deps) {
          if (taskIds.has(dep.targetTaskId)) {
            graph.get(sourceId)!.push(this.graph.tasks.get(dep.targetTaskId)!)
            inDegree.set(dep.targetTaskId, (inDegree.get(dep.targetTaskId) || 0) + 1)
          }
        }
      }
    }

    const queue: GanttTask[] = []
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        const task = tasks.find(t => t.id === taskId)
        if (task) queue.push(task)
      }
    }

    const result: GanttTask[] = []
    while (queue.length > 0) {
      const task = queue.shift()!
      result.push(task)

      for (const successor of graph.get(task.id) || []) {
        inDegree.set(successor.id, (inDegree.get(successor.id) || 0) - 1)
        if (inDegree.get(successor.id) === 0) {
          queue.push(successor)
        }
      }
    }

    return result
  }

  /**
   * 计算任务深度
   */
  private calculateDepth(taskId: string | number): number {
    if (!this.graph) return 0

    let depth = 0
    const predecessors = this.graph.predecessors.get(taskId) || []
    
    for (const pred of predecessors) {
      const predDepth = this.calculateDepth(pred.sourceTaskId)
      if (predDepth > depth) {
        depth = predDepth + 1
      }
    }

    return depth
  }

  /**
   * 获取项目开始日期
   */
  private getProjectStartDate(tasks: GanttTask[]): string {
    if (tasks.length === 0) return new Date().toISOString().split('T')[0]
    
    let minDate = tasks[0].start_date
    for (const task of tasks) {
      if (task.start_date < minDate) {
        minDate = task.start_date
      }
    }
    return minDate
  }

  /**
   * 获取项目结束日期
   */
  private getProjectEndDate(tasks: GanttTask[]): string {
    if (tasks.length === 0) return new Date().toISOString().split('T')[0]
    
    let maxDate = tasks[0].end_date
    for (const task of tasks) {
      if (task.end_date > maxDate) {
        maxDate = task.end_date
      }
    }
    return maxDate
  }

  /**
   * 计算关键路径总时长
   */
  private calculateCriticalPathDuration(
    analysis: Map<string | number, TaskAnalysis>,
    criticalPath: (string | number)[]
  ): number {
    if (criticalPath.length === 0) return 0

    let totalDuration = 0
    for (const taskId of criticalPath) {
      const taskAnalysis = analysis.get(taskId)
      if (taskAnalysis) {
        totalDuration += taskAnalysis.earlyFinish - taskAnalysis.earlyStart + 1
      }
    }
    return totalDuration
  }

  /**
   * 设置关键路径阈值
   */
  setCriticalThreshold(threshold: number): void {
    this.criticalThreshold = threshold
  }
}

/**
 * 创建关键路径分析器单例工厂
 */
let analyzerInstance: CriticalPathAnalyzer | null = null

export function getCriticalPathAnalyzer(threshold: number = 0): CriticalPathAnalyzer {
  if (!analyzerInstance || analyzerInstance['criticalThreshold'] !== threshold) {
    analyzerInstance = new CriticalPathAnalyzer(threshold)
  }
  return analyzerInstance
}


