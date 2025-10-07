import type { FileItem } from '~/types/resource'
import { useBaseFetch } from '~~/composables/use-base-fetch'
const baseUrl = '/resource/'

/**
 * 获取oss授权信息
 */
export const getOssAuth = () => useBaseFetch().get(`${baseUrl}oss/v1/token`)

/**
 * 创建oss记录
 */
export const createOssRecord = (params) => useBaseFetch().post<FileItem>(`${baseUrl}oss/v1/create-record`, params)
