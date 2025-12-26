# Vue3 Gantt 甘特图组件

**Languages / 语言选择:**
[<span style="color: #0078d4; font-weight: bold;">简体中文</span>](#chinese-documentation) |
[<span style="color: #0078d4; font-weight: bold;">English</span>](#english-documentation) |
[View Separate Files](.)

> 💡 **提示**: 点击上方语言链接可直接跳转到对应文档 | GitHub 上也可查看独立语言版本文件：[README.md](README.md) (默认中文) | [README.en-US.md](README.en-US.md) (English)

<style>
html {
  scroll-behavior: smooth;
}
details > summary {
  cursor: pointer;
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}
details[open] > summary {
  border-bottom: 1px solid #e0e0e0;
}
</style>

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

<div align="center">
  <img src="https://github.com/user-attachments/assets/34562bf8-0709-44aa-a05d-6e970ea8b57f" alt="Vue3 Gantt Chart - Light Theme" />
  <p><em>浅色主题 - 完整的任务管理界面</em></p>
  
  <img src="https://github.com/user-attachments/assets/d6a60ba1-9f5b-479a-b402-68014ec7c935" alt="Vue3 Gantt Chart - Dark Theme" />
  <p><em>深色主题 - 护眼模式</em></p>
</div>

```

**核心亮点：**
- 🎯 **双栏布局** - 左侧任务列表 + 右侧甘特图时间轴，信息一目了然
- 📊 **可视化进度** - 实时进度条显示，支持拖拽调整完成度
- 🔗 **智能依赖** - 四种依赖类型（FS/SS/FF/SF），自动绘制连线
- 🎨 **多主题切换** - 5种内置主题，支持深色模式和自定义主题
- 🖱️ **交互丰富** - 拖拽移动、调整大小、父子任务联动
- 🌍 **国际化** - 内置8种语言，轻松扩展更多语言
- ⚡ **高性能** - 虚拟滚动优化，轻松处理大量任务数据
- 💎 **里程碑** - 菱形标记关键节点，支持依赖关系

## ✨ 核心特性

### 📅 多视图模式
支持五种时间粒度，满足不同场景需求：
- **季度视图** - 超长期项目规划，按月显示
- **月视图** - 长期项目规划，按天显示
- **周视图** - 中期项目跟踪，按周显示
- **日视图** - 短期任务管理，支持全天/半天细分模式
- **时视图** - 精细任务调度，支持小时/30分钟/15分钟细分模式

### 🔗 任务依赖管理
- **完成-开始 (FS)** - 前置任务完成后，后续任务才能开始
- **开始-开始 (SS)** - 两个任务同时开始
- **完成-完成 (FF)** - 两个任务同时完成
- **开始-完成 (SF)** - 后续任务开始后，前置任务才能完成

### 💎 里程碑功能
- 菱形图标标记项目关键节点
- 支持作为依赖关系的源和目标
- 自动识别（开始时间=结束时间）或手动标记

### 🎨 主题系统
- 内置 7 种精美主题（Metro/Dark/Modern/Classic/Colorful/Apple/Liquid Glass）
- 支持深色模式，护眼舒适
- 完整的 CSS 变量支持，轻松自定义主题
- 主题设置自动保存到浏览器

### 🌍 国际化支持
- 内置 8 种语言（中/英/日/韩/法/德/西/俄）
- 即时切换，无需刷新页面
- 所有界面元素完整翻译
- 时间轴表头自动本地化
- 易于扩展新语言

### 🖱️ 交互操作
- **拖拽移动** - 修改任务开始和结束日期
- **调整大小** - 拖拽边缘调整任务时长
- **进度调整** - 拖拽三角滑块调整完成度
- **父子联动** - 父任务移动时子任务自动跟随
- **分割面板** - 可调整左右区域比例

### ⚡ 性能优化
- 虚拟滚动渲染，支持海量任务数据
- 节流更新机制，避免频繁重绘
- 计算结果缓存，提升响应速度
- 按需渲染连线，优化绘制性能

### 📝 自定义字段
- **多种字段类型** - 支持文本、数字、日期、下拉选择等字段类型
- **灵活配置** - 可为任务添加任意数量的自定义字段
- **表单验证** - 内置字段验证规则，确保数据有效性
- **本地存储** - 字段配置自动保存到浏览器，刷新不丢失
- **动态管理** - 支持运行时添加、编辑、删除自定义字段

### 💬 消息提示
- **三种提示类型** - 成功、错误、警告，满足不同场景需求
- **自动消失** - 提示信息自动消失，无需手动关闭
- **优雅动画** - 流畅的进入和退出动画效果
- **多语言支持** - 提示文本随语言设置自动切换

### 🗑️ 删除确认
- **安全删除** - 删除任务前弹出确认对话框，防止误操作
- **级联删除** - 删除父任务时自动提示将同时删除所有子任务
- **友好提示** - 清晰的警告信息，让用户了解删除影响范围

### 🎛️ 配置面板
- **连线样式配置** - 自定义任务连线的路径类型、颜色、宽度、虚线样式、箭头设置
- **父子关系样式** - 配置父子任务的连接线样式
- **列显示设置** - 灵活控制任务列表列的显示/隐藏
- **一键重置** - 快速恢复默认配置

### 🌲 树形任务结构
- **层级展示** - 清晰的树形结构显示任务父子关系
- **折叠展开** - 支持折叠/展开子任务，简化视图
- **连接线** - 可视化连接线展示层级关系
- **快速操作** - 行内按钮快速添加/删除子任务
- **悬停高亮** - 鼠标悬停时高亮显示当前任务行

## 🚀 安装使用

### 方式一：通过 npm 安装（推荐）

```bash
# 使用 npm
npm install @lee576/vue3-gantt

# 或使用 yarn
yarn add @lee576/vue3-gantt

# 或使用 pnpm
pnpm add @lee576/vue3-gantt
```

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/lee576/vue3-gantt.git
cd vue3-gantt

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📚 快速开始

### 1️⃣ 引入组件

```typescript
import { createApp } from 'vue';
import Gantt from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';

const app = createApp(App);
app.use(Gantt); // 全局注册
```

或在组件中单独引入：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig,
  LinkType 
} from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';
</script>
```

### 2️⃣ 配置容器高度（重要！）

> ⚠️ **注意**：组件**必须有明确的容器高度**才能正常显示。

**推荐方法（任选其一）：**

```vue
<!-- 方法1：使用视口高度（最简单） -->
<template>
  <div style="height: 100vh;">
    <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
  </div>
</template>

<!-- 方法2：使用固定高度 -->
<template>
  <div style="height: 800px;">
    <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
  </div>
</template>

<!-- 方法3：Flex 布局 -->
<template>
  <div style="display: flex; flex-direction: column; height: 100vh;">
    <div>Header</div>
    <div style="flex: 1;"> <!-- 自动填充剩余空间 -->
      <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
    </div>
  </div>
</template>
```

<details>
<summary>💡 为什么需要设置高度？</summary>

组件内部使用了 `height: 100%`，根据 CSS 规范，百分比高度需要父元素有明确的高度才能计算。如果父容器没有设置高度，组件会高度坑塌。

**解决方案**：
- 使用 `100vh`（视口高度）
- 使用固定像素值（如 `800px`）
- 使用 Flex 布局的 `flex: 1`
- 配置 `html, body { height: 100%; }` 后使用 `100%`

</details>

### 3️⃣ 基本配置

```vue
<template>
  <div style="height: 100vh;">
    <gantt 
      :dataConfig="dataConfig" 
      :styleConfig="styleConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig,
  LinkType 
} from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';

// 🎨 样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,  // 表头高度
  rowHeight: 60,       // 行高
  setBarColor: (row) => {
    // 自定义任务条颜色
    const colorMap = { '紧急': '#ef4444', '重要': '#3b82f6', '一般': '#6b7280' };
    return colorMap[row.level] ?? '#000';
  }
});

// 📊 数据配置
const dataConfig = ref<DataConfig>({
  queryStartDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  queryEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
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
    { title: '任务名称', width: 200, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
  ]
});

// ⚡ 事件配置
const eventConfig = ref<EventConfig>({
  queryTask: async (startDate, endDate, mode) => {
    // 查询任务数据
    const tasks = await fetchTasks(startDate, endDate);
    dataConfig.value.dataSource = tasks;
  },
  barDate: (id, startDate, endDate) => {
    console.log('任务日期变更', { id, startDate, endDate });
  },
  updateProgress: (detail) => {
    console.log('进度更新', detail);
  }
});

// 初始化加载数据
onMounted(() => {
  const start = dayjs().startOf('month').format('YYYY-MM-DD');
  const end = dayjs().endOf('month').format('YYYY-MM-DD');
  eventConfig.value.queryTask?.(start, end, '月');
});
</script>
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
| � **季度视图** | 月 | `2024-Q1 2024-Q2 2024-Q3 ...` | 超长期项目规划 |
| ��️ **月视图** | 天 | `01 02 03 04 05 ...` | 长期项目规划 |
| 📅 **日视图** | 天 | `周一 周二 周三 ...` | 短期任务管理 |
| 📊 **周视图** | 周 | `W50 W51 W52 ...` | 中期项目跟踪 |
| ⏰ **时视图** | 小时 | `08 09 10 11 12 ...` | 精细任务调度 |

组件支持五种时间粒度视图：

| 模式 | 说明 | 细分模式 | 适用场景 |
|------|------|----------|----------|
| 季度 | 按月显示，以季度为单位 | - | 超长期项目规划 |
| 月 | 按天显示，以月份为单位 | - | 长期项目规划 |
| 日 | 按天显示，精确到天 | 全天 / 半天 | 短期任务管理 |
| 周 | 按周显示 | - | 中期项目跟踪 |
| 时 | 按小时显示 | 小时 / 30分钟 / 15分钟 | 精细任务调度 |

### 视图模式切换

组件顶部提供视图模式切换按钮，点击即可在不同视图模式之间切换。

### 细分模式说明

**日视图细分模式：**
- **全天** - 每天显示为一个完整的时间段
- **半天** - 每天分为上午和下午两个时间段

**时视图细分模式：**
- **小时** - 每小时显示为一个时间段
- **30分钟** - 每小时分为两个30分钟时间段
- **15分钟** - 每小时分为四个15分钟时间段

## 主题系统

| 主题 | 主色调 | 风格特点 |
|------|--------|----------|
| 🔷 **Metro 金属** | `#0078d4` | Microsoft Metro 设计语言，专业金属质感 |
| 🌙 **深色模式** | `#00d4ff` | 护眼深色主题，适合长时间使用 |
| ✨ **现代简约** | `#6366f1` | 简洁现代设计，清爽舒适 |
| 💼 **经典商务** | `#2563eb` | 传统商务风格，稳重大方 |
| 🎨 **彩色活力** | `#f59e0b` | 活泼彩色主题，充满活力 |
| 🍎 **Apple 风格** | `#007aff` | 简约优雅的 macOS 风格，流畅自然 |
| 💧 **Liquid Glass** | `#007aff` | iOS 26 液态玻璃效果，半透明流动质感 |

### 内置主题

| 主题ID | 名称 | 说明 |
|--------|------|------|
| metro | Metro 金属 | Microsoft Metro 设计语言 |
| dark | 深色模式 | 护眼深色主题 |
| modern | 现代简约 | 简洁现代设计 |
| classic | 经典商务 | 传统商务风格 |
| colorful | 彩色活力 | 活泼彩色主题 |
| apple | Apple 风格 | 简约优雅的 macOS 风格 |
| liquidGlass | Liquid Glass | iOS 26 液态玻璃效果 |

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

## 自定义字段

组件支持强大的自定义字段功能，允许为任务添加任意数量的自定义字段，满足不同项目的个性化需求。

### 功能特性

- **多种字段类型** - 文本、数字、日期、下拉选择
- **动态管理** - 运行时添加、编辑、删除字段
- **表单验证** - 内置验证规则，确保数据有效性
- **本地存储** - 字段配置自动保存到浏览器
- **任务绑定** - 自定义字段值与任务数据关联

### 字段类型

| 类型 | 说明 | 示例值 |
|------|------|--------|
| 文本 | 单行文本输入 | "项目编号：PRJ-001" |
| 数字 | 数值输入，支持小数 | 100.5 |
| 日期 | 日期选择器 | "2024-12-01" |
| 下拉选择 | 预定义选项列表 | "高优先级" |

### 使用方法

#### 1. 打开自定义字段管理

在甘特图工具栏中点击"自定义字段"按钮，打开字段管理对话框。

#### 2. 添加自定义字段

```typescript
// 示例：添加一个"负责人"字段
const customField = {
  id: 'field-1',
  name: '负责人',
  type: 'text',      // text | number | date | select
  required: false,   // 是否必填
  options: []        // 下拉选择时提供选项
};
```

#### 3. 在任务中使用自定义字段

自定义字段的值存储在任务的 `customFieldValues` 字段中：

```typescript
{
  id: '1',
  taskNo: '项目规划',
  start_date: '2024-12-01',
  end_date: '2024-12-06',
  job_progress: '0.85',
  customFieldValues: {
    'field-1': '张三',           // 负责人
    'field-2': '100',           // 预算
    'field-3': '2024-11-30',    // 审批日期
    'field-4': '高优先级'        // 优先级
  }
}
```

#### 4. 下拉选择字段配置

```typescript
const priorityField = {
  id: 'field-priority',
  name: '优先级',
  type: 'select',
  required: true,
  options: [
    { label: '紧急', value: 'urgent' },
    { label: '重要', value: 'important' },
    { label: '一般', value: 'normal' }
  ]
};
```

### 字段验证

组件内置了基本的字段验证规则：

- **必填字段** - 如果字段标记为 `required: true`，则必须提供值
- **数字验证** - 数字字段只接受有效的数值
- **日期验证** - 日期字段只接受有效的日期格式
- **选项验证** - 下拉选择字段只接受预定义的选项值

### API 集成

#### 后端存储格式

自定义字段值需要以特定格式存储到后端：

```typescript
// 推荐格式：JSON 字符串
customFieldValues: JSON.stringify({
  'field-1': '张三',
  'field-2': '100'
})

// 或数组格式（需要后端支持）
customFieldValues: [
  { fieldId: 'field-1', value: '张三' },
  { fieldId: 'field-2', value: '100' }
]
```

#### 数据处理示例

```typescript
// 保存任务时
const saveTask = async (task) => {
  const payload = {
    ...task,
    customFieldValues: JSON.stringify(task.customFieldValues)
  };
  await api.saveTask(payload);
};

// 加载任务时
const loadTask = async (taskId) => {
  const data = await api.getTask(taskId);
  return {
    ...data,
    customFieldValues: JSON.parse(data.customFieldValues || '{}')
  };
};
```

### 最佳实践

1. **字段命名** - 使用清晰、简洁的字段名称，便于理解
2. **必填设置** - 合理设置必填字段，避免过度限制
3. **选项管理** - 下拉选择字段提供完整的选项列表
4. **数据验证** - 在后端也进行字段验证，确保数据完整性
5. **性能优化** - 避免添加过多自定义字段，影响性能

## 配置面板

组件提供了丰富的配置选项，允许用户自定义甘特图的外观和行为。

### 甘特图配置面板

点击工具栏中的"设置"按钮，打开甘特图配置面板。

#### 语言设置

- 支持切换 8 种语言（中/英/日/韩/法/德/西/俄）
- 语言设置自动保存到浏览器
- 切换后界面立即更新，无需刷新

#### 主题设置

- 5 种内置主题可选
- 主题切换即时生效
- 主题设置自动保存

#### 连线样式配置

| 配置项 | 说明 | 可选值 |
|--------|------|--------|
| 路径类型 | 连线的绘制路径 | 直线 / 贝塞尔曲线 / 阶梯线 |
| 连线颜色 | 连线的颜色 | 颜色选择器 |
| 连线宽度 | 连线的粗细 | 1px - 5px |
| 虚线样式 | 是否使用虚线 | 实线 / 虚线 |
| 箭头设置 | 是否显示箭头 | 显示 / 隐藏 |

#### 父子关系样式

| 配置项 | 说明 |
|--------|------|
| 连接线颜色 | 父子任务连接线的颜色 |
| 连接线宽度 | 父子任务连接线的粗细 |
| 连接线样式 | 实线或虚线 |

### 列显示设置面板

点击工具栏中的"列设置"按钮，打开列显示设置面板。

#### 功能特性

- **列显示控制** - 勾选/取消勾选来显示或隐藏列
- **全部显示** - 一键显示所有列
- **全部隐藏** - 一键隐藏所有列
- **重置默认** - 恢复到默认列配置
- **实时生效** - 设置更改立即反映在界面上

#### 默认列配置

```typescript
taskHeaders: [
  { title: '序号', width: 80, property: 'no', show: true },
  { title: '任务名称', width: 200, property: 'task', show: true },
  { title: '优先级', width: 90, property: 'priority', show: true },
  { title: '开始时间', width: 150, property: 'startdate', show: true },
  { title: '结束时间', width: 150, property: 'enddate', show: true },
  { title: '耗时', width: 100, property: 'takestime', show: true },
  { title: '进度', width: 100, property: 'progress', show: true }
]
```

### 配置持久化

所有配置（语言、主题、连线样式、列显示等）都会自动保存到浏览器的 localStorage 中，刷新页面后配置不会丢失。

### 编程方式配置

除了通过界面配置，也可以通过代码直接设置配置：

```typescript
// 设置主题
import { setTheme } from './components/gantt/theme';
setTheme('dark');

// 设置语言
import { setLocale } from './components/gantt/i18n';
setLocale('en-US');

// 修改列配置
dataConfig.value.taskHeaders = [
  { title: '序号', width: 80, property: 'no', show: true },
  { title: '任务名称', width: 250, property: 'task', show: true },
  // ... 其他列
];
```

## 任务对话框

组件提供了完整的任务创建和编辑对话框，支持基础字段和自定义字段的编辑。

### 对话框功能

#### 基础字段

| 字段 | 说明 | 必填 |
|------|------|------|
| 任务名称 | 任务的名称 | ✅ |
| 优先级 | 任务的优先级（紧急/重要/一般） | ✅ |
| 开始时间 | 任务的开始日期和时间 | ✅ |
| 结束时间 | 任务的结束日期和时间 | ✅ |
| 进度 | 任务的完成进度（0-100%） | ✅ |

#### 自定义字段

根据配置的自定义字段，对话框会动态显示相应的输入控件。

### 打开对话框

#### 创建根任务

```typescript
// 通过工具栏按钮点击
eventConfig.value.addRootTask?.(newTask);
```

#### 创建子任务

```typescript
// 在任务行点击"添加子任务"按钮
eventConfig.value.addSubTask?.(parentTask);
```

#### 编辑任务

```typescript
// 双击任务或点击编辑按钮
eventConfig.value.editTask?.(task);
```

### 表单验证

对话框内置了表单验证功能：

- **必填字段检查** - 确保所有必填字段都已填写
- **日期逻辑验证** - 结束时间不能早于开始时间
- **进度范围验证** - 进度值必须在 0-100 之间
- **自定义字段验证** - 根据字段配置进行验证

### 对话框事件

```typescript
const eventConfig = ref<EventConfig>({
  // 添加根任务
  addRootTask: (task) => {
    console.log('添加根任务', task);
    // 保存到后端
    await api.createTask(task);
  },

  // 添加子任务
  addSubTask: (parentTask) => {
    console.log('添加子任务，父任务：', parentTask);
    // 创建子任务
    const subTask = {
      pid: parentTask.id,
      // ... 其他字段
    };
    await api.createTask(subTask);
  },

  // 编辑任务
  editTask: (task) => {
    console.log('编辑任务', task);
    // 更新到后端
    await api.updateTask(task);
  }
});
```

### 对话框样式

对话框采用现代化的设计风格：

- **模态窗口** - 阻止背景操作，确保用户专注
- **响应式布局** - 自适应不同屏幕尺寸
- **清晰的标签** - 每个字段都有明确的标签
- **必填标识** - 必填字段有红色星号标记
- **错误提示** - 验证失败时显示错误信息

## 消息提示

组件内置了优雅的消息提示系统，用于向用户反馈操作结果。

### 提示类型

| 类型 | 说明 | 图标 | 颜色 |
|------|------|------|------|
| 成功 | 操作成功完成 | ✅ | 绿色 |
| 错误 | 操作失败或出错 | ❌ | 红色 |
| 警告 | 需要注意的问题 | ⚠️ | 黄色 |

### 使用方法

#### 1. 通过组件内部触发

组件内部会在以下情况自动显示消息提示：

- 任务创建成功/失败
- 任务更新成功/失败
- 任务删除成功/失败
- 自定义字段保存成功/失败
- 配置更新成功

#### 2. 编程方式调用

```typescript
import { showToast } from './components/MessageToast';

// 显示成功消息
showToast('success', '任务创建成功！');

// 显示错误消息
showToast('error', '操作失败，请重试');

// 显示警告消息
showToast('warning', '请注意：此操作不可撤销');
```

### 提示特性

- **自动消失** - 提示信息在 3 秒后自动消失
- **手动关闭** - 点击关闭按钮可立即关闭
- **优雅动画** - 流畅的淡入淡出动画
- **多语言支持** - 提示文本随语言设置自动切换
- **位置固定** - 固定在页面右上角，不遮挡操作区域

### 消息示例

```typescript
// 成功提示
showToast('success', '任务已成功保存');

// 错误提示
showToast('error', '保存失败：网络连接错误');

// 警告提示
showToast('warning', '删除任务将同时删除所有子任务');
```

## 删除确认对话框

为了防止误操作，组件在删除任务时会弹出确认对话框。

### 对话框功能

- **删除警告** - 清晰的警告信息
- **级联删除提示** - 如果删除父任务，会提示将同时删除所有子任务
- **确认/取消** - 用户可以选择确认或取消删除操作

### 删除流程

```
用户点击删除按钮
    ↓
检查是否有子任务
    ↓
显示确认对话框
    ↓
用户确认删除
    ↓
执行删除操作
    ↓
显示删除结果提示
```

### 对话框内容

#### 删除普通任务

```
⚠️ 确认删除

您确定要删除此任务吗？

此操作不可撤销。
```

#### 删除父任务（包含子任务）

```
⚠️ 确认删除

您确定要删除此任务吗？

注意：删除此任务将同时删除其所有子任务（共 3 个）。

此操作不可撤销。
```

### 事件处理

```typescript
const eventConfig = ref<EventConfig>({
  removeTask: async (task) => {
    // 检查是否有子任务
    const hasChildren = dataConfig.value.dataSource.some(
      t => t.pid === task.id
    );

    // 显示确认对话框
    const confirmed = await showDeleteConfirm(task, hasChildren);

    if (confirmed) {
      // 执行删除
      await api.deleteTask(task.id);
      // 更新数据源
      dataConfig.value.dataSource = dataConfig.value.dataSource.filter(
        t => t.id !== task.id
      );
      // 显示成功提示
      showToast('success', '任务已删除');
    }
  }
});
```

### 安全特性

- **二次确认** - 所有删除操作都需要用户确认
- **级联提示** - 明确告知用户删除的影响范围
- **不可撤销警告** - 提醒用户操作的不可逆性
- **子任务统计** - 显示将要删除的子任务数量

## 树形任务结构

组件支持完整的树形任务结构，可以清晰地展示任务的层级关系。

### 核心特性

- **层级展示** - 通过缩进和连接线清晰展示父子关系
- **折叠展开** - 支持折叠/展开子任务，简化复杂项目视图
- **视觉连接** - 树形连接线直观展示任务层级
- **快速操作** - 行内按钮快速添加/删除子任务
- **悬停高亮** - 鼠标悬停时高亮显示当前任务行

### 任务层级结构

```typescript
// 根任务（pid = '0'）
{
  id: '1',
  pid: '0',           // '0' 表示根任务
  taskNo: '项目开发',
  start_date: '2024-12-01',
  end_date: '2024-12-31'
}

// 子任务
{
  id: '1-1',
  pid: '1',           // 父任务ID
  taskNo: '前端开发',
  start_date: '2024-12-01',
  end_date: '2024-12-15'
}

// 孙任务
{
  id: '1-1-1',
  pid: '1-1',         // 父任务ID
  taskNo: 'UI设计',
  start_date: '2024-12-01',
  end_date: '2024-12-05'
}
```

### 视觉元素

#### 1. 缩进显示

子任务会根据层级自动缩进，每层缩进固定距离：

```
├─ 项目开发
│  ├─ 前端开发
│  │  ├─ UI设计
│  │  └─ 功能开发
│  └─ 后端开发
│     ├─ API设计
│     └─ 数据库设计
```

#### 2. 连接线

树形连接线清晰地展示父子关系：

- **垂直线** - 连接父任务到子任务
- **水平线** - 标记任务的层级位置
- **分支线** - 展示任务的分支结构

#### 3. 折叠/展开按钮

每个有子任务的任务左侧都有折叠/展开按钮：

- **展开状态** (▶) - 显示所有子任务
- **折叠状态** (▼) - 隐藏所有子任务

### 交互操作

#### 添加子任务

在任务行点击"添加子任务"按钮，会自动：

1. 创建新的子任务
2. 设置正确的父任务ID
3. 打开任务编辑对话框
4. 保存后自动刷新树形结构

```typescript
const addSubTask = (parentTask) => {
  const newTask = {
    id: generateId(),
    pid: parentTask.id,  // 设置父任务ID
    taskNo: '新子任务',
    start_date: parentTask.start_date,
    end_date: parentTask.end_date,
    job_progress: '0'
  };
  eventConfig.value.addSubTask?.(newTask);
};
```

#### 删除任务

删除任务时会：

1. 检查是否有子任务
2. 显示确认对话框（包含级联删除提示）
3. 删除任务及其所有子任务
4. 自动更新树形结构

```typescript
const deleteTask = (task) => {
  // 级联删除所有子任务
  const deleteRecursive = (taskId) => {
    const children = dataConfig.value.dataSource.filter(
      t => t.pid === taskId
    );
    children.forEach(child => deleteRecursive(child.id));
    dataConfig.value.dataSource = dataConfig.value.dataSource.filter(
      t => t.id !== taskId
    );
  };
  deleteRecursive(task.id);
};
```

#### 折叠/展开

点击折叠/展开按钮可以：

- **展开** - 显示所有子任务和孙任务
- **折叠** - 隐藏所有后代任务
- **状态记忆** - 折叠状态会保存到 localStorage

### 父子任务联动

父任务移动时，子任务会自动跟随移动，保持相对时间关系：

```typescript
// 父任务移动 5 天
const moveParentTask = (task, days) => {
  const oldStart = dayjs(task.start_date);
  const oldEnd = dayjs(task.end_date);

  // 更新父任务
  task.start_date = oldStart.add(days, 'day').format('YYYY-MM-DD');
  task.end_date = oldEnd.add(days, 'day').format('YYYY-MM-DD');

  // 子任务跟随移动
  const children = getChildren(task.id);
  children.forEach(child => {
    const childOldStart = dayjs(child.start_date);
    const childOldEnd = dayjs(child.end_date);
    child.start_date = childOldStart.add(days, 'day').format('YYYY-MM-DD');
    child.end_date = childOldEnd.add(days, 'day').format('YYYY-MM-DD');
  });
};
```

### 样式自定义

可以通过 CSS 自定义树形结构的样式：

```css
/* 连接线颜色 */
.gantt-tree-line {
  border-color: #d0d0d0;
}

/* 折叠/展开按钮 */
.gantt-collapse-btn {
  color: #666;
  cursor: pointer;
}

.gantt-collapse-btn:hover {
  color: #333;
}

/* 行悬停效果 */
.gantt-row:hover {
  background-color: #f5f5f5;
}
```

### 最佳实践

1. **合理层级** - 建议层级不超过 5 层，过深的层级会影响可读性
2. **任务命名** - 使用清晰的命名规范，便于理解层级关系
3. **折叠管理** - 对于大型项目，合理使用折叠功能简化视图
4. **批量操作** - 父任务移动时子任务自动跟随，避免逐个调整
5. **性能优化** - 深层嵌套时注意性能，考虑使用折叠减少渲染数量

## 国际化支持

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
│   ├── CustomFieldsDialog.vue    # 自定义字段对话框
│   ├── DeleteConfirmDialog.vue   # 删除确认对话框
│   ├── MessageToast.vue          # 消息提示组件
│   ├── TaskDialog.vue            # 任务编辑对话框
│   └── gantt/
│       ├── composables/          # 甘特图组合式函数
│       │   ├── LinkConfig.ts
│       │   ├── PerformanceConfig.ts
│       │   ├── useHorizontalVirtualScroll.ts
│       │   └── useVirtualScroll.ts
│       ├── config/               # 配置面板组件
│       │   ├── CheckboxConfig.vue
│       │   ├── ColorInput.vue
│       │   ├── ColumnConfigPanel.vue
│       │   ├── ConfigSection.vue
│       │   ├── DatePicker.vue
│       │   ├── GanttConfigPanel.vue
│       │   ├── GanttThemeSelector.vue
│       │   ├── LanguageSelector.vue
│       │   ├── LinkConfigPanel.vue
│       │   ├── LinkTypeColorConfig.vue
│       │   ├── PathTypeSelector.vue
│       │   ├── SliderInput.vue
│       │   └── ThemeSelector.vue
│       ├── core/                 # 核心组件
│       │   ├── Gantt.vue         # 主组件
│       │   └── SplitPane.vue     # 分割面板
│       ├── gantt.css             # 甘特图样式
│       ├── i18n/                 # 国际化系统
│       │   ├── index.ts          # i18n 核心
│       │   └── locales/          # 语言包
│       │       ├── zh-CN.ts      # 中文语言包
│       │       ├── zh-TW.ts      # 繁体中文语言包
│       │       ├── en-US.ts      # 英文语言包
│       │       ├── ja-JP.ts      # 日语语言包
│       │       ├── ko-KR.ts      # 韩语语言包
│       │       ├── fr-FR.ts      # 法语语言包
│       │       ├── de-DE.ts      # 德语语言包
│       │       ├── es-ES.ts      # 西班牙语语言包
│       │       └── ru-RU.ts      # 俄语语言包
│       ├── links/                # 连线组件
│       │   └── TaskLinks.vue     # 任务连线
│       ├── state/                # 状态管理
│       │   ├── ShareState.ts     # 共享状态
│       │   ├── Store.ts          # 状态存储
│       │   └── Symbols.ts        # 注入符号
│       ├── task/                 # 任务相关组件
│       │   ├── TaskTable.vue     # 任务表格
│       │   ├── TaskHeader.vue    # 任务表头
│       │   ├── TaskContent.vue   # 任务内容
│       │   ├── TaskRow.vue       # 任务行
│       │   └── TaskRecursionRow.vue  # 递归任务行
│       ├── themes/               # 主题配置
│       │   ├── GanttThemes.ts    # 主题定义
│       │   └── LiquidGlass.css   # 液态玻璃主题
│       ├── timeline/             # 时间轴组件
│       │   ├── Bar.vue           # 任务条
│       │   ├── BarRecursionRow.vue  # 递归任务条
│       │   ├── Milestone.vue     # 里程碑
│       │   ├── RightTable.vue    # 右侧甘特图区域
│       │   ├── TableContent.vue  # 表格内容
│       │   ├── TimelineHeader.vue  # 时间轴表头
│       │   ├── composables/      # 时间轴组合式函数
│       │   │   ├── useBarGeometry.ts
│       │   │   ├── useBarTheme.ts
│       │   │   ├── useHover.ts
│       │   │   ├── useInteractions.ts
│       │   │   └── useProgress.ts
│       │   └── utils/            # 工具函数
│       │       └── dateCalc.ts
│       └── types/               # 类型定义
│           ├── Types.ts          # 甘特图类型
│           └── ZodSchema.ts      # 数据验证
├── composables/                 # 全局组合式函数
│   ├── useCustomFields.ts       # 自定义字段
│   ├── useMessage.ts            # 消息提示
│   └── useTaskManagement.ts     # 任务管理
├── mock/                        # 模拟数据
│   └── mockData.ts              # 示例数据
├── services/                    # 服务层
│   └── taskApi.ts               # 任务 API
├── styles/                      # 全局样式
│   └── dialog-common.css        # 对话框通用样式
├── types/                       # 类型定义
│   └── task.ts                  # 任务类型
├── App.vue                      # 示例应用
├── index.ts                     # 导出入口
├── main.ts                      # 应用入口
├── style.css                    # 全局样式
└── vite-env.d.ts                # Vite 环境类型
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
