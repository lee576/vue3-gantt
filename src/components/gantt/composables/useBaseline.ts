import { ref, computed, shallowRef, watch } from 'vue'
import type { GanttTask } from '../types/GanttTypes'
import type { TaskDependency } from '../types/Types'
import {
  BaselineManager,
  getBaselineManager,
} from '../features/BaselineManager'

export interface BaselineDisplayConfig {
  enabled: boolean
  baselineId: string | null
  color: string
  showVariance: boolean
  varianceThreshold: number
}

export interface Baseline {
  id: string
  name: string
  description?: string
  createdAt: string
  createdBy?: string
  taskBaselines: TaskBaseline[]
  dependencyBaselines?: DependencyBaseline[]
}

export interface TaskBaseline {
  taskId: string | number
  plannedStartDate: string
  plannedEndDate: string
  plannedProgress: number
  plannedDuration: number
}

export interface DependencyBaseline {
  dependencyId: string
  sourceTaskId: string | number
  targetTaskId: string | number
}

export interface BaselineComparison {
  taskId: string | number
  taskName: string
  startDateVariance: number
  endDateVariance: number
  progressVariance: number
  status: 'on-time' | 'ahead' | 'behind' | 'critical'
  message: string
}

export const baselineDisplayConfig = ref<BaselineDisplayConfig>({
  enabled: false,
  baselineId: null,
  color: '#FF6B6B',  // 使用更明显的红色
  showVariance: true,
  varianceThreshold: 2,
})

const baselineManager = shallowRef<BaselineManager>(getBaselineManager())

let tasksData: GanttTask[] = []
let dependenciesData: TaskDependency[] = []

export function setBaselineData(tasks: GanttTask[], dependencies: TaskDependency[]) {
  tasksData = tasks
  dependenciesData = dependencies
}

export const currentBaseline = computed(() => {
  if (!baselineDisplayConfig.value.baselineId) return null
  return baselineManager.value.getBaseline(baselineDisplayConfig.value.baselineId)
})

export const allBaselines = computed(() => baselineManager.value.getAllBaselines())

export const baselineComparisons = computed(() => {
  if (!baselineDisplayConfig.value.baselineId) return []
  if (tasksData.length === 0) return []
  return baselineManager.value.compareWithBaseline(
    baselineDisplayConfig.value.baselineId,
    tasksData
  )
})

export function createBaseline(
  name: string,
  tasks: GanttTask[],
  dependencies: TaskDependency[],
  options?: { description?: string; createdBy?: string }
): Baseline {
  return baselineManager.value.createBaseline(name, tasks, dependencies, options)
}

export function setCurrentBaseline(baselineId: string | null): void {
  baselineDisplayConfig.value.baselineId = baselineId
}

export function deleteBaseline(id: string): boolean {
  const result = baselineManager.value.deleteBaseline(id)
  if (baselineDisplayConfig.value.baselineId === id) {
    baselineDisplayConfig.value.baselineId = null
    baselineDisplayConfig.value.enabled = false
  }
  return result
}

export function enableBaselineDisplay(enabled: boolean): void {
  baselineDisplayConfig.value.enabled = enabled
}

export function setBaselineColor(color: string): void {
  baselineDisplayConfig.value.color = color
}

export function getBaselineDataForTask(
  taskId: string | number
): TaskBaseline | undefined {
  const baseline = currentBaseline.value
  if (!baseline) return undefined
  return baseline.taskBaselines.find(tb => tb.taskId === taskId)
}

export function getBaselineComparisonForTask(
  taskId: string | number,
  currentTask: GanttTask
): BaselineComparison | undefined {
  if (!baselineDisplayConfig.value.baselineId) return undefined
  const comparisons = baselineManager.value.compareWithBaseline(
    baselineDisplayConfig.value.baselineId,
    [currentTask]
  )
  return comparisons.find(c => c.taskId === taskId)
}

export function exportBaseline(id: string): string | null {
  return baselineManager.value.exportBaseline(id)
}

export function importBaseline(jsonData: string): Baseline | null {
  return baselineManager.value.importBaseline(jsonData)
}

export function useBaseline() {
  return {
    baselineDisplayConfig,
    currentBaseline,
    allBaselines,
    baselineComparisons,
    createBaseline,
    setCurrentBaseline,
    deleteBaseline,
    enableBaselineDisplay,
    setBaselineColor,
    getBaselineDataForTask,
    getBaselineComparisonForTask,
    exportBaseline,
    importBaseline,
    baselineManager,
  }
}
