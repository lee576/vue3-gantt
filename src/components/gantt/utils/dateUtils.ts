import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import isBetween from 'dayjs/plugin/isBetween'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/fr'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/ru'

dayjs.extend(customParseFormat)
dayjs.extend(quarterOfYear)
dayjs.extend(isoWeek)
dayjs.extend(isoWeek)

export type LocaleType = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ru-RU'

const localeMap: Record<LocaleType, string> = {
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'en-US': 'en',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'es-ES': 'es',
  'ru-RU': 'ru',
}

export interface DatePositionResult {
  dataX: number
  width: number
  takestime: string
}

export interface DateCalcOptions {
  start: string
  taskStart: string
  taskEnd: string
  scale: number
  isHalfDay?: boolean
  minuteInterval?: number
}

export class DateUtils {
  private static currentLocale: LocaleType = 'zh-CN'

  static setLocale(locale: LocaleType) {
    this.currentLocale = locale
    dayjs.locale(localeMap[locale] || 'en')
  }

  static getLocale(): LocaleType {
    return this.currentLocale
  }

  static getDayjsLocale(): string {
    return localeMap[this.currentLocale] || 'en'
  }

  static create(date?: string | Date | number) {
    return dayjs(date).locale(this.getDayjsLocale())
  }

  static clone(date: string | Date | dayjs.Dayjs): dayjs.Dayjs {
    return dayjs(date).clone()
  }

  static locale(date: dayjs.Dayjs, locale: string): dayjs.Dayjs {
    return date.locale(locale)
  }

  static now() {
    return dayjs().locale(this.getDayjsLocale())
  }

  static format(date: string | Date, formatStr: string): string {
    return dayjs(date).locale(this.getDayjsLocale()).format(formatStr)
  }

  static diff(date1: string | Date, date2: string | Date, unit: dayjs.ManipulateType | 'quarter' | 'isoWeek'): number {
    return dayjs(date1).diff(dayjs(date2), unit as dayjs.ManipulateType)
  }

  static add(date: string | Date | dayjs.Dayjs, amount: number, unit: dayjs.ManipulateType | 'quarter' | 'isoWeek'): dayjs.Dayjs {
    return dayjs(date).add(amount, unit as dayjs.ManipulateType)
  }

  static subtract(date: string | Date, amount: number, unit: dayjs.ManipulateType | 'quarter' | 'isoWeek'): dayjs.Dayjs {
    return dayjs(date).subtract(amount, unit as dayjs.ManipulateType)
  }

  static startOf(date: string | Date, unit: dayjs.OpUnitType | 'quarter' | 'isoWeek'): dayjs.Dayjs {
    return dayjs(date).startOf(unit as dayjs.OpUnitType)
  }

  static endOf(date: string | Date, unit: dayjs.OpUnitType | 'quarter' | 'isoWeek'): dayjs.Dayjs {
    return dayjs(date).endOf(unit as dayjs.OpUnitType)
  }

  static isBetween(date: string | Date, date1: string | Date, date2: string | Date): boolean {
    return dayjs(date).isBetween(dayjs(date1), dayjs(date2))
  }

  static isBefore(date1: string | Date, date2: string | Date | dayjs.Dayjs): boolean {
    return dayjs(date1).isBefore(date2)
  }

  static isAfter(date1: string | Date, date2: string | Date): boolean {
    return dayjs(date1).isAfter(date2)
  }

  static isSame(date1: string | Date, date2: string | Date, unit?: dayjs.OpUnitType | 'quarter' | 'isoWeek'): boolean {
    return dayjs(date1).isSame(date2, unit as dayjs.OpUnitType)
  }

  static year(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).year()
  }

  static month(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).month()
  }

  static quarter(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).quarter()
  }

  static hour(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).hour()
  }

  static minute(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).minute()
  }

  static second(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).second()
  }

  static date(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).date()
  }

  static day(date: string | Date | dayjs.Dayjs): number {
    return dayjs(date).day()
  }

  static getWeekNames(): string[] {
    return Array.from({ length: 7 }, (_, i) =>
      this.now()
        .day(i + 1)
        .locale(this.getDayjsLocale())
        .format('dd')
    )
  }

  static getMonthName(month: number): string {
    return this.now()
      .month(month - 1)
      .locale(this.getDayjsLocale())
      .format('MMMM')
  }

  static calcQuarterPosition(options: DateCalcOptions): DatePositionResult {
    const { start, taskStart, taskEnd, scale } = options
    const ganttStartQuarter = this.startOf(start, 'quarter')
    const taskStartQuarter = this.startOf(taskStart, 'quarter')
    const taskEndQuarter = this.startOf(taskEnd, 'quarter')

    const fromStartQuarters =
      (taskStartQuarter.year() - ganttStartQuarter.year()) * 4 +
      (taskStartQuarter.quarter() - ganttStartQuarter.quarter())
    const dataX = scale * fromStartQuarters

    const spendQuarters =
      (taskEndQuarter.year() - taskStartQuarter.year()) * 4 +
      (taskEndQuarter.quarter() - taskStartQuarter.quarter()) +
    1

    return {
      dataX,
      width: spendQuarters * scale,
      takestime: `${spendQuarters}个季度`,
    }
  }

  static calcMonthPosition(options: DateCalcOptions): DatePositionResult {
    const { start, taskStart, taskEnd, scale } = options
    const ganttStartMonth = this.startOf(start, 'month')
    const taskStartMonth = this.startOf(taskStart, 'month')
    const taskEndMonth = this.startOf(taskEnd, 'month')

    const fromStartMonths =
      (taskStartMonth.year() - ganttStartMonth.year()) * 12 +
      (taskStartMonth.month() - ganttStartMonth.month())
    const dataX = scale * fromStartMonths

    const spendMonths =
      (taskEndMonth.year() - taskStartMonth.year()) * 12 +
      (taskEndMonth.month() - taskStartMonth.month()) +
    1

    return {
      dataX,
      width: spendMonths * scale,
      takestime: `${spendMonths}个月`,
    }
  }

  static calcDayPosition(options: DateCalcOptions): DatePositionResult {
    const { start, taskStart, taskEnd, scale, isHalfDay = false } = options
    const cellsPerDay = isHalfDay ? 2 : 1
    const fromPlanStartDays = this.diff(taskStart, start, 'days')
    let dataX: number
    let width: number

    if (isHalfDay) {
      const startHour = this.create(taskStart).hour()
      const endHour = this.create(taskEnd).hour()
      const startIsAM = startHour < 12
      const endIsAM = endHour < 12

      const startCellOffset = startIsAM ? 0 : 1
      const endCellOffset = endIsAM ? 0 : 1

      dataX = scale * (fromPlanStartDays * 2 + startCellOffset)

      const endDays = this.diff(taskEnd, start, 'days')
      const endCellIndex = endDays * 2 + endCellOffset
      const startCellIndex = fromPlanStartDays * 2 + startCellOffset

      width = (endCellIndex - startCellIndex + 1) * scale
    } else {
      dataX = scale * fromPlanStartDays * cellsPerDay
      const spendDays = this.diff(taskEnd, taskStart, 'days') + 1
      width = spendDays * scale * cellsPerDay
    }

    const spendDays = this.diff(taskEnd, taskStart, 'days') + 1
    return { dataX, width, takestime: `${spendDays}天` }
  }

  static calcWeekPosition(options: DateCalcOptions): DatePositionResult {
    const { start, taskStart, taskEnd, scale } = options
    const startGanttWeek = this.startOf(start, 'isoWeek')
    const taskStartWeek = this.startOf(taskStart, 'isoWeek')
    const fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week')
    const dataX = scale * fromPlanStartWeeks
    const taskEndWeek = this.startOf(taskEnd, 'isoWeek')
    const spendWeeks = taskEndWeek.diff(taskStartWeek, 'week') + 1

    return { dataX, width: spendWeeks * scale, takestime: `${spendWeeks}周` }
  }

  static calcHourPosition(options: DateCalcOptions): DatePositionResult {
    const { start, taskStart, taskEnd, scale, minuteInterval = 60 } = options

    if (minuteInterval < 60) {
      const fromPlanStartMinutes = this.diff(taskStart, start, 'minutes')
      const cellIndex = Math.floor(fromPlanStartMinutes / minuteInterval)
      const dataX = scale * cellIndex

      const spendMinutes = this.diff(taskEnd, taskStart, 'minutes') + minuteInterval
      const widthCells = Math.ceil(spendMinutes / minuteInterval)
      const width = widthCells * scale

      const diffHours = Math.floor(spendMinutes / 60)
      const remainMinutes = spendMinutes % 60
      let takestime = ''
      if (diffHours > 0 && remainMinutes > 0) {
        takestime = `${diffHours}小时${remainMinutes}分钟`
      } else if (diffHours > 0) {
        takestime = `${diffHours}小时`
      } else {
        takestime = `${remainMinutes}分钟`
      }
      return { dataX, width, takestime }
    } else {
      const fromPlanStartHours = this.diff(taskStart, start, 'hours')
      const dataX = scale * fromPlanStartHours
      const spendHours = this.diff(taskEnd, taskStart, 'hours') + 1
      return { dataX, width: spendHours * scale, takestime: `${spendHours}小时` }
    }
  }

  static calcPositionByMode(
    mode: string,
    options: DateCalcOptions
  ): DatePositionResult | null {
    switch (mode) {
      case '季度':
        return this.calcQuarterPosition(options)
      case '月':
        return this.calcMonthPosition(options)
      case '周':
        return this.calcWeekPosition(options)
      case '日':
        return this.calcDayPosition(options)
      case '时':
        return this.calcHourPosition(options)
      default:
        return null
    }
  }

  static batchFormatDates(dates: string[], formatStr: string): string[] {
    return dates.map(date => {
      try {
        return this.format(date, formatStr)
      } catch (error) {
        return date
      }
    })
  }

  static batchCalcDates(
    operations: Array<{
      type: 'add' | 'subtract' | 'diff'
      date: string
      amount?: number
      unit?: dayjs.ManipulateType
      date2?: string
    }>
  ): any[] {
    return operations.map(op => {
      try {
        switch (op.type) {
          case 'add':
            return this.add(op.date, op.amount || 0, op.unit || 'day').format('YYYY-MM-DD HH:mm:ss')
          case 'subtract':
            return this.subtract(op.date, op.amount || 0, op.unit || 'day').format('YYYY-MM-DD HH:mm:ss')
          case 'diff':
            return this.diff(op.date, op.date2 || '', op.unit || 'day')
          default:
            return null
        }
      } catch (error) {
        return null
      }
    })
  }

  /**
   * 计算两个日期之间的天数差
   * @param date1 结束日期
   * @param date2 开始日期
   * @returns 天数差
   */
  static differenceInDays(date1: string, date2: string): number {
    const d1 = dayjs(date1);
    const d2 = dayjs(date2);
    return d1.diff(d2, 'day');
  }

  /**
   * 给日期添加天数
   * @param date 日期字符串
   * @param days 要添加的天数
   * @returns 添加天数后的日期字符串
   */
  static addDays(date: string, days: number): string {
    return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
  }

  /**
   * 解析ISO格式的日期字符串
   * @param dateString ISO格式的日期字符串
   * @returns dayjs对象
   */
  static parseISO(dateString: string): dayjs.Dayjs {
    return dayjs(dateString);
  }

  /**
   * 格式化日期
   * @param date 日期字符串或dayjs对象
   * @param pattern 格式化模式
   * @returns 格式化后的日期字符串
   */
  static formatDate(date: string | dayjs.Dayjs, pattern: string): string {
    return dayjs(date).format(pattern);
  }
}

// 导出类的静态方法作为独立函数
export const differenceInDays = DateUtils.differenceInDays;
export const addDays = DateUtils.addDays;
export const parseISO = DateUtils.parseISO;
export const formatDate = DateUtils.formatDate;
export const diff = DateUtils.diff;

export default DateUtils
