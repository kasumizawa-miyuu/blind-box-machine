import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 初始化时从localStorage加载用户信息
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const balance = parseInt(localStorage.getItem('balance')) || 0;

        if (token && role) {
            setUser({ role });
            setBalance(balance);
        }
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const { token, role, balance } = await apiLogin(credentials);

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('balance', balance);

            setUser({ role });
            setBalance(balance);
            setTimeout(() => {
                navigate(role === 'admin' ? '/admin' : '/');
            }, 0);

            // 根据角色重定向
            console.log('登录角色:', role);
            navigate(role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.message || '登录失败');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            await apiRegister(credentials);
            // 注册后自动登录
            await login(credentials);
        } catch (err) {
            setError(err.message || '注册失败');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('balance');
        setUser(null);
        setBalance(0);
        navigate('/login');
    };

    const updateBalance = (newBalance) => {
        setBalance(newBalance);
        localStorage.setItem('balance', newBalance);
    };

    const value = {
        user,
        balance,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isUser: user?.role === 'user',
        login,
        register,
        logout,
        updateBalance,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}