# 开发指南

## 代码质量工具

本项目已配置 ESLint、Prettier 和 Vitest，确保代码质量和可维护性。

### ESLint

ESLint 用于检查代码质量和潜在错误。

```bash
# 运行 ESLint 并自动修复问题
npm run lint

# 仅检查不修复
npx eslint .
```

### Prettier

Prettier 用于统一代码格式。

```bash
# 格式化所有源代码
npm run format

# 格式化特定文件
npx prettier --write src/components/gantt/
```

### TypeScript 类型检查

```bash
# 运行 TypeScript 类型检查
npm run typecheck
```

## 测试

项目使用 Vitest 作为测试框架。

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm test -- --watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试 UI（可视化测试界面）
npm run test:ui
```

### 编写测试

测试文件应放在 `src/test/` 目录下，并以 `.test.ts` 或 `.spec.ts` 结尾。

示例：

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../utils/myFunction'

describe('myFunction', () => {
  it('应该返回正确的结果', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })
})
```

## 构建优化

生产构建时会自动移除所有 console 语句（通过 vite-plugin-remove-console）。

## 开发工作流

推荐的开发工作流：

1. 编写代码
2. 运行 `npm run lint` 检查代码质量
3. 运行 `npm run format` 格式化代码
4. 运行 `npm run typecheck` 检查类型
5. 运行 `npm test` 运行测试
6. 提交代码

## Git Hooks（可选）

可以使用 Husky 和 lint-staged 在提交前自动运行检查：

```bash
npm install -D husky lint-staged
npx husky init
```

然后在 `.husky/pre-commit` 中添加：

```bash
npx lint-staged
```

在 `package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```
