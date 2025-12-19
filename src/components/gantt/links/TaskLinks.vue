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
        :class="['task-link', link.type, { 
          'dash-animated': isDashedLine(link.type) && linkConfig.enableDashAnimation 
        }]"
        :style="getDashAnimationStyle(link)"
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
import { store } from '../state/Store';
import { LinkType, LinkPathType, type LinkConfig, type TaskLink } from '../types/Types';
import { linkDataManager } from '../composables/LinkConfig';



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
        enableDashAnimation: true,
        dashAnimationSpeed: 0.8,
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
      
      // 查找对应的DOM元素 - 查找barRow或milestoneRow
      const barElement = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
      if (!barElement) return null;
      
      // 尝试查找SVG bar元素或milestone元素获取实际位置
      let svgBar = barElement.querySelector('.bar') as SVGSVGElement;
      let isMilestone = false;
      
      if (!svgBar) {
        // 如果不是bar，尝试查找里程碑
        svgBar = barElement.querySelector('.milestone') as SVGSVGElement;
        isMilestone = true;
      }
      
      if (!svgBar) return null;
      
      // 获取容器 - 使用更精确的选择器
      const rightTableContent = barElement.closest('.table .content') as HTMLElement;
      if (!rightTableContent) return null;
      
      // 获取SVG的transform属性
      const dataX = parseFloat(svgBar.getAttribute('data-x') || '0');
      
      let barWidth: number;
      if (isMilestone) {
        // 里程碑的宽度是菱形大小（通常是 rowHeight * 0.6）
        const barRowRect = barElement.getBoundingClientRect();
        barWidth = barRowRect.height * 0.6; // 菱形大小
      } else {
        barWidth = svgBar.width.baseVal.value;
      }
      
      // 获取任务在当前容器中的位置
      const barRowRect = barElement.getBoundingClientRect();
      const containerRect = rightTableContent.getBoundingClientRect();
      
      // 计算任务相对于容器的位置
      const relativeY = barRowRect.top - containerRect.top;
      
      if (isMilestone) {
        // 里程碑：菱形的中心点是连接点
        const halfSize = barWidth / 2;
        return {
          x: dataX,
          y: relativeY,
          width: barWidth,
          height: barRowRect.height,
          centerX: dataX + halfSize,
          centerY: relativeY + barRowRect.height / 2,
          rightX: dataX + barWidth,  // 菱形右顶点
          leftX: dataX,              // 菱形左顶点
          topY: relativeY,
          bottomY: relativeY + barRowRect.height
        };
      } else {
        // 普通任务条
        return {
          x: dataX,
          y: relativeY,
          width: barWidth,
          height: barRowRect.height,
          centerX: dataX + barWidth / 2,
          centerY: relativeY + barRowRect.height / 2,
          rightX: dataX + barWidth,
          leftX: dataX,
          topY: relativeY,
          bottomY: relativeY + barRowRect.height
        };
      }
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
    
    // 获取连线类型对应的颜色（从配置中读取）
    const getLinkTypeColor = (linkType: LinkType): string => {
      const colors = props.linkConfig.linkTypeColors;
      if (!colors) {
        // 默认颜色
        const defaultColors: Record<LinkType, string> = {
          [LinkType.FINISH_TO_START]: '#3498db',
          [LinkType.START_TO_START]: '#2ecc71',
          [LinkType.FINISH_TO_FINISH]: '#e74c3c',
          [LinkType.START_TO_FINISH]: '#f39c12',
          [LinkType.PARENT_CHILD]: '#95a5a6'
        };
        return defaultColors[linkType] || props.linkConfig.color;
      }
      
      switch (linkType) {
        case LinkType.FINISH_TO_START:
          return colors.finishToStart || '#3498db';
        case LinkType.START_TO_START:
          return colors.startToStart || '#2ecc71';
        case LinkType.FINISH_TO_FINISH:
          return colors.finishToFinish || '#e74c3c';
        case LinkType.START_TO_FINISH:
          return colors.startToFinish || '#f39c12';
        default:
          return props.linkConfig.color;
      }
    };

    // 获取特定连线类型的样式
    const getLinkStyle = (linkType: LinkType) => {
      if (linkType === LinkType.PARENT_CHILD) {
        return {
          color: props.linkConfig.parentChildStyle.color || '#95a5a6',
          width: props.linkConfig.parentChildStyle.width,
          dashArray: props.linkConfig.parentChildStyle.dashArray
        };
      }
      
      // 任务依赖连线使用对应类型的颜色
      return {
        color: getLinkTypeColor(linkType),
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
      
      // 终点：子任务左边缘减去箭头大小（连线终点在箭头底边）
      // 箭头尖端在 child.leftX, child.centerY，所以连线终点在箭头底边
      const arrowSize = props.linkConfig.arrowSize || 8;
      const endX = child.leftX - arrowSize;
      const endY = child.centerY; // 直接使用中心Y，与箭头位置一致
      
      // 根据路径类型生成不同的路径
      return generateParentToChildPath(startX, startY, endX, endY, childIndex, pathType);
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
      _childIndex: number
    ): string => {
      const deltaX = endX - startX;
      const { bezierCurvature } = props.linkConfig;
      
      // 如果子任务在父任务的右侧（正常情况）
      if (deltaX > 0) {
        // 使用简单的S曲线，直接连接起点和终点
        const curvature = Math.min(Math.abs(deltaX) * bezierCurvature, 60);
        const cp1X = startX + curvature;
        const cp2X = endX - curvature;
        return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;
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
      
      // 计算该子任务应该对齐的行中心位置（预留用于未来扩展）
      void getChildRowCenter(startY, childIndex);
      
      // 如果子任务在父任务的右侧（正常情况）
      if (deltaX > 0) {
        const midX = startX + rightAngleOffset;
        
        if (smoothCorners && cornerRadius > 0) {
          // 使用圆角的直角路径 - 简化为L型
          const r = Math.min(cornerRadius, Math.abs(endY - startY) / 2, Math.abs(endX - midX) / 2);
          return `M ${startX} ${startY}
                  L ${midX - r} ${startY}
                  Q ${midX} ${startY} ${midX} ${startY + (endY > startY ? r : -r)}
                  L ${midX} ${endY - (endY > startY ? r : -r)}
                  Q ${midX} ${endY} ${midX + r} ${endY}
                  L ${endX} ${endY}`;
        } else {
          // 标准直角路径 - 简化为L型
          return `M ${startX} ${startY}
                  L ${midX} ${startY}
                  L ${midX} ${endY}
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
      const arrowSize = props.linkConfig.arrowSize || 8;
      const startX = source.rightX;
      const startY = source.centerY;
      // 终点在箭头底边位置
      const endX = target.leftX - arrowSize;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'horizontal');
    };
    
    // 开始-开始连线路径（支持不同路径类型）
    const generateStartToStartPath = (source: any, target: any, pathType: LinkPathType): string => {
      const arrowSize = props.linkConfig.arrowSize || 8;
      const startX = source.leftX;
      const startY = source.centerY;
      // 终点在箭头底边位置
      const endX = target.leftX - arrowSize;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'left-u');
    };
    
    // 完成-完成连线路径（支持不同路径类型）
    const generateFinishToFinishPath = (source: any, target: any, pathType: LinkPathType): string => {
      const arrowSize = props.linkConfig.arrowSize || 8;
      const startX = source.rightX;
      const startY = source.centerY;
      // 终点在箭头底边位置（箭头指向左边）
      const endX = target.rightX + arrowSize;
      const endY = target.centerY;
      
      return generateConnectionPath(startX, startY, endX, endY, pathType, 'right-u');
    };
    
    // 开始-完成连线路径（支持不同路径类型）
    const generateStartToFinishPath = (source: any, target: any, pathType: LinkPathType): string => {
      const arrowSize = props.linkConfig.arrowSize || 8;
      const startX = source.leftX;
      const startY = source.centerY;
      // 终点在箭头底边位置（箭头指向左边）
      const endX = target.rightX + arrowSize;
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
    
    // 生成箭头点（直接从子任务位置计算）- 用于父子关系连线
    const generateArrowPoints = (childPos: any, arrowSize: number, _linkType: LinkType = LinkType.FINISH_TO_START): string => {
      if (!childPos) {
        console.warn('子任务位置无效');
        return '';
      }
      
      try {
        // 箭头尖端：子任务左边缘中心
        const tipX = childPos.leftX;
        const tipY = childPos.centerY;
        
        // 父子关系连线：箭头指向右边（指向子任务）
        // 箭头底边的两个点
        const baseX = tipX - arrowSize;
        const baseY1 = tipY - arrowSize / 2;
        const baseY2 = tipY + arrowSize / 2;
        
        const result = `${tipX},${tipY} ${baseX},${baseY1} ${baseX},${baseY2}`;
        return result;
      } catch (e) {
        console.error('箭头生成失败:', e);
        return '';
      }
    };
    
    // 生成依赖连线的箭头点
    const generateDependencyArrowPoints = (
      sourcePos: any, 
      targetPos: any, 
      linkType: LinkType, 
      arrowSize: number
    ): string => {
      if (!sourcePos || !targetPos) return '';
      
      try {
        let endX: number, endY: number;
        let direction: 'left' | 'right' | 'up' | 'down' = 'right';
        
        switch (linkType) {
          case LinkType.FINISH_TO_START:
            // 箭头指向目标任务的左边缘
            endX = targetPos.leftX;
            endY = targetPos.centerY;
            direction = 'right';
            break;
            
          case LinkType.START_TO_START:
            // 箭头指向目标任务的左边缘
            endX = targetPos.leftX;
            endY = targetPos.centerY;
            direction = 'right';
            break;
            
          case LinkType.FINISH_TO_FINISH:
            // 箭头指向目标任务的右边缘
            endX = targetPos.rightX;
            endY = targetPos.centerY;
            direction = 'left';
            break;
            
          case LinkType.START_TO_FINISH:
            // 箭头指向目标任务的右边缘
            endX = targetPos.rightX;
            endY = targetPos.centerY;
            direction = 'left';
            break;
            
          default:
            endX = targetPos.leftX;
            endY = targetPos.centerY;
            direction = 'right';
        }
        
        // 根据方向生成箭头
        let arrowPoint1X: number, arrowPoint1Y: number;
        let arrowPoint2X: number, arrowPoint2Y: number;
        
        if (direction === 'right') {
          // 箭头指向右边
          arrowPoint1X = endX - arrowSize;
          arrowPoint1Y = endY - arrowSize / 2;
          arrowPoint2X = endX - arrowSize;
          arrowPoint2Y = endY + arrowSize / 2;
        } else {
          // 箭头指向左边
          arrowPoint1X = endX + arrowSize;
          arrowPoint1Y = endY - arrowSize / 2;
          arrowPoint2X = endX + arrowSize;
          arrowPoint2Y = endY + arrowSize / 2;
        }
        
        return `${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`;
      } catch (e) {
        console.error('依赖箭头生成失败:', e);
        return '';
      }
    };
    
    // 更新连线
    // 获取所有被折叠的子任务ID集合（递归）
    const getAllCollapsedChildren = (parentId: any): Set<any> => {
      const collapsedChildren = new Set<any>();
      
      const collectChildren = (pid: any) => {
        const children = store.tasks.filter(task => task[store.mapFields.parentId] === pid);
        children.forEach(child => {
          const childId = child[store.mapFields.id];
          collapsedChildren.add(childId);
          // 递归收集所有子孙任务
          collectChildren(childId);
        });
      };
      
      collectChildren(parentId);
      return collapsedChildren;
    };
    
    // 检查任务是否被折叠（任务本身或其任何祖先被折叠）
    const isTaskCollapsed = (taskId: any): boolean => {
      // 检查所有已折叠的任务
      for (const collapsedId of store.collapsedTasks) {
        const collapsedChildren = getAllCollapsedChildren(collapsedId);
        if (collapsedChildren.has(taskId)) {
          return true;
        }
      }
      return false;
    };
    
    const updateLinks = () => {
      const newLinks: TaskLink[] = [];
      
      // 获取连线类型显示配置
      const visibility = props.linkConfig.linkTypeVisibility || {
        finishToStart: true,
        startToStart: true,
        finishToFinish: true,
        startToFinish: true,
        parentChild: true
      };
      
      // 生成父子关系连线（根据 visibility 控制）
      if (visibility.parentChild) {
        store.tasks.forEach(task => {
          const parentId = task[store.mapFields.parentId];
          const childId = task[store.mapFields.id];
          
          if (parentId && parentId !== '0') {
            // 检查子任务是否被折叠，如果被折叠则不显示连线
            if (isTaskCollapsed(childId)) {
              return; // 跳过该连线
            }
            
            const parentPos = getTaskPosition(parentId);
            const childPos = getTaskPosition(childId);
            
            if (parentPos && childPos) {
              const linkId = `parent-child-${parentId}-${childId}`;
              
              // 为位置信息添加任务ID
              const parentPosWithId = { ...parentPos, id: parentId, taskId: parentId };
              const childPosWithId = { ...childPos, id: childId, taskId: childId };
              
              const path = generateLinkPath(parentPosWithId, childPosWithId, LinkType.PARENT_CHILD, linkId);
              const arrowPoints = props.linkConfig.showArrow ? 
                generateArrowPoints(childPos, props.linkConfig.arrowSize, LinkType.PARENT_CHILD) : '';
              
              newLinks.push({
                id: linkId,
                sourceId: parentId,
                targetId: childId,
                type: LinkType.PARENT_CHILD,
                path,
                arrowPoints,
                labelX: childPos.centerX,
                labelY: childPos.centerY - 10
              });
            }
          }
        });
      }
      
      // 生成任务依赖连线
      const dependencies = linkDataManager.getDependencies();
      
      // 根据连线类型检查是否显示（支持字符串枚举和数字类型）
      const shouldShowLinkType = (linkType: LinkType | number): boolean => {
        // 处理数字类型（兼容旧版本数据格式）
        if (typeof linkType === 'number') {
          switch (linkType) {
            case 0: return visibility.finishToStart;  // FINISH_TO_START
            case 1: return visibility.startToStart;   // START_TO_START
            case 2: return visibility.finishToFinish; // FINISH_TO_FINISH
            case 3: return visibility.startToFinish;  // START_TO_FINISH
            default: return true;
          }
        }
        // 处理字符串枚举类型
        switch (linkType) {
          case LinkType.FINISH_TO_START:
            return visibility.finishToStart;
          case LinkType.START_TO_START:
            return visibility.startToStart;
          case LinkType.FINISH_TO_FINISH:
            return visibility.finishToFinish;
          case LinkType.START_TO_FINISH:
            return visibility.startToFinish;
          case LinkType.PARENT_CHILD:
            return visibility.parentChild;
          default:
            return true;
        }
      };
      
      dependencies.forEach(dep => {
        // 根据 visibility 过滤连线类型
        if (!shouldShowLinkType(dep.type)) {
          return;
        }
        
        const sourcePos = getTaskPosition(dep.sourceTaskId);
        const targetPos = getTaskPosition(dep.targetTaskId);
        
        if (sourcePos && targetPos) {
          const linkId = `dependency-${dep.id}`;
          
          // 为位置信息添加任务ID
          const sourcePosWithId = { ...sourcePos, id: dep.sourceTaskId, taskId: dep.sourceTaskId };
          const targetPosWithId = { ...targetPos, id: dep.targetTaskId, taskId: dep.targetTaskId };
          
          const path = generateLinkPath(sourcePosWithId, targetPosWithId, dep.type, linkId);
          
          // 根据连线类型生成箭头
          const arrowPoints = props.linkConfig.showArrow ? 
            generateDependencyArrowPoints(sourcePosWithId, targetPosWithId, dep.type, props.linkConfig.arrowSize) : '';
          
          // 获取连线类型的标签
          const labelMap: Record<LinkType, string> = {
            [LinkType.FINISH_TO_START]: 'FS',
            [LinkType.START_TO_START]: 'SS',
            [LinkType.FINISH_TO_FINISH]: 'FF',
            [LinkType.START_TO_FINISH]: 'SF',
            [LinkType.PARENT_CHILD]: ''
          };
          
          newLinks.push({
            id: linkId,
            sourceId: dep.sourceTaskId,
            targetId: dep.targetTaskId,
            type: dep.type,
            path,
            arrowPoints,
            label: labelMap[dep.type] || '',
            labelX: (sourcePos.centerX + targetPos.centerX) / 2,
            labelY: (sourcePos.centerY + targetPos.centerY) / 2 - 10
          });
        }
      });
      
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
    
    // 监听连线类型显示配置变化
    watch(() => props.linkConfig.linkTypeVisibility, () => {
      setTimeout(updateLinks, 50);
    }, { deep: true });
    
    // 监听折叠状态变化
    watch(() => store.collapsedTasks, () => {
      setTimeout(updateLinks, 50);
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
    
    // 虚线动画相关方法
    
    // 判断是否为虚线
    const isDashedLine = (linkType: LinkType): boolean => {
      const style = getLinkStyle(linkType);
      return !!(style.dashArray && style.dashArray.length > 0);
    };
    
    // 获取虚线流动动画样式
    const getDashAnimationStyle = (link: TaskLink) => {
      if (!isDashedLine(link.type) || !props.linkConfig.enableDashAnimation) {
        return {};
      }
      
      const style = getLinkStyle(link.type);
      const speed = props.linkConfig.dashAnimationSpeed || 0.8; // 更快的默认速度
      
      // 父子关系连线稍快一些
      const adjustedSpeed = link.type === LinkType.PARENT_CHILD ? speed * 0.6 : speed;
      
      // 计算虚线总长度用于动画
      const dashArray = style.dashArray || '5,5';
      const dashParts = dashArray.split(',').map(Number);
      const dashLength = dashParts.reduce((sum, part) => sum + part, 0);
      
      return {
        '--animation-duration': `${adjustedSpeed}s`,
        '--dash-length': `${dashLength}px`
      };
    };
    
    return {
      links,
      updateLinks,
      getLinkStyle,
      isDashedLine,
      getDashAnimationStyle
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
    
    // 虚线流动动画
    &.dash-animated {
      animation: dashFlow var(--animation-duration, 3s) linear infinite;
    }
  }
  
  // 虚线流动动画关键帧
  @keyframes dashFlow {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: calc(-1 * var(--dash-length, 20px));
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