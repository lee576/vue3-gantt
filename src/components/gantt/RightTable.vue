<template>
    <div ref="tableBar" class="table">
      <div class="header" :style="{ height: `${headersHeight}px` }">
        <div style="width: 100%;border-top: 1px solid #cecece;margin:0px 0px -1px -1px;"></div>
        <TimelineHeader :weekHeaders="weekHeaders" :hourHeaders="hourHeaders" :dayHeaders="dayHeaders" :monthHeaders="monthHeaders"></TimelineHeader>
        <div style="width: 100%;border-top: 1px solid #cecece;margin:0px 0px -1px -1px;"></div>
      </div>
      <div class="content" :style="{ height: `calc(100% - ${headersHeight}px)`, width: 'fit-content' }">

      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed, inject, provide, Ref } from 'vue';
  import TimelineHeader from './TimelineHeader.vue';
  import { store } from './Store';
  import dayjs from 'dayjs';
  
  export default defineComponent({
    props: {
      headersHeight: {
        type: Number,
        default: 50
      },
      rowHeight: {
        type: Number,
        default: 50
      }
    },
    components: {
      TimelineHeader
    },
    setup() {
      // 引用 tableBar
      const tableBar: Ref<HTMLDivElement | null> = ref(null);
  
      // 计算属性
      const dayHeaders = computed(() => store.dayHeaders);
      const weekHeaders = computed(() => store.weekHeaders);
      const monthHeaders = computed(() => store.monthHeaders);
      const hourHeaders = computed(() => store.hourHeaders);
      const startGanttDate = computed(() => store.startGanttDate);
      const mode = computed(() => store.mode);
      const scale = computed(() => store.scale);
  
      // 滚动到今天的方法
      const scrollToToday = () => {
        if (tableBar.value) {
          switch (mode.value) {
            case '月':
            case '日':
              tableBar.value.scrollLeft = Number(dayjs().diff(dayjs(startGanttDate.value), 'day')) * Number(scale.value);
              break;
            case '时':
              tableBar.value.scrollLeft = Number(dayjs().diff(dayjs(startGanttDate.value), 'hour')) * Number(scale.value);
              break;
          }
        }
      };
  
      onMounted(() => {

      });
  
      return {
        tableBar,
        dayHeaders,
        weekHeaders,
        monthHeaders,
        hourHeaders,
        startGanttDate,
        mode,
        scale,
        scrollToToday
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .table {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  
    .header {
      width: 100%;
      border: 0px;
    }
  
    .content {
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  </style>