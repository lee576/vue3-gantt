<template>
  <div id="app" class="metro-app">
    <div class="metro-app-header">
      <div class="metro-app-title">
        <div class="metro-title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
          </svg>
        </div>
        <h1>项目甘特图管理系统</h1>
      </div>
      <div class="metro-app-actions">
        <button class="metro-btn metro-btn-primary" @click="taskManagement.openAddRootTaskDialog()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          新建根任务
        </button>
        <button class="metro-btn" @click="customFieldsManagement.openCustomFieldsDialog()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
          </svg>
          自定义字段
        </button>
        <button class="metro-btn" @click="refreshData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          刷新数据
        </button>
      </div>
    </div>
    <div class="metro-app-content">
      <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
    </div>

    <!-- 任务编辑/新建对话框 -->
    <TaskDialog :show="taskManagement.showTaskDialog.value" :isEditMode="taskManagement.isEditMode.value"
      :isRootTask="taskManagement.isRootTask.value" :taskForm="taskManagement.taskForm.value"
      :taskFormErrors="taskManagement.taskFormErrors.value" :customFields="customFieldsManagement.customFields.value"
      :availableParentTasks="availableParentTasks" @close="taskManagement.closeTaskDialog()" @save="handleSaveTask" />

    <!-- 删除确认对话框 -->
    <DeleteConfirmDialog :show="taskManagement.showDeleteDialog.value" :taskName="taskManagement.deleteTaskName.value"
      @close="taskManagement.closeDeleteDialog()" @confirm="handleConfirmDelete" />

    <!-- 自定义字段管理对话框 -->
    <CustomFieldsDialog :show="customFieldsManagement.showCustomFieldsDialog.value"
      :customFields="customFieldsManagement.customFields.value" :newField="customFieldsManagement.newField.value"
      :newOptionText="customFieldsManagement.newOptionText.value"
      :customFieldFormErrors="customFieldsManagement.customFieldFormErrors.value"
      :editingFieldIndex="customFieldsManagement.editingFieldIndex.value"
      :getFieldTypeLabel="customFieldsManagement.getFieldTypeLabel"
      @close="customFieldsManagement.closeCustomFieldsDialog()" @edit-field="customFieldsManagement.editCustomField"
      @delete-field="handleDeleteCustomField" @add-option="handleAddOption"
      @remove-option="customFieldsManagement.removeOption" @cancel-edit="customFieldsManagement.cancelEditField()"
      @add-field="handleAddCustomField" @update-field="handleUpdateCustomField" @save="handleSaveCustomFields"
      @update:newOptionText="(value) => customFieldsManagement.newOptionText.value = value" />

    <!-- 消息提示 -->
    <MessageToast :message="messageToast.message.value" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import Gantt, { type DataConfig, type StyleConfig, type EventConfig } from './components/gantt/core/Gantt.vue';
import { LinkType } from './components/gantt/types/Types';
import TaskDialog from './components/TaskDialog.vue';
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue';
import CustomFieldsDialog from './components/CustomFieldsDialog.vue';
import MessageToast from './components/MessageToast.vue';
import { useMessage } from './composables/useMessage';
import { useCustomFields } from './composables/useCustomFields';
import { useTaskManagement } from './composables/useTaskManagement';
import { taskApi } from './services/taskApi';

// 初始化 Composables
const messageToast = useMessage();
const customFieldsManagement = useCustomFields();

// 定义数据配置
const dataConfig = ref<DataConfig>({
  queryStartDate: '',
  queryEndDate: '',
  dataSource: [],
  dependencies: [],
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
    { title: '序号', width: 160, property: 'no', show: true, fixed: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }]
});

// 初始化任务管理
const taskManagement = useTaskManagement(customFieldsManagement.customFields, dataConfig);

// 计算属性：可用的父任务列表
const availableParentTasks = computed(() => {
  return dataConfig.value.dataSource.filter((task: any) =>
    task.type !== 'milestone' && (!taskManagement.taskForm.value.id || task.id !== taskManagement.taskForm.value.id)
  );
});

// 定义样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,
  rowHeight: 60,
  setBarColor: (row: Record<string, any>) => {
    const colorMap = {
      '紧急': 'red',
      '重要': 'blue',
      '一般': 'gray',
      '不重要': 'yellow'
    };
    return colorMap[row.level as keyof typeof colorMap] ?? 'black';
  }
});

// 更新任务表头,将自定义字段添加到列显示中
const updateTaskHeaders = () => {
  const baseHeaders = [
    { title: 'id', width: 100, property: 'id', show: false },
    { title: '父id', width: 100, property: 'parentId', show: false },
    { title: '序号', width: 160, property: 'no', show: true, fixed: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }
  ];

  const customFieldHeaders = customFieldsManagement.customFields.value.map(field => ({
    title: field.label,
    width: 120,
    property: `customField_${field.id}`,
    show: true,
    isCustomField: true,
    fieldId: field.id
  }));

  dataConfig.value.taskHeaders = [...baseHeaders, ...customFieldHeaders];
};

// 处理任务数据
const processTask = (task: any) => {
  const processedTask = { ...task };
  if (task.customFieldValues) {
    customFieldsManagement.customFields.value.forEach(field => {
      const value = task.customFieldValues[field.id];
      if (value !== undefined) {
        processedTask[`customField_${field.id}`] = value;
      }
    });
  }
  return processedTask;
};

// 任务对话框事件处理
const handleSaveTask = () => {
  taskManagement.saveTask(
    messageToast.showMessage,
    (msg) => messageToast.showMessage(msg, 'error'),
    processTask
  );
};

// 删除确认事件处理
const handleConfirmDelete = () => {
  taskManagement.confirmDelete(
    messageToast.showMessage,
    (msg) => messageToast.showMessage(msg, 'error')
  );
};

// 自定义字段管理事件处理
const handleDeleteCustomField = (index: number) => {
  if (customFieldsManagement.deleteCustomField) {
    if (customFieldsManagement.deleteCustomField(index, dataConfig.value.dataSource)) {
      messageToast.showMessage('字段删除成功', 'success');
    }
  }
};

const handleAddOption = () => {
  customFieldsManagement.addOption((msg) => messageToast.showMessage(msg, 'warning'));
};

const handleAddCustomField = () => {
  customFieldsManagement.addCustomField(
    messageToast.showMessage,
    (msg) => messageToast.showMessage(msg, 'error')
  );
};

const handleUpdateCustomField = () => {
  customFieldsManagement.updateCustomField(
    messageToast.showMessage,
    (msg) => messageToast.showMessage(msg, 'error')
  );
};

const handleSaveCustomFields = () => {
  customFieldsManagement.saveCustomFields(messageToast.showMessage);
  updateTaskHeaders();
};

// 刷新数据
const refreshData = async () => {
  try {
    const startDate = dataConfig.value.queryStartDate || dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dataConfig.value.queryEndDate || dayjs().endOf('month').format('YYYY-MM-DD');
    await eventConfig.value.queryTask(startDate, endDate, '月');
    messageToast.showMessage('数据刷新成功', 'success');
  } catch (error) {
    console.error('刷新数据失败:', error);
    messageToast.showMessage('刷新失败，请稍后重试', 'error');
  }
};

// 定义事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: () => {
    taskManagement.openAddRootTaskDialog();
  },
  addSubTask: (row: { id: string }) => {
    taskManagement.openAddSubTaskDialog(row.id);
  },
  removeTask: (row: { id: string }) => {
    taskManagement.openDeleteDialog(row.id);
  },
  editTask: (row: { id: string }) => {
    taskManagement.openEditTaskDialog(row.id);
  },
  updateProgress: async (detail) => {
    try {
      const response = await taskApi.updateProgress(detail.taskId, detail.newProgress);
      if (response.code === 200) {
        console.log('进度更新成功:', detail);
        messageToast.showMessage('进度更新成功', 'success');
      }
    } catch (error) {
      console.error('更新进度失败:', error);
      messageToast.showMessage('进度更新失败', 'error');
    }
  },
  queryTask: async (queryStart: string, queryEnd: string) => {
    dataConfig.value.queryStartDate = queryStart;
    dataConfig.value.queryEndDate = queryEnd;

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
        // ===== 里程碑依赖关系 =====
        { sourceTaskId: '2', targetTaskId: 'milestone-1', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '4', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
        { sourceTaskId: 'milestone-2', targetTaskId: '5', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '6', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '10', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
        { sourceTaskId: 'milestone-3', targetTaskId: '14', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '18', targetTaskId: 'milestone-4', type: LinkType.FINISH_TO_START },
        { sourceTaskId: 'milestone-4', targetTaskId: '19', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '22', targetTaskId: 'milestone-5', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '32', targetTaskId: 'milestone-6', type: LinkType.FINISH_TO_START },

        // ===== 完成-开始 (FINISH_TO_START) =====
        { sourceTaskId: '2', targetTaskId: '3', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '3', targetTaskId: '4', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '1', targetTaskId: '5', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '7', targetTaskId: '8', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '11', targetTaskId: '12', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '12', targetTaskId: '13', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '5', targetTaskId: '14', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '15', targetTaskId: '16', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '16', targetTaskId: '17', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '14', targetTaskId: '19', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '20', targetTaskId: '21', type: LinkType.FINISH_TO_START },
        { sourceTaskId: '21', targetTaskId: '22', type: LinkType.FINISH_TO_START },

        // ===== 开始-开始 (START_TO_START) =====
        { sourceTaskId: '6', targetTaskId: '10', type: LinkType.START_TO_START },
        { sourceTaskId: '8', targetTaskId: '9', type: LinkType.START_TO_START },
        { sourceTaskId: '17', targetTaskId: '18', type: LinkType.START_TO_START },
        { sourceTaskId: '27', targetTaskId: '28', type: LinkType.START_TO_START },
        { sourceTaskId: '31', targetTaskId: '32', type: LinkType.START_TO_START },

        // ===== 完成-完成 (FINISH_TO_FINISH) =====
        { sourceTaskId: '6', targetTaskId: '10', type: LinkType.FINISH_TO_FINISH },
        { sourceTaskId: '26', targetTaskId: '19', type: LinkType.FINISH_TO_FINISH },
        { sourceTaskId: '24', targetTaskId: '25', type: LinkType.FINISH_TO_FINISH },

        // ===== 开始-完成 (START_TO_FINISH) =====
        { sourceTaskId: '19', targetTaskId: '23', type: LinkType.START_TO_FINISH },
        { sourceTaskId: '31', targetTaskId: '29', type: LinkType.START_TO_FINISH }
      ]
    };

    dataConfig.value.dataSource = customFieldsManagement.processTasksWithCustomFields(mockResponse.tasks);
    dataConfig.value.dependencies = mockResponse.dependencies;
  },
  barDate: async (id: string, startDate: string, endDate: string) => {
    try {
      const response = await taskApi.updateTaskDate(id, startDate, endDate);
      if (response.code === 200) {
        const task = dataConfig.value.dataSource.find((t: any) => t.id === id);
        if (task) {
          task.start_date = startDate;
          task.end_date = endDate;
        }
        console.log('任务日期更新成功:', id, startDate, endDate);
        messageToast.showMessage('任务日期更新成功', 'success');
      }
    } catch (error) {
      console.error('更新任务日期失败:', error);
      messageToast.showMessage('日期更新失败', 'error');
    }
  },
  allowChangeTaskDate: (allow: boolean) => {
    console.log('允许改变任务日期:', allow);
  }
});

onMounted(() => {
  // 加载自定义字段配置
  customFieldsManagement.loadCustomFields();
  updateTaskHeaders();

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
