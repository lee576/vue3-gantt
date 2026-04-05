<template>
  <div class="task-recursion-container">
    <!-- 虚拟滚动模式 -->
    <template v-if="useVirtualScroll">
      <div
        class="virtual-scroll-spacer"
        :style="{ height: totalHeight + 'px', paddingTop: offsetY + 'px', boxSizing: 'border-box' }"
      >
        <template v-for="item in visibleItems" :key="item.item[mapFields.id] + '_taskrow'">
          <TaskRow
            v-if="headers"
            :headers="headers"
            :rowHeight="rowHeight"
            :row="item.item"
            :row-index="item.index"
            :content-class-name="contentClassName"
            :bar-row-class-name="barRowClassName"
          />
        </template>
      </div>
    </template>
    <!-- 普通模式 -->
    <template v-else>
      <template v-for="item in visibleItems" :key="item.item[mapFields.id] + '_taskrow'">
        <TaskRow
          v-if="headers"
          :headers="headers"
          :rowHeight="rowHeight"
          :row="item.item"
          :row-index="item.index"
          :content-class-name="contentClassName"
          :bar-row-class-name="barRowClassName"
        />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, onBeforeUnmount } from 'vue'
import { store, mutations } from '../state/Store'
import TaskRow from './TaskRow.vue'
import { PerformanceConfig } from '../composables/PerformanceConfig'
import { useScrollState } from '../state/ShareState'
import {
  normalizeTaskKey,
  taskHierarchyIndex,
  visibleTasks,
} from '../state/DerivedState'
import { useSharedVerticalVirtualScroll } from '../composables/useSharedVerticalVirtualScroll'

export default defineComponent({
  props: {
    headers: Array as () => any[],
    rowHeight: {
      type: Number,
      default: 0,
    },
    tasks: Array as () => any[],
    contentClassName: {
      type: String,
      default: '',
    },
    barRowClassName: {
      type: String,
      default: '',
    },
  },
  components: {
    TaskRow,
  },
  setup(props) {
    const mapFields = computed(() => store.mapFields)
    const tasks = computed(() => visibleTasks.value)
    const rowHeight = computed(() => props.rowHeight || 40)
    const { isVerticalScrolling, scrollTop, setScrollTop } = useScrollState()
    // 左右面板共享同一份虚拟窗口，这样滚动时两边渲染的是完全相同的任务切片。
    const { useVirtualScroll, totalHeight, offsetY, visibleItems, startIndex, endIndex } =
      useSharedVerticalVirtualScroll(tasks, rowHeight)

    // ========== 视口自动折叠功能 ==========
    let lastAutoCollapsedIds: Set<string | number> = new Set()

    const collectHiddenIdsFromCollapsedRoots = (
      collapsedRootIds: Set<string | number>
    ): Set<string | number> => {
      const hiddenIds = new Set<string | number>()
      const idField = mapFields.value.id
      const { childrenByParentId } = taskHierarchyIndex.value

      const walk = (taskId: string | number) => {
        const normalizedTaskId = normalizeTaskKey(taskId)
        const children = childrenByParentId.get(normalizedTaskId) ?? []

        for (const child of children) {
          const childId = child[idField] as string | number
          if (hiddenIds.has(childId)) {
            continue
          }

          hiddenIds.add(childId)
          walk(childId)
        }
      }

      for (const collapsedRootId of collapsedRootIds) {
        walk(collapsedRootId)
      }

      return hiddenIds
    }

    const updateAutoCollapseState = (): void => {
      if (
        !PerformanceConfig.ENABLE_VIEWPORT_COLLAPSE ||
        tasks.value.length < PerformanceConfig.VIEWPORT_COLLAPSE_THRESHOLD
      ) {
        if (lastAutoCollapsedIds.size > 0) {
          lastAutoCollapsedIds = new Set()
          mutations.clearAutoCollapsedTasks()
        }
        return
      }

      const buffer = PerformanceConfig.VIEWPORT_COLLAPSE_BUFFER
      const visibleStart = startIndex.value
      const visibleEnd = endIndex.value

      const autoCollapseStart = Math.max(0, visibleStart - buffer)
      const autoCollapseEnd = Math.min(tasks.value.length - 1, visibleEnd + buffer)

      const tasksToCollapse = new Set<string | number>()
      const { hasChildrenById, ancestorChainById } = taskHierarchyIndex.value
      const protectedTaskIds = new Set<string>()

      // 保护当前视口以及它们的整条祖先链。
      // 否则当用户滚到很靠下的位置时，顶部某个父任务虽然自身已经离开视口，
      // 但它仍然是当前可见任务的祖先；如果这里把它自动折叠，就会把当前视口整段内容一起隐藏，
      // 最终表现成可见任务数量骤减，滚动条位置被浏览器强制夹回顶部。
      for (let i = visibleStart; i <= visibleEnd && i < tasks.value.length; i += 1) {
        const task = tasks.value[i]
        const normalizedTaskId = normalizeTaskKey(task[mapFields.value.id])
        protectedTaskIds.add(normalizedTaskId)

        const ancestorChain = ancestorChainById.get(normalizedTaskId) ?? []
        for (const ancestorId of ancestorChain) {
          protectedTaskIds.add(ancestorId)
        }
      }

      // 自动折叠只处理“视口外而且本身有子节点”的任务。
      // 这样可见区附近的树始终展开，离屏很远的树则自动收起，减少深层嵌套渲染成本。
      for (let i = 0; i < tasks.value.length; i++) {
        if (i >= autoCollapseStart && i <= autoCollapseEnd) {
          continue
        }

        const task = tasks.value[i]
        const taskId = task[mapFields.value.id]
        const normalizedTaskId = normalizeTaskKey(taskId)

        if (
          hasChildrenById.has(normalizedTaskId) &&
          !store.collapsedTasks.has(taskId) &&
          !protectedTaskIds.has(normalizedTaskId)
        ) {
          tasksToCollapse.add(taskId)
        }
      }

      const hasChanged =
        tasksToCollapse.size !== lastAutoCollapsedIds.size ||
        ![...tasksToCollapse].every(id => lastAutoCollapsedIds.has(id))

      if (hasChanged) {
        const currentTopTask =
          tasks.value[Math.min(startIndex.value, Math.max(0, tasks.value.length - 1))]

        const currentTopTaskId = currentTopTask
          ? (currentTopTask[mapFields.value.id] as string | number)
          : null

        const scrollOffsetInsideRow =
          rowHeight.value > 0 ? scrollTop.value % rowHeight.value : 0

        const effectiveCollapsedRoots = new Set<string | number>([
          ...store.collapsedTasks,
          ...tasksToCollapse,
        ])

        const nextHiddenIds = collectHiddenIdsFromCollapsedRoots(effectiveCollapsedRoots)
        const nextVisibleTasks = store.tasks.filter(
          task => !nextHiddenIds.has(task[mapFields.value.id] as string | number)
        )

        // 只有集合内容真的变了才写回 store，避免滚动过程中重复触发响应式更新。
        lastAutoCollapsedIds = new Set(tasksToCollapse)
        mutations.updateAutoCollapsedTasks(tasksToCollapse)

        if (currentTopTaskId !== null) {
          const nextTopIndex = nextVisibleTasks.findIndex(
            task => task[mapFields.value.id] === currentTopTaskId
          )

          // 自动折叠会移除当前视口上方的大量行，导致当前 scrollTop 对应的逻辑行号失真。
          // 这里把“当前视口顶部任务”作为锚点，折叠后重新定位到它在新可见列表中的 index，
          // 避免浏览器因为内容高度突变把滚动条夹回顶部。
          if (nextTopIndex >= 0) {
            const nextScrollTop = nextTopIndex * rowHeight.value + scrollOffsetInsideRow
            if (Math.abs(nextScrollTop - scrollTop.value) >= 1) {
              setScrollTop(nextScrollTop)
            }
          }
        }
      }
    }

    let autoCollapseTimer: number | null = null
    const debouncedUpdateAutoCollapse = () => {
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer)
      }
      autoCollapseTimer = window.setTimeout(() => {
        updateAutoCollapseState()
        autoCollapseTimer = null
      }, PerformanceConfig.VIEWPORT_COLLAPSE_DEBOUNCE_DELAY)
    }

    // 监听可见范围变化，更新自动折叠状态
    watch(
      [startIndex, endIndex],
      () => {
        // 滚动过程中冻结自动折叠，避免大跳转时“窗口变化 -> 折叠集合变化 -> 可见任务再变化”
        // 这一串响应式连锁反复叠加。停下来后会由下面的 watch 统一补算一次。
        if (isVerticalScrolling.value) {
          return
        }
        debouncedUpdateAutoCollapse()
      }
    )

    watch(isVerticalScrolling, scrolling => {
      if (!scrolling) {
        debouncedUpdateAutoCollapse()
      }
    })

    watch(
      () => store.tasks.length,
      () => {
        // 这里只在“原始任务集”变化时清空自动折叠缓存。
        // 如果监听的是 visibleTasks.length，那么自动折叠自己造成的可见数量变化
        // 会反过来把 autoCollapsedTasks 清空，形成一轮“折叠 -> 展开”的抖动，
        // 列表总高度也会瞬间变化，最终把滚动条位置冲掉。
        mutations.clearAutoCollapsedTasks()
        lastAutoCollapsedIds = new Set()
      }
    )

    onBeforeUnmount(() => {
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer)
      }
      mutations.clearAutoCollapsedTasks()
    })

    return {
      mapFields,
      // 虚拟滚动相关
      useVirtualScroll,
      totalHeight,
      offsetY,
      visibleItems,
      tasks,
      startIndex,
      endIndex,
    }
  },
})
</script>

<style scoped>
.task-recursion-container {
  width: 100%;
}

.virtual-scroll-spacer {
  width: 100%;
}
</style>
