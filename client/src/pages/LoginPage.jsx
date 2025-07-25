import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth.jsx';
import AuthForm from '../components/AuthForm';
import './LoginPage.css';

export default function LoginPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="login-container">
            <div className="login-page">
                <h1>CS戒赌模拟器</h1>
                <div className="auth-container">
                    <AuthForm />
                </div>
            </div>
        </div>
    );
}