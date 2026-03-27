import { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get, post } from '../../utils/request'
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProductDetail()
  }, [])

  // 加载商品详情
  const loadProductDetail = async () => {
    const params = Taro.getCurrentInstance().router?.params
    const productId = params?.id

    if (!productId) {
      Taro.showToast({ title: '商品 ID 缺失', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
      return
    }

    try {
      const res: any = await get(`/product/detail/${productId}`)
      if (res.code === 0 && res.data) {
        const data = res.data
        setProduct({
          id: data.id,
          name: data.name,
          price: parseFloat(data.price),
          originalPrice: data.original_price ? parseFloat(data.original_price) : data.price,
          sales: data.sales || 0,
          images: data.images ? (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : [data.main_image],
          skus: [],
          detail: data.detail || '',
        })
      }
    } catch (error) {
      console.error('加载商品详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

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
  const addToCart = async () => {
    if (!product) return

    setLoading(true)
    try {
      await post('/cart/add', {
        productId: product.id,
        skuId: null,
        quantity,
      })
      Taro.showToast({ title: '已加入购物车', icon: 'success' })
      setShowSkuPanel(false)
    } catch (error) {
      console.error('添加购物车失败:', error)
      Taro.showToast({ title: '添加失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 立即购买
  const buyNow = () => {
    if (!product) return
    Taro.navigateTo({ url: `/pages/order/confirm` })
  }

  // 跳转购物车
  const goToCart = () => {
    Taro.switchTab({ url: '/pages/cart/index' })
  }

  if (!product) {
    return (
      <View className='detail'>
        <View className='detail__loading'>加载中...</View>
      </View>
    )
  }

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
            {product.originalPrice > product.price && (
              <Text className='detail__original-price'>¥{product.originalPrice}</Text>
            )}
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
            {Object.values(selectedSku).join(' / ') || '请选择规格'} x {quantity}
          </Text>
          <Text className='detail__sku-arrow'>›</Text>
        </View>

        {/* 商品详情 */}
        <View className='detail__info-section'>
          <Text className='detail__info-title'>— 商品详情 —</Text>
          {product.detail ? (
            <View className='detail__rich-content'>
              <RichText nodes={product.detail} />
            </View>
          ) : (
            <View className='detail__empty-detail'>
              <Text>商品详情暂无介绍</Text>
            </View>
          )}
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
          <View
            className={`detail-footer__btn detail-footer__btn--cart ${loading ? 'detail-footer__btn--disabled' : ''}`}
            onClick={loading ? undefined : openSkuPanel}
          >
            <Text>{loading ? '...' : '加入购物车'}</Text>
          </View>
          <View
            className={`detail-footer__btn detail-footer__btn--buy ${loading ? 'detail-footer__btn--disabled' : ''}`}
            onClick={loading ? undefined : openSkuPanel}
          >
            <Text>{loading ? '...' : '立即购买'}</Text>
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
                  已选：{Object.values(selectedSku).join(' / ') || '请选择规格'}
                </Text>
              </View>
              <View className='sku-panel__close' onClick={closeSkuPanel}>
                <Text>✕</Text>
              </View>
            </View>

            <ScrollView scrollY className='sku-panel__body'>
              {product.skus.length > 0 ? (
                product.skus.map((sku) => (
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
                ))
              ) : (
                <View className='sku-panel__no-sku'>
                  <Text>该商品暂无规格可选</Text>
                </View>
              )}

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
              <View
                className={`sku-panel__btn sku-panel__btn--cart ${loading ? 'sku-panel__btn--disabled' : ''}`}
                onClick={loading ? undefined : addToCart}
              >
                <Text>{loading ? '添加中...' : '加入购物车'}</Text>
              </View>
              <View
                className={`sku-panel__btn sku-panel__btn--buy ${loading ? 'sku-panel__btn--disabled' : ''}`}
                onClick={loading ? undefined : buyNow}
              >
                <Text>{loading ? '...' : '立即购买'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ProductDetail
