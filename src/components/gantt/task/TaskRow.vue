<template>
    <div v-if='showRow' @mouseover="hoverActive()" @mouseleave="hoverInactive()" :class="{ active: hover }">
        <div class="row" @dblclick="setEditTask(row)" v-bind:style="{ height: rowHeight + 'px' }">
            <template v-for='(header, headerIndex) in headers'>
                <div class="cellNo" :key="headerIndex" v-if="header.property === 'no'" v-bind:style="{
                    minWidth: header.width + 'px',
                    maxWidth: header.width + 'px',
                    height: rowHeight + 'px',
                    paddingLeft: '40px'
                }">{{ row.no }}
                    <div class="toolbar" v-bind:style="{ height: rowHeight + 'px' }">
                        <svg @click="setSubTask(row)" class="btn" t="1646898128772" viewBox="0 0 1024 1024"
                            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6933">
                            <path class="btn" fill="gray"
                                d="M511.256 0C228.9 0 0 228.9 0 511.256 0 623.8 36.805 727.509 98.429 811.957l38.415-39.993c-51.592-73.945-82.067-163.708-82.067-260.709 0-252.105 204.374-456.479 456.479-456.479 252.089 0 456.466 204.374 456.466 456.479 0 252.101-204.376 456.466-456.466 456.466-96.102 0-185.157-29.847-258.709-80.565l-34.387 42.609c83.032 58.26 183.962 92.734 293.096 92.734 282.351 0 511.245-228.894 511.245-511.244C1022.5 228.9 793.606 0 511.256 0z"
                                p-id="6934"></path>
                            <path class="btn" fill="gray"
                                d="M492.979 255.62 492.979 492.986 255.613 492.986 255.613 547.762 492.979 547.762 492.979 785.128 547.756 785.128 547.756 547.762 785.121 547.762 785.121 492.986 547.756 492.986 547.756 255.62Z"
                                p-id="6935"></path>
                        </svg>
                        <svg @click="setRemoveTask(row)" class="btn" t="1646898833214" viewBox="0 0 1024 1024"
                            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7072">
                            <path class="btn" fill="gray"
                                d="M658.276045 767.993958 658.276045 274.295l329.126 0L987.402045 219.44 658.276 219.44l0-18.281c0-80.787046-65.492992-146.284032-146.276045-146.284032-80.790016 0-146.276045 65.496986-146.276045 146.284032l0 18.281L36.597 219.44l0 54.855 109.695 0 0 694.83L877.7 969.125l0-548.55-54.855 0L822.845 914.27l-621.69 0L201.155 274.295l164.569 0 0 493.699 54.848 0L420.572 274.295l182.85 0 0 493.699L658.276 767.994zM420.571034 219.440026l0-18.281c0-50.492006 40.932966-91.420979 91.428966-91.420979 50.489037 0 91.420979 40.928973 91.420979 91.420979l0 18.281L420.571 219.440026z"
                                p-id="7073"></path>
                        </svg>
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

        const barHover = inject('barHover') as ((rowId: any, hover: boolean) => void) | undefined;
        const addRootTask = inject('addRootTask') as ((row: any) => void) | undefined;

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
.active {
    background: #FFF3A1;
}

.row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    border-top: none;
    border-bottom: none;
    width: fit-content;

    &:first-child {
        border-top: 1px solid #cecece;
        border-bottom: none;
    }

    &:not(:first-child:last-child) {
        border-right: 1px solid #cecece;
        border-top: 1px solid #cecece;
        border-bottom: 1px solid #cecece;
    }

    &:last-child {
        border-top: none;
        border-bottom: 1px solid #cecece;
    }

    .cellNo {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 10px;
        border-top: none;
        border-bottom: none;
        margin: 0px 0px 0px 1px;
        position: relative;

        &:first-child {
            border-left: 1px solid #cecece;
        }

        &:not(:last-child) {
            border-right: 1px solid #cecece;
        }

        &:last-child {
            border-right: 1px solid #cecece;
        }

        .toolbar {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-evenly;
            position: absolute;
            right: 0px;
            width: 30px;

            .btn {
                width: 15px;
                height: 15px;
                position: relative;

                &:hover {
                    filter: drop-shadow(0px 0px 0px #2B76B3);
                }
            }
        }
    }

    .cell {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border-top: none;
        border-bottom: none;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            left: -1px;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #cecece;
        }

        &:first-child {
            border-left: 1px solid #cecece;

            &::before {
                display: none;
            }
        }

        &:not(:last-child) {
            border-right: 1px solid #cecece;
        }

        &:last-child {
            border-right: 1px solid #cecece;
        }
    }
}
</style>