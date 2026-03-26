# 小商城 - Taro 3 微信小程序

京东风格小程序商城前端项目，基于 Taro 3 + React + TypeScript + Sass。

## 项目结构

```
client/
├── config/
│   ├── index.ts          # Taro 主配置
│   └── dev.ts            # 开发环境配置
├── src/
│   ├── app.ts            # 应用入口
│   ├── app.config.ts     # 全局配置（页面路由 + tabBar）
│   ├── assets/tab/       # tabBar 图标（需自行放置 PNG 文件）
│   ├── styles/
│   │   ├── variables.scss  # 全局样式变量（京东红主题 #e4393c）
│   │   └── global.scss     # 全局样式、工具类
│   ├── utils/
│   │   ├── request.ts    # 网络请求封装（自动加 token、401 处理）
│   │   └── auth.ts       # 登录认证工具
│   └── pages/
│       ├── home/index       # 首页（轮播、分类导航、商品列表）
│       ├── category/index   # 分类页（左侧菜单 + 右侧商品）
│       ├── cart/index       # 购物车（全选、数量加减、左滑删除）
│       ├── user/index       # 我的（红色头部、订单入口、功能菜单）
│       ├── product/detail   # 商品详情（轮播、规格选择器、富文本）
│       ├── order/confirm    # 确认订单
│       ├── order/list       # 订单列表（tab 切换）
│       ├── order/detail     # 订单详情
│       ├── address/list     # 地址列表
│       ├── address/edit     # 编辑地址
│       ├── search/index     # 搜索页（历史、热门、结果）
│       └── login/index      # 登录页（微信授权）
├── package.json
└── tsconfig.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（微信小程序）
npm run dev:weapp

# 构建
npm run build:weapp
```

## 注意事项

1. **tabBar 图标**：需在 `src/assets/tab/` 目录放置以下 PNG 文件：
   - `home.png` / `home-active.png`
   - `category.png` / `category-active.png`
   - `cart.png` / `cart-active.png`
   - `user.png` / `user-active.png`

2. **后端 API**：默认请求 `http://localhost:3000/api`，可在 `src/utils/request.ts` 中修改 `BASE_URL`

3. **模拟数据**：当前页面使用模拟数据，接入后端 API 后替换各页面中的 mock 数据即可

## 技术栈

- Taro 3.6.25
- React 18
- TypeScript 5
- Sass
- webpack5
