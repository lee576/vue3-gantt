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
        <button
          class="metro-btn"
          :class="{ 'metro-btn-active': baselineDisplayConfig.enabled }"
          @click="toggleBaseline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
          </svg>
          {{ baselineDisplayConfig.enabled ? '隐藏基线' : '显示基线' }}
        </button>
        <button class="metro-btn" @click="handleCreateBaseline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
          </svg>
          保存基线
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
        <button class="metro-btn" @click="analyzeCriticalPath">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 17l3-2.94c-.39-.04-.68-.06-1-.06-2.67 0-8 1.34-8 4v2h9l-3-3zm2-5c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4" />
            <path d="M15.47 20.5L12 17l1.4-1.41 2.07 2.08 5.13-5.17 1.4 1.41z" />
          </svg>
          关键路径分析
        </button>
        <button class="metro-btn" @click="validateDependencies">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
          </svg>
          依赖验证
        </button>
        <button class="metro-btn" @click="validateConstraints">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          约束验证
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

    <!-- 关键路径分析对话框 -->
    <CriticalPathDialog
      :show="showCriticalPathDialog"
      :result="criticalPathResult"
      :tasks="dataConfig.dataSource"
      @close="showCriticalPathDialog = false"
    />

    <!-- 依赖验证对话框 -->
    <DependencyValidationDialog
      :show="showDependencyDialog"
      :result="dependencyValidationResult"
      :cycles="dependencyCycles"
      :tasks="dataConfig.dataSource"
      :totalDependencies="dataConfig.dependencies?.length || 0"
      @close="showDependencyDialog = false"
    />

    <!-- 约束验证对话框 -->
    <ConstraintValidationDialog
      :show="showConstraintDialog"
      :results="constraintValidationResults"
      :tasks="dataConfig.dataSource"
      @close="showConstraintDialog = false"
    />
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
import type { GanttTask } from './components/gantt/types/GanttTypes'
import TaskDialog from './components/TaskDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'
import CustomFieldsDialog from './components/CustomFieldsDialog.vue'
import MessageToast from './components/MessageToast.vue'
import CriticalPathDialog from './components/CriticalPathDialog.vue'
import DependencyValidationDialog from './components/DependencyValidationDialog.vue'
import ConstraintValidationDialog from './components/ConstraintValidationDialog.vue'
import { useMessage } from './composables/useMessage'
import { useCustomFields } from './composables/useCustomFields'
import { useTaskManagement } from './composables/useTaskManagement'
import { taskApi } from './services/taskApi'
import { getMockResponse, getPerformanceTestResponse } from './mock/mockData'
import {
  useBaseline,
  setBaselineData,
  type Baseline,
} from './components/gantt/composables/useBaseline'
import {
  getCriticalPathAnalyzer,
  type CriticalPathResult
} from './components/gantt/features/CriticalPathAnalyzer'
import {
  getDependencyValidator,
  type DependencyValidationResult
} from './components/gantt/features/DependencyValidator'
import {
  getConstraintManager,
  type ConstraintValidationResult
} from './components/gantt/features/TaskConstraintManager'

// 初始化 Composables
const messageToast = useMessage()
const customFieldsManagement = useCustomFields()

// 初始化基线管理
const {
  baselineDisplayConfig,
  currentBaseline,
  allBaselines,
  createBaseline,
  setCurrentBaseline,
  enableBaselineDisplay,
  getBaselineDataForTask,
  importBaseline,
} = useBaseline()

// 初始化功能分析器
const criticalPathAnalyzer = getCriticalPathAnalyzer()
const dependencyValidator = getDependencyValidator()
const constraintManager = getConstraintManager()

// 分析结果
const criticalPathResult = ref<CriticalPathResult | null>(null)
const dependencyValidationResult = ref<DependencyValidationResult | null>(null)
const constraintValidationResults = ref<ConstraintValidationResult[]>([])

// 对话框显示状态
const showCriticalPathDialog = ref(false)
const showDependencyDialog = ref(false)
const showConstraintDialog = ref(false)
const dependencyCycles = ref<any[]>([])

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
  setBarColor: (row: GanttTask) => {
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
      dataConfig.value.queryStartDate || DateUtils.startOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
    const endDate = dataConfig.value.queryEndDate || DateUtils.endOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
    await eventConfig.value.queryTask(startDate, endDate, '日')
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
      dataConfig.value.queryStartDate || DateUtils.startOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
    const endDate = dataConfig.value.queryEndDate || DateUtils.endOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
    await eventConfig.value.queryTask(startDate, endDate, '日')
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
  addSubTask: (task: Partial<GanttTask>) => {
    taskManagement.openAddSubTaskDialog(String(task.id))
  },
  removeTask: (task: Partial<GanttTask>) => {
    taskManagement.openDeleteDialog(String(task.id))
  },
  editTask: (task: Partial<GanttTask>) => {
    taskManagement.openEditTaskDialog(String(task.id))
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
  queryTask: async (queryStart: string, queryEnd: string, mode: string) => {
    dataConfig.value.queryStartDate = queryStart
    dataConfig.value.queryEndDate = queryEnd

    const mockResponse = isPerformanceTest.value ? getPerformanceTestResponse() : getMockResponse()

    dataConfig.value.dataSource = customFieldsManagement.processTasksWithCustomFields(
      mockResponse.tasks
    )

    // 为依赖关系添加 id 字段
    const dependencies = (mockResponse.dependencies || []).map((dep, index) => ({
      ...dep,
      id: `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
    }))
    dataConfig.value.dependencies = dependencies

    // 设置基线数据
    setBaselineData(dataConfig.value.dataSource, dependencies)

    // 如果mock数据中包含基线，使用预定义的基线数据加载
    if (mockResponse.baseline && !currentBaseline.value) {
      // 构建完整的基线数据，包含 taskBaselines 和 dependencyBaselines
      const baselineData = {
        name: mockResponse.baseline.name,
        description: mockResponse.baseline.description,
        createdAt: mockResponse.baseline.createdAt,
        createdBy: 'system',
        taskBaselines: mockResponse.baseline.taskBaselines,
        dependencyBaselines: dependencies.map(dep => ({
          dependencyId: dep.id,
          sourceTaskId: dep.sourceTaskId,
          targetTaskId: dep.targetTaskId,
        })),
      }

      console.log('📊 加载基线数据:', {
        taskCount: baselineData.taskBaselines.length,
        tasks: baselineData.taskBaselines,
      })

      // 使用 importBaseline 导入预定义的基线数据
      const baseline = importBaseline(JSON.stringify(baselineData))
      if (baseline) {
        setCurrentBaseline(baseline.id)
        console.log('✅ 基线已加载，ID:', baseline.id)
        messageToast.showMessage('已加载初始基线', 'success')
      }
    }
  },
  barDate: async (id: string | number, startDate: string, endDate: string) => {
    try {
      const response = await taskApi.updateTaskDate(String(id), startDate, endDate)
      if (response.code === 200) {
        const task = dataConfig.value.dataSource.find((t: any) => t.id === id)
        if (task) {
          task.start_date = startDate
          task.end_date = endDate
        }
        messageToast.showMessage('任务日期更新成功', 'success')

        // 实时更新分析结果
        updateAnalysisResults()
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

// 基线相关函数
const toggleBaseline = () => {
  if (!currentBaseline.value) {
    messageToast.showMessage('请先保存基线', 'warning')
    return
  }
  enableBaselineDisplay(!baselineDisplayConfig.value.enabled)
  const statusText = baselineDisplayConfig.value.enabled ? '已显示' : '已隐藏'
  messageToast.showMessage(`基线${statusText}`, 'success')
}

const handleCreateBaseline = () => {
  if (dataConfig.value.dataSource.length === 0) {
    messageToast.showMessage('没有可用的任务数据', 'warning')
    return
  }

  // 确保依赖关系有 id 字段
  const dependencies = (dataConfig.value.dependencies || []).map((dep, index) => ({
    id: `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
    ...dep,
  }))

  const baselineName = `基线 ${new Date().toLocaleString('zh-CN')}`
  const baseline = createBaseline(
    baselineName,
    dataConfig.value.dataSource,
    dependencies,
    {
      description: '用户手动创建的基线',
      createdBy: 'user',
    }
  )

  setCurrentBaseline(baseline.id)
  enableBaselineDisplay(true)
  messageToast.showMessage('基线保存成功', 'success')
}

// 关键路径分析
const analyzeCriticalPath = () => {
  if (dataConfig.value.dataSource.length === 0) {
    messageToast.showMessage('没有可用的任务数据', 'warning')
    return
  }

  try {
    // 确保依赖关系有 id 字段
    const dependencies = (dataConfig.value.dependencies || []).map((dep: any, index: number) => ({
      id: dep.id || `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
      sourceTaskId: dep.sourceTaskId,
      targetTaskId: dep.targetTaskId,
      type: dep.type,
      lag: dep.lag,
      label: dep.label,
    }))

    const result = criticalPathAnalyzer.analyze(
      dataConfig.value.dataSource,
      dependencies
    )

    criticalPathResult.value = result

    console.log('🎯 关键路径分析结果:', {
      关键任务数: result.criticalTaskIds.length,
      关键路径: result.criticalPath,
      项目工期: result.projectDuration,
      关键路径时长: result.criticalPathDuration,
      项目开始: result.projectStartDate,
      项目结束: result.projectEndDate
    })

    // 输出每个任务的浮动时间
    console.table(
      Array.from(result.taskAnalysis.values()).map(task => ({
        任务ID: task.taskId,
        任务名: task.taskName,
        总浮动时间: task.totalFloat,
        自由浮动时间: task.freeFloat,
        是否关键: task.isCritical ? '是' : '否',
        最早开始: task.earlyStart,
        最早完成: task.earlyFinish
      }))
    )

    messageToast.showMessage(
      `关键路径分析完成！找到 ${result.criticalTaskIds.length} 个关键任务，项目总工期 ${result.projectDuration} 天`,
      'success'
    )

    // 打开对话框显示详细结果
    showCriticalPathDialog.value = true
  } catch (error) {
    console.error('关键路径分析失败:', error)
    messageToast.showMessage('关键路径分析失败，请检查任务数据', 'error')
  }
}

// 依赖验证
const validateDependencies = () => {
  if (dataConfig.value.dataSource.length === 0) {
    messageToast.showMessage('没有可用的任务数据', 'warning')
    return
  }

  try {
    // 确保依赖关系有 id 字段
    const dependencies = (dataConfig.value.dependencies || []).map((dep: any, index: number) => ({
      id: dep.id || `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
      sourceTaskId: dep.sourceTaskId,
      targetTaskId: dep.targetTaskId,
      type: dep.type,
      lag: dep.lag,
      label: dep.label,
    }))

    const result = dependencyValidator.validateDependencies(
      dataConfig.value.dataSource,
      dependencies
    )

    dependencyValidationResult.value = result

    // 检测循环依赖
    const cycles = dependencyValidator.detectCycles()
    dependencyCycles.value = cycles

    console.log('🔍 依赖验证结果:', {
      验证通过: result.isValid ? '是' : '否',
      错误数: result.errors.length,
      警告数: result.warnings.length,
      循环依赖数: cycles.length
    })

    // 输出错误详情
    if (result.errors.length > 0) {
      console.group('❌ 错误列表')
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`)
        if (error.resolution) {
          console.log(`   解决方案: ${error.resolution}`)
        }
      })
      console.groupEnd()
    }

    // 输出警告详情
    if (result.warnings.length > 0) {
      console.group('⚠️ 警告列表')
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.message}`)
        if (warning.suggestion) {
          console.log(`   建议: ${warning.suggestion}`)
        }
      })
      console.groupEnd()
    }

    // 输出循环依赖
    if (cycles.length > 0) {
      console.group('🔄 循环依赖')
      cycles.forEach((cycle, index) => {
        console.log(`${index + 1}. ${cycle.description}`)
      })
      console.groupEnd()
    }

    const summaryMsg = result.isValid
      ? `依赖验证通过！共 ${result.warnings.length} 个警告`
      : `发现 ${result.errors.length} 个错误，${result.warnings.length} 个警告`

    messageToast.showMessage(summaryMsg, result.isValid ? 'success' : 'error')

    // 打开对话框显示详细结果
    showDependencyDialog.value = true
  } catch (error) {
    console.error('依赖验证失败:', error)
    messageToast.showMessage('依赖验证失败，请检查依赖数据', 'error')
  }
}

// 约束验证
const validateConstraints = () => {
  if (dataConfig.value.dataSource.length === 0) {
    messageToast.showMessage('没有可用的任务数据', 'warning')
    return
  }

  try {
    // 示例：为一些任务添加约束
    // SNET: Start No Earlier Than (不早于...开始)
    // SNLT: Start No Later Than (不晚于...开始)
    // FNET: Finish No Earlier Than (不早于...完成)
    // FNLT: Finish No Later Than (不晚于...完成)
    // MSO: Must Start On (必须在...开始)
    // MFO: Must Finish On (必须在...完成)

    // 为演示，添加一些示例约束
    const task1 = dataConfig.value.dataSource.find((t: any) => t.id === '1')
    const task5 = dataConfig.value.dataSource.find((t: any) => t.id === '5')

    if (task1) {
      constraintManager.addConstraint(task1.id, 'SNET', {
        constraintDate: task1.start_date,
        description: '项目规划必须按时开始',
        priority: 1
      })
    }

    if (task5) {
      constraintManager.addConstraint(task5.id, 'FNLT', {
        constraintDate: task5.end_date,
        description: '开发阶段不能晚于计划完成',
        priority: 2
      })
    }

    // 确保依赖关系有 id 字段
    const dependencies = (dataConfig.value.dependencies || []).map((dep: any, index: number) => ({
      id: dep.id || `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
      sourceTaskId: dep.sourceTaskId,
      targetTaskId: dep.targetTaskId,
      type: dep.type,
      lag: dep.lag,
      label: dep.label,
    }))

    const results = constraintManager.validateConstraints(
      dataConfig.value.dataSource,
      dependencies
    )

    constraintValidationResults.value = results

    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
    const validTasks = results.filter(r => r.isValid).length

    console.log('⏰ 约束验证结果:', {
      总任务数: results.length,
      通过验证: validTasks,
      约束冲突: totalViolations,
      警告数: totalWarnings
    })

    // 输出有问题的任务
    const problematicTasks = results.filter(r => !r.isValid || r.warnings.length > 0)
    if (problematicTasks.length > 0) {
      console.group('📋 任务约束详情')
      problematicTasks.forEach(task => {
        console.log(`\n任务: ${task.taskName} (ID: ${task.taskId})`)

        if (task.violations.length > 0) {
          console.log('  违反约束:')
          task.violations.forEach(v => {
            console.log(`    - [${v.constraintType}] ${v.message}`)
          })
        }

        if (task.warnings.length > 0) {
          console.log('  警告:')
          task.warnings.forEach(w => {
            console.log(`    - ${w.message}`)
            if (w.suggestion) console.log(`      建议: ${w.suggestion}`)
          })
        }
      })
      console.groupEnd()
    }

    const summaryMsg = totalViolations === 0
      ? `约束验证通过！共检查 ${results.length} 个任务，${totalWarnings} 个警告`
      : `发现 ${totalViolations} 个约束冲突，${totalWarnings} 个警告`

    messageToast.showMessage(summaryMsg, totalViolations === 0 ? 'success' : 'warning')

    // 打开对话框显示详细结果
    showConstraintDialog.value = true
  } catch (error) {
    console.error('约束验证失败:', error)
    messageToast.showMessage('约束验证失败，请检查数据', 'error')
  }
}

// 实时更新所有分析结果
const updateAnalysisResults = () => {
  if (dataConfig.value.dataSource.length === 0) {
    return
  }

  try {
    // 确保依赖关系有 id 字段
    const dependencies = (dataConfig.value.dependencies || []).map((dep: any, index: number) => ({
      id: dep.id || `dep-${dep.sourceTaskId}-${dep.targetTaskId}-${index}`,
      sourceTaskId: dep.sourceTaskId,
      targetTaskId: dep.targetTaskId,
      type: dep.type,
      lag: dep.lag,
      label: dep.label,
    }))

    // 更新关键路径分析（如果对话框是打开的）
    if (showCriticalPathDialog.value) {
      const result = criticalPathAnalyzer.analyze(
        dataConfig.value.dataSource,
        dependencies
      )
      criticalPathResult.value = result
      console.log('🔄 关键路径分析已更新')
    }

    // 更新依赖验证（如果对话框是打开的）
    if (showDependencyDialog.value) {
      const result = dependencyValidator.validateDependencies(
        dataConfig.value.dataSource,
        dependencies
      )
      dependencyValidationResult.value = result

      const cycles = dependencyValidator.detectCycles()
      dependencyCycles.value = cycles
      console.log('🔄 依赖验证已更新')
    }

    // 更新约束验证（如果对话框是打开的）
    if (showConstraintDialog.value) {
      const results = constraintManager.validateConstraints(
        dataConfig.value.dataSource,
        dependencies
      )
      constraintValidationResults.value = results
      console.log('🔄 约束验证已更新')
    }
  } catch (error) {
    console.error('更新分析结果失败:', error)
  }
}

onMounted(() => {
  customFieldsManagement.loadCustomFields()
  updateTaskHeaders()

  const startDate = DateUtils.startOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
  const endDate = DateUtils.endOf(DateUtils.now().toDate(), 'month').format('YYYY-MM-DD')
  dataConfig.value.queryStartDate = startDate
  dataConfig.value.queryEndDate = endDate
  eventConfig.value.queryTask(startDate, endDate, '日')
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

.metro-btn-active {
  background: linear-gradient(145deg, #0078d4, #106ebe) !important;
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
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
