import { describe, expect, it } from 'vitest'
import {
  hasTaskBarDecorations,
  normalizeTaskBarDecorations,
} from '../components/gantt/utils/taskBarDecorations'

describe('taskBarDecorations', () => {
  it('应该把标签和 indicator 规范化为可渲染字符串', () => {
    const resolved = normalizeTaskBarDecorations({
      labels: {
        left: 101,
        right: ' Owner ',
        top: '',
        bottom: null,
      },
      indicators: [
        {
          key: 'risk',
          text: ' Risk ',
          color: '#fff',
        },
        {
          text: 7,
        },
      ],
    })

    expect(resolved.labels).toEqual({
      left: '101',
      right: 'Owner',
      top: undefined,
      bottom: undefined,
    })
    expect(resolved.indicators).toEqual([
      {
        key: 'risk',
        text: 'Risk',
        color: '#fff',
      },
      {
        key: 'indicator-1',
        text: '7',
      },
    ])
  })

  it('应该忽略空的标签和 indicator', () => {
    const resolved = normalizeTaskBarDecorations({
      labels: {
        left: '   ',
      },
      indicators: [
        {
          text: '   ',
        },
      ],
    })

    expect(hasTaskBarDecorations(resolved)).toBe(false)
    expect(resolved.indicators).toEqual([])
  })
})
