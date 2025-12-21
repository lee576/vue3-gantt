<template>
    <div v-if='showRow' @mouseover="hoverActive()" @mouseleave="hoverInactive()" :class="{ active: hover }">
        <div class="row" @dblclick="setEditTask(row)" v-bind:style="{ height: rowHeight + 'px' }">
            <template v-for='(header, headerIndex) in headers'>
                <div 
                    class="cellNo" 
                    :key="headerIndex" 
                    :columnindex="headerIndex"
                    v-if="header.property === 'no'" 
                    v-bind:style="{
                        minWidth: header.width + 'px',
                        maxWidth: header.width + 'px',
                        height: rowHeight + 'px'
                    }">
                    <div class="no-cell-content">
                        <!-- 树形连线 -->
                        <div class="tree-lines">
                            <!-- 祖先节点的贯穿线（连接兄弟节点） -->
                            <div 
                                v-for="level in getAncestorLines" 
                                :key="'ancestor-' + level" 
                                class="tree-line-vertical ancestor"
                                :style="{ left: level * 16 + 8 + 'px' }"
                            ></div>
                            
                            <!-- 顶级节点有子节点且未折叠时，显示向下的竖线 -->
                            <div 
                                v-if="row.treeLevel === 1 && hasChildren && !isCollapsed"
                                class="tree-line-vertical parent-to-child"
                                :style="{ left: row.treeLevel * 16 + 8 + 'px' }"
                            ></div>
                            
                            <!-- 子节点的连接线 -->
                            <template v-if="row.treeLevel && row.treeLevel > 1">
                                <!-- 当前节点的垂直线 -->
                                <div 
                                    class="tree-line-vertical current"
                                    :class="{ 'is-last-child': isLastChild }"
                                    :style="{ left: (row.treeLevel - 1) * 16 + 8 + 'px' }"
                                ></div>
                                
                                <!-- 水平线（连接到当前节点） -->
                                <div 
                                    class="tree-line-horizontal"
                                    :style="{ left: (row.treeLevel - 1) * 16 + 8 + 'px', width: '32px' }"
                                ></div>
                                
                                <!-- 如果当前节点有子节点且未折叠，显示向下的竖线 -->
                                <div 
                                    v-if="hasChildren && !isCollapsed"
                                    class="tree-line-vertical parent-to-child"
                                    :style="{ left: row.treeLevel * 16 + 8 + 'px' }"
                                ></div>
                            </template>
                        </div>
                        
                        <!-- 左侧：折叠按钮 + 序号 -->
                        <div class="no-left-section" :style="{ paddingLeft: (row.treeLevel || 0) * 16 + 'px' }">
                            <!-- 折叠/展开按钮 -->
                            <button 
                                v-if="hasChildren" 
                                @click.stop="toggleCollapse" 
                                class="collapse-btn"
                                :class="{ collapsed: isCollapsed }"
                                :title="isCollapsed ? '展开' : '折叠'"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <!-- 三角形箭头 -->
                                    <path 
                                        class="arrow" 
                                        d="M5 4 L14 9 L5 14 Z" 
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                            <!-- 无子节点时的占位空间（透明，不遮挡横线） -->
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
                <div 
                    v-else 
                    v-show="header.show" 
                    class="cell" 
                    :key="headerIndex + '-header'"
                    :columnindex="headerIndex"
                    :style="{ minWidth: header.width + 'px', maxWidth: header.width + 'px', height: rowHeight + 'px' }">
                    {{ checkField(row, header.property) }}
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, inject, watch } from 'vue';
import { store, mutations } from '../state/Store';
import sharedState from '../state/ShareState';

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

        void inject('barHover'); // barHover 预留
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
        
        // 判断是否是最后一个子节点
        const isLastChild = computed(() => {
            const parentId = props.row[mapFields.value['parentId']];
            if (!parentId || parentId === '0') return false;
            
            const siblings = store.tasks.filter(task => 
                task[mapFields.value['parentId']] === parentId
            );
            
            if (siblings.length === 0) return false;
            
            const currentId = props.row[mapFields.value['id']];
            const lastSibling = siblings[siblings.length - 1];
            return lastSibling[mapFields.value['id']] === currentId;
        });
        
        // 获取需要显示祖先贯穿线的层级
        const getAncestorLines = computed(() => {
            const lines: number[] = [];
            const treeLevel = props.row.treeLevel || 0;
            
            if (treeLevel <= 1) return lines;
            
            // 当前节点的 current 线位置对应的层级（需要过滤掉，避免重叠）
            const currentLineLevel = treeLevel - 1;
            
            // 构建从根到当前节点的路径
            const path: any[] = [];
            let currentTask = props.row;
            
            while (currentTask) {
                path.unshift(currentTask);
                const parentId = currentTask[mapFields.value['parentId']];
                if (!parentId || parentId === '0') break;
                
                const parent = store.tasks.find(task => 
                    task[mapFields.value['id']] === parentId
                );
                if (!parent) break;
                currentTask = parent;
            }
            
            // 从直接父节点开始向上检查，遇到"最后一个子节点"就停止
            for (let i = path.length - 2; i >= 0; i--) {
                const node = path[i];
                const nodeId = node[mapFields.value['id']];
                const parentId = node[mapFields.value['parentId']];
                
                // 查找该节点的所有兄弟节点
                const siblings = store.tasks.filter(task => 
                    task[mapFields.value['parentId']] === parentId
                );
                
                if (siblings.length > 0) {
                    const lastSibling = siblings[siblings.length - 1];
                    const isLast = lastSibling[mapFields.value['id']] === nodeId;
                    
                    if (isLast) {
                        // 如果这个节点是最后一个子节点，停止添加贯穿线
                        break;
                    } else {
                        // 如果不是最后一个，需要显示贯穿线
                        const nodeTreeLevel = node.treeLevel;
                        // 过滤掉和 current 线位置相同的层级
                        if (nodeTreeLevel && nodeTreeLevel >= 1 && nodeTreeLevel !== currentLineLevel) {
                            lines.push(nodeTreeLevel);
                        }
                    }
                }
            }
            
            return lines;
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
            isLastChild,
            getAncestorLines,
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
    border-bottom: 1px solid var(--border, #d0d0d0);
    width: fit-content;
    background: var(--bg-content, #ffffff);
    color: var(--text-primary, #333333);

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
            border-left: 1px solid var(--border, #d0d0d0);
        }

        &:not(:last-child) {
            border-right: 1px solid var(--border, #d0d0d0);
        }

        &:last-child {
            border-right: 1px solid var(--border, #d0d0d0);
        }

        .no-cell-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .no-left-section {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }

        .tree-lines {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            pointer-events: none;
            z-index: 0;
        }

        .tree-line-vertical {
            position: absolute;
            width: 1px;
            background: var(--border, #d0d0d0);
            
            // 祖先贯穿线（从顶部到底部）
            &.ancestor {
                top: 0;
                bottom: 0;
            }
            
            &.current {
                top: 0;
                bottom: 0;  // 默认贯穿整行，连接兄弟节点
                
                // 如果是最后一个子节点，垂直线只到中间（└ 形状）
                &.is-last-child {
                    bottom: 50%;
                }
            }
            
            // 父节点到子节点的连接线（从中间向下）
            &.parent-to-child {
                top: 50%;
                bottom: 0;
            }
        }

        .tree-line-horizontal {
            position: absolute;
            top: 50%;
            height: 1px;
            background: var(--border, #d0d0d0);
        }

        .collapse-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #6c757d;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);

            svg {
                width: 16px;
                height: 16px;
                transition: all 0.2s ease;
            }

            // 箭头旋转动画 - 展开状态向下
            .arrow {
                transform-origin: center;
                transition: transform 0.2s ease;
                transform: rotate(90deg);
            }

            // 折叠状态：箭头向右
            &.collapsed .arrow {
                transform: rotate(0deg);
            }

            // 悬停效果
            &:hover {
                background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                color: #495057;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9);
                
                svg {
                    transform: scale(1.1);
                }
            }

            // 激活状态
            &:active {
                background: linear-gradient(135deg, #dee2e6 0%, #ced4da 100%);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.1);
                
                svg {
                    transform: scale(0.95);
                }
            }

            // 聚焦状态
            &:focus-visible {
                outline: 2px solid var(--primary, #3370ff);
                outline-offset: 2px;
            }
        }

        .collapse-placeholder {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
            // 透明背景，不遮挡横线
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
            position: relative;
            z-index: 1;
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
            background: var(--border, #d0d0d0);
        }

        &:first-child {
            border-left: 1px solid var(--border, #d0d0d0);

            &::before {
                display: none;
            }
        }

        &:not(:last-child) {
            border-right: 1px solid var(--border, #d0d0d0);
        }

        &:last-child {
            border-right: 1px solid var(--border, #d0d0d0);
        }
    }
}
</style>