import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (!parsedUser.id) {
                    // Force re-login to fetch user ID
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    return null;
                }
                return parsedUser;
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        return null;
    });
    const [loading] = useState(false);

    useEffect(() => {
        // Hydration logic moved to useState initializers
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            const userData = response.data.data;
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }
        throw new Error(response.data.message);
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            const data = response.data.data;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return data;
        }
        throw new Error(response.data.message);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const value = { user, login, register, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
