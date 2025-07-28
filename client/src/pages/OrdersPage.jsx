import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../stores/auth.jsx';
import { getUserOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import FilterControls from '../components/FilterControls';
import './OrdersPage.css';

const orderFilterOptions = [
    { value: 'all', label: '所有类型' },
    { value: 'purchase', label: '购买' },
    { value: 'open_box', label: '开盒' },
    { value: 'sell_item', label: '出售' }
];

const orderSortOptions = [
    { value: 'createdAt', label: '按时间排序' },
    { value: 'amount', label: '按金额排序' }
];

export default function OrdersPage() {
    const { user, balance } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 控制状态
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);
            try {
                const data = await getUserOrders({
                    page: currentPage,
                    limit: pageSize,
                    sort: sortField,
                    order: sortDirection,
                    search: searchTerm,
                    type: filterType !== 'all' ? filterType : undefined,
                    minAmount,
                    maxAmount,
                    startDate,
                    endDate
                });
                console.log('处理后的订单数据:', data);
                setOrders(Array.isArray(data) ? data :
                    Array.isArray(data?.data) ? data.data : []);
            } catch (error) {
                console.error('Failed to load orders:', error);
                setError('加载订单失败' + (error.message || '未知错误'));
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user, balance, searchTerm, filterType, sortField, sortDirection, minAmount, maxAmount, startDate, endDate, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, sortField, sortDirection, minAmount, maxAmount, startDate, endDate]);

    // 处理过滤和排序
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 搜索过滤
            const matchesSearch = order.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.box?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            // 类型过滤
            const matchesType = filterType === 'all' || order.type === filterType;

            // 金额范围过滤
            const amount = Math.abs(order.amount);
            const matchesMinAmount = !minAmount || amount >= Number(minAmount);
            const matchesMaxAmount = !maxAmount || amount <= Number(maxAmount);

            // 日期范围过滤
            const orderDate = new Date(order.createdAt);
            const matchesStartDate = !startDate || orderDate >= new Date(startDate);
            const matchesEndDate = !endDate || orderDate <= new Date(endDate + 'T23:59:59');

            return matchesSearch && matchesType && matchesMinAmount && matchesMaxAmount &&
                matchesStartDate && matchesEndDate;
        }).sort((a, b) => {
            // 排序逻辑
            let comparison = 0;
            if (sortField === 'amount') {
                comparison = Math.abs(a.amount) - Math.abs(b.amount);
            } else {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [orders, searchTerm, filterType, sortField, sortDirection, minAmount, maxAmount, startDate, endDate]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredOrders.slice(startIndex, startIndex + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="orders-page">
            <header>
                <div className="page-header">
                    <Link to="/" className="back-home-btn">← 返回首页</Link>
                    <h1>我的订单</h1>
                </div>
                <div className="balance">余额: ¥{balance.toFixed(2)}</div>
            </header>

            <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterOptions={orderFilterOptions}
                filterType={filterType}
                setFilterType={setFilterType}
                sortOptions={orderSortOptions}
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
                totalItems={filteredOrders.length}
                showVisibilityFilter={false}
            />

            {filteredOrders.length === 0 ? (
                <div className="no-orders">暂无订单记录</div>
            ) : (
                <>
                    <div className="orders-list">
                        {paginatedOrders.map(order => (
                            <div key={order._id} className={`order-item ${order.type}`}>
                                <div className="order-image">
                                    <img
                                        src={order.item?.image || '/placeholder-item.png'}
                                        alt={order.item?.name || '物品'}
                                    />
                                </div>
                                <div className="order-details">
                                    <h3>{order.item?.name || '未知物品'}</h3>
                                    {order.item?.wearLevel && <p>磨损度: {order.item.wearLevel}</p>}
                                    {order.box && <p>武器箱: {order.box.name}</p>}
                                    {order.type !== 'open_box' && (
                                        <p className="order-amount">
                                            {order.type === 'purchase' && '购买'}
                                            {order.type === 'sell_item' && '卖出'}
                                            : ¥{Math.abs(order.amount)}
                                        </p>
                                    )}
                                    <p className="order-date">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination-info">
                        显示 {Math.min((currentPage - 1) * pageSize + 1, filteredOrders.length)}-
                        {Math.min(currentPage * pageSize, filteredOrders.length)} 条，共 {filteredOrders.length} 条订单
                    </div>
                </>
            )}
        </div>
    );
}