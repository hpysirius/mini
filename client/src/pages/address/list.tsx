import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './list.scss'

interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const AddressList = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    setIsSelectMode(params?.select === 'true')

    // 模拟地址数据
    setAddresses([
      {
        id: 1,
        name: '张三',
        phone: '138****8888',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区xx大厦xx号',
        isDefault: true,
      },
      {
        id: 2,
        name: '李四',
        phone: '139****9999',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国路xx号xx小区xx栋',
        isDefault: false,
      },
    ])
  }, [])

  // 选择地址（确认订单时使用）
  const selectAddress = (address: Address) => {
    if (isSelectMode) {
      Taro.navigateBack()
    }
  }

  // 编辑地址
  const editAddress = (id?: number) => {
    const url = id ? `/pages/address/edit?id=${id}` : '/pages/address/edit'
    Taro.navigateTo({ url })
  }

  // 删除地址
  const deleteAddress = (id: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          setAddresses(addresses.filter((addr) => addr.id !== id))
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      },
    })
  }

  return (
    <View className='address-list'>
      <ScrollView scrollY className='address-list__content'>
        {addresses.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>📍</Text>
            <Text className='empty-state__text'>暂无收货地址</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View
              className='address-item'
              key={address.id}
              onClick={() => selectAddress(address)}
            >
              <View className='address-item__content'>
                <View className='address-item__header'>
                  <Text className='address-item__name'>{address.name}</Text>
                  <Text className='address-item__phone'>{address.phone}</Text>
                  {address.isDefault && (
                    <View className='address-item__default'>
                      <Text>默认</Text>
                    </View>
                  )}
                </View>
                <Text className='address-item__detail'>
                  {address.province}{address.city}{address.district}{address.detail}
                </Text>
              </View>

              <View className='address-item__actions'>
                <View
                  className='address-item__action'
                  onClick={(e) => {
                    e.stopPropagation()
                    editAddress(address.id)
                  }}
                >
                  <Text>✏️ 编辑</Text>
                </View>
                <View
                  className='address-item__action'
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteAddress(address.id)
                  }}
                >
                  <Text>🗑️ 删除</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 新增地址按钮 */}
      <View className='address-list__footer safe-area-bottom'>
        <View className='address-list__add-btn' onClick={() => editAddress()}>
          <Text>新增收货地址</Text>
        </View>
      </View>
    </View>
  )
}

export default AddressList
