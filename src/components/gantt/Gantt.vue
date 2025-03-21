<template>
    <div class="page">
        <div class="toolbar">
            <div class="dateInput">
                <DatePicker :date="startDate" :min-date="minStartDate" :max-date="maxStartDate"
                    @confirm="confirmStart" />
                <span style="margin-right:20px;margin-left:20px;color:#606266">至</span>
                <DatePicker :date="endDate" :min-date="minEndDate" :max-date="maxEndDate" @confirm="confirmEnd" />
            </div>
            <div class="buttonGroup">
                <div :class="buttonClass[0]" style="border-radius:10px 0 0 10px;" @click="timeMode('月')">
                    <div class="text">月</div>
                </div>
                <div :class="buttonClass[1]" style="border-left:0;border-right:0" @click="timeMode('日')">
                    <div class="text">日</div>
                </div>
                <div :class="buttonClass[2]" style="border-radius:0 10px 10px 0;" @click="timeMode('时')">
                    <div class="text">时</div>
                </div>
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
import { ref, defineComponent, computed, provide, onBeforeMount, onMounted, nextTick, watchEffect, watch } from 'vue';
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
import { store, mutations } from './Store';
// 移除未使用的类型导入
import { type ConfirmDateData } from './ZodSchema';
import sharedState from './ShareState';
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
         * @type {{ dataSource: () => any[]; taskHeaders: () => any[]; mapFields: () => any }}
         * @required
         * @default { dataSource: () => [], taskHeaders: () => [], mapFields: () => {} }
         */
        dataConfig: {
            type: Object as () => {
                dataSource: () => any[];
                taskHeaders: () => any[];
                mapFields: () => Record<string, any>;
                queryStartDate: string;
                queryEndDate: string;
            },
            required: true,
            default: () => ({
                dataSource: () => [],
                taskHeaders: () => [],
                mapFields: () => { }
            }),
            validator: (value: { dataSource: () => any[]; taskHeaders: () => any[]; mapFields: () => any }) => {
                return typeof value.dataSource === 'function' &&
                    typeof value.taskHeaders === 'function' &&
                    typeof value.mapFields === 'function';
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
        RightTable
    },
    setup(props) {
        // 缓存 mapFields 的结果
        const mapFields = computed(() => props.dataConfig.mapFields());
        // 缓存 dataSource 的结果
        const dataSource = computed(() => props.dataConfig.dataSource());

        // 定义响应式数据
        const initData = ref<any[]>([]);
        const paneLengthPercent = ref(35);
        const buttonClass = ref(['button is-active', 'button', 'button']);
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
            // 假设 barContent 是一个 ref 对象
            const barContent = ref<HTMLElement | null>(null);

            nextTick(() => {
                if (barContent.value) {
                    barContent.value.scrollLeft = 0;
                }
            });

            for (let i = 0; i < buttonClass.value.length; i++) {
                buttonClass.value[i] = 'button';
            }

            switch (_mode) {
                case '月': {
                    buttonClass.value[0] = 'button is-active';
                    break;
                }
                case '日': {
                    buttonClass.value[1] = 'button is-active';
                    break;
                }
                case '时': {
                    buttonClass.value[2] = 'button is-active';
                    break;
                }
            }
            mode.value = _mode;
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

        watchEffect(() => {
            if (store.barDate) {
                const { id, startDate, endDate } = store.barDate;
                // 确保 id、startDate、endDate 有值
                if (id && startDate && endDate) {
                    props.eventConfig.barDate(id, startDate, endDate);
                }
            }

            mutations.setScale(scale.value);
            mutations.setTaskHeaders(props.dataConfig.taskHeaders());
            mutations.setMonthHeaders(monthHeaders.value);
            mutations.setDayHeaders(dayHeaders.value);
            mutations.setWeekHeaders(weekHeaders.value);
            mutations.setHourHeaders(hourHeaders.value);
            mutations.setMode(mode.value);

            // 调用 dataSource 函数来获取数据源
            if (dataSource.value) {
                mutations.setTasks(dataSource.value);
            }

            if (mapFields.value) {
                mutations.setMapFields(mapFields.value);
            }

            if (props.dataConfig.queryStartDate) {
                props.dataConfig.dataSource = () => [];
                mutations.setStartGanttDate(dayjs(props.dataConfig.queryStartDate).toDate());
                startGanttDate.value = props.dataConfig.queryStartDate;
                selectedStartDate.value = props.dataConfig.queryStartDate;
                startDate.value = props.dataConfig.queryStartDate;
            }

            if (props.dataConfig.queryEndDate) {
                props.dataConfig.dataSource = () => [];
                mutations.setEndGanttDate(dayjs(props.dataConfig.queryEndDate).toDate());
                endGanttDate.value = props.dataConfig.queryEndDate;
                selectedEndDate.value = props.dataConfig.queryEndDate;
                endDate.value = props.dataConfig.queryEndDate;
            }

            if (timelineCellCount.value) {
                mutations.setTimelineCellCount(timelineCellCount.value);
            }
            if (startGanttDate.value) {
                mutations.setStartGanttDate(dayjs(startGanttDate.value).toDate());
            }
            if (endGanttDate.value) {
                mutations.setEndGanttDate(dayjs(endGanttDate.value).toDate());
            }
            if (store.rootTask) {
                props.eventConfig.addRootTask(null);
                mutations.setRootTask(null);
            }
            if (store.subTask) {
                props.eventConfig.addSubTask(store.subTask);
                mutations.setSubTask(null);
            }
            if (store.editTask) {
                props.eventConfig.editTask(store.editTask);
                mutations.setEditTask(null);
            }
            if (store.removeTask) {
                props.eventConfig.removeTask(store.removeTask);
                mutations.setRemoveTask(null);
            }
            if (store.allowChangeTaskDate) {
                props.eventConfig.allowChangeTaskDate(store.allowChangeTaskDate);
                mutations.setAllowChangeTaskDate(null);
            }
        });

        onBeforeMount(() => {
            mutations.setMonthHeaders(monthHeaders.value)
            mutations.setWeekHeaders(weekHeaders.value)
            mutations.setDayHeaders(dayHeaders.value)
            mutations.setHourHeaders(hourHeaders.value)
            mutations.setTaskHeaders(props.dataConfig.taskHeaders())
            mutations.setTasks(dataSource.value)
            mutations.setMapFields(mapFields.value)
            mutations.setTimelineCellCount(timelineCellCount.value)
        });

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
                mutations.setMode(mode.value)
            });
        });

        provide(Symbols.AddRootTaskSymbol, (row: Record<string, any>) => {
            return props.eventConfig.addRootTask(row);
        });

        // 设置Bar的颜色,传递到子组件
        provide(Symbols.SetBarColorSymbol, (row: Record<string, any>) => {
            return props.styleConfig.setBarColor(row);
        });

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
            timeMode
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

            & .is-active:not(.text),
            & :active:not(.text) {
                background: #3a8ee6;
                border-color: #3a8ee6;
                color: #FFF;
            }

            & :hover:not(.text) {
                background: #66b1ff;
                border-color: #66b1ff;
                color: #FFF;
            }

            .button {
                width: 80px;
                font-size: 15px;
                height: calc($toolbarHeight / 1.5);
                border: 1px solid #dcdfe6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 500;
                cursor: pointer;
            }
        }
    }

    .gantt {
        height: calc(100% - #{$toolbarHeight});
        width: 100%;
    }
}
</style>