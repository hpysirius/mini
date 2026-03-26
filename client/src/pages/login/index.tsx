import { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { wxLogin } from '../../utils/auth'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // 微信授权登录
  const handleWxLogin = async () => {
    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const success = await wxLogin()
      if (success) {
        Taro.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    } catch (error) {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 获取用户信息（新版小程序已废弃，保留示例）
  const handleGetUserInfo = () => {
    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }
    handleWxLogin()
  }

  // 切换协议同意
  const toggleAgreed = () => {
    setAgreed(!agreed)
  }

  // 查看协议
  const showAgreement = (type: string) => {
    Taro.showToast({ title: `${type}页面开发中`, icon: 'none' })
  }

  return (
    <View className='login-page'>
      {/* Logo 区域 */}
      <View className='login-logo'>
        <Text className='login-logo__icon'>🛍️</Text>
        <Text className='login-logo__title'>小商城</Text>
        <Text className='login-logo__subtitle'>品质好物，尽在掌握</Text>
      </View>

      {/* 登录按钮区域 */}
      <View className='login-buttons'>
        <Button
          className='login-btn login-btn--wx'
          onClick={handleGetUserInfo}
          loading={loading}
        >
          <Text className='login-btn__icon'>💬</Text>
          <Text className='login-btn__text'>微信一键登录</Text>
        </Button>

        <Button className='login-btn login-btn--phone'>
          <Text className='login-btn__icon'>📱</Text>
          <Text className='login-btn__text'>手机号登录</Text>
        </Button>
      </View>

      {/* 协议区域 */}
      <View className='login-agreement'>
        <View className='login-agreement__check' onClick={toggleAgreed}>
          <View className={`login-agreement__checkbox ${agreed ? 'login-agreement__checkbox--checked' : ''}`}>
            {agreed && <Text className='login-agreement__check-icon'>✓</Text>}
          </View>
          <Text className='login-agreement__text'>
            我已阅读并同意
            <Text className='login-agreement__link' onClick={(e) => { e.stopPropagation(); showAgreement('用户协议') }}>
              《用户协议》
            </Text>
            和
            <Text className='login-agreement__link' onClick={(e) => { e.stopPropagation(); showAgreement('隐私政策') }}>
              《隐私政策》
            </Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Login
