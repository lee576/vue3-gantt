<template>
  <div ref="tableBar" class="table">
    <div class="header" :style="{ height: `${headersHeight}px`, width: 'fit-content' }">
      <TimelineHeader :weekHeaders="weekHeaders" :hourHeaders="hourHeaders" :dayHeaders="dayHeaders"
        :monthHeaders="monthHeaders"></TimelineHeader>
    </div>
    <div class="content" :style="{ height: `calc(100% - ${headersHeight}px)`, width: 'fit-content', position: 'relative' }">
      <TableContent :rowHeight='rowHeight'></TableContent>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import type { Ref } from 'vue';
import TimelineHeader from './TimelineHeader.vue';
import { store } from './Store';
import dayjs from 'dayjs';
import sharedState from './ShareState';
import TableContent from './TableContent.vue';

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
    TimelineHeader,
    TableContent
  },
  setup(props) {
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
    
    // 容器尺寸
    const containerWidth = computed(() => {
      return store.timelineCellCount * scale.value + 100; // 添加额外空间
    });
    
    const containerHeight = computed(() => {
      return store.tasks.length * props.rowHeight + 100; // 使用实际行高
    });

    // 滚动到今天的方法
    const scrollToToday = () => {
      if (tableBar.value) {
        switch (mode.value) {
          case '月':
          case '日':
            tableBar.value.scrollLeft = Number(dayjs().diff(dayjs(startGanttDate.value), 'day')) * Number(scale.value);
            break;
          case '周':
            // 周模式：滚动到当前周
            const currentWeekStart = dayjs().startOf('isoWeek');
            const ganttWeekStart = dayjs(startGanttDate.value).startOf('isoWeek');
            tableBar.value.scrollLeft = Number(currentWeekStart.diff(ganttWeekStart, 'week')) * Number(scale.value);
            break;
          case '时':
            tableBar.value.scrollLeft = Number(dayjs().diff(dayjs(startGanttDate.value), 'hour')) * Number(scale.value);
            break;
        }
      }
    };

    watch(() => sharedState.shouldScrollToToday, (newValue) => {
      if (newValue) {
        scrollToToday();
        // 重置状态
        sharedState.shouldScrollToToday = false;
      }
    });

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
  /* 只添加右边框，顶部边框由 Gantt.vue toolbar border-bottom 提供 */
  border-right: 1px solid var(--border, #d0d0d0);

  .header {
    /* width 由内联样式设置为 fit-content，确保与内容宽度一致 */
    border: 0px;
  }

  .content {
    overflow-y: auto;
    overflow-x: auto;
  }
}
</style>