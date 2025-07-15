import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth.jsx';
import './AuthForm.css';

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await login(form);
                navigate('/');
            } else {
                await register(form);
                // 注册后自动登录
                await login(form);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>{isLogin ? '登录' : '注册'}</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">用户名</label>
                    <input
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">密码</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? '处理中...' : isLogin ? '登录' : '注册'}
                </button>
            </form>
            <p className="toggle-mode" onClick={toggleMode}>
                {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </p>
        </div>
    );
}