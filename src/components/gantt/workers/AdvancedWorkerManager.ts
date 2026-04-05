/**
 * Advanced Worker Manager
 * 集成 Worker Pool、SharedArrayBuffer 和增量计算的增强版 Worker 管理器
 */

import { PerformanceConfig } from '../composables/PerformanceConfig'
import { getWorkerPool, destroyWorkerPool, type WorkerPool, calculateOptimalWorkerCount } from './WorkerPool'
import { getSharedMemoryManager, destroySharedMemoryManager, type SharedMemoryManager } from './SharedMemoryManager'
import { getIncrementalManager, destroyIncrementalManager, type IncrementalComputationManager, type TaskDiff } from './IncrementalComputationManager'
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
    // 增量计算只在“任务数量够大 + 已经有上一轮缓存”时才有意义。
    // 小数据集直接全量跑通常更便宜，避免 diff / 分流本身反而成为额外成本。
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
      // 全量计算仍然拆成“树结构递归数据”和“时间轴位置”两类任务并行提交。
      // 这两块读同一份输入，但彼此独立，适合直接并发跑满 worker 池。
      const useSharedMemory = this.config.enableSharedMemory && this.sharedMemory?.isSupported()

      let recursionData: any[]
      let positions: any[]

      if (useSharedMemory && this.sharedMemory) {
        // 当 SharedArrayBuffer 可用时，优先走共享内存路径，减少大数组在主线程和 worker
        // 之间的额外复制成本；否则退回普通消息传递，保证兼容性优先。
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
        recursionData = recursionResult as any[]
        positions = positionResult as any[]
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
      // 共享内存不足时直接降级到普通全量流程，不让“优化手段不可用”变成失败路径。
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
      recursionData: recursionResult as any[],
      positions: positionResult as any[],
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
      // 如果变更只命中了与布局无关的字段，就直接复用上一轮缓存。
      // 这样像名称、备注之类的轻量更新不会把整条 worker 计算链再次跑一遍。
      return {
        recursionData: this.cachedTasks,
        positions: [],
        oldTasks: this.cachedTasks,
        newTasks: tasks,
        diffs,
      }
    }

    const affectedDiffs = this.incrementalManager.filterDiffsRequiringRecalculation(diffs)

    // 这里先保留受影响任务集合，后续如果要把“全量重算”继续细化成“局部重算”，
    // 可以直接复用这份结果，不需要重新回头扫 diffs。
    const affectedTaskIds = new Set(affectedDiffs.map(d => d.taskId))
    void affectedTaskIds

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

    // 当前实现仍然在“需要重算”时走一次全量 worker 计算，
    // 但把 diff 结果一并返回给上层，方便后续继续演进为真正的局部回填。
    this.cachedTasks = [...sanitizedTasks]

    return {
      recursionData: recursionData as any[],
      positions: positions as any[],
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
      }) as Promise<any[]>
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
      }) as Promise<any[]>
    }

    return []
  }

  async formatDates(dates: string[], format: string): Promise<string[]> {
    this.initialize()

    if (this.pool) {
      return this.pool.submit('FORMAT_DATES', { dates, format }) as Promise<string[]>
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
      return this.pool.submit('CALC_DATES', { operations }) as Promise<any[]>
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
