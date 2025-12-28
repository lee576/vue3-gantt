// 任务表单数据类型
export interface TaskForm {
  id?: string
  pid: string
  taskNo: string
  level: string
  start_date: string
  end_date: string
  job_progress: number
  spend_time: string | null
  customFieldValues: Record<string, any>
}

// 自定义字段类型
export interface CustomField {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  required: boolean
  options: string[]
}

// 消息提示类型
export interface Message {
  text: string
  type: 'success' | 'error' | 'warning'
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
