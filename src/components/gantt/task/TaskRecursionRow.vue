<template>
    <div>
        <template v-for="item in filterTask" :key="item.id + '_taskrow'">
            <template v-if="headers">
                <TaskRow 
                    :headers="headers" 
                    :rowHeight="rowHeight" 
                    :row="item" 
                />
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { store, mutations } from '../Store';
import TaskRow from './TaskRow.vue';

export default defineComponent({
    props: {
        headers: Array as () => any[],
        rowHeight: Number as () => number,
        tasks: Array as () => any[]
    },
    components: {
        TaskRow
    },
    setup(props) {
        const hiddenTask = ref<Array<any>>([]);
        const mapFields = computed(() => store.mapFields);
        const collapsedTasks = computed(() => store.collapsedTasks);
        
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

        return {
            filterTask,
            expandRow,
            recursionRow,
            mapFields
        };
    }
});
</script>