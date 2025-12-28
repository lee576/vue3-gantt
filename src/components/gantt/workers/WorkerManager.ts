/**
 * Web Worker Manager
 * 管理 Worker 实例,提供便捷的调用接口
 */

import type { WorkerMessage, WorkerResponse } from './dataProcessor.worker'

export class WorkerManager {
  private worker: Worker | null = null
  private messageId = 0
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: any) => void
      timeout?: ReturnType<typeof setTimeout>
    }
  >()

  // Worker 超时时间(毫秒)
  private timeout = 10000

  constructor() {
    this.initWorker()
  }

  /**
   * 初始化 Worker
   */
  private initWorker() {
    try {
      // Vite 使用 ?worker 后缀导入 Worker
      this.worker = new Worker(new URL('./dataProcessor.worker.ts', import.meta.url), {
        type: 'module',
      })

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(event.data)
      }

      this.worker.onerror = error => {
        console.error('Worker error:', error)
        // 重新初始化 Worker
        this.terminate()
        this.initWorker()
      }
    } catch (error) {
      console.error('Failed to initialize worker:', error)
    }
  }

  /**
   * 处理 Worker 返回的消息
   */
  private handleWorkerMessage(response: WorkerResponse) {
    const { id, payload, error } = response

    if (!id) return

    const pending = this.pendingRequests.get(id)
    if (pending) {
      // 清除超时计时器
      if (pending.timeout) {
        clearTimeout(pending.timeout)
      }

      if (error) {
        pending.reject(new Error(error))
      } else {
        pending.resolve(payload)
      }

      this.pendingRequests.delete(id)
    }
  }

  /**
   * 发送消息到 Worker
   */
  private sendMessage<T>(type: WorkerMessage['type'], payload: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = `${type}_${this.messageId++}`

      // 设置超时
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Worker timeout for ${type}`))
      }, this.timeout)

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: timeoutId,
      })

      const message: WorkerMessage = {
        type,
        payload,
        id,
      }

      this.worker.postMessage(message)
    })
  }

  /**
   * 处理递归数据
   */
  async processRecursionData(
    id: any,
    tasks: any[],
    level: number,
    mapFields: Record<string, string>
  ): Promise<any[]> {
    return this.sendMessage('PROCESS_RECURSION_DATA', {
      id,
      tasks,
      level,
      mapFields,
    })
  }

  /**
   * 批量计算甘特图条的位置
   */
  async calcBarPositions(
    tasks: any[],
    startGanttDate: string,
    mode: string,
    scale: number,
    mapFields: Record<string, string>,
    daySubMode?: string,
    hourSubMode?: string
  ): Promise<any[]> {
    return this.sendMessage('CALC_BAR_POSITIONS', {
      tasks,
      startGanttDate,
      mode,
      scale,
      mapFields,
      daySubMode,
      hourSubMode,
    })
  }

  /**
   * 批量格式化日期
   */
  async formatDates(dates: string[], format: string): Promise<string[]> {
    return this.sendMessage('FORMAT_DATES', {
      dates,
      format,
    })
  }

  /**
   * 批量计算日期
   */
  async calcDates(
    operations: Array<{
      type: 'add' | 'subtract' | 'diff'
      date: string
      amount?: number
      unit?: any
      date2?: string
    }>
  ): Promise<any[]> {
    return this.sendMessage('CALC_DATES', {
      operations,
    })
  }

  /**
   * 终止 Worker
   */
  terminate() {
    if (this.worker) {
      // 清除所有待处理的请求
      this.pendingRequests.forEach(({ reject, timeout }) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        reject(new Error('Worker terminated'))
      })
      this.pendingRequests.clear()

      this.worker.terminate()
      this.worker = null
    }
  }

  /**
   * 检查 Worker 是否可用
   */
  isAvailable(): boolean {
    return this.worker !== null
  }
}

// 创建单例实例
let instance: WorkerManager | null = null

/**
 * 获取 WorkerManager 实例
 */
export function getWorkerManager(): WorkerManager {
  if (!instance) {
    instance = new WorkerManager()
  }
  return instance
}

/**
 * 销毁 WorkerManager 实例
 */
export function destroyWorkerManager() {
  if (instance) {
    instance.terminate()
    instance = null
  }
}
