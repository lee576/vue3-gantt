<template>
    <div v-if='showRow' class="barRow" :style="{ height: rowHeight + 'px' }" @mouseover="hoverActive()"
        @mouseleave="hoverInactive()" :class="{ active: hover }" :data-task-id="row[mapFields.id]">
        <svg key="row.no" v-if='showRow' ref='bar' class="bar" :height="barHeight + 'px'"
            :class="{ active: hover }" style="overflow: visible;"></svg>
        <template v-for='(count) in timelineCellCount'
            :key="count + row.id + timelineCellCount + showRow + '_template'">
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
dayjs.extend(isoWeek);
import { store, mutations } from '../state/Store';
import sharedState from '../state/ShareState';
import { Symbols } from '../state/Symbols';

export default defineComponent({
    name: 'Bar',
    emits: ['progress-update'],
    props: {
        rowHeight: { type: Number as () => number, default: 0 },
        row: { type: Object as () => Record<string, any>, default: () => ({}) },
        startGanttDate: { type: String as () => string },
        endGanttDate: { type: String as () => string }
    },
    setup(props, { emit }) {
        const bar = ref<SVGSVGElement | null>(null);
        const barHeight = ref(props.rowHeight * 0.7);
        const direction = ref<string | null>(null);
        const oldBarDataX = ref(0);
        const oldBarWidth = ref(0);
        const showRow = ref(true);
        const hover = ref(false);
        const barColor = ref('');
        const isBarInteracted = ref(false);
        const themeVersion = ref(0);
        const isProgressDragging = ref(false);

        const timelineCellCount = computed(() => store.timelineCellCount);
        const scale = computed(() => store.scale);
        const mode = computed(() => store.mode);
        const mapFields = computed(() => store.mapFields);
        const progress = computed(() => {
            const progressValue = Number(props.row[mapFields.value.progress]);
            if (isNaN(progressValue)) return '0.00%';
            return (progressValue * 100).toFixed(2) + '%';
        });

        const setBarColor = inject(Symbols.SetBarColorSymbol) as ((row: any) => string) | undefined;

        // 进度更新事件
        const emitProgressUpdate = (newProgress: number) => {
            const detail = {
                taskId: props.row[mapFields.value.id],
                oldProgress: Number(props.row[mapFields.value.progress]) || 0,
                newProgress: newProgress,
                task: props.row
            };
            emit('progress-update', detail);
            window.dispatchEvent(new CustomEvent('taskProgressUpdate', { detail }));
            console.log('Task progress updated:', detail);
        };

        watch(() => sharedState.highlightedId, (newId) => {
            hover.value = props.row[mapFields.value['id']] === newId;
        });

        const hoverActive = () => sharedState.triggerHighlight(props.row[mapFields.value.id] as number | null);
        const hoverInactive = () => sharedState.triggerHighlight(null);

        const WeekEndColor = (count: number) => {
            themeVersion.value;
            let bgContent = '#ffffff', bgSecondary = '#f8f8f8';
            if (bar.value) {
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
                case '季度': {
                    // 季度模式按月计算，不显示周末背景色
                    return bgContent;
                }
                                case '月': {
                    let currentDate = dayjs(props.startGanttDate).startOf('month').add(count, 'months');
                    return bgContent;
                }
                case '日': {
                    let currentDate = dayjs(props.startGanttDate).add(count, 'days');
                    return (currentDate.isoWeekday() === 7 || currentDate.isoWeekday() === 1) ? bgSecondary : bgContent;
                }
                case '周': case '时': return bgContent;
            }
        };

        const setBarDate = mutations.setBarDate;
        const setAllowChangeTaskDate = mutations.setAllowChangeTaskDate;

        const drowBar = (barElement: SVGSVGElement) => {
            let dataX = 0;
            switch (mode.value) {
                case '季度': {
                    // 季度模式：按月计算位置和宽度
                    const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                    const taskStartMonth = dayjs(props.row[mapFields.value.startdate]).startOf('month');
                    const taskEndMonth = dayjs(props.row[mapFields.value.enddate]).startOf('month');
                    
                    // 计算从甘特图开始月到任务开始月的月数
                    let fromStartMonths = (taskStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                          (taskStartMonth.month() - ganttStartMonth.month());
                    dataX = scale.value * fromStartMonths;
                    
                    // 计算任务跨越的月数
                    let spendMonths = (taskEndMonth.year() - taskStartMonth.year()) * 12 + 
                                      (taskEndMonth.month() - taskStartMonth.month()) + 1;
                    oldBarWidth.value = spendMonths * scale.value;
                    props.row[mapFields.value.takestime] = spendMonths + '月';
                    break;
                }
                case '月': {
                    // 月模式：按月计算位置和宽度
                    const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                    const taskStartMonth = dayjs(props.row[mapFields.value.startdate]).startOf('month');
                    const taskEndMonth = dayjs(props.row[mapFields.value.enddate]).startOf('month');
                    
                    let fromStartMonths = (taskStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                          (taskStartMonth.month() - ganttStartMonth.month());
                    dataX = scale.value * fromStartMonths;
                    
                    let spendMonths = (taskEndMonth.year() - taskStartMonth.year()) * 12 + 
                                      (taskEndMonth.month() - taskStartMonth.month()) + 1;
                    oldBarWidth.value = spendMonths * scale.value;
                    props.row[mapFields.value.takestime] = spendMonths + '月';
                    break;
                }
                case '日': {
                    let fromPlanStartDays = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days');
                    dataX = scale.value * fromPlanStartDays;
                    let spendDays = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'days') + 1;
                    oldBarWidth.value = spendDays * scale.value;
                    props.row[mapFields.value.takestime] = spendDays + '天';
                    break;
                }
                case '周': {
                    const startGanttWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                    const taskStartWeek = dayjs(props.row[mapFields.value.startdate]).startOf('isoWeek');
                    let fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week');
                    dataX = scale.value * fromPlanStartWeeks;
                    const taskEndWeek = dayjs(props.row[mapFields.value.enddate]).startOf('isoWeek');
                    let spendWeeks = taskEndWeek.diff(taskStartWeek, 'week') + 1;
                    oldBarWidth.value = spendWeeks * scale.value;
                    props.row[mapFields.value.takestime] = spendWeeks + '周';
                    break;
                }
                case '时': {
                    let fromPlanStartHours = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours');
                    dataX = scale.value * fromPlanStartHours;
                    let spendHours = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'hours') + 1;
                    oldBarWidth.value = spendHours * scale.value;
                    props.row[mapFields.value.takestime] = spendHours + '小时';
                    break;
                }
            }
            oldBarDataX.value = dataX;
            let svg = SVG(barElement as unknown as HTMLElement);
            const borderColor = getComputedStyle(barElement).getPropertyValue('--border') || '#cecece';
            barElement.setAttribute('data-x', dataX.toString());
            barElement.setAttribute('width', oldBarWidth.value.toString());
            barElement.setAttribute('stroke', borderColor);
            barElement.setAttribute('stroke-width', '1px');
            barElement.style.transform = `translate(${dataX}px, 0px)`;

            let p = svg.select('pattern').first();
            let g = (svg.children().filter((child) => child.type === 'g')[0] as any) || svg.group();
            let innerRect = svg.select('.innerRect').first();
            let outerRect = svg.select('rect:not(.innerRect):not(.progressHandle)').first();
            let text = svg.select('text').first();
            let progressHandle = svg.select('.progressHandle').first();

            if (!p) {
                p = svg.pattern(10, 10, (add) => {
                    (add as any).path('M10 -5 -10,15M15,0,0,15M0 -5 -20,15').fill('none').stroke({ color: 'gray', opacity: 0.4, width: 5 });
                });
            }
            if (!g) g = svg.group();

            let innerRectWidth = props.row[mapFields.value.progress] 
                ? Number(oldBarWidth.value) * Number(props.row[mapFields.value.progress]) 
                : Number(oldBarWidth.value);
            
            if (!innerRect) {
                innerRect = svg.rect(innerRectWidth, barHeight.value).radius(10);
                innerRect.addClass('innerRect');
                g.add(innerRect);
            } else {
                innerRect.fill({ color: barColor.value, opacity: 0.4 });
                innerRect.width(innerRectWidth);
            }

            if (!outerRect) {
                outerRect = svg.rect(oldBarWidth.value, barHeight.value).radius(10).fill(p).stroke({ color: borderColor, width: 1 });
                outerRect.on('mouseover', () => outerRect.animate(200).attr({ stroke: '#000', strokeWidth: 2, opacity: 1 }));
                outerRect.on('mouseleave', () => outerRect.animate(200).attr({ stroke: '#0066ff', strokeWidth: 10, opacity: 0.4 }));
            } else {
                outerRect.width(oldBarWidth.value);
            }

            if (!text) {
                text = svg.text(progress.value).stroke('#faf7ec');
            } else {
                (text as any).text(progress.value);
            }
            const textBBox = text.bbox();
            (text as any).font({ size: 15, anchor: 'middle', leading: '1em' })
                .fill('#000').attr('opacity', 1).attr('dominant-baseline', 'middle')
                .center(innerRect.width() / 2 + textBBox.width / 2, innerRect.height() / 2);

            // 进度调节滑块 - 三角形拖拽手柄 + 对齐虚线
            const handleWidth = 12;
            const handleHeight = 8;
            const handleX = innerRectWidth - handleWidth / 2;
            // 三角形位置：Bar底部边缘穿过三角形中心
            const handleY = barHeight.value - handleHeight / 2;
            const lineX = innerRectWidth;
            
            // 获取主题颜色的辅助函数
            const getThemeColors = () => {
                let primary = '#f59e0b', primaryDark = '#d97706', primaryLight = '#fbbf24';
                let element = barElement.parentElement;
                while (element) {
                    if (element.hasAttribute('data-gantt-theme')) {
                        primary = getComputedStyle(element).getPropertyValue('--primary').trim() || primary;
                        primaryDark = getComputedStyle(element).getPropertyValue('--primary-dark').trim() || primaryDark;
                        primaryLight = getComputedStyle(element).getPropertyValue('--primary-light').trim() || primaryLight;
                        break;
                    }
                    element = element.parentElement;
                }
                return { primary, primaryDark, primaryLight };
            };
            
            // 查找或创建对齐虚线
            let guideLineEl = barElement.querySelector('.progressGuideLine') as SVGLineElement | null;
            const themeColors = getThemeColors();
            
            if (!guideLineEl) {
                // 创建对齐虚线
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'progressGuideLine');
                line.setAttribute('x1', String(lineX));
                line.setAttribute('y1', '0');
                line.setAttribute('x2', String(lineX));
                line.setAttribute('y2', String(handleY));
                line.setAttribute('stroke', themeColors.primaryDark);
                line.setAttribute('stroke-width', '2');
                line.setAttribute('stroke-dasharray', '4,3');
                line.setAttribute('opacity', '0.8');
                barElement.appendChild(line);
                guideLineEl = line;
            }
            // 始终更新位置和可见性
            guideLineEl.setAttribute('x1', String(lineX));
            guideLineEl.setAttribute('x2', String(lineX));
            guideLineEl.setAttribute('y2', String(handleY));
            guideLineEl.setAttribute('stroke', themeColors.primaryDark);
            guideLineEl.setAttribute('opacity', '0.8');
            
            if (!progressHandle) {
                // 创建三角形手柄
                const trianglePoints = `${handleWidth/2},0 0,${handleHeight} ${handleWidth},${handleHeight}`;
                progressHandle = svg.polygon(trianglePoints)
                    .fill(themeColors.primary)
                    .stroke({ color: themeColors.primaryDark, width: 1 })
                    .addClass('progressHandle');
                
                const handleElement = progressHandle.node as unknown as SVGPolygonElement;
                handleElement.style.cursor = 'ew-resize';
                handleElement.style.pointerEvents = 'auto';
                progressHandle.move(handleX, handleY);
                
                // 用于记录当前X位置
                let currentHandleX = handleX;
                
                // 悬停效果 - 高亮显示
                handleElement.addEventListener('mouseenter', () => {
                    if (!isProgressDragging.value) {
                        const colors = getThemeColors();
                        handleElement.setAttribute('fill', colors.primaryLight);
                        handleElement.setAttribute('stroke', colors.primary);
                        handleElement.setAttribute('stroke-width', '2');
                        guideLineEl!.setAttribute('stroke', colors.primaryLight);
                        guideLineEl!.setAttribute('stroke-width', '2');
                        guideLineEl!.setAttribute('opacity', '1');
                    }
                });
                handleElement.addEventListener('mouseleave', () => {
                    if (!isProgressDragging.value) {
                        const colors = getThemeColors();
                        handleElement.setAttribute('fill', colors.primary);
                        handleElement.setAttribute('stroke', colors.primaryDark);
                        handleElement.setAttribute('stroke-width', '1');
                        guideLineEl!.setAttribute('stroke', colors.primaryDark);
                        guideLineEl!.setAttribute('stroke-width', '2');
                        guideLineEl!.setAttribute('opacity', '0.8');
                    }
                });
                
                // 拖拽交互
                interact(handleElement).draggable({
                    inertia: false,
                    listeners: {
                        start: () => { 
                            isProgressDragging.value = true;
                            const colors = getThemeColors();
                            handleElement.setAttribute('fill', colors.primaryDark);
                            handleElement.setAttribute('stroke', colors.primaryDark);
                            handleElement.setAttribute('stroke-width', '2');
                            guideLineEl!.setAttribute('stroke', colors.primaryDark);
                            guideLineEl!.setAttribute('stroke-width', '2');
                            guideLineEl!.setAttribute('opacity', '1');
                        },
                        move: (event) => {
                            currentHandleX += event.dx;
                            currentHandleX = Math.max(-handleWidth / 2, Math.min(currentHandleX, oldBarWidth.value - handleWidth / 2));
                            
                            progressHandle.move(currentHandleX, handleY);
                            
                            // 更新虚线位置
                            const newLineX = currentHandleX + handleWidth / 2;
                            guideLineEl!.setAttribute('x1', String(newLineX));
                            guideLineEl!.setAttribute('x2', String(newLineX));
                            
                            // 更新进度
                            const newProgress = Math.min(1, Math.max(0, (currentHandleX + handleWidth / 2) / oldBarWidth.value));
                            innerRect.width(newProgress * oldBarWidth.value);
                            (text as any).text((newProgress * 100).toFixed(2) + '%');
                            (text as any).center(innerRect.width() / 2 + textBBox.width / 2, innerRect.height() / 2);
                        },
                        end: () => {
                            isProgressDragging.value = false;
                            const colors = getThemeColors();
                            handleElement.setAttribute('fill', colors.primary);
                            handleElement.setAttribute('stroke', colors.primaryDark);
                            handleElement.setAttribute('stroke-width', '1');
                            guideLineEl!.setAttribute('stroke', colors.primaryDark);
                            guideLineEl!.setAttribute('stroke-width', '2');
                            guideLineEl!.setAttribute('opacity', '0.8');
                            
                            const newProgress = Math.min(1, Math.max(0, (currentHandleX + handleWidth / 2) / oldBarWidth.value));
                            props.row[mapFields.value.progress] = newProgress;
                            emitProgressUpdate(newProgress);
                        }
                    }
                });
            } else {
                progressHandle.move(handleX, handleY);
                // 更新已存在的三角形颜色以响应主题变化
                const handleElement = progressHandle.node as unknown as SVGPolygonElement;
                handleElement.setAttribute('fill', themeColors.primary);
                handleElement.setAttribute('stroke', themeColors.primaryDark);
            }

            setBarDate({ id: props.row[mapFields.value.id], startDate: props.row[mapFields.value.startdate], endDate: props.row[mapFields.value.enddate] });

            // 拖拽功能
            interact(barElement).draggable({
                inertia: false,
                modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
                autoScroll: true,
                listeners: {
                    start: (event: { target: SVGSVGElement }) => {
                        if (isProgressDragging.value) return;
                        oldBarDataX.value = Number(event.target.getAttribute('data-x'));
                        oldBarWidth.value = event.target.width.baseVal.value;
                    },
                    move: (event: { target: SVGSVGElement; dx: number; rect: { width: number; height: number } }) => {
                        if (isProgressDragging.value) return;
                        let x = ((parseFloat(event.target.getAttribute('data-x') || '0') || 0) + event.dx).toString();
                        Object.assign(event.target.style, { width: `${event.rect.width}px`, height: `${event.rect.height}px`, transform: `translate(${x}px, 0px)` });
                        event.target.setAttribute('data-x', x);
                        event.target.setAttribute('data-y', '0');
                    },
                    end: (event: { target: SVGSVGElement }) => {
                        if (isProgressDragging.value) return;
                        let target = event.target;
                        let currentX = parseFloat(target.getAttribute('data-x') || '0') || 0;
                        let multiple = Math.round(currentX / scale.value);
                        let alignedX = multiple * scale.value;
                        if (alignedX < 0) alignedX = 0;
                        if (alignedX > timelineCellCount.value * scale.value) alignedX = timelineCellCount.value * scale.value;
                        
                        const parentIdField = mapFields.value.parentId || 'pid';
                        const currentParentId = props.row[parentIdField];
                        if (currentParentId && currentParentId !== '0') {
                            const parentTask = store.tasks.find(t => String(t[mapFields.value.id]) === String(currentParentId));
                            if (parentTask) {
                                let parentStartX = 0;
                                if (mode.value === '季度' || mode.value === '月') {
                                    // 季度/月模式按月计算
                                    const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                                    const parentStartMonth = dayjs(parentTask[mapFields.value.startdate]).startOf('month');
                                    const monthsDiff = (parentStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                                       (parentStartMonth.month() - ganttStartMonth.month());
                                    parentStartX = monthsDiff * scale.value;
                                } else if (mode.value === '日') {
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days') * scale.value;
                                } else if (mode.value === '周') {
                                    const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                                    const parentStartWeek = dayjs(parentTask[mapFields.value.startdate]).startOf('isoWeek');
                                    parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * scale.value;
                                } else if (mode.value === '时') {
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours') * scale.value;
                                }
                                if (alignedX < parentStartX) alignedX = parentStartX;
                            }
                        }
                        
                        target.style.transform = `translate(${alignedX}px, 0px)`;
                        target.setAttribute('data-x', alignedX.toString());
                        
                        const cellsMoved = Math.round((alignedX - oldBarDataX.value) / scale.value);
                        let daysOffset = 0, hoursOffset = 0, monthsOffset = 0;
                        if (mode.value === '季度' || mode.value === '月') monthsOffset = cellsMoved;
                        else if (mode.value === '日') daysOffset = cellsMoved;
                        else if (mode.value === '周') daysOffset = cellsMoved * 7;
                        else if (mode.value === '时') hoursOffset = cellsMoved;
                        
                        if (mode.value === '季度' || mode.value === '月') {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(monthsOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate]).add(monthsOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                            const taskStartMonth = dayjs(props.row[mapFields.value.startdate]).startOf('month');
                            const taskEndMonth = dayjs(props.row[mapFields.value.enddate]).startOf('month');
                            const spendMonths = (taskEndMonth.year() - taskStartMonth.year()) * 12 + 
                                               (taskEndMonth.month() - taskStartMonth.month()) + 1;
                            props.row[mapFields.value.takestime] = spendMonths + '月';
                        } else if (mode.value === '时') {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(hoursOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate]).add(hoursOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = (dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'hours') + 1) + '小时';
                        } else {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(daysOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate]).add(daysOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                            if (mode.value === '日') {
                                props.row[mapFields.value.takestime] = (dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'days') + 1) + '天';
                            } else if (mode.value === '周') {
                                const startWeek = dayjs(props.row[mapFields.value.startdate]).startOf('isoWeek');
                                const endWeek = dayjs(props.row[mapFields.value.enddate]).startOf('isoWeek');
                                props.row[mapFields.value.takestime] = (endWeek.diff(startWeek, 'week') + 1) + '周';
                            }
                        }
                        
                        // 联动子任务
                        const newParentStartDate = dayjs(props.row[mapFields.value.startdate]);
                        const currentTaskId = props.row[mapFields.value.id];
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
                        const actualOffset = mode.value === '季度' ? monthsOffset : (mode.value === '时' ? hoursOffset : daysOffset);
                        if (actualOffset > 0) {
                            for (const child of childTasks) {
                                if (dayjs(child[mapFields.value.startdate]).isBefore(newParentStartDate)) {
                                                                    if (mode.value === '季度' || mode.value === '月') {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(monthsOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(monthsOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                                    } else if (mode.value === '时') {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(hoursOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(hoursOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                                    } else {
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(daysOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(daysOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                                    }
                                    setBarDate({ id: child[mapFields.value.id], startDate: child[mapFields.value.startdate], endDate: child[mapFields.value.enddate] });
                                }
                            }
                        }
                        setBarDate({ id: props.row[mapFields.value.id], startDate: props.row[mapFields.value.startdate], endDate: props.row[mapFields.value.enddate] });
                    }
                }
            });

            // 调整大小功能
            interact(barElement).resizable({
                edges: { left: true, right: true, bottom: false, top: false },
                listeners: {
                    start: (event: { target: SVGSVGElement }) => {
                        oldBarDataX.value = Number(event.target.getAttribute('data-x'));
                        oldBarWidth.value = Number(event.target.getAttribute('width'));
                    },
                    end: (event: { target: SVGSVGElement; rect: { width: number }; edges: { left: boolean; right: boolean } }) => {
                        setAllowChangeTaskDate(props.row);
                        let target = event.target;
                        let newWidth = event.rect.width;
                        let widthCells = Math.round(newWidth / scale.value);
                        if (widthCells < 1) widthCells = 1;
                        newWidth = widthCells * scale.value;
                        let currentX = oldBarDataX.value;
                        
                        if (event.edges && event.edges.left) {
                            currentX = oldBarDataX.value + (oldBarWidth.value - newWidth);
                            currentX = Math.round(currentX / scale.value) * scale.value;
                            if (currentX < 0) currentX = 0;
                            
                            const parentIdField = mapFields.value.parentId || 'pid';
                            const currentParentId = props.row[parentIdField];
                            if (currentParentId && currentParentId !== '0') {
                                const parentTask = store.tasks.find(t => String(t[mapFields.value.id]) === String(currentParentId));
                                if (parentTask) {
                                    let parentStartX = 0;
                                    if (mode.value === '季度' || mode.value === '月') {
                                        const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                                        const parentStartMonth = dayjs(parentTask[mapFields.value.startdate]).startOf('month');
                                        const monthsDiff = (parentStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                                           (parentStartMonth.month() - ganttStartMonth.month());
                                        parentStartX = monthsDiff * scale.value;
                                    } else if (mode.value === '日') {
                                        parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days') * scale.value;
                                    } else if (mode.value === '周') {
                                        const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                                        const parentStartWeek = dayjs(parentTask[mapFields.value.startdate]).startOf('isoWeek');
                                        parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * scale.value;
                                    } else if (mode.value === '时') {
                                        parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours') * scale.value;
                                    }
                                    if (currentX < parentStartX) {
                                        currentX = parentStartX;
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
                        
                        const startCellIndex = Math.round(currentX / scale.value);
                        const endCellIndex = startCellIndex + widthCells - 1;
                        let newStartDate: string, newEndDate: string;
                        
                        if (mode.value === '季度' || mode.value === '月') {
                            // 季度/月模式：按月计算
                            const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                            newStartDate = ganttStartMonth.add(startCellIndex, 'months').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = ganttStartMonth.add(endCellIndex, 'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '月';
                        } else if (mode.value === '日') {
                            newStartDate = dayjs(props.startGanttDate).add(startCellIndex, 'days').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = dayjs(props.startGanttDate).add(endCellIndex, 'days').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '天';
                        } else if (mode.value === '周') {
                            const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                            newStartDate = ganttStartWeek.add(startCellIndex, 'weeks').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = ganttStartWeek.add(endCellIndex, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '周';
                        } else {
                            newStartDate = dayjs(props.startGanttDate).add(startCellIndex, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            newEndDate = dayjs(props.startGanttDate).add(endCellIndex, 'hours').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.takestime] = widthCells + '小时';
                        }
                        
                        props.row[mapFields.value.startdate] = newStartDate;
                        props.row[mapFields.value.enddate] = newEndDate;
                        
                        let svg = SVG(barElement as unknown as HTMLElement);
                        let innerRect = svg.select('.innerRect').first();
                        let outerRect = svg.select('rect:not(.innerRect):not(.progressHandle)').first();
                        if (innerRect) {
                            let innerRectWidth = props.row[mapFields.value.progress] ? newWidth * Number(props.row[mapFields.value.progress]) : newWidth;
                            innerRect.width(innerRectWidth);
                        }
                        if (outerRect) outerRect.width(newWidth);
                        
                        // 联动子任务
                        if (event.edges && event.edges.left) {
                            const newParentStartDate = dayjs(newStartDate);
                            const currentTaskId = props.row[mapFields.value.id];
                            const parentIdField = mapFields.value.parentId || 'pid';
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
                                if (dayjs(child[mapFields.value.startdate]).isBefore(newParentStartDate)) {
                                                                    if (mode.value === '季度' || mode.value === '月') {
                                        // 季度/月模式按月计算偏移
                                        const childStartMonth = dayjs(child[mapFields.value.startdate]).startOf('month');
                                        const parentStartMonth = newParentStartDate.startOf('month');
                                        const childOffset = (parentStartMonth.year() - childStartMonth.year()) * 12 + 
                                                           (parentStartMonth.month() - childStartMonth.month());
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(childOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(childOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                                    } else if (mode.value === '时') {
                                        const childOffset = newParentStartDate.diff(dayjs(child[mapFields.value.startdate]), 'hours');
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(childOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(childOffset, 'hours').format('YYYY-MM-DD HH:mm:ss');
                                    } else {
                                        const childOffset = newParentStartDate.diff(dayjs(child[mapFields.value.startdate]), 'days');
                                        child[mapFields.value.startdate] = dayjs(child[mapFields.value.startdate]).add(childOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                                        child[mapFields.value.enddate] = dayjs(child[mapFields.value.enddate]).add(childOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                                    }
                                    setBarDate({ id: child[mapFields.value.id], startDate: child[mapFields.value.startdate], endDate: child[mapFields.value.enddate] });
                                }
                            }
                        }
                        setBarDate({ id: props.row[mapFields.value.id], startDate: newStartDate, endDate: newEndDate });
                    }
                },
                modifiers: [
                    interact.modifiers.restrictEdges({ outer: 'parent' }),
                    interact.modifiers.restrictSize({ min: { width: scale.value, height: barHeight.value } })
                ],
                inertia: false, hold: 1
            });
        };

        watch(() => [props.row[mapFields.value.startdate], props.row[mapFields.value.enddate]], () => {
            if (bar.value && isBarInteracted.value) drowBar(bar.value);
        }, { deep: false });

        onMounted(() => {
            if (bar.value && !isBarInteracted.value) {
                drowBar(bar.value);
                isBarInteracted.value = true;
            }
            if (setBarColor) {
                barColor.value = setBarColor(props.row);
                if (bar.value) drowBar(bar.value);
            }
            // 监听主题变化
            if (bar.value) {
                let ganttContainer = bar.value.parentElement;
                while (ganttContainer && !ganttContainer.hasAttribute('data-gantt-theme')) {
                    ganttContainer = ganttContainer.parentElement;
                }
                if (ganttContainer) {
                    const observer = new MutationObserver(() => { themeVersion.value++; });
                    observer.observe(ganttContainer, { attributes: true, attributeFilter: ['data-gantt-theme', 'style'] });
                    onBeforeUnmount(() => observer.disconnect());
                }
            }
        });

        onDeactivated(() => {
            if (bar.value) { try { interact(bar.value).unset(); } catch (e) {} }
            showRow.value = false;
        });

        onBeforeUnmount(() => {
            if (bar.value) { try { interact(bar.value).unset(); } catch (e) {} }
            showRow.value = false;
        });

        return {
            bar, barHeight, direction, oldBarDataX, oldBarWidth, showRow, hover, barColor,
            timelineCellCount, scale, mode, mapFields, hoverActive, hoverInactive, WeekEndColor
        };
    },
})
</script>
<style lang="scss" scoped>
.barRow.active { background: var(--row-hover, #FFF3A1) !important; .cell { background: var(--row-hover, #FFF3A1) !important; } }
.barRow {
    display: flex; flex-flow: row nowrap; align-items: center; justify-content: flex-start;
    width: fit-content; position: relative; overflow: visible;
    .bar { position: absolute; z-index: 100; background-color: #faf7ec; border-radius: 10px; overflow: visible; }
    &:first-child .cell {
        border-top: none; display: flex; align-items: center; justify-content: center; font-size: 10px;
        position: relative; margin: 0; box-sizing: border-box;
        &:first-child { border-left: 1px solid var(--border, #cecece); }
        &:not(:last-child) { border-right: 1px solid var(--border, #cecece); }
        &:last-child { border-right: 1px solid var(--border, #cecece); }
    }
    &:not(:first-child) .cell {
        border-top: 1px solid var(--border, #cecece); display: flex; align-items: center; justify-content: center;
        font-size: 10px; position: relative; margin: 0; box-sizing: border-box;
        &:first-child { border-left: 1px solid var(--border, #cecece); }
        &:not(:last-child) { border-right: 1px solid var(--border, #cecece); }
        &:last-child { border-right: 1px solid var(--border, #cecece); }
    }
    &:last-child .cell { border-bottom: 1px solid var(--border, #cecece); }
}
.progressHandle { 
    pointer-events: auto !important; 
    cursor: ew-resize !important;
}
</style>