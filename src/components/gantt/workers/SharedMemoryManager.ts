/**
 * Shared Memory Manager using SharedArrayBuffer
 * 提供共享内存支持,显著减少主线程与 Worker 之间的数据传输开销
 */

export interface SharedMemoryConfig {
  initialSize: number
  maxSize?: number
}

export interface SharedBufferInfo {
  buffer: SharedArrayBuffer
  byteLength: number
}

export interface SharedTaskData {
  taskCount: number
  dataOffset: number
  dataLength: number
  operation: SharedOperation
}

export type SharedOperation = 
  | 'PROCESS_RECURSION_DATA'
  | 'CALC_BAR_POSITIONS'
  | 'FORMAT_DATES'
  | 'CALC_DATES'

export class SharedMemoryManager {
  private sharedBuffer: SharedArrayBuffer | null = null
  private dataView: DataView | null = null
  private usedBytes = 0
  private config: SharedMemoryConfig

  constructor(config: SharedMemoryConfig) {
    this.config = config
    this.initializeBuffer()
  }

  private initializeBuffer(): void {
    try {
      if (!('SharedArrayBuffer' in globalThis)) {
        console.warn('SharedArrayBuffer not supported, falling back to message passing')
        return
      }

      this.sharedBuffer = new SharedArrayBuffer(this.config.initialSize)
      this.dataView = new DataView(this.sharedBuffer)
      this.usedBytes = 0

      console.log('SharedArrayBuffer initialized with size:', this.sharedBuffer.byteLength)
    } catch (error) {
      console.error('Failed to initialize SharedArrayBuffer:', error)
    }
  }

  isSupported(): boolean {
    return this.sharedBuffer !== null && this.dataView !== null
  }

  getBuffer(): SharedArrayBuffer | null {
    return this.sharedBuffer
  }

  allocate(size: number): number | null {
    if (!this.sharedBuffer || !this.dataView) {
      return null
    }

    const alignment = 8
    const alignedSize = Math.ceil(size / alignment) * alignment

    if (this.usedBytes + alignedSize > this.sharedBuffer.byteLength) {
      console.warn('SharedArrayBuffer out of memory')
      return null
    }

    const offset = this.usedBytes
    this.usedBytes += alignedSize
    return offset
  }

  writeString(offset: number, str: string): boolean {
    if (!this.dataView) return false

    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    const length = bytes.length

    if (offset + 4 + length > this.sharedBuffer!.byteLength) {
      return false
    }

    this.dataView.setUint32(offset, length, true)
    const dataOffset = offset + 4

    for (let i = 0; i < length; i++) {
      this.dataView.setUint8(dataOffset + i, bytes[i])
    }

    return true
  }

  readString(offset: number): string | null {
    if (!this.dataView) return null

    const length = this.dataView.getUint32(offset, true)
    if (length === 0) return ''

    const dataOffset = offset + 4
    const bytes = new Uint8Array(length)

    for (let i = 0; i < length; i++) {
      bytes[i] = this.dataView.getUint8(dataOffset + i)
    }

    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  }

  writeTaskArray(offset: number, tasks: any[]): boolean {
    if (!this.dataView) return false

    try {
      const serialized = JSON.stringify(tasks)
      const encoder = new TextEncoder()
      const bytes = encoder.encode(serialized)
      const length = bytes.length

      if (offset + 4 + length > this.sharedBuffer!.byteLength) {
        return false
      }

      this.dataView.setUint32(offset, length, true)
      const dataOffset = offset + 4

      for (let i = 0; i < length; i++) {
        this.dataView.setUint8(dataOffset + i, bytes[i])
      }

      return true
    } catch (error) {
      console.error('Error writing task array:', error)
      return false
    }
  }

  readTaskArray(offset: number): any[] | null {
    if (!this.dataView) return null

    const length = this.dataView.getUint32(offset, true)
    if (length === 0) return []

    const dataOffset = offset + 4
    const bytes = new Uint8Array(length)

    for (let i = 0; i < length; i++) {
      bytes[i] = this.dataView.getUint8(dataOffset + i)
    }

    const decoder = new TextDecoder()
    const serialized = decoder.decode(bytes)

    try {
      return JSON.parse(serialized)
    } catch {
      return null
    }
  }

  writeTaskPositions(offset: number, positions: any[]): boolean {
    if (!this.dataView) return false

    try {
      const serialized = JSON.stringify(positions)
      const encoder = new TextEncoder()
      const bytes = encoder.encode(serialized)
      const length = bytes.length

      if (offset + 4 + length > this.sharedBuffer!.byteLength) {
        return false
      }

      this.dataView.setUint32(offset, length, true)
      const dataOffset = offset + 4

      for (let i = 0; i < length; i++) {
        this.dataView.setUint8(dataOffset + i, bytes[i])
      }

      return true
    } catch (error) {
      console.error('Error writing positions:', error)
      return false
    }
  }

  readTaskPositions(offset: number): any[] | null {
    if (!this.dataView) return null

    const length = this.dataView.getUint32(offset, true)
    if (length === 0) return []

    const dataOffset = offset + 4
    const bytes = new Uint8Array(length)

    for (let i = 0; i < length; i++) {
      bytes[i] = this.dataView.getUint8(dataOffset + i)
    }

    const decoder = new TextDecoder()
    const serialized = decoder.decode(bytes)

    try {
      return JSON.parse(serialized)
    } catch {
      return null
    }
  }

  reset(): void {
    this.usedBytes = 0
  }

  getUsedBytes(): number {
    return this.usedBytes
  }

  getAvailableBytes(): number {
    return this.sharedBuffer ? this.sharedBuffer.byteLength - this.usedBytes : 0
  }

  dispose(): void {
    this.sharedBuffer = null
    this.dataView = null
    this.usedBytes = 0
  }
}

let sharedMemoryInstance: SharedMemoryManager | null = null

export function getSharedMemoryManager(config?: SharedMemoryConfig): SharedMemoryManager {
  if (!sharedMemoryInstance) {
    const defaultConfig: SharedMemoryConfig = {
      initialSize: 1024 * 1024,
      maxSize: 4 * 1024 * 1024,
    }
    sharedMemoryInstance = new SharedMemoryManager(config || defaultConfig)
  }
  return sharedMemoryInstance
}

export function destroySharedMemoryManager(): void {
  if (sharedMemoryInstance) {
    sharedMemoryInstance.dispose()
    sharedMemoryInstance = null
  }
}
