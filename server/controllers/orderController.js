const Order = require('../models/Order');
const Box = require('../models/Box');
const User = require('../models/User');

exports.purchaseBox = async (req, res) => {
    try {
        const { boxId } = req.body;
        const userId = req.user.userId;

        const box = await Box.findById(boxId);
        if (!box) return res.status(404).json({ error: 'Box not found' });

        const user = await User.findById(userId);
        if (user.balance < box.price) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 随机抽取物品逻辑
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

        const wearLevel = selectedItem.wearLevels[
            Math.floor(Math.random() * selectedItem.wearLevels.length)
            ];

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
};

exports.sellItem = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
            type: 'purchase'
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const user = await User.findById(userId);

        const sellOrder = new Order({
            user: userId,
            box: order.box,
            item: order.item,
            type: 'sell',
            amount: order.item.sellPrice
        });

        user.balance += order.item.sellPrice;

        await Promise.all([sellOrder.save(), user.save()]);

        res.json({
            order: sellOrder,
            balance: user.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('box', 'name image');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};