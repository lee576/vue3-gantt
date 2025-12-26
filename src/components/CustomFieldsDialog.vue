<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="custom-fields-dialog">
      <div class="dialog-header">
        <h2>自定义字段管理</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-body">
        <!-- 已有字段列表 -->
        <div class="fields-list">
          <h3>已添加的字段</h3>
          <div v-if="customFields.length === 0" class="empty-state">
            <p>暂无自定义字段，点击下方按钮添加</p>
          </div>
          <div v-else class="field-items">
            <div v-for="(field, index) in customFields" :key="field.id" class="field-item">
              <div class="field-info">
                <div class="field-name">
                  <strong>{{ field.label }}</strong>
                  <span class="field-type-badge">{{ getFieldTypeLabel(field.type) }}</span>
                  <span v-if="field.required" class="required-badge">必填</span>
                </div>
                <div class="field-meta">
                  <span v-if="field.placeholder">占位符: {{ field.placeholder }}</span>
                  <span v-if="field.options && field.options.length > 0">
                    选项: {{ field.options.join(', ') }}
                  </span>
                </div>
              </div>
              <div class="field-actions">
                <button class="icon-btn" @click="$emit('edit-field', index)" title="编辑">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button class="icon-btn delete" @click="$emit('delete-field', index)" title="删除">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加/编辑字段表单 -->
        <div class="add-field-section">
          <h3>{{ editingFieldIndex !== null ? '编辑字段' : '添加新字段' }}</h3>
          <div class="form-group">
            <label>字段名称 <span class="required-mark">*</span></label>
            <input v-model="newField.label" type="text" placeholder="例如: 负责人" :class="{ 'error': customFieldFormErrors.label }" />
            <div v-if="customFieldFormErrors.label" class="error-message">{{ customFieldFormErrors.label }}</div>
          </div>

          <div class="form-group">
            <label>字段类型 <span class="required-mark">*</span></label>
            <select v-model="newField.type" :class="{ 'error': customFieldFormErrors.type }">
              <option value="text">文本</option>
              <option value="number">数字</option>
              <option value="date">日期</option>
              <option value="datetime">日期时间</option>
              <option value="select">下拉选择</option>
              <option value="textarea">多行文本</option>
              <option value="checkbox">复选框</option>
            </select>
            <div v-if="customFieldFormErrors.type" class="error-message">{{ customFieldFormErrors.type }}</div>
          </div>

          <div class="form-group">
            <label>占位符/提示文本</label>
            <input v-model="newField.placeholder" type="text" placeholder="例如: 请输入负责人姓名" />
          </div>

          <div v-if="newField.type === 'select'" class="form-group">
            <label>下拉选项 <span class="required-mark">*</span></label>
            <div class="options-input">
              <input
                :value="newOptionText"
                @input="$emit('update:newOptionText', $event.target.value)"
                type="text"
                placeholder="输入选项后按回车添加"
                @keypress.enter.prevent="$emit('add-option')"
              />
              <button class="metro-btn metro-btn-sm" @click="$emit('add-option')">添加</button>
            </div>
            <div v-if="newField.options.length > 0" class="options-list">
              <div v-for="(option, idx) in newField.options" :key="idx" class="option-item">
                <span>{{ option }}</span>
                <button class="icon-btn-sm" @click="$emit('remove-option', idx)">×</button>
              </div>
            </div>
            <div v-if="customFieldFormErrors.options" class="error-message">{{ customFieldFormErrors.options }}</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label-inline">
              <input type="checkbox" v-model="newField.required" />
              <span>必填字段</span>
            </label>
          </div>

          <div class="form-actions">
            <button
              v-if="editingFieldIndex !== null"
              class="metro-btn"
              @click="$emit('cancel-edit')"
            >
              取消编辑
            </button>
            <button
              class="metro-btn metro-btn-primary"
              @click="editingFieldIndex !== null ? $emit('update-field') : $emit('add-field')"
              :disabled="!newField.label || !newField.type || (newField.type === 'select' && newField.options.length === 0)"
            >
              {{ editingFieldIndex !== null ? '更新字段' : '添加字段' }}
            </button>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="metro-btn metro-btn-primary" @click="$emit('save')">
          保存并关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CustomField } from '../types/task';

defineProps<{
  show: boolean;
  customFields: CustomField[];
  newField: CustomField;
  newOptionText: string;
  customFieldFormErrors: Record<string, string>;
  editingFieldIndex: number | null;
  getFieldTypeLabel: (type: string) => string;
}>();

defineEmits<{
  close: [];
  'edit-field': [index: number];
  'delete-field': [index: number];
  'add-option': [];
  'remove-option': [index: number];
  'cancel-edit': [];
  'add-field': [];
  'update-field': [];
  save: [];
  'update:newOptionText': [value: string];
}>();
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

.checkbox-label-inline input[type="checkbox"] {
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
