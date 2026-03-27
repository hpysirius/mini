# 订单功能测试说明

## 快速开始

### 1. 初始化数据库

```bash
# 进入 server 目录
cd server

# 如果还没初始化数据库，先执行 schema.sql
mysql -u root -p mini_shop < database/schema.sql
```

### 2. 启动后端服务

```bash
cd server
npm start
# 服务运行在 http://localhost:3000
```

### 3. 小程序端测试流程

1. **打开小程序** - 使用微信开发者工具打开 `client` 目录

2. **微信登录**
   - 进入「我的」页面
   - 点击「微信一键登录」
   - 登录成功后会存储 token

3. **浏览商品**
   - 首页会展示热门推荐和新品上架
   - 点击商品卡片进入商品详情页

4. **加入购物车**
   - 在商品详情页点击「加入购物车」
   - 选择规格和数量
   - 点击确认添加到购物车

5. **下单购买**
   - 进入购物车页面
   - 勾选要购买的商品
   - 点击「结算」按钮
   - 选择收货地址（如果没有需要先添加）
   - 点击「提交订单」

6. **查看订单**
   - 提交成功后自动跳转到订单列表
   - 可以看到刚创建的订单（状态：待付款）

### 4. 后台管理系统测试

1. **登录后台**
   - 打开 `admin` 目录
   - 默认管理员账号：`admin` / `admin123`

2. **查看订单**
   - 点击左侧菜单「订单管理」
   - 可以看到所有用户创建的订单
   - 支持按状态筛选

3. **订单发货**
   - 对于「待发货」订单，点击「发货」按钮
   - 输入快递公司和单号

## 订单状态流转

```
待付款 (0) → 待发货 (10) → 已发货 (20) → 已完成 (30)
                ↓
            已取消 (-1)
```

## API 接口说明

### 小程序端（/api）

| 接口 | 方法 | 说明 |
|------|------|------|
| /cart/list | GET | 购物车列表 |
| /cart/add | POST | 添加购物车 |
| /cart/update | PUT | 更新数量 |
| /cart/check | PUT | 切换选中状态 |
| /cart/remove | DELETE | 删除购物车项 |
| /order/create | POST | 创建订单 |
| /order/list | GET | 订单列表 |
| /order/detail/:id | GET | 订单详情 |
| /order/cancel/:id | PUT | 取消订单 |
| /order/confirm/:id | PUT | 确认收货 |

### 后台管理端（/api/admin）

| 接口 | 方法 | 说明 |
|------|------|------|
| /orders | GET | 订单列表 |
| /orders/:id | GET | 订单详情 |
| /orders/:id/ship | PUT | 订单发货 |

## 创建订单请求示例

```javascript
POST /api/order/create
{
  "addressId": 1,
  "items": [
    { "productId": 1, "skuId": null, "quantity": 1 },
    { "productId": 2, "skuId": null, "quantity": 2 }
  ],
  "remark": "请尽快发货",
  "fromCart": true
}
```

## 常见问题

### 1. 登录后提示「账号已被禁用」
- 后端已修复为自动恢复账号状态

### 2. 下单失败「收货地址不存在」
- 确保已在地址管理中添加收货地址

### 3. 下单失败「商品不存在或已下架」
- 检查商品是否存在且 `is_on_sale = 1`

### 4. 订单列表报错「NaN」
- 已修复，后端现在正确处理 status 参数

### 5. 购物车为空
- 确保先登录
- 在商品详情页点击「加入购物车」添加商品

## 数据库表结构

- `orders` - 订单主表
- `order_items` - 订单商品明细
- `users` - 用户表
- `products` - 商品表
- `product_skus` - 商品规格
- `categories` - 商品分类
- `addresses` - 收货地址
- `cart` - 购物车
- `banners` - 轮播图
