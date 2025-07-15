import { useState, useEffect } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { fetchBoxes, createBox, deleteBox } from '../services/boxService';
import BoxForm from '../components/BoxForm';
import './AdminPage.css';

export default function AdminPage() {
    const { logout } = useAuth();
    const [boxes, setBoxes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadBoxes = async () => {
            setLoading(true);
            try {
                const data = await fetchBoxes();
                setBoxes(data);
            } catch (error) {
                console.error('Failed to load boxes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBoxes();
    }, []);

    const handleCreateBox = async (boxData) => {
        try {
            const newBox = await createBox(boxData);
            setBoxes([...boxes, newBox]);
            setShowForm(false);
        } catch (error) {
            console.error('Failed to create box:', error);
        }
    };

    const handleDeleteBox = async (boxId) => {
        if (window.confirm('确定要删除这个盲盒吗？')) {
            try {
                await deleteBox(boxId);
                setBoxes(boxes.filter(box => box._id !== boxId));
            } catch (error) {
                console.error('Failed to delete box:', error);
            }
        }
    };

    return (
        <div className="admin-page">
            <header>
                <h1>管理员后台</h1>
                <div className="admin-actions">
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? '取消' : '添加新盲盒'}
                    </button>
                    <button onClick={logout}>退出</button>
                </div>
            </header>

            {showForm && (
                <div className="box-form-container">
                    <BoxForm onSubmit={handleCreateBox} />
                </div>
            )}

            {loading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="box-list">
                    {boxes.map(box => (
                        <div key={box._id} className="box-item">
                            <div className="box-info">
                                <h3>{box.name}</h3>
                                <p>价格: ¥{box.price}</p>
                                <p>包含物品: {box.items.length}种</p>
                            </div>
                            <div className="box-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteBox(box._id)}
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}