<template>
  <div class="color-input-wrapper" :class="{ 'with-sync': showSync }">
    <input 
      type="color" 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @change="$emit('change')"
      class="color-input"
      :class="inputClass"
    />
    <button 
      v-if="showSync"
      @click="$emit('sync')" 
      class="sync-btn"
      :title="syncTitle"
    >
      {{ syncLabel }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ColorInput',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    showSync: {
      type: Boolean,
      default: false
    },
    syncLabel: {
      type: String,
      default: ''
    },
    syncTitle: {
      type: String,
      default: ''
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change', 'sync']
});
</script>

<style lang="scss" scoped>
.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 60px;
  height: 36px;
  border: 1px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);

  &:hover {
    border-color: var(--primary, #0078d4);
  }
}

.sync-btn {
  padding: 6px 12px;
  font-size: 11px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  color: var(--text-primary, #333333);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  white-space: nowrap;

  &:hover {
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    border-color: var(--primary, #0078d4);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
