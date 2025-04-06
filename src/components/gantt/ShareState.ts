import { reactive, ref } from 'vue';

const sharedState = reactive({
  shouldScrollToToday: false,
  triggerScrollToToday() {
    this.shouldScrollToToday = true;
  },

  shouldScroll: false,
  triggerScroll() {
    this.shouldScroll = true;
  },

  highlightedId: <number | null> null,
  triggerHighlight(id: number | null) {
    this.highlightedId = id;
  }
});
export default sharedState;

// 创建一个 ref 来存储滚动位置 
const scrollTop = ref(0); 
// 创建一个 ref 来存储滚动标志 
const scrollFlag = ref(false); 
 
// 定义设置滚动位置的函数 
// 为了避免隐式的 'any' 类型错误，明确指定参数 'value' 的类型为 'number'
const setScrollTop = (value: number) => {
  scrollTop.value  = value; 
}; 
 
// 定义设置滚动标志的函数 
// 为了避免隐式的 'any' 类型错误，明确指定参数 'value' 的类型为 'boolean'
const setScrollFlag = (value: boolean) => {
  scrollFlag.value  = value; 
}; 
 
// 导出共享状态和方法 
export const useScrollState = () => { 
  return { 
    scrollTop, 
    scrollFlag, 
    setScrollTop, 
    setScrollFlag 
  }; 
}; 