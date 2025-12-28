import { t } from '../../i18n'
import DateUtils from '../../utils/dateUtils'

/**
 * 计算任务在季度视图中的位置和宽度
 * @param start - 甘特图开始日期
 * @param taskStart - 任务开始日期
 * @param taskEnd - 任务结束日期
 * @param scale - 缩放比例（像素/季度）
 * @returns 包含 dataX（X坐标）、width（宽度）、takestime（耗时文本）的对象
 */
export function calcQuarterPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number
) {
  const result = DateUtils.calcQuarterPosition({ start, taskStart, taskEnd, scale })
  return {
    dataX: result.dataX,
    width: result.width,
    takestime: (result.width / scale) + t('durationUnit.quarters'),
  }
}

/**
 * 计算任务在月视图中的位置和宽度
 * @param start - 甘特图开始日期
 * @param taskStart - 任务开始日期
 * @param taskEnd - 任务结束日期
 * @param scale - 缩放比例（像素/月）
 * @returns 包含 dataX（X坐标）、width（宽度）、takestime（耗时文本）的对象
 */
export function calcMonthPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number
) {
  const result = DateUtils.calcMonthPosition({ start, taskStart, taskEnd, scale })
  return {
    dataX: result.dataX,
    width: result.width,
    takestime: (result.width / scale) + t('durationUnit.months'),
  }
}

/**
 * 计算任务在日视图中的位置和宽度
 * @param start - 甘特图开始日期
 * @param taskStart - 任务开始日期
 * @param taskEnd - 任务结束日期
 * @param scale - 缩放比例（像素/天）
 * @param isHalfDay - 是否为半天模式（每天分为上午和下午）
 * @returns 包含 dataX（X坐标）、width（宽度）、takestime（耗时文本）的对象
 */
export function calcDayPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number,
  isHalfDay: boolean
) {
  const result = DateUtils.calcDayPosition({ start, taskStart, taskEnd, scale, isHalfDay })
  return {
    dataX: result.dataX,
    width: result.width,
    takestime: (result.width / scale / (isHalfDay ? 2 : 1)) + t('durationUnit.days'),
  }
}

/**
 * 计算任务在周视图中的位置和宽度
 * @param start - 甘特图开始日期
 * @param taskStart - 任务开始日期
 * @param taskEnd - 任务结束日期
 * @param scale - 缩放比例（像素/周）
 * @returns 包含 dataX（X坐标）、width（宽度）、takestime（耗时文本）的对象
 */
export function calcWeekPosition(start: string, taskStart: string, taskEnd: string, scale: number) {
  const result = DateUtils.calcWeekPosition({ start, taskStart, taskEnd, scale })
  return {
    dataX: result.dataX,
    width: result.width,
    takestime: (result.width / scale) + t('durationUnit.weeks'),
  }
}

/**
 * 计算任务在时视图中的位置和宽度
 * @param start - 甘特图开始日期
 * @param taskStart - 任务开始日期
 * @param taskEnd - 任务结束日期
 * @param scale - 缩放比例（像素/时间单位）
 * @param minuteInterval - 时间间隔（分钟）：60、30 或 15
 * @returns 包含 dataX（X坐标）、width（宽度）、takestime（耗时文本）的对象
 */
export function calcHourPosition(
  start: string,
  taskStart: string,
  taskEnd: string,
  scale: number,
  minuteInterval: number
) {
  const result = DateUtils.calcHourPosition({ start, taskStart, taskEnd, scale, minuteInterval })
  
  if (minuteInterval < 60) {
    const fromPlanStartMinutes = DateUtils.diff(taskStart, start, 'minutes')
    const spendMinutes = DateUtils.diff(taskEnd, taskStart, 'minutes') + minuteInterval
    const diffHours = Math.floor(spendMinutes / 60)
    const remainMinutes = spendMinutes % 60
    let takestime = ''
    if (diffHours > 0 && remainMinutes > 0) {
      takestime = t('durationUnit.hoursAndMinutes', { hours: diffHours, minutes: remainMinutes })
    } else if (diffHours > 0) {
      takestime = `${diffHours}${t('durationUnit.hours')}`
    } else {
      takestime = `${remainMinutes}${t('durationUnit.minutes')}`
    }
    return { dataX: result.dataX, width: result.width, takestime }
  } else {
    const spendHours = DateUtils.diff(taskEnd, taskStart, 'hours') + 1
    return { dataX: result.dataX, width: result.width, takestime: spendHours + t('durationUnit.hours') }
  }
}
