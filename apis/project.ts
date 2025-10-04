import { useBaseFetch } from '~~/composables/use-base-fetch'
const baseUrl = '/project/'

/**
 * 获取项目列表
*/
export const getProjectList = (params) => useBaseFetch().get(`${baseUrl}record/v1/page`, params)

/**
 * 创建项目
*/
export const createProject = (params) => useBaseFetch().post(`${baseUrl}record/v1/create`, params)

/**
 * 删除项目
 */
export const removeProject = (params) => useBaseFetch().post(`${baseUrl}record/v1/remove`, params)


/**
 * 获取项目详情
*/
export const getProjectDetail = (params) => useBaseFetch().get(`${baseUrl}record/v1/detail`, params)

/**
 * 更新项目
*/
export const updateProject = (params) => useBaseFetch().post(`${baseUrl}record/v1/update`, params)