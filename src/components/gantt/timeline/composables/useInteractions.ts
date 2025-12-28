import SVG from 'svg.js'
import interact from 'interactjs'
import DateUtils from '../../utils/dateUtils'
import { store, mutations } from '../../state/Store'
import { t } from '../../i18n'
import type { GanttTask, GanttMapFields } from '../../types/GanttTypes'

type InteractionDeps = {
  bar: SVGSVGElement
  barHeight: number
  mapFields: GanttMapFields
  props: { row: GanttTask; startGanttDate: string | Date }
  oldBarDataX: { value: number }
  oldBarWidth: { value: number }
  progress: { value: string }
  barColor: { value: string }
  isProgressDragging: { value: boolean }
  emitProgressUpdate: (p: number) => void
  computePosition: () => { dataX: number; width: number }
}

export function useInteractions(deps: InteractionDeps) {
  const {
    bar,
    barHeight,
    mapFields,
    props,
    oldBarDataX,
    oldBarWidth,
    progress,
    barColor,
    isProgressDragging,
    emitProgressUpdate,
    computePosition,
  } = deps
  const { setBarDate, setAllowChangeTaskDate } = mutations

  const drawBar = () => {
    const { dataX, width } = computePosition()
    const svg = SVG(bar as unknown as HTMLElement)
    const borderColor = getComputedStyle(bar).getPropertyValue('--border') || '#cecece'

    bar.setAttribute('data-x', dataX.toString())
    bar.setAttribute('width', width.toString())
    bar.setAttribute('stroke', borderColor)
    bar.setAttribute('stroke-width', '1px')
    bar.style.transform = `translate(${dataX}px, 0px)`
    bar.style.cursor = 'move'
    bar.style.pointerEvents = 'auto'
    bar.style.touchAction = 'none'

    let pattern = svg.select('pattern').first()
    let group = (svg.children().filter(child => child.type === 'g')[0] as any) || svg.group()
    let innerRect = svg.select('.innerRect').first()
    let outerRect = svg.select('rect:not(.innerRect):not(.progressHandle)').first()
    let text = svg.select('text').first()
    let progressHandle = svg.select('.progressHandle').first()

    if (!pattern) {
      pattern = svg.pattern(10, 10, add => {
        ;(add as any)
          .path('M10 -5 -10,15M15,0,0,15M0 -5 -20,15')
          .fill('none')
          .stroke({ color: 'gray', opacity: 0.4, width: 5 })
      })
    }
    if (!group) group = svg.group()

    const innerRectWidth = props.row[mapFields.progress]
      ? Number(width) * Number(props.row[mapFields.progress])
      : Number(width)
    const baseFill = barColor.value || '#0066ff'

    if (!innerRect) {
      innerRect = svg.rect(innerRectWidth, barHeight).radius(10)
      innerRect.addClass('innerRect')
      innerRect.fill({ color: baseFill, opacity: 0.4 })
      group.add(innerRect)
    } else {
      innerRect.fill({ color: baseFill, opacity: 0.4 })
      innerRect.width(innerRectWidth)
    }

    if (!outerRect) {
      outerRect = svg
        .rect(width, barHeight)
        .radius(10)
        .fill(pattern)
        .stroke({ color: borderColor, width: 1 })
      outerRect.on('mouseover', () =>
        outerRect.animate(200).attr({ stroke: '#000', strokeWidth: 2, opacity: 1 })
      )
      outerRect.on('mouseleave', () =>
        outerRect.animate(200).attr({ stroke: '#0066ff', strokeWidth: 10, opacity: 0.4 })
      )
    } else {
      outerRect.width(width)
    }
    try {
      ;(outerRect as any).node.style.cursor = 'move'
      ;(outerRect as any).node.style.pointerEvents = 'visible'
    } catch (e) {
      /* ignore */
    }

    // 创建左右resize handle
    let leftHandle = svg.select('.resize-handle-left').first()
    let rightHandle = svg.select('.resize-handle-right').first()

    if (!leftHandle) {
      leftHandle = svg.rect(6, barHeight).addClass('resize-handle-left')
      leftHandle.attr({
        fill: '#0066ff',
        opacity: 0,
        cursor: 'ew-resize',
      })
      leftHandle.x(0)
      leftHandle.y(0)
    } else {
      leftHandle.width(6)
      leftHandle.height(barHeight)
    }

    if (!rightHandle) {
      rightHandle = svg.rect(6, barHeight).addClass('resize-handle-right')
      rightHandle.attr({
        fill: '#0066ff',
        opacity: 0,
        cursor: 'ew-resize',
      })
      rightHandle.x(width - 6)
      rightHandle.y(0)
    } else {
      rightHandle.width(6)
      rightHandle.height(barHeight)
      rightHandle.x(width - 6)
    }

    if (!text) {
      text = svg.text(progress.value).stroke('#faf7ec')
    } else {
      ;(text as any).text(progress.value)
    }
    const textBBox = text.bbox()
    ;(text as any)
      .font({ size: 15, anchor: 'middle', leading: '1em' })
      .fill('#000')
      .attr('opacity', 1)
      .attr('dominant-baseline', 'middle')
      .center(innerRect.width() / 2 + textBBox.width / 2, innerRect.height() / 2)

    const handleWidth = 14
    const handleHeight = 10
    const handleX = innerRectWidth - handleWidth / 2
    const handleY = barHeight - handleHeight / 2
    const lineX = innerRectWidth

    const getThemeColors = () => {
      let primary = '#f59e0b',
        primaryDark = '#d97706',
        primaryLight = '#fbbf24'
      let element = bar.parentElement as HTMLElement | null
      while (element) {
        if (element.hasAttribute('data-gantt-theme')) {
          const style = getComputedStyle(element)
          primary = style.getPropertyValue('--primary').trim() || primary
          primaryDark = style.getPropertyValue('--primary-dark').trim() || primaryDark
          primaryLight = style.getPropertyValue('--primary-light').trim() || primaryLight
          break
        }
        element = element.parentElement
      }
      return { primary, primaryDark, primaryLight }
    }

    let guideLineEl = bar.querySelector('.progressGuideLine') as SVGLineElement | null
    let guideLineHitArea = bar.querySelector('.progressGuideLineHitArea') as SVGRectElement | null
    const themeColors = getThemeColors()

    if (!guideLineEl) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('class', 'progressGuideLine')
      line.setAttribute('x1', String(lineX))
      line.setAttribute('y1', '0')
      line.setAttribute('x2', String(lineX))
      line.setAttribute('y2', String(handleY))
      line.setAttribute('stroke', themeColors.primaryDark)
      line.setAttribute('stroke-width', '2')
      line.setAttribute('stroke-dasharray', '4,3')
      line.setAttribute('opacity', '0.8')
      line.style.pointerEvents = 'none'
      bar.appendChild(line)
      guideLineEl = line

      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      hitArea.setAttribute('class', 'progressGuideLineHitArea')
      hitArea.setAttribute('x', String(lineX - 8))
      hitArea.setAttribute('y', '0')
      hitArea.setAttribute('width', '16')
      hitArea.setAttribute('height', String(handleY))
      hitArea.setAttribute('fill', 'transparent')
      hitArea.setAttribute('stroke', 'none')
      hitArea.style.pointerEvents = 'all'
      hitArea.style.cursor = 'ew-resize'
      bar.insertBefore(hitArea, line)
      guideLineHitArea = hitArea

      let hitAreaCurrentX = lineX

      interact(hitArea).draggable({
        cursorChecker: () => 'ew-resize',
        inertia: false,
        listeners: {
          start: () => {
            hitAreaCurrentX = (hitArea as any).hitAreaCurrentX || lineX
            isProgressDragging.value = true
            const colors = getThemeColors()
            guideLineEl!.setAttribute('stroke', colors.primary)
            guideLineEl!.setAttribute('stroke-width', '3')
            guideLineEl!.setAttribute('opacity', '1')
          },
          move: event => {
            hitAreaCurrentX += event.dx
            hitAreaCurrentX = Math.max(0, Math.min(hitAreaCurrentX, oldBarWidth.value))
            const newLineX = hitAreaCurrentX
            guideLineEl!.setAttribute('x1', String(newLineX))
            guideLineEl!.setAttribute('x2', String(newLineX))
            hitArea.setAttribute('x', String(newLineX - 8))
            if (progressHandle) {
              const handleX = newLineX - handleWidth / 2
              progressHandle.move(handleX, handleY)
            }
            const newProgress = Math.min(1, Math.max(0, newLineX / oldBarWidth.value))
            innerRect.width(newProgress * oldBarWidth.value)
            ;(text as any).text((newProgress * 100).toFixed(2) + '%')
            ;(text as any).center(
              innerRect.width() / 2 + textBBox.width / 2,
              innerRect.height() / 2
            )
          },
          end: () => {
            isProgressDragging.value = false
            const colors = getThemeColors()
            guideLineEl!.setAttribute('stroke', colors.primaryDark)
            guideLineEl!.setAttribute('stroke-width', '2')
            guideLineEl!.setAttribute('opacity', '0.8')
            ;(hitArea as any).hitAreaCurrentX = hitAreaCurrentX
            const newProgress = Math.min(1, Math.max(0, hitAreaCurrentX / oldBarWidth.value))
            props.row[mapFields.progress] = newProgress
            emitProgressUpdate(newProgress)
          },
        },
      })
    }
    guideLineEl.setAttribute('x1', String(lineX))
    guideLineEl.setAttribute('x2', String(lineX))
    guideLineEl.setAttribute('y2', String(handleY))
    guideLineEl.setAttribute('stroke', themeColors.primaryDark)
    guideLineEl.setAttribute('opacity', '0.8')

    if (guideLineHitArea) {
      guideLineHitArea.setAttribute('x', String(lineX - 8))
      guideLineHitArea.setAttribute('height', String(handleY))
      ;(guideLineHitArea as any).hitAreaCurrentX = lineX
    }

    if (!progressHandle) {
      const trianglePoints = `${handleWidth / 2},0 0,${handleHeight} ${handleWidth},${handleHeight}`

      progressHandle = svg
        .polygon(trianglePoints)
        .fill(themeColors.primary)
        .stroke({ color: '#ffffff', width: 1.5 })
        .addClass('progressHandle')

      progressHandle.front()

      const filterId = `progress-handle-shadow-${Math.random().toString(36).substr(2, 9)}`
      const defs = svg.defs()
      const filter = (defs as any).element('filter')
      filter.attr({ id: filterId, x: '-50%', y: '-50%', width: '200%', height: '200%' })

      const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow')
      feDropShadow.setAttribute('dx', '0')
      feDropShadow.setAttribute('dy', '1')
      feDropShadow.setAttribute('stdDeviation', '1')
      feDropShadow.setAttribute('flood-color', '#000000')
      feDropShadow.setAttribute('flood-opacity', '0.15')
      filter.node.appendChild(feDropShadow)

      progressHandle.attr({ filter: `url(#${filterId})` })

      const handleElement = progressHandle.node as unknown as SVGPolygonElement
      handleElement.style.cursor = 'ew-resize'
      handleElement.style.pointerEvents = 'all'
      handleElement.style.transition = 'fill 0.2s ease, stroke-width 0.2s ease'
      progressHandle.move(handleX, handleY)

      let currentHandleX = handleX

      handleElement.addEventListener('mouseenter', () => {
        if (!isProgressDragging.value) {
          const colors = getThemeColors()
          bar.style.cursor = 'ew-resize'
          handleElement.style.cursor = 'ew-resize'
          handleElement.setAttribute('fill', colors.primaryDark)
          handleElement.setAttribute('stroke-width', '2')
          guideLineEl!.setAttribute('stroke', colors.primaryLight)
          guideLineEl!.setAttribute('stroke-width', '2.5')
          guideLineEl!.setAttribute('opacity', '1')
        }
      })
      handleElement.addEventListener('mouseleave', () => {
        if (!isProgressDragging.value) {
          const colors = getThemeColors()
          bar.style.cursor = 'move'
          handleElement.setAttribute('fill', colors.primary)
          handleElement.setAttribute('stroke-width', '1.5')
          guideLineEl!.setAttribute('stroke', colors.primaryDark)
          guideLineEl!.setAttribute('stroke-width', '2')
          guideLineEl!.setAttribute('opacity', '0.8')
        }
      })

      interact(handleElement).draggable({
        cursorChecker: () => 'ew-resize',
        inertia: false,
        listeners: {
          start: () => {
            isProgressDragging.value = true
            const colors = getThemeColors()
            handleElement.setAttribute('fill', colors.primaryDark)
            handleElement.setAttribute('stroke-width', '2')
            guideLineEl!.setAttribute('stroke', colors.primary)
            guideLineEl!.setAttribute('stroke-width', '3')
            guideLineEl!.setAttribute('opacity', '1')
          },
          move: event => {
            currentHandleX += event.dx
            currentHandleX = Math.max(
              -handleWidth / 2,
              Math.min(currentHandleX, oldBarWidth.value - handleWidth / 2)
            )
            progressHandle.move(currentHandleX, handleY)
            const newLineX = currentHandleX + handleWidth / 2
            guideLineEl!.setAttribute('x1', String(newLineX))
            guideLineEl!.setAttribute('x2', String(newLineX))
            const hitArea = bar.querySelector('.progressGuideLineHitArea') as SVGRectElement | null
            if (hitArea) {
              hitArea.setAttribute('x', String(newLineX - 8))
            }
            const newProgress = Math.min(
              1,
              Math.max(0, (currentHandleX + handleWidth / 2) / oldBarWidth.value)
            )
            innerRect.width(newProgress * oldBarWidth.value)
            ;(text as any).text((newProgress * 100).toFixed(2) + '%')
            ;(text as any).center(
              innerRect.width() / 2 + textBBox.width / 2,
              innerRect.height() / 2
            )
          },
          end: () => {
            isProgressDragging.value = false
            const colors = getThemeColors()
            handleElement.setAttribute('fill', colors.primary)
            handleElement.setAttribute('stroke-width', '1.5')
            guideLineEl!.setAttribute('stroke', colors.primaryDark)
            guideLineEl!.setAttribute('stroke-width', '2')
            guideLineEl!.setAttribute('opacity', '0.8')
            const newProgress = Math.min(
              1,
              Math.max(0, (currentHandleX + handleWidth / 2) / oldBarWidth.value)
            )
            props.row[mapFields.progress] = newProgress
            emitProgressUpdate(newProgress)
          },
        },
      })
    } else {
      progressHandle.move(handleX, handleY)
      progressHandle.front()

      const handleElement = progressHandle.node as unknown as SVGPolygonElement
      handleElement.setAttribute('fill', themeColors.primary)
      handleElement.setAttribute('stroke', '#ffffff')
      handleElement.setAttribute('stroke-width', '1.5')

      const hitArea = bar.querySelector('.progressGuideLineHitArea') as SVGRectElement | null
      if (hitArea) {
        hitArea.setAttribute('x', String(lineX - 8))
        hitArea.setAttribute('height', String(handleY))
        ;(hitArea as any).hitAreaCurrentX = lineX
      }

      guideLineEl!.setAttribute('x1', String(lineX))
      guideLineEl!.setAttribute('x2', String(lineX))
    }

    // 更新resize handle的位置（如果它们存在）
    if (leftHandle) {
      leftHandle.x(0)
      leftHandle.y(0)
    }

    if (rightHandle) {
      rightHandle.x(width - 6)
      rightHandle.y(0)
    }

    setBarDate({
      id: props.row[mapFields.id],
      startDate: props.row[mapFields.startdate],
      endDate: props.row[mapFields.enddate],
    })

    // 配置 interact.js 同时支持拖拽和调整大小
    interact(bar)
      .resizable({
        edges: { left: '.resize-handle-left', right: '.resize-handle-right' },
        // 限制resize handle的大小
        invert: 'reposition',
        listeners: {
          start: event => {
            if (isProgressDragging.value) return
            oldBarDataX.value = Number(event.target.getAttribute('data-x'))
            oldBarWidth.value = event.target.width.baseVal.value
          },
          move: event => {
            if (isProgressDragging.value) return
            const { edges } = event
            const target = event.target
            let x = parseFloat(target.getAttribute('data-x'))
            let width = target.width.baseVal.value

            if (edges.left) {
              const newWidth = width - event.dx
              if (newWidth > store.scale) {
                // 最小宽度限制
                width = newWidth
                x = ((parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx).toString()
                target.setAttribute('data-x', x)
              }
            } else if (edges.right) {
              const newWidth = width + event.dx
              if (newWidth > store.scale) {
                // 最小宽度限制
                width = newWidth
              }
            }

            target.style.width = `${width}px`
            target.style.transform = `translate(${x}px, 0px)`
            target.setAttribute('width', width.toString())

            // 更新SVG内部元素的宽度
            const svg = SVG(target as unknown as HTMLElement)
            const innerRect = svg.select('.innerRect').first()
            const outerRect = svg.select('rect:not(.innerRect):not(.progressHandle)').first()

            if (innerRect) {
              // 计算内部矩形的宽度（基于进度）
              const progressValue = props.row[mapFields.progress] || 0
              const innerRectWidth = width * progressValue
              innerRect.width(innerRectWidth)

              // 更新文本位置
              const text = svg.select('text').first()
              if (text) {
                const textBBox = text.bbox()
                ;(text as any).center(innerRect.width() / 2 + textBBox.width / 2, barHeight / 2)
              }
            }

            if (outerRect) {
              outerRect.width(width)
            }

            // 更新resize handle的位置
            const leftHandle = svg.select('.resize-handle-left').first()
            const rightHandle = svg.select('.resize-handle-right').first()

            if (leftHandle) {
              leftHandle.x(0)
              leftHandle.y(0)
            }

            if (rightHandle) {
              rightHandle.x(width - 6)
              rightHandle.y(0)
            }

            // 更新进度手柄和虚线的位置（根据进度百分比）
            const progressHandle = svg.select('.progressHandle').first()
            if (progressHandle && innerRect) {
              const handleX = innerRect.width() - handleWidth / 2
              const handleY = barHeight - handleHeight / 2
              progressHandle.move(handleX, handleY)

              const lineX = innerRect.width()
              const hitArea = bar.querySelector(
                '.progressGuideLineHitArea'
              ) as SVGRectElement | null
              if (hitArea) {
                hitArea.setAttribute('x', String(lineX - 8))
                hitArea.setAttribute('height', String(handleY))
                ;(hitArea as any).hitAreaCurrentX = lineX
              }
              guideLineEl!.setAttribute('x1', String(lineX))
              guideLineEl!.setAttribute('x2', String(lineX))
            }
          },
          end: event => {
            if (isProgressDragging.value) return
            const target = event.target
            let currentX = parseFloat(target.getAttribute('data-x') || '0') || 0
            let currentWidth = target.width.baseVal.value

            // 对齐到网格 - 根据模式确定对齐粒度
            let alignedX = currentX
            let alignedWidth = currentWidth

            if (store.mode === '日' && store.daySubMode === 'half') {
              // 日模式下的半天模式：每个单元格代表半天（上午/下午）
              const cellsPerDay = 2 // 上午和下午各一个单元格
              const cellWidth = store.scale
              alignedX = Math.round(currentX / cellWidth) * cellWidth
              alignedWidth = Math.round(currentWidth / cellWidth) * cellWidth
            } else if (store.mode === '时') {
              // 时模式下的子模式：15分钟或30分钟
              const hourSubMode = store.hourSubMode || '60'
              const minuteInterval = parseInt(hourSubMode)
              if (minuteInterval < 60) {
                // 15分钟或30分钟模式
                const cellsPerHour = 60 / minuteInterval
                const cellWidth = store.scale
                alignedX = Math.round(currentX / cellWidth) * cellWidth
                alignedWidth = Math.round(currentWidth / cellWidth) * cellWidth
              } else {
                // 标准时模式
                const cellWidth = store.scale
                alignedX = Math.round(currentX / cellWidth) * cellWidth
                alignedWidth = Math.round(currentWidth / cellWidth) * cellWidth
              }
            } else {
              // 其他模式使用标准对齐
              const cellWidth = store.scale
              alignedX = Math.round(currentX / cellWidth) * cellWidth
              alignedWidth = Math.round(currentWidth / cellWidth) * cellWidth
            }

            if (alignedX < 0) alignedX = 0

            // 确保不会超出父容器边界
            const maxX = store.timelineCellCount * store.scale
            if (alignedX + alignedWidth > maxX) {
              alignedX = maxX - alignedWidth
              if (alignedX < 0) alignedX = 0
            }

            target.style.width = `${alignedWidth}px`
            target.style.transform = `translate(${alignedX}px, 0px)`
            target.setAttribute('data-x', alignedX.toString())
            target.setAttribute('width', alignedWidth.toString())

            // 更新任务的开始和结束日期
            let newStartDate: string = props.row[mapFields.startdate]
            let newEndDate: string = props.row[mapFields.enddate]

            if (store.mode === '季度') {
              // 季度模式：按月计算
              const ganttStartMonth = DateUtils.startOf(props.startGanttDate, 'month')
              newStartDate = ganttStartMonth
                .add(alignedX / store.scale, 'months')
                .format('YYYY-MM-DD HH:mm:ss')
              newEndDate = ganttStartMonth
                .add((alignedX + alignedWidth) / store.scale - 1, 'months')
                .endOf('month')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.takestime] =
                Math.round((alignedX + alignedWidth) / store.scale - alignedX / store.scale + 1) +
                t('durationUnit.months')
            } else if (store.mode === '月') {
              const ganttStartMonth = DateUtils.startOf(props.startGanttDate, 'month')
              newStartDate = ganttStartMonth
                .add(alignedX / store.scale, 'months')
                .format('YYYY-MM-DD HH:mm:ss')
              newEndDate = ganttStartMonth
                .add((alignedX + alignedWidth) / store.scale - 1, 'months')
                .endOf('month')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.takestime] =
                Math.round((alignedX + alignedWidth) / store.scale - alignedX / store.scale + 1) +
                t('durationUnit.months')
            } else if (store.mode === '日' && store.daySubMode === 'half') {
              // 日模式下的半天模式
              const cellsPerDay = 2 // 每天2个单元格（上午/下午）
              const startCellIndex = Math.round(alignedX / store.scale)
              const barWidthCells = Math.round(alignedWidth / store.scale)
              const endCellIndex = startCellIndex + barWidthCells - 1

              // 计算开始日期
              const startDays = Math.floor(startCellIndex / cellsPerDay)
              const startIsAM = startCellIndex % cellsPerDay === 0
              newStartDate = DateUtils.create(props.startGanttDate)
                .add(startDays, 'days')
                .hour(startIsAM ? 0 : 12)
                .minute(0)
                .second(0)
                .format('YYYY-MM-DD HH:mm:ss')

              // 计算结束日期
              const endDays = Math.floor(endCellIndex / cellsPerDay)
              const endIsPM = endCellIndex % cellsPerDay === 1
              newEndDate = DateUtils.create(props.startGanttDate)
                .add(endDays, 'days')
                .hour(endIsPM ? 23 : 11)
                .minute(endIsPM ? 59 : 59)
                .second(59)
                .format('YYYY-MM-DD HH:mm:ss')

              // 计算持续时间（天数）
              const durationDays = endDays - startDays + 1
              props.row[mapFields.takestime] = durationDays + t('durationUnit.days')
            } else if (store.mode === '日') {
              newStartDate = DateUtils.create(props.startGanttDate)
                .add(alignedX / store.scale, 'days')
                .format('YYYY-MM-DD HH:mm:ss')
              newEndDate = DateUtils.create(props.startGanttDate)
                .add((alignedX + alignedWidth) / store.scale - 1, 'days')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.takestime] =
                Math.round((alignedX + alignedWidth) / store.scale - alignedX / store.scale + 1) +
                t('durationUnit.days')
            } else if (store.mode === '周') {
              const ganttStartWeek = DateUtils.startOf(props.startGanttDate, 'isoWeek')
              newStartDate = ganttStartWeek
                .add(alignedX / store.scale, 'weeks')
                .format('YYYY-MM-DD HH:mm:ss')
              newEndDate = ganttStartWeek
                .add((alignedX + alignedWidth) / store.scale - 1, 'weeks')
                .endOf('isoWeek')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.takestime] =
                Math.round((alignedX + alignedWidth) / store.scale - alignedX / store.scale + 1) +
                t('durationUnit.weeks')
            } else if (store.mode === '时') {
              const hourSubMode = store.hourSubMode || '60'
              const minuteInterval = parseInt(hourSubMode)
              if (minuteInterval < 60) {
                // 15分钟或30分钟模式
                const cellsPerHour = 60 / minuteInterval
                const cellsPerDay = 24 * cellsPerHour

                const startCellIndex = Math.round(alignedX / store.scale)
                const barWidthCells = Math.round(alignedWidth / store.scale)
                const endCellIndex = startCellIndex + barWidthCells - 1

                // 计算开始时间
                const startDays = Math.floor(startCellIndex / cellsPerDay)
                const startCellInDay = startCellIndex % cellsPerDay
                const startHour = Math.floor(startCellInDay / cellsPerHour)
                const startMinute = (startCellInDay % cellsPerHour) * minuteInterval
                newStartDate = DateUtils.create(props.startGanttDate)
                  .add(startDays, 'days')
                  .hour(startHour)
                  .minute(startMinute)
                  .second(0)
                  .format('YYYY-MM-DD HH:mm:ss')

                // 计算结束时间
                const endDays = Math.floor(endCellIndex / cellsPerDay)
                const endCellInDay = endCellIndex % cellsPerDay
                const endHour = Math.floor(endCellInDay / cellsPerHour)
                const endMinute =
                  (endCellInDay % cellsPerHour) * minuteInterval + minuteInterval - 1
                newEndDate = DateUtils.create(props.startGanttDate)
                  .add(endDays, 'days')
                  .hour(endHour)
                  .minute(endMinute)
                  .second(59)
                  .format('YYYY-MM-DD HH:mm:ss')

                // 计算持续时间
                const totalMinutes = (endCellIndex - startCellIndex + 1) * minuteInterval
                const totalHours = Math.floor(totalMinutes / 60)
                const remainMinutes = totalMinutes % 60
                if (totalHours > 0 && remainMinutes > 0) {
                  props.row[mapFields.takestime] = t('durationUnit.hoursAndMinutes', {
                    hours: totalHours,
                    minutes: remainMinutes,
                  })
                } else if (totalHours > 0) {
                  props.row[mapFields.takestime] = `${totalHours}${t('durationUnit.hours')}`
                } else {
                  props.row[mapFields.takestime] = `${remainMinutes}${t('durationUnit.minutes')}`
                }
              } else {
                // 标准时模式
                newStartDate = DateUtils.create(props.startGanttDate)
                  .add(alignedX / store.scale, 'hours')
                  .format('YYYY-MM-DD HH:mm:ss')
                newEndDate = DateUtils.create(props.startGanttDate)
                  .add((alignedX + alignedWidth) / store.scale - 1, 'hours')
                  .format('YYYY-MM-DD HH:mm:ss')
                props.row[mapFields.takestime] =
                  Math.round((alignedX + alignedWidth) / store.scale - alignedX / store.scale + 1) +
                  t('durationUnit.hours')
              }
            }

            props.row[mapFields.startdate] = newStartDate
            props.row[mapFields.enddate] = newEndDate

            // 更新SVG内部元素的宽度和handle位置
            const svg = SVG(target as unknown as HTMLElement)
            const leftHandle = svg.select('.resize-handle-left').first()
            const rightHandle = svg.select('.resize-handle-right').first()

            if (leftHandle) {
              leftHandle.x(0)
              leftHandle.y(0)
            }

            if (rightHandle) {
              rightHandle.x(alignedWidth - 6)
              rightHandle.y(0)
            }

            // 更新进度手柄和虚线的位置（根据进度百分比）
            const progressHandle = svg.select('.progressHandle').first()
            if (progressHandle) {
              const innerRect = svg.select('.innerRect').first()
              if (innerRect) {
                const handleX = innerRect.width() - handleWidth / 2
                const handleY = barHeight - handleHeight / 2
                progressHandle.move(handleX, handleY)

                const lineX = innerRect.width()
                const hitArea = bar.querySelector(
                  '.progressGuideLineHitArea'
                ) as SVGRectElement | null
                if (hitArea) {
                  hitArea.setAttribute('x', String(lineX - 8))
                  hitArea.setAttribute('height', String(handleY))
                  ;(hitArea as any).hitAreaCurrentX = lineX
                }
                guideLineEl!.setAttribute('x1', String(lineX))
                guideLineEl!.setAttribute('x2', String(lineX))
              }
            }

            setBarDate({
              id: props.row[mapFields.id],
              startDate: newStartDate,
              endDate: newEndDate,
            })
          },
        },
        modifiers: [
          interact.modifiers.restrictEdges({
            outer: 'parent',
          }),
          interact.modifiers.restrictSize({
            min: { width: store.scale, height: barHeight },
          }),
        ],
        inertia: false,
      })
      .draggable({
        inertia: false,
        modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
        autoScroll: true,
        listeners: {
          start: event => {
            if (isProgressDragging.value) return
            oldBarDataX.value = Number(event.target.getAttribute('data-x'))
            oldBarWidth.value = event.target.width.baseVal.value
          },
          move: event => {
            if (isProgressDragging.value) return
            const x = (
              (parseFloat(event.target.getAttribute('data-x') || '0') || 0) + event.dx
            ).toString()
            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
              height: `${event.rect.height}px`,
              transform: `translate(${x}px, 0px)`,
            })
            event.target.setAttribute('data-x', x)
            event.target.setAttribute('data-y', '0')
          },
          end: event => {
            if (isProgressDragging.value) return
            const target = event.target
            let currentX = parseFloat(target.getAttribute('data-x') || '0') || 0
            let multiple = Math.round(currentX / store.scale)
            let alignedX = multiple * store.scale
            if (alignedX < 0) alignedX = 0

            const maxX = store.timelineCellCount * store.scale
            if (alignedX + oldBarWidth.value > maxX) {
              alignedX = maxX - oldBarWidth.value
              if (alignedX < 0) alignedX = 0
            }

            const parentIdField = mapFields.parentId || 'pid'
            const currentParentId = props.row[parentIdField]
            if (currentParentId && currentParentId !== '0') {
              const parentTask = store.tasks.find(
                (t: GanttTask) => String(t[mapFields.id]) === String(currentParentId)
              )
              if (parentTask) {
                let parentStartX = 0
                if (store.mode === '季度' || store.mode === '月') {
                  const ganttStartMonth = DateUtils.startOf(props.startGanttDate, 'month')
                  const parentStartMonth = DateUtils.startOf(parentTask[mapFields.startdate], 'month')
                  const monthsDiff =
                    (parentStartMonth.year() - ganttStartMonth.year()) * 12 +
                    (parentStartMonth.month() - ganttStartMonth.month())
                  parentStartX = monthsDiff * store.scale
                } else if (store.mode === '日') {
                  parentStartX =
                    DateUtils.diff(parentTask[mapFields.startdate], props.startGanttDate, 'days') * store.scale
                } else if (store.mode === '周') {
                  const ganttStartWeek = DateUtils.startOf(props.startGanttDate, 'isoWeek')
                  const parentStartWeek = DateUtils.startOf(parentTask[mapFields.startdate], 'isoWeek')
                  parentStartX = parentStartWeek.diff(ganttStartWeek, 'week') * store.scale
                } else if (store.mode === '时') {
                  const hourSubMode = store.hourSubMode || '60'
                  const minuteInterval = parseInt(hourSubMode)
                  if (minuteInterval < 60) {
                    const parentStartMinutes = DateUtils.diff(parentTask[mapFields.startdate], props.startGanttDate, 'minutes')
                    const parentStartCellIndex = Math.floor(parentStartMinutes / minuteInterval)
                    parentStartX = parentStartCellIndex * store.scale
                  } else {
                    parentStartX =
                      DateUtils.diff(parentTask[mapFields.startdate], props.startGanttDate, 'hours') * store.scale
                  }
                }
                if (alignedX < parentStartX) alignedX = parentStartX
              }
            }

            target.style.transform = `translate(${alignedX}px, 0px)`
            target.setAttribute('data-x', alignedX.toString())

            const cellsMoved = Math.round((alignedX - oldBarDataX.value) / store.scale)
            let daysOffset = 0,
              hoursOffset = 0,
              monthsOffset = 0,
              quartersOffset = 0
            if (store.mode === '季度') quartersOffset = cellsMoved
            else if (store.mode === '月') monthsOffset = cellsMoved
            else if (store.mode === '日') {
              const isHalfDay = store.daySubMode === 'half'
              if (isHalfDay) {
                const newStartCellIndex = Math.round(alignedX / store.scale)
                const barWidthCells = Math.round(oldBarWidth.value / store.scale)
                const newEndCellIndex = newStartCellIndex + barWidthCells - 1
                const startDays = Math.floor(newStartCellIndex / 2)
                const startIsAM = newStartCellIndex % 2 === 0
                const newStartDate = DateUtils.create(props.startGanttDate)
                  .add(startDays, 'days')
                  .hour(startIsAM ? 0 : 12)
                  .minute(0)
                  .second(0)
                const endDays = Math.floor(newEndCellIndex / 2)
                const endIsAM = newEndCellIndex % 2 === 0
                const newEndDate = DateUtils.create(props.startGanttDate)
                  .add(endDays, 'days')
                  .hour(endIsAM ? 11 : 23)
                  .minute(59)
                  .second(59)
                props.row[mapFields.startdate] = newStartDate.format('YYYY-MM-DD HH:mm:ss')
                props.row[mapFields.enddate] = newEndDate.format('YYYY-MM-DD HH:mm:ss')
                props.row[mapFields.takestime] = endDays - startDays + 1 + t('durationUnit.days')
              } else {
                daysOffset = cellsMoved
              }
            } else if (store.mode === '周') daysOffset = cellsMoved * 7
            else if (store.mode === '时') {
              const hourSubMode = store.hourSubMode || '60'
              const minuteInterval = parseInt(hourSubMode)
              if (minuteInterval < 60) {
                const newStartCellIndex = Math.round(alignedX / store.scale)
                const barWidthCells = Math.round(oldBarWidth.value / store.scale)
                const newEndCellIndex = newStartCellIndex + barWidthCells - 1
                const cellsPerHour = 60 / minuteInterval
                const cellsPerDay = 24 * cellsPerHour
                const startDays = Math.floor(newStartCellIndex / cellsPerDay)
                const startCellInDay = newStartCellIndex % cellsPerDay
                const startHour = Math.floor(startCellInDay / cellsPerHour)
                const startMinute = (startCellInDay % cellsPerHour) * minuteInterval
                const newStartDate = DateUtils.create(props.startGanttDate)
                  .add(startDays, 'days')
                  .hour(startHour)
                  .minute(startMinute)
                  .second(0)
                const endDays = Math.floor(newEndCellIndex / cellsPerDay)
                const endCellInDay = newEndCellIndex % cellsPerDay
                const endHour = Math.floor(endCellInDay / cellsPerHour)
                const endMinute =
                  (endCellInDay % cellsPerHour) * minuteInterval + minuteInterval - 1
                const newEndDate = DateUtils.create(props.startGanttDate)
                  .add(endDays, 'days')
                  .hour(endHour)
                  .minute(endMinute)
                  .second(59)
                props.row[mapFields.startdate] = newStartDate.format('YYYY-MM-DD HH:mm:ss')
                props.row[mapFields.enddate] = newEndDate.format('YYYY-MM-DD HH:mm:ss')
                const diffMinutes = newEndDate.diff(newStartDate, 'minutes') + 1
                const diffHours = Math.floor(diffMinutes / 60)
                const remainMinutes = diffMinutes % 60
                if (diffHours > 0 && remainMinutes > 0) {
                  props.row[mapFields.takestime] = t('durationUnit.hoursAndMinutes', {
                    hours: diffHours,
                    minutes: remainMinutes,
                  })
                } else if (diffHours > 0) {
                  props.row[mapFields.takestime] = `${diffHours}${t('durationUnit.hours')}`
                } else {
                  props.row[mapFields.takestime] = `${remainMinutes}${t('durationUnit.minutes')}`
                }
              } else {
                hoursOffset = cellsMoved
              }
            }

            const isHalfDayMode = store.mode === '日' && store.daySubMode === 'half'
            const isHourSubMode =
              store.mode === '时' && (store.hourSubMode === '15' || store.hourSubMode === '30')

            if (store.mode === '季度') {
              props.row[mapFields.startdate] = DateUtils.create(props.row[mapFields.startdate])
                .add(quartersOffset, 'quarters')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.enddate] = DateUtils.create(props.row[mapFields.enddate])
                .add(quartersOffset, 'quarters')
                .format('YYYY-MM-DD HH:mm:ss')
              const taskStartQuarter = DateUtils.startOf(props.row[mapFields.startdate], 'quarter')
              const taskEndQuarter = DateUtils.startOf(props.row[mapFields.enddate], 'quarter')
              const spendQuarters =
                (taskEndQuarter.year() - taskStartQuarter.year()) * 4 +
                (taskEndQuarter.quarter() - taskStartQuarter.quarter()) +
                1
              props.row[mapFields.takestime] = spendQuarters + t('durationUnit.quarters')
            } else if (store.mode === '月') {
              props.row[mapFields.startdate] = DateUtils.create(props.row[mapFields.startdate])
                .add(monthsOffset, 'months')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.enddate] = DateUtils.create(props.row[mapFields.enddate])
                .add(monthsOffset, 'months')
                .format('YYYY-MM-DD HH:mm:ss')
              const taskStartMonth = DateUtils.startOf(props.row[mapFields.startdate], 'month')
              const taskEndMonth = DateUtils.startOf(props.row[mapFields.enddate], 'month')
              const spendMonths =
                (taskEndMonth.year() - taskStartMonth.year()) * 12 +
                (taskEndMonth.month() - taskStartMonth.month()) +
                1
              props.row[mapFields.takestime] = spendMonths + t('durationUnit.months')
            } else if (store.mode === '时' && !isHourSubMode) {
              props.row[mapFields.startdate] = DateUtils.create(props.row[mapFields.startdate])
                .add(hoursOffset, 'hours')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.enddate] = DateUtils.create(props.row[mapFields.enddate])
                .add(hoursOffset, 'hours')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.takestime] =
                DateUtils.diff(props.row[mapFields.enddate], props.row[mapFields.startdate], 'hours') +
                1 +
                t('durationUnit.hours')
            } else if (!isHalfDayMode && !isHourSubMode) {
              props.row[mapFields.startdate] = DateUtils.create(props.row[mapFields.startdate])
                .add(daysOffset, 'days')
                .format('YYYY-MM-DD HH:mm:ss')
              props.row[mapFields.enddate] = DateUtils.create(props.row[mapFields.enddate])
                .add(daysOffset, 'days')
                .format('YYYY-MM-DD HH:mm:ss')
              if (store.mode === '日') {
                props.row[mapFields.takestime] =
                  DateUtils.diff(props.row[mapFields.enddate], props.row[mapFields.startdate], 'days') +
                  1 +
                  t('durationUnit.days')
              } else if (store.mode === '周') {
                const startWeek = DateUtils.startOf(props.row[mapFields.startdate], 'isoWeek')
                const endWeek = DateUtils.startOf(props.row[mapFields.enddate], 'isoWeek')
                props.row[mapFields.takestime] =
                  DateUtils.diff(endWeek, startWeek, 'week') + 1 + t('durationUnit.weeks')
              }
            }

            const parentIdFieldForChildren = mapFields.parentId || 'pid'
            const newParentStartDate = DateUtils.create(props.row[mapFields.startdate])
            const currentTaskId = props.row[mapFields.id]
            const getAllChildren = (parentId: string | number, tasks: GanttTask[]): GanttTask[] => {
              const children: GanttTask[] = []
              for (const task of tasks) {
                if (String(task[parentIdFieldForChildren]) === String(parentId)) {
                  children.push(task)
                  children.push(...getAllChildren(task[mapFields.id], tasks))
                }
              }
              return children
            }
            const childTasks = getAllChildren(currentTaskId, store.tasks)

            const actualOffset =
              store.mode === '季度'
                ? quartersOffset
                : store.mode === '月'
                  ? monthsOffset
                  : store.mode === '时'
                    ? hoursOffset
                    : daysOffset
            const shouldCheckChildren = isHalfDayMode || isHourSubMode || actualOffset > 0

            if (shouldCheckChildren) {
              for (const child of childTasks) {
                if (DateUtils.isBefore(child[mapFields.startdate], newParentStartDate)) {
                  if (store.mode === '季度') {
                    child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                      .add(quartersOffset, 'quarters')
                      .format('YYYY-MM-DD HH:mm:ss')
                    child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                      .add(quartersOffset, 'quarters')
                      .format('YYYY-MM-DD HH:mm:ss')
                  } else if (store.mode === '月') {
                    child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                      .add(monthsOffset, 'months')
                      .format('YYYY-MM-DD HH:mm:ss')
                    child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                      .add(monthsOffset, 'months')
                      .format('YYYY-MM-DD HH:mm:ss')
                  } else if (store.mode === '时') {
                    if (isHourSubMode) {
                      const childOffset = DateUtils.diff(newParentStartDate, child[mapFields.startdate], 'minutes')
                      child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                        .add(childOffset, 'minutes')
                        .format('YYYY-MM-DD HH:mm:ss')
                      child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                        .add(childOffset, 'minutes')
                        .format('YYYY-MM-DD HH:mm:ss')
                    } else {
                      child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                        .add(hoursOffset, 'hours')
                        .format('YYYY-MM-DD HH:mm:ss')
                      child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                        .add(hoursOffset, 'hours')
                        .format('YYYY-MM-DD HH:mm:ss')
                    }
                  } else if (store.mode === '日' && store.daySubMode === 'half') {
                    const childOffset = DateUtils.diff(newParentStartDate, child[mapFields.startdate], 'hours')
                    child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                      .add(childOffset, 'hours')
                      .format('YYYY-MM-DD HH:mm:ss')
                    child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                      .add(childOffset, 'hours')
                      .format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    child[mapFields.startdate] = DateUtils.create(child[mapFields.startdate])
                      .add(daysOffset, 'days')
                      .format('YYYY-MM-DD HH:mm:ss')
                    child[mapFields.enddate] = DateUtils.create(child[mapFields.enddate])
                      .add(daysOffset, 'days')
                      .format('YYYY-MM-DD HH:mm:ss')
                  }
                  setBarDate({
                    id: child[mapFields.id],
                    startDate: child[mapFields.startdate],
                    endDate: child[mapFields.enddate],
                  })
                }
              }
            }
            setBarDate({
              id: props.row[mapFields.id],
              startDate: props.row[mapFields.startdate],
              endDate: props.row[mapFields.enddate],
            })
          },
        },
      })

    setAllowChangeTaskDate(true)
  }

  const destroy = () => {
    try {
      interact(bar).unset()
    } catch (e) {
      /* ignore */
    }
  }

  return { drawBar, destroy }
}
