import { useAuth } from '../stores/auth.jsx';
import BoxList from '../components/BoxList';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
    const { user, balance, logout } = useAuth();

    return (
        <div className="home-page">
            <header>
                <h1>CS戒赌模拟器</h1>
                <div className="user-info">
                    <div className="welcome-section">
                        {user ? (
                            <>
                                <span className="username">欢迎, {user.username}</span>
                                <span className="balance">余额: ¥{balance.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="username">请先登录</span>
                        )}
                    </div>
                    <div className="user-actions">
                        {user ? (
                            <button onClick={logout} className="logout-btn">退出</button>
                        ) : (
                            <Link to="/login" className="login-btn">登录</Link>
                        )}
                    </div>
                </div>
                {user && (
                    <div className="nav-links">
                        <Link to="/orders">我的订单</Link>
                        <Link to="/storage">我的仓库</Link>
                        <Link to="/public-items">展示墙</Link>
                    </div>
                )}
            </header>
            <main>
                <BoxList />
            </main>
        </div>
    );
}