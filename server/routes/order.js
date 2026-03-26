const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const pool = require('../config/database');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

// 生成订单号
function generateOrderNo() {
  return moment().format('YYYYMMDDHHmmss') + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST /api/order/create - 创建订单
router.post('/create', [
  body('addressId').isInt().withMessage('地址ID不正确'),
  body('items').isArray({ min: 1 }).withMessage('请至少选择一个商品'),
  body('items.*.productId').isInt().withMessage('商品ID不正确'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('数量必须大于0'),
  body('remark').optional().isLength({ max: 255 }).withMessage('备注过长'),
  body('fromCart').optional().isBoolean()
], async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    await conn.beginTransaction();

    const { addressId, items, remark = '', fromCart = false } = req.body;

    // 验证地址
    const [addresses] = await conn.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, req.userId]
    );
    if (addresses.length === 0) {
      await conn.rollback();
      return res.json({ code: 400, msg: '收货地址不存在' });
    }
    const address = addresses[0];

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await conn.query(
        'SELECT * FROM products WHERE id = ? AND is_on_sale = 1',
        [item.productId]
      );
      if (products.length === 0) {
        await conn.rollback();
        return res.json({ code: 400, msg: `商品(ID:${item.productId})不存在或已下架` });
      }
      const product = products[0];

      let price = product.price;
      let specs = '';
      let skuId = item.skuId || null;

      if (skuId) {
        const [skus] = await conn.query(
          'SELECT * FROM product_skus WHERE id = ? AND product_id = ?',
          [skuId, item.productId]
        );
        if (skus.length === 0) {
          await conn.rollback();
          return res.json({ code: 400, msg: '商品规格不存在' });
        }
        price = skus[0].price;
        specs = skus[0].specs;
      }

      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.productId,
        sku_id: skuId,
        product_name: product.name,
        product_image: product.main_image,
        specs,
        price,
        quantity: item.quantity,
        total_amount: itemTotal
      });
    }

    // 创建订单
    const orderNo = generateOrderNo();
    const payAmount = totalAmount; // 可扩展优惠券抵扣

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_no, user_id, total_amount, pay_amount, address_snapshot, remark)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderNo, req.userId, totalAmount, payAmount, JSON.stringify(address), remark]
    );
    const orderId = orderResult.insertId;

    // 插入订单明细
    for (const oi of orderItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, sku_id, product_name, product_image, specs, price, quantity, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, oi.product_id, oi.sku_id, oi.product_name, oi.product_image, oi.specs, oi.price, oi.quantity, oi.total_amount]
      );

      // 扣减库存
      if (oi.sku_id) {
        await conn.query(
          'UPDATE product_skus SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [oi.quantity, oi.sku_id, oi.quantity]
        );
      }
      await conn.query(
        'UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ? AND stock >= ?',
        [oi.quantity, oi.quantity, oi.product_id, oi.quantity]
      );
    }

    // 如果从购物车下单，删除已结算的购物车项
    if (fromCart) {
      const productIds = items.map(i => i.productId);
      const skuIds = items.filter(i => i.skuId).map(i => i.skuId);

      if (skuIds.length > 0) {
        await conn.query(
          'DELETE FROM cart WHERE user_id = ? AND product_id IN (?) AND sku_id IN (?)',
          [req.userId, productIds, skuIds]
        );
      } else {
        await conn.query(
          'DELETE FROM cart WHERE user_id = ? AND product_id IN (?) AND sku_id IS NULL',
          [req.userId, productIds]
        );
      }
    }

    await conn.commit();

    res.json({
      code: 0,
      msg: '下单成功',
      data: { orderId, orderNo, payAmount: payAmount.toFixed(2) }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Order create error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  } finally {
    conn.release();
  }
});

// GET /api/order/list - 订单列表 (按状态筛选)
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = 'WHERE o.user_id = ?';
    const params = [req.userId];

    if (status !== undefined && status !== '') {
      where += ' AND o.status = ?';
      params.push(parseInt(status));
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${where}`,
      params
    );

    const [orders] = await pool.query(
      `SELECT * FROM orders o ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // 获取每个订单的商品
    for (const order of orders) {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
      if (order.address_snapshot && typeof order.address_snapshot === 'string') {
        order.address_snapshot = JSON.parse(order.address_snapshot);
      }
    }

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: orders,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: limit
      }
    });
  } catch (err) {
    console.error('Order list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// GET /api/order/detail/:id - 订单详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (orders.length === 0) {
      return res.json({ code: 404, msg: '订单不存在' });
    }

    const order = orders[0];
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    order.items = items;
    if (order.address_snapshot && typeof order.address_snapshot === 'string') {
      order.address_snapshot = JSON.parse(order.address_snapshot);
    }

    res.json({ code: 0, msg: 'success', data: order });
  } catch (err) {
    console.error('Order detail error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/order/cancel/:id - 取消订单
router.put('/cancel/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;

    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (orders.length === 0) {
      await conn.rollback();
      return res.json({ code: 404, msg: '订单不存在' });
    }

    const order = orders[0];
    if (order.status !== 0) {
      await conn.rollback();
      return res.json({ code: 400, msg: '当前状态不能取消' });
    }

    // 恢复库存
    const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    for (const item of items) {
      if (item.sku_id) {
        await conn.query('UPDATE product_skus SET stock = stock + ? WHERE id = ?', [item.quantity, item.sku_id]);
      }
      await conn.query('UPDATE products SET stock = stock + ?, sales = sales - ? WHERE id = ?', [
        item.quantity, item.quantity, item.product_id
      ]);
    }

    await conn.query(
      'UPDATE orders SET status = -1, cancel_time = NOW() WHERE id = ?',
      [id]
    );

    await conn.commit();
    res.json({ code: 0, msg: '取消成功' });
  } catch (err) {
    await conn.rollback();
    console.error('Order cancel error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  } finally {
    conn.release();
  }
});

// PUT /api/order/confirm/:id - 确认收货
router.put('/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (orders.length === 0) {
      return res.json({ code: 404, msg: '订单不存在' });
    }

    if (orders[0].status !== 20) {
      return res.json({ code: 400, msg: '当前状态不能确认收货' });
    }

    await pool.query(
      'UPDATE orders SET status = 30, confirm_time = NOW() WHERE id = ?',
      [id]
    );

    res.json({ code: 0, msg: '确认收货成功' });
  } catch (err) {
    console.error('Order confirm error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
