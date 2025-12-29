<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>🎯 关键路径分析结果</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="result">
        <!-- 概览信息 -->
        <div class="summary-section">
          <h3>📊 项目概览</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">项目工期：</span>
              <span class="value highlight">{{ result.projectDuration }} 天</span>
            </div>
            <div class="summary-item">
              <span class="label">关键任务数：</span>
              <span class="value critical">{{ result.criticalTaskIds.length }} 个</span>
            </div>
            <div class="summary-item">
              <span class="label">关键路径时长：</span>
              <span class="value highlight">{{ result.criticalPathDuration }} 天</span>
            </div>
            <div class="summary-item">
              <span class="label">项目开始：</span>
              <span class="value">{{ formatDate(result.projectStartDate) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">项目结束：</span>
              <span class="value">{{ formatDate(result.projectEndDate) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">总任务数：</span>
              <span class="value">{{ result.taskAnalysis.size }} 个</span>
            </div>
          </div>
        </div>

        <!-- 关键路径 -->
        <div class="section">
          <h3>🔴 关键路径</h3>
          <div class="critical-path">
            <div class="path-flow">
              <span
                v-for="(taskId, index) in result.criticalPath"
                :key="taskId"
                class="path-item"
              >
                <span class="task-badge critical">
                  {{ getTaskName(taskId) }}
                </span>
                <span v-if="index < result.criticalPath.length - 1" class="arrow">→</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 关键任务列表 -->
        <div class="section">
          <h3>⚠️ 关键任务列表（浮动时间 = 0）</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>任务ID</th>
                  <th>任务名称</th>
                  <th>最早开始</th>
                  <th>最早完成</th>
                  <th>最晚开始</th>
                  <th>最晚完成</th>
                  <th>总浮动</th>
                  <th>自由浮动</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="taskId in result.criticalTaskIds"
                  :key="taskId"
                  class="critical-row"
                >
                  <td>{{ taskId }}</td>
                  <td class="task-name">{{ getTaskAnalysis(taskId)?.taskName }}</td>
                  <td>{{ getTaskAnalysis(taskId)?.earlyStart }}</td>
                  <td>{{ getTaskAnalysis(taskId)?.earlyFinish }}</td>
                  <td>{{ getTaskAnalysis(taskId)?.lateStart }}</td>
                  <td>{{ getTaskAnalysis(taskId)?.lateFinish }}</td>
                  <td class="critical-value">{{ getTaskAnalysis(taskId)?.totalFloat }}</td>
                  <td class="critical-value">{{ getTaskAnalysis(taskId)?.freeFloat }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 所有任务详细信息 -->
        <div class="section">
          <h3>📋 所有任务浮动时间分析</h3>
          <div class="filter-section">
            <label>
              <input type="checkbox" v-model="showOnlyCritical" />
              仅显示关键任务
            </label>
            <label>
              <input type="checkbox" v-model="showOnlyNonCritical" />
              仅显示非关键任务
            </label>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>任务ID</th>
                  <th>任务名称</th>
                  <th>是否关键</th>
                  <th>总浮动时间</th>
                  <th>自由浮动时间</th>
                  <th>最早开始</th>
                  <th>最早完成</th>
                  <th>最晚开始</th>
                  <th>最晚完成</th>
                  <th>前置任务</th>
                  <th>后续任务</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in filteredTasks"
                  :key="task.taskId"
                  :class="{ 'critical-row': task.isCritical }"
                >
                  <td>{{ task.taskId }}</td>
                  <td class="task-name">{{ task.taskName }}</td>
                  <td>
                    <span :class="['badge', task.isCritical ? 'badge-critical' : 'badge-normal']">
                      {{ task.isCritical ? '是' : '否' }}
                    </span>
                  </td>
                  <td :class="{ 'critical-value': task.totalFloat === 0 }">
                    {{ task.totalFloat }} 天
                  </td>
                  <td :class="{ 'critical-value': task.freeFloat === 0 }">
                    {{ task.freeFloat }} 天
                  </td>
                  <td>{{ task.earlyStart }}</td>
                  <td>{{ task.earlyFinish }}</td>
                  <td>{{ task.lateStart }}</td>
                  <td>{{ task.lateFinish }}</td>
                  <td class="task-list">
                    {{ formatTaskList(task.predecessorIds) }}
                  </td>
                  <td class="task-list">
                    {{ formatTaskList(task.successorIds) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="metro-btn" @click="exportToCSV">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
          导出数据
        </button>
        <button class="metro-btn metro-btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { CriticalPathResult, TaskAnalysis } from '../components/gantt/features/CriticalPathAnalyzer'

export default defineComponent({
  name: 'CriticalPathDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    result: {
      type: Object as () => CriticalPathResult | null,
      default: null
    },
    tasks: {
      type: Array as () => any[],
      default: () => []
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const showOnlyCritical = ref(false)
    const showOnlyNonCritical = ref(false)

    // 创建任务ID到任务对象的映射
    const taskMap = computed(() => {
      const map = new Map()
      props.tasks.forEach(task => {
        map.set(task.id, task)
      })
      return map
    })

    const formatDate = (dateStr: string) => {
      return dateStr.split(' ')[0]
    }

    const getTaskAnalysis = (taskId: string | number): TaskAnalysis | undefined => {
      return props.result?.taskAnalysis.get(taskId)
    }

    const getTaskName = (taskId: string | number): string => {
      // 首先尝试从任务数据中获取任务名称
      const task = taskMap.value.get(taskId)
      if (task) {
        return task.taskNo || task.task_name || String(taskId)
      }

      // 如果任务数据中没有，使用分析结果中的名称
      const analysis = props.result?.taskAnalysis.get(taskId)
      return analysis?.taskName || String(taskId)
    }

    const formatTaskList = (taskIds: (string | number)[]): string => {
      if (!taskIds || taskIds.length === 0) return '-'
      return taskIds.map(id => getTaskName(id)).join(', ')
    }

    const filteredTasks = computed(() => {
      if (!props.result) return []

      let tasks = Array.from(props.result.taskAnalysis.values())

      if (showOnlyCritical.value) {
        tasks = tasks.filter(t => t.isCritical)
      } else if (showOnlyNonCritical.value) {
        tasks = tasks.filter(t => !t.isCritical)
      }

      return tasks.sort((a, b) => {
        if (a.isCritical !== b.isCritical) {
          return a.isCritical ? -1 : 1
        }
        return a.totalFloat - b.totalFloat
      })
    })

    const exportToCSV = () => {
      if (!props.result) return

      const rows: string[] = []
      rows.push('任务ID,任务名称,是否关键,总浮动时间,自由浮动时间,最早开始,最早完成,最晚开始,最晚完成,前置任务,后续任务')

      Array.from(props.result.taskAnalysis.values()).forEach(task => {
        rows.push([
          task.taskId,
          task.taskName,
          task.isCritical ? '是' : '否',
          task.totalFloat,
          task.freeFloat,
          task.earlyStart,
          task.earlyFinish,
          task.lateStart,
          task.lateFinish,
          formatTaskList(task.predecessorIds),
          formatTaskList(task.successorIds)
        ].join(','))
      })

      const csv = rows.join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `关键路径分析_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }

    return {
      showOnlyCritical,
      showOnlyNonCritical,
      formatDate,
      getTaskAnalysis,
      getTaskName,
      formatTaskList,
      filteredTasks,
      exportToCSV
    }
  }
})
</script>

<style scoped>
.dialog-overlay {
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
  padding: 20px;
}

.dialog-container {
  background: #ffffff;
  border-radius: 8px;
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid #e0e0e0;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
}

.dialog-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.summary-section {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #dee2e6;
}

.summary-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #495057;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.summary-item .value.highlight {
  color: #0078d4;
}

.summary-item .value.critical {
  color: #dc3545;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 8px;
}

.critical-path {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
}

.path-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-badge {
  background: #dc3545;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.arrow {
  font-size: 18px;
  color: #dc3545;
  font-weight: bold;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.filter-section label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
}

.filter-section input[type="checkbox"] {
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e9ecef;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.critical-row {
  background: #fff5f5 !important;
}

.critical-row:hover {
  background: #ffe5e5 !important;
}

.task-name {
  font-weight: 500;
  color: #212529;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-list {
  font-size: 12px;
  color: #6c757d;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.critical-value {
  color: #dc3545;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-critical {
  background: #dc3545;
  color: white;
}

.badge-normal {
  background: #28a745;
  color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 2px solid #e0e0e0;
  background: #f8f9fa;
}

.metro-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  border: 1px solid #d0d0d0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  color: #666666;
  border-radius: 4px;
  transition: all 0.2s;
}

.metro-btn:hover {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  color: #333333;
}

.metro-btn-primary {
  background: linear-gradient(145deg, #0078d4, #106ebe) !important;
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.metro-btn-primary:hover {
  background: linear-gradient(145deg, #106ebe, #005a9e) !important;
}
</style>
