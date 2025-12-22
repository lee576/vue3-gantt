import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue';
import { PerformanceConfig } from './PerformanceConfig';

export interface HorizontalVirtualScrollOptions {
  /** 滚动容器引用 */
  containerRef: Ref<HTMLElement | null>;
  /** 每个单元格的宽度 */
  itemWidth: Ref<number> | ComputedRef<number>;
  /** 总单元格数量 */
  totalItems: Ref<number> | ComputedRef<number>;
  /** 缓冲区单元格数量 */
  buffer?: number;
  /** 外部滚动位置（用于同步滚动） */
  externalScrollLeft?: Ref<number>;
}

export interface HorizontalVirtualScrollResult {
  /** 可见项列表 */
  visibleRange: ComputedRef<{ start: number; end: number }>;
  /** 起始索引 */
  startIndex: Ref<number>;
  /** 结束索引 */
  endIndex: Ref<number>;
  /** 总宽度 */
  totalWidth: ComputedRef<number>;
  /** 左侧偏移量 */
  offsetX: Ref<number>;
  /** 当前滚动位置 */
  scrollLeft: Ref<number>;
  /** 滚动处理函数 */
  onScroll: (e?: Event) => void;
  /** 更新可见范围 */
  updateVisibleRange: () => void;
}

/**
 * 水平虚拟滚动 Hook
 * 只渲染可见区域内的元素，大幅提升大数据量下的渲染性能
 */
export function useHorizontalVirtualScroll(options: HorizontalVirtualScrollOptions): HorizontalVirtualScrollResult {
  const { 
    containerRef, 
    itemWidth, 
    totalItems, 
    buffer = PerformanceConfig.VIRTUAL_SCROLL_BUFFER * 2,
    externalScrollLeft 
  } = options;
  
  const scrollLeft = ref(0);
  const containerWidth = ref(0);
  const startIndex = ref(0);
  const endIndex = ref(0);
  const offsetX = ref(0);
  
  // 总宽度
  const totalWidth = computed(() => totalItems.value * itemWidth.value);
  
  // 可见范围
  const visibleRange = computed(() => ({
    start: startIndex.value,
    end: endIndex.value
  }));
  
  // 更新可见范围
  const updateVisibleRange = () => {
    const width = itemWidth.value;
    if (width <= 0) return;
    
    let scrollX = scrollLeft.value;
    let viewWidth = containerWidth.value;
    
    // 如果容器引用存在，使用实际值
    if (containerRef.value) {
      scrollX = containerRef.value.scrollLeft;
      viewWidth = containerRef.value.clientWidth;
      scrollLeft.value = scrollX;
      containerWidth.value = viewWidth;
    }
    
    // 如果有外部滚动位置，使用它
    if (externalScrollLeft?.value !== undefined) {
      scrollX = externalScrollLeft.value;
      scrollLeft.value = scrollX;
    }
    
    if (viewWidth <= 0) {
      viewWidth = window.innerWidth; // 默认使用窗口宽度
    }
    
    // 计算可见范围（带缓冲区）
    const start = Math.max(0, Math.floor(scrollX / width) - buffer);
    const visibleCount = Math.ceil(viewWidth / width);
    const end = Math.min(totalItems.value - 1, start + visibleCount + buffer * 2);
    
    startIndex.value = start;
    endIndex.value = end;
    offsetX.value = start * width;
  };
  
  // 滚动处理（使用 RAF 节流）
  let rafId: number | null = null;
  const onScroll = (e?: Event) => {
    if (e && e.target) {
      scrollLeft.value = (e.target as HTMLElement).scrollLeft;
    }
    
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateVisibleRange();
      rafId = null;
    });
  };
  
  // 监听外部滚动位置变化
  if (externalScrollLeft) {
    watch(externalScrollLeft, () => {
      updateVisibleRange();
    });
  }
  
  // 监听总数和宽度变化
  watch([totalItems, itemWidth], () => {
    updateVisibleRange();
  });
  
  // 初始化
  onMounted(() => {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth;
      updateVisibleRange();
    }
  });
  
  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });
  
  return {
    visibleRange,
    startIndex,
    endIndex,
    totalWidth,
    offsetX,
    scrollLeft,
    onScroll,
    updateVisibleRange
  };
}

/**
 * 判断是否应该启用水平虚拟滚动
 */
export function shouldEnableHorizontalVirtualScroll(cellCount: number): boolean {
  // 当单元格数量超过阈值时启用虚拟滚动
  return PerformanceConfig.ENABLE_VIRTUAL_SCROLL && cellCount >= 100;
}
