/**
 * Worker Pool
 * 管理多个 Worker 实例,实现并行处理任务
 */

import type { WorkerMessage, WorkerResponse } from './dataProcessor.worker'

export interface PoolWorker {
  worker: Worker
  busy: boolean
  currentTask: string | null
}

export interface PoolTask {
  id: string
  type: WorkerMessage['type']
  payload: any
  priority: number
  createdAt: number
}

export interface PoolConfig {
  workerCount: number
  taskQueueSize?: number
  timeout?: number
}

export type TaskCallback = (result: any, task: PoolTask) => void
export type ErrorCallback = (error: Error, task: PoolTask) => void

export function calculateOptimalWorkerCount(taskCount: number): number {
  const cpuCount = navigator.hardwareConcurrency || 4

  if (taskCount < 500) {
    return Math.min(4, cpuCount)
  } else if (taskCount < 2000) {
    return Math.min(8, cpuCount)
  } else if (taskCount <= 5000) {
    return Math.min(cpuCount, 16)
  } else if (taskCount <= 10000) {
    return Math.min(cpuCount, 24)
  } else {
    return Math.min(cpuCount, 32)
  }
}

export class WorkerPool {
  private workers: PoolWorker[] = []
  private taskQueue: PoolTask[] = []
  private completedTasks: Map<string, any> = new Map()
  private config: PoolConfig
  private messageId = 0
  private listeners: Map<string, Set<TaskCallback>> = new Map()
  private errorListeners: Set<ErrorCallback> = new Set()
  private isShuttingDown = false

  constructor(config?: Partial<PoolConfig>) {
    this.config = {
      workerCount: navigator.hardwareConcurrency || 4,
      taskQueueSize: 1000,
      timeout: 30000,
      ...config,
    }
    this.initializeWorkers()
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.config.workerCount; i++) {
      this.createWorker(i)
    }
    console.log(`WorkerPool initialized with ${this.config.workerCount} workers`)
  }

  private createWorker(index: number): PoolWorker {
    try {
      const worker = new Worker(new URL('./dataProcessor.worker.ts', import.meta.url), {
        type: 'module',
      })

      const poolWorker: PoolWorker = {
        worker,
        busy: false,
        currentTask: null,
      }

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(poolWorker, event.data)
      }

      worker.onerror = (error) => {
        console.error(`Worker ${index} error:`, error)
        this.handleWorkerError(poolWorker, error)
      }

      this.workers.push(poolWorker)
      return poolWorker
    } catch (error) {
      console.error(`Failed to create worker ${index}:`, error)
      throw error
    }
  }

  private handleWorkerMessage(poolWorker: PoolWorker, response: WorkerResponse): void {
    const taskId = response.id
    if (!taskId) return

    poolWorker.busy = false
    poolWorker.currentTask = null

    if (response.error) {
      const error = new Error(response.error)
      this.notifyErrorListeners(error, taskId)
    } else {
      this.completedTasks.set(taskId, response.payload)
      this.notifyListeners(taskId, response.payload)
    }

    this.processNextTask(poolWorker)
  }

  private handleWorkerError(poolWorker: PoolWorker, error: Event | Error): void {
    console.error('Worker error:', error)
    poolWorker.busy = false
    poolWorker.currentTask = null

    const errorMessage = error instanceof Error ? error.message : 'Unknown worker error'
    const wrappedError = new Error(errorMessage)
    this.notifyErrorListeners(wrappedError, poolWorker.currentTask || 'unknown')

    this.processNextTask(poolWorker)
  }

  private processNextTask(poolWorker: PoolWorker): void {
    if (this.taskQueue.length === 0) return

    const task = this.taskQueue.shift()!
    poolWorker.busy = true
    poolWorker.currentTask = task.id

    const message: WorkerMessage = {
      type: task.type,
      payload: task.payload,
      id: task.id,
    }

    poolWorker.worker.postMessage(message)
  }

  private notifyListeners(taskId: string, result: any): void {
    const callbacks = this.listeners.get(taskId)
    if (callbacks) {
      const task = this.completedTasks.has(taskId) 
        ? { id: taskId, type: '' as any, payload: null, priority: 0, createdAt: Date.now() }
        : undefined
      callbacks.forEach(callback => callback(result, task!))
    }
  }

  private notifyErrorListeners(error: Error, taskId: string): void {
    const task: PoolTask = {
      id: taskId,
      type: '' as any,
      payload: null,
      priority: 0,
      createdAt: Date.now(),
    }
    this.errorListeners.forEach(callback => callback(error, task))
  }

  async submit<T>(
    type: WorkerMessage['type'],
    payload: any,
    priority: number = 0
  ): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('WorkerPool is shutting down')
    }

    const taskId = `${type}_${this.messageId++}`
    const task: PoolTask = {
      id: taskId,
      type,
      payload,
      priority,
      createdAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.listeners.delete(taskId)
        reject(new Error(`Task ${taskId} timed out`))
      }, this.config.timeout)

      this.listeners.set(taskId, new Set([(result) => {
        clearTimeout(timeoutId)
        resolve(result as T)
      }]))

      this.enqueueTask(task)
    })
  }

  private enqueueTask(task: PoolTask): void {
    if (this.taskQueue.length >= (this.config.taskQueueSize || 1000)) {
      console.warn('Task queue is full, dropping oldest task')
      this.taskQueue.shift()
    }

    const insertIndex = this.taskQueue.findIndex(t => t.priority < task.priority)
    if (insertIndex === -1) {
      this.taskQueue.push(task)
    } else {
      this.taskQueue.splice(insertIndex, 0, task)
    }

    const idleWorker = this.workers.find(w => !w.busy)
    if (idleWorker) {
      this.processNextTask(idleWorker)
    }
  }

  onComplete(taskId: string, callback: TaskCallback): void {
    const callbacks = this.listeners.get(taskId)
    if (callbacks) {
      callbacks.add(callback)
    } else {
      this.listeners.set(taskId, new Set([callback]))
    }
  }

  onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback)
    return () => {
      this.errorListeners.delete(callback)
    }
  }

  getQueueLength(): number {
    return this.taskQueue.length
  }

  getActiveWorkerCount(): number {
    return this.workers.filter(w => w.busy).length
  }

  getTotalWorkerCount(): number {
    return this.workers.length
  }

  getQueueStatus(): { total: number; active: number; pending: number } {
    return {
      total: this.workers.length,
      active: this.getActiveWorkerCount(),
      pending: this.taskQueue.length,
    }
  }

  resize(newWorkerCount: number): void {
    if (newWorkerCount < 1) newWorkerCount = 1
    if (newWorkerCount > 32) newWorkerCount = 32

    const currentCount = this.workers.length
    if (newWorkerCount === currentCount) return

    if (newWorkerCount > currentCount) {
      for (let i = currentCount; i < newWorkerCount; i++) {
        this.createWorker(i)
      }
    } else {
      const workersToRemove = this.workers.slice(newWorkerCount)
      this.workers = this.workers.slice(0, newWorkerCount)
      workersToRemove.forEach(poolWorker => {
        poolWorker.worker.terminate()
      })
    }

    console.log(`WorkerPool resized from ${currentCount} to ${this.workers.length} workers`)
  }

  async processInParallel<T>(
    tasks: Array<{ type: WorkerMessage['type']; payload: any }>,
    batchSize?: number
  ): Promise<T[]> {
    const actualBatchSize = batchSize || this.config.workerCount
    const results: T[] = []

    for (let i = 0; i < tasks.length; i += actualBatchSize) {
      const batch = tasks.slice(i, i + actualBatchSize)
      const batchPromises = batch.map(task => this.submit<T>(task.type, task.payload))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true

    const terminatePromises = this.workers.map(poolWorker => {
      return new Promise<void>((resolve) => {
        const worker = poolWorker.worker

        const cleanup = () => {
          worker.terminate()
          resolve()
        }

        if (!poolWorker.busy) {
          cleanup()
          return
        }

        const timeoutId = setTimeout(() => {
          console.warn('Worker did not finish in time, forcing termination')
          cleanup()
        }, 5000)

        worker.onmessage = () => {
          clearTimeout(timeoutId)
          cleanup()
        }
      })
    })

    await Promise.all(terminatePromises)

    this.workers = []
    this.taskQueue = []
    this.completedTasks.clear()
    this.listeners.clear()
    this.errorListeners.clear()

    console.log('WorkerPool shutdown complete')
  }
}

let poolInstance: WorkerPool | null = null

export function getWorkerPool(config?: Partial<PoolConfig>): WorkerPool {
  if (!poolInstance) {
    poolInstance = new WorkerPool(config)
  }
  return poolInstance
}

export async function destroyWorkerPool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.shutdown()
    poolInstance = null
  }
}
