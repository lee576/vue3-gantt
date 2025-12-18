<template>
    <div class="page gantt-container" ref="ganttContainer">
        <div class="toolbar">
            <div class="dateInput">
                <DatePicker :date="startDate" :min-date="minStartDate" :max-date="maxStartDate"
                    @confirm="confirmStart" />
                <span style="margin-right:20px;margin-left:20px;color:#606266">{{ t('common.to') }}</span>
                <DatePicker :date="endDate" :min-date="minEndDate" :max-date="maxEndDate" @confirm="confirmEnd" />
            </div>
            <div class="buttonGroup">
                <div :class="buttonClass[0]" class="metro-btn" @click="timeMode('月')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.month') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[1]" class="metro-btn" @click="timeMode('周')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.week') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[2]" class="metro-btn" @click="timeMode('日')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.day') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[3]" class="metro-btn" @click="timeMode('时')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.hour') }}</div>
                    </div>
                </div>
            </div>
            <!-- 连线类型图例 -->
            <div class="link-legend">
                <div class="legend-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                    </svg>
                    {{ t('link.legend') }}
                </div>
                <div class="legend-items">
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.parentChild }" title="父子关系：显示任务的层级结构">
                        <input type="checkbox" v-model="linkTypeVisibility.parentChild" @change="updateLinkVisibility" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" stroke="#95a5a6" stroke-width="1.5" stroke-dasharray="3,3"/>
                            <polygon points="24,6 18,3 18,9" fill="#95a5a6"/>
                        </svg>
                        <span class="legend-label">{{ t('link.pc') }}</span>
                        <span class="legend-desc">{{ t('link.parentChild') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.finishToStart }" title="完成-开始：前置任务完成后，后续任务才能开始">
                        <input type="checkbox" v-model="linkTypeVisibility.finishToStart" @change="updateLinkVisibility" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.finishToStart" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToStart"/>
                        </svg>
                        <span class="legend-label">{{ t('link.fs') }}</span>
                        <span class="legend-desc">{{ t('link.finishToStart') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.startToStart }" title="开始-开始：两个任务同时开始">
                        <input type="checkbox" v-model="linkTypeVisibility.startToStart" @change="updateLinkVisibility" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.startToStart" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.startToStart"/>
                        </svg>
                        <span class="legend-label">{{ t('link.ss') }}</span>
                        <span class="legend-desc">{{ t('link.startToStart') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.finishToFinish }" title="完成-完成：两个任务同时完成">
                        <input type="checkbox" v-model="linkTypeVisibility.finishToFinish" @change="updateLinkVisibility" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.finishToFinish" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToFinish"/>
                        </svg>
                        <span class="legend-label">{{ t('link.ff') }}</span>
                        <span class="legend-desc">{{ t('link.finishToFinish') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.startToFinish }" title="开始-完成：前置任务开始后，后续任务才能完成">
                        <input type="checkbox" v-model="linkTypeVisibility.startToFinish" @change="updateLinkVisibility" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.startToFinish" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.startToFinish"/>
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
        <div class="gantt">
            <SplitPane direction="row" :min="0" :max="100" :triggerLength="10"
                v-model:paneLengthPercent="paneLengthPercent">
                <template #one>
                    <TaskTable :headersHeight='styleConfig.headersHeight' :rowHeight='styleConfig.rowHeight'>
                    </TaskTable>
                </template>
                <template #two>
                    <RightTable ref='barContent' :headersHeight='styleConfig.headersHeight'
                        :rowHeight='styleConfig.rowHeight'></RightTable>
                </template>
            </SplitPane>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed, provide, onBeforeMount, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/ru';
dayjs.extend(customParseFormat);

import { Symbols } from './Symbols';
import { linkDataManager, useLinkConfig } from './LinkConfig';
import { useI18n } from './i18n';
// 导入日期选择器组件
import DatePicker from './DatePicker.vue';
// 导入分割面板组件
import SplitPane from './SplitPane.vue';
import TaskTable from '../gantt/task/TaskTable.vue';
import RightTable from './RightTable.vue';
import GanttConfigPanel from './GanttConfigPanel.vue';
import { store, mutations } from './Store';
export type { DataConfig, StyleConfig, EventConfig, TaskHeader } from './Types';
// 移除未使用的类型导入
import { type ConfirmDateData } from './ZodSchema';

// 定义月份表头类型
type MonthHeaders = {
    title: string;
    width: number;
}

// 定义天表头类型
type DayHeaders = MonthHeaders & {
    fulldate: string;
}

// 定义周表头类型
type WeekHeaders = MonthHeaders & {
    fulldate: string;
}

// 定义小时表头类型
type HourHeaders = {
    title: string;
    width: number;
}

/**
 * Gantt 组件，用于展示甘特图。
 * 该组件接收样式配置、数据配置和事件配置作为属性。
 */
export default defineComponent({
    // 组件名称
    name: 'Gantt',
    props: {
        /**
         * 样式配置对象，包含表头高度和行高。
         * @type {{ headersHeight: number; rowHeight: number }}
         * @required
         * @default { headersHeight: 100, rowHeight: 60 }
         */
        styleConfig: {
            type: Object as () => {
                headersHeight: number;
                rowHeight: number;
                setBarColor: (row: Record<string, any>) => string;
                setTaskType?: (row: Record<string, any>) => import('./Types').TaskType;
            },
            required: true,
            default: () => ({
                // 表头高度
                headersHeight: 100,
                // 行高
                rowHeight: 60
            }),
            // 验证参数合法性
            validator: (value: { headersHeight: number; rowHeight: number }) => {
                return value.headersHeight > 0 && value.rowHeight > 0;
            }
        },
        /**
         * 数据配置对象，包含数据源、任务表头和字段映射函数。
         * @type {{ dataSource: any[]; taskHeaders: () => any[]; mapFields: () => any }}
         * @required
         * @default { dataSource: [], taskHeaders: () => [], mapFields: () => {} }
         */
        dataConfig: {
            type: Object as () => {
                dataSource: any[];
                taskHeaders: any[];
                mapFields: Record<string, any>;
                queryStartDate: string;
                queryEndDate: string;
                dependencies?: Omit<import('./Types').TaskDependency, 'id'>[];
            },
            required: true,
            default: () => ({
                dataSource: [],
                taskHeaders: [],
                mapFields: {}
            }),
            validator: (value: { dataSource: any[]; taskHeaders: any[]; mapFields: Record<string, any> }) => {
                return Array.isArray(value.dataSource) &&
                    Array.isArray(value.taskHeaders) &&
                    typeof value.mapFields === 'object' && value.mapFields !== null;
            }
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
                addRootTask: (row: Record<string, any> | null) => void;
                addSubTask: (task: any) => void;
                removeTask: (task: any) => void;
                editTask: (task: any) => void;
                queryTask: (startDate: string, endDate: string, mode: string) => void;
                barDate: (id: any, startDate: string, endDate: string) => void;
                allowChangeTaskDate: (allow: boolean) => void;
                updateProgress?: (detail: { taskId: any; oldProgress: number; newProgress: number; task: Record<string, any> }) => void;
            },
            required: true
        }
    },
    components: {
        DatePicker,
        SplitPane,
        TaskTable,
        RightTable,
        GanttConfigPanel
    },
    setup(props) {
        // 国际化
        const { t, locale } = useI18n();
        
        // 根据当前语言设置 dayjs locale
        const getDayjsLocale = () => {
            const localeMap: Record<string, string> = {
                'zh-CN': 'zh-cn',
                'en-US': 'en',
                'ja-JP': 'ja',
                'ko-KR': 'ko',
                'fr-FR': 'fr',
                'de-DE': 'de',
                'es-ES': 'es',
                'ru-RU': 'ru'
            };
            return localeMap[locale.value] || 'en';
        };
        
        // 缓存 mapFields 的结果
        const mapFields = computed(() => props.dataConfig.mapFields);
        // 缓存 dataSource 的结果
        const dataSource = computed(() => props.dataConfig.dataSource);

        // 连线配置
        const { config: linkConfig, updateConfig: updateLinkConfig } = useLinkConfig();

        // 连线类型显示控制
        const linkTypeVisibility = ref({
            finishToStart: linkConfig.linkTypeVisibility?.finishToStart ?? true,
            startToStart: linkConfig.linkTypeVisibility?.startToStart ?? true,
            finishToFinish: linkConfig.linkTypeVisibility?.finishToFinish ?? true,
            startToFinish: linkConfig.linkTypeVisibility?.startToFinish ?? true,
            parentChild: linkConfig.linkTypeVisibility?.parentChild ?? true
        });

        // 更新连线类型显示配置
        const updateLinkVisibility = () => {
            updateLinkConfig({
                linkTypeVisibility: { ...linkTypeVisibility.value }
            });
        };

        // 定义响应式数据
        const initData = ref<any[]>([]);
        const paneLengthPercent = ref(35);
        const buttonClass = ref(['button is-active', 'button', 'button', 'button']);
        const mode = ref('月');
        // 使用 dataConfig 中的开始/结束日期，如果没有则使用当月第一天/最后一天
        const startDate = ref(
            props.dataConfig.queryStartDate || 
            dayjs().locale(getDayjsLocale()).startOf('month').format('YYYY-MM-DD')
        );
        const minStartDate = ref(dayjs().locale(getDayjsLocale()).add(-5, 'y').format('YYYY-MM-DD'));
        const maxStartDate = ref(dayjs().locale(getDayjsLocale()).add(5, 'y').format('YYYY-MM-DD'));
        const showStartDatePicker = ref(false);
        const selectedStartDate = ref(startDate.value);  // 初始化为开始日期
        const endDate = ref(
            props.dataConfig.queryEndDate || 
            dayjs().locale(getDayjsLocale()).endOf('month').format('YYYY-MM-DD')
        );
        const minEndDate = ref(dayjs().locale(getDayjsLocale()).add(-5, 'y').format('YYYY-MM-DD'));  // 初始可选5年前，选择开始日期后更新
        const maxEndDate = ref(dayjs(startDate.value).locale(getDayjsLocale()).add(5, 'y').format('YYYY-MM-DD'));
        const showEndDatePicker = ref(false);
        const selectedEndDate = ref(endDate.value);  // 初始化为结束日期
        const monthHeaders = ref<MonthHeaders[]>([]);
        const dayHeaders = ref<DayHeaders[]>([]);
        const weekHeaders = ref<WeekHeaders[]>([]);
        const hourHeaders = ref<HourHeaders[]>([]);
        const scale = ref(0);
        const timelineCellCount = ref(0);
        // 初始化 startGanttDate 和 endGanttDate，确保 bar 位置计算正确
        const startGanttDate = ref<string | null>(startDate.value + ' 00:00:00');
        const endGanttDate = ref<string | null>(endDate.value + ' 23:59:59');
        const result = ref('');
        
        // 甘特图容器引用
        const ganttContainer = ref<HTMLElement>();

        // 计算属性
        const subTask = computed(() => store.subTask);
        const editTask = computed(() => store.editTask);
        const removeTask = computed(() => store.removeTask);
        const rootTask = computed(() => store.rootTask);
        const allowChangeTaskDate = computed(() => store.allowChangeTaskDate);

        const setTimeLineHeaders = (newVal: string) => {
            const start = dayjs(selectedStartDate.value);
            const end = dayjs(selectedEndDate.value);
            // 开始时间格式是否合法
            if (!start.isValid()) {
                return;
            }
            // 结束时间格式是否合法
            if (!end.isValid()) {
                return;
            }
            // 检验开始时间结束时间范围的合法性
            const days = end.diff(start, 'day');
            if (days < 0) {
                return;
            }
            startGanttDate.value = selectedStartDate.value + ' 00:00:00';
            endGanttDate.value = selectedEndDate.value + ' 23:59:59';
            weekHeaders.value = [];
            dayHeaders.value = [];
            monthHeaders.value = [];
            hourHeaders.value = [];
            switch (newVal) {
                case '月': {
                    scale.value = 80;
                    const months: string[] = [];
                    let current = start.startOf('month');
                    while (current.isBefore(end) || current.isSame(end, 'month')) {
                        months.push(current.format('YYYY-MM-DD'));
                        current = current.add(1, 'month');
                    }
                    if (!months.some((item) => dayjs(item).format('YYYY-MM') === end.format('YYYY-MM'))) {
                        months.push(end.format('YYYY-MM-DD'));
                    }
                    // 时间跨度只有一个月
                    if (months.length === 1) {
                        const days = end.diff(start, 'day') + 1;
                        monthHeaders.value.push({
                            title: start.locale(getDayjsLocale()).format('MMMM'),
                            width: days * scale.value
                        });
                    } else {
                        months.forEach((month, index) => {
                            if (index === 0) {
                                const endOfMonth = start.endOf('month').format('YYYY-MM-DD');
                                const days = dayjs(endOfMonth).diff(start, 'day') + 1;
                                monthHeaders.value.push({
                                    title: dayjs(month).locale(getDayjsLocale()).format('MMMM'),
                                    width: days * scale.value
                                });
                            } else if (index === months.length - 1) {
                                const startOfMonth = end.startOf('month').format('YYYY-MM-DD');
                                const days = end.diff(dayjs(startOfMonth), 'day') + 1;
                                monthHeaders.value.push({
                                    title: dayjs(month).locale(getDayjsLocale()).format('MMMM'),
                                    width: days * scale.value
                                });
                            } else {
                                const days = dayjs(month, 'YYYY-MM').daysInMonth();
                                monthHeaders.value.push({
                                    title: dayjs(month).locale(getDayjsLocale()).format('MMMM'),
                                    width: days * scale.value
                                });
                            }
                        });
                    }

                    let currentDate = start;
                    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
                        // 中日韩语言需要添加“日”后缀
                        const needsDaySuffix = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const caption = needsDaySuffix
                            ? currentDate.format('DD') + '日'
                            : currentDate.format('DD');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.locale(getDayjsLocale()).format('dddd');
                        weekHeaders.value.push({
                            title: week,
                            width: scale.value,
                            fulldate: fullDate
                        });
                        dayHeaders.value.push({
                            title: caption,
                            width: scale.value,
                            fulldate: fullDate
                        });
                        currentDate = currentDate.add(1, 'day');
                    }
                    timelineCellCount.value = dayHeaders.value.length;
                    break;
                }
                case '周': {
                    scale.value = 120;
                    let currentDate = start.startOf('isoWeek'); // 从周一开始
                    const endWeek = end.endOf('isoWeek'); // 到周日结束
                    
                    // 生成月份表头
                    const months: string[] = [];
                    let monthCurrent = currentDate.startOf('month');
                    while (monthCurrent.isBefore(endWeek) || monthCurrent.isSame(endWeek, 'month')) {
                        months.push(monthCurrent.format('YYYY-MM-DD'));
                        monthCurrent = monthCurrent.add(1, 'month');
                    }
                    
                    months.forEach((month, _index) => {
                        const monthStart = dayjs(month);
                        const monthEnd = monthStart.endOf('month');
                        
                        // 计算该月包含的周数
                        let weekCount = 0;
                        let weekCurrent = currentDate.clone();
                        while (weekCurrent.isBefore(endWeek) || weekCurrent.isSame(endWeek, 'week')) {
                            const weekStart = weekCurrent.startOf('isoWeek');
                            const weekEnd = weekCurrent.endOf('isoWeek');
                            
                            // 检查这一周是否与当前月份有交集
                            if (weekStart.isSame(monthStart, 'month') || weekEnd.isSame(monthStart, 'month') ||
                                (weekStart.isBefore(monthEnd) && weekEnd.isAfter(monthStart))) {
                                weekCount++;
                            }
                            weekCurrent = weekCurrent.add(1, 'week');
                        }
                        
                        if (weekCount > 0) {
                            // 根据语言选择月份格式
                            const isAsian = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                            const monthTitle = isAsian
                                ? monthStart.format('YYYY年MM月')
                                : monthStart.locale(getDayjsLocale()).format('MMMM YYYY');
                            monthHeaders.value.push({
                                title: monthTitle,
                                width: weekCount * scale.value
                            });
                        }
                    });
                    
                    // 生成周表头（不生成日表头，周表头显示开始和结束日期）
                    while (currentDate.isBefore(endWeek) || currentDate.isSame(endWeek, 'week')) {
                        const weekStart = currentDate.startOf('isoWeek');
                        const weekEnd = currentDate.endOf('isoWeek');
                        
                        // 周表头 - 显示周数和日期范围
                        const isAsian = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const weekTitle = isAsian
                            ? `第${currentDate.isoWeek()}周 (${weekStart.format('MM/DD')}-${weekEnd.format('MM/DD')})`
                            : `Week ${currentDate.isoWeek()} (${weekStart.format('MM/DD')}-${weekEnd.format('MM/DD')})`;
                        weekHeaders.value.push({
                            title: weekTitle,
                            width: scale.value,
                            fulldate: weekStart.format('YYYY-MM-DD')
                        });
                        
                        currentDate = currentDate.add(1, 'week');
                    }
                    
                    timelineCellCount.value = weekHeaders.value.length;
                    break;
                }
                case '日': {
                    scale.value = 80;
                    let currentDate = start;
                    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
                        // 中日韩语言需要添加“日”后缀
                        const needsDaySuffix = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const caption = needsDaySuffix
                            ? currentDate.locale(getDayjsLocale()).format('MMMM DD') + '日'
                            : currentDate.locale(getDayjsLocale()).format('MMMM DD');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.locale(getDayjsLocale()).format('dddd');
                        weekHeaders.value.push({
                            title: week,
                            width: scale.value,
                            fulldate: fullDate
                        });
                        dayHeaders.value.push({
                            title: caption,
                            width: scale.value,
                            fulldate: fullDate
                        });
                        currentDate = currentDate.add(1, 'day');
                    }
                    timelineCellCount.value = dayHeaders.value.length;
                    break;
                }
                case '时': {
                    scale.value = 30;
                    let currentDate = start;
                    // 预先计算结束日期
                    const endOfEndDay = end.endOf('day');
                    while (currentDate.isBefore(endOfEndDay)) {
                        // 中日韩语言需要添加“日”后缀
                        const needsDaySuffix = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const caption = needsDaySuffix
                            ? currentDate.locale(getDayjsLocale()).format('MMMM DD') + '日'
                            : currentDate.locale(getDayjsLocale()).format('MMMM DD');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.locale(getDayjsLocale()).format('dddd');
                        weekHeaders.value.push({
                            title: week,
                            width: 24 * scale.value,
                            fulldate: fullDate
                        });
                        dayHeaders.value.push({
                            title: caption,
                            width: 24 * scale.value,
                            fulldate: fullDate
                        });
                        for (let i = 0; i <= 23; i++) {
                            // 中日韩语言使用“点”，其他语言使用 :00 格式
                            const needsHourSuffix = ['zh-CN', 'ja-JP', 'ko-KR'].includes(locale.value);
                            hourHeaders.value.push({
                                title: needsHourSuffix ? i + '点' : `${i}:00`,
                                width: scale.value
                            });
                        }
                        // 优化代码：更新 currentDate
                        currentDate = currentDate.add(1, 'day');
                    }
                    timelineCellCount.value = hourHeaders.value.length;
                    break;
                }
            }
            // 选定日期后重新查询
            props.eventConfig.queryTask(selectedStartDate.value, selectedEndDate.value, mode.value);
        };

        const FindAllParent = (targetData: any[], pid: any) => {
            let parent = targetData.filter(obj => obj[mapFields.value['id']] === pid);
            if (parent && parent.length > 0) {
                result.value = parent[0].index + '.' + result.value;
                FindAllParent(targetData, parent[0][mapFields.value['parentId']]);
            }
        };

        const RecursionData = (id: any, tasks: any[], level: number) => {
            let findResult = tasks.filter(obj => obj[mapFields.value['parentId']] === id);
            if (findResult && findResult.length > 0) {
                level++;
                for (let i = 0; i < findResult.length; i++) {
                    findResult[i].treeLevel = level;
                    findResult[i].index = i + 1;

                    let parent = initData.value.filter(obj => obj[mapFields.value['id']] === findResult[i][mapFields.value['parentId']]);
                    result.value = '';
                    if (parent && parent.length > 0) {
                        result.value = parent[0].index + '.' + findResult[i].index;
                        FindAllParent(initData.value, parent[0][mapFields.value['parentId']]);
                        findResult[i].no = result.value;
                    } else {
                        findResult[i].no = i + 1 + '';
                    }
                    initData.value.push(findResult[i]);
                    RecursionData(findResult[i][mapFields.value['id']], tasks, level);
                }
            }
        };

        const timeMode = (_mode: string) => {
            // 更新按钮状态
            for (let i = 0; i < buttonClass.value.length; i++) {
                buttonClass.value[i] = 'button';
            }

            switch (_mode) {
                case '月': {
                    buttonClass.value[0] = 'button is-active';
                    break;
                }
                case '周': {
                    buttonClass.value[1] = 'button is-active';
                    break;
                }
                case '日': {
                    buttonClass.value[2] = 'button is-active';
                    break;
                }
                case '时': {
                    buttonClass.value[3] = 'button is-active';
                    break;
                }
            }
            
            // 先设置mode，触发响应式更新
            mode.value = _mode;
            
            // 等待DOM更新完成后再滚动
            nextTick(() => {
                const barContentEl = document.querySelector('.table .content') as HTMLElement;
                if (barContentEl) {
                    barContentEl.scrollLeft = 0;
                }
            });
        };

        const confirmStart = (value: ConfirmDateData) => {
            let days = dayjs(endDate.value).diff(dayjs(value.date), 'days')
            if (days < 0) {
                // 开始日期大于结束日期时，自动调整结束日期
                selectedEndDate.value = value.date
                endDate.value = value.date
            }
            showStartDatePicker.value = false
            selectedStartDate.value = value.date
            startDate.value = value.date
            // 结束日期不能早于开始日期
            minEndDate.value = value.date
        };

        const confirmEnd = (value: ConfirmDateData) => {
            let days = dayjs(value.date).diff(dayjs(startDate.value), 'days')
            if (days < 0) {
                // 结束日期小于开始日期时，自动调整开始日期
                selectedStartDate.value = dayjs(value.date).format('YYYY-MM-DD');
                startDate.value = dayjs(value.date).format('YYYY-MM-DD');
            }
            showEndDatePicker.value = false
            selectedEndDate.value = value.date
            endDate.value = value.date
        };

        // 监听 mode 和日期的变化
        watch([mode, selectedStartDate, selectedEndDate], ([newMode, newStartDate, newEndDate], [oldMode, oldStartDate, oldEndDate]) => {
            if (newMode !== oldMode || newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
                setTimeLineHeaders(newMode);
            }
        });
        
        // 监听语言变化，重新生成时间轴表头
        watch(locale, () => {
            setTimeLineHeaders(mode.value);
        });

        watch(rootTask, (newVal) => {            
            props.eventConfig.addRootTask(newVal);
        });

        watch(subTask, (newVal) => {
            props.eventConfig.addSubTask(newVal);
        });

        watch(removeTask, (newVal) => {
            props.eventConfig.removeTask(newVal);
        });

        watch(editTask, (newVal) => {
            props.eventConfig.editTask(newVal);
        });

        watch(allowChangeTaskDate, (newVal) => {
            props.eventConfig.allowChangeTaskDate(newVal);
        });

        // 优化：拆分watchEffect，避免不必要的触发
        watch(() => store.barDate, (barDate) => {
            if (barDate) {
                const { id, startDate, endDate } = barDate;
                if (id && startDate && endDate) {
                    props.eventConfig.barDate(id, startDate, endDate);
                }
            }
        });

        watch(scale, (newScale) => {
            mutations.setScale(newScale);
        });

        watch(() => props.dataConfig.taskHeaders, (newHeaders) => {
            mutations.setTaskHeaders(newHeaders);
        });

        watch([monthHeaders, dayHeaders, weekHeaders, hourHeaders], ([newMonth, newDay, newWeek, newHour]) => {
            mutations.setMonthHeaders(newMonth);
            mutations.setDayHeaders(newDay);
            mutations.setWeekHeaders(newWeek);
            mutations.setHourHeaders(newHour);
        });

        watch(mode, (newMode) => {
            mutations.setMode(newMode);
        });

        watch(mapFields, (newFields) => {
            if (newFields) {
                mutations.setMapFields(newFields);
            }
        });

        watch(() => props.dataConfig.queryStartDate, (newStartDate) => {
            if (newStartDate) {
                mutations.setStartGanttDate(dayjs(newStartDate).toDate());
                startGanttDate.value = newStartDate;
                selectedStartDate.value = newStartDate;
                startDate.value = newStartDate;
            }
        });

        watch(() => props.dataConfig.queryEndDate, (newEndDate) => {
            if (newEndDate) {
                mutations.setEndGanttDate(dayjs(newEndDate).toDate());
                endGanttDate.value = newEndDate;
                selectedEndDate.value = newEndDate;
                endDate.value = newEndDate;
            }
        });

        watch(timelineCellCount, (newCount) => {
            if (newCount) {
                mutations.setTimelineCellCount(newCount);
            }
        });

        onBeforeMount(() => {
            // 初始化时设置 startGanttDate 和 endGanttDate 到 Store
            mutations.setStartGanttDate(dayjs(startDate.value).toDate());
            mutations.setEndGanttDate(dayjs(endDate.value).toDate());
            
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
        });

        // 进度更新事件处理
        const handleProgressUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (props.eventConfig.updateProgress) {
                props.eventConfig.updateProgress(customEvent.detail);
            }
        };

        onMounted(() => {
            monthHeaders.value = [];
            weekHeaders.value = [];
            dayHeaders.value = [];
            hourHeaders.value = [];

            let level: number = 0;
            RecursionData('0', dataSource.value, level);
            mutations.setTasks(initData.value);
            nextTick(() => {
                mode.value = '月';
                mutations.setMode(mode.value);
                // 初始化时生成时间轴表头
                setTimeLineHeaders(mode.value);
            });
            
            // 监听进度更新事件
            window.addEventListener('taskProgressUpdate', handleProgressUpdate);
        });
        
        // 优化：监听dataSource变化，使用节流避免频繁更新
        let updateTimer: ReturnType<typeof setTimeout> | null = null;
        watch(dataSource, (newVal) => {
            if (newVal && newVal.length > 0) {
                // 使用节流，避免频繁更新
                if (updateTimer) {
                    clearTimeout(updateTimer);
                }
                updateTimer = setTimeout(() => {
                    initData.value = [];
                    let level: number = 0;
                    RecursionData('0', newVal, level);
                    mutations.setTasks(initData.value);
                    updateTimer = null;
                }, 100);
            } else if (newVal && newVal.length === 0) {
                // 如果数据为空，也要更新
                mutations.setTasks([]);
            }
        }, { immediate: false });

        onBeforeUnmount(() => {
            // 清理进度更新事件监听
            window.removeEventListener('taskProgressUpdate', handleProgressUpdate);
        });

        provide(Symbols.AddRootTaskSymbol, (row: Record<string, any>) => {
            return props.eventConfig.addRootTask(row);
        });

        // 设置Bar的颜色,传递到子组件
        provide(Symbols.SetBarColorSymbol, (row: Record<string, any>) => {
            return props.styleConfig.setBarColor(row);
        });
        
        // 设置任务类型判断函数（只有当用户提供了自定义函数时才 provide）
        if (props.styleConfig.setTaskType) {
            provide(Symbols.SetTaskTypeSymbol, props.styleConfig.setTaskType);
        }
        
        // 提供甘特图容器引用给主题选择器
        provide('ganttContainer', ganttContainer);

        // 监听依赖关系变化
        watch(() => props.dataConfig.dependencies, (newDependencies) => {
            if (newDependencies && newDependencies.length > 0) {
                // 清空现有依赖关系
                linkDataManager.clear();
                // 添加新的依赖关系
                newDependencies.forEach(dep => {
                    linkDataManager.addDependency(dep);
                });
            }
        }, { immediate: true });

        // 连线配置变化处理
        const onLinkConfigChange = (_config: any) => {
            // 这里可以添加额外的处理逻辑，比如通知其他组件更新
        };

        // 连线类型颜色（从配置中读取，用于图例显示）
        const linkTypeColors = computed(() => ({
            finishToStart: linkConfig.linkTypeColors?.finishToStart || '#3498db',
            startToStart: linkConfig.linkTypeColors?.startToStart || '#2ecc71',
            finishToFinish: linkConfig.linkTypeColors?.finishToFinish || '#e74c3c',
            startToFinish: linkConfig.linkTypeColors?.startToFinish || '#f39c12'
        }));

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
            onLinkConfigChange,
            ganttContainer,
            linkTypeColors,
            linkTypeVisibility,
            updateLinkVisibility
        };
    }
});
</script>

<style lang="scss" scoped>
$toolbarHeight: 70px;

.page {
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

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

                // 激活状态
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

            // 兼容旧的class名称
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

                input[type="checkbox"] {
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
            background: linear-gradient(135deg, 
                rgba(52, 152, 219, 0.1) 0%, 
                rgba(155, 89, 182, 0.1) 50%, 
                rgba(52, 152, 219, 0.1) 100%);
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
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 255, 255, 0.2), 
                    transparent);
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
            
            // 悬停效果
            &:hover {
                transform: translateY(-2px);
                background: linear-gradient(135deg, 
                    rgba(52, 152, 219, 0.2) 0%, 
                    rgba(155, 89, 182, 0.2) 50%, 
                    rgba(52, 152, 219, 0.2) 100%);
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
            
            // 激活状态
            &.active {
                background: linear-gradient(135deg, 
                    rgba(231, 76, 60, 0.15) 0%, 
                    rgba(192, 57, 43, 0.15) 50%, 
                    rgba(231, 76, 60, 0.15) 100%);
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
        
        // 动画定义
        @keyframes pulse {
            0%, 100% {
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
        height: calc(100% - #{$toolbarHeight});
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
}
</style>