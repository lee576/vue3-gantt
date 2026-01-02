import type { GanttTask } from '../types/GanttTypes'
import type { TaskDependency } from '../types/Types'
import { LinkType } from '../types/Types'
import DateUtils from '../utils/dateUtils'
import { i18n } from '../../../locales'

const { differenceInDays, addDays, parseISO } = DateUtils
const t = i18n.global.t

export type ConstraintType =
  | 'ASAP'
  | 'ALAP'
  | 'SNET'
  | 'FNET'
  | 'SNLT'
  | 'FNLT'
  | 'MSO'
  | 'MFO'

export interface TaskConstraint {
  id: string
  taskId: string | number
  constraintType: ConstraintType
  constraintDate?: string
  description?: string
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConstraintValidationResult {
  taskId: string | number
  taskName: string
  isValid: boolean
  violations: ConstraintViolation[]
  warnings: ConstraintWarning[]
}

export interface ConstraintViolation {
  constraintId: string
  constraintType: ConstraintType
  message: string
  severity: 'error' | 'warning'
  currentDate?: string
  constraintDate?: string
}

export interface ConstraintWarning {
  message: string
  suggestion?: string
}

export interface ConstraintAnalysis {
  earliestStart: string
  latestStart: string
  earliestFinish: string
  latestFinish: string
  totalFloat: number
  freeFloat: number
  applicableConstraints: TaskConstraint[]
}

export interface ProjectDateRange {
  startDate: string
  endDate: string
  duration: number
}

export class ConstraintManager {
  private constraints: Map<string | number, TaskConstraint[]> = new Map()
  private constraintIdCounter: number = 0

  constructor() {}

  private generateConstraintId(): string {
    this.constraintIdCounter++
    return `constraint_${Date.now()}_${this.constraintIdCounter}`
  }

  addConstraint(
    taskId: string | number,
    constraintType: ConstraintType,
    options?: {
      constraintDate?: string
      description?: string
      priority?: number
    }
  ): TaskConstraint {
    const constraint: TaskConstraint = {
      id: this.generateConstraintId(),
      taskId,
      constraintType,
      constraintDate: options?.constraintDate,
      description: options?.description,
      priority: options?.priority ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!this.constraints.has(taskId)) {
      this.constraints.set(taskId, [])
    }
    this.constraints.get(taskId)!.push(constraint)

    return constraint
  }

  removeConstraint(constraintId: string): boolean {
    for (const [taskId, taskConstraints] of this.constraints) {
      const index = taskConstraints.findIndex(c => c.id === constraintId)
      if (index !== -1) {
        taskConstraints.splice(index, 1)
        if (taskConstraints.length === 0) {
          this.constraints.delete(taskId)
        }
        return true
      }
    }
    return false
  }

  removeTaskConstraints(taskId: string | number): boolean {
    return this.constraints.delete(taskId)
  }

  updateConstraint(
    constraintId: string,
    updates: Partial<Omit<TaskConstraint, 'id' | 'taskId' | 'createdAt'>>
  ): TaskConstraint | null {
    for (const [, taskConstraints] of this.constraints) {
      const constraint = taskConstraints.find(c => c.id === constraintId)
      if (constraint) {
        Object.assign(constraint, updates, { updatedAt: new Date().toISOString() })
        return constraint
      }
    }
    return null
  }

  getTaskConstraints(taskId: string | number): TaskConstraint[] {
    return this.constraints.get(taskId) || []
  }

  getAllConstraints(): TaskConstraint[] {
    const allConstraints: TaskConstraint[] = []
    for (const taskConstraints of this.constraints.values()) {
      allConstraints.push(...taskConstraints)
    }
    return allConstraints
  }

  getActiveConstraints(taskId: string | number): TaskConstraint[] {
    return this.getTaskConstraints(taskId).filter(c => c.isActive)
  }

  getProjectDateRange(tasks: GanttTask[]): ProjectDateRange {
    if (tasks.length === 0) {
      const today = new Date().toISOString().split('T')[0]
      return { startDate: today, endDate: today, duration: 0 }
    }
    const startDate = tasks.reduce(
      (min, t) => (t.start_date < min ? t.start_date : min),
      tasks[0].start_date
    )
    const endDate = tasks.reduce(
      (max, t) => (t.end_date > max ? t.end_date : max),
      tasks[0].end_date
    )
    const duration = differenceInDays(endDate, startDate) + 1
    return { startDate, endDate, duration }
  }

  isTaskWithinProjectRange(task: GanttTask, projectRange: ProjectDateRange): boolean {
    return task.start_date >= projectRange.startDate && task.end_date <= projectRange.endDate
  }

  getTasksOutsideProjectRange(tasks: GanttTask[], projectRange: ProjectDateRange): GanttTask[] {
    return tasks.filter(t => !this.isTaskWithinProjectRange(t, projectRange))
  }

  setConstraintActive(constraintId: string, active: boolean): TaskConstraint | null {
    return this.updateConstraint(constraintId, { isActive: active })
  }

  analyzeConstraints(
    task: GanttTask,
    dependencies: TaskDependency[]
  ): ConstraintAnalysis {
    const activeConstraints = this.getActiveConstraints(task.id)

    let earliestStart = task.start_date
    let latestStart = task.start_date
    let earliestFinish = task.end_date
    let latestFinish = task.end_date

    for (const constraint of activeConstraints) {
      switch (constraint.constraintType) {
        case 'SNET':
          if (constraint.constraintDate && task.start_date < constraint.constraintDate) {
            earliestStart = constraint.constraintDate
          }
          break
        case 'SNLT':
          if (constraint.constraintDate && task.start_date > constraint.constraintDate) {
            latestStart = constraint.constraintDate
          }
          break
        case 'FNET':
          if (constraint.constraintDate && task.end_date < constraint.constraintDate) {
            earliestFinish = constraint.constraintDate
          }
          break
        case 'FNLT':
          if (constraint.constraintDate && task.end_date > constraint.constraintDate) {
            latestFinish = constraint.constraintDate
          }
          break
        case 'MSO':
          if (constraint.constraintDate) {
            earliestStart = constraint.constraintDate
            latestStart = constraint.constraintDate
          }
          break
        case 'MFO':
          if (constraint.constraintDate) {
            earliestFinish = constraint.constraintDate
            latestFinish = constraint.constraintDate
          }
          break
      }
    }

    for (const dep of dependencies) {
      if (dep.targetTaskId === task.id) {
        const predTask = { start_date: task.start_date, end_date: task.end_date }
        const lag = dep.lag || 0

        switch (dep.type) {
          case LinkType.FINISH_TO_START:
            const predEnd = predTask.end_date
            const fsStart = addDays(predEnd, lag)
            if (fsStart > earliestStart) earliestStart = fsStart
            break
          case LinkType.START_TO_START:
            const predStart = predTask.start_date
            const ssStart = addDays(predStart, lag)
            if (ssStart > earliestStart) earliestStart = ssStart
            break
          case LinkType.FINISH_TO_FINISH:
            const predEndFF = predTask.end_date
            const ffEnd = addDays(predEndFF, lag)
            if (ffEnd > earliestFinish) earliestFinish = ffEnd
            break
          case LinkType.START_TO_FINISH:
            const predStartSF = predTask.start_date
            const sfEnd = addDays(predStartSF, lag)
            if (sfEnd > earliestFinish) earliestFinish = sfEnd
            break
        }
      }
    }

    const totalFloat = differenceInDays(latestStart, earliestStart)
    const freeFloat = Math.max(0, totalFloat)

    return {
      earliestStart,
      latestStart,
      earliestFinish,
      latestFinish,
      totalFloat,
      freeFloat,
      applicableConstraints: activeConstraints,
    }
  }

  validateConstraints(
    tasks: GanttTask[],
    dependencies: TaskDependency[]
  ): ConstraintValidationResult[] {
    const results: ConstraintValidationResult[] = []
    const projectRange = this.getProjectDateRange(tasks)

    for (const task of tasks) {
      const violations: ConstraintViolation[] = []
      const warnings: ConstraintWarning[] = []
      const activeConstraints = this.getActiveConstraints(task.id)

      if (!this.isTaskWithinProjectRange(task, projectRange)) {
        violations.push({
          constraintId: '',
          constraintType: 'FNET',
          message: t('app.constraintMsg.taskOutsideProjectRange', {
            taskName: task.taskNo || String(task.id),
            startDate: projectRange.startDate,
            endDate: projectRange.endDate,
          }),
          severity: 'error',
          currentDate: `${task.start_date} - ${task.end_date}`,
          constraintDate: `${projectRange.startDate} - ${projectRange.endDate}`,
        })
      }

      for (const constraint of activeConstraints) {
        switch (constraint.constraintType) {
          case 'SNET':
            if (
              constraint.constraintDate &&
              task.start_date < constraint.constraintDate
            ) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.startDateEarlier', { constraintDate: constraint.constraintDate }),
                severity: 'error',
                currentDate: task.start_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
          case 'SNLT':
            if (
              constraint.constraintDate &&
              task.start_date > constraint.constraintDate
            ) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.startDateLater', { constraintDate: constraint.constraintDate }),
                severity: 'error',
                currentDate: task.start_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
          case 'FNET':
            if (
              constraint.constraintDate &&
              task.end_date < constraint.constraintDate
            ) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.endDateEarlier', { constraintDate: constraint.constraintDate }),
                severity: 'error',
                currentDate: task.end_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
          case 'FNLT':
            if (
              constraint.constraintDate &&
              task.end_date > constraint.constraintDate
            ) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.endDateLater', { constraintDate: constraint.constraintDate }),
                severity: 'error',
                currentDate: task.end_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
          case 'MSO':
            if (constraint.constraintDate && task.start_date !== constraint.constraintDate) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.msoViolation', { constraintDate: constraint.constraintDate, actualDate: task.start_date }),
                severity: 'error',
                currentDate: task.start_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
          case 'MFO':
            if (constraint.constraintDate && task.end_date !== constraint.constraintDate) {
              violations.push({
                constraintId: constraint.id,
                constraintType: constraint.constraintType,
                message: t('app.constraintMsg.mfoViolation', { constraintDate: constraint.constraintDate, actualDate: task.end_date }),
                severity: 'error',
                currentDate: task.end_date,
                constraintDate: constraint.constraintDate,
              })
            }
            break
        }
      }

      const analysis = this.analyzeConstraints(
        task,
        dependencies
      )

      if (analysis.totalFloat === 0 && activeConstraints.length > 0) {
        warnings.push({
          message: t('app.constraintMsg.criticalPathWarning'),
          suggestion: t('app.constraintMsg.criticalPathSuggestion'),
        })
      }

      if (analysis.earliestStart > task.start_date) {
        warnings.push({
          message: t('app.constraintMsg.dependencyWarning', { earliestDate: analysis.earliestStart }),
          suggestion: t('app.constraintMsg.dependencySuggestion'),
        })
      }

      results.push({
        taskId: task.id,
        taskName: task.taskNo || String(task.id),
        isValid: violations.length === 0,
        violations,
        warnings,
      })
    }

    return results
  }

  detectConstraintConflicts(tasks: GanttTask[]): string[] {
    const conflicts: string[] = []
    const taskMap = new Map(tasks.map(t => [t.id, t]))

    for (const [taskId, taskConstraints] of this.constraints) {
      const snet = taskConstraints.find(
        c => c.constraintType === 'SNET' && c.isActive
      )
      const snlt = taskConstraints.find(
        c => c.constraintType === 'SNLT' && c.isActive
      )
      const fnet = taskConstraints.find(
        c => c.constraintType === 'FNET' && c.isActive
      )
      const fnlt = taskConstraints.find(
        c => c.constraintType === 'FNLT' && c.isActive
      )

      if (snet && snlt && snet.constraintDate && snlt.constraintDate) {
        if (snet.constraintDate > snlt.constraintDate) {
          conflicts.push(
            t('app.constraintMsg.snetSnltConflict', { taskId, snetDate: snet.constraintDate, snltDate: snlt.constraintDate })
          )
        }
      }

      if (fnet && fnlt && fnet.constraintDate && fnlt.constraintDate) {
        if (fnet.constraintDate > fnlt.constraintDate) {
          conflicts.push(
            t('app.constraintMsg.fnetFnltConflict', { taskId, fnetDate: fnet.constraintDate, fnltDate: fnlt.constraintDate })
          )
        }
      }

      const mso = taskConstraints.find(c => c.constraintType === 'MSO' && c.isActive)
      const mfo = taskConstraints.find(c => c.constraintType === 'MFO' && c.isActive)

      if (mso && mfo && mso.constraintDate && mfo.constraintDate) {
        const task = taskMap.get(taskId)
        if (task) {
          const duration = differenceInDays(task.end_date, task.start_date) + 1
          const msoDate = parseISO(mso.constraintDate)
          const mfoDate = parseISO(addDays(msoDate.format('YYYY-MM-DD'), duration - 1))
          if (mfoDate.format('YYYY-MM-DD') !== mfo.constraintDate) {
            conflicts.push(
              t('app.constraintMsg.msoMfoConflict', { taskId })
            )
          }
        }
      }
    }

    return conflicts
  }

  exportConstraints(tasks?: GanttTask[]): string {
    const exportData: Record<string, any> = {
      constraints: {} as Record<string, TaskConstraint[]>,
    }
    
    if (tasks && tasks.length > 0) {
      const projectRange = this.getProjectDateRange(tasks)
      exportData.projectRange = projectRange
      exportData.projectInfo = {
        name: 'Project',
        startDate: projectRange.startDate,
        endDate: projectRange.endDate,
        duration: projectRange.duration,
        exportedAt: new Date().toISOString(),
      }
    }
    
    for (const [taskId, constraints] of this.constraints) {
      exportData.constraints[String(taskId)] = constraints
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  importConstraints(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      this.constraints.clear()
      for (const [taskId, constraints] of Object.entries(data)) {
        this.constraints.set(isNaN(Number(taskId)) ? taskId : Number(taskId), constraints as TaskConstraint[])
      }
      return true
    } catch {
      return false
    }
  }
}

let constraintManagerInstance: ConstraintManager | null = null

export function getConstraintManager(): ConstraintManager {
  if (!constraintManagerInstance) {
    constraintManagerInstance = new ConstraintManager()
  }
  return constraintManagerInstance
}


