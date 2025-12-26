<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="confirm-dialog">
      <div class="dialog-header">
        <h2>确认删除</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-body">
        <p>确定要删除任务 "{{ taskName }}" 吗？</p>
        <p class="warning-text">此操作将同时删除所有子任务，且不可恢复！</p>
      </div>
      <div class="dialog-footer">
        <button class="metro-btn" @click="$emit('close')">取消</button>
        <button class="metro-btn metro-btn-danger" @click="$emit('confirm')">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  show: boolean;
  taskName: string;
}>();

defineEmits<{
  close: [];
  confirm: [];
}>();
</script>

<script lang="ts">
export default {
  name: 'DeleteConfirmDialog'
}
</script>

<style scoped>
@import '../styles/dialog-common.css';
</style>