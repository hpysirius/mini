import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './detail.scss'

interface OrderItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  skuText: string
}

interface OrderDetail {
  id: number
  orderNo: string
  status: string
  statusText: string
  items: OrderItem[]
  totalPrice: number
  freight: number
  couponDiscount: number
  payAmount: number
  address: string
  addressName: string
  addressPhone: string
  remark: string
  createTime: string
  payTime: string
  logisticsNo: string
}

const OrderDetail = () => {
  const [order, setOrder] = useState<OrderDetail | null>(null)

  useEffect(() => {
    // 模拟订单详情数据
    setOrder({
      id: 1,
      orderNo: '20240101000001',
      status: 'pending',
      statusText: '待付款',
      items: [
        {
          id: 1,
          name: 'Apple iPhone 15 Pro Max 256GB 原色钛金属',
          image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=iPhone',
          price: 9999,
          quantity: 1,
          skuText: '原色钛金属 / 256GB',
        },
        {
          id: 2,
          name: 'AirPods Pro (第二代) USB-C',
          image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=AirPods',
          price: 1499,
          quantity: 1,
          skuText: '白色',
        },
      ],
      totalPrice: 11498,
      freight: 0,
      couponDiscount: 100,
      payAmount: 11398,
      address: '广东省深圳市南山区科技园南区xx大厦xx号',
      addressName: '张三',
      addressPhone: '138****8888',
      remark: '请尽快发货',
      createTime: '2024-01-01 12:00:00',
      payTime: '2024-01-01 12:05:00',
      logisticsNo: 'SF1234567890',
    })
  }, [])

  // 复制订单号
  const copyOrderNo = () => {
    Taro.setClipboardData({ data: order?.orderNo || '' })
  }

  // 取消订单
  const cancelOrder = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '订单已取消', icon: 'success' })
          Taro.navigateBack()
        }
      },
    })
  }

  // 去付款
  const goPay = () => {
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  // 确认收货
  const confirmReceive = () => {
    Taro.showModal({
      title: '确认收货',
      content: '请确认已经收到商品',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已确认收货', icon: 'success' })
        }
      },
    })
  }

  if (!order) return null

  return (
    <View className='order-detail'>
      <ScrollView scrollY className='order-detail__content'>
        {/* 状态栏 */}
        <View className='status-bar'>
          <Text className='status-bar__icon'>📋</Text>
          <Text className='status-bar__text'>{order.statusText}</Text>
        </View>

        {/* 收货地址 */}
        <View className='address-info'>
          <View className='address-info__header'>
            <Text className='address-info__icon'>📍</Text>
            <Text className='address-info__name'>{order.addressName}</Text>
            <Text className='address-info__phone'>{order.addressPhone}</Text>
          </View>
          <Text className='address-info__detail'>{order.address}</Text>
        </View>

        <View className='divider--thick' />

        {/* 商品信息 */}
        <View className='goods-section'>
          {order.items.map((item) => (
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

        {/* 价格明细 */}
        <View className='price-section'>
          <Text className='price-section__title'>价格明细</Text>
          <View className='price-row'>
            <Text className='price-row__label'>商品总价</Text>
            <Text className='price-row__value'>¥{order.totalPrice}</Text>
          </View>
          <View className='price-row'>
            <Text className='price-row__label'>运费</Text>
            <Text className='price-row__value'>
              {order.freight === 0 ? '免运费' : `¥${order.freight}`}
            </Text>
          </View>
          {order.couponDiscount > 0 && (
            <View className='price-row'>
              <Text className='price-row__label'>优惠券</Text>
              <Text className='price-row__value price-row__value--discount'>
                -¥{order.couponDiscount}
              </Text>
            </View>
          )}
          <View className='price-row price-row--total'>
            <Text className='price-row__label'>实付金额</Text>
            <Text className='price-row__value'>¥{order.payAmount}</Text>
          </View>
        </View>

        <View className='divider--thick' />

        {/* 订单信息 */}
        <View className='info-section'>
          <Text className='info-section__title'>订单信息</Text>
          <View className='info-row'>
            <Text className='info-row__label'>订单编号</Text>
            <View className='info-row__value-wrap' onClick={copyOrderNo}>
              <Text className='info-row__value'>{order.orderNo}</Text>
              <Text className='info-row__copy'>复制</Text>
            </View>
          </View>
          <View className='info-row'>
            <Text className='info-row__label'>创建时间</Text>
            <Text className='info-row__value'>{order.createTime}</Text>
          </View>
          {order.payTime && (
            <View className='info-row'>
              <Text className='info-row__label'>付款时间</Text>
              <Text className='info-row__value'>{order.payTime}</Text>
            </View>
          )}
          {order.logisticsNo && (
            <View className='info-row'>
              <Text className='info-row__label'>物流单号</Text>
              <Text className='info-row__value'>{order.logisticsNo}</Text>
            </View>
          )}
          {order.remark && (
            <View className='info-row'>
              <Text className='info-row__label'>备注</Text>
              <Text className='info-row__value'>{order.remark}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='order-detail-footer safe-area-bottom'>
        {order.status === 'pending' && (
          <>
            <View className='order-detail-footer__btn order-detail-footer__btn--outline' onClick={cancelOrder}>
              <Text>取消订单</Text>
            </View>
            <View className='order-detail-footer__btn order-detail-footer__btn--primary' onClick={goPay}>
              <Text>去付款</Text>
            </View>
          </>
        )}
        {order.status === 'received' && (
          <View className='order-detail-footer__btn order-detail-footer__btn--primary' onClick={confirmReceive}>
            <Text>确认收货</Text>
          </View>
        )}
        {order.status === 'completed' && (
          <View className='order-detail-footer__btn order-detail-footer__btn--outline'>
            <Text>再次购买</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default OrderDetail
