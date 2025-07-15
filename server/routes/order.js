const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Box = require('../models/Box');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

// 用户购买盲盒
router.post('/purchase', authMiddleware('user'), async (req, res) => {
    try {
        const { boxId } = req.body;
        const userId = req.user.userId;

        const box = await Box.findById(boxId);
        if (!box) return res.status(404).json({ error: 'Box not found' });

        const user = await User.findById(userId);
        if (user.balance < box.price) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 根据概率随机抽取物品
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedItem = null;

        for (const item of box.items) {
            cumulativeProbability += item.probability;
            if (random <= cumulativeProbability) {
                selectedItem = item;
                break;
            }
        }

        // 随机选择磨损度
        const wearLevel = selectedItem.wearLevels[
            Math.floor(Math.random() * selectedItem.wearLevels.length)
            ];

        // 创建订单
        const order = new Order({
            user: userId,
            box: boxId,
            item: {
                name: selectedItem.name,
                image: selectedItem.image,
                wearLevel: wearLevel.level,
                sellPrice: wearLevel.price
            },
            type: 'purchase',
            amount: -box.price
        });

        // 更新用户余额
        user.balance -= box.price;

        await Promise.all([order.save(), user.save()]);

        res.json({
            order,
            item: {
                ...selectedItem.toObject(),
                wearLevel: wearLevel.level,
                sellPrice: wearLevel.price
            },
            balance: user.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 用户卖出物品
router.post('/sell', authMiddleware('user'), async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;

        const order = await Order.findOne({ _id: orderId, user: userId, type: 'purchase' });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const user = await User.findById(userId);

        // 创建卖出订单
        const sellOrder = new Order({
            user: userId,
            box: order.box,
            item: order.item,
            type: 'sell',
            amount: order.item.sellPrice
        });

        // 更新用户余额
        user.balance += order.item.sellPrice;

        await Promise.all([sellOrder.save(), user.save()]);

        res.json({
            order: sellOrder,
            balance: user.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取用户订单
router.get('/user', authMiddleware('user'), async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('box', 'name image');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;