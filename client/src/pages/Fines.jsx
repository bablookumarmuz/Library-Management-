import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Fines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFines = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('http://localhost:5000/api/payment/fines', config);
            setFines(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load fines');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handlePay = async (fine) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // 1. Create Order
            const orderRes = await axios.post('http://localhost:5000/api/payment/create-order', { fineId: fine._id }, config);
            const order = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure this env var exists in frontend
                amount: order.amount,
                currency: order.currency,
                name: "Smart Library",
                description: `Fine Payment for ${fine.transaction?.book?.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment
                        await axios.post('http://localhost:5000/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            fineId: fine._id
                        }, config);

                        toast.success('Payment Successful!');
                        fetchFines();
                    } catch (error) {
                        toast.error('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: "Library User", // Could fetch from auth context
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#059669"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment initiation failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <header className="max-w-5xl mx-auto mb-10">
                <Link to="/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">&larr; Back to Dashboard</Link>
                <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-emerald-700" />
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Fine Payments</h1>
                </div>
                <p className="text-gray-500 mt-2 ml-11">Review and pay your overdue fines</p>
            </header>

            <div className="max-w-5xl mx-auto">
                {loading ? (
                    <div className="text-center py-20">Loading...</div>
                ) : fines.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <CheckCircle className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No Fines Due</h3>
                        <p className="text-gray-500 mt-2">Great job! You have no pending fines.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {fines.map((fine) => (
                            <div key={fine._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${fine.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {fine.transaction?.book?.title || 'Unknown Book'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Borrowed: {new Date(fine.transaction?.issueDate).toLocaleDateString()}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Overdue: {fine.overdueDays} Days</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Rate: ₹{fine.finePerDay}/day</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 font-medium uppercase">Total Fine</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{fine.totalFine}</p>
                                    </div>

                                    {fine.status === 'Pending' ? (
                                        <button
                                            onClick={() => handlePay(fine)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200"
                                        >
                                            Pay Now
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                                            <CheckCircle className="w-5 h-5" /> Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fines;
