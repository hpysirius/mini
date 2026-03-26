import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get } from '../../utils/request'
import './index.scss'

// 商品数据接口
interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
}

// Banner 数据接口
interface Banner {
  id: number
  image: string
  link: string
}

// 分类导航接口
interface NavItem {
  id: number
  name: string
  icon: string
}

const Home = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [hotProducts, setHotProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [searchValue, setSearchValue] = useState('')

  // 模拟数据（实际项目中从 API 获取）
  useEffect(() => {
    // 模拟 banner 数据
    setBanners([
      { id: 1, image: 'https://via.placeholder.com/750x360/e4393c/ffffff?text=春季大促', link: '' },
      { id: 2, image: 'https://via.placeholder.com/750x360/ff6b6b/ffffff?text=新品首发', link: '' },
      { id: 3, image: 'https://via.placeholder.com/750x360/ee5a24/ffffff?text=限时秒杀', link: '' },
    ])

    // 模拟分类导航
    setNavItems([
      { id: 1, name: '手机', icon: '📱' },
      { id: 2, name: '电脑', icon: '💻' },
      { id: 3, name: '家电', icon: '🏠' },
      { id: 4, name: '服饰', icon: '👕' },
      { id: 5, name: '美妆', icon: '💄' },
      { id: 6, name: '食品', icon: '🍎' },
      { id: 7, name: '母婴', icon: '👶' },
      { id: 8, name: '运动', icon: '⚽' },
      { id: 9, name: '图书', icon: '📚' },
      { id: 10, name: '更多', icon: '➕' },
    ])

    // 模拟热门商品
    setHotProducts([
      { id: 1, name: 'Apple iPhone 15 Pro Max 256GB 原色钛金属', price: 9999, originalPrice: 10999, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=iPhone', sales: 12580 },
      { id: 2, name: '华为 MatePad Pro 13.2英寸 OLED屏幕 12+256GB', price: 5199, originalPrice: 5999, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=Pad', sales: 8920 },
      { id: 3, name: '小米14 Ultra 徕卡光学Summilux镜头 16+512GB', price: 6499, originalPrice: 6999, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=Mi14', sales: 15600 },
      { id: 4, name: 'AirPods Pro (第二代) 配MagSafe充电盒 USB-C', price: 1499, originalPrice: 1899, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=AirPods', sales: 32400 },
    ])

    // 模拟新品上架
    setNewProducts([
      { id: 5, name: 'MacBook Pro 14英寸 M3 Pro芯片 18+512GB', price: 14999, originalPrice: 15999, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=MacBook', sales: 1200 },
      { id: 6, name: '索尼 WH-1000XM5 头戴式降噪蓝牙耳机', price: 2299, originalPrice: 2999, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=Sony', sales: 5680 },
      { id: 7, name: '戴森 V15 Detect Absolute 智能无绳吸尘器', price: 4690, originalPrice: 5490, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=Dyson', sales: 2340 },
      { id: 8, name: '任天堂 Switch OLED 白色日版续航加强版', price: 2199, originalPrice: 2599, image: 'https://via.placeholder.com/300x300/f5f5f5/333?text=Switch', sales: 9870 },
    ])

    // 实际项目中使用 API 获取
    // fetchHomeData()
  }, [])

  // 跳转搜索页
  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  // 跳转商品详情
  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/product/detail?id=${id}` })
  }

  // 跳转分类
  const goToCategory = (id: number) => {
    Taro.switchTab({ url: '/pages/category/index' })
  }

  return (
    <View className='home'>
      {/* 顶部搜索栏 */}
      <View className='search-bar' onClick={handleSearch}>
        <View className='search-bar__inner'>
          <Text className='search-bar__icon'>🔍</Text>
          <Text className='search-bar__placeholder'>搜索商品、品牌、分类</Text>
        </View>
      </View>

      <ScrollView scrollY className='home__content'>
        {/* 轮播图 Banner */}
        <View className='banner'>
          <Swiper
            className='banner__swiper'
            circular
            indicatorDots
            indicatorColor='rgba(255,255,255,0.5)'
            indicatorActiveColor='#ffffff'
            autoplay
            interval={3000}
          >
            {banners.map((banner) => (
              <SwiperItem key={banner.id}>
                <Image
                  className='banner__image'
                  src={banner.image}
                  mode='aspectFill'
                  onClick={() => banner.link && Taro.navigateTo({ url: banner.link })}
                />
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        {/* 分类导航入口 */}
        <View className='nav-grid'>
          {navItems.map((item) => (
            <View
              className='nav-grid__item'
              key={item.id}
              onClick={() => goToCategory(item.id)}
            >
              <Text className='nav-grid__icon'>{item.icon}</Text>
              <Text className='nav-grid__text'>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* 热门推荐 */}
        <View className='section'>
          <View className='section__header'>
            <View className='section__title-wrap'>
              <View className='section__accent' />
              <Text className='section__title'>热门推荐</Text>
            </View>
            <Text className='section__more'>查看更多 ›</Text>
          </View>
          <View className='product-grid'>
            {hotProducts.map((product) => (
              <View
                className='product-card'
                key={product.id}
                onClick={() => goToDetail(product.id)}
              >
                <Image className='product-card__image' src={product.image} mode='aspectFill' />
                <View className='product-card__info'>
                  <Text className='product-card__name'>{product.name}</Text>
                  <View className='product-card__price-row'>
                    <Text className='product-card__price'>¥{product.price}</Text>
                    <Text className='product-card__original'>¥{product.originalPrice}</Text>
                  </View>
                  <Text className='product-card__sales'>已售 {product.sales}+</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 新品上架 */}
        <View className='section'>
          <View className='section__header'>
            <View className='section__title-wrap'>
              <View className='section__accent' />
              <Text className='section__title'>新品上架</Text>
            </View>
            <Text className='section__more'>查看更多 ›</Text>
          </View>
          <View className='product-grid'>
            {newProducts.map((product) => (
              <View
                className='product-card'
                key={product.id}
                onClick={() => goToDetail(product.id)}
              >
                <Image className='product-card__image' src={product.image} mode='aspectFill' />
                <View className='product-card__info'>
                  <Text className='product-card__name'>{product.name}</Text>
                  <View className='product-card__price-row'>
                    <Text className='product-card__price'>¥{product.price}</Text>
                    <Text className='product-card__original'>¥{product.originalPrice}</Text>
                  </View>
                  <Text className='product-card__sales'>已售 {product.sales}+</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='home__footer'>
          <Text className='home__footer-text'>— 没有更多了 —</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default Home
