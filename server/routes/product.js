const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/product/list - 商品列表 (分页, 分类筛选, 搜索, 排序)
router.get('/list', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      categoryId,
      keyword,
      sort = 'default' // default, price_asc, price_desc, sales, newest
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = 'WHERE p.is_on_sale = 1';
    const params = [];

    if (categoryId) {
      where += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (keyword) {
      where += ' AND (p.name LIKE ? OR p.subtitle LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    let orderBy = 'p.sort_order DESC, p.id DESC';
    switch (sort) {
      case 'price_asc': orderBy = 'p.price ASC'; break;
      case 'price_desc': orderBy = 'p.price DESC'; break;
      case 'sales': orderBy = 'p.sales DESC'; break;
      case 'newest': orderBy = 'p.created_at DESC'; break;
    }

    // 查总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products p ${where}`,
      params
    );

    // 查列表
    const [list] = await pool.query(
      `SELECT p.id, p.category_id, p.name, p.subtitle, p.main_image, p.price, p.original_price,
              p.stock, p.sales, p.unit, p.is_hot, p.is_new, p.sort_order, p.created_at,
              c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: limit
      }
    });
  } catch (err) {
    console.error('Product list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// GET /api/product/detail/:id - 商品详情 (含SKU)
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.json({ code: 404, msg: '商品不存在' });
    }

    // 获取SKU
    const [skus] = await pool.query(
      'SELECT * FROM product_skus WHERE product_id = ?',
      [id]
    );

    const product = products[0];
    if (product.images) {
      try { product.images = JSON.parse(product.images); } catch (_) { product.images = []; }
    }

    res.json({
      code: 0,
      msg: 'success',
      data: {
        ...product,
        skus
      }
    });
  } catch (err) {
    console.error('Product detail error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// GET /api/product/hot - 热门商品
router.get('/hot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [list] = await pool.query(
      `SELECT id, name, subtitle, main_image, price, original_price, sales, is_hot
       FROM products
       WHERE is_on_sale = 1 AND is_hot = 1
       ORDER BY sort_order DESC, sales DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Hot products error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// GET /api/product/new - 新品商品
router.get('/new', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [list] = await pool.query(
      `SELECT id, name, subtitle, main_image, price, original_price, sales, is_new
       FROM products
       WHERE is_on_sale = 1 AND is_new = 1
       ORDER BY created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('New products error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
