<template>
  <div class="stat-item" :class="[`stat-${type}`]">
    <div class="stat-icon" :class="[`stat-icon-${type}`]">
      <slot name="icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      </slot>
    </div>
    <div class="stat-info">
      <div class="stat-value" :class="[`text-${type}`]">
        {{ value }}
        <span v-if="unit" class="stat-unit">{{ unit }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="showProgress" class="stat-progress">
      <div class="progress-bar">
        <div class="progress-fill" :class="[`bg-${type}`]" :style="{ width: progressValue + '%' }"></div>
      </div>
      <span v-if="progressLabel" class="progress-label">{{ progressLabel }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatCard',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default',
      validator: (val: string) => ['default', 'primary', 'success', 'warning', 'error', 'info'].includes(val)
    },
    unit: {
      type: String,
      default: ''
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progressValue: {
      type: Number,
      default: 0
    },
    progressLabel: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(
    142deg,
    rgba(255, 255, 255, 0.82) 0%,
    rgba(255, 255, 255, 0.45) 35%,
    rgba(255, 255, 255, 0.35) 100%
  );
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(255, 255, 255, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 0 60px rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  background: radial-gradient(
    ellipse 80% 50% at 15% 10%,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.15) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 1;
}

.stat-item:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    inset 0 0 80px rgba(255, 255, 255, 0.4);
}

.stat-item:hover::before {
  background: radial-gradient(
    ellipse 80% 50% at 15% 10%,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.25) 40%,
    transparent 70%
  );
}

.stat-item.stat-primary {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.25) 0%,
    rgba(59, 130, 246, 0.12) 50%,
    rgba(59, 130, 246, 0.18) 100%
  );
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow:
    0 8px 32px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}

.stat-item.stat-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(96, 165, 250, 0.6) 20%,
    rgba(147, 197, 253, 0.8) 50%,
    rgba(96, 165, 250, 0.6) 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.stat-item.stat-primary:hover::after {
  opacity: 1;
}

.stat-item.stat-success {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.25) 0%,
    rgba(34, 197, 94, 0.12) 50%,
    rgba(34, 197, 94, 0.18) 100%
  );
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow:
    0 8px 32px rgba(34, 197, 94, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}

.stat-item.stat-success::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(74, 222, 128, 0.6) 20%,
    rgba(134, 239, 172, 0.8) 50%,
    rgba(74, 222, 128, 0.6) 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.stat-item.stat-success:hover::after {
  opacity: 1;
}

.stat-item.stat-warning {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.25) 0%,
    rgba(245, 158, 11, 0.12) 50%,
    rgba(245, 158, 11, 0.18) 100%
  );
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow:
    0 8px 32px rgba(245, 158, 11, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}

.stat-item.stat-warning::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 191, 36, 0.6) 20%,
    rgba(252, 211, 77, 0.8) 50%,
    rgba(251, 191, 36, 0.6) 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.stat-item.stat-warning:hover::after {
  opacity: 1;
}

.stat-item.stat-error {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.25) 0%,
    rgba(239, 68, 68, 0.12) 50%,
    rgba(239, 68, 68, 0.18) 100%
  );
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow:
    0 8px 32px rgba(239, 68, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}

.stat-item.stat-error::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(248, 113, 113, 0.6) 20%,
    rgba(253, 164, 175, 0.8) 50%,
    rgba(248, 113, 113, 0.6) 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.stat-item.stat-error:hover::after {
  opacity: 1;
}

.stat-item.stat-info {
  background: linear-gradient(
    135deg,
    rgba(14, 165, 233, 0.25) 0%,
    rgba(14, 165, 233, 0.12) 50%,
    rgba(14, 165, 233, 0.18) 100%
  );
  border-color: rgba(14, 165, 233, 0.35);
  box-shadow:
    0 8px 32px rgba(14, 165, 233, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}

.stat-item.stat-info::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(56, 189, 248, 0.6) 20%,
    rgba(147, 197, 253, 0.8) 50%,
    rgba(56, 189, 248, 0.6) 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.stat-item.stat-info:hover::after {
  opacity: 1;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    148deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.6) 35%,
    rgba(255, 255, 255, 0.45) 100%
  );
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  color: #6b7280;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: radial-gradient(
    ellipse 70% 40% at 20% 15%,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.08) 45%,
    transparent 75%
  );
  pointer-events: none;
  z-index: 1;
}

.stat-item:hover .stat-icon {
  transform: scale(1.08) rotate(3deg);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6),
    inset 0 0 60px rgba(255, 255, 255, 0.4);
}

.stat-item:hover .stat-icon::before {
  background: radial-gradient(
    ellipse 70% 40% at 20% 15%,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.2) 45%,
    transparent 75%
  );
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-icon-primary {
  background: linear-gradient(
    145deg,
    rgba(59, 130, 246, 0.4) 0%,
    rgba(59, 130, 246, 0.25) 100%
  );
  color: #3b82f6;
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-icon-success {
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.4) 0%,
    rgba(34, 197, 94, 0.25) 100%
  );
  color: #22c55e;
  box-shadow:
    0 4px 12px rgba(34, 197, 94, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-icon-warning {
  background: linear-gradient(
    145deg,
    rgba(245, 158, 11, 0.4) 0%,
    rgba(245, 158, 11, 0.25) 100%
  );
  color: #f59e0b;
  box-shadow:
    0 4px 12px rgba(245, 158, 11, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-icon-error {
  background: linear-gradient(
    145deg,
    rgba(239, 68, 68, 0.4) 0%,
    rgba(239, 68, 68, 0.25) 100%
  );
  color: #ef4444;
  box-shadow:
    0 4px 12px rgba(239, 68, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-icon-info {
  background: linear-gradient(
    145deg,
    rgba(14, 165, 233, 0.4) 0%,
    rgba(14, 165, 233, 0.25) 100%
  );
  color: #0ea5e9;
  box-shadow:
    0 4px 12px rgba(14, 165, 233, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-left: 2px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 500;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.text-primary {
  color: #2563eb;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.text-success {
  color: #16a34a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.text-warning {
  color: #d97706;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.text-error {
  color: #dc2626;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.text-info {
  color: #0284c7;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px 4px 0 0;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.3);
}

.bg-primary {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.bg-success {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.bg-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bg-error {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.bg-info {
  background: linear-gradient(90deg, #0ea5e9, #38bdf8);
}

.progress-label {
  display: block;
  padding: 4px 12px;
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .stat-item {
    padding: 14px;
    gap: 12px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
  }

  .stat-icon svg {
    width: 24px;
    height: 24px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>
