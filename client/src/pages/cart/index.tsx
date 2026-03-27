import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get, put, del } from '../../utils/request'
import './index.scss'

interface CartItem {
  id: number
  product_id: number
  name: string
  image: string
  price: number
  specs?: string
  quantity: number
  checked: boolean
  stock: number
  is_on_sale: number
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isAllChecked, setIsAllChecked] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  // 加载购物车数据
  const loadCart = async () => {
    setIsLoading(true)
    try {
      const res: any = await get('/cart/list')
      const items = res.data?.list || []
      setCartItems(items)
      setIsEmpty(items.length === 0)
      setIsAllChecked(items.length > 0 && items.every((item: any) => item.checked))
    } catch (error) {
      console.error('加载购物车失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 计算总价
  const totalPrice = cartItems
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  // 选中商品数量
  const checkedCount = cartItems.filter((item) => item.checked).length

  // 切换商品选中状态
  const toggleCheck = async (id: number) => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return

    try {
      await put('/cart/check', { id, checked: !item.checked })
      setCartItems(cartItems.map(i =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ))
      updateAllCheckedState()
    } catch (error) {
      console.error('更新选中状态失败:', error)
    }
  }

  // 全选/取消全选
  const toggleAll = async () => {
    const newChecked = !isAllChecked
    try {
      // 批量更新
      const promises = cartItems.map(item =>
        put('/cart/check', { id: item.id, checked: newChecked })
      )
      await Promise.all(promises)
      setCartItems(cartItems.map(item => ({ ...item, checked: newChecked })))
      setIsAllChecked(newChecked)
    } catch (error) {
      console.error('全选更新失败:', error)
      // 失败时回滚本地状态
      loadCart()
    }
  }

  // 更新全选状态
  const updateAllCheckedState = () => {
    const newItems = cartItems
    const allChecked = newItems.length > 0 && newItems.every(item => item.checked)
    setIsAllChecked(allChecked)
  }

  // 修改数量
  const changeQuantity = async (id: number, delta: number) => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return

    const newQty = Math.max(1, item.quantity + delta)
    if (newQty > item.stock) {
      Taro.showToast({ title: '库存不足', icon: 'none' })
      return
    }

    try {
      await put('/cart/update', { id, quantity: newQty })
      setCartItems(cartItems.map(i =>
        i.id === id ? { ...i, quantity: newQty } : i
      ))
    } catch (error) {
      console.error('更新数量失败:', error)
      // 失败时回滚
      loadCart()
    }
  }

  // 删除商品
  const removeItem = (id: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await del('/cart/remove', { ids: [id] })
            const newItems = cartItems.filter((item) => item.id !== id)
            setCartItems(newItems)
            setIsEmpty(newItems.length === 0)
            updateAllCheckedState()
          } catch (error) {
            console.error('删除失败:', error)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      },
    })
  }

  // 去结算
  const handleCheckout = () => {
    const checkedItems = cartItems.filter((item) => item.checked)
    if (checkedItems.length === 0) {
      Taro.showToast({ title: '请选择要结算的商品', icon: 'none' })
      return
    }

    // 检查商品是否下架
    const offShelfItems = checkedItems.filter(item => !item.is_on_sale)
    if (offShelfItems.length > 0) {
      Taro.showToast({ title: '有商品已下架，请取消选择', icon: 'none' })
      return
    }

    Taro.navigateTo({ url: '/pages/order/confirm' })
  }

  // 去逛逛
  const goShopping = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  // 跳转商品详情
  const goToDetail = (productId: number) => {
    Taro.navigateTo({ url: `/pages/product/detail?id=${productId}` })
  }

  // 显示为空时
  if (isEmpty && !isLoading) {
    return (
      <View className='cart cart--empty'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>🛒</Text>
          <Text className='empty-state__text'>购物车空空如也~</Text>
          <View className='empty-state__btn' onClick={goShopping}>
            <Text>去逛逛</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='cart'>
      <View className='cart__header'>
        <Text className='cart__title'>购物车</Text>
        <Text className='cart__count'>（{cartItems.length}件）</Text>
      </View>

      <ScrollView scrollY className='cart__list'>
        {cartItems.map((item) => (
          <View className='cart-item' key={item.id}>
            {/* 选中按钮 */}
            <View
              className={`cart-item__check ${item.checked ? 'cart-item__check--active' : ''}`}
              onClick={() => toggleCheck(item.id)}
            >
              {item.checked && <Text className='cart-item__check-icon'>✓</Text>}
            </View>

            {/* 商品信息 */}
            <View className='cart-item__content' onClick={() => goToDetail(item.product_id)}>
              <Image className='cart-item__image' src={item.image} mode='aspectFill' />
              <View className='cart-item__info'>
                <Text className='cart-item__name'>{item.name}</Text>
                {item.specs && <Text className='cart-item__sku'>{item.specs}</Text>}
                {!item.is_on_sale && (
                  <Text className='cart-item__offshelf'>已下架</Text>
                )}
                <View className='cart-item__bottom'>
                  {item.is_on_sale ? (
                    <>
                      <Text className='cart-item__price'>¥{item.price}</Text>
                      <View className='cart-item__quantity' onClick={(e) => e.stopPropagation()}>
                        <View
                          className='cart-item__btn'
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          <Text>-</Text>
                        </View>
                        <Text className='cart-item__num'>{item.quantity}</Text>
                        <View
                          className='cart-item__btn'
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          <Text>+</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text className='cart-item__price-disabled'>商品已下架</Text>
                  )}
                </View>
              </View>
            </View>

            {/* 删除按钮 */}
            <View className='cart-item__delete' onClick={() => removeItem(item.id)}>
              <Text className='cart-item__delete-text'>删除</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 底部结算栏 */}
      {!isEmpty && (
        <View className='cart-footer safe-area-bottom'>
          <View className='cart-footer__left'>
            <View
              className={`cart-footer__check ${isAllChecked ? 'cart-footer__check--active' : ''}`}
              onClick={toggleAll}
            >
              {isAllChecked && <Text className='cart-footer__check-icon'>✓</Text>}
            </View>
            <Text className='cart-footer__all'>全选</Text>
          </View>
          <View className='cart-footer__right'>
            <View className='cart-footer__total'>
              <Text className='cart-footer__label'>合计：</Text>
              <Text className='cart-footer__price'>¥{totalPrice.toFixed(2)}</Text>
            </View>
            <View
              className={`cart-footer__btn ${checkedCount === 0 ? 'cart-footer__btn--disabled' : ''}`}
              onClick={checkedCount > 0 ? handleCheckout : undefined}
            >
              <Text>去结算 ({checkedCount})</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default Cart
