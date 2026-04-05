import { describe, expect, it } from 'vitest'
import { flattenTasksByHierarchy } from '../components/gantt/utils/taskTree'

describe('flattenTasksByHierarchy', () => {
  it('应该按原始兄弟顺序展开并补齐树形字段', () => {
    const tasks = [
      { id: '1', pid: '0', taskNo: 'Root-1' },
      { id: '2', pid: '1', taskNo: 'Child-1' },
      { id: '3', pid: '1', taskNo: 'Child-2' },
      { id: '4', pid: '2', taskNo: 'Grandchild' },
      { id: '5', pid: '0', taskNo: 'Root-2' },
    ]

    const result = flattenTasksByHierarchy(tasks, {
      id: 'id',
      parentId: 'pid',
    })

    expect(result.map(task => task.id)).toEqual(['1', '2', '4', '3', '5'])
    expect(result.map(task => task.treeLevel)).toEqual([1, 2, 3, 2, 1])
    expect(result.map(task => task.index)).toEqual([1, 1, 1, 2, 2])
    expect(result.map(task => task.no)).toEqual(['1', '1.1', '1.1.1', '1.2', '2'])
    expect(result.map(task => task.flatIndex)).toEqual([0, 1, 2, 3, 4])
    expect(result.map(task => task.subtreeEndIndex)).toEqual([3, 2, 2, 3, 4])
  })

  it('应该在重复 id 或循环引用时安全退出，不进入死循环', () => {
    const tasks = [
      { id: '1', pid: '0', taskNo: 'Root-1' },
      { id: '2', pid: '1', taskNo: 'Child-1' },
      { id: '2', pid: '2', taskNo: 'Duplicate-And-Cyclic' },
    ]

    const result = flattenTasksByHierarchy(tasks, {
      id: 'id',
      parentId: 'pid',
    })

    expect(result.map(task => task.id)).toEqual(['1', '2'])
  })
})
