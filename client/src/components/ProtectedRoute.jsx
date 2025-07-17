import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/auth.jsx';

console.log('ProtectedRoute rendered');

export default function ProtectedRoute({ children, role }) {
    console.log('ProtectedRoute component running');

    const { user, isAuthenticated } = useAuth();

    console.log('ProtectedRoute检测到的状态:', {
        isAuthenticated,
        userRole: user?.role,
        requiredRole: role
    });

    console.log('ProtectedRoute检测到的user角色:', user?.role); // 调试日志

    if (!isAuthenticated) {
        console.log('未认证，重定向到登录页');
        return <Navigate to="/login" replace />;
    }

    if (role && (!user || user.role !== role)) {
        console.log('角色不符，期望:', role, '实际:', user?.role); // 调试日志
        return <Navigate to="/" replace />;
    }

    return children;
}