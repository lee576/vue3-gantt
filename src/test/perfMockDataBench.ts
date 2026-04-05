import { getPerformanceTestResponse } from '../mock/mockData'
import { useCustomFields } from '../composables/useCustomFields'
import { getWorkerManager, destroyWorkerManager } from '../components/gantt/workers/AdvancedWorkerAdapter'
import { flattenTasksByHierarchy } from '../components/gantt/utils/taskTree'
import { mutations } from '../components/gantt/state/Store'
import { visibleTasks } from '../components/gantt/state/DerivedState'

async function main() {
  const { processTasksWithCustomFields } = useCustomFields()
  const start = performance.now()
  const response = await getPerformanceTestResponse()
  const afterGenerate = Math.round(performance.now() - start)
  const processed = processTasksWithCustomFields(response.tasks)
  const afterCustomFields = Math.round(performance.now() - start)

  const flattenStart = performance.now()
  const flattened = flattenTasksByHierarchy(processed, {
    id: 'id',
    parentId: 'pid',
  })
  const flattenMs = Math.round(performance.now() - flattenStart)

  const setTasksStart = performance.now()
  mutations.setMapFields({
    id: 'id',
    parentId: 'pid',
    task: 'taskNo',
    priority: 'level',
    startdate: 'start_date',
    enddate: 'end_date',
    takestime: 'spend_time',
    progress: 'job_progress',
  })
  mutations.expandAllTasks()
  mutations.clearAutoCollapsedTasks()
  mutations.setTasks(flattened as any)
  const setTasksMs = Math.round(performance.now() - setTasksStart)

  const initialVisibleTasksReadStart = performance.now()
  const initialVisibleTaskCount = visibleTasks.value.length
  const initialVisibleTasksReadMs = Math.round(performance.now() - initialVisibleTasksReadStart)

  const collapseAllStart = performance.now()
  mutations.collapseAllTasks()
  const collapseAllMs = Math.round(performance.now() - collapseAllStart)

  const collapseAllVisibleTasksReadStart = performance.now()
  const collapseAllVisibleTaskCount = visibleTasks.value.length
  const collapseAllVisibleTasksReadMs = Math.round(
    performance.now() - collapseAllVisibleTasksReadStart
  )

  const expandAllStart = performance.now()
  mutations.expandAllTasks()
  const expandAllMs = Math.round(performance.now() - expandAllStart)

  const firstCollapsibleTask = flattened.find(task => task.pid === '0')
  let collapseToggleMs: number | null = null
  let expandToggleMs: number | null = null

  if (firstCollapsibleTask) {
    const collapseStart = performance.now()
    mutations.toggleTaskCollapse(firstCollapsibleTask.id)
    collapseToggleMs = Math.round(performance.now() - collapseStart)

    const expandStart = performance.now()
    mutations.toggleTaskCollapse(firstCollapsibleTask.id)
    expandToggleMs = Math.round(performance.now() - expandStart)
  }

  let workerMs: number | null = null
  let workerFlattenedCount: number | null = null

  // vite-node 运行在 Node 环境，默认没有浏览器 Worker。
  // 这里保留降级分支，让基准脚本至少能稳定输出“生成 + 自定义字段 + 树展开”三段关键耗时。
  if (typeof Worker !== 'undefined') {
    const workerManager = getWorkerManager()
    const workerStart = performance.now()
    const workerFlattened = await workerManager.processRecursionData('0', processed, 0, {
      id: 'id',
      parentId: 'pid',
    })
    workerMs = Math.round(performance.now() - workerStart)
    workerFlattenedCount = workerFlattened.length
    destroyWorkerManager()
  }

  const total = Math.round(performance.now() - start)

  console.log(
    JSON.stringify(
      {
        generateMs: afterGenerate,
        processMs: afterCustomFields - afterGenerate,
        flattenMs,
        setTasksMs,
        initialVisibleTaskCount,
        initialVisibleTasksReadMs,
        collapseAllMs,
        collapseAllVisibleTaskCount,
        collapseAllVisibleTasksReadMs,
        expandAllMs,
        collapseToggleMs,
        expandToggleMs,
        workerFlattenMs: workerMs,
        totalMs: total,
        taskCount: processed.length,
        flattenedCount: flattened.length,
        workerFlattenedCount,
        dependencyCount: response.dependencies.length,
      },
      null,
      2
    )
  )
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
