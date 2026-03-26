const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/banner/list - 轮播图列表
router.get('/list', async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, title, image, link_type, link_value FROM banners WHERE status = 1 ORDER BY sort_order ASC, id ASC'
    );

    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Banner list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
