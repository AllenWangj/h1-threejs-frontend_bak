import dayjs from 'dayjs'
import type { Dict } from '~/types/base'

/**
 * 通用工具函数 Composable
 * @description 提供时间格式化、文件大小格式化、标签查询等功能
 */
export const useUtils = () => {
  /**
   * 格式化时间戳
   * @param timestamp 时间戳（毫秒）
   * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm'
   * @returns 格式化后的时间字符串
   */
  const formatTime = (timestamp: number, format = 'YYYY-MM-DD HH:mm') => {
    return timestamp ? dayjs(timestamp).format(format) : ''
  }
  
  /**
   * 从字典数组中获取标签
   * @param key 字典值
   * @param list 字典数组
   * @returns 字典标签
   */
  const getLabel = (key: unknown, list: Dict[]) => {
    const findOne = list.find((item) => item.value.toString() === key.toString())
    return findOne.label
  }

  /**
   * 格式化文件大小
   * @param size 文件大小（字节）
   * @returns 人类可读的文件大小（B/KB/MB）
   */
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + 'B'
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB'
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + 'MB'
    }
  }

  return {
    getLabel,
    formatTime,
    formatFileSize,
  }
}
