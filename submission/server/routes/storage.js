const express = require('express');
const router = express.Router();
const controller = require('../controllers/storageController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

// 开启武器箱
router.post('/open',
    auth('user'),
    validate({
        body: Joi.object({
            storageId: Joi.string().required()
        })
    }),
    controller.openBox
);

// 卖出物品
router.post('/sell',
    auth('user'),
    validate({
        body: Joi.object({
            storageId: Joi.string().required()
        })
    }),
    controller.sellItem
);

// 获取用户仓库物品
router.get('/user',
    auth('user'),
    controller.getUserStorage
);

// 切换物品可见性
router.patch('/:itemId/visibility',
    auth('user'),
    controller.toggleItemVisibility
);

// 获取公开物品
router.get('/public',
    auth('user'),
    controller.getPublicItems
);

module.exports = router;