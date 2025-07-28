const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    items: [{
        name: { type: String, required: true },
        image: { type: String },
        probability: { type: Number, required: true, min: 0, max: 1 },
        wearLevels: [{
            level: { type: String, required: true },
            price: { type: Number, required: true }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Box', boxSchema);