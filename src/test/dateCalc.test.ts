import { describe, it, expect } from 'vitest'
import {
  calcQuarterPosition,
  calcMonthPosition,
  calcWeekPosition,
  calcDayPosition,
  calcHourPosition,
} from '../components/gantt/timeline/utils/dateCalc'

describe('日期计算工具函数', () => {
  describe('calcQuarterPosition', () => {
    it('应该正确计算季度视图中的位置和宽度', () => {
      const start = '2024-01-01'
      const taskStart = '2024-01-01'
      const taskEnd = '2024-03-31'
      const scale = 90

      const result = calcQuarterPosition(start, taskStart, taskEnd, scale)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('takestime')
      expect(result.dataX).toBeGreaterThanOrEqual(0)
      expect(result.width).toBeGreaterThan(0)
    })

    it('应该正确计算跨年的任务', () => {
      const start = '2024-01-01'
      const taskStart = '2024-10-01'
      const taskEnd = '2025-03-31'
      const scale = 90

      const result = calcQuarterPosition(start, taskStart, taskEnd, scale)

      expect(result.width).toBeGreaterThan(0)
    })
  })

  describe('calcMonthPosition', () => {
    it('应该正确计算月视图中的位置和宽度', () => {
      const start = '2024-01-01'
      const taskStart = '2024-01-01'
      const taskEnd = '2024-03-31'
      const scale = 30

      const result = calcMonthPosition(start, taskStart, taskEnd, scale)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('takestime')
      expect(result.dataX).toBe(0)
      expect(result.width).toBe(90)
    })
  })

  describe('calcWeekPosition', () => {
    it('应该正确计算周视图中的位置和宽度', () => {
      const start = '2024-01-01'
      const taskStart = '2024-01-01'
      const taskEnd = '2024-01-14'
      const scale = 50

      const result = calcWeekPosition(start, taskStart, taskEnd, scale)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('takestime')
      expect(result.width).toBeGreaterThan(0)
    })
  })

  describe('calcDayPosition', () => {
    it('应该正确计算日视图中的位置和宽度（全天模式）', () => {
      const start = '2024-01-01'
      const taskStart = '2024-01-01'
      const taskEnd = '2024-01-05'
      const scale = 60

      const result = calcDayPosition(start, taskStart, taskEnd, scale, false)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('takestime')
      expect(result.dataX).toBe(0)
      expect(result.width).toBe(300)
    })

    it('应该正确计算日视图中的位置和宽度（半天模式）', () => {
      const start = '2024-01-01'
      const taskStart = '2024-01-01'
      const taskEnd = '2024-01-02'
      const scale = 60

      const result = calcDayPosition(start, taskStart, taskEnd, scale, true)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result.width).toBeGreaterThan(0)
    })
  })

  describe('calcHourPosition', () => {
    it('应该正确计算时视图中的位置和宽度（60分钟间隔）', () => {
      const start = '2024-01-01 08:00:00'
      const taskStart = '2024-01-01 08:00:00'
      const taskEnd = '2024-01-01 12:00:00'
      const scale = 40

      const result = calcHourPosition(start, taskStart, taskEnd, scale, 60)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('takestime')
      expect(result.dataX).toBe(0)
      expect(result.width).toBe(200)
    })

    it('应该正确计算时视图中的位置和宽度（30分钟间隔）', () => {
      const start = '2024-01-01 08:00:00'
      const taskStart = '2024-01-01 08:00:00'
      const taskEnd = '2024-01-01 09:30:00'
      const scale = 40

      const result = calcHourPosition(start, taskStart, taskEnd, scale, 30)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result.width).toBeGreaterThan(0)
    })

    it('应该正确计算时视图中的位置和宽度（15分钟间隔）', () => {
      const start = '2024-01-01 08:00:00'
      const taskStart = '2024-01-01 08:00:00'
      const taskEnd = '2024-01-01 08:45:00'
      const scale = 40

      const result = calcHourPosition(start, taskStart, taskEnd, scale, 15)

      expect(result).toHaveProperty('dataX')
      expect(result).toHaveProperty('width')
      expect(result.width).toBeGreaterThan(0)
    })
  })
})
