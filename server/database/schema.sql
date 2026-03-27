-- ============================================
-- 小程序商城数据库 - MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS mini_shop DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mini_shop;

-- 用户表
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(64) NOT NULL COMMENT '微信openid',
  `unionid` VARCHAR(64) DEFAULT NULL,
  `nickname` VARCHAR(64) DEFAULT '' COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像',
  `phone` VARCHAR(20) DEFAULT '' COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '0未知1男2女',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
  `status` TINYINT DEFAULT 1 COMMENT '1正常0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 管理员表
CREATE TABLE `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(32) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `realname` VARCHAR(32) DEFAULT '',
  `role` ENUM('super','admin','operator') DEFAULT 'operator' COMMENT '角色',
  `status` TINYINT DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 商品分类
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
  `name` VARCHAR(64) NOT NULL,
  `icon` VARCHAR(255) DEFAULT '',
  `sort_order` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

-- 商品表
CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT '' COMMENT '副标题',
  `main_image` VARCHAR(255) NOT NULL COMMENT '主图',
  `images` TEXT COMMENT '商品图片JSON数组',
  `detail` LONGTEXT COMMENT '商品详情(富文本)',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
  `cost_price` DECIMAL(10,2) DEFAULT NULL COMMENT '成本价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `unit` VARCHAR(16) DEFAULT '件' COMMENT '单位',
  `weight` DECIMAL(10,2) DEFAULT NULL COMMENT '重量(kg)',
  `is_hot` TINYINT DEFAULT 0 COMMENT '热门推荐',
  `is_new` TINYINT DEFAULT 0 COMMENT '新品',
  `is_on_sale` TINYINT DEFAULT 1 COMMENT '上架状态',
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_sale` (`is_on_sale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 商品规格/SKU
CREATE TABLE `product_skus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `specs` VARCHAR(255) NOT NULL COMMENT '规格组合，如"红色-XL"',
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT DEFAULT 0,
  `image` VARCHAR(255) DEFAULT '',
  `sku_code` VARCHAR(64) DEFAULT '',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU';

-- 收货地址
CREATE TABLE `addresses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(32) NOT NULL COMMENT '收件人',
  `phone` VARCHAR(20) NOT NULL,
  `province` VARCHAR(32) NOT NULL,
  `city` VARCHAR(32) NOT NULL,
  `district` VARCHAR(32) NOT NULL,
  `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

-- 购物车
CREATE TABLE `cart` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `sku_id` INT UNSIGNED DEFAULT NULL,
  `quantity` INT DEFAULT 1,
  `checked` TINYINT DEFAULT 1 COMMENT '是否选中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车';

-- 订单表
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `user_id` INT UNSIGNED NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总额',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `freight_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `pay_type` TINYINT DEFAULT 0 COMMENT '0未支付1微信2支付宝',
  `pay_time` DATETIME DEFAULT NULL,
  `status` TINYINT DEFAULT 0 COMMENT '0待付款10待发货20待收货30已完成-1已取消-2退款中',
  `address_snapshot` JSON COMMENT '地址快照',
  `remark` VARCHAR(255) DEFAULT '',
  `shipping_company` VARCHAR(32) DEFAULT '',
  `shipping_no` VARCHAR(64) DEFAULT '',
  `shipping_time` DATETIME DEFAULT NULL,
  `confirm_time` DATETIME DEFAULT NULL,
  `cancel_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单商品明细
CREATE TABLE `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `sku_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(128) NOT NULL,
  `product_image` VARCHAR(255) DEFAULT '',
  `specs` VARCHAR(255) DEFAULT '',
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细';

-- 轮播图/广告
CREATE TABLE `banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(64) DEFAULT '',
  `image` VARCHAR(255) NOT NULL,
  `link_type` TINYINT DEFAULT 0 COMMENT '0无1商品2外链',
  `link_value` VARCHAR(255) DEFAULT '',
  `sort_order` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图';

-- 优惠券
CREATE TABLE `coupons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `type` TINYINT DEFAULT 1 COMMENT '1满减2折扣',
  `threshold` DECIMAL(10,2) DEFAULT 0.00 COMMENT '使用门槛',
  `value` DECIMAL(10,2) NOT NULL COMMENT '优惠值(满减金额/折扣率)',
  `total` INT DEFAULT 0 COMMENT '发放总量',
  `used` INT DEFAULT 0 COMMENT '已使用数',
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券';

-- 用户优惠券
CREATE TABLE `user_coupons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `coupon_id` INT UNSIGNED NOT NULL,
  `status` TINYINT DEFAULT 0 COMMENT '0未使用1已使用2已过期',
  `used_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券';

-- 插入默认管理员 (密码: admin123, bcrypt)
INSERT INTO `admins` (`username`, `password`, `realname`, `role`) 
VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 'super');

-- 示例分类
INSERT INTO `categories` (`name`, `sort_order`) VALUES 
('手机数码', 1), ('电脑办公', 2), ('家用电器', 3), 
('服装鞋帽', 4), ('食品饮料', 5), ('美妆个护', 6);

-- 示例轮播
INSERT INTO `banners` (`title`, `image`, `sort_order`) VALUES
('春季大促', '/uploads/banner1.jpg', 1),
('新品上市', '/uploads/banner2.jpg', 2),
('限时秒杀', '/uploads/banner3.jpg', 3);

-- 示例商品
INSERT INTO `products` (`category_id`, `name`, `subtitle`, `main_image`, `images`, `detail`, `price`, `original_price`, `stock`, `is_on_sale`) VALUES
(1, 'Apple iPhone 15 Pro Max 256GB', '强大有芯 专业影像', 'https://via.placeholder.com/400x400/f5f5f5/333?text=iPhone15ProMax', '["https://via.placeholder.com/400x400/f5f5f5/333?text=iPhone15ProMax"]', '<p>iPhone 15 Pro Max 采用航空级钛金属设计，搭载 A17 Pro 芯片。</p>', 9999, 10999, 100, 1),
(1, 'AirPods Pro (第二代)', '主动降噪 通透模式', 'https://via.placeholder.com/400x400/f5f5f5/333?text=AirPodsPro', '["https://via.placeholder.com/400x400/f5f5f5/333?text=AirPodsPro"]', '<p>AirPods Pro 支持主动降噪和通透模式。</p>', 1499, 1899, 200, 1),
(1, 'Apple Watch Series 9', '智能手表 健康监测', 'https://via.placeholder.com/400x400/f5f5f5/333?text=AppleWatch', '["https://via.placeholder.com/400x400/f5f5f5/333?text=AppleWatch"]', '<p>Apple Watch Series 9 搭载 S9 芯片。</p>', 2999, 3299, 50, 1),
(4, '小米 14 Ultra 5G 手机', '徕卡光学镜头 骁龙 8Gen3', 'https://via.placeholder.com/400x400/f5f5f5/333?text=Mi14Ultra', '["https://via.placeholder.com/400x400/f5f5f5/333?text=Mi14Ultra"]', '<p>小米 14 Ultra 搭载徕卡光学 Summilux 镜头。</p>', 6499, 6999, 80, 1),
(4, '纯棉 T 恤 基础款', '舒适透气 多色可选', 'https://via.placeholder.com/400x400/f5f5f5/333?text=T-Shirt', '["https://via.placeholder.com/400x400/f5f5f5/333?text=T-Shirt"]', '<p>100% 纯棉材质，舒适透气。</p>', 99, 149, 500, 1);
