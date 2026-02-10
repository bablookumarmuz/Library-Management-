const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

// @desc    Borrow a book
// @route   POST /api/transactions/borrow
// @access  Private
const borrowBook = async (req, res) => {
    const { bookId } = req.body;

    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.availableQuantity < 1) {
            return res.status(400).json({ message: 'Book is not available' });
        }

        // Create Transaction
        const transaction = new Transaction({
            user: req.user._id,
            book: bookId,
            issueDate: Date.now(),
            dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
            status: 'Issued'
        });

        await transaction.save();

        // Update Book Quantity
        book.availableQuantity -= 1;
        await book.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Return a book
// @route   POST /api/transactions/return/:id
// @access  Private (User puts in request) or Admin (processes return)
// Note: For simplicity, we'll let this be the 'Process Return' action
const returnBook = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('book');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'Returned') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        // Update Transaction
        transaction.returnDate = Date.now();
        transaction.status = 'Returned';

        // Calculate Fine (Mock logic: 10rs per day late)
        // const daysLate = ...
        // transaction.fine = ...

        await transaction.save();

        // Update Book Quantity
        const book = await Book.findById(transaction.book._id);
        if (book) {
            book.availableQuantity += 1;
            await book.save();
        }

        res.json(transaction);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all transactions (Admin)
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'name email')
            .populate('book', 'title')
            .sort({ issueDate: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user transactions
// @route   GET /api/transactions/my-transactions
// @access  Private
const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .populate('book', 'title author')
            .sort({ issueDate: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    borrowBook,
    returnBook,
    getAllTransactions,
    getMyTransactions
};
