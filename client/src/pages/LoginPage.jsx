import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth.jsx';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="login-page">
            <h1>盲盒抽盒机</h1>
            <AuthForm />
        </div>
    );
}