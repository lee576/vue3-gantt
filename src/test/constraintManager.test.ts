import { describe, it, expect } from 'vitest'
import { ConstraintManager, getConstraintManager } from '../components/gantt/features/TaskConstraintManager'
import type { GanttTask } from '../components/gantt/types/GanttTypes'
import type { TaskDependency } from '../components/gantt/types/Types'

const createMockTasks = (): GanttTask[] => [
  { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1' },
  { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-2' },
  { id: '3', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15', taskNo: 'Task-3' },
]

describe('ConstraintManager 任务约束管理器', () => {
  describe('addConstraint 添加约束', () => {
    it('应该能够添加 ASAP 约束', () => {
      const manager = new ConstraintManager()
      const taskId = '1'

      const constraint = manager.addConstraint(taskId, 'ASAP')

      expect(constraint.taskId).toBe(taskId)
      expect(constraint.constraintType).toBe('ASAP')
      expect(constraint.isActive).toBe(true)
    })

    it('应该能够添加带日期的约束', () => {
      const manager = new ConstraintManager()
      const taskId = '1'
      const constraintDate = '2024-01-10'

      const constraint = manager.addConstraint(taskId, 'SNET', { constraintDate })

      expect(constraint.constraintType).toBe('SNET')
      expect(constraint.constraintDate).toBe(constraintDate)
    })

    it('应该能够添加带描述的约束', () => {
      const manager = new ConstraintManager()
      const description = '必须在本周开始'

      const constraint = manager.addConstraint('1', 'ASAP', { description })

      expect(constraint.description).toBe(description)
    })

    it('应该能够添加带优先级的约束', () => {
      const manager = new ConstraintManager()

      const constraint = manager.addConstraint('1', 'SNLT', {
        priority: 10,
        constraintDate: '2024-01-15'
      })

      expect(constraint.priority).toBe(10)
    })

    it('应该为每个任务维护独立的约束列表', () => {
      const manager = new ConstraintManager()

      manager.addConstraint('1', 'ASAP')
      manager.addConstraint('1', 'ALAP')
      manager.addConstraint('2', 'ASAP')

      const task1Constraints = manager.getTaskConstraints('1')
      const task2Constraints = manager.getTaskConstraints('2')

      expect(task1Constraints.length).toBe(2)
      expect(task2Constraints.length).toBe(1)
    })
  })

  describe('removeConstraint 移除约束', () => {
    it('应该能够移除指定的约束', () => {
      const manager = new ConstraintManager()
      const constraintId = manager.addConstraint('1', 'ASAP').id

      const result = manager.removeConstraint(constraintId)

      expect(result).toBe(true)
      expect(manager.getTaskConstraints('1').length).toBe(0)
    })

    it('应该返回 false 当约束不存在时', () => {
      const manager = new ConstraintManager()

      const result = manager.removeConstraint('non-existent-id')

      expect(result).toBe(false)
    })

    it('应该能够移除任务的所有约束', () => {
      const manager = new ConstraintManager()
      manager.addConstraint('1', 'ASAP')
      manager.addConstraint('1', 'ALAP')

      const result = manager.removeTaskConstraints('1')

      expect(result).toBe(true)
      expect(manager.getTaskConstraints('1').length).toBe(0)
    })
  })

  describe('updateConstraint 更新约束', () => {
    it('应该能够更新约束的活动状态', () => {
      const manager = new ConstraintManager()
      const constraintId = manager.addConstraint('1', 'ASAP').id

      const updated = manager.setConstraintActive(constraintId, false)

      expect(updated?.isActive).toBe(false)
    })

    it('应该能够更新约束的日期', () => {
      const manager = new ConstraintManager()
      const constraintId = manager.addConstraint('1', 'SNET').id

      const updated = manager.updateConstraint(constraintId, {
        constraintDate: '2024-01-15'
      })

      expect(updated?.constraintDate).toBe('2024-01-15')
    })
  })

  describe('getTaskConstraints 获取约束', () => {
    it('应该返回任务的活跃约束', () => {
      const manager = new ConstraintManager()
      manager.addConstraint('1', 'ASAP')
      const inactiveConstraint = manager.addConstraint('1', 'ALAP')
      manager.setConstraintActive(inactiveConstraint.id, false)

      const activeConstraints = manager.getActiveConstraints('1')

      expect(activeConstraints.length).toBe(1)
      expect(activeConstraints[0].constraintType).toBe('ASAP')
    })

    it('应该返回所有约束', () => {
      const manager = new ConstraintManager()
      manager.addConstraint('1', 'ASAP')
      manager.addConstraint('1', 'ALAP')

      const allConstraints = manager.getAllConstraints()

      expect(allConstraints.length).toBe(2)
    })
  })

  describe('analyzeConstraints 约束分析', () => {
    it('应该正确分析 ASAP 约束', () => {
      const manager = new ConstraintManager()
      const task: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-05',
        end_date: '2024-01-10'
      }

      manager.addConstraint('1', 'ASAP')
      const analysis = manager.analyzeConstraints(task, [], '2024-01-01', '2024-01-31')

      expect(analysis).toHaveProperty('earliestStart')
      expect(analysis).toHaveProperty('latestStart')
      expect(analysis).toHaveProperty('totalFloat')
    })

    it('应该正确分析 SNET 约束', () => {
      const manager = new ConstraintManager()
      const task: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-05',
        end_date: '2024-01-10'
      }

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-08' })
      const analysis = manager.analyzeConstraints(task, [], '2024-01-01', '2024-01-31')

      expect(analysis.earliestStart).toBe('2024-01-08')
    })

    it('应该正确分析 SNLT 约束', () => {
      const manager = new ConstraintManager()
      const task: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-05',
        end_date: '2024-01-10'
      }

      manager.addConstraint('1', 'SNLT', { constraintDate: '2024-01-03' })
      const analysis = manager.analyzeConstraints(task, [], '2024-01-01', '2024-01-31')

      expect(analysis.latestStart).toBe('2024-01-03')
    })

    it('应该正确分析 MSO 约束', () => {
      const manager = new ConstraintManager()
      const task: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-05',
        end_date: '2024-01-10'
      }

      manager.addConstraint('1', 'MSO', { constraintDate: '2024-01-12' })
      const analysis = manager.analyzeConstraints(task, [], '2024-01-01', '2024-01-31')

      expect(analysis.earliestStart).toBe('2024-01-12')
      expect(analysis.latestStart).toBe('2024-01-12')
    })

    it('应该正确分析 MFO 约束', () => {
      const manager = new ConstraintManager()
      const task: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-05',
        end_date: '2024-01-10'
      }

      manager.addConstraint('1', 'MFO', { constraintDate: '2024-01-15' })
      const analysis = manager.analyzeConstraints(task, [], '2024-01-01', '2024-01-31')

      expect(analysis.earliestFinish).toBe('2024-01-15')
      expect(analysis.latestFinish).toBe('2024-01-15')
    })
  })

  describe('validateConstraints 约束验证', () => {
    it('应该正确验证有效的约束', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-05', end_date: '2024-01-10' },
      ]

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-03' })
      const results = manager.validateConstraints(tasks, [])

      expect(results[0].isValid).toBe(true)
    })

    it('应该检测到 SNET 约束违规', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-02', end_date: '2024-01-05' },
      ]

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-05' })
      const results = manager.validateConstraints(tasks, [])

      expect(results[0].isValid).toBe(false)
      expect(results[0].violations.length).toBeGreaterThan(0)
    })

    it('应该检测到 SNLT 约束违规', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-10', end_date: '2024-01-15' },
      ]

      manager.addConstraint('1', 'SNLT', { constraintDate: '2024-01-05' })
      const results = manager.validateConstraints(tasks, [])

      expect(results[0].isValid).toBe(false)
      expect(results[0].violations.some(v => v.constraintType === 'SNLT')).toBe(true)
    })

    it('应该检测到 MSO 约束违规', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-05', end_date: '2024-01-10' },
      ]

      manager.addConstraint('1', 'MSO', { constraintDate: '2024-01-10' })
      const results = manager.validateConstraints(tasks, [])

      expect(results[0].isValid).toBe(false)
      expect(results[0].violations.some(v => v.constraintType === 'MSO')).toBe(true)
    })
  })

  describe('detectConstraintConflicts 冲突检测', () => {
    it('应该检测到 SNET 和 SNLT 之间的冲突', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-05', end_date: '2024-01-10' },
      ]

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-15' })
      manager.addConstraint('1', 'SNLT', { constraintDate: '2024-01-10' })

      const conflicts = manager.detectConstraintConflicts(tasks)

      expect(conflicts.length).toBeGreaterThan(0)
      expect(conflicts[0]).toContain('SNET')
      expect(conflicts[0]).toContain('SNLT')
    })

    it('应该检测到 FNET 和 FNLT 之间的冲突', () => {
      const manager = new ConstraintManager()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-05', end_date: '2024-01-10' },
      ]

      manager.addConstraint('1', 'FNET', { constraintDate: '2024-01-20' })
      manager.addConstraint('1', 'FNLT', { constraintDate: '2024-01-15' })

      const conflicts = manager.detectConstraintConflicts(tasks)

      expect(conflicts.length).toBeGreaterThan(0)
    })
  })

  describe('导入导出', () => {
    it('应该能够导出和导入约束', () => {
      const manager = new ConstraintManager()
      manager.addConstraint('1', 'ASAP')
      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-10' })

      const exported = manager.exportConstraints()

      expect(exported).toContain('ASAP')
      expect(exported).toContain('SNET')

      const newManager = new ConstraintManager()
      const importResult = newManager.importConstraints(exported)

      expect(importResult).toBe(true)
      expect(newManager.getTaskConstraints('1').length).toBe(2)
    })

    it('应该处理无效的导入数据', () => {
      const manager = new ConstraintManager()

      const result = manager.importConstraints('invalid json')

      expect(result).toBe(false)
    })
  })

  describe('单例工厂函数', () => {
    it('应该返回同一个管理器实例', () => {
      const manager1 = getConstraintManager()
      const manager2 = getConstraintManager()

      expect(manager1).toBe(manager2)
    })
  })
})
