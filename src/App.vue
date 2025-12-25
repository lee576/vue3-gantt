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
        <button class="metro-btn metro-btn-primary" @click="openAddRootTaskDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          新建根任务
        </button>
        <button class="metro-btn" @click="openCustomFieldsDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
          </svg>
          自定义字段
        </button>
        <button class="metro-btn" @click="refreshData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          刷新数据
        </button>
      </div>
    </div>
    <div class="metro-app-content">
      <gantt :styleConfig="styleConfig" :dataConfig="dataConfig" :eventConfig="eventConfig"></gantt>
    </div>

    <!-- 任务编辑/新建对话框 -->
    <div v-if="showTaskDialog" class="modal-overlay" @click.self="closeTaskDialog">
      <div class="task-dialog">
        <div class="dialog-header">
          <h2>{{ isEditMode ? '编辑任务' : '新建任务' }}</h2>
          <button class="close-btn" @click="closeTaskDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>任务名称</label>
            <input v-model="taskForm.taskNo" type="text" placeholder="请输入任务名称" />
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="taskForm.level">
              <option value="紧急">紧急</option>
              <option value="重要">重要</option>
              <option value="一般">一般</option>
              <option value="不重要">不重要</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始时间</label>
              <input v-model="taskForm.start_date" type="datetime-local" />
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <input v-model="taskForm.end_date" type="datetime-local" />
            </div>
          </div>
          <div class="form-group">
            <label>进度 (0-1)</label>
            <input v-model.number="taskForm.job_progress" type="number" min="0" max="1" step="0.1" />
          </div>
          <div class="form-group" v-if="!isEditMode && !isRootTask">
            <label>父任务</label>
            <select v-model="taskForm.pid">
              <option value="0">无（根任务）</option>
              <option v-for="task in availableParentTasks" :key="task.id" :value="task.id">
                {{ task.taskNo }}
              </option>
            </select>
          </div>

          <!-- 自定义字段 -->
          <div v-if="customFields.length > 0" class="custom-fields-section">
            <div class="section-divider">
              <span>自定义字段</span>
            </div>

            <div v-for="field in customFields" :key="field.id" class="form-group">
              <label>
                {{ field.label }}
                <span v-if="field.required" class="required-mark">*</span>
              </label>

              <!-- 文本输入 -->
              <input
                v-if="field.type === 'text'"
                v-model="taskForm.customFieldValues[field.id]"
                type="text"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :required="field.required"
              />

              <!-- 数字输入 -->
              <input
                v-else-if="field.type === 'number'"
                v-model.number="taskForm.customFieldValues[field.id]"
                type="number"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :required="field.required"
              />

              <!-- 日期输入 -->
              <input
                v-else-if="field.type === 'date'"
                v-model="taskForm.customFieldValues[field.id]"
                type="date"
                :required="field.required"
              />

              <!-- 日期时间输入 -->
              <input
                v-else-if="field.type === 'datetime'"
                v-model="taskForm.customFieldValues[field.id]"
                type="datetime-local"
                :required="field.required"
              />

              <!-- 下拉选择 -->
              <select
                v-else-if="field.type === 'select'"
                v-model="taskForm.customFieldValues[field.id]"
                :required="field.required"
              >
                <option value="">请选择{{ field.label }}</option>
                <option
                  v-for="option in field.options"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>

              <!-- 多行文本 -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="taskForm.customFieldValues[field.id]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :required="field.required"
                rows="3"
              ></textarea>

              <!-- 复选框 -->
              <div v-else-if="field.type === 'checkbox'" class="checkbox-wrapper">
                <input
                  type="checkbox"
                  :id="`checkbox-${field.id}`"
                  v-model="taskForm.customFieldValues[field.id]"
                />
                <label :for="`checkbox-${field.id}`" class="checkbox-label">
                  {{ field.placeholder || '启用' }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="metro-btn" @click="closeTaskDialog">取消</button>
          <button class="metro-btn metro-btn-primary" @click="saveTask">
            {{ isEditMode ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click.self="closeDeleteDialog">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <h2>确认删除</h2>
          <button class="close-btn" @click="closeDeleteDialog">×</button>
        </div>
        <div class="dialog-body">
          <p>确定要删除任务 "{{ deleteTaskName }}" 吗？</p>
          <p class="warning-text">此操作将同时删除所有子任务，且不可恢复！</p>
        </div>
        <div class="dialog-footer">
          <button class="metro-btn" @click="closeDeleteDialog">取消</button>
          <button class="metro-btn metro-btn-danger" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" :class="['message-toast', message.type]">
      {{ message.text }}
    </div>

    <!-- 自定义字段管理对话框 -->
    <div v-if="showCustomFieldsDialog" class="modal-overlay" @click.self="closeCustomFieldsDialog">
      <div class="custom-fields-dialog">
        <div class="dialog-header">
          <h2>自定义字段管理</h2>
          <button class="close-btn" @click="closeCustomFieldsDialog">×</button>
        </div>
        <div class="dialog-body">
          <!-- 已有字段列表 -->
          <div class="fields-list">
            <h3>已添加的字段</h3>
            <div v-if="customFields.length === 0" class="empty-state">
              <p>暂无自定义字段，点击下方按钮添加</p>
            </div>
            <div v-else class="field-items">
              <div v-for="(field, index) in customFields" :key="field.id" class="field-item">
                <div class="field-info">
                  <div class="field-name">
                    <strong>{{ field.label }}</strong>
                    <span class="field-type-badge">{{ getFieldTypeLabel(field.type) }}</span>
                    <span v-if="field.required" class="required-badge">必填</span>
                  </div>
                  <div class="field-meta">
                    <span v-if="field.placeholder">占位符: {{ field.placeholder }}</span>
                    <span v-if="field.options && field.options.length > 0">
                      选项: {{ field.options.join(', ') }}
                    </span>
                  </div>
                </div>
                <div class="field-actions">
                  <button class="icon-btn" @click="editCustomField(index)" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button class="icon-btn delete" @click="deleteCustomField(index)" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 添加/编辑字段表单 -->
          <div class="add-field-section">
            <h3>{{ editingFieldIndex !== null ? '编辑字段' : '添加新字段' }}</h3>
            <div class="form-group">
              <label>字段名称 <span class="required-mark">*</span></label>
              <input v-model="newField.label" type="text" placeholder="例如: 负责人" />
            </div>

            <div class="form-group">
              <label>字段类型 <span class="required-mark">*</span></label>
              <select v-model="newField.type">
                <option value="text">文本</option>
                <option value="number">数字</option>
                <option value="date">日期</option>
                <option value="datetime">日期时间</option>
                <option value="select">下拉选择</option>
                <option value="textarea">多行文本</option>
                <option value="checkbox">复选框</option>
              </select>
            </div>

            <div class="form-group">
              <label>占位符/提示文本</label>
              <input v-model="newField.placeholder" type="text" placeholder="例如: 请输入负责人姓名" />
            </div>

            <div v-if="newField.type === 'select'" class="form-group">
              <label>下拉选项 <span class="required-mark">*</span></label>
              <div class="options-input">
                <input
                  v-model="newOptionText"
                  type="text"
                  placeholder="输入选项后按回车添加"
                  @keypress.enter.prevent="addOption"
                />
                <button class="metro-btn metro-btn-sm" @click="addOption">添加</button>
              </div>
              <div v-if="newField.options.length > 0" class="options-list">
                <div v-for="(option, idx) in newField.options" :key="idx" class="option-item">
                  <span>{{ option }}</span>
                  <button class="icon-btn-sm" @click="removeOption(idx)">×</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label-inline">
                <input type="checkbox" v-model="newField.required" />
                <span>必填字段</span>
              </label>
            </div>

            <div class="form-actions">
              <button
                v-if="editingFieldIndex !== null"
                class="metro-btn"
                @click="cancelEditField"
              >
                取消编辑
              </button>
              <button
                class="metro-btn metro-btn-primary"
                @click="editingFieldIndex !== null ? updateCustomField() : addCustomField()"
                :disabled="!newField.label || !newField.type || (newField.type === 'select' && newField.options.length === 0)"
              >
                {{ editingFieldIndex !== null ? '更新字段' : '添加字段' }}
              </button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="metro-btn metro-btn-primary" @click="saveCustomFields">
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import Gantt, { type DataConfig, type StyleConfig, type EventConfig } from './components/gantt/core/Gantt.vue';
import { LinkType } from './components/gantt/types/Types';

// 模拟后端 API 服务
// 在实际项目中，请将这些方法替换为真实的 API 调用
// 自定义字段说明：
// - 任务对象应包含 customFieldValues 字段，格式为 { fieldId: value }
// - 例如：{ customFieldValues: { 'field-123': '张三', 'field-456': 100 } }
// - 后端需要存储和返回 customFieldValues 数据
const mockApi = {
  // 模拟延迟
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 新增任务
  async addTask(task: any) {
    await this.delay(300);
    console.log('新增任务请求:', task);
    // 实际项目中，这里应该是：
    // const response = await axios.post('/api/tasks', task);
    // return response.data;
    return {
      code: 200,
      message: '任务创建成功',
      data: {
        id: `task-${Date.now()}`, // 生成新的任务ID
        ...task
      }
    };
  },

  // 更新任务
  async updateTask(taskId: string, task: any) {
    await this.delay(300);
    console.log('更新任务请求:', taskId, task);
    // 实际项目中，这里应该是：
    // const response = await axios.put(`/api/tasks/${taskId}`, task);
    // return response.data;
    return {
      code: 200,
      message: '任务更新成功',
      data: task
    };
  },

  // 删除任务
  async deleteTask(taskId: string) {
    await this.delay(300);
    console.log('删除任务请求:', taskId);
    return {
      code: 200,
      message: '任务删除成功',
      data: { id: taskId }
    };
  },

  // 更新任务进度
  async updateProgress(taskId: string, progress: number) {
    await this.delay(200);
    console.log('更新进度请求:', taskId, progress);
    return {
      code: 200,
      message: '进度更新成功',
      data: { id: taskId, progress }
    };
  },

  // 更新任务日期
  async updateTaskDate(taskId: string, startDate: string, endDate: string) {
    await this.delay(200);
    console.log('更新日期请求:', taskId, startDate, endDate);
    return {
      code: 200,
      message: '日期更新成功',
      data: { id: taskId, startDate, endDate }
    };
  }
};

// 对话框状态
const showTaskDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditMode = ref(false);
const isRootTask = ref(false);

// 任务表单数据
interface TaskForm {
  id?: string;
  pid: string;
  taskNo: string;
  level: string;
  start_date: string;
  end_date: string;
  job_progress: number;
  spend_time: string | null;
  customFieldValues: Record<string, any>;
}

const taskForm = ref<TaskForm>({
  pid: '0',
  taskNo: '',
  level: '一般',
  start_date: dayjs().format('YYYY-MM-DDTHH:mm'),
  end_date: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
  job_progress: 0,
  spend_time: null,
  customFieldValues: {}
});

// 删除任务相关
const deleteTaskId = ref('');
const deleteTaskName = ref('');

// 消息提示
interface Message {
  text: string;
  type: 'success' | 'error' | 'warning';
}
const message = ref<Message | null>(null);

// 显示消息提示
const showMessage = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
  message.value = { text, type };
  setTimeout(() => {
    message.value = null;
  }, 3000);
};

// 可用的父任务列表（排除里程碑和当前编辑的任务）
const availableParentTasks = computed(() => {
  return dataConfig.value.dataSource.filter((task: any) =>
    task.type !== 'milestone' && (!taskForm.value.id || task.id !== taskForm.value.id)
  );
});

// ============ 自定义字段管理 ============

// 自定义字段定义接口
interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options: string[];
}

// 自定义字段状态
const showCustomFieldsDialog = ref(false);
const customFields = ref<CustomField[]>([]);
const editingFieldIndex = ref<number | null>(null);
const newField = ref<CustomField>({
  id: '',
  label: '',
  type: 'text',
  placeholder: '',
  required: false,
  options: []
});
const newOptionText = ref('');

// 从 localStorage 加载自定义字段
const loadCustomFields = () => {
  const saved = localStorage.getItem('gantt_custom_fields');
  if (saved) {
    try {
      customFields.value = JSON.parse(saved);
      updateTaskHeaders();
    } catch (error) {
      console.error('加载自定义字段失败:', error);
    }
  }
};

// 更新任务表头,将自定义字段添加到列显示中
const updateTaskHeaders = () => {
  // 获取基础表头（不包含自定义字段）
  // 注意：序号列(no)是固定列，始终显示，不参与列显示设置
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

  // 为每个自定义字段创建表头
  const customFieldHeaders = customFields.value.map(field => ({
    title: field.label,
    width: 120,
    property: `customField_${field.id}`,
    show: true,
    isCustomField: true,
    fieldId: field.id
  }));

  // 合并基础表头和自定义字段表头
  dataConfig.value.taskHeaders = [...baseHeaders, ...customFieldHeaders];
};

// 处理任务数据，将自定义字段值展开到任务对象中
const processTasksWithCustomFields = (tasks: any[]) => {
  return tasks.map(task => {
    const processedTask = { ...task };

    // 如果任务有自定义字段值，展开到任务对象的顶层
    if (task.customFieldValues) {
      customFields.value.forEach(field => {
        const value = task.customFieldValues[field.id];
        if (value !== undefined) {
          processedTask[`customField_${field.id}`] = value;
        }
      });
    }

    return processedTask;
  });
};

// 保存自定义字段到 localStorage
const saveCustomFieldsToStorage = () => {
  localStorage.setItem('gantt_custom_fields', JSON.stringify(customFields.value));
};

// 打开自定义字段对话框
const openCustomFieldsDialog = () => {
  showCustomFieldsDialog.value = true;
  resetNewField();
};

// 关闭自定义字段对话框
const closeCustomFieldsDialog = () => {
  showCustomFieldsDialog.value = false;
  resetNewField();
  editingFieldIndex.value = null;
};

// 重置新字段表单
const resetNewField = () => {
  newField.value = {
    id: `field-${Date.now()}`,
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    options: []
  };
  newOptionText.value = '';
};

// 添加自定义字段
const addCustomField = () => {
  if (!newField.value.label || !newField.value.type) {
    showMessage('请填写字段名称和类型', 'warning');
    return;
  }

  if (newField.value.type === 'select' && newField.value.options.length === 0) {
    showMessage('下拉选择类型至少需要一个选项', 'warning');
    return;
  }

  customFields.value.push({ ...newField.value, id: `field-${Date.now()}` });
  showMessage('字段添加成功', 'success');
  resetNewField();
};

// 编辑自定义字段
const editCustomField = (index: number) => {
  editingFieldIndex.value = index;
  newField.value = { ...customFields.value[index] };
};

// 更新自定义字段
const updateCustomField = () => {
  if (editingFieldIndex.value === null) return;

  if (!newField.value.label || !newField.value.type) {
    showMessage('请填写字段名称和类型', 'warning');
    return;
  }

  if (newField.value.type === 'select' && newField.value.options.length === 0) {
    showMessage('下拉选择类型至少需要一个选项', 'warning');
    return;
  }

  customFields.value[editingFieldIndex.value] = { ...newField.value };
  showMessage('字段更新成功', 'success');
  resetNewField();
  editingFieldIndex.value = null;
};

// 取消编辑字段
const cancelEditField = () => {
  editingFieldIndex.value = null;
  resetNewField();
};

// 删除自定义字段
const deleteCustomField = (index: number) => {
  const field = customFields.value[index];
  if (confirm(`确定要删除字段"${field.label}"吗？`)) {
    customFields.value.splice(index, 1);
    showMessage('字段删除成功', 'success');

    // 清理所有任务中的该字段值
    dataConfig.value.dataSource.forEach((task: any) => {
      if (task.customFieldValues && task.customFieldValues[field.id]) {
        delete task.customFieldValues[field.id];
      }
    });
  }
};

// 添加下拉选项
const addOption = () => {
  if (!newOptionText.value.trim()) return;

  if (newField.value.options.includes(newOptionText.value.trim())) {
    showMessage('选项已存在', 'warning');
    return;
  }

  newField.value.options.push(newOptionText.value.trim());
  newOptionText.value = '';
};

// 删除下拉选项
const removeOption = (index: number) => {
  newField.value.options.splice(index, 1);
};

// 保存自定义字段配置
const saveCustomFields = () => {
  saveCustomFieldsToStorage();
  updateTaskHeaders();
  showMessage('自定义字段配置已保存', 'success');
  closeCustomFieldsDialog();
};

// 获取字段类型标签
const getFieldTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    text: '文本',
    number: '数字',
    date: '日期',
    datetime: '日期时间',
    select: '下拉选择',
    textarea: '多行文本',
    checkbox: '复选框'
  };
  return labels[type] || type;
};

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
    { title: '序号', width: 160, property: 'no', show: true, fixed: true },
    { title: '任务名称', width: 190, property: 'task', show: true },
    { title: '优先级', width: 90, property: 'priority', show: true },
    { title: '开始时间', width: 150, property: 'startdate', show: true },
    { title: '结束时间', width: 150, property: 'enddate', show: true },
    { title: '耗时', width: 90, property: 'takestime', show: true }]
});

// 对话框操作方法
const openAddRootTaskDialog = () => {
  isEditMode.value = false;
  isRootTask.value = true;
  taskForm.value = {
    pid: '0',
    taskNo: '',
    level: '一般',
    start_date: dayjs().format('YYYY-MM-DDTHH:mm'),
    end_date: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    job_progress: 0,
    spend_time: null,
    customFieldValues: {}
  };
  showTaskDialog.value = true;
};

const openAddSubTaskDialog = (parentId: string) => {
  isEditMode.value = false;
  isRootTask.value = false;
  const parentTask = dataConfig.value.dataSource.find((t: any) => t.id === parentId);
  taskForm.value = {
    pid: parentId,
    taskNo: '',
    level: '一般',
    start_date: parentTask ? parentTask.start_date.replace(' ', 'T').slice(0, 16) : dayjs().format('YYYY-MM-DDTHH:mm'),
    end_date: parentTask ? parentTask.end_date.replace(' ', 'T').slice(0, 16) : dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    job_progress: 0,
    spend_time: null,
    customFieldValues: {}
  };
  showTaskDialog.value = true;
};

const openEditTaskDialog = (taskId: string) => {
  isEditMode.value = true;
  isRootTask.value = false;
  const task = dataConfig.value.dataSource.find((t: any) => t.id === taskId);
  if (task) {
    taskForm.value = {
      id: task.id,
      pid: task.pid,
      taskNo: task.taskNo,
      level: task.level,
      start_date: task.start_date.replace(' ', 'T').slice(0, 16),
      end_date: task.end_date.replace(' ', 'T').slice(0, 16),
      job_progress: parseFloat(task.job_progress),
      spend_time: task.spend_time,
      customFieldValues: task.customFieldValues || {}
    };
    showTaskDialog.value = true;
  }
};

const closeTaskDialog = () => {
  showTaskDialog.value = false;
};

const openDeleteDialog = (taskId: string) => {
  const task = dataConfig.value.dataSource.find((t: any) => t.id === taskId);
  if (task) {
    deleteTaskId.value = taskId;
    deleteTaskName.value = task.taskNo;
    showDeleteDialog.value = true;
  }
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  deleteTaskId.value = '';
  deleteTaskName.value = '';
};

// CRUD操作方法
const saveTask = async () => {
  try {
    // 格式化日期时间
    const formatDate = (dateStr: string) => {
      return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
    };

    const taskData = {
      ...taskForm.value,
      start_date: formatDate(taskForm.value.start_date),
      end_date: formatDate(taskForm.value.end_date),
      job_progress: String(taskForm.value.job_progress)
    };

    if (isEditMode.value && taskForm.value.id) {
      // 更新任务
      const response = await mockApi.updateTask(taskForm.value.id, taskData);
      if (response.code === 200) {
        // 更新本地数据
        const index = dataConfig.value.dataSource.findIndex((t: any) => t.id === taskForm.value.id);
        if (index !== -1) {
          // 合并更新的数据
          const updatedTask = { ...dataConfig.value.dataSource[index], ...taskData };

          // 处理自定义字段：将 customFieldValues 展开到顶层
          if (updatedTask.customFieldValues) {
            customFields.value.forEach(field => {
              const value = updatedTask.customFieldValues[field.id];
              if (value !== undefined) {
                updatedTask[`customField_${field.id}`] = value;
              }
            });
          }

          dataConfig.value.dataSource[index] = updatedTask;

          // 强制触发响应式更新
          dataConfig.value.dataSource = [...dataConfig.value.dataSource];
        }
        showMessage('任务更新成功', 'success');
        closeTaskDialog();
      } else {
        showMessage('任务更新失败', 'error');
      }
    } else {
      // 新增任务
      const response = await mockApi.addTask(taskData);
      if (response.code === 200) {
        // 处理新任务的自定义字段
        const newTask = response.data;
        if (newTask.customFieldValues) {
          customFields.value.forEach(field => {
            const value = newTask.customFieldValues[field.id];
            if (value !== undefined) {
              newTask[`customField_${field.id}`] = value;
            }
          });
        }

        // 添加到本地数据
        dataConfig.value.dataSource.push(newTask);
        showMessage('任务创建成功', 'success');
        closeTaskDialog();
      } else {
        showMessage('任务创建失败', 'error');
      }
    }
  } catch (error) {
    console.error('保存任务失败:', error);
    showMessage('操作失败，请稍后重试', 'error');
  }
};

const confirmDelete = async () => {
  try {
    const response = await mockApi.deleteTask(deleteTaskId.value);
    if (response.code === 200) {
      // 递归删除所有子任务
      const deleteTaskAndChildren = (taskId: string) => {
        const children = dataConfig.value.dataSource.filter((t: any) => t.pid === taskId);
        children.forEach((child: any) => deleteTaskAndChildren(child.id));
        dataConfig.value.dataSource = dataConfig.value.dataSource.filter((t: any) => t.id !== taskId);
      };

      deleteTaskAndChildren(deleteTaskId.value);
      showMessage('任务删除成功', 'success');
      closeDeleteDialog();
    } else {
      showMessage('任务删除失败', 'error');
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    showMessage('删除失败，请稍后重试', 'error');
  }
};

const refreshData = async () => {
  try {
    const startDate = dataConfig.value.queryStartDate || dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dataConfig.value.queryEndDate || dayjs().endOf('month').format('YYYY-MM-DD');
    await eventConfig.value.queryTask(startDate, endDate, '月');
    showMessage('数据刷新成功', 'success');
  } catch (error) {
    console.error('刷新数据失败:', error);
    showMessage('刷新失败，请稍后重试', 'error');
  }
};

// 定义事件配置
const eventConfig = ref<EventConfig>({
  addRootTask: () => {
    openAddRootTaskDialog();
  },
  addSubTask: (row: { id: string }) => {
    openAddSubTaskDialog(row.id);
  },
  removeTask: (row: { id: string }) => {
    openDeleteDialog(row.id);
  },
  editTask: (row: { id: string }) => {
    openEditTaskDialog(row.id);
  },
  updateProgress: async (detail) => {
    try {
      const response = await mockApi.updateProgress(detail.taskId, detail.newProgress);
      if (response.code === 200) {
        console.log('进度更新成功:', detail);
        showMessage('进度更新成功', 'success');
      }
    } catch (error) {
      console.error('更新进度失败:', error);
      showMessage('进度更新失败', 'error');
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
      // 需求分析完成后达到里程碑
      { sourceTaskId: '2', targetTaskId: 'milestone-1', type: LinkType.FINISH_TO_START },
      // 项目规划完成后达到里程碑
      { sourceTaskId: '4', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
      // 里程碑完成后开始开发阶段
      { sourceTaskId: 'milestone-2', targetTaskId: '5', type: LinkType.FINISH_TO_START },
      // 前端开发完成后达到里程碑
      { sourceTaskId: '6', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
      // 后端开发完成后达到里程碑
      { sourceTaskId: '10', targetTaskId: 'milestone-3', type: LinkType.FINISH_TO_START },
      // 里程碑完成后开始测试阶段
      { sourceTaskId: 'milestone-3', targetTaskId: '14', type: LinkType.FINISH_TO_START },
      // 测试阶段完成后达到里程碑
      { sourceTaskId: '18', targetTaskId: 'milestone-4', type: LinkType.FINISH_TO_START },
      // 里程碑完成后开始部署上线
      { sourceTaskId: 'milestone-4', targetTaskId: '19', type: LinkType.FINISH_TO_START },
      // 上线验证完成后达到里程碑
      { sourceTaskId: '22', targetTaskId: 'milestone-5', type: LinkType.FINISH_TO_START },
      // 所有任务完成后达到最终里程碑
      { sourceTaskId: '32', targetTaskId: 'milestone-6', type: LinkType.FINISH_TO_START },
      
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

    // 使用后端返回的数据，并处理自定义字段
    // 注意：在实际项目中，后端应该返回包含 customFieldValues 的任务数据
    dataConfig.value.dataSource = processTasksWithCustomFields(mockResponse.tasks);
    dataConfig.value.dependencies = mockResponse.dependencies;
  },
  barDate: async (id: string, startDate: string, endDate: string) => {
    try {
      const response = await mockApi.updateTaskDate(id, startDate, endDate);
      if (response.code === 200) {
        // 更新本地数据
        const task = dataConfig.value.dataSource.find((t: any) => t.id === id);
        if (task) {
          task.start_date = startDate;
          task.end_date = endDate;
        }
        console.log('任务日期更新成功:', id, startDate, endDate);
        showMessage('任务日期更新成功', 'success');
      }
    } catch (error) {
      console.error('更新任务日期失败:', error);
      showMessage('日期更新失败', 'error');
    }
  },
  allowChangeTaskDate: (allow: boolean) => {
    console.log('允许改变任务日期:', allow);
  }
});

onMounted(() => {
  // 加载自定义字段配置
  loadCustomFields();

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

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.task-dialog,
.confirm-dialog {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.confirm-dialog {
  max-width: 400px;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
}

.dialog-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  font-family: 'Segoe UI', sans-serif;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333333;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #555555;
  font-family: 'Segoe UI', sans-serif;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  font-family: 'Segoe UI', sans-serif;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.warning-text {
  color: #d83b01;
  font-size: 13px;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f8f8;
}

.metro-btn-danger {
  background: linear-gradient(145deg, #d83b01, #c02e00) !important;
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.metro-btn-danger:hover {
  background: linear-gradient(145deg, #c02e00, #a72700) !important;
}

/* 消息提示样式 */
.message-toast {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 500;
  font-family: 'Segoe UI', sans-serif;
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
  min-width: 280px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-toast.success {
  background: #107c10;
  color: #ffffff;
  border-left: 4px solid #0b5a0b;
}

.message-toast.error {
  background: #d83b01;
  color: #ffffff;
  border-left: 4px solid #a72700;
}

.message-toast.warning {
  background: #ffb900;
  color: #333333;
  border-left: 4px solid #d39300;
}

/* 自定义字段相关样式 */
.custom-fields-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.section-divider {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.section-divider span {
  background: #ffffff;
  padding: 0 16px;
  color: #666666;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #d0d0d0;
  z-index: 0;
}

.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  font-family: 'Segoe UI', sans-serif;
  transition: all 0.2s;
  box-sizing: border-box;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-wrapper .checkbox-label {
  margin: 0;
  font-weight: normal;
  color: #333333;
  cursor: pointer;
}

.required-mark {
  color: #d83b01;
  font-weight: bold;
  margin-left: 4px;
}

/* 自定义字段管理对话框 */
.custom-fields-dialog {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.custom-fields-dialog .dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
}

.fields-list,
.add-field-section {
  display: flex;
  flex-direction: column;
}

.fields-list h3,
.add-field-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  padding-bottom: 12px;
  border-bottom: 2px solid #0078d4;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999999;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.field-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.field-item:hover {
  background: #f0f0f0;
  border-color: #0078d4;
}

.field-info {
  flex: 1;
}

.field-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.field-name strong {
  font-size: 14px;
  color: #333333;
}

.field-type-badge {
  background: #0078d4;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.required-badge {
  background: #d83b01;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.field-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-meta span {
  font-size: 12px;
  color: #666666;
}

.field-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
}

.icon-btn:hover {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.icon-btn.delete:hover {
  background: rgba(216, 59, 1, 0.1);
  color: #d83b01;
}

.options-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.options-input input {
  flex: 1;
}

.metro-btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #d0d0d0;
  font-size: 13px;
}

.icon-btn-sm {
  background: none;
  border: none;
  cursor: pointer;
  color: #d83b01;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn-sm:hover {
  color: #a72700;
  transform: scale(1.2);
}

.checkbox-label-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label-inline input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
