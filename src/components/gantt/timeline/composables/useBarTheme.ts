import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import { store } from '../../state/Store'
import {
  getWeekendIndices as getWeekendIndicesShared,
  getWeekendColor as getWeekendColorShared,
} from '../../composables/PerformanceConfig'

type ThemeColors = { bgContent: string; bgSecondary: string; borderColor: string }

const findThemeColors = (barEl: SVGSVGElement | null): ThemeColors => {
  let bgContent = '#ffffff',
    bgSecondary = '#f8f8f8',
    borderColor = '#cecece'
  if (!barEl) return { bgContent, bgSecondary, borderColor }

  let element = barEl.parentElement
  while (element) {
    if (element.hasAttribute('data-gantt-theme')) {
      const style = getComputedStyle(element)
      bgContent = style.getPropertyValue('--bg-content').trim() || bgContent
      bgSecondary = style.getPropertyValue('--bg-secondary').trim() || bgSecondary
      borderColor = style.getPropertyValue('--border').trim() || borderColor
      break
    }
    element = element.parentElement
  }
  return { bgContent, bgSecondary, borderColor }
}

export function useBarTheme(bar: Ref<SVGSVGElement | null>, props: { startGanttDate: string | Date; rowHeight: number }) {
  const themeVersion = ref(0)

  const getWeekendIndices = computed(() => {
    return getWeekendIndicesShared(
      props.startGanttDate,
      store.timelineCellCount,
      store.mode,
      store.daySubMode,
      store.hourSubMode
    )
  })

  const barRowStyle = computed(() => {
    themeVersion.value // respond to theme changes
    const cellWidth = store.scale
    const totalWidth = store.timelineCellCount * cellWidth
    const { bgContent, bgSecondary, borderColor } = findThemeColors(bar.value)

    let containerWidth = totalWidth
    if (bar.value) {
      const parentContainer = bar.value.closest('.content') as HTMLElement | null
      if (parentContainer) {
        containerWidth = Math.max(totalWidth, parentContainer.clientWidth)
      }
    }

    let backgroundImage = ''
    if (totalWidth > 0) {
      backgroundImage = `
                repeating-linear-gradient(
                    to right,
                    transparent 0px,
                    transparent ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth - 1}px,
                    ${borderColor} ${cellWidth}px
                )
            `

      if (store.mode === '日' || store.mode === '时') {
        const weekendIndices = getWeekendIndices.value
        if (weekendIndices.length > 0) {
          const weekendRanges: { start: number; end: number }[] = []
          let currentRange: { start: number; end: number } | null = null

          for (const idx of weekendIndices) {
            if (currentRange === null) {
              currentRange = { start: idx, end: idx + 1 }
            } else if (idx === currentRange.end) {
              currentRange.end = idx + 1
            } else {
              weekendRanges.push(currentRange)
              currentRange = { start: idx, end: idx + 1 }
            }
          }
          if (currentRange !== null) {
            weekendRanges.push(currentRange)
          }

          const weekendGradients = weekendRanges.map(range => {
            const start = range.start * cellWidth
            const end = range.end * cellWidth
            return `linear-gradient(to right, transparent ${start}px, ${bgSecondary} ${start}px, ${bgSecondary} ${end - 1}px, ${borderColor} ${end - 1}px, ${borderColor} ${end}px, transparent ${end}px)`
          })
          backgroundImage = weekendGradients.join(', ') + ', ' + backgroundImage
        }
      }
    }

    const extraWidth = containerWidth - totalWidth
    if (extraWidth > 0) {
      if (totalWidth > 0) {
        backgroundImage += `, linear-gradient(to right, transparent ${totalWidth}px, ${bgContent} ${totalWidth}px)`
      } else {
        backgroundImage = `linear-gradient(to right, ${bgContent} 0px, ${bgContent} 100%)`
      }
    }

    return {
      height: props.rowHeight + 'px',
      width: containerWidth + 'px',
      minWidth: containerWidth + 'px',
      background: bgContent,
      backgroundImage,
      backgroundSize: `${containerWidth}px 100%`,
      borderBottom: `1px solid ${borderColor}`,
    }
  })

  const WeekEndColor = (count: number) => {
    themeVersion.value
    const { bgContent, bgSecondary } = findThemeColors(bar.value)
    return getWeekendColorShared(
      count,
      props.startGanttDate,
      store.mode,
      store.daySubMode,
      store.hourSubMode,
      bgContent,
      bgSecondary
    )
  }

  let observer: MutationObserver | null = null
  const setupThemeObserver = () => {
    if (!bar.value) return
    let ganttContainer: HTMLElement | null = bar.value.parentElement
    while (ganttContainer && !ganttContainer.hasAttribute('data-gantt-theme')) {
      ganttContainer = ganttContainer.parentElement
    }
    if (ganttContainer) {
      observer = new MutationObserver(() => {
        themeVersion.value++
      })
      observer.observe(ganttContainer, { attributes: true, attributeFilter: ['data-gantt-theme'] })
    }
  }
  onBeforeUnmount(() => observer?.disconnect())

  return { themeVersion, barRowStyle, WeekEndColor, setupThemeObserver }
}
