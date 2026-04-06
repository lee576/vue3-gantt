<template>
  <Teleport to="body">
    <div
      v-if="tooltipVisible"
      class="task-overlay-card"
      :style="tooltipStyle"
      role="tooltip"
    >
      <div class="task-overlay-card__header">
        <div class="task-overlay-card__title">{{ taskName }}</div>
        <span class="task-overlay-card__type">{{ taskTypeLabel }}</span>
      </div>
      <div class="task-overlay-card__grid">
        <div class="task-overlay-card__label">{{ t('task.startDate') }}</div>
        <div class="task-overlay-card__value">{{ startDateText }}</div>
        <div class="task-overlay-card__label">{{ t('task.endDate') }}</div>
        <div class="task-overlay-card__value">{{ endDateText }}</div>
        <div class="task-overlay-card__label">{{ t('task.progress') }}</div>
        <div class="task-overlay-card__value">{{ progressText }}</div>
        <div class="task-overlay-card__label">{{ t('task.duration') }}</div>
        <div class="task-overlay-card__value">{{ durationText }}</div>
      </div>
      <div v-if="isMovePending" class="task-overlay-card__pending">
        {{ t('task.syncingMove') }}
      </div>
    </div>
    <div
      v-if="menuVisible"
      class="task-overlay-menu"
      :style="menuStyle"
      role="menu"
    >
      <button
        type="button"
        class="task-overlay-menu__item"
        :disabled="isMovePending"
        @click="$emit('edit')"
      >
        {{ t('task.edit') }}
      </button>
      <button
        type="button"
        class="task-overlay-menu__item"
        :disabled="isMovePending"
        @click="$emit('add-sub')"
      >
        {{ t('task.addSub') }}
      </button>
      <button
        type="button"
        class="task-overlay-menu__item is-danger"
        :disabled="isMovePending"
        @click="$emit('remove')"
      >
        {{ t('task.remove') }}
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { t } from '../i18n'
import type { GanttMapFields } from '../types/GanttTypes'

export default defineComponent({
  name: 'TaskBarOverlay',
  emits: ['edit', 'add-sub', 'remove'],
  props: {
    row: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    mapFields: {
      type: Object as PropType<GanttMapFields>,
      required: true,
    },
    tooltipVisible: {
      type: Boolean,
      default: false,
    },
    tooltipStyle: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    menuVisible: {
      type: Boolean,
      default: false,
    },
    menuStyle: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    isMovePending: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const taskName = computed(() => String(props.row[props.mapFields.task] ?? '-'))
    const startDateText = computed(() => String(props.row[props.mapFields.startdate] ?? '-'))
    const endDateText = computed(() => String(props.row[props.mapFields.enddate] ?? '-'))
    const durationText = computed(() => String(props.row[props.mapFields.takestime] ?? '-'))
    const progressText = computed(() => {
      const raw = Number(props.row[props.mapFields.progress] ?? 0)
      if (!Number.isFinite(raw)) {
        return '-'
      }

      return `${Math.round(raw * 100)}%`
    })
    const taskTypeLabel = computed(() => {
      const type = String(props.row.type ?? 'task')
      if (type === 'milestone') {
        return t('task.milestoneType')
      }
      if (type === 'project') {
        return t('task.projectType')
      }
      return t('task.taskType')
    })

    return {
      t,
      taskName,
      startDateText,
      endDateText,
      durationText,
      progressText,
      taskTypeLabel,
    }
  },
})
</script>

<style scoped lang="scss">
.task-overlay-card {
  position: fixed;
  z-index: 10000;
  width: 280px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.94);
  color: #f8fafc;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.24);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.task-overlay-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.task-overlay-card__title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.task-overlay-card__type {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
  font-size: 11px;
  font-weight: 600;
}

.task-overlay-card__grid {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 6px 10px;
}

.task-overlay-card__label {
  color: rgba(226, 232, 240, 0.64);
  font-size: 11px;
}

.task-overlay-card__value {
  color: #f8fafc;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-overlay-card__pending {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  color: #fbbf24;
  font-size: 11px;
  font-weight: 600;
}

.task-overlay-menu {
  position: fixed;
  z-index: 10001;
  min-width: 168px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(10px);
}

.task-overlay-menu__item {
  display: block;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #0f172a;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.is-danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
  }
}
</style>
