import { useState, useEffect } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { getUserOrders, sellItem } from '../services/orderService';
import './OrdersPage.css';

export default function OrdersPage() {
    const { user, balance, updateBalance } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const data = await getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user]);

    const handleSellItem = async (orderId) => {
        try {
            const { balance: newBalance } = await sellItem(orderId);
            updateBalance(newBalance);
            setOrders(orders.filter(order => order._id !== orderId));
            alert('物品已成功卖出！');
        } catch (error) {
            console.error('Failed to sell item:', error);
            alert('卖出失败: ' + error.message);
        }
    };

    return (
        <div className="orders-page">
            <header>
                <h1>我的订单</h1>
                <div className="balance">当前余额: ¥{balance}</div>
            </header>

            {loading ? (
                <div className="loading">加载中...</div>
            ) : orders.length === 0 ? (
                <div className="no-orders">暂无订单记录</div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className={`order-item ${order.type}`}>
                            <div className="order-image">
                                <img
                                    src={order.item.image || '/placeholder-item.png'}
                                    alt={order.item.name}
                                />
                            </div>
                            <div className="order-details">
                                <h3>{order.item.name}</h3>
                                <p>磨损度: {order.item.wearLevel}</p>
                                <p>盲盒: {order.box?.name || '未知'}</p>
                                <p className="order-amount">
                                    {order.type === 'purchase' ? '购买' : '卖出'}:
                                    ¥{Math.abs(order.amount)}
                                </p>
                                <p className="order-date">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {order.type === 'purchase' && (
                                <button
                                    className="sell-btn"
                                    onClick={() => handleSellItem(order._id)}
                                >
                                    卖出 (¥{order.item.sellPrice})
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}