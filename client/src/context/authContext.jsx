import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check for token
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const res = await axios.get('http://localhost:5000/api/auth/me', config);
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const register = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', userData);
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Registration successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return false;
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const forgotPassword = async (email) => {
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            toast.success('Reset link sent to your email');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong';
            toast.error(message);
            return false;
        }
    };

    const resetPassword = async (token, password) => {
        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            toast.success('Password reset successful! Please login.');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong';
            toast.error(message);
            return false;
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
