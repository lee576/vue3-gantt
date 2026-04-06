import { describe, expect, it } from 'vitest'
import { createConnectionPath, createPolylinePath } from '../components/gantt/links/linkPath'
import { LinkPathType } from '../components/gantt/types/Types'

const normalizePath = (path: string) => path.replace(/\s+/g, ' ').trim()

describe('Task link path generation', () => {
  it('keeps the first rounded corner inside the route when the path starts by moving left', () => {
    const path = normalizePath(
      createConnectionPath(
        120,
        20,
        200,
        60,
        {
          pathType: LinkPathType.RIGHT_ANGLE,
          offset: 30,
          radius: 5,
          bezierCurvature: 0.4,
        },
        'left-u'
      )
    )

    expect(path).toContain('L 95 20')
    expect(path).toContain('Q 90 20 90 25')
    expect(path).not.toContain('L 85 20')
  })

  it('preserves the existing rightward rounded corner behavior for horizontal routes', () => {
    const path = normalizePath(
      createConnectionPath(
        120,
        20,
        220,
        60,
        {
          pathType: LinkPathType.RIGHT_ANGLE,
          offset: 30,
          radius: 5,
          bezierCurvature: 0.4,
        },
        'horizontal'
      )
    )

    expect(path).toContain('L 145 20')
    expect(path).toContain('Q 150 20 150 25')
  })

  it('supports multi-segment orthogonal routes so dependencies can detour around bars', () => {
    const path = normalizePath(
      createPolylinePath(
        [
          [160, 90],
          [190, 90],
          [190, 120],
          [82, 120],
          [82, 150],
          [112, 150],
        ],
        5
      )
    )

    expect(path).toContain('L 185 90')
    expect(path).toContain('Q 190 90 190 95')
    expect(path).toContain('Q 82 120 82 125')
    expect(path).toContain('Q 82 150 87 150')
    expect(path).not.toContain('L 82 150 L 112 150')
  })
})
