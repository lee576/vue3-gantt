<template>
    <div class="page gantt-container" ref="ganttContainer">
        <!-- Liquid Glass SVG 滤镜 - 仅在 liquidGlass 主题下渲染 -->
        <LiquidGlassFilter v-if="currentTheme === 'liquidGlass'" />
        <div class="toolbar">
            <div class="dateInput">
                <DatePicker :date="startDate" :min-date="minStartDate" :max-date="maxStartDate"
                    @confirm="confirmStart" />
                <span style="margin-right:20px;margin-left:20px;color:#606266">{{ t('common.to') }}</span>
                <DatePicker :date="endDate" :min-date="minEndDate" :max-date="maxEndDate" @confirm="confirmEnd" />
            </div>
            <div class="buttonGroup">
                <div :class="buttonClass[0]" class="metro-btn" @click="timeMode('季度')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.quarter') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[1]" class="metro-btn" @click="timeMode('月')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.month') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[2]" class="metro-btn" @click="timeMode('周')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                            </svg>
                        </div>
                        <div class="metro-text">{{ t('viewMode.week') }}</div>
                    </div>
                </div>
                <div :class="buttonClass[3]" class="metro-btn" @click="timeMode('日')" 
                     @mouseenter="showDaySubMenu = true" 
                     @mouseleave="handleDayButtonMouseLeave"
                     ref="dayButtonRef">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"/>
                            </svg>
                        </div>
                        <div class="metro-text">
                            {{ daySubMode === 'half' ? t('viewMode.halfDay') : t('viewMode.day') }}
                        </div>
                    </div>
                </div>
                <div :class="buttonClass[4]" class="metro-btn" @click="timeMode('时')"
                     @mouseenter="showHourSubMenu = true" 
                     @mouseleave="handleHourButtonMouseLeave"
                     ref="hourButtonRef">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                        </div>
                        <div class="metro-text">
                            {{ hourSubMode === '15' ? t('viewMode.15min') : hourSubMode === '30' ? t('viewMode.30min') : t('viewMode.hour') }}
                        </div>
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
                        <input type="checkbox" :checked="linkTypeVisibility.parentChild" @change="(e: Event) => updateLinkVisibility('parentChild', (e.target as HTMLInputElement).checked)" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" stroke="#95a5a6" stroke-width="1.5" stroke-dasharray="3,3"/>
                            <polygon points="24,6 18,3 18,9" fill="#95a5a6"/>
                        </svg>
                        <span class="legend-label">{{ t('link.pc') }}</span>
                        <span class="legend-desc">{{ t('link.parentChild') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.finishToStart }" title="完成-开始：前置任务完成后，后续任务才能开始">
                        <input type="checkbox" :checked="linkTypeVisibility.finishToStart" @change="(e: Event) => updateLinkVisibility('finishToStart', (e.target as HTMLInputElement).checked)" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.finishToStart" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToStart"/>
                        </svg>
                        <span class="legend-label">{{ t('link.fs') }}</span>
                        <span class="legend-desc">{{ t('link.finishToStart') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.startToStart }" title="开始-开始：两个任务同时开始">
                        <input type="checkbox" :checked="linkTypeVisibility.startToStart" @change="(e: Event) => updateLinkVisibility('startToStart', (e.target as HTMLInputElement).checked)" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.startToStart" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.startToStart"/>
                        </svg>
                        <span class="legend-label">{{ t('link.ss') }}</span>
                        <span class="legend-desc">{{ t('link.startToStart') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.finishToFinish }" title="完成-完成：两个任务同时完成">
                        <input type="checkbox" :checked="linkTypeVisibility.finishToFinish" @change="(e: Event) => updateLinkVisibility('finishToFinish', (e.target as HTMLInputElement).checked)" />
                        <svg width="24" height="12" viewBox="0 0 24 12">
                            <line x1="0" y1="6" x2="18" y2="6" :stroke="linkTypeColors.finishToFinish" stroke-width="2"/>
                            <polygon points="24,6 18,3 18,9" :fill="linkTypeColors.finishToFinish"/>
                        </svg>
                        <span class="legend-label">{{ t('link.ff') }}</span>
                        <span class="legend-desc">{{ t('link.finishToFinish') }}</span>
                    </label>
                    <label class="legend-item" :class="{ disabled: !linkTypeVisibility.startToFinish }" title="开始-完成：前置任务开始后，后续任务才能完成">
                        <input type="checkbox" :checked="linkTypeVisibility.startToFinish" @change="(e: Event) => updateLinkVisibility('startToFinish', (e.target as HTMLInputElement).checked)" />
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
        
        <!-- 日模式子模式选择菜单 - 使用 Teleport 传送到 body 避免被裁剪 -->
        <Teleport to="body">
            <div v-if="showDaySubMenu && mode === '日'" 
                 class="day-submenu-popup" 
                 ref="daySubMenuRef"
                 :style="daySubMenuPosition"
                 @mouseenter="showDaySubMenu = true"
                 @mouseleave="showDaySubMenu = false">
                <div class="submenu-item" 
                     :class="{ active: daySubMode === 'full' }"
                     @click="selectDaySubMode('full')">
                    {{ t('viewMode.fullDay') }}
                </div>
                <div class="submenu-item" 
                     :class="{ active: daySubMode === 'half' }"
                     @click="selectDaySubMode('half')">
                    {{ t('viewMode.halfDay') }}
                </div>
            </div>
        </Teleport>
        
        <!-- 时模式子模式选择菜单 -->
        <Teleport to="body">
            <div v-if="showHourSubMenu && mode === '时'" 
                 class="hour-submenu-popup" 
                 ref="hourSubMenuRef"
                 :style="hourSubMenuPosition"
                 @mouseenter="showHourSubMenu = true"
                 @mouseleave="showHourSubMenu = false">
                <div class="submenu-item" 
                     :class="{ active: hourSubMode === '60' }"
                     @click="selectHourSubMode('60')">
                    {{ t('viewMode.hour') }}
                </div>
                <div class="submenu-item" 
                     :class="{ active: hourSubMode === '30' }"
                     @click="selectHourSubMode('30')">
                    {{ t('viewMode.30min') }}
                </div>
                <div class="submenu-item" 
                     :class="{ active: hourSubMode === '15' }"
                     @click="selectHourSubMode('15')">
                    {{ t('viewMode.15min') }}
                </div>
            </div>
        </Teleport>
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
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/ru';
dayjs.extend(customParseFormat);
dayjs.extend(quarterOfYear);

import { Symbols } from '../state/Symbols';
import { linkDataManager, useLinkConfig } from '../composables/LinkConfig';
import { useI18n } from '../i18n';
// 导入日期选择器组件
import DatePicker from '../config/DatePicker.vue';
// 导入分割面板组件
import SplitPane from './SplitPane.vue';
import TaskTable from '../task/TaskTable.vue';
import RightTable from '../timeline/RightTable.vue';
import GanttConfigPanel from '../config/GanttConfigPanel.vue';
import LiquidGlassFilter from '../filters/LiquidGlassFilter.vue';
import { store, mutations } from '../state/Store';
export type { DataConfig, StyleConfig, EventConfig, TaskHeader } from '../types/Types';
// 移除未使用的类型导入
import { type ConfirmDateData } from '../types/ZodSchema';

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
    fulldate?: string;
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
                setTaskType?: (row: Record<string, any>) => import('../types/Types').TaskType;
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
                dependencies?: Omit<import('../types/Types').TaskDependency, 'id'>[];
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
                'zh-TW': 'zh-tw',
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

        // 直接使用全局配置的连线类型显示控制，保持响应式同步
        const linkTypeVisibility = computed(() => linkConfig.linkTypeVisibility || {
            finishToStart: true,
            startToStart: true,
            finishToFinish: true,
            startToFinish: true,
            parentChild: true
        });

        // 更新连线类型显示配置
        const updateLinkVisibility = (type: keyof typeof linkTypeVisibility.value, value: boolean) => {
            updateLinkConfig({
                linkTypeVisibility: { [type]: value } as any
            });
        };

        // 定义响应式数据
        const initData = ref<any[]>([]);
        const paneLengthPercent = ref(35);
        const buttonClass = ref(['button', 'button', 'button', 'button is-active', 'button']);
        const mode = ref('日');
        // 日模式的子模式：全天或半天
        const daySubMode = ref<'full' | 'half'>(store.daySubMode);
        // 时模式的子模式：60分钟、30分钟或15分钟
        const hourSubMode = ref<'60' | '30' | '15'>('60');
        // 日模式子菜单状态
        const showDaySubMenu = ref(false);
        // 时模式子菜单状态
        const showHourSubMenu = ref(false);
        const dayButtonRef = ref<HTMLElement | null>(null);
        const daySubMenuRef = ref<HTMLElement | null>(null);
        const hourButtonRef = ref<HTMLElement | null>(null);
        const hourSubMenuRef = ref<HTMLElement | null>(null);
        const daySubMenuTop = ref(0);
        const daySubMenuLeft = ref(0);
        const hourSubMenuTop = ref(0);
        const hourSubMenuLeft = ref(0);
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
                case '季度': {
                    scale.value = 200; // 每季度200像素
                    
                    // 收集所有季度
                    const quarters: dayjs.Dayjs[] = [];
                    let quarterCurrent = start.startOf('quarter');
                    const endQuarter = end.endOf('quarter');
                    while (quarterCurrent.isBefore(endQuarter) || quarterCurrent.isSame(endQuarter, 'quarter')) {
                        quarters.push(quarterCurrent);
                        quarterCurrent = quarterCurrent.add(1, 'quarter');
                    }
                    
                    // 生成年份表头（第一层）
                    const years = [...new Set(quarters.map(q => q.year()))];
                    years.forEach(year => {
                        const yearQuarters = quarters.filter(q => q.year() === year);
                        const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                        monthHeaders.value.push({
                            title: year + (isAsian ? '年' : ''),
                            width: yearQuarters.length * scale.value
                        });
                    });
                    
                    // 生成季度表头（第二层，最小单位）
                    quarters.forEach(q => {
                        const quarterNum = q.quarter();
                        const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const quarterTitle = isAsian ? `第${quarterNum}季度` : `Q${quarterNum}`;
                        dayHeaders.value.push({
                            title: quarterTitle,
                            width: scale.value,
                            fulldate: q.format('YYYY-MM-DD')
                        });
                    });
                    
                    // 单元格数量 = 季度数
                    timelineCellCount.value = quarters.length;
                    break;
                }
                case '月': {
                    scale.value = 120; // 与周模式保持一致
                    let currentDate = start.startOf('month'); // 从月初开始
                    const endMonth = end.endOf('month'); // 到月末结束
                    
                    // 生成年份表头
                    const years: number[] = [];
                    let yearCurrent = currentDate.startOf('year');
                    while (yearCurrent.isBefore(endMonth) || yearCurrent.isSame(endMonth, 'year')) {
                        years.push(yearCurrent.year());
                        yearCurrent = yearCurrent.add(1, 'year');
                    }
                    
                    years.forEach((year) => {
                        const yearStart = dayjs().year(year).startOf('year');
                        const yearEnd = yearStart.endOf('year');
                        
                        // 计算该年包含的月数
                        let monthCount = 0;
                        let monthCurrent = currentDate.clone();
                        while (monthCurrent.isBefore(endMonth) || monthCurrent.isSame(endMonth, 'month')) {
                            // 检查这个月是否属于当前年份
                            if (monthCurrent.year() === year) {
                                monthCount++;
                            }
                            monthCurrent = monthCurrent.add(1, 'month');
                        }
                        
                        if (monthCount > 0) {
                            // 根据语言选择年份格式
                            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                            const yearTitle = isAsian
                                ? year + '年'
                                : year.toString();
                            monthHeaders.value.push({
                                title: yearTitle,
                                width: monthCount * scale.value
                            });
                        }
                    });
                    
                    // 生成月份表头（显示月份名称）
                    currentDate = start.startOf('month'); // 重置
                    while (currentDate.isBefore(endMonth) || currentDate.isSame(endMonth, 'month')) {
                        // 月份表头
                        const monthTitle = currentDate.locale(getDayjsLocale()).format('MMM');
                        weekHeaders.value.push({
                            title: monthTitle,
                            width: scale.value,
                            fulldate: currentDate.format('YYYY-MM-DD')
                        });
                        
                        currentDate = currentDate.add(1, 'month');
                    }
                    
                    timelineCellCount.value = weekHeaders.value.length;
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
                            const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
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
                        const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
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
                    // 根据子模式调整scale和单元格大小
                    const isHalfDay = daySubMode.value === 'half';
                    scale.value = isHalfDay ? 40 : 80; // 半天模式使scale减半
                    let currentDate = start;
                                    
                    // 收集所有日期
                    const dates: dayjs.Dayjs[] = [];
                    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
                        dates.push(currentDate);
                        currentDate = currentDate.add(1, 'day');
                    }
                                    
                    // 生成年份表头
                    const years = [...new Set(dates.map(d => d.year()))];
                    years.forEach(year => {
                        const yearDates = dates.filter(d => d.year() === year);
                        const isAsian = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const cellWidth = isHalfDay ? yearDates.length * 2 * scale.value : yearDates.length * scale.value;
                        monthHeaders.value.push({
                            title: year + (isAsian ? '年' : ''),
                            width: cellWidth
                        });
                    });
                                    
                    // 生成月份表头
                    const months = new Map<string, dayjs.Dayjs[]>();
                    dates.forEach(d => {
                        const key = `${d.year()}-${d.month()}`;
                        if (!months.has(key)) months.set(key, []);
                        months.get(key)!.push(d);
                    });
                    months.forEach((monthDates, _key) => {
                        const monthTitle = monthDates[0].locale(getDayjsLocale()).format('MMM');
                        const cellWidth = isHalfDay ? monthDates.length * 2 * scale.value : monthDates.length * scale.value;
                        weekHeaders.value.push({
                            title: monthTitle,
                            width: cellWidth,
                            fulldate: monthDates[0].format('YYYY-MM-DD')
                        });
                    });
                                    
                    // 生成日期表头
                    if (isHalfDay) {
                        // 半天模式：四层表头 - 年/月/日(合并)/上午下午
                        dates.forEach(d => {
                            const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                            const dayStr = needsDaySuffix ? d.format('DD') + '日' : d.format('DD');
                            const fullDate = d.format('YYYY-MM-DD');
                            
                            // 第三层：日期（合并，宽度为2*scale）
                            dayHeaders.value.push({
                                title: dayStr,
                                width: scale.value * 2,
                                fulldate: fullDate
                            });
                            
                            // 第四层：上午/下午
                            const amLabel = locale.value === 'zh-CN' || locale.value === 'zh-TW' ? '上午' :
                                          locale.value === 'ja-JP' ? '午前' :
                                          locale.value === 'ko-KR' ? '오전' : 'AM';
                            const pmLabel = locale.value === 'zh-CN' || locale.value === 'zh-TW' ? '下午' :
                                          locale.value === 'ja-JP' ? '午後' :
                                          locale.value === 'ko-KR' ? '오후' : 'PM';
                            
                            hourHeaders.value.push({
                                title: amLabel,
                                width: scale.value,
                                fulldate: fullDate + '-AM'
                            });
                            hourHeaders.value.push({
                                title: pmLabel,
                                width: scale.value,
                                fulldate: fullDate + '-PM'
                            });
                        });
                        
                        timelineCellCount.value = dates.length * 2; // 半天模式下单元格数量是天数的2倍
                    } else {
                        // 全天模式：每天一个单元格
                        dates.forEach(d => {
                            const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                            const caption = needsDaySuffix
                                ? d.format('DD') + '日'
                                : d.format('DD');
                            const fullDate = d.format('YYYY-MM-DD');
                            dayHeaders.value.push({
                                title: caption,
                                width: scale.value,
                                fulldate: fullDate
                            });
                        });
                        
                        timelineCellCount.value = dayHeaders.value.length;
                    }
                    break;
                }
                case '时': {
                    // 根据子模式调整scale和分钟间隔
                    const minuteInterval = parseInt(hourSubMode.value); // 60, 30, 或 15
                    const intervalsPerHour = 60 / minuteInterval;
                    // 保持每个单元格有足够的宽度显示时间
                    // 60分钟: 30px, 30分钟: 40px, 15分钟: 50px
                    scale.value = minuteInterval === 60 ? 30 : minuteInterval === 30 ? 40 : 50;
                    let currentDate = start;
                    // 预先计算结束日期
                    const endOfEndDay = end.endOf('day');
                    while (currentDate.isBefore(endOfEndDay)) {
                        // 中日韩语言需要添加“日”后缀
                        const needsDaySuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                        const caption = needsDaySuffix
                            ? currentDate.locale(getDayjsLocale()).format('MMMM DD') + '日'
                            : currentDate.locale(getDayjsLocale()).format('MMMM DD');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.locale(getDayjsLocale()).format('dddd');
                        // 每天的总宽度 = 间隔数 * scale
                        const dayWidth = intervalsPerHour * 24 * scale.value;
                        
                        weekHeaders.value.push({
                            title: week,
                            width: dayWidth,
                            fulldate: fullDate
                        });
                        dayHeaders.value.push({
                            title: caption,
                            width: dayWidth,
                            fulldate: fullDate
                        });
                        // 生成时间间隔表头
                        for (let hour = 0; hour <= 23; hour++) {
                            for (let intervalIndex = 0; intervalIndex < intervalsPerHour; intervalIndex++) {
                                const minutes = intervalIndex * minuteInterval;
                                
                                // 根据子模式和语言生成标题
                                let title: string;
                            // 中日韩语言使用“点”，其他语言使用 :00 格式
                            const needsHourSuffix = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(locale.value);
                                
                                if (minuteInterval === 60) {
                                    // 60分钟模式：显示小时
                                    title = needsHourSuffix ? hour + '点' : `${hour}:00`;
                                } else {
                                    // 30分钟或15分钟模式：显示小时:分钟
                                    const minuteStr = minutes.toString().padStart(2, '0');
                                    title = `${hour}:${minuteStr}`;
                                }
                                
                            hourHeaders.value.push({
                                    title: title,
                                    width: scale.value,
                                    fulldate: `${fullDate} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
                            });
                            }
                        }
                        // 优化代码：更新 currentDate
                        currentDate = currentDate.add(1, 'day');
                    }
                    timelineCellCount.value = hourHeaders.value.length;
                    break;
                }
            }
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
                case '季度': {
                    buttonClass.value[0] = 'button is-active';
                    break;
                }
                case '月': {
                    buttonClass.value[1] = 'button is-active';
                    break;
                }
                case '周': {
                    buttonClass.value[2] = 'button is-active';
                    break;
                }
                case '日': {
                    buttonClass.value[3] = 'button is-active';
                    break;
                }
                case '时': {
                    buttonClass.value[4] = 'button is-active';
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

        // 日模式子模式切换处理
        const onDaySubModeChange = () => {
            // 更新 store 中的状态
            mutations.setDaySubMode(daySubMode.value);
            // 重新生成时间轴
            setTimeLineHeaders('日');
        };

        // 计算弹出菜单位置
        const daySubMenuPosition = computed(() => ({
            position: 'fixed' as const,
            top: `${daySubMenuTop.value}px`,
            left: `${daySubMenuLeft.value}px`,
            zIndex: 100002
        }));

        // 计算时模式弹出菜单位置
        const hourSubMenuPosition = computed(() => ({
            position: 'fixed' as const,
            top: `${hourSubMenuTop.value}px`,
            left: `${hourSubMenuLeft.value}px`,
            zIndex: 100002
        }));

        // 鼠标离开"日"按钮时的处理，延迟关闭菜单
        const handleDayButtonMouseLeave = () => {
            setTimeout(() => {
                if (!daySubMenuRef.value || !document.querySelector('.day-submenu-popup:hover')) {
                    showDaySubMenu.value = false;
                }
            }, 100);
        };

        // 鼠标离开"时"按钮时的处理，延迟关闭菜单
        const handleHourButtonMouseLeave = () => {
            setTimeout(() => {
                if (!hourSubMenuRef.value || !document.querySelector('.hour-submenu-popup:hover')) {
                    showHourSubMenu.value = false;
                }
            }, 100);
        };

        // 选择日模式子模式
        const selectDaySubMode = (subMode: 'full' | 'half') => {
            daySubMode.value = subMode;
            mutations.setDaySubMode(subMode);
            // 重新生成时间轴
            setTimeLineHeaders('日');
            // 关闭菜单
            showDaySubMenu.value = false;
        };

        // 选择时模式子模式
        const selectHourSubMode = (subMode: '60' | '30' | '15') => {
            hourSubMode.value = subMode;
            // 更新 store 中的状态
            mutations.setHourSubMode(subMode);
            // 重新生成时间轴
            setTimeLineHeaders('时');
            // 关闭菜单
            showHourSubMenu.value = false;
        };

        // 监听 showDaySubMenu 变化，计算弹出菜单位置
        watch(showDaySubMenu, (newVal) => {
            if (newVal && dayButtonRef.value) {
                const rect = dayButtonRef.value.getBoundingClientRect();
                daySubMenuTop.value = rect.bottom + 5;
                daySubMenuLeft.value = rect.left;
            }
        });

        // 监听 showHourSubMenu 变化，计算弹出菜单位置
        watch(showHourSubMenu, (newVal) => {
            if (newVal && hourButtonRef.value) {
                const rect = hourButtonRef.value.getBoundingClientRect();
                hourSubMenuTop.value = rect.bottom + 5;
                hourSubMenuLeft.value = rect.left;
            }
        });

        const confirmStart = (value: ConfirmDateData) => {
            let days = dayjs(endDate.value).diff(dayjs(value.date), 'days')
            if (days < 0) {
                // 开始日期大于结束日期时，自动调整结束日期
                selectedEndDate.value = value.date
                endDate.value = value.date
                mutations.setEndGanttDate(dayjs(value.date).toDate());
            }
            showStartDatePicker.value = false
            selectedStartDate.value = value.date
            startDate.value = value.date
            // 更新 Store 中的 startGanttDate
            mutations.setStartGanttDate(dayjs(value.date).toDate());
            // 结束日期不能早于开始日期
            minEndDate.value = value.date
        };

        const confirmEnd = (value: ConfirmDateData) => {
            let days = dayjs(value.date).diff(dayjs(startDate.value), 'days')
            if (days < 0) {
                // 结束日期小于开始日期时，自动调整开始日期
                selectedStartDate.value = dayjs(value.date).format('YYYY-MM-DD');
                startDate.value = dayjs(value.date).format('YYYY-MM-DD');
                mutations.setStartGanttDate(dayjs(value.date).toDate());
            }
            showEndDatePicker.value = false
            selectedEndDate.value = value.date
            endDate.value = value.date
            // 更新 Store 中的 endGanttDate
            mutations.setEndGanttDate(dayjs(value.date).toDate());
        };

        // 监听 mode 和日期的变化
        watch([mode, selectedStartDate, selectedEndDate], ([newMode, newStartDate, newEndDate], [oldMode, oldStartDate, oldEndDate]) => {
            if (newMode !== oldMode || newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
                setTimeLineHeaders(newMode);
                // 只在日期范围变化时调用 queryTask，模式变化不触发
                if (newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
                    props.eventConfig.queryTask(selectedStartDate.value, selectedEndDate.value, mode.value);
                }
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
                // mode.value 已在初始化时设置为 '日'，不再在这里覆盖
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
        
        // 提供当前主题状态
        const currentTheme = ref('metro');
        // 从 localStorage 加载保存的主题
        try {
            const savedTheme = localStorage.getItem('gantt-theme');
            if (savedTheme) {
                currentTheme.value = savedTheme;
            }
        } catch (error) {
            console.warn('Failed to load theme from localStorage:', error);
        }
        provide('currentTheme', currentTheme);

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
            updateLinkVisibility
        };
    }
});
</script>

<style lang="scss" scoped>
$toolbarHeight: 70px;

.page {
    height: 100%;
    min-height: 0; /* 允许 flex 子元素收缩 */
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
        flex: 1; /* 使用 flex 自动填充剩余空间 */
        min-height: 0; /* 允许内容收缩 */
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

<!-- 非 scoped 样式 - 用于 Teleport 到 body 的弹出菜单 -->
<style lang="scss">
/* 日模式子模式弹出菜单样式 */
.day-submenu-popup {
    position: fixed;
    background: var(--bg-content, #ffffff);
    border: 1px solid var(--border, #d0d0d0);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 
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
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 
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
[data-gantt-theme="liquidGlass"] {
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
  --edge-highlight: inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(255, 255, 255, 0.2);
  --edge-highlight-strong: inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(255, 255, 255, 0.3);
  
  /* 彩虹色散边框 */
  --prismatic-border: linear-gradient(135deg, 
    rgba(255, 120, 120, 0.3) 0%, 
    rgba(255, 200, 120, 0.3) 20%,
    rgba(200, 255, 120, 0.3) 40%,
    rgba(120, 255, 200, 0.3) 60%,
    rgba(120, 200, 255, 0.3) 80%,
    rgba(200, 120, 255, 0.3) 100%
  );
  
  /* iOS 系统色 */
  --ios-blue: #007AFF;
  --ios-blue-dark: #0051D5;
  --ios-gray-1: #8E8E93;
  --ios-gray-2: #AEAEB2;
  --ios-gray-3: #C7C7CC;
  --ios-gray-4: #D1D1D6;
  --ios-gray-5: #E5E5EA;
  --ios-gray-6: #F2F2F7;
  
  /* 背景 - 柔和渐变 */
  background: linear-gradient(180deg, 
    #E8F0F8 0%, 
    #F0F4F8 30%,
    #F8FAFC 70%,
    #FFFFFF 100%
  );
  background-attachment: fixed;
}

/* ============================================= */
/* 通用玻璃效果基类 */
/* ============================================= */

/* 玻璃面板基础样式 */
[data-gantt-theme="liquidGlass"] .glass-panel {
  background: rgba(255, 255, 255, var(--glass-opacity));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation)) brightness(var(--glass-brightness));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation)) brightness(var(--glass-brightness));
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: var(--shadow-elevation-2), var(--edge-highlight);
  position: relative;
  overflow: hidden;
}

/* 玻璃面板顶部高光层 */
[data-gantt-theme="liquidGlass"] .glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.5) 0%, 
    rgba(255, 255, 255, 0.1) 60%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 24px 24px 0 0;
}

/* 玻璃面板边缘色散效果 */
[data-gantt-theme="liquidGlass"] .glass-panel::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: var(--prismatic-border);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

/* ============================================= */
/* 工具栏 - iOS 26 胶囊玻璃效果 */
/* ============================================= */

[data-gantt-theme="liquidGlass"] .toolbar {
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
[data-gantt-theme="liquidGlass"] .toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(180deg, 
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

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup {
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
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 50% !important;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 100%
  ) !important;
  pointer-events: none !important;
  border-radius: 14px 14px 0 0 !important;
  z-index: 0 !important;
}

/* 单个按钮 - iOS 分段控件样式 */
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn {
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
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn::before,
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn::after {
  display: none !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn .metro-content {
  position: relative !important;
  z-index: 3 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn .metro-text {
  color: rgba(0, 0, 0, 0.5) !important;
  font-weight: 500 !important;
  font-size: 11px !important;
  letter-spacing: -0.08px !important;
  transition: all 0.25s ease !important;
  text-transform: none !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn .metro-icon {
  color: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s ease !important;
}

/* 按钮悬浮 - 轻微高亮 */
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn:hover:not(.is-active):not(.button.is-active) {
  background: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn:hover:not(.is-active):not(.button.is-active) .metro-text {
  color: rgba(0, 0, 0, 0.7) !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn:hover:not(.is-active):not(.button.is-active) .metro-icon {
  color: rgba(0, 0, 0, 0.6) !important;
}

/* 按钮激活状态 - iOS 白色玻璃胶囊 */
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.is-active,
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.button.is-active {
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

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.is-active .metro-text,
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.button.is-active .metro-text {
  color: #1d1d1f !important;
  font-weight: 600 !important;
}

[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.is-active .metro-icon,
[data-gantt-theme="liquidGlass"] .toolbar .buttonGroup .metro-btn.button.is-active .metro-icon {
  color: var(--ios-blue, #007AFF) !important;
}

/* 兼容性选择器 - 仅在 liquidGlass 主题下生效 */
[data-gantt-theme="liquidGlass"] .buttonGroup {
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

[data-gantt-theme="liquidGlass"] .buttonGroup::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 50% !important;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 100%
  ) !important;
  pointer-events: none !important;
  border-radius: 14px 14px 0 0 !important;
  z-index: 0 !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn {
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

[data-gantt-theme="liquidGlass"] .metro-btn::before,
[data-gantt-theme="liquidGlass"] .metro-btn::after {
  display: none !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn .metro-content {
  position: relative !important;
  z-index: 3 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn .metro-text {
  color: rgba(0, 0, 0, 0.5) !important;
  font-weight: 500 !important;
  font-size: 11px !important;
  letter-spacing: -0.08px !important;
  transition: all 0.25s ease !important;
  text-transform: none !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn .metro-icon {
  color: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s ease !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn:hover:not(.is-active):not(.button.is-active) {
  background: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn:hover:not(.is-active):not(.button.is-active) .metro-text {
  color: rgba(0, 0, 0, 0.7) !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn:hover:not(.is-active):not(.button.is-active) .metro-icon {
  color: rgba(0, 0, 0, 0.6) !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn.is-active,
[data-gantt-theme="liquidGlass"] .metro-btn.button.is-active {
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

[data-gantt-theme="liquidGlass"] .metro-btn.is-active .metro-text,
[data-gantt-theme="liquidGlass"] .metro-btn.button.is-active .metro-text {
  color: #1d1d1f !important;
  font-weight: 600 !important;
}

[data-gantt-theme="liquidGlass"] .metro-btn.is-active .metro-icon,
[data-gantt-theme="liquidGlass"] .metro-btn.button.is-active .metro-icon {
  color: var(--ios-blue, #007AFF) !important;
}

/* ============================================= */
/* 表格区域 - 深度玻璃效果 */
/* 只影响左侧任务表格，不影响右侧时间线表格 */
/* ============================================= */

[data-gantt-theme="liquidGlass"] .gantt .pane-one .table {
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
[data-gantt-theme="liquidGlass"] .gantt .pane-two .table {
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
[data-gantt-theme="liquidGlass"] .gantt .pane-one .table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.6) 0%, 
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 20px 20px 0 0;
}

/* 右侧表格的轻微高光 */
[data-gantt-theme="liquidGlass"] .gantt .pane-two .table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.4) 0%, 
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 16px 16px 0 0;
}

/* 表头 - 毛玻璃效果 */
[data-gantt-theme="liquidGlass"] .table .header {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(30px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(150%) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  position: relative;
  z-index: 2;
}

/* 表头单元格 */
[data-gantt-theme="liquidGlass"] .headerCaption {
  background: transparent !important;
  color: #1d1d1f !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.08px !important;
  border-right: 1px solid rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s ease !important;
}

[data-gantt-theme="liquidGlass"] .headerCaption:hover {
  background: rgba(0, 122, 255, 0.06) !important;
  color: var(--ios-blue) !important;
}


</style>