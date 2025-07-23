import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPublicItems } from '../services/storageService';
import { Link } from 'react-router-dom';
import FilterControls from '../components/FilterControls';
import './PublicItemsPage.css';

const publicItemsSortOptions = [
    { value: 'price', label: '按价值排序' },
    { value: 'createdAt', label: '按时间排序' },
    { value: 'wearLevel', label: '按磨损度排序' }
];

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function PublicItemsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortField, setSortField] = useState('price'); // 默认按价值排序
    const [sortDirection, setSortDirection] = useState('desc');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadPublicItems = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('开始加载公开物品...');
                const data = await getPublicItems({
                    search: debouncedSearchTerm,
                    minPrice: minAmount,
                    maxPrice: maxAmount,
                    startDate,
                    endDate,
                    sort: sortField,
                    order: sortDirection,
                    page: currentPage,
                    limit: pageSize
                });
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
    }, [debouncedSearchTerm, sortField, sortDirection, minAmount, maxAmount, startDate, endDate, currentPage, pageSize]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // 搜索过滤 (物品名称或所有者名称)
            const matchesSearch =
                item.itemData?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.owner?.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            // 价格范围过滤
            const price = item.itemData?.sellPrice || 0;
            const matchesMinAmount = !minAmount || price >= Number(minAmount);
            const matchesMaxAmount = !maxAmount || price <= Number(maxAmount);

            // 日期范围过滤
            const itemDate = new Date(item.createdAt);
            const matchesStartDate = !startDate || itemDate >= new Date(startDate);
            const matchesEndDate = !endDate || itemDate <= new Date(endDate + 'T23:59:59');

            return matchesSearch && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
        }).sort((a, b) => {
            // 排序逻辑
            let comparison = 0;
            if (sortField === 'price') {
                comparison = (a.itemData?.sellPrice || 0) - (b.itemData?.sellPrice || 0);
            } else if (sortField === 'wearLevel') {
                comparison = (a.itemData?.wearLevel || '').localeCompare(b.itemData?.wearLevel || '');
            } else {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [items, debouncedSearchTerm, sortField, sortDirection, minAmount, maxAmount, startDate, endDate]);

    // 计算分页后的数据
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredItems.slice(startIndex, startIndex + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    // 当筛选条件变化时重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, sortField, sortDirection, minAmount, maxAmount, startDate, endDate]);

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="public-items-page">
            <header className="page-header">
                <Link to="/" className="back-home-btn">← 返回首页</Link>
                <h1>展示墙</h1>
            </header>

            <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterOptions={[]}
                filterType=""
                setFilterType={() => {}}
                sortOptions={publicItemsSortOptions}
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
                totalItems={filteredItems.length}
                showVisibilityFilter={false}
            />

            {filteredItems.length === 0 ? (
                <div className="no-items">暂无展示物品</div>
            ) : (
                <>
                    <div className="items-grid">
                        {paginatedItems.map(item => (
                            <div key={item._id} className="public-item">
                                <div className="item-image">
                                    <img
                                        src={item.itemData?.image || '/placeholder-item.png'}
                                        alt={item.itemData?.name || '物品图片'}
                                    />
                                    <div className="owner-info">
                                        来自: {item.owner?.username || '未知用户'}
                                    </div>
                                </div>
                                <div className="item-info">
                                    <h3>{item.itemData?.name}</h3>
                                    <p>磨损度: {item.itemData?.wearLevel}</p>
                                    <p>价值: ¥{item.itemData?.sellPrice?.toLocaleString() || '0'}</p>
                                    <p className="item-date">
                                        展示时间: {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination-info">
                        显示 {Math.min((currentPage - 1) * pageSize + 1, filteredItems.length)}-
                        {Math.min(currentPage * pageSize, filteredItems.length)} 条，
                        共 {filteredItems.length} 条展示物品
                    </div>
                </>
            )}
        </div>
    );
}