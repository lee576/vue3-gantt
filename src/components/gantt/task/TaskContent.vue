<template>
    <div ref="taskContent" class="content" @scroll="scroll()" @mouseover="mouseover()">
        <TaskRecursionRow :headers='headers' :rowHeight='rowHeight' :tasks='tasks'></TaskRecursionRow>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from 'vue';
import { store } from '../Store';
import { useScrollState } from '../ShareState';
import TaskRecursionRow from './TaskRecursionRow.vue';

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
    setup() {
        const tasks = computed(() => store.tasks);
        const { scrollTop, scrollFlag, setScrollTop, setScrollFlag } = useScrollState();
        const taskContent = ref<HTMLDivElement | null>(null);
        const mapFields = computed(() => store.mapFields);
        const getRootNode = () => {
            return tasks.value.filter((obj: any) => obj[mapFields.value.parentId] === '0');
        };

        watch(scrollTop, (newValue) => {
            if (taskContent.value) {
                taskContent.value.scrollTop = newValue;
            }
        });

        // 优化：使用requestAnimationFrame优化滚动性能
        let rafId: number | null = null;
        const scroll = () => {
            if (!scrollFlag.value) {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                rafId = requestAnimationFrame(() => {
                    if (taskContent.value) {
                        setScrollTop(taskContent.value.scrollTop);
                    }
                    rafId = null;
                });
            }
        };

        const mouseover = () => {
            setScrollFlag(false);
        };

        onMounted(() => {
            if (taskContent.value) {
                // 监听滚动位置的变化 
                taskContent.value.scrollTop = scrollTop.value;
            }
        });

        return {
            tasks,
            taskContent,
            scrollFlag,
            mapFields,
            setScrollFlag,
            getRootNode,
            scroll,
            mouseover
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