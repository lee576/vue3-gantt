/**
 * 甘特图性能优化配置
 */

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
