/**
 * Advanced Worker Manager
 * 集成 Worker Pool、SharedArrayBuffer 和增量计算的增强版 Worker 管理器
 */

import { PerformanceConfig } from '../composables/PerformanceConfig'
import { getWorkerPool, destroyWorkerPool, type WorkerPool, calculateOptimalWorkerCount } from './WorkerPool'
import { getSharedMemoryManager, destroySharedMemoryManager, type SharedMemoryManager } from './SharedMemoryManager'
import { getIncrementalManager, destroyIncrementalManager, type IncrementalComputationManager, type TaskDiff } from './IncrementalComputationManager'
import type { WorkerMessage } from './dataProcessor.worker'
import { sanitizeTasksForWorker, sanitizeMapFieldsForWorker } from './workerDataSerializer'

export interface AdvancedWorkerConfig {
  enablePool?: boolean
  enableSharedMemory?: boolean
  enableIncremental?: boolean
  poolSize?: number
  sharedMemorySize?: number
  trackFields?: string[]
}

export interface ProcessedData {
  recursionData: any[]
  positions: any[]
  oldTasks?: any[]
  newTasks?: any[]
  diffs?: TaskDiff[]
}

export class AdvancedWorkerManager {
  private pool: WorkerPool | null = null
  private sharedMemory: SharedMemoryManager | null = null
  private incrementalManager: IncrementalComputationManager | null = null
  private cachedTasks: any[] = []
  private config: AdvancedWorkerConfig
  private isInitialized = false

  constructor(config?: Partial<AdvancedWorkerConfig>) {
    this.config = {
      enablePool: PerformanceConfig.ENABLE_WORKER_POOL,
      enableSharedMemory: PerformanceConfig.ENABLE_SHARED_MEMORY,
      enableIncremental: PerformanceConfig.ENABLE_INCREMENTAL_COMPUTATION,
      poolSize: PerformanceConfig.WORKER_POOL_SIZE || undefined,
      sharedMemorySize: PerformanceConfig.SHARED_MEMORY_SIZE,
      trackFields: PerformanceConfig.INCREMENTAL_TRACK_FIELDS,
      ...config,
    }
  }

  initialize(taskCount: number = 0): void {
    if (this.isInitialized) return

    if (this.config.enablePool) {
      const workerCount = this.config.poolSize
        ? this.config.poolSize
        : calculateOptimalWorkerCount(taskCount)
      this.pool = getWorkerPool({
        workerCount,
        timeout: 30000,
        taskQueueSize: Math.max(1000, taskCount),
      })
    }

    if (this.config.enableSharedMemory && typeof SharedArrayBuffer !== 'undefined') {
      this.sharedMemory = getSharedMemoryManager({
        initialSize: this.config.sharedMemorySize || 1024 * 1024,
      })
    }

    if (this.config.enableIncremental) {
      this.incrementalManager = getIncrementalManager({
        enableFieldTracking: true,
        trackFields: this.config.trackFields,
        maxCachedRecords: 10000,
      })
    }

    this.isInitialized = true
    console.log('AdvancedWorkerManager initialized')
  }

  async processAllData(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<ProcessedData> {
    const taskCount = tasks.length
    this.initialize(taskCount)
    const useIncremental = this.config.enableIncremental &&
      taskCount >= PerformanceConfig.INCREMENTAL_THRESHOLD &&
      this.cachedTasks.length > 0

    if (useIncremental && this.incrementalManager) {
      return this.processIncremental(tasks, startGanttDate, mode, scale, mapFields, daySubMode, hourSubMode)
    }

    return this.processFull(tasks, startGanttDate, mode, scale, mapFields, daySubMode, hourSubMode)
  }

  private async processFull(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<ProcessedData> {
    const sanitizedTasks = sanitizeTasksForWorker(tasks)
    const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)
    
    if (this.pool) {
      const useSharedMemory = this.config.enableSharedMemory && this.sharedMemory?.isSupported()

      let recursionData: any[]
      let positions: any[]

      if (useSharedMemory && this.sharedMemory) {
        const results = await this.processWithSharedMemory(
          sanitizedTasks,
          startGanttDate,
          mode,
          scale,
          sanitizedMapFields,
          daySubMode,
          hourSubMode
        )
        recursionData = results.recursionData
        positions = results.positions
      } else {
        const [recursionResult, positionResult] = await Promise.all([
          this.pool.submit('PROCESS_RECURSION_DATA', {
            id: '0',
            tasks: sanitizedTasks,
            level: 0,
            mapFields: sanitizedMapFields,
          }),
          this.pool.submit('CALC_BAR_POSITIONS', {
            tasks: sanitizedTasks,
            startGanttDate,
            mode,
            scale,
            mapFields: sanitizedMapFields,
            daySubMode,
            hourSubMode,
          }),
        ])
        recursionData = recursionResult
        positions = positionResult
      }

      this.cachedTasks = [...sanitizedTasks]
      return { recursionData, positions, oldTasks: [], newTasks: sanitizedTasks }
    }

    return {
      recursionData: [],
      positions: [],
    }
  }

  private async processWithSharedMemory(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<{ recursionData: any[]; positions: any[] }> {
    if (!this.sharedMemory || !this.pool) {
      return { recursionData: [], positions: [] }
    }

    const sanitizedTasks = sanitizeTasksForWorker(tasks)
    const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)

    const offset = this.sharedMemory.allocate(102400)
    if (offset === null) {
      return this.processFull(tasks, startGanttDate, mode, scale, mapFields, daySubMode, hourSubMode) as Promise<{ recursionData: any[]; positions: any[] }>
    }

    this.sharedMemory.writeTaskArray(offset, sanitizedTasks)

    const [recursionResult, positionResult] = await Promise.all([
      this.pool.submit('PROCESS_RECURSION_DATA', {
        id: '0',
        tasks: sanitizedTasks,
        level: 0,
        mapFields: sanitizedMapFields,
      }),
      this.pool.submit('CALC_BAR_POSITIONS', {
        tasks: sanitizedTasks,
        startGanttDate,
        mode,
        scale,
        mapFields: sanitizedMapFields,
        daySubMode,
        hourSubMode,
      }),
    ])

    this.sharedMemory.reset()

    return {
      recursionData: recursionResult,
      positions: positionResult,
    }
  }

  private async processIncremental(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<ProcessedData> {
    if (!this.incrementalManager || !this.pool) {
      return this.processFull(tasks, startGanttDate, mode, scale, mapFields, daySubMode, hourSubMode)
    }

    const diffs = this.incrementalManager.diffTasks(this.cachedTasks, tasks)
    const stats = this.incrementalManager.getStatistics(diffs)

    if (stats.requiresRecalculation === 0) {
      return {
        recursionData: this.cachedTasks,
        positions: [],
        oldTasks: this.cachedTasks,
        newTasks: tasks,
        diffs,
      }
    }

    const affectedDiffs = this.incrementalManager.filterDiffsRequiringRecalculation(diffs)

    const affectedTaskIds = new Set(affectedDiffs.map(d => d.taskId))
    const affectedTasks = tasks.filter(t => affectedTaskIds.has(t.id))

    const sanitizedTasks = sanitizeTasksForWorker(tasks)
    const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)

    const [recursionData, positions] = await Promise.all([
      this.pool.submit('PROCESS_RECURSION_DATA', {
        id: '0',
        tasks: sanitizedTasks,
        level: 0,
        mapFields: sanitizedMapFields,
      }),
      this.pool.submit('CALC_BAR_POSITIONS', {
        tasks: sanitizedTasks,
        startGanttDate,
        mode,
        scale,
        mapFields: sanitizedMapFields,
        daySubMode,
        hourSubMode,
      }),
    ])

    this.cachedTasks = [...sanitizedTasks]

    return {
      recursionData,
      positions,
      oldTasks: this.cachedTasks,
      newTasks: tasks,
      diffs,
    }
  }

  async processRecursionData(
    id: any,
    tasks: any[],
    level: number,
    mapFields: Record<string, string>
  ): Promise<any[]> {
    this.initialize()

    if (this.pool) {
      return this.pool.submit('PROCESS_RECURSION_DATA', {
        id,
        tasks,
        level,
        mapFields,
      })
    }

    return []
  }

  async calcBarPositions(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<any[]> {
    this.initialize()

    if (this.pool) {
      return this.pool.submit('CALC_BAR_POSITIONS', {
        tasks,
        startGanttDate,
        mode,
        scale,
        mapFields,
        daySubMode,
        hourSubMode,
      })
    }

    return []
  }

  async formatDates(dates: string[], format: string): Promise<string[]> {
    this.initialize()

    if (this.pool) {
      return this.pool.submit('FORMAT_DATES', { dates, format })
    }

    return []
  }

  async calcDates(
    operations: Array<{
      type: 'add' | 'subtract' | 'diff'
      date: string
      amount?: number
      unit?: any
      date2?: string
    }>
  ): Promise<any[]> {
    this.initialize()

    if (this.pool) {
      return this.pool.submit('CALC_DATES', { operations })
    }

    return []
  }

  updateTasks(newTasks: any[]): TaskDiff[] {
    if (!this.incrementalManager) return []

    const diffs = this.incrementalManager.diffTasks(this.cachedTasks, newTasks)
    this.incrementalManager.cacheTasks(newTasks)
    this.cachedTasks = [...newTasks]

    return diffs
  }

  getDiffStats(diffs: TaskDiff[]): {
    total: number
    added: number
    modified: number
    deleted: number
    unchanged: number
    requiresRecalculation: number
  } | null {
    if (!this.incrementalManager) return null
    return this.incrementalManager.getStatistics(diffs)
  }

  getPoolStatus(): { total: number; active: number; pending: number } | null {
    if (!this.pool) return null
    return this.pool.getQueueStatus()
  }

  isSharedMemorySupported(): boolean {
    return this.sharedMemory?.isSupported() ?? false
  }

  getCacheSize(): number {
    return this.cachedTasks.length
  }

  clearCache(): void {
    this.cachedTasks = []
    this.incrementalManager?.clearCache()
  }

  isAvailable(): boolean {
    return this.pool !== null
  }

  async dispose(): Promise<void> {
    return this.shutdown()
  }

  async shutdown(): Promise<void> {
    if (this.pool) {
      await destroyWorkerPool()
      this.pool = null
    }

    if (this.sharedMemory) {
      destroySharedMemoryManager()
      this.sharedMemory = null
    }

    if (this.incrementalManager) {
      destroyIncrementalManager()
      this.incrementalManager = null
    }

    this.isInitialized = false
    console.log('AdvancedWorkerManager shutdown')
  }
}

let advancedInstance: AdvancedWorkerManager | null = null

export function getAdvancedWorkerManager(config?: Partial<AdvancedWorkerConfig>): AdvancedWorkerManager {
  if (!advancedInstance) {
    advancedInstance = new AdvancedWorkerManager(config)
  }
  return advancedInstance
}

export async function destroyAdvancedWorkerManager(): Promise<void> {
  if (advancedInstance) {
    await advancedInstance.shutdown()
    advancedInstance = null
  }
}
