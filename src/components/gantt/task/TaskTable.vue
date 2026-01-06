<template>
  <div
    class="taskTable"
    :class="[
      'taskTable-base',
      tableClassName,
      { 'dark': isDarkMode }
    ]"
    :style="tableStyle"
  >
    <slot name="toolbar">
      <div
        class="header"
        :class="['header-base', headerClassName]"
        :style="{ height: `${headersHeight}px`, ...headerStyle }"
      >
        <svg
          ref="addTaskSvg"
          t="1647915776075"
          @click="setRootTask({})"
          :class="['addRootTask-base', addTaskButtonClassName]"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3147"
          width="28"
          height="28"
        >
          <path
            d="M864 0H160C70.4 0 0 70.4 0 160v704c0 89.6 70.4 160 160 160h704c89.6 0 160-70.4 160-160V160c0-89.6-70.4-160-160-160z m96 864c0 54.4-41.6 96-96 96H160c-54.4 0-96-41.6-96-96V160c0-54.4 41.6-96 96-96h704c54.4 0 96 41.6 96 96v704z"
            fill="currentColor"
            p-id="3148"
          ></path>
          <path
            d="M768 480h-224V256c0-19.2-12.8-32-32-32s-32 12.8-32 32v224H256c-19.2 0-32 12.8-32 32s12.8 32 32 32h224v224c0 19.2 12.8 32 32 32s32-12.8 32-32v-224h224c19.2 0 32-12.8 32-32s-12.8-32-32-32z"
            p-id="3149"
            fill="currentColor"
          ></path>
        </svg>
        <svg
          ref="jumpTodaySvg"
          @click="scrollToToday()"
          :class="['jumpToToday-base', todayButtonClassName]"
          :title="t('tooltip.jumpToday')"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
        >
          <path
            d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
            fill="currentColor"
          />
          <circle cx="12" cy="15" r="2" fill="currentColor" />
          <path
            d="M16.5 11.5l2 2-2 2"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M18.5 13.5h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg
          ref="columnSettingsSvg"
          @click="showColumnConfig"
          :class="['columnSettings-base', columnSettingsButtonClassName]"
          :title="t('tooltip.columnSettings')"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
        >
          <path
            d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M5 6h4M5 8h4M15 6h4M15 8h4M5 16h4M5 18h4M15 16h4M15 18h4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle
            cx="20"
            cy="4"
            r="3"
            fill="var(--primary, #0078d4)"
            stroke="var(--bg-content, #ffffff)"
            stroke-width="1.5"
          />
        </svg>
        <slot name="header" :headers="taskHeaders"></slot>
        <TaskHeader :headers="taskHeaders" :header-class-name="headerClassName" @update:headerWidth="handleHeaderWidthChange" />
      </div>
    </slot>
    <div :class="['content-base', contentClassName]" :style="{ height: `calc(100% - ${headersHeight}px)` }">
      <slot name="content" :tasks="tasks">
        <TaskContent
          v-if="Array.isArray(tasks) && tasks.length > 0"
          :headers="taskHeaders"
          :rowHeight="rowHeight"
          :content-class-name="contentClassName"
          :bar-row-class-name="barRowClassName"
        >
        </TaskContent>
      </slot>
    </div>

    <ColumnConfigPanel
      :visible="columnConfigVisible"
      :headers="taskHeaders"
      @close="columnConfigVisible = false"
      @update:headers="updateHeaders"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue'
import TaskHeader from './TaskHeader.vue'
import TaskContent from './TaskContent.vue'
import ColumnConfigPanel from '../config/ColumnConfigPanel.vue'
import { store, mutations } from '../state/Store'
import DateUtils from '../utils/dateUtils'
import sharedState from '../state/ShareState'
import { useI18n } from '../i18n'

export default defineComponent({
  name: 'GanttTaskTable',
  emits: ['column-config'],
  props: {
    headersHeight: {
      type: Number as () => number,
      default: 50,
    },
    rowHeight: {
      type: Number as () => number,
      default: 0,
    },
    tableClassName: {
      type: String,
      default: '',
    },
    headerClassName: {
      type: String,
      default: '',
    },
    contentClassName: {
      type: String,
      default: '',
    },
    addTaskButtonClassName: {
      type: String,
      default: '',
    },
    todayButtonClassName: {
      type: String,
      default: '',
    },
    columnSettingsButtonClassName: {
      type: String,
      default: '',
    },
    barRowClassName: {
      type: String,
      default: '',
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },
    tableStyle: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    headerStyle: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
  },
  components: {
    TaskHeader,
    TaskContent,
    ColumnConfigPanel,
  },
  setup(props, { emit }) {
    const { t } = useI18n()
    const tasks = computed(() => store.tasks)
    const taskHeaders = computed(() => store.taskHeaders)
    const rootTask = computed({
      get: () => store.rootTask,
      set: newValue => {
        mutations.setRootTask(newValue)
      },
    })
    const startGanttDate = computed(() => store.startGanttDate)
    const endGanttDate = computed(() => store.endGanttDate)

    const columnConfigVisible = ref(false)

    const setRootTask = mutations.setRootTask
    const scrollToToday = () => {
      if (!startGanttDate.value || !endGanttDate.value) return
      const isBetween = DateUtils.isBetween(DateUtils.now().toDate(), startGanttDate.value, endGanttDate.value)
      if (isBetween) {
        sharedState.triggerScrollToToday()
      }
    }

    const showColumnConfig = () => {
      columnConfigVisible.value = true
      emit('column-config')
    }

    const updateHeaders = (newHeaders: any[]) => {
      mutations.setTaskHeaders(newHeaders)
    }

    const handleHeaderWidthChange = ({ index, width }: { index: number; width: number }) => {
      const headers = [...store.taskHeaders]
      if (headers[index]) {
        headers[index] = { ...headers[index], width }
        mutations.setTaskHeaders(headers)
      }
    }

    const {
      tableClassName: tableClassNameProp,
      headerClassName: headerClassNameProp,
      contentClassName: contentClassNameProp,
      addTaskButtonClassName: addTaskButtonClassNameProp,
      todayButtonClassName: todayButtonClassNameProp,
      columnSettingsButtonClassName: columnSettingsButtonClassNameProp,
      isDarkMode: isDarkModeProp,
      tableStyle: tableStyleProp,
      headerStyle: headerStyleProp,
    } = props

    return {
      t,
      tasks,
      taskHeaders,
      rootTask,
      startGanttDate,
      endGanttDate,
      setRootTask,
      scrollToToday,
      columnConfigVisible,
      showColumnConfig,
      updateHeaders,
      handleHeaderWidthChange,
      tableClassName: tableClassNameProp,
      headerClassName: headerClassNameProp,
      contentClassName: contentClassNameProp,
      addTaskButtonClassName: addTaskButtonClassNameProp,
      todayButtonClassName: todayButtonClassNameProp,
      columnSettingsButtonClassName: columnSettingsButtonClassNameProp,
      isDarkMode: isDarkModeProp,
      tableStyle: tableStyleProp,
      headerStyle: headerStyleProp,
    }
  },
})
</script>

<style lang="scss" scoped>
.taskTable-base {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: hidden;
  background: var(--bg-content, #ffffff);
  border-left: 1px solid var(--border, #d0d0d0);

  :global(.dark) & {
    background: var(--gantt-bg-dark, #1e293b);
    border-color: var(--gantt-border, #334155);
  }
}

.header-base {
  height: 100%;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  position: relative;
  border-bottom: 1px solid var(--border, #cecece);

  :global(.dark) & {
    background: #1e293b;
  }
}

.addRootTask-base {
  position: absolute;
  z-index: 10;
  bottom: 4px;
  right: 4px;
  height: 28px;
  width: 28px;
  cursor: pointer;
  color: var(--text-secondary, #666666);
  transition: all var(--transition-fast, 0.15s ease);
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  padding: 3px;
  border-radius: 4px;

  &:hover {
    color: var(--primary, #0078d4);
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    transform: scale(1.1);
  }

  &:active {
    background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
  }
}

.jumpToToday-base {
  position: absolute;
  z-index: 10;
  top: 4px;
  right: 4px;
  height: 28px;
  width: 28px;
  cursor: pointer;
  color: var(--text-secondary, #666666);
  transition: all var(--transition-fast, 0.15s ease);
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  padding: 3px;
  border-radius: 4px;

  &:hover {
    color: var(--primary, #0078d4);
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    transform: scale(1.1);
  }

  &:active {
    background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
  }
}

.columnSettings-base {
  position: absolute;
  z-index: 10;
  top: 4px;
  right: 36px;
  height: 28px;
  width: 28px;
  cursor: pointer;
  color: var(--text-secondary, #666666);
  transition: all var(--transition-fast, 0.15s ease);
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  padding: 3px;
  border-radius: 4px;

  &:hover {
    color: var(--primary, #0078d4);
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    transform: scale(1.1);
  }

  &:active {
    background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
  }
}

.content-base {
  @apply overflow-hidden;
}
</style>
