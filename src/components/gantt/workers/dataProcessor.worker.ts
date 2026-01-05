/**
 * Web Worker for data processing
 * 处理递归数据和日期计算,减少主线程负载
 */

import DateUtils from '../utils/dateUtils'

/**
 * 消息类型定义
 */
export type WorkerMessageType =
  | 'PROCESS_RECURSION_DATA'
  | 'CALC_BAR_POSITIONS'
  | 'CALC_DATES'
  | 'FORMAT_DATES'

export interface WorkerMessage {
  type: WorkerMessageType
  payload: any
  id?: string
}

export interface WorkerResponse {
  type: WorkerMessageType
  payload: any
  id?: string
  error?: string
}

/**
 * 递归处理数据
 * 将扁平化的树形数据处理为带层级的数据
 */
function processRecursionData(
  id: any,
  tasks: any[],
  level: number,
  mapFields: Record<string, string>,
  initData: any[] = []
): any[] {
  const findResult = tasks.filter(obj => obj[mapFields['parentId']] === id)

  if (findResult && findResult.length > 0) {
    level++
    for (let i = 0; i < findResult.length; i++) {
      findResult[i].treeLevel = level
      findResult[i].index = i + 1

      const parent = initData.filter(
        obj => obj[mapFields['id']] === findResult[i][mapFields['parentId']]
      )

      if (parent && parent.length > 0) {
        // 构建序号
        let result = parent[0].index + '.' + findResult[i].index

        // 查找所有父级
        let currentParent = parent[0]
        while (currentParent[mapFields['parentId']] !== '0') {
          const upperParent = initData.find(
            obj => obj[mapFields['id']] === currentParent[mapFields['parentId']]
          )
          if (upperParent) {
            result = upperParent.index + '.' + result
            currentParent = upperParent
          } else {
            break
          }
        }

        findResult[i].no = result
      } else {
        findResult[i].no = i + 1 + ''
      }

      initData.push(findResult[i])
      processRecursionData(findResult[i][mapFields['id']], tasks, level, mapFields, initData)
    }
  }

  return initData
}

/**
 * 批量计算甘特图条的位置
 */
function calcBarPositions(
  tasks: any[],
  startGanttDate: string,
  mode: string,
  scale: number,
  mapFields: Record<string, string>,
  daySubMode?: string,
  hourSubMode?: string
): any[] {
  const results = tasks.map(task => {
    const taskStart = task[mapFields['startDate']]
    const taskEnd = task[mapFields['endDate']]

    if (!taskStart || !taskEnd) {
      return { id: task[mapFields['id']], position: null }
    }

    const position = calcPositionForMode(
      startGanttDate,
      taskStart,
      taskEnd,
      mode,
      scale,
      daySubMode,
      hourSubMode
    )

    return {
      id: task[mapFields['id']],
      position,
    }
  })

  return results
}

/**
 * 根据不同模式计算位置
 */
function calcPositionForMode(
  start: string,
  taskStart: string,
  taskEnd: string,
  mode: string,
  scale: number,
  daySubMode?: string,
  hourSubMode?: string
): { dataX: number; width: number } | null {
  try {
    switch (mode) {
      case '季度':
        return calcQuarterPosition(start, taskStart, taskEnd, scale)
      case '月':
        return calcMonthPosition(start, taskStart, taskEnd, scale)
      case '周':
        return calcWeekPosition(start, taskStart, taskEnd, scale)
      case '日':
        return calcDayPosition(start, taskStart, taskEnd, scale, daySubMode === 'half')
      case '时': {
        const minuteInterval = parseInt(hourSubMode || '60')
        return calcHourPosition(start, taskStart, taskEnd, scale, minuteInterval)
      }
      default:
        return null
    }
  } catch (error) {
    console.error('Error calculating position:', error)
    return null
  }
}

/**
 * 计算季度位置
 */
function calcQuarterPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number
): { dataX: number; width: number } {
  const ganttStartQuarter = DateUtils.startOf(start, 'quarter')
  const taskStartQuarter = DateUtils.startOf(taskStart, 'quarter')
  const taskEndQuarter = DateUtils.startOf(taskEnd, 'quarter')

  const fromStartQuarters =
    (DateUtils.year(taskStartQuarter) - DateUtils.year(ganttStartQuarter)) * 4 +
    (DateUtils.quarter(taskStartQuarter) - DateUtils.quarter(ganttStartQuarter))
  const dataX = scale * fromStartQuarters

  const spendQuarters =
    (DateUtils.year(taskEndQuarter) - DateUtils.year(taskStartQuarter)) * 4 +
    (DateUtils.quarter(taskEndQuarter) - DateUtils.quarter(taskStartQuarter)) +
    1

  return { dataX, width: spendQuarters * scale }
}

/**
 * 计算月份位置
 */
function calcMonthPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number
): { dataX: number; width: number } {
  const ganttStartMonth = DateUtils.startOf(start, 'month')
  const taskStartMonth = DateUtils.startOf(taskStart, 'month')
  const taskEndMonth = DateUtils.startOf(taskEnd, 'month')

  const fromStartMonths =
    (DateUtils.year(taskStartMonth) - DateUtils.year(ganttStartMonth)) * 12 +
    (DateUtils.month(taskStartMonth) - DateUtils.month(ganttStartMonth))
  const dataX = scale * fromStartMonths

  const spendMonths =
    (DateUtils.year(taskEndMonth) - DateUtils.year(taskStartMonth)) * 12 +
    (DateUtils.month(taskEndMonth) - DateUtils.month(taskStartMonth)) +
    1

  return { dataX, width: spendMonths * scale }
}

/**
 * 计算周位置
 */
function calcWeekPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number
): { dataX: number; width: number } {
  const startGanttWeek = DateUtils.startOf(start, 'isoWeek')
  const taskStartWeek = DateUtils.startOf(taskStart, 'isoWeek')
  const fromPlanStartWeeks = DateUtils.diff(taskStartWeek, startGanttWeek, 'week')
  const dataX = scale * fromPlanStartWeeks

  const taskEndWeek = DateUtils.startOf(taskEnd, 'isoWeek')
  const spendWeeks = DateUtils.diff(taskEndWeek, taskStartWeek, 'week') + 1

  return { dataX, width: spendWeeks * scale }
}

/**
 * 计算日位置
 */
function calcDayPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number,
  isHalfDay: boolean
): { dataX: number; width: number } {
  const cellsPerDay = isHalfDay ? 2 : 1
  const fromPlanStartDays = DateUtils.diff(taskStart, start, 'days')
  let dataX: number
  let width: number

  if (isHalfDay) {
    const startHour = DateUtils.hour(taskStart)
    const endHour = DateUtils.hour(taskEnd)
    const startIsAM = startHour < 12
    const endIsAM = endHour < 12

    const startCellOffset = startIsAM ? 0 : 1
    const endCellOffset = endIsAM ? 0 : 1

    dataX = scale * (fromPlanStartDays * 2 + startCellOffset)

    const endDays = DateUtils.diff(taskEnd, start, 'days')
    const endCellIndex = endDays * 2 + endCellOffset
    const startCellIndex = fromPlanStartDays * 2 + startCellOffset

    width = (endCellIndex - startCellIndex + 1) * scale
  } else {
    dataX = scale * fromPlanStartDays * cellsPerDay
    const spendDays = DateUtils.diff(taskEnd, taskStart, 'days') + 1
    width = spendDays * scale * cellsPerDay
  }

  return { dataX, width }
}

/**
 * 计算小时位置
 */
function calcHourPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number,
  minuteInterval: number
): { dataX: number; width: number } {
  if (minuteInterval < 60) {
    const fromPlanStartMinutes = DateUtils.diff(taskStart, start, 'minutes')
    const cellIndex = Math.floor(fromPlanStartMinutes / minuteInterval)
    const dataX = scale * cellIndex

    const spendMinutes = DateUtils.diff(taskEnd, taskStart, 'minutes') + minuteInterval
    const widthCells = Math.ceil(spendMinutes / minuteInterval)
    const width = widthCells * scale

    return { dataX, width }
  } else {
    const fromPlanStartHours = DateUtils.diff(taskStart, start, 'hours')
    const dataX = scale * fromPlanStartHours
    const spendHours = DateUtils.diff(taskEnd, taskStart, 'hours') + 1
    return { dataX, width: spendHours * scale }
  }
}

/**
 * 批量格式化日期
 */
function formatDates(dates: string[], format: string): string[] {
  return dates.map(date => {
    try {
      return DateUtils.format(date, format)
    } catch (error) {
      return date
    }
  })
}

/**
 * 批量计算日期
 */
function calcDates(
  operations: Array<{
    type: 'add' | 'subtract' | 'diff'
    date: string
    amount?: number
    unit?: any
    date2?: string
  }>
): any[] {
  return operations.map(op => {
    try {
      switch (op.type) {
        case 'add':
          return DateUtils.format(
            DateUtils.add(op.date, op.amount || 0, op.unit),
            'YYYY-MM-DD HH:mm:ss'
          )
        case 'subtract':
          return DateUtils.format(
            DateUtils.subtract(op.date, op.amount || 0, op.unit),
            'YYYY-MM-DD HH:mm:ss'
          )
        case 'diff':
          return DateUtils.diff(op.date, op.date2 || '', op.unit)
        default:
          return null
      }
    } catch (error) {
      return null
    }
  })
}

/**
 * Worker 消息处理
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data

  try {
    let result: any

    switch (type) {
      case 'PROCESS_RECURSION_DATA':
        result = processRecursionData(
          payload.id,
          payload.tasks,
          payload.level,
          payload.mapFields,
          []
        )
        break

      case 'CALC_BAR_POSITIONS':
        result = calcBarPositions(
          payload.tasks,
          payload.startGanttDate,
          payload.mode,
          payload.scale,
          payload.mapFields,
          payload.daySubMode,
          payload.hourSubMode
        )
        break

      case 'FORMAT_DATES':
        result = formatDates(payload.dates, payload.format)
        break

      case 'CALC_DATES':
        result = calcDates(payload.operations)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    const response: WorkerResponse = {
      type,
      payload: result,
      id,
    }

    self.postMessage(response)
  } catch (error) {
    const response: WorkerResponse = {
      type,
      payload: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    self.postMessage(response)
  }
}