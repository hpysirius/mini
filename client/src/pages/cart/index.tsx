import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface CartItem {
  id: number
  productId: number
  name: string
  image: string
  price: number
  skuText: string
  quantity: number
  checked: boolean
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isAllChecked, setIsAllChecked] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    // 模拟购物车数据
    const mockItems: CartItem[] = [
      {
        id: 1, productId: 1, name: 'Apple iPhone 15 Pro Max 256GB',
        image: 'https://via.placeholder.com/180x180/f5f5f5/333?text=iPhone',
        price: 9999, skuText: '原色钛金属 / 256GB', quantity: 1, checked: true,
      },
      {
        id: 2, productId: 2, name: 'AirPods Pro (第二代)',
        image: 'https://via.placeholder.com/180x180/f5f5f5/333?text=AirPods',
        price: 1499, skuText: '白色 / USB-C', quantity: 2, checked: true,
      },
      {
        id: 3, productId: 3, name: '小米14 Ultra 5G手机',
        image: 'https://via.placeholder.com/180x180/f5f5f5/333?text=Mi14',
        price: 6499, skuText: '黑色 / 16+512GB', quantity: 1, checked: true,
      },
    ]
    setCartItems(mockItems)
    setIsEmpty(mockItems.length === 0)
  }, [])

  // 计算总价
  const totalPrice = cartItems
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  // 选中商品数量
  const checkedCount = cartItems.filter((item) => item.checked).length

  // 切换商品选中状态
  const toggleCheck = (id: number) => {
    const newItems = cartItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    setCartItems(newItems)
    setIsAllChecked(newItems.every((item) => item.checked))
  }

  // 全选/取消全选
  const toggleAll = () => {
    const newChecked = !isAllChecked
    setCartItems(cartItems.map((item) => ({ ...item, checked: newChecked })))
    setIsAllChecked(newChecked)
  }

  // 修改数量
  const changeQuantity = (id: number, delta: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }

  // 删除商品
  const removeItem = (id: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const newItems = cartItems.filter((item) => item.id !== id)
          setCartItems(newItems)
          setIsEmpty(newItems.length === 0)
          setIsAllChecked(newItems.every((item) => item.checked))
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
    // 将选中的商品 ID 传给确认订单页
    const ids = checkedItems.map((item) => item.id).join(',')
    Taro.navigateTo({ url: `/pages/order/confirm?cartIds=${ids}` })
  }

  // 去逛逛
  const goShopping = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  // 跳转商品详情
  const goToDetail = (productId: number) => {
    Taro.navigateTo({ url: `/pages/product/detail?id=${productId}` })
  }

  if (isEmpty) {
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
            <View className='cart-item__content' onClick={() => goToDetail(item.productId)}>
              <Image className='cart-item__image' src={item.image} mode='aspectFill' />
              <View className='cart-item__info'>
                <Text className='cart-item__name'>{item.name}</Text>
                <Text className='cart-item__sku'>{item.skuText}</Text>
                <View className='cart-item__bottom'>
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
          <View className='cart-footer__btn' onClick={handleCheckout}>
            <Text>去结算({checkedCount})</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Cart
