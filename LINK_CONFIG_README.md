# 甘特图连线配置功能

## 概述

本功能为甘特图组件添加了强大的连线配置系统，支持多种路径类型和丰富的样式自定义选项。

## 主要特性

### 🎨 路径类型
- **直线连接** (`LinkPathType.STRAIGHT`) - 简洁直接的直线连接
- **贝塞尔曲线** (`LinkPathType.BEZIER`) - 平滑优雅的曲线连接
- **直角连线** (`LinkPathType.RIGHT_ANGLE`) - 清晰规整的直角连接

### ⚙️ 样式配置
- 颜色自定义（支持色彩选择器）
- 线宽调节（1-5px）
- 虚线样式（实线、短虚线、中虚线、长虚线、点划线）
- 箭头配置（显示/隐藏、大小、颜色）

### 🎯 高级选项
- **贝塞尔弯曲度** - 控制曲线的弯曲程度（0.1-1.0）
- **直角偏移距离** - 控制直角连线的偏移距离（10-80px）
- **平滑转角** - 为直角连线添加圆角效果
- **转角半径** - 控制圆角的大小（0-15px）

### 🏷️ 标签和父子样式
- 连线标签显示控制
- 标签颜色和字体大小配置
- 父子关系连线独立样式配置

### 🎭 预设主题
- **默认主题** - 平衡的贝塞尔曲线风格
- **商务主题** - 专业的直角连线风格
- **现代主题** - 时尚的高弯曲度曲线
- **简约主题** - 极简的直线风格
- **彩色主题** - 丰富多彩的视觉效果

## 文件结构

```
src/components/gantt/
├── LinkConfig.ts           # 连线配置管理和主题定义
├── LinkConfigPanel.vue     # 连线配置面板组件
├── TaskLinks.vue          # 连线渲染组件（已更新）
├── Gantt.vue             # 主甘特图组件（已更新）
└── RightTable.vue        # 右侧表格组件（已更新）
```

## 使用方法

### 1. 基本使用

在甘特图工具栏中点击"连线"按钮即可打开配置面板：

```vue
<template>
  <Gantt 
    :styleConfig="styleConfig"
    :dataConfig="dataConfig" 
    :eventConfig="eventConfig"
  />
</template>
```

### 2. 程序化配置

```typescript
import { useLinkConfig, LinkPathType } from './LinkConfig';

const { config, updateConfig, setTheme } = useLinkConfig();

// 更新路径类型
updateConfig({ pathType: LinkPathType.RIGHT_ANGLE });

// 应用主题
setTheme('business');

// 自定义配置
updateConfig({
  color: '#e74c3c',
  width: 3,
  pathType: LinkPathType.BEZIER,
  bezierCurvature: 0.6,
  showArrow: true,
  arrowSize: 12
});
```

### 3. 配置导入导出

```typescript
const { exportConfig, importConfig } = useLinkConfig();

// 导出配置
const configJson = exportConfig();
console.log(configJson);

// 导入配置
const success = importConfig(configJson);
if (success) {
  console.log('配置导入成功');
}
```

## 配置选项详解

### LinkConfig 接口

```typescript
interface LinkConfig {
  // 基础样式
  color: string;                    // 连线颜色
  width: number;                    // 连线宽度
  dashArray?: string;               // 虚线样式
  
  // 路径配置
  pathType: LinkPathType;           // 路径类型
  bezierCurvature: number;          // 贝塞尔弯曲度
  rightAngleOffset: number;         // 直角偏移距离
  smoothCorners: boolean;           // 是否平滑转角
  cornerRadius: number;             // 转角半径
  
  // 箭头配置
  showArrow: boolean;               // 显示箭头
  arrowColor?: string;              // 箭头颜色
  arrowSize: number;                // 箭头大小
  
  // 标签配置
  showLabels: boolean;              // 显示标签
  labelColor: string;               // 标签颜色
  labelFontSize: number;            // 标签字体大小
  
  // 父子关系样式
  parentChildStyle: {
    color: string;
    width: number;
    dashArray?: string;
  };
}
```

### 路径类型枚举

```typescript
enum LinkPathType {
  STRAIGHT = 'straight',        // 直线
  BEZIER = 'bezier',           // 贝塞尔曲线
  RIGHT_ANGLE = 'right-angle'   // 直角连线
}
```

## 连线类型支持

系统支持以下连线类型：

1. **父子关系** (`PARENT_CHILD`) - 显示任务层级结构
2. **完成-开始** (`FINISH_TO_START`) - 前置任务完成后开始
3. **开始-开始** (`START_TO_START`) - 两个任务同时开始
4. **完成-完成** (`FINISH_TO_FINISH`) - 两个任务同时完成
5. **开始-完成** (`START_TO_FINISH`) - 前置任务开始后完成

## 技术特性

### 性能优化
- 使用 `requestAnimationFrame` 优化重绘性能
- 智能的DOM变化监听，只在必要时更新连线
- 路径计算缓存，避免重复计算

### 响应式设计
- 支持不同屏幕尺寸
- 配置面板自适应布局
- 触摸设备友好的交互

### 数据持久化
- 配置自动保存到 `localStorage`
- 支持配置的导入导出
- 主题切换即时生效

### 可扩展性
- 模块化的配置管理
- 易于添加新的路径类型
- 主题系统支持自定义扩展

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发说明

### 添加新主题

```typescript
// 在 LinkConfig.ts 中添加新主题
export const LinkThemes = {
  // ... 现有主题
  
  myCustomTheme: {
    color: '#your-color',
    width: 2,
    pathType: LinkPathType.BEZIER,
    bezierCurvature: 0.5,
    // ... 其他配置
  }
};
```

### 添加新路径类型

1. 在 `LinkPathType` 枚举中添加新类型
2. 在 `generateConnectionPath` 函数中添加处理逻辑
3. 在配置面板中添加预览SVG

### 自定义连线逻辑

可以通过修改 `TaskLinks.vue` 中的路径生成函数来自定义连线行为：

```typescript
// 自定义路径生成函数
const generateCustomPath = (startX, startY, endX, endY) => {
  // 你的自定义路径逻辑
  return `M ${startX} ${startY} L ${endX} ${endY}`;
};
```

## 测试

运行测试页面查看功能演示：

```bash
# 在浏览器中打开
open test-link-config.html
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持三种路径类型
- 完整的配置面板
- 五个预设主题
- 配置导入导出功能

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个功能。

## 许可证

MIT License