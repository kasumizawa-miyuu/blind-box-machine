import { useState, useEffect } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { getUserOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import './OrdersPage.css';

export default function OrdersPage() {
    const { user, balance } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);
            try {
                const data = await getUserOrders();
                console.log('处理后的订单数据:', data);
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load orders:', error);
                setError('加载订单失败' + (error.message || '未知错误'));
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user, balance]);

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="orders-page">
            <header>
                <div className="page-header">
                    <Link to="/" className="back-home-btn">← 返回首页</Link>
                    <h1>我的订单</h1>
                </div>
                <div className="balance">当前余额: ¥{balance}</div>
            </header>

            {orders.length === 0 ? (
                <div className="no-orders">暂无订单记录</div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className={`order-item ${order.type}`}>
                            <div className="order-image">
                                <img
                                    src={order.item?.image || '/placeholder-item.png'}
                                    alt={order.item?.name || '物品'}
                                />
                            </div>
                            <div className="order-details">
                                <h3>{order.item?.name || '位置物品'}</h3>
                                {order.item?.wearLevel && <p>磨损度: {order.item.wearLevel}</p>}
                                {order.box && <p>盲盒: {order.box.name}</p>}
                                {order.type !== 'open_box' && (
                                    <p className="order-amount">
                                        {order.type === 'purchase' && '购买'}
                                        {order.type === 'sell_item' && '卖出'}
                                        : ¥{Math.abs(order.amount)}
                                    </p>
                                )}
                                <p className="order-date">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}