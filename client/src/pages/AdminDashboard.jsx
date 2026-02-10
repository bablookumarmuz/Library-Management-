import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Book,
    Users,
    History,
    LogOut,
    Library,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    BarChart3,
    CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminBooks from './AdminBooks';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';
import AdminFines from './AdminFines';
import logo from '../assets/logo.png';

// Define SidebarItem component outside to prevent re-creation on render
const SidebarItem = ({ icon: Icon, label, id, activeTab, setActiveTab, closeSidebar }) => (
    <button
        onClick={() => {
            setActiveTab(id);
            if (closeSidebar) closeSidebar();
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id
            ? 'bg-emerald-900 text-white'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </button>
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableBooks: 0,
        currentlyBorrowed: 0,
        totalUsers: 0,
        overdueBooks: 0,
        borrowedToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch Data in Parallel
                const [booksRes, usersRes, txnsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/books`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/transactions`, config)
                ]);

                // Calculate Stats with strict safety checks
                const books = Array.isArray(booksRes.data) ? booksRes.data : [];
                const users = Array.isArray(usersRes.data) ? usersRes.data : [];
                const txns = Array.isArray(txnsRes.data) ? txnsRes.data : [];

                // Count unique titles instead of total copies for "Total Books" display
                const totalBooks = books.length;
                // Count unique titles that are available (at least 1 copy)
                const availableTitles = books.filter(book => (book.availableQuantity || 0) > 0).length;

                const currentlyBorrowed = txns.filter(t => t.status === 'Issued').length;

                // New Stats Logic
                const today = new Date().setHours(0, 0, 0, 0);
                const borrowedToday = txns.filter(t => {
                    const issueDate = new Date(t.issueDate).setHours(0, 0, 0, 0);
                    return issueDate === today;
                }).length;

                const overdueBooks = txns.filter(t => {
                    if (t.status !== 'Issued') return false;
                    const dueDate = new Date(t.dueDate).setHours(0, 0, 0, 0);
                    return dueDate < today;
                }).length;

                // Popular Books Logic
                const bookCounts = {};
                txns.forEach(t => {
                    if (t.book) {
                        const title = t.book.title;
                        bookCounts[title] = (bookCounts[title] || 0) + 1;
                    }
                });
                const sortedPopular = Object.entries(bookCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([title, count]) => ({ title, count }));

                setPopularBooks(sortedPopular);

                // Monthly Stats Logic (Last 6 Months)
                const last6Months = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const monthName = d.toLocaleString('default', { month: 'short' });
                    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                    last6Months.push({ name: monthName, key: monthKey, count: 0 });
                }

                txns.forEach(t => {
                    const d = new Date(t.issueDate);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    const monthStat = last6Months.find(m => m.key === key);
                    if (monthStat) {
                        monthStat.count++;
                    }
                });
                setMonthlyStats(last6Months);

                setStats({
                    totalBooks: totalBooks,
                    availableBooks: availableTitles,
                    currentlyBorrowed: currentlyBorrowed,
                    totalUsers: users.length,
                    overdueBooks: overdueBooks,
                    borrowedToday: borrowedToday
                });

                // Recent Activity (Last 5 transactions)
                setRecentActivity(txns.slice(0, 5));

            } catch (error) {
                console.error("Error fetching admin dashboard data", error);
                // Optionally set error state here if needed, but keeping defaults prevents crash
            }
        };

        if (activeTab === 'dashboard') {
            fetchDashboardData();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-white flex relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white border-r border-gray-100 flex flex-col
                fixed h-full z-30 transition-transform duration-300 md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900">
                        <img src={logo} alt="Smart Library Logo" className="w-8 h-8 rounded" />
                        <span className="text-xl font-bold">Smart Library Admin</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
                        <LogOut className="w-5 h-5 rotate-180" /> {/* Using LogOut as close icon backup or X */}
                    </button>
                </div>

                <div className="p-4 flex-1 space-y-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={Book} label="Books" id="books" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={Users} label="Users" id="users" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={History} label="Borrow Records" id="transactions" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={CreditCard} label="Fines" id="fines" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
                </div>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen w-full">
                <div className="md:hidden p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-gray-900">Smart Library Admin</span>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="p-4 md:p-8">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}!</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 self-start">
                                <span className="text-sm font-medium text-gray-600">Date:</span>
                                <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                            </div>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: 'Total Books', value: stats.totalBooks, icon: Book, color: 'emerald' },
                                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                                { label: 'Currently Borrowed', value: stats.currentlyBorrowed, icon: Book, color: 'indigo' },
                                { label: 'Borrowed Today', value: stats.borrowedToday, icon: Clock, color: 'purple' },
                                { label: 'Overdue Books', value: stats.overdueBooks, icon: AlertCircle, color: 'red' },
                                { label: 'Available Books', value: stats.availableBooks, icon: CheckCircle, color: 'teal' },
                            ].map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                                        </div>
                                        <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                            {/* Monthly Trends */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-gray-400" />
                                    Monthly Borrowing Trends
                                </h3>
                                <div className="flex items-end justify-between h-64 gap-2">
                                    {monthlyStats.map((stat, index) => {
                                        const max = Math.max(...monthlyStats.map(s => s.count), 1); // Avoid div by 0
                                        const heightPercentage = (stat.count / max) * 100;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div
                                                    className="w-full bg-emerald-100 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-200 relative"
                                                    style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {stat.count}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">{stat.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Popular Books */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                    Most Borrowed Books
                                </h3>
                                <div className="space-y-4">
                                    {popularBooks.length === 0 ? (
                                        <div className="text-gray-500 text-center py-8">No borrowing data yet.</div>
                                    ) : (
                                        popularBooks.map((book, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">{book.title}</h4>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                                        <div
                                                            className="bg-emerald-500 h-1.5 rounded-full"
                                                            style={{ width: `${(book.count / Math.max(...popularBooks.map(b => b.count))) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">{book.count}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Recent Activity</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                            <th className="pb-4 font-medium">User</th>
                                            <th className="pb-4 font-medium">Book</th>
                                            <th className="pb-4 font-medium">Borrow Date</th>
                                            <th className="pb-4 font-medium">Due Date</th>
                                            <th className="pb-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentActivity.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-4 text-gray-500">No recent activity</td></tr>
                                        ) : (
                                            recentActivity.map((item) => (
                                                <tr key={item._id} className="text-sm">
                                                    <td className="py-4 text-gray-900 font-medium">{item.user?.name || 'Unknown'}</td>
                                                    <td className="py-4 text-gray-600">{item.book?.title || 'Deleted Book'}</td>
                                                    <td className="py-4 text-gray-500">
                                                        {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4 text-gray-500">
                                                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Returned' ? 'bg-emerald-100 text-emerald-800' :
                                                            item.status === 'Issued' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && <AdminBooks />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'transactions' && <AdminTransactions />}
                {activeTab === 'fines' && <AdminFines />}
            </main>
        </div>
    );
};

export default AdminDashboard;
