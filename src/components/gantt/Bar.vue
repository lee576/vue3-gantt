<template>
    <!-- 如果 showRow 为 true，则渲染 barRow 容器 -->
    <div v-if='showRow' class="barRow" :style="{ height: rowHeight + 'px' }" @mouseover="hoverActive()"
        @mouseleave="hoverInactive()" :class="{ active: hover }" :data-task-id="row[mapFields.id]">
        <!-- 如果 showRow 为 true，则渲染 SVG 元素 -->
        <svg key="row.no" v-if='showRow' ref='bar' class="bar" :height="barHeight + 'px'"
            :class="{ active: hover }"></svg>
        <!-- 循环渲染时间轴单元格 -->
        <template v-for='(count) in timelineCellCount'
            :key="count + row.id + timelineCellCount + showRow + '_template'">
            <!-- 每个单元格的样式设置 -->
            <div class="cell"
                :style="{ width: scale + 'px', minWidth: scale + 'px', maxWidth: scale + 'px', height: rowHeight + 'px', background: WeekEndColor(count) }">
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed, onMounted, onDeactivated, onBeforeUnmount, inject } from 'vue';
import SVG from 'svg.js';
import interact from 'interactjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
// 扩展 dayjs 功能，使其支持 ISO 周
dayjs.extend(isoWeek);
import { store, mutations } from './Store';
import sharedState from '../gantt/ShareState';
import { Symbols } from './Symbols';

export default defineComponent({
    name: 'Bar',
    props: {
        rowHeight: {
            type: Number as () => number,
            default: 0
        },
        row: {
            type: Object as () => Record<string, any>,
            default: () => ({})
        },
        startGanttDate: {
            type: String as () => string
        },
        endGanttDate: {
            type: String as () => string
        }
    },
    setup(props) {
        // 引用 SVG 元素
        const bar = ref<SVGSVGElement | null>(null);
        // 条形图的高度，为行高的 70%
        const barHeight = ref(props.rowHeight * 0.7);
        // 拖动或调整大小的方向
        const direction = ref<string | null>(null);
        // 旧的条形图 X 坐标
        const oldBarDataX = ref(0);
        // 旧的条形图宽度
        const oldBarWidth = ref(0);
        // 是否显示行
        const showRow = ref(true);
        // 是否处于悬停状态
        const hover = ref(false);
        // 条形图的颜色
        const barColor = ref('');
        // 新增一个标志变量，用于记录元素是否已经设置了交互
        const isBarInteracted = ref(false);
        // 主题变化触发器
        const themeVersion = ref(0);

        // 计算时间轴单元格的数量
        const timelineCellCount = computed(() => store.timelineCellCount);
        // 计算每个单元格的宽度
        const scale = computed(() => store.scale);
        // 计算甘特图的模式（月、日、时）
        const mode = computed(() => store.mode);
        // 计算映射字段
        const mapFields = computed(() => store.mapFields);
        // 百分比显示文本 - 修复：格式化为xx.xx%
        const progress = computed(() => {
            const progressValue = Number(props.row[mapFields.value.progress]);
            if (isNaN(progressValue)) return '0.00%';
            return (progressValue * 100).toFixed(2) + '%';
        });

        const setBarColor = inject(Symbols.SetBarColorSymbol) as ((row: any) => string) | undefined;

        watch(() => sharedState.highlightedId, (newId) => {
            if (props.row[mapFields.value['id']] === newId) {
                hover.value = true;
            } else {
                hover.value = false;
            }
        });

        const hoverActive = () => {
            sharedState.triggerHighlight(props.row[mapFields.value.id] as number | null);
        };

        const hoverInactive = () => {
            sharedState.triggerHighlight(null);
        };

        /**
         * 根据日期计算单元格的背景颜色
         * 
         * @param {number} count - 日期的偏移量
         * @returns {string | undefined} - 背景颜色
         */
        const WeekEndColor = (count: number) => {
            // 触发响应式更新（通过访问themeVersion）
            themeVersion.value;
            
            // 从甘特图容器读取主题颜色
            let bgContent = '#ffffff';
            let bgSecondary = '#f8f8f8';
            if (bar.value) {
                // 向上查找带有 data-gantt-theme 属性的容器
                let element = bar.value.parentElement;
                while (element) {
                    if (element.hasAttribute('data-gantt-theme')) {
                        bgContent = getComputedStyle(element).getPropertyValue('--bg-content').trim() || '#ffffff';
                        bgSecondary = getComputedStyle(element).getPropertyValue('--bg-secondary').trim() || '#f8f8f8';
                        break;
                    }
                    element = element.parentElement;
                }
            }
            
            switch (mode.value) {
                case '月':
                case '日': {
                    // 计算当前日期
                    let currentDate = dayjs(props.startGanttDate).add(count, 'days');
                    // 如果是周六或周日，返回主题的次要背景色（与主题协调）
                    if (currentDate.isoWeekday() === 7 || currentDate.isoWeekday() === 1) {
                        return bgSecondary;
                    }
                    // 非周末返回主题的内容背景色
                    return bgContent;
                }
                case '周': {
                    // 周模式下，返回主题的内容背景色
                    return bgContent;
                }
                case '时': {
                    // 时模式下，返回主题的内容背景色
                    return bgContent;
                }
            }
        };
        
        // 监听DOM变化以检测主题切换
        onMounted(() => {
            if (bar.value) {
                // 向上查找甘特图容器
                let ganttContainer = bar.value.parentElement;
                while (ganttContainer && !ganttContainer.hasAttribute('data-gantt-theme')) {
                    ganttContainer = ganttContainer.parentElement;
                }
                
                if (ganttContainer) {
                    // 使用MutationObserver监听主题属性变化
                    const observer = new MutationObserver(() => {
                        themeVersion.value++;
                    });
                    
                    observer.observe(ganttContainer, {
                        attributes: true,
                        attributeFilter: ['data-gantt-theme', 'style']
                    });
                    
                    // 组件卸载时断开观察
                    onBeforeUnmount(() => {
                        observer.disconnect();
                    });
                }
            }
        });

        // 从 mutations 中获取设置条形图日期的函数
        const setBarDate = mutations.setBarDate;
        // 从 mutations 中获取设置是否允许更改任务日期的函数
        const setAllowChangeTaskDate = mutations.setAllowChangeTaskDate;

        const drowBar = (barElement: SVGSVGElement) => {
            // 优化：不清空SVG内容，复用已有元素
            let dataX = 0;
            // 根据甘特图的模式计算条形图的位置和宽度
            switch (mode.value) {
                case '月':
                case '日': {
                    // 计算从计划开始日期到条形图开始日期的天数
                    let fromPlanStartDays = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days');
                    dataX = scale.value * fromPlanStartDays;
                    // 计算条形图的持续天数
                    let spendDays = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'days') + 1;
                    oldBarWidth.value = spendDays * scale.value;
                    // 更新任务的耗时信息
                    props.row[mapFields.value.takestime] = spendDays + '天';
                    break;
                }
                case '周': {
                    // 计算从计划开始日期到条形图开始日期的周数
                    const startGanttWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                    const taskStartWeek = dayjs(props.row[mapFields.value.startdate]).startOf('isoWeek');
                    let fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week');
                    dataX = scale.value * fromPlanStartWeeks;
                    
                    // 计算条形图的持续周数
                    const taskEndWeek = dayjs(props.row[mapFields.value.enddate]).startOf('isoWeek');
                    let spendWeeks = taskEndWeek.diff(taskStartWeek, 'week') + 1;
                    oldBarWidth.value = spendWeeks * scale.value;
                    
                    // 更新任务的耗时信息
                    props.row[mapFields.value.takestime] = spendWeeks + '周';
                    break;
                }
                case '时': {
                    // 计算从计划开始日期到条形图开始日期的小时数
                    let fromPlanStartHours = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours');
                    dataX = scale.value * fromPlanStartHours;
                    // 计算条形图的持续小时数
                    let spendHours = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'hours') + 1;
                    oldBarWidth.value = spendHours * scale.value;
                    // 更新任务的耗时信息
                    props.row[mapFields.value.takestime] = spendHours + '小时';
                    break;
                }
            }
            oldBarDataX.value = dataX;
            // 将 SVGSVGElement 转换为 HTMLElement
            let svg = SVG(barElement as unknown as HTMLElement);
            // 设置 SVG 元素的属性
            const borderColor = getComputedStyle(barElement).getPropertyValue('--border') || '#cecece';
            barElement.setAttribute('data-x', dataX.toString());
            barElement.setAttribute('width', oldBarWidth.value.toString());
            barElement.setAttribute('stroke', borderColor);
            barElement.setAttribute('stroke-width', '1px');
            barElement.style.transform = `translate(${dataX}px, 0px)`;

            // 查找现有的元素
            let p = svg.select('pattern').first();
            let g = (svg.children().filter((child) => child.type === 'g')[0] as any) || svg.group();
            let innerRect = svg.select('.innerRect').first();
            let outerRect = svg.select('rect:not(.innerRect)').first();
            let text = svg.select('text').first();

            // 创建 SVG 图案
            if (!p) {
                p = svg.pattern(10, 10, (add) => {
                    (add as any).path('M10 -5 -10,15M15,0,0,15M0 -5 -20,15')
                        .fill('none')
                        .stroke({ color: 'gray', opacity: 0.4, width: 5 });
                });
            }

            // 创建 SVG 组
            if (!g) {
                g = svg.group();
            }

            let innerRectWidth: number = 0;
            if (props.row[mapFields.value.progress]) {
                innerRectWidth = Number(oldBarWidth.value) * Number(props.row[mapFields.value.progress]);
            } else {
                innerRectWidth = Number(oldBarWidth.value);
            }
            if (!innerRect) {
                innerRect = svg.rect(innerRectWidth, barHeight.value).radius(10);
                innerRect.addClass('innerRect');
                g.add(innerRect);
            } else {
                innerRect.fill({ color: barColor.value, opacity: 0.4 });
                innerRect.width(innerRectWidth);
            }
            // 性能优化避免重绘
            if (!outerRect) {
                const borderColor = getComputedStyle(barElement).getPropertyValue('--border') || '#cecece';
                outerRect = svg.rect(oldBarWidth.value, barHeight.value).radius(10).fill(p).stroke({ color: borderColor, width: 1 });
                // 外部矩形的鼠标悬停事件处理
                outerRect.on('mouseover', () => {
                    outerRect.animate(200).attr({
                        stroke: '#000',
                        strokeWidth: 2,
                        opacity: 1
                    });
                });
                // 外部矩形的鼠标离开事件处理
                outerRect.on('mouseleave', () => {
                    outerRect.animate(200).attr({
                        stroke: '#0066ff',
                        strokeWidth: 10,
                        opacity: 0.4,
                    });
                });
            } else {
                outerRect.width(oldBarWidth.value);
            }
            // 性能优化避免重绘，但要更新文本内容
            if (!text) {
                text = svg.text(progress.value).stroke('#faf7ec');
            } else {
                // 更新文本内容
                (text as any).text(progress.value);
            }
            const textBBox = text.bbox();
            // 设置文本元素的字体样式
            (text as any).font({
                size: 15,
                anchor: 'middle',
                leading: '1em'
            })
                .fill('#000')
                .attr('opacity', 1)
                .attr('dominant-baseline', 'middle')
                .center(innerRect.width() / 2 + textBBox.width / 2, innerRect.height() / 2);

            // 设置条形图的日期
            setBarDate({
                id: props.row[mapFields.value.id],
                startDate: props.row[mapFields.value.startdate],
                endDate: props.row[mapFields.value.enddate]
            });

            // 使 SVG 元素可拖动
            interact(barElement).draggable({
                inertia: false,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    start: (event: { target: SVGSVGElement }) => {
                        // 记录拖动开始时的 X 坐标和宽度
                        oldBarDataX.value = Number(event.target.getAttribute('data-x'));
                        oldBarWidth.value = event.target.width.baseVal.value;
                    },
                    move: (event: { target: SVGSVGElement; dx: number; rect: { width: number; height: number } }) => {
                        let { x } = event.target.dataset;
                        // 计算新的 X 坐标
                        x = ((parseFloat(event.target.getAttribute('data-x') || '0') || 0) + event.dx).toString();
                        // 更新 SVG 元素的样式
                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            transform: `translate(${x}px, 0px)`
                        });
                        if (typeof x !== 'undefined') {
                            // 更新 SVG 元素的 data-x 属性
                            event.target.setAttribute('data-x', x);
                        }
                        // 更新 SVG 元素的 data-y 属性
                        event.target.setAttribute('data-y', '0');
                    },
                    end: (event: { target: SVGSVGElement; dx: number; rect: { width: number } }) => {
                        let target = event.target;
                        // 获取当前的 data-x（已经在 move 中累加了 dx）
                        let currentX = parseFloat(target.getAttribute('data-x') || '0') || 0;
                        // 对齐到网格
                        let multiple = Math.round(currentX / scale.value);
                        let alignedX = multiple * scale.value;
                        if (alignedX < 0) {
                            alignedX = 0;
                        }
                        if (alignedX > timelineCellCount.value * scale.value) {
                            alignedX = timelineCellCount.value * scale.value;
                        }
                        
                        // 检查是否有父任务，如果有则限制开始时间不能早于父任务
                        const parentIdField = mapFields.value.parentId || 'pid';
                        const currentParentId = props.row[parentIdField];
                        if (currentParentId && currentParentId !== '0') {
                            // 查找父任务
                            const parentTask = store.tasks.find(t => String(t[mapFields.value.id]) === String(currentParentId));
                            if (parentTask) {
                                // 计算父任务开始时间对应的 X 坐标
                                let parentStartX = 0;
                                if (mode.value === '月' || mode.value === '日') {
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days') * scale.value;
                                } else if (mode.value === '周') {
                                    const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                                    const parentStartWeek = dayjs(parentTask[mapFields.value.startdate]).startOf('isoWeek');
                                    parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * scale.value;
                                } else if (mode.value === '时') {
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours') * scale.value;
                                }
                                // 限制子任务不能早于父任务
                                if (alignedX < parentStartX) {
                                    alignedX = parentStartX;
                                }
                            }
                        }
                        
                        // 更新 SVG 元素的位置
                        target.style.transform = `translate(${alignedX}px, 0px)`;
                        // 更新 SVG 元素的 data-x 属性
                        target.setAttribute('data-x', alignedX.toString());
                        
                        // 计算实际移动的单元格数量
                        const cellsMoved = Math.round((alignedX - oldBarDataX.value) / scale.value);
                        
                        // 根据模式计算日期偏移
                        let daysOffset = 0;
                        let hoursOffset = 0;
                        if (mode.value === '月' || mode.value === '日') {
                            daysOffset = cellsMoved; // 每个单元格代表1天
                        } else if (mode.value === '周') {
                            daysOffset = cellsMoved * 7; // 每个单元格代表1周
                        } else if (mode.value === '时') {
                            hoursOffset = cellsMoved;
                        }
                        
                        // 更新任务的开始日期和结束日期
                        if (mode.value === '时') {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate])
                                .add(hoursOffset, 'hours')
                                .format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate])
                                .add(hoursOffset, 'hours')
                                .format('YYYY-MM-DD HH:mm:ss');
                            const spendHours = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'hours') + 1;
                            props.row[mapFields.value.takestime] = spendHours + '小时';
                        } else {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate])
                                .add(daysOffset, 'days')
                                .format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate])
                                .add(daysOffset, 'days')
                                .format('YYYY-MM-DD HH:mm:ss');
                            
                            if (mode.value === '月' || mode.value === '日') {
                                const spendDays = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'days') + 1;
                                props.row[mapFields.value.takestime] = spendDays + '天';
                            } else if (mode.value === '周') {
                                const startWeek = dayjs(props.row[mapFields.value.startdate]).startOf('isoWeek');
                                const endWeek = dayjs(props.row[mapFields.value.enddate]).startOf('isoWeek');
                                props.row[mapFields.value.takestime] = endWeek.diff(startWeek, 'week') + 1 + '周';
                            }
                        }
                        
                        // 获取新的任务开始日期
                        const newParentStartDate = dayjs(props.row[mapFields.value.startdate]);
                        
                        // 联动更新子任务：如果子任务开始时间早于当前任务新开始时间，则同步移动
                        const currentTaskId = props.row[mapFields.value.id];
                        const parentIdFieldForChildren = mapFields.value.parentId || 'pid';
                        
                        // 递归获取所有子任务
                        const getAllChildren = (parentId: any, tasks: any[]): any[] => {
                            const children: any[] = [];
                            for (const task of tasks) {
                                if (String(task[parentIdFieldForChildren]) === String(parentId)) {
                                    children.push(task);
                                    // 递归获取子任务的子任务
                                    children.push(...getAllChildren(task[mapFields.value.id], tasks));
                                }
                            }
                            return children;
                        };
                        
                        // 获取所有子任务
                        const childTasks = getAllChildren(currentTaskId, store.tasks);
                        
                        // 更新需要联动的子任务
                        // 只有当父任务向右移动（daysOffset > 0 或 hoursOffset > 0）时才需要检查
                        const actualOffset = mode.value === '时' ? hoursOffset : daysOffset;
                        if (actualOffset > 0) {
                            for (const child of childTasks) {
                                const childStartDate = dayjs(child[mapFields.value.startdate]);
                                
                                // 如果子任务开始时间早于父任务新开始时间，需要同步移动
                                if (childStartDate.isBefore(newParentStartDate)) {
                                    // 子任务也移动相同的偏移量
                                    if (mode.value === '时') {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate])
                                            .add(hoursOffset, 'hours')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate])
                                            .add(hoursOffset, 'hours')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        const spendHours = dayjs(child[mapFields.value.enddate]).diff(dayjs(child[mapFields.value.startdate]), 'hours') + 1;
                                        child[mapFields.value.takestime] = spendHours + '小时';
                                    } else {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate])
                                            .add(daysOffset, 'days')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate])
                                            .add(daysOffset, 'days')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        
                                        if (mode.value === '月' || mode.value === '日') {
                                            const spendDays = dayjs(child[mapFields.value.enddate]).diff(dayjs(child[mapFields.value.startdate]), 'days') + 1;
                                            child[mapFields.value.takestime] = spendDays + '天';
                                        } else if (mode.value === '周') {
                                            const startWeek = dayjs(child[mapFields.value.startdate]).startOf('isoWeek');
                                            const endWeek = dayjs(child[mapFields.value.enddate]).startOf('isoWeek');
                                            child[mapFields.value.takestime] = endWeek.diff(startWeek, 'week') + 1 + '周';
                                        }
                                    }
                                    
                                    // 通知子任务日期变化
                                    setBarDate({
                                        id: child[mapFields.value.id],
                                        startDate: child[mapFields.value.startdate],
                                        endDate: child[mapFields.value.enddate]
                                    });
                                }
                            }
                        }
                        
                        // 设置父任务条形图的日期
                        setBarDate({
                            id: props.row[mapFields.value.id],
                            startDate: props.row[mapFields.value.startdate],
                            endDate: props.row[mapFields.value.enddate]
                        });
                    }
                }
            });


            // 使 SVG 元素可调整大小
            interact(barElement).resizable({
                edges: { left: true, right: true, bottom: false, top: false },
                listeners: {
                    start: (event: { target: SVGSVGElement }) => {
                        // 记录调整大小开始时的 X 坐标和宽度
                        oldBarDataX.value = Number(event.target.getAttribute('data-x'));
                        oldBarWidth.value = Number(event.target.getAttribute('width'));
                    },
                    end: (event: { target: SVGSVGElement; dx: number; rect: { width: number }; edges: { left: boolean; right: boolean } }) => {
                        // 设置允许更改任务日期
                        setAllowChangeTaskDate(props.row);
                        
                        let target = event.target;
                        let newWidth = event.rect.width;
                        
                        // 对齐宽度到网格
                        let widthCells = Math.round(newWidth / scale.value);
                        if (widthCells < 1) widthCells = 1;
                        newWidth = widthCells * scale.value;
                        
                        // 计算新的 X 坐标
                        let currentX = oldBarDataX.value;
                        
                        // 如果是从左边调整大小，需要调整 X 坐标
                        if (event.edges && event.edges.left) {
                            // 从左边调整：新X = 旧X + (旧宽度 - 新宽度)
                            currentX = oldBarDataX.value + (oldBarWidth.value - newWidth);
                            // 对齐 X 到网格
                            currentX = Math.round(currentX / scale.value) * scale.value;
                            if (currentX < 0) currentX = 0;
                            
                            // 检查是否有父任务，如果有则限制开始时间不能早于父任务
                            const parentIdField = mapFields.value.parentId || 'pid';
                            const currentParentId = props.row[parentIdField];
                            if (currentParentId && currentParentId !== '0') {
                                const parentTask = store.tasks.find(t => String(t[mapFields.value.id]) === String(currentParentId));
                                if (parentTask) {
                                    let parentStartX = 0;
                                    if (mode.value === '月' || mode.value === '日') {
                                        parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days') * scale.value;
                                    } else if (mode.value === '周') {
                                        const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                                        const parentStartWeek = dayjs(parentTask[mapFields.value.startdate]).startOf('isoWeek');
                                        parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * scale.value;
                                    } else if (mode.value === '时') {
                                        parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours') * scale.value;
                                    }
                                    // 限制子任务不能早于父任务
                                    if (currentX < parentStartX) {
                                        currentX = parentStartX;
                                        // 重新计算宽度
                                        newWidth = oldBarDataX.value + oldBarWidth.value - currentX;
                                        widthCells = Math.round(newWidth / scale.value);
                                        if (widthCells < 1) widthCells = 1;
                                        newWidth = widthCells * scale.value;
                                    }
                                }
                            }
                        }
                        
                        target.setAttribute('width', newWidth.toString());
                        target.style.width = newWidth + 'px';
                        target.style.transform = `translate(${currentX}px, 0px)`;
                        target.setAttribute('data-x', currentX.toString());
                        
                        // 计算新的开始和结束日期
                        const startCellIndex = Math.round(currentX / scale.value);
                        const endCellIndex = startCellIndex + widthCells - 1;
                        
                        let newStartDate: string;
                        let newEndDate: string;
                        
                        if (mode.value === '月' || mode.value === '日') {
                            // 每个单元格代表1天
                            newStartDate = dayjs(props.startGanttDate).add(startCellIndex, 'days').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = dayjs(props.startGanttDate).add(endCellIndex, 'days').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '天';
                        } else if (mode.value === '周') {
                            // 每个单元格代表1周
                            const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                            newStartDate = ganttStartWeek.add(startCellIndex, 'weeks').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = ganttStartWeek.add(endCellIndex, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '周';
                        } else {
                            // 时模式：每个单元格代表1小时
                            newStartDate = dayjs(props.startGanttDate).add(startCellIndex, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = dayjs(props.startGanttDate).add(endCellIndex, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '小时';
                        }
                        
                        props.row[mapFields.value.startdate] = newStartDate;
                        props.row[mapFields.value.enddate] = newEndDate;
                        
                        // 更新内部矩形宽度
                        let svg = SVG(barElement as unknown as HTMLElement);
                        let innerRect = svg.select('.innerRect').first();
                        let outerRect = svg.select('rect:not(.innerRect)').first();
                        if (innerRect) {
                            let innerRectWidth = newWidth;
                            if (props.row[mapFields.value.progress]) {
                                innerRectWidth = newWidth * Number(props.row[mapFields.value.progress]);
                            }
                            innerRect.width(innerRectWidth);
                        }
                        if (outerRect) {
                            outerRect.width(newWidth);
                        }
                        
                        // 联动更新子任务：如果从左边调整大小导致开始时间向右移动，检查子任务
                        if (event.edges && event.edges.left) {
                            const newParentStartDate = dayjs(newStartDate);
                            const currentTaskId = props.row[mapFields.value.id];
                            const parentIdField = mapFields.value.parentId || 'pid';
                            
                            // 递归获取所有子任务
                            const getAllChildren = (parentId: any, tasks: any[]): any[] => {
                                const children: any[] = [];
                                for (const task of tasks) {
                                    if (String(task[parentIdField]) === String(parentId)) {
                                        children.push(task);
                                        children.push(...getAllChildren(task[mapFields.value.id], tasks));
                                    }
                                }
                                return children;
                            };
                            
                            const childTasks = getAllChildren(currentTaskId, store.tasks);
                            
                            for (const child of childTasks) {
                                const childStartDate = dayjs(child[mapFields.value.startdate]);
                                
                                // 如果子任务开始时间早于父任务新开始时间，需要同步移动
                                if (childStartDate.isBefore(newParentStartDate)) {
                                    const childOffset = newParentStartDate.diff(childStartDate, mode.value === '时' ? 'hours' : 'days');
                                    
                                    if (mode.value === '时') {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate])
                                            .add(childOffset, 'hours')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate])
                                            .add(childOffset, 'hours')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        const spendHours = dayjs(child[mapFields.value.enddate]).diff(dayjs(child[mapFields.value.startdate]), 'hours') + 1;
                                        child[mapFields.value.takestime] = spendHours + '小时';
                                    } else {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate])
                                            .add(childOffset, 'days')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate])
                                            .add(childOffset, 'days')
                                            .format('YYYY-MM-DD HH:mm:ss');
                                        
                                        if (mode.value === '月' || mode.value === '日') {
                                            const spendDays = dayjs(child[mapFields.value.enddate]).diff(dayjs(child[mapFields.value.startdate]), 'days') + 1;
                                            child[mapFields.value.takestime] = spendDays + '天';
                                        } else if (mode.value === '周') {
                                            const startWeek = dayjs(child[mapFields.value.startdate]).startOf('isoWeek');
                                            const endWeek = dayjs(child[mapFields.value.enddate]).startOf('isoWeek');
                                            child[mapFields.value.takestime] = endWeek.diff(startWeek, 'week') + 1 + '周';
                                        }
                                    }
                                    
                                    setBarDate({
                                        id: child[mapFields.value.id],
                                        startDate: child[mapFields.value.startdate],
                                        endDate: child[mapFields.value.enddate]
                                    });
                                }
                            }
                        }
                        
                        // 设置条形图的日期
                        setBarDate({
                            id: props.row[mapFields.value.id],
                            startDate: newStartDate,
                            endDate: newEndDate
                        });
                    }
                },
                modifiers: [
                    interact.modifiers.restrictEdges({
                        outer: 'parent'
                    }),
                    interact.modifiers.restrictSize({
                        min: { width: scale.value, height: barHeight.value }
                    })
                ],
                inertia: false,
                hold: 1
            });
        };

        // 监听 row 的日期变化，重新绘制 bar（用于父任务拖拽时联动子任务）
        watch(
            () => [props.row[mapFields.value.startdate], props.row[mapFields.value.enddate]],
            () => {
                if (bar.value && isBarInteracted.value) {
                    // 重新计算并绘制 bar
                    drowBar(bar.value);
                }
            },
            { deep: false }
        );

        // 组件挂载后执行的钩子函数
        onMounted(() => {
            console.log(`[Bar] Component mounted, task: ${props.row[mapFields.value.id]}, mode: ${store.mode}`);
            if (bar.value && !isBarInteracted.value) {
                // 绘制条形图
                drowBar(bar.value);
                // 设置标志变量为 true，表示元素已经设置了交互
                isBarInteracted.value = true;
                console.log(`[Bar] Initial bar drawn, width: ${bar.value.getAttribute('width')}`);
            }
            if (setBarColor) {
                // 设置条形图的颜色
                barColor.value = setBarColor(props.row);
                // 更新颜色
                if (bar.value) {
                    drowBar(bar.value);
                }
            }
        });

        // keep-alive 停用时的清理
        onDeactivated(() => {
            if (bar.value) {
                try {
                    // 尝试取消交互设置，但不检查isSet
                    interact(bar.value).unset();
                } catch (e) {
                    // 忽略错误
                }
            }
            // 隐藏行
            showRow.value = false;
        });

        // 组件卸载前的清理
        onBeforeUnmount(() => {
            if (bar.value) {
                try {
                    // 尝试取消交互设置，但不检查isSet
                    interact(bar.value).unset();
                } catch (e) {
                    // 忽略错误
                }
            }
            // 隐藏行
            showRow.value = false;
        });

        return {
            bar,
            barHeight,
            direction,
            oldBarDataX,
            oldBarWidth,
            showRow,
            hover,
            barColor,
            timelineCellCount,
            scale,
            mode,
            mapFields,
            hoverActive,
            hoverInactive,
            WeekEndColor
        };
    },
})
</script>
<style lang="scss" scoped>
.barRow.active {
    background: var(--row-hover, #FFF3A1) !important;
    
    .cell {
        background: var(--row-hover, #FFF3A1) !important;
    }
}

.barRow {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
    position: relative;

    .bar {
        position: absolute;
        z-index: 100;
        background-color: #faf7ec;
        border-radius: 10px;
    }

    &:first-child {
        .cell {
            border-top: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            // 顶部和底部边框通过伪元素实现，不影响宽度
            position: relative;
            margin: 0px 0px 0px 0px;
            box-sizing: border-box;

            &:first-child {
                border-left: 1px solid var(--border, #cecece);
            }

            &:not(:last-child) {
                border-right: 1px solid var(--border, #cecece);
            }

            &:last-child {
                border-right: 1px solid var(--border, #cecece);
            }
        }
    }

    &:not(:first-child) {

        .cell {
            // 为 .cell 添加顶部和底部的伪元素来显示边框
            border-top: 1px solid var(--border, #cecece);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            // 顶部和底部边框通过伪元素实现，不影响宽度
            position: relative;
            margin: 0px 0px 0px 0px;
            box-sizing: border-box;

            &:first-child {
                border-left: 1px solid var(--border, #cecece);
            }

            &:not(:last-child) {
                border-right: 1px solid var(--border, #cecece);
            }

            &:last-child {
                border-right: 1px solid var(--border, #cecece);
            }
        }
    }

    &:last-child {
        .cell {
            border-bottom: 1px solid var(--border, #cecece);
        }
    }
}
</style>