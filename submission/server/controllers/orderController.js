const mongoose = require('mongoose');
const Order = require('../models/Order');

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('box', 'name image');

        res.json({
            status: 'success',
            data: orders
        });
    } catch (error) {
        console.error('获取订单失败:', error);
        res.status(500).json({
            status: 'error',
            error: '获取订单失败'
        });
    }
};