import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BoxDetail from '../components/BoxDetail';
import { useAuth } from '../stores/auth.jsx';
import './BoxDetailPage.css';

export default function BoxDetailPage() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // 可以在这里添加页面访问统计等逻辑
        console.log(`Viewing box ${id}`);
    }, [id]);

    return (
        <div className="box-detail-page">
            <BoxDetail boxId={id} />
            {!isAuthenticated && (
                <div className="login-prompt">
                    <p>登录后可购买盲盒</p>
                </div>
            )}
        </div>
    );
}