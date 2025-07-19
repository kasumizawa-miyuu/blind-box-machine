import {useEffect, useState} from 'react';
import './BoxForm.css';
import api from '../services/api'

export default function BoxForm({ onSubmit, initialBox }) {
    const [box, setBox] = useState( initialBox || {
        name: '',
        description: '',
        price: 0,
        image: '',
        items: [{
            name: '',
            image: '',
            probability: 0.5,
            wearLevels: [
                { level: '崭新出厂', price: 0 },
                { level: '略有磨损', price: 0 },
                { level: '久经沙场', price: 0 },
                { level: '破损不堪', price: 0 },
                { level: '战痕累累', price: 0 }
            ]
        }]
    });
    const [uploading, setUploading] = useState(false);
    const [probabilityError, setProbabilityError] = useState('');

    // 计算概率总和
    useEffect(() => {
        const totalProbability = box.items.reduce(
            (sum, item) => sum + item.probability,
            0
        );

        // 允许0.99到1.01之间的微小误差，避免浮点数精度问题
        if (Math.abs(totalProbability - 1) > 0.01) {
            setProbabilityError(`概率总和必须为1 (当前: ${totalProbability.toFixed(2)})`);
        } else {
            setProbabilityError('');
        }
    }, [box.items]);

    const handleImageUpload = async (e, type, itemIndex = null) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'box') {
            setBox({ ...box, image: file });
        } else {
            const newItems = [...box.items];
            newItems[itemIndex].image = file;
            setBox({ ...box, items: newItems });
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (type === 'box') {
                setBox({ ...box, image: response.url });
            } else {
                const newItems = [...box.items];
                newItems[itemIndex].image = response.url;
                setBox({ ...box, items: newItems });
            }
        } catch (error) {
            console.error('图片上传失败:', error);
            if (type === 'box') {
                setBox({ ...box, image: '' });
            } else {
                const newItems = [...box.items];
                newItems[itemIndex].image = '';
                setBox({ ...box, items: newItems });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBox({ ...box, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...box.items];
        newItems[index][name] = name === 'probability' ? parseFloat(value) : value;
        setBox({ ...box, items: newItems });
    };

    const handleWearLevelChange = (itemIndex, levelIndex, e) => {
        const { name, value } = e.target;
        const newItems = [...box.items];
        newItems[itemIndex].wearLevels[levelIndex][name] =
            name === 'price' ? parseFloat(value) : value;
        setBox({ ...box, items: newItems });
    };

    const addItem = () => {
        setBox({
            ...box,
            items: [
                ...box.items,
                {
                    name: '',
                    image: '',
                    probability: 0.5,
                    wearLevels: [
                        { level: '崭新出厂', price: 0 },
                        { level: '略有磨损', price: 0 },
                        { level: '久经沙场', price: 0 },
                        { level: '破损不堪', price: 0 },
                        { level: '战痕累累', price: 0 }
                    ]
                }
            ]
        });
    };

    const removeItem = (index) => {
        const newItems = [...box.items];
        newItems.splice(index, 1);
        setBox({ ...box, items: newItems });
    };

    const addWearLevel = (itemIndex) => {
        const newItems = [...box.items];
        newItems[itemIndex].wearLevels.push({
            level: '新磨损度',
            price: 0
        });
        setBox({ ...box, items: newItems });
    };

    const removeWearLevel = (itemIndex, levelIndex) => {
        const newItems = [...box.items];
        newItems[itemIndex].wearLevels.splice(levelIndex, 1);
        setBox({ ...box, items: newItems });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const totalProbability = box.items.reduce(
            (sum, item) => sum + item.probability,
            0
        );

        if (Math.abs(totalProbability - 1) > 0.01) {
            alert(`无法提交: 所有物品的概率总和必须为1 (当前: ${totalProbability.toFixed(2)})`);
            return;
        }

        onSubmit(box);
    };

    return (
        <form onSubmit={handleSubmit} className="box-form">
            <h3>添加新盲盒</h3>

            <div className="form-group">
                <label>盲盒名称</label>
                <input
                    type="text"
                    name="name"
                    value={box.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>描述</label>
                <textarea
                    name="description"
                    value={box.description}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>价格</label>
                <input
                    type="number"
                    name="price"
                    value={box.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            <div className="form-group">
                <label>盲盒图片</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'box')}
                    disabled={uploading}
                />
                {uploading && <p>上传中...</p>}
                {box.image && (
                    <div className="image-preview">
                        {typeof box.image === 'object' ? (
                            <img src={box.image} alt="预览" />
                        ) : (
                            <img src={box.image} alt="盲盒图片" />
                        )}
                    </div>
                )}
            </div>

            <h4>包含物品 {probabilityError && (
                <span className="error-text">{probabilityError}</span>
            )}</h4>
            {box.items.map((item, itemIndex) => (
                <div key={itemIndex} className="item-section">
                    <div className="item-header">
                        <h5>物品 #{itemIndex + 1}</h5>
                        {box.items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                className="remove-btn"
                            >
                                删除物品
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label>物品名称</label>
                        <input
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={(e) => handleItemChange(itemIndex, e)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>物品图片</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'item', itemIndex)}
                            disabled={uploading}
                        />
                        {uploading && <p>上传中...</p>}
                        {item.image && (
                            <div className="image-preview">
                                <img src={item.image} alt="物品预览" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>抽取概率 (0-1)</label>
                        <input
                            type="number"
                            name="probability"
                            value={item.probability}
                            onChange={(e) => {
                                handleItemChange(itemIndex, e);
                                // 实时验证
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 1) {
                                    setProbabilityError('概率必须在0到1之间');
                                }
                            }}
                            min="0"
                            max="1"
                            step="0.01"
                            required
                        />
                    </div>

                    <h5>磨损度设置</h5>
                    {item.wearLevels.map((wear, levelIndex) => (
                        <div key={levelIndex} className="wear-level">
                            <div className="form-group">
                                <label>磨损等级</label>
                                <input
                                    type="text"
                                    name="level"
                                    value={wear.level}
                                    onChange={(e) => handleWearLevelChange(itemIndex, levelIndex, e)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>出售价格</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={wear.price}
                                    onChange={(e) => handleWearLevelChange(itemIndex, levelIndex, e)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            {item.wearLevels.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeWearLevel(itemIndex, levelIndex)}
                                    className="remove-btn"
                                >
                                    删除
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addWearLevel(itemIndex)}
                        className="add-btn"
                    >
                        添加磨损度
                    </button>
                </div>
            ))}

            <div className="form-actions">
                <button
                    type="button"
                    onClick={addItem}
                    className="add-btn"
                >
                    添加物品
                </button>
                <button type="submit" className="submit-btn">
                    提交
                </button>
            </div>
        </form>
    );
}