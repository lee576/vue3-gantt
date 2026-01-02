import { ref } from 'vue'
import { store } from '../../state/Store'
import {
  calcQuarterPosition,
  calcMonthPosition,
  calcDayPosition,
  calcWeekPosition,
  calcHourPosition,
} from '../utils/dateCalc'
import type { GanttTask, GanttMapFields } from '../../types/GanttTypes'

export function useBarGeometry(props: { startGanttDate: string | Date; row: GanttTask }, mapFields: GanttMapFields) {
  const oldBarDataX = ref(0)
  const oldBarWidth = ref(0)

  const computePosition = () => {
    let dataX = 0
    let width = 0
    let takestime = ''
    const mode = store.mode
    const start = props.startGanttDate
    const startDate = props.row[mapFields.startdate]
    const endDate = props.row[mapFields.enddate]
    const scale = store.scale

    const startStr = start instanceof Date ? start.toISOString().split('T')[0] : start
    const startDateStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate
    const endDateStr = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate

    if (mode === '季度') {
      const res = calcQuarterPosition(startStr, startDateStr, endDateStr, scale)
      dataX = res.dataX
      width = res.width
      takestime = res.takestime
    } else if (mode === '月') {
      const res = calcMonthPosition(startStr, startDateStr, endDateStr, scale)
      dataX = res.dataX
      width = res.width
      takestime = res.takestime
    } else if (mode === '日') {
      const res = calcDayPosition(startStr, startDateStr, endDateStr, scale, store.daySubMode === 'half')
      dataX = res.dataX
      width = res.width
      takestime = res.takestime
    } else if (mode === '周') {
      const res = calcWeekPosition(startStr, startDateStr, endDateStr, scale)
      dataX = res.dataX
      width = res.width
      takestime = res.takestime
    } else if (mode === '时') {
      const res = calcHourPosition(
        startStr,
        startDateStr,
        endDateStr,
        scale,
        parseInt(store.hourSubMode || '60')
      )
      dataX = res.dataX
      width = res.width
      takestime = res.takestime
    }

    oldBarDataX.value = dataX
    oldBarWidth.value = width
    props.row[mapFields.takestime] = takestime
    return { dataX, width }
  }

  return { oldBarDataX, oldBarWidth, computePosition }
}
