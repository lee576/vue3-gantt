<template>
    <div ref="barContent" @scroll="scroll()" @mouseover="mouseover()"
      v-if="tasks" class="content">
      <BarRecursionRow :key="`${mode}-${scale}-${timelineCellCount}`" :rowHeight="rowHeight" :tasks="tasks"></BarRecursionRow>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, ref, watch, computed, onMounted, provide, inject } from 'vue';
  import { store, mutations } from '../gantt/Store';
  import BarRecursionRow from '../gantt/BarRecursionRow.vue';

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
      BarRecursionRow
    },
    setup() {
      const barContent = ref<HTMLDivElement | null>(null);
      const scrollFlag = ref(true);

      const tasks = computed(() => store.tasks);
      const timelineCellCount = computed(() => store.timelineCellCount);
      const scale = computed(() => store.scale);
      const mode = computed(() => store.mode);
      const startGanttDate = computed(() => store.startGanttDate);
      const endGanttDate = computed(() => store.endGanttDate);
      const mapFields = computed(() => store.mapFields);

      // 定义一个 inject key
      const SCROLL_TOP_KEY = Symbol('SCROLL_TOP_KEY');

      // 提供一个函数来设置滚动条位置
      const setScrollTop = (scrollTop: number) => {
        if (barContent.value) {
          barContent.value.scrollTop = scrollTop;
        }
      };

      provide(SCROLL_TOP_KEY, setScrollTop);

      // 注入设置滚动条位置的函数
      const injectedSetScrollTop = inject<(scrollTop: number) => void>(SCROLL_TOP_KEY);

      watch(scrollFlag, (newVal) => {
        mutations.setScrollFlag(newVal);
      });

      onMounted(() => {
        if (injectedSetScrollTop) {
          // 这里可以处理外部注入的滚动条位置设置
        }
      });

      const getRootNode = () => {
        return tasks.value.filter(obj => obj[mapFields.value['parentId']] === '0');
      };

      // 优化：使用requestAnimationFrame优化滚动性能
      let rafId: number | null = null;
      const scroll = () => {
        if (scrollFlag.value) {
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            if (barContent.value && injectedSetScrollTop) {
              injectedSetScrollTop(barContent.value.scrollTop);
            }
            rafId = null;
          });
        }
      };

      const mouseover = () => {
        scrollFlag.value = true;
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
        mouseover
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
  }
  </style>