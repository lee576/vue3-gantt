import { describe, it, expect } from 'vitest'
import { DependencyValidator } from '../components/gantt/features/DependencyValidator'
import type { GanttTask } from '../components/gantt/types/GanttTypes'
import type { TaskDependency } from '../components/gantt/types/Types'

const createMockTasks = (): GanttTask[] => [
  { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1' },
  { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-2' },
  { id: '3', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15', taskNo: 'Task-3' },
  { id: '4', pid: '0', start_date: '2024-01-10', end_date: '2024-01-20', taskNo: 'Task-4' },
  { id: '5', pid: '0', start_date: '2024-01-15', end_date: '2024-01-25', taskNo: 'Task-5' },
]

const createMockDependencies = (): TaskDependency[] => [
  { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'finishToStart', lag: 0 },
  { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: 'finishToStart', lag: 0 },
  { id: 'd3', sourceTaskId: '3', targetTaskId: '4', type: 'finishToStart', lag: 0 },
  { id: 'd4', sourceTaskId: '4', targetTaskId: '5', type: 'finishToStart', lag: 0 },
]

describe('DependencyValidator 依赖验证器', () => {
  describe('loadData 数据加载', () => {
    it('应该正确加载任务和依赖数据', () => {
      const validator = new DependencyValidator()
      const tasks = createMockTasks()
      const dependencies = createMockDependencies()

      validator.loadData(tasks, dependencies)

      expect(validator).toBeDefined()
    })
  })

  describe('detectCycles 循环检测', () => {
    it('应该正确检测简单循环依赖', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05' },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10' },
        { id: '3', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'finishToStart', lag: 0 },
        { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: 'finishToStart', lag: 0 },
        { id: 'd3', sourceTaskId: '3', targetTaskId: '1', type: 'finishToStart', lag: 0 },
      ]

      validator.loadData(tasks, dependencies)
      const cycles = validator.detectCycles()

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles[0].cycle).toContain('1')
      expect(cycles[0].cycle).toContain('2')
      expect(cycles[0].cycle).toContain('3')
    })

    it('应该正确处理无循环的依赖关系', () => {
      const validator = new DependencyValidator()
      const tasks = createMockTasks()
      const dependencies = createMockDependencies()

      validator.loadData(tasks, dependencies)
      const cycles = validator.detectCycles()

      expect(cycles.length).toBe(0)
    })

    it('应该正确检测复杂循环（A->B->C->A）', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: 'A', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05' },
        { id: 'B', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10' },
        { id: 'C', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: 'A', targetTaskId: 'B', type: 'finishToStart', lag: 0 },
        { id: 'd2', sourceTaskId: 'B', targetTaskId: 'C', type: 'finishToStart', lag: 0 },
        { id: 'd3', sourceTaskId: 'C', targetTaskId: 'A', type: 'finishToStart', lag: 0 },
      ]

      validator.loadData(tasks, dependencies)
      const cycles = validator.detectCycles()

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles.some(c => c.cycle.includes('A') && c.cycle.includes('B') && c.cycle.includes('C'))).toBe(true)
    })

    it('应该正确检测自引用依赖', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '1', type: 'finishToStart', lag: 0 },
      ]

      validator.loadData(tasks, dependencies)
      const result = validator.validateDependencies(tasks, dependencies)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'self-reference')).toBe(true)
    })
  })

  describe('validateDependencies 依赖验证', () => {
    it('应该正确验证有效的依赖关系', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1' },
        { id: '2', pid: '0', start_date: '2024-01-05', end_date: '2024-01-10', taskNo: 'Task-2' },
        { id: '3', pid: '0', start_date: '2024-01-10', end_date: '2024-01-15', taskNo: 'Task-3' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'finishToStart', lag: 0 },
        { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: 'finishToStart', lag: 0 },
      ]

      const result = validator.validateDependencies(tasks, dependencies)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('应该正确检测缺失的前置任务', () => {
      const validator = new DependencyValidator()
      const tasks = createMockTasks()
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '99', type: 'finishToStart', lag: 0 },
      ]

      const result = validator.validateDependencies(tasks, dependencies)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'missing-task')).toBe(true)
    })

    it('应该正确检测无效的依赖类型', () => {
      const validator = new DependencyValidator()
      const tasks = createMockTasks()
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'invalidType' as any, lag: 0 },
      ]

      const result = validator.validateDependencies(tasks, dependencies)

      expect(result.errors.some(e => e.type === 'invalid-link')).toBe(true)
    })

    it('应该检测到所有类型的循环依赖', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-03' },
        { id: '2', pid: '0', start_date: '2024-01-02', end_date: '2024-01-04' },
        { id: '3', pid: '0', start_date: '2024-01-03', end_date: '2024-01-05' },
        { id: '4', pid: '0', start_date: '2024-01-04', end_date: '2024-01-06' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'finishToStart', lag: 0 },
        { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: 'finishToStart', lag: 0 },
        { id: 'd3', sourceTaskId: '3', targetTaskId: '1', type: 'finishToStart', lag: 0 },
        { id: 'd4', sourceTaskId: '4', targetTaskId: '2', type: 'finishToStart', lag: 0 },
      ]

      const result = validator.validateDependencies(tasks, dependencies)
      const cycles = validator.detectCycles()

      expect(cycles.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.type === 'cycle')).toBe(true)
    })
  })

  describe('getDependencyChains 依赖链分析', () => {
    it('应该正确获取最长依赖链', () => {
      const validator = new DependencyValidator()
      const tasks = createMockTasks()
      const dependencies = createMockDependencies()

      validator.loadData(tasks, dependencies)
      const chains = validator.getLongestDependencyChains()

      expect(chains.length).toBeGreaterThan(0)
      expect(chains[0].length).toBe(5)
    })

    it('应该正确识别孤立任务', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05' },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10' },
        { id: '3', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15' },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: 'finishToStart', lag: 0 },
      ]

      validator.loadData(tasks, dependencies)
      const isolatedTaskIds = validator.getIsolatedTasks().map(t => t.id)

      expect(isolatedTaskIds.length).toBe(1)
      expect(isolatedTaskIds).toContain('3')
    })
  })

  describe('验证结果格式化', () => {
    it('应该正确格式化验证结果摘要', () => {
      const validator = new DependencyValidator()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1' },
      ]
      const dependencies: TaskDependency[] = []

      const result = validator.validateDependencies(tasks, dependencies)
      const summary = validator.formatValidationSummary(result)

      expect(summary).toContain('依赖验证完成')
      expect(summary).toContain('1 个任务')
      expect(summary).toContain('0 个依赖关系')
    })
  })
})
