<template>
    <div class="table">
        <div class="header" :style="{ height: `${headersHeight}px` }">
            <svg ref="addTaskSvg" t="1647915776075" @click="setRootTask({})" class="addRootTask" viewBox="0 0 1024 1024"
                version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3147" width="200" height="200">
                <path
                    d="M864 0H160C70.4 0 0 70.4 0 160v704c0 89.6 70.4 160 160 160h704c89.6 0 160-70.4 160-160V160c0-89.6-70.4-160-160-160z m96 864c0 54.4-41.6 96-96 96H160c-54.4 0-96-41.6-96-96V160c0-54.4 41.6-96 96-96h704c54.4 0 96 41.6 96 96v704z"
                    fill="#707070" p-id="3148"></path>
                <path
                    d="M768 480h-224V256c0-19.2-12.8-32-32-32s-32 12.8-32 32v224H256c-19.2 0-32 12.8-32 32s12.8 32 32 32h224v224c0 19.2 12.8 32 32 32s32-12.8 32-32v-224h224c19.2 0 32-12.8 32-32s-12.8-32-32-32z"
                    p-id="3149" fill="#707070"></path>
            </svg>
            <svg ref="jumpTodaySvg" t="1647262391689" @click="scrollToToday()" class="jumpToToday"
                viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4965" width="200"
                height="200">
                <path
                    d="M753.6 222.4h24c19.2 0 33.6-14.4 33.6-32V57.6c0-19.2-14.4-33.6-33.6-33.6h-24c-19.2 0-33.6 14.4-33.6 33.6v131.2c0 19.2 14.4 33.6 33.6 33.6zM251.2 222.4h24c19.2 0 33.6-14.4 33.6-32V57.6c0-19.2-14.4-33.6-33.6-33.6h-24c-19.2 0-33.6 14.4-33.6 33.6v131.2c0 19.2 14.4 33.6 33.6 33.6z"
                    fill="#707070" p-id="4966"></path>
                <path
                    d="M928 134.4h-68.8v56c0 41.6-33.6 76.8-80 76.8h-24c-43.2 0-80-33.6-80-76.8V134.4h-320v56c0 41.6-33.6 76.8-80 76.8h-24c-43.2 0-80-33.6-80-76.8V134.4H105.6c-38.4 0-68.8 28.8-68.8 67.2v731.2c0 38.4 30.4 67.2 68.8 67.2h820.8c38.4 0 68.8-28.8 70.4-67.2V201.6c0-38.4-30.4-67.2-68.8-67.2zM105.6 932.8V355.2h820.8s0 577.6 1.6 577.6H105.6z"
                    fill="#707070" p-id="4967"></path>
                <path d="M500.8 548.8l-49.6 33.6c14.4 16 33.6 41.6 60.8 75.2l54.4-35.2c-19.2-22.4-40-46.4-65.6-73.6z"
                    fill="#707070" p-id="4968"></path>
                <path
                    d="M553.6 451.2l14.4-14.4v-1.6H480c-51.2 68.8-118.4 121.6-196.8 155.2 11.2 12.8 25.6 28.8 41.6 54.4 80-40 142.4-89.6 188.8-148.8 43.2 59.2 102.4 107.2 180.8 144 14.4-19.2 27.2-35.2 41.6-52.8-76.8-30.4-137.6-76.8-182.4-136zM339.2 716.8h246.4c-30.4 43.2-62.4 81.6-94.4 116.8l60.8 33.6c49.6-56 89.6-108.8 123.2-155.2v-54.4h-336v59.2z"
                    fill="#707070" p-id="4969"></path>
            </svg>
            <TaskHeader :headers='taskHeaders' />
        </div>
        <div :style="{ height: `calc(100% - ${headersHeight}px)` }">
            <TaskContent v-if='Array.isArray(tasks) && tasks.length > 0' :headers='taskHeaders' :rowHeight='rowHeight'>
            </TaskContent>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import TaskHeader from './TaskHeader.vue';
import TaskContent from './TaskContent.vue';
import { store, mutations } from '../Store';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import sharedState from '../ShareState';

export default defineComponent({
    props: {
        headersHeight: {
            type: Number as () => number,
            default: 50
        },
        rowHeight: {
            type: Number as () => number,
            default: 0
        }
    },
    components: {
        TaskHeader,
        TaskContent
    },
    setup() {
        const tasks = computed(() => store.tasks);
        const taskHeaders = computed(() => store.taskHeaders);
        const rootTask = computed({
            get: () => store.rootTask,
            set: (newValue) => {
                mutations.setRootTask(newValue);
            }
        });
        const startGanttDate = computed(() => store.startGanttDate);
        const endGanttDate = computed(() => store.endGanttDate);

        const setRootTask = mutations.setRootTask;
        const scrollToToday = () => {
            // 判断今天在选择的时间范围内
            let isBetween = dayjs().isBetween(startGanttDate.value, endGanttDate.value);
            if (isBetween) {
                sharedState.triggerScrollToToday();
            }
        };

        return {
            tasks,
            taskHeaders,
            rootTask,
            startGanttDate,
            endGanttDate,
            setRootTask,
            scrollToToday,
        };
    }
});
</script>

<style lang="scss" scoped>
.table {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    overflow-x: hidden;

    .header {
        height: 100%;
        background-color: #F3F4F5;
        position: relative;

        .addRootTask {
            position: absolute;
            z-index: 10;
            bottom: 1px;
            right: 0px;
            height: 23px;
            width: 23px;
            cursor: pointer;

            &:hover {
                fill: #3A8EE6;
            }
        }

        .jumpToToday {
            position: absolute;
            z-index: 10;
            top: 0px;
            right: 0px;
            height: 25px;
            width: 25px;
            cursor: pointer;

            &:hover {
                fill: #3A8EE6;
            }
        }
    }

    .nodata {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: justify;
        width: 100%;
        height: 100%;
        color: #6B6B97; }
}
</style>