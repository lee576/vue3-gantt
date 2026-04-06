import { describe, expect, it } from 'vitest'
import { buildWeekModeHeaders } from '../components/gantt/utils/weekModeHeaders'

describe('buildWeekModeHeaders', () => {
  it('按周模式生成的月份表头宽度不应重复计算跨月周', () => {
    const { monthHeaders, weekHeaders } = buildWeekModeHeaders(
      '2026-04-01',
      '2026-04-30',
      'zh-CN',
      120
    )

    expect(weekHeaders).toHaveLength(5)
    expect(monthHeaders.map(item => item.title)).toEqual([
      '2026年03月',
      '2026年04月',
      '2026年05月',
    ])

    const totalMonthWidth = monthHeaders.reduce((sum, item) => sum + item.width, 0)
    const totalWeekWidth = weekHeaders.reduce((sum, item) => sum + item.width, 0)

    expect(totalMonthWidth).toBeCloseTo(totalWeekWidth, 2)
    expect(monthHeaders[0].width).toBeCloseTo((2 / 7) * 120, 1)
    expect(monthHeaders[1].width).toBeCloseTo((30 / 7) * 120, 1)
    expect(monthHeaders[2].width).toBeCloseTo((3 / 7) * 120, 1)
  })
})
