import { ref } from 'vue';
import type { CustomField } from '../types/task';

export function useCustomFields() {
  const customFields = ref<CustomField[]>([]);
  const showCustomFieldsDialog = ref(false);
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
  const customFieldFormErrors = ref<Record<string, string>>({});

  // 从 localStorage 加载自定义字段
  const loadCustomFields = () => {
    const saved = localStorage.getItem('gantt_custom_fields');
    if (saved) {
      try {
        customFields.value = JSON.parse(saved);
      } catch (error) {
        console.error('加载自定义字段失败:', error);
      }
    }
  };

  // 保存自定义字段到 localStorage
  const saveCustomFieldsToStorage = () => {
    localStorage.setItem('gantt_custom_fields', JSON.stringify(customFields.value));
  };

  // 验证自定义字段表单
  const validateCustomFieldForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newField.value.label.trim()) {
      errors.label = '字段名称不能为空';
    }

    if (!newField.value.type) {
      errors.type = '请选择字段类型';
    }

    if (newField.value.type === 'select' && newField.value.options.length === 0) {
      errors.options = '下拉选择类型至少需要一个选项';
    }

    customFieldFormErrors.value = errors;
    return Object.keys(errors).length === 0;
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
    customFieldFormErrors.value = {};
  };

  // 添加自定义字段
  const addCustomField = (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!validateCustomFieldForm()) {
      onError('请修正表单中的错误');
      return;
    }

    customFields.value.push({ ...newField.value, id: `field-${Date.now()}` });
    onSuccess('字段添加成功');
    resetNewField();
  };

  // 编辑自定义字段
  const editCustomField = (index: number) => {
    editingFieldIndex.value = index;
    newField.value = { ...customFields.value[index] };
  };

  // 更新自定义字段
  const updateCustomField = (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (editingFieldIndex.value === null) return;

    if (!validateCustomFieldForm()) {
      onError('请修正表单中的错误');
      return;
    }

    customFields.value[editingFieldIndex.value] = { ...newField.value };
    onSuccess('字段更新成功');
    resetNewField();
    editingFieldIndex.value = null;
  };

  // 取消编辑字段
  const cancelEditField = () => {
    editingFieldIndex.value = null;
    resetNewField();
  };

  // 删除自定义字段
  const deleteCustomField = (index: number, dataSource: any[]) => {
    const field = customFields.value[index];
    if (confirm(`确定要删除字段"${field.label}"吗？`)) {
      customFields.value.splice(index, 1);

      // 清理所有任务中的该字段值
      dataSource.forEach((task: any) => {
        if (task.customFieldValues && task.customFieldValues[field.id]) {
          delete task.customFieldValues[field.id];
        }
      });

      return true;
    }
    return false;
  };

  // 添加下拉选项
  const addOption = (onWarning: (msg: string) => void) => {
    if (!newOptionText.value.trim()) return;

    if (newField.value.options.includes(newOptionText.value.trim())) {
      onWarning('选项已存在');
      return;
    }

    newField.value.options.push(newOptionText.value.trim());
    newOptionText.value = '';

    if (customFieldFormErrors.value.options) {
      delete customFieldFormErrors.value.options;
    }
  };

  // 删除下拉选项
  const removeOption = (index: number) => {
    newField.value.options.splice(index, 1);

    if (newField.value.type === 'select' && newField.value.options.length === 0) {
      customFieldFormErrors.value.options = '下拉选择类型至少需要一个选项';
    } else if (customFieldFormErrors.value.options) {
      delete customFieldFormErrors.value.options;
    }
  };

  // 保存自定义字段配置
  const saveCustomFields = (onSuccess: (msg: string) => void) => {
    saveCustomFieldsToStorage();
    onSuccess('自定义字段配置已保存');
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

  // 处理任务数据，将自定义字段值展开到任务对象中
  const processTasksWithCustomFields = (tasks: any[]) => {
    return tasks.map(task => {
      const processedTask = { ...task };

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

  return {
    customFields,
    showCustomFieldsDialog,
    editingFieldIndex,
    newField,
    newOptionText,
    customFieldFormErrors,
    loadCustomFields,
    saveCustomFieldsToStorage,
    validateCustomFieldForm,
    openCustomFieldsDialog,
    closeCustomFieldsDialog,
    resetNewField,
    addCustomField,
    editCustomField,
    updateCustomField,
    cancelEditField,
    deleteCustomField,
    addOption,
    removeOption,
    saveCustomFields,
    getFieldTypeLabel,
    processTasksWithCustomFields
  };
}
