<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="task-dialog">
      <div class="dialog-header">
        <h2>{{ isEditMode ? t('app.editTask') : t('app.newTask') }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-body">
        <div class="form-group">
          <label>{{ t('app.taskName') }}</label>
          <input
            v-model="taskForm.taskNo"
            type="text"
            :placeholder="t('app.enterTaskName')"
            :class="{ error: taskFormErrors.taskNo }"
          />
          <div v-if="taskFormErrors.taskNo" class="error-message">{{ taskFormErrors.taskNo }}</div>
        </div>
        <div class="form-group">
          <label>{{ t('app.priority') }}</label>
          <select v-model="taskForm.level">
            <option value="urgent">{{ t('app.urgent') }}</option>
            <option value="important">{{ t('app.important') }}</option>
            <option value="normal">{{ t('app.normal') }}</option>
            <option value="notImportant">{{ t('app.notImportant') }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('app.startTime') }}</label>
            <input
              v-model="taskForm.start_date"
              type="datetime-local"
              :class="{ error: taskFormErrors.start_date || taskFormErrors.dateRange }"
            />
            <div v-if="taskFormErrors.start_date" class="error-message">
              {{ taskFormErrors.start_date }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('app.endTime') }}</label>
            <input
              v-model="taskForm.end_date"
              type="datetime-local"
              :class="{ error: taskFormErrors.end_date || taskFormErrors.dateRange }"
            />
            <div v-if="taskFormErrors.end_date" class="error-message">
              {{ taskFormErrors.end_date }}
            </div>
            <div v-if="taskFormErrors.dateRange" class="error-message">
              {{ taskFormErrors.dateRange }}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('app.progress') }}</label>
          <input
            v-model.number="taskForm.job_progress"
            type="number"
            min="0"
            max="1"
            step="0.1"
            :class="{ error: taskFormErrors.job_progress }"
          />
          <div v-if="taskFormErrors.job_progress" class="error-message">
            {{ taskFormErrors.job_progress }}
          </div>
        </div>
        <div class="form-group" v-if="!isEditMode && !isRootTask">
          <label>{{ t('app.parentTask') }}</label>
          <select v-model="taskForm.pid">
            <option value="0">{{ t('app.noRootTask') }}</option>
            <option v-for="task in availableParentTasks" :key="task.id" :value="task.id">
              {{ task.taskNo }}
            </option>
          </select>
        </div>

        <div v-if="customFields.length > 0" class="custom-fields-section">
          <div class="section-divider">
            <span>{{ t('app.customFields') }}</span>
          </div>

          <div v-for="field in customFields" :key="field.id" class="form-group">
            <label>
              {{ field.label }}
              <span v-if="field.required" class="required-mark">*</span>
            </label>

            <input
              v-if="field.type === 'text'"
              v-model="taskForm.customFieldValues[field.id]"
              type="text"
              :placeholder="field.placeholder || getEnterPlaceholder(field.label)"
              :required="field.required"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            />
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <input
              v-else-if="field.type === 'number'"
              v-model.number="taskForm.customFieldValues[field.id]"
              type="number"
              :placeholder="field.placeholder || getEnterPlaceholder(field.label)"
              :required="field.required"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            />
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <input
              v-else-if="field.type === 'date'"
              v-model="taskForm.customFieldValues[field.id]"
              type="date"
              :required="field.required"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            />
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <input
              v-else-if="field.type === 'datetime'"
              v-model="taskForm.customFieldValues[field.id]"
              type="datetime-local"
              :required="field.required"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            />
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <select
              v-else-if="field.type === 'select'"
              v-model="taskForm.customFieldValues[field.id]"
              :required="field.required"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            >
              <option value="">{{ getSelectPlaceholder(field.label) }}</option>
              <option v-for="option in field.options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="taskForm.customFieldValues[field.id]"
              :placeholder="field.placeholder || getEnterPlaceholder(field.label)"
              :required="field.required"
              rows="3"
              :class="{ error: taskFormErrors[`customField_${field.id}`] }"
            ></textarea>
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>

            <div
              v-else-if="field.type === 'checkbox'"
              class="checkbox-wrapper"
            >
              <input
                type="checkbox"
                :id="`checkbox-${field.id}`"
                v-model="taskForm.customFieldValues[field.id]"
                :class="{ error: taskFormErrors[`customField_${field.id}`] }"
              />
              <label :for="`checkbox-${field.id}`" class="checkbox-label">
                {{ field.placeholder || t('app.enable') }}
              </label>
            </div>
            <div v-if="taskFormErrors[`customField_${field.id}`]" class="error-message">
              {{ taskFormErrors[`customField_${field.id}`] }}
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="metro-btn" @click="$emit('close')">{{ t('app.cancel') }}</button>
        <button class="metro-btn metro-btn-primary" @click="$emit('save')">
          {{ isEditMode ? t('app.save') : t('app.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TaskForm, CustomField } from '../types/task'
import { t } from '../locales'

defineProps<{
  show: boolean
  isEditMode: boolean
  isRootTask: boolean
  taskForm: TaskForm
  taskFormErrors: Record<string, string>
  customFields: CustomField[]
  availableParentTasks: any[]
}>()

defineEmits<{
  close: []
  save: []
}>()

function getEnterPlaceholder(fieldLabel: string): string {
  return t('app.enterField', { fieldLabel })
}

function getSelectPlaceholder(fieldLabel: string): string {
  return t('app.selectField', { fieldLabel })
}
</script>

<script lang="ts">
export default {
  name: 'TaskDialog',
}
</script>

<style scoped>
@import '../styles/dialog-common.css';

.custom-fields-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.section-divider {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.section-divider span {
  background: #ffffff;
  padding: 0 16px;
  color: #666666;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #d0d0d0;
  z-index: 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-wrapper input[type='checkbox'] {
  width: auto;
  margin: 0;
}

.checkbox-wrapper .checkbox-label {
  margin: 0;
  font-weight: normal;
  color: #333333;
  cursor: pointer;
}

.required-mark {
  color: #d83b01;
  font-weight: bold;
  margin-left: 4px;
}

.error {
  border-color: #d83b01 !important;
  box-shadow: 0 0 0 3px rgba(216, 59, 1, 0.1) !important;
}

.error-message {
  color: #d83b01;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
}
</style>
