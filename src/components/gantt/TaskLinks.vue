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
import { LinkType, LinkPathType, type LinkConfig, type TaskLink } from './Types';



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
        pathType: LinkPathType.BEZIER,
        bezierCurvature: 0.4,
        rightAngleOffset: 30,
        smoothCorners: true,
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
      
      const { pathType } = props.linkConfig;
      
      switch (linkType) {
        case LinkType.PARENT_CHILD:
          return generateParentChildPath(source, target, pathType, linkId);
        case LinkType.FINISH_TO_START:
          return generateFinishToStartPath(source, target, pathType);
        case LinkType.START_TO_START:
          return generateStartToStartPath(source, target, pathType);
        case LinkType.FINISH_TO_FINISH:
          return generateFinishToFinishPath(source, target, pathType);
        case LinkType.START_TO_FINISH:
          return generateStartToFinishPath(source, target, pathType);
        default:
          return generateFinishToStartPath(source, target, pathType);
      }
    };
    
    // 父子关系连线路径（从父任务左边缘到子任务左边缘）
    const generateParentChildPath = (parent: any, child: any, pathType: LinkPathType, _linkId: string): string => {
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
      
      // 根据路径类型生成不同的路径
      return generateParentToChildPath(startX, adjustedStartY, endX, adjustedEndY, childIndex, pathType);
    };
    
    // 生成从父任务到子任务的连线路径（支持不同路径类型）
    const generateParentToChildPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      childIndex: number,
      pathType: LinkPathType
    ): string => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 如果距离很近，直接连线
      if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 15) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      switch (pathType) {
        case LinkPathType.STRAIGHT:
          return `M ${startX} ${startY} L ${endX} ${endY}`;
          
        case LinkPathType.BEZIER:
          return generateBezierPath(startX, startY, endX, endY, childIndex);
          
        case LinkPathType.RIGHT_ANGLE:
        default:
          return generateRightAnglePath(startX, startY, endX, endY, childIndex);
      }
    };
    // 生成贝塞尔曲线路径
    const generateBezierPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      childIndex: number
    ): string => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const { bezierCurvature } = props.linkConfig;
      
      // 计算该子任务应该对齐的行中心位置
      const targetRowCenter = getChildRowCenter(startY, childIndex);
      
      // 如果子任务在父任务的右侧（正常情况）
      if (deltaX > 0) {
        // 如果垂直距离较小，使用简单的S曲线
        if (Math.abs(deltaY) < getRowHeight() / 2) {
          const curvature = Math.abs(deltaX) * bezierCurvature;
          const cp1X = startX + curvature;
          const cp2X = endX - curvature;
          return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
        }
        
        // 垂直距离较大，使用双段贝塞尔曲线
        const safeTargetRowCenter = Math.max(targetRowCenter, startY + getRowHeight());
        const midX = startX + (endX - startX) / 2;
        const curvature1 = Math.abs(deltaX) * bezierCurvature * 0.6;
        const curvature2 = Math.abs(deltaX) * bezierCurvature * 0.4;
        
        return `M ${startX} ${startY} 
                C ${startX + curvature1} ${startY} ${midX - curvature1} ${safeTargetRowCenter} ${midX} ${safeTargetRowCenter}
                C ${midX + curvature2} ${safeTargetRowCenter} ${endX - curvature2} ${endY} ${endX} ${endY}`;
      } else {
        // 子任务在父任务的左侧，需要绕行
        const gap = props.linkConfig.rightAngleOffset;
        const bypassY = getSafeBypassY(startY, endY, gap);
        const curvature = gap * bezierCurvature;
        
        return `M ${startX} ${startY} 
                C ${startX + curvature} ${startY} ${startX + curvature} ${bypassY} ${startX + gap/2} ${bypassY}
                C ${endX - curvature} ${bypassY} ${endX - curvature} ${endY} ${endX} ${endY}`;
      }
    };
    
    // 生成直角路径
    const generateRightAnglePath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      childIndex: number
    ): string => {
      const deltaX = endX - startX;
      const { rightAngleOffset, smoothCorners, cornerRadius } = props.linkConfig;
      
      // 计算该子任务应该对齐的行中心位置
      const targetRowCenter = getChildRowCenter(startY, childIndex);
      
      // 如果子任务在父任务的右侧（正常情况）
      if (deltaX > 0) {
        const midX1 = startX + rightAngleOffset;
        const midX2 = endX - 20;
        const safeTargetRowCenter = Math.max(targetRowCenter, startY + getRowHeight());
        
        if (smoothCorners && cornerRadius > 0) {
          // 使用圆角的直角路径
          const r = Math.min(cornerRadius, Math.abs(safeTargetRowCenter - startY) / 2, Math.abs(midX2 - midX1) / 2);
          return `M ${startX} ${startY}
                  L ${midX1 - r} ${startY}
                  Q ${midX1} ${startY} ${midX1} ${startY + r}
                  L ${midX1} ${safeTargetRowCenter - r}
                  Q ${midX1} ${safeTargetRowCenter} ${midX1 + r} ${safeTargetRowCenter}
                  L ${midX2 - r} ${safeTargetRowCenter}
                  Q ${midX2} ${safeTargetRowCenter} ${midX2} ${safeTargetRowCenter + r}
                  L ${midX2} ${endY - r}
                  Q ${midX2} ${endY} ${midX2 + r} ${endY}
                  L ${endX} ${endY}`;
        } else {
          // 标准直角路径
          return `M ${startX} ${startY}
                  L ${midX1} ${startY}
                  L ${midX1} ${safeTargetRowCenter}
                  L ${midX2} ${safeTargetRowCenter}
                  L ${midX2} ${endY}
                  L ${endX} ${endY}`;
        }
      } else {
        // 子任务在父任务的左侧，需要绕行
        const gap = rightAngleOffset;
        const bypassY = getSafeBypassY(startY, endY, gap);
        const midX1 = startX + gap/2;
        const midX2 = endX - gap/2;
        
        if (smoothCorners && cornerRadius > 0) {
          const r = Math.min(cornerRadius, gap / 4);
          return `M ${startX} ${startY}
                  L ${midX1 - r} ${startY}
                  Q ${midX1} ${startY} ${midX1} ${startY + r}
                  L ${midX1} ${bypassY - r}
                  Q ${midX1} ${bypassY} ${midX1 + r} ${bypassY}
                  L ${midX2 - r} ${bypassY}
                  Q ${midX2} ${bypassY} ${midX2} ${bypassY + r}
                  L ${midX2} ${endY - r}
                  Q ${midX2} ${endY} ${midX2 + r} ${endY}
                  L ${endX} ${endY}`;
        } else {
          return `M ${startX} ${startY} 
                  L ${midX1} ${startY}
                  L ${midX1} ${bypassY}
                  L ${midX2} ${bypassY}
                  L ${midX2} ${endY}
                  L ${endX} ${endY}`;
        }
      }
    };
    
    // 完成-开始连线路径（支持不同路径类型）
    const generateFinishToStartPath = (source: any, target: any, pathType: LinkPathType): string => {
      const startX = source.rightX;
      const startY = source.centerY;
      const endX = target.leftX;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'horizontal');
    };
    
    // 开始-开始连线路径（支持不同路径类型）
    const generateStartToStartPath = (source: any, target: any, pathType: LinkPathType): string => {
      const startX = source.leftX;
      const startY = source.centerY;
      const endX = target.leftX;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'left-u');
    };
    
    // 完成-完成连线路径（支持不同路径类型）
    const generateFinishToFinishPath = (source: any, target: any, pathType: LinkPathType): string => {
      const startX = source.rightX;
      const startY = source.centerY;
      const endX = target.rightX;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'right-u');
    };
    
    // 开始-完成连线路径（支持不同路径类型）
    const generateStartToFinishPath = (source: any, target: any, pathType: LinkPathType): string => {
      const startX = source.leftX;
      const startY = source.centerY;
      const endX = target.rightX;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'cross');
    };
    
    // 通用连接路径生成函数
    const generateConnectionPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      pathType: LinkPathType, 
      connectionType: 'horizontal' | 'left-u' | 'right-u' | 'cross'
    ): string => {
      const { bezierCurvature, rightAngleOffset, smoothCorners, cornerRadius } = props.linkConfig;
      
      switch (pathType) {
        case LinkPathType.STRAIGHT:
          return `M ${startX} ${startY} L ${endX} ${endY}`;
          
        case LinkPathType.BEZIER:
          return generateBezierConnectionPath(startX, startY, endX, endY, connectionType, bezierCurvature);
          
        case LinkPathType.RIGHT_ANGLE:
        default:
          return generateRightAngleConnectionPath(startX, startY, endX, endY, connectionType, rightAngleOffset, smoothCorners, cornerRadius);
      }
    };
    
    // 生成贝塞尔连接路径
    const generateBezierConnectionPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      connectionType: string,
      curvature: number
    ): string => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      switch (connectionType) {
        case 'horizontal':
          // 水平连接（完成-开始）
          if (deltaX > 20 && Math.abs(deltaY) < 10) {
            return `M ${startX} ${startY} L ${endX} ${endY}`;
          }
          
          if (deltaX < 20) {
            // 需要绕行
            const gap = 30;
            const bypassY = getSafeBypassY(startY, endY, gap);
            const curvatureOffset = gap * curvature;
            
            return `M ${startX} ${startY} 
                    C ${startX + curvatureOffset} ${startY} ${startX + curvatureOffset} ${bypassY} ${startX + gap/2} ${bypassY}
                    C ${endX - curvatureOffset} ${bypassY} ${endX - curvatureOffset} ${endY} ${endX} ${endY}`;
          }
          
          // 标准S曲线
          const curvatureOffset = Math.min(Math.abs(deltaX) * curvature, 60);
          const cp1X = startX + curvatureOffset;
          const cp2X = endX - curvatureOffset;
          
          return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
          
        case 'left-u':
          // 左侧U型连接（开始-开始）
          const leftGap = 25;
          const leftOffsetX = Math.min(startX, endX) - leftGap;
          const leftCurvature = leftGap * curvature;
          
          if (Math.abs(deltaY) > getRowHeight()) {
            const midY = alignToGridCenter((startY + endY) / 2);
            return `M ${startX} ${startY} 
                    C ${startX - leftCurvature} ${startY} ${leftOffsetX} ${startY + leftCurvature} ${leftOffsetX} ${midY}
                    C ${leftOffsetX} ${endY - leftCurvature} ${endX - leftCurvature} ${endY} ${endX} ${endY}`;
          }
          
          return `M ${startX} ${startY} C ${leftOffsetX} ${startY} ${leftOffsetX} ${endY} ${endX} ${endY}`;
          
        case 'right-u':
          // 右侧U型连接（完成-完成）
          const rightGap = 25;
          const rightOffsetX = Math.max(startX, endX) + rightGap;
          const rightCurvature = rightGap * curvature;
          
          if (Math.abs(deltaY) > getRowHeight()) {
            const midY = alignToGridCenter((startY + endY) / 2);
            return `M ${startX} ${startY} 
                    C ${startX + rightCurvature} ${startY} ${rightOffsetX} ${startY + rightCurvature} ${rightOffsetX} ${midY}
                    C ${rightOffsetX} ${endY - rightCurvature} ${endX + rightCurvature} ${endY} ${endX} ${endY}`;
          }
          
          return `M ${startX} ${startY} C ${rightOffsetX} ${startY} ${rightOffsetX} ${endY} ${endX} ${endY}`;
          
        case 'cross':
          // 交叉连接（开始-完成）
          if (deltaX > 20 && Math.abs(deltaY) < 10) {
            return `M ${startX} ${startY} L ${endX} ${endY}`;
          }
          
          const crossCurvature = Math.min(Math.abs(deltaX) * curvature, 60);
          const crossCp1X = startX - crossCurvature;
          const crossCp2X = endX + crossCurvature;
          
          return `M ${startX} ${startY} C ${crossCp1X} ${startY} ${crossCp2X} ${endY} ${endX} ${endY}`;
          
        default:
          return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
    };
    
    // 生成直角连接路径
    const generateRightAngleConnectionPath = (
      startX: number, startY: number, 
      endX: number, endY: number, 
      connectionType: string,
      offset: number,
      smoothCorners: boolean,
      cornerRadius: number
    ): string => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      switch (connectionType) {
        case 'horizontal':
          // 水平连接（完成-开始）
          if (deltaX > 20 && Math.abs(deltaY) < 10) {
            return `M ${startX} ${startY} L ${endX} ${endY}`;
          }
          
          if (deltaX < 20) {
            // 需要绕行
            const gap = offset;
            const bypassY = getSafeBypassY(startY, endY, gap);
            const midX1 = startX + gap/2;
            const midX2 = endX - gap/2;
            
            if (smoothCorners && cornerRadius > 0) {
              const r = Math.min(cornerRadius, gap / 4);
              return `M ${startX} ${startY}
                      L ${midX1 - r} ${startY}
                      Q ${midX1} ${startY} ${midX1} ${startY + r}
                      L ${midX1} ${bypassY - r}
                      Q ${midX1} ${bypassY} ${midX1 + r} ${bypassY}
                      L ${midX2 - r} ${bypassY}
                      Q ${midX2} ${bypassY} ${midX2} ${bypassY + r}
                      L ${midX2} ${endY - r}
                      Q ${midX2} ${endY} ${midX2 + r} ${endY}
                      L ${endX} ${endY}`;
            }
            
            return `M ${startX} ${startY} 
                    L ${midX1} ${startY}
                    L ${midX1} ${bypassY}
                    L ${midX2} ${bypassY}
                    L ${midX2} ${endY}
                    L ${endX} ${endY}`;
          }
          
          // 标准L型路径
          const midX = startX + Math.abs(deltaX) / 2;
          
          if (smoothCorners && cornerRadius > 0) {
            const r = Math.min(cornerRadius, Math.abs(deltaX) / 4, Math.abs(deltaY) / 2);
            if (deltaY > 0) {
              return `M ${startX} ${startY}
                      L ${midX - r} ${startY}
                      Q ${midX} ${startY} ${midX} ${startY + r}
                      L ${midX} ${endY - r}
                      Q ${midX} ${endY} ${midX + r} ${endY}
                      L ${endX} ${endY}`;
            } else {
              return `M ${startX} ${startY}
                      L ${midX - r} ${startY}
                      Q ${midX} ${startY} ${midX} ${startY - r}
                      L ${midX} ${endY + r}
                      Q ${midX} ${endY} ${midX + r} ${endY}
                      L ${endX} ${endY}`;
            }
          }
          
          return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
          
        case 'left-u':
          // 左侧U型连接（开始-开始）
          const leftGap = offset;
          const leftOffsetX = Math.min(startX, endX) - leftGap;
          
          if (smoothCorners && cornerRadius > 0) {
            const r = Math.min(cornerRadius, leftGap / 2, Math.abs(deltaY) / 4);
            return `M ${startX} ${startY}
                    L ${leftOffsetX + r} ${startY}
                    Q ${leftOffsetX} ${startY} ${leftOffsetX} ${startY + (deltaY > 0 ? r : -r)}
                    L ${leftOffsetX} ${endY - (deltaY > 0 ? r : -r)}
                    Q ${leftOffsetX} ${endY} ${leftOffsetX + r} ${endY}
                    L ${endX} ${endY}`;
          }
          
          return `M ${startX} ${startY} L ${leftOffsetX} ${startY} L ${leftOffsetX} ${endY} L ${endX} ${endY}`;
          
        case 'right-u':
          // 右侧U型连接（完成-完成）
          const rightGap = offset;
          const rightOffsetX = Math.max(startX, endX) + rightGap;
          
          if (smoothCorners && cornerRadius > 0) {
            const r = Math.min(cornerRadius, rightGap / 2, Math.abs(deltaY) / 4);
            return `M ${startX} ${startY}
                    L ${rightOffsetX - r} ${startY}
                    Q ${rightOffsetX} ${startY} ${rightOffsetX} ${startY + (deltaY > 0 ? r : -r)}
                    L ${rightOffsetX} ${endY - (deltaY > 0 ? r : -r)}
                    Q ${rightOffsetX} ${endY} ${rightOffsetX - r} ${endY}
                    L ${endX} ${endY}`;
          }
          
          return `M ${startX} ${startY} L ${rightOffsetX} ${startY} L ${rightOffsetX} ${endY} L ${endX} ${endY}`;
          
        case 'cross':
          // 交叉连接（开始-完成）
          if (deltaX > 20 && Math.abs(deltaY) < 10) {
            return `M ${startX} ${startY} L ${endX} ${endY}`;
          }
          
          const crossMidX = startX + deltaX / 2;
          
          if (smoothCorners && cornerRadius > 0) {
            const r = Math.min(cornerRadius, Math.abs(deltaX) / 4, Math.abs(deltaY) / 2);
            if (deltaY > 0) {
              return `M ${startX} ${startY}
                      L ${crossMidX - r} ${startY}
                      Q ${crossMidX} ${startY} ${crossMidX} ${startY + r}
                      L ${crossMidX} ${endY - r}
                      Q ${crossMidX} ${endY} ${crossMidX + r} ${endY}
                      L ${endX} ${endY}`;
            } else {
              return `M ${startX} ${startY}
                      L ${crossMidX - r} ${startY}
                      Q ${crossMidX} ${startY} ${crossMidX} ${startY - r}
                      L ${crossMidX} ${endY + r}
                      Q ${crossMidX} ${endY} ${crossMidX + r} ${endY}
                      L ${endX} ${endY}`;
            }
          }
          
          return `M ${startX} ${startY} L ${crossMidX} ${startY} L ${crossMidX} ${endY} L ${endX} ${endY}`;
          
        default:
          return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
    };
    
    // 生成箭头点（直接从子任务位置计算）
    const generateArrowPoints = (childPos: any, arrowSize: number, _linkType: LinkType = LinkType.FINISH_TO_START): string => {
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