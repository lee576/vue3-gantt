import { ref, type Ref } from 'vue'
import DateUtils from '../components/gantt/utils/dateUtils'
import type { TaskForm, CustomField } from '../types/task'
import { taskApi } from '../services/taskApi'

export function useTaskManagement(customFields: Ref<CustomField[]>, dataConfig: Ref<any>) {
  const showTaskDialog = ref(false)
  const showDeleteDialog = ref(false)
  const isEditMode = ref(false)
  const isRootTask = ref(false)
  const deleteTaskId = ref('')
  const deleteTaskName = ref('')
  const taskFormErrors = ref<Record<string, string>>({})

  const taskForm = ref<TaskForm>({
    pid: '0',
    taskNo: '',
    level: '一般',
    start_date: DateUtils.format(DateUtils.now(), 'YYYY-MM-DDTHH:mm'),
    end_date: DateUtils.format(DateUtils.add(DateUtils.now(), 1, 'day'), 'YYYY-MM-DDTHH:mm'),
    job_progress: 0,
    spend_time: null,
    customFieldValues: {},
  })

  // 验证任务表单
  const validateTaskForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!taskForm.value.taskNo.trim()) {
      errors.taskNo = '任务名称不能为空'
    }

    if (!taskForm.value.start_date) {
      errors.start_date = '开始时间不能为空'
    }

    if (!taskForm.value.end_date) {
      errors.end_date = '结束时间不能为空'
    }

    if (
      taskForm.value.start_date &&
      taskForm.value.end_date &&
      DateUtils.isAfter(taskForm.value.start_date, taskForm.value.end_date)
    ) {
      errors.dateRange = '开始时间不能晚于结束时间'
    }

    if (taskForm.value.job_progress < 0 || taskForm.value.job_progress > 1) {
      errors.job_progress = '进度必须在0-1之间'
    }

    // 验证自定义字段
    if (customFields.value.length > 0) {
      customFields.value.forEach(field => {
        if (
          field.required &&
          (!taskForm.value.customFieldValues[field.id] ||
            String(taskForm.value.customFieldValues[field.id]).trim() === '')
        ) {
          errors[`customField_${field.id}`] = `${field.label}为必填字段`
        }

        if (field.type === 'number' && taskForm.value.customFieldValues[field.id] !== undefined) {
          const value = Number(taskForm.value.customFieldValues[field.id])
          if (isNaN(value)) {
            errors[`customField_${field.id}`] = `${field.label}必须是数字`
          }
        }
      })
    }

    taskFormErrors.value = errors
    return Object.keys(errors).length === 0
  }

  // 打开新建根任务对话框
  const openAddRootTaskDialog = () => {
    isEditMode.value = false
    isRootTask.value = true
    taskForm.value = {
      pid: '0',
      taskNo: '',
      level: '一般',
      start_date: DateUtils.format(DateUtils.now(), 'YYYY-MM-DDTHH:mm'),
      end_date: DateUtils.format(DateUtils.add(DateUtils.now(), 1, 'day'), 'YYYY-MM-DDTHH:mm'),
      job_progress: 0,
      spend_time: null,
      customFieldValues: {},
    }
    taskFormErrors.value = {}
    showTaskDialog.value = true
  }

  // 打开新建子任务对话框
  const openAddSubTaskDialog = (parentId: string) => {
    isEditMode.value = false
    isRootTask.value = false
    const parentTask = dataConfig.value.dataSource.find((t: any) => t.id === parentId)
    taskForm.value = {
      pid: parentId,
      taskNo: '',
      level: '一般',
      start_date: parentTask
        ? parentTask.start_date.replace(' ', 'T').slice(0, 16)
        : DateUtils.format(DateUtils.now(), 'YYYY-MM-DDTHH:mm'),
      end_date: parentTask
        ? parentTask.end_date.replace(' ', 'T').slice(0, 16)
        : DateUtils.format(DateUtils.add(DateUtils.now(), 1, 'day'), 'YYYY-MM-DDTHH:mm'),
      job_progress: 0,
      spend_time: null,
      customFieldValues: {},
    }
    taskFormErrors.value = {}
    showTaskDialog.value = true
  }

  // 打开编辑任务对话框
  const openEditTaskDialog = (taskId: string) => {
    isEditMode.value = true
    isRootTask.value = false
    const task = dataConfig.value.dataSource.find((t: any) => t.id === taskId)
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
        customFieldValues: task.customFieldValues || {},
      }
      taskFormErrors.value = {}
      showTaskDialog.value = true
    }
  }

  // 关闭任务对话框
  const closeTaskDialog = () => {
    showTaskDialog.value = false
  }

  // 打开删除对话框
  const openDeleteDialog = (taskId: string) => {
    const task = dataConfig.value.dataSource.find((t: any) => t.id === taskId)
    if (task) {
      deleteTaskId.value = taskId
      deleteTaskName.value = task.taskNo
      showDeleteDialog.value = true
    }
  }

  // 关闭删除对话框
  const closeDeleteDialog = () => {
    showDeleteDialog.value = false
    deleteTaskId.value = ''
    deleteTaskName.value = ''
  }

  // 保存任务
  const saveTask = async (
    onSuccess: (msg: string) => void,
    onError: (msg: string) => void,
    processTasksCallback: (task: any) => any
  ) => {
    if (!validateTaskForm()) {
      onError('请修正表单中的错误')
      return
    }

    try {
      const formatDate = (dateStr: string) => {
        return DateUtils.format(dateStr, 'YYYY-MM-DD HH:mm:ss')
      }

      const taskData = {
        ...taskForm.value,
        start_date: formatDate(taskForm.value.start_date),
        end_date: formatDate(taskForm.value.end_date),
        job_progress: String(taskForm.value.job_progress),
      }

      if (isEditMode.value && taskForm.value.id) {
        const response = await taskApi.updateTask(taskForm.value.id, taskData)
        if (response.code === 200) {
          const index = dataConfig.value.dataSource.findIndex(
            (t: any) => t.id === taskForm.value.id
          )
          if (index !== -1) {
            const updatedTask = { ...dataConfig.value.dataSource[index], ...taskData }
            const processedTask = processTasksCallback(updatedTask)
            dataConfig.value.dataSource[index] = processedTask
            dataConfig.value.dataSource = [...dataConfig.value.dataSource]
          }
          onSuccess('任务更新成功')
          closeTaskDialog()
        } else {
          onError('任务更新失败')
        }
      } else {
        const response = await taskApi.addTask(taskData)
        if (response.code === 200) {
          const newTask = processTasksCallback(response.data)
          dataConfig.value.dataSource.push(newTask)
          dataConfig.value.dataSource = [...dataConfig.value.dataSource]
          onSuccess('任务创建成功')
          closeTaskDialog()
        } else {
          onError('任务创建失败')
        }
      }
    } catch (error) {
      console.error('保存任务失败:', error)
      onError('操作失败，请稍后重试')
    }
  }

  // 确认删除任务
  const confirmDelete = async (
    onSuccess: (msg: string) => void,
    onError: (msg: string) => void
  ) => {
    try {
      const response = await taskApi.deleteTask(deleteTaskId.value)
      if (response.code === 200) {
        const deleteTaskAndChildren = (taskId: string) => {
          const children = dataConfig.value.dataSource.filter((t: any) => t.pid === taskId)
          children.forEach((child: any) => deleteTaskAndChildren(child.id))
          dataConfig.value.dataSource = dataConfig.value.dataSource.filter(
            (t: any) => t.id !== taskId
          )
        }

        deleteTaskAndChildren(deleteTaskId.value)
        onSuccess('任务删除成功')
        closeDeleteDialog()
      } else {
        onError('任务删除失败')
      }
    } catch (error) {
      console.error('删除任务失败:', error)
      onError('删除失败，请稍后重试')
    }
  }

  return {
    showTaskDialog,
    showDeleteDialog,
    isEditMode,
    isRootTask,
    deleteTaskId,
    deleteTaskName,
    taskForm,
    taskFormErrors,
    validateTaskForm,
    openAddRootTaskDialog,
    openAddSubTaskDialog,
    openEditTaskDialog,
    closeTaskDialog,
    openDeleteDialog,
    closeDeleteDialog,
    saveTask,
    confirmDelete,
  }
}
