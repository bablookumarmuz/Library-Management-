import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Calendar, Trash2, Edit2, Check, X, Ban, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, config);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { role: newRole }, config);
            toast.success('User role updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        if (window.confirm(`Are you sure you want to ${newStatus} this user?`)) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { status: newStatus }, config);
                toast.success(`User ${newStatus} successfully`);
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update status');
            }
        }
    };

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 mt-1">View registered members</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No users found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-offset-1 cursor-pointer outline-none ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 focus:ring-purple-500'
                                                    : user.role === 'librarian'
                                                        ? 'bg-orange-100 text-orange-800 focus:ring-orange-500'
                                                        : 'bg-blue-100 text-blue-800 focus:ring-blue-500'
                                                    }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="librarian">Librarian</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'blocked'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.status === 'blocked' ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(user._id, user.status)}
                                                    className={`p-2 rounded-lg transition-colors ${user.status === 'blocked'
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-orange-600 hover:bg-orange-50'
                                                        }`}
                                                    title={user.status === 'blocked' ? "Unblock User" : "Block User"}
                                                >
                                                    {user.status === 'blocked' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
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
        </div>
    );
};

export default AdminUsers;
