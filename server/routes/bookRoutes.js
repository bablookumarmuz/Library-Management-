const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', getBooks);

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', getBookById);

// @route   POST /api/books
// @desc    Add a new book
// @access  Private/Admin
router.post(
    '/',
    [
        protect,
        authorize('admin'),
        [
            check('title', 'Title is required').not().isEmpty(),
            check('author', 'Author is required').not().isEmpty(),
            check('isbn', 'ISBN is required').not().isEmpty(),
            check('category', 'Category is required').not().isEmpty(),
            check('quantity', 'Quantity is required').isNumeric(),
        ],
    ],
    addBook
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', [protect, authorize('admin')], updateBook);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], deleteBook);

module.exports = router;
