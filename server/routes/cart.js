const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middlewares/auth');

const router = express.Router();

// 所有购物车路由都需要登录
router.use(auth);

// GET /api/cart/list - 购物车列表
router.get('/list', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.product_id, c.sku_id, c.quantity, c.checked,
              p.name, p.main_image, p.price as product_price, p.stock as product_stock, p.is_on_sale,
              ps.specs, ps.price as sku_price, ps.stock as sku_stock, ps.image as sku_image
       FROM cart c
       LEFT JOIN products p ON c.product_id = p.id
       LEFT JOIN product_skus ps ON c.sku_id = ps.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId]
    );

    // 计算汇总
    let totalPrice = 0;
    let checkedCount = 0;

    const list = items.map(item => {
      const price = item.sku_price || item.product_price;
      const stock = item.sku_stock != null ? item.sku_stock : item.product_stock;
      const image = item.sku_image || item.main_image;

      if (item.checked) {
        totalPrice += price * item.quantity;
        checkedCount++;
      }

      return {
        id: item.id,
        product_id: item.product_id,
        sku_id: item.sku_id,
        name: item.name,
        image,
        price,
        stock,
        quantity: item.quantity,
        checked: !!item.checked,
        specs: item.specs,
        is_on_sale: item.is_on_sale
      };
    });

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list,
        totalPrice: totalPrice.toFixed(2),
        checkedCount,
        totalCount: items.length
      }
    });
  } catch (err) {
    console.error('Cart list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// POST /api/cart/add - 添加购物车
router.post('/add', [
  body('productId').isInt().withMessage('商品ID不正确'),
  body('skuId').optional({ nullable: true }).isInt().withMessage('SKU ID不正确'),
  body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { productId, skuId, quantity } = req.body;

    // 验证商品是否存在且上架
    const [products] = await pool.query(
      'SELECT id, stock, is_on_sale FROM products WHERE id = ?',
      [productId]
    );
    if (products.length === 0) return res.json({ code: 404, msg: '商品不存在' });
    if (!products[0].is_on_sale) return res.json({ code: 400, msg: '商品已下架' });

    // 如果有SKU，验证SKU
    if (skuId) {
      const [skus] = await pool.query(
        'SELECT id, stock FROM product_skus WHERE id = ? AND product_id = ?',
        [skuId, productId]
      );
      if (skus.length === 0) return res.json({ code: 400, msg: '商品规格不存在' });
    }

    // 检查是否已存在
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND sku_id <=> ?',
      [req.userId, productId, skuId || null]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, sku_id, quantity) VALUES (?, ?, ?, ?)',
        [req.userId, productId, skuId || null, quantity]
      );
    }

    res.json({ code: 0, msg: '添加成功' });
  } catch (err) {
    console.error('Cart add error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/cart/update - 更新数量
router.put('/update', [
  body('id').isInt().withMessage('购物车项ID不正确'),
  body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { id, quantity } = req.body;

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.json({ code: 404, msg: '购物车项不存在' });
    }

    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Cart update error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// DELETE /api/cart/remove - 删除
router.delete('/remove', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ code: 400, msg: '请选择要删除的商品' });
    }

    await pool.query(
      'DELETE FROM cart WHERE id IN (?) AND user_id = ?',
      [ids, req.userId]
    );

    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Cart remove error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/cart/check - 切换选中状态
router.put('/check', [
  body('id').isInt().withMessage('购物车项ID不正确'),
  body('checked').isBoolean().withMessage('checked必须为布尔值')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { id, checked } = req.body;

    await pool.query(
      'UPDATE cart SET checked = ? WHERE id = ? AND user_id = ?',
      [checked ? 1 : 0, id, req.userId]
    );

    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Cart check error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
