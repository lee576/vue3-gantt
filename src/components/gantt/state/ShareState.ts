import { reactive, shallowRef } from 'vue'

const sharedState = reactive({
  shouldScrollToToday: false,
  triggerScrollToToday() {
    this.shouldScrollToToday = true
  },

  shouldScroll: false,
  triggerScroll() {
    this.shouldScroll = true
  },

  highlightedId: <number | null>null,
  triggerHighlight(id: number | null) {
    this.highlightedId = id
  },
})
export default sharedState

const scrollTop = shallowRef(0)

const setScrollTop = (value: number) => {
  if (scrollTop.value !== value) {
    scrollTop.value = value
  }
}

export const useScrollState = () => {
  return {
    scrollTop,
    setScrollTop,
  }
}
