<template>
    <div v-if='showRow' class="barRow" :style="barRowStyle" @mouseover="hoverActive()"
        @mouseleave="hoverInactive()" :class="{ active: hover }" :data-task-id="row[mapFields.id]">
        <svg key="row.no" v-if='showRow' ref='bar' class="bar" :height="barHeight + 'px'" :class="{ active: hover }"
            style="overflow: visible;"></svg>
        <!-- 使用CSS背景绘制网格，不再渲染大量cell div -->
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
import { Symbols } from '../state/Symbols';
import { useBarGeometry } from './composables/useBarGeometry';
import { useBarTheme } from './composables/useBarTheme';
import { useHover } from './composables/useHover';
import { useProgress } from './composables/useProgress';
import { useInteractions } from './composables/useInteractions';

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
        const showRow = ref(true);
        const hover = ref(false);
        const barColor = ref('');
        const isBarInteracted = ref(false);
        const themeVersion = ref(0);
        
        // 使用 useBarGeometry composables
        const { oldBarDataX, oldBarWidth, computePosition } = useBarGeometry(props, store.mapFields);
        
        // 使用 useBarTheme composables
        const { themeVersion: themeVersionFromComposable, barRowStyle, WeekEndColor: WeekEndColorFromComposable, setupThemeObserver } = useBarTheme(bar, props);
        
        // 更新 themeVersion 以保持兼容性
        watch(() => themeVersionFromComposable.value, () => {
            themeVersion.value = themeVersionFromComposable.value;
        });
        
        const timelineCellCount = computed(() => store.timelineCellCount);
        const scale = computed(() => store.scale);
        const mode = computed(() => store.mode);
        const mapFields = computed(() => store.mapFields);
        // 使用 useProgress composables
        const { progress, isProgressDragging: isProgressDraggingFromComposable, emitProgressUpdate: emitProgressUpdateFromComposable } = useProgress(props, emit, store.mapFields);

        const setBarColor = inject(Symbols.SetBarColorSymbol) as ((row: any) => string) | undefined;

        // 使用 useHover composables
        const { hover: hoverFromComposable, hoverActive, hoverInactive } = useHover(props);

        const setBarDate = mutations.setBarDate;
        const setAllowChangeTaskDate = mutations.setAllowChangeTaskDate;
        
        // 用于存储交互功能
        let drawBarFromComposable: ((barElement?: SVGSVGElement) => void) | null = null;
        let destroyInteractions: (() => void) | null = null;
        
        // 初始化交互功能
        const initInteractions = (barElement: SVGSVGElement) => {
            const interactions = useInteractions({
                bar: barElement,
                barHeight: barHeight.value,
                mapFields: store.mapFields,
                props,
                oldBarDataX,
                oldBarWidth,
                progress,
                barColor,
                isProgressDragging: isProgressDraggingFromComposable,
                emitProgressUpdate: emitProgressUpdateFromComposable,
                computePosition
            });
            drawBarFromComposable = interactions.drawBar;
            destroyInteractions = interactions.destroy;
        };
        
        const drowBar = (barElement: SVGSVGElement) => {
            // 使用 useBarGeometry 的计算结果
            const { dataX, width } = computePosition();
            oldBarDataX.value = dataX;
            oldBarWidth.value = width;
            
            // 设置基本的 SVG 属性
            const borderColor = getComputedStyle(barElement).getPropertyValue('--border') || '#cecece';
            barElement.setAttribute('data-x', dataX.toString());
            barElement.setAttribute('width', oldBarWidth.value.toString());
            barElement.setAttribute('stroke', borderColor);
            barElement.setAttribute('stroke-width', '1px');
            barElement.style.transform = `translate(${dataX}px, 0px)`;
            
            // 初始化交互功能（如果尚未初始化）
            if (!drawBarFromComposable) {
                initInteractions(barElement);
            }
            
            // 调用交互绘制功能
            if (drawBarFromComposable) {
                drawBarFromComposable(barElement);
            }
            
            setBarDate({ id: props.row[mapFields.value.id], startDate: props.row[mapFields.value.startdate], endDate: props.row[mapFields.value.enddate] });
        };

        watch(() => [props.row[mapFields.value.startdate], props.row[mapFields.value.enddate]], () => {
            if (bar.value && isBarInteracted.value) drowBar(bar.value);
        }, { deep: false });

        // 监听模式和缩放变化，重新绘制 bar
        watch([mode, scale], () => {
            if (bar.value && isBarInteracted.value) {
                drowBar(bar.value);
            }
        });

        onMounted(() => {
            if (bar.value && !isBarInteracted.value) {
                drowBar(bar.value);
                isBarInteracted.value = true;
            }
            if (setBarColor) {
                barColor.value = setBarColor(props.row);
                if (bar.value) drowBar(bar.value);
            }
            // 使用 useBarTheme 提供的主题观察器
            if (bar.value) {
                setupThemeObserver();
            }
        });

        onDeactivated(() => {
            if (bar.value) { 
                try { 
                    interact(bar.value).unset(); 
                } catch (e) { 
                    console.warn('Error unsetting interact:', e);
                } 
            }
            showRow.value = false;
        });

        onBeforeUnmount(() => {
            if (bar.value) { 
                try { 
                    interact(bar.value).unset(); 
                } catch (e) { 
                    console.warn('Error unsetting interact:', e);
                } 
            }
            // 清理交互功能
            if (destroyInteractions) {
                destroyInteractions();
            }
            showRow.value = false;
        });

        return {
            bar, barHeight, direction, oldBarDataX, oldBarWidth, showRow, hover: hoverFromComposable, barColor,
            timelineCellCount, scale, mode, mapFields, hoverActive, hoverInactive, WeekEndColor: WeekEndColorFromComposable, barRowStyle
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
    overflow: visible;

    .bar {
        position: absolute;
        z-index: 100;
        background-color: #faf7ec;
        border-radius: 10px;
        overflow: visible;
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

    &:not(:first-child) .cell {
        border-top: 1px solid var(--border, #cecece);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        position: relative;
        margin: 0;
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

    &:last-child .cell {
        border-bottom: 1px solid var(--border, #cecece);
    }
}

.progressHandle {
    pointer-events: auto !important;
    cursor: ew-resize !important;
}
</style>