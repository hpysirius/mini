const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, msg: '未登录，请先登录' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'user') {
      return res.status(401).json({ code: 401, msg: 'Token无效' });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, msg: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ code: 401, msg: 'Token无效' });
  }
};
