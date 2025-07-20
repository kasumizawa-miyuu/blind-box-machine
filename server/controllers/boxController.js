const mongoose = require('mongoose');
const Box = require('../models/Box');
const User = require('../models/User');
const Order = require('../models/Order');
const Storage = require('../models/Storage');

const validateBoxItems = (items) => {
    const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);
    return Math.abs(totalProbability - 1) <= 0.01; // 允许1%的误差
};

exports.getAllBoxes = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const boxes = await Box.find(query);
        res.json(boxes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBoxById = async (req, res) => {
    try {
        const box = await Box.findById(req.params.id);
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBox = async (req, res) => {
    try {
        if (!validateBoxItems(req.body.items)) {
            return res.status(400).json({
                error: '所有物品的概率总和必须为1 (±0.01)',
                details: `当前总和: ${req.body.items.reduce((sum, item) => sum + item.probability, 0).toFixed(2)}`
            });
        }

        const box = new Box(req.body);
        await box.save();
        res.status(201).json(box);
    } catch (error) {
        res.status(400).json({
            error: '创建盲盒失败',
            details: error.message
        });
    }
};

exports.updateBox = async (req, res) => {
    try {
        if (req.body.items && !validateBoxItems(req.body.items)) {
            return res.status(400).json({
                error: '所有物品的概率总和必须为1 (±0.01)',
                details: `当前总和: ${req.body.items.reduce((sum, item) => sum + item.probability, 0).toFixed(2)}`
            });
        }

        const box = await Box.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json(box);
    } catch (error) {
        res.status(400).json({
            error: '更新盲盒失败',
            details: error.message
        });
    }
};

exports.deleteBox = async (req, res) => {
    try {
        const box = await Box.findByIdAndDelete(req.params.id);
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json({ message: 'Box deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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