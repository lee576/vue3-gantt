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
                :style="{ width: scale + 'px', minWidth: scale + 'px', maxWidth: scale + 'px', height: rowHeight + 'px', background: WeekEndColor(count), opacity: 0.4 }">
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
         * 根据日期计算周末的背景颜色
         * 
         * @param {number} count - 日期的偏移量
         * @returns {string | undefined} - 背景颜色
         */
        const WeekEndColor = (count: number) => {
            switch (mode.value) {
                case '月':
                case '日': {
                    // 计算当前日期
                    let currentDate = dayjs(props.startGanttDate).add(count, 'days');
                    // 如果是周六或周日，返回特定的背景颜色
                    if (currentDate.isoWeekday() === 7 || currentDate.isoWeekday() === 1) {
                        return '#F3F4F5';
                    }
                    break;
                }
            }
        };

        // 从 mutations 中获取设置条形图日期的函数
        const setBarDate = mutations.setBarDate;
        // 从 mutations 中获取设置是否允许更改任务日期的函数
        const setAllowChangeTaskDate = mutations.setAllowChangeTaskDate;

        /**
         * 更新条形图的数据和 UI
         * @param {Object} event - 事件对象
         * @param {Object} props - 组件的属性
         * @param {Object} mode - 甘特图的模式
         * @param {Object} scale - 单元格的宽度
         * @param {Object} oldBarDataX - 旧的条形图 X 坐标
         * @param {Object} oldBarWidth - 旧的条形图宽度
         * @param {SVGSVGElement} barElement - SVG 元素
         * @param {Object} barHeight - 条形图的高度
         * @param {Object} mapFields - 映射字段
         * @param {Function} setBarDate - 设置条形图日期的函数
         * @param {boolean} [isResizable=false] - 是否可调整大小
         */
        const updateBarDataAndUI = (
            event: { target: SVGSVGElement; rect: { width: number }; dx: number; edges?: { left: boolean; right: boolean } },
            props: {
                row: Record<string, any>;
                startGanttDate: string;
                endGanttDate: string;
            },
            mode: { value: string },
            scale: { value: number },
            oldBarDataX: { value: number },
            oldBarWidth: { value: number },
            barElement: SVGSVGElement,
            barHeight: { value: number },
            mapFields: { value: Record<string, string> },
            setBarDate: (data: { id: any; startDate: string; endDate: string }) => void,
            isResizable = false
        ) => {
            let target = event.target;
            // 计算新的 X 坐标
            let x = (parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx;
            let width = event.rect.width;

            if (isResizable) {
                // 调整宽度以适应单元格的宽度
                let remainWidth = width % scale.value;
                if (remainWidth !== 0) {
                    let multiple = Math.floor(width / scale.value);
                    if (remainWidth < (scale.value / 2)) {
                        width = multiple * scale.value;
                    } else {
                        width = (multiple + 1) * scale.value;
                    }
                }
                let offsetWidth = oldBarWidth.value - width;
                if (event.edges && event.edges.left) {
                    x += offsetWidth;
                }
                // 更新 SVG 元素的宽度
                target.setAttribute('width', width.toString());
                target.style.width = width + 'px';
            }

            // 更新 SVG 元素的位置
            target.style.transform = `translate(${x}px, 0px)`;
            target.setAttribute('data-x', x.toString());
            // 更新 SVG 元素的文本内容
            target.textContent = Math.round(width) + '\u00D7' + Math.round(barHeight.value);

            // 将 SVGSVGElement 转换为 HTMLElement
            let svg = SVG(barElement as unknown as HTMLElement);

            // 查找现有的元素
            let p = svg.select('pattern').first();
            let g = (svg.children().filter((child) => child.type === 'g')[0] as any) || svg.group();
            let innerRect = svg.select('rect:has(.innerRect)').first();
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

            let innerRectWidth = 0;
            // 根据任务的进度计算内部矩形的宽度
            if (props.row[mapFields.value.progress]) {
                innerRectWidth = Number(width) * Number(props.row[mapFields.value.progress]);
            } else {
                innerRectWidth = Number(width);
            }

            if (!innerRect) {
                innerRect = svg.rect(innerRectWidth, barHeight.value).radius(10);
                if (!innerRect.hasClass('innerRect')) {
                    innerRect.addClass('innerRect');
                    innerRect.fill({ color: barColor.value, opacity: 0.4 });
                    innerRect.width(innerRectWidth);
                    if (!g.has(innerRect)) {
                        g.add(innerRect);
                    }
                }
            }

            if (!outerRect) {
                outerRect = svg.rect(width, barHeight.value).radius(10).fill(p).stroke({ color: '#cecece', width: 1 });
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
                        opacity: 0.4
                    });
                });
            } else {
                outerRect.width(width);
            }

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

            let offsetStart = 0;
            let offsetEnd = 0;
            if (isResizable) {
                if (event.edges && event.edges.left) {
                    // 计算开始日期的偏移量
                    offsetStart = ((oldBarDataX.value - x) / scale.value);
                    if (mode.value === '月' || mode.value === '日') {
                        offsetStart *= 24;
                    }
                } else {
                    // 计算结束日期的偏移量
                    offsetEnd = (oldBarWidth.value - width) / scale.value;
                    if (mode.value === '月' || mode.value === '日') {
                        offsetEnd *= 24;
                    }
                }
            } else {
                // 计算开始和结束日期的偏移量
                offsetStart = (x - oldBarDataX.value) / scale.value;
                offsetEnd = offsetStart;
                if (mode.value === '月' || mode.value === '日') {
                    offsetStart *= 24;
                    offsetEnd *= 24;
                }
            }

            // 更新任务的开始日期
            props.row[mapFields.value.startdate] = dayjs(props.row[mapFields.value.startdate]).locale('zh-cn').add(-offsetStart, 'hours').format('YYYY-MM-DD HH:mm:ss');
            // 更新任务的结束日期
            props.row[mapFields.value.enddate] = dayjs(props.row[mapFields.value.enddate]).locale('zh-cn').add(-offsetEnd, 'hours').format('YYYY-MM-DD HH:mm:ss');

            // 根据甘特图的模式更新任务的耗时信息
            if (mode.value === '月' || mode.value === '日') {
                props.row[mapFields.value.takestime] = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'days') + 1 + '天';
            } else if (mode.value === '时') {
                props.row[mapFields.value.takestime] = dayjs(props.row[mapFields.value.enddate]).diff(dayjs(props.row[mapFields.value.startdate]), 'hours') + 1 + '小时';
            }

            // 设置条形图的日期
            setBarDate({
                id: props.row[mapFields.value.id],
                startDate: props.row[mapFields.value.startdate],
                endDate: props.row[mapFields.value.enddate]
            });
        };

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
            barElement.setAttribute('data-x', dataX.toString());
            barElement.setAttribute('width', oldBarWidth.value.toString());
            barElement.setAttribute('stroke', '#cecece');
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
                outerRect = svg.rect(oldBarWidth.value, barHeight.value).radius(10).fill(p).stroke({ color: '#cecece', width: 1 });
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
                        // 计算新的 X 坐标
                        let x = (parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx;
                        let multiple = Math.floor(x / scale.value);
                        x = multiple * scale.value;
                        if (x > timelineCellCount.value * scale.value) {
                            x = timelineCellCount.value * scale.value;
                        }
                        // 更新 SVG 元素的位置
                        target.style.transform = `translate(${x}px, 0px)`;
                        // 更新 SVG 元素的 data-x 属性
                        target.setAttribute('data-x', x.toString());
                        // 更新条形图的数据和 UI
                        updateBarDataAndUI(event, {
                            row: props.row,
                            startGanttDate: props.startGanttDate || '',
                            endGanttDate: props.endGanttDate || ''
                        }, { value: mode.value || '' }, scale, oldBarDataX, oldBarWidth, barElement, barHeight, mapFields, setBarDate, false);
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
                        // 手动构建符合类型要求的对象
                        const updatedProps = {
                            row: props.row,
                            startGanttDate: props.startGanttDate as string,
                            endGanttDate: props.endGanttDate as string
                        };
                        // 更新条形图的数据和 UI
                        updateBarDataAndUI(event, updatedProps, { value: mode.value || '' }, scale, oldBarDataX, oldBarWidth, barElement, barHeight, mapFields, setBarDate, true);
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

        // 组件挂载后执行的钩子函数
        onMounted(() => {
            console.log(`[BarFix] Component mounted, task: ${props.row[mapFields.value.id]}, mode: ${store.mode}`);
            if (bar.value && !isBarInteracted.value) {
                // 绘制条形图
                drowBar(bar.value);
                // 设置标志变量为 true，表示元素已经设置了交互
                isBarInteracted.value = true;
                console.log(`[BarFix] Initial bar drawn, width: ${bar.value.getAttribute('width')}`);
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
.active {
    background: #FFF3A1;
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
                border-left: 1px solid #cecece;
            }

            &:not(:last-child) {
                border-right: 1px solid #cecece;
            }

            &:last-child {
                border-right: 1px solid #cecece;
            }
        }
    }

    &:not(:first-child) {

        .cell {
            // 为 .cell 添加顶部和底部的伪元素来显示边框
            border-top: 1px solid #cecece;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            // 顶部和底部边框通过伪元素实现，不影响宽度
            position: relative;
            margin: 0px 0px 0px 0px;
            box-sizing: border-box;

            &:first-child {
                border-left: 1px solid #cecece;
            }

            &:not(:last-child) {
                border-right: 1px solid #cecece;
            }

            &:last-child {
                border-right: 1px solid #cecece;
            }
        }
    }

    &:last-child {
        .cell {
            border-bottom: 1px solid #cecece;
        }
    }
}
</style>