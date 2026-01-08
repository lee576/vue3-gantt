# Trae Rules for Vue3 Gantt Project

## Project Overview

这是一个功能强大的 Vue3 甘特图组件库，支持任务依赖、多种视图模式、主题和国际化。

## Technology Stack

- **框架**: Vue 3.5+ with Composition API
- **语言**: TypeScript 5.7+
- **包管理器**: pnpm
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 4 + CSS
- **测试**: Vitest 2
- **代码规范**: ESLint 9 + Prettier 3

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本（包含类型检查） |
| `pnpm build:lib` | 构建库版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm lint` | 检查并修复代码规范问题 |
| `pnpm format` | 格式化代码 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:ui` | 运行测试（UI 模式） |
| `pnpm test:coverage` | 运行测试并生成覆盖率报告 |

## Code Conventions

### 组件规范

- 使用 `<script setup lang="ts">` 语法
- 组件文件使用 PascalCase 命名（如 `GanttConfig.vue`）
- 组合式函数使用 use 前缀（如 `useGanttClass.ts`）
- 工具函数使用 camelCase 命名

### TypeScript 规范

- 严格模式开启
- 使用 Zod 进行运行时验证
- 类型定义放在 `types/` 目录
- 组件 Props 使用 TypeScript 类型定义

### CSS 规范

- 组件样式使用 scoped
- 优先使用 Tailwind CSS  utility classes
- 自定义 CSS 放在 `gantt.css` 文件

### Git 提交规范

- 使用 Conventional Commits 格式
- feat: 新功能
- fix: Bug 修复
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建或辅助工具更新

## Build Configuration

- **入口**: `src/main.ts`
- **类型导出**: `src/index.ts`
- **库构建**: 使用 `vite-plugin-dts` 生成类型声明
- **产物**: 
  - ES Module: `dist/vue3-gantt.es.js`
  - UMD: `dist/vue3-gantt.umd.js`
  - CSS: `dist/vue3-gantt.css`

## Testing Requirements

- 测试文件放在 `src/test/` 目录
- 使用 `vitest.config.ts` 配置
- 组件使用 `@vue/test-utils` 进行测试
- 每次提交前应运行测试确保通过

## Quality Gates

在提交代码前确保：

1. ✅ `pnpm lint` 通过
2. ✅ `pnpm typecheck` 通过
3. ✅ `pnpm test` 通过
4. ✅ `pnpm build` 成功

## AI Assistant Guidelines

### 当用户要求实现新功能时

1. 首先理解需求并确认理解正确
2. 检查现有代码结构和模式
3. 遵循组件规范和代码风格
4. 编写适当的测试
5. 运行质量检查命令

### 当用户要求修复 Bug 时

1. 复现问题并理解根本原因
2. 编写或更新测试用例以捕获问题
3. 修复问题并验证
4. 确保测试通过

### 当用户要求重构代码时

1. 理解代码的当前实现和目的
2. 保持 API 兼容性（如果是公开 API）
3. 逐步重构并确保测试通过
4. 更新相关文档

## Import Order

在 Vue 组件中，import 按以下顺序排列：

1. Vue 框架导入（vue）
2. 第三方库导入
3. 内部工具/类型导入
4. 组件导入
5. 样式导入

## Performance Considerations

- 使用虚拟滚动处理大数据集
- Web Worker 用于复杂计算
- 按需加载功能模块
- 避免不必要的响应式转换

## Internationalization

- i18n 文件放在 `src/locales/` 和 `src/components/gantt/i18n/locales/`
- 支持多种语言：en-US, zh-CN, zh-TW, ja-JP, ko-KR, de-DE, es-ES, fr-FR, ru-RU
- 新功能需要添加多语言支持
