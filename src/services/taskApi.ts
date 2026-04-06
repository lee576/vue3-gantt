import type { ApiResponse } from '../types/task'
import type { TaskMoveDetail } from '../components/gantt/types/Types'

// 模拟后端 API 服务
// 在实际项目中，请将这些方法替换为真实的 API 调用
// 自定义字段说明：
// - 任务对象应包含 customFieldValues 字段，格式为 { fieldId: value }
// - 例如：{ customFieldValues: { 'field-123': '张三', 'field-456': 100 } }
// - 后端需要存储和返回 customFieldValues 数据
export const taskApi = {
  // 模拟延迟
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 新增任务
  async addTask(task: any): Promise<ApiResponse> {
    await this.delay(300)
    return {
      code: 200,
      message: '任务创建成功',
      data: {
        id: `task-${Date.now()}`,
        ...task,
      },
    }
  },

  async updateTask(taskId: string, task: any): Promise<ApiResponse> {
    await this.delay(300)
    // 这里是本地 mock，实现里暂时只回传更新后的任务对象。
    // 显式消费 taskId 只是为了在开启 noUnusedParameters 后仍保持函数签名与真实 API 对齐。
    void taskId
    return {
      code: 200,
      message: '任务更新成功',
      data: task,
    }
  },

  async deleteTask(taskId: string): Promise<ApiResponse> {
    await this.delay(300)
    return {
      code: 200,
      message: '任务删除成功',
      data: { id: taskId },
    }
  },

  // 更新任务进度
  async updateProgress(taskId: string, progress: number): Promise<ApiResponse> {
    await this.delay(200)
    console.log('更新进度请求:', taskId, progress)
    return {
      code: 200,
      message: '进度更新成功',
      data: { id: taskId, progress },
    }
  },

  // 更新任务日期
  async updateTaskDate(taskId: string, startDate: string, endDate: string): Promise<ApiResponse> {
    await this.delay(200)
    return {
      code: 200,
      message: '日期更新成功',
      data: { id: taskId, startDate, endDate },
    }
  },

  async moveTask(detail: TaskMoveDetail): Promise<ApiResponse> {
    await this.delay(400)
    return {
      code: 200,
      message: '任务移动成功',
      data: {
        draggedTaskId: detail.draggedTaskId,
        targetTaskId: detail.targetTaskId,
        position: detail.position,
        tasks: detail.tasks,
      },
    }
  },
}
