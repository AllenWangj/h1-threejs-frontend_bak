import { getModelList } from '~/apis/resource'
import type { ModelItem } from '~/types/model'

export const useModelMap = () => {
  const modelMap = useState<Map<string, ModelItem>>('modelMap', () => new Map())
  /**
   * 匹配字典值
   */
  const getModelUrl = (code: string) => {
    const modelItem = modelMap.value.get(code)
    return modelItem?.url || ''
  }
  /**
   * 获取模型映射
   */
  const getModelMap = async (codes: string[]) => {
    try {
      const filterCodes = codes.filter((key) => !modelMap.value.has(key))
      if (filterCodes.length === 0) return
      const { data } = await getModelList({ codes: filterCodes })
      if (data) {
        Object.keys(data).forEach((i) => {
          modelMap.value.set(i, data[i])
        })
      }
    } catch (error) {}
  }
  return { modelMap, getModelUrl, getModelMap }
}
