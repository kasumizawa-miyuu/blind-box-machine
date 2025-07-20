const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// 获取用户订单
router.get('/user',
    auth('user'),
    controller.getUserOrders
);

module.exports = router;