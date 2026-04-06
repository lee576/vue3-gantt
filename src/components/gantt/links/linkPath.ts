import { LinkPathType } from '../types/Types'

export type ConnectionVariant = 'horizontal' | 'left-u' | 'right-u' | 'cross'
export type ConnectionPoint = readonly [number, number]

interface LinkPathOptions {
  pathType: LinkPathType
  offset: number
  radius: number
  bezierCurvature: number
}

const createPolylinePathInternal = (
  points: readonly ConnectionPoint[],
  radius: number
): string => {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0][0]} ${points[0][1]}`
  }

  if (radius <= 0 || points.length < 3) {
    return points.reduce((path, [x, y], index) => {
      if (index === 0) {
        return `M ${x} ${y}`
      }

      return `${path} L ${x} ${y}`
    }, '')
  }

  const firstPoint = points[0]
  let path = `M ${firstPoint[0]} ${firstPoint[1]}`

  for (let index = 1; index < points.length - 1; index += 1) {
    const previousPoint = points[index - 1]
    const currentPoint = points[index]
    const nextPoint = points[index + 1]

    const previousVectorX = currentPoint[0] - previousPoint[0]
    const previousVectorY = currentPoint[1] - previousPoint[1]
    const nextVectorX = nextPoint[0] - currentPoint[0]
    const nextVectorY = nextPoint[1] - currentPoint[1]

    const previousLength = Math.hypot(previousVectorX, previousVectorY)
    const nextLength = Math.hypot(nextVectorX, nextVectorY)

    if (previousLength === 0 || nextLength === 0) {
      path += ` L ${currentPoint[0]} ${currentPoint[1]}`
      continue
    }

    const safeRadius = Math.min(radius, previousLength / 2, nextLength / 2)

    if (safeRadius <= 0) {
      path += ` L ${currentPoint[0]} ${currentPoint[1]}`
      continue
    }

    const entryX = currentPoint[0] - (previousVectorX / previousLength) * safeRadius
    const entryY = currentPoint[1] - (previousVectorY / previousLength) * safeRadius
    const exitX = currentPoint[0] + (nextVectorX / nextLength) * safeRadius
    const exitY = currentPoint[1] + (nextVectorY / nextLength) * safeRadius

    path += ` L ${entryX} ${entryY}`
    path += ` Q ${currentPoint[0]} ${currentPoint[1]} ${exitX} ${exitY}`
  }

  const lastPoint = points[points.length - 1]
  path += ` L ${lastPoint[0]} ${lastPoint[1]}`

  return path
}

export function createPolylinePath(
  points: readonly ConnectionPoint[],
  radius = 0
): string {
  return createPolylinePathInternal(points, radius)
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

  return createPolylinePathInternal(segments, options.radius)
}
