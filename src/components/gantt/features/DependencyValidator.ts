import type { GanttTask } from '../types/GanttTypes'
import type { TaskDependency } from '../types/Types'
import { LinkType } from '../types/Types'
import DateUtils from '../utils/dateUtils'

const { differenceInDays, addDays, parseISO, formatDate } = DateUtils



export interface DependencyCycle {
  cycle: (string | number)[]
  length: number
  description: string
}

export interface DependencyValidationResult {
  isValid: boolean
  errors: DependencyError[]
  warnings: DependencyWarning[]
}

export interface DependencyError {
  dependencyId?: string
  sourceTaskId: string | number
  targetTaskId: string | number
  type: 'cycle' | 'self-reference' | 'invalid-link' | 'date-conflict' | 'missing-task'
  linkType?: LinkType
  message: string
  severity: 'error' | 'critical'
  resolution?: string
}

export interface DependencyWarning {
  dependencyId?: string
  sourceTaskId: string | number
  targetTaskId: string | number
  type: 'redundant' | 'long-lag' | 'cross-project' | 'potential-issue'
  linkType?: LinkType
  message: string
  suggestion?: string
}

export interface DateConflictResult {
  taskId: string | number
  taskName: string
  conflicts: TaskDateConflict[]
}

export interface TaskDateConflict {
  conflictingTaskId: string | number
  conflictingTaskName: string
  dependencyType: LinkType
  conflictType: 'start-before-predecessor-start' |
               'finish-before-predecessor-finish' |
               'start-after-successor-finish' |
               'finish-after-successor-end'
  currentValue: string
  expectedValue: string
  lagAdjustment: number
}

export class DependencyValidator {
  private tasks: Map<string | number, GanttTask> = new Map()
  private dependencies: Map<string | number, TaskDependency[]> = new Map()
  private reverseDependencies: Map<string | number, TaskDependency[]> = new Map()

  loadData(tasks: GanttTask[], dependencies: TaskDependency[]): void {
    this.tasks = new Map(tasks.map(t => [t.id, t]))
    this.dependencies = new Map()
    this.reverseDependencies = new Map()

    for (const dep of dependencies) {
      if (!this.dependencies.has(dep.sourceTaskId)) {
        this.dependencies.set(dep.sourceTaskId, [])
      }
      this.dependencies.get(dep.sourceTaskId)!.push(dep)

      if (!this.reverseDependencies.has(dep.targetTaskId)) {
        this.reverseDependencies.set(dep.targetTaskId, [])
      }
      this.reverseDependencies.get(dep.targetTaskId)!.push(dep)
    }
  }

  detectCycles(): DependencyCycle[] {
    const cycles: DependencyCycle[] = []
    const visited = new Map<string | number, 'visiting' | 'visited'>()
    const recursionStack = new Set<string | number>()

    const dfs = (node: string | number, path: (string | number)[]): void => {
      visited.set(node, 'visiting')
      recursionStack.add(node)

      const outgoingEdges = this.dependencies.get(node) || []

      for (const dep of outgoingEdges) {
        const targetId = dep.targetTaskId

        if (!this.tasks.has(targetId)) return

        if (!visited.has(targetId)) {
          dfs(targetId, [...path, targetId])
        } else if (recursionStack.has(targetId)) {
          const cycleStartIndex = path.indexOf(targetId)
          const cycle = path.slice(cycleStartIndex)
          cycle.push(targetId)

          cycles.push({
            cycle,
            length: cycle.length,
            description: this.formatCycleDescription(cycle),
          })
        }
      }

      recursionStack.delete(node)
      visited.set(node, 'visited')
    }

    for (const taskId of this.tasks.keys()) {
      if (!visited.has(taskId)) {
        dfs(taskId, [taskId])
      }
    }

    return cycles
  }

  private formatCycleDescription(cycle: (string | number)[]): string {
    const taskNames = cycle.map(id => {
      const task = this.tasks.get(id)
      return task?.taskNo || task?.task_name || String(id)
    })

    return taskNames.join(' → ') + ' → ' + taskNames[0]
  }

  validateDependencies(tasks: GanttTask[], dependencies: TaskDependency[]): DependencyValidationResult {
    this.loadData(tasks, dependencies)

    const errors: DependencyError[] = []
    const warnings: DependencyWarning[] = []

    const taskIds = new Set(tasks.map(t => t.id))

    for (const dep of dependencies) {
      if (!this.tasks.has(dep.sourceTaskId)) {
        errors.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'missing-task',
          linkType: dep.type,
          message: `前置任务 ID ${dep.sourceTaskId} 不存在`,
          severity: 'error',
          resolution: '请检查并移除或替换该依赖关系',
        })
        continue
      }

      if (!this.tasks.has(dep.targetTaskId)) {
        errors.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'missing-task',
          linkType: dep.type,
          message: `后续任务 ID ${dep.targetTaskId} 不存在`,
          severity: 'error',
          resolution: '请检查并移除或替换该依赖关系',
        })
        continue
      }

      if (dep.sourceTaskId === dep.targetTaskId) {
        errors.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'self-reference',
          linkType: dep.type,
          message: '任务不能与自身建立依赖关系',
          severity: 'error',
          resolution: '请移除该依赖关系',
        })
        continue
      }

      const validLinkTypes: LinkType[] = [
        LinkType.FINISH_TO_START,
        LinkType.START_TO_START,
        LinkType.FINISH_TO_FINISH,
        LinkType.START_TO_FINISH
      ]
      if (!validLinkTypes.includes(dep.type)) {
        errors.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'invalid-link',
          linkType: dep.type,
          message: `无效的依赖类型: ${dep.type}`,
          severity: 'error',
          resolution: '请使用 finishToStart、startToStart、finishToFinish 或 startToFinish',
        })
      }

      const sourceTask = this.tasks.get(dep.sourceTaskId)!
      const targetTask = this.tasks.get(dep.targetTaskId)!
      const lag = dep.lag || 0

      const hasDateConflict = this.checkDateConflict(sourceTask, targetTask, dep.type, lag)
      if (hasDateConflict) {
        errors.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'date-conflict',
          linkType: dep.type,
          message: '任务日期与依赖关系冲突',
          severity: 'error',
          resolution: '请调整任务日期或依赖关系的滞后时间',
        })
      }

      if (dep.lag && dep.lag > 30) {
        warnings.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'long-lag',
          linkType: dep.type,
          message: `依赖关系滞后时间较长 (${dep.lag} 天)`,
          suggestion: '考虑拆分为多个任务或调整项目计划',
        })
      }

      const redundantDeps = this.findRedundantDependencies(dep, sourceTask, targetTask)
      for (const redundant of redundantDeps) {
        warnings.push({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
          type: 'redundant',
          linkType: dep.type,
          message: redundant.message,
          suggestion: redundant.suggestion,
        })
      }
    }

    const cycles = this.detectCycles()
    for (const cycle of cycles) {
      errors.push({
        type: 'cycle',
        sourceTaskId: '',
        targetTaskId: '',
        message: `检测到循环依赖: ${cycle.description}`,
        severity: 'critical',
        resolution: '请移除循环中的至少一条依赖关系',
      })
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0 && cycles.length === 0,
      errors,
      warnings,
    }
  }

  private checkDateConflict(
    sourceTask: GanttTask,
    targetTask: GanttTask,
    linkType: LinkType,
    lag: number
  ): boolean {
    const sourceStart = parseISO(sourceTask.start_date)
    const sourceEnd = parseISO(sourceTask.end_date)
    const targetStart = parseISO(targetTask.start_date)
    const targetEnd = parseISO(targetTask.end_date)

    switch (linkType) {
      case LinkType.FINISH_TO_START:
        const fsExpectedStart = addDays(sourceTask.end_date, lag)
        if (targetStart.isBefore(fsExpectedStart)) return true
        break

      case LinkType.START_TO_START:
        const ssExpectedStart = addDays(sourceTask.start_date, lag)
        if (targetStart.isBefore(ssExpectedStart)) return true
        break

      case LinkType.FINISH_TO_FINISH:
        const ffExpectedEnd = addDays(sourceTask.end_date, lag)
        if (targetEnd.isBefore(ffExpectedEnd)) return true
        break

      case LinkType.START_TO_FINISH:
        const sfExpectedEnd = addDays(sourceTask.start_date, lag)
        if (targetEnd.isBefore(sfExpectedEnd)) return true
        break
    }

    return false
  }

  private findRedundantDependencies(
    currentDep: TaskDependency,
    sourceTask: GanttTask,
    targetTask: GanttTask
  ): { message: string; suggestion: string }[] {
    const redundant: { message: string; suggestion: string }[] = []

    const indirectPath = this.findIndirectPath(
      currentDep.sourceTaskId,
      currentDep.targetTaskId
    )

    if (indirectPath) {
      redundant.push({
        message: `存在从 ${sourceTask.taskNo || sourceTask.id} 到 ${targetTask.taskNo || targetTask.id} 的间接路径`,
        suggestion: '直接依赖可能是冗余的，考虑移除',
      })
    }

    if (
      currentDep.type === LinkType.FINISH_TO_START &&
      currentDep.lag === 0 &&
      sourceTask.end_date <= targetTask.start_date
    ) {
      const duration = differenceInDays(targetTask.start_date, sourceTask.end_date)
      if (duration === 0) {
        redundant.push({
          message: '任务结束时间与后续任务开始时间相同，可能存在紧密耦合',
          suggestion: '确认这是否为预期的紧前关系',
        })
      }
    }

    return redundant
  }

  private findIndirectPath(
    sourceId: string | number,
    targetId: string | number
    ): (string | number)[] | null {
    const visited = new Set<string | number>()
    const queue: { current: string | number; path: (string | number)[] }[] = [
      { current: sourceId, path: [sourceId] },
    ]

    while (queue.length > 0) {
      const { current, path } = queue.shift()!

      if (current === targetId) {
        return path
      }

      if (visited.has(current)) continue
      visited.add(current)

      const outgoing = this.dependencies.get(current) || []
      for (const dep of outgoing) {
        if (!visited.has(dep.targetTaskId)) {
          queue.push({
            current: dep.targetTaskId,
            path: [...path, dep.targetTaskId],
          })
        }
      }
    }

    return null
  }

  analyzeDateConflicts(tasks: GanttTask[], dependencies: TaskDependency[]): DateConflictResult[] {
    this.loadData(tasks, dependencies)

    const results: DateConflictResult[] = []

    for (const task of tasks) {
      const conflicts: TaskDateConflict[] = []
      const predecessors = this.reverseDependencies.get(task.id) || []

      for (const dep of predecessors) {
        const predTask = this.tasks.get(dep.sourceTaskId)
        if (!predTask) continue

        const lag = dep.lag || 0
        const conflict = this.checkDateConflictDetailed(predTask, task, dep.type, lag)

        if (conflict) {
          conflicts.push(conflict)
        }
      }

      if (conflicts.length > 0) {
        results.push({
          taskId: task.id,
          taskName: task.taskNo || String(task.id),
          conflicts,
        })
      }
    }

    return results
  }

  private checkDateConflictDetailed(
    sourceTask: GanttTask,
    targetTask: GanttTask,
    linkType: LinkType,
    lag: number
  ): TaskDateConflict | null {
    const sourceStart = parseISO(sourceTask.start_date)
    const sourceEnd = parseISO(sourceTask.end_date)
    const targetStart = parseISO(targetTask.start_date)
    const targetEnd = parseISO(targetTask.end_date)

    switch (linkType) {
      case LinkType.FINISH_TO_START: {
        const expectedStart = parseISO(addDays(sourceTask.end_date, lag))
        if (targetStart < expectedStart) {
          return {
            conflictingTaskId: sourceTask.id,
            conflictingTaskName: sourceTask.taskNo || String(sourceTask.id),
            dependencyType: linkType,
            conflictType: 'start-before-predecessor-start',
            currentValue: targetTask.start_date,
            expectedValue: formatDate(parseISO(expectedStart), 'yyyy-MM-dd'),
            lagAdjustment: lag,
          }
        }
        break
      }

      case LinkType.START_TO_START: {
        const expectedStart = parseISO(addDays(sourceTask.start_date, lag))
        if (targetStart < expectedStart) {
          return {
            conflictingTaskId: sourceTask.id,
            conflictingTaskName: sourceTask.taskNo || String(sourceTask.id),
            dependencyType: linkType,
            conflictType: 'finish-before-predecessor-finish',
            currentValue: targetTask.start_date,
            expectedValue: formatDate(parseISO(expectedStart), 'yyyy-MM-dd'),
            lagAdjustment: lag,
          }
        }
        break
      }

      case LinkType.FINISH_TO_FINISH: {
        const expectedEnd = parseISO(addDays(sourceTask.end_date, lag))
        if (targetEnd < expectedEnd) {
          return {
            conflictingTaskId: sourceTask.id,
            conflictingTaskName: sourceTask.taskNo || String(sourceTask.id),
            dependencyType: linkType,
            conflictType: 'start-after-successor-finish',
            currentValue: targetTask.end_date,
            expectedValue: formatDate(parseISO(expectedEnd), 'yyyy-MM-dd'),
            lagAdjustment: lag,
          }
        }
        break
      }

      case LinkType.START_TO_FINISH: {
        const expectedEnd = parseISO(addDays(sourceTask.start_date, lag))
        if (targetEnd < expectedEnd) {
          return {
            conflictingTaskId: sourceTask.id,
            conflictingTaskName: sourceTask.taskNo || String(sourceTask.id),
            dependencyType: linkType,
            conflictType: 'finish-after-successor-end',
            currentValue: targetTask.end_date,
            expectedValue: formatDate(parseISO(expectedEnd), 'yyyy-MM-dd'),
            lagAdjustment: lag,
          }
        }
        break
      }
    }

    return null
  }

  getLongestPath(tasks: GanttTask[], dependencies: TaskDependency[]): {
    path: (string | number)[]
    duration: number
    tasks: GanttTask[]
  } {
    this.loadData(tasks, dependencies)

    const inDegree = new Map<string | number, number>()
    const graph = new Map<string | number, { task: GanttTask; lag: number }[]>()
    const taskIds = new Set(tasks.map(t => t.id))

    for (const task of tasks) {
      inDegree.set(task.id, 0)
      graph.set(task.id, [])
    }

    for (const [sourceId, deps] of this.dependencies) {
      for (const dep of deps) {
        if (taskIds.has(dep.targetTaskId)) {
          graph.get(sourceId)!.push({
            task: this.tasks.get(dep.targetTaskId)!,
            lag: dep.lag || 0,
          })
          inDegree.set(dep.targetTaskId, (inDegree.get(dep.targetTaskId) || 0) + 1)
        }
      }
    }

    const queue: string[] = []
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(String(taskId))
      }
    }

    const dist = new Map<string | number, { duration: number; predecessors: string[] }>()
    for (const task of tasks) {
      dist.set(task.id, { duration: 0, predecessors: [] })
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const currentDist = dist.get(currentId)!.duration

      const currentTask = this.tasks.get(currentId)!
      const currentDuration = differenceInDays(currentTask.end_date, currentTask.start_date) + 1

      for (const { task: successor, lag } of graph.get(currentId) || []) {
        const newDuration = currentDist + currentDuration + lag
        const succDist = dist.get(successor.id)!

        if (newDuration > succDist.duration) {
          succDist.duration = newDuration
          succDist.predecessors = [currentId]
        } else if (newDuration === succDist.duration) {
          succDist.predecessors.push(currentId)
        }

        inDegree.set(successor.id, inDegree.get(successor.id)! - 1)
        if (inDegree.get(successor.id) === 0) {
          queue.push(String(successor.id))
        }
      }
    }

    let longestPath: string[] = []
    let maxDuration = 0

    for (const [taskId, { duration }] of dist) {
      if (duration > maxDuration) {
        maxDuration = duration
        const path = this.reconstructPath(taskId, dist)
        longestPath = path
      }
    }

    return {
      path: longestPath,
      duration: maxDuration,
      tasks: longestPath.map(id => this.tasks.get(id)!).filter(Boolean),
    }
  }

  private reconstructPath(
    endId: string | number,
    dist: Map<string | number, { duration: number; predecessors: string[] }>
  ): (string | number)[] {
    const path: (string | number)[] = [endId]
    let currentId: string | number | undefined = endId

    while (currentId) {
      const { predecessors } = dist.get(currentId)! as { duration: number; predecessors: (string | number)[] };
      if (predecessors.length === 0) {
        break
      }
      const prevId = predecessors[predecessors.length - 1]
      path.unshift(prevId)
      currentId = prevId
    }

    return path as string[]
  }

  hasCircularDependencies(tasks: GanttTask[], dependencies: TaskDependency[]): boolean {
    this.loadData(tasks, dependencies)
    const cycles = this.detectCycles()
    return cycles.length > 0
  }

  getCriticalDependencies(tasks: GanttTask[], dependencies: TaskDependency[]): TaskDependency[] {
    this.loadData(tasks, dependencies)

    const criticalDependencies: TaskDependency[] = []
    const taskIds = new Set(tasks.map(t => t.id))

    for (const dep of dependencies) {
      if (!taskIds.has(dep.sourceTaskId) || !taskIds.has(dep.targetTaskId)) continue

      const sourceTask = this.tasks.get(dep.sourceTaskId)!
      const targetTask = this.tasks.get(dep.targetTaskId)!
      const sourceEnd = sourceTask.end_date
      const targetStart = targetTask.start_date
      const daysDiff = differenceInDays(targetTask.start_date, sourceTask.end_date)

      if (daysDiff <= (dep.lag || 0)) {
        criticalDependencies.push(dep)
      }
    }

    return criticalDependencies
  }

  getLongestDependencyChains(): { chain: (string | number)[]; length: number }[] {
    const chains: { chain: (string | number)[]; length: number }[] = []
    const visited = new Set<string | number>()

    const dfs = (
      node: string | number,
      currentChain: (string | number)[]
    ): void => {
      visited.add(node)
      currentChain.push(node)

      const outgoing = this.dependencies.get(node) || []
      if (outgoing.length === 0) {
        chains.push({
          chain: [...currentChain],
          length: currentChain.length,
        })
      } else {
        for (const dep of outgoing) {
          if (!visited.has(dep.targetTaskId)) {
            dfs(dep.targetTaskId, currentChain)
          }
        }
      }

      currentChain.pop()
      visited.delete(node)
    }

    for (const taskId of this.tasks.keys()) {
      if (!visited.has(taskId)) {
        dfs(taskId, [])
      }
    }

    chains.sort((a, b) => b.length - a.length)
    return chains.filter((chain, index) =>
      index === 0 || chain.length === chains[0].length
    )
  }

  getIsolatedTasks(): GanttTask[] {
    const isolatedTasks: GanttTask[] = []

    for (const task of this.tasks.values()) {
      const hasIncoming = this.reverseDependencies.has(task.id) &&
        this.reverseDependencies.get(task.id)!.length > 0
      const hasOutgoing = this.dependencies.has(task.id) &&
        this.dependencies.get(task.id)!.length > 0

      if (!hasIncoming && !hasOutgoing) {
        isolatedTasks.push(task)
      }
    }

    return isolatedTasks
  }

  formatValidationSummary(result: DependencyValidationResult): string {
    const parts: string[] = []

    if (result.isValid) {
      parts.push('依赖验证完成')
    } else {
      parts.push('依赖验证发现错误')
    }

    parts.push(`${this.tasks.size} 个任务`)
    parts.push(`${this.dependencies.size} 个依赖关系`)

    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} 个错误`)
    }

    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} 个警告`)
    }

    return parts.join(' | ')
  }
}

let validatorInstance: DependencyValidator | null = null

export function getDependencyValidator(): DependencyValidator {
  if (!validatorInstance) {
    validatorInstance = new DependencyValidator()
  }
  return validatorInstance
}

function format(date: Date, pattern: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


