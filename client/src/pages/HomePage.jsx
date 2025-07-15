import { useAuth } from '../stores/auth.jsx';
import BoxList from '../components/BoxList';

export default function HomePage() {
    const { user, balance, logout } = useAuth();

    return (
        <div className="home-page">
            <header>
                <h1>盲盒抽盒机</h1>
                <div className="user-info">
                    {user ? (
                        <>
                            <span>余额: ¥{balance}</span>
                            <button onClick={logout}>退出</button>
                        </>
                    ) : (
                        <a href="/login">登录</a>
                    )}
                </div>
            </header>
            <main>
                <BoxList />
            </main>
        </div>
    );
}