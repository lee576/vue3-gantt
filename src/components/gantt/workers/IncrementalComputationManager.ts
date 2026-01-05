/**
 * Incremental Computation Manager
 * 实现增量计算,只处理变化的数据,避免全量重新计算
 */

export interface TaskRecord {
  id: string
  [key: string]: any
}

export interface TaskDiff {
  type: 'added' | 'modified' | 'deleted' | 'unchanged'
  taskId: string
  oldValue?: TaskRecord
  newValue?: TaskRecord
  changedFields?: string[]
}

export interface IncrementalConfig {
  enableFieldTracking?: boolean
  trackFields?: string[]
  maxCachedRecords?: number
}

export interface PositionResult {
  id: string
  position: { dataX: number; width: number } | null
}

export interface RecursionResult {
  id: string
  treeLevel: number
  index: number
  no: string
}

export class IncrementalComputationManager {
  private taskCache: Map<string, TaskRecord> = new Map()
  private config: IncrementalConfig

  constructor(config?: Partial<IncrementalConfig>) {
    this.config = {
      enableFieldTracking: true,
      trackFields: ['startDate', 'endDate', 'parentId', 'name'],
      maxCachedRecords: 10000,
      ...config,
    }
  }

  diffTasks(oldTasks: TaskRecord[], newTasks: TaskRecord[]): TaskDiff[] {
    const oldTaskMap = new Map(oldTasks.map(task => [task.id, task]))
    const newTaskMap = new Map(newTasks.map(task => [task.id, task]))
    const diffs: TaskDiff[] = []

    const processedIds = new Set<string>()

    for (const newTask of newTasks) {
      const oldTask = oldTaskMap.get(newTask.id)
      processedIds.add(newTask.id)

      if (!oldTask) {
        diffs.push({
          type: 'added',
          taskId: newTask.id,
          newValue: newTask,
        })
      } else {
        const changedFields = this.detectChangedFields(oldTask, newTask)
        if (changedFields.length > 0) {
          diffs.push({
            type: 'modified',
            taskId: newTask.id,
            oldValue: oldTask,
            newValue: newTask,
            changedFields,
          })
        } else {
          diffs.push({
            type: 'unchanged',
            taskId: newTask.id,
            oldValue: oldTask,
            newValue: newTask,
          })
        }
      }
    }

    for (const oldTask of oldTasks) {
      if (!processedIds.has(oldTask.id)) {
        diffs.push({
          type: 'deleted',
          taskId: oldTask.id,
          oldValue: oldTask,
        })
      }
    }

    return diffs
  }

  private detectChangedFields(oldTask: TaskRecord, newTask: TaskRecord): string[] {
    if (!this.config.enableFieldTracking) {
      const allFields = new Set([
        ...Object.keys(oldTask),
        ...Object.keys(newTask),
      ])
      const changedFields: string[] = []

      for (const field of allFields) {
        if (JSON.stringify(oldTask[field]) !== JSON.stringify(newTask[field])) {
          changedFields.push(field)
        }
      }

      return changedFields
    }

    const trackedFields = this.config.trackFields || []
    const changedFields: string[] = []

    for (const field of trackedFields) {
      if (field in oldTask || field in newTask) {
        if (JSON.stringify(oldTask[field]) !== JSON.stringify(newTask[field])) {
          changedFields.push(field)
        }
      }
    }

    return changedFields
  }

  cacheTasks(tasks: TaskRecord[]): void {
    for (const task of tasks) {
      if (this.taskCache.size >= (this.config.maxCachedRecords || 10000)) {
        const firstKey = this.taskCache.keys().next().value
        this.taskCache.delete(firstKey)
      }
      this.taskCache.set(task.id, { ...task })
    }
  }

  getCachedTask(taskId: string): TaskRecord | undefined {
    return this.taskCache.get(taskId)
  }

  clearCache(): void {
    this.taskCache.clear()
  }

  needsRecalculation(diff: TaskDiff): boolean {
    if (diff.type === 'added' || diff.type === 'deleted') {
      return true
    }

    if (diff.type === 'modified' && diff.changedFields) {
      const positionFields = ['startDate', 'endDate']
      const recursionFields = ['parentId']

      return diff.changedFields.some(field =>
        positionFields.includes(field) || recursionFields.includes(field)
      )
    }

    return false
  }

  filterDiffsRequiringRecalculation(diffs: TaskDiff[]): TaskDiff[] {
    return diffs.filter(diff => this.needsRecalculation(diff))
  }

  getAffectedParentIds(diffs: TaskDiff[]): string[] {
    const affectedIds = new Set<string>()

    for (const diff of diffs) {
      if (diff.type === 'deleted' && diff.oldValue) {
        affectedIds.add(diff.oldValue.parentId || '0')
      }

      if (diff.type === 'modified' && diff.changedFields?.includes('parentId')) {
        if (diff.oldValue) {
          affectedIds.add(diff.oldValue.parentId || '0')
        }
        if (diff.newValue) {
          affectedIds.add(diff.newValue.parentId || '0')
        }
      }
    }

    return Array.from(affectedIds)
  }

  groupDiffsByOperation(diffs: TaskDiff[]): {
    added: TaskDiff[]
    modified: TaskDiff[]
    deleted: TaskDiff[]
  } {
    const grouped = {
      added: [] as TaskDiff[],
      modified: [] as TaskDiff[],
      deleted: [] as TaskDiff[],
    }

    for (const diff of diffs) {
      if (diff.type === 'added') {
        grouped.added.push(diff)
      } else if (diff.type === 'modified') {
        grouped.modified.push(diff)
      } else if (diff.type === 'deleted') {
        grouped.deleted.push(diff)
      }
    }

    return grouped
  }

  calculatePositionChanges(
    oldTasks: TaskRecord[],
    diffs: TaskDiff[]
  ): PositionResult[] {
    const changedTaskIds = new Set(
      diffs
        .filter(diff => this.needsRecalculation(diff))
        .map(diff => diff.taskId)
    )

    return oldTasks
      .filter(task => changedTaskIds.has(task.id))
      .map(task => ({
        id: task.id,
        position: null as { dataX: number; width: number } | null,
      }))
  }

  calculateRecursionChanges(
    oldTasks: TaskRecord[],
    diffs: TaskDiff[]
  ): RecursionResult[] {
    const affectedParentIds = this.getAffectedParentIds(diffs)

    return oldTasks
      .filter(task => affectedParentIds.includes(task.parentId || '0'))
      .map(task => ({
        id: task.id,
        treeLevel: 0,
        index: 0,
        no: '',
      }))
  }

  getStatistics(diffs: TaskDiff[]): {
    total: number
    added: number
    modified: number
    deleted: number
    unchanged: number
    requiresRecalculation: number
  } {
    const added = diffs.filter(d => d.type === 'added').length
    const modified = diffs.filter(d => d.type === 'modified').length
    const deleted = diffs.filter(d => d.type === 'deleted').length
    const unchanged = diffs.filter(d => d.type === 'unchanged').length
    const requiresRecalculation = this.filterDiffsRequiringRecalculation(diffs).length

    return {
      total: diffs.length,
      added,
      modified,
      deleted,
      unchanged,
      requiresRecalculation,
    }
  }
}

let incrementalInstance: IncrementalComputationManager | null = null

export function getIncrementalManager(config?: Partial<IncrementalConfig>): IncrementalComputationManager {
  if (!incrementalInstance) {
    incrementalInstance = new IncrementalComputationManager(config)
  }
  return incrementalInstance
}

export function destroyIncrementalManager(): void {
  if (incrementalInstance) {
    incrementalInstance.clearCache()
    incrementalInstance = null
  }
}
