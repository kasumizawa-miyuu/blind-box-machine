const express = require('express');
const router = express.Router();
const controller = require('../controllers/boxController');
const Box = require('../models/Box');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const Joi = require('joi');

// 获取所有盲盒
router.get('/', async (req, res) => {
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
});

// 获取单个盲盒详情
router.get('/:id', async (req, res) => {
    try {
        const box = await Box.findById(req.params.id);
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 管理员创建盲盒
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const box = new Box(req.body);
        await box.save();
        res.status(201).json(box);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 管理员更新盲盒
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const box = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json(box);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 管理员删除盲盒
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const box = await Box.findByIdAndDelete(req.params.id);
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json({ message: 'Box deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 购买盲盒
router.post('/purchase',
    authMiddleware('user'),
    validate({
        body: Joi.object({
            boxId: Joi.string().required()
        })
    }),
    controller.purchaseBox
);

module.exports = router;