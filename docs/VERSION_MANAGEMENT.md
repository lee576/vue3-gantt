# 版本管理说明

本项目使用自动化脚本来同步 `package.json` 和 `src/index.ts` 中的版本号。

## 如何更新版本

### 方法 1：使用 npm version 命令（推荐）

使用 npm 的内置版本管理命令，会自动同步版本号并创建 git commit 和 tag：

```bash
# 修复版本（1.1.0 -> 1.1.1）
npm version patch

# 次要版本（1.1.0 -> 1.2.0）
npm version minor

# 主要版本（1.1.0 -> 2.0.0）
npm version major
```

**工作流程：**
1. `npm version` 更新 `package.json` 中的版本号
2. `postversion` 钩子自动运行，同步版本号到 `src/index.ts`
3. 自动将更改添加到 git commit 中
4. 创建版本 tag

### 方法 2：手动同步版本号

如果你手动修改了 `package.json` 中的版本号，运行：

```bash
npm run sync-version
```

这会读取 `package.json` 的版本号并更新到 `src/index.ts`。

## 发布流程

完整的发布流程：

```bash
# 1. 确保所有更改已提交
git status

# 2. 更新版本号（自动同步并创建 tag）
npm version patch  # 或 minor/major

# 3. 推送代码和 tag
git push && git push --tags

# 4. 发布到 npm
npm publish
```

## 版本号规范

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号 (MAJOR)**：不兼容的 API 修改
- **次版本号 (MINOR)**：向下兼容的功能性新增
- **修订号 (PATCH)**：向下兼容的问题修正

## 脚本说明

### sync-version.js

位置：`scripts/sync-version.js`

功能：
- 从 `package.json` 读取版本号
- 更新 `src/index.ts` 中的 `export const version` 声明
- 提供详细的执行日志

### package.json 钩子

- `postversion`: 在 `npm version` 命令执行后自动运行版本同步脚本
- `prepublishOnly`: 在发布前自动构建库文件

## 注意事项

1. **不要手动修改** `src/index.ts` 中的版本号，始终以 `package.json` 为准
2. 使用 `npm version` 命令时会自动创建 git commit，确保工作区是干净的
3. 如果不想创建 git commit，可以使用 `--no-git-tag-version` 选项：
   ```bash
   npm version patch --no-git-tag-version
   npm run sync-version
   ```

## 验证

检查版本号是否同步：

```bash
# 查看 package.json 版本
npm version

# 查看 src/index.ts 版本
grep "export const version" src/index.ts
```
