<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>🔍 依赖关系验证结果</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="result">
        <!-- 验证概览 -->
        <div class="summary-section" :class="{ 'summary-error': !result.isValid, 'summary-success': result.isValid }">
          <div class="summary-header">
            <span class="status-icon">{{ result.isValid ? '✅' : '❌' }}</span>
            <h3>{{ result.isValid ? '验证通过' : '验证失败' }}</h3>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">验证状态：</span>
              <span :class="['value', result.isValid ? 'success' : 'error']">
                {{ result.isValid ? '通过' : '失败' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">错误数量：</span>
              <span class="value" :class="{ 'error': result.errors.length > 0 }">
                {{ result.errors.length }} 个
              </span>
            </div>
            <div class="summary-item">
              <span class="label">警告数量：</span>
              <span class="value" :class="{ 'warning': result.warnings.length > 0 }">
                {{ result.warnings.length }} 个
              </span>
            </div>
          </div>
        </div>

        <!-- 错误列表 -->
        <div class="section" v-if="result.errors.length > 0">
          <h3>❌ 错误列表 ({{ result.errors.length }})</h3>
          <div class="issue-list">
            <div
              v-for="(error, index) in result.errors"
              :key="index"
              class="issue-card error-card"
            >
              <div class="issue-header">
                <span class="issue-number">{{ index + 1 }}</span>
                <span class="issue-type-badge error">{{ getErrorTypeLabel(error.type) }}</span>
                <span class="severity-badge" :class="error.severity">{{ error.severity === 'critical' ? '严重' : '错误' }}</span>
              </div>
              <div class="issue-body">
                <div class="issue-message">{{ error.message }}</div>
                <div class="issue-details">
                  <div v-if="error.sourceTaskId" class="detail-item">
                    <span class="detail-label">前置任务：</span>
                    <span class="detail-value">{{ getTaskName(error.sourceTaskId) }} (ID: {{ error.sourceTaskId }})</span>
                  </div>
                  <div v-if="error.targetTaskId" class="detail-item">
                    <span class="detail-label">后续任务：</span>
                    <span class="detail-value">{{ getTaskName(error.targetTaskId) }} (ID: {{ error.targetTaskId }})</span>
                  </div>
                  <div v-if="error.linkType" class="detail-item">
                    <span class="detail-label">依赖类型：</span>
                    <span class="detail-value link-type">{{ getLinkTypeLabel(error.linkType) }}</span>
                  </div>
                </div>
                <div v-if="error.resolution" class="issue-resolution">
                  <strong>💡 解决方案：</strong> {{ error.resolution }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 警告列表 -->
        <div class="section" v-if="result.warnings.length > 0">
          <h3>⚠️ 警告列表 ({{ result.warnings.length }})</h3>
          <div class="issue-list">
            <div
              v-for="(warning, index) in result.warnings"
              :key="index"
              class="issue-card warning-card"
            >
              <div class="issue-header">
                <span class="issue-number">{{ index + 1 }}</span>
                <span class="issue-type-badge warning">{{ getWarningTypeLabel(warning.type) }}</span>
              </div>
              <div class="issue-body">
                <div class="issue-message">{{ warning.message }}</div>
                <div class="issue-details">
                  <div v-if="warning.sourceTaskId" class="detail-item">
                    <span class="detail-label">前置任务：</span>
                    <span class="detail-value">{{ getTaskName(warning.sourceTaskId) }} (ID: {{ warning.sourceTaskId }})</span>
                  </div>
                  <div v-if="warning.targetTaskId" class="detail-item">
                    <span class="detail-label">后续任务：</span>
                    <span class="detail-value">{{ getTaskName(warning.targetTaskId) }} (ID: {{ warning.targetTaskId }})</span>
                  </div>
                  <div v-if="warning.linkType" class="detail-item">
                    <span class="detail-label">依赖类型：</span>
                    <span class="detail-value link-type">{{ getLinkTypeLabel(warning.linkType) }}</span>
                  </div>
                </div>
                <div v-if="warning.suggestion" class="issue-suggestion">
                  <strong>💭 建议：</strong> {{ warning.suggestion }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 循环依赖检测 -->
        <div class="section" v-if="cycles && cycles.length > 0">
          <h3>🔄 循环依赖 ({{ cycles.length }})</h3>
          <div class="cycle-list">
            <div v-for="(cycle, index) in cycles" :key="index" class="cycle-card">
              <div class="cycle-header">
                <span class="cycle-number">循环 {{ index + 1 }}</span>
                <span class="cycle-length">长度: {{ cycle.length }} 个任务</span>
              </div>
              <div class="cycle-description">
                {{ cycle.description }}
              </div>
              <div class="cycle-flow">
                <div class="flow-path">
                  <span v-for="(taskId, idx) in cycle.cycle" :key="idx" class="flow-item">
                    <span class="task-node">{{ getTaskName(taskId) }}</span>
                    <span v-if="idx < cycle.cycle.length - 1" class="flow-arrow">→</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 成功消息 -->
        <div class="section" v-if="result.isValid && result.errors.length === 0 && (!cycles || cycles.length === 0)">
          <div class="success-message">
            <div class="success-icon">✅</div>
            <div class="success-text">
              <h3>所有依赖关系验证通过！</h3>
              <p>未发现任何错误或循环依赖</p>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="section">
          <h3>📊 依赖关系统计</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">总依赖数</div>
              <div class="stat-value">{{ totalDependencies }}</div>
            </div>
            <div class="stat-card error">
              <div class="stat-label">错误数</div>
              <div class="stat-value">{{ result.errors.length }}</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-label">警告数</div>
              <div class="stat-value">{{ result.warnings.length }}</div>
            </div>
            <div class="stat-card" v-if="cycles">
              <div class="stat-label">循环依赖</div>
              <div class="stat-value">{{ cycles.length }}</div>
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
import { defineComponent, computed } from 'vue'
import type { DependencyValidationResult, DependencyCycle } from '../components/gantt/features/DependencyValidator'
import { LinkType } from '../components/gantt/types/Types'

export default defineComponent({
  name: 'DependencyValidationDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    result: {
      type: Object as () => DependencyValidationResult | null,
      default: null
    },
    cycles: {
      type: Array as () => DependencyCycle[],
      default: () => []
    },
    tasks: {
      type: Array as () => any[],
      default: () => []
    },
    totalDependencies: {
      type: Number,
      default: 0
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    // 创建任务ID到任务对象的映射（响应式）
    const taskMap = computed(() => {
      const map = new Map()
      props.tasks.forEach((task: any) => {
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

    // 获取依赖关系类型的中文标签
    const getLinkTypeLabel = (linkType?: string): string => {
      if (!linkType) return ''
      const labels: Record<string, string> = {
        [LinkType.FINISH_TO_START]: 'FS (完成-开始)',
        [LinkType.START_TO_START]: 'SS (开始-开始)',
        [LinkType.FINISH_TO_FINISH]: 'FF (完成-完成)',
        [LinkType.START_TO_FINISH]: 'SF (开始-完成)'
      }
      return labels[linkType] || linkType
    }

    const getErrorTypeLabel = (type: string): string => {
      const labels: Record<string, string> = {
        'cycle': '循环依赖',
        'self-reference': '自引用',
        'invalid-link': '无效连接',
        'date-conflict': '日期冲突',
        'missing-task': '任务缺失'
      }
      return labels[type] || type
    }

    const getWarningTypeLabel = (type: string): string => {
      const labels: Record<string, string> = {
        'redundant': '冗余依赖',
        'long-lag': '长延迟',
        'cross-project': '跨项目',
        'potential-issue': '潜在问题'
      }
      return labels[type] || type
    }

    const exportReport = () => {
      if (!props.result) return

      const lines: string[] = []
      lines.push('依赖关系验证报告')
      lines.push('=' .repeat(50))
      lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`)
      lines.push(`验证状态: ${props.result.isValid ? '通过' : '失败'}`)
      lines.push(`错误数量: ${props.result.errors.length}`)
      lines.push(`警告数量: ${props.result.warnings.length}`)
      lines.push('')

      if (props.result.errors.length > 0) {
        lines.push('错误列表:')
        lines.push('-'.repeat(50))
        props.result.errors.forEach((error, index) => {
          lines.push(`${index + 1}. [${getErrorTypeLabel(error.type)}] ${error.message}`)
          if (error.sourceTaskId) lines.push(`   前置任务: ${error.sourceTaskId}`)
          if (error.targetTaskId) lines.push(`   后续任务: ${error.targetTaskId}`)
          if (error.resolution) lines.push(`   解决方案: ${error.resolution}`)
          lines.push('')
        })
      }

      if (props.result.warnings.length > 0) {
        lines.push('警告列表:')
        lines.push('-'.repeat(50))
        props.result.warnings.forEach((warning, index) => {
          lines.push(`${index + 1}. [${getWarningTypeLabel(warning.type)}] ${warning.message}`)
          if (warning.sourceTaskId) lines.push(`   前置任务: ${warning.sourceTaskId}`)
          if (warning.targetTaskId) lines.push(`   后续任务: ${warning.targetTaskId}`)
          if (warning.suggestion) lines.push(`   建议: ${warning.suggestion}`)
          lines.push('')
        })
      }

      if (props.cycles && props.cycles.length > 0) {
        lines.push('循环依赖:')
        lines.push('-'.repeat(50))
        props.cycles.forEach((cycle, index) => {
          lines.push(`${index + 1}. ${cycle.description}`)
          lines.push(`   长度: ${cycle.length} 个任务`)
          lines.push('')
        })
      }

      const content = lines.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `依赖验证报告_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
    }

    return {
      getErrorTypeLabel,
      getWarningTypeLabel,
      exportReport,
      getTaskName,
      getLinkTypeLabel
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
  background: #fff5f5;
  border-color: #dc3545;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-card {
  border-radius: 8px;
  border: 2px solid;
  padding: 16px;
  background: white;
}

.error-card {
  border-color: #dc3545;
  background: #fff5f5;
}

.warning-card {
  border-color: #ffc107;
  background: #fffbf0;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.issue-number {
  background: #6c757d;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.issue-type-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.issue-type-badge.error {
  background: #dc3545;
}

.issue-type-badge.warning {
  background: #ffc107;
  color: #333;
}

.severity-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-left: auto;
}

.severity-badge.critical {
  background: #a71d2a;
}

.severity-badge.error {
  background: #dc3545;
}

.issue-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-message {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  line-height: 1.5;
}

.issue-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.detail-item {
  display: flex;
  gap: 6px;
  font-size: 13px;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #212529;
  font-weight: 600;
}

.detail-value.link-type {
  color: #0078d4;
  background: rgba(0, 120, 212, 0.1);
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Segoe UI', monospace;
  font-size: 12px;
}

.issue-resolution,
.issue-suggestion {
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.issue-resolution {
  background: #e7f5ff;
  border-left: 4px solid #0078d4;
}

.issue-suggestion {
  background: #fff9e6;
  border-left: 4px solid #ffc107;
}

.cycle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cycle-card {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
}

.cycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cycle-number {
  font-weight: 600;
  color: #856404;
  font-size: 14px;
}

.cycle-length {
  font-size: 13px;
  color: #856404;
  background: rgba(133, 100, 4, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.cycle-description {
  font-size: 14px;
  color: #212529;
  margin-bottom: 12px;
}

.cycle-flow {
  background: white;
  border-radius: 4px;
  padding: 12px;
}

.flow-path {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-node {
  background: #856404;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.flow-arrow {
  font-size: 16px;
  color: #856404;
  font-weight: bold;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: #f0fff4;
  border: 2px solid #28a745;
  border-radius: 8px;
}

.success-icon {
  font-size: 48px;
}

.success-text h3 {
  margin: 0 0 8px 0;
  color: #155724;
  font-size: 18px;
}

.success-text p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-card.error {
  background: linear-gradient(145deg, #fff5f5, #ffe5e5);
  border-color: #dc3545;
}

.stat-card.warning {
  background: linear-gradient(145deg, #fffbf0, #fff3cd);
  border-color: #ffc107;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
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
