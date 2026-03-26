import { useState, useEffect } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Product {
  id: number
  name: string
  price: number
  image: string
  sales: number
}

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hotKeywords] = useState([
    'iPhone 15', 'MacBook', 'AirPods', '小米14',
    '华为 MatePad', '索尼耳机', 'Switch', '戴森',
  ])
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // 加载搜索历史
    const history = Taro.getStorageSync('searchHistory') || []
    setSearchHistory(history)
  }, [])

  // 执行搜索
  const doSearch = (kw?: string) => {
    const searchWord = kw || keyword
    if (!searchWord.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }

    // 保存搜索历史
    let history = searchHistory.filter((h) => h !== searchWord)
    history.unshift(searchWord)
    history = history.slice(0, 10)
    setSearchHistory(history)
    Taro.setStorageSync('searchHistory', history)

    setIsSearching(true)
    setKeyword(searchWord)

    // 模拟搜索结果
    const mockResults: Product[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `${searchWord} 相关商品 ${i + 1} 高品质好物推荐`,
      price: Math.floor(Math.random() * 5000) + 99,
      image: `https://via.placeholder.com/200x200/f5f5f5/333?text=商品${i + 1}`,
      sales: Math.floor(Math.random() * 10000),
    }))
    setResults(mockResults)
  }

  // 清空搜索历史
  const clearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([])
          Taro.removeStorageSync('searchHistory')
        }
      },
    })
  }

  // 跳转商品详情
  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/product/detail?id=${id}` })
  }

  // 返回
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 取消搜索
  const handleCancel = () => {
    if (isSearching) {
      setIsSearching(false)
      setResults([])
      setKeyword('')
    } else {
      handleBack()
    }
  }

  return (
    <View className='search-page'>
      {/* 搜索栏 */}
      <View className='search-header'>
        <View className='search-header__input-wrap'>
          <Text className='search-header__icon'>🔍</Text>
          <Input
            className='search-header__input'
            placeholder='搜索商品、品牌'
            placeholderClass='search-header__placeholder'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={() => doSearch()}
            focus
          />
          {keyword && (
            <Text
              className='search-header__clear'
              onClick={() => { setKeyword(''); setIsSearching(false); setResults([]) }}
            >
              ✕
            </Text>
          )}
        </View>
        <Text className='search-header__cancel' onClick={handleCancel}>取消</Text>
      </View>

      {isSearching ? (
        /* 搜索结果 */
        <ScrollView scrollY className='search-results'>
          {results.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-state__icon'>🔍</Text>
              <Text className='empty-state__text'>暂无搜索结果</Text>
            </View>
          ) : (
            results.map((product) => (
              <View className='result-item' key={product.id} onClick={() => goToDetail(product.id)}>
                <Image className='result-item__image' src={product.image} mode='aspectFill' />
                <View className='result-item__info'>
                  <Text className='result-item__name'>{product.name}</Text>
                  <Text className='result-item__price'>¥{product.price}</Text>
                  <Text className='result-item__sales'>已售 {product.sales}+</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* 搜索建议 */
        <ScrollView scrollY className='search-suggest'>
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <View className='history-section'>
              <View className='history-section__header'>
                <Text className='history-section__title'>搜索历史</Text>
                <Text className='history-section__clear' onClick={clearHistory}>清空</Text>
              </View>
              <View className='history-section__tags'>
                {searchHistory.map((item, index) => (
                  <View
                    className='history-tag'
                    key={index}
                    onClick={() => doSearch(item)}
                  >
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 热门搜索 */}
          <View className='hot-section'>
            <Text className='hot-section__title'>🔥 热门搜索</Text>
            <View className='hot-section__tags'>
              {hotKeywords.map((item, index) => (
                <View
                  className='hot-tag'
                  key={index}
                  onClick={() => doSearch(item)}
                >
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default Search
