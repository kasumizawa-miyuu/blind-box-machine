import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/auth.jsx';

console.log('ProtectedRoute rendered');

export default function ProtectedRoute({ children, role }) {
    console.log('ProtectedRoute component running');
    const { user, isAuthenticated } = useAuth();

    console.log('ProtectedRoute user:', user);
    console.log('ProtectedRoute role:', role);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && (!user || user.role !== role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}