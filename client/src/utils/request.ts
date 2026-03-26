import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

/**
 * 网络请求封装
 * 自动添加 token、统一错误处理、401 自动跳转登录
 */
const request = <T = any>(options: RequestOptions): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    // 从本地存储获取 token
    const token = Taro.getStorageSync('token')

    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header,
    }

    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        const data = res.data as ApiResponse<T>

        if (data.code === 0) {
          resolve(data)
        } else if (data.code === 401) {
          // token 过期，清除本地存储并跳转登录
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')
          Taro.navigateTo({ url: '/pages/login/index' })
          reject(new Error('登录已过期，请重新登录'))
        } else {
          Taro.showToast({
            title: data.message || '请求失败',
            icon: 'none',
            duration: 2000,
          })
          reject(new Error(data.message || '请求失败'))
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000,
        })
        reject(err)
      },
    })
  })
}

export const get = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'GET', data })
}

export const post = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'POST', data })
}

export const put = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'PUT', data })
}

export const del = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'DELETE', data })
}

export default request
