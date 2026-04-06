<template>
  <svg
    class="task-links-layer"
    :class="{ 'is-scrolling': isScrolling }"
    :width="containerWidth"
    :height="containerHeight"
    :style="{
      position: 'absolute',
      top: '0px',
      left: '0px',
      pointerEvents: 'none',
      zIndex: 160,
      overflow: 'visible',
    }"
  >
    <g v-for="link in links" :key="link.id">
      <path
        :d="link.path"
        :stroke="getLinkBackdropColor(link.type)"
        :stroke-width="getLinkBackdropWidth(link.type)"
        fill="none"
        class="task-link-backdrop"
      />
      <path
        :d="link.path"
        :stroke="getLinkStyle(link.type).color"
        :stroke-width="getLinkStyle(link.type).width"
        :stroke-dasharray="getLinkStyle(link.type).dashArray"
        fill="none"
        :class="[
          'task-link',
          link.type,
          {
            'dash-animated': isDashedLine(link.type) && linkConfig.enableDashAnimation,
          },
        ]"
        :style="getDashAnimationStyle(link)"
      />

      <polygon
        v-if="linkConfig.showArrow && link.arrowPoints"
        :points="link.arrowPoints"
        :fill="getLinkStyle(link.type).color"
        :stroke="getLinkStyle(link.type).color"
        :stroke-width="0.5"
        class="task-link-arrow"
      />

      <text
        v-if="link.label && linkConfig.showLabels"
        :x="link.labelX"
        :y="link.labelY"
        :fill="linkConfig.labelColor"
        :font-size="linkConfig.labelFontSize"
        text-anchor="middle"
        class="task-link-label"
      >
        {{ link.label }}
      </text>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { store } from '../state/Store'
import { LinkPathType, LinkType, type LinkConfig, type TaskLink } from '../types/Types'
import { linkDataManager } from '../composables/LinkConfig'
import {
  createArrowPoints,
  createConnectionPath,
  createPolylinePath,
  type ConnectionPoint,
  type ConnectionVariant,
} from './linkPath'
import {
  normalizeTaskKey,
  taskHierarchyIndex,
} from '../state/DerivedState'
import {
  useTaskPositionRegistry,
  type TaskVisualPosition,
} from '../state/TaskPositionRegistry'
import { useScrollState } from '../state/ShareState'

const defaultVisibility = {
  finishToStart: true,
  startToStart: true,
  finishToFinish: true,
  startToFinish: true,
  parentChild: true,
}

export default defineComponent({
  name: 'TaskLinks',
  props: {
    containerWidth: {
      type: Number,
      required: true,
    },
    containerHeight: {
      type: Number,
      required: true,
    },
    linkConfig: {
      type: Object as () => LinkConfig,
      required: true,
    },
  },
  setup(props) {
    const { taskPositions } = useTaskPositionRegistry()
    const { scrollTop } = useScrollState()
    const isScrolling = ref(false)
    let scrollEndTimer: number | null = null

    const visibility = computed(
      () => props.linkConfig.linkTypeVisibility ?? defaultVisibility
    )

    watch(
      scrollTop,
      () => {
        isScrolling.value = true
        if (scrollEndTimer) {
          clearTimeout(scrollEndTimer)
        }
        scrollEndTimer = window.setTimeout(() => {
          isScrolling.value = false
          scrollEndTimer = null
        }, 120)
      },
      { flush: 'post' }
    )

    const getLinkTypeColor = (linkType: LinkType): string => {
      const colors = props.linkConfig.linkTypeColors
      if (!colors) {
        const fallbackColors: Record<LinkType, string> = {
          [LinkType.FINISH_TO_START]: '#3498db',
          [LinkType.START_TO_START]: '#2ecc71',
          [LinkType.FINISH_TO_FINISH]: '#e74c3c',
          [LinkType.START_TO_FINISH]: '#f39c12',
          [LinkType.PARENT_CHILD]: '#95a5a6',
        }
        return fallbackColors[linkType]
      }

      switch (linkType) {
        case LinkType.FINISH_TO_START:
          return colors.finishToStart || '#3498db'
        case LinkType.START_TO_START:
          return colors.startToStart || '#2ecc71'
        case LinkType.FINISH_TO_FINISH:
          return colors.finishToFinish || '#e74c3c'
        case LinkType.START_TO_FINISH:
          return colors.startToFinish || '#f39c12'
        case LinkType.PARENT_CHILD:
          return props.linkConfig.parentChildStyle.color || '#95a5a6'
      }
    }

    const getLinkStyle = (linkType: LinkType) => {
      if (linkType === LinkType.PARENT_CHILD) {
        return {
          color: props.linkConfig.parentChildStyle.color || '#95a5a6',
          width: props.linkConfig.parentChildStyle.width,
          dashArray: props.linkConfig.parentChildStyle.dashArray,
        }
      }

      return {
        color: getLinkTypeColor(linkType),
        width: props.linkConfig.width,
        dashArray: props.linkConfig.dashArray,
      }
    }

    const getLinkBackdropColor = (linkType: LinkType): string => {
      if (linkType === LinkType.PARENT_CHILD) {
        return 'rgba(255, 255, 255, 0.9)'
      }

      return 'rgba(255, 255, 255, 0.92)'
    }

    const getLinkBackdropWidth = (linkType: LinkType): number => {
      return getLinkStyle(linkType).width + 3
    }

    const isDashedLine = (linkType: LinkType): boolean => {
      const style = getLinkStyle(linkType)
      return !!(style.dashArray && style.dashArray.length > 0)
    }

    const getDashAnimationStyle = (link: TaskLink) => {
      if (!isDashedLine(link.type) || !props.linkConfig.enableDashAnimation) {
        return {}
      }

      const style = getLinkStyle(link.type)
      const dashArray = style.dashArray || '5,5'
      const dashLength = dashArray
        .split(',')
        .map(value => Number(value))
        .reduce((sum, value) => sum + value, 0)

      return {
        '--animation-duration': `${props.linkConfig.dashAnimationSpeed || 0.8}s`,
        '--dash-length': `${dashLength}px`,
      }
    }

    const createParentChildLink = (
      parentPosition: TaskVisualPosition,
      childPosition: TaskVisualPosition,
      parentId: string,
      childId: string
    ): TaskLink => {
      const arrowSize = props.linkConfig.arrowSize || 8
      const endX = childPosition.leftX - arrowSize
      const endY = childPosition.centerY
      const startX = parentPosition.leftX
      const startY = parentPosition.centerY

      return {
        id: `parent-child-${parentId}-${childId}`,
        sourceId: parentId,
        targetId: childId,
        type: LinkType.PARENT_CHILD,
        path: createConnectionPath(
          startX,
          startY,
          endX,
          endY,
          {
            pathType: LinkPathType.RIGHT_ANGLE,
            offset: props.linkConfig.rightAngleOffset || 30,
            radius: props.linkConfig.smoothCorners ? props.linkConfig.cornerRadius || 0 : 0,
            bezierCurvature: props.linkConfig.bezierCurvature,
          },
          'left-u'
        ),
        arrowPoints: props.linkConfig.showArrow
          ? createArrowPoints(
              childPosition.leftX,
              childPosition.centerY,
              'right',
              arrowSize
            )
          : '',
        labelX: childPosition.centerX,
        labelY: childPosition.centerY - 10,
        sourceY: parentPosition.centerY,
        targetY: childPosition.centerY,
      }
    }

    const createDependencyLink = (
      sourcePosition: TaskVisualPosition,
      targetPosition: TaskVisualPosition,
      type: LinkType,
      dependencyId: string
    ): TaskLink => {
      const arrowSize = props.linkConfig.arrowSize || 8
      const routeOffset = Math.max(16, props.linkConfig.rightAngleOffset || 30)
      let startX = sourcePosition.rightX
      let endX = targetPosition.leftX - arrowSize
      let direction: 'left' | 'right' = 'right'
      let variant: ConnectionVariant = 'horizontal'

      if (type === LinkType.START_TO_START) {
        startX = sourcePosition.leftX
        endX = targetPosition.leftX - arrowSize
        variant = 'left-u'
      } else if (type === LinkType.FINISH_TO_FINISH) {
        startX = sourcePosition.rightX
        endX = targetPosition.rightX + arrowSize
        direction = 'left'
        variant = 'right-u'
      } else if (type === LinkType.START_TO_FINISH) {
        startX = sourcePosition.leftX
        endX = targetPosition.rightX + arrowSize
        direction = 'left'
        variant = 'cross'
      }

      const endY = targetPosition.centerY
      const startY = sourcePosition.centerY
      const routeRadius = props.linkConfig.smoothCorners
        ? props.linkConfig.cornerRadius || 0
        : 0

      const createDependencyRoutePoints = (): ConnectionPoint[] | null => {
        const createLaneY = () => {
          if (startY === endY) {
            return startY
          }

          if (startY < endY) {
            const laneTop = sourcePosition.bottomY
            const laneBottom = targetPosition.topY

            if (laneBottom > laneTop) {
              return laneTop + (laneBottom - laneTop) / 2
            }
          } else {
            const laneTop = targetPosition.bottomY
            const laneBottom = sourcePosition.topY

            if (laneBottom > laneTop) {
              return laneTop + (laneBottom - laneTop) / 2
            }
          }

          return startY + (endY - startY) / 2
        }

        const laneY = createLaneY()

        switch (type) {
          case LinkType.FINISH_TO_START: {
            const sourceExitX = sourcePosition.rightX + routeOffset
            const targetEntryX = targetPosition.leftX - routeOffset

            if (sourceExitX <= targetEntryX) {
              return [
                [startX, startY],
                [sourceExitX, startY],
                [sourceExitX, endY],
                [endX, endY],
              ]
            }

            return [
              [startX, startY],
              [sourceExitX, startY],
              [sourceExitX, laneY],
              [targetEntryX, laneY],
              [targetEntryX, endY],
              [endX, endY],
            ]
          }

          case LinkType.START_TO_START: {
            const corridorX = Math.min(sourcePosition.leftX, targetPosition.leftX) - routeOffset
            return [
              [startX, startY],
              [corridorX, startY],
              [corridorX, endY],
              [endX, endY],
            ]
          }

          case LinkType.FINISH_TO_FINISH: {
            const corridorX = Math.max(sourcePosition.rightX, targetPosition.rightX) + routeOffset
            return [
              [startX, startY],
              [corridorX, startY],
              [corridorX, endY],
              [endX, endY],
            ]
          }

          case LinkType.START_TO_FINISH: {
            const sourceExitX = sourcePosition.leftX - routeOffset
            const targetEntryX = targetPosition.rightX + routeOffset
            return [
              [startX, startY],
              [sourceExitX, startY],
              [sourceExitX, laneY],
              [targetEntryX, laneY],
              [targetEntryX, endY],
              [endX, endY],
            ]
          }

          default:
            return null
        }
      }

      const dependencyRoutePoints = createDependencyRoutePoints()
      const routedPathRadius =
        props.linkConfig.pathType === LinkPathType.BEZIER
          ? Math.max(routeRadius, Math.min(routeOffset / 2, 18))
          : routeRadius
      const dependencyPath =
        props.linkConfig.pathType !== LinkPathType.STRAIGHT && dependencyRoutePoints
          ? createPolylinePath(dependencyRoutePoints, routedPathRadius)
          : createConnectionPath(
              startX,
              startY,
              endX,
              endY,
              {
                pathType: props.linkConfig.pathType,
                offset: props.linkConfig.rightAngleOffset || 30,
                radius: routeRadius,
                bezierCurvature: props.linkConfig.bezierCurvature,
              },
              variant
            )

      // 依赖线的起止点完全由缓存几何推导，不再依赖 DOM 读布局。
      // 这样滚动和拖拽时只要位置缓存更新，这里就能同步拿到最新结果。
      return {
        id: `dependency-${dependencyId}`,
        sourceId: String(sourcePosition.taskId),
        targetId: String(targetPosition.taskId),
        type,
        label:
          type === LinkType.FINISH_TO_START
            ? 'FS'
            : type === LinkType.START_TO_START
              ? 'SS'
              : type === LinkType.FINISH_TO_FINISH
                ? 'FF'
                : 'SF',
        path: dependencyPath,
        arrowPoints: props.linkConfig.showArrow
          ? createArrowPoints(
              direction === 'right' ? endX + arrowSize : endX - arrowSize,
              endY,
              direction,
              arrowSize
            )
          : '',
        labelX: (sourcePosition.centerX + targetPosition.centerX) / 2,
        labelY: (sourcePosition.centerY + targetPosition.centerY) / 2 - 10,
        sourceY: sourcePosition.centerY,
        targetY: targetPosition.centerY,
      }
    }

    const shouldShowLinkType = (linkType: LinkType | number): boolean => {
      if (typeof linkType === 'number') {
        switch (linkType) {
          case 0:
            return visibility.value.finishToStart
          case 1:
            return visibility.value.startToStart
          case 2:
            return visibility.value.finishToFinish
          case 3:
            return visibility.value.startToFinish
          default:
            return true
        }
      }

      switch (linkType) {
        case LinkType.FINISH_TO_START:
          return visibility.value.finishToStart
        case LinkType.START_TO_START:
          return visibility.value.startToStart
        case LinkType.FINISH_TO_FINISH:
          return visibility.value.finishToFinish
        case LinkType.START_TO_FINISH:
          return visibility.value.startToFinish
        case LinkType.PARENT_CHILD:
          return visibility.value.parentChild
      }
    }

    const links = computed<TaskLink[]>(() => {
      // 拖动滚动条时最重的成本不是 path 计算本身，而是每一帧都要在大量位置更新后
      // 重新拼整层依赖线。滚动中的连线短暂隐藏，等滚动停下后一帧再恢复，可显著降低卡顿。
      if (isScrolling.value) {
        return []
      }

      // 通过读取 shallowRef 的 value，让位置注册表更新能够触发整层连线重算。
      const positionMap = taskPositions.value
      const result: TaskLink[] = []
      const parentIdField = store.mapFields.parentId
      const positionedIds = new Set(positionMap.keys())
      const taskById = taskHierarchyIndex.value.taskById

      if (visibility.value.parentChild) {
        // 连线层真正能画出来的，只会是当前已经登记过几何位置的任务。
        // 旧实现这里遍历整份 visibleTasks，在 6 万条数据下会白白扫描大量
        // “可见但不在虚拟窗口内、也没有位置缓存”的任务。
        // 现在直接反向基于 positionMap 遍历，把这条链路收敛到“当前挂载行数量”。
        for (const [childId, childPosition] of positionMap.entries()) {
          const childTask = taskById.get(childId)
          if (!childTask) {
            continue
          }

          const parentId = normalizeTaskKey(childTask[parentIdField] as string | number)

          if (parentId === '0' || !positionedIds.has(parentId)) {
            continue
          }

          const parentPosition = positionMap.get(parentId)

          if (parentPosition && childPosition) {
            result.push(createParentChildLink(parentPosition, childPosition, parentId, childId))
          }
        }
      }

      for (const dependency of linkDataManager.getDependencies()) {
        if (!shouldShowLinkType(dependency.type)) {
          continue
        }

        const sourceId = normalizeTaskKey(dependency.sourceTaskId)
        const targetId = normalizeTaskKey(dependency.targetTaskId)

        // 只有当两端任务都已经登记几何位置时，才渲染依赖线。
        // 这样依赖线复杂度会跟随“当前挂载窗口”而不是“整份可见任务集”变化。
        if (!positionedIds.has(sourceId) || !positionedIds.has(targetId)) {
          continue
        }

        const sourcePosition = positionMap.get(sourceId)
        const targetPosition = positionMap.get(targetId)

        if (sourcePosition && targetPosition) {
          result.push(
            createDependencyLink(
              sourcePosition,
              targetPosition,
              dependency.type as LinkType,
              dependency.id
            )
          )
        }
      }

      return result
    })

    return {
      links,
      isScrolling,
      getLinkStyle,
      getLinkBackdropColor,
      getLinkBackdropWidth,
      isDashedLine,
      getDashAnimationStyle,
      linkConfig: props.linkConfig,
    }
  },
})
</script>

<style lang="scss" scoped>
.task-links-layer {
  pointer-events: none;

  .task-link-backdrop {
    pointer-events: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 1;
  }

  .task-link {
    transition: stroke-width 0.2s ease;
    stroke-linecap: round;
    stroke-linejoin: round;

    &:hover {
      stroke-width: 3;
    }

    &.parent-child {
      opacity: 0.7;
    }

    &.finish-to-start {
      opacity: 0.9;
    }

    &.dash-animated {
      animation: dashFlow var(--animation-duration, 3s) linear infinite;
    }
  }

  &.is-scrolling {
    .task-link.dash-animated {
      animation-play-state: paused;
    }
  }

  @keyframes dashFlow {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: calc(-1 * var(--dash-length, 20px));
    }
  }

  .task-link-arrow {
    transition: fill 0.2s ease;
    opacity: 1;
    pointer-events: none;
  }

  .task-link-label {
    font-family: Arial, sans-serif;
    user-select: none;
  }
}
</style>
