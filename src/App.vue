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
              d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
            />
          </svg>
          自定义字段
        </button>
        <button class="metro-btn" @click="togglePerformanceTest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4h2v4zm0-6h-2V7h2v4z"
            />
          </svg>
          {{ isPerformanceTest ? '切换正常数据' : '性能测试(1000条)' }}
        </button>
        <button class="metro-btn" @click="refreshData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          刷新数据
        </button>
      </div>
    </div>
    <div class="metro-app-content">
      <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
    </div>

    <!-- 任务编辑/新建对话框 -->
    <TaskDialog
      :show="taskManagement.showTaskDialog.value"
      :isEditMode="taskManagement.isEditMode.value"
      :isRootTask="taskManagement.isRootTask.value"
      :taskForm="taskManagement.taskForm.value"
      :taskFormErrors="taskManagement.taskFormErrors.value"
      :customFields="customFieldsManagement.customFields.value"
      :availableParentTasks="availableParentTasks"
      @close="taskManagement.closeTaskDialog()"
      @save="handleSaveTask"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmDialog
      :show="taskManagement.showDeleteDialog.value"
      :taskName="taskManagement.deleteTaskName.value"
      @close="taskManagement.closeDeleteDialog()"
      @confirm="handleConfirmDelete"
    />

    <!-- 自定义字段管理对话框 -->
    <CustomFieldsDialog
      :show="customFieldsManagement.showCustomFieldsDialog.value"
      :customFields="customFieldsManagement.customFields.value"
      :newField="customFieldsManagement.newField.value"
      :newOptionText="customFieldsManagement.newOptionText.value"
      :customFieldFormErrors="customFieldsManagement.customFieldFormErrors.value"
      :editingFieldIndex="customFieldsManagement.editingFieldIndex.value"
      :getFieldTypeLabel="customFieldsManagement.getFieldTypeLabel"
      @close="customFieldsManagement.closeCustomFieldsDialog()"
      @edit-field="customFieldsManagement.editCustomField"
      @delete-field="handleDeleteCustomField"
      @add-option="handleAddOption"
      @remove-option="customFieldsManagement.removeOption"
      @cancel-edit="customFieldsManagement.cancelEditField()"
      @add-field="handleAddCustomField"
      @update-field="handleUpdateCustomField"
      @save="handleSaveCustomFields"
      @update:newOptionText="value => (customFieldsManagement.newOptionText.value = value)"
    />

    <!-- 消息提示 -->
    <MessageToast :message="messageToast.message.value" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import DateUtils from './components/gantt/utils/dateUtils'
import Gantt, {
  type DataConfig,
  type StyleConfig,
  type EventConfig,
} from './components/gantt/core/Gantt.vue'
import TaskDialog from './components/TaskDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'
import CustomFieldsDialog from './components/CustomFieldsDialog.vue'
import MessageToast from './components/MessageToast.vue'
import { useMessage } from './composables/useMessage'
import { useCustomFields } from './composables/useCustomFields'
import { useTaskManagement } from './composables/useTaskManagement'
import { taskApi } from './services/taskApi'
import { getMockResponse, getPerformanceTestResponse } from './mock/mockData'

// 初始化 Composables
const messageToast = useMessage()
const customFieldsManagement = useCustomFields()

// 性能测试模式
const isPerformanceTest = ref(false)

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
    progress: 'job_progress',
  },
  taskHeaders: [
    { title: 'id', width: 100, property: 'id', show: false },
    { title: '父id', width: 100, property: 'parentId', show: false },
    { title: '序号', width: 160, property: 'no', show: true, fixed: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true },
  ],
})

// 初始化任务管理
const taskManagement = useTaskManagement(customFieldsManagement.customFields, dataConfig)

// 计算属性：可用的父任务列表
const availableParentTasks = computed(() => {
  return dataConfig.value.dataSource.filter(
    (task: any) =>
      task.type !== 'milestone' &&
      (!taskManagement.taskForm.value.id || task.id !== taskManagement.taskForm.value.id)
  )
})

// 定义样式配置
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,
  rowHeight: 60,
  setBarColor: (row: Record<string, any>) => {
    const colorMap = {
      紧急: 'red',
      重要: 'blue',
      一般: 'gray',
      不重要: 'yellow',
    }
    return colorMap[row.level as keyof typeof colorMap] ?? 'black'
  },
})

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
    { title: '耗时', width: 90, property: 'takestime', show: true },
  ]

  const customFieldHeaders = customFieldsManagement.customFields.value.map(field => ({
    title: field.label,
    width: 120,
    property: `customField_${field.id}`,
    show: true,
    isCustomField: true,
    fieldId: field.id,
  }))

  dataConfig.value.taskHeaders = [...baseHeaders, ...customFieldHeaders]
}

// 处理任务数据
const processTask = (task: any) => {
  const processedTask = { ...task }
  if (task.customFieldValues) {
    customFieldsManagement.customFields.value.forEach(field => {
      const value = task.customFieldValues[field.id]
      if (value !== undefined) {
        processedTask[`customField_${field.id}`] = value
      }
    })
  }
  return processedTask
}

// 任务对话框事件处理
const handleSaveTask = () => {
  taskManagement.saveTask(
    messageToast.showMessage,
    msg => messageToast.showMessage(msg, 'error'),
    processTask
  )
}

// 删除确认事件处理
const handleConfirmDelete = () => {
  taskManagement.confirmDelete(messageToast.showMessage, msg =>
    messageToast.showMessage(msg, 'error')
  )
}

// 自定义字段管理事件处理
const handleDeleteCustomField = (index: number) => {
  if (customFieldsManagement.deleteCustomField) {
    if (customFieldsManagement.deleteCustomField(index, dataConfig.value.dataSource)) {
      messageToast.showMessage('字段删除成功', 'success')
    }
  }
}

const handleAddOption = () => {
  customFieldsManagement.addOption(msg => messageToast.showMessage(msg, 'warning'))
}

const handleAddCustomField = () => {
  customFieldsManagement.addCustomField(messageToast.showMessage, msg =>
    messageToast.showMessage(msg, 'error')
  )
}

const handleUpdateCustomField = () => {
  customFieldsManagement.updateCustomField(messageToast.showMessage, msg =>
    messageToast.showMessage(msg, 'error')
  )
}

const handleSaveCustomFields = () => {
  customFieldsManagement.saveCustomFields(messageToast.showMessage)
  updateTaskHeaders()
}

// 刷新数据
const refreshData = async () => {
  try {
    const startDate =
      dataConfig.value.queryStartDate || DateUtils.startOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
    const endDate = dataConfig.value.queryEndDate || DateUtils.endOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
    await eventConfig.value.queryTask(startDate, endDate)
    messageToast.showMessage('数据刷新成功', 'success')
  } catch (error) {
    console.error('刷新数据失败:', error)
    messageToast.showMessage('刷新失败，请稍后重试', 'error')
  }
}

const togglePerformanceTest = async () => {
  isPerformanceTest.value = !isPerformanceTest.value
  try {
    const startDate =
      dataConfig.value.queryStartDate || DateUtils.startOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
    const endDate = dataConfig.value.queryEndDate || DateUtils.endOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
    await eventConfig.value.queryTask(startDate, endDate)
    const modeText = isPerformanceTest.value ? '性能测试模式' : '正常数据模式'
    messageToast.showMessage(`已切换到${modeText}`, 'success')
  } catch (error) {
    console.error('切换模式失败:', error)
    messageToast.showMessage('切换失败，请稍后重试', 'error')
  }
}

// 定义事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: () => {
    taskManagement.openAddRootTaskDialog()
  },
  addSubTask: (row: { id: string }) => {
    taskManagement.openAddSubTaskDialog(row.id)
  },
  removeTask: (row: { id: string }) => {
    taskManagement.openDeleteDialog(row.id)
  },
  editTask: (row: { id: string }) => {
    taskManagement.openEditTaskDialog(row.id)
  },
  updateProgress: async detail => {
    try {
      const response = await taskApi.updateProgress(detail.taskId, detail.newProgress)
      if (response.code === 200) {
        console.log('进度更新成功:', detail)
        messageToast.showMessage('进度更新成功', 'success')
      }
    } catch (error) {
      console.error('更新进度失败:', error)
      messageToast.showMessage('进度更新失败', 'error')
    }
  },
  queryTask: async (queryStart: string, queryEnd: string) => {
    dataConfig.value.queryStartDate = queryStart
    dataConfig.value.queryEndDate = queryEnd

    const mockResponse = isPerformanceTest.value ? getPerformanceTestResponse() : getMockResponse()

    dataConfig.value.dataSource = customFieldsManagement.processTasksWithCustomFields(
      mockResponse.tasks
    )
    dataConfig.value.dependencies = mockResponse.dependencies
  },
  barDate: async (id: string, startDate: string, endDate: string) => {
    try {
      const response = await taskApi.updateTaskDate(id, startDate, endDate)
      if (response.code === 200) {
        const task = dataConfig.value.dataSource.find((t: any) => t.id === id)
        if (task) {
          task.start_date = startDate
          task.end_date = endDate
        }
        console.log('任务日期更新成功:', id, startDate, endDate)
        messageToast.showMessage('任务日期更新成功', 'success')
      }
    } catch (error) {
      console.error('更新任务日期失败:', error)
      messageToast.showMessage('日期更新失败', 'error')
    }
  },
  allowChangeTaskDate: (allow: boolean) => {
    console.log('允许改变任务日期:', allow)
  },
})

onMounted(() => {
  customFieldsManagement.loadCustomFields()
  updateTaskHeaders()

  const startDate = DateUtils.startOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
  const endDate = DateUtils.endOf(DateUtils.now(), 'month').format('YYYY-MM-DD')
  dataConfig.value.queryStartDate = startDate
  dataConfig.value.queryEndDate = endDate
  eventConfig.value.queryTask(startDate, endDate)
})
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
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.1);
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
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
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
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.1);
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
