import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBoxDetail, purchaseBox } from '../services/boxService';
import { useAuth } from '../stores/auth.jsx';
import { Link } from 'react-router-dom';
import './BoxDetail.css';

export default function BoxDetail({ boxId, box: propBox, adminView}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, balance, updateBalance } = useAuth();
    const [box, setBox] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (propBox) {
            // 如果通过props传递了box数据，直接使用
            setBox(propBox);
            setLoading(false);
        } else if (boxId) {
            // 否则从API获取
            const loadBoxDetail = async () => {
                setLoading(true);
                try {
                    const data = await fetchBoxDetail(boxId);
                    setBox(data);
                } catch (error) {
                    setError('获取盲盒详情失败');
                    console.error('Failed to fetch box detail:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadBoxDetail();
        }
    }, [boxId, propBox]);

    const handlePurchase = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        console.log('开始购买流程');
        setLoading(true);
        setError(null);

        try {
            setLoading(true);
            console.log('正在发送购买请求...');
            const result = await purchaseBox(box._id);
            console.log('收到响应:', result);
            alert('购买成功，盲盒已添加到仓库');
            updateBalance(result.balance);
        } catch (error) {
            setError(error.message || '购买失败');
            console.error('Failed to purchase box:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!box) return <div className="not-found">盲盒未找到</div>;

    return (
        <div className="box-detail">
            <div className="box-nav">
                <Link to="/" className="back-home-btn">← 返回首页</Link>
                {user?.role === 'user' && (
                    <Link to="/storage" className="back-storage-btn">我的仓库</Link>
                )}
            </div>

            <div className="box-content">
                <img src={box.image || '/placeholder-box.png'} alt={box.name} />
                <div className="box-info">
                    <h1>{box.name}</h1>
                    <p className="description">{box.description}</p>
                    <p className="price">价格: ¥{box.price}</p>

                    {user?.role === 'user' && (
                        <div className="actions">
                            <button
                                onClick={handlePurchase}
                                disabled={balance < box.price || loading}
                            >
                                购买盲盒 (¥{box.price})
                            </button>
                            {balance < box.price && (
                                <p className="error">
                                    余额不足，当前余额: ¥{balance}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="possible-items">
                <h2>包含的物品</h2>
                <div className="items-grid">
                    {box.items.map((item) => (
                        <div key={item.name} className="item-card">
                            <img src={item.image || '/placeholder-item.png'} alt={item.name} />
                            <div className="item-info">
                                <h3>{item.name}</h3>
                                <p>概率: {(item.probability * 100).toFixed(5)}%</p>
                                <div className="wear-levels">
                                    {item.wearLevels.map((wear) => (
                                        <div key={wear.level} className="wear-level">
                                            <span>{wear.level}:</span>
                                            <span>¥{wear.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );}