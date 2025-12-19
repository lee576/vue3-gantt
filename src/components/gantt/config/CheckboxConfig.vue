<template>
  <div class="config-group">
    <label class="config-label checkbox-label">
      <input 
        type="checkbox" 
        :checked="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked); $emit('change')"
      />
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CheckboxConfig',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'change']
});
</script>

<style lang="scss" scoped>
.config-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .config-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #333333);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkbox-label {
    cursor: pointer;
    
    input[type="checkbox"] {
      cursor: pointer;
    }
  }
}
</style>
