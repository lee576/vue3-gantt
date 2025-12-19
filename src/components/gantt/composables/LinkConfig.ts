import { reactive } from 'vue';
import { LinkType, LinkPathType, type LinkConfig, type TaskDependency } from '../types/Types';

// 重新导出类型，方便其他组件使用
export { LinkType, LinkPathType } from '../types/Types';

// 预定义的连线样式主题
export const LinkThemes = {
  // 默认主题
  default: {
    color: '#3498db',
    width: 2,
    dashArray: undefined,
    showArrow: true,
    arrowColor: undefined,
    arrowSize: 8,
    showLabels: false,
    labelColor: '#666',
    labelFontSize: 12,
    cornerRadius: 5,
    pathType: LinkPathType.BEZIER,
    bezierCurvature: 0.4,
    rightAngleOffset: 30,
    smoothCorners: true,
    enableDashAnimation: true,
    dashAnimationSpeed: 0.8,
    parentChildStyle: {
      color: '#95a5a6',
      width: 1,
      dashArray: '3,3'
    },
    // 各类型连线颜色
    linkTypeColors: {
      finishToStart: '#3498db',  // 蓝色 - FS
      startToStart: '#2ecc71',   // 绿色 - SS
      finishToFinish: '#e74c3c', // 红色 - FF
      startToFinish: '#f39c12'   // 橙色 - SF
    },
    // 各类型连线显示控制
    linkTypeVisibility: {
      finishToStart: true,
      startToStart: true,
      finishToFinish: true,
      startToFinish: true,
      parentChild: true
    }
  },
  
  // 商务主题
  business: {
    color: '#2c3e50',
    width: 2,
    dashArray: undefined,
    showArrow: true,
    arrowColor: '#e74c3c',
    arrowSize: 10,
    showLabels: true,
    labelColor: '#34495e',
    labelFontSize: 11,
    cornerRadius: 8,
    pathType: LinkPathType.RIGHT_ANGLE,
    bezierCurvature: 0.3,
    rightAngleOffset: 40,
    smoothCorners: true,
    enableDashAnimation: true,
    dashAnimationSpeed: 0.6,
    parentChildStyle: {
      color: '#7f8c8d',
      width: 2,
      dashArray: '5,2'
    },
    linkTypeColors: {
      finishToStart: '#2c3e50',
      startToStart: '#27ae60',
      finishToFinish: '#c0392b',
      startToFinish: '#d35400'
    },
    linkTypeVisibility: {
      finishToStart: true,
      startToStart: true,
      finishToFinish: true,
      startToFinish: true,
      parentChild: true
    }
  },
  
  // 现代主题
  modern: {
    color: '#00bcd4',
    width: 3,
    dashArray: undefined,
    showArrow: true,
    arrowColor: '#ff5722',
    arrowSize: 12,
    showLabels: false,
    labelColor: '#607d8b',
    labelFontSize: 12,
    cornerRadius: 10,
    pathType: LinkPathType.BEZIER,
    bezierCurvature: 0.6,
    rightAngleOffset: 50,
    smoothCorners: true,
    enableDashAnimation: true,
    dashAnimationSpeed: 1,
    parentChildStyle: {
      color: '#90a4ae',
      width: 2,
      dashArray: '8,4'
    },
    linkTypeColors: {
      finishToStart: '#00bcd4',
      startToStart: '#4caf50',
      finishToFinish: '#f44336',
      startToFinish: '#ff9800'
    },
    linkTypeVisibility: {
      finishToStart: true,
      startToStart: true,
      finishToFinish: true,
      startToFinish: true,
      parentChild: true
    }
  },
  
  // 简约主题
  minimal: {
    color: '#666',
    width: 1,
    dashArray: undefined,
    showArrow: false,
    arrowColor: undefined,
    arrowSize: 6,
    showLabels: false,
    labelColor: '#999',
    labelFontSize: 10,
    cornerRadius: 3,
    pathType: LinkPathType.STRAIGHT,
    bezierCurvature: 0.2,
    rightAngleOffset: 20,
    smoothCorners: false,
    enableDashAnimation: false,
    dashAnimationSpeed: 0.8,
    parentChildStyle: {
      color: '#ccc',
      width: 1,
      dashArray: '2,2'
    },
    linkTypeColors: {
      finishToStart: '#666',
      startToStart: '#888',
      finishToFinish: '#555',
      startToFinish: '#777'
    },
    linkTypeVisibility: {
      finishToStart: true,
      startToStart: true,
      finishToFinish: true,
      startToFinish: true,
      parentChild: true
    }
  },
  
  // 彩色主题
  colorful: {
    color: '#9c27b0',
    width: 2,
    dashArray: undefined,
    showArrow: true,
    arrowColor: '#ff9800',
    arrowSize: 9,
    showLabels: true,
    labelColor: '#673ab7',
    labelFontSize: 11,
    cornerRadius: 6,
    pathType: LinkPathType.RIGHT_ANGLE,
    bezierCurvature: 0.5,
    rightAngleOffset: 35,
    smoothCorners: true,
    enableDashAnimation: true,
    dashAnimationSpeed: 1,
    parentChildStyle: {
      color: '#4caf50',
      width: 2,
      dashArray: '4,3'
    },
    linkTypeColors: {
      finishToStart: '#9c27b0',
      startToStart: '#4caf50',
      finishToFinish: '#e91e63',
      startToFinish: '#ff9800'
    },
    linkTypeVisibility: {
      finishToStart: true,
      startToStart: true,
      finishToFinish: true,
      startToFinish: true,
      parentChild: true
    }
  }
} as const;

// 连线类型配置
export const LinkTypeConfig = {
  [LinkType.FINISH_TO_START]: {
    name: '完成-开始',
    description: '前置任务完成后，后续任务才能开始',
    color: '#3498db',
    priority: 1
  },
  [LinkType.START_TO_START]: {
    name: '开始-开始',
    description: '两个任务同时开始',
    color: '#2ecc71',
    priority: 2
  },
  [LinkType.FINISH_TO_FINISH]: {
    name: '完成-完成',
    description: '两个任务同时完成',
    color: '#e74c3c',
    priority: 3
  },
  [LinkType.START_TO_FINISH]: {
    name: '开始-完成',
    description: '前置任务开始后，后续任务才能完成',
    color: '#f39c12',
    priority: 4
  },
  [LinkType.PARENT_CHILD]: {
    name: '父子关系',
    description: '显示任务的层级关系',
    color: '#95a5a6',
    priority: 0
  }
} as const;

// 深拷贝工具函数
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 全局连线配置管理器
export class LinkConfigManager {
  private config: LinkConfig;
  private readonly STORAGE_KEY = 'gantt-link-config';
  
  constructor() {
    // 使用深拷贝确保嵌套对象正确初始化
    this.config = reactive<LinkConfig>(deepClone(LinkThemes.default));
    this.loadFromStorage();
  }
  
  // 深层更新嵌套对象，保持响应式
  private deepMergeConfig(source: Partial<LinkConfig>): void {
    // 确保嵌套对象存在
    if (!this.config.linkTypeVisibility) {
      this.config.linkTypeVisibility = deepClone(LinkThemes.default.linkTypeVisibility);
    }
    if (!this.config.linkTypeColors) {
      this.config.linkTypeColors = deepClone(LinkThemes.default.linkTypeColors);
    }
    if (!this.config.parentChildStyle) {
      this.config.parentChildStyle = deepClone(LinkThemes.default.parentChildStyle);
    }
    
    // 处理嵌套对象，不修改原始 source
    if (source.linkTypeVisibility && this.config.linkTypeVisibility) {
      const v = source.linkTypeVisibility;
      if (v.finishToStart !== undefined) this.config.linkTypeVisibility.finishToStart = v.finishToStart;
      if (v.startToStart !== undefined) this.config.linkTypeVisibility.startToStart = v.startToStart;
      if (v.finishToFinish !== undefined) this.config.linkTypeVisibility.finishToFinish = v.finishToFinish;
      if (v.startToFinish !== undefined) this.config.linkTypeVisibility.startToFinish = v.startToFinish;
      if (v.parentChild !== undefined) this.config.linkTypeVisibility.parentChild = v.parentChild;
    }
    if (source.linkTypeColors && this.config.linkTypeColors) {
      const c = source.linkTypeColors;
      if (c.finishToStart !== undefined) this.config.linkTypeColors.finishToStart = c.finishToStart;
      if (c.startToStart !== undefined) this.config.linkTypeColors.startToStart = c.startToStart;
      if (c.finishToFinish !== undefined) this.config.linkTypeColors.finishToFinish = c.finishToFinish;
      if (c.startToFinish !== undefined) this.config.linkTypeColors.startToFinish = c.startToFinish;
    }
    if (source.parentChildStyle && this.config.parentChildStyle) {
      const p = source.parentChildStyle;
      if (p.color !== undefined) this.config.parentChildStyle.color = p.color;
      if (p.width !== undefined) this.config.parentChildStyle.width = p.width;
      if (p.dashArray !== undefined) this.config.parentChildStyle.dashArray = p.dashArray;
    }
    
    // 更新其他顶层属性（排除嵌套对象）
    const { linkTypeVisibility, linkTypeColors, parentChildStyle, ...rest } = source;
    Object.assign(this.config, rest);
  }
  
  // 从 localStorage 加载配置
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.deepMergeConfig(parsedConfig);
      }
    } catch (error) {
      console.warn('加载连线配置失败，使用默认配置:', error);
    }
  }
  
  // 保存配置到 localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('保存连线配置失败:', error);
    }
  }
  
  // 获取当前配置
  getConfig(): LinkConfig {
    return this.config;
  }
  
  // 设置主题
  setTheme(themeName: keyof typeof LinkThemes): void {
    this.deepMergeConfig({ ...LinkThemes[themeName] });
    this.saveToStorage();
  }
  
  // 更新配置
  updateConfig(newConfig: Partial<LinkConfig>): void {
    this.deepMergeConfig(newConfig);
    this.saveToStorage();
  }
  
  // 重置为默认配置
  reset(): void {
    this.deepMergeConfig({ ...LinkThemes.default });
    this.saveToStorage();
  }
  
  // 获取特定类型连线的样式
  getLinkStyle(linkType: LinkType): Partial<LinkConfig> {
    const typeConfig = LinkTypeConfig[linkType];
    
    if (linkType === LinkType.PARENT_CHILD) {
      return {
        color: this.config.parentChildStyle.color,
        width: this.config.parentChildStyle.width,
        dashArray: this.config.parentChildStyle.dashArray
      };
    }
    
    return {
      color: typeConfig.color,
      width: this.config.width,
      dashArray: this.config.dashArray
    };
  }
  
  // 导出配置
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  // 导入配置
  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      this.updateConfig(importedConfig);
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
  
  // 清除存储的配置
  clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.reset();
    } catch (error) {
      console.warn('清除配置失败:', error);
    }
  }
}

// 创建全局实例
export const linkConfigManager = new LinkConfigManager();

// 连线配置组合式函数
export function useLinkConfig() {
  return {
    config: linkConfigManager.getConfig(),
    setTheme: linkConfigManager.setTheme.bind(linkConfigManager),
    updateConfig: linkConfigManager.updateConfig.bind(linkConfigManager),
    reset: linkConfigManager.reset.bind(linkConfigManager),
    getLinkStyle: linkConfigManager.getLinkStyle.bind(linkConfigManager),
    exportConfig: linkConfigManager.exportConfig.bind(linkConfigManager),
    importConfig: linkConfigManager.importConfig.bind(linkConfigManager),
    clearStorage: linkConfigManager.clearStorage.bind(linkConfigManager),
    themes: LinkThemes,
    linkTypes: LinkTypeConfig
  };
}

// 连线数据管理
export class LinkDataManager {
  private dependencies = reactive<TaskDependency[]>([]);
  private readonly STORAGE_KEY = 'gantt-link-dependencies';
  
  constructor() {
    this.loadFromStorage();
  }
  
  // 从 localStorage 加载依赖关系
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedDependencies = JSON.parse(stored);
        this.dependencies.splice(0, this.dependencies.length, ...parsedDependencies);
      }
    } catch (error) {
      console.warn('加载连线依赖关系失败:', error);
    }
  }
  
  // 保存依赖关系到 localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.dependencies));
    } catch (error) {
      console.warn('保存连线依赖关系失败:', error);
    }
  }
  
  // 添加依赖关系
  addDependency(dependency: Omit<TaskDependency, 'id'>): string {
    const id = `link-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.dependencies.push({ ...dependency, id });
    this.saveToStorage();
    return id;
  }
  
  // 删除依赖关系
  removeDependency(id: string): boolean {
    const index = this.dependencies.findIndex(dep => dep.id === id);
    if (index > -1) {
      this.dependencies.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }
  
  // 获取所有依赖关系
  getDependencies(): TaskDependency[] {
    return this.dependencies;
  }
  
  // 获取任务的依赖关系
  getTaskDependencies(taskId: string): TaskDependency[] {
    return this.dependencies.filter(dep => 
      dep.sourceTaskId === taskId || dep.targetTaskId === taskId
    );
  }
  
  // 清空所有依赖关系
  clear(): void {
    this.dependencies.splice(0);
    this.saveToStorage();
  }
  
  // 清除存储的依赖关系
  clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.clear();
    } catch (error) {
      console.warn('清除依赖关系失败:', error);
    }
  }
  
  // 检查是否会形成循环依赖
  wouldCreateCycle(sourceId: string, targetId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const dependencies = this.dependencies.filter(dep => dep.sourceTaskId === nodeId);
      for (const dep of dependencies) {
        if (hasCycle(dep.targetTaskId)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // 临时添加新的依赖关系进行检查
    this.dependencies.push({
      id: 'temp',
      sourceTaskId: sourceId,
      targetTaskId: targetId,
      type: LinkType.FINISH_TO_START
    });
    
    const result = hasCycle(sourceId);
    
    // 移除临时依赖关系
    this.dependencies.pop();
    
    return result;
  }
}

// 创建全局实例
export const linkDataManager = new LinkDataManager();

// 连线数据组合式函数
export function useLinkData() {
  return {
    dependencies: linkDataManager.getDependencies(),
    addDependency: linkDataManager.addDependency.bind(linkDataManager),
    removeDependency: linkDataManager.removeDependency.bind(linkDataManager),
    getTaskDependencies: linkDataManager.getTaskDependencies.bind(linkDataManager),
    clear: linkDataManager.clear.bind(linkDataManager),
    clearStorage: linkDataManager.clearStorage.bind(linkDataManager),
    wouldCreateCycle: linkDataManager.wouldCreateCycle.bind(linkDataManager)
  };
}