export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/user/index',
    'pages/product/detail',
    'pages/order/list',
    'pages/order/detail',
    'pages/order/confirm',
    'pages/address/list',
    'pages/address/edit',
    'pages/search/index',
    'pages/login/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#e4393c',
    navigationBarTitleText: '小商城',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#e4393c',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
      },
    ],
  },
})

// 类型声明，Taro 3 会自动处理 defineAppConfig
declare function defineAppConfig(config: any): any
