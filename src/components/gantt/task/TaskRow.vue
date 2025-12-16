<template>
    <div v-if='showRow' @mouseover="hoverActive()" @mouseleave="hoverInactive()" :class="{ active: hover }">
        <div class="row" @dblclick="setEditTask(row)" v-bind:style="{ height: rowHeight + 'px' }">
            <template v-for='(header, headerIndex) in headers'>
                <div class="cellNo" :key="headerIndex" v-if="header.property === 'no'" v-bind:style="{
                    minWidth: header.width + 'px',
                    maxWidth: header.width + 'px',
                    height: rowHeight + 'px'
                }">
                    <div class="no-cell-content">
                        <!-- 左侧：折叠按钮 + 序号 -->
                        <div class="no-left-section" :style="{ paddingLeft: (row.treeLevel || 0) * 16 + 'px' }">
                            <!-- 折叠/展开按钮 (macOS风格) -->
                            <button 
                                v-if="hasChildren" 
                                @click.stop="toggleCollapse" 
                                class="collapse-btn"
                                :class="{ collapsed: isCollapsed }"
                                :title="isCollapsed ? '展开' : '折叠'"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <!-- 外圆环 -->
                                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                                    <!-- 箭头 -->
                                    <path 
                                        class="arrow" 
                                        d="M5.5 7 L8 9.5 L10.5 7" 
                                        stroke="currentColor" 
                                        stroke-width="1.5" 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round"
                                        fill="none"
                                    />
                                </svg>
                            </button>
                            <span v-else class="collapse-placeholder"></span>
                            
                            <!-- 序号 -->
                            <span class="no-text">{{ row.no }}</span>
                        </div>
                        
                        <!-- 右侧：操作按钮（鼠标悬停显示） -->
                        <div class="action-buttons">
                            <button 
                                @click.stop="setSubTask(row)" 
                                class="action-btn add-btn"
                                :title="'添加子任务'"
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/>
                                </svg>
                            </button>
                            <button 
                                @click.stop="setRemoveTask(row)" 
                                class="action-btn delete-btn"
                                :title="'删除任务'"
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else v-show="header.show" class="cell" :key="headerIndex + '-header'"
                    :style="{ minWidth: header.width + 'px', maxWidth: header.width + 'px', height: rowHeight + 'px' }">
                    {{ checkField(row, header.property) }}</div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, inject, watch } from 'vue';
import { store, mutations } from '../Store';
import sharedState from '../ShareState';

export default defineComponent({
    props: {
        headers: {
            type: Array as () => any[],
            default: () => []
        },
        rowHeight: {
            type: Number,
            default: 0
        },
        row: {
            type: Object as () => Record<string, any>,
            default: () => ({})
        }
    },
    setup(props) {
        const showRow = ref(true);
        const hover = ref(false);
        const addTips = '添加子任务';
        const removeTips = '删除当前任务';

        const mapFields = computed(() => store.mapFields);
        const subTask = computed(() => store.subTask);
        const collapsedTasks = computed(() => store.collapsedTasks);

        const barHover = inject('barHover') as ((rowId: any, hover: boolean) => void) | undefined;
        const addRootTask = inject('addRootTask') as ((row: any) => void) | undefined;

        // 判断当前任务是否有子任务
        const hasChildren = computed(() => {
            const currentId = props.row[mapFields.value['id']];
            return store.tasks.some(task => task[mapFields.value['parentId']] === currentId);
        });

        // 判断当前任务是否已折叠
        const isCollapsed = computed(() => {
            const currentId = props.row[mapFields.value['id']];
            return collapsedTasks.value.has(currentId);
        });

        // 切换折叠状态
        const toggleCollapse = () => {
            const currentId = props.row[mapFields.value['id']];
            mutations.toggleTaskCollapse(currentId);
        };

        onMounted(() => {

        });

        const setSubTask = mutations.setSubTask;
        const setEditTask = mutations.setEditTask;
        const setRemoveTask = mutations.setRemoveTask;

        const checkField = (row: Record<string, any>, property: string) => {
            if (mapFields.value[property]) {
                return row[mapFields.value[property]];
            } else if (row[property]) {
                return row[property];
            }
            return null;
        };

        watch(() => sharedState.highlightedId, (newId) => {
            if (props.row[mapFields.value['id']] === newId) {
                hover.value = true;
            } else {
                hover.value = false;
            }
        });

        const hoverActive = () => {
            sharedState.triggerHighlight(props.row[mapFields.value.id] as number|null);
        };

        const hoverInactive = () => {
            sharedState.triggerHighlight(null);
        };

        const handleAddRootTask = () => {
            if (addRootTask) {
                addRootTask(props.row);
            }
        };

        return {
            showRow,
            hover,
            addTips,
            removeTips,
            mapFields,
            subTask,
            hasChildren,
            isCollapsed,
            toggleCollapse,
            setSubTask,
            setEditTask,
            setRemoveTask,
            checkField,
            hoverActive,
            hoverInactive,
            addRootTask: handleAddRootTask
        };
    }
});
</script>

<style lang="scss" scoped>
.active .row {
    background: var(--row-hover, #FFF3A1) !important;
}

.row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    border-top: none;
    border-bottom: none;
    width: fit-content;
    background: var(--bg-content, #ffffff);
    color: var(--text-primary, #333333);

    &:first-child {
        border-top: 1px solid var(--border, #cecece);
        border-bottom: none;
    }

    &:not(:first-child:last-child) {
        border-right: 1px solid var(--border, #cecece);
        border-top: 1px solid var(--border, #cecece);
        border-bottom: 1px solid var(--border, #cecece);
    }

    &:last-child {
        border-top: none;
        border-bottom: 1px solid var(--border, #cecece);
    }

    .cellNo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        border-top: none;
        border-bottom: none;
        margin: 0px 0px 0px 1px;
        position: relative;
        color: var(--text-primary, #333333);
        padding: 0 8px;

        &:first-child {
            border-left: 1px solid var(--border, #cecece);
        }

        &:not(:last-child) {
            border-right: 1px solid var(--border, #cecece);
        }

        &:last-child {
            border-right: 1px solid var(--border, #cecece);
        }

        .no-cell-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
        }

        .no-left-section {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }

        .collapse-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            padding: 0;
            border: none;
            background: transparent;
            color: var(--text-secondary, #86909c);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            position: relative;

            svg {
                width: 16px;
                height: 16px;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }

            // 箭头旋转动画
            .arrow {
                transform-origin: center;
                transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }

            // 折叠状态：箭头向右旋转90度
            &.collapsed .arrow {
                transform: rotate(-90deg);
            }

            // 悬停效果 (macOS 风格)
            &:hover {
                background: var(--hover-bg, rgba(0, 0, 0, 0.04));
                color: var(--primary, #3370ff);
                
                svg {
                    transform: scale(1.1);
                }

                circle {
                    opacity: 0.6;
                    stroke-width: 1.2;
                }
            }

            // 激活状态
            &:active {
                background: var(--active-bg, rgba(0, 0, 0, 0.08));
                
                svg {
                    transform: scale(0.95);
                }
            }

            // 聚焦状态 (键盘导航)
            &:focus-visible {
                outline: 2px solid var(--primary, #3370ff);
                outline-offset: 2px;
            }
        }

        .collapse-placeholder {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .no-text {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary, #333333);
        }

        .action-buttons {
            display: flex;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        &:hover .action-buttons {
            opacity: 1;
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            background: transparent;
            color: var(--text-secondary, #888);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            flex-shrink: 0;

            svg {
                width: 14px;
                height: 14px;
            }

            &:hover {
                background: var(--hover-bg, rgba(0, 0, 0, 0.06));
            }

            &:active {
                transform: scale(0.95);
            }

            &.add-btn:hover {
                color: var(--success, #52c41a);
                background: rgba(82, 196, 26, 0.1);
            }

            &.delete-btn:hover {
                color: var(--danger, #ff4d4f);
                background: rgba(255, 77, 79, 0.1);
            }
        }
    }

    .cell {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border-top: none;
        border-bottom: none;
        position: relative;
        color: var(--text-primary, #333333);

        &::before {
            content: '';
            position: absolute;
            left: -1px;
            top: 0;
            bottom: 0;
            width: 1px;
            background: var(--border, #cecece);
        }

        &:first-child {
            border-left: 1px solid var(--border, #cecece);

            &::before {
                display: none;
            }
        }

        &:not(:last-child) {
            border-right: 1px solid var(--border, #cecece);
        }

        &:last-child {
            border-right: 1px solid var(--border, #cecece);
        }
    }
}
</style>