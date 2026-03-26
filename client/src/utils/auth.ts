import Taro from '@tarojs/taro'
import { post } from './request'

/**
 * 检查登录态
 * 如果本地有 token 则标记为已登录
 * 否则不做任何操作（允许游客浏览）
 */
export const checkLogin = (): boolean => {
  const token = Taro.getStorageSync('token')
  return !!token
}

/**
 * 获取当前登录用户信息
 */
export const getUserInfo = () => {
  return Taro.getStorageSync('userInfo') || null
}

/**
 * 微信登录
 * 获取 code → 发送到后端 → 换取 token
 */
export const wxLogin = async (): Promise<boolean> => {
  try {
    const { code } = await Taro.login()

    const res = await post<{ token: string; userInfo: any }>('/auth/login', {
      code,
    })

    // 存储 token 和用户信息
    Taro.setStorageSync('token', res.data.token)
    Taro.setStorageSync('userInfo', res.data.userInfo)

    return true
  } catch (error) {
    console.error('登录失败:', error)
    return false
  }
}

/**
 * 退出登录
 */
export const logout = () => {
  Taro.removeStorageSync('token')
  Taro.removeStorageSync('userInfo')
  Taro.showToast({
    title: '已退出登录',
    icon: 'success',
    duration: 1500,
  })
}

/**
 * 获取 token
 */
export const getToken = (): string => {
  return Taro.getStorageSync('token') || ''
}

/**
 * 判断是否已登录
 */
export const isLoggedIn = (): boolean => {
  return !!Taro.getStorageSync('token')
}
