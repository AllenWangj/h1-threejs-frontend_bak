import { getDict } from '~/apis/system'
import type { Dict } from '~/types/base'

/**
 * 字典数据管理 Composable
 * @description 提供字典缓存、查询、标签匹配等功能
 */
export const useDict = () => {
  /** 字典缓存映射表，以字典代码为 key */
  const dictMap = useState<Map<string, Dict[]>>('dictMap', () => new Map())
  
  /**
   * 匹配字典值对应的标签
   * @param code 字典代码
   * @param key 字典值
   * @param strict 是否严格匹配（true 为全等，false 为字符串对比）
   * @returns 字典标签或 undefined
   */
  const getLabel = (code: string, key: string | number, strict = false) => {
    const dictItem = dictMap.value.get(code)
    if (dictItem) {
      const labelItem = dictItem.find((i) => {
        return strict ? i.value === key : i.value.toString() === key?.toString()
      })
      return labelItem?.label
    }
    return
  }
  
  /**
   * 批量获取字典映射
   * @param codes 字典代码数组
   * @description 自动过滤已缓存的字典，只请求未缓存的部分
   */
  const getDictMap = async (codes: string[]) => {
    try {
      // 过滤已缓存的字典，减少不必要的请求
      const filterCodes = codes.filter((key) => !dictMap.value.has(key))
      if (filterCodes.length === 0) return
      
      const { data } = await getDict({ codes: filterCodes })
      if (data) {
        // 更新缓存
        Object.keys(data).forEach((i) => {
          dictMap.value.set(i, data[i])
        })
      }
    } catch (error) {}
  }
  
  /**
   * 从数组中获取字典标签
   * @param key 字典值
   * @param array 字典数组
   * @returns 字典标签，未找到返回空字符串
   */
  const getArrayLabel = (key: string, array: any[]): string => {
    const findItem = array.find((i: any) => i.value === key)
    return findItem?.label || ''
  }
  
  return { dictMap, getLabel, getDictMap, getArrayLabel }
}
