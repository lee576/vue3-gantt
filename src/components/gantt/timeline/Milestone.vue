<template>
    <div v-if='showRow' class="milestoneRow" :style="milestoneRowStyle" 
        @mouseover="hoverActive()" @mouseleave="hoverInactive()" 
        :class="{ active: hover }" :data-task-id="row[mapFields.id]">
        <svg key="milestone" v-if='showRow' ref='milestone' class="milestone" 
            :height="rowHeight + 'px'" :width="(rowHeight * 0.6 + 200) + 'px'" 
            :class="{ active: hover }" 
            style="overflow: visible;"></svg>
        <!-- 使用CSS背景绘制网格，不再渲染大量cell div -->
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed, onMounted, onBeforeUnmount, inject } from 'vue';
import SVG from 'svg.js';
import interact from 'interactjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
import { store, mutations } from '../state/Store';
import { svgCache, isWeekend } from '../composables/PerformanceConfig';
import sharedState from '../state/ShareState';
import { Symbols } from '../state/Symbols';
import { t } from '../i18n';

export default defineComponent({
    name: 'Milestone',
    props: {
        rowHeight: { type: Number as () => number, default: 0 },
        row: { type: Object as () => Record<string, any>, default: () => ({}) },
        startGanttDate: { type: String as () => string },
        endGanttDate: { type: String as () => string }
    },
    setup(props) {
        const milestone = ref<SVGSVGElement | null>(null);
        const diamondSize = ref(props.rowHeight * 0.6); // 菱形大小
        const showRow = ref(true);
        const hover = ref(false);
        const milestoneColor = ref('');
        const themeVersion = ref(0);
        const oldMilestoneX = ref(0);

        const timelineCellCount = computed(() => store.timelineCellCount);
        const scale = computed(() => store.scale);
        const mode = computed(() => store.mode);
        const mapFields = computed(() => store.mapFields);

        const setBarColor = inject(Symbols.SetBarColorSymbol) as ((row: any) => string) | undefined;

        // 获取主题颜色
        const getThemeColors = () => {
            let bgContent = '#ffffff', bgSecondary = '#f8f8f8', borderColor = '#cecece';
            if (milestone.value) {
                let element = milestone.value.parentElement;
                while (element) {
                    if (element.hasAttribute('data-gantt-theme')) {
                        bgContent = getComputedStyle(element).getPropertyValue('--bg-content').trim() || '#ffffff';
                        bgSecondary = getComputedStyle(element).getPropertyValue('--bg-secondary').trim() || '#f8f8f8';
                        borderColor = getComputedStyle(element).getPropertyValue('--border').trim() || '#cecece';
                        break;
                    }
                    element = element.parentElement;
                }
            }
            return { bgContent, bgSecondary, borderColor };
        };

        // 计算周末列的索引（用于CSS背景）
        const getWeekendIndices = computed(() => {
            if (mode.value !== '日') return [];
            const indices: number[] = [];
            const isHalfDay = store.daySubMode === 'half';
            const cellsPerDay = isHalfDay ? 2 : 1;
            
            for (let i = 0; i < timelineCellCount.value; i++) {
                const dayIndex = isHalfDay ? Math.floor(i / cellsPerDay) : i;
                const currentDate = dayjs(props.startGanttDate).add(dayIndex, 'days');
                // 使用公共函数判断周末
                if (isWeekend(currentDate)) {
                    indices.push(i);
                }
            }
            return indices;
        });

        // 使用CSS背景绘制网格的样式
        const milestoneRowStyle = computed(() => {
            // 依赖 themeVersion 以响应主题变化
            themeVersion.value;
            const cellWidth = scale.value;
            const totalWidth = timelineCellCount.value * cellWidth;
            const { bgContent, bgSecondary, borderColor } = getThemeColors();
            
            // 基础网格线背景 - 在每个单元格的右边界绘制竖线（与表头对齐）
            let backgroundImage = `
                repeating-linear-gradient(
                    to right,
                    transparent 0px,
                    transparent ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth}px
                )
            `;
            
            // 日模式下添加周末背景色
            if (mode.value === '日') {
                const weekendIndices = getWeekendIndices.value;
                if (weekendIndices.length > 0) {
                    const weekendGradients = weekendIndices.map(idx => {
                        const start = idx * cellWidth;
                        const end = start + cellWidth;
                        return `linear-gradient(to right, transparent ${start}px, ${bgSecondary} ${start}px, ${bgSecondary} ${end}px, transparent ${end}px)`;
                    });
                    backgroundImage = weekendGradients.join(', ') + ', ' + backgroundImage;
                }
            }
            
            return {
                height: props.rowHeight + 'px',
                width: totalWidth + 'px',
                minWidth: totalWidth + 'px',
                background: bgContent,
                backgroundImage: backgroundImage,
                backgroundSize: `${totalWidth}px 100%`,
                borderBottom: `1px solid ${borderColor}`
            };
        });

        watch(() => sharedState.highlightedId, (newId) => {
            hover.value = props.row[mapFields.value['id']] === newId;
        });

        const hoverActive = () => sharedState.triggerHighlight(props.row[mapFields.value.id] as number | null);
        const hoverInactive = () => sharedState.triggerHighlight(null);

        const WeekEndColor = (count: number) => {
            themeVersion.value;
            let bgContent = '#ffffff', bgSecondary = '#f8f8f8';
            if (milestone.value) {
                let element = milestone.value.parentElement;
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
                    const isHalfDay = store.daySubMode === 'half';
                    // 半天模式下，每2个单元格为1天
                    const dayIndex = isHalfDay ? Math.floor(count / 2) : count;
                    let currentDate = dayjs(props.startGanttDate).add(dayIndex, 'days');
                    // 使用公共函数判断周末
                    return isWeekend(currentDate) ? bgSecondary : bgContent;
                }
                case '周': case '时': return bgContent;
            }
        };

        const setBarDate = mutations.setBarDate;

        const drawMilestone = (milestoneElement: SVGSVGElement) => {
            let dataX = 0;
            
            // 计算里程碑位置（使用开始日期）
            switch (mode.value) {
                case '季度': {
                    // 季度模式：按季度计算位置
                    const ganttStartQuarter = dayjs(props.startGanttDate).startOf('quarter');
                    const taskStartQuarter = dayjs(props.row[mapFields.value.startdate]).startOf('quarter');
                    let fromStartQuarters = (taskStartQuarter.year() - ganttStartQuarter.year()) * 4 + 
                                          (taskStartQuarter.quarter() - ganttStartQuarter.quarter());
                    dataX = scale.value * fromStartQuarters + scale.value / 2;
                    props.row[mapFields.value.takestime] = '0季度';
                    props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                    break;
                }
                                case '月': {
                    // 月模式：按月计算位置
                    const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                    const taskStartMonth = dayjs(props.row[mapFields.value.startdate]).startOf('month');
                    let fromStartMonths = (taskStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                          (taskStartMonth.month() - ganttStartMonth.month());
                    dataX = scale.value * fromStartMonths + scale.value / 2; // 居中显示
                    props.row[mapFields.value.takestime] = '0月';
                    props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                    break;
                }
                case '日': {
                    const isHalfDay = store.daySubMode === 'half';
                    
                    let fromPlanStartDays = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days');
                    
                    if (isHalfDay) {
                        // 半天模式：根据小时判断是上午还是下午
                        const startHour = dayjs(props.row[mapFields.value.startdate]).hour();
                        const startIsAM = startHour < 12;
                        const startCellOffset = startIsAM ? 0 : 1;
                        
                        dataX = scale.value * (fromPlanStartDays * 2 + startCellOffset) + scale.value / 2; // 居中显示
                    } else {
                        dataX = scale.value * fromPlanStartDays + scale.value / 2; // 居中显示
                    }
                    
                    props.row[mapFields.value.takestime] = '0' + t('durationUnit.days');
                    // 确保里程碑的结束日期等于开始日期
                    props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                    break;
                }
                case '周': {
                    const startGanttWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                    const taskStartWeek = dayjs(props.row[mapFields.value.startdate]).startOf('isoWeek');
                    let fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week');
                    dataX = scale.value * fromPlanStartWeeks + scale.value / 2;
                    props.row[mapFields.value.takestime] = '0周';
                    props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                    break;
                }
                case '时': {
                    let fromPlanStartHours = dayjs(props.row[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours');
                    dataX = scale.value * fromPlanStartHours + scale.value / 2;
                    props.row[mapFields.value.takestime] = '0小时';
                    props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                    break;
                }
            }
            
            oldMilestoneX.value = dataX;
            let svg = SVG(milestoneElement as unknown as HTMLElement);
            const borderColor = getComputedStyle(milestoneElement).getPropertyValue('--border') || '#cecece';
            
            milestoneElement.setAttribute('data-x', dataX.toString());
            milestoneElement.setAttribute('stroke', borderColor);
            milestoneElement.setAttribute('stroke-width', '2px');
            milestoneElement.style.transform = `translate(${dataX}px, 0px)`;

            // 获取主题颜色
            let primary = '#f59e0b';
            let textColor = '#333333'; // 默认文字颜色
            let bgColor = '#ffffff'; // 默认背景色
            let element = milestoneElement.parentElement;
            while (element) {
                if (element.hasAttribute('data-gantt-theme')) {
                    const computedStyle = getComputedStyle(element);
                    primary = computedStyle.getPropertyValue('--primary').trim() || primary;
                    textColor = computedStyle.getPropertyValue('--text-primary').trim() || textColor;
                    bgColor = computedStyle.getPropertyValue('--bg-content').trim() || bgColor;
                    break;
                }
                element = element.parentElement;
            }
            
            // 如果背景是深色，确保文字是浅色
            if (bgColor.includes('#1') || bgColor.includes('#2') || bgColor.toLowerCase().includes('dark')) {
                if (textColor === '#333333') {
                    textColor = '#ffffff'; // 深色背景强制使用白色文字
                }
            }

            // 清除旧内容
            svg.clear();

            // 绘制菱形（旋转45度的正方形）
            const size = diamondSize.value;
            const halfSize = size / 2;
            const centerY = props.rowHeight / 2;
            const centerX = halfSize; // 菱形中心X坐标
            
            // 菱形路径：以中心点为基准，上-右-下-左
            // 上顶点
            const topX = centerX;
            const topY = centerY - halfSize;
            // 右顶点
            const rightX = centerX + halfSize;
            const rightY = centerY;
            // 下顶点
            const bottomX = centerX;
            const bottomY = centerY + halfSize;
            // 左顶点
            const leftX = centerX - halfSize;
            const leftY = centerY;
            
            const diamondPath = `M ${topX},${topY} L ${rightX},${rightY} L ${bottomX},${bottomY} L ${leftX},${leftY} Z`;
            
            const diamond = svg.path(diamondPath)
                .fill(milestoneColor.value || primary)
                .stroke({ color: borderColor, width: 2 })
                .attr('opacity', 0.9);

            // 添加光影效果
            diamond.on('mouseover', () => {
                diamond.animate(200).attr({ opacity: 1, strokeWidth: 3 });
            });
            diamond.on('mouseleave', () => {
                diamond.animate(200).attr({ opacity: 0.9, strokeWidth: 2 });
            });

            // 添加任务名称标签（在菱形右侧）
            const text = svg.text(props.row[mapFields.value.task] || 'Milestone')
                .move(size + 5, centerY - 7)
                .fill(textColor)
                .attr({
                    'font-size': '14px',
                    'font-family': "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
                    'font-weight': '400',  // 使用 400 正常字重，平衡粗细和对比度
                    'text-anchor': 'start',
                    'dominant-baseline': 'auto'
                });
            
            // 添加文字描边增强对比度
            const isDarkTheme = bgColor.includes('#1') || bgColor.includes('#2') || bgColor.toLowerCase().includes('dark');
            if (isDarkTheme) {
                // 深色主题：添加深色描边
                text.attr({
                    'stroke': '#000000',
                    'stroke-width': '0.5px',
                    'paint-order': 'stroke fill'
                });
            } else {
                // 浅色主题：添加浅色描边
                text.attr({
                    'stroke': '#ffffff',
                    'stroke-width': '0.5px',
                    'paint-order': 'stroke fill'
                });
            }

            setBarDate({ 
                id: props.row[mapFields.value.id], 
                startDate: props.row[mapFields.value.startdate], 
                endDate: props.row[mapFields.value.startdate] // 里程碑的结束日期=开始日期
            });

            // 拖拽功能 - 只能水平移动
            interact(milestoneElement).draggable({
                inertia: false,
                modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
                autoScroll: true,
                listeners: {
                    start: (event: { target: SVGSVGElement }) => {
                        oldMilestoneX.value = Number(event.target.getAttribute('data-x'));
                    },
                    move: (event: { target: SVGSVGElement; dx: number }) => {
                        let x = ((parseFloat(event.target.getAttribute('data-x') || '0') || 0) + event.dx).toString();
                        event.target.style.transform = `translate(${x}px, 0px)`;
                        event.target.setAttribute('data-x', x);
                    },
                    end: (event: { target: SVGSVGElement }) => {
                        let target = event.target;
                        let currentX = parseFloat(target.getAttribute('data-x') || '0') || 0;
                        let multiple = Math.round((currentX - scale.value / 2) / scale.value);
                        let alignedX = multiple * scale.value + scale.value / 2;
                        if (alignedX < scale.value / 2) alignedX = scale.value / 2;
                        if (alignedX > timelineCellCount.value * scale.value) alignedX = timelineCellCount.value * scale.value - scale.value / 2;

                        // 检查父任务约束
                        const parentIdField = mapFields.value.parentId || 'pid';
                        const currentParentId = props.row[parentIdField];
                        if (currentParentId && currentParentId !== '0') {
                            const parentTask = store.tasks.find(t => String(t[mapFields.value.id]) === String(currentParentId));
                            if (parentTask) {
                                let parentStartX = 0;
                                if (mode.value === '季度') {
                                    const ganttStartQuarter = dayjs(props.startGanttDate).startOf('quarter');
                                    const parentStartQuarter = dayjs(parentTask[mapFields.value.startdate]).startOf('quarter');
                                    const quartersDiff = (parentStartQuarter.year() - ganttStartQuarter.year()) * 4 + 
                                                       (parentStartQuarter.quarter() - ganttStartQuarter.quarter());
                                    parentStartX = quartersDiff * scale.value + scale.value / 2;
                                } else if (mode.value === '月') {
                                    const ganttStartMonth = dayjs(props.startGanttDate).startOf('month');
                                    const parentStartMonth = dayjs(parentTask[mapFields.value.startdate]).startOf('month');
                                    const monthsDiff = (parentStartMonth.year() - ganttStartMonth.year()) * 12 + 
                                                       (parentStartMonth.month() - ganttStartMonth.month());
                                    parentStartX = monthsDiff * scale.value + scale.value / 2;
                                } else if (mode.value === '日') {
                                    const isHalfDay = store.daySubMode === 'half';
                                    const cellsPerDay = isHalfDay ? 2 : 1;
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'days') * scale.value * cellsPerDay + scale.value / 2;
                                } else if (mode.value === '周') {
                                    const ganttStartWeek = dayjs(props.startGanttDate).startOf('isoWeek');
                                    const parentStartWeek = dayjs(parentTask[mapFields.value.startdate]).startOf('isoWeek');
                                    parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * scale.value + scale.value / 2;
                                } else if (mode.value === '时') {
                                    parentStartX = dayjs(parentTask[mapFields.value.startdate]).diff(dayjs(props.startGanttDate), 'hours') * scale.value + scale.value / 2;
                                }
                                if (alignedX < parentStartX) alignedX = parentStartX;
                            }
                        }

                        target.style.transform = `translate(${alignedX}px, 0px)`;
                        target.setAttribute('data-x', alignedX.toString());

                        const cellsMoved = Math.round((alignedX - oldMilestoneX.value) / scale.value);
                        let daysOffset = 0, hoursOffset = 0, monthsOffset = 0, quartersOffset = 0;
                        if (mode.value === '季度') quartersOffset = cellsMoved;
                        else if (mode.value === '月') monthsOffset = cellsMoved;
                        else if (mode.value === '日') {
                            const isHalfDay = store.daySubMode === 'half';
                            if (isHalfDay) {
                                // 半天模式：根据最终位置的单元格索引直接计算时间
                                // 里程碑位于单元格中心，所以要减去半个单元格的偏移
                                const newCellIndex = Math.round((alignedX - scale.value / 2) / scale.value);
                                const newDays = Math.floor(newCellIndex / 2);
                                const isAM = (newCellIndex % 2) === 0;
                                const newHour = isAM ? 0 : 12;
                                
                                const newDate = dayjs(props.startGanttDate).add(newDays, 'days').hour(newHour).minute(0).second(0);
                                props.row[mapFields.value.startdate] = newDate.format('YYYY-MM-DD HH:mm:ss');
                                props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                            } else {
                                daysOffset = cellsMoved;
                            }
                        }
                        else if (mode.value === '周') daysOffset = cellsMoved * 7;
                        else if (mode.value === '时') {
                            // 根据时模式的子模式计算时间
                            const hourSubMode = store.hourSubMode || '60';
                            const minuteInterval = parseInt(hourSubMode);
                            
                            if (minuteInterval < 60) {
                                // 15分钟或30分钟模式：根据最终位置的单元格索引直接计算时间
                                const newCellIndex = Math.round(alignedX / scale.value);
                                
                                // 每小时的单元格数
                                const cellsPerHour = 60 / minuteInterval;
                                // 每天的单元格数
                                const cellsPerDay = 24 * cellsPerHour;
                                
                                // 计算新的日期时间
                                const days = Math.floor(newCellIndex / cellsPerDay);
                                const cellInDay = newCellIndex % cellsPerDay;
                                const hour = Math.floor(cellInDay / cellsPerHour);
                                const minute = (cellInDay % cellsPerHour) * minuteInterval;
                                const newDate = dayjs(props.startGanttDate).add(days, 'days').hour(hour).minute(minute).second(0);
                                
                                props.row[mapFields.value.startdate] = newDate.format('YYYY-MM-DD HH:mm:ss');
                                props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                            } else {
                                // 60分钟模式：使用偏移量
                                hoursOffset = cellsMoved;
                            }
                        }
                        
                        // 半天模式和时模式子模式已在上面处理
                        const isHalfDayMode = mode.value === '日' && store.daySubMode === 'half';
                        const isHourSubMode = mode.value === '时' && (store.hourSubMode === '15' || store.hourSubMode === '30');

                        if (mode.value === '季度') {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(quartersOffset, 'quarters').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                        } else if (mode.value === '月') {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(monthsOffset, 'months').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                        } else if (mode.value === '时') {
                            // 使用分钟级别的精度
                            const minutesOffset = Math.round(hoursOffset * 60);
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(minutesOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                        } else if (!isHalfDayMode) {
                            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).add(daysOffset, 'days').format('YYYY-MM-DD HH:mm:ss');
                            props.row[mapFields.value.enddate] = props.row[mapFields.value.startdate];
                        }

                        setBarDate({ 
                            id: props.row[mapFields.value.id], 
                            startDate: props.row[mapFields.value.startdate], 
                            endDate: props.row[mapFields.value.startdate] 
                        });
                    }
                }
            });
        };

        watch(() => [props.row[mapFields.value.startdate]], () => {
            if (milestone.value) drawMilestone(milestone.value);
        }, { deep: false });

        // 监听模式和缩放变化，重新绘制里程碑
        watch([mode, scale], () => {
            if (milestone.value) {
                drawMilestone(milestone.value);
            }
        });

        onMounted(() => {
            if (milestone.value) {
                drawMilestone(milestone.value);
            }
            if (setBarColor) {
                milestoneColor.value = setBarColor(props.row);
                if (milestone.value) drawMilestone(milestone.value);
            }
            
            // 监听主题变化
            if (milestone.value) {
                let ganttContainer = milestone.value.parentElement;
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

        onBeforeUnmount(() => {
            if (milestone.value) { 
                try { interact(milestone.value).unset(); } catch (e) {} 
            }
            showRow.value = false;
        });

        return {
            milestone, showRow, hover, milestoneColor,
            timelineCellCount, scale, mode, mapFields, 
            hoverActive, hoverInactive, WeekEndColor, milestoneRowStyle
        };
    },
})
</script>

<style lang="scss" scoped>
.milestoneRow.active { 
    background: var(--row-hover, #FFF3A1) !important; 
    .cell { 
        background: var(--row-hover, #FFF3A1) !important; 
    } 
}
.milestoneRow {
    display: flex; 
    flex-flow: row nowrap; 
    align-items: center; 
    justify-content: flex-start;
    width: fit-content; 
    position: relative; 
    overflow: visible;
    
    .milestone { 
        position: absolute; 
        z-index: 100; 
        background-color: transparent;
        overflow: visible;
        cursor: move;
    }
    
    &:first-child .cell {
        border-top: none; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 10px;
        position: relative; 
        margin: 0; 
        box-sizing: border-box;
        &:first-child { border-left: 1px solid var(--border, #cecece); }
        &:not(:last-child) { border-right: 1px solid var(--border, #cecece); }
        &:last-child { border-right: 1px solid var(--border, #cecece); }
    }
    
    &:not(:first-child) .cell {
        border-top: 1px solid var(--border, #cecece); 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-size: 10px; 
        position: relative; 
        margin: 0; 
        box-sizing: border-box;
        &:first-child { border-left: 1px solid var(--border, #cecece); }
        &:not(:last-child) { border-right: 1px solid var(--border, #cecece); }
        &:last-child { border-right: 1px solid var(--border, #cecece); }
    }
    
    &:last-child .cell { 
        border-bottom: 1px solid var(--border, #cecece); 
    }
}
</style>
