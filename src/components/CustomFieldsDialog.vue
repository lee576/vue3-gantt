<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="custom-fields-dialog">
      <div class="dialog-header">
        <h2>{{ t('app.customFieldsTitle') }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-body">
        <div class="fields-list">
          <h3>{{ t('app.addedFields') }}</h3>
          <div v-if="customFields.length === 0" class="empty-state">
            <p>{{ t('app.noFieldsAdd') }}</p>
          </div>
          <div v-else class="field-items">
            <div v-for="(field, index) in customFields" :key="field.id" class="field-item">
              <div class="field-info">
                <div class="field-name">
                  <strong>{{ field.label }}</strong>
                  <span class="field-type-badge">{{ getFieldTypeLabel(field.type) }}</span>
                  <span v-if="field.required" class="required-badge">{{ t('app.required') }}</span>
                </div>
                <div class="field-meta">
                  <span v-if="field.placeholder">{{ t('app.placeholderColon') }} {{ field.placeholder }}</span>
                  <span v-if="field.options && field.options.length > 0">
                    {{ t('app.optionsColon') }} {{ field.options.join(', ') }}
                  </span>
                </div>
              </div>
              <div class="field-actions">
                <button class="icon-btn" @click="$emit('edit-field', index)" :title="t('app.edit')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    />
                  </svg>
                </button>
                <button class="icon-btn delete" @click="$emit('delete-field', index)" :title="t('app.delete')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="add-field-section">
          <h3>{{ editingFieldIndex !== null ? t('app.editField') : t('app.addNewField') }}</h3>
          <div class="form-group">
            <label>{{ t('app.fieldName') }} <span class="required-mark">*</span></label>
            <input
              v-model="localNewField.label"
              type="text"
              :placeholder="t('app.enterFieldName')"
              :class="{ error: customFieldFormErrors.label }"
            />
            <div v-if="customFieldFormErrors.label" class="error-message">
              {{ customFieldFormErrors.label }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('app.fieldType') }} <span class="required-mark">*</span></label>
            <select v-model="localNewField.type" :class="{ error: customFieldFormErrors.type }">
              <option value="text">{{ t('app.typeText') }}</option>
              <option value="number">{{ t('app.typeNumber') }}</option>
              <option value="date">{{ t('app.typeDate') }}</option>
              <option value="datetime">{{ t('app.typeDatetime') }}</option>
              <option value="select">{{ t('app.typeSelect') }}</option>
              <option value="textarea">{{ t('app.typeTextarea') }}</option>
              <option value="checkbox">{{ t('app.typeCheckbox') }}</option>
            </select>
            <div v-if="customFieldFormErrors.type" class="error-message">
              {{ customFieldFormErrors.type }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('app.placeholderText') }}</label>
            <input
              v-model="localNewField.placeholder"
              type="text"
              :placeholder="t('app.enterPlaceholder')"
            />
          </div>

          <div v-if="localNewField.type === 'select'" class="form-group">
            <label>{{ t('app.selectOptions') }} <span class="required-mark">*</span></label>
            <div class="options-input">
              <input
                :value="newOptionText"
                @input="handleOptionTextInput"
                type="text"
                :placeholder="t('app.enterOptionAdd')"
                @keypress.enter.prevent="$emit('add-option')"
              />
              <button class="metro-btn metro-btn-sm" @click="$emit('add-option')">{{ t('app.add') }}</button>
            </div>
            <div v-if="localNewField.options.length > 0" class="options-list">
              <div v-for="(option, idx) in localNewField.options" :key="idx" class="option-item">
                <span>{{ option }}</span>
                <button class="icon-btn-sm" @click="$emit('remove-option', idx)">×</button>
              </div>
            </div>
            <div v-if="customFieldFormErrors.options" class="error-message">
              {{ customFieldFormErrors.options }}
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label-inline">
              <input type="checkbox" v-model="localNewField.required" />
              <span>{{ t('app.requiredField') }}</span>
            </label>
          </div>

          <div class="form-actions">
            <button
              v-if="editingFieldIndex !== null"
              class="metro-btn"
              @click="$emit('cancel-edit')"
            >
              {{ t('app.cancelEdit') }}
            </button>
            <button
              class="metro-btn metro-btn-primary"
              @click="editingFieldIndex !== null ? $emit('update-field') : $emit('add-field')"
              :disabled="
                !localNewField.label ||
                !localNewField.type ||
                (localNewField.type === 'select' && localNewField.options.length === 0)
              "
            >
              {{ editingFieldIndex !== null ? t('app.updateField') : t('app.addField') }}
            </button>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="metro-btn metro-btn-primary" @click="$emit('save')">{{ t('app.saveAndClose') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, reactive } from 'vue'
import type { CustomField } from '../types/task'
import { t } from '../locales'

const props = defineProps<{
  show: boolean
  customFields: CustomField[]
  newField: CustomField
  newOptionText: string
  customFieldFormErrors: Record<string, string>
  editingFieldIndex: number | null
  getFieldTypeLabel: (type: string) => string
}>()

const emit = defineEmits<{
  close: []
  'edit-field': [index: number]
  'delete-field': [index: number]
  'add-option': []
  'remove-option': [index: number]
  'cancel-edit': []
  'add-field': []
  'update-field': []
  save: []
  'update:newOptionText': [value: string]
}>()

const localNewField = reactive<CustomField>({ ...props.newField })

watch(() => props.newField, (newVal) => {
  Object.assign(localNewField, newVal)
}, { deep: true })

function handleOptionTextInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (target?.value !== undefined) {
    emit('update:newOptionText', target.value)
  }
}
</script>

<script lang="ts">
export default {
  name: 'CustomFieldsDialog',
}
</script>

<style scoped>
@import '../styles/dialog-common.css';

.custom-fields-dialog .dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
}

.fields-list,
.add-field-section {
  display: flex;
  flex-direction: column;
}

.fields-list h3,
.add-field-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  padding-bottom: 12px;
  border-bottom: 2px solid #0078d4;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999999;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.field-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.field-item:hover {
  background: #f0f0f0;
  border-color: #0078d4;
}

.field-info {
  flex: 1;
}

.field-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.field-name strong {
  font-size: 14px;
  color: #333333;
}

.field-type-badge {
  background: #0078d4;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.required-badge {
  background: #d83b01;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.field-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-meta span {
  font-size: 12px;
  color: #666666;
}

.field-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
}

.icon-btn:hover {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.icon-btn.delete:hover {
  background: rgba(216, 59, 1, 0.1);
  color: #d83b01;
}

.options-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.options-input input {
  flex: 1;
}

.metro-btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #d0d0d0;
  font-size: 13px;
}

.icon-btn-sm {
  background: none;
  border: none;
  cursor: pointer;
  color: #d83b01;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn-sm:hover {
  color: #a72700;
  transform: scale(1.2);
}

.checkbox-label-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label-inline input[type='checkbox'] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
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
