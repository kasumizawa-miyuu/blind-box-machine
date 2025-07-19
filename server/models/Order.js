const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: 'Box', required: true },
    item: {
        name: { type: String, required: true },
        image: { type: String },
        wearLevel: { type: String },
        sellPrice: { type: Number }
    },
    type: { type: String, enum: ['purchase', 'open_box', 'sell_item'], required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema, 'orders');