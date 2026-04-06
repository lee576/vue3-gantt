import DateUtils, { type LocaleType } from './dateUtils'

export interface TimelineMonthHeader {
  title: string
  width: number
}

export interface TimelineWeekHeader extends TimelineMonthHeader {
  fulldate: string
}

export interface WeekModeHeadersResult {
  monthHeaders: TimelineMonthHeader[]
  weekHeaders: TimelineWeekHeader[]
}

const isAsianLocale = (locale: LocaleType) =>
  ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale)

const getMonthTitle = (monthStart: Date, locale: LocaleType) => {
  if (isAsianLocale(locale)) {
    return DateUtils.format(monthStart, 'YYYY年MM月')
  }

  const monthNum = DateUtils.month(monthStart)
  const monthName = DateUtils.getMonthName(monthNum + 1)
  return `${monthName} ${DateUtils.year(monthStart)}`
}

const getWeekTitle = (weekStart: Date, weekEnd: Date, locale: LocaleType) => {
  if (isAsianLocale(locale)) {
    return `第${DateUtils.isoWeek(weekStart)}周 (${DateUtils.format(weekStart, 'MM/DD')}-${DateUtils.format(weekEnd, 'MM/DD')})`
  }

  return `Week ${DateUtils.isoWeek(weekStart)} (${DateUtils.format(weekStart, 'MM/DD')}-${DateUtils.format(weekEnd, 'MM/DD')})`
}

export const buildWeekModeHeaders = (
  startDate: string | Date,
  endDate: string | Date,
  locale: LocaleType,
  scale: number
): WeekModeHeadersResult => {
  const timelineStart = DateUtils.startOf(startDate, 'isoWeek')
  const timelineEnd = DateUtils.endOf(endDate, 'isoWeek')

  const weekHeaders: TimelineWeekHeader[] = []
  let currentWeek = DateUtils.clone(timelineStart)

  while (
    DateUtils.isBefore(currentWeek.toDate(), timelineEnd.toDate()) ||
    DateUtils.isSame(currentWeek.toDate(), timelineEnd.toDate(), 'isoWeek')
  ) {
    const weekStart = DateUtils.startOf(currentWeek.toDate(), 'isoWeek')
    const weekEnd = DateUtils.endOf(currentWeek.toDate(), 'isoWeek')

    weekHeaders.push({
      title: getWeekTitle(weekStart.toDate(), weekEnd.toDate(), locale),
      width: scale,
      fulldate: DateUtils.format(weekStart.toDate(), 'YYYY-MM-DD'),
    })

    currentWeek = DateUtils.add(currentWeek.toDate(), 1, 'week')
  }

  const monthHeaders: TimelineMonthHeader[] = []
  let currentMonth = DateUtils.startOf(timelineStart.toDate(), 'month')

  while (
    DateUtils.isBefore(currentMonth.toDate(), timelineEnd.toDate()) ||
    DateUtils.isSame(currentMonth.toDate(), timelineEnd.toDate(), 'month')
  ) {
    const monthStart = currentMonth
    const monthEnd = DateUtils.endOf(monthStart.toDate(), 'month')
    const visibleStart = DateUtils.isAfter(monthStart.toDate(), timelineStart.toDate())
      ? monthStart
      : timelineStart
    const visibleEnd = DateUtils.isBefore(monthEnd.toDate(), timelineEnd.toDate())
      ? monthEnd
      : timelineEnd

    if (
      DateUtils.isBefore(visibleStart.toDate(), visibleEnd.toDate()) ||
      DateUtils.isSame(visibleStart.toDate(), visibleEnd.toDate(), 'day')
    ) {
      const overlapDays = DateUtils.diff(visibleEnd.toDate(), visibleStart.toDate(), 'day') + 1
      monthHeaders.push({
        title: getMonthTitle(monthStart.toDate(), locale),
        width: Number(((overlapDays / 7) * scale).toFixed(2)),
      })
    }

    currentMonth = DateUtils.add(currentMonth.toDate(), 1, 'month')
  }

  if (monthHeaders.length > 0) {
    const totalWidth = weekHeaders.length * scale
    const roundedWidth = monthHeaders.reduce((sum, item) => sum + item.width, 0)
    const widthDelta = Number((totalWidth - roundedWidth).toFixed(2))
    monthHeaders[monthHeaders.length - 1] = {
      ...monthHeaders[monthHeaders.length - 1],
      width: Number((monthHeaders[monthHeaders.length - 1].width + widthDelta).toFixed(2)),
    }
  }

  return {
    monthHeaders,
    weekHeaders,
  }
}
