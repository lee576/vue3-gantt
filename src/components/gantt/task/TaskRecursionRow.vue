<template>
    <div>
        <template v-for="item in filterTask" :key="item.id + '_taskrow'">
            <template v-if="headers">
                <TaskRow :headers="headers" :rowHeight="rowHeight" :row="item" />
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
        const filterTask = computed(() => {
            let innerTask: Array<any> = [];
            for (let i = 0; i < store.tasks.length; i++) {
                if (!hiddenTask.value.some(obj => obj[mapFields.value['id']] === store.tasks[i][mapFields.value['id']])) {
                    innerTask.push(store.tasks[i]);
                }
            }
            return innerTask;
        });

        const expandRow = computed({
            get: () => store.expandRow,
            set: (newValue) => {
                mutations.setExpandRow(newValue);
            }
        });

        watch(filterTask, () => {
            let innerTask: Array<any> = [];
            for (let i = 0; i < store.tasks.length; i++) {
                if (!hiddenTask.value.some(obj => obj[mapFields.value['id']] === store.tasks[i][mapFields.value['id']])) {
                    innerTask.push(store.tasks[i]);
                }
            }
            return innerTask;
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
            recursionRow
        };
    }
});
</script>