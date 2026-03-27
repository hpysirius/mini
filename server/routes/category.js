const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/category/list - 分类列表 (扁平结构，只显示一级分类)
router.get('/list', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, icon, sort_order, status FROM categories WHERE parent_id = 0 AND status = 1 ORDER BY sort_order ASC, id ASC'
    );

    res.json({ code: 0, msg: 'success', data: categories });
  } catch (err) {
    console.error('Category list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
