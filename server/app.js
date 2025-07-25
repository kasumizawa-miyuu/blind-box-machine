const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const authRoutes = require('./routes/auth');
const boxRoutes = require('./routes/boxes');
const orderRoutes = require('./routes/order');
const storageRoute = require('./routes/storage');

dotenv.config();

const app = express();

// 配置multer存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 创建multer实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'), false);
        }
    }
});

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blindbox');
mongoose.connection.on('connected', () => {
    console.log('当前数据库:', mongoose.connection.db.databaseName); // 打印实际连接的数据库
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API路由
app.use('/', routes);
app.use('/api/auth', authRoutes);
app.use('/api/boxes', boxRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/storage', storageRoute)

// 添加图片上传路由
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

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