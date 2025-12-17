import type { App } from 'vue';
import Gantt from './components/gantt/Gantt.vue';

// 导出组件
export { default as Gantt } from './components/gantt/Gantt.vue';
export { default } from './components/gantt/Gantt.vue';

// 导出辅助组件
export { default as DatePicker } from './components/gantt/DatePicker.vue';
export { default as GanttThemeSelector } from './components/gantt/GanttThemeSelector.vue';
export { default as LanguageSelector } from './components/gantt/LanguageSelector.vue';
export { default as GanttConfigPanel } from './components/gantt/GanttConfigPanel.vue';
export { default as LinkConfigPanel } from './components/gantt/LinkConfigPanel.vue';

// 导出类型定义
export type {
  DataConfig,
  StyleConfig,
  EventConfig,
  TaskHeader,
  LinkConfig,
  TaskLink,
  TaskDependency,
  ProgressUpdateDetail,
  LinkTypeColors,
  LinkTypeVisibility
} from './components/gantt/Types';

// 导出枚举
export { LinkType, LinkPathType, TaskType } from './components/gantt/Types';

// 导出主题系统
export { ganttThemes, type GanttTheme } from './components/gantt/themes/GanttThemes.ts';

// 导出连线配置
export { LinkThemes, useLinkConfig, linkDataManager } from './components/gantt/LinkConfig';

// 导出国际化系统
export { useI18n, setLocale, type Locale } from './components/gantt/i18n';

// 导出 Store (可选,高级用户可能需要)
export { store, mutations } from './components/gantt/Store';

// 支持 Vue.use() 安装
export const install = (app: App) => {
  app.component('Gantt', Gantt);
  app.component('Vue3Gantt', Gantt);
};

// 版本信息
export const version = '1.0.0';
