<template>
    <div ref="containerRef" class="bar-recursion-container">
      <!-- 虚拟滚动模式 -->
      <template v-if="useVirtualScroll">
        <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px', paddingTop: offsetY + 'px', boxSizing: 'border-box' }">
          <template v-for="item in visibleTasks" :key="item.task[mapFields.id]">
            <Milestone 
              v-if="getTaskType(item.task) === TaskType.MILESTONE"
              :startGanttDate="startGanttDate" 
              :endGanttDate="endGanttDate" 
              :row="item.task" 
              :rowHeight="rowHeight" 
            />
            <Bar 
              v-else
              :startGanttDate="startGanttDate" 
              :endGanttDate="endGanttDate" 
              :row="item.task" 
              :rowHeight="rowHeight" 
            />
          </template>
        </div>
      </template>
      <!-- 普通模式 -->
      <template v-else>
        <template v-for="(item) in filterTask" :key="item[mapFields.id]">
          <Milestone 
            v-if="getTaskType(item) === TaskType.MILESTONE"
            :startGanttDate="startGanttDate" 
            :endGanttDate="endGanttDate" 
            :row="item" 
            :rowHeight="rowHeight" 
          />
          <Bar 
            v-else
            :startGanttDate="startGanttDate" 
            :endGanttDate="endGanttDate" 
            :row="item" 
            :rowHeight="rowHeight" 
          />
        </template>
      </template>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
  import { store, mutations } from '../state/Store';
  import Bar from './Bar.vue';
  import Milestone from './Milestone.vue';
  import { TaskType } from '../types/Types';
  import { Symbols } from '../state/Symbols';
  import { PerformanceConfig } from '../composables/PerformanceConfig';
  
  export default defineComponent({
    name: 'BarRecursionRow',
    props: {
      rowHeight: {
        type: Number as () => number,
        default: 0
      },
    },
    setup(props) {
      
      const hiddenTask = ref<any[]>([]);
      const componentKey = ref(0);
      const containerRef = ref<HTMLElement | null>(null);
      
      // 虚拟滚动状态
      const scrollTop = ref(0);
      const containerHeight = ref(0);
      const startIndex = ref(0);
      const endIndex = ref(0);
      
      // 注入自定义任务类型判断函数
      const setTaskType = inject(Symbols.SetTaskTypeSymbol) as ((row: any) => TaskType) | undefined;
  
      const allTask = computed(() => store.tasks);
      const timelineCellCount = computed(() => store.timelineCellCount);
      const scale = computed(() => store.scale);
      const mode = computed(() => store.mode);
      const startGanttDate = computed(() => store.startGanttDate ? store.startGanttDate.toISOString() : undefined);
      const endGanttDate = computed(() => store.endGanttDate ? store.endGanttDate.toISOString() : undefined);
      const mapFields = computed(() => store.mapFields);
      const collapsedTasks = computed(() => store.collapsedTasks);
      
      // 判断是否启用虚拟滚动
      const useVirtualScroll = computed(() => {
        return PerformanceConfig.ENABLE_VIRTUAL_SCROLL && 
               filterTask.value.length >= PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD;
      });
      
      // 虚拟滚动计算
      const totalHeight = computed(() => filterTask.value.length * props.rowHeight);
      const offsetY = computed(() => startIndex.value * props.rowHeight);
      
      const visibleTasks = computed(() => {
        if (!useVirtualScroll.value) return [];
        const tasks = filterTask.value;
        const result: { task: any; index: number }[] = [];
        for (let i = startIndex.value; i <= endIndex.value && i < tasks.length; i++) {
          result.push({ task: tasks[i], index: i });
        }
        // 调试日志
        // console.log(`[右侧虚拟滚动] 总任务: ${tasks.length}, 渲染: ${result.length}, 范围: ${startIndex.value}-${endIndex.value}`);
        return result;
      });
      
      // 更新可见范围
      const updateVisibleRange = () => {
        if (!containerRef.value) return;
        
        // 获取父滚动容器
        const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
        if (!scrollContainer) return;
        
        const scrollY = scrollContainer.scrollTop;
        const viewHeight = scrollContainer.clientHeight || 500; // 默认高度
        const buffer = PerformanceConfig.VIRTUAL_SCROLL_BUFFER;
        
        scrollTop.value = scrollY;
        containerHeight.value = viewHeight;
        
        const rowH = props.rowHeight || 40; // 默认行高
        const start = Math.max(0, Math.floor(scrollY / rowH) - buffer);
        const visibleCount = Math.ceil(viewHeight / rowH);
        const end = Math.min(filterTask.value.length - 1, start + visibleCount + buffer * 2);
        
        startIndex.value = start;
        endIndex.value = Math.max(end, start); // 确保 end >= start
      };
      
      // 滚动处理
      let rafId: number | null = null;
      let batchUpdateTimer: number | null = null;
      
      const onScroll = () => {
        if (PerformanceConfig.USE_RAF) {
          // 使用 requestAnimationFrame 优化
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            updateVisibleRange();
            rafId = null;
          });
        } else {
          // 使用批量更新延迟
          if (batchUpdateTimer) {
            clearTimeout(batchUpdateTimer);
          }
          batchUpdateTimer = setTimeout(() => {
            updateVisibleRange();
            batchUpdateTimer = null;
          }, PerformanceConfig.BATCH_UPDATE_DELAY);
        }
      };
      
      // 判断任务类型
      const getTaskType = (row: any): string => {
        // 如果提供了自定义函数，使用自定义函数
        if (setTaskType) {
          return setTaskType(row);
        }
        
        // 默认逻辑：检查任务数据中是否有 type 字段
        if (row.type) {
          return row.type;
        }
        
        // 检查开始日期和结束日期是否相同（里程碑的特征）
        const startDate = row[mapFields.value.startdate];
        const endDate = row[mapFields.value.enddate];
        if (startDate && endDate && startDate === endDate) {
          return TaskType.MILESTONE;
        }
        
        // 默认为普通任务
        return TaskType.TASK;
      };
  
      // 获取所有被折叠的子任务
      const getAllCollapsedChildren = (parentId: any): Set<any> => {
        const collapsedChildren = new Set<any>();
        
        const collectChildren = (pid: any) => {
          const children = allTask.value.filter(task => task[mapFields.value['parentId']] === pid);
          children.forEach(child => {
            const childId = child[mapFields.value['id']];
            collapsedChildren.add(childId);
            // 递归收集所有子孙任务
            collectChildren(childId);
          });
        };
        
        collectChildren(parentId);
        return collapsedChildren;
      };
  
      // 优化：使用Set提高查找性能
      const hiddenTaskIds = computed(() => {
        return new Set(hiddenTask.value.map(obj => obj[mapFields.value.id]));
      });

      const filterTask = computed(() => {
        const hiddenIds = hiddenTaskIds.value;
        const tasks = store.tasks.filter(task => !hiddenIds.has(task[mapFields.value.id]));
        
        // 过滤折叠的子任务
        const allCollapsedIds = new Set<any>();
        collapsedTasks.value.forEach(collapsedId => {
          const children = getAllCollapsedChildren(collapsedId);
          children.forEach(childId => allCollapsedIds.add(childId));
        });
        
        return tasks.filter(task => !allCollapsedIds.has(task[mapFields.value.id]));
      });
  
      const expandRow = computed({
        get: () => store.expandRow,
        set: (newValue) => {
          mutations.setExpandRow(newValue);
        }
      });
  
      watch(expandRow, (newVal) => {
        hiddenTask.value = [];
        recursionRow(newVal.pid);
      });
      
      // 监听任务数量变化，更新虚拟滚动
      watch(() => filterTask.value.length, () => {
        updateVisibleRange();
      });
      
      // 监听虚拟滚动模式变化
      watch(useVirtualScroll, (newVal) => {
        if (newVal) {
          setTimeout(() => {
            updateVisibleRange();
          }, 0);
        }
      }, { immediate: true });
  
      const recursionRow = (id: any) => {
        let findRows = allTask.value.filter(obj => obj[mapFields.value['parentId']] === id);
        if (findRows && findRows.length > 0) {
          for (let i = 0; i < findRows.length; i++) {
            if (expandRow.value.expand === false) {
              hiddenTask.value.push(findRows[i]);
            }
            recursionRow(findRows[i][mapFields.value['id']]);
          }
        }
      };
  
      const setExpandRow = mutations.setExpandRow;
      
      onMounted(() => {
        if (containerRef.value) {
          const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
          if (scrollContainer) {
            scrollContainer.addEventListener('scroll', onScroll, { passive: true });
          }
        }
        // 延迟初始化，确保 DOM 已渲染
        setTimeout(() => {
          updateVisibleRange();
        }, 0);
      });
      
      onUnmounted(() => {
        if (containerRef.value) {
          const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
          if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', onScroll);
          }
        }
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        if (batchUpdateTimer) {
          clearTimeout(batchUpdateTimer);
        }
      });
  
      return {
        hiddenTask,
        componentKey,
        containerRef,
        allTask,
        timelineCellCount,
        scale,
        mode,
        startGanttDate,
        endGanttDate,
        mapFields,
        filterTask,
        expandRow,
        setExpandRow,
        recursionRow,
        getTaskType,
        TaskType,
        // 虚拟滚动相关
        useVirtualScroll,
        totalHeight,
        offsetY,
        visibleTasks,
        startIndex,
        endIndex
      };
    },
    components: { Bar, Milestone },
    mounted() {
      this.$nextTick(() => {
        // 可以在这里添加挂载后的逻辑
      });
    },
    activated() {
      this.componentKey++;
    }
  });
  </script>
  
  <style scoped>
  .bar-recursion-container {
    width: 100%;
  }
  
  .virtual-scroll-spacer {
    width: 100%;
  }
  </style>