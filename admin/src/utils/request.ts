import axios from 'axios'
import { message } from 'antd'
import { getToken, removeToken } from './auth'

/** Axios 实例 */
const request = axios.create({
  baseURL: '/api/admin',
  timeout: 15000,
})

/** 请求拦截：自动附加 token */
request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 响应拦截：统一错误处理 */
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        removeToken()
        window.location.href = '/login'
        message.error('登录已过期，请重新登录')
      } else {
        message.error(data?.message || `请求失败 (${status})`)
      }
    } else {
      message.error('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  },
)

export default request
