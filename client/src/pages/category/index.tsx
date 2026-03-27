import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { get } from '../../utils/request'
import './index.scss'

// 分类接口
interface Category {
  id: number
  name: string
  children?: Category[]
}

// 商品接口
interface Product {
  id: number
  name: string
  price: number
  image: string
  sales: number
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeSubIndex, setActiveSubIndex] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  // 加载分类列表（一级分类）
  const loadCategories = async () => {
    try {
      const res: any = await get('/category/list')
      if (res.data && res.data.length > 0) {
        setCategories(res.data)
        // 默认选中第一个一级分类的第一个子分类
        if (res.data[0].children && res.data[0].children.length > 0) {
          setActiveSubIndex(0)
          loadProducts(res.data[0].children[0].id)
        }
      } else {
        setCategories([])
        setProducts([])
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  // 根据分类 ID 加载商品
  const loadProducts = async (categoryId: number) => {
    setLoading(true)
    try {
      const res: any = await get('/product/list', {
        params: { categoryId, page: 1, pageSize: 50 }
      })
      const list = res.data?.list || []
      setProducts(list.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.main_image,
        sales: item.sales || 0,
      })))
    } catch (error) {
      console.error('加载商品失败:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 切换一级分类
  const handleCategoryChange = (index: number) => {
    setActiveIndex(index)
    setActiveSubIndex(null)
    setProducts([])
  }

  // 点击子分类加载商品
  const handleSubCategoryClick = (subCategoryId: number, subIndex: number) => {
    setActiveSubIndex(subIndex)
    loadProducts(subCategoryId)
  }

  // 跳转商品详情
  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/product/detail?id=${id}` })
  }

  // 跳转搜索
  const goToSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const currentCategory = categories[activeIndex]

  return (
    <View className='category-page'>
      {/* 顶部搜索栏 */}
      <View className='category-page__search' onClick={goToSearch}>
        <Text className='category-page__search-icon'>🔍</Text>
        <Text className='category-page__search-placeholder'>搜索商品</Text>
      </View>

      <View className='category-page__body'>
        {/* 左侧菜单 - 一级分类 */}
        {categories.length === 0 ? (
          <View className='category-menu-empty'>
            <Text>暂无分类</Text>
          </View>
        ) : (
          <ScrollView scrollY className='category-menu'>
            {categories.map((cat, index) => (
              <View
                className={`category-menu__item ${index === activeIndex ? 'category-menu__item--active' : ''}`}
                key={cat.id}
                onClick={() => handleCategoryChange(index)}
              >
                <Text className='category-menu__text'>{cat.name}</Text>
                {index === activeIndex && <View className='category-menu__bar' />}
              </View>
            ))}
          </ScrollView>
        )}

        {/* 右侧内容 */}
        <ScrollView scrollY className='category-content'>
          {/* 子分类 - 点击加载对应商品 */}
          {currentCategory?.children && currentCategory.children.length > 0 && (
            <View className='subcategory'>
              {currentCategory.children.map((sub, subIndex) => (
                <View
                  className={`subcategory__item ${activeSubIndex === subIndex ? 'subcategory__item--active' : ''}`}
                  key={sub.id}
                  onClick={() => handleSubCategoryClick(sub.id, subIndex)}
                >
                  <View className='subcategory__icon'>📦</View>
                  <Text className='subcategory__name'>{sub.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 商品列表 */}
          {loading ? (
            <View className='product-list-empty'>
              <Text>加载中...</Text>
            </View>
          ) : products.length === 0 ? (
            <View className='product-list-empty'>
              <Text className='product-list-empty__text'>暂无商品</Text>
            </View>
          ) : (
            <View className='product-list'>
              {products.map((product) => (
                <View
                  className='product-item'
                  key={product.id}
                  onClick={() => goToDetail(product.id)}
                >
                  <Image className='product-item__image' src={product.image} mode='aspectFill' />
                  <View className='product-item__info'>
                    <Text className='product-item__name'>{product.name}</Text>
                    <Text className='product-item__price'>¥{product.price}</Text>
                    <Text className='product-item__sales'>已售 {product.sales}+</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default CategoryPage
