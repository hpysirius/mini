const jwt = require('jsonwebtoken');
const pool = require('../config/database');

module.exports = (req, res, next) => {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ code: 401, msg: '未登录，请先登录' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'admin') {
        return res.status(401).json({ code: 401, msg: 'Token无效' });
      }

      // 验证管理员状态
      const [rows] = await pool.query('SELECT id, role, status FROM admins WHERE id = ?', [decoded.adminId]);
      if (rows.length === 0) {
        return res.status(401).json({ code: 401, msg: '管理员不存在' });
      }
      if (rows[0].status !== 1) {
        return res.status(403).json({ code: 403, msg: '账号已被禁用' });
      }

      req.adminId = decoded.adminId;
      req.adminRole = rows[0].role;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ code: 401, msg: '登录已过期，请重新登录' });
      }
      return res.status(401).json({ code: 401, msg: 'Token无效' });
    }
  })();
};
