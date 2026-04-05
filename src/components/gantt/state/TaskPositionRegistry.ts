import { shallowRef, triggerRef } from 'vue'
import { PerformanceConfig } from '../composables/PerformanceConfig'

export interface TaskVisualPosition {
  taskId: string | number
  kind: 'bar' | 'milestone'
  leftX: number
  rightX: number
  centerX: number
  centerY: number
  width: number
  height: number
  topY: number
  bottomY: number
}

const taskPositions = shallowRef(new Map<string, TaskVisualPosition>())
let pendingTrigger = false

const normalizeTaskKey = (taskId: string | number): string => String(taskId)

const flushTaskPositionChanges = () => {
  pendingTrigger = false
  triggerRef(taskPositions)
}

const scheduleTaskPositionTrigger = () => {
  // 拖动滚动条时，可见窗口里的 bar / milestone 会在一帧内批量卸载再批量挂载。
  // 如果每条记录都立即 triggerRef，连线层会在同一帧里被重复唤醒很多次。
  // 这里把所有位置变更压到下一帧统一提交，把“每个元素一次重算”收敛成“每帧最多一次重算”。
  if (pendingTrigger) {
    return
  }

  pendingTrigger = true

  if (typeof window !== 'undefined' && PerformanceConfig.USE_RAF) {
    window.requestAnimationFrame(() => {
      flushTaskPositionChanges()
    })
    return
  }

  setTimeout(() => {
    flushTaskPositionChanges()
  }, PerformanceConfig.BATCH_UPDATE_DELAY)
}

const hasPositionChanged = (
  previous: TaskVisualPosition | undefined,
  next: TaskVisualPosition
): boolean => {
  if (!previous) {
    return true
  }

  return (
    previous.kind !== next.kind ||
    previous.leftX !== next.leftX ||
    previous.rightX !== next.rightX ||
    previous.centerX !== next.centerX ||
    previous.centerY !== next.centerY ||
    previous.width !== next.width ||
    previous.height !== next.height ||
    previous.topY !== next.topY ||
    previous.bottomY !== next.bottomY
  )
}

export const registerTaskPosition = (position: TaskVisualPosition): void => {
  const taskKey = normalizeTaskKey(position.taskId)
  const previous = taskPositions.value.get(taskKey)

  // 位置注册会在拖拽、缩放、滚动窗口切换时高频触发。
  // 如果几何数据没有发生变化，就不触发 triggerRef，避免连线层做无意义重算。
  if (!hasPositionChanged(previous, position)) {
    return
  }

  taskPositions.value.set(taskKey, position)
  scheduleTaskPositionTrigger()
}

export const unregisterTaskPosition = (taskId: string | number): void => {
  if (taskPositions.value.delete(normalizeTaskKey(taskId))) {
    scheduleTaskPositionTrigger()
  }
}

export const clearTaskPositions = (): void => {
  if (taskPositions.value.size === 0) {
    return
  }

  // 全量清空只在任务集大规模切换时用；普通场景优先让单个组件在卸载时自己注销。
  taskPositions.value.clear()
  scheduleTaskPositionTrigger()
}

export const useTaskPositionRegistry = () => {
  return {
    taskPositions,
    registerTaskPosition,
    unregisterTaskPosition,
    clearTaskPositions,
  }
}
