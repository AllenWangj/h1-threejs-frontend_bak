import { useBaseFetch } from '~~/composables/use-base-fetch'
import type { IBody, IRecord } from '~/types/model'

// 添加模型
const baseUrl = '/resource/'

export const getAddModel = (data) =>
  useBaseFetch().post(`${baseUrl}model/v1/create`, data)
export const getModelList = (params) =>
  useBaseFetch().get<IBody<IRecord>>(`${baseUrl}/model/v1/page`, params)

export const updateModal = (params) =>
  useBaseFetch().post(`${baseUrl}model/v1/update`, params)


export const removeModel = (params) =>
  useBaseFetch().post(`${baseUrl}model/v1/remove`, params)


// getAddModel