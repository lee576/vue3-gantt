# Vue3 Gantt NPM 发布快速指南

## 📦 已完成的改造

你的 Vue3 甘特图组件已经成功改造为可发布的 npm 库!

### 新增文件

1. **src/index.ts** - 库入口文件,导出所有组件、类型和工具函数
2. **vite.config.ts** - 配置了库模式构建
3. **tsconfig.lib.json** - TypeScript 库构建配置
4. **.npmignore** - 发布时排除不必要的文件
5. **LICENSE** - MIT 许可证文件
6. **LIBRARY.md** - 库使用详细文档

### 修改的文件

1. **package.json** - 添加了库相关配置和导出字段

## 🚀 发布步骤

### 1. 修改包信息(首次发布前必做)

编辑 `package.json`:

```json
{
  "name": "@你的npm用户名/vue3-gantt",  // 改为你的用户名
  "author": "你的名字 <your.email@example.com>",
  "repository": {
    "url": "https://github.com/你的用户名/vue3-gantt.git"
  }
}
```

### 2. 构建库

```bash
npm run build:lib
```

构建成功后,`dist` 目录将包含:
- ✅ `vue3-gantt.es.js` - ES Module 格式
- ✅ `vue3-gantt.umd.js` - UMD 格式  
- ✅ `vue3-gantt.css` - 样式文件
- ✅ `index.d.ts` - TypeScript 类型声明

### 3. 测试本地安装(可选但推荐)

```bash
# 在当前项目
npm pack

# 在另一个测试项目中
npm install /path/to/yourusername-vue3-gantt-1.0.0.tgz
```

### 4. 登录 npm

```bash
npm login
# 输入用户名、密码、邮箱
```

### 5. 发布到 npm

```bash
# 首次发布或公开包
npm publish --access public

# 后续更新
npm version patch  # 1.0.0 -> 1.0.1
npm publish
```

## 📝 使用示例

### 安装

```bash
npm install @yourusername/vue3-gantt
```

### 使用

```vue
<template>
  <Gantt 
    :styleConfig="styleConfig" 
    :dataConfig="dataConfig" 
    :eventConfig="eventConfig"
  />
</template>

<script setup>
import { Gantt } from '@yourusername/vue3-gantt'
import '@yourusername/vue3-gantt/dist/vue3-gantt.css'

// 配置...
</script>
```

## 🎯 导出的API

### 组件
- `Gantt` - 主甘特图组件
- `DatePicker` - 日期选择器
- `GanttThemeSelector` - 主题选择器
- `LanguageSelector` - 语言选择器
- `GanttConfigPanel` - 配置面板
- `LinkConfigPanel` - 连线配置面板

### 类型定义
```typescript
import type {
  DataConfig,
  StyleConfig,
  EventConfig,
  TaskHeader,
  LinkConfig,
  TaskLink,
  TaskDependency,
  GanttTheme,
  Locale
} from '@yourusername/vue3-gantt'
```

### 枚举
```typescript
import { 
  LinkType,      // 连线类型
  LinkPathType   // 连线路径
} from '@yourusername/vue3-gantt'
```

### 工具函数
```typescript
import { 
  ganttThemes,      // 主题列表
  LinkThemes,       // 连线主题
  useLinkConfig,    // 连线配置 hook
  useI18n,          // 国际化 hook
  setLocale         // 设置语言
} from '@yourusername/vue3-gantt'
```

## 📚 更多文档

详细使用文档请查看:
- [LIBRARY.md](./LIBRARY.md) - 完整的库使用指南
- [README.md](./README.md) - 中文文档
- [README.en-US.md](./README.en-US.md) - 英文文档

## ⚠️ 注意事项

1. **包名规则**: 
   - npm 用户名包请用 `@username/package-name` 格式
   - 普通包名需要是唯一的,发布前先搜索是否已被占用

2. **版本管理**:
   - 遵循语义化版本(Semver): `major.minor.patch`
   - `npm version patch/minor/major` 自动更新版本并创建 git tag

3. **依赖管理**:
   - 核心依赖(vue, dayjs等)已配置为 `peerDependencies`
   - 用户安装你的包时需要自己安装这些依赖

4. **后续更新**:
   ```bash
   # 修改代码后
   npm run build:lib
   npm version patch  # 或 minor/major
   npm publish
   ```

## 🎉 完成!

现在你的 Vue3 甘特图组件已经可以发布到 npm 供全世界使用了!
