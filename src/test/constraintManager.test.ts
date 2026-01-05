import { describe, it, expect } from 'vitest'
import { ConstraintManager, getConstraintManager } from '../components/gantt/features/TaskConstraintManager'
import type { GanttTask } from '../components/gantt/types/GanttTypes'

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

    it('应该能够添加 FNET 约束', () => {
      const manager = new ConstraintManager()
      const taskId = '2'
      const constraintDate = '2024-01-15'

      const constraint = manager.addConstraint(taskId, 'FNET', { constraintDate })

      expect(constraint.constraintType).toBe('FNET')
      expect(constraint.constraintDate).toBe(constraintDate)
    })

    it('应该能够添加芒奈约束', () => {
      const manager = new ConstraintManager()
      const taskId = '3'
      const constraintDate = '2024-01-20'

      const constraint = manager.addConstraint(taskId, 'MSO', { constraintDate })

      expect(constraint.constraintType).toBe('MSO')
      expect(constraint.constraintDate).toBe(constraintDate)
    })
  })

  describe('removeConstraint 移除约束', () => {
    it('应该能够移除已存在的约束', () => {
      const manager = new ConstraintManager()
      const taskId = '1'

      manager.addConstraint(taskId, 'ASAP')
      const result = manager.removeConstraint(taskId, 'ASAP')

      expect(result).toBe(true)
      const constraints = manager.getTaskConstraints(taskId)
      expect(constraints.length).toBe(0)
    })

    it('应该能够正确处理不存在的约束', () => {
      const manager = new ConstraintManager()
      const taskId = '1'

      const result = manager.removeConstraint(taskId, 'ASAP')

      expect(result).toBe(false)
    })
  })

  describe('getConstraintManager 获取单例', () => {
    it('应该返回相同的实例', () => {
      const manager1 = getConstraintManager()
      const manager2 = getConstraintManager()

      expect(manager1).toBe(manager2)
    })
  })

  describe('getTaskConstraints 获取任务约束', () => {
    it('应该返回任务的约束列表', () => {
      const manager = new ConstraintManager()
      const taskId = '1'

      manager.addConstraint(taskId, 'ASAP')
      manager.addConstraint(taskId, 'SNET', { constraintDate: '2024-01-10' })

      const constraints = manager.getTaskConstraints(taskId)

      expect(constraints.length).toBe(2)
      expect(constraints[0].constraintType).toBe('ASAP')
      expect(constraints[1].constraintType).toBe('SNET')
    })

    it('应该返回空数组如果任务没有约束', () => {
      const manager = new ConstraintManager()
      const taskId = '1'

      const constraints = manager.getTaskConstraints(taskId)

      expect(constraints.length).toBe(0)
    })
  })

  describe('validateConstraints 验证约束', () => {
    it('应该验证所有约束', () => {
      const manager = new ConstraintManager()
      const mockTask: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        taskNo: 'Task-1',
        job_progress: 0,
      }

      manager.addConstraint('1', 'ASAP')
      const results = manager.validateConstraints(mockTask)

      expect(results.length).toBe(1)
      expect(results[0].satisfied).toBe(true)
    })

    it('应该处理有日期约束的任务', () => {
      const manager = new ConstraintManager()
      const mockTask: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-10',
        end_date: '2024-01-15',
        taskNo: 'Task-1',
        job_progress: 0,
      }

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-12' })
      const results = manager.validateConstraints(mockTask)

      expect(results.length).toBe(1)
      expect(results[0].satisfied).toBe(true)
    })

    it('应该处理违反约束的任务', () => {
      const manager = new ConstraintManager()
      const mockTask: GanttTask = {
        id: '1',
        pid: '0',
        start_date: '2024-01-15',
        end_date: '2024-01-20',
        taskNo: 'Task-1',
        job_progress: 0,
      }

      manager.addConstraint('1', 'SNET', { constraintDate: '2024-01-12' })
      const results = manager.validateConstraints(mockTask)

      expect(results.length).toBe(1)
      expect(results[0].satisfied).toBe(false)
    })
  })

  describe('clear 清除约束', () => {
    it('应该清除所有约束', () => {
      const manager = new ConstraintManager()

      manager.addConstraint('1', 'ASAP')
      manager.addConstraint('2', 'SNET', { constraintDate: '2024-01-10' })
      manager.clear()

      const constraints1 = manager.getTaskConstraints('1')
      const constraints2 = manager.getTaskConstraints('2')

      expect(constraints1.length).toBe(0)
      expect(constraints2.length).toBe(0)
    })
  })
})
