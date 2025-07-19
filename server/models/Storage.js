const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['unopened_box', 'item'], required: true },
    box: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: function() { return this.type === 'unopened_box'; }
    },
    boxData: { type: Object },
    itemData: { type: Object },
    createdAt: { type: Date, default: Date.now },
    openedAt: { type: Date }
});

module.exports = mongoose.model('Storage', storageSchema, 'storages');