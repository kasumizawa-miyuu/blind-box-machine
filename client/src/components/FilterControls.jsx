// components/FilterControls.jsx
import './FilterControls.css';

export default function FilterControls({
                                           searchTerm,
                                           setSearchTerm,
                                           filterOptions,
                                           filterType,
                                           setFilterType,
                                           sortOptions,
                                           sortField,
                                           setSortField,
                                           sortDirection,
                                           setSortDirection,
                                           minAmount,
                                           setMinAmount,
                                           maxAmount,
                                           setMaxAmount,
                                           startDate,
                                           setStartDate,
                                           endDate,
                                           setEndDate,

                                           pageSize,
                                           setPageSize,
                                           currentPage,
                                           setCurrentPage,
                                           totalItems,

                                           showVisibilityFilter = false,
                                           visibilityFilter,
                                           setVisibilityFilter,
                                           showPriceFilter = true,
                                           showDateFilter = true}) {
    return (
        <div className="filter-controls">
            <div className="control-group">
                <input
                    type="text"
                    placeholder="搜索名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="control-group">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                >
                    {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {showVisibilityFilter && (
                <div className="control-group">
                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">所有可见性</option>
                        <option value="public">仅展示</option>
                        <option value="private">仅隐藏</option>
                    </select>
                </div>
            )}

            <div className="control-group">
                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="sort-select"
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="sort-direction"
                >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
            </div>

            {showPriceFilter && (
                <div className="control-group">
                    <input
                        type="number"
                        placeholder="最低价格"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="amount-input"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="最高价格"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="amount-input"
                    />
                </div>
            )}

            {showDateFilter && (
                <div className="control-group">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                    />
                    <span>至</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                    />
                </div>
            )}

            <div className="control-group">
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1); // 切换每页条数时回到第一页
                    }}
                    className="page-size-select"
                >
                    <option value="5">每页5条</option>
                    <option value="10">每页10条</option>
                    <option value="20">每页20条</option>
                    <option value="50">每页50条</option>
                </select>
            </div>

            <div className="pagination-controls">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    上一页
                </button>

                <span className="page-info">
                    第 {currentPage} 页 / 共 {Math.ceil(totalItems / pageSize)} 页
                </span>

                <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                    className="pagination-btn"
                >
                    下一页
                </button>
            </div>
        </div>
    );
}