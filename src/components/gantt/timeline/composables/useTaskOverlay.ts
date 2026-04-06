import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { mutations } from '../../state/Store'

type OverlayPosition = Record<string, string>

type UseTaskOverlayOptions = {
  taskRef: Ref<SVGSVGElement | null>
  row: Ref<Record<string, any>>
  isMovePending: Ref<boolean>
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export const useTaskOverlay = ({ taskRef, row, isMovePending }: UseTaskOverlayOptions) => {
  const showTaskTooltip = ref(false)
  const showTaskMenu = ref(false)
  const tooltipPosition = ref<OverlayPosition>({})
  const menuPosition = ref<OverlayPosition>({})

  const hideTooltip = () => {
    showTaskTooltip.value = false
  }

  const closeTaskMenu = () => {
    showTaskMenu.value = false
  }

  const updateTooltipPosition = (event?: MouseEvent) => {
    if (!taskRef.value) {
      return
    }

    const rect = taskRef.value.getBoundingClientRect()
    const fallbackX = rect.left + rect.width / 2 + 14
    const fallbackY = rect.top + 12
    const left = clamp((event?.clientX ?? fallbackX) + 16, 12, window.innerWidth - 292)
    const top = clamp((event?.clientY ?? fallbackY) + 16, 12, window.innerHeight - 168)

    tooltipPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    }
  }

  const openTaskTooltip = (event?: MouseEvent) => {
    if (isMovePending.value || showTaskMenu.value) {
      return
    }

    updateTooltipPosition(event)
    showTaskTooltip.value = true
  }

  const openTaskMenu = (event: MouseEvent) => {
    if (isMovePending.value) {
      return
    }

    hideTooltip()
    showTaskMenu.value = true
    menuPosition.value = {
      left: `${clamp(event.clientX, 12, window.innerWidth - 188)}px`,
      top: `${clamp(event.clientY, 12, window.innerHeight - 140)}px`,
    }
  }

  const handleViewportChange = () => {
    hideTooltip()
    closeTaskMenu()
  }

  const handleDocumentPointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('.task-overlay-menu')) {
      return
    }
    closeTaskMenu()
  }

  const handleDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeTaskMenu()
      hideTooltip()
    }
  }

  let listenersBound = false

  const bindGlobalListeners = () => {
    if (listenersBound || typeof window === 'undefined') {
      return
    }

    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('resize', handleViewportChange)
    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeydown)
    listenersBound = true
  }

  const unbindGlobalListeners = () => {
    if (!listenersBound || typeof window === 'undefined') {
      return
    }

    window.removeEventListener('scroll', handleViewportChange, true)
    window.removeEventListener('resize', handleViewportChange)
    document.removeEventListener('pointerdown', handleDocumentPointerDown)
    document.removeEventListener('keydown', handleDocumentKeydown)
    listenersBound = false
  }

  watch([showTaskTooltip, showTaskMenu], ([tooltipVisible, menuVisible]) => {
    if (tooltipVisible || menuVisible) {
      bindGlobalListeners()
      return
    }

    unbindGlobalListeners()
  })

  onBeforeUnmount(() => {
    unbindGlobalListeners()
  })

  const handleTaskMouseEnter = (event: MouseEvent) => {
    openTaskTooltip(event)
  }

  const handleTaskMouseMove = (event: MouseEvent) => {
    if (!showTaskTooltip.value || showTaskMenu.value) {
      return
    }

    updateTooltipPosition(event)
  }

  const handleTaskMouseLeave = () => {
    hideTooltip()
  }

  const handleTaskContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    openTaskMenu(event)
  }

  const handleEditTask = () => {
    if (isMovePending.value) {
      return
    }
    mutations.setEditTask(row.value)
    closeTaskMenu()
  }

  const handleAddSubTask = () => {
    if (isMovePending.value) {
      return
    }
    mutations.setSubTask(row.value)
    closeTaskMenu()
  }

  const handleRemoveTask = () => {
    if (isMovePending.value) {
      return
    }
    mutations.setRemoveTask(row.value)
    closeTaskMenu()
  }

  return {
    showTaskTooltip: computed(() => showTaskTooltip.value),
    tooltipPosition: computed(() => tooltipPosition.value),
    showTaskMenu: computed(() => showTaskMenu.value),
    menuPosition: computed(() => menuPosition.value),
    handleTaskMouseEnter,
    handleTaskMouseMove,
    handleTaskMouseLeave,
    handleTaskContextMenu,
    handleEditTask,
    handleAddSubTask,
    handleRemoveTask,
    closeTaskMenu,
  }
}
