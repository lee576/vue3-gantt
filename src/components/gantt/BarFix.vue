<template>
    <!-- 如果 showRow 为 true，则渲染 barRow 容器 -->
    <div v-if='showRow' class="barRow" :style="{ height: rowHeight + 'px' }" @mouseover="hoverActive()"
        @mouseleave="hoverInactive()" :class="{ active: hover }">
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
import { defineComponent, watch, ref, computed } from 'vue';

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
// 扩展 dayjs 功能，使其支持 ISO 周
dayjs.extend(isoWeek);
import { store, } from './Store';
import sharedState from '../gantt/ShareState';

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

        // 计算时间轴单元格的数量
        const timelineCellCount = computed(() => store.timelineCellCount);
        // 计算每个单元格的宽度
        const scale = computed(() => store.scale);
        // 计算甘特图的模式（月、日、时）
        const mode = computed(() => store.mode);
        // 计算映射字段
        const mapFields = computed(() => store.mapFields);

        watch(() => sharedState.highlightedId, (newId) => {
            if (props.row[mapFields.value['id']] === newId) {
                hover.value = true;
            } else {
                hover.value = false;
            }
        });

        const hoverActive = () => {
            sharedState.triggerHighlight(props.row[mapFields.value.id] as number|null);
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