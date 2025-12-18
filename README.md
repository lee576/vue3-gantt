# Vue3 Gantt 甘特图组件

**Languages / 语言选择:** [English](#english-documentation) | [简体中文](#chinese-documentation) | [View Separate Files](.) 

> 💡 **提示**: GitHub 上也可查看独立语言版本文件：[README.md](README.md) (默认中文) | [README.en-US.md](README.en-US.md) (English)

---

<div id="chinese-documentation"></div>

<details open>
<summary><h2>🇨🇳 简体中文文档</h2></summary>

一个功能丰富、高度可定制的 Vue 3 甘特图组件，支持任务管理、依赖关系、多种视图模式和主题切换。

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

## 界面预览

<img width="1913" height="923" alt="image" src="https://github.com/user-attachments/assets/34562bf8-0709-44aa-a05d-6e970ea8b57f" />
<img width="1915" height="916" alt="image" src="https://github.com/user-attachments/assets/d6a60ba1-9f5b-479a-b402-68014ec7c935" />

```

**主要特点：**
- 🎯 左侧任务列表 + 右侧甘特图时间轴
- 📊 可视化进度条显示任务完成度
- 🔗 任务间依赖关系连线
- 🎨 多主题支持（浅色/深色/彩色等）
- 🖱️ 拖拽调整任务时间和进度
- 🌍 多语言支持（中文/English/日本語/한국어/Français/Deutsch/Español/Русский）

## 特性

- **多视图模式** - 支持月、日、周、时四种时间粒度视图
- **任务依赖关系** - 支持 FS、SS、FF、SF 四种依赖类型
- **里程碑功能** - 菱形图标标记项目关键节点，支持作为依赖源和目标
- **主题系统** - 内置 5 种主题，支持自定义主题
- **国际化支持** - 内置 8 种语言，可扩展更多语言
- **进度管理** - 可视化进度条，支持拖拽调整进度
- **交互操作** - 支持任务拖拽、调整大小、父子任务联动
- **响应式设计** - 可调整分割面板比例
- **高性能** - 虚拟滚动优化，支持大量任务数据

## 安装

### 方式一：通过 npm 安装（推荐）

```bash
# 使用 npm 安装
npm install @lee576/vue3-gantt

# 或使用 yarn
yarn add @lee576/vue3-gantt

# 或使用 pnpm
pnpm add @lee576/vue3-gantt
```

### 方式二：从源码构建

```bash
# 克隆项目
git clone https://github.com/lee576/vue3-gantt.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 依赖项

- @vueuse/core ^13.0.0
- dayjs ^1.11.13
- interactjs ^1.10.27
- svg.js ^2.7.1
- vue ^3.5.13
- zod ^3.24.2

## 基本使用

### 1. 引入组件和样式

```typescript
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
// 引入甘特图组件和类型
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig 
} from '@lee576/vue3-gantt';
// 引入样式文件
import '@lee576/vue3-gantt/style.css';
import { LinkType } from '@lee576/vue3-gantt';
```

### 2. 配置容器高度（重要！）

**组件必须有明确的容器高度才能正常显示**。以下是几种推荐的配置方式：

#### 方式 1：使用视口高度（最简单）

```vue
<template>
  <div class="gantt-container">
    <gantt 
      :styleConfig="styleConfig" 
      :dataConfig="dataConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<style scoped>
.gantt-container {
  height: 100vh; /* 直接使用视口高度 */
}
</style>
```

#### 方式 2：使用百分比高度（需要配置 html/body）

```vue
<template>
  <div id="app">
    <gantt 
      :styleConfig="styleConfig" 
      :dataConfig="dataConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<style>
/* 全局样式：确保 html 和 body 有高度 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%; /* 现在 100% 就能正常工作了 */
}
</style>
```

#### 方式 3：使用固定像素值

```vue
<style scoped>
.gantt-container {
  height: 800px; /* 固定高度 */
}
</style>
```

#### 方式 4：使用 Flex 布局

```vue
<template>
  <div class="page-wrapper">
    <div class="header">Header</div>
    <div class="gantt-container">
      <gantt ... />
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.gantt-container {
  flex: 1; /* 自动填充剩余空间 */
}
</style>
```

### 3. 配置组件

```vue
<template>
  <gantt 
    :styleConfig="styleConfig" 
    :dataConfig="dataConfig" 
    :eventConfig="eventConfig"
  />
</template>
```

```typescript
// 样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,  // 表头高度
  rowHeight: 60,       // 行高
  setBarColor: (row) => {
    // 自定义任务条颜色
    const colorMap = {
      '紧急': 'red',
      '重要': 'blue',
      '一般': 'gray'
    };
    return colorMap[row.level] ?? 'black';
  }
});

// 数据配置
const dataConfig = ref<DataConfig>({
  queryStartDate: '',
  queryEndDate: '',
  dataSource: [],
  dependencies: [],
  mapFields: {
    id: 'id',
    parentId: 'pid',
    task: 'taskNo',
    priority: 'level',
    startdate: 'start_date',
    enddate: 'end_date',
    takestime: 'spend_time',
    progress: 'job_progress'
  },
  taskHeaders: [
    { title: '序号', width: 80, property: 'no', show: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }
  ]
});

// 事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: (row) => console.log('添加根任务', row),
  addSubTask: (task) => console.log('添加子任务', task),
  removeTask: (task) => console.log('删除任务', task),
  editTask: (task) => console.log('编辑任务', task),
  queryTask: async (startDate, endDate, mode) => {
    // 查询任务数据
    dataConfig.value.dataSource = await fetchTasks(startDate, endDate);
  },
  barDate: (id, startDate, endDate) => {
    console.log('任务日期变更', id, startDate, endDate);
  },
  allowChangeTaskDate: (allow) => {
    console.log('允许修改日期', allow);
  },
  updateProgress: (detail) => {
    console.log('进度更新', detail);
  }
});

onMounted(() => {
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
  eventConfig.value.queryTask(startDate, endDate, '月');
});
```

## 配置详解

### StyleConfig 样式配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| headersHeight | number | 100 | 表头区域高度（像素） |
| rowHeight | number | 60 | 每行任务的高度（像素） |
| setBarColor | function | - | 自定义任务条颜色的回调函数 |

### DataConfig 数据配置

| 属性 | 类型 | 说明 |
|------|------|------|
| queryStartDate | string | 查询开始日期 (YYYY-MM-DD) |
| queryEndDate | string | 查询结束日期 (YYYY-MM-DD) |
| dataSource | array | 任务数据源 |
| dependencies | array | 任务依赖关系 |
| mapFields | object | 字段映射配置 |
| taskHeaders | array | 左侧任务表格列配置 |

#### mapFields 字段映射

```typescript
{
  id: 'id',           // 任务ID字段
  parentId: 'pid',    // 父任务ID字段（用于层级结构）
  task: 'taskNo',     // 任务名称字段
  priority: 'level',  // 优先级字段
  startdate: 'start_date',  // 开始日期字段
  enddate: 'end_date',      // 结束日期字段
  takestime: 'spend_time',  // 耗时字段
  progress: 'job_progress'  // 进度字段 (0-1)
}
```

#### taskHeaders 表头配置

```typescript
{
  title: string;      // 列标题
  width: number;      // 列宽度
  property: string;   // 对应 mapFields 中的属性名
  show: boolean;      // 是否显示
}
```


### EventConfig 事件配置

| 事件 | 参数 | 说明 |
|------|------|------|
| addRootTask | (row) | 添加根任务时触发 |
| addSubTask | (task) | 添加子任务时触发 |
| removeTask | (task) | 删除任务时触发 |
| editTask | (task) | 编辑任务时触发 |
| queryTask | (startDate, endDate, mode) | 查询任务时触发 |
| barDate | (id, startDate, endDate) | 任务日期变更时触发 |
| allowChangeTaskDate | (allow) | 任务日期是否允许修改 |
| updateProgress | (detail) | 进度更新时触发 |

#### updateProgress 事件详情

```typescript
interface ProgressUpdateDetail {
  taskId: any;        // 任务ID
  oldProgress: number; // 原进度值 (0-1)
  newProgress: number; // 新进度值 (0-1)
  task: object;       // 完整任务对象
}
```

## 任务数据格式

### 普通任务

```typescript
{
  id: '1',                              // 任务ID
  pid: '0',                             // 父任务ID，'0'表示根任务
  taskNo: '项目规划阶段',                // 任务名称
  level: '重要',                        // 优先级
  start_date: '2024-12-01 08:00:00',   // 开始时间
  end_date: '2024-12-06 18:00:00',     // 结束时间
  job_progress: '0.85',                // 进度 (0-1)
  spend_time: null                     // 耗时（自动计算）
}
```

### 里程碑任务

里程碑是项目中的关键节点，使用菱形图标显示，特点是**开始日期等于结束日期**：

```typescript
{
  id: 'milestone-1',                   // 里程碑ID
  pid: '0',                             // 父任务ID
  taskNo: '🎯 需求分析完成',         // 里程碑名称
  level: '紧急',                        // 优先级
  start_date: '2024-12-02 18:00:00',   // 开始时间
  end_date: '2024-12-02 18:00:00',     // 结束时间（与开始时间相同）
  job_progress: '1.0',                 // 里程碑通常为100%
  spend_time: null,
  type: 'milestone'                    // 可选：显式标记为里程碑
}
```

**里程碑识别规则**：
1. **自动识别**：当 `start_date === end_date` 时自动显示为菱形
2. **显式标记**：设置 `type: 'milestone'` 字段
3. **自定义函数**：通过 `styleConfig.setTaskType` 自定义判断逻辑

## 任务依赖关系

```
完成-开始 (FS)    开始-开始 (SS)    完成-完成 (FF)    开始-完成 (SF)
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│ 任务 A  │──┐   │ 任务 A  │──┐   │ 任务 A  │──┐   │ 任务 A  │◄─┐
└─────────┘  │   └─────────┘  │   └─────────┘  │   └─────────┘  │
             ▼                ▼                ▼                │
         ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
         │ 任务 B  │      │ 任务 B  │      │ 任务 B  │      │ 任务 B  │
         └─────────┘      └─────────┘      └─────────┘      └─────────┘
      A完成后B开始        A和B同时开始       A和B同时完成       B开始后A完成
```

### 依赖类型

| 类型 | 枚举值 | 说明 |
|------|--------|------|
| 完成-开始 (FS) | FINISH_TO_START | 前置任务完成后，后续任务才能开始 |
| 开始-开始 (SS) | START_TO_START | 两个任务同时开始 |
| 完成-完成 (FF) | FINISH_TO_FINISH | 两个任务同时完成 |
| 开始-完成 (SF) | START_TO_FINISH | 后续任务开始后，前置任务才能完成 |

### 配置示例

#### 普通任务依赖

```typescript
import { LinkType } from './components/gantt/Types';

dependencies: [
  // 任务1完成后，任务2才能开始
  { sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START },
  
  // 任务3和任务4同时开始
  { sourceTaskId: '3', targetTaskId: '4', type: LinkType.START_TO_START },
  
  // 任务5和任务6必须同时完成
  { sourceTaskId: '5', targetTaskId: '6', type: LinkType.FINISH_TO_FINISH },
]
```

#### 里程碑依赖

里程碑支持作为依赖关系的**源**或**目标**：

```typescript
dependencies: [
  // 任务完成 → 里程碑
  { sourceTaskId: 'task-5', targetTaskId: 'milestone-1', type: LinkType.FINISH_TO_START },
  
  // 里程碑 → 任务开始
  { sourceTaskId: 'milestone-1', targetTaskId: 'task-6', type: LinkType.FINISH_TO_START },
  
  // 多个任务 → 同一个里程碑
  { sourceTaskId: 'frontend-dev', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
  { sourceTaskId: 'backend-dev', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
]
```

## 视图模式

| 模式 | 时间单位 | 表头示例 | 适用场景 |
|------|----------|----------|----------|
| 🗓️ **月视图** | 天 | `01 02 03 04 05 ...` | 长期项目规划 |
| 📅 **日视图** | 天 | `周一 周二 周三 ...` | 短期任务管理 |
| 📊 **周视图** | 周 | `W50 W51 W52 ...` | 中期项目跟踪 |
| ⏰ **时视图** | 小时 | `08 09 10 11 12 ...` | 精细任务调度 |

组件支持四种时间粒度视图：

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| 月 | 按天显示，月份为单位 | 长期项目规划 |
| 日 | 按天显示，精确到天 | 短期任务管理 |
| 周 | 按周显示 | 中期项目跟踪 |
| 时 | 按小时显示 | 精细任务调度 |

## 主题系统

| 主题 | 主色调 | 风格特点 |
|------|--------|----------|
| 🔷 **Metro 金属** | `#0078d4` | Microsoft Metro 设计语言，专业金属质感 |
| 🌙 **深色模式** | `#00d4ff` | 护眼深色主题，适合长时间使用 |
| ✨ **现代简约** | `#6366f1` | 简洁现代设计，清爽舒适 |
| 💼 **经典商务** | `#2563eb` | 传统商务风格，稳重大方 |
| 🎨 **彩色活力** | `#f59e0b` | 活泼彩色主题，充满活力 |

### 内置主题

| 主题ID | 名称 | 说明 |
|--------|------|------|
| metro | Metro 金属 | Microsoft Metro 设计语言 |
| dark | 深色模式 | 护眼深色主题 |
| modern | 现代简约 | 简洁现代设计 |
| classic | 经典商务 | 传统商务风格 |
| colorful | 彩色活力 | 活泼彩色主题 |

### 切换主题

组件右上角提供主题选择器，点击即可切换主题。主题设置会自动保存到 localStorage。

### 自定义主题 CSS 变量

```css
:root {
  --primary: #0078d4;           /* 主色调 */
  --primary-dark: #106ebe;      /* 主色调深色 */
  --primary-light: #1084d8;     /* 主色调浅色 */
  --bg-content: #ffffff;        /* 内容背景色 */
  --bg-metal-light: linear-gradient(145deg, #ffffff, #f5f5f5);
  --bg-metal-normal: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  --border: #d0d0d0;            /* 边框颜色 */
  --text-primary: #333333;      /* 主文字颜色 */
  --text-secondary: #666666;    /* 次要文字颜色 */
  --row-hover: #FFF3A1;         /* 行悬停颜色 */
  --font-family: 'Segoe UI', sans-serif;
}
```

## 国际化支持

组件内置完整的国际化（i18n）系统，支持中英文双语切换，并可轻松扩展更多语言。

### 支持的语言

| 语言 | 代码 | 状态 |
|------|------|------|
| 🇨🇳 简体中文 | zh-CN | ✅ 完整支持 |
| 🇺🇸 English | en-US | ✅ 完整支持 |
| 🇯🇵 日本語 | ja-JP | ✅ 完整支持 |
| 🇰🇷 한국어 | ko-KR | ✅ 完整支持 |
| 🇫🇷 Français | fr-FR | ✅ 完整支持 |
| 🇩🇪 Deutsch | de-DE | ✅ 完整支持 |
| 🇪🇸 Español | es-ES | ✅ 完整支持 |
| 🇷🇺 Русский | ru-RU | ✅ 完整支持 |

### 使用方法

#### 1. 切换语言

在甘特图工具栏右上角，点击语言选择器即可切换界面语言：

```typescript
import { setLocale } from './components/gantt/i18n';

// 切换到英文
setLocale('en-US');

// 切换到中文
setLocale('zh-CN');
```

#### 2. 获取当前语言

```typescript
import { getLocale } from './components/gantt/i18n';

const currentLang = getLocale(); // 'zh-CN' 或 'en-US'
```

#### 3. 在组件中使用翻译

```vue
<script setup lang="ts">
import { useI18n } from './components/gantt/i18n';

const { t, locale } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <button>{{ t('common.confirm') }}</button>
    <p>{{ t('task.name') }}</p>
  </div>
</template>
```

### 国际化功能特性

- ✅ **即时切换** - 无需刷新页面即可切换语言
- ✅ **自动保存** - 语言选择自动保存到浏览器 localStorage
- ✅ **完整覆盖** - 所有界面文本均已翻译
- ✅ **动态表头** - 时间轴表头（月份、星期等）根据语言自动格式化
- ✅ **类型安全** - TypeScript 提供完整类型支持
- ✅ **易于扩展** - 可轻松添加新语言支持

### 已翻译的界面元素

#### 工具栏
- 日期选择器分隔符（"至" / "to"）
- 视图模式按钮（月/周/日/时）
- 连线图例标题和所有连线类型

#### 任务表头
- 序号 (No.)
- 任务名称 (Task Name)
- 优先级 (Priority)
- 开始时间 (Start Date)
- 结束时间 (End Date)
- 耗时 (Duration)
- 进度 (Progress)

#### 时间轴表头
- 月份名称（一月/January、二月/February...）
- 星期名称（星期一/Monday、星期二/Tuesday...）
- 日期格式（01日/01、02日/02...）
- 小时格式（0点/0:00、1点/1:00...）
- 周标题（第1周/Week 1）

#### 配置面板
- 甘特图配置标题
- 主题设置选项
- 连线配置所有选项
- 所有按钮和标签

### 添加新语言

如需添加新语言支持，请按以下步骤操作：

1. 在 `src/components/gantt/i18n/locales/` 目录下创建新语言文件（如 `ja-JP.ts`）
2. 复制 `zh-CN.ts` 或 `en-US.ts` 的结构
3. 翻译所有文本
4. 在 `src/components/gantt/i18n/index.ts` 中导入并注册新语言：

```typescript
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';
import frFR from './locales/fr-FR';
import deDE from './locales/de-DE';
import esES from './locales/es-ES';
import ruRU from './locales/ru-RU';

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,  // 新增日语
  'ko-KR': koKR,  // 新增韩语
  'fr-FR': frFR,  // 新增法语
  'de-DE': deDE,  // 新增德语
  'es-ES': esES,  // 新增西班牙语
  'ru-RU': ruRU   // 新增俄语
};
```

5. 更新 `getLocales()` 函数添加新语言选项

### 语言包结构

```typescript
export default {
  common: {        // 通用文本
    confirm: '确定',
    cancel: '取消',
    // ...
  },
  date: {          // 日期时间
    year: '年',
    month: '月',
    // ...
  },
  viewMode: {      // 视图模式
    month: '月',
    week: '周',
    // ...
  },
  task: {          // 任务相关
    name: '任务名称',
    priority: '优先级',
    // ...
  },
  // 更多类别...
}
```


## 交互功能

| 操作类型 | 说明 | 效果 |
|----------|------|------|
| 🖱️ **拖拽移动** | 拖拽任务条整体 | 修改任务开始和结束日期 |
| 📏 **调整大小** | 拖拽任务条左右边缘 | 调整任务时长 |
| 📊 **进度调整** | 拖拽任务条底部三角形滑块 | 调整任务完成进度 |

### 任务条操作

- **拖拽移动** - 拖拽任务条可以修改任务的开始和结束日期
- **调整大小** - 拖拽任务条左右边缘可以调整任务时长
- **进度调整** - 拖拽任务条底部的三角形滑块可以调整进度

### 父子任务联动

- 拖动父任务时，子任务会跟随移动
- 调整父任务大小时，会检查子任务约束
- 子任务不能早于父任务开始

### 快捷操作

- 点击左上角 **+** 按钮添加根任务
- 点击日历图标跳转到今天
- 右键任务行可以添加子任务、编辑、删除

## 连线配置

### 连线样式

```typescript
interface LinkConfig {
  color: string;              // 连线颜色
  width: number;              // 连线宽度
  dashArray?: string;         // 虚线样式
  showArrow: boolean;         // 是否显示箭头
  arrowSize: number;          // 箭头大小
  showLabels: boolean;        // 是否显示标签
  pathType: LinkPathType;     // 路径类型
  cornerRadius: number;       // 圆角半径
  smoothCorners: boolean;     // 平滑圆角
}
```

### 路径类型

```
直线连接          贝塞尔曲线        直角连线
┌─────┐          ┌─────┐          ┌─────┐
│任务A│ ────────▶│任务A│ ╭───────▶ │任务A│ ┐
└─────┘          └─────┘ ╰─┐       └─────┘ │
                          │                │
                      ┌─────┐          ┌─────┐
                      │任务B│          │任务B│
                      └─────┘          └─────┘
```

| 类型 | 枚举值 | 说明 |
|------|--------|------|
| 直线 | STRAIGHT | 直接连接 |
| 贝塞尔曲线 | BEZIER | 平滑曲线 |
| 直角连线 | RIGHT_ANGLE | 直角折线 |

## 性能优化

组件内置多项性能优化：

- **虚拟滚动** - 只渲染可见区域的任务
- **节流更新** - 数据变化时使用节流避免频繁渲染
- **缓存计算** - 使用 computed 缓存复杂计算结果
- **按需渲染** - 连线等元素按需计算和渲染

## 目录结构

```
src/
├── components/
│   └── gantt/
│       ├── Gantt.vue           # 主组件
│       ├── Bar.vue             # 任务条组件
│       ├── BarRecursionRow.vue # 递归行组件
│       ├── TaskLinks.vue       # 连线组件
│       ├── TimelineHeader.vue  # 时间轴表头
│       ├── TableContent.vue    # 表格内容
│       ├── RightTable.vue      # 右侧甘特图区域
│       ├── SplitPane.vue       # 分割面板
│       ├── DatePicker.vue      # 日期选择器
│       ├── GanttConfigPanel.vue    # 配置面板
│       ├── GanttThemeSelector.vue  # 主题选择器
│       ├── LanguageSelector.vue    # 语言选择器
│       ├── LinkConfigPanel.vue     # 连线配置面板
│       ├── Types.ts            # 类型定义
│       ├── Store.ts            # 状态管理
│       ├── ShareState.ts       # 共享状态
│       ├── LinkConfig.ts       # 连线配置
│       ├── Symbols.ts          # 注入符号
│       ├── ZodSchema.ts        # 数据验证
│       ├── i18n/               # 国际化系统
│       │   ├── index.ts        # i18n 核心
│       │   └── locales/        # 语言包
│       │       ├── zh-CN.ts    # 中文语言包
│       │       ├── en-US.ts    # 英文语言包
│       │       ├── ja-JP.ts    # 日语语言包
│       │       ├── ko-KR.ts    # 韩语语言包
│       │       ├── fr-FR.ts    # 法语语言包
│       │       ├── de-DE.ts    # 德语语言包
│       │       ├── es-ES.ts    # 西班牙语语言包
│       │       └── ru-RU.ts    # 俄语语言包
│       ├── task/               # 任务相关组件
│       │   ├── TaskTable.vue
│       │   ├── TaskHeader.vue
│       │   ├── TaskContent.vue
│       │   └── TaskRow.vue
│       └── themes/             # 主题配置
│           └── GanttThemes.ts
├── App.vue                     # 示例应用
├── main.ts                     # 入口文件
└── style.css                   # 全局样式
```

## 完整示例

参考 `src/App.vue` 获取完整的使用示例，包含：

- 多层级任务结构
- 各种依赖关系配置
- 自定义颜色映射
- 事件处理
- 国际化功能集成

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT

</details>

---

<div id="english-documentation"></div>

<details>
<summary><h2>🇺🇸 English Documentation</h2></summary>

A feature-rich, highly customizable Vue 3 Gantt chart component that supports task management, dependency relationships, multiple view modes, and theme switching.

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

**Note**: For better reading experience, you can also view the [separate English README file](README.en-US.md).

## Interface Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Vue3 Gantt Professional Component                    │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Task Name       │ 12/01  12/02  12/03  12/04  12/05  12/06  12/07  12/08   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Main Task 1 - Planning│ ████████████████████████████████████████████ 85%    │
│   Subtask 1.1 - Requirements│   ████████████ 100%                          │
│ Main Task 2 - Development│       ████████████████████████████ 60%          │
│ Main Task 3 - Testing│             ████████████████ 45%                    │
│ Main Task 4 - Deployment│                   ████████ 30%                   │
│ Main Task 5 - Maintenance│                       ████ 0%                    │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

**Key Features:**
- 🎯 Left task list + Right Gantt chart timeline
- 📊 Visual progress bars showing task completion
- 🔗 Task dependency relationship lines
- 🎨 Multi-theme support (Light/Dark/Colorful, etc.)
- 🖱️ Drag to adjust task time and progress
- 🌍 Multi-language support (Chinese/English/Japanese/Korean/French/German/Spanish/Russian)

## Features

- **Multiple View Modes** - Month, Day, Week, and Hour time granularity views
- **Task Dependencies** - Support for FS, SS, FF, SF dependency types
- **Milestone Support** - Diamond markers for key project milestones with dependency support
- **Theme System** - 5 built-in themes with custom theme support
- **Internationalization** - Built-in 8 languages, easily extensible
- **Progress Management** - Visual progress bars with drag-to-adjust
- **Interactive Operations** - Task dragging, resizing, parent-child linkage
- **Responsive Design** - Adjustable split panel ratio
- **High Performance** - Virtual scrolling optimization for large datasets

### For complete English documentation including:
- ✅ Detailed configuration guide
- ✅ Task data format
- ✅ Dependency relationships
- ✅ View modes
- ✅ Theme system
- ✅ Internationalization
- ✅ Interactive features
- ✅ Link configuration
- ✅ Performance optimization
- ✅ Project structure

**Please visit**: [README.en-US.md](README.en-US.md) for the full English documentation.

## License

MIT

</details>
