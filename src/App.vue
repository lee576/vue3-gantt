<template>
  <div id="app">
    <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import dayjs from 'dayjs';
import Gantt, { type DataConfig, type StyleConfig, type EventConfig } from './components/gantt/Gantt.vue';

// 定义样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,
  rowHeight: 60,
  setBarColor: (row: Record<string, any>) => {
    // 自定义颜色映射
    const colorMap = {
      '紧急': 'red',
      '重要': 'blue',
      '一般': 'gray',
      '不重要': 'yellow'
    };
    return colorMap[row.level as keyof typeof colorMap] ?? 'black';
  }
});

// 定义数据配置
const dataConfig = ref<DataConfig>({
  queryStartDate: '',
  queryEndDate: '',
  dataSource: [],
  // 数据源字段映射
  mapFields: {
    id: 'id',
    parentId: 'pid',
    task: 'taskNo',
    priority: 'level',
    startdate: 'start_date',
    enddate: 'end_date',
    takestime: 'spend_time',
    progress: 'job_progress'
  },
  taskHeaders: [
    { title: 'id', width: 100, property: 'id', show: false },
    { title: '父id', width: 100, property: 'parentId', show: false },
    { title: '序号', width: 80, property: 'no', show: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }]
});

// 定义事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: () => {
    console.log('root');
  },
  addSubTask: (row: { id: string }) => {
    console.log(row);
  },
  removeTask: (row: { id: string }) => {
    console.log(row);
  },
  editTask: (row: { id: string }) => {
    console.log(row);
  },
  queryTask: async (queryStart: string, queryEnd: string) => {
    console.log('queryTask called:', queryStart, queryEnd);
    dataConfig.value.queryStartDate = queryStart;
    dataConfig.value.queryEndDate = queryEnd;
    // 使用当前月份的日期作为示例数据
    const currentMonth = dayjs().format('YYYY-MM');
    dataConfig.value.dataSource = [
      {
        id: '1',
        pid: '0',
        taskNo: '任务1',
        level: '重要',
        start_date: `${currentMonth}-05 08:00:00`,
        end_date: `${currentMonth}-10 18:00:00`,
        job_progress: '0.3',
        spend_time: null
      },
      {
        id: '2',
        pid: '1',
        taskNo: '子任务1-1',
        level: '一般',
        start_date: `${currentMonth}-09 08:00:00`,
        end_date: `${currentMonth}-12 18:00:00`,
        job_progress: '0.7',
        spend_time: null
      },
      {
        id: '3',
        pid: '1',
        taskNo: '子任务1-2',
        level: '紧急',
        start_date: `${currentMonth}-05 08:00:00`,
        end_date: `${currentMonth}-08 18:00:00`,
        job_progress: '0.9',
        spend_time: null
      },
      {
        id: '4',
        pid: '0',
        taskNo: '任务2',
        level: '重要',
        start_date: `${currentMonth}-15 08:00:00`,
        end_date: `${currentMonth}-20 18:00:00`,
        job_progress: '0.3',
        spend_time: null
      },
      {
        id: '5',
        pid: '4',
        taskNo: '子任务2-1',
        level: '一般',
        start_date: `${currentMonth}-15 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.55',
        spend_time: null
      }
    ];
    console.log('dataSource updated:', dataConfig.value.dataSource);
  },
  barDate: (id: string, startDate: string, endDate: string) => {
    console.log(id);
    console.log(startDate);
    console.log(endDate);
  },
  allowChangeTaskDate: (row: { id: string }) => {
    console.log(row);
    return true;
  }
});

onMounted(() => {
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
  dataConfig.value.queryStartDate = startDate;
  dataConfig.value.queryEndDate = endDate;
  // 触发查询以加载数据
  eventConfig.value.queryTask(startDate, endDate, '月');
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}
#app, html, body {
  height: 100%;
  width: 100%;
}
* {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
