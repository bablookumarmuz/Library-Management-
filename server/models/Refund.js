const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refundAmount: {
        type: Number,
        required: true,
    },
    refundReason: {
        type: String,
    },
    refundStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    refundDate: {
        type: Date,
        default: Date.now,
    },
    razorpayRefundId: {
        type: String,
    }
});

module.exports = mongoose.model('Refund', refundSchema);
