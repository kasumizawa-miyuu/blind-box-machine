import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { getUserStorage, openBox, sellItem, toggleItemVisibility } from '../services/storageService';
import { Link } from 'react-router-dom';
import FilterControls from '../components/FilterControls';
import './StoragePage.css';

const storageFilterOptions = [
    { value: 'all', label: '所有类型' },
    { value: 'unopened_box', label: '未开盲盒' },
    { value: 'item', label: '物品' }
];

const storageSortOptions = [
    { value: 'createdAt', label: '按时间排序' },
    { value: 'price', label: '按价格排序' },
    { value: 'wearLevel', label: '按磨损度排序' }
];

export default function StoragePage() {
    const { user, balance, updateBalance } = useAuth();
    const [storage, setStorage] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all');

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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

    const filteredStorage = useMemo(() => {
        return storage.filter(item => {
            // 搜索过滤
            const matchesSearch =
                (item.type === 'unopened_box'
                    ? item.boxData?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    : item.itemData?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

            // 类型过滤
            const matchesType = filterType === 'all' || item.type === filterType;

            // 价格范围过滤
            const price = item.type === 'unopened_box'
                ? item.boxData?.price
                : item.itemData?.sellPrice;
            const matchesMinAmount = !minAmount || (price && price >= Number(minAmount));
            const matchesMaxAmount = !maxAmount || (price && price <= Number(maxAmount));

            // 日期范围过滤
            const itemDate = new Date(item.createdAt);
            const matchesStartDate = !startDate || itemDate >= new Date(startDate);
            const matchesEndDate = !endDate || itemDate <= new Date(endDate + 'T23:59:59');

            // 可见性过滤
            const matchesVisibility =
                visibilityFilter === 'all' ||
                (visibilityFilter === 'public' && item.isPublic) ||
                (visibilityFilter === 'private' && !item.isPublic);

            return matchesSearch && matchesType && matchesMinAmount &&
                matchesMaxAmount && matchesStartDate && matchesEndDate && matchesVisibility;
        }).sort((a, b) => {
            // 排序逻辑
            let comparison = 0;
            if (sortField === 'price') {
                const priceA = a.type === 'unopened_box' ? a.boxData?.price : a.itemData?.sellPrice;
                const priceB = b.type === 'unopened_box' ? b.boxData?.price : b.itemData?.sellPrice;
                comparison = (priceA || 0) - (priceB || 0);
            } else if (sortField === 'wearLevel') {
                const wearA = a.itemData?.wearLevel || '';
                const wearB = b.itemData?.wearLevel || '';
                comparison = wearA.localeCompare(wearB);
            } else {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [storage, searchTerm, filterType, sortField, sortDirection,
        minAmount, maxAmount, startDate, endDate, visibilityFilter]);

    // 计算分页后的数据
    const paginatedStorage = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredStorage.slice(startIndex, startIndex + pageSize);
    }, [filteredStorage, currentPage, pageSize]);

    // 当筛选条件变化时重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, sortField, sortDirection,
        minAmount, maxAmount, startDate, endDate, visibilityFilter]);

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

            <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterOptions={storageFilterOptions}
                filterType={filterType}
                setFilterType={setFilterType}
                sortOptions={storageSortOptions}
                sortField={sortField}
                setSortField={setSortField}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                minAmount={minAmount}
                setMinAmount={setMinAmount}
                maxAmount={maxAmount}
                setMaxAmount={setMaxAmount}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                pageSize={pageSize}
                setPageSize={setPageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={filteredStorage.length}
                showVisibilityFilter={true}
                visibilityFilter={visibilityFilter}
                setVisibilityFilter={setVisibilityFilter}
            />

            {filteredStorage.length === 0 ? (
                <div className="empty-storage">没有找到符合条件的物品</div>
            ) : (
                <>
                    <div className="storage-grid">
                        {paginatedStorage.map(item => (
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
                                            <p>价格: ¥{item.boxData?.price}</p>
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
                    <div className="pagination-info">
                        显示 {Math.min((currentPage - 1) * pageSize + 1, filteredStorage.length)}-
                        {Math.min(currentPage * pageSize, filteredStorage.length)} 条，共 {filteredStorage.length} 条物品
                    </div>
                </>
            )}
        </div>
    );
}