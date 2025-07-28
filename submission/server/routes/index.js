const express = require('express');
const router = express.Router();
const boxRoutes = require('./boxes');
const orderRoutes = require('./order');
const storageRoute = require('./storage');

// API路由
router.use('/api/boxes', boxRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/storage', storageRoute);

module.exports = router;