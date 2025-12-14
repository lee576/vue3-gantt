<template>
    <div>
      <template v-for="(item) in filterTask" :key="item.id + scale">
        <BarFix 
          :startGanttDate="startGanttDate" 
          :endGanttDate="endGanttDate" 
          :row="item" 
          :rowHeight="rowHeight" 
        />
      </template>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch } from 'vue';
  import { store, mutations } from '../gantt/Store';
  import BarFix from '../gantt/BarFix.vue';
  
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
  
      const allTask = computed(() => store.tasks);
      const timelineCellCount = computed(() => store.timelineCellCount);
      const scale = computed(() => store.scale);
      const startGanttDate = computed(() => store.startGanttDate ? store.startGanttDate.toISOString() : undefined);
      const endGanttDate = computed(() => store.endGanttDate ? store.endGanttDate.toISOString() : undefined);
      const mapFields = computed(() => store.mapFields);
  
      // 优化：使用Set提高查找性能
      const hiddenTaskIds = computed(() => {
        return new Set(hiddenTask.value.map(obj => obj[mapFields.value.id]));
      });

      const filterTask = computed(() => {
        const hiddenIds = hiddenTaskIds.value;
        return store.tasks.filter(task => !hiddenIds.has(task[mapFields.value.id]));
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
        startGanttDate,
        endGanttDate,
        mapFields,
        filterTask,
        expandRow,
        setExpandRow,
        recursionRow
      };
    },
    components: { BarFix },
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