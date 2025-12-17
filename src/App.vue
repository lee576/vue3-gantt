<template>
  <div id="app" class="metro-app">
    <div class="metro-app-header">
      <div class="metro-app-title">
        <div class="metro-title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
        </div>
        <h1>项目甘特图管理系统</h1>
      </div>
      <div class="metro-app-actions">
        <button class="metro-btn metro-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          新建项目
        </button>
        <button class="metro-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
          设置
        </button>
      </div>
    </div>
    <div class="metro-app-content">
      <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import dayjs from 'dayjs';
import Gantt, { type DataConfig, type StyleConfig, type EventConfig } from './components/gantt/Gantt.vue';
import { LinkType } from './components/gantt/Types';

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
  // 任务依赖关系（由后端返回）
  dependencies: [],
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
    { title: '序号', width: 160, property: 'no', show: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }]
});

// 定义事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: () => {
    // 添加根任务
  },
  addSubTask: (row: { id: string }) => {
    // 添加子任务
  },
  removeTask: (row: { id: string }) => {
    // 删除任务
  },
  editTask: (row: { id: string }) => {
    // 编辑任务
  },
  updateProgress: (detail) => {
    // 这里可以调用服务端API更新进度
    // 例如: await api.updateTaskProgress(detail.taskId, detail.newProgress);
  },
  queryTask: async (queryStart: string, queryEnd: string) => {
    dataConfig.value.queryStartDate = queryStart;
    dataConfig.value.queryEndDate = queryEnd;
    
    // 模拟后端 API 调用
    // const response = await fetch('/api/gantt/tasks', {
    //   method: 'POST',
    //   body: JSON.stringify({ startDate: queryStart, endDate: queryEnd })
    // }).then(res => res.json());
    
    // 模拟后端返回的完整数据结构
    const currentMonth = dayjs().format('YYYY-MM');
    const mockResponse = {
      tasks: [
      // 第一个主任务组 - 项目规划阶段
      {
        id: '1',
        pid: '0',
        taskNo: '项目规划阶段',
        level: '重要',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '0.85',
        spend_time: null
      },
      {
        id: '2',
        pid: '1',
        taskNo: '需求分析',
        level: '紧急',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-02 18:00:00`,
        job_progress: '1.0',
        spend_time: null
      },
      // 里程碑：需求分析完成
      {
        id: 'milestone-1',
        pid: '1',
        taskNo: '🎯 需求分析完成',
        level: '紧急',
        start_date: `${currentMonth}-02 18:00:00`,
        end_date: `${currentMonth}-02 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone'
      },
      {
        id: '3',
        pid: '1',
        taskNo: '技术选型',
        level: '重要',
        start_date: `${currentMonth}-03 08:00:00`,
        end_date: `${currentMonth}-04 18:00:00`,
        job_progress: '0.9',
        spend_time: null
      },
      {
        id: '4',
        pid: '1',
        taskNo: '架构设计',
        level: '重要',
        start_date: `${currentMonth}-05 08:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '0.7',
        spend_time: null
      },
      // 里程碑：项目规划完成
      {
        id: 'milestone-2',
        pid: '0',
        taskNo: '✅ 项目规划阶段完成',
        level: '重要',
        start_date: `${currentMonth}-06 18:00:00`,
        end_date: `${currentMonth}-06 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone'
      },
      
      // 第二个主任务组 - 开发阶段
      {
        id: '5',
        pid: '0',
        taskNo: '开发阶段',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null
      },
      {
        id: '6',
        pid: '5',
        taskNo: '前端开发',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.6',
        spend_time: null
      },
      {
        id: '7',
        pid: '6',
        taskNo: '页面布局',
        level: '一般',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null
      },
      {
        id: '8',
        pid: '6',
        taskNo: '组件开发',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-13 18:00:00`,
        job_progress: '0.7',
        spend_time: null
      },
      {
        id: '9',
        pid: '6',
        taskNo: '状态管理',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.4',
        spend_time: null
      },
      {
        id: '10',
        pid: '5',
        taskNo: '后端开发',
        level: '重要',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null
      },
      {
        id: '11',
        pid: '10',
        taskNo: 'API设计',
        level: '紧急',
        start_date: `${currentMonth}-07 08:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null
      },
      // 里程碑：API设计完成
      {
        id: 'milestone-3',
        pid: '10',
        taskNo: '🔧 API设计完成',
        level: '紧急',
        start_date: `${currentMonth}-09 18:00:00`,
        end_date: `${currentMonth}-09 18:00:00`,
        job_progress: '1.0',
        spend_time: null,
        type: 'milestone'
      },
      {
        id: '12',
        pid: '10',
        taskNo: '数据库设计',
        level: '重要',
        start_date: `${currentMonth}-10 08:00:00`,
        end_date: `${currentMonth}-12 18:00:00`,
        job_progress: '0.8',
        spend_time: null
      },
      {
        id: '13',
        pid: '10',
        taskNo: '业务逻辑实现',
        level: '重要',
        start_date: `${currentMonth}-13 08:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.3',
        spend_time: null
      },
      // 里程碑：开发阶段完成
      {
        id: 'milestone-4',
        pid: '0',
        taskNo: '🚀 开发阶段完成',
        level: '重要',
        start_date: `${currentMonth}-18 18:00:00`,
        end_date: `${currentMonth}-18 18:00:00`,
        job_progress: '0.5',
        spend_time: null,
        type: 'milestone'
      },
      
      // 第三个主任务组 - 测试阶段
      {
        id: '14',
        pid: '0',
        taskNo: '测试阶段',
        level: '重要',
        start_date: `${currentMonth}-19 08:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.3',
        spend_time: null
      },
      {
        id: '15',
        pid: '14',
        taskNo: '单元测试',
        level: '重要',
        start_date: `${currentMonth}-19 08:00:00`,
        end_date: `${currentMonth}-20 18:00:00`,
        job_progress: '0.8',
        spend_time: null
      },
      {
        id: '16',
        pid: '14',
        taskNo: '集成测试',
        level: '重要',
        start_date: `${currentMonth}-21 08:00:00`,
        end_date: `${currentMonth}-22 18:00:00`,
        job_progress: '0.4',
        spend_time: null
      },
      {
        id: '17',
        pid: '14',
        taskNo: '性能测试',
        level: '一般',
        start_date: `${currentMonth}-23 08:00:00`,
        end_date: `${currentMonth}-24 12:00:00`,
        job_progress: '0.2',
        spend_time: null
      },
      {
        id: '18',
        pid: '14',
        taskNo: '用户验收测试',
        level: '紧急',
        start_date: `${currentMonth}-23 08:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.1',
        spend_time: null
      },
      // 里程碑：测试阶段完成
      {
        id: 'milestone-5',
        pid: '0',
        taskNo: '✔️ 测试阶段完成',
        level: '重要',
        start_date: `${currentMonth}-24 18:00:00`,
        end_date: `${currentMonth}-24 18:00:00`,
        job_progress: '0.3',
        spend_time: null,
        type: 'milestone'
      },
      
      // 第四个主任务组 - 部署上线
      {
        id: '19',
        pid: '0',
        taskNo: '部署上线',
        level: '紧急',
        start_date: `${currentMonth}-25 08:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '20',
        pid: '19',
        taskNo: '环境准备',
        level: '重要',
        start_date: `${currentMonth}-25 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '21',
        pid: '19',
        taskNo: '代码部署',
        level: '紧急',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-26 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '22',
        pid: '19',
        taskNo: '上线验证',
        level: '紧急',
        start_date: `${currentMonth}-27 08:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      // 里程碑：项目上线
      {
        id: 'milestone-6',
        pid: '0',
        taskNo: '🎉 项目正式上线',
        level: '紧急',
        start_date: `${currentMonth}-27 18:00:00`,
        end_date: `${currentMonth}-27 18:00:00`,
        job_progress: '0.0',
        spend_time: null,
        type: 'milestone'
      },
      
      // 第五个主任务组 - 维护优化
      {
        id: '23',
        pid: '0',
        taskNo: '维护优化',
        level: '一般',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '24',
        pid: '23',
        taskNo: '性能监控',
        level: '重要',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 12:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '25',
        pid: '23',
        taskNo: '用户反馈收集',
        level: '一般',
        start_date: `${currentMonth}-28 08:00:00`,
        end_date: `${currentMonth}-30 12:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      
      // 第六个主任务组 - 文档编写（贯穿整个项目）
      {
        id: '26',
        pid: '0',
        taskNo: '文档编写',
        level: '一般',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.5',
        spend_time: null
      },
      {
        id: '27',
        pid: '26',
        taskNo: '技术文档',
        level: '重要',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-15 18:00:00`,
        job_progress: '0.7',
        spend_time: null
      },
      {
        id: '28',
        pid: '26',
        taskNo: '用户手册',
        level: '一般',
        start_date: `${currentMonth}-01 08:00:00`,
        end_date: `${currentMonth}-20 18:00:00`,
        job_progress: '0.4',
        spend_time: null
      },
      {
        id: '29',
        pid: '26',
        taskNo: '部署指南',
        level: '一般',
        start_date: `${currentMonth}-15 08:00:00`,
        end_date: `${currentMonth}-25 18:00:00`,
        job_progress: '0.3',
        spend_time: null
      },
      
      // 第七个主任务组 - 培训支持
      {
        id: '30',
        pid: '0',
        taskNo: '培训支持',
        level: '一般',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '31',
        pid: '30',
        taskNo: '用户培训',
        level: '重要',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-28 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      },
      {
        id: '32',
        pid: '30',
        taskNo: '技术支持',
        level: '重要',
        start_date: `${currentMonth}-26 08:00:00`,
        end_date: `${currentMonth}-30 18:00:00`,
        job_progress: '0.0',
        spend_time: null
      }
    ],
    dependencies: [
      // ===== 完成-开始 (FINISH_TO_START) - 最常见的依赖关系 =====
      // 需求分析完成后才能开始技术选型
      { sourceTaskId: '2', targetTaskId: '3', type: LinkType.FINISH_TO_START },
      // 技术选型完成后才能开始架构设计
      { sourceTaskId: '3', targetTaskId: '4', type: LinkType.FINISH_TO_START },
      // 项目规划完成后才能开始开发阶段
      { sourceTaskId: '1', targetTaskId: '5', type: LinkType.FINISH_TO_START },
      // 页面布局完成后才能开始组件开发
      { sourceTaskId: '7', targetTaskId: '8', type: LinkType.FINISH_TO_START },
      // API设计完成后才能开始数据库设计
      { sourceTaskId: '11', targetTaskId: '12', type: LinkType.FINISH_TO_START },
      // 数据库设计完成后才能开始业务逻辑实现
      { sourceTaskId: '12', targetTaskId: '13', type: LinkType.FINISH_TO_START },
      // 开发阶段完成后才能开始测试阶段
      { sourceTaskId: '5', targetTaskId: '14', type: LinkType.FINISH_TO_START },
      // 单元测试完成后才能开始集成测试
      { sourceTaskId: '15', targetTaskId: '16', type: LinkType.FINISH_TO_START },
      // 集成测试完成后才能开始性能测试
      { sourceTaskId: '16', targetTaskId: '17', type: LinkType.FINISH_TO_START },
      // 测试阶段完成后才能开始部署上线
      { sourceTaskId: '14', targetTaskId: '19', type: LinkType.FINISH_TO_START },
      // 环境准备完成后才能开始代码部署
      { sourceTaskId: '20', targetTaskId: '21', type: LinkType.FINISH_TO_START },
      // 代码部署完成后才能开始上线验证
      { sourceTaskId: '21', targetTaskId: '22', type: LinkType.FINISH_TO_START },
      
      // ===== 开始-开始 (START_TO_START) - 两个任务同时开始 =====
      // 前端开发和后端开发同时开始
      { sourceTaskId: '6', targetTaskId: '10', type: LinkType.START_TO_START },
      // 组件开发和状态管理同时开始
      { sourceTaskId: '8', targetTaskId: '9', type: LinkType.START_TO_START },
      // 性能测试和用户验收测试同时开始
      { sourceTaskId: '17', targetTaskId: '18', type: LinkType.START_TO_START },
      // 技术文档和用户手册同时开始编写
      { sourceTaskId: '27', targetTaskId: '28', type: LinkType.START_TO_START },
      // 用户培训和技术支持同时开始
      { sourceTaskId: '31', targetTaskId: '32', type: LinkType.START_TO_START },
      
      // ===== 完成-完成 (FINISH_TO_FINISH) - 两个任务同时完成 =====
      // 前端开发和后端开发必须同时完成才能进入测试
      { sourceTaskId: '6', targetTaskId: '10', type: LinkType.FINISH_TO_FINISH },
      // 所有文档必须在部署上线前完成
      { sourceTaskId: '26', targetTaskId: '19', type: LinkType.FINISH_TO_FINISH },
      // 性能监控和用户反馈收集同时完成
      { sourceTaskId: '24', targetTaskId: '25', type: LinkType.FINISH_TO_FINISH },
      
      // ===== 开始-完成 (START_TO_FINISH) - 较少使用，后续任务开始后前置任务才能完成 =====
      // 部署上线开始后，维护优化才能完成准备
      { sourceTaskId: '19', targetTaskId: '23', type: LinkType.START_TO_FINISH },
      // 用户培训开始后，部署指南才能最终完成
      { sourceTaskId: '31', targetTaskId: '29', type: LinkType.START_TO_FINISH }
    ]
    };
    
    // 使用后端返回的数据
    dataConfig.value.dataSource = mockResponse.tasks;
    dataConfig.value.dependencies = mockResponse.dependencies;
  },
  barDate: (id: string, startDate: string, endDate: string) => {
    // 任务日期变更
  },
  allowChangeTaskDate: (allow: boolean) => {
    // 允许改变任务日期
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

<style scoped>
.metro-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f8f8;
}

.metro-app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  border-bottom: 1px solid #d0d0d0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 70px;
}

.metro-app-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metro-title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(145deg, #0078d4, #106ebe);
  color: #ffffff;
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.metro-app-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Segoe UI', sans-serif;
}

.metro-app-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.metro-btn-primary {
  background: linear-gradient(145deg, #0078d4, #106ebe) !important;
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.metro-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-family: 'Segoe UI', sans-serif;
  font-weight: 600;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  border: 1px solid #d0d0d0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metro-btn:hover {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  color: #333333;
}

.metro-app-content {
  flex: 1;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  margin: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
