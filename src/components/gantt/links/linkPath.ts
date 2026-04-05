import { LinkPathType } from '../types/Types'

export type ConnectionVariant = 'horizontal' | 'left-u' | 'right-u' | 'cross'

interface LinkPathOptions {
  pathType: LinkPathType
  offset: number
  radius: number
  bezierCurvature: number
}

export function createArrowPoints(
  endX: number,
  endY: number,
  direction: 'left' | 'right',
  size: number
): string {
  if (direction === 'right') {
    return `${endX},${endY} ${endX - size},${endY - size / 2} ${endX - size},${endY + size / 2}`
  }

  return `${endX},${endY} ${endX + size},${endY - size / 2} ${endX + size},${endY + size / 2}`
}

export function createConnectionPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: LinkPathOptions,
  variant: ConnectionVariant
): string {
  if (options.pathType === LinkPathType.STRAIGHT) {
    return `M ${startX} ${startY} L ${endX} ${endY}`
  }

  if (options.pathType === LinkPathType.BEZIER) {
    switch (variant) {
      case 'horizontal': {
        const curvature = Math.max(
          options.offset,
          Math.abs(endX - startX) * options.bezierCurvature
        )
        return `M ${startX} ${startY} C ${startX + curvature} ${startY} ${endX - curvature} ${endY} ${endX} ${endY}`
      }
      case 'left-u': {
        const midX = Math.min(startX, endX) - options.offset
        return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`
      }
      case 'right-u': {
        const midX = Math.max(startX, endX) + options.offset
        return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`
      }
      case 'cross': {
        const midX = startX + (endX - startX) / 2
        return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`
      }
    }
  }

  const segments = (() => {
    switch (variant) {
      case 'horizontal': {
        const midX = startX + options.offset
        return [
          [startX, startY],
          [midX, startY],
          [midX, endY],
          [endX, endY],
        ] as const
      }
      case 'left-u': {
        const midX = Math.min(startX, endX) - options.offset
        return [
          [startX, startY],
          [midX, startY],
          [midX, endY],
          [endX, endY],
        ] as const
      }
      case 'right-u': {
        const midX = Math.max(startX, endX) + options.offset
        return [
          [startX, startY],
          [midX, startY],
          [midX, endY],
          [endX, endY],
        ] as const
      }
      case 'cross': {
        const midX = startX + (endX - startX) / 2
        return [
          [startX, startY],
          [midX, startY],
          [midX, endY],
          [endX, endY],
        ] as const
      }
    }
  })()

  if (options.radius <= 0 || segments.length < 4) {
    return `M ${segments[0][0]} ${segments[0][1]} L ${segments[1][0]} ${segments[1][1]} L ${segments[2][0]} ${segments[2][1]} L ${segments[3][0]} ${segments[3][1]}`
  }

  const [p1, p2, p3, p4] = segments
  const firstHorizontalDirection = p2[0] >= p1[0] ? 1 : -1
  const firstVerticalDirection = p3[1] >= p2[1] ? 1 : -1
  const secondHorizontalDirection = p4[0] >= p3[0] ? 1 : -1
  const safeRadius = Math.min(
    options.radius,
    Math.abs(p2[0] - p1[0]) / 2,
    Math.abs(p3[1] - p2[1]) / 2,
    Math.abs(p4[0] - p3[0]) / 2
  )

  return `M ${p1[0]} ${p1[1]}
          L ${p2[0] - safeRadius * firstHorizontalDirection} ${p2[1]}
          Q ${p2[0]} ${p2[1]} ${p2[0]} ${p2[1] + safeRadius * firstVerticalDirection}
          L ${p3[0]} ${p3[1] - safeRadius * firstVerticalDirection}
          Q ${p3[0]} ${p3[1]} ${p3[0] + safeRadius * secondHorizontalDirection} ${p3[1]}
          L ${p4[0]} ${p4[1]}`
}
