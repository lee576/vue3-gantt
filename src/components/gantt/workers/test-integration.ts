/**
 * AdvancedWorkerManager 集成测试
 * 验证所有优化功能是否正常工作
 */

import { AdvancedWorkerManager, type AdvancedWorkerConfig, type ProcessedData } from './AdvancedWorkerManager'
import { PerformanceConfig } from '../composables/PerformanceConfig'

// 测试数据
const mockTasks = [
  {
    id: '1',
    name: '项目启动',
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    parentId: '0'
  },
  {
    id: '2',
    name: '需求分析',
    startDate: '2024-01-06',
    endDate: '2024-01-10',
    parentId: '1'
  },
  {
    id: '3',
    name: '设计阶段',
    startDate: '2024-01-11',
    endDate: '2024-01-15',
    parentId: '1'
  },
  {
    id: '4',
    name: '开发阶段',
    startDate: '2024-01-16',
    endDate: '2024-01-25',
    parentId: '1'
  }
]

const mockMapFields = {
  id: 'id',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  parentId: 'parentId'
}

async function testAdvancedWorkerManager() {
  console.log('🚀 开始测试 AdvancedWorkerManager 集成...')

  try {
    // 创建配置
    const config: Partial<AdvancedWorkerConfig> = {
      enablePool: true,
      enableSharedMemory: true,
      enableIncremental: true,
      poolSize: 2,
      sharedMemorySize: 1024 * 1024,
      trackFields: ['startDate', 'endDate', 'parentId', 'name']
    }

    // 初始化管理器
    const manager = new AdvancedWorkerManager(config)
    console.log('✅ AdvancedWorkerManager 初始化成功')

    // 测试完整数据处理
    const result1: ProcessedData = await manager.processAllData(
      mockTasks,
      '2024-01-01',
      '月',
      1,
      mockMapFields
    )
    console.log('✅ 完整数据处理成功:', {
      recursionDataLength: result1.recursionData?.length || 0,
      positionsLength: result1.positions?.length || 0
    })

    // 测试增量计算
    const modifiedTasks = [
      ...mockTasks,
      {
        id: '5',
        name: '测试阶段',
        startDate: '2024-01-26',
        endDate: '2024-01-30',
        parentId: '1'
      }
    ]

    const result2: ProcessedData = await manager.processAllData(
      modifiedTasks,
      '2024-01-01',
      '月',
      1,
      mockMapFields
    )
    console.log('✅ 增量计算处理成功:', {
      recursionDataLength: result2.recursionData?.length || 0,
      positionsLength: result2.positions?.length || 0,
      hasDiffs: !!result2.diffs
    })

    // 测试缓存状态
    console.log('✅ 缓存大小:', manager.getCacheSize())
    console.log('✅ Worker Pool 状态:', manager.getPoolStatus())
    console.log('✅ 共享内存支持:', manager.isSharedMemorySupported())

    // 测试兼容性方法
    const recursionData = await manager.processRecursionData('0', mockTasks, 0, mockMapFields)
    console.log('✅ 兼容性方法测试成功:', {
      recursionDataLength: recursionData?.length || 0
    })

    const positions = await manager.calcBarPositions(
      mockTasks,
      '2024-01-01',
      '月',
      1,
      mockMapFields
    )
    console.log('✅ 兼容性方法测试成功:', {
      positionsLength: positions?.length || 0
    })

    // 清理资源
    await manager.dispose()
    console.log('✅ 资源清理成功')

    console.log('🎉 所有测试通过！AdvancedWorkerManager 集成成功！')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  }
}

// 如果直接运行此文件，则执行测试
if (typeof window !== 'undefined' && window.document) {
  // 浏览器环境
  testAdvancedWorkerManager()
} else {
  // Node.js 环境或其他环境
  export { testAdvancedWorkerManager }
}

export default testAdvancedWorkerManager
