# 甘特图多语言功能快速指南

## 功能概述

甘特图组件现已支持**中文（简体）**和**英文**双语切换功能。

## 如何使用

### 1. 切换语言

在甘特图工具栏的右上角，配置按钮旁边，您会看到一个语言选择器：

- 点击语言选择器
- 从下拉菜单中选择您想要的语言
- 界面立即切换到所选语言
- 您的选择会自动保存，下次打开时会记住您的设置

### 2. 支持的语言

- 🇨🇳 **简体中文** (zh-CN)
- 🇺🇸 **English** (en-US)

### 3. 已翻译的界面元素

#### 工具栏
- 日期选择器（"至" / "to"）
- 视图模式按钮：月/周/日/时
- 连线图例和所有连线类型（FS、SS、FF、SF、PC）

#### 配置面板
- 甘特图配置标题
- 主题设置选项
- 连线配置所有选项
- 所有按钮和标签

#### 任务管理
- 任务表头（序号、任务名称、优先级、开始时间、结束时间、耗时）
- 操作提示（添加子任务、删除任务等）

#### 日期选择器
- 星期显示
- 月份显示
- 操作按钮

## 开发者指南

### 在代码中使用翻译

```vue
<script setup>
import { useI18n } from './components/gantt/i18n';

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <button>{{ t('common.confirm') }}</button>
  </div>
</template>
```

### 添加新的翻译

1. 在 `src/components/gantt/i18n/locales/zh-CN.ts` 添加中文
2. 在 `src/components/gantt/i18n/locales/en-US.ts` 添加英文

### 程序化切换语言

```typescript
import { setLocale } from './components/gantt/i18n';

// 切换到英文
setLocale('en-US');

// 切换到中文
setLocale('zh-CN');
```

## 文件结构

```
src/components/gantt/
├── i18n/
│   ├── index.ts          # 核心i18n系统
│   └── locales/
│       ├── zh-CN.ts      # 中文语言包
│       └── en-US.ts      # 英文语言包
├── LanguageSelector.vue  # 语言切换器组件
└── ...其他组件...
```

## 特性

✅ **即时切换** - 点击即可切换语言，无需刷新页面  
✅ **自动保存** - 语言选择自动保存到浏览器  
✅ **完整翻译** - 所有界面文本都已翻译  
✅ **类型安全** - TypeScript 提供完整类型支持  
✅ **易于扩展** - 可轻松添加更多语言

## 故障排除

### 语言没有切换？
- 检查浏览器控制台是否有错误
- 清除浏览器缓存并刷新页面
- 确保语言包文件正确加载

### 部分文本未翻译？
- 可能是新添加的功能还未添加翻译
- 请参考语言包文件添加对应的翻译键

### 如何重置为默认语言？
- 清除浏览器的 localStorage
- 或在开发者工具中删除 `gantt-locale` 项

## 贡献

欢迎贡献新的语言翻译！

1. Fork 项目
2. 创建新的语言文件（如 `ja-JP.ts` for 日语）
3. 翻译所有文本
4. 在 `i18n/index.ts` 中注册新语言
5. 提交 Pull Request

## 许可

与主项目相同的许可证。
