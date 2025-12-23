<template>
  <div class="headerContainer" ref="headerContainerRef">
    <!-- 使用虚拟滚动时的渲染 -->
    <template v-if="useVirtual">
      <div v-if="monthHeaders && monthHeaders.length > 0" class="header" :style="{ width: totalWidth + 'px', minWidth: '100%' }">
        <div class="virtual-spacer" :style="{ width: monthOffsetX + 'px', flexShrink: 0 }"></div>
        <template v-for='item in visibleMonthHeaders' :key="item.key">
          <div class="headerCaption" style="border-bottom:0px" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
      <div v-if="weekHeaders && weekHeaders.length > 0" class="header" :style="{ width: totalWidth + 'px', minWidth: '100%' }">
        <div class="virtual-spacer" :style="{ width: weekOffsetX + 'px', flexShrink: 0 }"></div>
        <template v-for='item in visibleWeekHeaders' :key="item.key">
          <div class="headerCaption" style="border-top:1px" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
      <div v-if="dayHeaders && dayHeaders.length > 0" class="header" :style="{ width: totalWidth + 'px', minWidth: '100%' }">
        <div class="virtual-spacer" :style="{ width: dayOffsetX + 'px', flexShrink: 0 }"></div>
        <template v-for='item in visibleDayHeaders' :key="item.key">
          <div class="headerCaption" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
            <svg v-if="isToday(item.fulldate)" class="today" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
              <circle cx="12" cy="15" r="2" fill="currentColor"/>
              <path d="M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
      </div>
      <div v-if="hourHeaders && hourHeaders.length > 0" class="header" :style="{ width: totalWidth + 'px', minWidth: '100%' }">
        <div class="virtual-spacer" :style="{ width: hourOffsetX + 'px', flexShrink: 0 }"></div>
        <template v-for='item in visibleHourHeaders' :key="item.key">
          <div class="headerCaption" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
    </template>
    
    <!-- 不使用虚拟滚动时的原始渲染 -->
    <template v-else>
      <div v-if="monthHeaders && monthHeaders.length > 0" class="header" :style="{ minWidth: '100%' }">
        <template v-for='item in monthHeaders' :key="item.title">
          <div class="headerCaption" style="border-bottom:0px" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
      <div v-if="weekHeaders && weekHeaders.length > 0" class="header" :style="{ minWidth: '100%' }">
        <template v-for='item in weekHeaders' :key="item.title">
          <div class="headerCaption" style="border-top:1px" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
      <div v-if="dayHeaders && dayHeaders.length > 0" class="header" :style="{ minWidth: '100%' }">
        <template v-for='item in dayHeaders' :key="item.title">
          <div class="headerCaption" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
            <svg v-if="isToday(item.fulldate)" class="today" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
              <circle cx="12" cy="15" r="2" fill="currentColor"/>
              <path d="M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
      </div>
      <div v-if="hourHeaders && hourHeaders.length > 0" class="header" :style="{ minWidth: '100%' }">
        <template v-for='item in hourHeaders' :key="item.title">
          <div class="headerCaption" :style="{ width: item.width + 'px' }">
            <span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from '../i18n';
import { store } from '../state/Store';

// 虚拟滚动阈值：超过此数量启用虚拟滚动
const VIRTUAL_SCROLL_THRESHOLD = 100;
// 缓冲区大小
const BUFFER_SIZE = 10;

interface HeaderItem {
  title: string;
  width: number;
  fulldate?: string;
}

// VisibleHeaderItem 类型在 getVisibleHeaders 返回值中使用

export default defineComponent({
  props: {
    weekHeaders: {
      type: Array as () => HeaderItem[],
      default: () => []
    },
    dayHeaders: {
      type: Array as () => HeaderItem[],
      default: () => []
    },
    monthHeaders: {
      type: Array as () => HeaderItem[],
      default: () => []
    },
    hourHeaders: {
      type: Array as () => HeaderItem[],
      default: () => []
    }
  },
  setup(props) {
    const { weekHeaders, dayHeaders, monthHeaders, hourHeaders } = toRefs(props);
    const { locale } = useI18n();
    
    const headerContainerRef = ref<HTMLElement | null>(null);
    const scrollLeft = ref(0);
    
    // 计算总单元格数（使用最细粒度的表头）
    const totalCellCount = computed(() => {
      if (hourHeaders.value.length > 0) return hourHeaders.value.length;
      if (dayHeaders.value.length > 0) return dayHeaders.value.length;
      if (weekHeaders.value.length > 0) return weekHeaders.value.length;
      if (monthHeaders.value.length > 0) return monthHeaders.value.length;
      return 0;
    });
    
    // 是否启用虚拟滚动
    const useVirtual = computed(() => totalCellCount.value >= VIRTUAL_SCROLL_THRESHOLD);
    
    // 计算总宽度
    const totalWidth = computed(() => {
      // 使用最细粒度的表头计算总宽度
      if (hourHeaders.value.length > 0) {
        return hourHeaders.value.reduce((sum, h) => sum + h.width, 0);
      }
      if (dayHeaders.value.length > 0) {
        return dayHeaders.value.reduce((sum, h) => sum + h.width, 0);
      }
      if (weekHeaders.value.length > 0) {
        return weekHeaders.value.reduce((sum, h) => sum + h.width, 0);
      }
      if (monthHeaders.value.length > 0) {
        return monthHeaders.value.reduce((sum, h) => sum + h.width, 0);
      }
      return 0;
    });
    
    // 计算可见范围的通用函数
    const getVisibleHeaders = <T extends HeaderItem>(
      headers: T[],
      scrollX: number,
      viewWidth: number
    ): { items: (T & { key: string; originalIndex: number })[], offsetX: number } => {
      if (headers.length === 0) {
        return { items: [], offsetX: 0 };
      }
      
      // 构建累积宽度数组用于二分查找
      const cumulativeWidths: number[] = [0];
      for (let i = 0; i < headers.length; i++) {
        cumulativeWidths.push(cumulativeWidths[i] + headers[i].width);
      }
      
      // 二分查找起始索引
      let startIdx = 0;
      let left = 0, right = headers.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (cumulativeWidths[mid] <= scrollX) {
          startIdx = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      
      // 应用缓冲区
      startIdx = Math.max(0, startIdx - BUFFER_SIZE);
      
      // 查找结束索引
      const endScrollX = scrollX + viewWidth;
      let endIdx = startIdx;
      while (endIdx < headers.length && cumulativeWidths[endIdx] < endScrollX) {
        endIdx++;
      }
      endIdx = Math.min(headers.length - 1, endIdx + BUFFER_SIZE);
      
      // 提取可见项
      const items = headers.slice(startIdx, endIdx + 1).map((item, i) => ({
        ...item,
        key: `${startIdx + i}-${item.title}`,
        originalIndex: startIdx + i
      }));
      
      return {
        items,
        offsetX: cumulativeWidths[startIdx]
      };
    };
    
    // 可见的月份表头
    const visibleMonthResult = computed(() => {
      if (!useVirtual.value) return { items: [], offsetX: 0 };
      return getVisibleHeaders(monthHeaders.value, scrollLeft.value, window.innerWidth);
    });
    const visibleMonthHeaders = computed(() => visibleMonthResult.value.items);
    const monthOffsetX = computed(() => visibleMonthResult.value.offsetX);
    
    // 可见的周表头
    const visibleWeekResult = computed(() => {
      if (!useVirtual.value) return { items: [], offsetX: 0 };
      return getVisibleHeaders(weekHeaders.value, scrollLeft.value, window.innerWidth);
    });
    const visibleWeekHeaders = computed(() => visibleWeekResult.value.items);
    const weekOffsetX = computed(() => visibleWeekResult.value.offsetX);
    
    // 可见的日表头
    const visibleDayResult = computed(() => {
      if (!useVirtual.value) return { items: [], offsetX: 0 };
      return getVisibleHeaders(dayHeaders.value, scrollLeft.value, window.innerWidth);
    });
    const visibleDayHeaders = computed(() => visibleDayResult.value.items);
    const dayOffsetX = computed(() => visibleDayResult.value.offsetX);
    
    // 可见的小时表头
    const visibleHourResult = computed(() => {
      if (!useVirtual.value) return { items: [], offsetX: 0 };
      return getVisibleHeaders(hourHeaders.value, scrollLeft.value, window.innerWidth);
    });
    const visibleHourHeaders = computed(() => visibleHourResult.value.items);
    const hourOffsetX = computed(() => visibleHourResult.value.offsetX);

    const isToday = (title: string | undefined) => {
      if (!title) return false;
      const localeMap: Record<string, string> = {
        'zh-CN': 'zh-cn',
        'en-US': 'en',
        'ja-JP': 'ja',
        'ko-KR': 'ko',
        'fr-FR': 'fr',
        'de-DE': 'de',
        'es-ES': 'es',
        'ru-RU': 'ru'
      };
      const dayjsLocale = localeMap[locale.value] || 'en';
      return title === dayjs().locale(dayjsLocale).format('YYYY-MM-DD');
    };
    
    // 监听滚动事件
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        // 获取父级滚动容器的滚动位置
        const scrollContainer = headerContainerRef.value?.closest('.table');
        if (scrollContainer) {
          scrollLeft.value = scrollContainer.scrollLeft;
        }
        rafId = null;
      });
    };
    
    // 监听 store 中的滚动状态变化
    watch(() => store.scrollFlag, () => {
      handleScroll();
    });
    
    onMounted(() => {
      if (headerContainerRef.value) {
        // 监听父级滚动容器
        const scrollContainer = headerContainerRef.value.closest('.table');
        if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
          scrollLeft.value = scrollContainer.scrollLeft;
        }
      }
    });
    
    onUnmounted(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (headerContainerRef.value) {
        const scrollContainer = headerContainerRef.value.closest('.table');
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', handleScroll);
        }
      }
    });

    return {
      headerContainerRef,
      weekHeaders,
      dayHeaders,
      monthHeaders,
      hourHeaders,
      isToday,
      useVirtual,
      totalWidth,
      visibleMonthHeaders,
      visibleWeekHeaders,
      visibleDayHeaders,
      visibleHourHeaders,
      monthOffsetX,
      weekOffsetX,
      dayOffsetX,
      hourOffsetX
    };
  }
});
</script>

<style lang="scss" scoped>
.headerContainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
}

.header {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.virtual-spacer {
  height: 100%;
  pointer-events: none;
}

.headerCaption {
  text-align: center;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  color: var(--text-primary, #333333);
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  position: relative;
  letter-spacing: 0.5px;
  transition: all var(--transition-fast, 0.15s ease);
  box-sizing: border-box;
  border-right: 1px solid var(--border, #d0d0d0);
  flex-shrink: 0;

  &:hover {
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    color: var(--primary, #0078d4);
  }
}

.today {
  position: absolute;
  z-index: 10;
  top: 2px;
  left: 2px;
  height: 20px;
  width: 25px;
  fill: var(--text-secondary, #707070);
  transition: fill var(--transition-fast, 0.15s ease);
}

.today:hover {
  fill: var(--primary, #3A8EE6);
}
</style>
