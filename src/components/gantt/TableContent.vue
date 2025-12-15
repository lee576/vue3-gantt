<template>
    <div ref="barContent" @scroll="scroll()" @mouseover="mouseover()"
      v-if="tasks" class="content" style="position: relative;">
      <BarRecursionRow :key="`${mode}-${scale}-${timelineCellCount}`" :rowHeight="rowHeight" :tasks="tasks"></BarRecursionRow>
      <!-- 任务连线层 -->
      <TaskLinks 
        :containerWidth="containerWidth" 
        :containerHeight="containerHeight"
        :linkConfig="linkConfig"
      />
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, ref, watch, computed, onMounted } from 'vue';
  import { store } from '../gantt/Store';
  import { useScrollState } from './ShareState';
  import { useLinkConfig } from './LinkConfig';
  import BarRecursionRow from '../gantt/BarRecursionRow.vue';
  import TaskLinks from './TaskLinks.vue';

  export default defineComponent({
    props: {
      rowHeight: {
        type: Number,
        required: true
      },
      headers: {
        type: Array,
        default: () => []
      },
    },
    components: {
      BarRecursionRow,
      TaskLinks
    },
    setup() {
      const barContent = ref<HTMLDivElement | null>(null);
      const { scrollTop, scrollFlag, setScrollTop, setScrollFlag } = useScrollState();
      const { config: linkConfig } = useLinkConfig();

      const tasks = computed(() => store.tasks);
      const timelineCellCount = computed(() => store.timelineCellCount);
      const scale = computed(() => store.scale);
      const mode = computed(() => store.mode);
      const startGanttDate = computed(() => store.startGanttDate);
      const endGanttDate = computed(() => store.endGanttDate);
      const mapFields = computed(() => store.mapFields);
      
      // 计算容器尺寸
      const containerWidth = computed(() => {
        return timelineCellCount.value * scale.value;
      });
      
      const containerHeight = computed(() => {
        return tasks.value.length * 60; // 假设行高为60
      });

      // 监听共享的滚动位置变化
      watch(scrollTop, (newValue) => {
        if (scrollFlag.value && barContent.value) {
          barContent.value.scrollTop = newValue;
        }
      });

      onMounted(() => {
        if (barContent.value) {
          // 初始化时同步滚动位置
          barContent.value.scrollTop = scrollTop.value;
        }
      });

      const getRootNode = () => {
        return tasks.value.filter(obj => obj[mapFields.value['parentId']] === '0');
      };

      // 优化：使用requestAnimationFrame优化滚动性能
      let rafId: number | null = null;
      const scroll = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          if (barContent.value) {
            setScrollFlag(false); // 标记当前面板为主动滚动
            setScrollTop(barContent.value.scrollTop);
          }
          rafId = null;
        });
      };

      const mouseover = () => {
        // 鼠标悬停时不改变滚动标志，让滚动事件处理
      };

      return {
        barContent,
        scrollFlag,
        tasks,
        timelineCellCount,
        scale,
        mode,
        startGanttDate,
        endGanttDate,
        mapFields,
        getRootNode,
        scroll,
        mouseover,
        setScrollFlag,
        containerWidth,
        containerHeight,
        linkConfig
      };
    }
  });
  </script>
  <style lang="scss" scoped>
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    margin: 0px 0px -1px 0px;
    font-size: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  </style>