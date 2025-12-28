import { ref, watch } from 'vue'
import sharedState from '../../state/ShareState'
import { store } from '../../state/Store'
import type { GanttTask } from '../../types/GanttTypes'

export function useHover(props: { row: GanttTask }) {
  const hover = ref(false)
  const mapFields = store.mapFields

  watch(
    () => sharedState.highlightedId,
    newId => {
      hover.value = props.row[mapFields.id] === newId
    }
  )

  const hoverActive = () => sharedState.triggerHighlight(props.row[mapFields.id] as number | null)
  const hoverInactive = () => sharedState.triggerHighlight(null)

  return { hover, hoverActive, hoverInactive }
}
