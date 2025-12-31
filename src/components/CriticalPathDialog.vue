<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>🎯 {{ t('app.criticalPathTitle') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body" v-if="result">
        <div class="summary-section">
          <h3>📊 {{ t('app.dependencyStats') }}</h3>
          <div class="stats-cards">
            <StatCard
              :value="result.projectDuration"
              :label="t('app.projectDuration')"
              :unit="t('app.unit.day')"
              type="primary"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              :value="result.criticalTaskIds.length"
              :label="t('app.criticalTasks')"
              :unit="t('app.unit.count')"
              type="error"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              :value="result.criticalPathDuration"
              :label="t('app.criticalPathDuration')"
              :unit="t('app.unit.day')"
              type="warning"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              :value="formatDate(result.projectStartDate)"
              :label="t('app.projectDateRange')"
              type="info"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                </svg>
              </template>
            </StatCard>

            <StatCard
              :value="result.taskAnalysis.size"
              :label="t('app.totalTasks')"
              :unit="t('app.unit.count')"
              type="success"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </template>
            </StatCard>
          </div>

          <div class="stats-progress">
            <div class="progress-item">
              <div class="progress-header">
                <span class="progress-label">{{ t('app.criticalTaskRatio') }}</span>
                <span class="progress-value">{{ ((result.criticalTaskIds.length / result.taskAnalysis.size) * 100).toFixed(1) }}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar" :style="{ width: (result.criticalTaskIds.length / result.taskAnalysis.size) * 100 + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>🔴 {{ t('app.criticalPath') }}</h3>
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
          <h3>⚠️ {{ t('app.criticalTaskListWithFloat') }}</h3>
          
          <div class="collapsible-section">
            <div class="collapsible-header" @click="showTerminology = !showTerminology">
              <div class="header-left">
                <span class="icon">📖</span>
                <span class="title">{{ t('app.terminology') }}</span>
              </div>
              <div class="header-right">
                <button class="toggle-btn" :class="{ expanded: showTerminology }">
                  <svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                  <span class="toggle-text">{{ showTerminology ? t('app.collapse') : t('app.expand') }}</span>
                </button>
              </div>
            </div>
            <div class="collapsible-content" v-show="showTerminology">
              <div class="terminology-grid">
                <div class="term-card">
                  <div class="term-icon early">⏰</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.earlyStart') }}</div>
                    <div class="term-desc">{{ t('app.esDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon finish">✅</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.earlyFinish') }}</div>
                    <div class="term-desc">{{ t('app.efDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon late">🕐</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.lateStart') }}</div>
                    <div class="term-desc">{{ t('app.lsDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon late-finish">🏁</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.lateFinish') }}</div>
                    <div class="term-desc">{{ t('app.lfDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon total-float">📊</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.totalFloat') }}</div>
                    <div class="term-desc">{{ t('app.tfDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon free-float">🔓</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.freeFloat') }}</div>
                    <div class="term-desc">{{ t('app.ffDesc') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('app.taskId') }}</th>
                  <th>{{ t('app.taskName') }}</th>
                  <th><span class="th-icon">⏰</span> {{ t('app.earlyStart') }}</th>
                  <th><span class="th-icon">✅</span> {{ t('app.earlyFinish') }}</th>
                  <th><span class="th-icon">🕐</span> {{ t('app.lateStart') }}</th>
                  <th><span class="th-icon">🏁</span> {{ t('app.lateFinish') }}</th>
                  <th><span class="th-icon">📊</span> {{ t('app.totalFloat') }}</th>
                  <th><span class="th-icon">🔓</span> {{ t('app.freeFloat') }}</th>
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

        <div class="section">
          <h3>📋 {{ t('app.allTasksFloatAnalysis') }}</h3>
          
          <div class="collapsible-section">
            <div class="collapsible-header" @click="showAllTasksTerminology = !showAllTasksTerminology">
              <div class="header-left">
                <span class="icon">📖</span>
                <span class="title">{{ t('app.terminology') }}</span>
              </div>
              <div class="header-right">
                <button class="toggle-btn" :class="{ expanded: showAllTasksTerminology }">
                  <svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                  <span class="toggle-text">{{ showAllTasksTerminology ? t('app.collapse') : t('app.expand') }}</span>
                </button>
              </div>
            </div>
            <div class="collapsible-content" v-show="showAllTasksTerminology">
              <div class="terminology-grid">
                <div class="term-card">
                  <div class="term-icon total-float">📊</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.totalFloat') }}</div>
                    <div class="term-desc">{{ t('app.tfDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon free-float">🔓</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.freeFloat') }}</div>
                    <div class="term-desc">{{ t('app.ffDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon early">⏰</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.earlyStart') }}</div>
                    <div class="term-desc">{{ t('app.esDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon finish">✅</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.earlyFinish') }}</div>
                    <div class="term-desc">{{ t('app.efDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon late">🕐</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.lateStart') }}</div>
                    <div class="term-desc">{{ t('app.lsDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon late-finish">🏁</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.lateFinish') }}</div>
                    <div class="term-desc">{{ t('app.lfDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon predecessor">🔗</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.predecessor') }}</div>
                    <div class="term-desc">{{ t('app.predecessorDesc') }}</div>
                  </div>
                </div>
                <div class="term-card">
                  <div class="term-icon successor">📌</div>
                  <div class="term-content">
                    <div class="term-name">{{ t('app.successor') }}</div>
                    <div class="term-desc">{{ t('app.successorDesc') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="filter-section">
            <label>
              <input type="checkbox" v-model="showOnlyCritical" />
              {{ t('app.showOnlyCritical') }}
            </label>
            <label>
              <input type="checkbox" v-model="showOnlyNonCritical" />
              {{ t('app.showOnlyNonCritical') }}
            </label>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('app.taskId') }}</th>
                  <th>{{ t('app.taskName') }}</th>
                  <th>{{ t('app.isCritical') }}</th>
                  <th><span class="th-icon">📊</span> {{ t('app.totalFloatTime') }}</th>
                  <th><span class="th-icon">🔓</span> {{ t('app.freeFloatTime') }}</th>
                  <th><span class="th-icon">⏰</span> {{ t('app.earlyStart') }}</th>
                  <th><span class="th-icon">✅</span> {{ t('app.earlyFinish') }}</th>
                  <th><span class="th-icon">🕐</span> {{ t('app.lateStart') }}</th>
                  <th><span class="th-icon">🏁</span> {{ t('app.lateFinish') }}</th>
                  <th>{{ t('app.predecessor') }}</th>
                  <th>{{ t('app.successor') }}</th>
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
                      {{ task.isCritical ? t('app.yes') : t('app.no') }}
                    </span>
                  </td>
                  <td :class="{ 'critical-value': task.totalFloat === 0 }">
                    {{ task.totalFloat }} {{ t('app.days') }}
                  </td>
                  <td :class="{ 'critical-value': task.freeFloat === 0 }">
                    {{ task.freeFloat }} {{ t('app.days') }}
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
          {{ t('app.exportData') }}
        </button>
        <button class="metro-btn metro-btn-primary" @click="$emit('close')">{{ t('app.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { CriticalPathResult, TaskAnalysis } from '../components/gantt/features/CriticalPathAnalyzer'
import StatCard from './StatCard.vue'
import { t } from '../locales'

export default defineComponent({
  name: 'CriticalPathDialog',
  components: {
    StatCard
  },
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
    const showTerminology = ref(true)
    const showAllTasksTerminology = ref(true)

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
      rows.push([
        t('app.csvTaskId'),
        t('app.csvTaskName'),
        t('app.csvIsCritical'),
        t('app.csvTotalFloat'),
        t('app.csvFreeFloat'),
        t('app.csvEarlyStart'),
        t('app.csvEarlyFinish'),
        t('app.csvLateStart'),
        t('app.csvLateFinish'),
        t('app.csvPredecessor'),
        t('app.csvSuccessor')
      ].join(','))

      Array.from(props.result.taskAnalysis.values()).forEach(task => {
        rows.push([
          String(task.taskId),
          task.taskName,
          task.isCritical ? t('app.csvYes') : t('app.csvNo'),
          String(task.totalFloat),
          String(task.freeFloat),
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
      link.download = `${t('app.csvCriticalPathFilename')}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }

    return {
      showOnlyCritical,
      showOnlyNonCritical,
      showTerminology,
      showAllTasksTerminology,
      formatDate,
      getTaskAnalysis,
      getTaskName,
      formatTaskList,
      filteredTasks,
      exportToCSV,
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
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
}

.summary-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0078d4, #00a3ff, #0078d4);
  border-radius: 12px 12px 0 0;
}

.summary-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-section h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #0078d4, #00a3ff);
  border-radius: 2px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(145deg, #fafbfc, #f0f2f5);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 120, 212, 0.03), rgba(0, 163, 255, 0.03));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover {
  background: #fff;
  border-color: #d0d0d0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.stat-item:hover::after {
  opacity: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon-primary {
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.15);
}

.stat-icon-primary svg {
  color: #0078d4;
}

.stat-icon-danger {
  background: linear-gradient(145deg, #ffebee, #ffcdd2);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);
}

.stat-icon-danger svg {
  color: #dc3545;
}

.stat-icon-warning {
  background: linear-gradient(145deg, #fff8e1, #ffecb3);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.15);
}

.stat-icon-warning svg {
  color: #f5a623;
}

.stat-icon-info {
  background: linear-gradient(145deg, #e0f7fa, #b2ebf2);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.15);
}

.stat-icon-info svg {
  color: #17a2b8;
}

.stat-icon-success {
  background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
}

.stat-icon-success svg {
  color: #28a745;
}

.stat-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.stat-item:hover .stat-value {
  transform: scale(1.05);
}

.stat-value.primary {
  color: #0078d4;
}

.stat-value.danger {
  color: #dc3545;
}

.stat-value.warning {
  color: #f5a623;
}

.stat-value.success {
  color: #28a745;
}

.stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: #999;
  margin-left: 2px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  font-weight: 500;
}

.stat-sublabel {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.stats-progress {
  background: linear-gradient(145deg, #f8f9fa, #fff);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.progress-item {
  margin-bottom: 16px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-label::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #0078d4;
  border-radius: 50%;
}

.progress-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  background: #e8f4fd;
  padding: 4px 10px;
  border-radius: 12px;
}

.progress-bar-wrapper {
  height: 10px;
  background: #e8e8e8;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0078d4, #00a3ff);
  border-radius: 5px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progressShine 2s infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
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

.th-icon {
  display: inline-block;
  margin-right: 4px;
  font-size: 14px;
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

.collapsible-section {
  margin-bottom: 16px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  border-bottom: 1px solid #90caf9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.collapsible-header:hover {
  background: linear-gradient(145deg, #bbdefb, #90caf9);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .icon {
  font-size: 18px;
}

.header-left .title {
  font-size: 14px;
  font-weight: 600;
  color: #1565c0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border: 1px solid #b0c4de;
  border-radius: 16px;
  cursor: pointer;
  color: #1565c0;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  border-color: #1565c0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 6px rgba(21, 101, 192, 0.2);
}

.toggle-btn:active {
  transform: scale(0.98);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn .toggle-icon {
  width: 16px;
  height: 16px;
  color: #1565c0;
  transition: transform 0.3s ease;
}

.toggle-btn.expanded .toggle-icon {
  transform: rotate(180deg);
}

.toggle-text {
  font-size: 12px;
  font-weight: 500;
  color: #1565c0;
}

.collapsible-content {
  padding: 16px;
}

.terminology-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.term-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.term-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.term-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 8px;
  flex-shrink: 0;
}

.term-icon.early {
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
}

.term-icon.finish {
  background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
}

.term-icon.late {
  background: linear-gradient(145deg, #fff3e0, #ffe0b2);
}

.term-icon.late-finish {
  background: linear-gradient(145deg, #fce4ec, #f8bbd9);
}

.term-icon.total-float {
  background: linear-gradient(145deg, #e1f5fe, #b3e5fc);
}

.term-icon.free-float {
  background: linear-gradient(145deg, #f3e5f5, #e1bee7);
}

.term-icon.predecessor {
  background: linear-gradient(145deg, #e0f2f1, #b2dfdb);
}

.term-icon.successor {
  background: linear-gradient(145deg, #fff8e1, #ffecb3);
}

.term-content {
  flex: 1;
  min-width: 0;
}

.term-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.term-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}
</style>
