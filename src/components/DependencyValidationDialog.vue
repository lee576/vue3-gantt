<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>🔍 {{ t('app.dependencyValidationResult') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="result">
        <!-- 验证概览 -->
        <div class="summary-section">
          <h3>{{ result.isValid ? '✅ ' + t('app.validationPassed') : '❌ ' + t('app.validationFailed') }}</h3>
          <p class="summary-subtitle">{{ result.isValid ? t('app.allDependenciesNormal') : t('app.issuesFoundToHandle') }}</p>
          <div class="stats-cards">
            <StatCard
              :value="totalDependencies"
              :label="t('app.totalDependencies')"
              type="primary"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              v-if="result.errors.length > 0"
              :value="result.errors.length"
              :label="t('app.errors')"
              type="error"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              v-if="result.warnings.length > 0"
              :value="result.warnings.length"
              :label="t('app.warnings')"
              type="warning"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              v-if="cycles && cycles.length > 0"
              :value="cycles.length"
              :label="t('app.cyclicDependencies')"
              type="info"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
              </template>
            </StatCard>
          </div>
        </div>

        <!-- 筛选器 -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: filterType === 'all' }"
              @click="filterType = 'all'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              {{ t('app.all') }} ({{ (result.errors.length || 0) + (result.warnings.length || 0) + (cycles?.length || 0) }})
            </button>
            <button 
              v-if="result.errors.length > 0"
              class="filter-tab" 
              :class="{ active: filterType === 'errors' }"
              @click="filterType = 'errors'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {{ t('app.errors') }} ({{ result.errors.length }})
            </button>
            <button 
              v-if="result.warnings.length > 0"
              class="filter-tab" 
              :class="{ active: filterType === 'warnings' }"
              @click="filterType = 'warnings'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              {{ t('app.warnings') }} ({{ result.warnings.length }})
            </button>
            <button 
              v-if="cycles && cycles.length > 0"
              class="filter-tab" 
              :class="{ active: filterType === 'cycles' }"
              @click="filterType = 'cycles'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              {{ t('app.cyclicDependencies') }} ({{ cycles.length }})
            </button>
          </div>
        </div>

        <!-- 错误列表 -->
        <div class="section" v-if="result.errors.length > 0 && (filterType === 'all' || filterType === 'errors')">
          <h3>❌ {{ t('app.errorList') }} ({{ result.errors.length }})</h3>
          <div class="issue-list">
            <div
              v-for="(error, index) in result.errors"
              :key="index"
              class="issue-card error-card"
            >
              <div class="issue-header">
                <span class="issue-number">{{ index + 1 }}</span>
                <span class="issue-type-badge error">{{ getErrorTypeLabel(error.type) }}</span>
                <span class="severity-badge" :class="error.severity">{{ error.severity === 'critical' ? t('app.severe') : t('app.errors') }}</span>
              </div>
              <div class="issue-body">
                <div class="issue-message">{{ error.message }}</div>
                <div class="issue-details">
                  <div v-if="error.sourceTaskId" class="detail-item">
                    <span class="detail-label">{{ t('app.predecessorTaskColon') }}</span>
                    <span class="detail-value">{{ getTaskName(error.sourceTaskId) }} {{ t('app.idPrefix') }}{{ error.sourceTaskId }}{{ t('app.idSuffix') }}</span>
                  </div>
                  <div v-if="error.targetTaskId" class="detail-item">
                    <span class="detail-label">{{ t('app.successorTaskColon') }}</span>
                    <span class="detail-value">{{ getTaskName(error.targetTaskId) }} {{ t('app.idPrefix') }}{{ error.targetTaskId }}{{ t('app.idSuffix') }}</span>
                  </div>
                  <div v-if="error.linkType" class="detail-item">
                    <span class="detail-label">{{ t('app.dependencyTypeColon') }}</span>
                    <span class="detail-value link-type">{{ getLinkTypeLabel(error.linkType) }}</span>
                  </div>
                </div>
                <div v-if="error.resolution" class="issue-resolution">
                  <strong>💡 {{ t('app.solution') }}</strong>{{ t('app.colon') }} {{ error.resolution }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 警告列表 -->
        <div class="section" v-if="result.warnings.length > 0 && (filterType === 'all' || filterType === 'warnings')">
          <h3>⚠️ {{ t('app.warningList') }} ({{ result.warnings.length }})</h3>
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
                    <span class="detail-label">{{ t('app.predecessorTaskColon') }}</span>
                    <span class="detail-value">{{ getTaskName(warning.sourceTaskId) }} {{ t('app.idPrefix') }}{{ warning.sourceTaskId }}{{ t('app.idSuffix') }}</span>
                  </div>
                  <div v-if="warning.targetTaskId" class="detail-item">
                    <span class="detail-label">{{ t('app.successorTaskColon') }}</span>
                    <span class="detail-value">{{ getTaskName(warning.targetTaskId) }} {{ t('app.idPrefix') }}{{ warning.targetTaskId }}{{ t('app.idSuffix') }}</span>
                  </div>
                  <div v-if="warning.linkType" class="detail-item">
                    <span class="detail-label">{{ t('app.dependencyTypeColon') }}</span>
                    <span class="detail-value link-type">{{ getLinkTypeLabel(warning.linkType) }}</span>
                  </div>
                </div>
                <div v-if="warning.suggestion" class="issue-suggestion">
                  <strong>💭 {{ t('app.suggestion') }}</strong>{{ t('app.colon') }} {{ warning.suggestion }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 循环依赖检测 -->
        <div class="section" v-if="cycles && cycles.length > 0 && (filterType === 'all' || filterType === 'cycles')">
          <h3>🔄 {{ t('app.cyclicDependency') }} ({{ cycles.length }})</h3>
          <div class="cycle-list">
            <div v-for="(cycle, index) in cycles" :key="index" class="cycle-card">
              <div class="cycle-header">
                <span class="cycle-number">{{ t('app.cycle') }} {{ index + 1 }}</span>
                <span class="cycle-length">{{ t('app.length') }}: {{ cycle.length }} {{ t('app.tasks') }}</span>
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
              <h3>{{ t('app.allDependenciesValidated') }}</h3>
              <p>{{ t('app.noErrorsOrCyclesFound') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="metro-btn" @click="exportReport">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
          {{ t('app.exportReport') }}
        </button>
        <button class="metro-btn metro-btn-primary" @click="$emit('close')">{{ t('app.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import type { DependencyValidationResult, DependencyCycle } from '../components/gantt/features/DependencyValidator'
import { LinkType } from '../components/gantt/types/Types'
import StatCard from './StatCard.vue'
import { i18n } from '../locales'

export default defineComponent({
  name: 'DependencyValidationDialog',
  components: {
    StatCard
  },
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
    const filterType = ref<'all' | 'errors' | 'warnings' | 'cycles'>('all')
    const t = i18n.global.t

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
    const linkTypeMap: Record<string, string> = {
      'finish-to-start': 'FS',
      'start-to-start': 'SS',
      'finish-to-finish': 'FF',
      'start-to-finish': 'SF'
    }

    const getLinkTypeLabel = (linkType?: string): string => {
      if (!linkType) return ''
      const key = linkTypeMap[linkType] || linkType
      return t(`app.linkTypeLabel.${key}`) || linkType
    }

    const getErrorTypeLabel = (type: string): string => {
      return t(`app.dependencyErrorType.${type}`) || type
    }

    const getWarningTypeLabel = (type: string): string => {
      return t(`app.dependencyWarningType.${type}`) || type
    }

    const exportReport = () => {
      if (!props.result) return

      const lines: string[] = []
      lines.push(t('app.dependencyReportGenerated'))
      lines.push('='.repeat(50))
      lines.push(`${t('app.dependencyReportGeneratedTime')}: ${new Date().toLocaleString()}`)
      lines.push(`${t('app.dependencyReportFilterType')}: ${filterType.value}`)
      lines.push(`${t('app.dependencyReportStatus')}: ${props.result.isValid ? t('app.dependencyReportPassed') : t('app.dependencyReportFailed')}`)
      lines.push(`${t('app.dependencyReportErrorCount')}: ${props.result.errors.length}`)
      lines.push(`${t('app.dependencyReportWarningCount')}: ${props.result.warnings.length}`)
      lines.push('')

      if (props.result.errors.length > 0) {
        lines.push(t('app.dependencyReportErrorListTitle'))
        lines.push('-'.repeat(50))
        props.result.errors.forEach((error, index) => {
          lines.push(`${index + 1}. [${getErrorTypeLabel(error.type)}] ${error.message}`)
          if (error.sourceTaskId) lines.push(`   ${t('app.predecessorTaskColon')}${error.sourceTaskId}`)
          if (error.targetTaskId) lines.push(`   ${t('app.successorTaskColon')}${error.targetTaskId}`)
          if (error.resolution) lines.push(`   ${t('app.solution')}${t('app.colon')}${error.resolution}`)
          lines.push('')
        })
      }

      if (props.result.warnings.length > 0) {
        lines.push(t('app.dependencyReportWarningListTitle'))
        lines.push('-'.repeat(50))
        props.result.warnings.forEach((warning, index) => {
          lines.push(`${index + 1}. [${getWarningTypeLabel(warning.type)}] ${warning.message}`)
          if (warning.sourceTaskId) lines.push(`   ${t('app.predecessorTaskColon')}${warning.sourceTaskId}`)
          if (warning.targetTaskId) lines.push(`   ${t('app.successorTaskColon')}${warning.targetTaskId}`)
          if (warning.suggestion) lines.push(`   ${t('app.suggestion')}${t('app.colon')}${warning.suggestion}`)
          lines.push('')
        })
      }

      if (props.cycles && props.cycles.length > 0) {
        lines.push(t('app.dependencyReportCycleListTitle'))
        lines.push('-'.repeat(50))
        props.cycles.forEach((cycle, index) => {
          lines.push(`${index + 1}. ${cycle.description}`)
          lines.push(`   ${t('app.length')}${t('app.colon')}${cycle.length} ${t('app.tasksUnit')}`)
          lines.push('')
        })
      }

      const content = lines.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${t('app.dependencyReportFileSuffix')}_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
    }

    return {
      filterType,
      getErrorTypeLabel,
      getWarningTypeLabel,
      exportReport,
      getTaskName,
      getLinkTypeLabel,
      t: i18n.global.t
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

.filter-section {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-tab:hover {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  color: #333333;
}

.filter-tab.active {
  background: linear-gradient(145deg, #0078d4, #106ebe) !important;
  color: #ffffff !important;
  border-color: #005a9e;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.filter-tab svg {
  flex-shrink: 0;
}

.overview-card {
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overview-card.card-error {
  background: linear-gradient(145deg, #fff5f5, #fff);
  border: 2px solid #ff6b6b;
}

.overview-card.card-success {
  background: linear-gradient(145deg, #f0fff4, #fff);
  border: 2px solid #51cf66;
}

.overview-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.overview-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-icon svg {
  width: 32px;
  height: 32px;
}

.overview-icon.icon-error {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.overview-icon.icon-success {
  background: linear-gradient(135deg, #51cf66, #37b24d);
  color: white;
}

.overview-title h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #212529;
}

.overview-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.overview-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.overview-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  flex: 1;
  min-width: 100px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-icon.stat-total {
  background: linear-gradient(135deg, #74c0fc, #339af0);
  color: white;
}

.stat-icon.stat-error {
  background: linear-gradient(135deg, #ff8787, #fa5252);
  color: white;
}

.stat-icon.stat-warning {
  background: linear-gradient(135deg, #ffd43b, #fab005);
  color: white;
}

.stat-icon.stat-cycle {
  background: linear-gradient(135deg, #da77f2, #be4bdb);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  line-height: 1.2;
}

.stat-content .stat-label {
  font-size: 12px;
  color: #6c757d;
}

.text-error { color: #dc3545 !important; }
.text-warning { color: #fd7e14 !important; }
.text-info { color: #6f42c1 !important; }

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

.stats-cards {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 16px 0;
}

.stats-cards .stat-item {
  flex: 1;
  min-width: 0;
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
