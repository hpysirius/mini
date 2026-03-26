import { useState, useEffect } from 'react'
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
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

interface OrderItem {
  id: number
  name: string
  image: string
  skuText: string
  price: number
  quantity: number
}

interface Coupon {
  id: number
  name: string
  value: number
  condition: string
}

const OrderConfirm = () => {
  const [address, setAddress] = useState<Address | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [remark, setRemark] = useState('')

  useEffect(() => {
    // 模拟默认地址
    setAddress({
      id: 1,
      name: '张三',
      phone: '138****8888',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区xx大厦xx号',
      isDefault: true,
    })

    // 模拟订单商品
    setItems([
      {
        id: 1,
        name: 'Apple iPhone 15 Pro Max 256GB',
        image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=iPhone',
        skuText: '原色钛金属 / 256GB',
        price: 9999,
        quantity: 1,
      },
      {
        id: 2,
        name: 'AirPods Pro (第二代)',
        image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=AirPods',
        skuText: '白色 / USB-C',
        price: 1499,
        quantity: 1,
      },
    ])
  }, [])

  // 商品总价
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // 运费
  const freight = totalPrice >= 99 ? 0 : 10
  // 优惠券优惠
  const couponDiscount = coupon ? coupon.value : 0
  // 实付金额
  const payAmount = totalPrice + freight - couponDiscount

  // 选择地址
  const selectAddress = () => {
    Taro.navigateTo({ url: '/pages/address/list?select=true' })
  }

  // 选择优惠券
  const selectCoupon = () => {
    Taro.showToast({ title: '优惠券功能开发中', icon: 'none' })
  }

  // 提交订单
  const handleSubmit = () => {
    if (!address) {
      Taro.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '下单成功', icon: 'success', duration: 1500 })
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/order/list?status=pending' })
      }, 1500)
    }, 1000)
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
                <Text className='goods-item__sku'>{item.skuText}</Text>
                <View className='goods-item__bottom'>
                  <Text className='goods-item__price'>¥{item.price}</Text>
                  <Text className='goods-item__quantity'>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className='divider--thick' />

        {/* 优惠券 */}
        <View className='coupon-section' onClick={selectCoupon}>
          <Text className='coupon-section__label'>优惠券</Text>
          <View className='coupon-section__right'>
            <Text className='coupon-section__value'>
              {coupon ? `-¥${coupon.value}` : '暂无可用'}
            </Text>
            <Text className='coupon-section__arrow'>›</Text>
          </View>
        </View>

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
          {couponDiscount > 0 && (
            <Text className='confirm-footer__discount'>已优惠¥{couponDiscount}</Text>
          )}
        </View>
        <View className='confirm-footer__btn' onClick={handleSubmit}>
          <Text>提交订单</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderConfirm
