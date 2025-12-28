/**
 * Web Worker 性能测试
 * 对比主线程和 Worker 线程的处理性能
 */

import { getWorkerManager } from '../workers/WorkerManager'

/**
 * 生成测试数据
 */
function generateTestData(count: number): any[] {
  const data: any[] = []
  let id = 1

  // 生成根节点
  for (let i = 0; i < Math.ceil(count / 10); i++) {
    data.push({
      id: `${id++}`,
      parentId: '0',
      name: `任务 ${i + 1}`,
      startDate: '2024-01-01',
      endDate: '2024-01-10',
    })

    // 每个根节点生成若干子节点
    const childCount = Math.min(9, count - data.length)
    for (let j = 0; j < childCount; j++) {
      data.push({
        id: `${id++}`,
        parentId: `${id - childCount - 1}`,
        name: `子任务 ${i + 1}-${j + 1}`,
        startDate: '2024-01-02',
        endDate: '2024-01-08',
      })
    }

    if (data.length >= count) break
  }

  return data.slice(0, count)
}

/**
 * 主线程递归处理（模拟）
 */
function processInMainThread(tasks: any[], mapFields: Record<string, string>): any[] {
  const initData: any[] = []

  function recursion(id: any, level: number) {
    const findResult = tasks.filter(obj => obj[mapFields['parentId']] === id)
    if (findResult && findResult.length > 0) {
      level++
      for (let i = 0; i < findResult.length; i++) {
        findResult[i].treeLevel = level
        findResult[i].index = i + 1

        const parent = initData.filter(
          obj => obj[mapFields['id']] === findResult[i][mapFields['parentId']]
        )

        if (parent && parent.length > 0) {
          findResult[i].no = parent[0].index + '.' + findResult[i].index
        } else {
          findResult[i].no = i + 1 + ''
        }

        initData.push(findResult[i])
        recursion(findResult[i][mapFields['id']], level)
      }
    }
  }

  recursion('0', 0)
  return initData
}

/**
 * 运行性能测试
 */
export async function runPerformanceTest() {
  console.log('🚀 开始 Web Worker 性能测试...\n')

  const mapFields = {
    id: 'id',
    parentId: 'parentId',
    startDate: 'startDate',
    endDate: 'endDate',
  }

  const testCases = [50, 100, 200, 500, 1000]
  const results: any[] = []

  for (const count of testCases) {
    console.log(`📊 测试任务数: ${count}`)

    const testData = generateTestData(count)

    // 测试主线程
    const mainThreadStart = performance.now()
    processInMainThread(testData, mapFields)
    const mainThreadTime = performance.now() - mainThreadStart
    console.log(`  ⚡ 主线程耗时: ${mainThreadTime.toFixed(2)}ms`)

    // 测试 Worker
    const workerManager = getWorkerManager()
    const workerStart = performance.now()
    await workerManager.processRecursionData('0', testData, 0, mapFields)
    const workerTime = performance.now() - workerStart
    console.log(`  🔧 Worker 耗时: ${workerTime.toFixed(2)}ms`)

    const improvement = (((mainThreadTime - workerTime) / mainThreadTime) * 100).toFixed(2)
    console.log(`  📈 性能提升: ${improvement}%\n`)

    results.push({
      taskCount: count,
      mainThreadTime: mainThreadTime.toFixed(2),
      workerTime: workerTime.toFixed(2),
      improvement: improvement + '%',
    })
  }

  console.log('✅ 测试完成！\n')
  console.table(results)

  return results
}

/**
 * 简单测试
 */
export async function simpleTest() {
  console.log('🧪 简单功能测试...\n')

  const workerManager = getWorkerManager()
  const testData = generateTestData(10)
  const mapFields = {
    id: 'id',
    parentId: 'parentId',
    startDate: 'startDate',
    endDate: 'endDate',
  }

  try {
    const result = await workerManager.processRecursionData('0', testData, 0, mapFields)
    console.log('✅ Worker 处理成功')
    console.log('处理结果:', result)
    return true
  } catch (error) {
    console.error('❌ Worker 处理失败:', error)
    return false
  }
}

// 在浏览器控制台中可以直接调用
if (typeof window !== 'undefined') {
  ;(window as any).testWorker = {
    runPerformanceTest,
    simpleTest,
  }
  console.log('💡 提示: 在控制台中运行以下命令进行测试:')
  console.log('  - window.testWorker.simpleTest()       // 简单功能测试')
  console.log('  - window.testWorker.runPerformanceTest() // 性能对比测试')
}
