const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getUserFines,
    initiateRefund,
    getAllFines
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order
// @access  Private
router.post('/create-order', protect, createOrder);

// @route   POST /api/payment/verify
// @desc    Verify Payment
// @access  Private
router.post('/verify', protect, verifyPayment);

// @route   GET /api/payment/fines
// @desc    Get User Fines
// @access  Private
router.get('/fines', protect, getUserFines);

// @route   POST /api/payment/refund
// @desc    Initiate Refund
// @access  Private/Admin
router.post('/refund', [protect, authorize('admin')], initiateRefund);

// @route   GET /api/payment/admin/all-fines
// @desc    Get All Fines (Admin)
// @access  Private/Admin
router.get('/admin/all-fines', [protect, authorize('admin')], getAllFines);

module.exports = router;
