import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './list.scss'

interface OrderItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  id: number
  orderNo: string
  status: string
  statusText: string
  items: OrderItem[]
  totalPrice: number
  createTime: string
}

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'shipped', label: '待发货' },
  { key: 'received', label: '待收货' },
  { key: 'completed', label: '已完成' },
]

const OrderList = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // 从页面参数获取初始 tab
    const params = Taro.getCurrentInstance().router?.params
    if (params?.status) {
      setActiveTab(params.status)
    }
    loadOrders(params?.status || 'all')
  }, [])

  // 加载订单数据
  const loadOrders = (status: string) => {
    // 模拟订单数据
    const mockOrders: Order[] = [
      {
        id: 1,
        orderNo: '20240101000001',
        status: 'pending',
        statusText: '待付款',
        items: [
          { id: 1, name: 'Apple iPhone 15 Pro Max 256GB', image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=iPhone', price: 9999, quantity: 1 },
        ],
        totalPrice: 9999,
        createTime: '2024-01-01 12:00:00',
      },
      {
        id: 2,
        orderNo: '20240102000002',
        status: 'shipped',
        statusText: '待发货',
        items: [
          { id: 2, name: 'AirPods Pro (第二代)', image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=AirPods', price: 1499, quantity: 2 },
        ],
        totalPrice: 2998,
        createTime: '2024-01-02 10:30:00',
      },
      {
        id: 3,
        orderNo: '20240103000003',
        status: 'received',
        statusText: '待收货',
        items: [
          { id: 3, name: '小米14 Ultra 5G手机', image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=Mi14', price: 6499, quantity: 1 },
          { id: 4, name: '手机壳 透明防摔款', image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=壳', price: 29, quantity: 1 },
        ],
        totalPrice: 6528,
        createTime: '2024-01-03 08:15:00',
      },
      {
        id: 4,
        orderNo: '20240104000004',
        status: 'completed',
        statusText: '已完成',
        items: [
          { id: 5, name: 'Sony WH-1000XM5 蓝牙耳机', image: 'https://via.placeholder.com/160x160/f5f5f5/333?text=Sony', price: 2299, quantity: 1 },
        ],
        totalPrice: 2299,
        createTime: '2024-01-04 16:45:00',
      },
    ]

    if (status === 'all') {
      setOrders(mockOrders)
    } else {
      setOrders(mockOrders.filter((o) => o.status === status))
    }
  }

  // 切换 tab
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    loadOrders(key)
  }

  // 查看订单详情
  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/order/detail?id=${id}` })
  }

  // 操作按钮文字
  const getActionText = (status: string): string => {
    switch (status) {
      case 'pending': return '去付款'
      case 'shipped': return '提醒发货'
      case 'received': return '确认收货'
      case 'completed': return '再次购买'
      default: return ''
    }
  }

  return (
    <View className='order-list'>
      {/* Tab 栏 */}
      <View className='order-list__tabs'>
        {statusTabs.map((tab) => (
          <View
            className={`order-list__tab ${activeTab === tab.key ? 'order-list__tab--active' : ''}`}
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className='order-list__tab-text'>{tab.label}</Text>
            {activeTab === tab.key && <View className='order-list__tab-bar' />}
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY className='order-list__content'>
        {orders.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>📋</Text>
            <Text className='empty-state__text'>暂无订单</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View className='order-card' key={order.id} onClick={() => goToDetail(order.id)}>
              {/* 订单头部 */}
              <View className='order-card__header'>
                <Text className='order-card__no'>订单号: {order.orderNo}</Text>
                <Text className='order-card__status'>{order.statusText}</Text>
              </View>

              {/* 商品列表 */}
              {order.items.map((item) => (
                <View className='order-card__goods' key={item.id}>
                  <Image className='order-card__goods-image' src={item.image} mode='aspectFill' />
                  <View className='order-card__goods-info'>
                    <Text className='order-card__goods-name'>{item.name}</Text>
                    <View className='order-card__goods-bottom'>
                      <Text className='order-card__goods-price'>¥{item.price}</Text>
                      <Text className='order-card__goods-qty'>x{item.quantity}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* 订单底部 */}
              <View className='order-card__footer'>
                <Text className='order-card__total'>
                  合计: <Text className='order-card__total-price'>¥{order.totalPrice}</Text>
                </Text>
                {getActionText(order.status) && (
                  <View
                    className='order-card__action'
                    onClick={(e) => {
                      e.stopPropagation()
                      Taro.showToast({ title: getActionText(order.status), icon: 'none' })
                    }}
                  >
                    <Text>{getActionText(order.status)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default OrderList
