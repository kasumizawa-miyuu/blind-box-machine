import { useAuth } from '../stores/auth.jsx';
import BoxList from '../components/BoxList';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { user, balance, logout } = useAuth();

    return (
        <div className="home-page">
            <header>
                <h1>盲盒抽盒机</h1>
                <div className="user-info">
                    {user ? (
                        <>
                            <span className="username">欢迎, {user.username}</span>
                            <span className="balance">余额: ¥{balance}</span>
                            <div className="user-links">
                                <Link to="/orders">我的订单</Link>
                                <Link to="/storage">我的仓库</Link>
                                <Link to="/public-items">展示墙</Link>
                            </div>
                            <button onClick={logout}>退出</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-btn">登录</Link>
                    )}
                </div>
            </header>
            <main>
                <BoxList />
            </main>
        </div>
    );
}