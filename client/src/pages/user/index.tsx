import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUserInfo, isLoggedIn } from '../../utils/auth'
import './index.scss'

interface UserInfo {
  nickname: string
  avatar: string
}

const orderTabs = [
  { key: 'pending', label: '待付款', icon: '💳' },
  { key: 'shipped', label: '待发货', icon: '📦' },
  { key: 'received', label: '待收货', icon: '🚚' },
  { key: 'all', label: '全部订单', icon: '📋' },
]

const menuItems = [
  { key: 'address', label: '收货地址', icon: '📍', url: '/pages/address/list' },
  { key: 'coupon', label: '优惠券', icon: '🎫', url: '' },
  { key: 'service', label: '联系客服', icon: '💬', url: '' },
]

const User = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const loginStatus = isLoggedIn()
    setLoggedIn(loginStatus)
    if (loginStatus) {
      const info = getUserInfo()
      setUserInfo(info)
    }
  }, [])

  // 跳转登录
  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  // 跳转订单列表
  const goToOrderList = (status: string) => {
    Taro.navigateTo({ url: `/pages/order/list?status=${status}` })
  }

  // 菜单点击
  const handleMenuClick = (url: string) => {
    if (url) {
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  return (
    <View className='user-page'>
      {/* 红色头部 */}
      <View className='user-header'>
        {loggedIn ? (
          <View className='user-header__info' onClick={handleLogin}>
            <Image
              className='user-header__avatar'
              src={userInfo?.avatar || 'https://via.placeholder.com/120x120/ffffff/e4393c?text=头像'}
              mode='aspectFill'
            />
            <View className='user-header__detail'>
              <Text className='user-header__name'>{userInfo?.nickname || '用户'}</Text>
              <Text className='user-header__tag'>普通会员</Text>
            </View>
          </View>
        ) : (
          <View className='user-header__login' onClick={handleLogin}>
            <Image
              className='user-header__avatar'
              src='https://via.placeholder.com/120x120/ffffff/e4393c?text=?'
              mode='aspectFill'
            />
            <Text className='user-header__tip'>点击登录</Text>
          </View>
        )}
      </View>

      {/* 订单入口 */}
      <View className='order-section card'>
        <View className='order-section__header'>
          <Text className='order-section__title'>我的订单</Text>
          <Text className='order-section__more' onClick={() => goToOrderList('all')}>
            查看全部 ›
          </Text>
        </View>
        <View className='order-section__grid'>
          {orderTabs.map((tab) => (
            <View
              className='order-section__item'
              key={tab.key}
              onClick={() => goToOrderList(tab.key)}
            >
              <Text className='order-section__icon'>{tab.icon}</Text>
              <Text className='order-section__label'>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='menu-section card'>
        {menuItems.map((item, index) => (
          <View
            className='menu-item'
            key={item.key}
            onClick={() => handleMenuClick(item.url)}
          >
            <View className='menu-item__left'>
              <Text className='menu-item__icon'>{item.icon}</Text>
              <Text className='menu-item__label'>{item.label}</Text>
            </View>
            <Text className='menu-item__arrow'>›</Text>
            {index < menuItems.length - 1 && <View className='menu-item__border' />}
          </View>
        ))}
      </View>
    </View>
  )
}

export default User
