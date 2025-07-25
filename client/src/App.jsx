import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './stores/auth.jsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BoxDetailPage from './pages/BoxDetailPage';
import AdminPage from './pages/AdminPage';
import OrdersPage from './pages/OrdersPage';
import StoragePage from "./pages/StoragePage";
import PublicItemsPage from "./pages/PublicItemsPage";
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

export default function App() {
    console.log("App组件渲染");
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/box/:id" element={<BoxDetailPage />} />
                    <Route
                        path="/admin"
                        element={
                            <div>
                                <ProtectedRoute role="admin">
                                    <AdminPage />
                                </ProtectedRoute>
                            </div>
                        }
                    />
                    <Route
                        path="/storage"
                        element={
                            <ProtectedRoute role="user">
                                <StoragePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/public-items" element={<PublicItemsPage />} />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute role="user">
                                <OrdersPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}