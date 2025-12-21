<template>
    <div class="table">
        <div class="header" :style="{ height: `${headersHeight}px` }">
            <svg ref="addTaskSvg" t="1647915776075" @click="setRootTask({})" class="addRootTask" viewBox="0 0 1024 1024"
                version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3147" width="28" height="28">
                <path
                    d="M864 0H160C70.4 0 0 70.4 0 160v704c0 89.6 70.4 160 160 160h704c89.6 0 160-70.4 160-160V160c0-89.6-70.4-160-160-160z m96 864c0 54.4-41.6 96-96 96H160c-54.4 0-96-41.6-96-96V160c0-54.4 41.6-96 96-96h704c54.4 0 96 41.6 96 96v704z"
                    fill="currentColor" p-id="3148"></path>
                <path
                    d="M768 480h-224V256c0-19.2-12.8-32-32-32s-32 12.8-32 32v224H256c-19.2 0-32 12.8-32 32s12.8 32 32 32h224v224c0 19.2 12.8 32 32 32s32-12.8 32-32v-224h224c19.2 0 32-12.8 32-32s-12.8-32-32-32z"
                    p-id="3149" fill="currentColor"></path>
            </svg>
           <svg ref="jumpTodaySvg" @click="scrollToToday()" class="jumpToToday"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <!-- 日历图标 -->
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
                <!-- 今天的圆点标记 -->
                <circle cx="12" cy="15" r="2" fill="currentColor"/>
                <!-- 向右下的箭头，表示“跳转到” -->
                <path d="M16.5 11.5l2 2-2 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 13.5h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg ref="columnSettingsSvg" @click="showColumnConfig" class="columnSettings" :title="t('tooltip.columnSettings')"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <!-- 表格图标 -->
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5 6h4M5 8h4M15 6h4M15 8h4M5 16h4M5 18h4M15 16h4M15 18h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <!-- 设置齿轮标记 -->
                <circle cx="20" cy="4" r="3" fill="var(--primary, #0078d4)" stroke="var(--bg-content, #ffffff)" stroke-width="1.5"/>
            </svg>
            <TaskHeader :headers='taskHeaders' />
        </div>
        <div :style="{ height: `calc(100% - ${headersHeight}px)` }">
            <TaskContent v-if='Array.isArray(tasks) && tasks.length > 0' :headers='taskHeaders' :rowHeight='rowHeight'>
            </TaskContent>
        </div>
        
        <!-- 列配置面板 -->
        <ColumnConfigPanel 
            :visible="columnConfigVisible" 
            :headers="taskHeaders"
            @close="columnConfigVisible = false"
            @update:headers="updateHeaders"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import TaskHeader from './TaskHeader.vue';
import TaskContent from './TaskContent.vue';
import ColumnConfigPanel from '../config/ColumnConfigPanel.vue';
import { store, mutations } from '../state/Store';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import sharedState from '../state/ShareState';
import { useI18n } from '../i18n';

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
        TaskContent,
        ColumnConfigPanel
    },
    setup() {
        const { t } = useI18n();
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
        
        // 列配置相关
        const columnConfigVisible = ref(false);

        const setRootTask = mutations.setRootTask;
        const scrollToToday = () => {
            // 判断今天在选择的时间范围内
            let isBetween = dayjs().isBetween(startGanttDate.value, endGanttDate.value);
            if (isBetween) {
                sharedState.triggerScrollToToday();
            }
        };
        
        const showColumnConfig = () => {
            columnConfigVisible.value = true;
        };
        
        const updateHeaders = (newHeaders: any[]) => {
            mutations.setTaskHeaders(newHeaders);
        };

        return {
            t,
            tasks,
            taskHeaders,
            rootTask,
            startGanttDate,
            endGanttDate,
            setRootTask,
            scrollToToday,
            columnConfigVisible,
            showColumnConfig,
            updateHeaders
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
    background: var(--bg-content, #ffffff);
    /* 只保留左边框，顶部边框由 Gantt.vue toolbar border-bottom 提供 */
    /* 右边框由 SplitPane 处理，底部无需边框 */
    border-left: 1px solid var(--border, #d0d0d0);

    .header {
        height: 100%;
        background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
        position: relative;
        /* 添加一个细的底部边框作为分隔线，与右边第一行的顶部边框粗细一致 */
        border-bottom: 1px solid var(--border, #cecece);

        .addRootTask {
            position: absolute;
            z-index: 10;
            bottom: 4px;
            right: 4px;
            height: 28px;
            width: 28px;
            cursor: pointer;
            color: var(--text-secondary, #666666);
            transition: all var(--transition-fast, 0.15s ease);
            background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
            border: 1px solid var(--border, #d0d0d0);
            padding: 3px;
            border-radius: 4px;

            &:hover {
                color: var(--primary, #0078d4);
                background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
                transform: scale(1.1);
            }

            &:active {
                background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
            }
        }

        .jumpToToday {
            position: absolute;
            z-index: 10;
            top: 4px;
            right: 4px;
            height: 28px;
            width: 28px;
            cursor: pointer;
            color: var(--text-secondary, #666666);
            transition: all var(--transition-fast, 0.15s ease);
            background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
            border: 1px solid var(--border, #d0d0d0);
            padding: 3px;
            border-radius: 4px;

            &:hover {
                color: var(--primary, #0078d4);
                background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
                transform: scale(1.1);
            }

            &:active {
                background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
            }
        }
        
        .columnSettings {
            position: absolute;
            z-index: 10;
            top: 4px;
            right: 36px;
            height: 28px;
            width: 28px;
            cursor: pointer;
            color: var(--text-secondary, #666666);
            transition: all var(--transition-fast, 0.15s ease);
            background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
            border: 1px solid var(--border, #d0d0d0);
            padding: 3px;
            border-radius: 4px;

            &:hover {
                color: var(--primary, #0078d4);
                background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
                transform: scale(1.1);
            }

            &:active {
                background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
            }
        }
    }

    .nodata {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
        color: var(--text-muted, #999999);
        font-size: 14px;
        font-weight: 500;
        background: var(--bg-content, #ffffff);
    }
}
</style>