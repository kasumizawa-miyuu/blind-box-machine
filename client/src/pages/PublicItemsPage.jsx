import { useState, useEffect } from 'react';
import { getPublicItems } from '../services/storageService';
import { Link } from 'react-router-dom';
import './PublicItemsPage.css';

export default function PublicItemsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPublicItems = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('开始加载公开物品...');
                const data = await getPublicItems();
                console.log('获取到的公开物品数据:', data);
                setItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load public items:', error);
                setError('加载展示物品失败');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadPublicItems();
    }, []);

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="public-items-page">
            <header className="page-header">
                <Link to="/" className="back-home-btn">← 返回首页</Link>
                <h1>展示墙</h1>
            </header>
            {items.length === 0 ? (
                <div className="no-items">暂无展示物品</div>
            ) : (
                <div className="items-grid">
                    {items.map(item => (
                        <div key={item._id} className="public-item">
                            <div className="item-image">
                                <img
                                    src={item.itemData?.image || '/placeholder-item.png'}
                                    alt={item.itemData?.name || '物品图片'}
                                />
                                <div className="owner-info">
                                    来自: {item.owner.username || '未知用户'}
                                </div>
                            </div>
                            <div className="item-info">
                                <h3>{item.itemData?.name}</h3>
                                <p>磨损度: {item.itemData?.wearLevel}</p>
                                <p>价值: ¥{item.itemData?.sellPrice}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}