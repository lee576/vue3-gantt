<template>
    <div>
      <template v-for="(item) in filterTask" :key="item.id">
        <!-- 根据任务类型渲染不同组件 -->
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
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch, inject } from 'vue';
  import { store, mutations } from '../state/Store';
  import Bar from './Bar.vue';
  import Milestone from './Milestone.vue';
  import { TaskType } from '../types/Types';
  import { Symbols } from '../state/Symbols';
  
  export default defineComponent({
    name: 'BarRecursionRow',
    props: {
      rowHeight: {
        type: Number as () => number,
        default: 0
      },
    },
    setup() {
      
      const hiddenTask = ref<any[]>([]);
      const componentKey = ref(0);
      
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
  
      return {
        hiddenTask,
        componentKey,
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
        TaskType // 导出 TaskType 枚举供模板使用
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