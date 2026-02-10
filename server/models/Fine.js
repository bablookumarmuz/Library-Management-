const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transaction: { // Renamed from borrow_id to match typical mongoose ref naming
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
    },
    overdueDays: {
        type: Number,
        default: 0,
    },
    finePerDay: {
        type: Number,
        default: 5, // Default fine amount
    },
    totalFine: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Fine', fineSchema);
