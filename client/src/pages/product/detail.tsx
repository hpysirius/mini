import { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './detail.scss'

interface ProductInfo {
  id: number
  name: string
  price: number
  originalPrice: number
  sales: number
  images: string[]
  skus: { id: number; name: string; options: string[] }[]
  detail: string
}

const ProductDetail = () => {
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [showSkuPanel, setShowSkuPanel] = useState(false)
  const [selectedSku, setSelectedSku] = useState<Record<number, string>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    // 模拟商品数据
    const mockProduct: ProductInfo = {
      id: 1,
      name: 'Apple iPhone 15 Pro Max 256GB 原色钛金属 支持移动联通电信5G 双卡双待手机',
      price: 9999,
      originalPrice: 10999,
      sales: 12580,
      images: [
        'https://via.placeholder.com/750x750/f5f5f5/333?text=商品图1',
        'https://via.placeholder.com/750x750/f5f5f5/333?text=商品图2',
        'https://via.placeholder.com/750x750/f5f5f5/333?text=商品图3',
      ],
      skus: [
        { id: 1, name: '颜色', options: ['原色钛金属', '白色钛金属', '蓝色钛金属', '黑色钛金属'] },
        { id: 2, name: '容量', options: ['256GB', '512GB', '1TB'] },
      ],
      detail: '<div style="padding:20px"><p>这是商品的详细介绍，支持富文本格式。</p><p>全新 A17 Pro 芯片，性能更强。</p><p>钛金属设计，轻盈坚固。</p></div>',
    }
    setProduct(mockProduct)
    // 初始化默认选中
    const defaultSku: Record<number, string> = {}
    mockProduct.skus.forEach((sku) => {
      defaultSku[sku.id] = sku.options[0]
    })
    setSelectedSku(defaultSku)
  }, [])

  // 打开规格选择器
  const openSkuPanel = () => {
    setShowSkuPanel(true)
  }

  // 关闭规格选择器
  const closeSkuPanel = () => {
    setShowSkuPanel(false)
  }

  // 选择规格
  const selectSku = (skuId: number, option: string) => {
    setSelectedSku((prev) => ({ ...prev, [skuId]: option }))
  }

  // 修改数量
  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  // 加入购物车
  const addToCart = () => {
    Taro.showToast({ title: '已加入购物车', icon: 'success' })
    setShowSkuPanel(false)
  }

  // 立即购买
  const buyNow = () => {
    Taro.navigateTo({ url: `/pages/order/confirm?productId=${product?.id}&quantity=${quantity}` })
  }

  // 跳转购物车
  const goToCart = () => {
    Taro.switchTab({ url: '/pages/cart/index' })
  }

  if (!product) return null

  return (
    <View className='detail'>
      <ScrollView scrollY className='detail__content'>
        {/* 商品图片轮播 */}
        <Swiper
          className='detail__swiper'
          circular
          indicatorDots
          indicatorColor='rgba(255,255,255,0.5)'
          indicatorActiveColor='#ffffff'
        >
          {product.images.map((img, index) => (
            <SwiperItem key={index}>
              <Image className='detail__image' src={img} mode='aspectFill' />
            </SwiperItem>
          ))}
        </Swiper>

        {/* 价格信息 */}
        <View className='detail__price-section'>
          <View className='detail__price-row'>
            <Text className='detail__price'>¥{product.price}</Text>
            <Text className='detail__original-price'>¥{product.originalPrice}</Text>
          </View>
          <Text className='detail__sales'>已售 {product.sales}+</Text>
        </View>

        {/* 商品名称 */}
        <View className='detail__name-section'>
          <Text className='detail__name'>{product.name}</Text>
        </View>

        {/* 规格选择 */}
        <View className='detail__sku-section' onClick={openSkuPanel}>
          <Text className='detail__sku-label'>已选</Text>
          <Text className='detail__sku-value'>
            {Object.values(selectedSku).join(' / ')} x {quantity}
          </Text>
          <Text className='detail__sku-arrow'>›</Text>
        </View>

        {/* 商品详情 */}
        <View className='detail__info-section'>
          <Text className='detail__info-title'>— 商品详情 —</Text>
          <View className='detail__rich-content'>
            <RichText nodes={product.detail} />
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='detail-footer safe-area-bottom'>
        <View className='detail-footer__icons'>
          <View className='detail-footer__icon-item' onClick={goToCart}>
            <Text className='detail-footer__icon'>🛒</Text>
            <Text className='detail-footer__icon-text'>购物车</Text>
          </View>
          <View className='detail-footer__icon-item'>
            <Text className='detail-footer__icon'>🏪</Text>
            <Text className='detail-footer__icon-text'>店铺</Text>
          </View>
          <View className='detail-footer__icon-item'>
            <Text className='detail-footer__icon'>⭐</Text>
            <Text className='detail-footer__icon-text'>收藏</Text>
          </View>
        </View>
        <View className='detail-footer__btns'>
          <View className='detail-footer__btn detail-footer__btn--cart' onClick={openSkuPanel}>
            <Text>加入购物车</Text>
          </View>
          <View className='detail-footer__btn detail-footer__btn--buy' onClick={openSkuPanel}>
            <Text>立即购买</Text>
          </View>
        </View>
      </View>

      {/* 规格选择面板 */}
      {showSkuPanel && (
        <View className='sku-overlay' onClick={closeSkuPanel}>
          <View className='sku-panel' onClick={(e) => e.stopPropagation()}>
            <View className='sku-panel__header'>
              <Image className='sku-panel__image' src={product.images[0]} mode='aspectFill' />
              <View className='sku-panel__info'>
                <Text className='sku-panel__price'>¥{product.price}</Text>
                <Text className='sku-panel__stock'>库存充足</Text>
                <Text className='sku-panel__selected'>
                  已选：{Object.values(selectedSku).join(' / ')}
                </Text>
              </View>
              <View className='sku-panel__close' onClick={closeSkuPanel}>
                <Text>✕</Text>
              </View>
            </View>

            <ScrollView scrollY className='sku-panel__body'>
              {product.skus.map((sku) => (
                <View className='sku-group' key={sku.id}>
                  <Text className='sku-group__title'>{sku.name}</Text>
                  <View className='sku-group__options'>
                    {sku.options.map((option) => (
                      <View
                        className={`sku-option ${selectedSku[sku.id] === option ? 'sku-option--active' : ''}`}
                        key={option}
                        onClick={() => selectSku(sku.id, option)}
                      >
                        <Text className='sku-option__text'>{option}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              <View className='sku-quantity'>
                <Text className='sku-quantity__title'>购买数量</Text>
                <View className='sku-quantity__control'>
                  <View className='sku-quantity__btn' onClick={() => changeQuantity(-1)}>
                    <Text>-</Text>
                  </View>
                  <Text className='sku-quantity__num'>{quantity}</Text>
                  <View className='sku-quantity__btn' onClick={() => changeQuantity(1)}>
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className='sku-panel__footer'>
              <View className='sku-panel__btn sku-panel__btn--cart' onClick={addToCart}>
                <Text>加入购物车</Text>
              </View>
              <View className='sku-panel__btn sku-panel__btn--buy' onClick={buyNow}>
                <Text>立即购买</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ProductDetail
