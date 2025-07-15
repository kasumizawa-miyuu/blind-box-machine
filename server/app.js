const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const boxRoutes = require('./routes/boxes');
const orderRoutes = require('./routes/order');

dotenv.config();

const app = express();

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blindbox');


// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/boxes', boxRoutes);
app.use('/api/orders', orderRoutes);

// 前端路由处理
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;