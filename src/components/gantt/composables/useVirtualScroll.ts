import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue';
import { PerformanceConfig } from './PerformanceConfig';

export interface VirtualScrollOptions {
  containerRef: Ref<HTMLElement | null>;
  itemHeight: number;
  totalItems: Ref<number>;
  buffer?: number;
}

export interface VirtualScrollResult {
  visibleItems: Ref<{ index: number; offset: number }[]>;
  startIndex: Ref<number>;
  endIndex: Ref<number>;
  totalHeight: Ref<number>;
  offsetY: Ref<number>;
  onScroll: () => void;
}

/**
 * 虚拟滚动 Hook
 * 只渲染可见区域内的元素，大幅提升大数据量下的渲染性能
 */
export function useVirtualScroll(options: VirtualScrollOptions): VirtualScrollResult {
  const { containerRef, itemHeight, totalItems, buffer = PerformanceConfig.VIRTUAL_SCROLL_BUFFER } = options;
  
  const scrollTop = ref(0);
  const containerHeight = ref(0);
  const startIndex = ref(0);
  const endIndex = ref(0);
  const offsetY = ref(0);
  
  // 总高度
  const totalHeight = computed(() => totalItems.value * itemHeight);
  
  // 计算可见项
  const visibleItems = computed(() => {
    const items: { index: number; offset: number }[] = [];
    for (let i = startIndex.value; i <= endIndex.value && i < totalItems.value; i++) {
      items.push({
        index: i,
        offset: i * itemHeight
      });
    }
    return items;
  });
  
  // 更新可见范围
  const updateVisibleRange = () => {
    if (!containerRef.value) return;
    
    const scrollY = containerRef.value.scrollTop;
    const viewHeight = containerRef.value.clientHeight;
    
    scrollTop.value = scrollY;
    containerHeight.value = viewHeight;
    
    // 计算可见范围（带缓冲区）
    const start = Math.max(0, Math.floor(scrollY / itemHeight) - buffer);
    const visibleCount = Math.ceil(viewHeight / itemHeight);
    const end = Math.min(totalItems.value - 1, start + visibleCount + buffer * 2);
    
    startIndex.value = start;
    endIndex.value = end;
    offsetY.value = start * itemHeight;
  };
  
  // 滚动处理（使用 RAF 节流）
  let rafId: number | null = null;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateVisibleRange();
      rafId = null;
    });
  };
  
  // 监听总数变化
  watch(totalItems, () => {
    updateVisibleRange();
  });
  
  // 初始化
  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight;
      updateVisibleRange();
    }
  });
  
  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    onScroll
  };
}

/**
 * 判断是否应该启用虚拟滚动
 */
export function shouldEnableVirtualScroll(taskCount: number): boolean {
  return PerformanceConfig.ENABLE_VIRTUAL_SCROLL && 
         taskCount >= PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD;
}
