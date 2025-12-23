<template>
  <div ref="tableBar" class="table">
    <div class="header" :style="{ height: `${headersHeight}px`, width: 'fit-content', minWidth: '100%' }">
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
import { store } from '../state/Store';
import dayjs from 'dayjs';
import sharedState from '../state/ShareState';
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
    
    // 容器尺寸（预留用于未来扩展）
    void (store.timelineCellCount * scale.value + 100); // containerWidth
    void (store.tasks.length * props.rowHeight + 100); // containerHeight

    // 滚动到今天的方法
    const scrollToToday = () => {
      if (tableBar.value) {
        switch (mode.value) {
          case '季度':
            // 季度模式：滚动到当前月
            const ganttStartMonth = dayjs(startGanttDate.value).startOf('month');
            const currentMonth = dayjs().startOf('month');
            const monthsDiff = (currentMonth.year() - ganttStartMonth.year()) * 12 + 
                               (currentMonth.month() - ganttStartMonth.month());
            tableBar.value.scrollLeft = monthsDiff * Number(scale.value);
            break;
          case '月':
            // 月模式：滚动到当前月
            const ganttStartMonth2 = dayjs(startGanttDate.value).startOf('month');
            const currentMonth2 = dayjs().startOf('month');
            const monthsDiff2 = (currentMonth2.year() - ganttStartMonth2.year()) * 12 + 
                               (currentMonth2.month() - ganttStartMonth2.month());
            tableBar.value.scrollLeft = monthsDiff2 * Number(scale.value);
            break;
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
  /* 添加背景色填充右侧空白区域 */
  background-color: var(--bg-content, #ffffff);

  .header {
    /* width 由内联样式设置为 fit-content，确保与内容宽度一致 */
    border: 0px;
    /* 表头也需要背景色 */
    background-color: var(--bg-secondary, #f5f5f5);
  }

  .content {
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--bg-content, #ffffff);
  }
}
</style>