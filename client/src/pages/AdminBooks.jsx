import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Book,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    X,
    Filter
} from 'lucide-react';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentBook, setCurrentBook] = useState(null); // For editing

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: '',
        category: '',
        quantity: '',
        availableQuantity: '',
        image: ''
    });

    // Fetch Books
    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/books`);
            setBooks(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch books');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Filter books
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
    );

    // Initial Form State
    const initialFormState = {
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: '',
        quantity: '',
        availableQuantity: '',
        image: ''
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setCurrentBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                category: book.category,
                quantity: book.quantity,
                quantity: book.quantity,
                availableQuantity: book.availableQuantity,
                image: book.image || ''
            });
        } else {
            setCurrentBook(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBook(null);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            // Logic for availableQuantity: if new book, default to quantity.
            // If editing, we trust the input (admin might adjust stock).
            const dataToSubmit = {
                ...formData,
                availableQuantity: formData.availableQuantity !== '' ? formData.availableQuantity : formData.quantity
            };

            if (currentBook) {
                // Update
                await axios.put(`${import.meta.env.VITE_API_URL}/api/books/${currentBook._id}`, dataToSubmit, config);
                toast.success('Book updated successfully');
            } else {
                // Create
                await axios.post(`${import.meta.env.VITE_API_URL}/api/books`, dataToSubmit, config);
                toast.success('Book added successfully');
            }
            fetchBooks();
            handleCloseModal();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Book deleted');
            fetchBooks();
        } catch (error) {
            toast.error('Failed to delete book');
        }
    };

    return (
        <div className="p-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Book Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage library collection</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add New Book</span>
                </button>
            </header>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-medium">Book</th>
                                <th className="px-6 py-4 font-medium">Author</th>
                                <th className="px-6 py-4 font-medium">ISBN</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Qty</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No books found.</td></tr>
                            ) : (
                                filteredBooks.map((book) => (
                                    <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            {book.image ? (
                                                <img src={book.image} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                                            ) : (
                                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                    <Book className="w-5 h-5" />
                                                </div>
                                            )}
                                            <span className="truncate max-w-[200px]" title={book.title}>{book.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{book.author}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">{book.isbn}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{book.availableQuantity} / {book.quantity}</span>
                                                <span className="text-xs text-gray-500">Available</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(book)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentBook ? 'Edit Book' : 'Add New Book'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full border border-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (Optional)</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    placeholder="https://example.com/book-cover.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                <input
                                    type="text"
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Qty</label>
                                    <input
                                        type="number"
                                        name="availableQuantity"
                                        value={formData.availableQuantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        placeholder="Defaults to Total"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 font-medium shadow-sm hover:shadow"
                                >
                                    {currentBook ? 'Update Book' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;
