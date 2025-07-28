const mongoose = require('mongoose');
const Order = require('../models/Order');
const Storage = require('../models/Storage');
const Box = require('../models/Box');
const User = require('../models/User');

// 开启武器箱
exports.openBox = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log('[DEBUG] 开盒请求参数:', {
        storageId: req.body.storageId,
        userId: req.user.userId,
        timestamp: new Date()
    });
    try {
        const { storageId } = req.body;
        const userId = req.user.userId;

        // 获取当前用户信息
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        // 验证未开启的武器箱是否存在
        const unopenedBox = await Storage.findOne({
            _id: storageId,
            user: userId,
            type: 'unopened_box'
        }).session(session);

        console.log('[DEBUG] 数据库查询结果:', {
            found: !!unopenedBox,
            actualUserId: unopenedBox?.user?.toString(),
            actualType: unopenedBox?.type
        });

        if (!unopenedBox) {
            await session.abortTransaction();
            return res.status(404).json({
                status: 'error',
                message: '未找到可开启的武器箱',
                code: 'BOX_NOT_FOUND'
            });
        }

        // 获取武器箱数据
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

        // 更新仓库：移除未开启武器箱，添加获得的物品
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
        await session.endSession();

        res.json({
            status: 'success',
            data: {
                item: {
                    name: selectedItem.name,
                    image: selectedItem.image,
                    wearLevel: wearLevel.level,
                    sellPrice: wearLevel.price
                },
                balance: user.balance,
                storageId: newStorageItem._id
            }
        });
    } catch (error) {
        if (session.inTransaction()){
            await session.abortTransaction();
        }
        console.error('开盒失败:', error);

        await session.endSession();
        res.status(500).json({
            status: 'error',
            message: '开盒操作失败',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// 卖出物品
exports.sellItem = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log('卖出请求参数:', {
        storageId: req.body.storageId,
        userId: req.user.userId,
        timestamp: new Date()
    });
    try {
        const { storageId } = req.body;
        const userId = req.user.userId;

        // 获取当前用户信息
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        // 验证物品是否存在
        const item = await Storage.findOne({
            _id: storageId,
            user: userId,
            type: 'item'
        }).session(session);

        console.log('数据库查询结果:', {
            found: !!item,
            actualUserId: item?.user?.toString(),
            actualType: item?.type
        });

        if (!item) {
            await session.abortTransaction();
            return res.status(404).json({
                status: 'error',
                message: '未找到可卖出的物品',
                code: 'ITEM_NOT_FOUND'
            });
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
        user.balance += item.itemData.sellPrice;

        // 从仓库中移除物品
        await Storage.deleteOne({ _id: storageId }).session(session);

        // 保存所有变更
        await Promise.all([
            order.save({ session }),
            user.save({ session })
        ]);

        await session.commitTransaction();
        await session.endSession();

        res.json({
            status: 'success',
            data: {
                balance: user.balance,
                amount: item.itemData.sellPrice
            }
        });
    } catch (error) {
        if (session.inTransaction()){
            await session.abortTransaction();
        }
        console.error('卖出失败:', error);

        await session.endSession();
        res.status(500).json({
            status: 'error',
            message: '卖出操作失败',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

// 切换物品可见性
exports.toggleItemVisibility = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.userId;

        const item = await Storage.findOneAndUpdate(
            { _id: itemId, user: userId, type: 'item' },
            [{ $set: { isPublic: { $not: "$isPublic" } } }],
            { new: true }
        );

        if (!item) {
            return res.status(404).json({
                status: 'error',
                message: '未找到物品',
            });
        }

        res.json({
            status: 'success',
            data: item
        });

    } catch (error) {
        console.error('切换可见性失败:', error);
        res.status(500).json({
            status: 'error',
            message: '切换可见性失败',
        });
    }
};

// 获取所有公开物品
exports.getPublicItems = async (req, res) => {
    try {
        const items = await Storage.find({
            isPublic: true,
            type: 'item'
        })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        const formattedItems = items.map(item => ({
            ...item.toObject(),
            owner: {
                _id: item.user._id,
                username: item.user.username
            }
        }));

        res.json({
            status: 'success',
            data: formattedItems
        });
    } catch (error) {
        console.error('获取公开物品失败:', error);
        res.status(500).json({
            status: 'error',
            message: '获取公开物品失败'
        });
    }
};