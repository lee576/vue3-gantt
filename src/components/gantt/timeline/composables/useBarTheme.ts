import { computed, onBeforeUnmount, ref, type Ref } from 'vue';
import dayjs from 'dayjs';
import { store } from '../../state/Store';
import { svgCache, isWeekend as isWeekendDay } from '../../composables/PerformanceConfig';

type ThemeColors = { bgContent: string; bgSecondary: string; borderColor: string };

const findThemeColors = (barEl: SVGSVGElement | null): ThemeColors => {
    let bgContent = '#ffffff', bgSecondary = '#f8f8f8', borderColor = '#cecece';
    if (!barEl) return { bgContent, bgSecondary, borderColor };

    let element = barEl.parentElement;
    while (element) {
        if (element.hasAttribute('data-gantt-theme')) {
            const style = getComputedStyle(element);
            bgContent = style.getPropertyValue('--bg-content').trim() || bgContent;
            bgSecondary = style.getPropertyValue('--bg-secondary').trim() || bgSecondary;
            borderColor = style.getPropertyValue('--border').trim() || borderColor;
            break;
        }
        element = element.parentElement;
    }
    return { bgContent, bgSecondary, borderColor };
};

export function useBarTheme(bar: Ref<SVGSVGElement | null>, props: any) {
    const themeVersion = ref(0);

    const getWeekendIndices = computed(() => {
        if (store.mode !== '日') return [];
        const indices: number[] = [];
        const isHalfDay = store.daySubMode === 'half';
        const cellsPerDay = isHalfDay ? 2 : 1;

        for (let i = 0; i < store.timelineCellCount; i++) {
            const dayIndex = isHalfDay ? Math.floor(i / cellsPerDay) : i;
            const currentDate = dayjs(props.startGanttDate).add(dayIndex, 'days');
            if (isWeekendDay(currentDate)) indices.push(i);
        }
        return indices;
    });

    const barRowStyle = computed(() => {
        themeVersion.value; // respond to theme changes
        const cellWidth = store.scale;
        const totalWidth = store.timelineCellCount * cellWidth;
        const { bgContent, bgSecondary, borderColor } = findThemeColors(bar.value);

        let containerWidth = totalWidth;
        if (bar.value) {
            const parentContainer = bar.value.closest('.content') as HTMLElement | null;
            if (parentContainer) {
                containerWidth = Math.max(totalWidth, parentContainer.clientWidth);
            }
        }

        let backgroundImage = '';
        if (totalWidth > 0) {
            backgroundImage = `
                repeating-linear-gradient(
                    to right,
                    transparent 0px,
                    transparent ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth}px
                )
            `;

            if (store.mode === '日') {
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
        }

        const extraWidth = containerWidth - totalWidth;
        if (extraWidth > 0) {
            if (totalWidth > 0) {
                backgroundImage += `, linear-gradient(to right, transparent ${totalWidth}px, ${bgContent} ${totalWidth}px)`;
            } else {
                backgroundImage = `linear-gradient(to right, ${bgContent} 0px, ${bgContent} 100%)`;
            }
        }

        return {
            height: props.rowHeight + 'px',
            width: containerWidth + 'px',
            minWidth: containerWidth + 'px',
            background: bgContent,
            backgroundImage,
            backgroundSize: `${containerWidth}px 100%`,
            borderBottom: `1px solid ${borderColor}`
        };
    });

    const WeekEndColor = (count: number) => {
        themeVersion.value;
        const { bgContent, bgSecondary } = findThemeColors(bar.value);
        switch (store.mode) {
            case '季度':
                return bgContent;
            case '月':
                return bgContent;
            case '日': {
                const cacheKey = `weekend-${props.startGanttDate}-${count}-${store.daySubMode}`;
                if (svgCache.has(cacheKey)) {
                    const isWeekendResult = svgCache.get(cacheKey);
                    return isWeekendResult ? bgSecondary : bgContent;
                }
                const isHalfDay = store.daySubMode === 'half';
                const dayIndex = isHalfDay ? Math.floor(count / 2) : count;
                const currentDate = dayjs(props.startGanttDate).add(dayIndex, 'days');
                const isWeekendResult = isWeekendDay(currentDate);
                svgCache.set(cacheKey, isWeekendResult);
                return isWeekendResult ? bgSecondary : bgContent;
            }
            default:
                return bgContent;
        }
    };

    let observer: MutationObserver | null = null;
    const setupThemeObserver = () => {
        if (!bar.value) return;
        let ganttContainer: HTMLElement | null = bar.value.parentElement;
        while (ganttContainer && !ganttContainer.hasAttribute('data-gantt-theme')) {
            ganttContainer = ganttContainer.parentElement;
        }
        if (ganttContainer) {
            observer = new MutationObserver(() => { themeVersion.value++; });
            observer.observe(ganttContainer, { attributes: true, attributeFilter: ['data-gantt-theme', 'style'] });
        }
    };
    onBeforeUnmount(() => observer?.disconnect());

    return { themeVersion, barRowStyle, WeekEndColor, setupThemeObserver };
}
