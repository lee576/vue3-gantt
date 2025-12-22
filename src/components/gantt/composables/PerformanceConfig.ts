/**
 * 甘特图性能优化配置
 */

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

// SVG 缓存系统
class SVGCache {
  private cache = new Map<string, any>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const PerformanceConfig = {
  // 节流延迟时间（毫秒）
  THROTTLE_DELAY: 100,
  
  // 防抖延迟时间（毫秒）
  DEBOUNCE_DELAY: 300,
  
  // 虚拟滚动：上下缓冲区的行数
  VIRTUAL_SCROLL_BUFFER: 5,
  
  // 是否启用虚拟滚动
  ENABLE_VIRTUAL_SCROLL: true,
  
  // SVG缓存大小
  SVG_CACHE_SIZE: 100,
  
  // 是否启用requestAnimationFrame优化
  USE_RAF: true,
  
  // 批量更新延迟
  BATCH_UPDATE_DELAY: 16, // 约60fps
  
  // 启用虚拟滚动的任务数量阈值
  VIRTUAL_SCROLL_THRESHOLD: 20,
  
  // 是否使用CSS网格背景替代cell div
  USE_CSS_GRID_BACKGROUND: true,
};

// 全局 SVG 缓存实例
export const svgCache = new SVGCache(PerformanceConfig.SVG_CACHE_SIZE);

/**
 * 判断指定日期是否为周末
 * @param date 日期字符串或 Dayjs 对象
 * @returns 是否为周末（周六或周日）
 */
export function isWeekend(date: string | dayjs.Dayjs): boolean {
  const dayObj = typeof date === 'string' ? dayjs(date) : date;
  const weekday = dayObj.isoWeekday();
  return weekday === 6 || weekday === 7; // 周六=6，周日=7
}

/**
 * 计算周末列的索引（用于CSS背景）
 * @param startGanttDate 甘特图开始日期
 * @param timelineCellCount 时间线单元格总数
 * @param mode 时间模式
 * @param daySubMode 日模式的子模式
 * @returns 周末列的索引数组
 */
export function getWeekendIndices(
  startGanttDate: string,
  timelineCellCount: number,
  mode: string,
  daySubMode?: string
): number[] {
  if (mode !== '日') return [];
  
  const indices: number[] = [];
  const isHalfDay = daySubMode === 'half';
  const cellsPerDay = isHalfDay ? 2 : 1;
  
  for (let i = 0; i < timelineCellCount; i++) {
    const dayIndex = isHalfDay ? Math.floor(i / cellsPerDay) : i;
    const currentDate = dayjs(startGanttDate).add(dayIndex, 'days');
    if (isWeekend(currentDate)) {
      indices.push(i);
    }
  }
  return indices;
}

/**
 * 获取周末单元格的背景颜色
 * @param count 单元格索引
 * @param startGanttDate 甘特图开始日期
 * @param mode 时间模式
 * @param daySubMode 日模式的子模式
 * @param bgContent 普通背景色
 * @param bgSecondary 周末背景色
 * @returns 背景颜色
 */
export function getWeekendColor(
  count: number,
  startGanttDate: string,
  mode: string,
  daySubMode: string | undefined,
  bgContent: string,
  bgSecondary: string
): string {
  switch (mode) {
    case '季度':
    case '月':
    case '周':
    case '时':
      // 这些模式不显示周末背景色
      return bgContent;
    case '日': {
      // 使用 SVG 缓存优化日期计算
      const cacheKey = `weekend-${startGanttDate}-${count}-${daySubMode}`;
      if (svgCache.has(cacheKey)) {
        const isWeekendDay = svgCache.get(cacheKey);
        return isWeekendDay ? bgSecondary : bgContent;
      }
      
      const isHalfDay = daySubMode === 'half';
      const dayIndex = isHalfDay ? Math.floor(count / 2) : count;
      const currentDate = dayjs(startGanttDate).add(dayIndex, 'days');
      const isWeekendDay = isWeekend(currentDate);
      
      // 缓存计算结果
      svgCache.set(cacheKey, isWeekendDay);
      return isWeekendDay ? bgSecondary : bgContent;
    }
    default:
      return bgContent;
  }
}

/**
 * 获取主题颜色
 * @param element DOM 元素
 * @param themeVersion 主题版本（用于缓存失效）
 * @returns 主题颜色对象
 */
export function getThemeColors(element: HTMLElement | null, themeVersion?: number): {
  bgContent: string;
  bgSecondary: string;
  borderColor: string;
} {
  // 使用 SVG 缓存优化主题颜色获取
  const themeKey = `theme-colors-${themeVersion || 0}`;
  if (svgCache.has(themeKey)) {
    return svgCache.get(themeKey);
  }
  
  let bgContent = '#ffffff', bgSecondary = '#f8f8f8', borderColor = '#cecece';
  if (element) {
    let currentElement: HTMLElement | null = element;
    while (currentElement) {
      if (currentElement.hasAttribute('data-gantt-theme')) {
        bgContent = getComputedStyle(currentElement).getPropertyValue('--bg-content').trim() || '#ffffff';
        bgSecondary = getComputedStyle(currentElement).getPropertyValue('--bg-secondary').trim() || '#f8f8f8';
        borderColor = getComputedStyle(currentElement).getPropertyValue('--border').trim() || '#cecece';
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }
  
  const colors = { bgContent, bgSecondary, borderColor };
  svgCache.set(themeKey, colors);
  return colors;
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = PerformanceConfig.THROTTLE_DELAY
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = PerformanceConfig.DEBOUNCE_DELAY
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * requestAnimationFrame包装器
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let latestArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    latestArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (latestArgs) {
          func.apply(this, latestArgs);
        }
        rafId = null;
        latestArgs = null;
      });
    }
  };
}
