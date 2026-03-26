const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middlewares/auth');

const router = express.Router();

// POST /api/user/login - 微信登录
router.post('/login', [
  body('code').notEmpty().withMessage('code不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { code } = req.body;

    // TODO: 实际项目中需要调用微信API换取openid
    // https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
    // 此处模拟: 用code作为openid (生产环境务必替换)
    const openid = `wx_${code}`;

    // 查找或创建用户
    let [users] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);

    if (users.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)',
        [openid, '微信用户', '']
      );
      users = [{ id: result.insertId, openid, nickname: '微信用户', avatar: '', phone: '', gender: 0 }];
    }

    const user = users[0];

    if (user.status !== 1) {
      return res.json({ code: 403, msg: '账号已被禁用' });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          gender: user.gender
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// GET /api/user/info - 获取用户信息
router.get('/info', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, openid, nickname, avatar, phone, gender, balance, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.json({ code: 404, msg: '用户不存在' });
    }

    res.json({ code: 0, msg: 'success', data: users[0] });
  } catch (err) {
    console.error('Get user info error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// PUT /api/user/info - 更新用户信息
router.put('/info', auth, [
  body('nickname').optional().isLength({ max: 64 }).withMessage('昵称过长'),
  body('avatar').optional().isLength({ max: 255 }).withMessage('头像URL过长'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('gender').optional().isIn([0, 1, 2]).withMessage('性别值不正确')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ code: 400, msg: errors.array()[0].msg });
    }

    const { nickname, avatar, phone, gender } = req.body;
    const updates = [];
    const values = [];

    if (nickname !== undefined) { updates.push('nickname = ?'); values.push(nickname); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }

    if (updates.length === 0) {
      return res.json({ code: 400, msg: '没有要更新的字段' });
    }

    values.push(req.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [users] = await pool.query(
      'SELECT id, nickname, avatar, phone, gender FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({ code: 0, msg: '更新成功', data: users[0] });
  } catch (err) {
    console.error('Update user info error:', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
