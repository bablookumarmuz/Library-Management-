const express = require('express');
const router = express.Router();
const {
    borrowBook,
    returnBook,
    getAllTransactions,
    getMyTransactions
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/borrow', protect, borrowBook);
router.post('/return/:id', protect, returnBook);
router.get('/', [protect, authorize('admin')], getAllTransactions);
router.get('/my-transactions', protect, getMyTransactions);

module.exports = router;
