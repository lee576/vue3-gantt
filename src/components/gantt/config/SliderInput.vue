<template>
  <div class="slider-wrapper" @mousedown.stop @pointerdown.stop @touchstart.stop @click.stop>
    <input 
      type="range" 
      :value="modelValue" 
      @input="handleInput"
      @change="$emit('change')"
      :min="min" 
      :max="max" 
      :step="step"
      class="range-input"
    />
    <div class="slider-ticks">
      <span 
        v-for="tick in ticks" 
        :key="tick.value" 
        class="tick" 
        :class="{ major: tick.isMajor }"
      >
        <span class="tick-mark"></span>
        <span v-if="tick.showLabel" class="tick-label">{{ tick.value }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SliderInput',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    step: {
      type: Number,
      default: 1
    },
    labelStep: {
      type: Number,
      default: undefined
    },
    showLabels: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      emit('update:modelValue', value);
    };

    const ticks = computed(() => {
      const result: { value: number; isMajor: boolean; showLabel: boolean }[] = [];
      const effectiveLabelStep = props.labelStep || props.step;
      
      for (let v = props.min; v <= props.max; v = Math.round((v + props.step) * 100) / 100) {
        const isMajor = Math.abs(v - props.min) < 0.001 || 
                        Math.abs(v - props.max) < 0.001 || 
                        Math.abs((v - props.min) % effectiveLabelStep) < 0.001;
        result.push({ 
          value: v, 
          isMajor, 
          showLabel: props.showLabels && isMajor 
        });
      }
      return result;
    });

    return {
      handleInput,
      ticks
    };
  }
});
</script>

<style lang="scss" scoped>
.slider-wrapper {
  position: relative;
  padding-bottom: 22px;
  
  .range-input {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
    cursor: pointer;
    box-sizing: border-box;
    margin: 0;
    padding: 0;

    /* 轨道背景 */
    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: var(--bg-secondary, #e8e8e8);
      border-radius: 2px;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    &::-moz-range-track {
      width: 100%;
      height: 4px;
      background: var(--bg-secondary, #e8e8e8);
      border-radius: 2px;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    /* 滑块 - Webkit */
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid var(--primary, #0078d4);
      box-shadow: 
        0 2px 6px rgba(0, 120, 212, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      margin-top: -7px;
    }

    &::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 
        0 3px 12px rgba(0, 120, 212, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      border-width: 3px;
    }

    &::-webkit-slider-thumb:active {
      transform: scale(1.05);
      box-shadow: 
        0 1px 4px rgba(0, 120, 212, 0.5),
        inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    /* 滑块 - Firefox */
    &::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid var(--primary, #0078d4);
      box-shadow: 
        0 2px 6px rgba(0, 120, 212, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &::-moz-range-thumb:hover {
      transform: scale(1.15);
      box-shadow: 
        0 3px 12px rgba(0, 120, 212, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      border-width: 3px;
    }

    &::-moz-range-thumb:active {
      transform: scale(1.05);
      box-shadow: 
        0 1px 4px rgba(0, 120, 212, 0.5),
        inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    /* Focus 状态 */
    &:focus {
      &::-webkit-slider-thumb {
        box-shadow: 
          0 0 0 4px rgba(0, 120, 212, 0.15),
          0 2px 6px rgba(0, 120, 212, 0.3),
          0 1px 3px rgba(0, 0, 0, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      &::-moz-range-thumb {
        box-shadow: 
          0 0 0 4px rgba(0, 120, 212, 0.15),
          0 2px 6px rgba(0, 120, 212, 0.3),
          0 1px 3px rgba(0, 0, 0, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  position: absolute;
  bottom: 0;
  left: 9px;
  right: 9px;
  box-sizing: border-box;
  pointer-events: none;
  
  .tick {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 0;
    overflow: visible;
    
    .tick-mark {
      width: 1px;
      height: 6px;
      background: var(--border, #d0d0d0);
    }
    
    .tick-label {
      font-size: 9px;
      color: var(--text-secondary, #666);
      margin-top: 2px;
      white-space: nowrap;
    }
    
    &.major {
      .tick-mark {
        height: 8px;
        background: var(--text-secondary, #888);
      }
    }
  }
}
</style>
