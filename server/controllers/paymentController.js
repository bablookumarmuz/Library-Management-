const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Fine = require('../models/Fine');
const Refund = require('../models/Refund');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { fineId } = req.body;
        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        if (fine.status === 'Paid') {
            return res.status(400).json({ message: 'Fine already paid' });
        }

        const options = {
            amount: fine.totalFine * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${fineId}`,
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fineId } = req.body;

    try {
        // Create signature to verify
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment Success
            const fine = await Fine.findById(fineId);
            if (!fine) return res.status(404).json({ message: 'Fine record not found' });

            // Check for duplicate payment (Double Payment Prevention)
            const existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, status: 'Success' });
            if (existingPayment) {
                // Auto Refund Trigger
                console.log('Duplicate Payment Detected. Initiating Refund...');
                // Logic for auto-refund would go here (or call a separate function)
                return res.status(400).json({ message: 'Duplicate payment detected. Refund initiated.' });
            }

            // Save Payment
            const payment = new Payment({
                user: req.user.id,
                fine: fineId,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: fine.totalFine,
                status: 'Success'
            });
            await payment.save();

            // Update Fine Status
            fine.status = 'Paid';
            await fine.save();

            res.json({ message: 'Payment verified successfully', paymentId: payment._id });
        } else {
            // Signature Mismatch
            const payment = new Payment({
                user: req.user.id,
                fine: fineId,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: 0, // Failed
                status: 'Failed'
            });
            await payment.save();

            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get User Fines
// @route   GET /api/payment/fines
// @access  Private
const getUserFines = async (req, res) => {
    try {
        const fines = await Fine.find({ user: req.user.id })
            .populate('transaction')
            .populate({
                path: 'transaction',
                populate: { path: 'book', select: 'title author' }
            })
            .sort({ createdAt: -1 });
        res.json(fines);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Initiate Manual Refund
// @route   POST /api/payment/refund
// @access  Private/Admin
const initiateRefund = async (req, res) => {
    const { paymentId, reason } = req.body;

    try {
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        if (payment.status !== 'Success') {
            return res.status(400).json({ message: 'Payment not successful, cannot refund' });
        }

        // Razorpay Refund
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            notes: { reason: reason || 'Manual Refund' }
        });

        // Save Refund Record
        const newRefund = new Refund({
            payment: payment._id,
            user: req.user.id,
            refundAmount: refund.amount / 100,
            refundReason: reason,
            refundStatus: 'Completed',
            razorpayRefundId: refund.id
        });
        await newRefund.save();

        // Update Payment Status
        payment.status = 'Refunded';
        payment.refundId = newRefund._id;
        await payment.save();

        // Optional: Reset Fine Status if full refund? 
        // For now, keeping it as Paid or maybe create a new status 'Refunded' in Fine model if needed.

        res.json({ message: 'Refund initiated successfully', refund: newRefund });
    } catch (error) {
        console.error('Error initiating refund:', error);
        res.status(500).json({ message: 'Refund failed', error: error.error });
    }
};

// @desc    Get All Fines (Admin)
// @route   GET /api/payment/admin/all-fines
// @access  Private/Admin
const getAllFines = async (req, res) => {
    try {
        const fines = await Fine.find()
            .populate('user', 'name email')
            .populate({
                path: 'transaction',
                populate: { path: 'book', select: 'title' }
            })
            .sort({ createdAt: -1 });
        res.json(fines);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getUserFines,
    initiateRefund,
    getAllFines
};
