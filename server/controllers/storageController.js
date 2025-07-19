const mongoose = require('mongoose');
const Order = require('../models/Order');
const Storage = require('../models/Storage');
const Box = require('../models/Box');

// 开启盲盒
exports.openBox = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { storageId } = req.body;
        const userId = req.user.userId;

        // 验证未开启的盲盒是否存在
        const unopenedBox = await Storage.findOne({
            _id: storageId,
            user: userId,
            type: 'unopened_box'
        }).session(session);

        if (!unopenedBox) {
            await session.abortTransaction();
            return res.status(404).json({ error: '未找到可开启的盲盒' });
        }

        // 获取盲盒数据
        const box = unopenedBox.boxData;

        // 随机抽取物品
        const totalProbability = box.items.reduce((sum, item) => sum + item.probability, 0);
        const random = Math.random() * totalProbability;

        let cumulativeProbability = 0;
        let selectedItem = null;

        for (const item of box.items) {
            cumulativeProbability += item.probability;
            if (random <= cumulativeProbability) {
                selectedItem = item;
                break;
            }
        }

        // 保底机制
        if (!selectedItem) {
            selectedItem = box.items[0];
        }

        // 随机选择磨损等级
        const wearLevel = selectedItem.wearLevels[
            Math.floor(Math.random() * selectedItem.wearLevels.length)
            ];

        // 创建开盒订单记录
        const order = new Order({
            user: userId,
            box: box._id,
            item: {
                name: selectedItem.name,
                image: selectedItem.image,
                wearLevel: wearLevel.level,
                sellPrice: wearLevel.price
            },
            type: 'open_box',
            amount: 0
        });

        // 更新仓库：移除未开启盲盒，添加获得的物品
        await Storage.deleteOne({ _id: storageId }).session(session);

        const newStorageItem = new Storage({
            user: userId,
            type: 'item',
            itemData: {
                ...selectedItem,
                wearLevel: wearLevel.level,
                sellPrice: wearLevel.price,
                openedAt: new Date()
            },
            createdAt: new Date()
        });

        // 保存所有变更
        await Promise.all([
            order.save({ session }),
            newStorageItem.save({ session })
        ]);

        await session.commitTransaction();

        res.json({
            success: true,
            item: {
                name: selectedItem.name,
                image: selectedItem.image,
                wearLevel: wearLevel.level,
                sellPrice: wearLevel.price
            },
            storageId: newStorageItem._id
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('开盒失败:', error);
        res.status(500).json({
            error: '开盒失败',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};

// 卖出物品
exports.sellItem = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { storageId } = req.body;
        const userId = req.user.userId;

        // 验证物品是否存在
        const item = await Storage.findOne({
            _id: storageId,
            user: userId,
            type: 'item'
        }).session(session);

        if (!item) {
            await session.abortTransaction();
            return res.status(404).json({ error: '未找到可卖出的物品' });
        }

        // 创建卖出订单记录
        const order = new Order({
            user: userId,
            item: {
                name: item.itemData.name,
                image: item.itemData.image,
                wearLevel: item.itemData.wearLevel,
                sellPrice: item.itemData.sellPrice
            },
            type: 'sell_item',
            amount: item.itemData.sellPrice
        });

        // 更新用户余额
        const user = await User.findById(userId).session(session);
        user.balance += item.itemData.sellPrice;

        // 从仓库中移除物品
        await Storage.deleteOne({ _id: storageId }).session(session);

        // 保存所有变更
        await Promise.all([
            order.save({ session }),
            user.save({ session })
        ]);

        await session.commitTransaction();

        res.json({
            success: true,
            balance: user.balance,
            amount: item.itemData.sellPrice
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('卖出失败:', error);
        res.status(500).json({
            error: '卖出失败',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};

// 获取用户仓库物品
exports.getUserStorage = async (req, res) => {
    try {
        const items = await Storage.find({ user: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({
            status: 'success',
            data: items
        });
    } catch (error) {
        console.error('获取仓库物品失败:', error);
        res.status(500).json({
            status: 'error',
            error: '获取仓库物品失败'
        });
    }
};