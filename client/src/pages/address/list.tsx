import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get, del } from '../../utils/request'
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
    loadAddresses()
  }, [])

  // 加载地址列表
  const loadAddresses = async () => {
    try {
      const res: any = await get('/address/list')
      if (res.data) {
        setAddresses(res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          province: item.province,
          city: item.city,
          district: item.district,
          detail: item.detail,
          isDefault: !!item.is_default,
        })))
      }
    } catch (error) {
      console.error('加载地址失败:', error)
    }
  }

  // 选择地址（确认订单时使用）
  const selectAddress = (address: Address) => {
    if (isSelectMode) {
      // 通过事件传回选中的地址
      const pages = Taro.getCurrentPages()
      const currentPage = pages[pages.length - 1] as any
      // 获取打开当前页面时传入的 eventChannel
      const eventChannel = currentPage.getOpenerEventChannel?.()

      if (eventChannel) {
        eventChannel.emit('addressSelected', address)
      }
      Taro.navigateBack()
    }
  }

  // 编辑地址
  const editAddress = (id?: number) => {
    const url = id ? `/pages/address/edit?id=${id}` : '/pages/address/edit'
    Taro.navigateTo({ url })
  }

  // 删除地址
  const deleteAddress = async (id: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/address/remove/${id}`)
            loadAddresses()
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            console.error('删除失败:', error)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
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
