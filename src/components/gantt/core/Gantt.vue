<template>
  <div class="page gantt-container" ref="ganttContainer" :style="containerStyle">
    <div class="toolbar">
      <div class="dateInput">
        <DatePicker
          :date="startDate"
          :min-date="minStartDate"
          :max-date="maxStartDate"
          @confirm="confirmStart"
        />
        <span style="margin-right: 20px; margin-left: 20px; color: #606266">{{
          t('common.to')
        }}</span>
        <DatePicker
          :date="endDate"
          :min-date="minEndDate"
          :max-date="maxEndDate"
          @confirm="confirmEnd"
        />
      </div>
      <div class="buttonGroup">
        <div :class="buttonClass[0]" class="metro-btn" @click="timeMode('季度')">
          <div class="metro-content">
            <div class="metro-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
                />
              </svg>
            </div>
            <div class="metro-text">{{ t('viewMode.quarter') }}</div>
          </div>
        </div>
        <div :class="buttonClass[1]" class="metro-btn" @click="timeMode('月')">
          <div class="metro-content">
            <div class="metro-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                />
              </svg>
            </div>
            <div class="metro-text">{{ t('viewMode.month') }}</div>
          </div>
        </div>
        <div :class="buttonClass[2]" class="metro-btn" @click="timeMode('周')">
          <div class="metro-content">
            <div class="metro-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <div class="metro-text">{{ t('viewMode.week') }}</div>
          </div>
        </div>
        <div
          :class="buttonClass[3]"
          class="metro-btn"
          @click="timeMode('日')"
          @mouseenter="showDaySubMenu = true"
          @mouseleave="handleDayButtonMouseLeave"
          ref="dayButtonRef"
        >
          <div class="metro-content">
            <div class="metro-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"
                />
              </svg>
            </div>
            <div class="metro-text">
              {{ daySubMode === 'half' ? t('viewMode.halfDay') : t('viewMode.day') }}
            </div>
          </div>
        </div>
        <div
          :class="buttonClass[4]"
          class="metro-btn"
          @click="timeMode('时')"
          @mouseenter="showHourSubMenu = true"
          @mouseleave="handleHourButtonMouseLeave"
          ref="hourButtonRef"
        >
          <div class="metro-content">
            <div class="metro-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                />
              </svg>
            </div>
            <div class="metro-text">
              {{
                hourSubMode === '15'
                  ? t('viewMode.15min')
                  : hourSubMode === '30'
                    ? t('viewMode.30min')
                    : t('viewMode.hour')
              }}
            </div>
          </div>
        </div>
      </div>
      <!-- 连线类型图例 -->
      <div class="link-legend">
        <div class="legend-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z" />
          </svg>
          {{ t('link.legend') }}
        </div>
        <div class="legend-items">
          <label
            class="legend-item"
            :class="{ disabled: !linkTypeVisibility.parentChild }"
            title="父子关系：显示任务的层级结构"
          >
            <input
              type="checkbox"
              :checked="linkTypeVisibility.parentChild"
              @change="handleLinkVisibilityChange('parentChild', $event)"
            />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                stroke="#95a5a6"
                stroke-width="1.5"
                stroke-dasharray="3,3"
              />
              <polygon points="24,6 18,3 18,9" fill="#95a5a6" />
            </svg>
            <span class="legend-label">{{ t('link.pc') }}</span>
            <span class="legend-desc">{{ t('link.parentChild') }}</span>
          </label>
          <label
            class="legend-item"
            :class="{ disabled: !linkTypeVisibility.finishToStart }"
            title="完成-开始：前置任务完成后，后续任务才能开始"
          >
            <input
              type="checkbox"
              :checked="linkTypeVisibility.finishToStart"
              @change="handleLinkVisibilityChange('finishToStart', $event)"
            />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                :stroke="linkTypeColors.finishToStart"
                stroke-width="2"
              />
              <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToStart" />
            </svg>
            <span class="legend-label">{{ t('link.fs') }}</span>
            <span class="legend-desc">{{ t('link.finishToStart') }}</span>
          </label>
          <label
            class="legend-item"
            :class="{ disabled: !linkTypeVisibility.startToStart }"
            title="开始-开始：两个任务同时开始"
          >
            <input
              type="checkbox"
              :checked="linkTypeVisibility.startToStart"
              @change="handleLinkVisibilityChange('startToStart', $event)"
            />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                :stroke="linkTypeColors.startToStart"
                stroke-width="2"
              />
              <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.startToStart" />
            </svg>
            <span class="legend-label">{{ t('link.ss') }}</span>
            <span class="legend-desc">{{ t('link.startToStart') }}</span>
          </label>
          <label
            class="legend-item"
            :class="{ disabled: !linkTypeVisibility.finishToFinish }"
            title="完成-完成：两个任务同时完成"
          >
            <input
              type="checkbox"
              :checked="linkTypeVisibility.finishToFinish"
              @change="handleLinkVisibilityChange('finishToFinish', $event)"
            />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                :stroke="linkTypeColors.finishToFinish"
                stroke-width="2"
              />
              <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToFinish" />
            </svg>
            <span class="legend-label">{{ t('link.ff') }}</span>
            <span class="legend-desc">{{ t('link.finishToFinish') }}</span>
          </label>
          <label
            class="legend-item"
            :class="{ disabled: !linkTypeVisibility.startToFinish }"
            title="开始-完成：前置任务开始后，后续任务才能完成"
          >
            <input
              type="checkbox"
              :checked="linkTypeVisibility.startToFinish"
              @change="handleLinkVisibilityChange('startToFinish', $event)"
            />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                :stroke="linkTypeColors.startToFinish"
                stroke-width="2"
              />
              <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.startToFinish" />
            </svg>
            <span class="legend-label">{{ t('link.sf') }}</span>
            <span class="legend-desc">{{ t('link.startToFinish') }}</span>
          </label>
        </div>
      </div>
      <div class="config-buttons">
        <GanttConfigPanel />
      </div>
    </div>

    <!-- 日模式子模式选择菜单 - 使用 Teleport 传送到 body 避免被裁剪 -->
    <Teleport to="body">
      <div
        v-if="showDaySubMenu && mode === '日'"
        class="day-submenu-popup"
        ref="daySubMenuRef"
        :style="daySubMenuPosition"
        @mouseenter="showDaySubMenu = true"
        @mouseleave="showDaySubMenu = false"
      >
        <div
          class="submenu-item"
          :class="{ active: daySubMode === 'full' }"
          @click="selectDaySubMode('full')"
        >
          {{ t('viewMode.fullDay') }}
        </div>
        <div
          class="submenu-item"
          :class="{ active: daySubMode === 'half' }"
          @click="selectDaySubMode('half')"
        >
          {{ t('viewMode.halfDay') }}
        </div>
      </div>
    </Teleport>

    <!-- 时模式子模式选择菜单 -->
    <Teleport to="body">
      <div
        v-if="showHourSubMenu && mode === '时'"
        class="hour-submenu-popup"
        ref="hourSubMenuRef"
        :style="hourSubMenuPosition"
        @mouseenter="showHourSubMenu = true"
        @mouseleave="showHourSubMenu = false"
      >
        <div
          class="submenu-item"
          :class="{ active: hourSubMode === '60' }"
          @click="selectHourSubMode('60')"
        >
          {{ t('viewMode.hour') }}
        </div>
        <div
          class="submenu-item"
          :class="{ active: hourSubMode === '30' }"
          @click="selectHourSubMode('30')"
        >
          {{ t('viewMode.30min') }}
        </div>
        <div
          class="submenu-item"
          :class="{ active: hourSubMode === '15' }"
          @click="selectHourSubMode('15')"
        >
          {{ t('viewMode.15min') }}
        </div>
      </div>
    </Teleport>
    <div class="gantt">
      <SplitPane
        direction="row"
        :min="0"
        :max="100"
        :triggerLength="13"
        v-model:paneLengthPercent="paneLengthPercent"
      >
        <template #one>
          <TaskTable
            :headersHeight="styleConfig.headersHeight"
            :rowHeight="styleConfig.rowHeight"
            :table-class-name="tableClassName"
            :header-class-name="headerClassName"
            :caption-class-name="captionClassName"
            :content-class-name="contentClassName"
            :add-task-button-class-name="addTaskButtonClassName"
            :today-button-class-name="todayButtonClassName"
            :column-settings-button-class-name="columnSettingsButtonClassName"
            :bar-row-class-name="barRowClassName"
            :is-dark-mode="isDarkMode"
          >
            <template v-if="$slots.header" #header>
              <slot name="header" />
            </template>
          </TaskTable>
        </template>
        <template #two>
          <RightTable
            ref="barContent"
            :headersHeight="styleConfig.headersHeight"
            :rowHeight="styleConfig.rowHeight"
            :bar-class-name="barClassName"
            :bar-row-class-name="barRowClassName"
            :progress-handle-class-name="progressHandleClassName"
            :container-class-name="containerClassName"
            :timeline-header-class-name="timelineHeaderClassName"
            :caption-class-name="captionClassName"
            :is-dark-mode="isDarkMode"
          />
        </template>
      </SplitPane>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  computed,
  provide,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from 'vue'
import DateUtils from '../utils/dateUtils'

import { Symbols } from '../state/Symbols'
import { linkDataManager, useLinkConfig } from '../composables/LinkConfig'
import { useI18n } from '../i18n'
import { PerformanceConfig } from '../composables/PerformanceConfig'
import { getWorkerManager, destroyWorkerManager } from '../workers/AdvancedWorkerAdapter'
import type { GanttViewMode, GanttMapFields, GanttTask } from '../types/GanttTypes'
// 导入日期选择器组件
import DatePicker from '../config/DatePicker.vue'
// 导入分割面板组件
import SplitPane from './SplitPane.vue'
import TaskTable from '../task/TaskTable.vue'
import RightTable from '../timeline/RightTable.vue'
import GanttConfigPanel from '../config/GanttConfigPanel.vue'
import { store, mutations } from '../state/Store'
export type { DataConfig, StyleConfig, EventConfig, TaskHeader } from '../types/Types'
// 移除未使用的类型导入
import { type ConfirmDateData } from '../types/ZodSchema'

// 定义月份表头类型
type MonthHeaders = {
  title: string
  width: number
}

// 定义天表头类型
type DayHeaders = MonthHeaders & {
  fulldate: string
}

// 定义周表头类型
type WeekHeaders = MonthHeaders & {
  fulldate: string
}

// 定义小时表头类型
type HourHeaders = {
  title: string
  width: number
  fulldate?: string
}

/**
 * Gantt 组件，用于展示甘特图。
 * 该组件接收样式配置、数据配置和事件配置作为属性。
 */
export default defineComponent({
  // 组件名称
  name: 'VueGantt',
  props: {
    /**
     * 样式配置对象，包含表头高度和行高。
     * @type {{ headersHeight: number; rowHeight: number }}
     * @required
     * @default { headersHeight: 100, rowHeight: 60 }
     */
    styleConfig: {
      type: Object as () => import('../types/Types').StyleConfig,
      required: true,
      default: () => ({
        // 表头高度
        headersHeight: 100,
        // 行高
        rowHeight: 60,
        // 默认条形图颜色函数
        setBarColor: () => '#0078d4',
      }),
      // 验证参数合法性
      validator: (value: { headersHeight: number; rowHeight: number }) => {
        return value.headersHeight > 0 && value.rowHeight > 0
      },
    },
    /**
     * 数据配置对象，包含数据源、任务表头和字段映射函数。
     * @type {{ dataSource: any[]; taskHeaders: () => any[]; mapFields: () => any }}
     * @required
     * @default { dataSource: [], taskHeaders: () => [], mapFields: () => {} }
     */
    dataConfig: {
      type: Object as () => {
        dataSource: any[]
        taskHeaders: any[]
        mapFields: GanttMapFields
        queryStartDate: string
        queryEndDate: string
        dependencies?: Omit<import('../types/Types').TaskDependency, 'id'>[]
      },
      required: true,
      default: () => ({
        dataSource: [],
        taskHeaders: [],
        mapFields: {} as GanttMapFields,
      }),
      validator: (value: {
        dataSource: any[]
        taskHeaders: any[]
        mapFields: GanttMapFields
      }) => {
        return (
          Array.isArray(value.dataSource) &&
          Array.isArray(value.taskHeaders) &&
          typeof value.mapFields === 'object' &&
          value.mapFields !== null
        )
      },
    },
    /**
     * 事件配置对象，包含添加根任务、添加子任务、移除任务等事件处理函数。
     * @type {{
     *   addRootTask: () => void;
     *   addSubTask: (task: any) => void;
     *   removeTask: (task: any) => void;
     *   queryTask: (startDate: string, endDate: string, mode: string) => void;
     *   barDate: (id: any, startDate: string, endDate: string) => void;
     *   allowChangeTaskDate: (allow: boolean) => void;
     * }}
     * @required
     */
    eventConfig: {
      type: Object as () => {
        // eslint-disable-next-line no-unused-vars
        addRootTask: (row: Partial<GanttTask> | null) => void
        // eslint-disable-next-line no-unused-vars
        addSubTask: (task: Partial<GanttTask>) => void
        // eslint-disable-next-line no-unused-vars
        removeTask: (task: Partial<GanttTask>) => void
        // eslint-disable-next-line no-unused-vars
        editTask: (task: Partial<GanttTask>) => void
        // eslint-disable-next-line no-unused-vars
        queryTask: (startDate: string, endDate: string, mode: string) => void
        // eslint-disable-next-line no-unused-vars
        barDate: (id: string | number, startDate: string, endDate: string) => void
        // eslint-disable-next-line no-unused-vars
        allowChangeTaskDate: (allow: boolean) => void
        // eslint-disable-next-line no-unused-vars
        updateProgress?: (detail: {
          taskId: string | number
          oldProgress: number
          newProgress: number
          task: GanttTask
        }) => void
      },
      required: true,
    },
    /**
     * 自定义 Tailwind 类名，允许外部传入自定义样式
     * @type {string}
     * @default ""
     */
    customClass: {
      type: String,
      default: '',
    },
    /**
     * 暗色模式
     * @type {boolean}
     * @default false
     */
    isDarkMode: {
      type: Boolean,
      default: false,
    },
    /**
     * 任务表格容器类名
     * @type {string}
     * @default ""
     */
    tableClassName: {
      type: String,
      default: '',
    },
    /**
     * 任务表格头部类名
     * @type {string}
     * @default ""
     */
    headerClassName: {
      type: String,
      default: '',
    },
    /**
     * 任务表格头部标题类名
     * @type {string}
     * @default ""
     */
    captionClassName: {
      type: String,
      default: '',
    },
    /**
     * 任务表格内容类名
     * @type {string}
     * @default ""
     */
    contentClassName: {
      type: String,
      default: '',
    },
    /**
     * 添加任务按钮类名
     * @type {string}
     * @default ""
     */
    addTaskButtonClassName: {
      type: String,
      default: '',
    },
    /**
     * 今日按钮类名
     * @type {string}
     * @default ""
     */
    todayButtonClassName: {
      type: String,
      default: '',
    },
    /**
     * 列设置按钮类名
     * @type {string}
     * @default ""
     */
    columnSettingsButtonClassName: {
      type: String,
      default: '',
    },
    /**
     * 任务条类名
     * @type {string}
     * @default ""
     */
    barClassName: {
      type: String,
      default: '',
    },
    /**
     * 任务条行类名
     * @type {string}
     * @default ""
     */
    barRowClassName: {
      type: String,
      default: '',
    },
    /**
     * 进度控制点类名
     * @type {string}
     * @default ""
     */
    progressHandleClassName: {
      type: String,
      default: '',
    },
    /**
     * 容器类名
     * @type {string}
     * @default ""
     */
    containerClassName: {
      type: String,
      default: '',
    },
    /**
     * 时间轴头部类名
     * @type {string}
     * @default ""
     */
    timelineHeaderClassName: {
      type: String,
      default: '',
    },
  },
  emits: ['localeChange'],
  components: {
    DatePicker,
    SplitPane,
    TaskTable,
    RightTable,
    GanttConfigPanel,
  },
  setup(props, { emit }) {
    // 国际化
    const { t, locale } = useI18n()

    // 监听语言变化事件
    watch(
      () => locale.value,
      (newLocale) => {
        emit('localeChange', newLocale)
      }
    )

    // 缓存 mapFields 的结果
    const mapFields = computed<GanttMapFields>(() => props.dataConfig.mapFields)
    // 缓存 dataSource 的结果
    const dataSource = computed(() => props.dataConfig.dataSource)

    // 定义响应式数据
    const initData = ref<any[]>([])
    const paneLengthPercent = ref(35)
    const buttonClass = ref(['button', 'button', 'button', 'button is-active', 'button'])
    const mode = ref<GanttViewMode>('日')
    // 日模式的子模式：全天或半天
    const daySubMode = ref<'full' | 'half'>(store.daySubMode)
    // 时模式的子模式：60分钟、30分钟或15分钟
    const hourSubMode = ref<'60' | '30' | '15'>('60')
    // 日模式子菜单状态
    const showDaySubMenu = ref(false)
    // 时模式子菜单状态
    const showHourSubMenu = ref(false)
    const dayButtonRef = ref<HTMLElement | null>(null)
    const daySubMenuRef = ref<HTMLElement | null>(null)
    const hourButtonRef = ref<HTMLElement | null>(null)
    const hourSubMenuRef = ref<HTMLElement | null>(null)
    const daySubMenuTop = ref(0)
    const daySubMenuLeft = ref(0)
    const hourSubMenuTop = ref(0)
    const hourSubMenuLeft = ref(0)
    // 使用 dataConfig 中的开始/结束日期，如果没有则使用当月第一天/最后一天
    const startDate = ref(
      props.dataConfig.queryStartDate ||
        DateUtils.now().startOf('month').format('YYYY-MM-DD')
    )
    const minStartDate = ref(DateUtils.now().add(-5, 'year').format('YYYY-MM-DD'))
    const maxStartDate = ref(DateUtils.now().add(5, 'year').format('YYYY-MM-DD'))
    const showStartDatePicker = ref(false)
    const selectedStartDate = ref(startDate.value) // 初始化为开始日期
    const endDate = ref(
      props.dataConfig.queryEndDate ||
        DateUtils.now().endOf('month').format('YYYY-MM-DD')
    )
    const minEndDate = ref(DateUtils.now().add(-5, 'year').format('YYYY-MM-DD')) // 初始可选5年前，选择开始日期后更新
    const maxEndDate = ref(
      DateUtils.add(startDate.value, 5, 'year').format('YYYY-MM-DD')
    )
    const showEndDatePicker = ref(false)
    const selectedEndDate = ref(endDate.value) // 初始化为结束日期
    const monthHeaders = ref<MonthHeaders[]>([])
    const dayHeaders = ref<DayHeaders[]>([])
    const weekHeaders = ref<WeekHeaders[]>([])
    const hourHeaders = ref<HourHeaders[]>([])
    const scale = ref(0)
    const timelineCellCount = ref(0)
    // 初始化 startGanttDate 和 endGanttDate，确保 bar 位置计算正确
    const startGanttDate = ref<string | null>(startDate.value + ' 00:00:00')
    const endGanttDate = ref<string | null>(endDate.value + ' 23:59:59')
    const result = ref('')

    const setTimeLineHeaders = (newVal: string) => {
      const start = DateUtils.create(selectedStartDate.value)
      const end = DateUtils.create(selectedEndDate.value)
      // 开始时间格式是否合法
      if (!start.isValid()) {
        return
      }
      // 结束时间格式是否合法
      if (!end.isValid()) {
        return
      }
      // 检验开始时间结束时间范围的合法性
      const days = DateUtils.diff(end.toDate(), start.toDate(), 'day')
      if (days < 0) {
        return
      }
      startGanttDate.value = selectedStartDate.value + ' 00:00:00'
      endGanttDate.value = selectedEndDate.value + ' 23:59:59'
      weekHeaders.value = []
      dayHeaders.value = []
      monthHeaders.value = []
      hourHeaders.value = []
      switch (newVal) {
        case '季度': {
          scale.value = 200

          const quarters: any[] = []
          let quarterCurrent = DateUtils.startOf(start.toDate(), 'quarter')
          const endQuarter = DateUtils.endOf(end.toDate(), 'quarter')
          while (
            DateUtils.isBefore(quarterCurrent.toDate(), endQuarter.toDate()) ||
            DateUtils.isSame(quarterCurrent.toDate(), endQuarter.toDate(), 'quarter')
          ) {
            quarters.push(quarterCurrent)
            quarterCurrent = DateUtils.add(quarterCurrent.toDate(), 1, 'quarter')
          }

          const years = [...new Set(quarters.map(q => DateUtils.year(q)))]
          years.forEach(year => {
            const yearQuarters = quarters.filter(q => DateUtils.year(q) === year)
            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
            monthHeaders.value.push({
              title: year + (isAsian ? '年' : ''),
              width: yearQuarters.length * scale.value,
            })
          })

          quarters.forEach(q => {
            const quarterNum = DateUtils.quarter(q)
            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
            const quarterTitle = isAsian ? `第${quarterNum}季度` : `Q${quarterNum}`
            dayHeaders.value.push({
              title: quarterTitle,
              width: scale.value,
              fulldate: DateUtils.format(q, 'YYYY-MM-DD'),
            })
          })

          timelineCellCount.value = quarters.length
          break
        }
        case '月': {
          scale.value = 120
          let currentDate = DateUtils.startOf(start.toDate(), 'month')
          const endMonth = DateUtils.endOf(end.toDate(), 'month')

          const years: number[] = []
          let yearCurrent = DateUtils.startOf(currentDate.toDate(), 'year')
          while (
            DateUtils.isBefore(yearCurrent.toDate(), endMonth.toDate()) ||
            DateUtils.isSame(yearCurrent.toDate(), endMonth.toDate(), 'year')
          ) {
            years.push(DateUtils.year(yearCurrent))
            yearCurrent = DateUtils.add(yearCurrent.toDate(), 1, 'year')
          }

          years.forEach(year => {
            let monthCount = 0
            let monthCurrent = DateUtils.clone(currentDate)
            while (
              DateUtils.isBefore(monthCurrent.toDate(), endMonth.toDate()) ||
              DateUtils.isSame(monthCurrent.toDate(), endMonth.toDate(), 'month')
            ) {
              if (DateUtils.year(monthCurrent) === year) {
                monthCount++
              }
              monthCurrent = DateUtils.add(monthCurrent.toDate(), 1, 'month')
            }

            if (monthCount > 0) {
              const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
              const yearTitle = isAsian ? year + '年' : year.toString()
              monthHeaders.value.push({
                title: yearTitle,
                width: monthCount * scale.value,
              })
            }
          })

          currentDate = DateUtils.startOf(start.toDate(), 'month')
          while (
            DateUtils.isBefore(currentDate.toDate(), endMonth.toDate()) ||
            DateUtils.isSame(currentDate.toDate(), endMonth.toDate(), 'month')
          ) {
            const monthNum = DateUtils.month(currentDate.toDate())
            const monthTitle = DateUtils.getMonthName(monthNum + 1)
            weekHeaders.value.push({
              title: monthTitle,
              width: scale.value,
              fulldate: DateUtils.format(currentDate.toDate(), 'YYYY-MM-DD'),
            })

            currentDate = DateUtils.add(currentDate.toDate(), 1, 'month')
          }

          timelineCellCount.value = weekHeaders.value.length
          break
        }
        case '周': {
          scale.value = 120
          let currentDate = DateUtils.startOf(start.toDate(), 'isoWeek')
          const endWeek = DateUtils.endOf(end.toDate(), 'isoWeek')

          const months: string[] = []
          let monthCurrent = DateUtils.startOf(currentDate.toDate(), 'month')
          while (
            DateUtils.isBefore(monthCurrent.toDate(), endWeek.toDate()) ||
            DateUtils.isSame(monthCurrent.toDate(), endWeek.toDate(), 'month')
          ) {
            months.push(DateUtils.format(monthCurrent.toDate(), 'YYYY-MM-DD'))
            monthCurrent = DateUtils.add(monthCurrent.toDate(), 1, 'month')
          }

          months.forEach((month) => {
            const monthStart = DateUtils.create(month)
            const monthEnd = DateUtils.endOf(monthStart.toDate(), 'month')

            let weekCount = 0
            let weekCurrent = DateUtils.clone(currentDate)
            while (
              DateUtils.isBefore(weekCurrent.toDate(), endWeek.toDate()) ||
              DateUtils.isSame(weekCurrent.toDate(), endWeek.toDate(), 'week')
            ) {
              const weekStart = DateUtils.startOf(weekCurrent.toDate(), 'isoWeek')
              const weekEnd = DateUtils.endOf(weekCurrent.toDate(), 'isoWeek')

              if (
                DateUtils.isSame(weekStart.toDate(), monthStart.toDate(), 'month') ||
                DateUtils.isSame(weekEnd.toDate(), monthStart.toDate(), 'month') ||
                (DateUtils.isBefore(weekStart.toDate(), monthEnd.toDate()) && DateUtils.isAfter(weekEnd.toDate(), monthStart.toDate()))
              ) {
                weekCount++
              }
              weekCurrent = DateUtils.add(weekCurrent.toDate(), 1, 'week')
            }

            if (weekCount > 0) {
              const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
              const monthNum = DateUtils.month(monthStart.toDate())
              const monthName = DateUtils.getMonthName(monthNum + 1)
              const monthTitle = isAsian
                ? DateUtils.format(monthStart.toDate(), 'YYYY年MM月')
                : `${monthName} ${DateUtils.year(monthStart.toDate())}`
              monthHeaders.value.push({
                title: monthTitle,
                width: weekCount * scale.value,
              })
            }
          })

          while (
            DateUtils.isBefore(currentDate.toDate(), endWeek.toDate()) ||
            DateUtils.isSame(currentDate.toDate(), endWeek.toDate(), 'week')
          ) {
            const weekStart = DateUtils.startOf(currentDate.toDate(), 'isoWeek')
            const weekEnd = DateUtils.endOf(currentDate.toDate(), 'isoWeek')

            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
            const weekTitle = isAsian
              ? `第${DateUtils.isoWeek(currentDate)}周 (${DateUtils.format(weekStart.toDate(), 'MM/DD')}-${DateUtils.format(weekEnd.toDate(), 'MM/DD')})`
              : `Week ${DateUtils.isoWeek(currentDate)} (${DateUtils.format(weekStart.toDate(), 'MM/DD')}-${DateUtils.format(weekEnd.toDate(), 'MM/DD')})`
            weekHeaders.value.push({
              title: weekTitle,
              width: scale.value,
              fulldate: DateUtils.format(weekStart.toDate(), 'YYYY-MM-DD'),
            })

            currentDate = DateUtils.add(currentDate.toDate(), 1, 'week')
          }

          timelineCellCount.value = weekHeaders.value.length
          break
        }
        case '日': {
          const isHalfDay = daySubMode.value === 'half'
          scale.value = isHalfDay ? 40 : 80
          let currentDate = start

          const dates: any[] = []
          while (
            DateUtils.isBefore(currentDate.toDate(), end.toDate()) ||
            DateUtils.isSame(currentDate.toDate(), end.toDate(), 'day')
          ) {
            dates.push(currentDate)
            currentDate = DateUtils.add(currentDate.toDate(), 1, 'day')
          }

          const years = [...new Set(dates.map(d => DateUtils.year(d)))]
          years.forEach(year => {
            const yearDates = dates.filter(d => DateUtils.year(d) === year)
            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
            const cellWidth = isHalfDay
              ? yearDates.length * 2 * scale.value
              : yearDates.length * scale.value
            monthHeaders.value.push({
              title: year + (isAsian ? '年' : ''),
              width: cellWidth,
            })
          })

          const months = new Map<string, any[]>()
          dates.forEach(d => {
            const key = `${DateUtils.year(d)}-${DateUtils.month(d)}`
            if (!months.has(key)) months.set(key, [])
            months.get(key)!.push(d)
          })
          months.forEach((monthDates) => {
            const monthNum = DateUtils.month(monthDates[0])
            const monthTitle = DateUtils.getMonthName(monthNum + 1)
            const cellWidth = isHalfDay
              ? monthDates.length * 2 * scale.value
              : monthDates.length * scale.value
            weekHeaders.value.push({
              title: monthTitle,
              width: cellWidth,
              fulldate: DateUtils.format(monthDates[0], 'YYYY-MM-DD'),
            })
          })

          if (isHalfDay) {
            dates.forEach(d => {
              const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
              const dayStr = needsDaySuffix ? DateUtils.format(d, 'DD') + '日' : DateUtils.format(d, 'DD')
              const fullDate = DateUtils.format(d, 'YYYY-MM-DD')

              dayHeaders.value.push({
                title: dayStr,
                width: scale.value * 2,
                fulldate: fullDate,
              })

              const amLabel =
                locale.value === 'zh-CN' || locale.value === 'zh-TW'
                  ? '上午'
                  : locale.value === 'ja-JP'
                    ? '午前'
                    : locale.value === 'ko-KR'
                      ? '오전'
                      : 'AM'
              const pmLabel =
                locale.value === 'zh-CN' || locale.value === 'zh-TW'
                  ? '下午'
                  : locale.value === 'ja-JP'
                    ? '午後'
                    : locale.value === 'ko-KR'
                      ? '오후'
                      : 'PM'

              hourHeaders.value.push({
                title: amLabel,
                width: scale.value,
                fulldate: fullDate + '-AM',
              })
              hourHeaders.value.push({
                title: pmLabel,
                width: scale.value,
                fulldate: fullDate + '-PM',
              })
            })

            timelineCellCount.value = dates.length * 2
          } else {
            dates.forEach(d => {
              const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
              const caption = needsDaySuffix ? DateUtils.format(d, 'DD') + '日' : DateUtils.format(d, 'DD')
              const fullDate = DateUtils.format(d, 'YYYY-MM-DD')
              dayHeaders.value.push({
                title: caption,
                width: scale.value,
                fulldate: fullDate,
              })
            })

            timelineCellCount.value = dayHeaders.value.length
          }
          break
        }
        case '时': {
          const minuteInterval = parseInt(hourSubMode.value)
          const intervalsPerHour = 60 / minuteInterval
          scale.value = minuteInterval === 60 ? 30 : minuteInterval === 30 ? 40 : 50
          let currentDate = start
          const endOfEndDay = end.endOf('day')
          while (currentDate.isBefore(endOfEndDay)) {
            const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)
            const monthNum = DateUtils.month(currentDate.toDate())
            const monthName = DateUtils.getMonthName(monthNum + 1)
            const dayNum = DateUtils.date(currentDate.toDate())
            const caption = needsDaySuffix
              ? `${monthName}${dayNum}日`
              : `${monthName} ${dayNum}`
            const fullDate = currentDate.format('YYYY-MM-DD')
            const week = DateUtils.format(currentDate.toDate(), 'dddd')
            const dayWidth = intervalsPerHour * 24 * scale.value

            weekHeaders.value.push({
              title: week,
              width: dayWidth,
              fulldate: fullDate,
            })
            dayHeaders.value.push({
              title: caption,
              width: dayWidth,
              fulldate: fullDate,
            })
            for (let hour = 0; hour <= 23; hour++) {
              for (let intervalIndex = 0; intervalIndex < intervalsPerHour; intervalIndex++) {
                const minutes = intervalIndex * minuteInterval

                let title: string
                const needsHourSuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value)

                if (minuteInterval === 60) {
                  title = needsHourSuffix ? hour + '点' : `${hour}:00`
                } else {
                  const minuteStr = minutes.toString().padStart(2, '0')
                  title = `${hour}:${minuteStr}`
                }

                hourHeaders.value.push({
                  title: title,
                  width: scale.value,
                  fulldate: `${fullDate} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
                })
              }
            }
            currentDate = currentDate.add(1, 'day')
          }
          timelineCellCount.value = hourHeaders.value.length
          break
        }
      }
    }

    // 初始化 DateUtils locale
    watch(locale, (newLocale) => {
      DateUtils.setLocale(newLocale as any)
      // 语言切换后重新生成时间轴表头，以更新月份、星期等显示
      if (mode.value) {
        setTimeLineHeaders(mode.value)
      }
    }, { immediate: true })

    // 连线配置
    const { config: linkConfig, updateConfig: updateLinkConfig } = useLinkConfig()

    // 直接使用全局配置的连线类型显示控制，保持响应式同步
    const linkTypeVisibility = computed(
      () =>
        linkConfig.linkTypeVisibility || {
          finishToStart: true,
          startToStart: true,
          finishToFinish: true,
          startToFinish: true,
          parentChild: true,
        }
    )

    // 更新连线类型显示配置
    const updateLinkVisibility = (type: keyof typeof linkTypeVisibility.value, value: boolean) => {
      updateLinkConfig({
        linkTypeVisibility: { [type]: value } as any,
      })
    }

    // 辅助方法：处理 checkbox change 事件
    const handleLinkVisibilityChange = (type: keyof typeof linkTypeVisibility.value, event: Event) => {
      const target = event.target as HTMLInputElement
      updateLinkVisibility(type, target.checked)
    }

    // 甘特图容器引用
    const ganttContainer = ref<HTMLElement>()

    // 计算属性
    const subTask = computed(() => store.subTask)
    const editTask = computed(() => store.editTask)
    const removeTask = computed(() => store.removeTask)
    const rootTask = computed(() => store.rootTask)
    const allowChangeTaskDate = computed(() => store.allowChangeTaskDate)

    const FindAllParent = (targetData: any[], pid: any) => {
      const parent = targetData.filter(obj => obj[mapFields.value['id']] === pid)
      if (parent && parent.length > 0) {
        result.value = parent[0].index + '.' + result.value
        FindAllParent(targetData, parent[0][mapFields.value['parentId']])
      }
    }

    // 判断是否使用 Worker 处理数据
    const shouldUseWorker = (tasks: any[]) => {
      return (
        PerformanceConfig.ENABLE_WEB_WORKER && tasks.length > PerformanceConfig.WORKER_THRESHOLD
      )
    }

    // 主线程递归处理数据(保留作为 fallback)
    const RecursionData = (id: any, tasks: any[], level: number) => {
      const findResult = tasks.filter(obj => obj[mapFields.value['parentId']] === id)
      if (findResult && findResult.length > 0) {
        level++
        for (let i = 0; i < findResult.length; i++) {
          findResult[i].treeLevel = level
          findResult[i].index = i + 1

          const parent = initData.value.filter(
            obj => obj[mapFields.value['id']] === findResult[i][mapFields.value['parentId']]
          )
          result.value = ''
          if (parent && parent.length > 0) {
            result.value = parent[0].index + '.' + findResult[i].index
            FindAllParent(initData.value, parent[0][mapFields.value['parentId']])
            findResult[i].no = result.value
          } else {
            findResult[i].no = i + 1 + ''
          }
          initData.value.push(findResult[i])
          RecursionData(findResult[i][mapFields.value['id']], tasks, level)
        }
      }
    }

    // 使用 Worker 处理数据
    const processDataWithWorker = async (tasks: any[]) => {
      try {
        const workerManager = getWorkerManager()
        const processedData = await workerManager.processRecursionData(
          '0',
          tasks,
          0,
          mapFields.value as unknown as Record<string, string>
        )
        return processedData
      } catch {
        initData.value = []
        const level: number = 0
        RecursionData('0', tasks, level)
        return initData.value
      }
    }

    const timeMode = (_mode: GanttViewMode) => {
      if (!_mode) return
      // 更新按钮状态
      for (let i = 0; i < buttonClass.value.length; i++) {
        buttonClass.value[i] = 'button'
      }

      switch (_mode) {
        case '季度': {
          buttonClass.value[0] = 'button is-active'
          break
        }
        case '月': {
          buttonClass.value[1] = 'button is-active'
          break
        }
        case '周': {
          buttonClass.value[2] = 'button is-active'
          break
        }
        case '日': {
          buttonClass.value[3] = 'button is-active'
          break
        }
        case '时': {
          buttonClass.value[4] = 'button is-active'
          break
        }
      }

      // 先设置mode，触发响应式更新
      mode.value = _mode

      // 等待DOM更新完成后再滚动
      nextTick(() => {
        const barContentEl = document.querySelector('.table .content') as HTMLElement
        if (barContentEl) {
          barContentEl.scrollLeft = 0
        }
      })
    }

    // 日模式子模式切换处理
    const onDaySubModeChange = () => {
      // 更新 store 中的状态
      mutations.setDaySubMode(daySubMode.value)
      // 重新生成时间轴
      setTimeLineHeaders('日')
    }

    // 计算弹出菜单位置
    const daySubMenuPosition = computed(() => ({
      position: 'fixed' as const,
      top: `${daySubMenuTop.value}px`,
      left: `${daySubMenuLeft.value}px`,
      zIndex: 100002,
    }))

    // 计算时模式弹出菜单位置
    const hourSubMenuPosition = computed(() => ({
      position: 'fixed' as const,
      top: `${hourSubMenuTop.value}px`,
      left: `${hourSubMenuLeft.value}px`,
      zIndex: 100002,
    }))

    // 鼠标离开"日"按钮时的处理，延迟关闭菜单
    const handleDayButtonMouseLeave = () => {
      setTimeout(() => {
        if (!daySubMenuRef.value || !document.querySelector('.day-submenu-popup:hover')) {
          showDaySubMenu.value = false
        }
      }, 100)
    }

    // 鼠标离开"时"按钮时的处理，延迟关闭菜单
    const handleHourButtonMouseLeave = () => {
      setTimeout(() => {
        if (!hourSubMenuRef.value || !document.querySelector('.hour-submenu-popup:hover')) {
          showHourSubMenu.value = false
        }
      }, 100)
    }

    // 选择日模式子模式
    const selectDaySubMode = (subMode: 'full' | 'half') => {
      daySubMode.value = subMode
      mutations.setDaySubMode(subMode)
      // 重新生成时间轴
      setTimeLineHeaders('日')
      // 关闭菜单
      showDaySubMenu.value = false
    }

    // 选择时模式子模式
    const selectHourSubMode = (subMode: '60' | '30' | '15') => {
      hourSubMode.value = subMode
      // 更新 store 中的状态
      mutations.setHourSubMode(subMode)
      // 重新生成时间轴
      setTimeLineHeaders('时')
      // 关闭菜单
      showHourSubMenu.value = false
    }

    // 监听 showDaySubMenu 变化，计算弹出菜单位置
    watch(showDaySubMenu, newVal => {
      if (newVal && dayButtonRef.value) {
        const rect = dayButtonRef.value.getBoundingClientRect()
        daySubMenuTop.value = rect.bottom + 5
        daySubMenuLeft.value = rect.left
      }
    })

    // 监听 showHourSubMenu 变化，计算弹出菜单位置
    watch(showHourSubMenu, newVal => {
      if (newVal && hourButtonRef.value) {
        const rect = hourButtonRef.value.getBoundingClientRect()
        hourSubMenuTop.value = rect.bottom + 5
        hourSubMenuLeft.value = rect.left
      }
    })

    const confirmStart = (value: ConfirmDateData) => {
      const days = DateUtils.diff(endDate.value, value.date, 'days')
      if (days < 0) {
        // 开始日期大于结束日期时，自动调整结束日期
        selectedEndDate.value = value.date
        endDate.value = value.date
        mutations.setEndGanttDate(DateUtils.create(value.date).toDate())
      }
      showStartDatePicker.value = false
      selectedStartDate.value = value.date
      startDate.value = value.date
      // 更新 Store 中的 startGanttDate
      mutations.setStartGanttDate(DateUtils.create(value.date).toDate())
      // 结束日期不能早于开始日期
      minEndDate.value = value.date
    }

    const confirmEnd = (value: ConfirmDateData) => {
      const days = DateUtils.diff(value.date, startDate.value, 'days')
      if (days < 0) {
        // 结束日期小于开始日期时，自动调整开始日期
        selectedStartDate.value = DateUtils.format(value.date, 'YYYY-MM-DD')
        startDate.value = DateUtils.format(value.date, 'YYYY-MM-DD')
        mutations.setStartGanttDate(DateUtils.create(value.date).toDate())
      }
      showEndDatePicker.value = false
      selectedEndDate.value = value.date
      endDate.value = value.date
      // 更新 Store 中的 endGanttDate
      mutations.setEndGanttDate(DateUtils.create(value.date).toDate())
    }

    // 监听 mode 和日期的变化
    watch(
      [mode, selectedStartDate, selectedEndDate],
      ([newMode, newStartDate, newEndDate], [oldMode, oldStartDate, oldEndDate]) => {
        if (newMode !== oldMode || newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
          if (newMode) {
            setTimeLineHeaders(newMode)
          }
          // 只在日期范围变化时调用 queryTask，模式变化不触发
          if (newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
            if (selectedStartDate.value && selectedEndDate.value && mode.value) {
              props.eventConfig.queryTask(selectedStartDate.value, selectedEndDate.value, mode.value)
            }
          }
        }
      }
    )

    // 监听语言变化，重新生成时间轴表头
    watch(locale, () => {
      if (mode.value) {
        setTimeLineHeaders(mode.value)
      }
    })

    watch(rootTask, newVal => {
      props.eventConfig.addRootTask(newVal)
    })

    watch(subTask, newVal => {
      props.eventConfig.addSubTask(newVal)
    })

    watch(removeTask, newVal => {
      props.eventConfig.removeTask(newVal)
    })

    watch(editTask, newVal => {
      props.eventConfig.editTask(newVal)
    })

    watch(allowChangeTaskDate, newVal => {
      props.eventConfig.allowChangeTaskDate(newVal)
    })

    // 优化：拆分watchEffect，避免不必要的触发
    watch(
      () => store.barDate,
      barDate => {
        if (barDate) {
          const { id, startDate, endDate } = barDate
          if (id && startDate && endDate) {
            props.eventConfig.barDate(id, startDate, endDate)
          }
        }
      }
    )

    watch(scale, newScale => {
      mutations.setScale(newScale)
    })

    watch(
      () => props.dataConfig.taskHeaders,
      newHeaders => {
        mutations.setTaskHeaders(newHeaders)
      }
    )

    watch(
      [monthHeaders, dayHeaders, weekHeaders, hourHeaders],
      ([newMonth, newDay, newWeek, newHour]) => {
        mutations.setMonthHeaders(newMonth)
        mutations.setDayHeaders(newDay)
        mutations.setWeekHeaders(newWeek)
        mutations.setHourHeaders(newHour)
      }
    )

    watch(mode, newMode => {
      mutations.setMode(newMode)
    })

    watch(mapFields, newFields => {
      if (newFields) {
        mutations.setMapFields(newFields)
      }
    })

    watch(
      () => props.dataConfig.queryStartDate,
      newStartDate => {
        if (newStartDate) {
          mutations.setStartGanttDate(DateUtils.create(newStartDate).toDate())
          startGanttDate.value = newStartDate
          selectedStartDate.value = newStartDate
          startDate.value = newStartDate
        }
      }
    )

    watch(
      () => props.dataConfig.queryEndDate,
      newEndDate => {
        if (newEndDate) {
          mutations.setEndGanttDate(DateUtils.create(newEndDate).toDate())
          endGanttDate.value = newEndDate
          selectedEndDate.value = newEndDate
          endDate.value = newEndDate
        }
      }
    )

    watch(timelineCellCount, newCount => {
      if (newCount) {
        mutations.setTimelineCellCount(newCount)
      }
    })

    onBeforeMount(() => {
      mutations.setStartGanttDate(DateUtils.create(startDate.value).toDate())
      mutations.setEndGanttDate(DateUtils.create(endDate.value).toDate())

      mutations.setMonthHeaders(monthHeaders.value)
      mutations.setWeekHeaders(weekHeaders.value)
      mutations.setDayHeaders(dayHeaders.value)
      mutations.setHourHeaders(hourHeaders.value)
      mutations.setTaskHeaders(props.dataConfig.taskHeaders)
      mutations.setMapFields(mapFields.value)
      mutations.setTimelineCellCount(timelineCellCount.value)
      // 初始化时如果有数据，先设置
      if (dataSource.value && dataSource.value.length > 0) {
        mutations.setTasks(dataSource.value)
      }
    })

    // 进度更新事件处理
    const handleProgressUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (props.eventConfig.updateProgress) {
        props.eventConfig.updateProgress(customEvent.detail)
      }
    }

    onMounted(async () => {
      monthHeaders.value = []
      weekHeaders.value = []
      dayHeaders.value = []
      hourHeaders.value = []

      // 使用 Worker 或主线程处理数据
      if (shouldUseWorker(dataSource.value)) {
        const processedData = await processDataWithWorker(dataSource.value)
        mutations.setTasks(processedData)
      } else {
        const level: number = 0
        RecursionData('0', dataSource.value, level)
        mutations.setTasks(initData.value)
      }

      nextTick(() => {
        // mode.value 已在初始化时设置为 '日'，不再在这里覆盖
        mutations.setMode(mode.value)
        // 初始化时生成时间轴表头
        if (mode.value) {
          setTimeLineHeaders(mode.value)
        }
        
        // 确保所有值同步到 store，避免初始化时渲染不一致
        nextTick(() => {
          mutations.setScale(scale.value)
          mutations.setTimelineCellCount(timelineCellCount.value)
          mutations.setMonthHeaders(monthHeaders.value)
          mutations.setWeekHeaders(weekHeaders.value)
          mutations.setDayHeaders(dayHeaders.value)
          mutations.setHourHeaders(hourHeaders.value)
        })
      })

      // 监听进度更新事件
      window.addEventListener('taskProgressUpdate', handleProgressUpdate)
    })

    // 优化：监听dataSource变化，使用节流避免频繁更新
    let updateTimer: ReturnType<typeof setTimeout> | null = null
    watch(
      dataSource,
      async newVal => {
        if (newVal && newVal.length > 0) {
          // 使用节流，避免频繁更新
          if (updateTimer) {
            clearTimeout(updateTimer)
          }
          updateTimer = setTimeout(async () => {
            // 使用 Worker 或主线程处理数据
            if (shouldUseWorker(newVal)) {
              const processedData = await processDataWithWorker(newVal)
              mutations.setTasks(processedData)
            } else {
              initData.value = []
              const level: number = 0
              RecursionData('0', newVal, level)
              mutations.setTasks(initData.value)
            }
            updateTimer = null
          }, 100)
        } else if (newVal && newVal.length === 0) {
          // 如果数据为空，也要更新
          mutations.setTasks([])
        }
      },
      { immediate: false }
    )

    onBeforeUnmount(() => {
      // 清理进度更新事件监听
      window.removeEventListener('taskProgressUpdate', handleProgressUpdate)

      // 清理 Worker
      destroyWorkerManager()
    })

    provide(Symbols.AddRootTaskSymbol, (row: Record<string, any>) => {
      return props.eventConfig.addRootTask(row)
    })

    // 设置Bar的颜色,传递到子组件
    provide(Symbols.SetBarColorSymbol, (row: GanttTask) => {
      return props.styleConfig.setBarColor(row)
    })

    // 设置任务类型判断函数（只有当用户提供了自定义函数时才 provide）
    if (props.styleConfig.setTaskType) {
      provide(Symbols.SetTaskTypeSymbol, props.styleConfig.setTaskType)
    }

    // 提供甘特图容器引用给主题选择器
    provide('ganttContainer', ganttContainer)

    // 提供当前主题状态
    const currentTheme = ref('metro')
    // 从 localStorage 加载保存的主题
    try {
      const savedTheme = localStorage.getItem('gantt-theme')
      if (savedTheme) {
        currentTheme.value = savedTheme
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
    provide('currentTheme', currentTheme)

    // 监听依赖关系变化
    watch(
      () => props.dataConfig.dependencies,
      newDependencies => {
        if (newDependencies && newDependencies.length > 0) {
          // 清空现有依赖关系
          linkDataManager.clear()
          // 添加新的依赖关系
          newDependencies.forEach(dep => {
            linkDataManager.addDependency(dep)
          })
        }
      },
      { immediate: true }
    )

    // 连线配置变化处理
    // eslint-disable-next-line no-unused-vars
    const onLinkConfigChange = (_config: any) => {
      // 这里可以添加额外的处理逻辑，比如通知其他组件更新
    }

    // 连线类型颜色（从配置中读取，用于图例显示）
    const linkTypeColors = computed(() => ({
      finishToStart: linkConfig.linkTypeColors?.finishToStart || '#3498db',
      startToStart: linkConfig.linkTypeColors?.startToStart || '#2ecc71',
      finishToFinish: linkConfig.linkTypeColors?.finishToFinish || '#e74c3c',
      startToFinish: linkConfig.linkTypeColors?.startToFinish || '#f39c12',
    }))

    return {
      t,
      subTask,
      editTask,
      removeTask,
      rootTask,
      allowChangeTaskDate,
      paneLengthPercent,
      startDate,
      endDate,
      minStartDate,
      maxStartDate,
      confirmStart,
      minEndDate,
      maxEndDate,
      confirmEnd,
      buttonClass,
      timeMode,
      mode,
      daySubMode,
      hourSubMode,
      showDaySubMenu,
      showHourSubMenu,
      dayButtonRef,
      daySubMenuRef,
      hourButtonRef,
      hourSubMenuRef,
      daySubMenuPosition,
      hourSubMenuPosition,
      handleDayButtonMouseLeave,
      handleHourButtonMouseLeave,
      selectDaySubMode,
      selectHourSubMode,
      onDaySubModeChange,
      onLinkConfigChange,
      ganttContainer,
      linkTypeColors,
      linkTypeVisibility,
      updateLinkVisibility,
      handleLinkVisibilityChange,
      tableClassName: props.styleConfig?.tableClassName ?? props.tableClassName,
      headerClassName: props.styleConfig?.headerClassName ?? props.headerClassName,
      captionClassName: props.styleConfig?.captionClassName ?? props.captionClassName,
      contentClassName: props.styleConfig?.contentClassName ?? props.contentClassName,
      addTaskButtonClassName: props.styleConfig?.addTaskButtonClassName ?? props.addTaskButtonClassName,
      todayButtonClassName: props.styleConfig?.todayButtonClassName ?? props.todayButtonClassName,
      columnSettingsButtonClassName: props.styleConfig?.columnSettingsButtonClassName ?? props.columnSettingsButtonClassName,
      barClassName: props.styleConfig?.barClassName ?? props.barClassName,
      barRowClassName: props.styleConfig?.barRowClassName ?? props.barRowClassName,
      progressHandleClassName: props.styleConfig?.progressHandleClassName ?? props.progressHandleClassName,
      containerClassName: props.styleConfig?.containerClassName ?? props.containerClassName,
      timelineHeaderClassName: props.styleConfig?.timelineHeaderClassName ?? props.timelineHeaderClassName,
      containerStyle: computed(() => {
        const vars = props.styleConfig?.cssVariables
        if (!vars) return {}
        return Object.entries(vars).reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
      }),
      isDarkMode: props.isDarkMode,
    }
  },
})
</script>

<style lang="scss" scoped>
$toolbarHeight: 70px;

.page {
  height: 100%;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:global(.gantt-theme) {
  --row-hover: #dbeafe;
  --text-primary: #eab308;
  --bg-content: #ffffff;
  --border: #d0d0d0;
}

.toolbar {
  height: $toolbarHeight;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: calc($toolbarHeight / 2);
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border-bottom: 1px solid var(--border, #d0d0d0);
  transition: all var(--transition-normal, 0.25s ease);

  .dateInput {
    cursor: pointer;
    height: calc($toolbarHeight / 1.5);
    width: 450px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    border-radius: 5px;
    color: var(--primary, #0078d4);
    font-size: 14px;
    transition: color var(--transition-fast, 0.15s ease);
  }

  .buttonGroup {
    height: calc($toolbarHeight / 1.5);
    display: flex;
    flex-direction: row;
    margin-right: 20px;
    background: var(--bg-metal-normal);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-inset), var(--shadow-outset);
    border-radius: 2px;
    overflow: hidden;
    transition: all var(--transition-normal);

    .metro-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 100%;
      cursor: pointer;
      transition: all var(--transition-fast, 0.15s ease);
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      border-right: 1px solid var(--border, #d0d0d0);

      &:last-child {
        border-right: none;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f0f0f0));
        opacity: 0;
        transition: opacity var(--transition-fast, 0.15s ease);
      }

      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
        opacity: 0;
        transition: opacity var(--transition-fast, 0.15s ease);
      }

      .metro-content {
        position: relative;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .metro-icon {
        color: var(--text-secondary, #666666);
        transition: color var(--transition-fast, 0.15s ease);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .metro-text {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary, #555555);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: color var(--transition-fast, 0.15s ease);
      }

      &:hover {
        &::before {
          opacity: 1;
        }

        .metro-icon {
          color: var(--text-primary, #333333);
        }

        .metro-text {
          color: var(--text-primary, #333333);
        }
      }

      &:active {
        &::after {
          opacity: 1;
        }
      }

      &.button.is-active,
      &.is-active {
        background: linear-gradient(145deg, #0078d4, #106ebe);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3),
          0 1px 2px rgba(0, 0, 0, 0.2);

        &::before {
          background: linear-gradient(145deg, #1084d8, #0d5aa7);
          opacity: 0;
        }

        &::after {
          background: linear-gradient(145deg, #0d5aa7, #1084d8);
          opacity: 0;
        }

        .metro-icon {
          color: #ffffff;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        }

        .metro-text {
          color: #ffffff;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
          font-weight: 700;
        }

        &:hover {
          &::before {
            opacity: 1;
          }
        }

        &:active {
          &::after {
            opacity: 1;
          }
        }
      }
    }

    .button {
      @extend .metro-btn;
    }
  }

  .link-legend {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 16px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    margin-right: 16px;

    .legend-title {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #666666);
      padding-right: 12px;
      border-right: 1px solid var(--border, #d0d0d0);

      svg {
        color: var(--primary, #0078d4);
      }
    }

    .legend-items {
      display: flex;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 3px;
      transition: all var(--transition-fast, 0.15s ease);

      input[type='checkbox'] {
        width: 14px;
        height: 14px;
        cursor: pointer;
        accent-color: var(--primary, #0078d4);
        margin: 0;
      }

      &:hover {
        background: var(--bg-secondary, #e8e8e8);
      }

      &.disabled {
        opacity: 0.5;

        svg {
          opacity: 0.4;
        }

        .legend-label,
        .legend-desc {
          text-decoration: line-through;
        }
      }

      .legend-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-primary, #333333);
        min-width: 18px;
      }

      .legend-desc {
        font-size: 10px;
        color: var(--text-secondary, #666666);
        white-space: nowrap;
      }
    }
  }

  .config-buttons {
    display: flex;
    gap: 12px;
    margin-left: auto;
    padding: 0 8px;
  }

  .link-config-btn {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.1) 0%,
      rgba(155, 89, 182, 0.1) 50%,
      rgba(52, 152, 219, 0.1) 100%
    );
    border: 1px solid rgba(52, 152, 219, 0.3);
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 2;
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 18px;
        height: 18px;
        color: #3498db;
        transition: all 0.3s ease;
        filter: drop-shadow(0 0 3px rgba(52, 152, 219, 0.3));
      }
    }

    .btn-text {
      font-size: 13px;
      font-weight: 600;
      color: #2c3e50;
      transition: all 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.2) 0%,
        rgba(155, 89, 182, 0.2) 50%,
        rgba(52, 152, 219, 0.2) 100%
      );
      border-color: rgba(52, 152, 219, 0.5);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);

      &::before {
        left: 100%;
      }

      .btn-icon svg {
        color: #2980b9;
        transform: scale(1.1);
      }

      .btn-text {
        color: #2980b9;
      }
    }

    &.active {
      background: linear-gradient(
        135deg,
        rgba(231, 76, 60, 0.15) 0%,
        rgba(192, 57, 43, 0.15) 50%,
        rgba(231, 76, 60, 0.15) 100%
      );
      border-color: rgba(231, 76, 60, 0.4);
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.3);

      .btn-icon svg {
        color: #e74c3c;
        animation: pulse 2s infinite ease-in-out;
      }

      .btn-text {
        color: #e74c3c;
        font-weight: 700;
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      filter: drop-shadow(0 0 3px rgba(231, 76, 60, 0.3));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 0 8px rgba(231, 76, 60, 0.6));
    }
  }
}

.gantt {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.config-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.config-panel-container {
  position: relative;
  max-height: 90vh;
  overflow: hidden;
}
</style>

<!-- 非 scoped 样式 - 用于 Teleport 到 body 的弹出菜单 -->
<style lang="scss">
/* 日模式子模式弹出菜单样式 */
.day-submenu-popup {
  position: fixed;
  background: var(--bg-content, #ffffff);
  border: 1px solid var(--border, #d0d0d0);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  min-width: 140px;
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  z-index: 100002;
  animation: menuFadeIn 0.15s ease-out;

  .submenu-item {
    padding: 12px 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary, #333333);
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    transition: all var(--transition-fast, 0.15s ease);
    border-bottom: 1px solid var(--border, #e0e0e0);
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: transparent;
      transition: all 0.15s ease;
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
      padding-left: 24px;

      &::before {
        background: var(--primary, #0078d4);
      }
    }

    &.active {
      background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
      color: var(--text-white, #ffffff);
      font-weight: 600;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

      &::before {
        background: var(--text-white, #ffffff);
      }

      &:hover {
        background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
        color: var(--text-white, #ffffff);
        padding-left: 20px;
      }
    }
  }
}

/* 时模式子模式弹出菜单样式 - 复用日模式样式 */
.hour-submenu-popup {
  position: fixed;
  background: var(--bg-content, #ffffff);
  border: 1px solid var(--border, #d0d0d0);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  min-width: 140px;
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  z-index: 100002;
  animation: menuFadeIn 0.15s ease-out;

  .submenu-item {
    padding: 12px 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary, #333333);
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    transition: all var(--transition-fast, 0.15s ease);
    border-bottom: 1px solid var(--border, #e0e0e0);
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: transparent;
      transition: all 0.15s ease;
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
      padding-left: 24px;

      &::before {
        background: var(--primary, #0078d4);
      }
    }

    &.active {
      background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
      color: var(--text-white, #ffffff);
      font-weight: 600;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

      &::before {
        background: var(--text-white, #ffffff);
      }

      &:hover {
        background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
        color: var(--text-white, #ffffff);
        padding-left: 20px;
      }
    }
  }
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================= */
/* iOS 26 Liquid Glass - 真正的液态玻璃效果 */
/* 核心特征：深度层次、边缘折射、动态光影、胶囊圆角 */
/* ============================================= */

/* CSS 变量定义 - iOS 26 风格 */
[data-gantt-theme='liquidGlass'] {
  /* 玻璃核心参数 */
  --glass-blur: 40px;
  --glass-saturation: 200%;
  --glass-brightness: 108%;
  --glass-opacity: 0.72;

  /* 深度阴影系统 */
  --shadow-elevation-1: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-elevation-2: 0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
  --shadow-elevation-3: 0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
  --shadow-elevation-4: 0 24px 64px rgba(0, 0, 0, 0.16), 0 12px 24px rgba(0, 0, 0, 0.08);

  /* 边缘高光 - 模拟光线折射 */
  --edge-highlight:
    inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(255, 255, 255, 0.2);
  --edge-highlight-strong:
    inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(255, 255, 255, 0.3);

  /* 彩虹色散边框 */
  --prismatic-border: linear-gradient(
    135deg,
    rgba(255, 120, 120, 0.3) 0%,
    rgba(255, 200, 120, 0.3) 20%,
    rgba(200, 255, 120, 0.3) 40%,
    rgba(120, 255, 200, 0.3) 60%,
    rgba(120, 200, 255, 0.3) 80%,
    rgba(200, 120, 255, 0.3) 100%
  );

  /* iOS 系统色 */
  --ios-blue: #007aff;
  --ios-blue-dark: #0051d5;
  --ios-gray-1: #8e8e93;
  --ios-gray-2: #aeaeb2;
  --ios-gray-3: #c7c7cc;
  --ios-gray-4: #d1d1d6;
  --ios-gray-5: #e5e5ea;
  --ios-gray-6: #f2f2f7;

  /* 背景 - 柔和渐变 */
  background: linear-gradient(180deg, #e8f0f8 0%, #f0f4f8 30%, #f8fafc 70%, #ffffff 100%);
  background-attachment: fixed;
}

/* ============================================= */
/* 通用玻璃效果基类 */
/* ============================================= */

/* 玻璃面板基础样式 */
[data-gantt-theme='liquidGlass'] .glass-panel {
  background: rgba(255, 255, 255, var(--glass-opacity));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation))
    brightness(var(--glass-brightness));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation))
    brightness(var(--glass-brightness));
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: var(--shadow-elevation-2), var(--edge-highlight);
  position: relative;
  overflow: hidden;
}

/* 玻璃面板顶部高光层 */
[data-gantt-theme='liquidGlass'] .glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 24px 24px 0 0;
}

/* 玻璃面板边缘色散效果 */
[data-gantt-theme='liquidGlass'] .glass-panel::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: var(--prismatic-border);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

/* ============================================= */
/* 工具栏 - iOS 26 胶囊玻璃效果 */
/* ============================================= */

[data-gantt-theme='liquidGlass'] .toolbar {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(50px) saturate(200%) brightness(105%) !important;
  -webkit-backdrop-filter: blur(50px) saturate(200%) brightness(105%) !important;
  border: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.02) !important;
  position: relative !important;
}

/* 工具栏顶部高光 */
[data-gantt-theme='liquidGlass'] .toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
}

/* ============================================= */
/* 视图模式按钮组 - iOS 26 分段控件风格 */
/* 使用更高优先级选择器覆盖 scoped 样式 */
/* ============================================= */

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup {
  background: rgba(120, 120, 128, 0.16) !important;
  backdrop-filter: blur(40px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 14px !important;
  padding: 4px !important;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05) !important;
  overflow: visible !important;
  position: relative !important;
  gap: 2px !important;
  height: auto !important;
}

/* 按钮组顶部高光 */
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 50% !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%) !important;
  pointer-events: none !important;
  border-radius: 14px 14px 0 0 !important;
  z-index: 0 !important;
}

/* 单个按钮 - iOS 分段控件样式 */
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn {
  background: transparent !important;
  border: none !important;
  border-right: none !important;
  border-radius: 10px !important;
  margin: 0 !important;
  padding: 8px 16px !important;
  position: relative !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 1 !important;
  box-shadow: none !important;
  width: auto !important;
  height: auto !important;
  min-height: 36px !important;
}

/* 移除按钮的伪元素背景 */
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn::before,
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn::after {
  display: none !important;
}

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn .metro-content {
  position: relative !important;
  z-index: 3 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn .metro-text {
  color: rgba(0, 0, 0, 0.5) !important;
  font-weight: 500 !important;
  font-size: 11px !important;
  letter-spacing: -0.08px !important;
  transition: all 0.25s ease !important;
  text-transform: none !important;
}

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn .metro-icon {
  color: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s ease !important;
}

/* 按钮悬浮 - 轻微高亮 */
[data-gantt-theme='liquidGlass']
  .toolbar
  .buttonGroup
  .metro-btn:hover:not(.is-active):not(.button.is-active) {
  background: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
}

[data-gantt-theme='liquidGlass']
  .toolbar
  .buttonGroup
  .metro-btn:hover:not(.is-active):not(.button.is-active)
  .metro-text {
  color: rgba(0, 0, 0, 0.7) !important;
}

[data-gantt-theme='liquidGlass']
  .toolbar
  .buttonGroup
  .metro-btn:hover:not(.is-active):not(.button.is-active)
  .metro-icon {
  color: rgba(0, 0, 0, 0.6) !important;
}

/* 按钮激活状态 - iOS 白色玻璃胶囊 */
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.is-active,
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.button.is-active {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.02) !important;
  z-index: 2 !important;
  transform: scale(1.02) !important;
}

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.is-active .metro-text,
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.button.is-active .metro-text {
  color: #1d1d1f !important;
  font-weight: 600 !important;
}

[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.is-active .metro-icon,
[data-gantt-theme='liquidGlass'] .toolbar .buttonGroup .metro-btn.button.is-active .metro-icon {
  color: var(--ios-blue, #007aff) !important;
}

/* 兼容性选择器 - 仅在 liquidGlass 主题下生效 */
[data-gantt-theme='liquidGlass'] .buttonGroup {
  background: rgba(120, 120, 128, 0.16) !important;
  backdrop-filter: blur(40px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 14px !important;
  padding: 4px !important;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05) !important;
  overflow: visible !important;
  position: relative !important;
  gap: 2px !important;
}

[data-gantt-theme='liquidGlass'] .buttonGroup::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 50% !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%) !important;
  pointer-events: none !important;
  border-radius: 14px 14px 0 0 !important;
  z-index: 0 !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn {
  background: transparent !important;
  border: none !important;
  border-right: none !important;
  border-radius: 10px !important;
  margin: 0 !important;
  padding: 8px 16px !important;
  position: relative !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 1 !important;
  box-shadow: none !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn::before,
[data-gantt-theme='liquidGlass'] .metro-btn::after {
  display: none !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn .metro-content {
  position: relative !important;
  z-index: 3 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn .metro-text {
  color: rgba(0, 0, 0, 0.5) !important;
  font-weight: 500 !important;
  font-size: 11px !important;
  letter-spacing: -0.08px !important;
  transition: all 0.25s ease !important;
  text-transform: none !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn .metro-icon {
  color: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s ease !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn:hover:not(.is-active):not(.button.is-active) {
  background: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
}

[data-gantt-theme='liquidGlass']
  .metro-btn:hover:not(.is-active):not(.button.is-active)
  .metro-text {
  color: rgba(0, 0, 0, 0.7) !important;
}

[data-gantt-theme='liquidGlass']
  .metro-btn:hover:not(.is-active):not(.button.is-active)
  .metro-icon {
  color: rgba(0, 0, 0, 0.6) !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn.is-active,
[data-gantt-theme='liquidGlass'] .metro-btn.button.is-active {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.02) !important;
  z-index: 2 !important;
  transform: scale(1.02) !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn.is-active .metro-text,
[data-gantt-theme='liquidGlass'] .metro-btn.button.is-active .metro-text {
  color: #1d1d1f !important;
  font-weight: 600 !important;
}

[data-gantt-theme='liquidGlass'] .metro-btn.is-active .metro-icon,
[data-gantt-theme='liquidGlass'] .metro-btn.button.is-active .metro-icon {
  color: var(--ios-blue, #007aff) !important;
}

/* ============================================= */
/* 表格区域 - 深度玻璃效果 */
/* 只影响左侧任务表格，不影响右侧时间线表格 */
/* ============================================= */

[data-gantt-theme='liquidGlass'] .gantt .pane-one .table {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(60px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(60px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 20px !important;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
  position: relative !important;
  overflow: hidden !important;
}

/* 右侧时间线表格保持原有的滚动功能 */
[data-gantt-theme='liquidGlass'] .gantt .pane-two .table {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(40px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(40px) saturate(160%) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: 16px !important;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  /* 不设置 overflow: hidden，保持滚动功能 */
}

/* 表格顶部高光 - 只应用于左侧表格 */
[data-gantt-theme='liquidGlass'] .gantt .pane-one .table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 20px 20px 0 0;
}

/* 右侧表格的轻微高光 */
[data-gantt-theme='liquidGlass'] .gantt .pane-two .table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 16px 16px 0 0;
}

/* 表头 - 毛玻璃效果 */
[data-gantt-theme='liquidGlass'] .table .header {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(30px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(150%) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  position: relative;
  z-index: 2;
}

/* 表头单元格 */
[data-gantt-theme='liquidGlass'] .headerCaption {
  background: transparent !important;
  color: #1d1d1f !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.08px !important;
  border-right: 1px solid rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s ease !important;
}

[data-gantt-theme='liquidGlass'] .headerCaption:hover {
  background: rgba(0, 122, 255, 0.06) !important;
  color: var(--ios-blue) !important;
}
</style>
