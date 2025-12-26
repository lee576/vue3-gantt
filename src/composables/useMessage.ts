import { ref } from 'vue';
import type { Message } from '../types/task';

export function useMessage() {
  const message = ref<Message | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    message.value = { text, type };
    setTimeout(() => {
      message.value = null;
    }, 3000);
  };

  return {
    message,
    showMessage
  };
}
