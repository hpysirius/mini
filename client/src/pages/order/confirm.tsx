import { useState, useEffect } from 'react'
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { post, get } from '../../utils/request'
import './confirm.scss'

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

interface CartItem {
  id: number
  productId: number
  skuId?: number
  name: string
  image: string
  price: number
  quantity: number
  specs?: string
}

const OrderConfirm = () => {
  const [address, setAddress] = useState<Address | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAddress()
    loadOrderItems()
  }, [])

  // 获取默认地址
  const loadAddress = async () => {
    try {
      const res: any = await get('/address/list')
      if (res.data?.length > 0) {
        const defaultAddr = res.data.find((a: any) => a.is_default) || res.data[0]
        setAddress({
          id: defaultAddr.id,
          name: defaultAddr.name,
          phone: defaultAddr.phone,
          province: defaultAddr.province,
          city: defaultAddr.city,
          district: defaultAddr.district,
          detail: defaultAddr.detail,
          isDefault: defaultAddr.is_default,
        })
      }
    } catch (e) {
      console.log('获取地址失败', e)
    }
  }

  // 加载订单商品（从购物车选中项）
  const loadOrderItems = async () => {
    try {
      const res: any = await get('/cart/list')
      const checkedItems = res.data?.list?.filter((item: any) => item.checked) || []
      if (checkedItems.length === 0) {
        Taro.showToast({ title: '购物车没有选中商品', icon: 'none' })
        setTimeout(() => Taro.navigateBack(), 1500)
        return
      }
      setItems(checkedItems.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        skuId: item.sku_id,
        name: item.product_name,
        image: item.product_image,
        price: item.price,
        quantity: item.quantity,
        specs: item.specs,
      })))
    } catch (e) {
      console.log('加载商品失败', e)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

  // 商品总价
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // 运费
  const freight = totalPrice >= 99 ? 0 : 10
  // 实付金额
  const payAmount = totalPrice + freight

  // 选择地址
  const selectAddress = () => {
    Taro.navigateTo({
      url: '/pages/address/list?select=true',
      events: {
        addressSelected: (selectedAddress: Address) => {
          setAddress(selectedAddress)
        },
      },
    })
  }

  // 提交订单
  const handleSubmit = async () => {
    if (!address) {
      Taro.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }
    if (items.length === 0) {
      Taro.showToast({ title: '购物车没有选中商品', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const result: any = await post('/order/create', {
        addressId: address.id,
        items: items.map(item => ({
          productId: item.productId,
          skuId: item.skuId,
          quantity: item.quantity,
        })),
        remark,
        fromCart: true,
      })

      Taro.showToast({ title: '下单成功', icon: 'success', duration: 1500 })
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/order/list' })
      }, 1500)
    } catch (error: any) {
      console.error('下单失败:', error)
      let msg = '下单失败，请重试'
      if (error?.message) {
        msg = error.message
      }
      Taro.showToast({ title: msg, icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='confirm'>
      <ScrollView scrollY className='confirm__content'>
        {/* 收货地址 */}
        <View className='address-section' onClick={selectAddress}>
          {address ? (
            <View className='address-section__info'>
              <View className='address-section__header'>
                <Text className='address-section__name'>{address.name}</Text>
                <Text className='address-section__phone'>{address.phone}</Text>
              </View>
              <Text className='address-section__detail'>
                {address.province}{address.city}{address.district}{address.detail}
              </Text>
            </View>
          ) : (
            <View className='address-section__empty'>
              <Text className='address-section__add-icon'>+</Text>
              <Text className='address-section__add-text'>添加收货地址</Text>
            </View>
          )}
          <Text className='address-section__arrow'>›</Text>
        </View>

        <View className='divider--thick' />

        {/* 商品清单 */}
        <View className='goods-section'>
          <Text className='goods-section__title'>商品清单</Text>
          {items.map((item) => (
            <View className='goods-item' key={item.id}>
              <Image className='goods-item__image' src={item.image} mode='aspectFill' />
              <View className='goods-item__info'>
                <Text className='goods-item__name'>{item.name}</Text>
                <Text className='goods-item__sku'>{item.specs || ''}</Text>
                <View className='goods-item__bottom'>
                  <Text className='goods-item__price'>¥{item.price}</Text>
                  <Text className='goods-item__quantity'>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className='divider--thick' />

        {/* 运费 */}
        <View className='freight-section'>
          <Text className='freight-section__label'>运费</Text>
          <Text className='freight-section__value'>
            {freight === 0 ? '免运费' : `¥${freight}`}
          </Text>
        </View>

        {/* 备注 */}
        <View className='remark-section'>
          <Text className='remark-section__label'>备注</Text>
          <Textarea
            className='remark-section__input'
            placeholder='选填，请先和商家协商一致'
            placeholderClass='remark-section__placeholder'
            value={remark}
            onInput={(e) => setRemark(e.detail.value)}
            maxlength={200}
          />
        </View>
      </ScrollView>

      {/* 底部提交栏 */}
      <View className='confirm-footer safe-area-bottom'>
        <View className='confirm-footer__info'>
          <Text className='confirm-footer__count'>共{items.reduce((s, i) => s + i.quantity, 0)}件</Text>
          <Text className='confirm-footer__label'>合计：</Text>
          <Text className='confirm-footer__price'>¥{payAmount.toFixed(2)}</Text>
        </View>
        <View
          className={`confirm-footer__btn ${submitting ? 'confirm-footer__btn--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交订单'}</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderConfirm
