import { getModelList } from '~/apis/resource'
import type { ModelItem } from '~/types/model'

export const useModelMap = () => {
  /** 模型缓存映射表，以 code 为 key，存储模型信息和 URL */
  const modelMap = useState<Map<string, ModelItem>>('modelMap', () => new Map())
  /** 正在加载中的模型 code集合，用于防止并发请求重复加载 */
  const loadingCodes = new Set<string>()
  
  /**
   * 获取模型 URL
   * @param code - 模型编码
   * @returns 模型 URL 或空字符串
   */
  const getModelUrl = (code: string): string => {
    const modelItem = modelMap.value.get(code)
    return modelItem?.url || ''
  }
  
  /**
   * 获取模型信息
   * @param code - 模型编码
   * @returns 模型信息或 undefined
   */
  const getModelInfo = (code: string): ModelItem | undefined => {
    console.log(modelMap.value, code);
    return modelMap.value.get(code)
  }
  
  /**
   * 批量获取模型映射
   * @param codes - 模型编码数组
   * @description 智能缓存管理：
   * 1. 过滤已缓存和正在加载的模型，避免重复请求
   * 2. 批量请求 API 提高性能
   * 3. 使用 loadingCodes 集合防止并发请求冲突
   */
  const getModelMap = async (codes: string[]): Promise<void> => {
    try {
      // 第一步：过滤已缓存和正在加载的模型，实现去重
      const filterCodes = codes.filter((code) => 
        !modelMap.value.has(code) && !loadingCodes.has(code)
      )
      
      // 全部命中缓存，直接返回
      if (filterCodes.length === 0) {
        console.log('✅ 所有模型已缓存，无需重新加载')
        return
      }
      
      // 第二步：标记为正在加载，防止并发请求
      filterCodes.forEach(code => loadingCodes.add(code))
      
      console.log(`📦 开始加载 ${filterCodes.length} 个模型映射...`)
      
      // 第三步：批量请求 API
      const { data } = await getModelList({ codes: filterCodes })
      
      if (data && Array.isArray(data)) {
        // 第四步：批量更新缓存
        data.forEach((modelItem) => {
          if (modelItem.code) {
            modelMap.value.set(modelItem.code, modelItem)
          }
        })
        
        console.log(`✅ 成功加载 ${data.length} 个模型映射`)
      }
      
      // 第五步：清理加载标记
      filterCodes.forEach(code => loadingCodes.delete(code))
    } catch (error) {
      console.error('❌ 加载模型映射失败:', error)
      // 错误处理：清理加载标记
      codes.forEach(code => loadingCodes.delete(code))
      throw error
    }
  }
  
  /**
   * 清除缓存
   */
  const clearModelCache = (): void => {
    modelMap.value.clear()
    loadingCodes.clear()
    console.log('🗑️ 模型缓存已清空')
  }
  
  /**
   * 预加载模型
   * @param codes - 模型编码数组
   */
  const preloadModels = async (codes: string[]): Promise<void> => {
    await getModelMap(codes)
  }
  
  /**
   * 获取缓存统计
   */
  const getCacheStats = () => {
    return {
      total: modelMap.value.size,
      loading: loadingCodes.size,
      cached: Array.from(modelMap.value.keys())
    }
  }
  
  return { 
    modelMap, 
    getModelUrl, 
    getModelInfo,
    getModelMap,
    clearModelCache,
    preloadModels,
    getCacheStats
  }
}
