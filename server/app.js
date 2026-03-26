require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ============ 中间件 ============
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件 (上传目录)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ 路由 ============
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const addressRouter = require('./routes/address');
const bannerRouter = require('./routes/banner');
const couponRouter = require('./routes/coupon');
const adminRouter = require('./routes/admin');

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/address', addressRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/admin', adminRouter);

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'ok', time: new Date().toISOString() });
});

// ============ 404 处理 ============
app.use('/api/*', (req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在' });
});

// ============ 全局错误处理 ============
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 500, msg: '服务器内部错误' });
});

// ============ 启动服务 ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
