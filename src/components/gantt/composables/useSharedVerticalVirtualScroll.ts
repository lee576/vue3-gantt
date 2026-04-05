import { computed, ref, shallowRef, watch, type Ref, type WatchStopHandle } from 'vue'
import { PerformanceConfig } from './PerformanceConfig'
import { useScrollState } from '../state/ShareState'

export interface SharedVirtualItem<T> {
  item: T
  index: number
}

const sharedItems = shallowRef<unknown[]>([])
const sharedRowHeight = shallowRef(0)
const startIndex = ref(0)
const endIndex = ref(0)
const lastScrollTop = ref(0)
const visibleItems = shallowRef<SharedVirtualItem<unknown>[]>([])
let bindingStops: WatchStopHandle[] = []
let boundItemsRef: Ref<unknown[]> | null = null
let boundRowHeightRef: Ref<number> | null = null

const { scrollTop, viewportHeight } = useScrollState()

const useVirtualScroll = computed(
  () =>
    PerformanceConfig.ENABLE_VIRTUAL_SCROLL &&
    sharedItems.value.length >= PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD
)

const totalHeight = computed(() => sharedItems.value.length * sharedRowHeight.value)
const offsetY = computed(() => startIndex.value * sharedRowHeight.value)

const rebuildVisibleItems = () => {
  if (!useVirtualScroll.value) {
    // 小数据场景下直接复用全量列表，避免左右两个面板各自 map 一遍同样的数据。
    visibleItems.value = sharedItems.value.map((item, index) => ({ item, index }))
    return
  }

  const nextVisibleItems: SharedVirtualItem<unknown>[] = []
  for (
    let index = startIndex.value;
    index <= endIndex.value && index < sharedItems.value.length;
    index += 1
  ) {
    nextVisibleItems.push({
      item: sharedItems.value[index],
      index,
    })
  }
  visibleItems.value = nextVisibleItems
}

const updateVisibleRange = (currentScrollTop: number) => {
  const currentRowHeight = sharedRowHeight.value || 1
  const currentViewportHeight = viewportHeight.value || 500
  const scrollDelta = Math.abs(currentScrollTop - lastScrollTop.value)
  const visibleRowCount = Math.max(1, Math.ceil(currentViewportHeight / currentRowHeight))
  const scrollDeltaRows = scrollDelta / currentRowHeight
  const isJumpScroll = scrollDeltaRows > visibleRowCount
  const isFastScroll = scrollDeltaRows > 5
  const buffer = isJumpScroll
    ? PerformanceConfig.VIRTUAL_SCROLL_JUMP_SCROLL_BUFFER
    : isFastScroll
      ? PerformanceConfig.VIRTUAL_SCROLL_FAST_SCROLL_BUFFER
      : PerformanceConfig.VIRTUAL_SCROLL_BUFFER

  const start = Math.max(0, Math.floor(currentScrollTop / currentRowHeight) - buffer)
  const end = Math.min(sharedItems.value.length - 1, start + visibleRowCount + buffer * 2)

  startIndex.value = start
  endIndex.value = Math.max(end, start)
  lastScrollTop.value = currentScrollTop
}

const stopBindings = () => {
  for (const stop of bindingStops) {
    stop()
  }
  bindingStops = []
  boundItemsRef = null
  boundRowHeightRef = null
}

const bindSharedSources = <T>(items: Ref<T[]>, rowHeight: Ref<number>) => {
  // 左右两个面板都调用这个 composable，但它们消费的是同一批任务和同一行高。
  // 因此这里把输入源绑定到一份模块级状态上，让可见区间和切片只计算一次，
  // 避免出现“左右各自 watch / slice，一边先切到新窗口、另一边晚一拍”的视觉滞后。
  if (boundItemsRef === items && boundRowHeightRef === rowHeight) {
    return
  }

  stopBindings()
  boundItemsRef = items as Ref<unknown[]>
  boundRowHeightRef = rowHeight
  bindingStops = [
    watch(
      items,
      currentItems => {
        sharedItems.value = currentItems
      },
      { immediate: true }
    ),
    watch(
      rowHeight,
      currentRowHeight => {
        sharedRowHeight.value = currentRowHeight
      },
      { immediate: true }
    ),
  ]
}

watch(
  [sharedItems, sharedRowHeight, scrollTop, viewportHeight],
  ([currentItems, currentRowHeight, currentScrollTop]) => {
    if (!useVirtualScroll.value || currentItems.length === 0 || currentRowHeight <= 0) {
      startIndex.value = 0
      endIndex.value = Math.max(0, currentItems.length - 1)
      lastScrollTop.value = currentScrollTop
      rebuildVisibleItems()
      return
    }

    updateVisibleRange(currentScrollTop)
    rebuildVisibleItems()
  },
  {
    immediate: true,
    // 让共享窗口在 scrollTop 改写的同一个同步批次内完成切片更新，
    // 这样左侧任务行和右侧 Bar 行会一起切到新窗口，减少“对齐但内容晚一帧”的感觉。
    flush: 'sync',
  }
)

export const resetSharedVerticalVirtualScrollForTests = () => {
  stopBindings()
  sharedItems.value = []
  sharedRowHeight.value = 0
  startIndex.value = 0
  endIndex.value = 0
  lastScrollTop.value = 0
  visibleItems.value = []
}

export const useSharedVerticalVirtualScroll = <T>(items: Ref<T[]>, rowHeight: Ref<number>) => {
  bindSharedSources(items, rowHeight)

  return {
    useVirtualScroll,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    visibleItems: computed(() => visibleItems.value as SharedVirtualItem<T>[]),
  }
}
