<template>
  <svg 
    class="task-links-layer" 
    :width="containerWidth" 
    :height="containerHeight"
    :style="{ 
      position: 'absolute', 
      top: '0px', 
      left: '0px', 
      pointerEvents: 'none',
      zIndex: 50,
      overflow: 'visible'
    }"
  >
    <!-- 渲染所有连线 -->
    <g v-for="link in links" :key="link.id">
      <!-- 连线路径 -->
      <path
        :d="link.path"
        :stroke="getLinkStyle(link.type).color"
        :stroke-width="getLinkStyle(link.type).width"
        :stroke-dasharray="getLinkStyle(link.type).dashArray"
        fill="none"
        :class="['task-link', link.type]"
      />
      
      <!-- 箭头 -->
      <polygon
        v-if="linkConfig.showArrow && link.arrowPoints && link.arrowPoints.length > 0"
        :points="link.arrowPoints"
        :fill="getLinkStyle(link.type).color"
        :stroke="getLinkStyle(link.type).color"
        :stroke-width="0.5"
        class="task-link-arrow"
      />
      

      
      <!-- 连线标签（可选） -->
      <text
        v-if="link.label && linkConfig.showLabels"
        :x="link.labelX"
        :y="link.labelY"
        :fill="linkConfig.labelColor"
        :font-size="linkConfig.labelFontSize"
        text-anchor="middle"
        class="task-link-label"
      >
        {{ link.label }}
      </text>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, watch, ref, onMounted, onUnmounted } from 'vue';
import { store } from './Store';

// 连线类型枚举
export enum LinkType {
  FINISH_TO_START = 'finish-to-start',  // 完成-开始（最常用）
  START_TO_START = 'start-to-start',    // 开始-开始
  FINISH_TO_FINISH = 'finish-to-finish', // 完成-完成
  START_TO_FINISH = 'start-to-finish',   // 开始-完成
  PARENT_CHILD = 'parent-child'          // 父子关系
}

// 连线配置接口
export interface LinkConfig {
  color: string;
  width: number;
  dashArray?: string;
  showArrow: boolean;
  arrowColor?: string;
  arrowSize: number;
  showLabels: boolean;
  labelColor: string;
  labelFontSize: number;
  cornerRadius: number;
  parentChildStyle: {
    color: string;
    width: number;
    dashArray?: string;
  };
}

// 连线数据接口
export interface TaskLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: LinkType;
  label?: string;
  path: string;
  arrowPoints: string;
  labelX: number;
  labelY: number;
}

export default defineComponent({
  name: 'TaskLinks',
  props: {
    containerWidth: {
      type: Number,
      required: true
    },
    containerHeight: {
      type: Number,
      required: true
    },
    linkConfig: {
      type: Object as () => LinkConfig,
      default: () => ({
        color: '#3498db',
        width: 2,
        dashArray: undefined,
        showArrow: true,
        arrowColor: undefined,
        arrowSize: 8,
        showLabels: false,
        labelColor: '#666',
        labelFontSize: 12,
        cornerRadius: 5,
        parentChildStyle: {
          color: '#95a5a6',
          width: 1,
          dashArray: '3,3'
        }
      })
    }
  },
  setup(props) {
    const links = ref<TaskLink[]>([]);
    
    // 获取任务位置信息
    const getTaskPosition = (taskId: string) => {
      const task = store.tasks.find(t => t[store.mapFields.id] === taskId);
      if (!task) return null;
      
      // 查找对应的DOM元素 - 查找barRow而不是bar
      const barElement = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
      if (!barElement) return null;
      
      // 查找SVG bar元素获取实际位置
      const svgBar = barElement.querySelector('.bar') as SVGSVGElement;
      if (!svgBar) return null;
      
      // 获取容器 - 使用更精确的选择器
      const rightTableContent = barElement.closest('.table .content') as HTMLElement;
      if (!rightTableContent) return null;
      
      const containerRect = rightTableContent.getBoundingClientRect();
      const barRect = svgBar.getBoundingClientRect();
      
      // 获取SVG的transform属性
      const dataX = parseFloat(svgBar.getAttribute('data-x') || '0');
      const barWidth = svgBar.width.baseVal.value;
      
      // 计算相对于content容器的位置
      const relativeY = barRect.top - containerRect.top;
      
      return {
        x: dataX,
        y: relativeY,
        width: barWidth,
        height: barRect.height,
        centerX: dataX + barWidth / 2,
        centerY: relativeY + barRect.height / 2,
        rightX: dataX + barWidth,
        leftX: dataX,
        topY: relativeY,
        bottomY: relativeY + barRect.height
      };
    };
    
    // 获取父任务的子任务索引（用于计算偏移）
    const getChildIndex = (parentId: string, childId: string): number => {
      const siblings = store.tasks.filter(task => 
        task[store.mapFields.parentId] === parentId && 
        task[store.mapFields.parentId] !== '0'
      );
      return siblings.findIndex(task => task[store.mapFields.id] === childId);
    };
    

    
    // 获取行高（从DOM或props中获取）
    const getRowHeight = (): number => {
      // 尝试从第一个barRow元素获取高度
      const firstBarRow = document.querySelector('.barRow') as HTMLElement;
      if (firstBarRow) {
        return firstBarRow.offsetHeight;
      }
      // 默认行高
      return 50;
    };
    
    // 将Y坐标对齐到最近的单元格中心线
    const alignToGridCenter = (y: number): number => {
      const rowHeight = getRowHeight();
      const rowIndex = Math.floor(y / rowHeight);
      return rowIndex * rowHeight + rowHeight / 2;
    };
    
    // 根据子任务索引获取对应行的中心线位置（只能向下）
    const getChildRowCenter = (parentY: number, childIndex: number): number => {
      const rowHeight = getRowHeight();
      // 从父任务下方开始，第一个子任务在第一行，第二个在第二行，以此类推
      const parentRowIndex = Math.floor(parentY / rowHeight);
      const targetRowIndex = parentRowIndex + 1 + childIndex;
      return targetRowIndex * rowHeight + rowHeight / 2;
    };
    
    // 确保绕行路径只能向下（不能高过父任务）
    const getSafeBypassY = (parentY: number, childY: number, gap: number): number => {
      const rowHeight = getRowHeight();
      const parentBottomY = Math.floor(parentY / rowHeight) * rowHeight + rowHeight;
      const minBypassY = parentBottomY + gap;
      
      // 如果子任务在父任务下方很远，可以选择一个中间位置
      if (childY > minBypassY + rowHeight) {
        return alignToGridCenter(minBypassY + rowHeight / 2);
      }
      
      return alignToGridCenter(minBypassY);
    };
    
    // 获取特定连线类型的样式
    const getLinkStyle = (linkType: LinkType) => {
      if (linkType === LinkType.PARENT_CHILD) {
        return {
          color: props.linkConfig.parentChildStyle.color,
          width: props.linkConfig.parentChildStyle.width,
          dashArray: props.linkConfig.parentChildStyle.dashArray
        };
      }
      
      return {
        color: props.linkConfig.color,
        width: props.linkConfig.width,
        dashArray: props.linkConfig.dashArray
      };
    };
    
    // 生成连线路径
    const generateLinkPath = (source: any, target: any, linkType: LinkType, linkId: string = ''): string => {
      if (!source || !target) return '';
      
      const { cornerRadius } = props.linkConfig;
      
      switch (linkType) {
        case LinkType.PARENT_CHILD:
          return generateParentChildPath(source, target, cornerRadius, linkId);
        case LinkType.FINISH_TO_START:
          return generateFinishToStartPath(source, target, cornerRadius);
        case LinkType.START_TO_START:
          return generateStartToStartPath(source, target, cornerRadius);
        case LinkType.FINISH_TO_FINISH:
          return generateFinishToFinishPath(source, target, cornerRadius);
        case LinkType.START_TO_FINISH:
          return generateStartToFinishPath(source, target, cornerRadius);
        default:
          return generateFinishToStartPath(source, target, cornerRadius);
      }
    };
    
    // 父子关系连线路径（从父任务左边缘到子任务左边缘）
    const generateParentChildPath = (parent: any, child: any, _radius: number, _linkId: string): string => {
      const parentId = parent.id || parent.taskId;
      const childId = child.id || child.taskId;
      
      // 获取子任务在兄弟任务中的索引
      const childIndex = getChildIndex(parentId, childId);
      
      // 起点：父任务左边缘中心
      const startX = parent.leftX;
      const startY = parent.centerY;
      
      // 终点：子任务左边缘
      const endX = child.leftX;
      const endY = child.centerY;
      
      // 简化的分布策略：每个子任务使用不同的垂直偏移
      const verticalOffset = childIndex * 3; // 轻微的垂直偏移避免重叠
      
      const adjustedStartY = startY + verticalOffset;
      const adjustedEndY = endY + verticalOffset;
      
      // 使用简单优雅的路径，传递子任务索引用于行对齐
      return generateParentToChildPath(startX, adjustedStartY, endX, adjustedEndY, childIndex);
    };
    
    // 生成从父任务到子任务的连线路径（水平方向，对齐到行中心）
    const generateParentToChildPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      childIndex: number
    ): string => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 如果距离很近，直接连线
      if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 15) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      // 计算该子任务应该对齐的行中心位置
      const targetRowCenter = getChildRowCenter(startY, childIndex);
      
      // 如果子任务在父任务的右侧（正常情况）
      if (deltaX > 0) {
        // 如果垂直距离较小，使用简单的S曲线
        if (Math.abs(deltaY) < getRowHeight() / 2) {
          const cp1X = startX + Math.abs(deltaX) * 0.4;
          const cp2X = endX - Math.abs(deltaX) * 0.4;
          return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
        }
        
        // 垂直距离较大，使用直角路径通过行中心线（确保只向下）
        const midX1 = startX + 30; // 从父任务右边缘水平延伸
        const midX2 = endX - 20;   // 到子任务左边缘前的位置
        
        // 确保目标行中心不会高于父任务
        const safeTargetRowCenter = Math.max(targetRowCenter, startY + getRowHeight());
        
        // 五段式直角路径
        return `M ${startX} ${startY}
                L ${midX1} ${startY}
                L ${midX1} ${safeTargetRowCenter}
                L ${midX2} ${safeTargetRowCenter}
                L ${midX2} ${endY}
                L ${endX} ${endY}`;
      } else {
        // 子任务在父任务的左侧，需要绕行（只能向下，使用直角）
        const gap = 40;
        const bypassY = getSafeBypassY(startY, endY, gap);
        const midX1 = startX + gap/2;
        const midX2 = endX - gap/2;
        
        return `M ${startX} ${startY} 
                L ${midX1} ${startY}
                L ${midX1} ${bypassY}
                L ${midX2} ${bypassY}
                L ${midX2} ${endY}
                L ${endX} ${endY}`;
      }
    };
    

    

    
    // 完成-开始连线路径（拐弯点对齐网格）
    const generateFinishToStartPath = (source: any, target: any, _radius: number): string => {
      const startX = source.rightX;
      const startY = source.centerY;
      const endX = target.leftX;
      const endY = target.centerY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 简单直线连接（如果合适）
      if (deltaX > 20 && Math.abs(deltaY) < 10) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      // 如果需要绕行（目标在源的左侧，使用直角）
      if (deltaX < 20) {
        const gap = 30;
        const bypassY = getSafeBypassY(source.centerY, target.centerY, gap);
        const midX1 = startX + gap/2;
        const midX2 = endX - gap/2;
        
        return `M ${startX} ${startY} 
                L ${midX1} ${startY}
                L ${midX1} ${bypassY}
                L ${midX2} ${bypassY}
                L ${midX2} ${endY}
                L ${endX} ${endY}`;
      }
      
      // 使用简单的S曲线，但如果垂直距离大，在网格中心拐弯
      if (Math.abs(deltaY) > getRowHeight()) {
        const midY = alignToGridCenter((startY + endY) / 2);
        const curvature = Math.min(Math.abs(deltaX) * 0.3, 40);
        const midX = startX + (endX - startX) / 2;
        
        return `M ${startX} ${startY} 
                C ${startX + curvature} ${startY} ${midX - curvature} ${midY} ${midX} ${midY}
                C ${midX + curvature} ${midY} ${endX - curvature} ${endY} ${endX} ${endY}`;
      }
      
      // 简单S曲线
      const curvature = Math.min(Math.abs(deltaX) * 0.3, 40);
      const cp1X = startX + curvature;
      const cp2X = endX - curvature;
      
      return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
    };
    
    // 开始-开始连线路径（拐弯点对齐网格）
    const generateStartToStartPath = (source: any, target: any, _radius: number): string => {
      const startX = source.leftX;
      const startY = source.centerY;
      const endX = target.leftX;
      const endY = target.centerY;
      
      const gap = 25;
      const offsetX = Math.min(startX, endX) - gap;
      
      // 如果垂直距离较大，使用网格对齐的拐弯点
      if (Math.abs(endY - startY) > getRowHeight()) {
        const midY1 = alignToGridCenter((startY + endY) / 2);
        return `M ${startX} ${startY} C ${offsetX} ${startY} ${offsetX} ${midY1} ${offsetX} ${midY1} C ${offsetX} ${midY1} ${offsetX} ${endY} ${endX} ${endY}`;
      }
      
      // 简单的U型路径
      return `M ${startX} ${startY} C ${offsetX} ${startY} ${offsetX} ${endY} ${endX} ${endY}`;
    };
    
    // 完成-完成连线路径（拐弯点对齐网格）
    const generateFinishToFinishPath = (source: any, target: any, _radius: number): string => {
      const startX = source.rightX;
      const startY = source.centerY;
      const endX = target.rightX;
      const endY = target.centerY;
      
      const gap = 25;
      const offsetX = Math.max(startX, endX) + gap;
      
      // 如果垂直距离较大，使用网格对齐的拐弯点
      if (Math.abs(endY - startY) > getRowHeight()) {
        const midY1 = alignToGridCenter((startY + endY) / 2);
        return `M ${startX} ${startY} C ${offsetX} ${startY} ${offsetX} ${midY1} ${offsetX} ${midY1} C ${offsetX} ${midY1} ${offsetX} ${endY} ${endX} ${endY}`;
      }
      
      // 简单的U型路径
      return `M ${startX} ${startY} C ${offsetX} ${startY} ${offsetX} ${endY} ${endX} ${endY}`;
    };
    
    // 开始-完成连线路径（拐弯点对齐网格）
    const generateStartToFinishPath = (source: any, target: any, _radius: number): string => {
      const startX = source.leftX;
      const startY = source.centerY;
      const endX = target.rightX;
      const endY = target.centerY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 简单直线连接（如果合适）
      if (deltaX > 20 && Math.abs(deltaY) < 10) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      // 如果需要绕行（目标在源的右侧但重叠，使用直角）
      if (deltaX < 20) {
        const gap = 30;
        const bypassY = getSafeBypassY(source.centerY, target.centerY, gap);
        const midX1 = startX - gap/2;
        const midX2 = endX + gap/2;
        
        return `M ${startX} ${startY} 
                L ${midX1} ${startY}
                L ${midX1} ${bypassY}
                L ${midX2} ${bypassY}
                L ${midX2} ${endY}
                L ${endX} ${endY}`;
      }
      
      // 使用简单的S曲线，但如果垂直距离大，在网格中心拐弯
      if (Math.abs(deltaY) > getRowHeight()) {
        const midY = alignToGridCenter((startY + endY) / 2);
        const curvature = Math.min(Math.abs(deltaX) * 0.3, 40);
        const midX = startX + (endX - startX) / 2;
        
        return `M ${startX} ${startY} 
                C ${startX - curvature} ${startY} ${midX + curvature} ${midY} ${midX} ${midY}
                C ${midX - curvature} ${midY} ${endX + curvature} ${endY} ${endX} ${endY}`;
      }
      
      // 简单S曲线
      const curvature = Math.min(Math.abs(deltaX) * 0.3, 40);
      const cp1X = startX - curvature;
      const cp2X = endX + curvature;
      
      return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
    };
    
    // 生成箭头点（直接从子任务位置计算）
    const generateArrowPoints = (childPos: any, arrowSize: number, linkType: LinkType = LinkType.FINISH_TO_START): string => {
      if (!childPos) {
        console.warn('子任务位置无效');
        return '';
      }
      
      try {
        // 箭头终点：子任务左边缘中心
        const endX = childPos.leftX;
        const endY = childPos.centerY;
        
        // 父子关系连线：箭头指向右边（指向子任务）
        const arrowPoint1X = endX - arrowSize;
        const arrowPoint1Y = endY - arrowSize / 2;
        const arrowPoint2X = endX - arrowSize;
        const arrowPoint2Y = endY + arrowSize / 2;
        
        const result = `${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`;
        return result;
      } catch (e) {
        console.error('箭头生成失败:', e);
        return '';
      }
    };
    
    // 更新连线
    const updateLinks = () => {
      const newLinks: TaskLink[] = [];
      
      // 生成父子关系连线
      store.tasks.forEach(task => {
        const parentId = task[store.mapFields.parentId];
        if (parentId && parentId !== '0') {
          const parentPos = getTaskPosition(parentId);
          const childPos = getTaskPosition(task[store.mapFields.id]);
          
          if (parentPos && childPos) {
            const linkId = `parent-child-${parentId}-${task[store.mapFields.id]}`;
            
            // 为位置信息添加任务ID
            const parentPosWithId = { ...parentPos, id: parentId, taskId: parentId };
            const childPosWithId = { ...childPos, id: task[store.mapFields.id], taskId: task[store.mapFields.id] };
            
            const path = generateLinkPath(parentPosWithId, childPosWithId, LinkType.PARENT_CHILD, linkId);
            const arrowPoints = props.linkConfig.showArrow ? 
              generateArrowPoints(childPos, props.linkConfig.arrowSize, LinkType.PARENT_CHILD) : '';
            
            newLinks.push({
              id: linkId,
              sourceId: parentId,
              targetId: task[store.mapFields.id],
              type: LinkType.PARENT_CHILD,
              path,
              arrowPoints,
              labelX: childPos.centerX,
              labelY: childPos.centerY - 10
            });
          }
        }
      });
      
      // TODO: 添加其他类型的连线（依赖关系等）
      
      links.value = newLinks;
    };
    
    // 监听任务变化
    watch(() => store.tasks, () => {
      // 延迟更新，确保DOM已更新
      setTimeout(updateLinks, 50);
    }, { deep: true });
    
    watch(() => store.scale, () => {
      setTimeout(updateLinks, 50);
    });
    
    // 监听模式变化（月、日、时切换）
    watch(() => store.mode, () => {
      // 模式切换时需要重新计算bar位置，延迟更新确保bar重绘完成
      setTimeout(updateLinks, 200);
    });
    
    // 监听时间轴变化
    watch(() => store.timelineCellCount, () => {
      setTimeout(updateLinks, 100);
    });
    
    // 监听甘特图日期范围变化
    watch(() => [store.startGanttDate, store.endGanttDate], () => {
      setTimeout(updateLinks, 100);
    });
    
    // 监听barDate变化（拖拽和调整大小时会触发）
    watch(() => store.barDate, () => {
      requestAnimationFrame(updateLinks);
    }, { deep: true });
    
    // 监听DOM变化（拖拽时重绘）
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    
    onMounted(() => {
      // 初始更新
      setTimeout(updateLinks, 100);
      
      // 监听容器大小变化
      const container = document.querySelector('.gantt');
      if (container) {
        resizeObserver = new ResizeObserver(updateLinks);
        resizeObserver.observe(container);
        
        // 监听DOM变化（任务条位置变化）
        mutationObserver = new MutationObserver((mutations) => {
          let shouldUpdate = false;
          mutations.forEach(mutation => {
            const target = mutation.target as HTMLElement;
            // 检查是否是SVG bar元素或其父元素
            if (mutation.type === 'attributes') {
              const attrName = mutation.attributeName;
              if (attrName === 'data-x' || 
                  attrName === 'width' || 
                  attrName === 'style' ||
                  attrName === 'transform') {
                // 检查是否是bar元素
                if (target.classList?.contains('bar') || 
                    target.classList?.contains('barRow') ||
                    target.tagName === 'svg') {
                  shouldUpdate = true;
                }
              }
            }
          });
          if (shouldUpdate) {
            requestAnimationFrame(updateLinks);
          }
        });
        
        mutationObserver.observe(container, {
          attributes: true,
          subtree: true,
          attributeFilter: ['style', 'data-x', 'transform', 'width']
        });
      }
    });
    
    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    });
    
    return {
      links,
      updateLinks,
      getLinkStyle
    };
  }
});
</script>

<style lang="scss" scoped>
.task-links-layer {
  pointer-events: none;
  
  .task-link {
    transition: stroke-width 0.2s ease;
    
    &:hover {
      stroke-width: 3;
    }
    
    &.parent-child {
      opacity: 0.7;
    }
    
    &.finish-to-start {
      opacity: 0.9;
    }
  }
  
  .task-link-arrow {
    transition: fill 0.2s ease;
    opacity: 1;
    pointer-events: none;
  }
  
  .task-link-label {
    font-family: Arial, sans-serif;
    user-select: none;
  }
}
</style>