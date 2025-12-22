<template>
    <div ref="containerRef" class="task-recursion-container">
        <!-- 虚拟滚动模式 -->
        <template v-if="useVirtualScroll">
            <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px', paddingTop: offsetY + 'px', boxSizing: 'border-box' }">
                <template v-for="item in visibleTasks" :key="item.task[mapFields.id] + '_taskrow'">
                    <TaskRow 
                        v-if="headers"
                        :headers="headers" 
                        :rowHeight="rowHeight" 
                        :row="item.task" 
                    />
                </template>
            </div>
        </template>
        <!-- 普通模式 -->
        <template v-else>
            <template v-for="item in filterTask" :key="item[mapFields.id] + '_taskrow'">
                <TaskRow 
                    v-if="headers"
                    :headers="headers" 
                    :rowHeight="rowHeight" 
                    :row="item" 
                />
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { store, mutations } from '../state/Store';
import TaskRow from './TaskRow.vue';
import { PerformanceConfig } from '../composables/PerformanceConfig';

export default defineComponent({
    props: {
        headers: Array as () => any[],
        rowHeight: {
            type: Number,
            default: 0
        },
        tasks: Array as () => any[]
    },
    components: {
        TaskRow
    },
    setup(props) {
        const hiddenTask = ref<Array<any>>([]);
        const containerRef = ref<HTMLElement | null>(null);
        
        // 虚拟滚动状态
        const scrollTop = ref(0);
        const containerHeight = ref(0);
        const startIndex = ref(0);
        const endIndex = ref(0);
        
        const mapFields = computed(() => store.mapFields);
        const collapsedTasks = computed(() => store.collapsedTasks);
        
        // 判断是否启用虚拟滚动
        const useVirtualScroll = computed(() => {
            return PerformanceConfig.ENABLE_VIRTUAL_SCROLL && 
                   filterTask.value.length >= PerformanceConfig.VIRTUAL_SCROLL_THRESHOLD;
        });
        
        // 虚拟滚动计算
        const totalHeight = computed(() => filterTask.value.length * props.rowHeight);
        const offsetY = computed(() => startIndex.value * props.rowHeight);
        
        const visibleTasks = computed(() => {
            if (!useVirtualScroll.value) return [];
            const tasks = filterTask.value;
            const result: { task: any; index: number }[] = [];
            for (let i = startIndex.value; i <= endIndex.value && i < tasks.length; i++) {
                result.push({ task: tasks[i], index: i });
            }
            // 调试日志
            // console.log(`[左侧虚拟滚动] 总任务: ${tasks.length}, 渲染: ${result.length}, 范围: ${startIndex.value}-${endIndex.value}`);
            return result;
        });
        
        // 更新可见范围
        const updateVisibleRange = () => {
            if (!containerRef.value) return;
            
            // 获取父滚动容器
            const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
            if (!scrollContainer) return;
            
            const scrollY = scrollContainer.scrollTop;
            const viewHeight = scrollContainer.clientHeight || 500; // 默认高度
            const buffer = PerformanceConfig.VIRTUAL_SCROLL_BUFFER;
            
            scrollTop.value = scrollY;
            containerHeight.value = viewHeight;
            
            const rowH = props.rowHeight || 40; // 默认行高
            const start = Math.max(0, Math.floor(scrollY / rowH) - buffer);
            const visibleCount = Math.ceil(viewHeight / rowH);
            const end = Math.min(filterTask.value.length - 1, start + visibleCount + buffer * 2);
            
            startIndex.value = start;
            endIndex.value = Math.max(end, start); // 确保 end >= start
        };
        
        // 滚动处理
        let rafId: number | null = null;
        let batchUpdateTimer: number | null = null;
        
        const onScroll = () => {
            if (PerformanceConfig.USE_RAF) {
                // 使用 requestAnimationFrame 优化
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    updateVisibleRange();
                    rafId = null;
                });
            } else {
                // 使用批量更新延迟
                if (batchUpdateTimer) {
                    clearTimeout(batchUpdateTimer);
                }
                batchUpdateTimer = setTimeout(() => {
                    updateVisibleRange();
                    batchUpdateTimer = null;
                }, PerformanceConfig.BATCH_UPDATE_DELAY);
            }
        };
        
        // 获取所有被折叠的子任务
        const getAllCollapsedChildren = (parentId: any): Set<any> => {
            const collapsedChildren = new Set<any>();
            const tasks = props.tasks || store.tasks;
            
            const collectChildren = (pid: any) => {
                const children = tasks.filter(task => task[mapFields.value['parentId']] === pid);
                children.forEach(child => {
                    const childId = child[mapFields.value['id']];
                    collapsedChildren.add(childId);
                    // 递归收集所有子孙任务
                    collectChildren(childId);
                });
            };
            
            collectChildren(parentId);
            return collapsedChildren;
        };
        
        // 优化：使用Set提高查找性能
        const hiddenTaskIds = computed(() => {
            return new Set(hiddenTask.value.map(obj => obj[mapFields.value['id']]));
        });

        const filterTask = computed(() => {
            const hiddenIds = hiddenTaskIds.value;
            const tasks = store.tasks.filter(task => !hiddenIds.has(task[mapFields.value['id']]));
            
            // 过滤折叠的子任务
            const allCollapsedIds = new Set<any>();
            collapsedTasks.value.forEach(collapsedId => {
                const children = getAllCollapsedChildren(collapsedId);
                children.forEach(childId => allCollapsedIds.add(childId));
            });
            
            return tasks.filter(task => !allCollapsedIds.has(task[mapFields.value['id']]));
        });

        const expandRow = computed({
            get: () => store.expandRow,
            set: (newValue) => {
                mutations.setExpandRow(newValue);
            }
        });

        watch(expandRow, (newVal) => {
            hiddenTask.value = [];
            recursionRow(newVal.pid);
        });
        
        // 监听任务数量变化，更新虚拟滚动
        watch(() => filterTask.value.length, () => {
            updateVisibleRange();
        });
        
        // 监听虚拟滚动模式变化
        watch(useVirtualScroll, (newVal) => {
            if (newVal) {
                setTimeout(() => {
                    updateVisibleRange();
                }, 0);
            }
        }, { immediate: true });

        const recursionRow = (id: any) => {
            // 检查 props.tasks 是否存在，如果存在则进行过滤，否则返回空数组
            let findRows = props.tasks ? props.tasks.filter(obj => obj[mapFields.value['parentId']] === id) : [];
            if (findRows && findRows.length > 0) {
                for (let i = 0; i < findRows.length; i++) {
                    if (expandRow.value.expand === false) {
                        hiddenTask.value.push(findRows[i]);
                    }
                    recursionRow(findRows[i][mapFields.value['id']]);
                }
            }
        };
        
        onMounted(() => {
            if (containerRef.value) {
                const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
                if (scrollContainer) {
                    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
                }
            }
            // 延迟初始化，确保 DOM 已渲染
            setTimeout(() => {
                updateVisibleRange();
            }, 0);
        });
        
        onUnmounted(() => {
            if (containerRef.value) {
                const scrollContainer = containerRef.value.closest('.content') as HTMLElement;
                if (scrollContainer) {
                    scrollContainer.removeEventListener('scroll', onScroll);
                }
            }
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            if (batchUpdateTimer) {
                clearTimeout(batchUpdateTimer);
            }
        });

        return {
            containerRef,
            filterTask,
            expandRow,
            recursionRow,
            mapFields,
            // 虚拟滚动相关
            useVirtualScroll,
            totalHeight,
            offsetY,
            visibleTasks,
            startIndex,
            endIndex
        };
    }
});
</script>

<style scoped>
.task-recursion-container {
    width: 100%;
}

.virtual-scroll-spacer {
    width: 100%;
}
</style>