import { describe, it, expect } from 'vitest'
import { CriticalPathAnalyzer, getCriticalPathAnalyzer } from '../components/gantt/features/CriticalPathAnalyzer'
import type { GanttTask } from '../components/gantt/types/GanttTypes'
import type { TaskDependency } from '../components/gantt/types/Types'
import { LinkType } from '../components/gantt/types/Types'

const createMockTasks = (): GanttTask[] => [
  { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
  { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-2', job_progress: 0 },
  { id: '3', pid: '0', start_date: '2024-01-08', end_date: '2024-01-15', taskNo: 'Task-3', job_progress: 0 },
  { id: '4', pid: '0', start_date: '2024-01-10', end_date: '2024-01-20', taskNo: 'Task-4', job_progress: 0 },
  { id: '5', pid: '0', start_date: '2024-01-15', end_date: '2024-01-25', taskNo: 'Task-5', job_progress: 0 },
]

const createMockDependencies = (): TaskDependency[] => [
  { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
  { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: LinkType.FINISH_TO_START, lag: 0 },
  { id: 'd3', sourceTaskId: '3', targetTaskId: '4', type: LinkType.FINISH_TO_START, lag: 0 },
  { id: 'd4', sourceTaskId: '4', targetTaskId: '5', type: LinkType.FINISH_TO_START, lag: 0 },
]

describe('CriticalPathAnalyzer 关键路径分析器', () => {
  describe('analyze 基础分析', () => {
    it('应该正确分析简单线性依赖的项目', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks = createMockTasks()
      const dependencies = createMockDependencies()

      const result = analyzer.analyze(tasks, dependencies)

      expect(result).toHaveProperty('taskAnalysis')
      expect(result).toHaveProperty('criticalTaskIds')
      expect(result).toHaveProperty('criticalPath')
      expect(result).toHaveProperty('projectDuration')
      expect(result).toHaveProperty('projectStartDate')
      expect(result).toHaveProperty('projectEndDate')
      expect(result).toHaveProperty('criticalPathDuration')
    })

    it('应该正确计算任务的最早开始和最晚开始时间', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-2', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)
      const task1Analysis = result.taskAnalysis.get('1')
      const task2Analysis = result.taskAnalysis.get('2')

      expect(task1Analysis).toBeDefined()
      expect(task2Analysis).toBeDefined()
      expect(task1Analysis?.earlyStart).toBe(0)
      expect(task2Analysis?.earlyStart).toBeGreaterThan(0)
    })

    it('应该正确计算浮动时间', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-15', taskNo: 'Task-2', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)
      const task1Analysis = result.taskAnalysis.get('1')

      expect(task1Analysis).toBeDefined()
      expect(typeof task1Analysis?.totalFloat).toBe('number')
      expect(typeof task1Analysis?.freeFloat).toBe('number')
    })
  })

  describe('关键路径识别', () => {
    it('应该正确识别关键任务', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-06', end_date: '2024-01-10', taskNo: 'Task-2', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)

      expect(result.criticalTaskIds.length).toBeGreaterThan(0)
    })

    it('应该正确处理无依赖的任务', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-2', job_progress: 0 },
      ]

      const result = analyzer.analyze(tasks, [])

      expect(result.taskAnalysis.size).toBe(2)
      expect(Array.isArray(result.criticalPath)).toBe(true)
    })

    it('应该正确处理并行依赖的情况', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-01', end_date: '2024-01-08', taskNo: 'Task-2', job_progress: 0 },
        { id: '3', pid: '0', start_date: '2024-01-09', end_date: '2024-01-15', taskNo: 'Task-3', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '3', type: LinkType.FINISH_TO_START, lag: 0 },
        { id: 'd2', sourceTaskId: '2', targetTaskId: '3', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)

      expect(result.criticalTaskIds).toContain('2')
      expect(result.criticalTaskIds).toContain('3')
    })
  })

  describe('带延迟的依赖分析', () => {
    it('应该正确处理带延迟的依赖关系', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-08', end_date: '2024-01-12', taskNo: 'Task-2', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 2 },
      ]

      const result = analyzer.analyze(tasks, dependencies)
      const task2Analysis = result.taskAnalysis.get('2')

      expect(task2Analysis).toBeDefined()
      expect(task2Analysis?.earlyStart).toBeGreaterThan(0)
    })
  })

  describe('项目日期计算', () => {
    it('应该正确计算项目开始和结束日期', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-03-01', end_date: '2024-03-10', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-02-15', end_date: '2024-02-28', taskNo: 'Task-2', job_progress: 0 },
      ]

      const result = analyzer.analyze(tasks, [])

      expect(result.projectStartDate).toBe('2024-02-15')
      expect(result.projectEndDate).toBe('2024-03-10')
    })

    it('应该正确计算项目工期', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-15', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-10', end_date: '2024-01-25', taskNo: 'Task-2', job_progress: 0 },
      ]

      const result = analyzer.analyze(tasks, [])

      expect(result.projectDuration).toBe(25)
    })
  })

  describe('关键路径阈值设置', () => {
    it('应该支持设置关键路径阈值', () => {
      const analyzer = new CriticalPathAnalyzer()
      analyzer.setCriticalThreshold(2)

      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Task-1', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-06', end_date: '2024-01-10', taskNo: 'Task-2', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)

      expect(result).toBeDefined()
    })
  })

  describe('单例工厂函数', () => {
    it('应该返回同一个分析器实例', () => {
      const analyzer1 = getCriticalPathAnalyzer()
      const analyzer2 = getCriticalPathAnalyzer()

      expect(analyzer1).toBe(analyzer2)
    })

    it('应该支持不同阈值的实例', () => {
      const analyzer1 = getCriticalPathAnalyzer(0)
      const analyzer2 = getCriticalPathAnalyzer(2)

      expect(analyzer1).not.toBe(analyzer2)
    })
  })

  describe('复杂场景分析', () => {
    it('应该正确处理复杂的网络依赖结构', () => {
      const analyzer = new CriticalPathAnalyzer()
      const tasks: GanttTask[] = [
        { id: '1', pid: '0', start_date: '2024-01-01', end_date: '2024-01-05', taskNo: 'Start', job_progress: 0 },
        { id: '2', pid: '0', start_date: '2024-01-03', end_date: '2024-01-08', taskNo: 'Task-A', job_progress: 0 },
        { id: '3', pid: '0', start_date: '2024-01-03', end_date: '2024-01-10', taskNo: 'Task-B', job_progress: 0 },
        { id: '4', pid: '0', start_date: '2024-01-09', end_date: '2024-01-15', taskNo: 'Task-C', job_progress: 0 },
        { id: '5', pid: '0', start_date: '2024-01-11', end_date: '2024-01-20', taskNo: 'End', job_progress: 0 },
      ]
      const dependencies: TaskDependency[] = [
        { id: 'd1', sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START, lag: 0 },
        { id: 'd2', sourceTaskId: '1', targetTaskId: '3', type: LinkType.FINISH_TO_START, lag: 0 },
        { id: 'd3', sourceTaskId: '2', targetTaskId: '4', type: LinkType.FINISH_TO_START, lag: 0 },
        { id: 'd4', sourceTaskId: '3', targetTaskId: '4', type: LinkType.FINISH_TO_START, lag: 0 },
        { id: 'd5', sourceTaskId: '4', targetTaskId: '5', type: LinkType.FINISH_TO_START, lag: 0 },
      ]

      const result = analyzer.analyze(tasks, dependencies)

      expect(result.criticalPath.length).toBeGreaterThan(0)
      expect(result.criticalPath).toContain('1')
      expect(result.criticalPath).toContain('5')
    })
  })
})
