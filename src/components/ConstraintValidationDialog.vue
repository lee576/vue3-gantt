<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>⏰ {{ t('app.constraintValidationResult') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="results && results.length > 0">
        <div class="overview-card" :class="totalViolations > 0 ? 'card-warning' : 'card-success'">
          <div class="overview-card-header">
            <div class="overview-title">
              <h3>{{ totalViolations === 0 ? '✅ ' + t('app.constraintValidationPassed') : '⚠️ ' + t('app.constraintValidationFailed') }}</h3>
              <p class="overview-subtitle">{{ totalViolations === 0 ? t('app.allConstraintsSatisfied') : t('app.conflictsFound', { conflicts: totalViolations, warnings: totalWarnings }) }}</p>
            </div>
          </div>
          <div class="overview-stats">
            <StatCard
              :value="results.length"
              :label="t('app.totalTasksCount')"
              type="primary"
              :unit="t('app.tasksUnit')"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </template>
            </StatCard>
            <StatCard
              :value="validTasksCount"
              :label="t('app.validTasksCount')"
              type="success"
              :unit="t('app.tasksUnit')"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </template>
            </StatCard>
            <StatCard
              :value="totalViolations"
              :label="t('app.constraintViolations')"
              type="error"
              :unit="t('app.tasksUnit')"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                </svg>
              </template>
            </StatCard>
            <StatCard
              v-if="totalWarnings > 0"
              :value="totalWarnings"
              :label="t('app.warningCount')"
              type="warning"
              :unit="t('app.tasksUnit')"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </template>
            </StatCard>
          </div>
        </div>

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
              {{ t('app.all') }} ({{ results.length }})
            </button>
            <button 
              v-if="totalViolations > 0"
              class="filter-tab" 
              :class="{ active: filterType === 'violations' }"
              @click="filterType = 'violations'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
              {{ t('app.constraintViolationsLabel') }} ({{ totalViolations > 0 ? results.filter(r => r.violations.length > 0).length : 0 }})
            </button>
            <button 
              v-if="totalWarnings > 0"
              class="filter-tab" 
              :class="{ active: filterType === 'warnings' }"
              @click="filterType = 'warnings'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              {{ t('app.warningsLabel') }} ({{ results.filter(r => r.warnings.length > 0 && r.violations.length === 0).length }})
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: filterType === 'valid' }"
              @click="filterType = 'valid'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {{ t('app.validTasksLabel') }} ({{ validTasksCount }})
            </button>
          </div>
        </div>

        <div class="section">
          <h3>📋 {{ t('app.taskConstraintDetails') }} ({{ t('app.taskFilteredCount', { count: filteredResults.length, total: results.length }) }})</h3>
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
                  <span class="task-id">{{ t('app.taskId') }}: {{ task.taskId }}</span>
                </div>
                <div class="task-badges">
                  <span v-if="task.violations.length > 0" class="badge badge-error">
                    {{ task.violations.length }} {{ t('app.violationsCount') }}
                  </span>
                  <span v-if="task.warnings.length > 0" class="badge badge-warning">
                    {{ task.warnings.length }} {{ t('app.warningsCount') }}
                  </span>
                  <span v-if="task.isValid && task.warnings.length === 0" class="badge badge-success">
                    {{ t('app.validationPassed') }}
                  </span>
                </div>
              </div>

              <div v-if="task.violations.length > 0" class="violations-section">
                <h4>{{ t('app.constraintViolations') }}:</h4>
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
                        {{ violation.severity === 'error' ? t('app.severityError') : t('app.severityWarning') }}
                      </span>
                    </div>
                    <div class="violation-message">{{ violation.message }}</div>
                    <div class="violation-details" v-if="violation.currentDate || violation.constraintDate">
                      <div class="detail-row">
                        <span class="detail-label">{{ t('app.currentDate') }}:</span>
                        <span class="detail-value">{{ formatDate(violation.currentDate) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ t('app.constraintDate') }}:</span>
                        <span class="detail-value highlight">{{ formatDate(violation.constraintDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="task.warnings.length > 0" class="warnings-section">
                <h4>{{ t('app.warningInfo') }}:</h4>
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
                      💡 {{ t('app.suggestion') }}: {{ warning.suggestion }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📖 {{ t('app.constraintTypeDescription') }}</h3>
          <div class="constraint-types-grid">
            <div class="constraint-type-card">
              <div class="type-code">SNET</div>
              <div class="type-name">{{ t('app.constraintType.SNET') }}</div>
              <div class="type-desc">{{ t('app.constraintType.SNET') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">SNLT</div>
              <div class="type-name">{{ t('app.constraintType.SNLT') }}</div>
              <div class="type-desc">{{ t('app.constraintType.SNLT') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">FNET</div>
              <div class="type-name">{{ t('app.constraintType.FNET') }}</div>
              <div class="type-desc">{{ t('app.constraintType.FNET') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">FNLT</div>
              <div class="type-name">{{ t('app.constraintType.FNLT') }}</div>
              <div class="type-desc">{{ t('app.constraintType.FNLT') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">MSO</div>
              <div class="type-name">{{ t('app.constraintType.MSO') }}</div>
              <div class="type-desc">{{ t('app.constraintType.MSO') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">MFO</div>
              <div class="type-name">{{ t('app.constraintType.MFO') }}</div>
              <div class="type-desc">{{ t('app.constraintType.MFO') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">ASAP</div>
              <div class="type-name">{{ t('app.constraintType.ASAP') }}</div>
              <div class="type-desc">{{ t('app.constraintType.ASAP') }}</div>
            </div>
            <div class="constraint-type-card">
              <div class="type-code">ALAP</div>
              <div class="type-name">{{ t('app.constraintType.ALAP') }}</div>
              <div class="type-desc">{{ t('app.constraintType.ALAP') }}</div>
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
import { defineComponent, ref, computed } from 'vue'
import type { ConstraintValidationResult } from '../components/gantt/features/TaskConstraintManager'
import StatCard from './StatCard.vue'
import { useI18n } from '../locales'

const { t } = useI18n()

export default defineComponent({
  name: 'ConstraintValidationDialog',
  components: {
    StatCard
  },
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
  setup(props) {
    const filterType = ref<'all' | 'violations' | 'warnings' | 'valid'>('all')

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

      if (filterType.value === 'violations') {
        filtered = filtered.filter(r => r.violations.length > 0)
      } else if (filterType.value === 'warnings') {
        filtered = filtered.filter(r => r.warnings.length > 0 && r.violations.length === 0)
      } else if (filterType.value === 'valid') {
        filtered = filtered.filter(r => r.isValid && r.warnings.length === 0)
      }

      return filtered.sort((a, b) => {
        const violationsDiff = b.violations.length - a.violations.length
        if (violationsDiff !== 0) return violationsDiff
        return b.warnings.length - a.warnings.length
      })
    })

    const getConstraintTypeLabel = (type: string): string => {
      return t(`app.constraintType.${type}`)
    }

    const formatDate = (date?: string): string => {
      if (!date) return '-'
      return date.split(' ')[0]
    }

    const exportReport = () => {
      const lines: string[] = []
      lines.push(t('app.constraintReportTitle'))
      lines.push('='.repeat(50))
      lines.push(`${t('app.constraintReportGenerationTime')}: ${new Date().toLocaleString(t('app.localeKey') || 'zh-CN')}`)
      lines.push(`${t('app.constraintReportTotalTasks')}: ${props.results.length}`)
      lines.push(`${t('app.constraintReportPassedValidation')}: ${validTasksCount.value}`)
      lines.push(`${t('app.constraintReportConflicts')}: ${totalViolations.value}`)
      lines.push(`${t('app.constraintReportWarnings')}: ${totalWarnings.value}`)
      lines.push('')

      const problematicTasks = props.results.filter(r => !r.isValid || r.warnings.length > 0)
      if (problematicTasks.length > 0) {
        lines.push(t('app.constraintReportTaskDetails') + ':')
        lines.push('-'.repeat(50))

        problematicTasks.forEach(task => {
          lines.push(`\n${t('app.constraintReportTask')}: ${task.taskName} ${t('app.constraintReportTaskIdPrefix')}${task.taskId}${t('app.constraintReportTaskIdSuffix')}`)

          if (task.violations.length > 0) {
            lines.push(`  ${t('app.constraintReportViolations')}:`)
            task.violations.forEach((v, idx) => {
              lines.push(`    ${idx + 1}. [${getConstraintTypeLabel(v.constraintType)}] ${v.message}`)
              if (v.currentDate) lines.push(`       ${t('app.constraintReportCurrentDate')}: ${formatDate(v.currentDate)}`)
              if (v.constraintDate) lines.push(`       ${t('app.constraintReportConstraintDate')}: ${formatDate(v.constraintDate)}`)
            })
          }

          if (task.warnings.length > 0) {
            lines.push(`  ${t('app.constraintReportWarning')}:`)
            task.warnings.forEach((w, idx) => {
              lines.push(`    ${idx + 1}. ${w.message}`)
              if (w.suggestion) lines.push(`       ${t('app.constraintReportSuggestion')}: ${w.suggestion}`)
            })
          }
        })
      }

      const content = lines.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${t('app.constraintReportFilename')}_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
    }

    return {
      filterType,
      totalViolations,
      totalWarnings,
      validTasksCount,
      filteredResults,
      getConstraintTypeLabel,
      formatDate,
      exportReport,
      getTaskName,
      t
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

.overview-card.card-warning {
  background: linear-gradient(145deg, #fffbeb, #fff);
  border: 2px solid #fbbf24;
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

.overview-icon.icon-warning {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
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

.stat-icon.stat-success {
  background: linear-gradient(135deg, #69db7c, #40c057);
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
