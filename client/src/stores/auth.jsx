import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 初始化时从localStorage加载用户信息
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');

        if (token && role) {
            setUser({ role, username });
            setBalance(parseInt(localStorage.getItem('balance')) || 0);
        }
        setIsInitializing(false);
    }, []);

    if (isInitializing){
        return <div>加载中...</div>;
    }

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const { token, role, balance, username } = await apiLogin(credentials);
            console.log('API返回的用户信息:', { token, role, balance, username });

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('balance', balance);
            localStorage.setItem('username', username);

            setUser({ role, username });
            setBalance(balance);

            // 根据角色重定向
            console.log('登录角色:', role);
            setTimeout(() => {
                console.log('当前user状态:', { role });
                navigate(role === 'admin' ? '/admin' : '/');
            }, 500);
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