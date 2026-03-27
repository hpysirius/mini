import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get, put } from '../../utils/request'
import './list.scss'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_image: string
  price: number
  quantity: number
  specs?: string
}

interface Order {
  id: number
  order_no: string
  status: number
  total_amount: number
  pay_amount: number
  created_at: string
  items: OrderItem[]
}

const statusTabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '10', label: '待发货' },
  { key: '20', label: '待收货' },
  { key: '30', label: '已完成' },
  { key: '-1', label: '已取消' },
]

const OrderList = () => {
  const [activeTab, setActiveTab] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.status !== undefined) {
      setActiveTab(params.status)
      loadOrders(params.status, 1)
    } else {
      loadOrders('', 1)
    }
  }, [])

  // 加载订单数据
  const loadOrders = async (status: string, pageNum: number = 1) => {
    if (loading) return

    setLoading(true)
    try {
      const res: any = await get('/order/list', {
        page: pageNum,
        pageSize: 10,
        status: status || undefined,
      })

      const newOrders = res.data?.list || []
      if (pageNum === 1) {
        setOrders(newOrders)
      } else {
        setOrders(prev => [...prev, ...newOrders])
      }

      setHasMore(newOrders.length === 10)
      setPage(pageNum)
    } catch (error) {
      console.error('加载订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换 tab
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setPage(1)
    setHasMore(true)
    loadOrders(key, 1)
  }

  // 查看订单详情
  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/order/detail?id=${id}` })
  }

  // 操作订单
  const handleAction = async (order: Order) => {
    switch (order.status) {
      case 0: // 待付款 - 去付款
        Taro.showToast({ title: '支付功能开发中', icon: 'none' })
        break
      case 10: // 待发货 - 提醒发货
        Taro.showToast({ title: '已提醒商家发货', icon: 'none' })
        break
      case 20: // 待收货 - 确认收货
        Taro.showModal({
          title: '确认收货',
          content: '确认已收到商品吗？',
          success: async (res) => {
            if (res.confirm) {
              try {
                await put(`/order/confirm/${order.id}`)
                Taro.showToast({ title: '确认收货成功', icon: 'success' })
                loadOrders(activeTab, 1)
              } catch (error) {
                console.error('确认收货失败:', error)
              }
            }
          },
        })
        break
      case 30: // 已完成 - 再次购买
        Taro.showToast({ title: '再次购买开发中', icon: 'none' })
        break
      case -1: // 已取消
        break
    }
  }

  // 获取状态文字
  const getStatusText = (status: number): string => {
    const tab = statusTabs.find(t => t.key === String(status))
    return tab?.label || '未知'
  }

  // 获取操作按钮文字
  const getActionText = (status: number): string => {
    switch (status) {
      case 0: return '去付款'
      case 10: return '提醒发货'
      case 20: return '确认收货'
      case 30: return '再次购买'
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
        {loading && orders.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>⏳</Text>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>📋</Text>
            <Text className='empty-state__text'>暂无订单</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View className='order-card' key={order.id} onClick={() => goToDetail(order.id)}>
              {/* 订单头部 */}
              <View className='order-card__header'>
                <Text className='order-card__no'>订单号：{order.order_no}</Text>
                <Text className='order-card__status'>{getStatusText(order.status)}</Text>
              </View>

              {/* 商品列表 */}
              {order.items.map((item) => (
                <View className='order-card__goods' key={item.id}>
                  <Image className='order-card__goods-image' src={item.product_image} mode='aspectFill' />
                  <View className='order-card__goods-info'>
                    <Text className='order-card__goods-name'>{item.product_name}</Text>
                    {item.specs && <Text className='order-card__goods-sku'>{item.specs}</Text>}
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
                  合计：<Text className='order-card__total-price'>¥{order.pay_amount}</Text>
                </Text>
                {getActionText(order.status) && (
                  <View
                    className='order-card__action'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(order)
                    }}
                  >
                    <Text>{getActionText(order.status)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {/* 加载更多 */}
        {!loading && hasMore && orders.length > 0 && (
          <View className='load-more' onClick={() => loadOrders(activeTab, page + 1)}>
            <Text>加载更多</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default OrderList
