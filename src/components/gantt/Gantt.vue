<template>
    <div class="page gantt-container" ref="ganttContainer">
        <div class="toolbar">
            <div class="dateInput">
                <DatePicker :date="startDate" :min-date="minStartDate" :max-date="maxStartDate"
                    @confirm="confirmStart" />
                <span style="margin-right:20px;margin-left:20px;color:#606266">至</span>
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
                        <div class="metro-text">月</div>
                    </div>
                </div>
                <div :class="buttonClass[1]" class="metro-btn" @click="timeMode('周')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                            </svg>
                        </div>
                        <div class="metro-text">周</div>
                    </div>
                </div>
                <div :class="buttonClass[2]" class="metro-btn" @click="timeMode('日')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"/>
                            </svg>
                        </div>
                        <div class="metro-text">日</div>
                    </div>
                </div>
                <div :class="buttonClass[3]" class="metro-btn" @click="timeMode('时')">
                    <div class="metro-content">
                        <div class="metro-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                        </div>
                        <div class="metro-text">时</div>
                    </div>
                </div>
            </div>
            <div class="config-buttons">
                <GanttThemeSelector />
                <button 
                    class="link-config-btn" 
                    @click="toggleLinkConfig"
                    :class="{ active: showLinkConfig }"
                    title="连线配置"
                >
                    <div class="btn-content">
                        <div class="btn-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                                <circle cx="4" cy="9" r="2"/>
                                <circle cx="20" cy="9" r="2"/>
                                <path d="M10 9h4"/>
                            </svg>
                        </div>
                        <span class="btn-text">连线配置</span>
                    </div>
                </button>
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
        
        <!-- 连线配置面板 -->
        <div v-if="showLinkConfig" class="config-panel-overlay" @click="toggleLinkConfig">
            <div class="config-panel-container" @click.stop>
                <LinkConfigPanel 
                    @close="toggleLinkConfig"
                    @configChange="onLinkConfigChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed, provide, onBeforeMount, onMounted, nextTick, watch } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { Symbols } from './Symbols';
// 导入日期选择器组件
import DatePicker from './DatePicker.vue';
// 导入分割面板组件
import SplitPane from './SplitPane.vue';
import TaskTable from '../gantt/task/TaskTable.vue';
import RightTable from './RightTable.vue';
import LinkConfigPanel from './LinkConfigPanel.vue';
import GanttThemeSelector from './GanttThemeSelector.vue';
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
            },
            required: true
        }
    },
    components: {
        DatePicker,
        SplitPane,
        TaskTable,
        RightTable,
        LinkConfigPanel,
        GanttThemeSelector
    },
    setup(props) {
        // 缓存 mapFields 的结果
        const mapFields = computed(() => props.dataConfig.mapFields);
        // 缓存 dataSource 的结果
        const dataSource = computed(() => props.dataConfig.dataSource);

        // 定义响应式数据
        const initData = ref<any[]>([]);
        const paneLengthPercent = ref(35);
        const buttonClass = ref(['button is-active', 'button', 'button', 'button']);
        const mode = ref('月');
        const startDate = ref(dayjs().locale('zh-cn').format('YYYY-MM-DD'));
        const minStartDate = ref(dayjs().locale('zh-cn').add(-5, 'y').format('YYYY-MM-DD'));
        const maxStartDate = ref(dayjs().locale('zh-cn').add(5, 'y').format('YYYY-MM-DD'));
        const showStartDatePicker = ref(false);
        const selectedStartDate = ref('点击选择日期');
        const endDate = ref(dayjs().locale('zh-cn').format('YYYY-MM-DD'));
        const minEndDate = ref(startDate.value);
        const maxEndDate = ref(dayjs(startDate.value).locale('zh-cn').add(5, 'y').format('YYYY-MM-DD'));
        const showEndDatePicker = ref(false);
        const selectedEndDate = ref('点击选择日期');
        const monthHeaders = ref<MonthHeaders[]>([]);
        const dayHeaders = ref<DayHeaders[]>([]);
        const weekHeaders = ref<WeekHeaders[]>([]);
        const hourHeaders = ref<HourHeaders[]>([]);
        const scale = ref(0);
        const timelineCellCount = ref(0);
        const startGanttDate = ref<string | null>(null);
        const endGanttDate = ref<string | null>(null);
        const result = ref('');
        
        // 连线配置相关状态
        const showLinkConfig = ref(false);
        
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
                            title: start.format('MMMM'),
                            width: days * scale.value
                        });
                    } else {
                        months.forEach((month, index) => {
                            if (index === 0) {
                                const endOfMonth = start.endOf('month').format('YYYY-MM-DD');
                                const days = dayjs(endOfMonth).diff(start, 'day') + 1;
                                monthHeaders.value.push({
                                    title: dayjs(month).format('MMMM'),
                                    width: days * scale.value
                                });
                            } else if (index === months.length - 1) {
                                const startOfMonth = end.startOf('month').format('YYYY-MM-DD');
                                const days = end.diff(dayjs(startOfMonth), 'day') + 1;
                                monthHeaders.value.push({
                                    title: dayjs(month).format('MMMM'),
                                    width: days * scale.value
                                });
                            } else {
                                const days = dayjs(month, 'YYYY-MM').daysInMonth();
                                monthHeaders.value.push({
                                    title: dayjs(month).format('MMMM'),
                                    width: days * scale.value
                                });
                            }
                        });
                    }

                    let currentDate = start;
                    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
                        const caption = currentDate.format('DD日');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.format('dddd');
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
                    
                    months.forEach((month, index) => {
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
                            monthHeaders.value.push({
                                title: monthStart.format('YYYY年MM月'),
                                width: weekCount * scale.value
                            });
                        }
                    });
                    
                    // 生成周表头（不生成日表头，周表头显示开始和结束日期）
                    while (currentDate.isBefore(endWeek) || currentDate.isSame(endWeek, 'week')) {
                        const weekStart = currentDate.startOf('isoWeek');
                        const weekEnd = currentDate.endOf('isoWeek');
                        
                        // 周表头 - 显示周数和日期范围
                        weekHeaders.value.push({
                            title: `第${currentDate.isoWeek()}周 (${weekStart.format('MM/DD')}-${weekEnd.format('MM/DD')})`,
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
                        const caption = currentDate.format('MMMM DD日');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.format('dddd');
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
                        const caption = currentDate.format('MMMM DD日');
                        const fullDate = currentDate.format('YYYY-MM-DD');
                        const week = currentDate.format('dddd');
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
                            hourHeaders.value.push({
                                title: i + '点',
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
                selectedEndDate.value = value.date
                endDate.value = value.date
            }
            showStartDatePicker.value = false
            selectedStartDate.value = value.date
            startDate.value = value.date
            minEndDate.value = value.date
        };

        const confirmEnd = (value: ConfirmDateData) => {
            let days = dayjs(value.date).diff(dayjs(startDate.value), 'days')
            if (days < 0) {
                selectedStartDate.value = dayjs(value.date).format('YYYY-MM-DD');
                startDate.value = dayjs(value.date).format('YYYY-MM-DD');
            }
            showEndDatePicker.value = false
            selectedEndDate.value = value.date
            endDate.value = value.date
            maxStartDate.value = value.date
        };

        // 监听 mode 和日期的变化
        watch([mode, selectedStartDate, selectedEndDate], ([newMode, newStartDate, newEndDate], [oldMode, oldStartDate, oldEndDate]) => {
            if (newMode !== oldMode || newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
                setTimeLineHeaders(newMode);
            }
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

        onMounted(() => {
            monthHeaders.value = [];
            weekHeaders.value = [];
            dayHeaders.value = [];
            hourHeaders.value = [];

            console.log('Gantt onMounted, dataSource:', dataSource.value);
            let level: number = 0;
            RecursionData('0', dataSource.value, level);
            mutations.setTasks(initData.value);
            console.log('initData after RecursionData:', initData.value);
            nextTick(() => {
                mode.value = '月';
                mutations.setMode(mode.value)
            });
        });
        
        // 优化：监听dataSource变化，使用节流避免频繁更新
        let updateTimer: ReturnType<typeof setTimeout> | null = null;
        watch(dataSource, (newVal) => {
            console.log('dataSource changed:', newVal);
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
                    console.log('Tasks updated:', initData.value);
                    updateTimer = null;
                }, 100);
            } else if (newVal && newVal.length === 0) {
                // 如果数据为空，也要更新
                mutations.setTasks([]);
            }
        }, { immediate: false });

        provide(Symbols.AddRootTaskSymbol, (row: Record<string, any>) => {
            return props.eventConfig.addRootTask(row);
        });

        // 设置Bar的颜色,传递到子组件
        provide(Symbols.SetBarColorSymbol, (row: Record<string, any>) => {
            return props.styleConfig.setBarColor(row);
        });
        
        // 提供甘特图容器引用给主题选择器
        provide('ganttContainer', ganttContainer);

        // 连线配置变化处理
        const onLinkConfigChange = (config: any) => {
            console.log('连线配置已更新:', config);
            // 这里可以添加额外的处理逻辑，比如通知其他组件更新
        };
        
        // 切换连线配置面板
        const toggleLinkConfig = () => {
            showLinkConfig.value = !showLinkConfig.value;
        };

        return {
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
            showLinkConfig,
            toggleLinkConfig,
            onLinkConfigChange,
            ganttContainer
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
            color: #00BCD4;
            font-size: 14px;
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