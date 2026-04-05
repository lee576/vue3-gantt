/**
 * Advanced Worker Manager Adapter
 * 提供与原有 WorkerManager 接口兼容的适配器，内部使用 AdvancedWorkerManager
 */

import { AdvancedWorkerManager, type ProcessedData } from './AdvancedWorkerManager'
import { PerformanceConfig } from '../composables/PerformanceConfig'
import { sanitizeTasksForWorker, sanitizeMapFieldsForWorker } from './workerDataSerializer'

export class AdvancedWorkerAdapter {
  private manager: AdvancedWorkerManager | null = null

  constructor() {
    this.initManager()
  }

  private initManager() {
    try {
      this.manager = new AdvancedWorkerManager({
        enablePool: PerformanceConfig.ENABLE_WORKER_POOL,
        enableSharedMemory: PerformanceConfig.ENABLE_SHARED_MEMORY,
        enableIncremental: PerformanceConfig.ENABLE_INCREMENTAL_COMPUTATION,
        poolSize: PerformanceConfig.WORKER_POOL_SIZE || undefined,
        sharedMemorySize: PerformanceConfig.SHARED_MEMORY_SIZE,
        trackFields: PerformanceConfig.INCREMENTAL_TRACK_FIELDS,
      })
    } catch (error) {
      console.error('Failed to initialize AdvancedWorkerManager:', error)
    }
  }

  async processRecursionData(
    _id: any,
    tasks: any[],
    _level: number,
    mapFields: Record<string, string>
  ): Promise<any[]> {
    if (!this.manager) {
      throw new Error('AdvancedWorkerManager not initialized')
    }

    try {
      const sanitizedTasks = sanitizeTasksForWorker(tasks)
      const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)

      // 旧版本这里直接复用了 `processAllData`，会在“只想拿树结构”的装载阶段里
      // 额外再跑一遍全量 bar 位置计算，白白多消耗一份 worker CPU 和消息传输成本。
      // 现在只调用递归展开接口，把 6 万条首屏加载链路压到最短。
      return this.manager.processRecursionData(
        _id,
        sanitizedTasks,
        _level,
        sanitizedMapFields
      )
    } catch (error) {
      console.error('processRecursionData failed:', error)
      throw error
    }
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
    if (!this.manager) {
      throw new Error('AdvancedWorkerManager not initialized')
    }

    try {
      const sanitizedTasks = sanitizeTasksForWorker(tasks)
      const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)
      
      // 位置计算同样复用统一入口，避免适配器和 manager 维护两套近似分支。
      const result = await this.manager.processAllData(
        sanitizedTasks,
        startGanttDate,
        mode,
        scale,
        sanitizedMapFields,
        daySubMode,
        hourSubMode
      )
      return result.positions
    } catch (error) {
      console.error('calcBarPositions failed:', error)
      throw error
    }
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
    if (!this.manager) {
      this.initManager()
    }

    if (!this.manager) {
      throw new Error('AdvancedWorkerManager not initialized')
    }

    return this.manager.processAllData(
      tasks,
      startGanttDate,
      mode,
      scale,
      mapFields,
      daySubMode,
      hourSubMode
    )
  }

  terminate() {
    if (this.manager) {
      this.manager.dispose()
      this.manager = null
    }
  }

  isAvailable(): boolean {
    return this.manager !== null
  }
}

let instance: AdvancedWorkerAdapter | null = null

export function getAdvancedWorkerAdapter(): AdvancedWorkerAdapter {
  if (!instance) {
    instance = new AdvancedWorkerAdapter()
  }
  return instance
}

export function destroyAdvancedWorkerAdapter() {
  if (instance) {
    instance.terminate()
    instance = null
  }
}

export function getWorkerManager(): AdvancedWorkerAdapter {
  return getAdvancedWorkerAdapter()
}

export function destroyWorkerManager() {
  destroyAdvancedWorkerAdapter()
}
