const Box = require('../models/Box');

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