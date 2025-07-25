import { useState, useEffect } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { registerAdmin } from '../services/authService';
import { fetchBoxes, createBox, deleteBox, updateBox } from '../services/boxService';
import BoxForm from '../components/BoxForm';
import BoxDetail from "../components/BoxDetail";
import Modal from "../components/Modal"
import './AdminPage.css';

export default function AdminPage() {
    const { logout } = useAuth();
    const [boxes, setBoxes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedBox, setSelectedBox] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [boxToDelete, setBoxToDelete] = useState(null);

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

    const [showAdminForm, setShowAdminForm] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        username: '',
        password: ''
    });

    const handleCreateAdmin = async () => {
        try {
            await registerAdmin(newAdminData);
            alert('管理员创建成功');
            setShowAdminForm(false);
            setNewAdminData({ username: '', password: '' });
        } catch (error) {
            console.error('创建管理员失败:', error);
            alert('创建管理员失败: ' + error.message);
        }
    };

    const handleCreateBox = async (boxData) => {
        try {
            const newBox = await createBox(boxData);
            setBoxes([...boxes, newBox]);
            setShowForm(false);
        } catch (error) {
            console.error('Failed to create box:', error);
        }
    };

    const handleUpdateBox = async (boxData) => {
        try {
            const updatedBox = await updateBox(selectedBox._id, boxData);
            setBoxes(boxes.map(box => box._id === updatedBox._id ? updatedBox : box));
            setEditMode(false);
            setSelectedBox(updatedBox);
        } catch (error) {
            console.error('Failed to update box:', error);
        }
    };

    const handleDeleteBox = async (boxId) => {
        setBoxToDelete(boxId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteBox(boxToDelete);
            setBoxes(boxes.filter(box => box._id !== boxToDelete));
            if (selectedBox?._id === boxToDelete) {
                setSelectedBox(null);
                setEditMode(false);
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete box:', error);
            setShowDeleteModal(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBoxToDelete(null);
    };


    const handleViewBox = (box) => {
        setSelectedBox(box);
        setEditMode(false);
    };

    return (
        <div className="admin-page">
            <header>
                <h1>管理员后台</h1>
                <div className="admin-actions">
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? '取消' : '添加新盲盒'}
                    </button>
                    <button onClick={() => setShowAdminForm(!showAdminForm)}>
                        {showAdminForm ? '取消' : '创建新管理员'}
                    </button>
                    <button onClick={logout}>退出</button>
                </div>
            </header>

            <Modal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                title="确认删除"
            >
                <p>确定要删除这个盲盒吗？此操作不可撤销。</p>
                <div className="modal-footer">
                    <button
                        onClick={cancelDelete}
                        className="cancel-btn"
                    >
                        取消
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="delete-btn"
                    >
                        确认删除
                    </button>
                </div>
            </Modal>

            {showAdminForm && (
                <div className="admin-form-container">
                    <h3>创建新管理员</h3>
                    <div className="form-group">
                        <label>用户名</label>
                        <input
                            type="text"
                            value={newAdminData.username}
                            onChange={(e) => setNewAdminData({...newAdminData, username: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={newAdminData.password}
                            onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                        />
                    </div>
                    <button onClick={handleCreateAdmin}>创建</button>
                </div>
            )}

            {showForm && (
                <div className="box-form-container">
                    <BoxForm onSubmit={handleCreateBox} />
                </div>
            )}

            {loading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="admin-content">
                    <div className="box-list-container">
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
                                            className="view-btn"
                                            onClick={() => handleViewBox(box)}
                                        >
                                            查看
                                        </button>
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
                    </div>

                    {selectedBox && (
                        <div className="box-detail-container">
                            <div className="detail-header">
                                <h2>{selectedBox.name}</h2>
                                <div className="detail-actions">
                                    {!editMode && (
                                        <button
                                            className="edit-btn"
                                            onClick={() => setEditMode(true)}
                                        >
                                            编辑
                                        </button>
                                    )}
                                    <button
                                        className="close-btn"
                                        onClick={() => setSelectedBox(null)}
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>

                            {editMode ? (
                                <BoxForm
                                    initialBox={selectedBox}
                                    onSubmit={handleUpdateBox}
                                    onCancel={() => setEditMode(false)}
                                />
                            ) : (
                                <BoxDetail box={selectedBox} adminView />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}