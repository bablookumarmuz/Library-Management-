import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Book, Clock, CheckSquare, LogOut, LayoutDashboard, Search, Library, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        currentlyBorrowed: 0,
        totalBorrowed: 0,
        overdueBooks: 0
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/my-transactions`, config);

                const txns = res.data;
                setTransactions(txns);

                const current = txns.filter(t => t.status === 'Issued');
                const overdue = current.filter(t => new Date(t.dueDate) < new Date()).length;

                setStats({
                    currentlyBorrowed: current.length,
                    totalBorrowed: txns.length,
                    overdueBooks: overdue
                });
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-100">
                <div className="px-6 py-4 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Library className="w-8 h-8 text-emerald-700" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900">The Modern Athenaeum</span>
                                <span className="text-xs text-gray-500">{user?.name || 'User'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 rounded-lg">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link to="/browse" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700">
                                <Search className="w-4 h-4" />
                                Browse Books
                            </Link>
                            <Link to="/my-books" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700">
                                <Book className="w-4 h-4" />
                                My Books
                            </Link>
                            <Link to="/fines" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700">
                                <CreditCard className="w-4 h-4" />
                                Pay Fines
                            </Link>

                            <div className="w-px h-6 bg-gray-200"></div>

                            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-6 w-full">
                {/* Welcome Banner */}
                <div className="bg-emerald-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-serif font-bold mb-2">Welcome back, {user?.name || 'Reader'}!</h1>
                        <p className="text-emerald-100 text-lg">Discover your next great read</p>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Currently Borrowed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.currentlyBorrowed}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-lg">
                            <Book className="w-6 h-6 text-emerald-700" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Borrowed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBorrowed}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CheckSquare className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Overdue Books</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overdueBooks}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Clock className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                </div>

                {/* Borrowed Books Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-gray-900">My Borrowed Books</h2>
                            <p className="text-gray-500 mt-1">Track your borrowing history</p>
                        </div>
                        <Link to="/my-books" className="text-emerald-600 font-medium hover:underline">View Full History &rarr;</Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="px-6 py-4 font-medium">Book Title</th>
                                        <th className="px-6 py-4 font-medium">Borrow Date</th>
                                        <th className="px-6 py-4 font-medium">Due Date</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.slice(0, 5).map((txn) => (
                                        <tr key={txn._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{txn.book ? txn.book.title : 'Deleted Book'}</td>
                                            <td className="px-6 py-4 text-gray-600">{format(new Date(txn.issueDate), 'MMM dd, yyyy')}</td>
                                            <td className="px-6 py-4 text-gray-600">{format(new Date(txn.dueDate), 'MMM dd, yyyy')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === 'Returned' ? 'bg-emerald-100 text-emerald-800' :
                                                    new Date(txn.dueDate) < new Date() ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {txn.status === 'Issued' && new Date(txn.dueDate) < new Date() ? 'Overdue' : txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transactions.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                You haven't borrowed any books yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
