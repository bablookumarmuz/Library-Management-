import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';

const AdminFines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFines = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payment/admin/all-fines`, config);
            setFines(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load fines');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, []);

    const filteredFines = fines.filter(fine =>
        fine.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.transaction?.book?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Fine Management</h2>
                    <p className="text-gray-500 mt-1">Monitor and manage user fines</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search user or book..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Book</th>
                                <th className="px-6 py-4 font-medium">Overdue Days</th>
                                <th className="px-6 py-4 font-medium">Total Fine</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                            ) : filteredFines.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No fines found.</td></tr>
                            ) : (
                                filteredFines.map((fine) => (
                                    <tr key={fine._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{fine.user?.name}</div>
                                            <div className="text-xs text-gray-500">{fine.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{fine.transaction?.book?.title || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-600">{fine.overdueDays} days</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">₹{fine.totalFine}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${fine.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {fine.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {fine.status}
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
    );
};

export default AdminFines;
