<template>
  <div id="app">
    <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Gantt from './components/gantt/Gantt.vue';
import dayjs from 'dayjs';
import type { DataConfig, StyleConfig, EventConfig } from './components/gantt/Types';

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
    } as const;
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
  taskHeaders: () => [
    { title: 'id', width: 100, property: 'id', show: false },
    { title: '父id', width: 100, property: 'parentId', show: false },
    { title: '序号', width: 80, property: 'no', show: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }
  ]
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
    dataConfig.value.queryStartDate = queryStart;
    dataConfig.value.queryEndDate = queryEnd;
    dataConfig.value.dataSource = [
      {
        id: '1',
        pid: '0',
        taskNo: '1',
        level: '重要',
        start_date: '2025-03-04 05:00:00',
        end_date: '2025-04-08 00:00:00',
        job_progress: '0.3',
        spend_time: null
      },
      {
        id: '2',
        pid: '1',
        taskNo: '2',
        level: '一般',
        start_date: '2025-11-06 05:00:00',
        end_date: '2022-11-10 00:00:00',
        job_progress: '0.7',
        spend_time: null
      },
      {
        id: '3',
        pid: '1',
        taskNo: '3',
        level: '紧急',
        start_date: '2022-11-06 05:00:00',
        end_date: '2022-11-10 00:00:00',
        job_progress: '0.9',
        spend_time: null
      },
      {
        id: '4',
        pid: '0',
        taskNo: '4',
        level: '重要',
        start_date: '2022-11-02 05:00:00',
        end_date: '2022-11-15 00:00:00',
        job_progress: '0.3',
        spend_time: null
      },
      {
        id: '5',
        pid: '4',
        taskNo: '4',
        level: '一般',
        start_date: '2022-11-06 05:00:00',
        end_date: '2022-11-12 00:00:00',
        job_progress: '0.55',
        spend_time: null
      }
    ];
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
  dataConfig.value.queryStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
  dataConfig.value.queryEndDate = dayjs().endOf('month').format('YYYY-MM-DD');
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