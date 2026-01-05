/**
 * Worker 数据序列化工具
 * 清理无法被 postMessage 克隆的数据
 */

export function sanitizeForWorker<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data !== 'object') {
    return data
  }

  if (typeof data === 'function') {
    return undefined as any
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForWorker(item)) as T
  }

  const result: Record<string, any> = {}
  
  for (const key of Object.keys(data)) {
    const value = (data as Record<string, any>)[key]
    
    if (value === null || value === undefined) {
      continue
    }
    
    if (typeof value === 'function') {
      continue
    }
    
    if (typeof value === 'object') {
      if (isVueReactive(value) || isDOMNode(value)) {
        continue
      }
      
      if (isCircularRef(data, value)) {
        continue
      }
      
      result[key] = sanitizeForWorker(value)
    } else {
      result[key] = value
    }
  }
  
  return result as T
}

function isVueReactive(obj: any): boolean {
  if (!obj) return false
  
  if (typeof obj === 'object' && typeof obj.__v_skip === 'boolean') {
    return true
  }
  
  if (typeof obj === 'object' && typeof obj.__ob__ !== 'undefined') {
    return true
  }
  
  if (typeof obj === 'object' && typeof obj._isVue === 'boolean') {
    return true
  }
  
  return false
}

function isDOMNode(obj: any): boolean {
  if (!obj) return false
  try {
    if (typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string') {
      return true
    }
  } catch {
    return false
  }
  return false
}

const circularRefSet = new WeakSet()

function isCircularRef(parent: any, child: any): boolean {
  if (child === null || child === undefined) return false
  if (typeof child !== 'object') return false
  if (child === parent) return true
  
  try {
    if (circularRefSet.has(child)) {
      return true
    }
    circularRefSet.add(child)
    return false
  } catch {
    return true
  } finally {
    try {
      circularRefSet.delete(child)
    } catch {
    }
  }
}

export function sanitizeTasksForWorker(tasks: any[]): any[] {
  if (!Array.isArray(tasks)) {
    return []
  }
  
  return tasks.map(task => {
    if (!task || typeof task !== 'object') {
      return task
    }
    
    const sanitized: Record<string, any> = {}
    
    for (const key of Object.keys(task)) {
      if (isVueInternalKey(key)) {
        continue
      }
      
      const value = task[key]
      
      if (value === null || value === undefined) {
        sanitized[key] = value
        continue
      }
      
      if (typeof value === 'function') {
        continue
      }
      
      if (typeof value === 'object') {
        if (isVueReactive(value) || isDOMNode(value)) {
          continue
        }
        
        if (Array.isArray(value)) {
          sanitized[key] = value.filter(item => 
            !isVueReactive(item) && !isDOMNode(item) && typeof item !== 'function'
          )
        } else {
          sanitized[key] = sanitizeForWorker(value)
        }
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  })
}

function isVueInternalKey(key: string): boolean {
  const vueInternalKeys = [
    '__v_skip',
    '__ob__',
    '_isVue',
    '_proxyTarget',
    '__vue_raw__',
    'toJSON',
    '$$typeof',
    '_owner',
    '_store',
    '_self',
    '_vnode',
  ]
  
  return vueInternalKeys.includes(key)
}

export function sanitizeMapFieldsForWorker(mapFields: Record<string, string>): Record<string, string> {
  if (!mapFields || typeof mapFields !== 'object') {
    return { id: 'id', name: 'name', startDate: 'startDate', endDate: 'endDate', parentId: 'parentId' }
  }
  
  const result: Record<string, string> = {}
  
  for (const key of Object.keys(mapFields)) {
    const value = mapFields[key]
    if (typeof value === 'string') {
      result[key] = value
    }
  }
  
  return result
}
