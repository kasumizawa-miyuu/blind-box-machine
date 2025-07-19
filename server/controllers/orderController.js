const mongoose = require('mongoose');
const Order = require('../models/Order');
const Box = require('../models/Box');
const User = require('../models/User');
const Storage = require('../models/Storage');

// 购买盲盒
exports.purchaseBox = async (req, res) => {
    const session = await mongoose.startSession();
    console.log('收到购买请求，body:', req.body);

    try {
        session.startTransaction();

        const { boxId } = req.body;
        console.log('正在处理boxId:', boxId);
        const userId = req.user.userId;

        // 验证盲盒是否存在
        const box = await Box.findById(boxId).session(session);
        if (!box) {
            await session.abortTransaction();
            return res.status(404).json({ error: '盲盒不存在' });
        }

        // 验证用户余额
        const user = await User.findById(userId).session(session);
        if (user.balance < box.price) {
            await session.abortTransaction();
            return res.status(400).json({ error: '余额不足' });
        }

        // 创建购买订单
        const order = new Order({
            user: userId,
            box: boxId,
            type: 'purchase',
            amount: -box.price,
            item: {
                name: box.name,
            }
        });

        // 添加到仓库
        const storageItem = new Storage({
            user: userId,
            type: 'unopened_box',
            box: boxId,
            boxData: {
                ...box.toObject(),
                _id: box._id,
                name: box.name,
                price: box.price,
                items: box.items.map(item => ({
                    ...item,
                    wearLevels: item.wearLevels
                }))
            },
            createdAt: new Date()
        });

        // 更新用户余额
        user.balance -= box.price;

        // 保存所有变更
        console.log('开始创建订单');
        await order.save({ session });
        console.log('订单创建成功，ID:', order._id);

        console.log('开始创建仓库记录');
        await storageItem.save({ session });
        console.log('仓库记录创建成功，ID:', storageItem._id);

        await user.save({ session });

        await session.commitTransaction();
        console.log('事务提交成功');

        console.log('即将返回响应', {
            success: true,
            balance: user.balance,
            orderId: order._id,
            storageId: storageItem._id
        });

        res.json({
            status: 'success',
            data: {
                success: true,
                balance: user.balance,
                orderId: order._id,
                storageId: storageItem._id,
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('购买失败详情:', {
            message: error.message,
            stack: error.stack,
            errors: error.errors ? Object.keys(error.errors) : null
        });
        res.status(500).json({
            error: '购买失败',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    } finally {
        session.endSession();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('box', 'name image');

        console.log('查询到的订单:', orders);
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