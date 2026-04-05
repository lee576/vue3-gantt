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
      zIndex: 50,
      overflow: 'visible',
    }"
  >
    <g v-for="link in links" :key="link.id">
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
  normalizeTaskKey,
  taskHierarchyIndex,
} from '../state/DerivedState'
import {
  useTaskPositionRegistry,
  type TaskVisualPosition,
} from '../state/TaskPositionRegistry'
import { useScrollState } from '../state/ShareState'

type ConnectionVariant = 'horizontal' | 'left-u' | 'right-u' | 'cross'

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

    const createArrowPoints = (
      endX: number,
      endY: number,
      direction: 'left' | 'right'
    ): string => {
      const size = props.linkConfig.arrowSize || 8

      if (direction === 'right') {
        return `${endX},${endY} ${endX - size},${endY - size / 2} ${endX - size},${endY + size / 2}`
      }

      return `${endX},${endY} ${endX + size},${endY - size / 2} ${endX + size},${endY + size / 2}`
    }

    const createConnectionPath = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      pathType: LinkPathType,
      variant: ConnectionVariant
    ): string => {
      if (pathType === LinkPathType.STRAIGHT) {
        return `M ${startX} ${startY} L ${endX} ${endY}`
      }

      const offset = props.linkConfig.rightAngleOffset || 30
      const radius = props.linkConfig.smoothCorners ? props.linkConfig.cornerRadius || 0 : 0

      // 这里保留一套轻量路径生成逻辑：
      // 1. 所有路径都只依赖缓存的几何数据；
      // 2. pathType 只控制折线 / 贝塞尔的样式，不再读取 DOM；
      // 3. variant 用来区分不同依赖类型的绕行方向。
      if (pathType === LinkPathType.BEZIER) {
        switch (variant) {
          case 'horizontal': {
            const curvature = Math.max(offset, Math.abs(endX - startX) * props.linkConfig.bezierCurvature)
            return `M ${startX} ${startY} C ${startX + curvature} ${startY} ${endX - curvature} ${endY} ${endX} ${endY}`
          }
          case 'left-u': {
            const midX = Math.min(startX, endX) - offset
            return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`
          }
          case 'right-u': {
            const midX = Math.max(startX, endX) + offset
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
            const midX = startX + offset
            return [
              [startX, startY],
              [midX, startY],
              [midX, endY],
              [endX, endY],
            ]
          }
          case 'left-u': {
            const midX = Math.min(startX, endX) - offset
            return [
              [startX, startY],
              [midX, startY],
              [midX, endY],
              [endX, endY],
            ]
          }
          case 'right-u': {
            const midX = Math.max(startX, endX) + offset
            return [
              [startX, startY],
              [midX, startY],
              [midX, endY],
              [endX, endY],
            ]
          }
          case 'cross': {
            const midX = startX + (endX - startX) / 2
            return [
              [startX, startY],
              [midX, startY],
              [midX, endY],
              [endX, endY],
            ]
          }
        }
      })()

      if (radius <= 0 || segments.length < 4) {
        return `M ${segments[0][0]} ${segments[0][1]} L ${segments[1][0]} ${segments[1][1]} L ${segments[2][0]} ${segments[2][1]} L ${segments[3][0]} ${segments[3][1]}`
      }

      const [p1, p2, p3, p4] = segments
      const firstVerticalDirection = p3[1] >= p2[1] ? 1 : -1
      const secondHorizontalDirection = p4[0] >= p3[0] ? 1 : -1
      const safeRadius = Math.min(radius, Math.abs(p3[1] - p2[1]) / 2, Math.abs(p4[0] - p3[0]) / 2)

      return `M ${p1[0]} ${p1[1]}
              L ${p2[0] - safeRadius} ${p2[1]}
              Q ${p2[0]} ${p2[1]} ${p2[0]} ${p2[1] + safeRadius * firstVerticalDirection}
              L ${p3[0]} ${p3[1] - safeRadius * firstVerticalDirection}
              Q ${p3[0]} ${p3[1]} ${p3[0] + safeRadius * secondHorizontalDirection} ${p3[1]}
              L ${p4[0]} ${p4[1]}`
    }

    const createParentChildLink = (
      parentPosition: TaskVisualPosition,
      childPosition: TaskVisualPosition,
      parentId: string,
      childId: string
    ): TaskLink => {
      const endX = childPosition.leftX - (props.linkConfig.arrowSize || 8)
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
          props.linkConfig.pathType,
          'horizontal'
        ),
        arrowPoints: props.linkConfig.showArrow
          ? createArrowPoints(childPosition.leftX, childPosition.centerY, 'right')
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
        path: createConnectionPath(
          startX,
          startY,
          endX,
          endY,
          props.linkConfig.pathType,
          variant
        ),
        arrowPoints: props.linkConfig.showArrow
          ? createArrowPoints(
              direction === 'right' ? endX + arrowSize : endX - arrowSize,
              endY,
              direction
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

  .task-link {
    transition: stroke-width 0.2s ease;

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
