<template>
    <div ref="taskContent" class="content" @scroll="scroll()" @mouseover="mouseover()">
        <div class="content-inner" :style="{ minHeight: contentHeight + 'px' }">
            <TaskRecursionRow :headers='headers' :rowHeight='rowHeight' :tasks='tasks'></TaskRecursionRow>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { store } from '../state/Store';
import { useScrollState } from '../state/ShareState';
import TaskRecursionRow from './TaskRecursionRow.vue';
import { throttle } from '../composables/PerformanceConfig';

export default defineComponent({
    props: {
        headers: {
            type: Array as () => any[],
            default: () => []
        },
        rowHeight: {
            type: Number,
            default: 0
        }
    },
    components: {
        TaskRecursionRow
    },
    setup(props) {
        const tasks = computed(() => store.tasks);
        const { scrollTop, scrollFlag, setScrollTop, setScrollFlag } = useScrollState();
        const taskContent = ref<HTMLDivElement | null>(null);
        const mapFields = computed(() => store.mapFields);
        
        // 计算内容高度，与右侧保持一致
        const contentHeight = computed(() => {
            return tasks.value.length * props.rowHeight;
        });
        
        const getRootNode = () => {
            return tasks.value.filter((obj: any) => obj[mapFields.value.parentId] === '0');
        };

        watch(scrollTop, (newValue) => {
            if (!scrollFlag.value && taskContent.value) {
                taskContent.value.scrollTop = newValue;
            }
        });

        // 优化：使用requestAnimationFrame优化滚动性能
        let rafId: number | null = null;
        const scroll = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                if (taskContent.value) {
                    setScrollFlag(true); // 标记当前面板为主动滚动
                    setScrollTop(taskContent.value.scrollTop);
                }
                rafId = null;
            });
        };

        const mouseover = () => {
            // 鼠标悬停时不改变滚动标志，让滚动事件处理
        };

        // 动态同步滚动区域高度
        const syncScrollHeight = () => {
            if (taskContent.value) {
                // 查找右侧的滚动容器
                const rightContent = document.querySelector('.table .content') as HTMLElement;
                if (rightContent) {
                    // 检测右侧是否有水平滚动条
                    const hasHorizontalScrollbar = rightContent.scrollWidth > rightContent.clientWidth;
                    
                    // 动态调整左侧的padding-bottom
                    if (hasHorizontalScrollbar) {
                        // 如果右侧有水平滚动条，给左侧添加相应的padding
                        taskContent.value.style.paddingBottom = '20px';
                    } else {
                        // 如果右侧没有水平滚动条，移除左侧的padding
                        taskContent.value.style.paddingBottom = '0px';
                    }
                }
            }
        };

        // 监听任务变化，重新同步高度
        watch(tasks, () => {
            setTimeout(syncScrollHeight, 50);
        });
        
        // 监听窗口大小变化，重新同步高度（使用 throttle 优化）
        const handleResize = throttle(() => {
            setTimeout(syncScrollHeight, 50);
        });
        
        onMounted(() => {
            if (taskContent.value) {
                // 监听滚动位置的变化 
                taskContent.value.scrollTop = scrollTop.value;
                
                // 延迟同步高度，确保DOM已渲染完成
                setTimeout(syncScrollHeight, 100);
                
                // 监听窗口大小变化
                window.addEventListener('resize', handleResize);
            }
        });
        
        onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
        });

        return {
            tasks,
            taskContent,
            scrollFlag,
            mapFields,
            setScrollFlag,
            getRootNode,
            scroll,
            mouseover,
            contentHeight
        };
    }
});
</script>

<style lang="scss" scoped>
.content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    box-sizing: border-box;
    
    .content-inner {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .moveToBar {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;
    }

    .expandBar {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;
    }
}
</style>