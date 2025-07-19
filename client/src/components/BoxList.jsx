import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBoxes } from '../services/boxService';
import './BoxList.css';

export default function BoxList() {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadBoxes = async () => {
            setLoading(true);
            try {
                const data = await fetchBoxes(searchQuery);
                setBoxes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch boxes:', error);
                setBoxes([]);
            } finally {
                setLoading(false);
            }
        };

        loadBoxes();
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const viewBoxDetail = (boxId) => {
        navigate(`/box/${boxId}`);
    };

    return (
        <div className="box-list">
            <div className="search-bar">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="搜索盲盒..."
                />
            </div>

            {loading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="boxes">
                    {boxes.length === 0 ? (
                        <div className="no-boxes">暂无盲盒数据</div>
                    ) : (
                        boxes.map((box) => (
                            <div
                                key={box._id}
                                className="box-card"
                                onClick={() => viewBoxDetail(box._id)}
                            >
                                <img src={box.image || '/placeholder-box.png'} alt={box.name} />
                                <div className="box-info">
                                    <h3>{box.name}</h3>
                                    <p className="price">¥{box.price}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}