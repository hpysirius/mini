const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const pool = require('../../config/database');
const adminAuth = require('../../middlewares/adminAuth');

const router = express.Router();

// ============ 管理员登录 ============

// POST /api/admin/login
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (admins.length === 0) {
      return res.json({ code: 400, msg: '用户名或密码错误' });
    }

    const admin = admins[0];

    if (admin.status !== 1) {
      return res.json({ code: 403, msg: '账号已被禁用' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ code: 400, msg: '用户名或密码错误' });
    }

    // 更新最后登录时间
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    const token = jwt.sign(
      { adminId: admin.id, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        adminInfo: {
          id: admin.id,
          username: admin.username,
          realname: admin.realname,
          role: admin.role
        }
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 以下都需要管理员认证 ============

router.use(adminAuth);

// GET /api/admin/dashboard - 仪表盘数据
router.get('/dashboard', async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const monthStart = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');

    // 用户总数
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = 1');

    // 今日新增用户
    const [todayUsers] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = ?', [today]
    );

    // 订单统计
    const [orderStats] = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending_pay,
        SUM(CASE WHEN status = 10 THEN 1 ELSE 0 END) as pending_ship,
        SUM(CASE WHEN status = 20 THEN 1 ELSE 0 END) as pending_receive,
        SUM(CASE WHEN status = 30 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = -1 THEN 1 ELSE 0 END) as cancelled
      FROM orders
    `);

    // 本月销售额
    const [monthlySales] = await pool.query(
      'SELECT COALESCE(SUM(pay_amount), 0) as total FROM orders WHERE status >= 0 AND created_at >= ?',
      [monthStart]
    );

    // 今日销售额
    const [todaySales] = await pool.query(
      'SELECT COALESCE(SUM(pay_amount), 0) as total FROM orders WHERE status >= 0 AND DATE(created_at) = ?',
      [today]
    );

    // 商品总数
    const [productCount] = await pool.query('SELECT COUNT(*) as total FROM products');

    res.json({
      code: 0,
      msg: 'success',
      data: {
        userCount: userCount[0].total,
        todayNewUsers: todayUsers[0].total,
        orderStats: orderStats[0],
        monthlySales: monthlySales[0].total,
        todaySales: todaySales[0].total,
        productCount: productCount[0].total
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 商品管理 CRUD ============

// 商品列表
router.get('/products', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, categoryId, isOnSale } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let where = 'WHERE 1=1';
    const params = [];

    if (keyword) { where += ' AND p.name LIKE ?'; params.push(`%${keyword}%`); }
    if (categoryId) { where += ' AND p.category_id = ?'; params.push(categoryId); }
    if (isOnSale !== undefined && isOnSale !== '') { where += ' AND p.is_on_sale = ?'; params.push(isOnSale); }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM products p ${where}`, params);
    const [list] = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({ code: 0, msg: 'success', data: { list, total: countResult[0].total } });
  } catch (err) {
    console.error('Admin products list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 创建商品
router.post('/products', [
  body('name').notEmpty().withMessage('商品名称不能为空'),
  body('categoryId').isInt().withMessage('分类ID不正确'),
  body('price').isFloat({ min: 0 }).withMessage('价格不正确'),
  body('mainImage').notEmpty().withMessage('主图不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ code: 400, msg: errors.array()[0].msg });

    const {
      name, categoryId, subtitle = '', mainImage, images = '[]', detail = '',
      price, originalPrice, costPrice, stock = 0, unit = '件', weight,
      isHot = 0, isNew = 0, isOnSale = 1, sortOrder = 0, skus = []
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, subtitle, main_image, images, detail, price, original_price, cost_price, stock, unit, weight, is_hot, is_new, is_on_sale, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [categoryId, name, subtitle, mainImage, JSON.stringify(images), detail, price, originalPrice || null, costPrice || null, stock, unit, weight || null, isHot, isNew, isOnSale, sortOrder]
    );

    // 插入SKU
    if (skus && skus.length > 0) {
      for (const sku of skus) {
        await pool.query(
          'INSERT INTO product_skus (product_id, specs, price, stock, image, sku_code) VALUES (?, ?, ?, ?, ?, ?)',
          [result.insertId, sku.specs, sku.price, sku.stock || 0, sku.image || '', sku.skuCode || '']
        );
      }
    }

    res.json({ code: 0, msg: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Admin create product error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 更新商品
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, categoryId, subtitle, mainImage, images, detail,
      price, originalPrice, costPrice, stock, unit, weight,
      isHot, isNew, isOnSale, sortOrder, skus
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId); }
    if (subtitle !== undefined) { updates.push('subtitle = ?'); values.push(subtitle); }
    if (mainImage !== undefined) { updates.push('main_image = ?'); values.push(mainImage); }
    if (images !== undefined) { updates.push('images = ?'); values.push(JSON.stringify(images)); }
    if (detail !== undefined) { updates.push('detail = ?'); values.push(detail); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (originalPrice !== undefined) { updates.push('original_price = ?'); values.push(originalPrice); }
    if (costPrice !== undefined) { updates.push('cost_price = ?'); values.push(costPrice); }
    if (stock !== undefined) { updates.push('stock = ?'); values.push(stock); }
    if (unit !== undefined) { updates.push('unit = ?'); values.push(unit); }
    if (weight !== undefined) { updates.push('weight = ?'); values.push(weight); }
    if (isHot !== undefined) { updates.push('is_hot = ?'); values.push(isHot); }
    if (isNew !== undefined) { updates.push('is_new = ?'); values.push(isNew); }
    if (isOnSale !== undefined) { updates.push('is_on_sale = ?'); values.push(isOnSale); }
    if (sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(sortOrder); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // 如果传了skus，重新插入
    if (skus && Array.isArray(skus)) {
      await pool.query('DELETE FROM product_skus WHERE product_id = ?', [id]);
      for (const sku of skus) {
        await pool.query(
          'INSERT INTO product_skus (product_id, specs, price, stock, image, sku_code) VALUES (?, ?, ?, ?, ?, ?)',
          [id, sku.specs, sku.price, sku.stock || 0, sku.image || '', sku.skuCode || '']
        );
      }
    }

    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin update product error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 删除商品
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_skus WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Admin delete product error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 分类管理 CRUD ============

router.get('/categories', async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Admin categories error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.post('/categories', [
  body('name').notEmpty().withMessage('分类名称不能为空')
], async (req, res) => {
  try {
    const { name, parentId = 0, icon = '', sortOrder = 0 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (parent_id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
      [parentId, name, icon, sortOrder]
    );
    res.json({ code: 0, msg: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Admin create category error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, icon, sortOrder, status } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (parentId !== undefined) { updates.push('parent_id = ?'); values.push(parentId); }
    if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
    if (sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(sortOrder); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return res.json({ code: 400, msg: '没有要更新的字段' });

    values.push(id);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin update category error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 检查是否有子分类
    const [children] = await pool.query('SELECT id FROM categories WHERE parent_id = ?', [id]);
    if (children.length > 0) {
      return res.json({ code: 400, msg: '该分类下有子分类，请先删除子分类' });
    }
    // 检查是否有商品
    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ?', [id]);
    if (products.length > 0) {
      return res.json({ code: 400, msg: '该分类下有商品，不能删除' });
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Admin delete category error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 订单管理 ============

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, orderNo } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let where = 'WHERE 1=1';
    const params = [];

    if (status !== undefined && status !== '') { where += ' AND o.status = ?'; params.push(parseInt(status)); }
    if (orderNo) { where += ' AND o.order_no LIKE ?'; params.push(`%${orderNo}%`); }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);
    const [list] = await pool.query(
      `SELECT o.*, u.nickname, u.phone as user_phone FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    for (const order of list) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json({ code: 0, msg: 'success', data: { list, total: countResult[0].total } });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 获取订单详情
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT o.*, u.nickname, u.phone as user_phone FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.json({ code: 404, msg: '订单不存在' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    order.items = items;

    res.json({ code: 0, msg: 'success', data: order });
  } catch (err) {
    console.error('Admin order detail error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 发货
router.put('/orders/:id/ship', [
  body('shippingCompany').notEmpty().withMessage('快递公司不能为空'),
  body('shippingNo').notEmpty().withMessage('快递单号不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ code: 400, msg: errors.array()[0].msg });

    const { id } = req.params;
    const { shippingCompany, shippingNo } = req.body;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return res.json({ code: 404, msg: '订单不存在' });
    if (orders[0].status !== 10) return res.json({ code: 400, msg: '当前状态不能发货' });

    await pool.query(
      'UPDATE orders SET status = 20, shipping_company = ?, shipping_no = ?, shipping_time = NOW() WHERE id = ?',
      [shippingCompany, shippingNo, id]
    );

    res.json({ code: 0, msg: '发货成功' });
  } catch (err) {
    console.error('Admin ship order error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 用户管理 ============

router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let where = 'WHERE 1=1';
    const params = [];

    if (keyword) { where += ' AND (u.nickname LIKE ? OR u.phone LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
    if (status !== undefined && status !== '') { where += ' AND u.status = ?'; params.push(parseInt(status)); }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM users u ${where}`, params);
    const [list] = await pool.query(
      `SELECT u.id, u.openid, u.nickname, u.avatar, u.phone, u.gender, u.balance, u.status, u.created_at
       FROM users u ${where} ORDER BY u.id DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({ code: 0, msg: 'success', data: { list, total: countResult[0].total } });
  } catch (err) {
    console.error('Admin users error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin user status error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 轮播图管理 CRUD ============

router.get('/banners', async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Admin banners error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.post('/banners', [
  body('image').notEmpty().withMessage('图片不能为空')
], async (req, res) => {
  try {
    const { title = '', image, linkType = 0, linkValue = '', sortOrder = 0 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO banners (title, image, link_type, link_value, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title, image, linkType, linkValue, sortOrder]
    );
    res.json({ code: 0, msg: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Admin create banner error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, linkType, linkValue, sortOrder, status } = req.body;
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (image !== undefined) { updates.push('image = ?'); values.push(image); }
    if (linkType !== undefined) { updates.push('link_type = ?'); values.push(linkType); }
    if (linkValue !== undefined) { updates.push('link_value = ?'); values.push(linkValue); }
    if (sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(sortOrder); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return res.json({ code: 400, msg: '没有要更新的字段' });

    values.push(id);
    await pool.query(`UPDATE banners SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin update banner error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Admin delete banner error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 优惠券管理 CRUD ============

router.get('/coupons', async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Admin coupons error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.post('/coupons', [
  body('name').notEmpty().withMessage('优惠券名称不能为空'),
  body('value').isFloat({ min: 0 }).withMessage('优惠值不正确'),
  body('startTime').notEmpty().withMessage('开始时间不能为空'),
  body('endTime').notEmpty().withMessage('结束时间不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ code: 400, msg: errors.array()[0].msg });

    const { name, type = 1, threshold = 0, value, total = 0, startTime, endTime } = req.body;
    const [result] = await pool.query(
      'INSERT INTO coupons (name, type, threshold, value, total, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, threshold, value, total, startTime, endTime]
    );
    res.json({ code: 0, msg: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Admin create coupon error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, threshold, value, total, startTime, endTime, status } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (threshold !== undefined) { updates.push('threshold = ?'); values.push(threshold); }
    if (value !== undefined) { updates.push('value = ?'); values.push(value); }
    if (total !== undefined) { updates.push('total = ?'); values.push(total); }
    if (startTime !== undefined) { updates.push('start_time = ?'); values.push(startTime); }
    if (endTime !== undefined) { updates.push('end_time = ?'); values.push(endTime); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return res.json({ code: 400, msg: '没有要更新的字段' });

    values.push(id);
    await pool.query(`UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin update coupon error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Admin delete coupon error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// ============ 管理员管理 CRUD ============

router.get('/admins', async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, username, realname, role, status, last_login, created_at FROM admins ORDER BY id ASC'
    );
    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Admin admins list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.post('/admins', async (req, res) => {
  try {
    // 只有super能创建管理员
    if (req.adminRole !== 'super') {
      return res.json({ code: 403, msg: '权限不足' });
    }

    const { username, password, realname = '', role = 'operator' } = req.body;
    if (!username || !password) {
      return res.json({ code: 400, msg: '用户名和密码不能为空' });
    }

    const [existing] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.json({ code: 400, msg: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (username, password, realname, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, realname, role]
    );

    res.json({ code: 0, msg: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Admin create admin error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/admins/:id', async (req, res) => {
  try {
    if (req.adminRole !== 'super') {
      return res.json({ code: 403, msg: '权限不足' });
    }

    const { id } = req.params;
    const { password, realname, role, status } = req.body;
    const updates = [];
    const values = [];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?'); values.push(hashed);
    }
    if (realname !== undefined) { updates.push('realname = ?'); values.push(realname); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return res.json({ code: 400, msg: '没有要更新的字段' });

    values.push(id);
    await pool.query(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Admin update admin error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.delete('/admins/:id', async (req, res) => {
  try {
    if (req.adminRole !== 'super') {
      return res.json({ code: 403, msg: '权限不足' });
    }
    const { id } = req.params;
    if (parseInt(id) === req.adminId) {
      return res.json({ code: 400, msg: '不能删除自己' });
    }
    await pool.query('DELETE FROM admins WHERE id = ?', [id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Admin delete admin error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
