<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>⏰ 任务约束验证结果</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="results && results.length > 0">
        <!-- 验证概览 -->
        <div class="summary-section" :class="{ 'summary-error': totalViolations > 0, 'summary-success': totalViolations === 0 }">
          <div class="summary-header">
            <span class="status-icon">{{ totalViolations === 0 ? '✅' : '⚠️' }}</span>
            <h3>{{ totalViolations === 0 ? '约束验证通过' : '发现约束冲突' }}</h3>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">总任务数：</span>
              <span class="value">{{ results.length }} 个</span>
            </div>
            <div class="summary-item">
              <span class="label">通过验证：</span>
              <span class="value success">{{ validTasksCount }} 个</span>
            </div>
            <div class="summary-item">
              <span class="label">约束冲突：</span>
              <span class="value" :class="{ 'error': totalViolations > 0 }">
                {{ totalViolations }} 个
              </span>
            </div>
            <div class="summary-item">
              <span class="label">警告数量：</span>
              <span class="value" :class="{ 'warning': totalWarnings > 0 }">
                {{ totalWarnings }} 个
              </span>
            </div>
          </div>
        </div>

        <!-- 筛选选项 -->
        <div class="filter-section">
          <label>
            <input type="checkbox" v-model="showOnlyViolations" />
            仅显示有冲突的任务
          </label>
          <label>
            <input type="checkbox" v-model="showOnlyWarnings" />
            仅显示有警告的任务
          </label>
          <label>
            <input type="checkbox" v-model="showOnlyValid" />
            仅显示通过验证的任务
          </label>
        </div>

        <!-- 任务约束详情 -->
        <div class="section">
          <h3>📋 任务约束详情 ({{ filteredResults.length }} / {{ results.length }})</h3>
          <div class="task-list">
            <div
              v-for="task in filteredResults"
              :key="task.taskId"
              class="task-card"
              :class="{
                'has-violations': task.violations.length > 0,
                'has-warnings': task.warnings.length > 0 && task.violations.length === 0,
                'is-valid': task.isValid && task.warnings.length === 0
              }"
            >
              <div class="task-header">
                <div class="task-title">
                  <span class="task-icon">
                    {{ task.violations.length > 0 ? '❌' : task.warnings.length > 0 ? '⚠️' : '✅' }}
                  </span>
                  <span class="task-name">{{ getTaskName(task.taskId) }}</span>
                  <span class="task-id">ID: {{ task.taskId }}</span>
                </div>
                <div class="task-badges">
                  <span v-if="task.violations.length > 0" class="badge badge-error">
                    {{ task.violations.length }} 个冲突
                  </span>
                  <span v-if="task.warnings.length > 0" class="badge badge-warning">
                    {{ task.warnings.length }} 个警告
                  </span>
                  <span v-if="task.isValid && task.warnings.length === 0" class="badge badge-success">
                    验证通过
                  </span>
                </div>
              </div>

              <!-- 约束冲突 -->
              <div v-if="task.violations.length > 0" class="violations-section">
                <h4>约束冲突：</h4>
                <div class="violation-list">
                  <div
                    v-for="(violation, index) in task.violations"
                    :key="index"
                    class="violation-item"
                  >
                    <div class="violation-header">
                      <span class="violation-number">{{ index + 1 }}</span>
                      <span class="constraint-type">{{ getConstraintTypeLabel(violation.constraintType) }}</span>
                      <span class="severity-badge" :class="violation.severity">
                        {{ violation.severity === 'error' ? '错误' : '警告' }}
                      </span>
                    </div>
                    <div class="violation-message">{{ violation.message }}</div>
                    <div class="violation-details" v-if="violation.currentDate || violation.constraintDate">
                      <div class="detail-row">
                        <span class="detail-label">当前日期：</span>
                        <span class="detail-value">{{ formatDate(violation.currentDate) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">约束日期：</span>
                        <span class="detail-value highlight">{{ formatDate(violation.constraintDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 警告信息 -->
              <div v-if="task.warnings.length > 0" class="warnings-section">
                <h4>警告信息：</h4>
                <div class="warning-list">
                  <div
                    v-for="(warning, index) in task.warnings"
                    :key="index"
                    class="warning-item"
                  >
                    <div class="warning-message">
                      <span class="warning-number">{{ index + 1 }}.</span>
                      {{ warning.message }}
                    </div>
                    <div v-if="warning.suggestion" class="warning-suggestion">
                      💡 建议：{{ warning.suggestion }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 约束类型说明 -->
        <div class="section">
          <h3>📖 约束类型说明</h3>
          <div class="constraint-types-grid">
            <div class="constraint-type-card">
              <div class="type-code">SNET</div>
              <div class="type-name">Start No Earlier Than</div>
              <div class="type-desc">不早于指定日期开始</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">SNLT</div>
              <div class="type-name">Start No Later Than</div>
              <div class="type-desc">不晚于指定日期开始</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">FNET</div>
              <div class="type-name">Finish No Earlier Than</div>
              <div class="type-desc">不早于指定日期完成</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">FNLT</div>
              <div class="type-name">Finish No Later Than</div>
              <div class="type-desc">不晚于指定日期完成</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">MSO</div>
              <div class="type-name">Must Start On</div>
              <div class="type-desc">必须在指定日期开始</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">MFO</div>
              <div class="type-name">Must Finish On</div>
              <div class="type-desc">必须在指定日期完成</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">ASAP</div>
              <div class="type-name">As Soon As Possible</div>
              <div class="type-desc">尽快开始</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">ALAP</div>
              <div class="type-name">As Late As Possible</div>
              <div class="type-desc">尽可能晚开始</div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="metro-btn" @click="exportReport">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
          导出报告
        </button>
        <button class="metro-btn metro-btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { ConstraintValidationResult } from '../components/gantt/features/TaskConstraintManager'

export default defineComponent({
  name: 'ConstraintValidationDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    results: {
      type: Array as () => ConstraintValidationResult[],
      required: true
    },
    tasks: {
      type: Array as () => any[],
      default: () => []
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const showOnlyViolations = ref(false)
    const showOnlyWarnings = ref(false)
    const showOnlyValid = ref(false)

    // 创建任务ID到任务对象的映射
    const taskMap = computed(() => {
      const map = new Map()
      props.tasks.forEach(task => {
        map.set(task.id, task)
      })
      return map
    })

    // 获取任务名称的辅助函数
    const getTaskName = (taskId: string | number): string => {
      const task = taskMap.value.get(taskId)
      if (task) {
        return task.taskNo || task.task_name || String(taskId)
      }
      return String(taskId)
    }

    const totalViolations = computed(() => {
      return props.results.reduce((sum, r) => sum + r.violations.length, 0)
    })

    const totalWarnings = computed(() => {
      return props.results.reduce((sum, r) => sum + r.warnings.length, 0)
    })

    const validTasksCount = computed(() => {
      return props.results.filter(r => r.isValid).length
    })

    const filteredResults = computed(() => {
      let filtered = [...props.results]

      if (showOnlyViolations.value) {
        filtered = filtered.filter(r => r.violations.length > 0)
      } else if (showOnlyWarnings.value) {
        filtered = filtered.filter(r => r.warnings.length > 0 && r.violations.length === 0)
      } else if (showOnlyValid.value) {
        filtered = filtered.filter(r => r.isValid && r.warnings.length === 0)
      }

      return filtered.sort((a, b) => {
        const violationsDiff = b.violations.length - a.violations.length
        if (violationsDiff !== 0) return violationsDiff
        return b.warnings.length - a.warnings.length
      })
    })

    const getConstraintTypeLabel = (type: string): string => {
      const labels: Record<string, string> = {
        'SNET': '不早于...开始',
        'SNLT': '不晚于...开始',
        'FNET': '不早于...完成',
        'FNLT': '不晚于...完成',
        'MSO': '必须在...开始',
        'MFO': '必须在...完成',
        'ASAP': '尽快开始',
        'ALAP': '尽可能晚开始'
      }
      return labels[type] || type
    }

    const formatDate = (date?: string): string => {
      if (!date) return '-'
      return date.split(' ')[0]
    }

    const exportReport = () => {
      const lines: string[] = []
      lines.push('任务约束验证报告')
      lines.push('='.repeat(50))
      lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`)
      lines.push(`总任务数: ${props.results.length}`)
      lines.push(`通过验证: ${validTasksCount.value}`)
      lines.push(`约束冲突: ${totalViolations.value}`)
      lines.push(`警告数量: ${totalWarnings.value}`)
      lines.push('')

      const problematicTasks = props.results.filter(r => !r.isValid || r.warnings.length > 0)
      if (problematicTasks.length > 0) {
        lines.push('任务详情:')
        lines.push('-'.repeat(50))

        problematicTasks.forEach(task => {
          lines.push(`\n任务: ${task.taskName} (ID: ${task.taskId})`)

          if (task.violations.length > 0) {
            lines.push('  约束冲突:')
            task.violations.forEach((v, idx) => {
              lines.push(`    ${idx + 1}. [${getConstraintTypeLabel(v.constraintType)}] ${v.message}`)
              if (v.currentDate) lines.push(`       当前日期: ${formatDate(v.currentDate)}`)
              if (v.constraintDate) lines.push(`       约束日期: ${formatDate(v.constraintDate)}`)
            })
          }

          if (task.warnings.length > 0) {
            lines.push('  警告:')
            task.warnings.forEach((w, idx) => {
              lines.push(`    ${idx + 1}. ${w.message}`)
              if (w.suggestion) lines.push(`       建议: ${w.suggestion}`)
            })
          }
        })
      }

      const content = lines.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `约束验证报告_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
    }

    return {
      showOnlyViolations,
      showOnlyWarnings,
      showOnlyValid,
      totalViolations,
      totalWarnings,
      validTasksCount,
      filteredResults,
      getConstraintTypeLabel,
      formatDate,
      exportReport,
      getTaskName
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
  max-width: 1200px;
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
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 2px solid;
}

.summary-section.summary-error {
  background: #fff8e1;
  border-color: #ffc107;
}

.summary-section.summary-success {
  background: #f0fff4;
  border-color: #28a745;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-icon {
  font-size: 32px;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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

.summary-item .value.success {
  color: #28a745;
}

.summary-item .value.error {
  color: #dc3545;
}

.summary-item .value.warning {
  color: #ffc107;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  border-radius: 8px;
  border: 2px solid;
  padding: 16px;
  background: white;
}

.task-card.has-violations {
  border-color: #ffc107;
  background: #fff8e1;
}

.task-card.has-warnings {
  border-color: #17a2b8;
  background: #e7f7fa;
}

.task-card.is-valid {
  border-color: #28a745;
  background: #f0fff4;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-icon {
  font-size: 20px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.task-id {
  font-size: 13px;
  color: #6c757d;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.task-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge-error {
  background: #ffc107;
  color: #333;
}

.badge-warning {
  background: #17a2b8;
}

.badge-success {
  background: #28a745;
}

.violations-section,
.warnings-section {
  margin-top: 12px;
}

.violations-section h4,
.warnings-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
}

.violation-list,
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.violation-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
}

.violation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.violation-number {
  background: #6c757d;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.constraint-type {
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.severity-badge {
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.severity-badge.error {
  background: #dc3545;
}

.severity-badge.warning {
  background: #ffc107;
  color: #333;
}

.violation-message {
  font-size: 13px;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.5;
}

.violation-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #212529;
  font-weight: 600;
}

.detail-value.highlight {
  color: #dc3545;
}

.warning-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
}

.warning-message {
  font-size: 13px;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.5;
}

.warning-number {
  font-weight: 600;
  color: #17a2b8;
}

.warning-suggestion {
  font-size: 12px;
  color: #495057;
  padding: 8px;
  background: #e7f7fa;
  border-left: 3px solid #17a2b8;
  border-radius: 4px;
  line-height: 1.5;
}

.constraint-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.constraint-type-card {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
}

.type-code {
  font-size: 16px;
  font-weight: 700;
  color: #0078d4;
  margin-bottom: 4px;
}

.type-name {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}

.type-desc {
  font-size: 13px;
  color: #212529;
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
