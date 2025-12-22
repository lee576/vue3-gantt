// 甘特图主题系统
export interface GanttTheme {
  id: string;
  nameKey: string;  // 主题名称的翻译键
  descKey: string;  // 主题描述的翻译键
  preview: string;
  cssVariables: Record<string, string>;
}

export const ganttThemes: GanttTheme[] = [
  {
    id: 'metro',
    nameKey: 'theme.metro',
    descKey: 'theme.metroDesc',
    preview: '#0078d4',
    cssVariables: {
      // Metro 金属主题变量
      '--primary': '#0078d4',
      '--primary-dark': '#106ebe',
      '--primary-light': '#1084d8',
      '--secondary': '#0d5aa7',
      
      '--bg-metal-light': 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      '--bg-metal-normal': 'linear-gradient(145deg, #f5f5f5, #e8e8e8)',
      '--bg-metal-dark': 'linear-gradient(145deg, #e6e6e6, #d0d0d0)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #e0e0e0, #f8f8f8)',
      
      '--bg-active': 'linear-gradient(145deg, #0078d4, #106ebe)',
      '--bg-active-hover': 'linear-gradient(145deg, #1084d8, #0d5aa7)',
      '--bg-active-pressed': 'linear-gradient(145deg, #0d5aa7, #1084d8)',
      
      '--border': '#d0d0d0',
      '--border-dark': '#b0b0b0',
      '--shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
      '--shadow-outset': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
      
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--text-muted': '#999999',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#f8f8f8',
      '--bg-secondary': '#e8e8e8',
      '--bg-content': '#ffffff',
      '--row-hover': '#FFF3A1',
      
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.25s ease',
      '--transition-slow': '0.35s ease',
      
      '--font-family': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      '--font-size-base': '12px',
      '--font-weight-normal': '500',
      '--font-weight-bold': '600'
    }
  },
  {
    id: 'dark',
    nameKey: 'theme.dark',
    descKey: 'theme.darkDesc',
    preview: '#00d4ff',
    cssVariables: {
      '--primary': '#00d4ff',
      '--primary-dark': '#00b8e6',
      '--primary-light': '#33ddff',
      '--secondary': '#0099cc',
      
      '--bg-metal-light': 'linear-gradient(145deg, #3a3a3a, #2d2d2d)',
      '--bg-metal-normal': 'linear-gradient(145deg, #2d2d2d, #1f1f1f)',
      '--bg-metal-dark': 'linear-gradient(145deg, #1f1f1f, #0d0d0d)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #0d0d0d, #2d2d2d)',
      
      '--bg-active': 'linear-gradient(145deg, #00d4ff, #0099cc)',
      '--bg-active-hover': 'linear-gradient(145deg, #33ddff, #00b8e6)',
      '--bg-active-pressed': 'linear-gradient(145deg, #00b8e6, #33ddff)',
      
      '--border': '#404040',
      '--border-dark': '#2d2d2d',
      '--shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
      '--shadow-outset': '0 2px 8px rgba(0, 0, 0, 0.3)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
      
      '--text-primary': '#ffffff',
      '--text-secondary': '#cccccc',
      '--text-muted': '#888888',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2d2d2d',
      '--bg-content': '#262626',
      '--row-hover': '#3a4a5a',
      
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.25s ease',
      '--transition-slow': '0.35s ease',
      
      '--font-family': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      '--font-size-base': '12px',
      '--font-weight-normal': '500',
      '--font-weight-bold': '600'
    }
  },
  {
    id: 'modern',
    nameKey: 'theme.light',
    descKey: 'theme.lightDesc',
    preview: '#6366f1',
    cssVariables: {
      '--primary': '#6366f1',
      '--primary-dark': '#4f46e5',
      '--primary-light': '#8b5cf6',
      '--secondary': '#3730a3',
      
      '--bg-metal-light': 'linear-gradient(145deg, #fafafa, #f0f0f0)',
      '--bg-metal-normal': 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
      '--bg-metal-dark': 'linear-gradient(145deg, #e0e0e0, #d0d0d0)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #d8d8d8, #f0f0f0)',
      
      '--bg-active': 'linear-gradient(145deg, #6366f1, #4f46e5)',
      '--bg-active-hover': 'linear-gradient(145deg, #8b5cf6, #6366f1)',
      '--bg-active-pressed': 'linear-gradient(145deg, #4f46e5, #8b5cf6)',
      
      '--border': '#e0e0e0',
      '--border-dark': '#c0c0c0',
      '--shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
      '--shadow-outset': '0 1px 3px rgba(0, 0, 0, 0.08)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
      
      '--text-primary': '#1f2937',
      '--text-secondary': '#6b7280',
      '--text-muted': '#9ca3af',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9fafb',
      '--bg-content': '#ffffff',
      '--row-hover': '#e0e7ff',
      
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.25s ease',
      '--transition-slow': '0.35s ease',
      
      '--font-family': "'Inter', 'Segoe UI', sans-serif",
      '--font-size-base': '12px',
      '--font-weight-normal': '400',
      '--font-weight-bold': '600'
    }
  },
  {
    id: 'classic',
    nameKey: 'theme.classic',
    descKey: 'theme.classicDesc',
    preview: '#2563eb',
    cssVariables: {
      '--primary': '#2563eb',
      '--primary-dark': '#1d4ed8',
      '--primary-light': '#3b82f6',
      '--secondary': '#1e40af',
      
      '--bg-metal-light': 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
      '--bg-metal-normal': 'linear-gradient(145deg, #e9ecef, #dee2e6)',
      '--bg-metal-dark': 'linear-gradient(145deg, #dee2e6, #ced4da)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #ced4da, #e9ecef)',
      
      '--bg-active': 'linear-gradient(145deg, #2563eb, #1d4ed8)',
      '--bg-active-hover': 'linear-gradient(145deg, #3b82f6, #2563eb)',
      '--bg-active-pressed': 'linear-gradient(145deg, #1d4ed8, #3b82f6)',
      
      '--border': '#ced4da',
      '--border-dark': '#adb5bd',
      '--shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
      '--shadow-outset': '0 2px 4px rgba(0, 0, 0, 0.12)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.25)',
      
      '--text-primary': '#212529',
      '--text-secondary': '#495057',
      '--text-muted': '#6c757d',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8f9fa',
      '--bg-content': '#ffffff',
      '--row-hover': '#dbeafe',
      
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.25s ease',
      '--transition-slow': '0.35s ease',
      
      '--font-family': "'Times New Roman', serif",
      '--font-size-base': '12px',
      '--font-weight-normal': '400',
      '--font-weight-bold': '700'
    }
  },
  {
    id: 'colorful',
    nameKey: 'theme.colorful',
    descKey: 'theme.colorfulDesc',
    preview: '#f59e0b',
    cssVariables: {
      '--primary': '#f59e0b',
      '--primary-dark': '#d97706',
      '--primary-light': '#fbbf24',
      '--secondary': '#b45309',
      
      '--bg-metal-light': 'linear-gradient(145deg, #fef3c7, #fed7aa)',
      '--bg-metal-normal': 'linear-gradient(145deg, #fed7aa, #fdba74)',
      '--bg-metal-dark': 'linear-gradient(145deg, #fdba74, #fb923c)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #fb923c, #fed7aa)',
      
      '--bg-active': 'linear-gradient(145deg, #f59e0b, #d97706)',
      '--bg-active-hover': 'linear-gradient(145deg, #fbbf24, #f59e0b)',
      '--bg-active-pressed': 'linear-gradient(145deg, #d97706, #fbbf24)',
      
      '--border': '#fdba74',
      '--border-dark': '#fb923c',
      '--shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
      '--shadow-outset': '0 2px 6px rgba(245, 158, 11, 0.2)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
      
      '--text-primary': '#92400e',
      '--text-secondary': '#b45309',
      '--text-muted': '#d97706',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#fffbeb',
      '--bg-secondary': '#fef3c7',
      '--bg-content': '#ffffff',
      '--row-hover': '#fef3c7',
      
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.25s ease',
      '--transition-slow': '0.35s ease',
      
      '--font-family': "'Comic Sans MS', cursive",
      '--font-size-base': '12px',
      '--font-weight-normal': '400',
      '--font-weight-bold': '600'
    }
  },
  {
    id: 'apple',
    nameKey: 'theme.apple',
    descKey: 'theme.appleDesc',
    preview: '#007aff',
    cssVariables: {
      // Apple/macOS 风格主题变量
      '--primary': '#007aff',
      '--primary-dark': '#0051d5',
      '--primary-light': '#4da3ff',
      '--secondary': '#5856d6',
      
      '--bg-metal-light': 'linear-gradient(145deg, #fafafa, #f2f2f7)',
      '--bg-metal-normal': 'linear-gradient(145deg, #f2f2f7, #e5e5ea)',
      '--bg-metal-dark': 'linear-gradient(145deg, #e5e5ea, #d1d1d6)',
      '--bg-metal-pressed': 'linear-gradient(145deg, #d1d1d6, #f2f2f7)',
      
      '--bg-active': 'linear-gradient(145deg, #007aff, #0051d5)',
      '--bg-active-hover': 'linear-gradient(145deg, #4da3ff, #007aff)',
      '--bg-active-pressed': 'linear-gradient(145deg, #0051d5, #4da3ff)',
      
      '--border': '#d1d1d6',
      '--border-dark': '#c7c7cc',
      '--shadow-inset': 'inset 0 0.5px 0 rgba(255, 255, 255, 0.9), inset 0 -0.5px 0 rgba(0, 0, 0, 0.08)',
      '--shadow-outset': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
      '--shadow-active': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
      
      '--text-primary': '#000000',
      '--text-secondary': '#3c3c43',
      '--text-muted': '#8e8e93',
      '--text-white': '#ffffff',
      
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f2f2f7',
      '--bg-content': '#ffffff',
      '--row-hover': '#e8f4fd',
      
      '--transition-fast': '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-normal': '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-slow': '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      
      '--font-family': "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      '--font-size-base': '13px',
      '--font-weight-normal': '400',
      '--font-weight-bold': '600'
    }
  },
  {
    id: 'liquidGlass',
    nameKey: 'theme.liquidGlass',
    descKey: 'theme.liquidGlassDesc',
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(200,220,255,0.6) 50%, rgba(255,255,255,0.9) 100%)',
    cssVariables: {
      // iOS 26 Liquid Glass 液态玻璃主题变量
      '--primary': '#007aff',
      '--primary-dark': '#0051d5',
      '--primary-light': '#4da3ff',
      '--secondary': '#5856d6',
      
      // 液态玻璃背景 - 更高透明度和模糊
      '--bg-metal-light': 'rgba(255, 255, 255, 0.85)',
      '--bg-metal-normal': 'rgba(255, 255, 255, 0.75)',
      '--bg-metal-dark': 'rgba(245, 247, 250, 0.8)',
      '--bg-metal-pressed': 'rgba(240, 242, 245, 0.85)',
      
      '--bg-active': 'linear-gradient(135deg, rgba(0, 122, 255, 0.95) 0%, rgba(0, 100, 220, 0.95) 100%)',
      '--bg-active-hover': 'linear-gradient(135deg, rgba(0, 140, 255, 0.95) 0%, rgba(0, 110, 230, 0.95) 100%)',
      '--bg-active-pressed': 'linear-gradient(135deg, rgba(0, 100, 220, 0.95) 0%, rgba(0, 80, 200, 0.95) 100%)',
      
      // 玻璃效果边框 - 更柔和
      '--border': 'rgba(0, 0, 0, 0.06)',
      '--border-dark': 'rgba(0, 0, 0, 0.1)',
      
      // 液态玻璃阴影 - 更深的层次感
      '--shadow-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(255, 255, 255, 0.2)',
      '--shadow-outset': '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      '--shadow-active': '0 8px 24px rgba(0, 122, 255, 0.25), 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      
      '--text-primary': '#1d1d1f',
      '--text-secondary': '#3c3c43',
      '--text-muted': '#8e8e93',
      '--text-white': '#ffffff',
      
      // 背景使用半透明玻璃效果
      '--bg-primary': 'rgba(255, 255, 255, 0.9)',
      '--bg-secondary': 'rgba(242, 242, 247, 0.85)',
      '--bg-content': 'rgba(255, 255, 255, 0.8)',
      '--row-hover': 'rgba(0, 122, 255, 0.06)',
      
      // iOS 风格过渡 - 更流畅
      '--transition-fast': '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-normal': '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-slow': '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      
      '--font-family': "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', sans-serif",
      '--font-size-base': '13px',
      '--font-weight-normal': '400',
      '--font-weight-bold': '600',
      
      // Liquid Glass 特有的CSS变量 - iOS 26 风格
      '--glass-blur': '40px',
      '--glass-saturation': '200%',
      '--glass-brightness': '108%',
      '--glass-opacity': '0.72',
      '--glass-edge-highlight': 'rgba(255, 255, 255, 0.9)',
      '--glass-edge-shadow': 'rgba(0, 0, 0, 0.05)',
      '--glass-reflection': 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)'
    }
  }
];

export class GanttThemeManager {
  private static instance: GanttThemeManager;
  private currentTheme: string = 'metro';
  private storageKey = 'gantt-theme';
  private ganttContainer: HTMLElement | null = null;

  private constructor() {}

  static getInstance(): GanttThemeManager {
    if (!GanttThemeManager.instance) {
      GanttThemeManager.instance = new GanttThemeManager();
    }
    return GanttThemeManager.instance;
  }

  // 设置甘特图容器
  setGanttContainer(container: HTMLElement): void {
    this.ganttContainer = container;
    this.loadTheme();
  }

  // 获取当前主题
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  // 设置主题
  setTheme(themeId: string): void {
    const theme = ganttThemes.find(t => t.id === themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not found`);
      return;
    }

    this.currentTheme = themeId;
    this.applyTheme(theme);
    this.saveTheme();
  }

  // 应用主题到甘特图容器
  private applyTheme(theme: GanttTheme): void {
    if (!this.ganttContainer) {
      console.warn('No gantt container available for theme application');
      return;
    }

    // 设置data-theme属性
    this.ganttContainer.setAttribute('data-gantt-theme', theme.id);

    // 应用CSS变量到甘特图容器
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      this.ganttContainer!.style.setProperty(property, value);
    });
  }

  // 从本地存储加载主题
  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && ganttThemes.find(t => t.id === savedTheme)) {
        this.currentTheme = savedTheme;
      }
      
      const theme = ganttThemes.find(t => t.id === this.currentTheme);
      if (theme) {
        this.applyTheme(theme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }

  // 保存主题到本地存储
  private saveTheme(): void {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  // 获取所有主题
  getThemes(): GanttTheme[] {
    return ganttThemes;
  }

  // 获取主题信息
  getThemeInfo(themeId: string): GanttTheme | undefined {
    return ganttThemes.find(t => t.id === themeId);
  }

  // 预览主题（临时应用，不保存）
  previewTheme(themeId: string): void {
    const theme = ganttThemes.find(t => t.id === themeId);
    if (theme) {
      this.applyTheme(theme);
    }
  }

  // 取消预览，恢复当前主题
  cancelPreview(): void {
    const theme = ganttThemes.find(t => t.id === this.currentTheme);
    if (theme) {
      this.applyTheme(theme);
    }
  }

  // 导出主题配置
  exportThemeConfig(): string {
    return JSON.stringify({
      currentTheme: this.currentTheme,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  // 导入主题配置
  importThemeConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      if (config.currentTheme && ganttThemes.find(t => t.id === config.currentTheme)) {
        this.setTheme(config.currentTheme);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import theme config:', error);
      return false;
    }
  }
}

// 导出单例实例
export const ganttThemeManager = GanttThemeManager.getInstance();