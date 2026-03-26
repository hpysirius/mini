const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

// GET /api/address/list - 地址列表
router.get('/list', async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.userId]
    );

    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Address list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// POST /api/address/add - 添加地址
router.post('/add', [
  body('name').notEmpty().withMessage('收件人不能为空').isLength({ max: 32 }),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('province').notEmpty().withMessage('省份不能为空'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').notEmpty().withMessage('区县不能为空'),
  body('detail').notEmpty().withMessage('详细地址不能为空').isLength({ max: 255 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { name, phone, province, city, district, detail, isDefault = 0 } = req.body;

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.userId]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, phone, province, city, district, detail, isDefault ? 1 : 0]
    );

    res.json({ code: 0, msg: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('Address add error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/address/update/:id - 更新地址
router.put('/update/:id', [
  body('name').optional().isLength({ max: 32 }),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('province').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('district').optional().notEmpty(),
  body('detail').optional().isLength({ max: 255 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { name, phone, province, city, district, detail, isDefault } = req.body;

    // 验证归属
    const [existing] = await pool.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (existing.length === 0) {
      return res.json({ code: 404, msg: '地址不存在' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (province !== undefined) { updates.push('province = ?'); values.push(province); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (district !== undefined) { updates.push('district = ?'); values.push(district); }
    if (detail !== undefined) { updates.push('detail = ?'); values.push(detail); }
    if (isDefault !== undefined) { updates.push('is_default = ?'); values.push(isDefault ? 1 : 0); }

    if (updates.length === 0) {
      return res.json({ code: 400, msg: '没有要更新的字段' });
    }

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.userId]);
    }

    values.push(id, req.userId);
    await pool.query(`UPDATE addresses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);

    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Address update error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// DELETE /api/address/remove/:id - 删除地址
router.delete('/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.json({ code: 404, msg: '地址不存在' });
    }

    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Address remove error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/address/default/:id - 设为默认
router.put('/default/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 验证归属
    const [existing] = await pool.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (existing.length === 0) {
      return res.json({ code: 404, msg: '地址不存在' });
    }

    await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.userId]);
    await pool.query('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, req.userId]);

    res.json({ code: 0, msg: '设置成功' });
  } catch (err) {
    console.error('Address set default error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
