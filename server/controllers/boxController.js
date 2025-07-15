const Box = require('../models/Box');

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
        const box = new Box(req.body);
        await box.save();
        res.status(201).json(box);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateBox = async (req, res) => {
    try {
        const box = await Box.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!box) return res.status(404).json({ error: 'Box not found' });
        res.json(box);
    } catch (error) {
        res.status(400).json({ error: error.message });
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