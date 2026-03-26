const express = require('express');
const moment = require('moment');
const pool = require('../config/database');
const auth = require('../middlewares/auth');

const router = express.Router();

// GET /api/coupon/list - 可领取优惠券列表
router.get('/list', async (req, res) => {
  try {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    const [list] = await pool.query(
      `SELECT id, name, type, threshold, value, total, used, start_time, end_time
       FROM coupons
       WHERE status = 1 AND end_time > ? AND (total = 0 OR used < total)
       ORDER BY value DESC`,
      [now]
    );

    res.json({ code: 0, msg: 'success', data: list });
  } catch (err) {
    console.error('Coupon list error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// POST /api/coupon/receive/:id - 领取优惠券
router.post('/receive/:id', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    // 检查优惠券是否存在且有效
    const [coupons] = await conn.query(
      'SELECT * FROM coupons WHERE id = ? AND status = 1 AND start_time <= ? AND end_time >= ? FOR UPDATE',
      [id, now, now]
    );

    if (coupons.length === 0) {
      await conn.rollback();
      return res.json({ code: 404, msg: '优惠券不存在或已过期' });
    }

    const coupon = coupons[0];

    // 检查是否已领完
    if (coupon.total > 0 && coupon.used >= coupon.total) {
      await conn.rollback();
      return res.json({ code: 400, msg: '优惠券已被领完' });
    }

    // 检查是否已领取
    const [existing] = await conn.query(
      'SELECT id FROM user_coupons WHERE user_id = ? AND coupon_id = ?',
      [req.userId, id]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.json({ code: 400, msg: '您已领取过该优惠券' });
    }

    // 领取
    await conn.query(
      'INSERT INTO user_coupons (user_id, coupon_id) VALUES (?, ?)',
      [req.userId, id]
    );

    await conn.query('UPDATE coupons SET used = used + 1 WHERE id = ?', [id]);

    await conn.commit();
    res.json({ code: 0, msg: '领取成功' });
  } catch (err) {
    await conn.rollback();
    console.error('Coupon receive error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  } finally {
    conn.release();
  }
});

module.exports = router;
