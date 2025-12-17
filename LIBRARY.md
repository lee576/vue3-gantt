# Vue3 Gantt 库使用指南

本文档介绍如何将 Vue3 Gantt 组件打包并发布到 npm,以及如何在其他项目中使用。

## 📦 构建库

### 1. 构建命令

```bash
# 构建库文件
npm run build:lib
```

构建完成后,会在 `dist` 目录生成以下文件:
- `vue3-gantt.es.js` - ES Module 格式
- `vue3-gantt.umd.js` - UMD 格式(支持浏览器直接引入)
- `vue3-gantt.css` - 样式文件
- `index.d.ts` - TypeScript 类型声明文件

### 2. 发布到 npm

#### 准备工作

1. **修改 package.json 中的包名**
   ```json
   {
     "name": "@yourusername/vue3-gantt",  // 替换为你的用户名/组织名
     "author": "Your Name <your.email@example.com>",
     "repository": {
       "url": "https://github.com/yourusername/vue3-gantt.git"
     }
   }
   ```

2. **添加 LICENSE 文件**
   ```bash
   # 创建 MIT 许可证文件
   # 在项目根目录创建 LICENSE 文件
   ```

3. **登录 npm**
   ```bash
   npm login
   ```

#### 发布步骤

```bash
# 1. 确保所有更改已提交
git add .
git commit -m "Ready for npm publish"

# 2. 更新版本号(可选)
npm version patch  # 修复版本 1.0.0 -> 1.0.1
npm version minor  # 次要版本 1.0.0 -> 1.1.0
npm version major  # 主要版本 1.0.0 -> 2.0.0

# 3. 发布到 npm
npm publish --access public
```

## 🚀 在项目中使用

### 安装

```bash
# npm
npm install @yourusername/vue3-gantt

# pnpm
pnpm add @yourusername/vue3-gantt

# yarn
yarn add @yourusername/vue3-gantt
```

### 基本使用

#### 1. 全局注册(main.ts)

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { install as Vue3Gantt } from '@yourusername/vue3-gantt'
import '@yourusername/vue3-gantt/style.css'

const app = createApp(App)
app.use(Vue3Gantt)
app.mount('#app')
```

#### 2. 按需引入(推荐)

```vue
<template>
  <div>
    <Gantt 
      :styleConfig="styleConfig" 
      :dataConfig="dataConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Gantt, type DataConfig, type StyleConfig, type EventConfig, LinkType } from '@yourusername/vue3-gantt'
import '@yourusername/vue3-gantt/style.css'
import dayjs from 'dayjs'

// 样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,
  rowHeight: 60,
  setBarColor: (row) => {
    const colorMap = {
      '紧急': 'red',
      '重要': 'blue',
      '一般': 'gray'
    }
    return colorMap[row.level] ?? 'black'
  }
})

// 数据配置
const dataConfig = ref<DataConfig>({
  queryStartDate: '',
  queryEndDate: '',
  dataSource: [],
  dependencies: [
    { sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START }
  ],
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
})

// 事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: (row) => console.log('添加根任务', row),
  addSubTask: (task) => console.log('添加子任务', task),
  removeTask: (task) => console.log('删除任务', task),
  editTask: (task) => console.log('编辑任务', task),
  queryTask: async (startDate, endDate, mode) => {
    console.log('查询任务', startDate, endDate, mode)
    // 加载数据
  },
  barDate: (id, startDate, endDate) => {
    console.log('任务日期变更', id, startDate, endDate)
  },
  allowChangeTaskDate: (allow) => {
    console.log('允许修改日期', allow)
  },
  updateProgress: (detail) => {
    console.log('进度更新', detail)
  }
})
</script>
```

### 导出的 API

#### 组件
- `Gantt` - 主甘特图组件
- `DatePicker` - 日期选择器
- `GanttThemeSelector` - 主题选择器
- `LanguageSelector` - 语言选择器
- `GanttConfigPanel` - 配置面板
- `LinkConfigPanel` - 连线配置面板

#### 类型
```typescript
import type {
  DataConfig,          // 数据配置
  StyleConfig,         // 样式配置
  EventConfig,         // 事件配置
  TaskHeader,          // 任务表头
  LinkConfig,          // 连线配置
  TaskLink,            // 任务连线
  TaskDependency,      // 任务依赖
  ProgressUpdateDetail,// 进度更新详情
  LinkTypeColors,      // 连线颜色
  LinkTypeVisibility,  // 连线可见性
  GanttTheme,          // 甘特图主题
  Locale               // 语言类型
} from '@yourusername/vue3-gantt'
```

#### 枚举
```typescript
import { 
  LinkType,      // 连线类型: FINISH_TO_START, START_TO_START, etc.
  LinkPathType   // 连线路径: STRAIGHT, BEZIER, RIGHT_ANGLE
} from '@yourusername/vue3-gantt'
```

#### 工具函数
```typescript
import { 
  ganttThemes,      // 主题列表
  LinkThemes,       // 连线主题
  useLinkConfig,    // 连线配置 hook
  linkDataManager,  // 连线数据管理器
  useI18n,          // 国际化 hook
  setLocale,        // 设置语言
  store,            // 全局状态
  mutations         // 状态修改方法
} from '@yourusername/vue3-gantt'
```

## 🎨 浏览器直接引入

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@yourusername/vue3-gantt/dist/vue3-gantt.css">
</head>
<body>
  <div id="app">
    <gantt :style-config="styleConfig" :data-config="dataConfig" :event-config="eventConfig"></gantt>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/dayjs"></script>
  <script src="https://unpkg.com/@yourusername/vue3-gantt/dist/vue3-gantt.umd.js"></script>
  
  <script>
    const { createApp } = Vue
    const { Gantt } = Vue3Gantt

    createApp({
      components: { Gantt },
      data() {
        return {
          styleConfig: { headersHeight: 100, rowHeight: 60 },
          dataConfig: { /* ... */ },
          eventConfig: { /* ... */ }
        }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

## 📋 依赖要求

使用此库的项目需要安装以下对等依赖:

```json
{
  "peerDependencies": {
    "vue": "^3.5.0",
    "dayjs": "^1.11.0",
    "@vueuse/core": "^13.0.0",
    "interactjs": "^1.10.0",
    "svg.js": "^2.7.0",
    "zod": "^3.24.0"
  }
}
```

## 🔧 TypeScript 支持

库已内置 TypeScript 类型定义,无需额外安装 `@types` 包。

在 TypeScript 项目中使用时,会自动获得完整的类型提示和检查。

## 📝 版本管理

建议遵循语义化版本规范(Semver):
- **主版本号(Major)**: 不兼容的 API 修改
- **次版本号(Minor)**: 向下兼容的功能新增
- **修订号(Patch)**: 向下兼容的问题修正

```bash
# 更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## 🐛 问题反馈

如有问题,请在 GitHub Issues 中反馈:
https://github.com/yourusername/vue3-gantt/issues

## 📄 许可证

MIT License
