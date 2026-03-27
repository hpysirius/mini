-- ============================================
-- 测试数据脚本 - 用于测试订单功能
-- ============================================

USE mini_shop;

-- 1. 创建一个测试用户（用于模拟登录）
-- 注意：实际登录时会自动创建用户，这里只是为了测试
INSERT INTO `users` (`openid`, `nickname`, `avatar`, `phone`, `status`)
VALUES ('wx_test123', '测试用户', 'https://via.placeholder.com/100x100/f5f5f5/333?text=User', '13800138000', 1)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);

-- 2. 确保有测试商品（如果 schema.sql 已执行可跳过）
INSERT INTO `products` (`category_id`, `name`, `subtitle`, `main_image`, `images`, `detail`, `price`, `original_price`, `stock`, `is_on_sale`)
VALUES
(1, 'Apple iPhone 15 Pro Max 256GB', '强大有芯 专业影像', 'https://via.placeholder.com/400x400/f5f5f5/333?text=iPhone', '["https://via.placeholder.com/400x400/f5f5f5/333?text=iPhone"]', '<p>iPhone 15 Pro Max</p>', 9999, 10999, 100, 1),
(1, 'AirPods Pro (第二代)', '主动降噪 通透模式', 'https://via.placeholder.com/400x400/f5f5f5/333?text=AirPods', '["https://via.placeholder.com/400x400/f5f5f5/333?text=AirPods"]', '<p>AirPods Pro</p>', 1499, 1899, 200, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. 添加测试收货地址
INSERT INTO `addresses` (`user_id`, `name`, `phone`, `province`, `city`, `district`, `detail`, `is_default`)
VALUES (1, '张三', '13800138000', '广东省', '深圳市', '南山区', '科技园南区 xx 大厦 xx 号', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 4. 添加购物车测试数据（可选）
INSERT INTO `cart` (`user_id`, `product_id`, `quantity`, `checked`)
VALUES (1, 1, 1, 1), (1, 2, 2, 1)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- 5. 创建测试订单（如果需要直接有订单数据）
-- 注意：正常流程应该通过 API 创建订单，这里只是演示
-- INSERT INTO `orders` (`order_no`, `user_id`, `total_amount`, `pay_amount`, `address_snapshot`, `status`)
-- VALUES ('TEST20240101000001', 1, 12997, 12997, '{"province":"广东省","city":"深圳市","district":"南山区","detail":"科技园","name":"张三","phone":"13800138000"}', 0);
-- INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`)
-- VALUES (LAST_INSERT_ID(), 1, 'Apple iPhone 15 Pro Max', 'https://via.placeholder.com/400x400/f5f5f5/333?text=iPhone', 9999, 1),
--        (LAST_INSERT_ID(), 2, 'AirPods Pro', 'https://via.placeholder.com/400x400/f5f5f5/333?text=AirPods', 1499, 2);

-- ============================================
-- 测试步骤说明：
-- ============================================
-- 1. 确保数据库已创建：mysql -u root -p mini_shop < schema.sql
-- 2. 执行此测试脚本：mysql -u root -p mini_shop < test_orders.sql
-- 3. 启动后端服务：cd server && npm start
-- 4. 在小程序端登录（会自动创建用户）
-- 5. 添加商品到购物车并勾选
-- 6. 提交订单
-- 7. 在后台管理系统查看订单

-- ============================================
-- 查询语句（用于验证）：
-- ============================================
-- SELECT * FROM users ORDER BY id DESC LIMIT 5;
-- SELECT * FROM products WHERE is_on_sale = 1;
-- SELECT * FROM cart WHERE user_id = 1;
-- SELECT * FROM orders ORDER BY id DESC LIMIT 10;
-- SELECT * FROM order_items ORDER BY id DESC LIMIT 20;
