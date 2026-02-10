import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('http://localhost:5000/api/transactions', config);
            setTransactions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch transactions');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleReturn = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post(`http://localhost:5000/api/transactions/return/${id}`, {}, config);
            toast.success('Book returned successfully');
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to return book');
        }
    };

    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Borrow Records</h1>
                    <p className="text-gray-500 mt-1">Track all book issues and returns</p>
                </div>
                <button
                    onClick={fetchTransactions}
                    className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Book</th>
                                <th className="px-6 py-4 font-medium">Issue Date</th>
                                <th className="px-6 py-4 font-medium">Due Date</th>
                                <th className="px-6 py-4 font-medium">Returned On</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-8">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No records found.</td></tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {txn.user ? txn.user.name : 'Unknown User'}
                                            <div className="text-xs text-gray-400 font-normal">{txn.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {txn.book ? txn.book.title : 'Deleted Book'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {format(new Date(txn.issueDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {format(new Date(txn.dueDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {txn.returnDate ? format(new Date(txn.returnDate), 'MMM dd, yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === 'Returned'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : txn.status === 'Issued'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {txn.status === 'Returned' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {txn.status === 'Issued' && (
                                                <button
                                                    onClick={() => handleReturn(txn._id)}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 transition-colors"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;
