/**
 * Web Worker for data processing
 * 处理递归数据和日期计算,减少主线程负载
 */

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.extend(customParseFormat);

/**
 * 消息类型定义
 */
export type WorkerMessageType =
  | 'PROCESS_RECURSION_DATA'
  | 'CALC_BAR_POSITIONS'
  | 'CALC_DATES'
  | 'FORMAT_DATES';

export interface WorkerMessage {
  type: WorkerMessageType;
  payload: any;
  id?: string;
}

export interface WorkerResponse {
  type: WorkerMessageType;
  payload: any;
  id?: string;
  error?: string;
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
  const findResult = tasks.filter(obj => obj[mapFields['parentId']] === id);

  if (findResult && findResult.length > 0) {
    level++;
    for (let i = 0; i < findResult.length; i++) {
      findResult[i].treeLevel = level;
      findResult[i].index = i + 1;

      const parent = initData.filter(
        obj => obj[mapFields['id']] === findResult[i][mapFields['parentId']]
      );

      if (parent && parent.length > 0) {
        // 构建序号
        let result = parent[0].index + '.' + findResult[i].index;

        // 查找所有父级
        let currentParent = parent[0];
        while (currentParent[mapFields['parentId']] !== '0') {
          const upperParent = initData.find(
            obj => obj[mapFields['id']] === currentParent[mapFields['parentId']]
          );
          if (upperParent) {
            result = upperParent.index + '.' + result;
            currentParent = upperParent;
          } else {
            break;
          }
        }

        findResult[i].no = result;
      } else {
        findResult[i].no = (i + 1) + '';
      }

      initData.push(findResult[i]);
      processRecursionData(
        findResult[i][mapFields['id']],
        tasks,
        level,
        mapFields,
        initData
      );
    }
  }

  return initData;
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
    const taskStart = task[mapFields['startDate']];
    const taskEnd = task[mapFields['endDate']];

    if (!taskStart || !taskEnd) {
      return { id: task[mapFields['id']], position: null };
    }

    const position = calcPositionForMode(
      startGanttDate,
      taskStart,
      taskEnd,
      mode,
      scale,
      daySubMode,
      hourSubMode
    );

    return {
      id: task[mapFields['id']],
      position
    };
  });

  return results;
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
        return calcQuarterPosition(start, taskStart, taskEnd, scale);
      case '月':
        return calcMonthPosition(start, taskStart, taskEnd, scale);
      case '周':
        return calcWeekPosition(start, taskStart, taskEnd, scale);
      case '日':
        return calcDayPosition(start, taskStart, taskEnd, scale, daySubMode === 'half');
      case '时':
        const minuteInterval = parseInt(hourSubMode || '60');
        return calcHourPosition(start, taskStart, taskEnd, scale, minuteInterval);
      default:
        return null;
    }
  } catch (error) {
    console.error('Error calculating position:', error);
    return null;
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
  const ganttStartQuarter = dayjs(start).startOf('quarter');
  const taskStartQuarter = dayjs(taskStart).startOf('quarter');
  const taskEndQuarter = dayjs(taskEnd).startOf('quarter');

  const fromStartQuarters =
    (taskStartQuarter.year() - ganttStartQuarter.year()) * 4 +
    (taskStartQuarter.quarter() - ganttStartQuarter.quarter());
  const dataX = scale * fromStartQuarters;

  const spendQuarters =
    (taskEndQuarter.year() - taskStartQuarter.year()) * 4 +
    (taskEndQuarter.quarter() - taskStartQuarter.quarter()) + 1;

  return { dataX, width: spendQuarters * scale };
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
  const ganttStartMonth = dayjs(start).startOf('month');
  const taskStartMonth = dayjs(taskStart).startOf('month');
  const taskEndMonth = dayjs(taskEnd).startOf('month');

  const fromStartMonths =
    (taskStartMonth.year() - ganttStartMonth.year()) * 12 +
    (taskStartMonth.month() - ganttStartMonth.month());
  const dataX = scale * fromStartMonths;

  const spendMonths =
    (taskEndMonth.year() - taskStartMonth.year()) * 12 +
    (taskEndMonth.month() - taskStartMonth.month()) + 1;

  return { dataX, width: spendMonths * scale };
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
  const startGanttWeek = dayjs(start).startOf('isoWeek');
  const taskStartWeek = dayjs(taskStart).startOf('isoWeek');
  const fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week');
  const dataX = scale * fromPlanStartWeeks;

  const taskEndWeek = dayjs(taskEnd).startOf('isoWeek');
  const spendWeeks = taskEndWeek.diff(taskStartWeek, 'week') + 1;

  return { dataX, width: spendWeeks * scale };
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
  const cellsPerDay = isHalfDay ? 2 : 1;
  const fromPlanStartDays = dayjs(taskStart).diff(dayjs(start), 'days');
  let dataX: number;
  let width: number;

  if (isHalfDay) {
    const startHour = dayjs(taskStart).hour();
    const endHour = dayjs(taskEnd).hour();
    const startIsAM = startHour < 12;
    const endIsAM = endHour < 12;

    const startCellOffset = startIsAM ? 0 : 1;
    const endCellOffset = endIsAM ? 0 : 1;

    dataX = scale * (fromPlanStartDays * 2 + startCellOffset);

    const endDays = dayjs(taskEnd).diff(dayjs(start), 'days');
    const endCellIndex = endDays * 2 + endCellOffset;
    const startCellIndex = fromPlanStartDays * 2 + startCellOffset;

    width = (endCellIndex - startCellIndex + 1) * scale;
  } else {
    dataX = scale * fromPlanStartDays * cellsPerDay;
    const spendDays = dayjs(taskEnd).diff(dayjs(taskStart), 'days') + 1;
    width = spendDays * scale * cellsPerDay;
  }

  return { dataX, width };
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
    const fromPlanStartMinutes = dayjs(taskStart).diff(dayjs(start), 'minutes');
    const cellIndex = Math.floor(fromPlanStartMinutes / minuteInterval);
    const dataX = scale * cellIndex;

    const spendMinutes = dayjs(taskEnd).diff(dayjs(taskStart), 'minutes') + minuteInterval;
    const widthCells = Math.ceil(spendMinutes / minuteInterval);
    const width = widthCells * scale;

    return { dataX, width };
  } else {
    const fromPlanStartHours = dayjs(taskStart).diff(dayjs(start), 'hours');
    const dataX = scale * fromPlanStartHours;
    const spendHours = dayjs(taskEnd).diff(dayjs(taskStart), 'hours') + 1;
    return { dataX, width: spendHours * scale };
  }
}

/**
 * 批量格式化日期
 */
function formatDates(
  dates: string[],
  format: string
): string[] {
  return dates.map(date => {
    try {
      return dayjs(date).format(format);
    } catch (error) {
      return date;
    }
  });
}

/**
 * 批量计算日期
 */
function calcDates(
  operations: Array<{
    type: 'add' | 'subtract' | 'diff';
    date: string;
    amount?: number;
    unit?: any;
    date2?: string;
  }>
): any[] {
  return operations.map(op => {
    try {
      switch (op.type) {
        case 'add':
          return dayjs(op.date).add(op.amount || 0, op.unit).format('YYYY-MM-DD HH:mm:ss');
        case 'subtract':
          return dayjs(op.date).subtract(op.amount || 0, op.unit).format('YYYY-MM-DD HH:mm:ss');
        case 'diff':
          return dayjs(op.date).diff(dayjs(op.date2), op.unit);
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  });
}

/**
 * Worker 消息处理
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'PROCESS_RECURSION_DATA':
        result = processRecursionData(
          payload.id,
          payload.tasks,
          payload.level,
          payload.mapFields,
          []
        );
        break;

      case 'CALC_BAR_POSITIONS':
        result = calcBarPositions(
          payload.tasks,
          payload.startGanttDate,
          payload.mode,
          payload.scale,
          payload.mapFields,
          payload.daySubMode,
          payload.hourSubMode
        );
        break;

      case 'FORMAT_DATES':
        result = formatDates(payload.dates, payload.format);
        break;

      case 'CALC_DATES':
        result = calcDates(payload.operations);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: WorkerResponse = {
      type,
      payload: result,
      id
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type,
      payload: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    self.postMessage(response);
  }
};

// 导出类型供主线程使用
export type { WorkerResponse };
