<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="confirm-dialog">
      <div class="dialog-header">
        <h2>{{ t('app.deleteConfirmTitle') }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-body">
        <p>{{ t('app.deleteConfirmMessage', { taskName }) }}</p>
        <p class="warning-text">{{ t('app.deleteConfirmWarning') }}</p>
      </div>
      <div class="dialog-footer">
        <button class="metro-btn" @click="$emit('close')">{{ t('app.cancel') }}</button>
        <button class="metro-btn metro-btn-danger" @click="$emit('confirm')">{{ t('app.confirmDelete') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { t } from '../locales'

defineProps<{
  show: boolean
  taskName: string
}>()

defineEmits<{
  close: []
  confirm: []
}>()
</script>

<script lang="ts">
export default {
  name: 'DeleteConfirmDialog',
}
</script>

<style scoped>
@import '../styles/dialog-common.css';
</style>
