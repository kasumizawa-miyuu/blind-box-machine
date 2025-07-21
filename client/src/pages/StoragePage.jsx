import { useState, useEffect } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { getUserStorage, openBox, sellItem, toggleItemVisibility } from '../services/storageService';
import { Link } from 'react-router-dom';
import './StoragePage.css';

export default function StoragePage() {
    const { user, balance, updateBalance } = useAuth();
    const [storage, setStorage] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStorage = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);
            try {
                const data = await getUserStorage();
                console.log('加载的仓库数据:', data);
                setStorage(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load storage:', error);
                setError('加载仓库失败' + (error.message || '未知错误'));
                setStorage([]);
            } finally {
                setLoading(false);
            }
        };

        loadStorage();
    }, [user, balance]);

    const handleOpenBox = async (storageId) => {
        console.log('开盒前验证 - 目标物品:', storage.find(item => item._id === storageId));
        try {
            setLoading(true);
            const result = await openBox({ storageId });
            console.log('开盒成功:', result);
            if (result) {
                alert(`成功获得: ${result.item.name} (${result.item.wearLevel})`);
                updateBalance(result.balance);
                setStorage(prev => prev.filter(item => item._id !== storageId));
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to open box:', error);
            alert(`操作失败: ${error.message || '请刷新页面重试'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSellItem = async (storageId) => {
        console.log('卖出前验证 - 目标物品:', storage.find(item => item._id === storageId));
        try {
            setLoading(true);
            const result = await sellItem({ storageId });
            if (result){
                updateBalance(result.balance);
                const updatedStorage = await getUserStorage();
                setStorage(Array.isArray(updatedStorage) ? updatedStorage : []);
                alert('物品已成功卖出！');
            }
        } catch (error) {
            console.error('Failed to sell item:', error);
            alert('卖出失败: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (itemId) => {
        try {
            const result = await toggleItemVisibility(itemId);
            setStorage(result.storage);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    };

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="storage-page">
            <header>
                <div className="page-header">
                    <Link to="/" className="back-home-btn">← 返回首页</Link>
                    <h1>我的仓库</h1>
                </div>
                <div className="balance">当前余额: ¥{balance}</div>
            </header>

            {storage.length === 0 ? (
                <div className="empty-storage">仓库空空如也</div>
            ) : (
                <div className="storage-grid">
                    {storage.map(item => (
                        <div key={item._id} className={`storage-item ${item.type}`}>
                            <div className="item-image">
                                <img
                                    src={
                                        item.type === 'unopened_box'
                                            ? item.boxData?.image
                                            : item.itemData?.image
                                            || '/placeholder-item.png'
                                    }
                                    alt={item.type === 'unopened_box' ? item.boxData?.name : item.itemData?.name}
                                />
                            </div>
                            <div className="item-info">
                                <h3>
                                    {item.type === 'unopened_box'
                                    ? item.boxData?.name
                                    : item.itemData?.name}
                                </h3>

                                {item.type === 'unopened_box' ? (
                                    <>
                                        <p>{item.itemData?.name}</p>
                                        <button
                                            onClick={() => handleOpenBox(item._id)}
                                            disabled={loading}
                                        >
                                            抽取
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p>磨损度: {item.itemData?.wearLevel}</p>
                                        <p>价值: ¥{item.itemData?.sellPrice}</p>
                                        <div className="item-actions">
                                            <button
                                                onClick={() => handleSellItem(item._id)}
                                                disabled={loading}
                                            >
                                                卖出
                                            </button>
                                            <label className="visibility-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isPublic}
                                                    onChange={() => handleToggleVisibility(item._id)}
                                                />
                                                展示
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}