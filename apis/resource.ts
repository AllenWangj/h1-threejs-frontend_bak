import type { Page } from '~/types/base'
import type { ModelItem } from '~/types/model'
import type { FileItem } from '~/types/resource'
import { useBaseFetch } from '~~/composables/use-base-fetch'
const baseUrl = '/resource/'

/**
 * 获取 OSS 上传授权信息
 * @returns 包含 accessKeyId、secretAccessKey、sessionToken、endpoint、bucket 等信息
 * @description 临时凭证有效期为 1 小时
 */
export const getOssAuth = () => useBaseFetch().get(`${baseUrl}oss/v1/token`)

/**
 * 创建 OSS 文件记录
 * @param params - 文件元数据，包含name、url、size、mimeType、hash 等
 * @returns 文件记录对象
 * @description 上传成功后需调用此接口保存文件元信息到数据库
 */
export const createOssRecord = (params) => useBaseFetch().post<FileItem>(`${baseUrl}oss/v1/create-record`, params)

/**
 * 新增构件/模型
 * @param data - 构件信息，包含code、name、url、category 等
 * @returns 创建结果
 */
export const createModel = (data) => useBaseFetch().post(`${baseUrl}model/v1/create`, data)

/**
 * 构件列表分页查询
 * @param params - 分页参数，包含page、pageSize、name、category 等
 * @returns 构件分页数据
 */
export const getModelPage = (params) => useBaseFetch().get<Page<ModelItem>>(`${baseUrl}model/v1/page`, params)

/**
 * 获取构件详情
 * @param params - 构件 ID
 * @returns 构件完整信息
 */
export const getModelDetail = (params) => useBaseFetch().get<ModelItem>(`${baseUrl}model/v1/detail`, params)

/**
 * 更新构件信息
 * @param params - 构件 ID 和要更新的字段
 * @returns 更新后的构件信息
 */
export const updateModal = (params) => useBaseFetch().post<ModelItem>(`${baseUrl}model/v1/update`, params)

/**
 * 删除构件
 * @param params - 构件 ID
 * @returns 删除结果
 */
export const removeModel = (params) => useBaseFetch().post(`${baseUrl}model/v1/remove`, params)

/**
 * 批量查询构件列表
 * @param params - 构件 code 数组，如 { codes: ['02_75_10137', '02_75_10110'] }
 * @returns 构件信息数组
 * @description 用于批量获取模型 URL，支持缓存管理
 */
export const getModelList = (params) => useBaseFetch().post<ModelItem[]>(`${baseUrl}model/v1/list`, params)

/**
 * 获取 GIS 地块列表（分页）
 * @param params - 分页参数
 * @returns 地块分页数据，包含 DEM、卫星影像等信息
 */
export const getResourceList = (params) => useBaseFetch().get(`${baseUrl}gis/v1/page`, params)

/**
 * 新增 GIS 地块
 * @param data - 地块信息，包含名称、DEM URL、卫星影像 URL、边界范围等
 * @returns 创建结果
 */
export const createResource = (data) => useBaseFetch().post(`${baseUrl}gis/v1/create`, data)

/**
 * 更新 GIS 地块信息
 * @param params - 地块 ID 和要更新的字段
 * @returns 更新结果
 */
export const updateResource = (params) => useBaseFetch().post(`${baseUrl}gis/v1/update`, params)

/**
 * 删除 GIS 地块
 * @param params - 地块 ID
 * @returns 删除结果
 */
export const removeResource = (params) => useBaseFetch().post(`${baseUrl}gis/v1/remove`, params)
