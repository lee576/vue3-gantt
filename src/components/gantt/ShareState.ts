import { reactive } from 'vue';

const sharedState = reactive({
  shouldScrollToToday: false,
  triggerScrollToToday() {
    this.shouldScrollToToday = true;
  }
});

export default sharedState;