# ************************************************************
# Sequel Ace SQL dump
# 版本号： 20051
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# 主机: 127.0.0.1 (MySQL 8.0.45)
# 数据库: mini_shop
# 生成时间: 2026-03-27 05:53:40 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# 转储表 addresses
# ------------------------------------------------------------

DROP TABLE IF EXISTS `addresses`;

CREATE TABLE `addresses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(32) NOT NULL COMMENT 'æ”¶ä»¶äºº',
  `phone` varchar(20) NOT NULL,
  `province` varchar(32) NOT NULL,
  `city` varchar(32) NOT NULL,
  `district` varchar(32) NOT NULL,
  `detail` varchar(255) NOT NULL COMMENT 'è¯¦ç»†åœ°å€',
  `is_default` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='æ”¶è´§åœ°å€';

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;

INSERT INTO `addresses` (`id`, `user_id`, `name`, `phone`, `province`, `city`, `district`, `detail`, `is_default`, `created_at`)
VALUES
	(1,4,'黄辉','18380498437','四川省','成都市','双流区','雅居乐',1,'2026-03-27 05:41:06');

/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 admins
# ------------------------------------------------------------

DROP TABLE IF EXISTS `admins`;

CREATE TABLE `admins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `password` varchar(255) NOT NULL,
  `realname` varchar(32) DEFAULT '',
  `role` enum('super','admin','operator') DEFAULT 'operator' COMMENT 'è§’è‰²',
  `status` tinyint DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ç®¡ç†å‘˜è¡¨';

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;

INSERT INTO `admins` (`id`, `username`, `password`, `realname`, `role`, `status`, `last_login`, `created_at`)
VALUES
	(1,'admin','$2a$10$1nDPYvmZIGqux2562697x.VqLEyOLwkxgtcDQX46Pyy6t35Kzz8cC','超级管理员','super',1,'2026-03-27 04:35:58','2026-03-26 15:47:00');

/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 banners
# ------------------------------------------------------------

DROP TABLE IF EXISTS `banners`;

CREATE TABLE `banners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(64) DEFAULT '',
  `image` varchar(255) NOT NULL,
  `link_type` tinyint DEFAULT '0' COMMENT '0æ— 1å•†å“2å¤–é“¾',
  `link_value` varchar(255) DEFAULT '',
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='è½®æ’­å›¾';

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;

INSERT INTO `banners` (`id`, `title`, `image`, `link_type`, `link_value`, `sort_order`, `status`, `created_at`)
VALUES
	(1,'新su7','https://img.youpin.mi-img.com/ferriswheel/03eabe44_67fc_4e87_9208_2939e9b17bfe.jpeg@base@tag=imgScale&F=webp&h=1440&q=90&w=1080',0,'',1,1,'2026-03-26 15:47:00'),
	(2,'新YU7','https://img.youpin.mi-img.com/ferriswheel/5df5deb6_3b65_4f31_a19e_a8ea182933f1.jpeg@base@tag=imgScale&F=webp&h=1180&q=90&w=2560',0,'',2,1,'2026-03-26 15:47:00'),
	(3,'ultra','https://img.youpin.mi-img.com/ferriswheel/9167eda7_eeef_40e1_9d05_0f174acbc30d.jpeg@base@tag=imgScale&F=webp&h=1440&q=90&w=1080',0,'',3,1,'2026-03-26 15:47:00');

/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 cart
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cart`;

CREATE TABLE `cart` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `sku_id` int unsigned DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `checked` tinyint DEFAULT '1' COMMENT 'æ˜¯å¦é€‰ä¸­',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='è´­ç‰©è½¦';

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `sku_id`, `quantity`, `checked`, `created_at`, `updated_at`)
VALUES
	(1,3,4,NULL,2,1,'2026-03-27 05:20:53','2026-03-27 05:21:02'),
	(3,4,4,NULL,1,1,'2026-03-27 05:48:29','2026-03-27 05:48:29');

/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int unsigned DEFAULT '0' COMMENT 'çˆ¶åˆ†ç±»ID',
  `name` varchar(64) NOT NULL,
  `icon` varchar(255) DEFAULT '',
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='å•†å“åˆ†ç±»';

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;

INSERT INTO `categories` (`id`, `parent_id`, `name`, `icon`, `sort_order`, `status`, `created_at`)
VALUES
	(1,0,'手机数码','',1,1,'2026-03-27 03:43:32'),
	(2,0,'电脑办公','',2,1,'2026-03-27 03:43:32'),
	(3,0,'家用电器','',3,1,'2026-03-27 03:43:32'),
	(4,0,'服装鞋帽','',4,1,'2026-03-27 03:43:32'),
	(5,0,'美妆护肤','',5,1,'2026-03-27 03:43:32'),
	(6,0,'食品饮料','',6,1,'2026-03-27 03:43:32'),
	(7,1,'手机','',1,1,'2026-03-27 03:43:32'),
	(8,1,'数码配件','',2,1,'2026-03-27 03:43:32'),
	(9,2,'电脑整机','',1,1,'2026-03-27 03:43:32'),
	(10,2,'办公设备','',2,1,'2026-03-27 03:43:32');

/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 coupons
# ------------------------------------------------------------

DROP TABLE IF EXISTS `coupons`;

CREATE TABLE `coupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `type` tinyint DEFAULT '1' COMMENT '1æ»¡å‡2æŠ˜æ‰£',
  `threshold` decimal(10,2) DEFAULT '0.00' COMMENT 'ä½¿ç”¨é—¨æ§›',
  `value` decimal(10,2) NOT NULL COMMENT 'ä¼˜æƒ å€¼(æ»¡å‡é‡‘é¢/æŠ˜æ‰£çŽ‡)',
  `total` int DEFAULT '0' COMMENT 'å‘æ”¾æ€»é‡',
  `used` int DEFAULT '0' COMMENT 'å·²ä½¿ç”¨æ•°',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ä¼˜æƒ åˆ¸';



# 转储表 order_items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `order_items`;

CREATE TABLE `order_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `sku_id` int unsigned DEFAULT NULL,
  `product_name` varchar(128) NOT NULL,
  `product_image` varchar(255) DEFAULT '',
  `specs` varchar(255) DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='è®¢å•å•†å“æ˜Žç»†';

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `sku_id`, `product_name`, `product_image`, `specs`, `price`, `quantity`, `total_amount`)
VALUES
	(1,1,8,NULL,'任天堂 Switch OLED 白色日版续航加强版','https://via.placeholder.com/300x300/f5f5f5/333?text=Switch','',2199.00,1,2199.00);

/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 orders
# ------------------------------------------------------------

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL COMMENT 'è®¢å•å·',
  `user_id` int unsigned NOT NULL,
  `total_amount` decimal(10,2) NOT NULL COMMENT 'è®¢å•æ€»é¢',
  `pay_amount` decimal(10,2) NOT NULL COMMENT 'å®žä»˜é‡‘é¢',
  `freight_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'è¿è´¹',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'ä¼˜æƒ é‡‘é¢',
  `pay_type` tinyint DEFAULT '0' COMMENT '0æœªæ”¯ä»˜1å¾®ä¿¡2æ”¯ä»˜å®',
  `pay_time` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '0' COMMENT '0å¾…ä»˜æ¬¾10å¾…å‘è´§20å¾…æ”¶è´§30å·²å®Œæˆ-1å·²å–æ¶ˆ-2é€€æ¬¾ä¸­',
  `address_snapshot` json DEFAULT NULL COMMENT 'åœ°å€å¿«ç…§',
  `remark` varchar(255) DEFAULT '',
  `shipping_company` varchar(32) DEFAULT '',
  `shipping_no` varchar(64) DEFAULT '',
  `shipping_time` datetime DEFAULT NULL,
  `confirm_time` datetime DEFAULT NULL,
  `cancel_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='è®¢å•è¡¨';

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;

INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `pay_amount`, `freight_amount`, `discount_amount`, `pay_type`, `pay_time`, `status`, `address_snapshot`, `remark`, `shipping_company`, `shipping_no`, `shipping_time`, `confirm_time`, `cancel_time`, `created_at`, `updated_at`)
VALUES
	(1,'202603271341165IA4DR',4,2199.00,2199.00,0.00,0.00,0,NULL,0,'{\"id\": 1, \"city\": \"成都市\", \"name\": \"黄辉\", \"phone\": \"18380498437\", \"detail\": \"雅居乐\", \"user_id\": 4, \"district\": \"双流区\", \"province\": \"四川省\", \"created_at\": \"2026-03-26T21:41:06.000Z\", \"is_default\": 1}','','','',NULL,NULL,NULL,'2026-03-27 05:41:16','2026-03-27 05:41:16');

/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 product_skus
# ------------------------------------------------------------

DROP TABLE IF EXISTS `product_skus`;

CREATE TABLE `product_skus` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `specs` varchar(255) NOT NULL COMMENT 'è§„æ ¼ç»„åˆï¼Œå¦‚"çº¢è‰²-XL"',
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `image` varchar(255) DEFAULT '',
  `sku_code` varchar(64) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='å•†å“SKU';



# 转储表 products
# ------------------------------------------------------------

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned NOT NULL,
  `name` varchar(128) NOT NULL,
  `subtitle` varchar(255) DEFAULT '' COMMENT 'å‰¯æ ‡é¢˜',
  `main_image` varchar(255) NOT NULL COMMENT 'ä¸»å›¾',
  `images` text COMMENT 'å•†å“å›¾ç‰‡JSONæ•°ç»„',
  `detail` longtext COMMENT 'å•†å“è¯¦æƒ…(å¯Œæ–‡æœ¬)',
  `price` decimal(10,2) NOT NULL COMMENT 'å”®ä»·',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT 'åŽŸä»·',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT 'æˆæœ¬ä»·',
  `stock` int DEFAULT '0' COMMENT 'åº“å­˜',
  `sales` int DEFAULT '0' COMMENT 'é”€é‡',
  `unit` varchar(16) DEFAULT 'ä»¶' COMMENT 'å•ä½',
  `weight` decimal(10,2) DEFAULT NULL COMMENT 'é‡é‡(kg)',
  `is_hot` tinyint DEFAULT '0' COMMENT 'çƒ­é—¨æŽ¨è',
  `is_new` tinyint DEFAULT '0' COMMENT 'æ–°å“',
  `is_on_sale` tinyint DEFAULT '1' COMMENT 'ä¸Šæž¶çŠ¶æ€',
  `sort_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_sale` (`is_on_sale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='å•†å“è¡¨';

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;

INSERT INTO `products` (`id`, `category_id`, `name`, `subtitle`, `main_image`, `images`, `detail`, `price`, `original_price`, `cost_price`, `stock`, `sales`, `unit`, `weight`, `is_hot`, `is_new`, `is_on_sale`, `sort_order`, `created_at`, `updated_at`)
VALUES
	(1,7,'Apple iPhone 15 Pro Max 256GB 原色钛金属','钛金属设计 A17 Pro 芯片 5 倍光学变焦','https://via.placeholder.com/300x300/f5f5f5/333?text=iPhone','null',NULL,9998.00,10999.00,NULL,1000,12580,'ä»¶',NULL,1,0,1,1,'2026-03-27 03:50:01','2026-03-27 03:59:55'),
	(2,9,'华为 MatePad Pro 13.2 英寸 OLED 屏幕 12+256GB','OLED 全面屏 骁龙 8+ 旗舰芯片','https://via.placeholder.com/300x300/f5f5f5/333?text=Pad',NULL,NULL,5199.00,5999.00,NULL,500,8920,'ä»¶',NULL,1,0,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(3,7,'小米 14 Ultra 徕卡光学 Summilux 镜头 16+512GB','徕卡光学镜头 骁龙 8 Gen3 2K 屏幕','https://via.placeholder.com/300x300/f5f5f5/333?text=Mi14',NULL,NULL,6499.00,6999.00,NULL,800,15600,'ä»¶',NULL,1,0,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(4,8,'AirPods Pro (第二代) 配 MagSafe 充电盒 USB-C','主动降噪 自适应透明模式','https://via.placeholder.com/300x300/f5f5f5/333?text=AirPods',NULL,NULL,1499.00,1899.00,NULL,2000,32400,'ä»¶',NULL,1,0,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(5,9,'MacBook Pro 14 英寸 M3 Pro 芯片 18+512GB','M3 Pro 芯片 Liquid 视网膜 XDR 屏幕','https://via.placeholder.com/300x300/f5f5f5/333?text=MacBook',NULL,NULL,14999.00,15999.00,NULL,300,1200,'ä»¶',NULL,0,1,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(6,8,'索尼 WH-1000XM5 头戴式降噪蓝牙耳机','双芯驱动 智能降噪 30 小时续航','https://via.placeholder.com/300x300/f5f5f5/333?text=Sony',NULL,NULL,2299.00,2999.00,NULL,600,5680,'ä»¶',NULL,0,1,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(7,3,'戴森 V15 Detect Absolute 智能无绳吸尘器','激光探测 智能感应 深层清洁','https://via.placeholder.com/300x300/f5f5f5/333?text=Dyson',NULL,NULL,4690.00,5490.00,NULL,400,2340,'ä»¶',NULL,0,1,1,1,'2026-03-27 03:50:01','2026-03-27 03:50:01'),
	(8,8,'任天堂 Switch OLED 白色日版续航加强版','7 英寸 OLED 屏幕 64GB 存储','https://via.placeholder.com/300x300/f5f5f5/333?text=Switch',NULL,NULL,2199.00,2599.00,NULL,699,9871,'ä»¶',NULL,0,1,1,1,'2026-03-27 03:50:02','2026-03-27 05:41:16');

/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 user_coupons
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_coupons`;

CREATE TABLE `user_coupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `coupon_id` int unsigned NOT NULL,
  `status` tinyint DEFAULT '0' COMMENT '0æœªä½¿ç”¨1å·²ä½¿ç”¨2å·²è¿‡æœŸ',
  `used_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ç”¨æˆ·ä¼˜æƒ åˆ¸';



# 转储表 users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(64) NOT NULL COMMENT 'å¾®ä¿¡openid',
  `unionid` varchar(64) DEFAULT NULL,
  `nickname` varchar(64) DEFAULT '' COMMENT 'æ˜µç§°',
  `avatar` varchar(255) DEFAULT '' COMMENT 'å¤´åƒ',
  `phone` varchar(20) DEFAULT '' COMMENT 'æ‰‹æœºå·',
  `gender` tinyint DEFAULT '0' COMMENT '0æœªçŸ¥1ç”·2å¥³',
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT 'ä½™é¢',
  `status` tinyint DEFAULT '1' COMMENT '1æ­£å¸¸0ç¦ç”¨',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ç”¨æˆ·è¡¨';

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `openid`, `unionid`, `nickname`, `avatar`, `phone`, `gender`, `balance`, `status`, `created_at`, `updated_at`)
VALUES
	(1,'wx_0b3r1rGa11TApL0XDRIa11L9eZ2r1rGO',NULL,'微信用户','','',0,0.00,1,'2026-03-27 04:39:26','2026-03-27 04:39:26'),
	(2,'wx_0a3obZGa12I2pL02szGa1EiufP0obZGO',NULL,'微信用户','','',0,0.00,1,'2026-03-27 04:40:28','2026-03-27 04:40:28'),
	(3,'wx_0d3p1C1w3GqEJ63gWd3w3F8vg44p1C19',NULL,'微信用户','','',0,0.00,1,'2026-03-27 04:44:26','2026-03-27 04:44:26'),
	(4,'wx_0e35Zwll2sEpqh4zQUml2nH61925ZwlK',NULL,'微信用户','','',0,0.00,1,'2026-03-27 05:40:19','2026-03-27 05:40:19');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
