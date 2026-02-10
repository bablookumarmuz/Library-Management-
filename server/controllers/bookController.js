const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Private/Admin
const addBook = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, isbn, category, quantity, availableQuantity, image } = req.body;

    try {
        let book = await Book.findOne({ isbn });

        if (book) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        book = new Book({
            title,
            author,
            isbn,
            category,
            quantity,
            quantity,
            availableQuantity: availableQuantity !== undefined ? availableQuantity : quantity,
            image
        });

        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
    const { title, author, isbn, category, quantity, availableQuantity, image } = req.body;

    // Build book object
    const bookFields = {};
    if (title) bookFields.title = title;
    if (author) bookFields.author = author;
    if (isbn) bookFields.isbn = isbn;
    if (category) bookFields.category = category;
    if (quantity !== undefined) bookFields.quantity = quantity;
    if (availableQuantity !== undefined) bookFields.availableQuantity = availableQuantity;
    if (image) bookFields.image = image;

    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: bookFields },
            { new: true }
        );

        res.json(book);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.deleteOne(); // or findByIdAndDelete

        res.json({ message: 'Book removed' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
};
