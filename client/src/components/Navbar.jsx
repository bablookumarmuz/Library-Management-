import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="relative bg-white border-b border-gray-100">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Smart Library Logo" className="w-8 h-8 rounded" />
                    <span className="text-xl font-bold text-gray-800">Smart Library</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="px-4 py-2 text-sm font-medium text-blue-600 transition hover:text-blue-700">
                        Sign In
                    </Link>
                    <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 py-4 px-6 flex flex-col gap-4 shadow-lg z-50">
                    <Link
                        to="/login"
                        className="w-full text-center px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 rounded-lg"
                        onClick={() => setIsOpen(false)}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="w-full text-center px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                        onClick={() => setIsOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
