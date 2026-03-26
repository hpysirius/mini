import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
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
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // 模拟分类数据
    const mockCategories: Category[] = [
      {
        id: 1, name: '手机数码',
        children: [
          { id: 11, name: '手机' },
          { id: 12, name: '平板' },
          { id: 13, name: '智能手表' },
          { id: 14, name: '手机壳' },
        ],
      },
      {
        id: 2, name: '电脑办公',
        children: [
          { id: 21, name: '笔记本' },
          { id: 22, name: '台式机' },
          { id: 23, name: '显示器' },
          { id: 24, name: '键盘鼠标' },
        ],
      },
      {
        id: 3, name: '家用电器',
        children: [
          { id: 31, name: '电视' },
          { id: 32, name: '冰箱' },
          { id: 33, name: '洗衣机' },
          { id: 34, name: '空调' },
        ],
      },
      {
        id: 4, name: '服饰内衣',
        children: [
          { id: 41, name: '男装' },
          { id: 42, name: '女装' },
          { id: 43, name: '童装' },
          { id: 44, name: '内衣' },
        ],
      },
      {
        id: 5, name: '美妆护肤',
        children: [
          { id: 51, name: '面部护肤' },
          { id: 52, name: '彩妆' },
          { id: 53, name: '香水' },
        ],
      },
      {
        id: 6, name: '食品饮料',
        children: [
          { id: 61, name: '零食' },
          { id: 62, name: '生鲜' },
          { id: 63, name: '酒水' },
        ],
      },
      {
        id: 7, name: '母婴玩具',
        children: [
          { id: 71, name: '奶粉' },
          { id: 72, name: '尿裤' },
          { id: 73, name: '玩具' },
        ],
      },
      {
        id: 8, name: '运动户外',
        children: [
          { id: 81, name: '运动鞋' },
          { id: 82, name: '运动服' },
          { id: 83, name: '健身器材' },
        ],
      },
      {
        id: 9, name: '图书音像',
        children: [
          { id: 91, name: '小说' },
          { id: 92, name: '教育' },
          { id: 93, name: '科技' },
        ],
      },
      {
        id: 10, name: '家居家装',
        children: [
          { id: 101, name: '家具' },
          { id: 102, name: '灯饰' },
          { id: 103, name: '厨具' },
        ],
      },
    ]
    setCategories(mockCategories)
    loadProducts(mockCategories[0].id)
  }, [])

  // 加载分类下的商品
  const loadProducts = (categoryId: number) => {
    // 模拟商品数据
    const mockProducts: Product[] = Array.from({ length: 10 }, (_, i) => ({
      id: categoryId * 100 + i,
      name: `商品名称 ${categoryId}-${i + 1} 这是一个非常棒的好物推荐`,
      price: Math.floor(Math.random() * 5000) + 99,
      image: `https://via.placeholder.com/200x200/f5f5f5/333?text=商品${i + 1}`,
      sales: Math.floor(Math.random() * 10000),
    }))
    setProducts(mockProducts)
  }

  // 切换分类
  const handleCategoryChange = (index: number) => {
    setActiveIndex(index)
    loadProducts(categories[index].id)
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
        {/* 左侧菜单 */}
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

        {/* 右侧内容 */}
        <ScrollView scrollY className='category-content'>
          {/* 子分类 */}
          {currentCategory?.children && (
            <View className='subcategory'>
              {currentCategory.children.map((sub) => (
                <View className='subcategory__item' key={sub.id}>
                  <View className='subcategory__icon'>📦</View>
                  <Text className='subcategory__name'>{sub.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 商品列表 */}
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
        </ScrollView>
      </View>
    </View>
  )
}

export default CategoryPage
