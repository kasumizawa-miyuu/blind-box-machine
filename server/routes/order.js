const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

// 购买盲盒
router.post('/purchase',
    auth('user'),
    validate({
        body: Joi.object({
            boxId: Joi.string().required()
        })
    }),
    controller.purchaseBox
);

// 获取用户订单
router.get('/user',
    auth('user'),
    controller.getUserOrders
);

module.exports = router;