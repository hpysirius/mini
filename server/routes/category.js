const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/category/list - 分类列表(树形结构)
router.get('/list', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, parent_id, name, icon, sort_order, status FROM categories WHERE status = 1 ORDER BY sort_order ASC, id ASC'
    );

    // 构建树形结构
    const tree = buildTree(categories, 0);

    res.json({ code: 0, msg: 'success', data: tree });
  } catch (err) {
    console.error('Category list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

function buildTree(list, parentId) {
  return list
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }));
}

module.exports = router;
