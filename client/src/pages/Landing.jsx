import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-50">
                <div className="px-6 py-24 mx-auto max-w-7xl lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                                Modern Library Management <span className="text-blue-600">Simplified</span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-600">
                                Streamline your library operations with our all-in-one digital platform. Track books, manage members, and analyze trends in real-time.
                            </p>
                            <div className="flex gap-4 mt-8">
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button className="px-6 py-3 text-base font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Learn More
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Abstract decorative element */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>

                            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white shadow-2xl rounded-2xl">
                                <div className="p-6 bg-blue-50 rounded-xl">
                                    <Book className="w-8 h-8 mb-4 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Book Tracking</h3>
                                    <p className="mt-2 text-sm text-gray-600">Real-time inventory management</p>
                                </div>
                                <div className="p-6 bg-green-50 rounded-xl">
                                    <Users className="w-8 h-8 mb-4 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Member Portal</h3>
                                    <p className="mt-2 text-sm text-gray-600">Self-service dashboard</p>
                                </div>
                                <div className="col-span-2 p-6 bg-purple-50 rounded-xl">
                                    <BarChart3 className="w-8 h-8 mb-4 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                                    <p className="mt-2 text-sm text-gray-600">Gain insights into borrowing trends and popular resources.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
