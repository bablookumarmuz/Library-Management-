import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Book, Search, Filter, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/books');
            setBooks(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load books');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleBorrow = async (bookId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to borrow books');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post('http://localhost:5000/api/transactions/borrow', { bookId }, config);
            toast.success('Book borrowed successfully!');
            fetchBooks(); // Refresh to update availability
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to borrow book';
            toast.error(message);
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <Link to="/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">&larr; Back to Dashboard</Link>
                    <h1 className="text-4xl font-serif font-bold text-gray-900">Browse Collection</h1>
                    <p className="text-gray-500 mt-2">Explore our vast library of books</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search title, author, genre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-20">Loading books...</div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No books found matching your search.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => (
                            <div key={book._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                                <div className="h-48 bg-emerald-50 flex items-center justify-center relative overflow-hidden">
                                    {book.image ? (
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                        />
                                    ) : (
                                        <Book className="w-16 h-16 text-emerald-200" />
                                    )}
                                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-emerald-700 shadow-sm z-10">
                                        {book.category}
                                    </span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{book.author}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Availability</span>
                                            <span className={`font-medium ${book.availableQuantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {book.availableQuantity} / {book.quantity}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleBorrow(book._id)}
                                            disabled={book.availableQuantity < 1}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${book.availableQuantity > 0
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            {book.availableQuantity > 0 ? 'Borrow' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseBooks;
