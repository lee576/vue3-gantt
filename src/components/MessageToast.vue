<template>
  <div v-if="message" :class="['message-toast', message.type]">
    {{ message.text }}
  </div>
</template>

<script lang="ts" setup>
import type { Message } from '../types/task';

defineProps<{
  message: Message | null;
}>();
</script>

<script lang="ts">
export default {
  name: 'MessageToast'
}
</script>

<style scoped>
.message-toast {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 500;
  font-family: 'Segoe UI', sans-serif;
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
  min-width: 280px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-toast.success {
  background: #107c10;
  color: #ffffff;
  border-left: 4px solid #0b5a0b;
}

.message-toast.error {
  background: #d83b01;
  color: #ffffff;
  border-left: 4px solid #a72700;
}

.message-toast.warning {
  background: #ffb900;
  color: #333333;
  border-left: 4px solid #d39300;
}
</style>