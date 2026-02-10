import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">SmartLibrary</span>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-blue-600 transition hover:text-blue-700">
                    Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                    Get Started
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
