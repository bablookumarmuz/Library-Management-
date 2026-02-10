import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Book, Clock, CheckCircle, RotateCcw, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const MyBooks = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('http://localhost:5000/api/transactions/my-transactions', config);
            setTransactions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch your books');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTransactions();
    }, []);

    const handleReturn = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post(`http://localhost:5000/api/transactions/return/${id}`, {}, config);
            toast.success('Book returned successfully');
            fetchMyTransactions();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to return book';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <header className="max-w-5xl mx-auto mb-10">
                <Link to="/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">&larr; Back to Dashboard</Link>
                <div className="flex items-center gap-3">
                    <Book className="w-8 h-8 text-emerald-700" />
                    <h1 className="text-3xl font-serif font-bold text-gray-900">My Library</h1>
                </div>
                <p className="text-gray-500 mt-2 ml-11">Manage your borrowed books and history</p>
            </header>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Active Loans */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        Active Loans
                    </h2>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : transactions.filter(t => t.status === 'Issued').length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-500 mb-4">You have no active loans.</p>
                                <Link to="/browse" className="text-emerald-600 font-medium hover:underline">Browse books to borrow &rarr;</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {transactions.filter(t => t.status === 'Issued').map((txn) => (
                                    <div key={txn._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4">
                                            <div className="hidden sm:flex w-12 h-16 bg-emerald-100 rounded items-center justify-center shrink-0 overflow-hidden">
                                                {txn.book?.image ? (
                                                    <img
                                                        src={txn.book.image}
                                                        alt={txn.book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Book className="w-6 h-6 text-emerald-600 opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{txn.book ? txn.book.title : 'Deleted Book'}</h3>
                                                <p className="text-sm text-gray-500 mb-2">{txn.book?.author}</p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Due: {format(new Date(txn.dueDate), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleReturn(txn._id)}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Return Book
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* History */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        Returned History
                    </h2>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Book Title</th>
                                        <th className="px-6 py-4">Borrow Date</th>
                                        <th className="px-6 py-4">Returned On</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.filter(t => t.status === 'Returned').length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No history found.</td></tr>
                                    ) : (
                                        transactions.filter(t => t.status === 'Returned').map((txn) => (
                                            <tr key={txn._id} className="text-sm hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{txn.book ? txn.book.title : 'Deleted Book'}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(txn.issueDate), 'MMM dd, yyyy')}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(txn.returnDate), 'MMM dd, yyyy')}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                        Returned
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MyBooks;
