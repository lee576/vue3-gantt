<template>
    <div class="header">
      <template v-for='(item, index) in headers' :key="index">
        <div 
          :property='item.property' 
          :columnindex='index' 
          v-show="item.show" 
          class="headerCaption"
          :style="{ width: `${item.width}px` }"
        >
          <span>{{ getHeaderTitle(item) }}</span>
          <!-- 列宽调整拖动手柄 -->
          <!-- 序号列（property='no'）始终显示拖动手柄，其他列只有在显示时才显示 -->
          <div 
            v-if="(item.property === 'no' || item.show) && index < headers.length - 1"
            class="resize-handle"
            @mousedown="startResize($event, index)"
          ></div>
        </div>
      </template>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useI18n } from '../i18n';

  export default defineComponent({
    props: {
      headers: {
        type: Array as () => {
          property: string;
          show: boolean;
          width: number;
          title: string;
        }[],
        required: true
      }
    },
    setup(props) {
      const { t } = useI18n();
      
      // 拖动调整状态
      const resizing = ref(false);
      const resizingIndex = ref(-1);
      const startX = ref(0);
      const startWidth = ref(0);
      const currentHeaderElement = ref<HTMLElement | null>(null);
      
      // 根据 property 获取翻译后的标题
      const getHeaderTitle = (header: { property: string; title: string }) => {
        const propertyMap: Record<string, string> = {
          'no': 'task.serialNumber',
          'task': 'task.name',
          'priority': 'task.priority',
          'startdate': 'task.startDate',
          'enddate': 'task.endDate',
          'takestime': 'task.duration',
          'progress': 'task.progress',
          'id': 'ID',
          'parentId': 'Parent ID'
        };
        
        const translationKey = propertyMap[header.property];
        if (translationKey) {
          if (translationKey.includes('.')) {
            return t(translationKey);
          }
          return translationKey;
        }
        return header.title;
      };
      
      // 开始拖动调整列宽
      const startResize = (event: MouseEvent, index: number) => {
        event.preventDefault();
        event.stopPropagation();
        
        resizing.value = true;
        resizingIndex.value = index;
        startX.value = event.clientX;
        startWidth.value = props.headers[index].width;
        
        // 获取当前列的 DOM 元素
        const target = event.target as HTMLElement;
        currentHeaderElement.value = target.closest('.headerCaption') as HTMLElement;
        
        // 添加全局鼠标移动和释放事件
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        
        // 添加禁止选择的样式
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      };
      
      // 处理鼠标移动 - 使用 requestAnimationFrame 优化性能
      let rafId: number | null = null;
      const handleMouseMove = (event: MouseEvent) => {
        if (!resizing.value || resizingIndex.value < 0) return;
        
        event.preventDefault();
        
        // 取消之前的动画帧
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        
        // 使用 requestAnimationFrame 确保流畅更新
        rafId = requestAnimationFrame(() => {
          const deltaX = event.clientX - startX.value;
          const newWidth = Math.max(50, startWidth.value + deltaX);
          
          // 直接设置 DOM 样式，避免 Vue 响应式更新延迟
          if (currentHeaderElement.value) {
            currentHeaderElement.value.style.width = `${newWidth}px`;
          }
          
          // 同时更新对应的内容列
          const contentCells = document.querySelectorAll(
            `.cellNo[columnindex="${resizingIndex.value}"], .cell[columnindex="${resizingIndex.value}"]`
          );
          contentCells.forEach((cell) => {
            (cell as HTMLElement).style.minWidth = `${newWidth}px`;
            (cell as HTMLElement).style.maxWidth = `${newWidth}px`;
          });
          
          rafId = null;
        });
      };
      
      // 处理鼠标释放
      const handleMouseUp = () => {
        if (!resizing.value) return;
        
        // 取消未完成的动画帧
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        
        // 计算最终宽度并更新到 props
        if (currentHeaderElement.value && resizingIndex.value >= 0) {
          const finalWidth = parseInt(currentHeaderElement.value.style.width);
          props.headers[resizingIndex.value].width = finalWidth;
        }
        
        resizing.value = false;
        resizingIndex.value = -1;
        currentHeaderElement.value = null;
        
        // 移除全局事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 恢复样式
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      
      return {
        getHeaderTitle,
        startResize
      };
    }
  });
  </script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  
  .headerCaption {
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--text-primary, #333333);
    font-size: 14px;
    font-weight: 600;
    box-sizing: border-box;
    letter-spacing: 0.5px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    transition: all var(--transition-fast, 0.15s ease);
    flex-shrink: 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      /* 移除顶部边框，因为 Gantt.vue toolbar 已经提供了 border-bottom */
      /* 底部边框由 TaskTable 的 .header 提供，避免重叠 */
      pointer-events: none;
    }
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 0;
      bottom: 0;
      background: var(--border, #d0d0d0);
      border-left: 1px solid var(--border, #d0d0d0);
    }
    
    &:first-child::before {
      border-left: 1px solid var(--border, #d0d0d0);
    }

    &:last-child::before {
      border-right: 1px solid var(--border, #d0d0d0);
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
    }

    // 列宽调整拖动手柄
    .resize-handle {
      position: absolute;
      right: -4px;
      top: 0;
      bottom: 0;
      width: 8px;
      cursor: col-resize;
      z-index: 10;
      background: transparent;
      transition: background 0.2s ease;

      &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 60%;
        background: transparent;
        transition: background 0.2s ease;
      }

      &:hover {
        background: rgba(51, 112, 255, 0.1);

        &::before {
          background: var(--primary, #3370ff);
        }
      }

      &:active {
        background: rgba(51, 112, 255, 0.15);
      }
    }
  }
}
</style>