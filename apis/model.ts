import { useBaseFetch } from '~~/composables/use-base-fetch'
import type { ModelItem } from '~/types/model'
import type { Page } from '~/types/base'
const baseUrl = '/resource/'
/**
 * 新增构件
 */
export const createModel = (data) => useBaseFetch().post(`${baseUrl}model/v1/create`, data)
/**
 * 构件列表分页
 */
export const getModelList = (params) => useBaseFetch().get<Page<ModelItem>>(`${baseUrl}model/v1/page`, params)
/**
 * 构件详情
 */
export const getModelDetail = (params) => useBaseFetch().get<ModelItem>(`${baseUrl}model/v1/detail`, params)
/**
 * 更新构件
 */
export const updateModal = (params) => useBaseFetch().post<ModelItem>(`${baseUrl}model/v1/update`, params)
/**
 * 删除构件
 */
export const removeModel = (params) => useBaseFetch().post(`${baseUrl}model/v1/remove`, params)
