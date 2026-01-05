/**
 * Advanced Worker Manager Adapter
 * 提供与原有 WorkerManager 接口兼容的适配器，内部使用 AdvancedWorkerManager
 */

import type { WorkerMessage, WorkerResponse } from './dataProcessor.worker'
import { AdvancedWorkerManager, type ProcessedData } from './AdvancedWorkerManager'
import { PerformanceConfig } from '../composables/PerformanceConfig'
import { sanitizeTasksForWorker, sanitizeMapFieldsForWorker } from './workerDataSerializer'

export class AdvancedWorkerAdapter {
  private manager: AdvancedWorkerManager | null = null
  private messageId = 0
  private timeout = 10000

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
    id: any,
    tasks: any[],
    level: number,
    mapFields: Record<string, string>
  ): Promise<any[]> {
    if (!this.manager) {
      throw new Error('AdvancedWorkerManager not initialized')
    }

    try {
      const sanitizedTasks = sanitizeTasksForWorker(tasks)
      const sanitizedMapFields = sanitizeMapFieldsForWorker(mapFields)
      
      const mode = '月'
      const scale = 1
      const startGanttDate = new Date().toISOString().split('T')[0]
      const result = await this.manager.processAllData(
        sanitizedTasks,
        startGanttDate,
        mode,
        scale,
        sanitizedMapFields
      )
      return result.recursionData
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
