<template>
  <div class="bar-recursion-container">
    <!-- 虚拟滚动模式 -->
    <template v-if="useVirtualScroll">
      <div
        class="virtual-scroll-spacer"
        :style="{ height: totalHeight + 'px', paddingTop: offsetY + 'px', boxSizing: 'border-box' }"
      >
        <template v-for="item in visibleItems" :key="item.item[mapFields.id]">
          <div style="position: relative">
            <Milestone
              v-if="getTaskType(item.item) === TaskType.MILESTONE"
              :startGanttDate="startGanttDate"
              :endGanttDate="endGanttDate"
              :row="item.item"
              :row-index="item.index"
              :rowHeight="rowHeight"
              :bar-decoration-resolver="barDecorationResolver"
            />
            <Bar
              v-else
              :startGanttDate="startGanttDate"
              :endGanttDate="endGanttDate"
              :row="item.item"
              :row-index="item.index"
              :rowHeight="rowHeight"
              :bar-class-name="barClassName"
              :progress-handle-class-name="progressHandleClassName"
              :bar-decoration-resolver="barDecorationResolver"
            />
            <!-- 基线显示 -->
            <BaselineBar
              v-if="baselineDisplayConfig.enabled"
              :startGanttDate="startGanttDate"
              :endGanttDate="endGanttDate"
              :row="item.item"
              :rowHeight="rowHeight"
              :baselineData="getBaselineDataForTask(item.item[mapFields.id])"
              :baselineColor="baselineDisplayConfig.color"
            />
          </div>
        </template>
      </div>
    </template>
    <!-- 普通模式 -->
    <template v-else>
      <template v-for="item in visibleItems" :key="item.item[mapFields.id]">
        <div style="position: relative">
          <Milestone
            v-if="getTaskType(item.item) === TaskType.MILESTONE"
            :startGanttDate="startGanttDate"
            :endGanttDate="endGanttDate"
            :row="item.item"
            :row-index="item.index"
            :rowHeight="rowHeight"
            :bar-decoration-resolver="barDecorationResolver"
          />
          <Bar
            v-else
            :startGanttDate="startGanttDate"
            :endGanttDate="endGanttDate"
            :row="item.item"
            :row-index="item.index"
            :rowHeight="rowHeight"
            :bar-class-name="barClassName"
            :progress-handle-class-name="progressHandleClassName"
            :bar-decoration-resolver="barDecorationResolver"
          />
          <!-- 基线显示 -->
          <BaselineBar
            v-if="baselineDisplayConfig.enabled"
            :startGanttDate="startGanttDate"
            :endGanttDate="endGanttDate"
            :row="item.item"
            :rowHeight="rowHeight"
            :baselineData="getBaselineDataForTask(item.item[mapFields.id])"
            :baselineColor="baselineDisplayConfig.color"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, inject, type PropType } from 'vue'
import { store } from '../state/Store'
import Bar from './Bar.vue'
import BaselineBar from './BaselineBar.vue'
import Milestone from './Milestone.vue'
import { TaskType, type StyleConfig } from '../types/Types'
import { Symbols } from '../state/Symbols'
import { useBaseline } from '../composables/useBaseline'
import { visibleTasks } from '../state/DerivedState'
import { useSharedVerticalVirtualScroll } from '../composables/useSharedVerticalVirtualScroll'

type BarDecorationResolver = NonNullable<StyleConfig['setBarDecorations']>

export default defineComponent({
  name: 'BarRecursionRow',
  props: {
    rowHeight: {
      type: Number as () => number,
      default: 0,
    },
    barClassName: {
      type: String,
      default: '',
    },
    progressHandleClassName: {
      type: String,
      default: '',
    },
    barDecorationResolver: {
      type: Function as PropType<BarDecorationResolver | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    // 注入自定义任务类型判断函数
    // eslint-disable-next-line no-unused-vars
    const setTaskType = inject<((_row: any) => any) | undefined>(Symbols.SetTaskTypeSymbol, undefined)

    // 基线功能
    const { getBaselineDataForTask, baselineDisplayConfig } = useBaseline()

    const timelineCellCount = computed(() => store.timelineCellCount)
    const scale = computed(() => store.scale)
    const mode = computed(() => store.mode)
    const startGanttDate = computed(() =>
      store.startGanttDate ? store.startGanttDate.toISOString() : new Date().toISOString()
    )
    const endGanttDate = computed(() =>
      store.endGanttDate ? store.endGanttDate.toISOString() : new Date().toISOString()
    )
    const mapFields = computed(() => store.mapFields)
    const tasks = computed(() => visibleTasks.value)
    const rowHeight = computed(() => props.rowHeight || 40)
    const { useVirtualScroll, totalHeight, offsetY, visibleItems, startIndex, endIndex } =
      useSharedVerticalVirtualScroll(tasks, rowHeight)

    // 判断任务类型
    const getTaskType = (row: any): string => {
      // 如果提供了自定义函数，使用自定义函数
      if (setTaskType) {
        return setTaskType(row)
      }

      // 默认逻辑：优先检查任务数据中的 type 字段
      // 只有明确设置为 milestone 的任务才显示为里程碑
      if (row.type === TaskType.MILESTONE || row.type === 'milestone') {
        return TaskType.MILESTONE
      }

      // 如果有明确的 type 字段且不是 milestone，则使用该类型
      if (row.type) {
        return row.type
      }

      // 如果没有 type 字段，默认为普通任务
      // 注意：不再根据开始日期和结束日期是否相同来判断是否为里程碑
      // 因为这会导致非里程碑任务被调整为一个单元格长度时错误地显示为里程碑
      return TaskType.TASK
    }

    return {
      tasks,
      timelineCellCount,
      scale,
      mode,
      startGanttDate,
      endGanttDate,
      mapFields,
      getTaskType,
      TaskType,
      // 虚拟滚动相关
      useVirtualScroll,
      totalHeight,
      offsetY,
      visibleItems,
      startIndex,
      endIndex,
      // 基线相关
      getBaselineDataForTask,
      baselineDisplayConfig,
    }
  },
  components: { Bar, BaselineBar, Milestone },
})
</script>

<style scoped>
.bar-recursion-container {
  width: 100%;
}

.virtual-scroll-spacer {
  width: 100%;
}
</style>
