# 连线配置使用示例

## 快速开始

### 1. 基本使用

甘特图组件已经内置了连线配置功能，只需要在工具栏中点击"连线"按钮即可打开配置面板。

### 2. 配置面板功能

#### 路径类型选择
- **直线** - 适合简洁的项目视图
- **贝塞尔曲线** - 适合需要优雅视觉效果的场景
- **直角连线** - 适合需要清晰层次结构的项目

#### 样式配置
```typescript
// 基础样式配置示例
{
  color: '#3498db',        // 连线颜色
  width: 2,                // 线宽
  dashArray: '5,5',        // 虚线样式
  showArrow: true,         // 显示箭头
  arrowSize: 8             // 箭头大小
}
```

#### 路径特定配置

**贝塞尔曲线配置：**
```typescript
{
  pathType: 'bezier',
  bezierCurvature: 0.4     // 弯曲度 (0.1-1.0)
}
```

**直角连线配置：**
```typescript
{
  pathType: 'right-angle',
  rightAngleOffset: 30,    // 偏移距离
  smoothCorners: true,     // 平滑转角
  cornerRadius: 5          // 转角半径
}
```

### 3. 程序化使用

```typescript
import { useLinkConfig, LinkPathType } from './LinkConfig';

// 在组件中使用
export default {
  setup() {
    const { 
      config, 
      updateConfig, 
      setTheme, 
      exportConfig, 
      importConfig 
    } = useLinkConfig();
    
    // 切换到商务主题
    const applyBusinessTheme = () => {
      setTheme('business');
    };
    
    // 自定义配置
    const customizeLinks = () => {
      updateConfig({
        pathType: LinkPathType.BEZIER,
        color: '#e74c3c',
        width: 3,
        bezierCurvature: 0.6,
        showArrow: true,
        arrowSize: 12
      });
    };
    
    // 导出当前配置
    const exportCurrentConfig = () => {
      const configJson = exportConfig();
      console.log('当前配置:', configJson);
      // 可以保存到文件或发送到服务器
    };
    
    return {
      config,
      applyBusinessTheme,
      customizeLinks,
      exportCurrentConfig
    };
  }
};
```

### 4. 主题使用示例

#### 默认主题（贝塞尔曲线）
```typescript
setTheme('default');
// 适合：一般项目管理，平衡的视觉效果
```

#### 商务主题（直角连线）
```typescript
setTheme('business');
// 适合：企业级项目，正式的汇报场景
```

#### 现代主题（高弯曲度曲线）
```typescript
setTheme('modern');
// 适合：创意项目，需要时尚视觉效果
```

#### 简约主题（直线）
```typescript
setTheme('minimal');
// 适合：简单项目，注重性能的场景
```

#### 彩色主题（多彩直角）
```typescript
setTheme('colorful');
// 适合：教育培训，需要丰富视觉层次
```

### 5. 配置导入导出

#### 导出配置
```typescript
const { exportConfig } = useLinkConfig();

const saveConfig = () => {
  const configJson = exportConfig();
  
  // 方法1：复制到剪贴板
  navigator.clipboard.writeText(configJson);
  
  // 方法2：下载为文件
  const blob = new Blob([configJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gantt-link-config.json';
  a.click();
};
```

#### 导入配置
```typescript
const { importConfig } = useLinkConfig();

const loadConfig = (configJson: string) => {
  const success = importConfig(configJson);
  if (success) {
    console.log('配置导入成功');
  } else {
    console.error('配置格式错误');
  }
};

// 从文件导入
const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const configJson = e.target?.result as string;
      loadConfig(configJson);
    };
    reader.readAsText(file);
  }
};
```

### 6. 实际项目集成

#### Vue 3 项目
```vue
<template>
  <div class="project-gantt">
    <Gantt 
      :styleConfig="styleConfig"
      :dataConfig="dataConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Gantt from './components/gantt/Gantt.vue';
import { useLinkConfig } from './components/gantt/LinkConfig';

// 甘特图配置
const styleConfig = ref({
  headersHeight: 100,
  rowHeight: 60,
  setBarColor: (row: any) => '#3498db'
});

const dataConfig = ref({
  dataSource: [], // 你的任务数据
  taskHeaders: [], // 表头配置
  mapFields: {} // 字段映射
});

const eventConfig = ref({
  // 事件处理函数
});

// 连线配置
const { setTheme } = useLinkConfig();

onMounted(() => {
  // 应用适合项目的主题
  setTheme('business');
});
</script>
```

### 7. 性能优化建议

#### 大量任务时的优化
```typescript
// 在大量任务场景下，可以考虑：
const optimizeForLargeDataset = () => {
  updateConfig({
    pathType: LinkPathType.STRAIGHT, // 直线性能最好
    showLabels: false,               // 关闭标签减少渲染
    showArrow: false                 // 关闭箭头减少渲染
  });
};
```

#### 移动设备优化
```typescript
// 移动设备上的优化配置
const optimizeForMobile = () => {
  updateConfig({
    width: 1,                        // 较细的线条
    arrowSize: 6,                    // 较小的箭头
    rightAngleOffset: 20,            // 较小的偏移
    smoothCorners: false             // 关闭圆角提升性能
  });
};
```

### 8. 故障排除

#### 常见问题

**Q: 连线不显示？**
A: 检查任务数据是否包含正确的父子关系字段，确保 `parentId` 字段正确设置。

**Q: 配置不生效？**
A: 确保在配置更新后触发了重新渲染，可以尝试切换主题或重新加载页面。

**Q: 性能问题？**
A: 在大量任务时使用直线类型，关闭不必要的视觉效果如标签和箭头。

**Q: 导入配置失败？**
A: 检查JSON格式是否正确，确保包含所有必需的配置字段。

### 9. 自定义扩展

#### 添加自定义主题
```typescript
// 在 LinkConfig.ts 中扩展
export const CustomThemes = {
  myTheme: {
    color: '#your-brand-color',
    width: 2,
    pathType: LinkPathType.BEZIER,
    bezierCurvature: 0.3,
    showArrow: true,
    arrowSize: 10,
    // ... 其他配置
  }
};

// 使用自定义主题
const applyCustomTheme = () => {
  updateConfig(CustomThemes.myTheme);
};
```

#### 动态配置
```typescript
// 根据项目状态动态调整连线样式
const updateLinksBasedOnStatus = (projectStatus: string) => {
  switch (projectStatus) {
    case 'planning':
      updateConfig({
        color: '#f39c12',
        dashArray: '3,3'
      });
      break;
    case 'active':
      updateConfig({
        color: '#27ae60',
        dashArray: undefined
      });
      break;
    case 'delayed':
      updateConfig({
        color: '#e74c3c',
        width: 3
      });
      break;
  }
};
```

这些示例展示了连线配置功能的各种使用方式，可以根据具体项目需求进行调整和扩展。